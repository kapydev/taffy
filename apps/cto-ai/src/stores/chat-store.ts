import { createBetterStore } from '@cto-ai/shared-helpers';
import { LLM } from '../llms/base-llm';
import { Claude } from '../llms/claude';
import { LLMOutputParser } from '../llms/messages/LLMOutputParser';
import { CustomMessage } from '../llms/messages/Messages';
import { RawMessage } from '@cto-ai/shared-types';

export const chatStore = createBetterStore({
  messages: [] as CustomMessage[],
});

//@ts-expect-error for debugging
window.chatStore = chatStore;

export const keyStore = createBetterStore(
  {
    claudeKey: '',
  },
  { persistKey: 'key-store' }
);

export async function runPromptsClaude() {
  const claudeKey = keyStore.get('claudeKey');
  if (claudeKey === '') {
    throw new Error('Missing Claude key!');
  }
  const claude = new Claude(claudeKey);
  return runPrompts(claude);
}

async function runPrompts(llm: LLM) {
  const curMsgs = chatStore.get('messages');

  const rawMessages = getRawMessages();
  const parser = new LLMOutputParser();
  const stream = llm.prompt(rawMessages);

  await parser.handleTextStream(stream, () => {
    chatStore.set('messages', [...curMsgs, ...parser.getMessages()]);
  });
}

function getRawMessages(): RawMessage[] {
  const curMsgs = chatStore.get('messages');
  const rawMsgs = curMsgs.flatMap((msg) => msg.toRawMessages());
  const concatenatedMessages = rawMsgs.reduce((acc, rawMsg) => {
    const lastMessage = acc[acc.length - 1];
    if (lastMessage && lastMessage.role === rawMsg.role) {
      lastMessage.content += rawMsg.content;
    } else {
      acc.push(rawMsg);
    }
    return acc;
  }, [] as RawMessage[]);

  return concatenatedMessages;
}
