import { Alert, AlertDescription, AlertTitle } from '@taffy/components';
import { ToolMessage } from '../../llms/messages/ToolMessage';
import { TOOL_RENDER_TEMPLATES, ToolType } from '../../llms/messages/tools';
import { chatStore, removeMessage } from '../../stores/chat-store';
import { useMemo } from 'react';
import { ButtonWithHotkey } from '../../components/ShortcutWrapper';

export function ToolMessageRender<T extends ToolType>({
  message,
}: {
  message: ToolMessage<T>;
}) {
  const { type } = message;
  if (!type) return;
  const renderTemplate = TOOL_RENDER_TEMPLATES[type];

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
          keys="Ctrl+Bksp"
        >
          <span>Remove</span>
        </ButtonWithHotkey>
        {renderTemplate.actions?.map((meta) => {
          return (
            <button
              className="text-vsc-foreground"
              onClick={() => meta.action(message)}
            >
              {meta.name}
            </button>
          );
        })}
      </div>
    </Alert>
  );
}
