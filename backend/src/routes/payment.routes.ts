import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validatePaymentCallback } from '../middleware/validators/wallet.validator';
import {
    handlePaymentCallback,
    handlePaymentNotification,
    checkPaymentStatus
} from '../controllers/payment.controller';
import { generateReceipt } from '../controllers/wallet.controller';

const router = Router();

// Cast the handlers to RequestHandler to satisfy TypeScript
const handlers = {
    handlePaymentCallback: handlePaymentCallback as RequestHandler,
    handlePaymentNotification: handlePaymentNotification as RequestHandler,
    checkPaymentStatus: checkPaymentStatus as RequestHandler,
    generateReceipt: generateReceipt as RequestHandler
};

router.post('/callback', validatePaymentCallback, handlers.handlePaymentCallback);
router.get('/status/:provider/:transactionId', authenticate, handlers.checkPaymentStatus);
router.get('/receipt/:transactionId', authenticate, handlers.generateReceipt);
router.post('/webhook/:provider', handlers.handlePaymentNotification);

export default router; 