export class AnonflyError extends Error {
    constructor(
        public message: string,
        public code: string = 'ERR_UNKNOWN',
        public status?: number,
        public requestId?: string
    ) {
        super(message);
        this.name = 'AnonflyError';
        Object.setPrototypeOf(this, AnonflyError.prototype);
    }
}

export class AuthenticationError extends AnonflyError {
    constructor(message: string, status?: number, requestId?: string) {
        super(message, 'ERR_AUTHENTICATION', status, requestId);
        this.name = 'AuthenticationError';
    }
}

export class RateLimitError extends AnonflyError {
    constructor(message: string, status?: number, requestId?: string, public retryAfter?: number) {
        super(message, 'ERR_RATE_LIMIT', status, requestId);
        this.name = 'RateLimitError';
    }
}

export class ValidationError extends AnonflyError {
    constructor(message: string, public details?: any) {
        super(message, 'ERR_VALIDATION', 400);
        this.name = 'ValidationError';
    }
}
