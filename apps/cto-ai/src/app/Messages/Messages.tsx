import { capitalize } from '@cto-ai/shared-helpers';
import { useMemo, useState } from 'react';
import { Badge } from '@cto-ai/components';
import { CustomMessageRender } from './CustomMessageRender';
import { CustomMessage } from '../../llms/messages/Messages';
import { chatStore } from '../../stores/chat-store';

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
  assistant: 'text-blue-600',
  user: 'text-green-600',
  system: 'text-slate-600',
} satisfies Record<CustomMessage['role'], string>;

/**Wraps an entire group of messages from the same role (system, assistant, user)
 * and allows toggling raw vs simplified view */
export function MessageGroupWrapper({
  messages,
}: {
  messages: CustomMessage[];
}) {
  const role = messages[0].role;
  const [mode, setMode] = useState<'RAW' | 'SIMPLIFIED'>('SIMPLIFIED');

  if (messages.length === 0) {
    throw new Error('MessageGroupWrapper: messages array is empty');
  }

  if (!messages.every((message) => message.role === role)) {
    throw new Error('MessageGroupWrapper: not all messages have the same role');
  }

  console.log(messages);

  const messageRender = useMemo(() => {
    if (mode === 'RAW') {
      return (
        <pre>
          <code>
            {messages
              .flatMap((msg) =>
                msg.toRawMessages().flatMap((rawMsg) => rawMsg.content)
              )
              .join()}
          </code>
        </pre>
      );
    }
    return messages.map((msg, idx) => (
      <CustomMessageRender key={idx} message={msg} />
    ));
  }, [mode, messages]);

  return (
    <div className={`mb-4 ${MESSAGE_GROUP_COLORS[messages[0].role]}`}>
      <div className="flex gap-2 mb-2">
        <strong>{capitalize(role)}</strong>
        <Badge
          className="cursor-pointer"
          onClick={() => setMode(mode === 'RAW' ? 'SIMPLIFIED' : 'RAW')}
        >
          {mode}
        </Badge>
      </div>
      {messageRender}
    </div>
  );
}
