import { Job } from 'bull';
import { WebhookService } from '../services/webhook.service';
import { WebhookEvent } from '@prisma/client';
import { logger } from '../utils/logger';

const webhookService = new WebhookService();

export const processWebhookJob = async (job: Job) => {
  const { tenantId, event, payload } = job.data;

  try {
    // Trigger webhooks for this event
    await webhookService.triggerWebhooks(tenantId, event as WebhookEvent, payload);

    return { success: true, tenantId, event };
  } catch (error) {
    logger.error(`Error processing webhook job for tenant ${tenantId}:`, error);
    throw error; // Re-throw to trigger retry
  }
};
