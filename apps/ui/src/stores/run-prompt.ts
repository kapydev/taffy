import { ToolMessage } from '../llms/messages/ToolMessage';
import { chatStore, getToolMessages, removeMessage } from './chat-store';
import { toolToToolString } from '../llms/messages/tools';
import { trpc } from '../client';

export async function updateChat(input: string, mode = chatStore.get('mode')) {
  if (mode === 'full') {
    return await updateChatFull(input);
  } else if (mode === 'edit') {
    return await updateChatEdit(input);
  } else if (mode === 'inline') {
    return await updateChatInline(input);
  }
}

async function updateChatInline(input: string) {
  const curMessages = getToolMessages();

  const fileContextMsg = [...curMessages]
    .reverse()
    .find((msg) => msg.type === 'USER_FILE_CONTENTS');

  if (
    !fileContextMsg?.isType('USER_FILE_CONTENTS') ||
    fileContextMsg.props === undefined
  ) {
    throw new Error('No USER_FILE_CONTENTS message found');
  }

  const userPromptMessage = new ToolMessage(
    toolToToolString('USER_PROMPT', {
      body: input,
      props: {},
    })
  );
  const curContents = await trpc.files.getFileContents.query({
    filePath: fileContextMsg.props.filePath,
  });
  const startLine = +fileContextMsg.props.startLine;
  let preContents =
    curContents?.split('\n').slice(0, startLine).join('\n') ?? '';
  preContents += '\n{THINKING_START}\n';

  const preAssistantPrompt = new ToolMessage(
    toolToToolString(
      'ASSISTANT_WRITE_FILE',
      {
        props: {
          filePath: fileContextMsg.props.filePath,
        },
        body: preContents,
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
