import { HttpClient } from '../core/transport/HttpClient.js';
import { Room, RoomDetails } from '../types/index.js';

export class RoomsResource {
    constructor(private readonly http: HttpClient) { }

    async list(region?: string): Promise<Room[]> {
        const response = await this.http.get('/chatrooms', {
            params: region ? { region } : undefined
        } as any);
        return response.data;
    }

    async create(data: { roomname: string; isPrivate?: boolean; description?: string; password?: string }): Promise<Room> {
        const response = await this.http.post('/chatrooms', data);
        return response.data;
    }

    async get(id: string): Promise<RoomDetails> {
        const response = await this.http.get(`/chatroom/${id}/details`);
        return response.data;
    }

    async join(id: string, password?: string): Promise<void> {
        return this.http.post(`/chatrooms/${id}/join`, { password });
    }

    async checkAccess(id: string): Promise<{ accessGranted: boolean; roomId: string }> {
        const response = await this.http.post(`/chatroom/${id}/check-access`);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        return this.http.delete(`/chatrooms/${id}`);
    }

    subscribeToPublicList(onUpdate: (rooms: Room[]) => void, region?: string): Promise<() => void> {
        const regionParam = region ? `&region=${region}` : '';
        const path = `/chatrooms?sse=true${regionParam}`;
        return this.http.subscribeSSE<Room[]>(path, onUpdate);
    }

    subscribeToRoomDetails(id: string, onUpdate: (details: RoomDetails) => void): Promise<() => void> {
        return this.http.subscribeSSE<RoomDetails>(`/chatroom/${id}/details/sse`, onUpdate);
    }
}
