import { CommentService } from '../comment.service';
import { prisma } from '../../config/database';
import { mockComment } from '../../__tests__/helpers/mocks';

jest.mock('../../config/database', () => ({
  prisma: {
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ticket: {
      findFirst: jest.fn(),
    },
    ticketActivity: {
      create: jest.fn(),
    },
  },
}));

describe('CommentService', () => {
  let commentService: CommentService;
  const tenantId = 'tenant-123';
  const ticketId = 'ticket-123';

  beforeEach(() => {
    commentService = new CommentService();
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const commentData = {
        content: 'This is a test comment',
        ticketId,
        authorId: 'user-123',
        isInternal: false,
        tenantId,
      };

      const mockTicket = {
        id: ticketId,
        tenantId,
      };

      (prisma.ticket.findFirst as jest.Mock).mockResolvedValue(mockTicket);
      (prisma.comment.create as jest.Mock).mockResolvedValue({
        ...mockComment,
        content: commentData.content,
      });
      (prisma.ticketActivity.create as jest.Mock).mockResolvedValue({});

      const result = await commentService.createComment(commentData);

      expect(prisma.ticket.findFirst).toHaveBeenCalledWith({
        where: { id: ticketId, tenantId },
      });
      expect(result.content).toBe(commentData.content);
    });

    it('should throw error when ticket not found', async () => {
      (prisma.ticket.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        commentService.createComment({
          content: 'Test comment',
          ticketId: 'nonexistent-ticket',
          authorId: 'user-123',
          isInternal: false,
          tenantId,
        })
      ).rejects.toThrow('Ticket not found');
    });
  });

  describe('getCommentsByTicket', () => {
    it('should return all comments for a ticket', async () => {
      const mockComments = [
        { ...mockComment, id: 'comment-1', content: 'Comment 1' },
        { ...mockComment, id: 'comment-2', content: 'Comment 2' },
      ];

      const mockTicket = { id: ticketId, tenantId };
      (prisma.ticket.findFirst as jest.Mock).mockResolvedValue(mockTicket);
      (prisma.comment.findMany as jest.Mock).mockResolvedValue(mockComments);

      const result = await commentService.getCommentsByTicket(ticketId, tenantId);

      expect(result).toHaveLength(2);
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { ticketId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
