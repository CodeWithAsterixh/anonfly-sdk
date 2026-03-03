import { HttpClient } from '../core/transport/HttpClient.js';
import { Room } from '../types/index.js';

export class RoomsResource {
    constructor(private http: HttpClient) { }

    async list(): Promise<Room[]> {
        return this.http.get('/rooms');
    }

    async create(data: { name: string; isPublic?: boolean }): Promise<Room> {
        return this.http.post('/rooms', data);
    }

    async get(id: string): Promise<Room> {
        return this.http.get(`/rooms/${id}`);
    }

    async join(id: string): Promise<void> {
        return this.http.post(`/rooms/${id}/join`);
    }
}
