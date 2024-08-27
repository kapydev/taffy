import { createBetterStore } from '@cto-ai/shared-helpers';
import { GeneratedFolder } from '@cto-ai/shared-types';
import { trpc } from '../client';
import { SystemPromptMessage } from '../llms/messages/SystemPromptMessage';
import { chatStore } from './chat-store';
import { HumanMessage } from '../llms/messages/HumanMessage';
import { AssistantMessage } from '../llms/messages/AssistantMessage';

export const fileStore = createBetterStore({
  rootFolder: undefined as GeneratedFolder | undefined,
});

trpc.files.getWorkingDirFolderStructure.query().then((fileTree) => {
  if (!fileTree) return;
  const rootFolder = fileTree as GeneratedFolder;
  fileStore.set('rootFolder', rootFolder);
  const msgs = chatStore.get('messages');
  if (msgs.length > 0) return;
  chatStore.set('messages', [
    new SystemPromptMessage(rootFolder),
    new HumanMessage('Please tell me how to implement a gpt adapter'),
    new AssistantMessage(
`To implement a gpt adapter, we can look at how the claude.ts adapter is implemented, and implement it based on that.

I will need access to the base-llm.ts and claude.ts files to fully understand how to do it.

{ACTION READ_FILE {"file":"apps/cto-ai/src/llms/claude.ts"}}
{END_ACTION READ_FILE}

{ACTION READ_FILE {"file":"apps/cto-ai/src/llms/base-llm.ts"}}
{END_ACTION READ_FILE}`
    ),
  ]);
});
