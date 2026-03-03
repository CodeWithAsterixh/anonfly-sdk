import { HttpClient } from '../core/transport/HttpClient.js';

export interface VerifyIdentityInput {
    aid: string;
    signature: string;
    username: string;
    publicKey: string;
    exchangePublicKey: string;
}

export interface AuthSession {
    token: string;
    aid: string;
    username: string;
    identityId: string;
}

export class AuthResource {
    constructor(private http: HttpClient) { }

    async generateChallenge(aid: string): Promise<{ nonce: string }> {
        return this.http.post('/auth/challenge', { aid });
    }

    async verify(input: VerifyIdentityInput): Promise<AuthSession> {
        return this.http.post('/auth/verify', input);
    }
}
