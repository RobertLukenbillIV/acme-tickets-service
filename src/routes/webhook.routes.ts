import { Router } from 'express';
import { body } from 'express-validator';
import { WebhookController } from '../controllers/webhook.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '@prisma/client';

const router = Router();
const webhookController = new WebhookController();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.AGENT));

router.post(
  '/',
  [body('url').isURL(), body('events').isArray(), body('secret').notEmpty(), validate],
  webhookController.createWebhook.bind(webhookController)
);

router.get('/', webhookController.getWebhooks.bind(webhookController));

router.put('/:id', webhookController.updateWebhook.bind(webhookController));

router.delete('/:id', webhookController.deleteWebhook.bind(webhookController));

export default router;
