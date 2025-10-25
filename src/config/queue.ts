import Queue from 'bull';
import { config } from './env';
import { logger } from '../utils/logger';

// Queue configuration
const queueOptions = {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 seconds
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs for debugging
  },
};

// Define queue types
export enum QueueName {
  TICKET = 'ticket',
  NOTIFICATION = 'notification',
  WEBHOOK = 'webhook',
  SLA = 'sla',
  EMAIL = 'email',
}

// Initialize queues
export const ticketQueue = new Queue(QueueName.TICKET, queueOptions);
export const notificationQueue = new Queue(QueueName.NOTIFICATION, queueOptions);
export const webhookQueue = new Queue(QueueName.WEBHOOK, queueOptions);
export const slaQueue = new Queue(QueueName.SLA, queueOptions);
export const emailQueue = new Queue(QueueName.EMAIL, queueOptions);

// Queue event handlers
const setupQueueHandlers = (queue: Queue.Queue, name: string) => {
  queue.on('error', (error) => {
    logger.error(`Queue ${name} error:`, error);
  });

  queue.on('failed', (job, err) => {
    logger.error(`Job ${job.id} in queue ${name} failed:`, {
      jobId: job.id,
      error: err.message,
      attempts: job.attemptsMade,
      data: job.data,
    });
  });

  queue.on('stalled', (job) => {
    logger.warn(`Job ${job.id} in queue ${name} stalled`, {
      jobId: job.id,
      data: job.data,
    });
  });

  queue.on('completed', (job) => {
    logger.debug(`Job ${job.id} in queue ${name} completed`, {
      jobId: job.id,
      duration: job.finishedOn ? job.finishedOn - job.processedOn! : 0,
    });
  });
};

// Setup handlers for all queues
setupQueueHandlers(ticketQueue, QueueName.TICKET);
setupQueueHandlers(notificationQueue, QueueName.NOTIFICATION);
setupQueueHandlers(webhookQueue, QueueName.WEBHOOK);
setupQueueHandlers(slaQueue, QueueName.SLA);
setupQueueHandlers(emailQueue, QueueName.EMAIL);

// Graceful shutdown
export const closeQueues = async () => {
  logger.info('Closing job queues...');
  await Promise.all([
    ticketQueue.close(),
    notificationQueue.close(),
    webhookQueue.close(),
    slaQueue.close(),
    emailQueue.close(),
  ]);
  logger.info('All queues closed');
};

// Health check
export const getQueueHealth = async () => {
  const queues = [
    { name: QueueName.TICKET, queue: ticketQueue },
    { name: QueueName.NOTIFICATION, queue: notificationQueue },
    { name: QueueName.WEBHOOK, queue: webhookQueue },
    { name: QueueName.SLA, queue: slaQueue },
    { name: QueueName.EMAIL, queue: emailQueue },
  ];

  const health = await Promise.all(
    queues.map(async ({ name, queue }) => {
      try {
        const [waiting, active, completed, failed] = await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
        ]);

        return {
          name,
          status: 'healthy',
          waiting,
          active,
          completed,
          failed,
        };
      } catch (error) {
        return {
          name,
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
  );

  return health;
};

export default {
  ticketQueue,
  notificationQueue,
  webhookQueue,
  slaQueue,
  emailQueue,
  closeQueues,
  getQueueHealth,
};
