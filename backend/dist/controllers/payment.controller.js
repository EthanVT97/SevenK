"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPaymentStatus = exports.handlePaymentNotification = exports.handlePaymentCallback = void 0;
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const logger_1 = require("../utils/logger");
const database_1 = require("../config/database");
const payment_service_1 = require("../services/payment.service");
const handlePaymentCallback = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { transactionId, status, provider } = req.body;
        const transaction = await transaction_model_1.default.findOne({
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
            const user = await user_model_1.default.findByPk(transaction.userId, { transaction: t });
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
        }
        else {
            // Update transaction status to failed
            await transaction.update({ status: 'failed' }, { transaction: t });
            await t.commit();
            return res.json({
                success: true,
                message: 'Payment marked as failed'
            });
        }
    }
    catch (error) {
        await t.rollback();
        logger_1.logger.error('Payment callback error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payment callback',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.handlePaymentCallback = handlePaymentCallback;
const handlePaymentNotification = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { provider } = req.params;
        const payload = req.body;
        // Verify webhook signature
        const isValid = await payment_service_1.paymentService.verifyWebhookSignature(provider, payload);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook signature'
            });
        }
        // Process the notification based on provider
        const result = await payment_service_1.paymentService.processWebhookNotification(provider, payload);
        await t.commit();
        res.json({ success: true, data: result });
    }
    catch (error) {
        await t.rollback();
        logger_1.logger.error('Payment notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payment notification'
        });
    }
};
exports.handlePaymentNotification = handlePaymentNotification;
const checkPaymentStatus = async (req, res) => {
    try {
        const { provider, transactionId } = req.params;
        const status = await payment_service_1.paymentService.checkPaymentStatus(provider, transactionId);
        res.json({
            success: true,
            data: status
        });
    }
    catch (error) {
        logger_1.logger.error('Payment status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking payment status'
        });
    }
};
exports.checkPaymentStatus = checkPaymentStatus;
