import { Telegraf, Context } from 'telegraf';
import { ViberClient, Message, Response } from 'viber-bot';
import WebSocket from 'ws';
import { logger } from '../utils/logger';
import { languageService } from './language.service';

interface SupportMessage {
    userId: number;
    message: string;
    platform: 'viber' | 'telegram' | 'chat';
    timestamp: Date;
    attachments?: string[];
}

interface SupportTicket {
    id: number;
    userId: number;
    status: 'open' | 'pending' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    category: 'deposit' | 'withdrawal' | 'game' | 'account' | 'other';
    messages: SupportMessage[];
    createdAt: Date;
    updatedAt: Date;
}

class SupportService {
    private telegramBot: Telegraf;
    private viberBot: ViberClient;
    private liveChats: Map<string, WebSocket> = new Map();
    private supportAgents: Map<string, WebSocket> = new Map();

    constructor() {
        // Initialize Telegram bot
        this.telegramBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
        this.initTelegramBot();

        // Initialize Viber bot
        this.viberBot = new ViberClient({
            authToken: process.env.VIBER_AUTH_TOKEN!,
            name: "SevenK Support",
            avatar: "https://sevenk.com/support-avatar.jpg"
        });
        this.initViberBot();
    }

    private initTelegramBot() {
        this.telegramBot.command('start', (ctx: Context) => {
            const lang = ctx.from?.language_code === 'en' ? 'en' : 'my';
            ctx.reply(languageService.translate('support.welcome', lang));
        });

        this.telegramBot.on('message', async (ctx: Context) => {
            try {
                const userId = ctx.from?.id;
                const message = ctx.message && 'text' in ctx.message ? ctx.message.text : undefined;

                if (userId && message) {
                    await this.handleSupportMessage({
                        userId: userId,
                        message: message,
                        platform: 'telegram',
                        timestamp: new Date()
                    });
                }
            } catch (error) {
                logger.error('Telegram message handling error:', error);
            }
        });

        this.telegramBot.launch();
    }

    private initViberBot() {
        this.viberBot.on('message', async (message: Message, response: Response) => {
            try {
                const userId = message.sender.id;
                const text = message.text;

                if (userId && text) {
                    await this.handleSupportMessage({
                        userId: parseInt(userId),
                        message: text,
                        platform: 'viber',
                        timestamp: new Date()
                    });
                }
            } catch (error) {
                logger.error('Viber message handling error:', error);
            }
        });

        this.viberBot.setWebhook(process.env.VIBER_WEBHOOK_URL!);
    }

    public handleWebSocketConnection(ws: WebSocket, userId: string, isAgent: boolean = false) {
        if (isAgent) {
            this.supportAgents.set(userId, ws);
            this.broadcastAgentStatus(userId, 'online');
        } else {
            this.liveChats.set(userId, ws);
        }

        ws.on('message', async (message: string) => {
            try {
                const data = JSON.parse(message);
                await this.handleSupportMessage({
                    userId: parseInt(userId),
                    message: data.message,
                    platform: 'chat',
                    timestamp: new Date(),
                    attachments: data.attachments
                });
            } catch (error) {
                logger.error('WebSocket message handling error:', error);
            }
        });

        ws.on('close', () => {
            if (isAgent) {
                this.supportAgents.delete(userId);
                this.broadcastAgentStatus(userId, 'offline');
            } else {
                this.liveChats.delete(userId);
            }
        });
    }

    private async handleSupportMessage(message: SupportMessage) {
        try {
            // Store message in database
            await this.storeSupportMessage(message);

            // Route message to available agent
            await this.routeMessageToAgent(message);

            // Send automated response if no agent is available
            if (this.supportAgents.size === 0) {
                await this.sendAutomatedResponse(message);
            }
        } catch (error) {
            logger.error('Support message handling error:', error);
        }
    }

    private async storeSupportMessage(message: SupportMessage) {
        // Implement message storage in database
    }

    private async routeMessageToAgent(message: SupportMessage) {
        // Find available agent and route message
        for (const [agentId, ws] of this.supportAgents) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'support_message',
                    data: message
                }));
                break;
            }
        }
    }

    private async sendAutomatedResponse(message: SupportMessage) {
        const response = {
            type: 'automated_response',
            message: languageService.translate('support.automated_response', 'my'),
            timestamp: new Date()
        };

        switch (message.platform) {
            case 'telegram':
                await this.telegramBot.telegram.sendMessage(message.userId, response.message);
                break;
            case 'viber':
                await this.viberBot.sendMessage({ id: message.userId.toString() }, response.message);
                break;
            case 'chat':
                const ws = this.liveChats.get(message.userId.toString());
                if (ws?.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(response));
                }
                break;
        }
    }

    private broadcastAgentStatus(agentId: string, status: 'online' | 'offline') {
        const message = JSON.stringify({
            type: 'agent_status',
            agentId,
            status
        });

        this.liveChats.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message);
            }
        });
    }

    public async createSupportTicket(userId: number, category: string, message: string): Promise<SupportTicket> {
        // Implement ticket creation
        return {} as SupportTicket;
    }

    public async getSupportTickets(userId: number): Promise<SupportTicket[]> {
        // Implement ticket retrieval
        return [];
    }

    public async updateTicketStatus(ticketId: number, status: string): Promise<void> {
        // Implement ticket status update
    }
}

export const supportService = new SupportService(); 