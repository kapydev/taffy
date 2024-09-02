import { Button, Input } from '@cto-ai/components';
import { Send } from 'lucide-react';
import { useState } from 'react';

import { chatStore, runPromptsClaude } from '../stores/chat-store';
import { HumanMessage } from '../llms/messages/HumanMessage';
import { Messages } from './Messages';

export function MainChat() {
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
    runPromptsClaude();
  };

  return (
    <div className="flex flex-col p-4 flex-1">
      <div className="flex flex-col-reverse overflow-x-scroll flex-1">
        <Messages />
      </div>
      <div className="flex mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          placeholder="Type your message..."
          className="flex-1 mr-2 h-10"
        />
        <Button onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
