import request from 'supertest';
import { app } from '../app';
import { jest } from '@jest/globals';
import OTPUtil from '../utils/otp.util';
import User from '../models/user.model';
import { Model } from 'sequelize';

// Define proper mock types with correct validatePassword type
interface MockUserData {
    id: number;
    name: string;
    phone: string;
    email?: string;
    password: string;
    walletBalance: number;
    status: 'active' | 'inactive' | 'suspended';
    validatePassword: (password: string) => Promise<boolean>;
}

// Mock the models and utils
jest.mock('../utils/otp.util');
jest.mock('../models/user.model');

// Type the mocked functions
const mockedOTPUtil = OTPUtil as jest.Mocked<typeof OTPUtil>;
const mockedUser = User as jest.Mocked<typeof User>;

describe('Authentication Flow', () => {
    const testUser = {
        name: 'Test User',
        phone: '+959123456789',
        password: 'testPassword123'
    };

    let otpCode: string;
    let authToken: string;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock OTP methods with proper types
        mockedOTPUtil.generateOTP.mockReturnValue('123456');
        mockedOTPUtil.validatePhoneNumber.mockReturnValue(true);
        mockedOTPUtil.sendSMS.mockResolvedValue(true);
        mockedOTPUtil.verifyOTP.mockReturnValue(true);
    });

    test('Register new user', async () => {
        // Mock User.findOne with proper type
        mockedUser.findOne.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('OTP');
        expect(mockedOTPUtil.sendSMS).toHaveBeenCalledWith(testUser.phone, '123456');

        otpCode = '123456';
    });

    test('Verify OTP', async () => {
        // Create mock user with proper validatePassword type
        const mockUser = {
            id: 1,
            ...testUser,
            walletBalance: 0,
            status: 'active' as const,
            validatePassword: async (password: string) => Promise.resolve(true)
        } satisfies MockUserData;

        // Mock User.create with proper type
        mockedUser.create.mockResolvedValue(mockUser as any);

        const res = await request(app)
            .post('/api/auth/verify-otp')
            .send({
                phone: testUser.phone,
                otp: otpCode
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();

        authToken = res.body.data.token;
    });

    test('Login with valid credentials', async () => {
        // Create mock user with proper validatePassword type
        const mockUser = {
            id: 1,
            ...testUser,
            walletBalance: 0,
            status: 'active' as const,
            validatePassword: async (password: string) => Promise.resolve(true)
        } satisfies MockUserData;

        // Mock User.findOne with proper type
        mockedUser.findOne.mockResolvedValue(mockUser as any);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                phone: testUser.phone,
                password: testUser.password
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
    });

    test('Login with invalid credentials', async () => {
        // Create mock user with proper validatePassword type
        const mockUser = {
            id: 1,
            ...testUser,
            walletBalance: 0,
            status: 'active' as const,
            validatePassword: async (password: string) => Promise.resolve(false)
        } satisfies MockUserData;

        // Mock User.findOne with proper type
        mockedUser.findOne.mockResolvedValue(mockUser as any);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                phone: testUser.phone,
                password: 'wrongpassword'
            });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('လှားယွင်းနေပါသည်');
    });
}); 