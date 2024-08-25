import { getFolderStructure } from '../files/folder-structure';
import { getWorkingDir } from '../helpers/get-working-dir';
import { publicProcedure, router } from '../trpc';

export const fileRouter = router({
  getFileTree: publicProcedure.query(() => {
    return getFolderStructure(getWorkingDir());
  }),
});
