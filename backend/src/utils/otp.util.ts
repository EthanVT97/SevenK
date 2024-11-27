import { logger } from './logger';

export const generateOTP = async (phone: string): Promise<string> => {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
};

export const verifyOTP = async (phone: string, otp: string): Promise<boolean> => {
    // TODO: Implement actual OTP verification
    return true;
};

export const validatePhoneNumber = (phone: string): boolean => {
    // Myanmar phone number format
    const phoneRegex = /^(09|\+?959)\d{7,9}$/;
    return phoneRegex.test(phone);
};

export const validateOTPFormat = (otp: string): boolean => {
    return /^\d{6}$/.test(otp);
}; 