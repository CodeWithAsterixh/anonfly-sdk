import { HttpClient } from '../core/transport/HttpClient.js';
import { Message } from '../types/index.js';

export class MessagesResource {
    constructor(private http: HttpClient) { }

    async list(roomId: string): Promise<Message[]> {
        return this.http.get(`/rooms/${roomId}/messages`);
    }

    async send(roomId: string, content: string): Promise<Message> {
        return this.http.post(`/rooms/${roomId}/messages`, { content });
    }

    async edit(messageId: string, content: string): Promise<Message> {
        return this.http.put(`/messages/${messageId}`, { content });
    }

    async delete(messageId: string): Promise<void> {
        return this.http.delete(`/messages/${messageId}`);
    }
}
