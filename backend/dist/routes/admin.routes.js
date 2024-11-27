"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const admin_notification_controller_1 = require("../controllers/admin-notification.controller");
const router = (0, express_1.Router)();
// Cast handlers to RequestHandler
const handlers = {
    getDashboard: admin_controller_1.getDashboard,
    getUsers: admin_controller_1.getUsers,
    updateUserRole: admin_controller_1.updateUserRole,
    getFinancialOverview: admin_controller_1.getFinancialOverview,
    getFinancialReports: admin_controller_1.getFinancialReports,
    updateLotterySettings: admin_controller_1.updateLotterySettings,
    blockUser: admin_controller_1.blockUser,
    updateSystemSettings: admin_controller_1.updateSystemSettings,
    getAuditLogs: admin_controller_1.getAuditLogs,
    suspendUser: admin_controller_1.suspendUser,
    verifyBankAccount: admin_controller_1.verifyBankAccount,
    getBankAccounts: admin_controller_1.getBankAccounts,
    getUnreadNotifications: admin_notification_controller_1.getUnreadNotifications,
    markNotificationRead: admin_notification_controller_1.markNotificationRead,
    getDashboardStats: admin_controller_1.getDashboardStats,
    getBettingTrends: admin_controller_1.getBettingTrends,
    getFinancialReport: admin_controller_1.getFinancialReport,
    getDetailedFinancialReport: admin_controller_1.getDetailedFinancialReport,
    getCommissionReport: admin_controller_1.getCommissionReport,
    manageBanners: admin_controller_1.manageBanners
};
// System Management Routes
router.get('/dashboard', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.getDashboard);
router.get('/users', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.getUsers);
router.post('/users/:userId/role', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.updateUserRole);
// Financial Management Routes
router.get('/finance/overview', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.getFinancialOverview);
router.get('/finance/reports', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.getFinancialReports);
// Lottery Management Routes
router.post('/lottery/settings', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.updateLotterySettings);
// User Management Routes
router.post('/users/:userId/block', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.blockUser);
router.post('/users/:userId/suspend', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.suspendUser);
// System Settings Routes
router.put('/settings', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.updateSystemSettings);
// Audit Logs
router.get('/audit-logs', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.getAuditLogs);
// Bank Account Management Routes
router.post('/bank-accounts/:bankAccountId/verify', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.verifyBankAccount);
router.get('/bank-accounts', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.getBankAccounts);
// Add notification routes
router.get('/notifications/unread', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.getUnreadNotifications);
router.put('/notifications/:notificationId/read', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.markNotificationRead);
// Add new route
router.get('/dashboard/stats', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.getDashboardStats);
// Add new routes
router.get('/analytics/betting-trends', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.getBettingTrends);
router.get('/analytics/financial-report', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.getFinancialReport);
// Add these routes in your admin routes file
router.get('/financial-report/detailed', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.getDetailedFinancialReport);
router.get('/commission-report', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.getCommissionReport);
router.get('/banners', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.manageBanners);
router.post('/banners', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.manageBanners);
router.put('/banners/:bannerId', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.manageBanners);
router.delete('/banners/:bannerId', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.manageBanners);
exports.default = router;
