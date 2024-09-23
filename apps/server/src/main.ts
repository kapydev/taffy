import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { fileRouter } from './routers/files';
import { createContext, router } from './trpc';

const logger = console

const BACKEND_PORT = 3000;
const WS_PORT = 3001;

const wss = new WebSocketServer({
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

logger.log('Server listening');
server.listen(BACKEND_PORT);

wss.on('connection', (ws) => {
  logger.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once('close', () => {
    logger.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
logger.log(
  `✅ WebSocket Server listening on ws://localhost:${WS_PORT}
✅ HTTP Server listening on localhost:${BACKEND_PORT}`
);
process.on('SIGTERM', () => {
  logger.log('SIGTERM');
  handler.broadcastReconnectNotification();
  wss.close();
});
