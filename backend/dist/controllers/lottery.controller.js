"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMultiplier = exports.submitLotteryResult = exports.validateBetHistoryFilters = exports.getBetHistory = exports.placeBet = exports.getUpcomingDraws = void 0;
const lottery_model_1 = require("../models/lottery.model");
const user_model_1 = __importDefault(require("../models/user.model"));
const logger_1 = require("../utils/logger");
const database_1 = require("../config/database");
const lottery_result_service_1 = __importDefault(require("../services/lottery-result.service"));
const websocket_service_1 = require("../services/websocket.service");
const sequelize_1 = require("sequelize");
const express_validator_1 = require("express-validator");
// Initialize lottery result service
const lotteryResultService = new lottery_result_service_1.default(websocket_service_1.wsService);
const getUpcomingDraws = async (req, res) => {
    try {
        const { type = '2D' } = req.query;
        const where = {
            type: type,
            status: ['upcoming', 'ongoing']
        };
        const draws = await lottery_model_1.Lottery.findAll({
            where,
            order: [['drawTime', 'ASC']],
        });
        res.json({
            success: true,
            data: draws,
        });
    }
    catch (error) {
        logger_1.logger.error('Get upcoming draws error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching upcoming draws',
        });
    }
};
exports.getUpcomingDraws = getUpcomingDraws;
const placeBet = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const userId = req.user.id;
        const { lotteryId, number, amount } = req.body;
        // Validate lottery
        const lottery = await lottery_model_1.Lottery.findOne({
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
        const user = await user_model_1.default.findByPk(userId, { transaction: t });
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
        const bet = await lottery_model_1.LotteryBet.create({
            userId,
            lotteryId,
            number,
            amount,
            potentialWin,
            status: 'pending'
        }, { transaction: t });
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
    }
    catch (error) {
        await t.rollback();
        logger_1.logger.error('Place bet error:', error);
        res.status(500).json({
            success: false,
            message: 'Error placing bet',
        });
    }
};
exports.placeBet = placeBet;
const getBetHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, type, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
        // Build where clause
        const where = { userId };
        // Date range filter
        if (startDate && endDate) {
            where.createdAt = {
                [sequelize_1.Op.between]: [
                    new Date(startDate),
                    new Date(endDate)
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
        const bets = await lottery_model_1.LotteryBet.findAndCountAll({
            where,
            include: [
                {
                    model: lottery_model_1.Lottery,
                    as: 'lottery',
                    attributes: [
                        'type',
                        'drawTime',
                        'winningNumber',
                        'multiplier'
                    ],
                },
            ],
            order: [[sortBy, sortOrder]],
            limit: Number(limit),
            offset: (Number(page) - 1) * Number(limit)
        });
        // Calculate statistics
        const stats = await lottery_model_1.LotteryBet.findAll({
            where: { userId },
            attributes: [
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'totalBets'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('amount')), 'totalAmount'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.literal)('CASE WHEN status = "won" THEN potentialWin ELSE 0 END')), 'totalWinnings'],
                [
                    (0, sequelize_1.literal)(`
                        SUM(CASE WHEN status = "won" THEN potentialWin ELSE 0 END) - 
                        SUM(CASE WHEN status != "pending" THEN amount ELSE 0 END)
                    `),
                    'netProfit'
                ],
                [
                    (0, sequelize_1.literal)(`
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
                bets: bets.rows.map((bet) => ({
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
    }
    catch (error) {
        logger_1.logger.error('Get bet history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bet history'
        });
    }
};
exports.getBetHistory = getBetHistory;
// Add validator for bet history filters
exports.validateBetHistoryFilters = [
    (0, express_validator_1.query)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date format'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date format'),
    (0, express_validator_1.query)('type')
        .optional()
        .isIn(['2D', '3D'])
        .withMessage('Invalid game type'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['pending', 'won', 'lost', 'cancelled'])
        .withMessage('Invalid status'),
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('sortBy')
        .optional()
        .isIn(['createdAt', 'amount', 'status'])
        .withMessage('Invalid sort field'),
    (0, express_validator_1.query)('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC'])
        .withMessage('Invalid sort order'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];
const submitLotteryResult = async (req, res) => {
    try {
        const { lotteryId, winningNumber } = req.body;
        // Process result
        await lotteryResultService.processResult(lotteryId, winningNumber);
        // Schedule next draw
        const lottery = await lottery_model_1.Lottery.findByPk(lotteryId);
        if (lottery) {
            await lotteryResultService.scheduleNextDraw(lottery.type);
        }
        // Broadcast the result to all connected clients
        websocket_service_1.wsService.broadcastLotteryUpdate({
            lotteryId,
            winningNumber,
            timestamp: new Date()
        });
        // Notify winners individually
        const winners = await lottery_model_1.LotteryBet.findAll({
            where: {
                lotteryId,
                status: 'won'
            },
            include: [{
                    model: user_model_1.default,
                    attributes: ['id', 'name']
                }]
        });
        winners.forEach(winner => {
            var _a;
            if ((_a = winner.user) === null || _a === void 0 ? void 0 : _a.id) {
                websocket_service_1.wsService.notifyWinner(winner.user.id.toString(), {
                    betId: winner.id,
                    amount: winner.amount
                });
            }
        });
        res.json({
            success: true,
            message: 'Lottery result processed successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Submit lottery result error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing lottery result'
        });
    }
};
exports.submitLotteryResult = submitLotteryResult;
const updateMultiplier = async (req, res) => {
    const t = await database_1.sequelize.transaction();
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
        const lottery = await lottery_model_1.Lottery.findByPk(lotteryId, { transaction: t });
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
    }
    catch (error) {
        await t.rollback();
        logger_1.logger.error('Update multiplier error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating multiplier'
        });
    }
};
exports.updateMultiplier = updateMultiplier;
