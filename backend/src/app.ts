import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import routes from './routes';
import { testConnection, initializeModels } from './config/database';
import { logger } from './utils/logger';
import { wsService } from './services/websocket.service';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and models before setting up routes
const initialize = async () => {
    try {
        // Test database connection
        await testConnection();

        // Initialize models
        await initializeModels();

        // Set up routes after database initialization
        app.use('/api', routes);

        // Handle WebSocket upgrade requests
        server.on('upgrade', (request, socket, head) => {
            const userId = request.url?.split('/')?.pop();
            if (userId) {
                wsService.handleUpgrade(request, socket, head, userId);
            } else {
                socket.destroy();
            }
        });

        logger.info('Application initialized successfully');
    } catch (error) {
        logger.error('Application initialization failed:', error);
        process.exit(1);
    }
};

// Call initialize but don't wait for it
initialize();

export { app, server };
