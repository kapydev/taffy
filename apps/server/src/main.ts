import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';
import './files';
import { fileRouter } from './routers/files';
import { router } from './trpc';

export const appRouter = router({
  files: fileRouter,
});

const server = createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext() {
    return {};
  },
});

console.log('Server listening');
server.listen(3000);
