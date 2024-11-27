"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const lottery_validator_1 = require("../middleware/validators/lottery.validator");
const lottery_controller_1 = require("../controllers/lottery.controller");
const admin_middleware_1 = require("../middleware/admin.middleware");
const lottery_validator_2 = require("../middleware/validators/lottery.validator");
const router = (0, express_1.Router)();
// Cast handlers to RequestHandler
const handlers = {
    getUpcomingDraws: lottery_controller_1.getUpcomingDraws,
    placeBet: lottery_controller_1.placeBet,
    getBetHistory: lottery_controller_1.getBetHistory,
    submitLotteryResult: lottery_controller_1.submitLotteryResult,
    updateMultiplier: lottery_controller_1.updateMultiplier,
};
router.get('/draws', handlers.getUpcomingDraws);
router.post('/bet', auth_middleware_1.authenticate, lottery_validator_1.validateBet, handlers.placeBet);
router.get('/history', auth_middleware_1.authenticate, lottery_controller_1.validateBetHistoryFilters, handlers.getBetHistory);
router.post('/result/:lotteryId', auth_middleware_1.authenticate, handlers.submitLotteryResult);
router.put('/multiplier/:lotteryId', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, lottery_validator_2.validateMultiplier, handlers.updateMultiplier);
exports.default = router;
