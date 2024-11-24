import WebSocket from 'ws';
import { logger } from '../utils/logger';

class WebSocketService {
    private wss: WebSocket.Server;
    private clients: Map<string, WebSocket>;

    constructor() {
        this.wss = new WebSocket.Server({ noServer: true });
        this.clients = new Map();

        this.wss.on('connection', (ws: WebSocket, userId: string) => {
            this.clients.set(userId, ws);

            ws.on('close', () => {
                this.clients.delete(userId);
            });

            ws.on('error', (error) => {
                logger.error('WebSocket error:', error);
                this.clients.delete(userId);
            });
        });
    }

    public handleUpgrade(request: any, socket: any, head: any, userId: string) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss.emit('connection', ws, userId);
        });
    }

    public broadcast(message: any) {
        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    public sendToUser(userId: string, message: any) {
        const client = this.clients.get(userId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }

    public broadcastLotteryUpdate(data: any) {
        this.broadcast({
            type: 'LOTTERY_UPDATE',
            data
        });
    }

    public notifyWinner(userId: string, data: any) {
        this.sendToUser(userId, {
            type: 'LOTTERY_WIN',
            data
        });
    }
}

export const wsService = new WebSocketService(); 