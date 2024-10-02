import { createBetterStore } from './create-better-store';
import { LLM } from '../llms/base-llm';
import { Claude } from '../llms/claude';
import { LLMOutputParser } from '../llms/messages/LLMOutputParser';
import { RawMessage } from '@taffy/shared-types';
import { GPT } from '../llms/gpt';
import { SystemPromptMessage } from '../llms/messages/SystemPromptMessage';
import { CustomMessage } from '../llms/messages/Messages';
import { trpc } from '../client';
import { createToolMessage, ToolMessage } from '../llms/messages/ToolMessage';
import { addLineNumbers } from '@taffy/shared-helpers';
import { TOOL_RENDER_TEMPLATES, ToolType } from '../llms/messages/tools';

export const chatStore = createBetterStore({
  messages: [new SystemPromptMessage()] as CustomMessage[],
  llm: null as LLM | null,
  mode: 'normal' as 'normal' | 'edit',
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
    //TODO: If taffy window is still active, we should probably add to context instead of completely new
    resetChatStore();
    const curMsgs = chatStore.get('messages');
    const fileSelectionMessage = createToolMessage('USER_FILE_CONTENTS', {
      body: addLineNumbers(data.fullFileContents),
      props: {
        startLine: String(data.selectedLineNumbers.start),
        endLine: String(data.selectedLineNumbers.end),
        filePath: data.fileName,
      },
    });
    chatStore.set('messages', [...curMsgs, fileSelectionMessage]);
  },
});

chatStore.subscribe('messages', (messages) => {
  const latestMsg = messages.at(-1);
  /**TODO: Allow editing in multi file mode - right now there are the following edge cases:
   * 1. After the edit, the diff view is quite strange
   * 2. Need to add state for edits that have already been accepted and those who have not been
   */
  if (
    messages.filter(
      (m) => m instanceof ToolMessage && m.type === 'ASSISTANT_WRITE_FILE'
    ).length === 1 &&
    latestMsg instanceof ToolMessage &&
    latestMsg.type === 'ASSISTANT_WRITE_FILE'
  ) {
    chatStore.set('mode', 'edit');
  } else {
    chatStore.set('mode', 'normal');
  }
});

export function removeMessage<T extends ToolType>(message: ToolMessage<T>) {
  chatStore.set('messages', [
    ...chatStore.get('messages').filter((someMsg) => someMsg !== message),
  ]);
  if (!message.type) return;
  const renderTemplate = TOOL_RENDER_TEMPLATES[message.type];
  renderTemplate.onRemove?.(message);
}
