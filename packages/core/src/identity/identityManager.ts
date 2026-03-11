export interface Identity {
  aid: string;
  username: string;
  publicKey: string;
  exchangePublicKey: string;
  createdAt?: string;
  allowedFeatures?: string[];
  premiumLastChecked?: number;
  identityKeyPair: {
    publicKey: string;
    privateKey: string;
  };
  exchangeKeyPair: {
    publicKey: string;
    privateKey: string;
  };
}

const DB_NAME = 'anonfly_identity_db';
const DB_VERSION = 5;
const STORE_NAME = 'identity_store';
const ACTIVE_IDENTITY_KEY = 'active_identity_aid';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(new Error(request.error?.message || 'Failed to open IndexedDB'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if ((event as any).oldVersion > 0 && (event as any).oldVersion < 5) {
        if (db.objectStoreNames.contains(STORE_NAME)) db.deleteObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'aid' });
      }
    };
  });
}

export async function saveIdentity(identity: Identity): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(identity);
    req.onerror = () => reject(new Error(req.error?.message || 'Failed to save identity'));
    req.onsuccess = () => {
      localStorage.setItem(ACTIVE_IDENTITY_KEY, identity.aid);
      resolve();
    };
  });
}

export async function getIdentity(): Promise<Identity | null> {
  const db = await openDB();
  const activeAid = localStorage.getItem(ACTIVE_IDENTITY_KEY);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    if (activeAid) {
      const req = store.get(activeAid);
      req.onerror = () => reject(new Error(req.error?.message || 'Failed to get identity'));
      req.onsuccess = () => resolve((req.result as Identity) || null);
    } else {
      const cursorReq = store.openCursor();
      cursorReq.onerror = () => reject(new Error(cursorReq.error?.message || 'Failed to open cursor'));
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result as IDBCursorWithValue | null;
        if (cursor) {
          const value = cursor.value as Identity;
          localStorage.setItem(ACTIVE_IDENTITY_KEY, value.aid);
          resolve(value);
        } else {
          resolve(null);
        }
      };
    }
  });
}

export async function getAllIdentities(): Promise<Identity[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onerror = () => reject(new Error(req.error?.message || 'Failed to get all identities'));
    req.onsuccess = () => resolve((req.result as Identity[]) || []);
  });
}

export async function switchIdentity(aid: string): Promise<Identity | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(aid);
    req.onerror = () => reject(new Error(req.error?.message || 'Failed to switch identity'));
    req.onsuccess = () => {
      const result = req.result as Identity | undefined;
      if (result) {
        localStorage.setItem(ACTIVE_IDENTITY_KEY, aid);
        resolve(result);
      } else {
        resolve(null);
      }
    };
  });
}

export async function clearIdentity(aid?: string): Promise<void> {
  const db = await openDB();
  const targetAid = aid || localStorage.getItem(ACTIVE_IDENTITY_KEY);
  if (!targetAid) return;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(targetAid);
    req.onerror = () => reject(new Error(req.error?.message || 'Failed to delete identity'));
    req.onsuccess = () => {
      if (targetAid === localStorage.getItem(ACTIVE_IDENTITY_KEY)) {
        localStorage.removeItem(ACTIVE_IDENTITY_KEY);
      }
      resolve();
    };
  });
}

export async function generateIdentity(username: string): Promise<Identity> {
  const idKeyPair = (await globalThis.window.crypto.subtle.generateKey(
    { name: 'Ed25519' },
    true,
    ['sign', 'verify']
  )) as CryptoKeyPair;

  const exKeyPair = (await globalThis.window.crypto.subtle.generateKey(
    { name: 'X25519' },
    true,
    ['deriveKey', 'deriveBits']
  )) as CryptoKeyPair;

  const exportKey = async (key: CryptoKey, format: 'spki' | 'pkcs8') => {
    const exported = await globalThis.window.crypto.subtle.exportKey(format, key);
    return btoa(String.fromCodePoint(...new Uint8Array(exported)));
    };

  const idPubKeyBase64 = await exportKey(idKeyPair.publicKey, 'spki');
  const idPrivKeyBase64 = await exportKey(idKeyPair.privateKey, 'pkcs8');
  const exPubKeyBase64 = await exportKey(exKeyPair.publicKey, 'spki');
  const exPrivKeyBase64 = await exportKey(exKeyPair.privateKey, 'pkcs8');

  const pubKeyBuffer = new Uint8Array(await globalThis.window.crypto.subtle.exportKey('spki', idKeyPair.publicKey));
  const aidBuffer = await globalThis.window.crypto.subtle.digest('SHA-256', pubKeyBuffer);
  const aid = Array.from(new Uint8Array(aidBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

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

