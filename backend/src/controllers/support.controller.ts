import { Request, Response } from 'express';
import { supportService } from '../services/support.service';
import { logger } from '../utils/logger';

type AuthRequest = Request & Required<Pick<Request, 'user'>>;

export const createTicket = async (req: AuthRequest, res: Response) => {
    try {
        const { category, message } = req.body;
        const userId = req.user.id;

        const ticket = await supportService.createSupportTicket(userId, category, message);

        res.json({
            success: true,
            data: ticket
        });
    } catch (error) {
        logger.error('Create support ticket error:', error);
        res.status(500).json({
            success: false,
            message: res.locals.translate('error.general')
        });
    }
};

export const getTickets = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const tickets = await supportService.getSupportTickets(userId);

        res.json({
            success: true,
            data: tickets
        });
    } catch (error) {
        logger.error('Get support tickets error:', error);
        res.status(500).json({
            success: false,
            message: res.locals.translate('error.general')
        });
    }
};

export const updateTicketStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;

        await supportService.updateTicketStatus(parseInt(ticketId), status);

        res.json({
            success: true,
            message: res.locals.translate('support.ticket.updated')
        });
    } catch (error) {
        logger.error('Update ticket status error:', error);
        res.status(500).json({
            success: false,
            message: res.locals.translate('error.general')
        });
    }
}; 