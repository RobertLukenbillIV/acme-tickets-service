import { Job } from 'bull';
import { ticketJobProcessor } from '../jobs/ticket.jobs';
import { logger } from '../utils/logger';

export const processTicketJob = async (job: Job) => {
  const { type, payload } = job.data;

  try {
    switch (type) {
      case 'TICKET_CREATED':
        await ticketJobProcessor.processTicketCreated(payload);
        break;

      case 'TICKET_UPDATED':
        await ticketJobProcessor.processTicketUpdated(payload);
        break;

      case 'COMMENT_ADDED':
        await ticketJobProcessor.processCommentAdded(payload);
        break;

      default:
        logger.warn(`Unknown ticket job type: ${type}`);
        break;
    }

    return { success: true, type };
  } catch (error) {
    logger.error(`Error processing ticket job ${type}:`, error);
    throw error; // Re-throw to trigger retry
  }
};
