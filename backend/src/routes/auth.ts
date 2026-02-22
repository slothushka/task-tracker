import { Router } from 'express';
import { signup, login } from '../controllers/authController';
import { validate, rules } from '../middleware/validate';

const router = Router();

router.post(
  '/signup',
  validate({ name: rules.name(), email: rules.email(), password: rules.password() }),
  signup
);

router.post(
  '/login',
  validate({ email: rules.email(), password: rules.password() }),
  login
);

export default router;
