import { FilesObj, GeneratedFile } from '@taffy/shared-types';
import type { AppRouter } from '@taffy/vsc-ext/types';
import { inferProcedureOutput } from '@trpc/server';
import { trpc } from '../client';
import { chatStore, resetChatStore } from './chat-store';
import { createBetterStore } from './create-better-store';
import { createToolMessage } from '../llms/messages/ToolMessage';

export const fileStore = createBetterStore({
  files: undefined as FilesObj | undefined,
  selectionData: undefined as
    | inferProcedureOutput<AppRouter['files']['onSelectionChange']>
    | undefined,
});

export async function getFileContentsByPath(
  filePath: string
): Promise<GeneratedFile | undefined> {
  const data = await trpc.files.getFileByPath.query({ filePath });
  const curFiles = fileStore.get('files');
  if (!curFiles || !data) return data;
  curFiles[filePath] = data;
  fileStore.set('files', curFiles);
  return data;
}

export async function updateFileContentsByPath(
  filePath: string,
  contents: string,
  preview: boolean,
  lineData?: {
    start: number;
    end: number;
  }
): Promise<void> {
  await trpc.files.updateFileByPath.mutate({
    filePath,
    lineData,
    content: contents,
    preview,
  });
  const data = await trpc.files.getFileByPath.query({ filePath });
  if (!data) throw new Error('File not found');

  const curFiles = fileStore.get('files');
  if (curFiles) {
    curFiles[filePath] = data;
    fileStore.set('files', curFiles);
  }
}

trpc.files.getWorkingDirFilesObj.query().then((fileTree) => {
  if (!fileTree) return;
  fileStore.set('files', fileTree as FilesObj);
  const msgs = chatStore.get('messages');
  if (msgs.length > 0) return;
  resetChatStore();
});

trpc.files.onSelectionChange.subscribe(undefined, {
  onData: (data) => {
    const curMsgs = chatStore.get('messages');
    fileStore.set('selectionData', data);
    const fileSelectionMessage = createToolMessage('FILE_CONTENTS', {
      body: data.fullFileContents,
      props: {
        startLine: String(data.selectedLineNumbers.start),
        endLine: String(data.selectedLineNumbers.end),
        filePath: data.fileName,
      },
    });
    chatStore.set('messages', [...curMsgs, fileSelectionMessage]);
  },
});
