"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const wallet_validator_1 = require("../middleware/validators/wallet.validator");
const wallet_controller_1 = require("../controllers/wallet.controller");
const router = (0, express_1.Router)();
// Cast the handlers to RequestHandler to satisfy TypeScript
const handlers = {
    getWalletBalance: wallet_controller_1.getWalletBalance,
    getTransactions: wallet_controller_1.getTransactions,
    deposit: wallet_controller_1.deposit,
    withdraw: wallet_controller_1.withdraw,
    initiateDeposit: wallet_controller_1.initiateDeposit
};
// Routes with authentication and validation
router.get('/balance', auth_middleware_1.authenticate, handlers.getWalletBalance);
router.get('/transactions', auth_middleware_1.authenticate, handlers.getTransactions);
router.post('/deposit', auth_middleware_1.authenticate, wallet_validator_1.validateTransaction, handlers.deposit);
router.post('/withdraw', auth_middleware_1.authenticate, wallet_validator_1.validateTransaction, handlers.withdraw);
router.post('/deposit/initiate', auth_middleware_1.authenticate, wallet_validator_1.validateTransaction, handlers.initiateDeposit);
exports.default = router;
