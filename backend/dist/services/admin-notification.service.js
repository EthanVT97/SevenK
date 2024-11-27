"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminNotificationService = void 0;
const events_1 = require("events");
const ws_1 = __importDefault(require("ws"));
class AdminNotificationService {
    constructor() {
        this.notifications = new Map();
        this.adminSockets = new Map();
        this.eventEmitter = new events_1.EventEmitter();
        this.setupEventListeners();
    }
    setupEventListeners() {
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
    createNotification(data) {
        const notification = {
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
    broadcastNotification(notification) {
        const message = JSON.stringify({
            type: 'notification',
            data: notification
        });
        this.adminSockets.forEach((socket) => {
            if (socket.readyState === ws_1.default.OPEN) {
                socket.send(message);
            }
        });
    }
    registerAdminSocket(adminId, socket) {
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
    markAsRead(notificationId, adminId) {
        const notification = this.notifications.get(notificationId);
        if (notification) {
            notification.read = true;
            this.notifications.set(notificationId, notification);
            // Broadcast update
            const socket = this.adminSockets.get(adminId);
            if ((socket === null || socket === void 0 ? void 0 : socket.readyState) === ws_1.default.OPEN) {
                socket.send(JSON.stringify({
                    type: 'notificationUpdate',
                    data: { id: notificationId, read: true }
                }));
            }
        }
    }
    getUnreadCount() {
        return Array.from(this.notifications.values()).filter(n => !n.read).length;
    }
    notifyWithdrawalRequest(data) {
        this.eventEmitter.emit('newWithdrawal', data);
    }
    notifyNewDeposit(data) {
        this.eventEmitter.emit('newDeposit', data);
    }
    notifySupportTicket(data) {
        this.eventEmitter.emit('supportTicket', data);
    }
    notifyUserAlert(data) {
        this.eventEmitter.emit('userAlert', data);
    }
    notifySystemAlert(data) {
        this.eventEmitter.emit('systemAlert', data);
    }
}
exports.adminNotificationService = new AdminNotificationService();
