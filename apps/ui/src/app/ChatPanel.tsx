import { useEffect, useMemo, useRef, useState } from 'react';
import { Messages } from './Messages';
import { RichTextArea } from './RichTextArea';
import { chatStore } from '../stores/chat-store';
import { booleanFilter } from '@taffy/shared-helpers';
import { SystemPromptMessage } from '../llms/messages/SystemPromptMessage';
import { ToolMessage } from '../llms/messages/ToolMessage';

export function ChatPanel() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 relative">
        <div
          ref={scrollAreaRef}
          className="flex flex-col-reverse overflow-x-auto overflow-y-auto inset-0 absolute pr-2"
        >
          <Messages />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex gap-2 mt-2">
          <div className="flex flex-col w-full relative">
            <Hints />
            {/* <Separator className="bg-vsc-disabledForeground opacity-70 h-[0.8px]" /> */}
            <div className="relative">
              <RichTextArea
                onSend={() => {
                  if (scrollAreaRef.current) {
                    scrollAreaRef.current.scrollTop =
                      scrollAreaRef.current.scrollHeight;
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hints() {
  const hints = [
    'Key "@" to add context files',
    'Ctrl+L to add all files as context',
  ];
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHintIndex((prevIndex) => (prevIndex + 1) % hints.length);
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, [hints.length]);

  const handleClick = (increment: number) => {
    setCurrentHintIndex((prevIndex) => (prevIndex + increment) % hints.length);
  };

  const filesCtx = useCurFilesContext();

  return (
    <div className="flex gap-1 items-center bg-vsc-input-background py-2 pl-3 rounded-t-md text-xs text-vsc-disabledForeground select-none">
      <div className="text-red-500">
        There are currently {filesCtx.length} file(s) in the context window
      </div>
      {hints.map((hint) => (
        <span className="italic">{hint}, </span>
      ))}
    </div>
  );
}

export function useCurFilesContext() {
  const messages = chatStore.use('messages');
  const filesContext = useMemo(() => {
    return messages
      .map((msg) => {
        if (!(msg instanceof ToolMessage)) return undefined;
        if (
          !msg.isType('USER_FOCUS_BLOCK') &&
          !msg.isType('USER_FILE_CONTENTS')
        )
          return undefined;
        return msg.props?.filePath;
      })
      .filter(booleanFilter);
  }, [messages]);
  return filesContext;
}
