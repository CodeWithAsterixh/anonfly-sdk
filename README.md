<p align="center">
  <img src="https://raw.githubusercontent.com/codewithasterixh/anonflyclient/main/public/logo.png" width="128" />
</p>

# Anonfly SDK

[![Build Status](https://img.shields.io/github/actions/workflow/status/peterriverside/anonfly-package/test.yml?branch=main&style=flat&colorA=000000&colorB=000000)](https://github.com/peterriverside/anonfly-package/actions)
[![Version](https://img.shields.io/npm/v/@anonfly/sdk?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@anonfly/sdk)
[![License](https://img.shields.io/github/license/peterriverside/anonfly-package?style=flat&colorA=000000&colorB=000000)](LICENSE)

An industrial-grade, privacy-first JavaScript & TypeScript SDK for the Anonfly messaging service. Built for scale, security, and developer experience.

Anonfly provides the building blocks for creating secure, anonymous real-time communication applications. Whether you're building a simple chat or a complex collaborative tool, Anonfly handles the heavy lifting of authentication, room management, and real-time synchronization.

## Why Anonfly?

- **Privacy by Design:** Peer-to-peer encryption and anonymous identity management.
- **Developer First:** Comfy API based on modern patterns, zero boilerplate for core features.
- **Reliable:** Built-in retry logic with exponential backoff and automatic WebSocket reconnection.
- **Type Safe:** First-class TypeScript support for every part of the SDK.
- **Flexible:** Use the headless `@anonfly/sdk` for custom logic or `@anonfly/react` for rapid UI development.

## Monorepo Structure

This project is a monorepo containing several packages:

| Package | Description | Version |
| :--- | :--- | :--- |
| [`@anonfly/sdk`](./packages/core) | Core logic, HTTP transport, and WebSocket clients. | `1.0.1` |
| [`@anonfly/react`](./packages/react) | React hooks and headless components for easy integration. | `1.0.2` |

## Installation

```bash
# To use the core SDK
npm install @anonfly/sdk

# For React applications
npm install @anonfly/sdk @anonfly/react
```

## Quick Start (React)

Using the high-level React hooks:

```tsx
import { AnonflyProvider, useAnonflyMessages } from '@anonfly/react';

const config = {
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.anonfly.com/v1',
  wsUrl: 'wss://api.anonfly.com',
};

function App() {
  return (
    <AnonflyProvider config={config}>
      <ChatRoom roomId="general" />
    </AnonflyProvider>
  );
}

function ChatRoom({ roomId }) {
  const { messages, sendMessage } = useAnonflyMessages(roomId);
  
  return (
    <div>
      {messages.map(m => <div key={m.id}>{m.content}</div>)}
      <button onClick={() => sendMessage("Hello!")}>Send</button>
    </div>
  );
}
```

## Core Features

- **🛡️ Secure Transport:** Built-in HTTP client with custom middleware support.
- **⚡ Real-time Sync:** Native WebSocket integration for instant updates.
- **🔄 Auto-Retry:** Intelligent failure handling for unstable connections.
- **📦 Environment Agnostic:** Works perfectly in Node.js, Browsers, and Edge Runtimes.

## Documentation

For more detailed information, check the individual package readmes:
- [@anonfly/sdk Documentation](./packages/core/README.md)
- [@anonfly/react Documentation](./packages/react/README.md)

## License

[MIT](./LICENSE) © Peter Riverside
