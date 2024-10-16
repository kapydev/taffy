import {
  Alert,
  AlertTitle,
  AlertDescription,
  Badge,
  Button,
} from '@taffy/components';
import {
  ChartNoAxesGantt,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SystemPromptMessage } from '../../llms/messages/SystemPromptMessage';
import { useState } from 'react';

export function SystemPromptRender({
  message,
}: {
  message: SystemPromptMessage;
}) {
  const [mode, setMode] = useState<'RAW' | 'SIMPLIFIED'>('SIMPLIFIED');

  const getRaw = () => (
    <code className="break-words whitespace-pre-wrap">
      {message.toRawMessages().flatMap((rawMsg) => rawMsg.content)}
    </code>
  );

  return (
    <div className="flex gap-2.5 text-xs">
      <Alert className='border-none'>
        <AlertTitle className="flex w-full mb-2 gap-2 text-xs">
          <div className="">Prompt Overview</div>
          <Button
            size="icon"
            variant="ghost"
            className="cursor-pointer text-xs w-3.5 h-3.5"
            onClick={() => setMode(mode === 'RAW' ? 'SIMPLIFIED' : 'RAW')}
          >
            {mode === 'SIMPLIFIED' && <ChevronDown className="w-4 h-4" />}
            {mode === 'RAW' && <ChevronUp className="w-4 h-4" />}
          </Button>
        </AlertTitle>
        <AlertDescription className='break-words whitespace-pre-wrap w-full text-xs'>
          {mode === 'RAW' ? getRaw() : 'Full system prompt'}
        </AlertDescription>
      </Alert>
    </div>
  );
}
