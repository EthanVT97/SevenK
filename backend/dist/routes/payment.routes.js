"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const wallet_validator_1 = require("../middleware/validators/wallet.validator");
const payment_controller_1 = require("../controllers/payment.controller");
const wallet_controller_1 = require("../controllers/wallet.controller");
const router = (0, express_1.Router)();
// Cast the handlers to RequestHandler to satisfy TypeScript
const handlers = {
    handlePaymentCallback: payment_controller_1.handlePaymentCallback,
    handlePaymentNotification: payment_controller_1.handlePaymentNotification,
    checkPaymentStatus: payment_controller_1.checkPaymentStatus,
    generateReceipt: wallet_controller_1.generateReceipt
};
router.post('/callback', wallet_validator_1.validatePaymentCallback, handlers.handlePaymentCallback);
router.get('/status/:provider/:transactionId', auth_middleware_1.authenticate, handlers.checkPaymentStatus);
router.get('/receipt/:transactionId', auth_middleware_1.authenticate, handlers.generateReceipt);
router.post('/webhook/:provider', handlers.handlePaymentNotification);
exports.default = router;
