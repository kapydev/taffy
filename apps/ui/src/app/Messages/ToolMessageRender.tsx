import { Alert, AlertDescription, AlertTitle } from '@taffy/components';
import { ToolMessage } from '../../llms/messages/ToolMessage';
import { TOOL_RENDER_TEMPLATES, ToolType } from '../../llms/messages/tools';
import { chatStore } from '../../stores/chat-store';

export function ToolMessageRender<T extends ToolType>({
  message,
}: {
  message: ToolMessage<T>;
}) {
  const { type } = message;
  if (!type) return;

  const remove = () => {
    chatStore.set('messages', [
      ...chatStore.get('messages').filter((someMsg) => someMsg !== message),
    ]);
  };
  const Icon = TOOL_RENDER_TEMPLATES[type].icon;
  const title = TOOL_RENDER_TEMPLATES[type].title(message);
  const description = TOOL_RENDER_TEMPLATES[type].description(message);

  return (
    <Alert>
      <Icon className="w-4 h-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      <div className="flex gap-2">
        <button className="text-vsc-errorForeground" onClick={remove}>
          Remove
        </button>
        {/* {onApprove && (
          <button className="text-vsc-foreground" onClick={onApprove}>
            Approve
          </button>
        )} */}
      </div>
    </Alert>
  );
}
