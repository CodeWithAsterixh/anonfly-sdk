import { useEffect, useState } from 'react';
import { useAnonfly } from '../context/AnonflyContext.js';
import { Room } from '@anonfly/sdk';

export const useRooms = () => {
    const client = useAnonfly();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const data = await client.rooms.list();
            setRooms(data);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [client]);

    return { rooms, loading, error, refetch: fetchRooms };
};
