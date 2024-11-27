import { Request, Response, NextFunction } from 'express';
import { validatePhoneNumber, validateOTPFormat } from '../../utils/otp.util';

interface APIResponse {
    success: boolean;
    message: string;
    data?: any;
}

interface OTPRequestBody {
    phone: string;
    otp?: string;
}

export const validateOTPRequest = (
    req: Request<{}, {}, OTPRequestBody>,
    res: Response<APIResponse>,
    next: NextFunction
) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: 'ဖုန်းနံပါတ် ထည့်သွင်းရန် လိုအပ်ပါသည်'
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

export const validateOTPVerification = (
    req: Request<{}, {}, OTPRequestBody>,
    res: Response<APIResponse>,
    next: NextFunction
) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({
            success: false,
            message: 'ဖုန်းနံပါတ်နှင့် OTP ကုဒ်နံပါတ် ထည့်သွင်းရန် လိုအပ်ပါသည်'
        });
    }

    if (!validatePhoneNumber(phone)) {
        return res.status(400).json({
            success: false,
            message: 'ဖုန်းနံပါတ် မှားယွင်းနေပါသည်'
        });
    }

    if (!validateOTPFormat(otp)) {
        return res.status(400).json({
            success: false,
            message: 'OTP ကုဒ်နံပါတ် မှားယွင်းနေပါသည်'
        });
    }

    next();
}; 