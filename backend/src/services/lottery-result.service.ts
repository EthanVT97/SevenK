import { Lottery, LotteryBet } from '../models/lottery.model';
import { sequelize } from '../config/database';
import { Transaction } from 'sequelize';
import { logger } from '../utils/logger';
import WebSocketService from './websocket.service';

class LotteryResultService {
    private wsService: WebSocketService;

    constructor(wsService: WebSocketService) {
        this.wsService = wsService;
    }

    async processResult(lotteryId: number, winningNumber: string): Promise<void> {
        const t: Transaction = await sequelize.transaction();

        try {
            // Get lottery and its bets
            const lottery = await Lottery.findByPk(lotteryId, {
                include: [{
                    model: LotteryBet,
                    as: 'bets',
                    where: { status: 'pending' }
                }],
                transaction: t
            });

            if (!lottery) {
                throw new Error('Lottery not found');
            }

            // Update lottery status and winning number
            await lottery.update({
                status: 'completed',
                winningNumber
            }, { transaction: t });

            // Process bets
            const bets = lottery.get('bets') as LotteryBet[];
            for (const bet of bets) {
                if (bet.number === winningNumber) {
                    // Winner
                    await bet.update({
                        status: 'won'
                    }, { transaction: t });

                    // Update user balance
                    await sequelize.query(
                        'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
                        {
                            replacements: [bet.potentialWin, bet.userId],
                            transaction: t
                        }
                    );
                } else {
                    // Loser
                    await bet.update({
                        status: 'lost'
                    }, { transaction: t });
                }
            }

            await t.commit();

            // Broadcast result
            this.wsService.broadcastLotteryResult(lotteryId.toString(), {
                winningNumber,
                drawTime: lottery.drawTime,
                type: lottery.type
            });

            logger.info(`Lottery ${lotteryId} result processed: ${winningNumber}`);
        } catch (error) {
            await t.rollback();
            logger.error('Error processing lottery result:', error);
            throw error;
        }
    }

    async scheduleNextDraw(type: '2D' | '3D'): Promise<void> {
        try {
            const now = new Date();
            let nextDrawTime: Date;

            if (type === '2D') {
                nextDrawTime = this.getNext2DDrawTime(now);
            } else {
                nextDrawTime = this.getNext3DDrawTime(now);
            }

            // Create lottery with proper typing
            await Lottery.create({
                type,
                drawTime: nextDrawTime,
                status: 'upcoming',
                minBet: type === '2D' ? 100 : 500,
                maxBet: type === '2D' ? 50000 : 100000,
                multiplier: type === '2D' ? 85 : 500
            });

            logger.info(`Next ${type} draw scheduled for ${nextDrawTime}`);
        } catch (error) {
            logger.error('Error scheduling next draw:', error);
            throw error;
        }
    }

    private getNext2DDrawTime(now: Date): Date {
        const drawTimes = [
            { hour: 12, minute: 0 },
            { hour: 16, minute: 30 }
        ];

        const nextDraw = new Date(now);
        let found = false;

        for (const time of drawTimes) {
            nextDraw.setHours(time.hour, time.minute, 0, 0);
            if (nextDraw > now) {
                found = true;
                break;
            }
        }

        if (!found) {
            // Schedule for tomorrow's first draw
            nextDraw.setDate(nextDraw.getDate() + 1);
            nextDraw.setHours(drawTimes[0].hour, drawTimes[0].minute, 0, 0);
        }

        return nextDraw;
    }

    private getNext3DDrawTime(now: Date): Date {
        const nextDraw = new Date(now);
        const currentDay = nextDraw.getDay();

        // Find next Wednesday (3) or Sunday (0)
        let daysToAdd = 0;
        if (currentDay < 3) {
            daysToAdd = 3 - currentDay;
        } else if (currentDay < 0) {
            daysToAdd = 0 - currentDay;
        } else {
            daysToAdd = 7 - (currentDay - 3);
        }

        nextDraw.setDate(nextDraw.getDate() + daysToAdd);
        nextDraw.setHours(16, 30, 0, 0);

        return nextDraw;
    }
}

export default LotteryResultService; 