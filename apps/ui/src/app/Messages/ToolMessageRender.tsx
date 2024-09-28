import { ToolMessage } from '../../llms/messages/ToolMessage';
import {
  TOOL_RENDER_TEMPLATES,
  Tools,
  ToolType,
} from '../../llms/messages/tools';
import { BaseMessageRender } from './BaseMessageRender';

export function ToolMessageRender<T extends ToolType>({
  message,
}: {
  message: ToolMessage<T>;
}) {
  const { type } = message;
  if (!type) return;

  return (
    <BaseMessageRender
      icon={TOOL_RENDER_TEMPLATES[type].icon}
      title={TOOL_RENDER_TEMPLATES[type].title(message)}
      description={TOOL_RENDER_TEMPLATES[type].description(message)}
    />
  );
}
