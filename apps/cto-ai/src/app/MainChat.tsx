import { Button, Input } from '@cto-ai/components';
import { Send } from 'lucide-react';
import { useState } from 'react';

import { chatStore, runPromptsClaude } from '../stores/chat-store';
import { HumanMessage } from '../llms/messages/HumanMessage';

export function MainChat() {
  const messages = chatStore.use('messages');
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
      <div className="flex flex-col-reverse overflow-y-scroll flex-1">
        {messages
          .flatMap((msg) => msg.toRawMessages())
          .slice()
          .reverse()
          .map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === 'assistant'
                  ? 'text-blue-600'
                  : 'text-green-600'
              }`}
            >
              <strong>
                {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
              </strong>
              <div
                dangerouslySetInnerHTML={{
                  __html: message.content
                    .replace(/\n/g, '<br>')
                    .replace(/```(.+?)```/gs, '<pre><code>$1</code></pre>'),
                }}
              />
            </div>
          ))}
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
