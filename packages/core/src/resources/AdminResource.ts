import { HttpClient } from '../core/transport/HttpClient.js';
import { ApiKey } from '../types/index.js';

export class AdminResource {
    constructor(private readonly http: HttpClient) { }

    async listKeys(): Promise<ApiKey[]> {
        return this.http.get('/admin/keys');
    }

    async createKey(name: string): Promise<ApiKey> {
        return this.http.post('/admin/keys', { name });
    }

    async toggleKey(id: string, isActive: boolean): Promise<ApiKey> {
        return this.http.patch('/admin/keys/' + id, { isActive });
    }

    async deleteKey(id: string): Promise<void> {
        return this.http.delete('/admin/keys/' + id);
    }
}
