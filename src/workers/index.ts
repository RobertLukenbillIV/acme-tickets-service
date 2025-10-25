import { logger } from '../utils/logger';
import { ticketQueue, notificationQueue, webhookQueue, slaQueue, closeQueues } from '../config/queue';
import { processTicketJob } from './ticket.worker';
import { processNotificationJob } from './notification.worker';
import { processWebhookJob } from './webhook.worker';
import { processSlaJob } from './sla.worker';

// Start all workers
export const startWorkers = () => {
  logger.info('Starting job queue workers...');

  // Ticket queue worker
  ticketQueue.process(async (job) => {
    logger.info(`Processing ticket job: ${job.name}`, { jobId: job.id, data: job.data });
    return processTicketJob(job);
  });

  // Notification queue worker
  notificationQueue.process(async (job) => {
    logger.info(`Processing notification job: ${job.name}`, { jobId: job.id, data: job.data });
    return processNotificationJob(job);
  });

  // Webhook queue worker
  webhookQueue.process(async (job) => {
    logger.info(`Processing webhook job: ${job.name}`, { jobId: job.id, data: job.data });
    return processWebhookJob(job);
  });

  // SLA queue worker
  slaQueue.process(async (job) => {
    logger.info(`Processing SLA job: ${job.name}`, { jobId: job.id, data: job.data });
    return processSlaJob(job);
  });

  logger.info('All job queue workers started successfully');
};

// Graceful shutdown handler
const shutdown = async () => {
  logger.info('Shutting down workers...');
  await closeQueues();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start workers if this file is run directly
if (require.main === module) {
  startWorkers();
  logger.info('Worker process is running. Press Ctrl+C to exit.');
}
