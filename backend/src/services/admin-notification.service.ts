import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { logger } from '../utils/logger';

interface AdminNotification {
    id: string;
    type: 'withdrawal' | 'deposit' | 'support' | 'system' | 'user';
    priority: 'low' | 'medium' | 'high';
    message: string;
    details?: any;
    timestamp: Date;
    read: boolean;
}

class AdminNotificationService {
    private notifications: Map<string, AdminNotification> = new Map();
    private adminSockets: Map<string, WebSocket> = new Map();
    private eventEmitter: EventEmitter;

    constructor() {
        this.eventEmitter = new EventEmitter();
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.eventEmitter.on('newWithdrawal', (data) => {
            this.createNotification({
                type: 'withdrawal',
                priority: 'high',
                message: `New withdrawal request: ${data.amount} MMK`,
                details: data
            });
        });

        this.eventEmitter.on('newDeposit', (data) => {
            this.createNotification({
                type: 'deposit',
                priority: 'medium',
                message: `New deposit: ${data.amount} MMK`,
                details: data
            });
        });

        this.eventEmitter.on('supportTicket', (data) => {
            this.createNotification({
                type: 'support',
                priority: 'high',
                message: `New support ticket: ${data.subject}`,
                details: data
            });
        });

        this.eventEmitter.on('userAlert', (data) => {
            this.createNotification({
                type: 'user',
                priority: 'medium',
                message: data.message,
                details: data
            });
        });

        this.eventEmitter.on('systemAlert', (data) => {
            this.createNotification({
                type: 'system',
                priority: 'high',
                message: data.message,
                details: data
            });
        });
    }

    private createNotification(data: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>) {
        const notification: AdminNotification = {
            id: Date.now().toString(),
            ...data,
            timestamp: new Date(),
            read: false
        };

        this.notifications.set(notification.id, notification);
        this.broadcastNotification(notification);

        // Keep only last 100 notifications
        if (this.notifications.size > 100) {
            const oldestKey = Array.from(this.notifications.keys())[0];
            this.notifications.delete(oldestKey);
        }
    }

    private broadcastNotification(notification: AdminNotification) {
        const message = JSON.stringify({
            type: 'notification',
            data: notification
        });

        this.adminSockets.forEach((socket) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(message);
            }
        });
    }

    public registerAdminSocket(adminId: string, socket: WebSocket) {
        this.adminSockets.set(adminId, socket);

        socket.on('close', () => {
            this.adminSockets.delete(adminId);
        });

        // Send unread notifications on connection
        const unreadNotifications = Array.from(this.notifications.values())
            .filter(n => !n.read)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        socket.send(JSON.stringify({
            type: 'notifications',
            data: unreadNotifications
        }));
    }

    public markAsRead(notificationId: string, adminId: string) {
        const notification = this.notifications.get(notificationId);
        if (notification) {
            notification.read = true;
            this.notifications.set(notificationId, notification);

            // Broadcast update
            const socket = this.adminSockets.get(adminId);
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'notificationUpdate',
                    data: { id: notificationId, read: true }
                }));
            }
        }
    }

    public getUnreadCount(): number {
        return Array.from(this.notifications.values()).filter(n => !n.read).length;
    }

    public notifyWithdrawalRequest(data: any) {
        this.eventEmitter.emit('newWithdrawal', data);
    }

    public notifyNewDeposit(data: any) {
        this.eventEmitter.emit('newDeposit', data);
    }

    public notifySupportTicket(data: any) {
        this.eventEmitter.emit('supportTicket', data);
    }

    public notifyUserAlert(data: any) {
        this.eventEmitter.emit('userAlert', data);
    }

    public notifySystemAlert(data: any) {
        this.eventEmitter.emit('systemAlert', data);
    }
}

export const adminNotificationService = new AdminNotificationService(); 