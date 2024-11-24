import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import TransactionModel from '../models/transaction.model';
import User from '../models/user.model';
import { logger } from '../utils/logger';
import { sequelize } from '../config/database';
import { paymentService } from '../services/payment.service';
import { PaymentProvider } from '../types/payment.types';

export const handlePaymentCallback = async (req: Request, res: Response) => {
    const t: Transaction = await sequelize.transaction();

    try {
        const { transactionId, status, provider } = req.body;

        const transaction = await TransactionModel.findOne({
            where: { reference: transactionId },
            transaction: t
        });

        if (!transaction) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (transaction.status !== 'pending') {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Transaction already processed'
            });
        }

        if (status === 'completed') {
            // Update transaction status
            await transaction.update({ status: 'completed' }, { transaction: t });

            // Update user's wallet balance
            const user = await User.findByPk(transaction.userId, { transaction: t });
            if (!user) {
                await t.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            await user.increment('walletBalance', {
                by: transaction.amount,
                transaction: t
            });

            await t.commit();

            return res.json({
                success: true,
                message: 'Payment completed successfully'
            });
        } else {
            // Update transaction status to failed
            await transaction.update({ status: 'failed' }, { transaction: t });
            await t.commit();

            return res.json({
                success: true,
                message: 'Payment marked as failed'
            });
        }
    } catch (error) {
        await t.rollback();
        logger.error('Payment callback error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payment callback',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const handlePaymentNotification = async (req: Request, res: Response) => {
    const t: Transaction = await sequelize.transaction();

    try {
        const { provider } = req.params;
        const payload = req.body;

        // Verify webhook signature
        const isValid = await paymentService.verifyWebhookSignature(provider as PaymentProvider, payload);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook signature'
            });
        }

        // Process the notification based on provider
        const result = await paymentService.processWebhookNotification(
            provider as PaymentProvider,
            payload
        );

        await t.commit();
        res.json({ success: true, data: result });
    } catch (error) {
        await t.rollback();
        logger.error('Payment notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payment notification'
        });
    }
};

export const checkPaymentStatus = async (req: Request, res: Response) => {
    try {
        const { provider, transactionId } = req.params;
        const status = await paymentService.checkPaymentStatus(
            provider as PaymentProvider,
            transactionId
        );

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        logger.error('Payment status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking payment status'
        });
    }
}; 