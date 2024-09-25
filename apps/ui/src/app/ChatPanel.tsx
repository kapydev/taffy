import { Button, Textarea } from '@cto-ai/components';
import { Send } from 'lucide-react';
import { useState } from 'react';

import { useEffect, useRef } from 'react';
import { HumanMessage } from '../llms/messages/HumanMessage';
import { chatStore, runPrompts } from '../stores/chat-store';
import { Messages } from './Messages';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWindowFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    };

    handleWindowFocus();
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
    setInput('');
    chatStore.set('messages', [
      ...chatStore.get('messages'),
      new HumanMessage(input),
    ]);
    runPrompts();
  };

  return (
    <div className="flex flex-col p-4 flex-1">
      <div
        ref={scrollAreaRef}
        className="flex flex-col-reverse overflow-x-auto flex-1"
      >
        <Messages />
      </div>
      <div className="flex mt-4">
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
  );
}
