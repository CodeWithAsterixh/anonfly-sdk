import { Middleware } from './HttpClient.js';

export interface RetryOptions {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
}

export const retryMiddleware = (options: RetryOptions = {}): Middleware => {
    const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;

    return async (request, next) => {
        let lastError: any;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // We need to clone the request because it can only be used once
                return await next();
            } catch (error: any) {
                lastError = error;

                // Don't retry if it's not a network error or a 5xx error
                // Or if it's the last attempt
                if (
                    attempt === maxRetries ||
                    (error.status && error.status < 500 && error.status !== 429)
                ) {
                    throw error;
                }

                const delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
                const jitter = Math.random() * 100;
                await new Promise((resolve) => setTimeout(resolve, delay + jitter));
            }
        }

        throw lastError;
    };
};
