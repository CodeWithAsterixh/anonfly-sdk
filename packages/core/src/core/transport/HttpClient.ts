import { AnonflyError } from '../errors/AnonflyError.js';

export type NextFunction = () => Promise<Response>;
export type Middleware = (request: Request, next: NextFunction) => Promise<Response>;

export interface HttpClientConfig {
    baseUrl: string;
    headers?: Record<string, string>;
}

export class HttpClient {
    private readonly middlewares: Middleware[] = [];

    constructor(private readonly config: HttpClientConfig) { }

    use(middleware: Middleware) {
        this.middlewares.push(middleware);
    }

    async request(path: string, options: RequestInit = {}): Promise<any> {
        const url = `${this.config.baseUrl}${path}`;
        const headers = {
            ...this.config.headers,
            ...options.headers,
            'Content-Type': 'application/json',
        };

        const initialRequest = new Request(url, { ...options, headers });

        const executeMiddleware = async (index: number, currentRequest: Request): Promise<Response> => {
            if (index === this.middlewares.length) {
                const response = await fetch(currentRequest);
                return response;
            }

            const next: NextFunction = async () => {
                return executeMiddleware(index + 1, currentRequest);
            };

            return this.middlewares[index](currentRequest, next);
        };

        const response = await executeMiddleware(0, initialRequest);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: await response.text() };
            }

            throw new AnonflyError(
                errorData.message || response.statusText,
                errorData.code,
                response.status,
                response.headers.get('x-request-id') || undefined
            );
        }

        if (response.status === 204) return null;
        return response.json();
    }

    get(path: string, options?: RequestInit) {
        return this.request(path, { ...options, method: 'GET' });
    }

    post(path: string, body?: any, options?: RequestInit) {
        return this.request(path, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    put(path: string, body?: any, options?: RequestInit) {
        return this.request(path, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    patch(path: string, body?: any, options?: RequestInit) {
        return this.request(path, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    delete(path: string, options?: RequestInit) {
        return this.request(path, { ...options, method: 'DELETE' });
    }

    async subscribeSSE<T>(path: string, onMessage: (data: T) => void, onError?: (error: any) => void): Promise<() => void> {
        const url = `${this.config.baseUrl}${path}`;
        const headers = {
            ...this.config.headers,
            'Accept': 'text/event-stream',
        };

        const controller = new AbortController();
        const response = await fetch(url, {
            headers,
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new AnonflyError('Failed to connect to SSE', undefined, response.status);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new AnonflyError('Response body is not readable');
        }

        (async () => {
            let buffer = '';
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            try {
                                onMessage(JSON.parse(data));
                            } catch {
                                // Ignore parse errors for non-json data if any
                            }
                        }
                    }
                }
            } catch (error) {
                if (onError) onError(error);
            }
        })();

        return () => controller.abort();
    }
}
