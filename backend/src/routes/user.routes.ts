import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateUpdateProfile } from '../middleware/validators/user.validator';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateUpdateProfile, updateProfile);

export default router; 