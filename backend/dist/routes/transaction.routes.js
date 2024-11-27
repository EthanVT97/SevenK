"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const transaction_controller_1 = require("../controllers/transaction.controller");
const router = (0, express_1.Router)();
// Cast the handlers to RequestHandler to satisfy TypeScript
const handlers = {
    getTransactionHistory: transaction_controller_1.getTransactionHistory,
    getTransactionDetails: transaction_controller_1.getTransactionDetails,
    exportTransactionHistory: transaction_controller_1.exportTransactionHistory,
    getTransactionAnalytics: transaction_controller_1.getTransactionAnalytics
};
// Routes with authentication
router.get('/history', auth_middleware_1.authenticate, handlers.getTransactionHistory);
router.get('/details/:transactionId', auth_middleware_1.authenticate, handlers.getTransactionDetails);
router.get('/export', auth_middleware_1.authenticate, handlers.exportTransactionHistory);
router.get('/analytics', auth_middleware_1.authenticate, handlers.getTransactionAnalytics);
exports.default = router;
