export interface User {
    id: string;
    username: string;
    phoneNumber: string;
    role: 'user' | 'admin';
    balance?: number;
}

export interface LoginCredentials {
    phoneNumber: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}

export interface OTPVerification {
    phoneNumber: string;
    otpCode: string;
}

export interface OTPRequest {
    phoneNumber: string;
    action: 'register' | 'login' | 'reset';
} 