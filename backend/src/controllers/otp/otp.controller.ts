import { Request, Response } from 'express';
import User from '../../models/User';
import { logger } from '../../utils/logger';
import { generateOTP, verifyOTP } from '../../utils/otp.util';
import { HttpException, BadRequestException } from '../../common/http-exception';

export const verifyPhoneOTP = async (req: Request, res: Response) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Verify OTP
        const isValid = await verifyOTP(user.phone, otp);
        if (!isValid) {
            throw new BadRequestException('Invalid OTP');
        }

        // Activate user
        await user.update({ status: 'active' });

        res.json({
            message: 'Phone number verified successfully'
        });
    } catch (error: unknown) {
        logger.error('OTP verification error:', error);
        if (error instanceof HttpException) {
            res.status(error.status).json({
                message: error.message,
                errors: error.errors
            });
        } else {
            res.status(500).json({
                message: 'Error verifying OTP',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};

export const resendOTP = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Generate new OTP
        const otp = await generateOTP(user.phone);

        res.json({
            message: 'OTP sent successfully'
        });
    } catch (error: unknown) {
        logger.error('Resend OTP error:', error);
        if (error instanceof HttpException) {
            res.status(error.status).json({
                message: error.message,
                errors: error.errors
            });
        } else {
            res.status(500).json({
                message: 'Error resending OTP',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}; 