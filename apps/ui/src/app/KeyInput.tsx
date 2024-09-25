import { Button, Input } from '@cto-ai/components';
import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { keyStore } from '../stores/chat-store';

function KeyInputRow({
  keyType,
  keyName,
}: {
  keyType: 'claudeKey' | 'gptKey' | 'deepSeekKey';
  keyName: string;
}) {
  const [inputValue, setInputValue] = useState('');
  const key = keyStore.use(keyType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    keyStore.set(keyType, inputValue);
    setInputValue('');
  };

  const getPlaceholder = () => {
    if (key) return `${keyName} key is set`;
    return `${keyName} key`;
  };

  return (
    <div className="flex flex-col mb-2">
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
      {key === '' && (
        <p className="text-sm text-vsc-errorForeground">
          Please enter a {keyName} key
        </p>
      )}
    </div>
  );
}

export function KeyInput() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <KeyInputRow keyType="claudeKey" keyName="Claude" />
      <KeyInputRow keyType="gptKey" keyName="GPT" />
      <KeyInputRow keyType="deepSeekKey" keyName="DeepSeek" />
    </div>
  );
}
