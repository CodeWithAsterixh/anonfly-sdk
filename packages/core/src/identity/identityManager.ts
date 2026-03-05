import * as cryptoUtils from '../crypto/encryption';

export interface Identity {
    aid: string;
    username: string;
    publicKey: string; // Top-level identity public key
    exchangePublicKey: string; // Top-level exchange public key
    createdAt?: string; // ISO timestamp
    allowedFeatures?: string[]; // Premium status
    premiumLastChecked?: number; // Last checked timestamp
    identityKeyPair: {
        publicKey: string; // Base64 DER
        privateKey: string; // Base64 DER
    };
    exchangeKeyPair: {
        publicKey: string; // Base64 DER
        privateKey: string; // Base64 DER
    };
}

const DB_NAME = 'anonfly_identity_db';
const DB_VERSION = 5;
const STORE_NAME = 'identity_store';
const ROOM_KEY_STORE = 'room_key_store';
const ACTIVE_IDENTITY_KEY = 'active_identity_aid';

/**
 * Opens (and initializes if necessary) the IndexedDB for identity storage.
 */
async function openDB(): Promise<IDBDatabase> {
    if (typeof indexedDB === 'undefined') {
        throw new TypeError('IndexedDB is not available in this environment');
    }
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => {
            console.error("[identityManager] Failed to open IndexedDB:", request.error);
            reject(new Error(request.error?.message || 'Failed to open IndexedDB'));
        };
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = request.result;

            // If upgrading from an older version, clear the stores to ensure correct schema
            if (event.oldVersion > 0 && event.oldVersion < 5) {
                if (db.objectStoreNames.contains(STORE_NAME)) {
                    db.deleteObjectStore(STORE_NAME);
                }
                if (db.objectStoreNames.contains(ROOM_KEY_STORE)) {
                    db.deleteObjectStore(ROOM_KEY_STORE);
                }
            }

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'aid' });
            }

            if (!db.objectStoreNames.contains(ROOM_KEY_STORE)) {
                db.createObjectStore(ROOM_KEY_STORE);
            }
        };
    });
}

/**
 * Saves an E2E encryption key for a specific chatroom to the local database.
 */
export async function saveRoomKey(chatroomId: string, keyBase64: string, expiresAt?: number): Promise<void> {
    if (!chatroomId) {
        console.error("[identityManager] Cannot save room key: chatroomId is missing");
        return;
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(ROOM_KEY_STORE, 'readwrite');
        const store = transaction.objectStore(ROOM_KEY_STORE);
        const data = expiresAt ? { key: keyBase64, expiresAt } : keyBase64;
        const request = store.put(data, chatroomId);
        request.onerror = () => reject(new Error(request.error?.message || 'Failed to save room key'));
        request.onsuccess = () => resolve();
    });
}

/**
 * Retrieves a stored room key for a chatroom from the local database.
 */
export async function getRoomKey(chatroomId: string): Promise<string | null> {
    if (!chatroomId) return null;
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(ROOM_KEY_STORE, 'readonly');
        const store = transaction.objectStore(ROOM_KEY_STORE);
        const request = store.get(chatroomId);
        request.onerror = () => reject(new Error(request.error?.message || 'Failed to get room key'));
        request.onsuccess = () => {
            const result = request.result;
            if (!result) {
                resolve(null);
                return;
            }

            // Handle both old string format and new object format
            if (typeof result === 'string') {
                resolve(result);
            } else if (typeof result === 'object' && result.key) {
                // Check expiration
                if (result.expiresAt && Date.now() > result.expiresAt) {
                    resolve(null);
                    return;
                }
                resolve(result.key);
            } else {
                resolve(null);
            }
        };
    });
}

/**
 * Deletes all stored room keys from the local database.
 */
export async function clearRoomKeys(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(ROOM_KEY_STORE, 'readwrite');
        const store = transaction.objectStore(ROOM_KEY_STORE);
        const request = store.clear();
        request.onerror = () => reject(new Error(request.error?.message || 'Failed to clear room keys'));
        request.onsuccess = () => resolve();
    });
}

/**
 * Persists a user identity to the local database and sets it as the active identity.
 */
export async function saveIdentity(identity: Identity): Promise<void> {
    if (!identity?.aid) {
        console.error("[identityManager] Cannot save identity: aid is missing");
        return;
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // Safety check: ensure the store has the expected keyPath
        if (store.keyPath !== 'aid') {
            console.error(`[identityManager] Object store ${STORE_NAME} has incorrect keyPath: ${store.keyPath}. Expected 'aid'.`);
            reject(new Error(`Incorrect keyPath for ${STORE_NAME}`));
            return;
        }

        const request = store.put(identity);
        request.onerror = () => {
            console.error("[identityManager] Error in saveIdentity put request:", request.error);
            reject(new Error(request.error?.message || 'Failed to save identity'));
        };
        request.onsuccess = () => {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(ACTIVE_IDENTITY_KEY, identity.aid);
            }
            resolve();
        };
    });
}

/**
 * Retrieves the currently active identity from the local database.
 */
export async function getIdentity(): Promise<Identity | null> {
    const db = await openDB();
    const activeAid = typeof localStorage === 'undefined' ? null : localStorage.getItem(ACTIVE_IDENTITY_KEY);

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        if (activeAid) {
            const request = store.get(activeAid);
            request.onerror = () => reject(new Error(request.error?.message || 'Failed to get identity'));
            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    if (!result.publicKey) result.publicKey = result.identityKeyPair.publicKey;
                    if (!result.exchangePublicKey) result.exchangePublicKey = result.exchangeKeyPair.publicKey;
                }
                resolve(result || null);
            };
        } else {
            const request = store.openCursor();
            request.onerror = () => reject(new Error(request.error?.message || 'Failed to open cursor for identities'));
            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor) {
                    const result = cursor.value;
                    if (!result.publicKey) result.publicKey = result.identityKeyPair.publicKey;
                    if (!result.exchangePublicKey) result.exchangePublicKey = result.exchangeKeyPair.publicKey;

                    if (typeof localStorage !== 'undefined') {
                        localStorage.setItem(ACTIVE_IDENTITY_KEY, result.aid);
                    }
                    resolve(result);
                } else {
                    resolve(null);
                }
            };
        }
    });
}

/**
 * Retrieves all stored identities from the local database.
 */
export async function getAllIdentities(): Promise<Identity[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onerror = () => reject(new Error(request.error?.message || 'Failed to get all identities'));
        request.onsuccess = () => {
            const results = (request.result || []) as Identity[];
            results.forEach(result => {
                if (!result.publicKey) result.publicKey = result.identityKeyPair.publicKey;
                if (!result.exchangePublicKey) result.exchangePublicKey = result.exchangeKeyPair.publicKey;
            });
            resolve(results);
        };
    });
}

/**
 * Switches the active identity by AID.
 */
export async function switchIdentity(aid: string): Promise<Identity | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(aid);
        request.onerror = () => reject(new Error(request.error?.message || 'Failed to switch identity'));
        request.onsuccess = () => {
            const result = request.result;
            if (result) {
                if (!result.publicKey) result.publicKey = result.identityKeyPair.publicKey;
                if (!result.exchangePublicKey) result.exchangePublicKey = result.exchangeKeyPair.publicKey;

                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(ACTIVE_IDENTITY_KEY, aid);
                }
                resolve(result);
            } else {
                resolve(null);
            }
        };
    });
}

/**
 * Deletes an identity from the local database.
 */
export async function clearIdentity(aid?: string): Promise<void> {
    const db = await openDB();
    const activeAid = typeof localStorage === 'undefined' ? null : localStorage.getItem(ACTIVE_IDENTITY_KEY);
    const targetAid = aid || activeAid;
    if (!targetAid) return;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(targetAid);
        request.onerror = () => reject(new Error(request.error?.message || 'Failed to delete identity'));
        request.onsuccess = () => {
            if (typeof localStorage !== 'undefined' && targetAid === activeAid) {
                localStorage.removeItem(ACTIVE_IDENTITY_KEY);
            }
            resolve();
        };
    });
}

/**
 * Generates a new cryptographic identity (Ed25519 for signing, X25519 for exchange).
 * Automatically saves the new identity to the local database.
 */
export async function generateIdentity(username: string): Promise<Identity> {
    const crypto = typeof globalThis === 'undefined' ? null : globalThis.crypto;
    if (!crypto || !crypto.subtle) {
        throw new Error('Web Crypto API not available for identity generation');
    }

    // 1. Generate Identity Key Pair (Ed25519 for signing)
    const identityKeyPair = (await crypto.subtle.generateKey(
        { name: 'Ed25519' },
        true,
        ['sign', 'verify']
    )) as CryptoKeyPair;

    // 2. Generate Exchange Key Pair (X25519 for E2EE)
    const exchangeKeyPair = (await crypto.subtle.generateKey(
        { name: 'X25519' },
        true,
        ['deriveKey', 'deriveBits']
    )) as CryptoKeyPair;

    const idPubKeyBase64 = await cryptoUtils.exportKey(identityKeyPair.publicKey);
    const idPrivKeyBase64 = await cryptoUtils.exportKey(identityKeyPair.privateKey);
    const exPubKeyBase64 = await cryptoUtils.exportKey(exchangeKeyPair.publicKey);
    const exPrivKeyBase64 = await cryptoUtils.exportKey(exchangeKeyPair.privateKey);

    // 3. Derive AID (SHA-256 of Public Key)
    const pubKeyBuffer = new Uint8Array(await crypto.subtle.exportKey('spki', identityKeyPair.publicKey));
    const aidBuffer = await crypto.subtle.digest('SHA-256', pubKeyBuffer);
    const aid = Array.from(new Uint8Array(aidBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    const identity: Identity = {
        aid,
        username,
        publicKey: idPubKeyBase64,
        exchangePublicKey: exPubKeyBase64,
        createdAt: new Date().toISOString(),
        identityKeyPair: {
            publicKey: idPubKeyBase64,
            privateKey: idPrivKeyBase64,
        },
        exchangeKeyPair: {
            publicKey: exPubKeyBase64,
            privateKey: exPrivKeyBase64,
        },
    };

    await saveIdentity(identity);
    return identity;
}
