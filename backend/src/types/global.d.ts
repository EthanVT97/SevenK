// Image declarations
declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.jpg' {
    const content: string;
    export default content;
}

declare module '*.jpeg' {
    const content: string;
    export default content;
}

declare module '*.gif' {
    const content: string;
    export default content;
}

declare module '*.svg' {
    const content: string;
    export default content;
}

// Font declarations
declare module '*.ttf' {
    const content: string;
    export default content;
}

declare module '*.woff' {
    const content: string;
    export default content;
}

declare module '*.woff2' {
    const content: string;
    export default content;
}

declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        PORT: string;
        DB_HOST: string;
        DB_USER: string;
        DB_PASSWORD: string;
        DB_NAME: string;
        JWT_SECRET: string;
        JWT_EXPIRY: string;
        TWILIO_ACCOUNT_SID: string;
        TWILIO_AUTH_TOKEN: string;
        TWILIO_PHONE_NUMBER: string;
    }
}

// API Response types
interface APIResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

// Auth types
interface LoginResponse {
    token: string;
    user: {
        id: number;
        name: string;
        phone: string;
        email?: string;
        walletBalance: number;
        status: string;
    };
}

// OTP types
interface OTPResponse {
    expiresIn: number;
    phone: string;
}

// Error types
interface APIError extends Error {
    statusCode?: number;
    code?: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                phone: string;
            };
        }
    }
}

export interface APIResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface OTPVerificationResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: number;
        phone: string;
    };
}

export interface ErrorResponse {
    success: false;
    message: string;
    error?: string;
} 