import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminResource } from './AdminResource';
import { HttpClient } from '../core/transport/HttpClient';

describe('AdminResource', () => {
    let admin: AdminResource;
    let mockHttp: any;

    beforeEach(() => {
        mockHttp = {
            get: vi.fn(),
            post: vi.fn(),
            patch: vi.fn(),
            delete: vi.fn(),
        };
        admin = new AdminResource(mockHttp as unknown as HttpClient);
    });

    it('listKeys should call GET /admin/keys', async () => {
        mockHttp.get.mockResolvedValue({ data: [] });
        await admin.listKeys();
        expect(mockHttp.get).toHaveBeenCalledWith('/admin/keys');
    });

    it('createKey should call POST /admin/keys with name', async () => {
        mockHttp.post.mockResolvedValue({ data: {} });
        await admin.createKey('test-key');
        expect(mockHttp.post).toHaveBeenCalledWith('/admin/keys', { name: 'test-key' });
    });

    it('toggleKey should call PATCH /admin/keys/:id', async () => {
        mockHttp.patch.mockResolvedValue({ data: {} });
        await admin.toggleKey('key-123', true);
        expect(mockHttp.patch).toHaveBeenCalledWith('/admin/keys/key-123', { isActive: true });
    });

    it('deleteKey should call DELETE /admin/keys/:id', async () => {
        mockHttp.delete.mockResolvedValue(null);
        await admin.deleteKey('key-123');
        expect(mockHttp.delete).toHaveBeenCalledWith('/admin/keys/key-123');
    });
});
