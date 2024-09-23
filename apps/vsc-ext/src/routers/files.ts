import { FilesObj, GeneratedFile, GeneratedFolder } from '@cto-ai/shared-types';
// import fs from 'fs/promises';
import { z } from 'zod';
import { getFilesObj } from '../files';
import { publicProcedure, router } from '../trpc';
import { observable } from '@trpc/server/observable';
import * as vscode from 'vscode';
import { ee } from '../event-emitter';
import { latestActiveEditor } from '../main';

export const fileRouter = router({
  getWorkingDirFilesObj: publicProcedure.query(async (): Promise<FilesObj> => {
    return getFilesObj();
  }),
  onSelectionChange: publicProcedure.subscription(() => {
    const getSelectionData = (editor: vscode.TextEditor | undefined) => {
      if (!editor) return undefined;
      const fileName = editor.document.fileName;
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      const fullFileContents = editor.document.getText();
      const selectedLineNumbers = {
        start: selection.start.line + 1,
        end: selection.end.line + 1,
      };
      return {
        fullFileContents,
        selectedLineNumbers,
        selectedText,
        fileName,
      };
    };

    return observable<ReturnType<typeof getSelectionData>>((emit) => {
      const sendSelectionData = () => {
        emit.next(getSelectionData(latestActiveEditor));
      };

      sendSelectionData();
      
      ee.on('ctrlKPressed', sendSelectionData);

      return () => {
        ee.removeListener('ctrlKPressed', sendSelectionData);
      };
    });
  }),
  // getWorkingDirFolderStructure: publicProcedure.query(
  //   (): Promise<GeneratedFolder> => {
  //     return getFolderStructure();
  //   }
  // ),
  getFileByPath: publicProcedure
    .input(z.object({ filePath: z.string() }))
    .query(async (opts) => {
      const { filePath } = opts.input;
      try {
        const fileContents = 'TODO TODO TODO';
        // const fileContents = await fs.readFile(filePath, 'utf8');
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
        // await fs.writeFile(filePath, content, 'utf-8');
        return { success: true };
      } else {
        try {
          // const fileContents = await fs.readFile(filePath, 'utf8');
          const fileContents = 'TODO TODO TODO';
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

          // await fs.writeFile(filePath, updatedLines.join('\n'), 'utf8');
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      }
    }),
});
