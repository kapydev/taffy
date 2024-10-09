import { capitalize } from '@taffy/shared-helpers';
import { useMemo, useState } from 'react';
import { Badge } from '@taffy/components';
import { CustomMessage } from '../../llms/messages/Messages';
import { chatStore, getRawMessages } from '../../stores/chat-store';
import { SystemPromptMessage } from '../../llms/messages/SystemPromptMessage';
import { ToolMessage } from '../../llms/messages/ToolMessage';
import { SystemPromptRender } from './SystemPromptRender';
import { ToolMessageRender } from './ToolMessageRender';

export function Messages() {
  const messages = chatStore.use('messages');
  const groupedMessages = messages.reduce((acc, message) => {
    const lastGroup = acc[acc.length - 1];
    if (!lastGroup || lastGroup[0].role !== message.role) {
      acc.push([message]);
    } else {
      lastGroup.push(message);
    }
    return acc;
  }, [] as CustomMessage[][]);

  return (
    <div>
      {groupedMessages.map((group, index) => (
        <MessageGroupWrapper key={index} messages={group} />
      ))}
    </div>
  );
}

const MESSAGE_GROUP_COLORS = {
  assistant: 'text-vsc-debugTokenExpression-name',
  user: 'text-vsc-debugTokenExpression-type',
  system: 'text-vsc-debugTokenExpression-value',
} satisfies Record<CustomMessage['role'], string>;

/**Wraps an entire group of messages from the same role (system, assistant, user)
 * and allows toggling raw vs simplified view */
export function MessageGroupWrapper({
  messages,
}: {
  messages: CustomMessage[];
}) {
  const role = messages[0].role;

  if (messages.length === 0) {
    throw new Error('MessageGroupWrapper: messages array is empty');
  }

  if (!messages.every((message) => message.role === role)) {
    throw new Error('MessageGroupWrapper: not all messages have the same role');
  }

  return (
    <div className="flex flex-col gap-3 mb-3">
      {messages.map((message) => (
        <SingleMessage key={message.id} message={message} />
      ))}
    </div>
  );
}

function SingleMessage({ message }: { message: CustomMessage }) {
  const showVerbose = chatStore.use('showVerboseMessages');
  const hiddenByDefault = useMemo(() => {
    if (message instanceof SystemPromptMessage) return true;
    if (message.type === 'ASSISTANT_PLANNING') return true;
    return false;
  }, [message]);

  if (hiddenByDefault && !showVerbose) return undefined;

  if (message instanceof SystemPromptMessage) {
    return <SystemPromptRender message={message} />;
  } else if (message instanceof ToolMessage) {
    return <ToolMessageRender message={message} />;
  }
}
