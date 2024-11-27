"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageBanners = exports.getCommissionReport = exports.getDetailedFinancialReport = exports.getFinancialReport = exports.getBettingTrends = exports.getDashboardStats = exports.getBankAccounts = exports.verifyBankAccount = exports.suspendUser = exports.getAuditLogs = exports.updateSystemSettings = exports.blockUser = exports.updateLotterySettings = exports.getFinancialReports = exports.getFinancialOverview = exports.updateUserRole = exports.getUsers = exports.getDashboard = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const lottery_model_1 = require("../models/lottery.model");
const logger_1 = require("../utils/logger");
const notification_service_1 = require("../services/notification.service");
const bank_account_model_1 = __importDefault(require("../models/bank-account.model"));
const database_1 = require("../config/database");
const sequelize_1 = require("sequelize");
const lottery_model_2 = require("../models/lottery.model");
const admin_notification_service_1 = require("../services/admin-notification.service");
const banner_model_1 = __importDefault(require("../models/banner.model"));
const getDashboard = async (req, res) => {
    try {
        const userCount = await user_model_1.default.count();
        const activeUsers = await user_model_1.default.count({ where: { status: 'active' } });
        const totalTransactions = await transaction_model_1.default.count();
        const pendingWithdrawals = await transaction_model_1.default.count({
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
    }
    catch (error) {
        logger_1.logger.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data'
        });
    }
};
exports.getDashboard = getDashboard;
const getUsers = async (req, res) => {
    try {
        const users = await user_model_1.default.findAll({
            attributes: ['id', 'name', 'phone', 'email', 'status', 'role', 'lastLogin']
        });
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        logger_1.logger.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};
exports.getUsers = getUsers;
const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const adminId = req.user.id;
        const adminRole = req.user.role;
        // Super admin can update any role, admin can only assign moderator
        if (adminRole !== 'super_admin' && role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only super admin can assign admin role'
            });
        }
        const user = await user_model_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        await user.update({ role });
        logger_1.logger.info(`User ${userId} role updated to ${role} by admin ${adminId}`);
        res.json({
            success: true,
            message: 'User role updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user role'
        });
    }
};
exports.updateUserRole = updateUserRole;
const getFinancialOverview = async (req, res) => {
    try {
        const totalDeposits = await transaction_model_1.default.sum('amount', {
            where: { type: 'deposit', status: 'completed' }
        });
        const totalWithdrawals = await transaction_model_1.default.sum('amount', {
            where: { type: 'withdrawal', status: 'completed' }
        });
        const pendingWithdrawals = await transaction_model_1.default.sum('amount', {
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
    }
    catch (error) {
        logger_1.logger.error('Financial overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching financial overview'
        });
    }
};
exports.getFinancialOverview = getFinancialOverview;
const getFinancialReports = async (req, res) => {
    try {
        // Implement financial reports generation
        res.json({
            success: true,
            message: 'Financial reports endpoint'
        });
    }
    catch (error) {
        logger_1.logger.error('Financial reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating financial reports'
        });
    }
};
exports.getFinancialReports = getFinancialReports;
const updateLotterySettings = async (req, res) => {
    try {
        // Implement lottery settings update
        res.json({
            success: true,
            message: 'Lottery settings updated'
        });
    }
    catch (error) {
        logger_1.logger.error('Lottery settings update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating lottery settings'
        });
    }
};
exports.updateLotterySettings = updateLotterySettings;
const blockUser = async (req, res) => {
    try {
        // Implement user blocking
        res.json({
            success: true,
            message: 'User blocked successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Block user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error blocking user'
        });
    }
};
exports.blockUser = blockUser;
const updateSystemSettings = async (req, res) => {
    try {
        // Implement system settings update
        res.json({
            success: true,
            message: 'System settings updated'
        });
    }
    catch (error) {
        logger_1.logger.error('System settings update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating system settings'
        });
    }
};
exports.updateSystemSettings = updateSystemSettings;
const getAuditLogs = async (req, res) => {
    try {
        // Implement audit logs retrieval
        res.json({
            success: true,
            message: 'Audit logs endpoint'
        });
    }
    catch (error) {
        logger_1.logger.error('Audit logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching audit logs'
        });
    }
};
exports.getAuditLogs = getAuditLogs;
const suspendUser = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;
        const user = await user_model_1.default.findByPk(userId, { transaction: t });
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
        await notification_service_1.notificationService.notifyAccountSuspension(user.id, reason);
        await t.commit();
        res.json({
            success: true,
            message: 'User suspended successfully'
        });
    }
    catch (error) {
        await t.rollback();
        logger_1.logger.error('User suspension error:', error);
        res.status(500).json({
            success: false,
            message: 'Error suspending user'
        });
    }
};
exports.suspendUser = suspendUser;
const verifyBankAccount = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { bankAccountId } = req.params;
        const adminId = req.user.id;
        const bankAccount = await bank_account_model_1.default.findByPk(bankAccountId, {
            include: [{
                    model: user_model_1.default,
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
        await notification_service_1.notificationService.notifyBankAccountVerification(bankAccount.userId, bankAccount.bankName, bankAccount.accountNumber);
        await t.commit();
        res.json({
            success: true,
            message: 'Bank account verified successfully'
        });
    }
    catch (error) {
        await t.rollback();
        logger_1.logger.error('Bank account verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying bank account'
        });
    }
};
exports.verifyBankAccount = verifyBankAccount;
const getBankAccounts = async (req, res) => {
    try {
        const { status, verified } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (verified !== undefined)
            where.isVerified = verified === 'true';
        const bankAccounts = await bank_account_model_1.default.findAndCountAll({
            where,
            include: [{
                    model: user_model_1.default,
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
    }
    catch (error) {
        logger_1.logger.error('Get bank accounts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bank accounts'
        });
    }
};
exports.getBankAccounts = getBankAccounts;
const getDashboardStats = async (req, res) => {
    try {
        const timeRange = req.query.range || '24h'; // Type assertion for timeRange
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
        const activityTrends = await getActivityTrends(startDate, timeRange);
        res.json({
            success: true,
            data: {
                userStats,
                financialStats,
                gameStats,
                activityTrends
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
};
exports.getDashboardStats = getDashboardStats;
async function getUserStats(startDate) {
    const totalUsers = await user_model_1.default.count();
    const activeUsers = await user_model_1.default.count({
        where: {
            lastLogin: {
                [sequelize_1.Op.gte]: startDate
            }
        }
    });
    const newUsers = await user_model_1.default.count({
        where: {
            createdAt: {
                [sequelize_1.Op.gte]: startDate
            }
        }
    });
    const usersByStatus = await user_model_1.default.count({
        group: ['status']
    });
    // Consider users who made actions in last 5 minutes as online
    const onlineUsers = await user_model_1.default.count({
        where: {
            lastLogin: {
                [sequelize_1.Op.gte]: new Date(Date.now() - 5 * 60 * 1000)
            }
        }
    });
    // Convert GroupedCountResultItem[] to Record<string, number>
    const statusCounts = usersByStatus.reduce((acc, item) => {
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
async function getFinancialStats(startDate) {
    const deposits = await transaction_model_1.default.sum('amount', {
        where: {
            type: 'deposit',
            status: 'completed',
            createdAt: { [sequelize_1.Op.gte]: startDate }
        }
    }) || 0;
    const withdrawals = await transaction_model_1.default.sum('amount', {
        where: {
            type: 'withdrawal',
            status: 'completed',
            createdAt: { [sequelize_1.Op.gte]: startDate }
        }
    }) || 0;
    const bets = await lottery_model_2.LotteryBet.sum('amount', {
        where: {
            createdAt: { [sequelize_1.Op.gte]: startDate }
        }
    }) || 0;
    const winnings = await lottery_model_2.LotteryBet.sum('potentialWin', {
        where: {
            status: 'won',
            createdAt: { [sequelize_1.Op.gte]: startDate }
        }
    }) || 0;
    const transactionVolume = await transaction_model_1.default.sum('amount', {
        where: {
            status: 'completed',
            createdAt: { [sequelize_1.Op.gte]: startDate }
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
async function getGameStats(startDate) {
    var _a, _b;
    const totalBets = await lottery_model_2.LotteryBet.count({
        where: {
            createdAt: { [sequelize_1.Op.gte]: startDate }
        }
    });
    const wonBets = await lottery_model_2.LotteryBet.count({
        where: {
            status: 'won',
            createdAt: { [sequelize_1.Op.gte]: startDate }
        }
    });
    const winRate = totalBets ? (wonBets / totalBets) * 100 : 0;
    // Get popular numbers
    const popularNumbers = await lottery_model_2.LotteryBet.findAll({
        attributes: [
            'number',
            [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('number')), 'count']
        ],
        where: {
            createdAt: { [sequelize_1.Op.gte]: startDate }
        },
        group: ['number'],
        order: [[(0, sequelize_1.literal)('count'), 'DESC']],
        limit: 10
    });
    // Get bet distribution by game type
    const betDistribution = await lottery_model_2.LotteryBet.findAll({
        include: [{
                model: lottery_model_1.Lottery,
                attributes: ['type']
            }],
        attributes: [
            [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']
        ],
        where: {
            createdAt: { [sequelize_1.Op.gte]: startDate }
        },
        group: ['lottery.type']
    });
    return {
        totalBets,
        winRate,
        popularNumbers: popularNumbers.map(n => ({
            number: n.number,
            count: n.get('count')
        })),
        betDistribution: {
            '2D': ((_a = betDistribution.find(b => b.get('type') === '2D')) === null || _a === void 0 ? void 0 : _a.get('count')) || 0,
            '3D': ((_b = betDistribution.find(b => b.get('type') === '3D')) === null || _b === void 0 ? void 0 : _b.get('count')) || 0
        }
    };
}
async function getActivityTrends(startDate, timeRange) {
    let interval;
    let format;
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
    const userTrends = await database_1.sequelize.query(`
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
        type: sequelize_1.QueryTypes.SELECT
    });
    // Get transaction trends
    const transactionTrends = await database_1.sequelize.query(`
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
        type: sequelize_1.QueryTypes.SELECT
    });
    return {
        userTrends,
        transactionTrends
    };
}
const getBettingTrends = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const { timeRange = '24h' } = req.query;
        const startDate = getStartDateFromRange(timeRange);
        // Get popular numbers
        const popularNumbers = await lottery_model_2.LotteryBet.findAll({
            attributes: [
                'number',
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('amount')), 'totalAmount']
            ],
            where: {
                createdAt: { [sequelize_1.Op.gte]: startDate }
            },
            group: ['number'],
            order: [[(0, sequelize_1.literal)('count'), 'DESC']],
            limit: 10
        });
        // Get betting time distribution
        const timeDistribution = await lottery_model_2.LotteryBet.findAll({
            attributes: [
                [(0, sequelize_1.fn)('HOUR', (0, sequelize_1.col)('createdAt')), 'hour'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']
            ],
            where: {
                createdAt: { [sequelize_1.Op.gte]: startDate }
            },
            group: [(0, sequelize_1.fn)('HOUR', (0, sequelize_1.col)('createdAt'))],
            order: [[(0, sequelize_1.fn)('HOUR', (0, sequelize_1.col)('createdAt')), 'ASC']]
        });
        // Get user segments
        const userStats = await lottery_model_2.LotteryBet.findAll({
            attributes: [
                'userId',
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'betCount'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('amount')), 'totalAmount']
            ],
            where: {
                createdAt: { [sequelize_1.Op.gte]: startDate }
            },
            group: ['userId'],
            raw: true
        });
        const userSegments = {
            highRollers: userStats.filter(u => u.totalAmount > 1000000).length,
            regularPlayers: userStats.filter(u => u.betCount > 10).length,
            occasionalPlayers: userStats.filter(u => u.betCount <= 10).length
        };
        // Get game type distribution
        const queryResult = await lottery_model_2.LotteryBet.findAll({
            include: [{
                    model: lottery_model_1.Lottery,
                    attributes: ['type']
                }],
            attributes: [
                [(0, sequelize_1.col)('lottery.type'), 'lottery.type'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('amount')), 'amount']
            ],
            where: {
                createdAt: { [sequelize_1.Op.gte]: startDate }
            },
            group: ['lottery.type'],
            raw: true
        });
        const gameTypeStats = queryResult.map(result => ({
            'lottery.type': result['lottery.type'],
            count: parseInt(result.count),
            amount: parseFloat(result.amount)
        }));
        const trends = {
            popularNumbers: popularNumbers.map(n => ({
                number: n.get('number'),
                count: n.get('count'),
                totalAmount: n.get('totalAmount')
            })),
            timeDistribution: timeDistribution.map(t => ({
                hour: t.get('hour'),
                count: t.get('count')
            })),
            userSegments,
            gameTypeDistribution: {
                '2D': {
                    count: ((_a = gameTypeStats.find(g => g['lottery.type'] === '2D')) === null || _a === void 0 ? void 0 : _a.count) || 0,
                    amount: ((_b = gameTypeStats.find(g => g['lottery.type'] === '2D')) === null || _b === void 0 ? void 0 : _b.amount) || 0
                },
                '3D': {
                    count: ((_c = gameTypeStats.find(g => g['lottery.type'] === '3D')) === null || _c === void 0 ? void 0 : _c.count) || 0,
                    amount: ((_d = gameTypeStats.find(g => g['lottery.type'] === '3D')) === null || _d === void 0 ? void 0 : _d.amount) || 0
                }
            }
        };
        // Check for suspicious patterns
        await checkSuspiciousPatterns(trends);
        res.json({
            success: true,
            data: trends
        });
    }
    catch (error) {
        logger_1.logger.error('Get betting trends error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching betting trends'
        });
    }
};
exports.getBettingTrends = getBettingTrends;
const getFinancialReport = async (req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        const startDate = getStartDateFromRange(timeRange);
        // Get revenue statistics
        const revenue = await calculateRevenue(startDate);
        // Get transaction statistics
        const transactions = await calculateTransactions(startDate);
        // Get profit/loss statistics
        const profitLoss = await calculateProfitLoss(startDate);
        // Get user balance statistics
        const userBalances = await calculateUserBalances();
        const report = {
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
    }
    catch (error) {
        logger_1.logger.error('Get financial report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating financial report'
        });
    }
};
exports.getFinancialReport = getFinancialReport;
const getDetailedFinancialReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        // Get revenue breakdown
        const revenueBreakdown = await transaction_model_1.default.findAll({
            attributes: [
                'type',
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('amount')), 'total'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']
            ],
            where: {
                createdAt: {
                    [sequelize_1.Op.between]: [start, end]
                },
                status: 'completed'
            },
            group: ['type']
        });
        // Get user balance distribution
        const balanceDistribution = await user_model_1.default.findAll({
            attributes: [
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'userCount'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('walletBalance')), 'totalBalance'],
                [(0, sequelize_1.literal)('FLOOR(walletBalance/1000000)*1000000'), 'balanceRange']
            ],
            group: ['balanceRange'],
            order: [[(0, sequelize_1.literal)('balanceRange'), 'ASC']]
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
    }
    catch (error) {
        logger_1.logger.error('Detailed financial report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating detailed financial report'
        });
    }
};
exports.getDetailedFinancialReport = getDetailedFinancialReport;
const getCommissionReport = async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        const startDate = getStartDateFromRange(timeRange);
        const commissionStats = await user_model_1.default.findAll({
            attributes: [
                'id',
                'name',
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('referrals.id')), 'referralCount'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('referrals.commission')), 'totalCommission'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.literal)('CASE WHEN referrals.status = "active" THEN 1 END')), 'activeReferrals']
            ],
            include: [{
                    model: user_model_1.default,
                    as: 'referrals',
                    attributes: [],
                    where: {
                        createdAt: { [sequelize_1.Op.gte]: startDate }
                    },
                    required: false
                }],
            where: {
                role: 'agent'
            },
            group: ['id'],
            having: (0, sequelize_1.literal)('referralCount > 0')
        });
        const report = {
            totalCommissions: commissionStats.reduce((sum, stat) => sum + (stat.get('totalCommission') || 0), 0),
            commissionsByAgent: commissionStats.map(stat => ({
                agentId: stat.id,
                agentName: stat.name,
                totalCommission: stat.get('totalCommission') || 0,
                referralCount: stat.get('referralCount') || 0,
                activeReferrals: stat.get('activeReferrals') || 0
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
    }
    catch (error) {
        logger_1.logger.error('Commission report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating commission report'
        });
    }
};
exports.getCommissionReport = getCommissionReport;
const manageBanners = async (req, res) => {
    try {
        const { action } = req.query;
        switch (action) {
            case 'create':
                const bannerData = req.body;
                const newBanner = await banner_model_1.default.create(bannerData);
                return res.json({
                    success: true,
                    data: newBanner
                });
            case 'update':
                const { id, ...updateData } = req.body;
                await banner_model_1.default.update(updateData, {
                    where: { id }
                });
                return res.json({
                    success: true,
                    message: 'Banner updated successfully'
                });
            case 'delete':
                const { bannerId } = req.params;
                await banner_model_1.default.destroy({
                    where: { id: bannerId }
                });
                return res.json({
                    success: true,
                    message: 'Banner deleted successfully'
                });
            default:
                const banners = await banner_model_1.default.findAll({
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
    }
    catch (error) {
        logger_1.logger.error('Banner management error:', error);
        res.status(500).json({
            success: false,
            message: 'Error managing banners'
        });
    }
};
exports.manageBanners = manageBanners;
// Helper functions
async function checkSuspiciousPatterns(trends) {
    // Check for unusual betting patterns
    const { popularNumbers, userSegments } = trends;
    // Alert if a number receives unusually high bets
    const averageBets = popularNumbers.reduce((sum, n) => sum + n.count, 0) / popularNumbers.length;
    const suspiciousNumbers = popularNumbers.filter(n => n.count > averageBets * 2);
    if (suspiciousNumbers.length > 0) {
        admin_notification_service_1.adminNotificationService.notifySystemAlert({
            type: 'suspicious_betting',
            message: `Unusual betting patterns detected for numbers: ${suspiciousNumbers.map(n => n.number).join(', ')}`,
            severity: 'high'
        });
    }
    // Alert if there's a sudden increase in high rollers
    if (userSegments.highRollers > userSegments.regularPlayers * 0.1) {
        admin_notification_service_1.adminNotificationService.notifySystemAlert({
            type: 'high_roller_activity',
            message: `High number of high-roller activities detected`,
            severity: 'medium'
        });
    }
}
async function checkFinancialAlerts(report) {
    const { profitLoss, transactions } = report;
    // Alert on significant profit/loss changes
    if (Math.abs(profitLoss.margin) > 20) {
        admin_notification_service_1.adminNotificationService.notifySystemAlert({
            type: 'profit_margin_alert',
            message: `Unusual profit margin detected: ${profitLoss.margin}%`,
            severity: 'high'
        });
    }
    // Alert on high withdrawal volume
    if (transactions.withdrawals.amount > transactions.deposits.amount * 0.8) {
        admin_notification_service_1.adminNotificationService.notifySystemAlert({
            type: 'high_withdrawal_volume',
            message: 'High withdrawal volume detected',
            severity: 'medium'
        });
    }
}
async function calculateRevenue(startDate) {
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
async function calculatePeriodRevenue(startDate) {
    const result = await transaction_model_1.default.findOne({
        attributes: [
            [
                (0, sequelize_1.literal)(`
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
            createdAt: { [sequelize_1.Op.gte]: startDate },
            status: 'completed'
        }
    });
    return (result === null || result === void 0 ? void 0 : result.get('revenue')) || 0;
}
async function calculateTransactions(startDate) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const stats = await transaction_model_1.default.findAll({
        attributes: [
            'type',
            [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count'],
            [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('amount')), 'amount']
        ],
        where: {
            createdAt: { [sequelize_1.Op.gte]: startDate },
            status: 'completed'
        },
        group: ['type'],
        raw: true
    });
    return {
        deposits: {
            count: ((_a = stats.find(s => s.type === 'deposit')) === null || _a === void 0 ? void 0 : _a.count) || 0,
            amount: ((_b = stats.find(s => s.type === 'deposit')) === null || _b === void 0 ? void 0 : _b.amount) || 0
        },
        withdrawals: {
            count: ((_c = stats.find(s => s.type === 'withdrawal')) === null || _c === void 0 ? void 0 : _c.count) || 0,
            amount: ((_d = stats.find(s => s.type === 'withdrawal')) === null || _d === void 0 ? void 0 : _d.amount) || 0
        },
        bets: {
            count: ((_e = stats.find(s => s.type === 'bet')) === null || _e === void 0 ? void 0 : _e.count) || 0,
            amount: ((_f = stats.find(s => s.type === 'bet')) === null || _f === void 0 ? void 0 : _f.amount) || 0
        },
        winnings: {
            count: ((_g = stats.find(s => s.type === 'win')) === null || _g === void 0 ? void 0 : _g.count) || 0,
            amount: ((_h = stats.find(s => s.type === 'win')) === null || _h === void 0 ? void 0 : _h.amount) || 0
        }
    };
}
async function calculateProfitLoss(startDate) {
    const result = await database_1.sequelize.query(`
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
        type: sequelize_1.QueryTypes.SELECT
    });
    const { gross_revenue, net_revenue } = result[0];
    const margin = gross_revenue ? (net_revenue / gross_revenue) * 100 : 0;
    return {
        gross: gross_revenue || 0,
        net: net_revenue || 0,
        margin: Number(margin.toFixed(2))
    };
}
async function calculateUserBalances() {
    const result = await user_model_1.default.findAll({
        attributes: [
            [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('walletBalance')), 'total'],
            [(0, sequelize_1.fn)('AVG', (0, sequelize_1.col)('walletBalance')), 'average'],
            [(0, sequelize_1.fn)('MAX', (0, sequelize_1.col)('walletBalance')), 'highest']
        ]
    });
    return {
        total: result[0].get('total') || 0,
        average: result[0].get('average') || 0,
        highest: result[0].get('highest') || 0
    };
}
function getStartDateFromRange(range) {
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
async function calculatePeriodCommission(period) {
    var _a;
    const startDate = getStartDateFromRange(period);
    const result = await user_model_1.default.findAll({
        attributes: [
            [database_1.sequelize.fn('SUM', database_1.sequelize.col('commission')), 'total_commission']
        ],
        include: [{
                model: user_model_1.default,
                as: 'referrals',
                attributes: [],
                where: {
                    createdAt: { [sequelize_1.Op.gte]: startDate }
                },
                required: true
            }],
        where: {
            role: 'agent'
        },
        raw: true
    });
    return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total_commission) || 0;
}
