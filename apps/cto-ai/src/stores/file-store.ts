import { createBetterStore } from '@cto-ai/shared-helpers';
import { FilesObj, GeneratedFile } from '@cto-ai/shared-types';
import { trpc } from '../client';
import { chatStore, resetChatStore } from './chat-store';

export const fileStore = createBetterStore({
  files: undefined as FilesObj | undefined,
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
  lineData?: {
    start: number;
    end: number;
  }
): Promise<void> {
  await trpc.files.updateFileByPath.mutate({
    filePath,
    lineData,
    content: contents,
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
  onData: (data) => {},
});
