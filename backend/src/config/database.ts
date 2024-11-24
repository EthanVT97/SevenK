import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

export const sequelize = new Sequelize({
    database: 'sevenk',
    username: 'root',
    password: '',
    host: '127.0.0.1',
    dialect: 'mysql',
    port: 3306,
    logging: (msg) => logger.debug(msg),
    dialectOptions: {
        connectTimeout: 60000,
        charset: 'utf8mb4'
    }
});

export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully');
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        throw error;
    }
};

export const initializeModels = async () => {
    try {
        // Import models
        const { default: UserModel } = await import('../models/user.model');
        const { default: BannerModel } = await import('../models/banner.model');

        // Sync all models
        await sequelize.sync({ alter: true });

        logger.info('Models synchronized successfully');
    } catch (error) {
        logger.error('Error synchronizing models:', error);
        throw error;
    }
}; 