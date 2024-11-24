import { Router } from 'express';
import { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateTransaction } from '../middleware/validators/wallet.validator';
import {
    getWalletBalance,
    getTransactions,
    deposit,
    withdraw,
    initiateDeposit
} from '../controllers/wallet.controller';

const router = Router();

// Cast the handlers to RequestHandler to satisfy TypeScript
const handlers = {
    getWalletBalance: getWalletBalance as RequestHandler,
    getTransactions: getTransactions as RequestHandler,
    deposit: deposit as RequestHandler,
    withdraw: withdraw as RequestHandler,
    initiateDeposit: initiateDeposit as RequestHandler
};

// Routes with authentication and validation
router.get('/balance', authenticate, handlers.getWalletBalance);
router.get('/transactions', authenticate, handlers.getTransactions);
router.post('/deposit', authenticate, validateTransaction, handlers.deposit);
router.post('/withdraw', authenticate, validateTransaction, handlers.withdraw);
router.post('/deposit/initiate', authenticate, validateTransaction, handlers.initiateDeposit);

export default router; 