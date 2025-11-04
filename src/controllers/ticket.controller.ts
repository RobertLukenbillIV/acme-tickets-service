import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { TicketService } from '../services/ticket.service';
import { AppError } from '../middleware/errorHandler';
import {
  CreateTicketRequestSchema,
  UpdateTicketRequestSchema,
  PaginationQuerySchema,
  TicketStatusSchema,
} from '../contracts';
import { contractToPrismaPriority, contractToPrismaStatus } from '../utils/typeMappers';

const ticketService = new TicketService();

export class TicketController {
  async createTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Validate request body using contract schema
      const validatedData = CreateTicketRequestSchema.parse(req.body);

      const ticket = await ticketService.createTicket({
        ...validatedData,
        tenantId: req.user!.tenantId,
        createdById: req.user!.id,
      });
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new AppError(
          400,
          'Validation failed',
          'VALIDATION_ERROR',
          error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
        return next(validationError);
      }
      next(error);
    }
  }

  async getTickets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Validate pagination query parameters
      const querySchema = PaginationQuerySchema.extend({
        status: TicketStatusSchema.optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        createdById: z.string().uuid().optional(),
      });

      const validatedQuery = querySchema.parse({
        ...req.query,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      });

      // Extract only the filter fields that the service expects
      const { status, priority, createdById } = validatedQuery;
      const tickets = await ticketService.getTickets(req.user!.tenantId, {
        ...(status && { status: contractToPrismaStatus(status) }),
        ...(priority && { priority: contractToPrismaPriority(priority) }),
        createdById,
      });

      res.json(tickets);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new AppError(
          400,
          'Invalid query parameters',
          'VALIDATION_ERROR',
          error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
        return next(validationError);
      }
      next(error);
    }
  }

  async getTicketById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Validate UUID parameter
      const paramSchema = z.object({ id: z.string().uuid() });
      const { id } = paramSchema.parse(req.params);

      const ticket = await ticketService.getTicketById(id, req.user!.tenantId);
      res.json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new AppError(
          400,
          'Invalid ticket ID format',
          'VALIDATION_ERROR',
          error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
        return next(validationError);
      }
      next(error);
    }
  }

  async updateTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Validate parameters and body
      const paramSchema = z.object({ id: z.string().uuid() });
      const { id } = paramSchema.parse(req.params);
      const validatedData = UpdateTicketRequestSchema.parse(req.body);

      const ticket = await ticketService.updateTicket(id, req.user!.tenantId, validatedData);
      res.json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new AppError(
          400,
          'Validation failed',
          'VALIDATION_ERROR',
          error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
        return next(validationError);
      }
      next(error);
    }
  }

  async deleteTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Validate UUID parameter
      const paramSchema = z.object({ id: z.string().uuid() });
      const { id } = paramSchema.parse(req.params);

      await ticketService.deleteTicket(id, req.user!.tenantId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new AppError(
          400,
          'Invalid ticket ID format',
          'VALIDATION_ERROR',
          error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
        return next(validationError);
      }
      next(error);
    }
  }
}
