import { trpc } from '../client';

trpc.userList.query().then(console.log);
