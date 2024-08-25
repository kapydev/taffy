import { Button, Input } from '@cto-ai/components';
import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { keyStore } from '../stores/chat-store';

export function KeyInput() {
  const [inputValue, setInputValue] = useState('');
  const key = keyStore.use('claudeKey');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    keyStore.set('claudeKey', inputValue);
    setInputValue('');
  };

  const getPlaceholder = () => {
    if (key) return 'Claude key is set';
    return 'Claude key';
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {key === '' && (
        <p className="text-sm text-red-500">Please enter a Claude key</p>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-2 mt-2"
      >
        <div className="relative flex-grow">
          <KeyRound
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={getPlaceholder()}
            className="pl-8"
            disabled={!!key}
          />
        </div>
        <Button type="submit" disabled={!inputValue && !key}>
          {key ? 'Clear' : 'Submit'}
        </Button>
      </form>
    </div>
  );
}
