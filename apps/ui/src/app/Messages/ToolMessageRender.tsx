import { Alert, AlertDescription, AlertTitle } from '@taffy/components';
import { ToolMessage } from '../../llms/messages/ToolMessage';
import { TOOL_RENDER_TEMPLATES, ToolType } from '../../llms/messages/tools';
import { chatStore, removeMessage } from '../../stores/chat-store';
import { ButtonWithHotkey } from '../../components/ButtonWithHotkey';

export function ToolMessageRender<T extends ToolType>({
  message,
}: {
  message: ToolMessage<T>;
}) {
  const allMessages = chatStore.use('messages');
  const { type } = message;
  if (!type) return;
  const renderTemplate = TOOL_RENDER_TEMPLATES[type];

  const messageIndex = allMessages.indexOf(message);
  const isLatestMessage = messageIndex === allMessages.length - 1;
  const keyPrefix = isLatestMessage
    ? `ctrl+`
    : `ctrl+${allMessages.length - messageIndex}+`;

  return (
    <Alert>
      <renderTemplate.Icon className="w-4 h-4" />
      <AlertTitle>{renderTemplate.title(message)}</AlertTitle>
      <AlertDescription className="break-words whitespace-pre-wrap">
        {renderTemplate.description(message)}
      </AlertDescription>
      <div className={`flex gap-2 ${message.loading && 'hidden'}`}>
        <ButtonWithHotkey
          className="text-vsc-errorForeground"
          action={() => removeMessage(message)}
          keys="ctrl+del"
          keysPretty="Ctrl+Del"
        >
          <span>Remove</span>
        </ButtonWithHotkey>
        {renderTemplate.actions?.map((meta) => {
          return (
            <ButtonWithHotkey
              className="text-vsc-foreground"
              action={() => meta.action(message)}
              keys={keyPrefix + meta.shortcutEnd}
            >
              {meta.name}
            </ButtonWithHotkey>
          );
        })}
      </div>
    </Alert>
  );
}
