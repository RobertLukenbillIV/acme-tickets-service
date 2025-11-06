import { prisma } from '../config/database';
import { TicketStatus, TicketPriority, ActivityType, UserRole, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { CreateTicketRequest, UpdateTicketRequest } from '../contracts';
import { contractToPrismaStatus, contractToPrismaPriority } from '../utils/typeMappers';

export class TicketService {
  async createTicket(
    data: CreateTicketRequest & {
      tenantId: string;
      createdById: string;
      assignedToId?: string;
      metadata?: object;
    }
  ) {
    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: contractToPrismaPriority(data.priority),
        tenantId: data.tenantId,
        createdById: data.createdById,
        assignedToId: data.assignedToId,
        metadata: data.metadata || {},
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await prisma.ticketActivity.create({
      data: {
        ticketId: ticket.id,
        type: ActivityType.CREATED,
        changes: { createdBy: data.createdById },
      },
    });

    return ticket;
  }

  async getTickets(
    tenantId: string,
    filters?: {
      status?: TicketStatus;
      priority?: TicketPriority;
      createdById?: string;
    },
    userRole?: UserRole,
    userId?: string
  ) {
    // Build where clause based on role
    const whereClause: Prisma.TicketWhereInput = {
      tenantId,
      ...filters,
    };

    // USER role: only see tickets they created
    if (userRole === UserRole.USER && userId) {
      whereClause.createdById = userId;
    }
    // AGENT and ADMIN: see all tickets in tenant (no additional filter needed)

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tickets;
  }

  async getTicketById(id: string, tenantId: string, userRole?: UserRole, userId?: string) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        attachments: true,
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
    }

    // Check access based on role
    if (userRole === UserRole.USER && userId && ticket.createdById !== userId) {
      throw new AppError(403, 'Access denied to this ticket', 'FORBIDDEN');
    }

    return ticket;
  }

  async updateTicket(
    id: string,
    tenantId: string,
    data: UpdateTicketRequest & {
      assignedToId?: string;
      metadata?: object;
    },
    userRole?: UserRole,
    userId?: string
  ) {
    const ticket = await prisma.ticket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
    }

    // Check modification permissions based on role
    if (userRole === UserRole.USER && userId && ticket.createdById !== userId) {
      throw new AppError(403, 'You can only modify tickets you created', 'FORBIDDEN');
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.status && { status: contractToPrismaStatus(data.status) }),
        ...(data.priority && { priority: contractToPrismaPriority(data.priority) }),
        ...(data.assignedToId && { assignedToId: data.assignedToId }),
        ...(data.metadata && { metadata: data.metadata }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await prisma.ticketActivity.create({
      data: {
        ticketId: id,
        type: ActivityType.UPDATED,
        changes: data,
      },
    });

    return updated;
  }

  async deleteTicket(id: string, tenantId: string, userRole?: UserRole, userId?: string) {
    const ticket = await prisma.ticket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
    }

    // Only ADMIN can delete tickets (check scope for tickets:delete:any)
    if (userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'Only administrators can delete tickets', 'FORBIDDEN');
    }

    await prisma.ticket.delete({
      where: { id },
    });
  }
}
