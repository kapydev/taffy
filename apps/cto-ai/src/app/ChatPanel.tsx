import { Button, Input, Textarea } from '@cto-ai/components';
import { Send } from 'lucide-react';
import { useState } from 'react';

import { HumanMessage } from '../llms/messages/HumanMessage';
import { chatStore, runPrompts } from '../stores/chat-store';
import { Messages } from './Messages';
import { vscApi } from '../common/vsc-api';

export function ChatPanel() {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const scrollArea = document.querySelector('.scroll-area');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
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
      <div className="flex flex-col-reverse overflow-x-auto flex-1">
        <Messages />
      </div>
      <div className="flex mt-4">
        <Textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            vscApi.postMessage({ hhh: e.target.value });
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
