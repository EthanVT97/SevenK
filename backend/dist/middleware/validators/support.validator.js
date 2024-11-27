"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTicketUpdate = exports.validateTicket = void 0;
const express_validator_1 = require("express-validator");
exports.validateTicket = [
    (0, express_validator_1.body)('category')
        .isIn(['deposit', 'withdrawal', 'game', 'account', 'other'])
        .withMessage('Invalid ticket category'),
    (0, express_validator_1.body)('message')
        .isString()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters'),
    (0, express_validator_1.body)('attachments')
        .optional()
        .isArray()
        .withMessage('Attachments must be an array')
        .custom((value) => {
        if (value.length > 5) {
            throw new Error('Maximum 5 attachments allowed');
        }
        // Validate file types and sizes if needed
        return true;
    }),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Invalid priority level'),
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
exports.validateTicketUpdate = [
    (0, express_validator_1.body)('status')
        .isIn(['open', 'pending', 'resolved'])
        .withMessage('Invalid ticket status'),
    (0, express_validator_1.body)('response')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Response must be between 1 and 2000 characters'),
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
