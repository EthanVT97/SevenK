"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const logger_1 = require("../utils/logger");
const axios_1 = __importDefault(require("axios"));
class NotificationService {
    constructor() {
        this.SMS_API_KEY = process.env.SMS_API_KEY;
        this.SMS_SENDER_ID = process.env.SMS_SENDER_ID;
    }
    async sendSMS(phone, message) {
        try {
            const response = await axios_1.default.post('https://sms-gateway-url/send', {
                apiKey: this.SMS_API_KEY,
                senderId: this.SMS_SENDER_ID,
                phone,
                message
            });
            return response.data.success;
        }
        catch (error) {
            logger_1.logger.error('SMS sending error:', error);
            return false;
        }
    }
    async notifyDepositApproval(userId, amount) {
        try {
            const user = await user_model_1.default.findByPk(userId);
            if (!user)
                return;
            const message = `Your deposit of ${amount} MMK has been approved. New balance: ${user.walletBalance} MMK`;
            // Send SMS
            await this.sendSMS(user.phone, message);
            // Send email if available
            if (user.email) {
                await this.sendEmail(user.email, 'Deposit Approved', message);
            }
            logger_1.logger.info(`Deposit approval notification sent to user ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Deposit approval notification error:', error);
        }
    }
    async notifyWithdrawalApproval(userId, amount) {
        try {
            const user = await user_model_1.default.findByPk(userId);
            if (!user)
                return;
            const message = `Your withdrawal of ${amount} MMK has been approved and is being processed.`;
            await this.sendSMS(user.phone, message);
            if (user.email) {
                await this.sendEmail(user.email, 'Withdrawal Approved', message);
            }
            logger_1.logger.info(`Withdrawal approval notification sent to user ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Withdrawal approval notification error:', error);
        }
    }
    async notifyWithdrawalRejection(userId, amount, reason) {
        try {
            const user = await user_model_1.default.findByPk(userId);
            if (!user)
                return;
            const message = `Your withdrawal of ${amount} MMK has been rejected. Reason: ${reason}. The amount has been refunded to your wallet.`;
            await this.sendSMS(user.phone, message);
            if (user.email) {
                await this.sendEmail(user.email, 'Withdrawal Rejected', message);
            }
            logger_1.logger.info(`Withdrawal rejection notification sent to user ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Withdrawal rejection notification error:', error);
        }
    }
    async notifyBankAccountVerification(userId, bankName, accountNumber) {
        try {
            const user = await user_model_1.default.findByPk(userId);
            if (!user)
                return;
            const message = `Your bank account (${bankName} - ${accountNumber}) has been verified.`;
            await this.sendSMS(user.phone, message);
            if (user.email) {
                await this.sendEmail(user.email, 'Bank Account Verified', message);
            }
            logger_1.logger.info(`Bank account verification notification sent to user ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Bank account verification notification error:', error);
        }
    }
    async notifyAccountSuspension(userId, reason) {
        try {
            const user = await user_model_1.default.findByPk(userId);
            if (!user)
                return;
            const message = `Your account has been suspended. Reason: ${reason}. Please contact support for assistance.`;
            await this.sendSMS(user.phone, message);
            if (user.email) {
                await this.sendEmail(user.email, 'Account Suspended', message);
            }
            logger_1.logger.info(`Account suspension notification sent to user ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Account suspension notification error:', error);
        }
    }
    async sendEmail(email, subject, message) {
        // Implement email sending logic
        return true;
    }
}
exports.notificationService = new NotificationService();
