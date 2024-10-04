import { Badge, Button, Textarea } from '@taffy/components';
import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { chatStore, continuePrompt } from '../stores/chat-store';
import { updateChat } from '../stores/update-prompt';
import { Messages } from './Messages';
import { getPossibleModes } from '../stores/possible-modes';

export function ChatPanel() {
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

  const toggleMode = () => {
    const possibleModes = getPossibleModes();
    const currentModeIndex = possibleModes.indexOf(mode);

    let newMode;
    if (
      currentModeIndex === -1 ||
      currentModeIndex === possibleModes.length - 1
    ) {
      newMode = possibleModes[0];
    } else {
      newMode = possibleModes[currentModeIndex + 1];
    }

    chatStore.set('mode', newMode);
  };

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
    <div className="flex flex-col p-4 flex-1">
      <div className="flex-1 relative">
        <div
          ref={scrollAreaRef}
          className="flex flex-col-reverse overflow-x-auto overflow-y-auto inset-0 absolute"
        >
          <Messages />
        </div>
      </div>
      <div className="flex mt-4 flex-col">
        <Badge onClick={toggleMode} className="self-start cursor-pointer">
          {mode}
        </Badge>
        <div className="flex">
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
            className="flex-1 mr-2"
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
