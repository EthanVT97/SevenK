import { Router } from 'express';
import authRoutes from './auth.routes';
import bannerRoutes from './banner.routes';
import adminRoutes from './admin.routes';
import walletRoutes from './wallet.routes';
import transactionRoutes from './transaction.routes';
import supportRoutes from './support.routes';
import paymentRoutes from './payment.routes';
import withdrawalRoutes from './withdrawal.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/banners', bannerRoutes);
router.use('/admin', adminRoutes);
router.use('/wallet', walletRoutes);
router.use('/transactions', transactionRoutes);
router.use('/support', supportRoutes);
router.use('/payments', paymentRoutes);
router.use('/withdrawals', withdrawalRoutes);

export default router; 