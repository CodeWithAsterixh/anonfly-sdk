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
