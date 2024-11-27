"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketStatus = exports.getTickets = exports.createTicket = void 0;
const support_service_1 = require("../services/support.service");
const logger_1 = require("../utils/logger");
const createTicket = async (req, res) => {
    try {
        const { category, message } = req.body;
        const userId = req.user.id;
        const ticket = await support_service_1.supportService.createSupportTicket(userId, category, message);
        res.json({
            success: true,
            data: ticket
        });
    }
    catch (error) {
        logger_1.logger.error('Create support ticket error:', error);
        res.status(500).json({
            success: false,
            message: res.locals.translate('error.general')
        });
    }
};
exports.createTicket = createTicket;
const getTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const tickets = await support_service_1.supportService.getSupportTickets(userId);
        res.json({
            success: true,
            data: tickets
        });
    }
    catch (error) {
        logger_1.logger.error('Get support tickets error:', error);
        res.status(500).json({
            success: false,
            message: res.locals.translate('error.general')
        });
    }
};
exports.getTickets = getTickets;
const updateTicketStatus = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;
        await support_service_1.supportService.updateTicketStatus(parseInt(ticketId), status);
        res.json({
            success: true,
            message: res.locals.translate('support.ticket.updated')
        });
    }
    catch (error) {
        logger_1.logger.error('Update ticket status error:', error);
        res.status(500).json({
            success: false,
            message: res.locals.translate('error.general')
        });
    }
};
exports.updateTicketStatus = updateTicketStatus;
