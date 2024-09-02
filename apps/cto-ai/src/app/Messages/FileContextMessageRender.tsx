import { Alert, AlertDescription, AlertTitle } from '@cto-ai/components';
import { FilePlus2Icon } from 'lucide-react';
import { FileContextMessage } from '../../llms/messages/FileContextMessage';

export function FileContextMessageRender({
  message,
}: {
  message: FileContextMessage;
}) {
  return (
    <Alert>
      <FilePlus2Icon className="w-4 h-4" />
      <AlertTitle>
        The following files have been added to the context
      </AlertTitle>
      <AlertDescription>{message.filePath}</AlertDescription>
    </Alert>
  );
}
