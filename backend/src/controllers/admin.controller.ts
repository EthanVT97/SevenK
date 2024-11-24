import { Request, Response } from 'express';
import User from '../models/user.model';
import TransactionModel from '../models/transaction.model';
import { Lottery } from '../models/lottery.model';
import { logger } from '../utils/logger';
import { UserRole } from '../types/roles';
import { notificationService } from '../services/notification.service';
import BankAccount from '../models/bank-account.model';
import { sequelize } from '../config/database';
import { Transaction as SequelizeTransaction } from 'sequelize';
import { Op, fn, col, literal, QueryTypes } from 'sequelize';
import { LotteryBet } from '../models/lottery.model';
import { GroupedCountResultItem } from 'sequelize';
import { adminNotificationService } from '../services/admin-notification.service';
import Banner from '../models/banner.model';

type AuthRequest = Request & Required<Pick<Request, 'user'>>;

// Add analytics interfaces
interface UserStats {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    onlineUsers: number;
    usersByStatus: Record<string, number>;
}

interface FinancialStats {
    totalDeposits: number;
    totalWithdrawals: number;
    totalBets: number;
    totalWinnings: number;
    netRevenue: number;
    transactionVolume: number;
}

interface GameStats {
    totalBets: number;
    winRate: number;
    popularNumbers: Array<{ number: string; count: number }>;
    betDistribution: {
        '2D': number;
        '3D': number;
    };
}

// Add interfaces for analytics
interface BettingTrends {
    popularNumbers: Array<{ number: string; count: number; totalAmount: number }>;
    timeDistribution: Array<{ hour: number; count: number }>;
    userSegments: {
        highRollers: number;
        regularPlayers: number;
        occasionalPlayers: number;
    };
    gameTypeDistribution: {
        '2D': { count: number; amount: number };
        '3D': { count: number; amount: number };
    };
}

interface FinancialReport {
    revenue: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    transactions: {
        deposits: { count: number; amount: number };
        withdrawals: { count: number; amount: number };
        bets: { count: number; amount: number };
        winnings: { count: number; amount: number };
    };
    profitLoss: {
        gross: number;
        net: number;
        margin: number;
    };
    userBalances: {
        total: number;
        average: number;
        highest: number;
    };
}

interface GameTypeStats {
    'lottery.type': '2D' | '3D';
    count: number;
    amount: number;
}

interface RawGameTypeStats {
    'lottery.type': '2D' | '3D';
    count: string;
    amount: string;
}

interface GameTypeQueryResult {
    'lottery.type': '2D' | '3D';
    count: string;
    amount: string;
}

// Add these interfaces at the top with other interfaces
interface CommissionReport {
    totalCommissions: number;
    commissionsByAgent: Array<{
        agentId: number;
        agentName: string;
        totalCommission: number;
        referralCount: number;
        activeReferrals: number;
    }>;
    periodSummary: {
        daily: number;
        weekly: number;
        monthly: number;
    };
}

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const userCount = await User.count();
        const activeUsers = await User.count({ where: { status: 'active' } });
        const totalTransactions = await TransactionModel.count();
        const pendingWithdrawals = await TransactionModel.count({
            where: { type: 'withdrawal', status: 'pending' }
        });

        res.json({
            success: true,
            data: {
                userCount,
                activeUsers,
                totalTransactions,
                pendingWithdrawals
            }
        });
    } catch (error) {
        logger.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data'
        });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'phone', 'email', 'status', 'role', 'lastLogin']
        });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        logger.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const adminId = req.user.id;
        const adminRole = req.user.role as UserRole;

        // Super admin can update any role, admin can only assign moderator
        if (adminRole !== 'super_admin' && role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only super admin can assign admin role'
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.update({ role });

        logger.info(`User ${userId} role updated to ${role} by admin ${adminId}`);

        res.json({
            success: true,
            message: 'User role updated successfully'
        });
    } catch (error) {
        logger.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user role'
        });
    }
};

export const getFinancialOverview = async (req: Request, res: Response) => {
    try {
        const totalDeposits = await TransactionModel.sum('amount', {
            where: { type: 'deposit', status: 'completed' }
        });

        const totalWithdrawals = await TransactionModel.sum('amount', {
            where: { type: 'withdrawal', status: 'completed' }
        });

        const pendingWithdrawals = await TransactionModel.sum('amount', {
            where: { type: 'withdrawal', status: 'pending' }
        });

        res.json({
            success: true,
            data: {
                totalDeposits,
                totalWithdrawals,
                pendingWithdrawals,
                netBalance: totalDeposits - totalWithdrawals
            }
        });
    } catch (error) {
        logger.error('Financial overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching financial overview'
        });
    }
};

export const getFinancialReports = async (req: Request, res: Response) => {
    try {
        // Implement financial reports generation
        res.json({
            success: true,
            message: 'Financial reports endpoint'
        });
    } catch (error) {
        logger.error('Financial reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating financial reports'
        });
    }
};

export const updateLotterySettings = async (req: Request, res: Response) => {
    try {
        // Implement lottery settings update
        res.json({
            success: true,
            message: 'Lottery settings updated'
        });
    } catch (error) {
        logger.error('Lottery settings update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating lottery settings'
        });
    }
};

export const blockUser = async (req: Request, res: Response) => {
    try {
        // Implement user blocking
        res.json({
            success: true,
            message: 'User blocked successfully'
        });
    } catch (error) {
        logger.error('Block user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error blocking user'
        });
    }
};

export const updateSystemSettings = async (req: Request, res: Response) => {
    try {
        // Implement system settings update
        res.json({
            success: true,
            message: 'System settings updated'
        });
    } catch (error) {
        logger.error('System settings update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating system settings'
        });
    }
};

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        // Implement audit logs retrieval
        res.json({
            success: true,
            message: 'Audit logs endpoint'
        });
    } catch (error) {
        logger.error('Audit logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching audit logs'
        });
    }
};

export const suspendUser = async (req: AuthRequest, res: Response) => {
    const t: SequelizeTransaction = await sequelize.transaction();

    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user status
        await user.update({
            status: 'suspended',
            lastLogin: new Date(), // Using lastLogin as status update time
            role: user.role // Include current role to avoid type error
        }, { transaction: t });

        // Notify user
        await notificationService.notifyAccountSuspension(user.id, reason);

        await t.commit();

        res.json({
            success: true,
            message: 'User suspended successfully'
        });
    } catch (error) {
        await t.rollback();
        logger.error('User suspension error:', error);
        res.status(500).json({
            success: false,
            message: 'Error suspending user'
        });
    }
};

export const verifyBankAccount = async (req: AuthRequest, res: Response) => {
    const t: SequelizeTransaction = await sequelize.transaction();

    try {
        const { bankAccountId } = req.params;
        const adminId = req.user.id;

        const bankAccount = await BankAccount.findByPk(bankAccountId, {
            include: [{
                model: User,
                as: 'user'
            }],
            transaction: t
        });

        if (!bankAccount) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Bank account not found'
            });
        }

        // Update bank account verification status
        await bankAccount.update({
            isVerified: true,
            verifiedAt: new Date(),
            verifiedBy: adminId,
            status: bankAccount.status // Include current status to avoid type error
        }, { transaction: t });

        // Notify user
        await notificationService.notifyBankAccountVerification(
            bankAccount.userId,
            bankAccount.bankName,
            bankAccount.accountNumber
        );

        await t.commit();

        res.json({
            success: true,
            message: 'Bank account verified successfully'
        });
    } catch (error) {
        await t.rollback();
        logger.error('Bank account verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying bank account'
        });
    }
};

export const getBankAccounts = async (req: Request, res: Response) => {
    try {
        const { status, verified } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (verified !== undefined) where.isVerified = verified === 'true';

        const bankAccounts = await BankAccount.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'phone', 'email']
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            data: {
                bankAccounts: bankAccounts.rows,
                total: bankAccounts.count,
                page,
                totalPages: Math.ceil(bankAccounts.count / limit)
            }
        });
    } catch (error) {
        logger.error('Get bank accounts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bank accounts'
        });
    }
};

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const timeRange = (req.query.range as string) || '24h'; // Type assertion for timeRange
        const now = new Date();
        let startDate = new Date();

        // Calculate start date based on time range
        switch (timeRange) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case 'all':
                startDate = new Date(0); // Beginning of time
                break;
            default:
                startDate.setHours(now.getHours() - 24);
        }

        // Get user statistics
        const userStats = await getUserStats(startDate);

        // Get financial statistics
        const financialStats = await getFinancialStats(startDate);

        // Get game statistics
        const gameStats = await getGameStats(startDate);

        // Get activity trends
        const activityTrends = await getActivityTrends(startDate, timeRange as string);

        res.json({
            success: true,
            data: {
                userStats,
                financialStats,
                gameStats,
                activityTrends
            }
        });
    } catch (error) {
        logger.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
};

async function getUserStats(startDate: Date): Promise<UserStats> {
    const totalUsers = await User.count();
    const activeUsers = await User.count({
        where: {
            lastLogin: {
                [Op.gte]: startDate
            }
        }
    });
    const newUsers = await User.count({
        where: {
            createdAt: {
                [Op.gte]: startDate
            }
        }
    });

    const usersByStatus = await User.count({
        group: ['status']
    }) as GroupedCountResultItem[];

    // Consider users who made actions in last 5 minutes as online
    const onlineUsers = await User.count({
        where: {
            lastLogin: {
                [Op.gte]: new Date(Date.now() - 5 * 60 * 1000)
            }
        }
    });

    // Convert GroupedCountResultItem[] to Record<string, number>
    const statusCounts = usersByStatus.reduce((acc: Record<string, number>, item: any) => {
        acc[item.status] = item.count;
        return acc;
    }, {});

    return {
        totalUsers,
        activeUsers,
        newUsers,
        onlineUsers,
        usersByStatus: statusCounts
    };
}

async function getFinancialStats(startDate: Date): Promise<FinancialStats> {
    const deposits = await TransactionModel.sum('amount', {
        where: {
            type: 'deposit',
            status: 'completed',
            createdAt: { [Op.gte]: startDate }
        }
    }) || 0;

    const withdrawals = await TransactionModel.sum('amount', {
        where: {
            type: 'withdrawal',
            status: 'completed',
            createdAt: { [Op.gte]: startDate }
        }
    }) || 0;

    const bets = await LotteryBet.sum('amount', {
        where: {
            createdAt: { [Op.gte]: startDate }
        }
    }) || 0;

    const winnings = await LotteryBet.sum('potentialWin', {
        where: {
            status: 'won',
            createdAt: { [Op.gte]: startDate }
        }
    }) || 0;

    const transactionVolume = await TransactionModel.sum('amount', {
        where: {
            status: 'completed',
            createdAt: { [Op.gte]: startDate }
        }
    }) || 0;

    return {
        totalDeposits: deposits,
        totalWithdrawals: withdrawals,
        totalBets: bets,
        totalWinnings: winnings,
        netRevenue: bets - winnings,
        transactionVolume
    };
}

async function getGameStats(startDate: Date): Promise<GameStats> {
    const totalBets = await LotteryBet.count({
        where: {
            createdAt: { [Op.gte]: startDate }
        }
    });

    const wonBets = await LotteryBet.count({
        where: {
            status: 'won',
            createdAt: { [Op.gte]: startDate }
        }
    });

    const winRate = totalBets ? (wonBets / totalBets) * 100 : 0;

    // Get popular numbers
    const popularNumbers = await LotteryBet.findAll({
        attributes: [
            'number',
            [fn('COUNT', col('number')), 'count']
        ],
        where: {
            createdAt: { [Op.gte]: startDate }
        },
        group: ['number'],
        order: [[literal('count'), 'DESC']],
        limit: 10
    });

    // Get bet distribution by game type
    const betDistribution = await LotteryBet.findAll({
        include: [{
            model: Lottery,
            attributes: ['type']
        }],
        attributes: [
            [fn('COUNT', col('id')), 'count']
        ],
        where: {
            createdAt: { [Op.gte]: startDate }
        },
        group: ['lottery.type']
    });

    return {
        totalBets,
        winRate,
        popularNumbers: popularNumbers.map(n => ({
            number: n.number,
            count: n.get('count') as number
        })),
        betDistribution: {
            '2D': betDistribution.find(b => b.get('type') === '2D')?.get('count') as number || 0,
            '3D': betDistribution.find(b => b.get('type') === '3D')?.get('count') as number || 0
        }
    };
}

async function getActivityTrends(startDate: Date, timeRange: string): Promise<any> {
    let interval: string;
    let format: string;

    switch (timeRange) {
        case '24h':
            interval = 'hour';
            format = '%Y-%m-%d %H:00:00';
            break;
        case '7d':
            interval = 'day';
            format = '%Y-%m-%d';
            break;
        case '30d':
            interval = 'day';
            format = '%Y-%m-%d';
            break;
        default:
            interval = 'month';
            format = '%Y-%m';
    }

    // Get user activity trends
    const userTrends = await sequelize.query(`
        SELECT 
            DATE_FORMAT(created_at, '${format}') as time_period,
            COUNT(*) as new_users,
            COUNT(DISTINCT user_id) as active_users
        FROM users
        WHERE created_at >= :startDate
        GROUP BY time_period
        ORDER BY time_period ASC
    `, {
        replacements: { startDate },
        type: QueryTypes.SELECT
    });

    // Get transaction trends
    const transactionTrends = await sequelize.query(`
        SELECT 
            DATE_FORMAT(created_at, '${format}') as time_period,
            type,
            COUNT(*) as count,
            SUM(amount) as volume
        FROM transactions
        WHERE created_at >= :startDate
        GROUP BY time_period, type
        ORDER BY time_period ASC
    `, {
        replacements: { startDate },
        type: QueryTypes.SELECT
    });

    return {
        userTrends,
        transactionTrends
    };
}

export const getBettingTrends = async (req: Request, res: Response) => {
    try {
        const { timeRange = '24h' } = req.query;
        const startDate = getStartDateFromRange(timeRange as string);

        // Get popular numbers
        const popularNumbers = await LotteryBet.findAll({
            attributes: [
                'number',
                [fn('COUNT', col('id')), 'count'],
                [fn('SUM', col('amount')), 'totalAmount']
            ],
            where: {
                createdAt: { [Op.gte]: startDate }
            },
            group: ['number'],
            order: [[literal('count'), 'DESC']],
            limit: 10
        });

        // Get betting time distribution
        const timeDistribution = await LotteryBet.findAll({
            attributes: [
                [fn('HOUR', col('createdAt')), 'hour'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                createdAt: { [Op.gte]: startDate }
            },
            group: [fn('HOUR', col('createdAt'))],
            order: [[fn('HOUR', col('createdAt')), 'ASC']]
        });

        // Get user segments
        const userStats = await LotteryBet.findAll({
            attributes: [
                'userId',
                [fn('COUNT', col('id')), 'betCount'],
                [fn('SUM', col('amount')), 'totalAmount']
            ],
            where: {
                createdAt: { [Op.gte]: startDate }
            },
            group: ['userId'],
            raw: true
        });

        const userSegments = {
            highRollers: userStats.filter(u => (u as any).totalAmount > 1000000).length,
            regularPlayers: userStats.filter(u => (u as any).betCount > 10).length,
            occasionalPlayers: userStats.filter(u => (u as any).betCount <= 10).length
        };

        // Get game type distribution
        const queryResult = await LotteryBet.findAll({
            include: [{
                model: Lottery,
                attributes: ['type']
            }],
            attributes: [
                [col('lottery.type'), 'lottery.type'],
                [fn('COUNT', col('id')), 'count'],
                [fn('SUM', col('amount')), 'amount']
            ],
            where: {
                createdAt: { [Op.gte]: startDate }
            },
            group: ['lottery.type'],
            raw: true
        }) as unknown as GameTypeQueryResult[];

        const gameTypeStats: GameTypeStats[] = queryResult.map(result => ({
            'lottery.type': result['lottery.type'],
            count: parseInt(result.count),
            amount: parseFloat(result.amount)
        }));

        const trends: BettingTrends = {
            popularNumbers: popularNumbers.map(n => ({
                number: n.get('number') as string,
                count: n.get('count') as number,
                totalAmount: n.get('totalAmount') as number
            })),
            timeDistribution: timeDistribution.map(t => ({
                hour: t.get('hour') as number,
                count: t.get('count') as number
            })),
            userSegments,
            gameTypeDistribution: {
                '2D': {
                    count: gameTypeStats.find(g => g['lottery.type'] === '2D')?.count || 0,
                    amount: gameTypeStats.find(g => g['lottery.type'] === '2D')?.amount || 0
                },
                '3D': {
                    count: gameTypeStats.find(g => g['lottery.type'] === '3D')?.count || 0,
                    amount: gameTypeStats.find(g => g['lottery.type'] === '3D')?.amount || 0
                }
            }
        };

        // Check for suspicious patterns
        await checkSuspiciousPatterns(trends);

        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        logger.error('Get betting trends error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching betting trends'
        });
    }
};

export const getFinancialReport = async (req: Request, res: Response) => {
    try {
        const { timeRange = '24h' } = req.query;
        const startDate = getStartDateFromRange(timeRange as string);

        // Get revenue statistics
        const revenue = await calculateRevenue(startDate);

        // Get transaction statistics
        const transactions = await calculateTransactions(startDate);

        // Get profit/loss statistics
        const profitLoss = await calculateProfitLoss(startDate);

        // Get user balance statistics
        const userBalances = await calculateUserBalances();

        const report: FinancialReport = {
            revenue,
            transactions,
            profitLoss,
            userBalances
        };

        // Check for significant financial changes
        await checkFinancialAlerts(report);

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        logger.error('Get financial report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating financial report'
        });
    }
};

export const getDetailedFinancialReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate as string) : new Date();

        // Get revenue breakdown
        const revenueBreakdown = await TransactionModel.findAll({
            attributes: [
                'type',
                [fn('SUM', col('amount')), 'total'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                createdAt: {
                    [Op.between]: [start, end]
                },
                status: 'completed'
            },
            group: ['type']
        });

        // Get user balance distribution
        const balanceDistribution = await User.findAll({
            attributes: [
                [fn('COUNT', col('id')), 'userCount'],
                [fn('SUM', col('walletBalance')), 'totalBalance'],
                [literal('FLOOR(walletBalance/1000000)*1000000'), 'balanceRange']
            ],
            group: ['balanceRange'],
            order: [[literal('balanceRange'), 'ASC']]
        });

        res.json({
            success: true,
            data: {
                revenueBreakdown,
                balanceDistribution,
                period: {
                    start,
                    end
                }
            }
        });
    } catch (error) {
        logger.error('Detailed financial report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating detailed financial report'
        });
    }
};

export const getCommissionReport = async (req: Request, res: Response) => {
    try {
        const { timeRange = '30d' } = req.query;
        const startDate = getStartDateFromRange(timeRange as string);

        const commissionStats = await User.findAll({
            attributes: [
                'id',
                'name',
                [fn('COUNT', col('referrals.id')), 'referralCount'],
                [fn('SUM', col('referrals.commission')), 'totalCommission'],
                [fn('COUNT', literal('CASE WHEN referrals.status = "active" THEN 1 END')), 'activeReferrals']
            ],
            include: [{
                model: User,
                as: 'referrals',
                attributes: [],
                where: {
                    createdAt: { [Op.gte]: startDate }
                },
                required: false
            }],
            where: {
                role: 'agent'
            },
            group: ['id'],
            having: literal('referralCount > 0')
        });

        const report: CommissionReport = {
            totalCommissions: commissionStats.reduce((sum, stat) =>
                sum + (stat.get('totalCommission') as number || 0), 0),
            commissionsByAgent: commissionStats.map(stat => ({
                agentId: stat.id,
                agentName: stat.name,
                totalCommission: stat.get('totalCommission') as number || 0,
                referralCount: stat.get('referralCount') as number || 0,
                activeReferrals: stat.get('activeReferrals') as number || 0
            })),
            periodSummary: {
                daily: await calculatePeriodCommission('24h'),
                weekly: await calculatePeriodCommission('7d'),
                monthly: await calculatePeriodCommission('30d')
            }
        };

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        logger.error('Commission report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating commission report'
        });
    }
};

export const manageBanners = async (req: Request, res: Response) => {
    try {
        const { action } = req.query;

        switch (action) {
            case 'create':
                const bannerData = req.body;
                const newBanner = await Banner.create(bannerData);
                return res.json({
                    success: true,
                    data: newBanner
                });

            case 'update':
                const { id, ...updateData } = req.body;
                await Banner.update(updateData, {
                    where: { id }
                });
                return res.json({
                    success: true,
                    message: 'Banner updated successfully'
                });

            case 'delete':
                const { bannerId } = req.params;
                await Banner.destroy({
                    where: { id: bannerId }
                });
                return res.json({
                    success: true,
                    message: 'Banner deleted successfully'
                });

            default:
                const banners = await Banner.findAll({
                    order: [
                        ['priority', 'DESC'],
                        ['createdAt', 'DESC']
                    ]
                });
                return res.json({
                    success: true,
                    data: banners
                });
        }
    } catch (error) {
        logger.error('Banner management error:', error);
        res.status(500).json({
            success: false,
            message: 'Error managing banners'
        });
    }
};

// Helper functions
async function checkSuspiciousPatterns(trends: BettingTrends): Promise<void> {
    // Check for unusual betting patterns
    const { popularNumbers, userSegments } = trends;

    // Alert if a number receives unusually high bets
    const averageBets = popularNumbers.reduce((sum, n) => sum + n.count, 0) / popularNumbers.length;
    const suspiciousNumbers = popularNumbers.filter(n => n.count > averageBets * 2);

    if (suspiciousNumbers.length > 0) {
        adminNotificationService.notifySystemAlert({
            type: 'suspicious_betting',
            message: `Unusual betting patterns detected for numbers: ${suspiciousNumbers.map(n => n.number).join(', ')}`,
            severity: 'high'
        });
    }

    // Alert if there's a sudden increase in high rollers
    if (userSegments.highRollers > userSegments.regularPlayers * 0.1) {
        adminNotificationService.notifySystemAlert({
            type: 'high_roller_activity',
            message: `High number of high-roller activities detected`,
            severity: 'medium'
        });
    }
}

async function checkFinancialAlerts(report: FinancialReport): Promise<void> {
    const { profitLoss, transactions } = report;

    // Alert on significant profit/loss changes
    if (Math.abs(profitLoss.margin) > 20) {
        adminNotificationService.notifySystemAlert({
            type: 'profit_margin_alert',
            message: `Unusual profit margin detected: ${profitLoss.margin}%`,
            severity: 'high'
        });
    }

    // Alert on high withdrawal volume
    if (transactions.withdrawals.amount > transactions.deposits.amount * 0.8) {
        adminNotificationService.notifySystemAlert({
            type: 'high_withdrawal_volume',
            message: 'High withdrawal volume detected',
            severity: 'medium'
        });
    }
}

async function calculateRevenue(startDate: Date) {
    // Calculate daily revenue
    const daily = await calculatePeriodRevenue(startDate);

    // Calculate weekly revenue
    const weeklyStartDate = new Date(startDate);
    weeklyStartDate.setDate(weeklyStartDate.getDate() - 7);
    const weekly = await calculatePeriodRevenue(weeklyStartDate);

    // Calculate monthly revenue
    const monthlyStartDate = new Date(startDate);
    monthlyStartDate.setMonth(monthlyStartDate.getMonth() - 1);
    const monthly = await calculatePeriodRevenue(monthlyStartDate);

    return { daily, weekly, monthly };
}

async function calculatePeriodRevenue(startDate: Date): Promise<number> {
    const result = await TransactionModel.findOne({
        attributes: [
            [
                literal(`
                    SUM(CASE 
                        WHEN type = 'bet' THEN amount 
                        WHEN type = 'win' THEN -amount 
                        ELSE 0 
                    END)
                `),
                'revenue'
            ]
        ],
        where: {
            createdAt: { [Op.gte]: startDate },
            status: 'completed'
        }
    });

    return result?.get('revenue') as number || 0;
}

async function calculateTransactions(startDate: Date) {
    const stats = await TransactionModel.findAll({
        attributes: [
            'type',
            [fn('COUNT', col('id')), 'count'],
            [fn('SUM', col('amount')), 'amount']
        ],
        where: {
            createdAt: { [Op.gte]: startDate },
            status: 'completed'
        },
        group: ['type'],
        raw: true
    });

    return {
        deposits: {
            count: (stats.find(s => s.type === 'deposit') as any)?.count || 0,
            amount: (stats.find(s => s.type === 'deposit') as any)?.amount || 0
        },
        withdrawals: {
            count: (stats.find(s => s.type === 'withdrawal') as any)?.count || 0,
            amount: (stats.find(s => s.type === 'withdrawal') as any)?.amount || 0
        },
        bets: {
            count: (stats.find(s => s.type === 'bet') as any)?.count || 0,
            amount: (stats.find(s => s.type === 'bet') as any)?.amount || 0
        },
        winnings: {
            count: (stats.find(s => s.type === 'win') as any)?.count || 0,
            amount: (stats.find(s => s.type === 'win') as any)?.amount || 0
        }
    };
}

async function calculateProfitLoss(startDate: Date) {
    const result = await sequelize.query(`
        SELECT 
            SUM(CASE WHEN type = 'bet' THEN amount ELSE 0 END) as gross_revenue,
            SUM(CASE 
                WHEN type = 'bet' THEN amount 
                WHEN type = 'win' THEN -amount 
                ELSE 0 
            END) as net_revenue
        FROM transactions 
        WHERE created_at >= :startDate 
        AND status = 'completed'
    `, {
        replacements: { startDate },
        type: QueryTypes.SELECT
    });

    const { gross_revenue, net_revenue } = result[0] as any;
    const margin = gross_revenue ? (net_revenue / gross_revenue) * 100 : 0;

    return {
        gross: gross_revenue || 0,
        net: net_revenue || 0,
        margin: Number(margin.toFixed(2))
    };
}

async function calculateUserBalances() {
    const result = await User.findAll({
        attributes: [
            [fn('SUM', col('walletBalance')), 'total'],
            [fn('AVG', col('walletBalance')), 'average'],
            [fn('MAX', col('walletBalance')), 'highest']
        ]
    });

    return {
        total: result[0].get('total') as number || 0,
        average: result[0].get('average') as number || 0,
        highest: result[0].get('highest') as number || 0
    };
}

function getStartDateFromRange(range: string): Date {
    const now = new Date();
    switch (range) {
        case '7d':
            return new Date(now.setDate(now.getDate() - 7));
        case '30d':
            return new Date(now.setDate(now.getDate() - 30));
        case '90d':
            return new Date(now.setDate(now.getDate() - 90));
        default: // 24h
            return new Date(now.setHours(now.getHours() - 24));
    }
}

async function calculatePeriodCommission(period: string): Promise<number> {
    const startDate = getStartDateFromRange(period);

    interface CommissionResult {
        total_commission: number | null;
    }

    const result = await User.findAll({
        attributes: [
            [sequelize.fn('SUM', sequelize.col('commission')), 'total_commission']
        ],
        include: [{
            model: User,
            as: 'referrals',
            attributes: [],
            where: {
                createdAt: { [Op.gte]: startDate }
            },
            required: true
        }],
        where: {
            role: 'agent'
        },
        raw: true
    }) as unknown as CommissionResult[];

    return result[0]?.total_commission || 0;
}