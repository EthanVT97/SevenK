"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWithdrawalRequest = exports.validateWithdrawalAction = void 0;
const express_validator_1 = require("express-validator");
// Withdrawal limits
const MIN_WITHDRAWAL = 10000; // 10,000 MMK
const MAX_WITHDRAWAL = 500000; // 500,000 MMK
exports.validateWithdrawalAction = [
    (0, express_validator_1.param)('transactionId')
        .exists()
        .withMessage('Transaction ID is required')
        .isInt()
        .withMessage('Invalid transaction ID'),
    (0, express_validator_1.body)('rejectionReason')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Rejection reason must be between 5 and 200 characters'),
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
exports.validateWithdrawalRequest = [
    (0, express_validator_1.body)('amount')
        .isFloat({ min: MIN_WITHDRAWAL, max: MAX_WITHDRAWAL })
        .withMessage(`Amount must be between ${MIN_WITHDRAWAL} and ${MAX_WITHDRAWAL} MMK`),
    (0, express_validator_1.body)('bankName')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Bank name is required'),
    (0, express_validator_1.body)('accountNumber')
        .isString()
        .trim()
        .matches(/^[0-9]{10,16}$/)
        .withMessage('Valid bank account number is required'),
    (0, express_validator_1.body)('accountName')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Account holder name is required'),
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
