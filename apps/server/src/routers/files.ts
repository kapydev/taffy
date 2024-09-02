import { GeneratedFile, GeneratedFolder } from '@cto-ai/shared-types';
import { getFolderStructure } from '../files';
import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import fs from 'fs/promises';

export const fileRouter = router({
  getWorkingDirFolderStructure: publicProcedure.query(
    (): Promise<GeneratedFolder> => {
      return getFolderStructure();
    }
  ),
  getFileByPath: publicProcedure
    .input(z.object({ filePath: z.string() }))
    .query(async (opts) => {
      const { filePath } = opts.input;
      try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const generatedFile: GeneratedFile = {
          name: filePath.split('/').pop() || '',
          content: fileContents,
          contentEncoding: 'utf8',
        };
        return generatedFile;
      } catch (error) {
        return undefined;
      }
    }),
});
