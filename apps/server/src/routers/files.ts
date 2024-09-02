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
  updateFileByPath: publicProcedure
    .input(
      z.object({
        filePath: z.string(),
        startLine: z.number(),
        endLine: z.number(),
        content: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { filePath, startLine, endLine, content } = opts.input;
      try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const fileLines = fileContents.split('\n');
        const updatedLines = [
          ...fileLines.slice(0, startLine - 1),
          content,
          ...fileLines.slice(endLine),
        ];
        await fs.writeFile(filePath, updatedLines.join('\n'), 'utf8');
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }),
});
