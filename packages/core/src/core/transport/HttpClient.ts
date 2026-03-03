import { AnonflyError } from '../errors/AnonflyError.js';

export type NextFunction = () => Promise<Response>;
export type Middleware = (request: Request, next: NextFunction) => Promise<Response>;

export interface HttpClientConfig {
    baseUrl: string;
    headers?: Record<string, string>;
}

export class HttpClient {
    private middlewares: Middleware[] = [];

    constructor(private config: HttpClientConfig) { }

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

    delete(path: string, options?: RequestInit) {
        return this.request(path, { ...options, method: 'DELETE' });
    }
}
