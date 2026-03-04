import { useState, useCallback } from 'react';
import { useAnonfly } from '../context/AnonflyContext';
import { AuthSession } from '@anonfly/sdk';

/**
 * Headless hook for Anonfly Authentication.
 * Handles login, session management, and premium status.
 */
export function useAnonflyAuth() {
    const client = useAnonfly();
    const [session, setSession] = useState<AuthSession | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const login = useCallback(async (aid: string, username: string, challenge: string, signature: string, publicKey: string, exchangePublicKey: string) => {
        setLoading(true);
        setError(null);
        try {
            const authSession = await client.auth.verify({
                challenge,
                signature,
                identity: {
                    aid,
                    username,
                    publicKey,
                    exchangePublicKey
                }
            });
            setSession(authSession);
            return authSession;
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [client]);

    const logout = useCallback(() => {
        setSession(null);
    }, []);

    const getChallenge = useCallback(async (aid: string) => {
        return client.auth.generateChallenge(aid);
    }, [client]);

    return {
        session,
        isAuthenticated: !!session,
        loading,
        error,
        login,
        logout,
        getChallenge
    };
}
