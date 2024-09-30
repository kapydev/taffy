import { Badge, Button, Textarea } from '@taffy/components';
import { Send } from 'lucide-react';
import { useState } from 'react';

import { useEffect, useRef } from 'react';
import { chatStore, runPrompts } from '../stores/chat-store';
import { Messages } from './Messages';
import { ToolMessage } from '../llms/messages/ToolMessage';
import { toolToToolString } from '../llms/messages/tools';

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
    if (mode === 'normal') {
      chatStore.set('messages', [
        ...chatStore.get('messages'),
        new ToolMessage(
          toolToToolString('USER_PROMPT', {
            body: input,
            props: {},
          })
        ),
      ]);
    } else if (mode === 'edit') {
      const messages = chatStore.get('messages');
      const latestUserPrompt = [...messages]
        .reverse()
        .find(
          (msg) => msg instanceof ToolMessage && msg.type === 'USER_PROMPT'
        );
      if (!latestUserPrompt) return;
      if (!(latestUserPrompt instanceof ToolMessage)) return;
      latestUserPrompt.body += '.' + input;

      const newMessages = [
        ...messages.slice(0, messages.indexOf(latestUserPrompt) + 1),
      ];
      chatStore.set('messages', newMessages);
    }
    setInput('');
    runPrompts();
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
        <Badge className="self-start">{mode}</Badge>
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
