"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MULTIPLIERS = exports.validateMultiplier = exports.validateLotteryCreation = exports.validateDrawResult = exports.validateBet = void 0;
const express_validator_1 = require("express-validator");
// Lottery bet limits
const MIN_BET = 100; // 100 MMK
const MAX_BET = 50000; // 50,000 MMK
exports.validateBet = [
    (0, express_validator_1.body)('lotteryId')
        .isInt()
        .withMessage('Invalid lottery ID'),
    (0, express_validator_1.body)('number')
        .isString()
        .matches(/^[0-9]{2,3}$/)
        .withMessage('Invalid number format'),
    (0, express_validator_1.body)('amount')
        .isFloat({ min: MIN_BET, max: MAX_BET })
        .withMessage(`Bet amount must be between ${MIN_BET} and ${MAX_BET} MMK`),
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
exports.validateDrawResult = [
    (0, express_validator_1.param)('lotteryId')
        .isInt()
        .withMessage('Invalid lottery ID'),
    (0, express_validator_1.body)('winningNumber')
        .isString()
        .matches(/^[0-9]{2,3}$/)
        .withMessage('Invalid winning number format'),
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
exports.validateLotteryCreation = [
    (0, express_validator_1.body)('type')
        .isIn(['2D', '3D'])
        .withMessage('Invalid lottery type'),
    (0, express_validator_1.body)('drawTime')
        .isISO8601()
        .withMessage('Invalid draw time format'),
    (0, express_validator_1.body)('minBet')
        .optional()
        .isInt({ min: 100 })
        .withMessage('Minimum bet must be at least 100 MMK'),
    (0, express_validator_1.body)('maxBet')
        .optional()
        .isInt({ max: 1000000 })
        .withMessage('Maximum bet cannot exceed 1,000,000 MMK'),
    (0, express_validator_1.body)('multiplier')
        .optional()
        .isFloat({ min: 1 })
        .withMessage('Multiplier must be greater than 1'),
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
exports.validateMultiplier = [
    (0, express_validator_1.param)('lotteryId')
        .isInt()
        .withMessage('Invalid lottery ID'),
    (0, express_validator_1.body)('multiplier')
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
// Add default multiplier constants
exports.DEFAULT_MULTIPLIERS = {
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
