import { ToolMessage } from '../llms/messages/ToolMessage';
import { toolToToolString } from '../llms/messages/tools';
import {
  chatStore,
  CompletionMode,
  getLatestFileContent,
  getToolMessages,
  removeMessage,
} from './chat-store';

export async function updateChat(input: string, mode: CompletionMode) {
  if (mode === 'full') {
    return await updateChatFull(input);
  } else if (mode === 'edit') {
    return await updateChatEdit(input);
  } else if (mode === 'inline') {
    return await updateChatInline(input);
  }
}

async function updateChatInline(input: string) {
  const latestFile = await getLatestFileContent();
  if (!latestFile) {
    throw new Error('Could not get latest file context');
  }
  const { preSelection, props } = latestFile;

  const userPromptMessage = new ToolMessage(
    toolToToolString('USER_PROMPT', {
      body: input,
      props: {},
    })
  );

  const thinkingStartFence =
    (preSelection.length > 0 ? '\n' : '') + '{THINKING_START}\n';

  const preAssistantPrompt = new ToolMessage(
    toolToToolString(
      'ASSISTANT_WRITE_FILE',
      {
        props: {
          filePath: props.filePath,
        },
        body: preSelection + thinkingStartFence,
      },
      { excludeEnd: true }
    )
  );

  chatStore.set('messages', [
    ...chatStore.get('messages'),
    userPromptMessage,
    preAssistantPrompt,
  ]);
}

async function updateChatFull(input: string) {
  chatStore.set('messages', [
    ...chatStore.get('messages'),
    new ToolMessage(
      toolToToolString('USER_PROMPT', {
        body: input,
        props: {},
      })
    ),
  ]);
}

async function updateChatEdit(input: string) {
  const messages = getToolMessages();
  const latestUserPrompt = [...messages]
    .reverse()
    .find((msg) => msg.type === 'USER_PROMPT');
  if (!latestUserPrompt) return;
  latestUserPrompt.body += ',' + input;

  const messagesAfterPrompt = messages.slice(
    messages.indexOf(latestUserPrompt) + 1
  );
  messagesAfterPrompt.forEach((msg) => {
    removeMessage(msg);
  });
}
