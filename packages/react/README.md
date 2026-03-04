<p align="center">
  <img src="../../docs/images/logo.png" width="96" />
</p>

# @anonfly/react

[![Version](https://img.shields.io/npm/v/@anonfly/react?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@anonfly/react)
[![Downloads](https://img.shields.io/npm/dm/@anonfly/react?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@anonfly/react)

React hooks and headless components for the Anonfly SDK. Build premium, secure messaging interfaces with ease.

## Why use @anonfly/react?

While `@anonfly/sdk` provides the core logic, `@anonfly/react` bridges the gap between the SDK and your React components. It handles state synchronization, WebSocket event lifecycle, and common UI patterns so you don't have to.

- **Headless Hooks:** Pure logic hooks that give you full control over the UI.
- **Automatic Sync:** State is kept in sync with the server and WebSocket events automatically.
- **Provider Pattern:** Easily inject configuration across your entire application.

## Installation

```bash
npm install @anonfly/sdk @anonfly/react
```

## Quick Start

```tsx
import { AnonflyProvider } from '@anonfly/react';

const config = {
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.anonfly.com/v1',
};

function App() {
  return (
    <AnonflyProvider config={config}>
      <MainApp />
    </AnonflyProvider>
  );
}
```

## Core Hooks

### `useAnonflyMessages(roomId)`
Manages message fetching, sending, and real-time updates for a specific room.

```tsx
const { messages, loading, sendMessage, error } = useAnonflyMessages('general');
```

### `useAnonflyAuth()`
Handles the authentication state, login, and registration.

```tsx
const { user, login, logout, isAuthenticated } = useAnonflyAuth();
```

### `useAnonflyPresence(roomId)`
Track which users are currently online in a room.

```tsx
const { participants } = useAnonflyPresence('general');
```

### `useAnonflyConversations()`
Lists and manages the current user's active rooms and conversations.

```tsx
const { conversations, refresh } = useAnonflyConversations();
```

## Advanced Usage

### Customizing Reconnection Logic
You can pass SDK-specific configuration directly to the `AnonflyProvider`.

```tsx
<AnonflyProvider config={{ ...config, retries: 5 }}>
  {/* ... */}
</AnonflyProvider>
```

### Accessing the SDK Instance
If you need to perform low-level operations, you can access the raw SDK instance:

```tsx
import { useAnonfly } from '@anonfly/react';

const sdk = useAnonfly();
// sdk.http.get(...)
```

## License

[MIT](../../LICENSE)
