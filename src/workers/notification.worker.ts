import { Job } from 'bull';
import { NotificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

const notificationService = new NotificationService();

export const processNotificationJob = async (job: Job) => {
  const { type, data } = job.data;

  try {
    switch (type) {
      case 'CREATE_NOTIFICATION':
        await notificationService.createNotification(data);
        break;

      case 'SEND_EMAIL':
        // TODO: Implement email sending when email service is added
        logger.info('Email sending not yet implemented', { data });
        break;

      default:
        logger.warn(`Unknown notification job type: ${type}`);
        break;
    }

    return { success: true, type };
  } catch (error) {
    logger.error(`Error processing notification job ${type}:`, error);
    throw error; // Re-throw to trigger retry
  }
};
