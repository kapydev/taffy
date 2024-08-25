import { GeneratedFolder } from '@cto-ai/shared-types';
import { getFolderStructure } from '../files';
import { publicProcedure, router } from '../trpc';

export const fileRouter = router({
  getWorkingDirFolderStructure: publicProcedure.query(
    (): Promise<GeneratedFolder> => {
      return getFolderStructure();
    }
  ),
});
