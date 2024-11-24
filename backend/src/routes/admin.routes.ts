import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import {
    getDashboard,
    getUsers,
    updateUserRole,
    getFinancialOverview,
    getFinancialReports,
    updateLotterySettings,
    blockUser,
    updateSystemSettings,
    getAuditLogs,
    suspendUser,
    verifyBankAccount,
    getBankAccounts,
    getDashboardStats,
    getBettingTrends,
    getFinancialReport,
    getDetailedFinancialReport,
    getCommissionReport,
    manageBanners
} from '../controllers/admin.controller';
import { validateTicket } from '../middleware/validators/support.validator';
import {
    getUnreadNotifications,
    markNotificationRead
} from '../controllers/admin-notification.controller';

const router = Router();

// Cast handlers to RequestHandler
const handlers = {
    getDashboard: getDashboard as RequestHandler,
    getUsers: getUsers as RequestHandler,
    updateUserRole: updateUserRole as RequestHandler,
    getFinancialOverview: getFinancialOverview as RequestHandler,
    getFinancialReports: getFinancialReports as RequestHandler,
    updateLotterySettings: updateLotterySettings as RequestHandler,
    blockUser: blockUser as RequestHandler,
    updateSystemSettings: updateSystemSettings as RequestHandler,
    getAuditLogs: getAuditLogs as RequestHandler,
    suspendUser: suspendUser as RequestHandler,
    verifyBankAccount: verifyBankAccount as RequestHandler,
    getBankAccounts: getBankAccounts as RequestHandler,
    getUnreadNotifications: getUnreadNotifications as RequestHandler,
    markNotificationRead: markNotificationRead as RequestHandler,
    getDashboardStats: getDashboardStats as RequestHandler,
    getBettingTrends: getBettingTrends as RequestHandler,
    getFinancialReport: getFinancialReport as RequestHandler,
    getDetailedFinancialReport: getDetailedFinancialReport as RequestHandler,
    getCommissionReport: getCommissionReport as RequestHandler,
    manageBanners: manageBanners as RequestHandler
};

// System Management Routes
router.get('/dashboard', authenticate, isAdmin, handlers.getDashboard);
router.get('/users', authenticate, isAdmin, handlers.getUsers);
router.post('/users/:userId/role', authenticate, isAdmin, handlers.updateUserRole);

// Financial Management Routes
router.get('/finance/overview', authenticate, isAdmin, handlers.getFinancialOverview);
router.get('/finance/reports', authenticate, isAdmin, handlers.getFinancialReports);

// Lottery Management Routes
router.post('/lottery/settings', authenticate, isAdmin, handlers.updateLotterySettings);

// User Management Routes
router.post('/users/:userId/block', authenticate, isAdmin, handlers.blockUser);
router.post('/users/:userId/suspend', authenticate, isAdmin, handlers.suspendUser);

// System Settings Routes
router.put('/settings', authenticate, isAdmin, handlers.updateSystemSettings);

// Audit Logs
router.get('/audit-logs', authenticate, isAdmin, handlers.getAuditLogs);

// Bank Account Management Routes
router.post('/bank-accounts/:bankAccountId/verify', authenticate, isAdmin, handlers.verifyBankAccount);
router.get('/bank-accounts', authenticate, isAdmin, handlers.getBankAccounts);

// Add notification routes
router.get('/notifications/unread', authenticate, isAdmin, handlers.getUnreadNotifications);
router.put('/notifications/:notificationId/read', authenticate, isAdmin, handlers.markNotificationRead);

// Add new route
router.get('/dashboard/stats', authenticate, isAdmin, handlers.getDashboardStats);

// Add new routes
router.get('/analytics/betting-trends', authenticate, isAdmin, handlers.getBettingTrends);
router.get('/analytics/financial-report', authenticate, isAdmin, handlers.getFinancialReport);

// Add these routes in your admin routes file
router.get('/financial-report/detailed', authenticate, isAdmin, handlers.getDetailedFinancialReport);
router.get('/commission-report', authenticate, isAdmin, handlers.getCommissionReport);
router.get('/banners', authenticate, isAdmin, handlers.manageBanners);
router.post('/banners', authenticate, isAdmin, handlers.manageBanners);
router.put('/banners/:bannerId', authenticate, isAdmin, handlers.manageBanners);
router.delete('/banners/:bannerId', authenticate, isAdmin, handlers.manageBanners);

export default router; 