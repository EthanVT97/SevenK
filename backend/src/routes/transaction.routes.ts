import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    getTransactionHistory,
    getTransactionDetails,
    exportTransactionHistory,
    getTransactionAnalytics
} from '../controllers/transaction.controller';

const router = Router();

// Cast the handlers to RequestHandler to satisfy TypeScript
const handlers = {
    getTransactionHistory: getTransactionHistory as RequestHandler,
    getTransactionDetails: getTransactionDetails as RequestHandler,
    exportTransactionHistory: exportTransactionHistory as RequestHandler,
    getTransactionAnalytics: getTransactionAnalytics as RequestHandler
};

// Routes with authentication
router.get('/history', authenticate, handlers.getTransactionHistory);
router.get('/details/:transactionId', authenticate, handlers.getTransactionDetails);
router.get('/export', authenticate, handlers.exportTransactionHistory);
router.get('/analytics', authenticate, handlers.getTransactionAnalytics);

export default router; 