import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/user.model';
import TransactionModel from '../models/transaction.model';
import { logger } from '../utils/logger';
import { sequelize } from '../config/database';
import { paymentService } from '../services/payment.service';
import { PaymentProvider, PaymentRequest } from '../types/payment.types';
import { Op } from 'sequelize';

// Use the globally extended Request type
type AuthRequest = Request & Required<Pick<Request, 'user'>>;

export const getWalletBalance = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            balance: user.walletBalance
        });
    } catch (error) {
        logger.error('Get wallet balance error:', error);
        res.status(500).json({
            message: 'Error getting wallet balance',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const transactions = await TransactionModel.findAndCountAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            data: {
                transactions: transactions.rows,
                total: transactions.count,
                page,
                totalPages: Math.ceil(transactions.count / limit)
            }
        });
    } catch (error) {
        logger.error('Get transactions error:', error);
        res.status(500).json({
            message: 'Error getting transactions',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const deposit = async (req: Request, res: Response) => {
    const t: Transaction = await sequelize.transaction();
    try {
        const userId = req.user?.id;
        const { amount } = req.body;

        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: 'User not found' });
        }

        // Create transaction record with category
        const transaction = await TransactionModel.create({
            userId: userId!,
            type: 'deposit',
            category: 'deposit',
            amount,
            status: 'completed',
            reference: uuidv4(),
            description: 'Wallet deposit'
        });

        // Update user's wallet balance
        await user.increment('walletBalance', {
            by: amount,
            transaction: t
        });

        await t.commit();

        res.json({
            success: true,
            message: 'Deposit successful',
            data: {
                transaction,
                newBalance: user.walletBalance + amount
            }
        });
    } catch (error) {
        await t.rollback();
        logger.error('Deposit error:', error);
        res.status(500).json({
            message: 'Error processing deposit',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const withdraw = async (req: Request, res: Response) => {
    const t: Transaction = await sequelize.transaction();
    try {
        const userId = req.user?.id;
        const { amount } = req.body;

        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.walletBalance < amount) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Create transaction record with category
        const transaction = await TransactionModel.create({
            userId: userId!,
            type: 'withdrawal',
            category: 'withdrawal',
            amount,
            status: 'completed',
            reference: uuidv4(),
            description: 'Wallet withdrawal'
        });

        // Update user's wallet balance
        await user.decrement('walletBalance', {
            by: amount,
            transaction: t
        });

        await t.commit();

        res.json({
            success: true,
            message: 'Withdrawal successful',
            data: {
                transaction,
                newBalance: user.walletBalance - amount
            }
        });
    } catch (error) {
        await t.rollback();
        logger.error('Withdrawal error:', error);
        res.status(500).json({
            message: 'Error processing withdrawal',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const initiateDeposit = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { amount, provider, senderName, senderPhone, transactionId } = req.body;

        // Validate payment provider
        if (!['kpay', 'wavemoney', 'kbzpay', 'aya', 'cb'].includes(provider)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment provider'
            });
        }

        const paymentRequest: PaymentRequest = {
            amount,
            provider: provider as PaymentProvider,
            senderName,
            senderPhone,
            transactionId
        };

        // Process payment through the selected provider
        const paymentResponse = await paymentService.processPayment(provider as PaymentProvider, paymentRequest);

        if (paymentResponse.success) {
            // Create pending transaction with category
            const transaction = await TransactionModel.create({
                userId: userId!,
                type: 'deposit',
                category: 'deposit',
                amount,
                status: 'pending',
                reference: paymentResponse.transactionId,
                description: `Deposit via ${provider.toUpperCase()}`
            });

            res.json({
                success: true,
                message: 'Deposit initiated successfully',
                data: {
                    transaction,
                    paymentDetails: paymentResponse
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment processing failed',
                error: paymentResponse.message
            });
        }
    } catch (error) {
        logger.error('Deposit initiation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error initiating deposit',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const generateReceipt = async (req: AuthRequest, res: Response) => {
    try {
        const { transactionId } = req.params;

        const transaction = await TransactionModel.findOne({
            where: { reference: transactionId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'phone', 'email']
            }]
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Use type assertion to access the included user data
        const transactionWithUser = transaction as TransactionModel & {
            user: User;
        };

        const receipt = {
            receiptNo: `RCP${transaction.id.toString().padStart(6, '0')}`,
            date: transaction.createdAt,
            transactionId: transaction.reference,
            type: transaction.type,
            amount: transaction.amount,
            status: transaction.status,
            customerName: transactionWithUser.user.name,
            customerPhone: transactionWithUser.user.phone,
            description: transaction.description
        };

        res.json({
            success: true,
            data: receipt
        });
    } catch (error) {
        logger.error('Receipt generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating receipt'
        });
    }
};

export const getTransactionHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const {
            startDate,
            endDate,
            type,
            status,
            page = 1,
            limit = 10
        } = req.query;

        const where: any = { userId };

        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
            };
        }

        if (type) where.type = type;
        if (status) where.status = status;

        const transactions = await TransactionModel.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset: (Number(page) - 1) * Number(limit)
        });

        res.json({
            success: true,
            data: {
                transactions: transactions.rows,
                total: transactions.count,
                page: Number(page),
                totalPages: Math.ceil(transactions.count / Number(limit))
            }
        });
    } catch (error) {
        logger.error('Transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction history'
        });
    }
};