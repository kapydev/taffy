import { createBetterStore } from '@cto-ai/shared-helpers';
import { GeneratedFile, GeneratedFolder } from '@cto-ai/shared-types';
import { trpc } from '../client';
import { SystemPromptMessage } from '../llms/messages/SystemPromptMessage';
import { chatStore } from './chat-store';
import { HumanMessage } from '../llms/messages/HumanMessage';
import { AssistantMessage } from '../llms/messages/AssistantMessage';
import { LLMOutputParser } from '../llms/messages/LLMOutputParser';
import path from 'path';

export const fileStore = createBetterStore({
  rootFolder: undefined as GeneratedFolder | undefined,
});

function getFileContentsByPath(filePath: string): GeneratedFile | undefined {
  const traverseFolder = (
    folder: GeneratedFolder,
    targetPath: string
  ): GeneratedFile | undefined => {
    for (const file of folder.files) {
      if (path.posix.join(folder.name, file.name) === targetPath) {
        return file;
      }
    }
    for (const subFolder of folder.subFolders) {
      const result = traverseFolder(subFolder, targetPath);
      if (result) {
        return result;
      }
    }
    return undefined;
  };

  const rootFolder = fileStore.get('rootFolder');
  if (!rootFolder) {
    return undefined;
  }

  return traverseFolder(rootFolder, filePath);
}

trpc.files.getWorkingDirFolderStructure.query().then((fileTree) => {
  if (!fileTree) return;
  const rootFolder = fileTree as GeneratedFolder;
  fileStore.set('rootFolder', rootFolder);
  const msgs = chatStore.get('messages');
  if (msgs.length > 0) return;
  const parser = new LLMOutputParser();
  parser.parse(`To implement a gpt adapter, we can look at how the claude.ts adapter is implemented, and implement it based on that.

I will need access to the base-llm.ts and claude.ts files to fully understand how to do it.

{ACTION READ_FILE}
apps/cto-ai/src/llms/claude.ts
apps/cto-ai/src/llms/base-llm.ts
{END_ACTION READ_FILE}

We can proceed after the file contents are provided.`);
  chatStore.set('messages', [
    new SystemPromptMessage(rootFolder),
    new HumanMessage('Please tell me how to implement a gpt adapter'),
    ...parser.getMessages(),
  ]);
});
