import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import {
    getPendingWithdrawals,
    approveWithdrawal,
    rejectWithdrawal
} from '../controllers/withdrawal.controller';
import { validateWithdrawalAction } from '../middleware/validators/withdrawal.validator';

const router = Router();

// Cast the handlers to RequestHandler to satisfy TypeScript
const handlers = {
    getPendingWithdrawals: getPendingWithdrawals as RequestHandler,
    approveWithdrawal: approveWithdrawal as RequestHandler,
    rejectWithdrawal: rejectWithdrawal as RequestHandler
};

// Admin routes for withdrawal management
router.get('/pending', authenticate, isAdmin, handlers.getPendingWithdrawals);
router.post('/approve/:transactionId', authenticate, isAdmin, validateWithdrawalAction, handlers.approveWithdrawal);
router.post('/reject/:transactionId', authenticate, isAdmin, validateWithdrawalAction, handlers.rejectWithdrawal);

export default router; 