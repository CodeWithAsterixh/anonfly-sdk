import { useState, useCallback, useEffect } from 'react';
import { useAnonfly } from '../context/AnonflyContext';
import { Room } from '@anonfly/sdk';

/**
 * Headless hook for browsing and managing Anonfly conversations (rooms).
 */
export function useAnonflyConversations() {
    const client = useAnonfly();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchRooms = useCallback(async (region?: string) => {
        setLoading(true);
        try {
            const data = await client.rooms.list(region);
            setRooms(data);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [client]);

    const createRoom = useCallback(async (data: { roomname: string; isPrivate?: boolean; description?: string; password?: string }) => {
        return client.rooms.create(data);
    }, [client]);

    // Real-time public list updates via SSE
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        client.rooms.subscribeToPublicList((updatedRooms) => {
            setRooms(updatedRooms);
        }).then(unsub => {
            unsubscribe = unsub;
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [client]);

    return {
        rooms,
        loading,
        error,
        fetchRooms,
        createRoom
    };
}
