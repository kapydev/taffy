import { createBetterStore } from './create-better-store';
import { LLM } from '../llms/base-llm';
import { Claude } from '../llms/claude';
import { LLMOutputParser } from '../llms/messages/LLMOutputParser';
import { CustomMessage } from '../llms/messages/Messages';
import { RawMessage } from '@cto-ai/shared-types';
import { GPT } from '../llms/gpt';
import { fileStore } from './file-store';
import { SystemPromptMessage } from '../llms/messages/SystemPromptMessage';

export const chatStore = createBetterStore({
  messages: [] as CustomMessage[],
  llm: null as LLM | null,
});

//@ts-expect-error for debugging
window.chatStore = chatStore;

export const keyStore = createBetterStore(
  {
    claudeKey: '',
    gptKey: '',
    deepSeekKey: '',
  },
  { persistKey: 'key-store' }
);

const setLlm = () => {
  let curLlm = chatStore.get('llm');
  if (curLlm) return curLlm;
  if (keyStore.get('gptKey')) {
    chatStore.set('llm', new GPT(keyStore.get('gptKey')));
  } else if (keyStore.get('claudeKey')) {
    chatStore.set('llm', new Claude(keyStore.get('claudeKey')));
  }
  curLlm = chatStore.get('llm');
  if (curLlm) return curLlm;
  throw new Error('Missing LLM Key!');
};

export async function runPrompts(llm: LLM | null = chatStore.get('llm')) {
  if (!llm) {
    llm = setLlm();
  }
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

export function resetChatStore() {
  const rootFolder = fileStore.get('files');
  if (!rootFolder) return;
  chatStore.set('messages', [new SystemPromptMessage(rootFolder)]);
}
