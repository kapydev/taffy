import { createBetterStore } from '@cto-ai/shared-helpers';
import { RawMessage } from '@cto-ai/shared-types';
import { Claude } from '../llms/claude';
import { CustomMessage } from '../llms/messages/Messages';
import { AssistantMessage } from '../llms/messages/AssistantMessage';
import { LLM } from '../llms/base-llm';

const initialMessages: RawMessage[] = [
  // { role: 'human', content: 'Hello, can you help me with React?' },
  // {
  //   role: 'ai',
  //   content:
  //     "Of course! I'd be happy to help you with React. What specific question or topic would you like assistance with?",
  // },
  // { role: 'human', content: 'How do I create a functional component?' },
  // {
  //   role: 'ai',
  //   content:
  //     "Creating a functional component in React is straightforward. Here's a basic example:\n\n```jsx\nimport React from 'react';\n\nconst MyComponent = () => {\n  return (\n    <div>\n      <h1>Hello, I'm a functional component!</h1>\n    </div>\n  );\n};\n\nexport default MyComponent;\n```\n\nThis creates a simple component that renders a heading. You can then use this component in other parts of your application like this:\n\n```jsx\nimport MyComponent from './MyComponent';\n\nfunction App() {\n  return (\n    <div>\n      <MyComponent />\n    </div>\n  );\n}\n```\n\nLet me know if you need any clarification or have more questions!",
  // },
];

export const chatStore = createBetterStore({
  messages: [] as CustomMessage[],
});

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

  const rawMessages = curMsgs.flatMap((msg) => msg.toRawMessages());
  const stream = llm.prompt(rawMessages);
  const assistantMessage = new AssistantMessage('');
  for await (const textChunk of stream) {
    assistantMessage.response += textChunk;

    chatStore.set('messages', [
      ...curMsgs,
      ...assistantMessage.toParsedMessages(),
    ]);
  }
}
