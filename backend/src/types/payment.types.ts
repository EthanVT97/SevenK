export type PaymentProvider = 'kpay' | 'wavemoney' | 'kbzpay' | 'aya' | 'cb';

export interface PaymentMethod {
    id: number;
    provider: PaymentProvider;
    accountName: string;
    accountNumber: string;
    isActive: boolean;
}

export interface PaymentRequest {
    amount: number;
    provider: PaymentProvider;
    senderName: string;
    senderPhone: string;
    transactionId?: string;
}

export interface PaymentResponse {
    success: boolean;
    transactionId: string;
    message: string;
    status: 'pending' | 'completed' | 'failed';
} 