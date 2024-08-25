import {
  createTRPCClient,
  httpBatchLink,
  createWSClient,
  wsLink,
} from '@trpc/client';
import type { AppRouter } from '@cto-ai/server/types';

// create persistent WebSocket connection
const wsClient = createWSClient({
  url: `ws://localhost:3001`,
});

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000',
    }),
    wsLink({
      client: wsClient,
    }),
  ],
});
