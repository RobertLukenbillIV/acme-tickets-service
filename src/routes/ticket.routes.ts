import { Router } from 'express';
import { body } from 'express-validator';
import { TicketController } from '../controllers/ticket.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();
const ticketController = new TicketController();

router.use(authenticate);

router.post(
  '/',
  [body('title').notEmpty(), body('description').notEmpty(), validate],
  ticketController.createTicket.bind(ticketController)
);

router.get('/', ticketController.getTickets.bind(ticketController));

router.get('/:id', ticketController.getTicketById.bind(ticketController));

router.put('/:id', ticketController.updateTicket.bind(ticketController));

router.delete('/:id', ticketController.deleteTicket.bind(ticketController));

export default router;
