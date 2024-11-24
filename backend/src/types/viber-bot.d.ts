declare module 'viber-bot' {
    export interface ViberClientOptions {
        authToken: string;
        name: string;
        avatar?: string;
    }

    export interface Message {
        sender: {
            id: string;
        };
        text: string;
    }

    export interface Response {
        send: (message: string) => Promise<void>;
    }

    export class ViberClient {
        constructor(options: ViberClientOptions);
        on(event: string, callback: (message: Message, response: Response) => void): void;
        sendMessage(user: { id: string }, message: string): Promise<void>;
        setWebhook(url: string): Promise<void>;
    }
} 