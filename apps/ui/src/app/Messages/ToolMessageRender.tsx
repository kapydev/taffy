import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
} from '@taffy/components';
import { ToolMessage } from '../../llms/messages/ToolMessage';
import { TOOL_RENDER_TEMPLATES, ToolType } from '../../llms/messages/tools';
import { chatStore, removeMessage } from '../../stores/chat-store';
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Trash2 } from 'lucide-react';

export function ToolMessageRender<T extends ToolType>({
  message,
}: {
  message: ToolMessage<T>;
}) {
  const [mode, setMode] = useState<'RAW' | 'SIMPLIFIED'>('SIMPLIFIED');

  const { type } = message;
  if (!type) return;
  const renderTemplate = TOOL_RENDER_TEMPLATES[type];

  const description = useMemo(() => {
    const result = renderTemplate.description(message);
    return result;
  }, [message.contents]);

  const getRaw = () => (
    <code className="break-words whitespace-pre-wrap">
      {message.toRawMessages().flatMap((rawMsg) => rawMsg.content)}
    </code>
  );

  return (
    <div className="flex gap-2.5">
      <renderTemplate.Icon className="w-4 h-4 mt-3.5" />
      <Alert>
        <AlertTitle className="flex w-full mb-2 gap-2">
          <div className="w-full">
            {renderTemplate.title(message)}
            {/* ACTION BUTTON */}
            {renderTemplate.actions?.map((meta) => {
              return (
                <button
                  className="text-vsc-foreground ml-2 font-bold text-white"
                  onClick={() => meta.action(message)}
                >
                  {meta.name}
                </button>
              );
            })}
          </div>
          <div
            className={`flex items-center text-xs gap-2 ${
              message.loading && 'hidden'
            }`}
          >
            {/* DELETE BUTTON */}
            <Button
              size="icon"
              variant="ghost"
              className="text-vsc-errorForeground w-4 h-4"
              onClick={() => removeMessage(message)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            {/* SEE MORE BUTTON */}
            <Button
              size="icon"
              variant="ghost"
              className="cursor-pointer w-4 h-4"
              onClick={() => setMode(mode === 'RAW' ? 'SIMPLIFIED' : 'RAW')}
            >
              {mode === 'SIMPLIFIED' && <ChevronDown className="w-4 h-4" />}
              {mode === 'RAW' && <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>
        </AlertTitle>
        <AlertDescription className="break-words whitespace-pre-wrap w-full">
          {mode === 'RAW' ? getRaw() : description}
        </AlertDescription>
      </Alert>
    </div>
  );
}
