import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateBet } from '../middleware/validators/lottery.validator';
import {
    getUpcomingDraws,
    placeBet,
    getBetHistory,
    submitLotteryResult,
    validateBetHistoryFilters,
    updateMultiplier,
} from '../controllers/lottery.controller';
import { isAdmin } from '../middleware/admin.middleware';
import { validateMultiplier } from '../middleware/validators/lottery.validator';

const router = Router();

// Cast handlers to RequestHandler
const handlers = {
    getUpcomingDraws: getUpcomingDraws as RequestHandler,
    placeBet: placeBet as RequestHandler,
    getBetHistory: getBetHistory as RequestHandler,
    submitLotteryResult: submitLotteryResult as RequestHandler,
    updateMultiplier: updateMultiplier as RequestHandler,
};

router.get('/draws', handlers.getUpcomingDraws);
router.post('/bet', authenticate, validateBet, handlers.placeBet);
router.get('/history', authenticate, validateBetHistoryFilters, handlers.getBetHistory);
router.post('/result/:lotteryId', authenticate, handlers.submitLotteryResult);
router.put('/multiplier/:lotteryId', authenticate, isAdmin, validateMultiplier, handlers.updateMultiplier);

export default router; 