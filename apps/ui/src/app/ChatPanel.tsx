import { Button, Separator, Textarea } from '@taffy/components';
import { Send, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ButtonWithHotkey } from '../components/ButtonWithHotkey';
import { chatStore, continuePrompt } from '../stores/chat-store';
import { updateChat } from '../stores/update-prompt';
import { Messages } from './Messages';
import { RichTextArea } from './RichTextArea';

export function ChatPanel() {
  const showSettings = chatStore.use('showSettings');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // const mode = chatStore.use('mode');
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    setInput('');
    const mode = chatStore.get('mode');
    await updateChat(input, mode);
    await continuePrompt(mode);
  };

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
        {/* <ButtonWithHotkey
          action={toggleModeHandler.action}
          keys="ctrl+m"
          keysPretty="Ctrl+M"
        >
          <Badge>{mode}</Badge>
        </ButtonWithHotkey> */}
        <div className="flex gap-2 mt-2">
          <div className="flex flex-col w-full relative">
            <Hints />
            <Separator className="bg-vsc-disabledForeground opacity-70 h-[0.8px]" />
            <div className="relative">
              <RichTextArea
                onSend={() => {
                  if (scrollAreaRef.current) {
                    scrollAreaRef.current.scrollTop =
                      scrollAreaRef.current.scrollHeight;
                  }
                }}
              />
              {/* <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 pr-10 border-none text-xs rounded-t-none"
              /> */}
              <div className="flex flex-col absolute right-0 inset-y-0 p-1.5">
                <ButtonWithHotkey hideHint keys="enter" action={handleSend}>
                  <Button
                    className="hover:bg-white/10 w-8 h-8 shadow-none"
                    size="icon"
                    variant="default"
                    onClick={handleSend}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </ButtonWithHotkey>
                <Button
                  className="hover:bg-white/10 w-8 h-8 shadow-none"
                  size="icon"
                  variant="default"
                  onClick={() => chatStore.set('showSettings', !showSettings)}
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hints() {
  const hints = [
    'Key "@" to add context files.',
    'Press Ctrl+L to add codebase files to the context',
  ];
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHintIndex((prevIndex) => (prevIndex + 1) % hints.length);
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, [hints.length]);

  const handleClick = () => {
    setCurrentHintIndex((prevIndex) => (prevIndex + 1) % hints.length);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-vsc-input-background py-1 pl-3 rounded-t-md text-xs text-vsc-disabledForeground select-none cursor-pointer"
    >
      {hints[currentHintIndex]}
    </div>
  );
}
