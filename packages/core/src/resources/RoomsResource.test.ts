import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoomsResource } from './RoomsResource';
import { HttpClient } from '../core/transport/HttpClient';

describe('RoomsResource', () => {
    let rooms: RoomsResource;
    let mockHttp: any;

    beforeEach(() => {
        mockHttp = {
            get: vi.fn(),
            post: vi.fn(),
            subscribeSSE: vi.fn(),
        };
        rooms = new RoomsResource(mockHttp as unknown as HttpClient);
    });

    it('list should call GET /chatrooms', async () => {
        mockHttp.get.mockResolvedValue({ data: [] });
        await rooms.list();
        expect(mockHttp.get).toHaveBeenCalledWith('/chatrooms', expect.anything());
    });

    it('get should call GET /chatroom/:id/details', async () => {
        mockHttp.get.mockResolvedValue({ data: {} });
        await rooms.get('room-1');
        expect(mockHttp.get).toHaveBeenCalledWith('/chatroom/room-1/details');
    });

    it('checkAccess should call POST /chatroom/:id/check-access', async () => {
        mockHttp.post.mockResolvedValue({ data: {} });
        await rooms.checkAccess('room-1');
        expect(mockHttp.post).toHaveBeenCalledWith('/chatroom/room-1/check-access');
    });

    it('subscribeToPublicList should use SSE with correct path', async () => {
        await rooms.subscribeToPublicList(() => { });
        expect(mockHttp.subscribeSSE).toHaveBeenCalledWith('/chatrooms?sse=true', expect.any(Function));
    });
});
