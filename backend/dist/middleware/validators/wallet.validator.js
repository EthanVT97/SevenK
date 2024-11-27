"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTransactionLimits = exports.validatePaymentCallback = exports.validateTransaction = void 0;
const express_validator_1 = require("express-validator");
const sequelize_1 = require("sequelize");
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
const logger_1 = require("../../utils/logger");
const DAILY_LIMIT = 1000000; // 1 million
const TRANSACTION_LIMIT = 100000; // 100k
exports.validateTransaction = [
    (0, express_validator_1.body)('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),
    (0, express_validator_1.body)('provider')
        .optional()
        .isIn(['kpay', 'wavemoney', 'kbzpay', 'aya', 'cb'])
        .withMessage('Invalid payment provider'),
    (0, express_validator_1.body)('senderName')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Sender name must be at least 2 characters long'),
    (0, express_validator_1.body)('senderPhone')
        .optional()
        .matches(/^[0-9+]{9,15}$/)
        .withMessage('Invalid phone number format'),
    (0, express_validator_1.body)('transactionId')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Transaction ID cannot be empty if provided'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];
exports.validatePaymentCallback = [
    (0, express_validator_1.body)('transactionId')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Transaction ID is required'),
    (0, express_validator_1.body)('status')
        .isIn(['completed', 'failed'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('provider')
        .isIn(['kpay', 'wavemoney', 'kbzpay', 'aya', 'cb'])
        .withMessage('Invalid payment provider'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];
const checkTransactionLimits = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;
        // Check transaction amount limit
        if (amount > TRANSACTION_LIMIT) {
            return res.status(400).json({
                success: false,
                message: `Transaction amount cannot exceed ${TRANSACTION_LIMIT}`
            });
        }
        // Check daily limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyTotal = await transaction_model_1.default.sum('amount', {
            where: {
                userId,
                type: 'deposit',
                status: 'completed',
                createdAt: {
                    [sequelize_1.Op.gte]: today
                }
            }
        });
        if ((dailyTotal + amount) > DAILY_LIMIT) {
            return res.status(400).json({
                success: false,
                message: `Daily deposit limit of ${DAILY_LIMIT} would be exceeded`
            });
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Transaction limit check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking transaction limits'
        });
    }
};
exports.checkTransactionLimits = checkTransactionLimits;
