import { createBetterStore, updateFileByKey } from '@cto-ai/shared-helpers';
import { GeneratedFile, GeneratedFolder } from '@cto-ai/shared-types';
import { trpc } from '../client';
import { chatStore, resetChatStore } from './chat-store';

export const fileStore = createBetterStore({
  files: undefined as Record<string, GeneratedFile> | undefined,
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

  const curFolder = fileStore.get('rootFolder');
  if (curFolder) {
    updateFileByKey(curFolder, filePath, data);
    fileStore.set('rootFolder', curFolder);
  }
}

trpc.files.getWorkingDirFolderStructure.query().then((fileTree) => {
  if (!fileTree) return;
  const rootFolder = fileTree as GeneratedFolder;
  fileStore.set('rootFolder', rootFolder);
  const msgs = chatStore.get('messages');
  if (msgs.length > 0) return;
  resetChatStore();
});
