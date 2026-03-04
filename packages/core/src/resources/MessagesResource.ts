import { HttpClient } from '../core/transport/HttpClient.js';
import { Message } from '../types/index.js';

export class MessagesResource {
    constructor(private readonly http: HttpClient) { }

    async list(roomId: string, options?: { limit?: number; before?: string }): Promise<Message[]> {
        const response = await this.http.get(`/chatrooms/${roomId}/messages`, {
            params: options
        } as any);
        return response.data;
    }

    async send(roomId: string, content: string): Promise<Message> {
        const response = await this.http.post(`/chatrooms/${roomId}/messages`, { content });
        return response.data;
    }
}
