export interface WSConfig {
    url: string;
    reconnect?: boolean;
    reconnectInterval?: number;
    maxRetries?: number;
}

export type WSEventHandler = (data: any) => void;

/**
 * A browser-compatible WebSocket client for Anonfly.
 * Handles reconnection, event emitting, and JSON serialization.
 */
export class WSClient {
    private ws: WebSocket | null = null;
    private retryCount = 0;
    private handlers: Map<string, Set<WSEventHandler>> = new Map();
    private reconnectTimeout: any = null;

    constructor(private config: WSConfig) { }

    connect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        try {
            this.ws = new WebSocket(this.config.url);

            this.ws.onopen = () => {
                this.retryCount = 0;
                this.emit('connected', null);
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.emit('message', message);

                    if (message.type) {
                        this.emit(message.type, message);
                    }

                    if (message.chatroomId) {
                        this.emit(`room:${message.chatroomId}`, message);
                    }
                } catch {
                    this.emit('message', event.data);
                }
            };

            this.ws.onclose = () => {
                this.emit('disconnected', null);
                if (this.config.reconnect && this.retryCount < (this.config.maxRetries || 10)) {
                    this.reconnect();
                }
            };

            this.ws.onerror = (error) => {
                this.emit('error', error);
            };
        } catch (error) {
            this.emit('error', error);
            if (this.config.reconnect) {
                this.reconnect();
            }
        }
    }

    private reconnect() {
        this.retryCount++;
        const delay = (this.config.reconnectInterval || 1000) * Math.min(this.retryCount, 30);
        this.reconnectTimeout = setTimeout(() => this.connect(), delay);
    }

    send(data: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
        } else {
            console.error('[WSClient] Cannot send message: WebSocket is not open', data);
        }
    }

    on(event: string, handler: WSEventHandler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event)!.add(handler);
    }

    off(event: string, handler: WSEventHandler) {
        this.handlers.get(event)?.delete(handler);
    }

    private emit(event: string, data: any) {
        this.handlers.get(event)?.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`[WSClient] Error in event handler for ${event}:`, error);
            }
        });
    }

    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.ws) {
            this.ws.onclose = null; // Prevent reconnect on intentional disconnect
            this.ws.close();
            this.ws = null;
        }
    }

    get readyState() {
        return this.ws?.readyState ?? WebSocket.CLOSED;
    }
}
