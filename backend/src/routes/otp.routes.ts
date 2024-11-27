import { Router } from 'express';
import { verifyPhoneOTP, resendOTP } from '../controllers/otp/otp.controller';

const router = Router();

router.post('/verify', verifyPhoneOTP);
router.post('/resend', resendOTP);

export default router; 