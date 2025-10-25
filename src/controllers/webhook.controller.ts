import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { WebhookService } from '../services/webhook.service';

const webhookService = new WebhookService();

export class WebhookController {
  async createWebhook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const webhook = await webhookService.createWebhook({
        ...req.body,
        tenantId: req.user!.tenantId,
      });
      res.status(201).json(webhook);
    } catch (error) {
      next(error);
    }
  }

  async getWebhooks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const webhooks = await webhookService.getWebhooks(req.user!.tenantId);
      res.json(webhooks);
    } catch (error) {
      next(error);
    }
  }

  async updateWebhook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const webhook = await webhookService.updateWebhook(
        req.params.id,
        req.user!.tenantId,
        req.body
      );
      res.json(webhook);
    } catch (error) {
      next(error);
    }
  }

  async deleteWebhook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await webhookService.deleteWebhook(req.params.id, req.user!.tenantId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
