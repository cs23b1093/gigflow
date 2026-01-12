import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController';
import { registerValidation, loginValidation } from '../validators/authValidators';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;