import { Router } from 'express';
import { body } from 'express-validator';
import { TenantController } from '../controllers/tenant.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '@prisma/client';

const router = Router();
const tenantController = new TenantController();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.post(
  '/',
  [body('name').notEmpty(), body('slug').notEmpty().isSlug(), validate],
  tenantController.createTenant.bind(tenantController)
);

router.get('/', tenantController.getTenants.bind(tenantController));

router.get('/:id', tenantController.getTenantById.bind(tenantController));

router.put('/:id', tenantController.updateTenant.bind(tenantController));

router.delete('/:id', tenantController.deleteTenant.bind(tenantController));

export default router;
