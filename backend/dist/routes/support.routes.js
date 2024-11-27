"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const support_controller_1 = require("../controllers/support.controller");
const support_validator_1 = require("../middleware/validators/support.validator");
const router = (0, express_1.Router)();
// Cast handlers to RequestHandler
const handlers = {
    createTicket: support_controller_1.createTicket,
    getTickets: support_controller_1.getTickets,
    updateTicketStatus: support_controller_1.updateTicketStatus
};
router.post('/tickets', auth_middleware_1.authenticate, support_validator_1.validateTicket, handlers.createTicket);
router.get('/tickets', auth_middleware_1.authenticate, handlers.getTickets);
router.put('/tickets/:ticketId/status', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, handlers.updateTicketStatus);
exports.default = router;
