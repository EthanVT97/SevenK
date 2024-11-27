import { Request, Response, NextFunction } from 'express';
import { validatePhoneNumber } from '../../utils/otp.util';

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
    const { name, phone, password, email } = req.body;

    if (!name || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: 'အချက်အလက်များ မပြည့်စုံပါ'
        });
    }

    if (!validatePhoneNumber(phone)) {
        return res.status(400).json({
            success: false,
            message: 'ဖုန်းနံပါတ် မှားယွင်းနေပါသည်'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password အနည်းဆုံး ၆လုံး ရှိရပါမည်'
        });
    }

    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({
            success: false,
            message: 'အီးမေးလ် မှားယွင်းနေပါသည်'
        });
    }

    next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({
            success: false,
            message: 'ဖုန်းနံပါတ်နှင့် Password ထည့်သွင်းရန် လိုအပ်ပါသည်'
        });
    }

    if (!validatePhoneNumber(phone)) {
        return res.status(400).json({
            success: false,
            message: 'ဖုန်းနံပါတ် မှားယွင်းနေပါသည်'
        });
    }

    next();
}; 