import { ToolMessage } from '../llms/messages/ToolMessage';
import { chatStore, removeMessage } from './chat-store';
import { toolToToolString } from '../llms/messages/tools';

export function runPrompt(input: string, mode = chatStore.get('mode')) {
  if (mode === 'full') {
    runPromptFull(input);
  } else if (mode === 'edit') {
    runPromptEdit(input);
  } else if (mode === 'inline') {
    runPrompInline(input);
  }
}

function runPrompInline(input: string) {}

function runPromptFull(input: string) {
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

function runPromptEdit(input: string) {
  const messages = chatStore.get('messages');
  const latestUserPrompt = [...messages]
    .reverse()
    .find((msg) => msg instanceof ToolMessage && msg.type === 'USER_PROMPT');
  if (!latestUserPrompt) return;
  if (!(latestUserPrompt instanceof ToolMessage)) return;
  latestUserPrompt.body += ',' + input;

  const messagesAfterPrompt = messages.slice(
    messages.indexOf(latestUserPrompt) + 1
  );
  messagesAfterPrompt.forEach((msg) => {
    if (!(msg instanceof ToolMessage)) return;
    removeMessage(msg);
  });
}
