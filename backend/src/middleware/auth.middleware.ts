import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserAttributes } from '../models/user.model';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare module 'express-serve-static-core' {
    interface Request {
        user?: UserAttributes;
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        const user = await User.findByPk((decoded as any).id);

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        req.user = user.get({ plain: true });
        next();
    } catch (error) {
        logger.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
}; 