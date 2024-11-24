import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import {
    createTicket,
    getTickets,
    updateTicketStatus
} from '../controllers/support.controller';
import { validateTicket } from '../middleware/validators/support.validator';

const router = Router();

// Cast handlers to RequestHandler
const handlers = {
    createTicket: createTicket as RequestHandler,
    getTickets: getTickets as RequestHandler,
    updateTicketStatus: updateTicketStatus as RequestHandler
};

router.post('/tickets', authenticate, validateTicket, handlers.createTicket);
router.get('/tickets', authenticate, handlers.getTickets);
router.put('/tickets/:ticketId/status', authenticate, isAdmin, handlers.updateTicketStatus);

export default router; 