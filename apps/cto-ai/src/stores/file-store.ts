import { createBetterStore } from '@cto-ai/shared-helpers';
import { GeneratedFolder } from '@cto-ai/shared-types';
import { trpc } from '../client';

const fileStore = createBetterStore({
  fileTree: {} as GeneratedFolder,
});

trpc.files.getFileTree.query().then((fileTree) => {
  if (!fileTree) return;
  //   fileStore.set('fileTree', fileTree);
});
