import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateTicket = [
    body('category')
        .isIn(['deposit', 'withdrawal', 'game', 'account', 'other'])
        .withMessage('Invalid ticket category'),

    body('message')
        .isString()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters'),

    body('attachments')
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

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Invalid priority level'),

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

export const validateTicketUpdate = [
    body('status')
        .isIn(['open', 'pending', 'resolved'])
        .withMessage('Invalid ticket status'),

    body('response')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Response must be between 1 and 2000 characters'),

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