import { Badge, Button, Textarea } from '@taffy/components';
import { Send, Settings } from 'lucide-react';
import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { chatStore, removeMessage, runPrompts } from '../stores/chat-store';
import { Messages } from './Messages';
import { ToolMessage } from '../llms/messages/ToolMessage';
import { toolToToolString } from '../llms/messages/tools';

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
      latestUserPrompt.body += ',' + input;

      const messagesAfterPrompt = messages.slice(
        messages.indexOf(latestUserPrompt) + 1
      );
      messagesAfterPrompt.forEach((msg) => {
        if (!(msg instanceof ToolMessage)) return;
        removeMessage(msg);
      });
    }
    setInput('');
    runPrompts();
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
        {/* <Badge className="self-start">{mode}</Badge> */}
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
            <Button
              className="hover:bg-white/10 w-8 h-8 shadow-none"
              size="icon"
              variant="default"
              onClick={handleSend}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
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
