import { Request, Response } from 'express';
import { adminNotificationService } from '../services/admin-notification.service';
import { logger } from '../utils/logger';

type AuthRequest = Request & Required<Pick<Request, 'user'>>;

export const getUnreadNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const count = adminNotificationService.getUnreadCount();

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        logger.error('Get unread notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notification count'
        });
    }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
    try {
        const { notificationId } = req.params;
        const adminId = req.user.id;

        adminNotificationService.markAsRead(notificationId, adminId.toString());

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        logger.error('Mark notification read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notification'
        });
    }
}; 