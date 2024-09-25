import { Alert, AlertTitle, AlertDescription } from '@taffy/components';
import { ServerIcon } from 'lucide-react';
import { SystemPromptMessage } from '../../llms/messages/SystemPromptMessage';

export function SystemPromptRender({
  message,
}: {
  message: SystemPromptMessage;
}) {
  return (
    <Alert>
      <ServerIcon className="w-4 h-4" />
      <AlertTitle>System Prompt Overview</AlertTitle>
      <AlertDescription>
        {message.titles.map((title) => (
          <div key={title}>{title}</div>
        ))}
      </AlertDescription>
    </Alert>
  );
}
