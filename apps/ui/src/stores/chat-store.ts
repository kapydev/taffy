import { createBetterStore } from '@taffy/shared-helpers';
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
import { getPossibleModes } from './possible-modes';

/**If you need the same functionality for multiple completion modes, you can include the keywords together.
 * By doing that, we can use the str.contains() function to determin the behaviour
 */
export type CompletionMode = 'full'; //| 'edit' | 'inline' | 'inline-edit';

export const chatStore = createBetterStore({
  messages: [new SystemPromptMessage()] as CustomMessage[],
  llm: null as LLM | null,
  /**
   * full - Can edit multiple files, and full files
   * edit - For fixing a previous prompt
   * inline-edit - For fixing a previous inline prompt
   * inline - For editing a specific part of the code
   */
  mode: 'full' as CompletionMode,
  showSettings: false as boolean,
  showVerboseMessages: false as boolean,
});

//@ts-expect-error for debugging
window.chatStore = chatStore;

export const keyStore = createBetterStore(
  {
    claudeKey: '',
    gptKey: '',
    // deepSeekKey: '',
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

export async function getInlineStopSequence(): Promise<string | undefined> {
  const latestFile = await getLatestFocusedContent();
  if (!latestFile) {
    throw new Error('Could not find latest file for inline prompting');
  }

  const getTrimmedLines = (str: string) => {
    return str.split('\n').map((line) => line.trim());
  };

  const allLines = getTrimmedLines(latestFile.fullContents);
  const postSelectionLines = getTrimmedLines(latestFile.postSelection);

  for (const line of postSelectionLines) {
    if (allLines.filter((l) => l === line).length !== 1) continue;
    return line;
  }

  return undefined;
}

export async function continuePrompt(
  mode: CompletionMode,
  llm: LLM | null = chatStore.get('llm')
) {
  if (!llm) {
    llm = setLlm();
  }

  const rawMessages = getRawMessages(chatStore.get('messages'));
  const parser = new LLMOutputParser();
  const stopSequences: string[] = [];
  if (mode.includes('inline')) {
    const additionalStopSeq = await getInlineStopSequence();
    if (additionalStopSeq) {
      stopSequences.push(additionalStopSeq);
    }
  }
  const stream = llm.prompt(rawMessages, stopSequences);

  await parser.handleTextStream(stream, mode);

  if (parser.earlyExit) {
    //If we had an error, run again
    continuePrompt(mode, llm);
  }
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
export function getSelectionDetailsByContent(
  fullContents: string,
  startLine: number,
  endLine: number
) {
  const preSelection =
    fullContents
      .split('\n')
      .slice(0, startLine - 1)
      .join('\n') ?? '';
  const selection =
    fullContents
      .split('\n')
      .slice(startLine - 1, endLine)
      .join('\n') ?? '';
  const postSelection =
    fullContents.split('\n').slice(endLine).join('\n') ?? '';

  return {
    preSelection,
    selection,
    postSelection,
  };
}

export async function getSelectionDetailsByFile(
  filePath: string,
  startLine: number,
  endLine: number
) {
  const curContents = await trpc.files.getFileContents.query({
    filePath,
  });
  if (curContents === undefined) return undefined;
  const { preSelection, selection, postSelection } =
    getSelectionDetailsByContent(curContents, startLine, endLine);
  return {
    fullContents: curContents,
    preSelection,
    selection,
    postSelection,
  };
}

export async function getLatestFocusedContent() {
  const fileContextMsg = [...getToolMessagesWithoutErrors()]
    .reverse()
    .find((msg) => msg.type === 'USER_FOCUS_BLOCK');

  if (!fileContextMsg?.isType('USER_FOCUS_BLOCK') || !fileContextMsg.props)
    return undefined;

  const startLine = +fileContextMsg.props.startLine;
  const endLine = +fileContextMsg.props.endLine;
  const result = await getSelectionDetailsByFile(
    fileContextMsg.props.filePath,
    startLine,
    endLine
  );

  if (result === undefined) return undefined;

  return {
    ...result,
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
    const selectionDetails = getSelectionDetailsByContent(
      data.fullFileContents,
      data.selectedLineNumbers.start,
      data.selectedLineNumbers.end
    );

    // const fileSelectionMessage = createToolMessage('USER_FILE_CONTENTS', {
    //   body: data.fullFileContents,
    //   props: {
    //     filePath: data.fileName,
    //   },
    // });
    const fullContents =
      selectionDetails.preSelection +
      '\n{FOCUS_START}\n' +
      selectionDetails.selection +
      '\n{FOCUS_END}\n' +
      selectionDetails.postSelection;
    const fileFocusMessage = createToolMessage('USER_FOCUS_BLOCK', {
      body: fullContents,
      props: {
        startLine: String(data.selectedLineNumbers.start),
        endLine: String(data.selectedLineNumbers.end),
        filePath: data.fileName,
      },
    });
    chatStore.set('messages', [
      ...curMsgs,
      // fileSelectionMessage,
      fileFocusMessage,
    ]);
  },
});

chatStore.subscribe('messages', () => {
  /**TODO: Allow editing in multi file mode - right now there are the following edge cases:
   * 1. After the edit, the diff view is quite strange
   * 2. Need to add state for edits that have already been accepted and those who have not been
   */
  chatStore.set('mode', getPossibleModes()[0]);
});

export function removeMessage<T extends ToolType>(message: ToolMessage<T>) {
  chatStore.set('messages', [
    ...chatStore.get('messages').filter((someMsg) => someMsg !== message),
  ]);
  if (!message.type) return;
  const renderTemplate = TOOL_RENDER_TEMPLATES[message.type];
  renderTemplate.onRemove?.(message);
}

export function getToolMessagesWithoutErrors(): ToolMessage[] {
  const allMessages = chatStore.get('messages');
  return allMessages.filter(
    (msg): msg is ToolMessage =>
      msg instanceof ToolMessage && msg.type !== 'USER_TOOL_ERROR'
  );
}

export async function addAddtionalContext(filePath: string) {
  const data = await trpc.files.getFileContents.query({ filePath });
  const additionalCtxMsg = createToolMessage('USER_FILE_CONTENTS', {
    body: data !== undefined ? data : 'The file does not exist', // Assuming full file contents are fetched elsewhere,
    props: {
      filePath,
      exists: String(data !== undefined),
    },
  });
  chatStore.set('messages', [...chatStore.get('messages'), additionalCtxMsg]);
}

// export async function setAdditionalContext(fileNames: string[]) {
//   const currentMessages = chatStore.get('messages');
//   const newMessages = currentMessages.filter(
//     (msg) => !(msg instanceof ToolMessage && msg.type === 'USER_FILE_CONTENTS')
//   );

//   const newFileContentMessages = (
//     await Promise.all(
//       fileNames.map(async (filePath) => {
//         const data = await trpc.files.getFileContents.query({ filePath });
//         if (data === undefined) return undefined;
//         return createToolMessage('USER_FILE_CONTENTS', {
//           body: data, // Assuming full file contents are fetched elsewhere,
//           props: {
//             filePath: filePath,
//           },
//         });
//       })
//     )
//   ).filter(booleanFilter);

//   const lastFocusIndex = newMessages.findIndex(
//     (msg) => msg instanceof ToolMessage && msg.type === 'USER_FOCUS_BLOCK'
//   );

//   if (lastFocusIndex === -1) {
//     chatStore.set('messages', [...newMessages, ...newFileContentMessages]);
//   } else {
//     chatStore.set('messages', [
//       ...newMessages.slice(0, lastFocusIndex),
//       ...newFileContentMessages,
//       ...newMessages.slice(lastFocusIndex),
//     ]);
//   }
// }
