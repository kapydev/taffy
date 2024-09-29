import { createBetterStore } from './create-better-store';
import { LLM } from '../llms/base-llm';
import { Claude } from '../llms/claude';
import { LLMOutputParser } from '../llms/messages/LLMOutputParser';
import { RawMessage } from '@taffy/shared-types';
import { GPT } from '../llms/gpt';
import { SystemPromptMessage } from '../llms/messages/SystemPromptMessage';
import { CustomMessage } from '../llms/messages/Messages';
import { trpc } from '../client';
import { createToolMessage } from '../llms/messages/ToolMessage';

export const chatStore = createBetterStore({
  messages: [new SystemPromptMessage()] as CustomMessage[],
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
  const curMsgs = chatStore.get('messages');
  if (!llm) {
    llm = setLlm();
  }

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
      lastMessage.content += '\n' + rawMsg.content;
    } else {
      acc.push(rawMsg);
    }
    return acc;
  }, [] as RawMessage[]);

  return concatenatedMessages;
}

export function resetChatStore() {
  chatStore.set('messages', [new SystemPromptMessage()]);
}

trpc.files.onSelectionChange.subscribe(undefined, {
  onData: (data) => {
    const curMsgs = chatStore.get('messages');
    const fileSelectionMessage = createToolMessage('FILE_CONTENTS', {
      body: data.fullFileContents,
      props: {
        startLine: String(data.selectedLineNumbers.start),
        endLine: String(data.selectedLineNumbers.end),
        filePath: data.fileName,
      },
    });
    chatStore.set('messages', [...curMsgs, fileSelectionMessage]);
  },
});
