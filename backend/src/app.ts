import express from 'express';
import cors from 'cors';
import { initDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import otpRoutes from './routes/otp.routes';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase()
    .then(() => logger.info('Database initialized'))
    .catch((error: Error) => {
        logger.error('Database initialization failed:', error);
        process.exit(1);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

export default app;
