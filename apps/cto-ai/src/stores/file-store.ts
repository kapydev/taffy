import { createBetterStore } from '@cto-ai/shared-helpers';
import { GeneratedFolder } from '@cto-ai/shared-types';
import { trpc } from '../client';
import { SystemPromptMessage } from '../llms/messages/SystemPromptMessage';
import { chatStore } from './chat-store';

export const fileStore = createBetterStore({
  rootFolder: undefined as GeneratedFolder | undefined,
});

trpc.files.getWorkingDirFolderStructure.query().then((fileTree) => {
  if (!fileTree) return;
  const rootFolder = fileTree as GeneratedFolder;
  fileStore.set('rootFolder', rootFolder);
  const msgs = chatStore.get('messages');
  if (msgs.length > 0) return;
  chatStore.set('messages', [new SystemPromptMessage(rootFolder)]);
});
