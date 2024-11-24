import { Request, Response } from 'express';
import User, { UserAttributes } from '../models/user.model';
import { logger } from '../utils/logger';

// Create a custom Request type that includes the user
declare module 'express-serve-static-core' {
    interface Request {
        user?: UserAttributes;
    }
}

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            message: 'Profile retrieved successfully',
            user
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            message: 'Error retrieving profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

interface UpdateProfileBody {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { name, email } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        await user.update({
            name,
            email
        });

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                status: user.status
            }
        });
    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            message: 'Error updating profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}; 