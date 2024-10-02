import { Alert, AlertDescription, AlertTitle } from '@taffy/components';
import { ToolMessage } from '../../llms/messages/ToolMessage';
import { TOOL_RENDER_TEMPLATES, ToolType } from '../../llms/messages/tools';
import { chatStore, removeMessage } from '../../stores/chat-store';
import { useMemo } from 'react';

export function ToolMessageRender<T extends ToolType>({
  message,
}: {
  message: ToolMessage<T>;
}) {
  const { type } = message;
  if (!type) return;
  const renderTemplate = TOOL_RENDER_TEMPLATES[type];

  const description = useMemo(() => {
    const result = renderTemplate.description(message);
    return result;
  }, [message.contents]);

  return (
    <Alert>
      <renderTemplate.Icon className="w-4 h-4" />
      <AlertTitle>{renderTemplate.title(message)}</AlertTitle>
      <AlertDescription className="break-words whitespace-pre-wrap">
        {description}
      </AlertDescription>
      <div className={`flex gap-2 ${message.loading && 'hidden'}`}>
        <button
          className="text-vsc-errorForeground"
          onClick={() => removeMessage(message)}
        >
          Remove
        </button>
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
