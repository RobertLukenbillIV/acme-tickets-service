import { prisma } from '../config/database';
import { NotificationType } from '@prisma/client';
import { logger } from '../utils/logger';

export class NotificationService {
  async createNotification(data: {
    type: NotificationType;
    userId: string;
    title: string;
    message: string;
    data?: object;
  }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          type: data.type,
          userId: data.userId,
          title: data.title,
          message: data.message,
          data: data.data || {},
        },
      });

      logger.info(`Notification created for user ${data.userId}: ${data.title}`);
      return notification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications;
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });
  }
}
