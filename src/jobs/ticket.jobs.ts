import { NotificationService } from '../services/notification.service';
import { WebhookService } from '../services/webhook.service';
import { NotificationType, WebhookEvent } from '@prisma/client';
import { logger } from '../utils/logger';

const notificationService = new NotificationService();
const webhookService = new WebhookService();

export interface TicketCreatedPayload {
  ticketId: string;
  title: string;
  tenantId: string;
  createdById: string;
  assignedToId?: string;
}

export interface TicketUpdatedPayload {
  ticketId: string;
  title: string;
  tenantId: string;
  changes: Record<string, unknown>;
}

export interface CommentAddedPayload {
  ticketId: string;
  commentId: string;
  tenantId: string;
  authorId: string;
}

export class TicketJobProcessor {
  async processTicketCreated(payload: TicketCreatedPayload) {
    try {
      logger.info(`Processing ticket created job for ticket ${payload.ticketId}`);

      // Send notification to assigned user if exists
      if (payload.assignedToId) {
        await notificationService.createNotification({
          type: NotificationType.TICKET_ASSIGNED,
          userId: payload.assignedToId,
          title: 'New ticket assigned to you',
          message: `You have been assigned to ticket: ${payload.title}`,
          data: { ticketId: payload.ticketId },
        });
      }

      // Trigger webhooks
      await webhookService.triggerWebhooks(payload.tenantId, WebhookEvent.TICKET_CREATED, {
        ticketId: payload.ticketId,
        title: payload.title,
        createdBy: payload.createdById,
      });

      logger.info(`Successfully processed ticket created job for ticket ${payload.ticketId}`);
    } catch (error) {
      logger.error(`Failed to process ticket created job:`, error);
      throw error;
    }
  }

  async processTicketUpdated(payload: TicketUpdatedPayload) {
    try {
      logger.info(`Processing ticket updated job for ticket ${payload.ticketId}`);

      // Trigger webhooks
      await webhookService.triggerWebhooks(payload.tenantId, WebhookEvent.TICKET_UPDATED, {
        ticketId: payload.ticketId,
        title: payload.title,
        changes: payload.changes,
      });

      logger.info(`Successfully processed ticket updated job for ticket ${payload.ticketId}`);
    } catch (error) {
      logger.error(`Failed to process ticket updated job:`, error);
      throw error;
    }
  }

  async processCommentAdded(payload: CommentAddedPayload) {
    try {
      logger.info(
        `Processing comment added job for ticket ${payload.ticketId}, comment ${payload.commentId}`
      );

      // Trigger webhooks
      await webhookService.triggerWebhooks(payload.tenantId, WebhookEvent.COMMENT_ADDED, {
        ticketId: payload.ticketId,
        commentId: payload.commentId,
        authorId: payload.authorId,
      });

      logger.info(
        `Successfully processed comment added job for ticket ${payload.ticketId}, comment ${payload.commentId}`
      );
    } catch (error) {
      logger.error(`Failed to process comment added job:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const ticketJobProcessor = new TicketJobProcessor();
