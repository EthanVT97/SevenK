import User from '../models/user.model';
import Transaction from '../models/transaction.model';
import { logger } from '../utils/logger';
import axios from 'axios';

class NotificationService {
    private readonly SMS_API_KEY = process.env.SMS_API_KEY;
    private readonly SMS_SENDER_ID = process.env.SMS_SENDER_ID;

    async sendSMS(phone: string, message: string): Promise<boolean> {
        try {
            const response = await axios.post('https://sms-gateway-url/send', {
                apiKey: this.SMS_API_KEY,
                senderId: this.SMS_SENDER_ID,
                phone,
                message
            });

            return response.data.success;
        } catch (error) {
            logger.error('SMS sending error:', error);
            return false;
        }
    }

    async notifyDepositApproval(userId: number, amount: number): Promise<void> {
        try {
            const user = await User.findByPk(userId);
            if (!user) return;

            const message = `Your deposit of ${amount} MMK has been approved. New balance: ${user.walletBalance} MMK`;

            // Send SMS
            await this.sendSMS(user.phone, message);

            // Send email if available
            if (user.email) {
                await this.sendEmail(user.email, 'Deposit Approved', message);
            }

            logger.info(`Deposit approval notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Deposit approval notification error:', error);
        }
    }

    async notifyWithdrawalApproval(userId: number, amount: number): Promise<void> {
        try {
            const user = await User.findByPk(userId);
            if (!user) return;

            const message = `Your withdrawal of ${amount} MMK has been approved and is being processed.`;

            await this.sendSMS(user.phone, message);

            if (user.email) {
                await this.sendEmail(user.email, 'Withdrawal Approved', message);
            }

            logger.info(`Withdrawal approval notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Withdrawal approval notification error:', error);
        }
    }

    async notifyWithdrawalRejection(userId: number, amount: number, reason: string): Promise<void> {
        try {
            const user = await User.findByPk(userId);
            if (!user) return;

            const message = `Your withdrawal of ${amount} MMK has been rejected. Reason: ${reason}. The amount has been refunded to your wallet.`;

            await this.sendSMS(user.phone, message);

            if (user.email) {
                await this.sendEmail(user.email, 'Withdrawal Rejected', message);
            }

            logger.info(`Withdrawal rejection notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Withdrawal rejection notification error:', error);
        }
    }

    async notifyBankAccountVerification(userId: number, bankName: string, accountNumber: string): Promise<void> {
        try {
            const user = await User.findByPk(userId);
            if (!user) return;

            const message = `Your bank account (${bankName} - ${accountNumber}) has been verified.`;

            await this.sendSMS(user.phone, message);

            if (user.email) {
                await this.sendEmail(user.email, 'Bank Account Verified', message);
            }

            logger.info(`Bank account verification notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Bank account verification notification error:', error);
        }
    }

    async notifyAccountSuspension(userId: number, reason: string): Promise<void> {
        try {
            const user = await User.findByPk(userId);
            if (!user) return;

            const message = `Your account has been suspended. Reason: ${reason}. Please contact support for assistance.`;

            await this.sendSMS(user.phone, message);

            if (user.email) {
                await this.sendEmail(user.email, 'Account Suspended', message);
            }

            logger.info(`Account suspension notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Account suspension notification error:', error);
        }
    }

    private async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
        // Implement email sending logic
        return true;
    }
}

export const notificationService = new NotificationService(); 