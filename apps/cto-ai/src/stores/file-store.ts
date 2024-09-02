import { createBetterStore } from '@cto-ai/shared-helpers';
import { GeneratedFile, GeneratedFolder } from '@cto-ai/shared-types';
import { trpc } from '../client';
import { SystemPromptMessage } from '../llms/messages/SystemPromptMessage';
import { chatStore } from './chat-store';

export const fileStore = createBetterStore({
  rootFolder: undefined as GeneratedFolder | undefined,
});

export function getFileContentsByPath(
  filePath: string
): GeneratedFile | undefined {
  const traverseFolder = (
    folder: GeneratedFolder,
    pathParts: string[]
  ): GeneratedFile | undefined => {
    if (pathParts.length === 0) {
      return undefined;
    }

    const [currentPart, ...remainingParts] = pathParts;

    if (remainingParts.length === 0) {
      for (const file of folder.files) {
        if (file.name === currentPart) {
          return file;
        }
      }
      return undefined;
    }

    for (const subFolder of folder.subFolders) {
      if (subFolder.name === currentPart) {
        return traverseFolder(subFolder, remainingParts);
      }
    }

    return undefined;
  };

  const rootFolder = fileStore.get('rootFolder');
  if (!rootFolder) {
    return undefined;
  }

  const pathParts = filePath.split('/');
  return traverseFolder(rootFolder, pathParts);
}

trpc.files.getWorkingDirFolderStructure.query().then((fileTree) => {
  if (!fileTree) return;
  const rootFolder = fileTree as GeneratedFolder;
  fileStore.set('rootFolder', rootFolder);
  const msgs = chatStore.get('messages');
  if (msgs.length > 0) return;
  chatStore.set('messages', [new SystemPromptMessage(rootFolder)]);
});
