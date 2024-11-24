import { Request, Response } from 'express';
import { Transaction, WhereOptions, Optional } from 'sequelize';
import { Lottery, LotteryBet, LotteryAttributes, LotteryBetAttributes } from '../models/lottery.model';
import User from '../models/user.model';
import { logger } from '../utils/logger';
import { sequelize } from '../config/database';
import LotteryResultService from '../services/lottery-result.service';
import { wsService } from '../services/websocket.service';
import { Op, fn, col, literal } from 'sequelize';
import { validationResult, query } from 'express-validator';
import { NextFunction } from 'express';

type AuthRequest = Request & Required<Pick<Request, 'user'>>;

// Initialize lottery result service
const lotteryResultService = new LotteryResultService(wsService);

// Add interface for bet creation
interface LotteryBetCreationAttributes extends Optional<LotteryBetAttributes, 'id'> { }

// Add interface for bet with lottery
interface BetWithLottery extends LotteryBet {
    lottery: Lottery;
}

// Add interface for bet result
interface BetResult {
    id: number;
    number: string;
    amount: number;
    potentialWin: number;
    status: 'pending' | 'won' | 'lost' | 'cancelled';
    createdAt: Date;
    lottery: {
        type: '2D' | '3D';
        drawTime: Date;
        winningNumber: string;
        multiplier: number;
    };
}

// Add this interface near the top with other interfaces
interface LotteryBetWithUser extends LotteryBet {
    user?: {
        id: number;
        name: string;
    };
}

export const getUpcomingDraws = async (req: Request, res: Response) => {
    try {
        const { type = '2D' } = req.query;

        const where: WhereOptions<LotteryAttributes> = {
            type: type as '2D' | '3D',
            status: ['upcoming', 'ongoing']
        };

        const draws = await Lottery.findAll({
            where,
            order: [['drawTime', 'ASC']],
        });

        res.json({
            success: true,
            data: draws,
        });
    } catch (error) {
        logger.error('Get upcoming draws error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching upcoming draws',
        });
    }
};

export const placeBet = async (req: AuthRequest, res: Response) => {
    const t: Transaction = await sequelize.transaction();

    try {
        const userId = req.user.id;
        const { lotteryId, number, amount } = req.body;

        // Validate lottery
        const lottery = await Lottery.findOne({
            where: {
                id: lotteryId,
                status: ['upcoming', 'ongoing'],
            },
            transaction: t,
        });

        if (!lottery) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Invalid lottery or betting closed',
            });
        }

        // Validate bet amount
        if (amount < lottery.minBet || amount > lottery.maxBet) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Bet amount must be between ${lottery.minBet} and ${lottery.maxBet}`,
            });
        }

        // Validate number format
        const numberRegex = lottery.type === '2D' ? /^[0-9]{2}$/ : /^[0-9]{3}$/;
        if (!numberRegex.test(number)) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Invalid number format for ${lottery.type}`,
            });
        }

        // Check user balance
        const user = await User.findByPk(userId, { transaction: t });
        if (!user || user.walletBalance < amount) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance',
            });
        }

        // Calculate potential win
        const potentialWin = amount * lottery.multiplier;

        // Create bet with proper typing
        const bet = await LotteryBet.create({
            userId,
            lotteryId,
            number,
            amount,
            potentialWin,
            status: 'pending'
        } as LotteryBetCreationAttributes, { transaction: t });

        // Deduct balance
        await user.decrement('walletBalance', {
            by: amount,
            transaction: t,
        });

        await t.commit();

        res.json({
            success: true,
            message: res.locals.translate('lottery.bet.success'),
            data: {
                bet,
                newBalance: res.locals.formatCurrency(user.walletBalance - amount),
                drawTime: res.locals.formatDate(lottery.drawTime)
            }
        });
    } catch (error) {
        await t.rollback();
        logger.error('Place bet error:', error);
        res.status(500).json({
            success: false,
            message: 'Error placing bet',
        });
    }
};

export const getBetHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const {
            startDate,
            endDate,
            type,
            status,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        // Build where clause
        const where: any = { userId };

        // Date range filter
        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [
                    new Date(startDate as string),
                    new Date(endDate as string)
                ]
            };
        }

        // Game type filter (2D/3D)
        if (type) {
            where['$lottery.type$'] = type;
        }

        // Bet status filter
        if (status) {
            where.status = status;
        }

        const bets = await LotteryBet.findAndCountAll({
            where,
            include: [
                {
                    model: Lottery,
                    as: 'lottery',
                    attributes: [
                        'type',
                        'drawTime',
                        'winningNumber',
                        'multiplier'
                    ],
                },
            ],
            order: [[sortBy as string, sortOrder as 'ASC' | 'DESC']],
            limit: Number(limit),
            offset: (Number(page) - 1) * Number(limit)
        });

        // Calculate statistics
        const stats = await LotteryBet.findAll({
            where: { userId },
            attributes: [
                [fn('COUNT', col('id')), 'totalBets'],
                [fn('SUM', col('amount')), 'totalAmount'],
                [fn('SUM', literal('CASE WHEN status = "won" THEN potentialWin ELSE 0 END')), 'totalWinnings'],
                [
                    literal(`
                        SUM(CASE WHEN status = "won" THEN potentialWin ELSE 0 END) - 
                        SUM(CASE WHEN status != "pending" THEN amount ELSE 0 END)
                    `),
                    'netProfit'
                ],
                [
                    literal(`
                        COUNT(CASE WHEN status = "won" THEN 1 END) * 100.0 / 
                        COUNT(CASE WHEN status != "pending" THEN 1 END)
                    `),
                    'winRate'
                ]
            ]
        });

        res.json({
            success: true,
            data: {
                bets: (bets.rows as unknown as BetWithLottery[]).map((bet): BetResult => ({
                    id: bet.id,
                    number: bet.number,
                    amount: bet.amount,
                    potentialWin: bet.potentialWin,
                    status: bet.status,
                    createdAt: bet.createdAt,
                    lottery: {
                        type: bet.lottery.type,
                        drawTime: bet.lottery.drawTime,
                        winningNumber: bet.lottery.winningNumber,
                        multiplier: bet.lottery.multiplier
                    }
                })),
                total: bets.count,
                page: Number(page),
                totalPages: Math.ceil(bets.count / Number(limit)),
                stats: {
                    totalBets: stats[0].get('totalBets'),
                    totalAmount: stats[0].get('totalAmount'),
                    totalWinnings: stats[0].get('totalWinnings'),
                    netProfit: stats[0].get('netProfit'),
                    winRate: Number(stats[0].get('winRate')).toFixed(2) + '%'
                }
            }
        });
    } catch (error) {
        logger.error('Get bet history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bet history'
        });
    }
};

// Add validator for bet history filters
export const validateBetHistoryFilters = [
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date format'),

    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date format'),

    query('type')
        .optional()
        .isIn(['2D', '3D'])
        .withMessage('Invalid game type'),

    query('status')
        .optional()
        .isIn(['pending', 'won', 'lost', 'cancelled'])
        .withMessage('Invalid status'),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('sortBy')
        .optional()
        .isIn(['createdAt', 'amount', 'status'])
        .withMessage('Invalid sort field'),

    query('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC'])
        .withMessage('Invalid sort order'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

export const submitLotteryResult = async (req: AuthRequest, res: Response) => {
    try {
        const { lotteryId, winningNumber } = req.body;

        // Process result
        await lotteryResultService.processResult(lotteryId, winningNumber);

        // Schedule next draw
        const lottery = await Lottery.findByPk(lotteryId);
        if (lottery) {
            await lotteryResultService.scheduleNextDraw(lottery.type);
        }

        // Broadcast the result to all connected clients
        wsService.broadcastLotteryUpdate({
            lotteryId,
            winningNumber,
            timestamp: new Date()
        });

        // Notify winners individually
        const winners = await LotteryBet.findAll({
            where: {
                lotteryId,
                status: 'won'
            },
            include: [{
                model: User,
                attributes: ['id', 'name']
            }]
        }) as unknown as LotteryBetWithUser[];

        winners.forEach(winner => {
            if (winner.user?.id) {
                wsService.notifyWinner(winner.user.id.toString(), {
                    betId: winner.id,
                    amount: winner.amount
                });
            }
        });

        res.json({
            success: true,
            message: 'Lottery result processed successfully'
        });
    } catch (error) {
        logger.error('Submit lottery result error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing lottery result'
        });
    }
};

export const updateMultiplier = async (req: AuthRequest, res: Response) => {
    const t: Transaction = await sequelize.transaction();

    try {
        const { lotteryId } = req.params;
        const { multiplier } = req.body;

        // Validate multiplier
        if (multiplier <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Multiplier must be greater than 1'
            });
        }

        const lottery = await Lottery.findByPk(lotteryId, { transaction: t });
        if (!lottery) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Lottery not found'
            });
        }

        // Only allow updating upcoming lotteries
        if (lottery.status !== 'upcoming') {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Can only update multiplier for upcoming lotteries'
            });
        }

        // Update multiplier
        await lottery.update({ multiplier }, { transaction: t });

        await t.commit();

        res.json({
            success: true,
            message: 'Multiplier updated successfully',
            data: {
                id: lottery.id,
                type: lottery.type,
                multiplier: lottery.multiplier,
                drawTime: lottery.drawTime
            }
        });
    } catch (error) {
        await t.rollback();
        logger.error('Update multiplier error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating multiplier'
        });
    }
}; 