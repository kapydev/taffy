import { ToolMessage } from '../llms/messages/ToolMessage';
import { toolToToolString } from '../llms/messages/tools';
import {
  chatStore,
  CompletionMode,
  getLatestFocusedContent,
  getToolMessagesWithoutErrors,
  removeMessage,
} from './chat-store';

export async function updateChat(input: string, mode: CompletionMode) {
  if (mode.includes('edit')) {
    await updateChatEdit(input);
  } else {
    await updateChatFull(input);
  }

  if (mode.includes('inline')) {
    return await addInlinePrePrompt();
  }
}

async function addInlinePrePrompt() {
  const latestFile = await getLatestFocusedContent();
  if (!latestFile) {
    throw new Error('Could not get latest file context');
  }
  const { preSelection, props } = latestFile;

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

  chatStore.set('messages', [...chatStore.get('messages'), preAssistantPrompt]);
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
  const messages = getToolMessagesWithoutErrors();
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
