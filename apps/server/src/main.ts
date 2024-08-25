import { publicProcedure, router } from './trpc';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';

export const appRouter = router({
  userList: publicProcedure.query(async () => {
    // Retrieve users from a datasource, this is an imaginary database
    console.log('hey');
    return ['hello worldd'];
  }),
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
