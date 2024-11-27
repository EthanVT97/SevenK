import { Router } from 'express';
import { register, login } from '../controllers/auth/auth.controller';
import { validateRegister, validateLogin } from '../middleware/validators/auth.validator';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

export default router; 