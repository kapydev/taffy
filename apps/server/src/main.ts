import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import cors from 'cors';
import './files';
import { fileRouter } from './routers/files';
import { createContext, router } from './trpc';
import ws from 'ws';

const BACKEND_PORT = 3000;
const WS_PORT = 3001;

const wss = new ws.Server({
  port: WS_PORT,
});

export const appRouter = router({
  files: fileRouter,
});

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext,
  // Enable heartbeat messages to keep connection open (disabled by default)
  keepAlive: {
    enabled: true,
    // server ping message interval in milliseconds
    pingMs: 30000,
    // connection is terminated if pong message is not received in this many milliseconds
    pongWaitMs: 5000,
  },
});

const server = createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext,
});

console.log('Server listening');
server.listen(BACKEND_PORT);

wss.on('connection', (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once('close', () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log(
  `✅ WebSocket Server listening on ws://localhost:${WS_PORT}
✅ HTTP Server listening on localhost:${BACKEND_PORT}`
);
process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handler.broadcastReconnectNotification();
  wss.close();
});
