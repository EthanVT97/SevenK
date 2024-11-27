"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const withdrawal_controller_1 = require("../controllers/withdrawal.controller");
const withdrawal_validator_1 = require("../middleware/validators/withdrawal.validator");
const router = (0, express_1.Router)();
// Cast the handlers to RequestHandler to satisfy TypeScript
const handlers = {
    getPendingWithdrawals: withdrawal_controller_1.getPendingWithdrawals,
    approveWithdrawal: withdrawal_controller_1.approveWithdrawal,
    rejectWithdrawal: withdrawal_controller_1.rejectWithdrawal
};
// Admin routes for withdrawal management
router.get('/pending', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.getPendingWithdrawals);
router.post('/approve/:transactionId', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, withdrawal_validator_1.validateWithdrawalAction, handlers.approveWithdrawal);
router.post('/reject/:transactionId', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, withdrawal_validator_1.validateWithdrawalAction, handlers.rejectWithdrawal);
exports.default = router;
