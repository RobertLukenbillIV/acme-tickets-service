import { prisma } from '../config/database';
import { ActivityType } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

export class CommentService {
  async createComment(data: {
    content: string;
    ticketId: string;
    authorId: string;
    isInternal?: boolean;
    tenantId: string;
  }) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: data.ticketId,
        tenantId: data.tenantId,
      },
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        ticketId: data.ticketId,
        authorId: data.authorId,
        isInternal: data.isInternal || false,
      },
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
    });

    await prisma.ticketActivity.create({
      data: {
        ticketId: data.ticketId,
        type: ActivityType.COMMENTED,
        changes: { commentId: comment.id, authorId: data.authorId },
      },
    });

    return comment;
  }

  async getCommentsByTicket(ticketId: string, tenantId: string) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        tenantId,
      },
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
    }

    const comments = await prisma.comment.findMany({
      where: { ticketId },
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
    });

    return comments;
  }

  async updateComment(
    id: string,
    ticketId: string,
    tenantId: string,
    content: string,
    authorId: string
  ) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        tenantId,
      },
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
    }

    const comment = await prisma.comment.findFirst({
      where: {
        id,
        ticketId,
        authorId,
      },
    });

    if (!comment) {
      throw new AppError(
        404,
        'Comment not found or you are not authorized to update it',
        'NOT_FOUND'
      );
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { content },
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
    });

    return updated;
  }

  async deleteComment(id: string, ticketId: string, tenantId: string, authorId: string) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        tenantId,
      },
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
    }

    const comment = await prisma.comment.findFirst({
      where: {
        id,
        ticketId,
        authorId,
      },
    });

    if (!comment) {
      throw new AppError(
        404,
        'Comment not found or you are not authorized to delete it',
        'NOT_FOUND'
      );
    }

    await prisma.comment.delete({
      where: { id },
    });
  }
}
