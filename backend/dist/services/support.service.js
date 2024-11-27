"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportService = void 0;
const telegraf_1 = require("telegraf");
const viber_bot_1 = require("viber-bot");
const ws_1 = __importDefault(require("ws"));
const logger_1 = require("../utils/logger");
const language_service_1 = require("./language.service");
class SupportService {
    constructor() {
        this.liveChats = new Map();
        this.supportAgents = new Map();
        // Initialize Telegram bot
        this.telegramBot = new telegraf_1.Telegraf(process.env.TELEGRAM_BOT_TOKEN);
        this.initTelegramBot();
        // Initialize Viber bot
        this.viberBot = new viber_bot_1.ViberClient({
            authToken: process.env.VIBER_AUTH_TOKEN,
            name: "SevenK Support",
            avatar: "https://sevenk.com/support-avatar.jpg"
        });
        this.initViberBot();
    }
    initTelegramBot() {
        this.telegramBot.command('start', (ctx) => {
            var _a;
            const lang = ((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.language_code) === 'en' ? 'en' : 'my';
            ctx.reply(language_service_1.languageService.translate('support.welcome', lang));
        });
        this.telegramBot.on('message', async (ctx) => {
            var _a;
            try {
                const userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                const message = ctx.message && 'text' in ctx.message ? ctx.message.text : undefined;
                if (userId && message) {
                    await this.handleSupportMessage({
                        userId: userId,
                        message: message,
                        platform: 'telegram',
                        timestamp: new Date()
                    });
                }
            }
            catch (error) {
                logger_1.logger.error('Telegram message handling error:', error);
            }
        });
        this.telegramBot.launch();
    }
    initViberBot() {
        this.viberBot.on('message', async (message, response) => {
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
            }
            catch (error) {
                logger_1.logger.error('Viber message handling error:', error);
            }
        });
        this.viberBot.setWebhook(process.env.VIBER_WEBHOOK_URL);
    }
    handleWebSocketConnection(ws, userId, isAgent = false) {
        if (isAgent) {
            this.supportAgents.set(userId, ws);
            this.broadcastAgentStatus(userId, 'online');
        }
        else {
            this.liveChats.set(userId, ws);
        }
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                await this.handleSupportMessage({
                    userId: parseInt(userId),
                    message: data.message,
                    platform: 'chat',
                    timestamp: new Date(),
                    attachments: data.attachments
                });
            }
            catch (error) {
                logger_1.logger.error('WebSocket message handling error:', error);
            }
        });
        ws.on('close', () => {
            if (isAgent) {
                this.supportAgents.delete(userId);
                this.broadcastAgentStatus(userId, 'offline');
            }
            else {
                this.liveChats.delete(userId);
            }
        });
    }
    async handleSupportMessage(message) {
        try {
            // Store message in database
            await this.storeSupportMessage(message);
            // Route message to available agent
            await this.routeMessageToAgent(message);
            // Send automated response if no agent is available
            if (this.supportAgents.size === 0) {
                await this.sendAutomatedResponse(message);
            }
        }
        catch (error) {
            logger_1.logger.error('Support message handling error:', error);
        }
    }
    async storeSupportMessage(message) {
        // Implement message storage in database
    }
    async routeMessageToAgent(message) {
        // Find available agent and route message
        for (const [agentId, ws] of this.supportAgents) {
            if (ws.readyState === ws_1.default.OPEN) {
                ws.send(JSON.stringify({
                    type: 'support_message',
                    data: message
                }));
                break;
            }
        }
    }
    async sendAutomatedResponse(message) {
        const response = {
            type: 'automated_response',
            message: language_service_1.languageService.translate('support.automated_response', 'my'),
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
                if ((ws === null || ws === void 0 ? void 0 : ws.readyState) === ws_1.default.OPEN) {
                    ws.send(JSON.stringify(response));
                }
                break;
        }
    }
    broadcastAgentStatus(agentId, status) {
        const message = JSON.stringify({
            type: 'agent_status',
            agentId,
            status
        });
        this.liveChats.forEach(ws => {
            if (ws.readyState === ws_1.default.OPEN) {
                ws.send(message);
            }
        });
    }
    async createSupportTicket(userId, category, message) {
        // Implement ticket creation
        return {};
    }
    async getSupportTickets(userId) {
        // Implement ticket retrieval
        return [];
    }
    async updateTicketStatus(ticketId, status) {
        // Implement ticket status update
    }
}
exports.supportService = new SupportService();
