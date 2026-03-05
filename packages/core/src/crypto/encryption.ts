/**
 * Encryption utilities for End-to-End Encryption in Anonfly.
 * Uses X25519 for key exchange and AES-GCM for symmetric encryption.
 * Compatible with Browser and Node.js environments.
 */

/**
 * Safely get the crypto object for browser or node environment
 */
const getCrypto = () => {
    if (typeof globalThis !== 'undefined' && globalThis.crypto !== undefined) return globalThis.crypto;
    // @ts-ignore
    if (typeof globalThis !== 'undefined' && globalThis.window && globalThis.window.crypto) return globalThis.window.crypto;
    throw new Error('Crypto API not available');
};

/**
 * Generates an X25519 key pair for key exchange.
 * Returns Base64 encoded keys (spki for public, pkcs8 for private).
 */
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const crypto = getCrypto();
    const keyPair = await crypto.subtle.generateKey(
        { name: 'X25519' },
        true,
        ['deriveKey', 'deriveBits']
    ) as CryptoKeyPair;

    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    // Use cross-environment safe base64 encoding (e.g. btoa/atob or Buffer)
    const encodeBase64 = (buffer: ArrayBuffer) => {
        return btoa(String.fromCodePoint(...new Uint8Array(buffer)));
    };

    return {
        publicKey: encodeBase64(publicKeyBuffer),
        privateKey: encodeBase64(privateKeyBuffer),
    };
}

/**
 * Derives a shared secret between the local user and a remote user.
 */
export async function deriveSharedSecret(localPrivateKeyBase64: string, remotePublicKeyBase64: string): Promise<CryptoKey> {
    const crypto = getCrypto();

    const decodeBase64 = (base64: string) => {
        return Uint8Array.from(atob(base64), c => c.codePointAt(0) || 0);
    };

    const privateKeyBuffer = decodeBase64(localPrivateKeyBase64);
    const publicKeyBuffer = decodeBase64(remotePublicKeyBase64);

    const localPrivateKey = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'X25519' },
        false,
        ['deriveKey']
    );

    const remotePublicKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        { name: 'X25519' },
        false,
        []
    );

    return crypto.subtle.deriveKey(
        { name: 'X25519', public: remotePublicKey },
        localPrivateKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts a message using a shared secret.
 */
export async function encryptMessage(content: string, sharedSecret: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
    const crypto = getCrypto();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedContent = new TextEncoder().encode(content);

    const ciphertextBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        sharedSecret,
        encodedContent
    );

    const encodeBase64 = (buffer: ArrayBuffer | Uint8Array) => {
        return btoa(String.fromCodePoint(...new Uint8Array(buffer)));
    };

    return {
        ciphertext: encodeBase64(ciphertextBuffer),
        iv: encodeBase64(iv),
    };
}

/**
 * Decrypts a message using a shared secret.
 */
export async function decryptMessage(ciphertextBase64: string, ivBase64: string, sharedSecret: CryptoKey): Promise<string> {
    const crypto = getCrypto();

    const decodeBase64 = (base64: string) => {
        return Uint8Array.from(atob(base64), c => c.codePointAt(0) || 0);
    };

    try {
        const ciphertext = decodeBase64(ciphertextBase64);
        const iv = decodeBase64(ivBase64);

        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            sharedSecret,
            ciphertext
        );

        return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
        console.error('[Encryption] Decryption error details:', error);
        throw error;
    }
}

/**
 * Generates a new random AES-GCM key for a chatroom.
 */
export async function generateRoomKey(): Promise<CryptoKey> {
    const crypto = getCrypto();
    return crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Exports a CryptoKey to a base64 string.
 */
export async function exportKey(key: CryptoKey): Promise<string> {
    const crypto = getCrypto();
    const exported = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCodePoint(...new Uint8Array(exported)));
}

/**
 * Imports a base64 string as an AES-GCM CryptoKey.
 */
export async function importRoomKey(keyBase64: string): Promise<CryptoKey> {
    const crypto = getCrypto();
    const decodeBase64 = (base64: string) => {
        return Uint8Array.from(atob(base64), c => c.codePointAt(0) || 0);
    };
    const keyBuffer = decodeBase64(keyBase64);
    return crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Signs a blob using the Identity Private Key.
 */
export async function signBlob(blobBase64: string, privateKeyBase64: string): Promise<string> {
    const crypto = getCrypto();

    const decodeBase64 = (base64: string) => {
        return Uint8Array.from(atob(base64), c => c.codePointAt(0) || 0);
    };

    const privateKeyBuffer = decodeBase64(privateKeyBase64);
    const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'Ed25519' },
        false,
        ['sign']
    );

    const blob = decodeBase64(blobBase64);
    const signatureBuffer = await crypto.subtle.sign(
        { name: 'Ed25519' },
        privateKey,
        blob
    );

    return btoa(String.fromCodePoint(...new Uint8Array(signatureBuffer)));
}

/**
 * Verifies a blob signature using the Identity Public Key.
 */
export async function verifyBlobSignature(blobBase64: string, signatureBase64: string, publicKeyBase64: string): Promise<boolean> {
    const crypto = getCrypto();

    const decodeBase64 = (base64: string) => {
        return Uint8Array.from(atob(base64), c => c.codePointAt(0) || 0);
    };

    const publicKeyBuffer = decodeBase64(publicKeyBase64);
    const publicKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        { name: 'Ed25519' },
        false,
        ['verify']
    );

    const blob = decodeBase64(blobBase64);
    const signature = decodeBase64(signatureBase64);

    return crypto.subtle.verify(
        { name: 'Ed25519' },
        publicKey,
        signature,
        blob
    );
}
