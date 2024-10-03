import { Button } from '@taffy/components';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { chatStore, resetChatStore } from '../stores/chat-store';
import { ChatPanel } from './ChatPanel';
import { KeyInput } from './KeyInput';
import { trpc } from '../client';

export function MainChat() {
  return (
    <div className="flex h-full w-full">
      <LeftPanel />
      <ChatPanel />
    </div>
  );
}

function LeftPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  const runTestFunc = () => {
    console.log(chatStore.get('messages'));
    // trpc.testFunc.query();
  };

  if (!isExpanded) {
    return (
      <ChevronRight
        className={`absolute top-2 left-2 cursor-pointer transform transition-transform`}
        onClick={() => setIsExpanded(!isExpanded)}
      />
    );
  }

  return (
    <div
      className={`relative ${
        isExpanded ? 'w-64' : 'w-8'
      } flex flex-col bg-background p-4 overflow-auto flex-shrink-0 self-stretch`}
    >
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold mb-4">Options</h2>
        <ChevronRight
          className={`cursor-pointer transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        />
      </div>
      <div className="flex flex-col justify-between flex-1">
        <Button onClick={resetChatStore}>Reset Chat</Button>
        <Button onClick={runTestFunc}>Test Func</Button>
        <KeyInput />
      </div>
    </div>
  );
}
