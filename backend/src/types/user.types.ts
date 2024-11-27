export interface UserAttributes {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    password: string;
    walletBalance: number;
    status: UserStatus;
    lastLogin: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned';

export interface IUserCreate {
    name: string;
    phone: string;
    email?: string;
    password: string;
}

export interface IUserUpdate {
    name?: string;
    email?: string;
    status?: UserStatus;
} 