import { createBetterStore } from '@cto-ai/shared-helpers';
import { GeneratedFolder } from '@cto-ai/shared-types';
import { trpc } from '../client';

export const fileStore = createBetterStore({
  rootFolder: undefined as GeneratedFolder | undefined,
});
console.log('hello!');
trpc.files.getWorkingDirFolderStructure.query().then((fileTree) => {
  console.log(fileTree);
  if (!fileTree) return;
  fileStore.set('rootFolder', fileTree as GeneratedFolder);
});
