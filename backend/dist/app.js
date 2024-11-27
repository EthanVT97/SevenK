"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const routes_1 = __importDefault(require("./routes"));
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
const websocket_service_1 = require("./services/websocket.service");
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize database and models before setting up routes
const initialize = async () => {
    try {
        // Test database connection
        await (0, database_1.testConnection)();
        // Initialize models
        await (0, database_1.initializeModels)();
        // Set up routes after database initialization
        app.use('/api', routes_1.default);
        // Handle WebSocket upgrade requests
        server.on('upgrade', (request, socket, head) => {
            var _a, _b;
            const userId = (_b = (_a = request.url) === null || _a === void 0 ? void 0 : _a.split('/')) === null || _b === void 0 ? void 0 : _b.pop();
            if (userId) {
                websocket_service_1.wsService.handleUpgrade(request, socket, head, userId);
            }
            else {
                socket.destroy();
            }
        });
        logger_1.logger.info('Application initialized successfully');
    }
    catch (error) {
        logger_1.logger.error('Application initialization failed:', error);
        process.exit(1);
    }
};
// Call initialize but don't wait for it
initialize();
