import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRegister = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),

    body('phone')
        .trim()
        .matches(/^[0-9+]{9,15}$/)
        .withMessage('Please enter a valid phone number'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateLogin = [
    body('phone')
        .trim()
        .matches(/^[0-9+]{9,15}$/)
        .withMessage('Please enter a valid phone number'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]; 