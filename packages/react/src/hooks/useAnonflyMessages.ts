import { useState, useCallback, useEffect } from 'react';
import { useAnonfly } from '../context/AnonflyContext';
import { Message } from '@anonfly/sdk';

/**
 * Headless hook for managing Anonfly messages within a specific room.
 * Supports fetching history and subscribing to real-time updates.
 */
export function useAnonflyMessages(roomId?: string) {
    const client = useAnonfly();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchMessages = useCallback(async (options?: { limit?: number; before?: string }) => {
        if (!roomId) return;
        setLoading(true);
        try {
            const data = await client.messages.list(roomId, options);
            setMessages(data);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [client, roomId]);

    const sendMessage = useCallback(async (content: string) => {
        if (!roomId) throw new Error('Room ID is required to send a message');
        return client.messages.send(roomId, content);
    }, [client, roomId]);

    // Real-time subscription
    useEffect(() => {
        if (!roomId || !client.ws) return;

        const handler = (event: any) => {
            if (event.type === 'message' && event.data.roomId === roomId) {
                setMessages((prev) => [...prev, event.data]);
            }
        };

        client.ws.on('message', handler);
        return () => {
            client.ws?.removeListener('message', handler);
        };
    }, [client.ws, roomId]);

    return {
        messages,
        loading,
        error,
        fetchMessages,
        sendMessage
    };
}
