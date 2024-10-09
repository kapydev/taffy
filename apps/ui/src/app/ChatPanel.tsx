import { useEffect, useMemo, useRef, useState } from 'react';
import { Messages } from './Messages';
import { RichTextArea } from './RichTextArea';
import { chatStore, resetChatStore } from '../stores/chat-store';
import { booleanFilter } from '@taffy/shared-helpers';
import { SystemPromptMessage } from '../llms/messages/SystemPromptMessage';
import { ToolMessage } from '../llms/messages/ToolMessage';
import {
  Badge,
  Button,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@taffy/components';
import { getFileName } from '../utils/fileUtils';
import { File } from 'lucide-react';

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
          <div className="flex flex-col gap-0.5 w-full relative">
            <ContextArea />
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

function ContextArea() {
  const hints = ['"@" to add a context file', '"Ctrl+L" to add ALL files'];

  const filesCtx = useCurFilesContext();

  return (
    <div className="flex flex-row items-center">
      <div className="flex gap-1">
        {filesCtx.map((filePath, index) => (
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="default"
                className="bg-vsc-input-background rounded-md pb-[3px] font-normal cursor-default"
              >
                {getFileName(filePath)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-vsc-input-background px-2 py-1 border-vsc-disabledForeground">
              <p className="text-[10px]">{filePath}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="flex gap-1 items-center py-2 pl-3 rounded-t-md text-xs text-vsc-disabledForeground leading-tight select-none">
        {hints.map((hint) => (
          <span className="italic mb-0.5">{hint}, </span>
        ))}
      </div>
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
