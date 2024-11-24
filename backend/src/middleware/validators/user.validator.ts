import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateUpdateProfile = [
    body('name').optional().trim().isLength({ min: 2 }),
    body('email').optional().trim().isEmail(),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]; 