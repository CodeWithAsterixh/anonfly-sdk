<p align="center">
  <img src="../../docs/images/logo.png" width="96" />
</p>

# @anonfly/sdk

[![Version](https://img.shields.io/npm/v/@anonfly/sdk?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@anonfly/sdk)
[![Downloads](https://img.shields.io/npm/dm/@anonfly/sdk?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@anonfly/sdk)

The core logic for the Anonfly messaging platform. This package provides a low-level, headless SDK for interacting with the Anonfly API and WebSocket services.

## Features

- **🛡️ Industrial-grade Transport:** Powerful `HttpClient` with middleware support.
- **⚡ Real-time Engine:** Robust `WebSocketClient` with automatic reconnection.
- **🔄 Resilience:** Built-in `retryMiddleware` with exponential backoff.
- **📦 Resource-based API:** Clean access to `rooms`, `messages`, `auth`, and `admin` logic.
- **✨ Pure TypeScript:** Zero-dependency core logic with full type-safety.

## Installation

```bash
npm install @anonfly/sdk
```

## Usage

### Basic Initialization

```typescript
import { Anonfly } from '@anonfly/sdk';

const anonfly = new Anonfly({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.anonfly.com/v1',
  wsUrl: 'wss://api.anonfly.com', // Optional for real-time
  retries: 3, // Optional: defaults to built-in retry logic
});

// Use resources
const rooms = await anonfly.rooms.list();
```

### Working with Resources

The SDK is organized into logical resources:

```typescript
// Authentication
const session = await anonfly.auth.login(credentials);

// Message Management
const message = await anonfly.messages.send(roomId, {
  content: "Hello World",
  type: "text",
});

// Room Management
const room = await anonfly.rooms.create({ name: "General" });
```

### Advanced: Custom Middleware

You can extend the `HttpClient` with custom middleware:

```typescript
anonfly.http.use(async (request, next) => {
  console.log(`Starting request to ${request.url}`);
  const response = await next(request);
  console.log(`Finished request with status ${response.status}`);
  return response;
});
```

### Real-time with WebSockets

```typescript
if (anonfly.ws) {
  anonfly.ws.subscribe('message:new', (data) => {
    console.log('New message received:', data);
  });
  
  anonfly.ws.connect();
}
```

## Recipes

### Handling Connection Drops

The SDK automatically handles reconnections if configured, but you can also listen to events:

```typescript
anonfly.ws?.on('close', () => {
  console.warn('Connection lost. Cleaning up UI state...');
});
```

## TypeScript Usage

`@anonfly/sdk` is written 100% in TypeScript. All types are exported from the main entry point:

```typescript
import { AnonflyConfig, Room, Message } from '@anonfly/sdk';
```

## License

[MIT](../../LICENSE)
