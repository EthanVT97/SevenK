import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { logger } from '../utils/logger';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, phone, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { phone } });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this phone number'
            });
        }

        // Create new user
        const user = await User.create({
            name,
            phone,
            email,
            password,
            walletBalance: 0,
            status: 'active'
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                status: user.status
            }
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            message: 'Error registering user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { phone, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                status: user.status
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            message: 'Error during login',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}; 