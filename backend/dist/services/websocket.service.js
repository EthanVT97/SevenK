"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsService = void 0;
const ws_1 = __importDefault(require("ws"));
const logger_1 = require("../utils/logger");
class WebSocketService {
    constructor() {
        this.wss = new ws_1.default.Server({ noServer: true });
        this.clients = new Map();
        this.wss.on('connection', (ws, userId) => {
            this.clients.set(userId, ws);
            ws.on('close', () => {
                this.clients.delete(userId);
            });
            ws.on('error', (error) => {
                logger_1.logger.error('WebSocket error:', error);
                this.clients.delete(userId);
            });
        });
    }
    handleUpgrade(request, socket, head, userId) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss.emit('connection', ws, userId);
        });
    }
    broadcast(message) {
        this.clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
    sendToUser(userId, message) {
        const client = this.clients.get(userId);
        if (client && client.readyState === ws_1.default.OPEN) {
            client.send(JSON.stringify(message));
        }
    }
    broadcastLotteryUpdate(data) {
        this.broadcast({
            type: 'LOTTERY_UPDATE',
            data
        });
    }
    notifyWinner(userId, data) {
        this.sendToUser(userId, {
            type: 'LOTTERY_WIN',
            data
        });
    }
}
exports.wsService = new WebSocketService();
