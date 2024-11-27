"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionAnalytics = exports.exportTransactionHistory = exports.getTransactionDetails = exports.getTransactionHistory = void 0;
const sequelize_1 = require("sequelize");
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const logger_1 = require("../utils/logger");
// Function to get advanced filters from request
const getAdvancedFilters = (req) => {
    return {
        amountRange: {
            min: parseFloat(req.query.minAmount) || 0,
            max: parseFloat(req.query.maxAmount) || Infinity
        },
        paymentMethod: req.query.paymentMethod
    };
};
const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, type, status, page = 1, limit = 10 } = req.query;
        // Get advanced filters
        const advancedFilters = getAdvancedFilters(req);
        const where = {
            userId,
            amount: {
                [sequelize_1.Op.between]: [advancedFilters.amountRange.min, advancedFilters.amountRange.max]
            }
        };
        if (startDate && endDate) {
            where.createdAt = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        if (advancedFilters.paymentMethod)
            where.category = advancedFilters.paymentMethod;
        const transactions = await transaction_model_1.default.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset: (Number(page) - 1) * Number(limit)
        });
        res.json({
            success: true,
            data: {
                transactions: transactions.rows,
                total: transactions.count,
                page: Number(page),
                totalPages: Math.ceil(transactions.count / Number(limit))
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction history'
        });
    }
};
exports.getTransactionHistory = getTransactionHistory;
const getTransactionDetails = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user.id;
        const transaction = await transaction_model_1.default.findOne({
            where: {
                id: transactionId,
                userId
            },
            include: [
                {
                    model: user_model_1.default,
                    as: 'user',
                    attributes: ['name', 'phone', 'email']
                },
                {
                    model: user_model_1.default,
                    as: 'approver',
                    attributes: ['name', 'email'],
                    required: false
                }
            ]
        });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        res.json({
            success: true,
            data: transaction
        });
    }
    catch (error) {
        logger_1.logger.error('Transaction details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction details'
        });
    }
};
exports.getTransactionDetails = getTransactionDetails;
const exportTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, type, status } = req.query;
        // Build where clause
        const where = { userId };
        if (startDate && endDate) {
            where.createdAt = {
                [sequelize_1.Op.between]: [
                    new Date(startDate),
                    new Date(endDate)
                ]
            };
        }
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        const transactions = await transaction_model_1.default.findAll({
            where,
            include: [
                {
                    model: user_model_1.default,
                    as: 'user',
                    attributes: ['name', 'phone', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        // Format transactions for CSV
        const csvData = transactions.map(t => ({
            Date: t.createdAt.toISOString(),
            Type: t.type,
            Amount: t.amount,
            Status: t.status,
            Reference: t.reference,
            Description: t.description
        }));
        // Send as CSV
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        // Convert to CSV format
        const csv = Object.keys(csvData[0]).join(',') + '\n' +
            csvData.map(row => Object.values(row).join(',')).join('\n');
        res.send(csv);
    }
    catch (error) {
        logger_1.logger.error('Transaction export error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting transactions'
        });
    }
};
exports.exportTransactionHistory = exportTransactionHistory;
const getTransactionAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;
        // Build date range filter
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                [sequelize_1.Op.between]: [
                    new Date(startDate),
                    new Date(endDate)
                ]
            };
        }
        // Get overall statistics
        const overallStats = await transaction_model_1.default.findAll({
            where: {
                userId,
                ...dateFilter
            },
            attributes: [
                'type',
                'status',
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('amount')), 'totalAmount']
            ],
            group: ['type', 'status']
        });
        // Get daily transaction totals
        const dailyTotals = await transaction_model_1.default.findAll({
            where: {
                userId,
                ...dateFilter
            },
            attributes: [
                [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('createdAt')), 'date'],
                'type',
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('amount')), 'totalAmount']
            ],
            group: [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('createdAt')), 'type']
        });
        // Calculate wallet balance trend
        const balanceTrend = await transaction_model_1.default.findAll({
            where: {
                userId,
                status: 'completed',
                ...dateFilter
            },
            attributes: [
                [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('createdAt')), 'date'],
                [
                    (0, sequelize_1.fn)('SUM', (0, sequelize_1.literal)(`CASE 
                            WHEN type = 'deposit' THEN amount 
                            WHEN type = 'withdrawal' THEN -amount 
                            WHEN type = 'win' THEN amount 
                            WHEN type = 'bet' THEN -amount 
                            ELSE 0 
                        END`)),
                    'netChange'
                ]
            ],
            group: [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('createdAt'))],
            order: [[(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('createdAt')), 'ASC']]
        });
        // Get payment method distribution
        const paymentMethods = await transaction_model_1.default.findAll({
            where: {
                userId,
                type: 'deposit',
                ...dateFilter
            },
            attributes: [
                'category',
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('amount')), 'totalAmount']
            ],
            group: ['category']
        });
        // Calculate success rates
        const successRates = await transaction_model_1.default.findAll({
            where: {
                userId,
                ...dateFilter
            },
            attributes: [
                'type',
                [
                    (0, sequelize_1.literal)(`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)`),
                    'successRate'
                ]
            ],
            group: ['type']
        });
        // Format response
        const analytics = {
            overview: {
                totalTransactions: overallStats.reduce((sum, stat) => sum + Number(stat.get('count')), 0),
                totalVolume: overallStats.reduce((sum, stat) => sum + Number(stat.get('totalAmount')), 0),
                successRate: successRates
            },
            transactionsByType: overallStats,
            dailyTrends: {
                transactions: dailyTotals,
                balanceChanges: balanceTrend
            },
            paymentMethods: paymentMethods,
            successRatesByType: successRates
        };
        res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        logger_1.logger.error('Transaction analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating transaction analytics',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getTransactionAnalytics = getTransactionAnalytics;
