import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';

// Withdrawal limits
const MIN_WITHDRAWAL = 10000;   // 10,000 MMK
const MAX_WITHDRAWAL = 500000;  // 500,000 MMK

export const validateWithdrawalAction = [
    param('transactionId')
        .exists()
        .withMessage('Transaction ID is required')
        .isInt()
        .withMessage('Invalid transaction ID'),

    body('rejectionReason')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Rejection reason must be between 5 and 200 characters'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

export const validateWithdrawalRequest = [
    body('amount')
        .isFloat({ min: MIN_WITHDRAWAL, max: MAX_WITHDRAWAL })
        .withMessage(`Amount must be between ${MIN_WITHDRAWAL} and ${MAX_WITHDRAWAL} MMK`),

    body('bankName')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Bank name is required'),

    body('accountNumber')
        .isString()
        .trim()
        .matches(/^[0-9]{10,16}$/)
        .withMessage('Valid bank account number is required'),

    body('accountName')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Account holder name is required'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
]; 