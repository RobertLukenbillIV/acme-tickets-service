import Queue from 'bull';
import { ticketQueue, notificationQueue, webhookQueue, getQueueHealth, QueueName } from '../../config/queue';

// Mock Bull
jest.mock('bull');

describe('Queue Configuration', () => {
  describe('Queue Initialization', () => {
    it('should initialize all queues', () => {
      expect(ticketQueue).toBeDefined();
      expect(notificationQueue).toBeDefined();
      expect(webhookQueue).toBeDefined();
    });

    it('should configure queues with correct names', () => {
      expect(Queue).toHaveBeenCalledWith(QueueName.TICKET, expect.any(Object));
      expect(Queue).toHaveBeenCalledWith(QueueName.NOTIFICATION, expect.any(Object));
      expect(Queue).toHaveBeenCalledWith(QueueName.WEBHOOK, expect.any(Object));
    });

    it('should configure retry policy', () => {
      const config = (Queue as jest.MockedClass<typeof Queue>).mock.calls[0][1] as any;
      expect(config.defaultJobOptions.attempts).toBe(3);
      expect(config.defaultJobOptions.backoff).toEqual({
        type: 'exponential',
        delay: 2000,
      });
    });
  });

  describe('Queue Health Check', () => {
    it('should return health status for all queues', async () => {
      // Mock queue methods
      const mockQueue = {
        getWaitingCount: jest.fn().mockResolvedValue(0),
        getActiveCount: jest.fn().mockResolvedValue(0),
        getCompletedCount: jest.fn().mockResolvedValue(10),
        getFailedCount: jest.fn().mockResolvedValue(0),
      };

      // Override queue instances
      Object.assign(ticketQueue, mockQueue);
      Object.assign(notificationQueue, mockQueue);
      Object.assign(webhookQueue, mockQueue);

      const health = await getQueueHealth();

      expect(health).toHaveLength(5); // All 5 queues
      expect(health[0]).toMatchObject({
        name: expect.any(String),
        status: 'healthy',
        waiting: 0,
        active: 0,
        completed: 10,
        failed: 0,
      });
    });

    it('should handle queue errors gracefully', async () => {
      // Mock queue error
      const mockQueue = {
        getWaitingCount: jest.fn().mockRejectedValue(new Error('Connection failed')),
        getActiveCount: jest.fn().mockRejectedValue(new Error('Connection failed')),
        getCompletedCount: jest.fn().mockRejectedValue(new Error('Connection failed')),
        getFailedCount: jest.fn().mockRejectedValue(new Error('Connection failed')),
      };

      Object.assign(ticketQueue, mockQueue);

      const health = await getQueueHealth();

      expect(health[0].status).toBe('unhealthy');
      expect(health[0].error).toBe('Connection failed');
    });
  });
});
