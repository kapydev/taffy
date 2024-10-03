import { ToolMessage } from '../llms/messages/ToolMessage';
import { chatStore, getToolMessages, removeMessage } from './chat-store';
import { toolToToolString } from '../llms/messages/tools';
import { trpc } from '../client';

export async function runPrompt(input: string, mode = chatStore.get('mode')) {
  //We can't do inline mode if there is no codebase context

  if (mode === 'full') {
    return await runPromptFull(input);
  } else if (mode === 'edit') {
    return await runPromptEdit(input);
  } else if (mode === 'inline') {
    return await runPromptInline(input);
  }
}

async function runPromptInline(input: string) {
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
  let preContents = curContents?.slice(0, startLine) ?? '';
  preContents += '\n{THINKING_START}\n';

  const preAssistantPrompt = new ToolMessage(
    toolToToolString('ASSISTANT_WRITE_FILE', {
      props: {
        filePath: fileContextMsg.props.filePath,
      },
      body: preContents,
    })
  );

  chatStore.set('messages', [
    ...chatStore.get('messages'),
    userPromptMessage,
    preAssistantPrompt,
  ]);
}

async function runPromptFull(input: string) {
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

async function runPromptEdit(input: string) {
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
