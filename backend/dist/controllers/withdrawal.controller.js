"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processScheduledWithdrawals = exports.rejectWithdrawal = exports.approveWithdrawal = exports.getPendingWithdrawals = void 0;
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const logger_1 = require("../utils/logger");
const database_1 = require("../config/database");
// Get pending withdrawals
const getPendingWithdrawals = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const withdrawals = await transaction_model_1.default.findAndCountAll({
            where: {
                type: 'withdrawal',
                status: 'pending'
            },
            include: [{
                    model: user_model_1.default,
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
    }
    catch (error) {
        logger_1.logger.error('Get pending withdrawals error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending withdrawals'
        });
    }
};
exports.getPendingWithdrawals = getPendingWithdrawals;
// Approve withdrawal
const approveWithdrawal = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { transactionId } = req.params;
        const adminId = req.user.id;
        const withdrawal = await transaction_model_1.default.findOne({
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
    }
    catch (error) {
        await t.rollback();
        logger_1.logger.error('Withdrawal approval error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing withdrawal approval'
        });
    }
};
exports.approveWithdrawal = approveWithdrawal;
// Reject withdrawal
const rejectWithdrawal = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { transactionId } = req.params;
        const { rejectionReason } = req.body;
        const adminId = req.user.id;
        const withdrawal = await transaction_model_1.default.findOne({
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
        const user = await user_model_1.default.findByPk(withdrawal.userId, { transaction: t });
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
    }
    catch (error) {
        await t.rollback();
        logger_1.logger.error('Withdrawal rejection error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing withdrawal rejection'
        });
    }
};
exports.rejectWithdrawal = rejectWithdrawal;
// Add withdrawal processing schedule
const processScheduledWithdrawals = async () => {
    // Process approved withdrawals during banking hours
};
exports.processScheduledWithdrawals = processScheduledWithdrawals;
