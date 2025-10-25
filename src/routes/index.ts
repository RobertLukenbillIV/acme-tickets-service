import { Router } from 'express';
import authRoutes from './auth.routes';
import ticketRoutes from './ticket.routes';
import commentRoutes from './comment.routes';
import attachmentRoutes from './attachment.routes';
import webhookRoutes from './webhook.routes';
import tenantRoutes from './tenant.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/tickets', commentRoutes);
router.use('/tickets', attachmentRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/tenants', tenantRoutes);
router.use('/notifications', notificationRoutes);

export default router;
