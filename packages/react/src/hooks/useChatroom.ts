import { useState, useEffect, useCallback, useRef } from 'react';
import { WSClient } from '@anonfly/sdk';

export interface Message {
    id: string;
    senderAid: string;
    senderUsername: string;
    content: string;
    timestamp: string;
    type?: string;
}

export interface Participant {
    aid: string;
    username: string;
    isOnline: boolean;
}

/**
 * A hook for managing a chatroom connection and its state.
 * Handles messages, participants, and typing indicators.
 */
export function useChatroom(chatroomId: string | null, wsUrl: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const wsRef = useRef<WSClient | null>(null);

    const connect = useCallback(() => {
        if (!chatroomId || wsRef.current) return;

        const url = `${wsUrl}/chatroom/${chatroomId}`;
        const ws = new WSClient({
            url,
            reconnect: true,
            reconnectInterval: 2000
        });

        ws.on('connected', () => {
            setIsConnected(true);
            setError(null);
        });

        ws.on('disconnected', () => {
            setIsConnected(false);
        });

        ws.on('error', (err) => {
            setError(err instanceof Error ? err : new Error('WebSocket error'));
        });

        // Event Handlers
        ws.on('chatMessage', (data) => {
            setMessages(prev => [...prev, data]);
        });

        ws.on('typing', (data) => {
            setIsTyping(prev => ({
                ...prev,
                [data.senderAid]: data.isTyping
            }));
        });

        ws.on('participantList', (data) => {
            setParticipants(data.participants || []);
        });

        const findParticipants = (aid: string) => participants.find(p => p.aid === aid);
        ws.on('participantJoined', (data) => {
            setParticipants(prev => {
                if (findParticipants(data.participant.aid)) return prev;
                return [...prev, data.participant];
            });
        });
        const filterParticipant = (aid: string) => participants.filter(p => p.aid !== aid);
        ws.on('participantLeft', (data) => {
            setParticipants(prev => filterParticipant(data.participantAid));
        });

        wsRef.current = ws;
        ws.connect();
    }, [chatroomId, wsUrl]);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.disconnect();
            wsRef.current = null;
            setIsConnected(false);
        }
    }, []);

    useEffect(() => {
        if (chatroomId && wsUrl) {
            connect();
        }
        return () => disconnect();
    }, [chatroomId, wsUrl, connect, disconnect]);

    const sendMessage = useCallback((content: string) => {
        if (wsRef.current && isConnected) {
            wsRef.current.send({
                type: 'chatMessage',
                content,
                chatroomId
            });
        }
    }, [chatroomId, isConnected]);

    const sendTyping = useCallback((typing: boolean) => {
        if (wsRef.current && isConnected) {
            wsRef.current.send({
                type: 'typing',
                isTyping: typing,
                chatroomId
            });
        }
    }, [chatroomId, isConnected]);

    const onMessage = useCallback((handler: (data: any) => void) => {
        if (wsRef.current) {
            wsRef.current.on('message', handler);
            return () => wsRef.current?.off('message', handler);
        }
    }, []);

    const sendCustomMessage = useCallback((type: string, data: any) => {
        if (wsRef.current && isConnected) {
            wsRef.current.send({
                type,
                ...data,
                chatroomId
            });
        }
    }, [chatroomId, isConnected]);

    return {
        messages,
        participants,
        isTyping,
        isConnected,
        error,
        sendMessage,
        sendTyping,
        sendCustomMessage,
        onMessage,
        connect,
        disconnect,
        wsClient: wsRef.current
    };
}
