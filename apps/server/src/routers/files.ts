import { GeneratedFile, GeneratedFolder } from '@cto-ai/shared-types';
import fs from 'fs/promises';
import { z } from 'zod';
import { getFilesObj, getFolderStructure } from '../files';
import { publicProcedure, router } from '../trpc';

export const fileRouter = router({
  getWorkingDirFilesObj: publicProcedure.query(
    async (): Promise<Record<string, GeneratedFile>> => {
      return getFilesObj();
    }
  ),
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
        lineData: z
          .object({
            start: z.number(),
            end: z.number(),
          })
          .optional(),
        content: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { filePath, lineData, content } = opts.input;
      if (lineData === undefined) {
        await fs.writeFile(filePath, content, 'utf-8');
        return { success: true };
      } else {
        try {
          const fileContents = await fs.readFile(filePath, 'utf8');
          const fileLines = fileContents.split('\n');
          let updatedLines;
          if (lineData) {
            const { start, end } = lineData;
            updatedLines = [
              ...fileLines.slice(0, start - 1),
              content,
              ...fileLines.slice(end),
            ];
          } else {
            updatedLines = [content];
          }

          await fs.writeFile(filePath, updatedLines.join('\n'), 'utf8');
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    }),
});
