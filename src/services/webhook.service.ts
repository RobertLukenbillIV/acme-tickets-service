import { prisma } from '../config/database';
import { WebhookEvent } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';

export class WebhookService {
  async createWebhook(data: {
    tenantId: string;
    url: string;
    events: WebhookEvent[];
    secret: string;
  }) {
    const webhook = await prisma.webhook.create({
      data,
    });

    return webhook;
  }

  async getWebhooks(tenantId: string) {
    const webhooks = await prisma.webhook.findMany({
      where: { tenantId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return webhooks;
  }

  async updateWebhook(
    id: string,
    tenantId: string,
    data: {
      url?: string;
      events?: WebhookEvent[];
      isActive?: boolean;
    }
  ) {
    const webhook = await prisma.webhook.findFirst({
      where: { id, tenantId },
    });

    if (!webhook) {
      throw new AppError(404, 'Webhook not found', 'NOT_FOUND');
    }

    const updated = await prisma.webhook.update({
      where: { id },
      data,
    });

    return updated;
  }

  async deleteWebhook(id: string, tenantId: string) {
    const webhook = await prisma.webhook.findFirst({
      where: { id, tenantId },
    });

    if (!webhook) {
      throw new AppError(404, 'Webhook not found', 'NOT_FOUND');
    }

    await prisma.webhook.delete({
      where: { id },
    });
  }

  generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  async triggerWebhooks(tenantId: string, event: WebhookEvent, payload: object) {
    const webhooks = await prisma.webhook.findMany({
      where: {
        tenantId,
        isActive: true,
        events: {
          has: event,
        },
      },
    });

    const deliveries = webhooks.map(
      async (webhook: { id: string; url: string; secret: string }) => {
        const payloadString = JSON.stringify(payload);
        const signature = this.generateSignature(payloadString, webhook.secret);

        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': signature,
            },
            body: payloadString,
          });

          await prisma.webhookDelivery.create({
            data: {
              webhookId: webhook.id,
              event,
              payload,
              statusCode: response.status,
              response: await response.text(),
              success: response.ok,
              attempts: 1,
              deliveredAt: new Date(),
            },
          });

          return { webhookId: webhook.id, success: response.ok };
        } catch (error) {
          await prisma.webhookDelivery.create({
            data: {
              webhookId: webhook.id,
              event,
              payload,
              success: false,
              attempts: 1,
              response: error instanceof Error ? error.message : 'Unknown error',
            },
          });

          return { webhookId: webhook.id, success: false };
        }
      }
    );

    return Promise.all(deliveries);
  }
}
