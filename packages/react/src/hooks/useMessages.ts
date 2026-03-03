import { useEffect, useState } from 'react';
import { useAnonfly } from '../context/AnonflyContext.js';
import { Message } from '@anonfly/sdk';

export const useMessages = (roomId: string) => {
    const client = useAnonfly();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                const data = await client.messages.list(roomId);
                setMessages(data);
            } catch (err: any) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Setup WebSocket listener if available
        if (client.ws) {
            const handleMessage = (msg: any) => {
                if (msg.roomId === roomId) {
                    setMessages((prev) => [...prev, msg]);
                }
            };

            client.ws.on('message', handleMessage);
            return () => {
                client.ws?.off('message', handleMessage);
            };
        }
    }, [client, roomId]);

    const sendMessage = async (content: string) => {
        const newMessage = await client.messages.send(roomId, content);
        // Optimistic update handled by WebSocket or manual refresh
        return newMessage;
    };

    return { messages, loading, error, sendMessage };
};
