import { app } from './app';
import { logger } from './utils/logger';
import bannerRoutes from './routes/banner.routes';

const PORT = process.env.PORT || 5000;

app.use('/api/banners', bannerRoutes);

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
}); 