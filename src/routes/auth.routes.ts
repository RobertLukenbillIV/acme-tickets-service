import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();
const authController = new AuthController();

router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('tenantId').notEmpty(),
    validate,
  ],
  authController.register.bind(authController)
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty(), validate],
  authController.login.bind(authController)
);

router.get('/me', authenticate, authController.me.bind(authController));

export default router;
