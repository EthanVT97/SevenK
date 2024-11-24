import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';

// Lottery bet limits
const MIN_BET = 100;   // 100 MMK
const MAX_BET = 50000; // 50,000 MMK

export const validateBet = [
    body('lotteryId')
        .isInt()
        .withMessage('Invalid lottery ID'),

    body('number')
        .isString()
        .matches(/^[0-9]{2,3}$/)
        .withMessage('Invalid number format'),

    body('amount')
        .isFloat({ min: MIN_BET, max: MAX_BET })
        .withMessage(`Bet amount must be between ${MIN_BET} and ${MAX_BET} MMK`),

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

export const validateDrawResult = [
    param('lotteryId')
        .isInt()
        .withMessage('Invalid lottery ID'),

    body('winningNumber')
        .isString()
        .matches(/^[0-9]{2,3}$/)
        .withMessage('Invalid winning number format'),

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

export const validateLotteryCreation = [
    body('type')
        .isIn(['2D', '3D'])
        .withMessage('Invalid lottery type'),

    body('drawTime')
        .isISO8601()
        .withMessage('Invalid draw time format'),

    body('minBet')
        .optional()
        .isInt({ min: 100 })
        .withMessage('Minimum bet must be at least 100 MMK'),

    body('maxBet')
        .optional()
        .isInt({ max: 1000000 })
        .withMessage('Maximum bet cannot exceed 1,000,000 MMK'),

    body('multiplier')
        .optional()
        .isFloat({ min: 1 })
        .withMessage('Multiplier must be greater than 1'),

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

export const validateMultiplier = [
    param('lotteryId')
        .isInt()
        .withMessage('Invalid lottery ID'),

    body('multiplier')
        .isFloat({ min: 1.1 })
        .withMessage('Multiplier must be greater than 1')
        .custom((value, { req }) => {
            // Different validation rules for 2D and 3D
            const maxMultiplier = req.body.type === '2D' ? 100 : 1000;
            if (value > maxMultiplier) {
                throw new Error(`Multiplier cannot exceed ${maxMultiplier}`);
            }
            return true;
        }),

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

// Add default multiplier constants
export const DEFAULT_MULTIPLIERS = {
    '2D': {
        min: 1.1,
        max: 100,
        default: 85
    },
    '3D': {
        min: 1.1,
        max: 1000,
        default: 500
    }
}; 