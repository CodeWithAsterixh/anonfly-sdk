import { HttpClient } from '../core/transport/HttpClient.js';
import { PremiumStatus } from '../types/index.js';

export interface VerifyIdentityInput {
    challenge: string;
    signature: string;
    identity: {
        aid: string;
        username: string;
        publicKey: string;
        exchangePublicKey: string;
    };
}

export interface AuthSession {
    token: string;
    identityId: string;
    identityAid: string;
    username: string;
    isPremium: boolean;
    allowedFeatures: string[];
}

export class AuthResource {
    constructor(private readonly http: HttpClient) { }

    async generateChallenge(aid: string): Promise<{ nonce: string }> {
        const response = await this.http.post('/auth/challenge', { aid });
        return response.data;
    }

    async verify(input: VerifyIdentityInput): Promise<AuthSession> {
        const response = await this.http.post('/auth/verify', input);
        return response.data;
    }

    async getPremiumStatus(): Promise<PremiumStatus> {
        const response = await this.http.get('/auth/premium-status');
        return response.data;
    }
}
