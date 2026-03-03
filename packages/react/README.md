# @anonfly/react

React UI components and hooks for the Anonfly SDK.

## Installation

```bash
npm install @anonfly/sdk @anonfly/react
```

## Quick Start

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

## License

MIT
