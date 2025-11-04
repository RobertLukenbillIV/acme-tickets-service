import { Router } from 'express';
import authRoutes from './auth.routes';
import ticketRoutes from './ticket.routes';
import commentRoutes from './comment.routes';
import attachmentRoutes from './attachment.routes';
import webhookRoutes from './webhook.routes';
import tenantRoutes from './tenant.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// API root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Tickets Service API',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      tickets: '/api/v1/tickets',
      webhooks: '/api/v1/webhooks',
      tenants: '/api/v1/tenants',
      notifications: '/api/v1/notifications',
      docs: '/api-docs',
    },
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/tickets', commentRoutes);
router.use('/tickets', attachmentRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/tenants', tenantRoutes);
router.use('/notifications', notificationRoutes);

export default router;
