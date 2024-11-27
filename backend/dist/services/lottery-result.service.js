"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lottery_model_1 = require("../models/lottery.model");
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
class LotteryResultService {
    constructor(wsService) {
        this.wsService = wsService;
    }
    async processResult(lotteryId, winningNumber) {
        const t = await database_1.sequelize.transaction();
        try {
            // Get lottery and its bets
            const lottery = await lottery_model_1.Lottery.findByPk(lotteryId, {
                include: [{
                        model: lottery_model_1.LotteryBet,
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
            const bets = lottery.get('bets');
            for (const bet of bets) {
                if (bet.number === winningNumber) {
                    // Winner
                    await bet.update({
                        status: 'won'
                    }, { transaction: t });
                    // Update user balance
                    await database_1.sequelize.query('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', {
                        replacements: [bet.potentialWin, bet.userId],
                        transaction: t
                    });
                }
                else {
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
            logger_1.logger.info(`Lottery ${lotteryId} result processed: ${winningNumber}`);
        }
        catch (error) {
            await t.rollback();
            logger_1.logger.error('Error processing lottery result:', error);
            throw error;
        }
    }
    async scheduleNextDraw(type) {
        try {
            const now = new Date();
            let nextDrawTime;
            if (type === '2D') {
                nextDrawTime = this.getNext2DDrawTime(now);
            }
            else {
                nextDrawTime = this.getNext3DDrawTime(now);
            }
            // Create lottery with proper typing
            await lottery_model_1.Lottery.create({
                type,
                drawTime: nextDrawTime,
                status: 'upcoming',
                minBet: type === '2D' ? 100 : 500,
                maxBet: type === '2D' ? 50000 : 100000,
                multiplier: type === '2D' ? 85 : 500
            });
            logger_1.logger.info(`Next ${type} draw scheduled for ${nextDrawTime}`);
        }
        catch (error) {
            logger_1.logger.error('Error scheduling next draw:', error);
            throw error;
        }
    }
    getNext2DDrawTime(now) {
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
    getNext3DDrawTime(now) {
        const nextDraw = new Date(now);
        const currentDay = nextDraw.getDay();
        // Find next Wednesday (3) or Sunday (0)
        let daysToAdd = 0;
        if (currentDay < 3) {
            daysToAdd = 3 - currentDay;
        }
        else if (currentDay < 0) {
            daysToAdd = 0 - currentDay;
        }
        else {
            daysToAdd = 7 - (currentDay - 3);
        }
        nextDraw.setDate(nextDraw.getDate() + daysToAdd);
        nextDraw.setHours(16, 30, 0, 0);
        return nextDraw;
    }
}
exports.default = LotteryResultService;
