import { OTPVerification, OTPRequest } from '../types/auth';

const API_URL = 'your-api-endpoint';

export const otpService = {
    async sendOTP(request: OTPRequest): Promise<boolean> {
        const response = await fetch(`${API_URL}/auth/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error('Failed to send OTP');
        }

        return true;
    },

    async verifyOTP(verification: OTPVerification): Promise<boolean> {
        const response = await fetch(`${API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(verification),
        });

        if (!response.ok) {
            throw new Error('Invalid OTP');
        }

        return true;
    },
}; 