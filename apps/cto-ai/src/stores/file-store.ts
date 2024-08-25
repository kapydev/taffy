import {
  createBetterStore,
  prettyPrintGeneratedFolder,
} from '@cto-ai/shared-helpers';
import { GeneratedFolder } from '@cto-ai/shared-types';
import { trpc } from '../client';
import { chatStore } from './chat-store';

export const fileStore = createBetterStore({
  rootFolder: undefined as GeneratedFolder | undefined,
});

trpc.files.getWorkingDirFolderStructure.query().then((fileTree) => {
  if (!fileTree) return;
  const rootFolder = fileTree as GeneratedFolder;
  fileStore.set('rootFolder', rootFolder);
  const prettyFileTree = prettyPrintGeneratedFolder(rootFolder);
  const msgs = chatStore.get('messages');
  if (msgs.length > 0) return;
  chatStore.set('messages', [
    ...msgs,
    {
      role: 'system',
      content: prettyFileTree,
    },
  ]);
});
