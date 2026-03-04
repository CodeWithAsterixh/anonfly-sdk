import { useState, useEffect } from 'react';
import { useAnonfly } from '../context/AnonflyContext';

/**
 * Headless hook for tracking presence in a room.
 */
export function useAnonflyPresence(roomId?: string) {
    const client = useAnonfly();
    const [participants, setParticipants] = useState<any[]>([]);

    useEffect(() => {
        if (!roomId) return;

        let unsubscribe: (() => void) | undefined;

        client.rooms.subscribeToRoomDetails(roomId, (details) => {
            setParticipants(details.participants);
        }).then(unsub => {
            unsubscribe = unsub;
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [client, roomId]);

    return {
        participants
    };
}
