import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import TransactionModel from '../../models/transaction.model';
import { logger } from '../../utils/logger';

const DAILY_LIMIT = 1000000; // 1 million
const TRANSACTION_LIMIT = 100000; // 100k

export const validateTransaction = [
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),

    body('provider')
        .optional()
        .isIn(['kpay', 'wavemoney', 'kbzpay', 'aya', 'cb'])
        .withMessage('Invalid payment provider'),

    body('senderName')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Sender name must be at least 2 characters long'),

    body('senderPhone')
        .optional()
        .matches(/^[0-9+]{9,15}$/)
        .withMessage('Invalid phone number format'),

    body('transactionId')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Transaction ID cannot be empty if provided'),

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

export const validatePaymentCallback = [
    body('transactionId')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Transaction ID is required'),

    body('status')
        .isIn(['completed', 'failed'])
        .withMessage('Invalid status'),

    body('provider')
        .isIn(['kpay', 'wavemoney', 'kbzpay', 'aya', 'cb'])
        .withMessage('Invalid payment provider'),

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

// Use the globally extended Request type
type AuthRequest = Request & Required<Pick<Request, 'user'>>;

export const checkTransactionLimits = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

        const dailyTotal = await TransactionModel.sum('amount', {
            where: {
                userId,
                type: 'deposit',
                status: 'completed',
                createdAt: {
                    [Op.gte]: today
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
    } catch (error) {
        logger.error('Transaction limit check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking transaction limits'
        });
    }
}; 