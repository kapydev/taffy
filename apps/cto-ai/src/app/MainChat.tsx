import { Button, Input, ScrollArea } from '@cto-ai/components';
import { Send } from 'lucide-react';
import { useState } from 'react';

import { chatStore } from '../stores/chat-store';

export function MainChat() {
  const messages = chatStore.use('messages');
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      chatStore.set('messages', [
        ...chatStore.get('messages'),
        { role: 'human', content: input },
      ]);
      setInput('');
      // Here you would typically send the message to your chatbot/LLM
      // and then add its response to the messages
    }
  };
  return (
    <div className="flex flex-col p-4">
      <ScrollArea className="flex-1">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'ai' ? 'text-blue-600' : 'text-green-600'
            }`}
          >
            <strong>{message.role === 'ai' ? 'AI: ' : 'You: '}</strong>
            <div
              dangerouslySetInnerHTML={{
                __html: message.content
                  .replace(/\n/g, '<br>')
                  .replace(/```(.+?)```/gs, '<pre><code>$1</code></pre>'),
              }}
            />
          </div>
        ))}
      </ScrollArea>
      <div className="flex mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
