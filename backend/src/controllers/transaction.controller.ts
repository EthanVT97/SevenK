import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { sequelize } from '../config/database';
import TransactionModel from '../models/transaction.model';
import User from '../models/user.model';
import { logger } from '../utils/logger';

type AuthRequest = Request & Required<Pick<Request, 'user'>>;

// Add interface for advanced filters
interface AdvancedFilters {
    amountRange: {
        min: number;
        max: number;
    };
    paymentMethod?: string;
}

// Function to get advanced filters from request
const getAdvancedFilters = (req: AuthRequest): AdvancedFilters => {
    return {
        amountRange: {
            min: parseFloat(req.query.minAmount as string) || 0,
            max: parseFloat(req.query.maxAmount as string) || Infinity
        },
        paymentMethod: req.query.paymentMethod as string
    };
};

export const getTransactionHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const {
            startDate,
            endDate,
            type,
            status,
            page = 1,
            limit = 10
        } = req.query;

        // Get advanced filters
        const advancedFilters = getAdvancedFilters(req);

        const where: any = {
            userId,
            amount: {
                [Op.between]: [advancedFilters.amountRange.min, advancedFilters.amountRange.max]
            }
        };

        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
            };
        }

        if (type) where.type = type;
        if (status) where.status = status;
        if (advancedFilters.paymentMethod) where.category = advancedFilters.paymentMethod;

        const transactions = await TransactionModel.findAndCountAll({
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
    } catch (error) {
        logger.error('Transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction history'
        });
    }
};

export const getTransactionDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user.id;

        const transaction = await TransactionModel.findOne({
            where: {
                id: transactionId,
                userId
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'phone', 'email']
                },
                {
                    model: User,
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
    } catch (error) {
        logger.error('Transaction details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction details'
        });
    }
};

export const exportTransactionHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, type, status } = req.query;

        // Build where clause
        const where: any = { userId };

        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [
                    new Date(startDate as string),
                    new Date(endDate as string)
                ]
            };
        }

        if (type) where.type = type;
        if (status) where.status = status;

        const transactions = await TransactionModel.findAll({
            where,
            include: [
                {
                    model: User,
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
    } catch (error) {
        logger.error('Transaction export error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting transactions'
        });
    }
};

export const getTransactionAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;

        // Build date range filter
        const dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                [Op.between]: [
                    new Date(startDate as string),
                    new Date(endDate as string)
                ]
            };
        }

        // Get overall statistics
        const overallStats = await TransactionModel.findAll({
            where: {
                userId,
                ...dateFilter
            },
            attributes: [
                'type',
                'status',
                [fn('COUNT', col('id')), 'count'],
                [fn('SUM', col('amount')), 'totalAmount']
            ],
            group: ['type', 'status']
        });

        // Get daily transaction totals
        const dailyTotals = await TransactionModel.findAll({
            where: {
                userId,
                ...dateFilter
            },
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                'type',
                [fn('COUNT', col('id')), 'count'],
                [fn('SUM', col('amount')), 'totalAmount']
            ],
            group: [fn('DATE', col('createdAt')), 'type']
        });

        // Calculate wallet balance trend
        const balanceTrend = await TransactionModel.findAll({
            where: {
                userId,
                status: 'completed',
                ...dateFilter
            },
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [
                    fn(
                        'SUM',
                        literal(`CASE 
                            WHEN type = 'deposit' THEN amount 
                            WHEN type = 'withdrawal' THEN -amount 
                            WHEN type = 'win' THEN amount 
                            WHEN type = 'bet' THEN -amount 
                            ELSE 0 
                        END`)
                    ),
                    'netChange'
                ]
            ],
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        // Get payment method distribution
        const paymentMethods = await TransactionModel.findAll({
            where: {
                userId,
                type: 'deposit',
                ...dateFilter
            },
            attributes: [
                'category',
                [fn('COUNT', col('id')), 'count'],
                [fn('SUM', col('amount')), 'totalAmount']
            ],
            group: ['category']
        });

        // Calculate success rates
        const successRates = await TransactionModel.findAll({
            where: {
                userId,
                ...dateFilter
            },
            attributes: [
                'type',
                [
                    literal(`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)`),
                    'successRate'
                ]
            ],
            group: ['type']
        });

        // Format response
        const analytics = {
            overview: {
                totalTransactions: overallStats.reduce((sum: number, stat: any) => sum + Number(stat.get('count')), 0),
                totalVolume: overallStats.reduce((sum: number, stat: any) => sum + Number(stat.get('totalAmount')), 0),
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
    } catch (error) {
        logger.error('Transaction analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating transaction analytics',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
