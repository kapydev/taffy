import { Alert, AlertDescription, AlertTitle, Button } from '@taffy/components';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ButtonWithHotkey } from '../../components/ButtonWithHotkey';
import { ToolMessage } from '../../llms/messages/ToolMessage';
import { TOOL_RENDER_TEMPLATES, ToolType } from '../../llms/messages/tools';
import { chatStore, removeMessage } from '../../stores/chat-store';
import Markdown from 'react-markdown';

export function ToolMessageRender<T extends ToolType>({
  message,
}: {
  message: ToolMessage<T>;
}) {
  const allMessages = chatStore.use('messages');
  const [mode, setMode] = useState<'RAW' | 'SIMPLIFIED'>('SIMPLIFIED');

  const { type } = message;
  if (!type) return;
  const renderTemplate = TOOL_RENDER_TEMPLATES[type];

  const messageIndex = allMessages.indexOf(message);
  const isLatestMessage = messageIndex === allMessages.length - 1;
  const keyPrefix = isLatestMessage
    ? `ctrl+`
    : `ctrl+${allMessages.length - messageIndex}+`;

  const getRaw = () => (
    <code className="break-words whitespace-pre-wrap">
      {message.toRawMessages().flatMap((rawMsg) => rawMsg.content)}
    </code>
  );

  const isUserPrompt = message.type === 'USER_PROMPT';

  return (
    <div className="flex gap-2.5">
      {/* TODO Add this icon back don't just yeet the bug stephen */}
      {/* <renderTemplate.Icon className="w-4 h-4 mt-3.5" /> */}
      <Alert
        className={`${
          isUserPrompt
            ? 'bg-transparent border-vsc-disabledForeground'
            : 'border-none'
        } w-auto`}
      >
        <AlertTitle className="flex flex-wrap w-full justify-between mb-2 gap-2 leading-snug text-xs">
          <div className="flex gap-1.5 mr-5">
            {/* TITLE */}
            {renderTemplate.title(message)}

            {/* EXPAND BUTTON */}
            <Button
              size="icon"
              variant="ghost"
              className="cursor-pointer w-3.5 h-3.5"
              onClick={() => setMode(mode === 'RAW' ? 'SIMPLIFIED' : 'RAW')}
            >
              {mode === 'SIMPLIFIED' && <ChevronDown className="w-4 h-4" />}
              {mode === 'RAW' && <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>

          <div
            className={`flex items-center justify-end text-xs ${
              message.loading && 'hidden'
            }`}
          >
            {/* ACTION BUTTON */}
            {renderTemplate.actions?.map((meta) => {
              return (
                <ButtonWithHotkey
                  className="text-vsc-foreground"
                  action={() => meta.action(message)}
                  keys={keyPrefix + meta.shortcutEnd}
                >
                  <div className="text-[11px] whitespace-nowrap border-[0.5px] border-vsc-foreground rounded-md px-2 py-1 scale-90">
                    {meta.name}
                  </div>
                </ButtonWithHotkey>
              );
            })}
            {/* DELETE BUTTON */}
            {message.type === 'USER_FOCUS_BLOCK' && (
              <ButtonWithHotkey
                className="text-vsc-errorForeground"
                action={() => removeMessage(message)}
                keys={`${keyPrefix}del`}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-vsc-errorForeground w-3.5 h-3.5"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </ButtonWithHotkey>
            )}
          </div>
        </AlertTitle>
        <AlertDescription className="break-words whitespace-pre-wrap w-full text-xs">
          {mode === 'RAW'
            ? message
                .toRawMessages()
                .flatMap((rawMsg) => rawMsg.content)
                .join()
            : renderTemplate.body(message)}
        </AlertDescription>
      </Alert>
    </div>
  );
}
