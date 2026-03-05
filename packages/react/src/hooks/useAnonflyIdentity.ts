import { useState, useEffect, useCallback } from 'react';
import { identity } from '@anonfly/sdk';

/**
 * A hook for managing Anonfly user identities.
 * Allows retrieving the active identity, switching between identities,
 * generating new ones, and clearing existing ones.
 * 
 * Automatically detects and clears "old model" identities that are missing
 * required cryptographic keys.
 */
export function useAnonflyIdentity() {
    const [activeIdentity, setActiveIdentity] = useState<identity.Identity | null>(null);
    const [identities, setIdentities] = useState<identity.Identity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const validateIdentity = (id: any): id is identity.Identity => {
        return !!(id && id.aid && id.identityKeyPair && id.exchangeKeyPair);
    };

    const refreshIdentities = useCallback(async () => {
        try {
            const [active, all] = await Promise.all([
                identity.getIdentity(),
                identity.getAllIdentities()
            ]);

            // Check for "old model" identities and purge them
            const validAll = all.filter(validateIdentity);
            const invalidIdentities = all.filter(id => !validateIdentity(id));

            if (invalidIdentities.length > 0) {
                console.warn(`[useAnonflyIdentity] Purging ${invalidIdentities.length} old model identities`);
                for (const invalid of invalidIdentities) {
                    const aid = (invalid as any).aid;
                    if (aid) await identity.clearIdentity(aid);
                }
            }

            if (active && !validateIdentity(active)) {
                console.warn("[useAnonflyIdentity] Active identity is old model. Clearing it.");
                await identity.clearIdentity((active as any).aid);
                setActiveIdentity(null);
            } else {
                setActiveIdentity(active);
            }

            setIdentities(validAll);
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshIdentities();
    }, [refreshIdentities]);

    const switchIdentity = async (aid: string) => {
        try {
            const newIdentity = await identity.switchIdentity(aid);
            if (newIdentity && !validateIdentity(newIdentity)) {
                await identity.clearIdentity(aid);
                throw new Error("Target identity is from an old version and has been cleared. Please login again.");
            }
            setActiveIdentity(newIdentity);
            return newIdentity;
        } catch (err: any) {
            setError(err);
            throw err;
        }
    };

    const generateIdentity = async (username: string) => {
        try {
            const newIdentity = await identity.generateIdentity(username);
            setActiveIdentity(newIdentity);
            setIdentities(prev => [...prev, newIdentity]);
            return newIdentity;
        } catch (err: any) {
            setError(err);
            throw err;
        }
    };

    const clearIdentity = async (aid?: string) => {
        try {
            await identity.clearIdentity(aid);
            await refreshIdentities();
        } catch (err: any) {
            setError(err);
            throw err;
        }
    };

    return {
        activeIdentity,
        identities,
        isLoading,
        error,
        refreshIdentities,
        switchIdentity,
        generateIdentity,
        clearIdentity,
        isIdentityInvalid: !isLoading && !activeIdentity && identities.length === 0
    };
}
