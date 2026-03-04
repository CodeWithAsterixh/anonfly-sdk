import { useState, useEffect } from 'react';
import { useAnonfly } from '../context/AnonflyContext';

/**
 * Headless hook for tracking presence and participants in a room.
 */
export function useAnonflyPresence(roomId?: string) {
    const client = useAnonfly();
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!roomId) return;

        setLoading(true);
        let unsubscribe: (() => void) | undefined;

        client.rooms.subscribeToRoomDetails(roomId, (details) => {
            setParticipants(details.participants);
            setLoading(false);
        }).then(unsub => {
            unsubscribe = unsub;
        }).catch(err => {
            setError(err);
            setLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [client, roomId]);

    return {
        participants,
        loading,
        error
    };
}
