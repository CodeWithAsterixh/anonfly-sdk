# @anonfly/next

Next.js Proxy Wrapper for secure, server-side Anonfly integration.

## Features

- **Secure API Proxy**: Hidden API keys from client-side code.
- **Server-Side Client**: Specialized `NextAnonflyClient` that pulls from environment variables.
- **App Router Support**: Easy integration with Next.js App Router API Routes.

## Installation

```bash
npm install @anonfly/sdk @anonfly/next
```

## Usage

### 1. Configure Environment Variables

Add your API key to your `.env.local` file:

```env
ANONFLY_API_KEY=your_api_key_here
```

### 2. Create the API Proxy (App Router)

Create a file at `app/api/anonfly/[...path]/route.ts`:

```typescript
import { createAnonflyProxy } from '@anonfly/next';

export const GET = createAnonflyProxy();
export const POST = createAnonflyProxy();
export const PATCH = createAnonflyProxy();
export const DELETE = createAnonflyProxy();
```

### 3. Use the Proxy in the Frontend

Now you can point your SDK or fetch calls to your local proxy instead of the global Anonfly API:

```typescript
import { Anonfly } from '@anonfly/sdk';

const client = new Anonfly({
  apiKey: 'proxy', // API key not needed on frontend when using proxy
  baseUrl: '/api/anonfly'
});
```

### 4. Server-Side Usage

Use `NextAnonflyClient` in Server Actions or Route Handlers:

```typescript
import { NextAnonflyClient } from '@anonfly/next';

export async function createRoomAction(name: string) {
  const client = new NextAnonflyClient(); // Automatically uses ANONFLY_API_KEY
  return await client.rooms.create({ roomname: name });
}
```

## Security Note

Always use the proxy for client-side interactions to prevent API key exposure. The `NextAnonflyClient` should only be used in server-side environments (`Server Actions`, `getStaticProps`, `getServerSideProps`, `Route Handlers`).
