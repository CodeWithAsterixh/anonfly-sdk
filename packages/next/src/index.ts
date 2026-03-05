import { Anonfly, AnonflyConfig } from '@anonfly/sdk';

/**
 * Configuration for the Next.js Anonfly implementation.
 */
export interface NextAnonflyConfig extends Omit<AnonflyConfig, 'apiKey'> {
    apiKey?: string; // Optional if provided via env ANONFLY_API_KEY
}

/**
 * A specialized Anonfly client for Next.js server-side usage.
 * Automatically attempts to pull the API key from environment variables.
 */
export class NextAnonflyClient extends Anonfly {
    constructor(config: NextAnonflyConfig = {}) {
        const apiKey = config.apiKey || process.env.ANONFLY_API_KEY;

        if (!apiKey) {
            throw new Error('Anonfly API Key is missing. Provide it in the constructor or via ANONFLY_API_KEY environment variable.');
        }

        super({
            ...config,
            apiKey,
        });
    }
}

/**
 * Creates a proxy handler for Next.js API Routes (App Router or Pages Router).
 * This allows the client-side to talk to a local endpoint, 
 * which then forwards requests to Anonfly with the API key hidden.
 */
export const createAnonflyProxy = (config: NextAnonflyConfig = {}) => {
    const client = new NextAnonflyClient(config);
    const baseUrl = client.config.baseUrl || 'https://api.anonfly.com/v1';

    return async (req: Request) => {
        const url = new URL(req.url);
        // Extract the path after our local proxy mount point
        // Expected format: /api/anonfly/[...path]
        const path = url.pathname.split('/api/anonfly/').pop() || '';

        const targetUrl = `${baseUrl}/${path}${url.search}`;

        const headers = new Headers(req.headers);
        headers.set('X-API-Key', client.config.apiKey);
        headers.delete('host'); // Let the fetch agent set the correct host

        try {
            const response = await fetch(targetUrl, {
                method: req.method,
                headers,
                body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : null,
                // @ts-ignore - for node-fetch/undici in some envs
                duplex: 'half',
            });

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: 'Proxy Request Failed', message: error.message }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    };
};
