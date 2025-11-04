import { TicketService } from '../ticket.service';
import { prisma } from '../../config/database';
import { TicketPriority, TicketStatus } from '@prisma/client';

jest.mock('../../config/database', () => ({
  prisma: {
    ticket: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ticketActivity: {
      create: jest.fn(),
    },
  },
}));

describe('TicketService', () => {
  let ticketService: TicketService;

  beforeEach(() => {
    ticketService = new TicketService();
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should create a ticket successfully', async () => {
      const ticketData = {
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'medium' as const,
        tenantId: 'tenant-1',
        createdById: 'user-1',
      };

      const mockTicket = {
        id: 'ticket-1',
        title: ticketData.title,
        description: ticketData.description,
        tenantId: ticketData.tenantId,
        createdById: ticketData.createdById,
        status: TicketStatus.open,
        priority: TicketPriority.medium,
        assignedToId: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
        tenant: {
          id: 'tenant-1',
          name: 'Test Tenant',
        },
      };

      (prisma.ticket.create as jest.Mock).mockResolvedValue(mockTicket);
      (prisma.ticketActivity.create as jest.Mock).mockResolvedValue({});

      const result = await ticketService.createTicket(ticketData);

      expect(result).toEqual(mockTicket);
      expect(prisma.ticket.create).toHaveBeenCalledWith({
        data: {
          ...ticketData,
          metadata: {},
        },
        include: expect.any(Object),
      });
    });
  });

  describe('getTickets', () => {
    it('should return list of tickets for a tenant', async () => {
      const mockTickets = [
        {
          id: 'ticket-1',
          title: 'Test Ticket 1',
          description: 'Description 1',
          status: TicketStatus.open,
          tenantId: 'tenant-1',
        },
      ];

      (prisma.ticket.findMany as jest.Mock).mockResolvedValue(mockTickets);

      const result = await ticketService.getTickets('tenant-1');

      expect(result).toEqual(mockTickets);
      expect(prisma.ticket.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
