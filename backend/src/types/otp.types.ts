export interface OTPAttributes {
    id: number;
    phone: string;
    otp: string;
    expiresAt: Date;
    attempts: number;
    lastResendAt: Date;
    isUsed: boolean;
}

export interface OTPCreationAttributes extends Omit<OTPAttributes, 'id'> { } 