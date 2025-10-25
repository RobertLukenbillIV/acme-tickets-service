import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TicketService } from '../services/ticket.service';

const ticketService = new TicketService();

export class TicketController {
  async createTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.createTicket({
        ...req.body,
        tenantId: req.user!.tenantId,
        createdById: req.user!.id,
      });
      res.status(201).json(ticket);
    } catch (error) {
      next(error);
    }
  }

  async getTickets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tickets = await ticketService.getTickets(req.user!.tenantId, req.query);
      res.json(tickets);
    } catch (error) {
      next(error);
    }
  }

  async getTicketById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.getTicketById(req.params.id, req.user!.tenantId);
      res.json(ticket);
    } catch (error) {
      next(error);
    }
  }

  async updateTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.updateTicket(req.params.id, req.user!.tenantId, req.body);
      res.json(ticket);
    } catch (error) {
      next(error);
    }
  }

  async deleteTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ticketService.deleteTicket(req.params.id, req.user!.tenantId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
