import { AuthResource } from './resources/AuthResource';
import { HttpClient } from './core/transport/HttpClient';
import { WebSocketClient } from './core/transport/WebSocketClient';
import { retryMiddleware } from './core/transport/retryMiddleware';
import { RoomsResource } from './resources/RoomsResource';
import { MessagesResource } from './resources/MessagesResource';

export * from './types/index';
export * from './core/errors/AnonflyError';
export * from './core/transport/HttpClient';
export * from './core/transport/WebSocketClient';
export * from './core/transport/retryMiddleware';
export * from './resources/RoomsResource';
export * from './resources/MessagesResource';
export * from './resources/AuthResource';

export interface AnonflyConfig {
    apiKey: string;
    baseUrl: string;
    wsUrl?: string;
    retries?: number;
}

export class Anonfly {
    public http: HttpClient;
    public ws?: WebSocketClient;

    constructor(private config: AnonflyConfig) {
        this.http = new HttpClient({
            baseUrl: this.config.baseUrl,
            headers: {
                'X-API-Key': this.config.apiKey,
            },
        });

        if (this.config.retries !== 0) {
            this.http.use(retryMiddleware({ maxRetries: this.config.retries }));
        }

        if (this.config.wsUrl) {
            this.ws = new WebSocketClient({
                url: this.config.wsUrl,
                reconnect: true,
            });
        }
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
}
