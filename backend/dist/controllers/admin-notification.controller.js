"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationRead = exports.getUnreadNotifications = void 0;
const admin_notification_service_1 = require("../services/admin-notification.service");
const logger_1 = require("../utils/logger");
const getUnreadNotifications = async (req, res) => {
    try {
        const count = admin_notification_service_1.adminNotificationService.getUnreadCount();
        res.json({
            success: true,
            data: { count }
        });
    }
    catch (error) {
        logger_1.logger.error('Get unread notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notification count'
        });
    }
};
exports.getUnreadNotifications = getUnreadNotifications;
const markNotificationRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const adminId = req.user.id;
        admin_notification_service_1.adminNotificationService.markAsRead(notificationId, adminId.toString());
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    }
    catch (error) {
        logger_1.logger.error('Mark notification read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notification'
        });
    }
};
exports.markNotificationRead = markNotificationRead;
