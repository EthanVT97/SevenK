import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import { logger } from '../../utils/logger';
import { generateOTP, verifyOTP } from '../../utils/otp.util';
import { HttpException } from '../../common/http-exception';
import { UserAttributes, UserStatus } from '../../types/user.types';

interface ErrorResponse {
    message: string;
    errors?: any;
}

type CreateUserData = Omit<UserAttributes, 'id' | 'lastLogin' | 'createdAt' | 'updatedAt'>;

const handleError = (error: unknown, res: Response<ErrorResponse>) => {
    logger.error('Error:', error);
    if (error instanceof HttpException) {
        const httpError = error as HttpException;
        return res.status(httpError.status).json({
            message: httpError.message,
            errors: httpError.errors
        });
    }
    return res.status(500).json({
        message: 'Internal server error',
        errors: error instanceof Error ? error.message : 'Unknown error'
    });
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, phone, email, password } = req.body;

        const existingUser = await User.findOne({ where: { phone } });
        if (existingUser) {
            return res.status(400).json({
                message: 'ဖုန်းနံပါတ် မှတ်ပုံတင်ထားပြီး ဖြစ်ပါသည်'
            });
        }

        // Generate OTP
        const otp = await generateOTP(phone);

        // Create user with pending status
        const userData: CreateUserData = {
            name,
            phone,
            email,
            password: await bcrypt.hash(password, 10),
            status: 'pending' as UserStatus,
            walletBalance: 0
        };

        const user = await User.create(userData);

        res.status(201).json({
            message: 'OTP ကုဒ်နံပါတ် ပေးပို့ပြီးပါပြီ',
            userId: user.id
        });
    } catch (error: unknown) {
        handleError(error, res);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { phone, password } = req.body;

        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(401).json({
                message: 'ဖုန်းနံပါတ် သို့မဟုတ် Password မှားယွင်းနေပါသည်'
            });
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: 'ဖုန်းနံပါတ် သို့မဟုတ် Password မှားယွင်းနေပါသည်'
            });
        }

        if (user.status !== 'active') {
            return res.status(401).json({
                message: 'အကောင့် အတည်ပြုရန် လိုအပ်ပါသေးသည်'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ',
            token,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                status: user.status
            }
        });
    } catch (error: unknown) {
        handleError(error, res);
    }
};
