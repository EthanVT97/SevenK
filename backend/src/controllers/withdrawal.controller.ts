import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import TransactionModel from '../models/transaction.model';
import User from '../models/user.model';
import { logger } from '../utils/logger';
import { sequelize } from '../config/database';

// Use the globally extended Request type
type AuthRequest = Request & Required<Pick<Request, 'user'>>;

// Get pending withdrawals
export const getPendingWithdrawals = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const withdrawals = await TransactionModel.findAndCountAll({
            where: {
                type: 'withdrawal',
                status: 'pending'
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'phone', 'email']
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            data: {
                withdrawals: withdrawals.rows,
                total: withdrawals.count,
                page,
                totalPages: Math.ceil(withdrawals.count / limit)
            }
        });
    } catch (error) {
        logger.error('Get pending withdrawals error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending withdrawals'
        });
    }
};

// Approve withdrawal
export const approveWithdrawal = async (req: AuthRequest, res: Response) => {
    const t: Transaction = await sequelize.transaction();

    try {
        const { transactionId } = req.params;
        const adminId = req.user.id;

        const withdrawal = await TransactionModel.findOne({
            where: {
                id: transactionId,
                type: 'withdrawal',
                status: 'pending'
            },
            transaction: t
        });

        if (!withdrawal) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Withdrawal request not found or already processed'
            });
        }

        // Update withdrawal status
        await withdrawal.update({
            status: 'approved',
            approvedBy: adminId,
            approvedAt: new Date()
        }, { transaction: t });

        await t.commit();

        res.json({
            success: true,
            message: 'Withdrawal approved successfully'
        });
    } catch (error) {
        await t.rollback();
        logger.error('Withdrawal approval error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing withdrawal approval'
        });
    }
};

// Reject withdrawal
export const rejectWithdrawal = async (req: AuthRequest, res: Response) => {
    const t: Transaction = await sequelize.transaction();

    try {
        const { transactionId } = req.params;
        const { rejectionReason } = req.body;
        const adminId = req.user.id;

        const withdrawal = await TransactionModel.findOne({
            where: {
                id: transactionId,
                type: 'withdrawal',
                status: 'pending'
            },
            transaction: t
        });

        if (!withdrawal) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Withdrawal request not found or already processed'
            });
        }

        // Get user to refund the amount
        const user = await User.findByPk(withdrawal.userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update withdrawal status
        await withdrawal.update({
            status: 'rejected',
            approvedBy: adminId,
            approvedAt: new Date(),
            rejectionReason
        }, { transaction: t });

        // Refund the amount to user's wallet
        await user.increment('walletBalance', {
            by: withdrawal.amount,
            transaction: t
        });

        await t.commit();

        res.json({
            success: true,
            message: 'Withdrawal rejected and amount refunded'
        });
    } catch (error) {
        await t.rollback();
        logger.error('Withdrawal rejection error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing withdrawal rejection'
        });
    }
};

// Add withdrawal processing schedule
export const processScheduledWithdrawals = async () => {
    // Process approved withdrawals during banking hours
}; 