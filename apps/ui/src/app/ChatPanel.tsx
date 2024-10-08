import { Badge, Button, Textarea } from '@taffy/components';
import { Send, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ButtonWithHotkey } from '../components/ButtonWithHotkey';
import { chatStore, continuePrompt } from '../stores/chat-store';
import { updateChat } from '../stores/update-prompt';
import { toggleModeHandler } from './KeyboardShortcuts/handlers';
import { Messages } from './Messages';

export function ChatPanel() {
  const showSettings = chatStore.use('showSettings');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const mode = chatStore.use('mode');
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const handleWindowFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    handleWindowFocus();
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
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
          className="flex flex-col-reverse overflow-x-auto overflow-y-auto inset-0 absolute"
        >
          <Messages />
        </div>
      </div>
      <div className="flex flex-col">
        <ButtonWithHotkey
          action={toggleModeHandler.action}
          keys="ctrl+m"
          keysPretty="Ctrl+M"
        >
          <Badge>{mode}</Badge>
        </ButtonWithHotkey>
        <div className="flex gap-2 relative mt-2">
          <Textarea
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
            className="flex-1 pr-10 border-none"
          />
          <div className="flex flex-col absolute right-0 inset-y-0 p-1.5 gap-1.5">
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
  );
}
