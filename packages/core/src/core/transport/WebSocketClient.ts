import { EventEmitter } from 'events';
import { WebSocket, type RawData } from 'ws';

export interface WsConfig {
    url: string;
    reconnect?: boolean;
    reconnectInterval?: number;
    maxRetries?: number;
}

export class WebSocketClient extends EventEmitter {
    private ws: WebSocket | null = null;
    private retryCount = 0;

    constructor(private config: WsConfig) {
        super();
    }

    connect() {
        this.ws = new WebSocket(this.config.url);

        this.ws.on('open', () => {
            this.retryCount = 0;
            this.emit('connected');
        });

        this.ws.on('message', (data: RawData) => {
            try {
                const message = JSON.parse(data.toString());
                this.emit('message', message);
            } catch {
                this.emit('message', data.toString());
            }
        });

        this.ws.on('close', () => {
            this.emit('disconnected');
            if (this.config.reconnect && this.retryCount < (this.config.maxRetries || 10)) {
                this.reconnect();
            }
        });

        this.ws.on('error', (error: Error) => {
            this.emit('error', error);
        });
    }

    private reconnect() {
        this.retryCount++;
        const delay = (this.config.reconnectInterval || 1000) * this.retryCount;
        setTimeout(() => this.connect(), delay);
    }

    send(data: any) {
        if (this.ws && this.ws.readyState === 1) { // 1 is WebSocket.OPEN
            this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
        } else {
            throw new Error('WebSocket is not connected');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
