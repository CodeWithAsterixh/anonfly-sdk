# Anonfly SDK

Production-grade JavaScript & TypeScript SDK for the Anonfly service.

## Installation

```bash
npm install @anonfly/sdk @anonfly/react
```

## Quick Start (React)

```tsx
import { AnonflyProvider, MessageList, ChatInput } from '@anonfly/react';

const config = {
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.anonfly.com/v1',
  wsUrl: 'wss://api.anonfly.com',
};

function App() {
  return (
    <AnonflyProvider config={config}>
      <MessageList roomId="general" />
      <ChatInput roomId="general" />
    </AnonflyProvider>
  );
}
```

## Core Features

- **Type Safety:** Comprehensive TypeScript definitions for all API resources.
- **Middleware Support:** Extensible HTTP client with built-in retry logic (exponential backoff).
- **Real-time:** Native WebSocket support for live message updates.
- **UI Components:** Pre-built, accessible React components for rapid development.
- **Environment Agnostic:** Works in Node.js, Browsers, and Edge environments.

## License

MIT
 Riverside ...
