import { FilesObj, GeneratedFile, GeneratedFolder } from '@taffy/shared-types';
import fs from 'fs/promises';
import { z } from 'zod';
import { extractWorkspacePath, getFilesObj, getFullPath } from '../files';
import { publicProcedure, router } from '../trpc';
import { observable } from '@trpc/server/observable';
import * as vscode from 'vscode';
import { ee } from '../event-emitter';
import { latestActiveEditor } from '../main';
import { previewFileChange } from '../files/preview-file-change';
import { getWorkspaceFiles } from '../files/get-folder-structure';
import { FileEditor } from '../files/file-editor';
import { fileStore, finishedIndexing } from '../files/file-indexer';
import fuzzysort from 'fuzzysort';
import path from 'path';

function getIndentLen(line: string) {
  return (line.match(/^\s*/)?.[0] ?? '').replace(/\t/g, '    ').length;
}

export const fileRouter = router({
  getWorkingDirFilesObj: publicProcedure.query(async (): Promise<FilesObj> => {
    return getFilesObj();
  }),
  onSelectionChange: publicProcedure.subscription(() => {
    return observable<NonNullable<ReturnType<typeof getSelectionData>>>(
      (emit) => {
        const sendSelectionData = () => {
          const selectionData = getSelectionData(latestActiveEditor);
          if (!selectionData) return;
          emit.next(selectionData);
        };

        sendSelectionData();

        ee.on('mainKeyboardShortcutPressed', sendSelectionData);

        return () => {
          ee.removeListener('mainKeyboardShortcutPressed', sendSelectionData);
        };
      }
    );
  }),
  indexingCompleted: publicProcedure.query(async () => {
    await finishedIndexing;
    return { success: true };
  }),
  searchFiles: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async (opts) => {
      await finishedIndexing;
      const allFiles = [...fileStore.get('filePaths')];
      const matchResults = fuzzysort.go(opts.input.query, allFiles, {
        threshold: 0.5,
        limit: 6,
      });

      return matchResults;
    }),
  getWorkspaceFiles: publicProcedure.query(() => getWorkspaceFiles()),
  getFileDiskContentsByPath: publicProcedure
    .input(z.object({ filePath: z.string() }))
    .query(async (opts) => {
      const { filePath: rawFilePath } = opts.input;
      const filePath = getFullPath(rawFilePath);
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
  /**Gets the file contents currently, even if the file is still being edited */
  getFileContents: publicProcedure
    .input(z.object({ filePath: z.string() }))
    .query(async (opts) => {
      const { filePath } = opts.input;
      try {
        const editor = new FileEditor(filePath);
        const contents = await editor.getContents();
        return contents;
      } catch {
        return undefined;
      }
    }),
  getPathContents: publicProcedure
    .input(z.object({ filePath: z.string() }))
    .query(async (opts) => {
      const { filePath } = opts.input;
      const fullPath = getFullPath(filePath);
      try {
        const stat = await fs.stat(fullPath);
        if (stat.isFile()) {
          const editor = new FileEditor(filePath);
          const editorContents = await editor.getContents();
          if (!editorContents) {
            throw new Error('Expected there to be editor contents!');
          }
          const contents = editorContents;
          return { type: 'file' as const, contents };
        } else if (stat.isDirectory()) {
          const files = await fs.readdir(fullPath);
          return {
            type: 'directory' as const,
            contents: await Promise.all(
              files.map(async (file) => {
                const subPath = path.posix.join(fullPath, file);
                const subStat = await fs.stat(subPath);
                return {
                  fullPath: subPath,
                  type: subStat.isFile() ? 'FILE' : 'DIR',
                };
              })
            ),
          };
        }
      } catch {}
      return { type: 'non-existent' as const, contents: 'Path does not exist' };
    }),
  previewFileChange: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        newContents: z.string(),
        id: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { fileName, newContents, id } = opts.input;
      await previewFileChange(fileName, newContents, id);
      return {};
    }),
  approveFileChange: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      const { id } = opts.input;
      console.log('Approving file change', id);
      ee.emit('fileChangeApproved', id);
      return {};
    }),
  removeFileChange: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      const { id } = opts.input;
      ee.emit('fileChangeRemoved', id);
      return {};
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
        preview: z.boolean(),
      })
    )
    .mutation(async (opts) => {
      const { filePath: rawFilePath, lineData, content, preview } = opts.input;
      const filePath = getFullPath(rawFilePath);

      focusInEditor(filePath, lineData?.start);
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
            const replaceBlock = preview
              ? [
                  '<<<<<<< CURRENT',
                  ...fileLines.slice(start - 1, end),
                  '=======',
                  content,
                  '>>>>>>> SUGGESTION',
                ]
              : [content];

            updatedLines = [
              ...fileLines.slice(0, start - 1),
              ...replaceBlock,
              ...fileLines.slice(end),
            ];
          } else {
            updatedLines = [content];
          }

          await fs.writeFile(filePath, updatedLines.join('\n'), 'utf8');
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      }
    }),
});

const focusInEditor = async (
  filePath: string,
  lineNumber: number | undefined
) => {
  let editor = latestActiveEditor;

  if (!editor || editor.document.fileName !== filePath) {
    const document = await vscode.workspace.openTextDocument(filePath);
    editor = await vscode.window.showTextDocument(document, editor?.viewColumn);
  }

  const position = new vscode.Position(lineNumber ?? 0, 0);
  const range = new vscode.Range(position, position);
  editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
  editor.selection = new vscode.Selection(position, position);
};

const getSelectionData = (editor: vscode.TextEditor | undefined) => {
  if (!editor) return undefined;
  const fileName = extractWorkspacePath(editor.document.fileName);
  if (!fileName) {
    throw new Error('Could not find relative filename!');
  }
  const selectedText = editor.document.getText(editor.selection);
  const fullFileContents = editor.document.getText();
  const allLines = fullFileContents.split('\n');

  // Expand selection
  const startLine = editor.selection.start.line;
  const endLine = editor.selection.end.line;

  editor.selection = new vscode.Selection(
    new vscode.Position(startLine, 0),
    new vscode.Position(endLine, allLines[endLine].length)
  );

  const selectedLineNumbers = {
    start: startLine + 1,
    end: endLine + 1,
  };

  return {
    fullFileContents,
    selectedLineNumbers,
    selectedText,
    fileName,
  };
};
