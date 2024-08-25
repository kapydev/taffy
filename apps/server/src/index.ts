import { publicProcedure, router } from './trpc';
import { createHTTPServer } from '@trpc/server/adapters/standalone';

export const appRouter = router({
  userList: publicProcedure.query(async () => {
    // Retrieve users from a datasource, this is an imaginary database

    return ['hello worldd'];
  }),
});

const server = createHTTPServer({
  router: appRouter,
});

server.listen(3000);
