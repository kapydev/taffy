import { Button } from '@taffy/components';
import { ChevronRight, Settings } from 'lucide-react';
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
  const showSettings = chatStore.use('showSettings');

  const runTestFunc = () => {
    // console.log(chatStore.get('messages'));
    trpc.testFunc.query();
  };

  return (
    <div
      className={`relative ${
        showSettings ? 'w-64' : 'hidden'
      } flex flex-col bg-background p-4 overflow-auto flex-shrink-0 self-stretch mr-3`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className='flex gap-2 items-center'>
          <Settings className="w-4 h-4" />
          <h2 className="text-base font-semibold mb-0.5">Settings</h2>
        </div>
        <ChevronRight
          className={`w-4 h-4 cursor-pointer transform transition-transform ${
            showSettings ? 'rotate-180' : ''
          }`}
          onClick={() => chatStore.set('showSettings', !showSettings)}
        />
      </div>
      <div className="flex flex-col flex-1 gap-3">
        <Button size="sm" onClick={resetChatStore}>
          Reset Chat
        </Button>
        <Button size="sm" onClick={runTestFunc}>
          Test Func
        </Button>
        <KeyInput />
      </div>
    </div>
  );
}
