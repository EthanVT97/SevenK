"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionHistory = exports.generateReceipt = exports.initiateDeposit = exports.withdraw = exports.deposit = exports.getTransactions = exports.getWalletBalance = void 0;
const uuid_1 = require("uuid");
const user_model_1 = __importDefault(require("../models/user.model"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const logger_1 = require("../utils/logger");
const database_1 = require("../config/database");
const payment_service_1 = require("../services/payment.service");
const sequelize_1 = require("sequelize");
const getWalletBalance = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const user = await user_model_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            success: true,
            balance: user.walletBalance
        });
    }
    catch (error) {
        logger_1.logger.error('Get wallet balance error:', error);
        res.status(500).json({
            message: 'Error getting wallet balance',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getWalletBalance = getWalletBalance;
const getTransactions = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const transactions = await transaction_model_1.default.findAndCountAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });
        res.json({
            success: true,
            data: {
                transactions: transactions.rows,
                total: transactions.count,
                page,
                totalPages: Math.ceil(transactions.count / limit)
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get transactions error:', error);
        res.status(500).json({
            message: 'Error getting transactions',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getTransactions = getTransactions;
const deposit = async (req, res) => {
    var _a;
    const t = await database_1.sequelize.transaction();
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { amount } = req.body;
        const user = await user_model_1.default.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: 'User not found' });
        }
        // Create transaction record with category
        const transaction = await transaction_model_1.default.create({
            userId: userId,
            type: 'deposit',
            category: 'deposit',
            amount,
            status: 'completed',
            reference: (0, uuid_1.v4)(),
            description: 'Wallet deposit'
        });
        // Update user's wallet balance
        await user.increment('walletBalance', {
            by: amount,
            transaction: t
        });
        await t.commit();
        res.json({
            success: true,
            message: 'Deposit successful',
            data: {
                transaction,
                newBalance: user.walletBalance + amount
            }
        });
    }
    catch (error) {
        await t.rollback();
        logger_1.logger.error('Deposit error:', error);
        res.status(500).json({
            message: 'Error processing deposit',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.deposit = deposit;
const withdraw = async (req, res) => {
    var _a;
    const t = await database_1.sequelize.transaction();
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { amount } = req.body;
        const user = await user_model_1.default.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.walletBalance < amount) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient balance' });
        }
        // Create transaction record with category
        const transaction = await transaction_model_1.default.create({
            userId: userId,
            type: 'withdrawal',
            category: 'withdrawal',
            amount,
            status: 'completed',
            reference: (0, uuid_1.v4)(),
            description: 'Wallet withdrawal'
        });
        // Update user's wallet balance
        await user.decrement('walletBalance', {
            by: amount,
            transaction: t
        });
        await t.commit();
        res.json({
            success: true,
            message: 'Withdrawal successful',
            data: {
                transaction,
                newBalance: user.walletBalance - amount
            }
        });
    }
    catch (error) {
        await t.rollback();
        logger_1.logger.error('Withdrawal error:', error);
        res.status(500).json({
            message: 'Error processing withdrawal',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.withdraw = withdraw;
const initiateDeposit = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { amount, provider, senderName, senderPhone, transactionId } = req.body;
        // Validate payment provider
        if (!['kpay', 'wavemoney', 'kbzpay', 'aya', 'cb'].includes(provider)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment provider'
            });
        }
        const paymentRequest = {
            amount,
            provider: provider,
            senderName,
            senderPhone,
            transactionId
        };
        // Process payment through the selected provider
        const paymentResponse = await payment_service_1.paymentService.processPayment(provider, paymentRequest);
        if (paymentResponse.success) {
            // Create pending transaction with category
            const transaction = await transaction_model_1.default.create({
                userId: userId,
                type: 'deposit',
                category: 'deposit',
                amount,
                status: 'pending',
                reference: paymentResponse.transactionId,
                description: `Deposit via ${provider.toUpperCase()}`
            });
            res.json({
                success: true,
                message: 'Deposit initiated successfully',
                data: {
                    transaction,
                    paymentDetails: paymentResponse
                }
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Payment processing failed',
                error: paymentResponse.message
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Deposit initiation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error initiating deposit',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.initiateDeposit = initiateDeposit;
const generateReceipt = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = await transaction_model_1.default.findOne({
            where: { reference: transactionId },
            include: [{
                    model: user_model_1.default,
                    as: 'user',
                    attributes: ['name', 'phone', 'email']
                }]
        });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        // Use type assertion to access the included user data
        const transactionWithUser = transaction;
        const receipt = {
            receiptNo: `RCP${transaction.id.toString().padStart(6, '0')}`,
            date: transaction.createdAt,
            transactionId: transaction.reference,
            type: transaction.type,
            amount: transaction.amount,
            status: transaction.status,
            customerName: transactionWithUser.user.name,
            customerPhone: transactionWithUser.user.phone,
            description: transaction.description
        };
        res.json({
            success: true,
            data: receipt
        });
    }
    catch (error) {
        logger_1.logger.error('Receipt generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating receipt'
        });
    }
};
exports.generateReceipt = generateReceipt;
const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, type, status, page = 1, limit = 10 } = req.query;
        const where = { userId };
        if (startDate && endDate) {
            where.createdAt = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        const transactions = await transaction_model_1.default.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset: (Number(page) - 1) * Number(limit)
        });
        res.json({
            success: true,
            data: {
                transactions: transactions.rows,
                total: transactions.count,
                page: Number(page),
                totalPages: Math.ceil(transactions.count / Number(limit))
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction history'
        });
    }
};
exports.getTransactionHistory = getTransactionHistory;
