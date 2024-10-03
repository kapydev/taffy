import { addLineNumbers } from '@taffy/shared-helpers';
import { RawMessage } from '@taffy/shared-types';
import { trpc } from '../client';
import { LLM } from '../llms/base-llm';
import { Claude } from '../llms/claude';
import { GPT } from '../llms/gpt';
import { LLMOutputParser } from '../llms/messages/LLMOutputParser';
import { CustomMessage } from '../llms/messages/Messages';
import { SystemPromptMessage } from '../llms/messages/SystemPromptMessage';
import { createToolMessage, ToolMessage } from '../llms/messages/ToolMessage';
import { TOOL_RENDER_TEMPLATES, ToolType } from '../llms/messages/tools';
import { createBetterStore } from './create-better-store';

export type CompletionMode = 'full' | 'edit' | 'inline';

export const chatStore = createBetterStore({
  messages: [new SystemPromptMessage()] as CustomMessage[],
  llm: null as LLM | null,
  /**
   * full - Can edit multiple files, and full files
   * edit - For fixing a previous prompt
   * inline - For editing a specific part of the code
   */
  mode: 'inline' as CompletionMode,
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

export async function continuePrompt(
  mode: CompletionMode,
  llm: LLM | null = chatStore.get('llm')
) {
  if (!llm) {
    llm = setLlm();
  }

  const rawMessages = getRawMessages(chatStore.get('messages'));
  const parser = new LLMOutputParser();
  let stopSequences: string[] = [];
  if (mode === 'inline') {
    const latestFile = await getLatestFileContent();
    if (!latestFile) {
      throw new Error('Could not find latest file for inline prompting');
    }
    //TODO: Need to make sure stop sequence is unique, otherwise when there is repeating code might have issues stopping
    stopSequences = [latestFile.postSelection.split('\n')[0].trim()];
  }
  const stream = llm.prompt(rawMessages, stopSequences);

  await parser.handleTextStream(stream);
}

export function getRawMessages(messages: CustomMessage[]): RawMessage[] {
  const rawMsgs = messages.flatMap((msg) => msg.toRawMessages());
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

export async function getLatestFileContent() {
  const fileContextMsg = [...getToolMessages()]
    .reverse()
    .find((msg) => msg.type === 'USER_FILE_CONTENTS');

  if (!fileContextMsg?.isType('USER_FILE_CONTENTS') || !fileContextMsg.props)
    return undefined;

  const curContents = await trpc.files.getFileContents.query({
    filePath: fileContextMsg.props.filePath,
  });
  if (!curContents) return undefined;
  const startLine = +fileContextMsg.props.startLine;
  const endLine = +fileContextMsg.props.endLine;

  const preSelection =
    curContents
      .split('\n')
      .slice(0, startLine - 1)
      .join('\n') ?? '';
  const selection =
    curContents
      .split('\n')
      .slice(startLine - 1, endLine)
      .join('\n') ?? '';
  const postSelection = curContents.split('\n').slice(endLine).join('\n') ?? '';

  return {
    preSelection,
    selection,
    postSelection,
    props: fileContextMsg.props,
  };
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
  const toolMessages = getToolMessages();
  const latestMsg = toolMessages.at(-1);
  /**TODO: Allow editing in multi file mode - right now there are the following edge cases:
   * 1. After the edit, the diff view is quite strange
   * 2. Need to add state for edits that have already been accepted and those who have not been
   */
  if (
    toolMessages.filter((m) => m.type === 'ASSISTANT_WRITE_FILE').length ===
      1 &&
    latestMsg?.type === 'ASSISTANT_WRITE_FILE'
  ) {
    chatStore.set('mode', 'edit');
  } else if (toolMessages.some((msg) => msg.isType('USER_FILE_CONTENTS'))) {
    chatStore.set('mode', 'inline');
  } else {
    chatStore.set('mode', 'full');
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

export function getToolMessages(): ToolMessage[] {
  const allMessages = chatStore.get('messages');
  return allMessages.filter((msg) => msg instanceof ToolMessage);
}
