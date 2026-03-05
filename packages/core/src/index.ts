import { AuthResource } from './resources/AuthResource';
import { HttpClient } from './core/transport/HttpClient';
import { WebSocketClient } from './core/transport/WebSocketClient';
import { retryMiddleware } from './core/transport/retryMiddleware';
import { RoomsResource } from './resources/RoomsResource';
import { MessagesResource } from './resources/MessagesResource';
import { AdminResource } from './resources/AdminResource';

export * from './types/index';
export * from './core/errors/AnonflyError';
export * from './core/transport/HttpClient';
export * from './core/transport/WebSocketClient';
export * from './core/transport/retryMiddleware';
export * from './resources/RoomsResource';
export * from './resources/MessagesResource';
export * from './resources/AuthResource';
export * from './resources/AdminResource';
export * from './crypto/encryption';
export * from './network/WSClient';

export const DEFAULT_BASE_URL = 'https://api.anonfly.com/v1';
export const DEFAULT_WS_URL = 'wss://api.anonfly.com/v1';

export interface AnonflyConfig {
    apiKey: string;
    baseUrl?: string;
    wsUrl?: string;
    retries?: number;
}

export class Anonfly {
    public http: HttpClient;
    public ws: WebSocketClient;

    constructor(public readonly config: AnonflyConfig) {
        const baseUrl = this.config.baseUrl || DEFAULT_BASE_URL;
        const wsUrl = this.config.wsUrl || DEFAULT_WS_URL;

        this.http = new HttpClient({
            baseUrl,
            headers: {
                'X-API-Key': this.config.apiKey,
            },
        });

        if (this.config.retries !== 0) {
            this.http.use(retryMiddleware({ maxRetries: this.config.retries }));
        }

        this.ws = new WebSocketClient({
            url: wsUrl,
            reconnect: true,
        });
    }

    public get rooms() {
        return new RoomsResource(this.http);
    }

    public get messages() {
        return new MessagesResource(this.http);
    }

    public get auth() {
        return new AuthResource(this.http);
    }

    public get admin() {
        return new AdminResource(this.http);
    }
}
