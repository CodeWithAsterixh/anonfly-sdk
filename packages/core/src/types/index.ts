export interface Room {
    id: string;
    name: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    roomId: string;
    content: string;
    senderId: string;
    timestamp: string;
}

export interface Participant {
    id: string;
    identityId: string;
    roomId: string;
    joinedAt: string;
}

export interface Identity {
    id: string;
    publicKey: string;
    nonce: string;
}

export interface ApiKey {
    id: string;
    name: string;
    keyHash: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    rawKey?: string;
}

export interface PremiumStatus {
    isPremium: boolean;
    allowedFeatures: string[];
}

export interface RoomDetails extends Room {
    participants: {
        userId: string;
        username: string;
        userAid: string;
        joinedAt: string;
    }[];
    hostAid: string;
}

export interface SSEEvent<T = any> {
    type: string;
    data: T;
}
