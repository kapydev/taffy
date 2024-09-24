import { Alert, AlertDescription, AlertTitle } from '@cto-ai/components';
import { FilePlus2Icon } from 'lucide-react';
import { FileSelectionMessage } from '../../llms/messages/FileSelectionMessage';

export function FileSelectionMessageRender({
  message,
}: {
  message: FileSelectionMessage;
}) {
  return (
    <Alert>
      <FilePlus2Icon className="w-4 h-4" />
      <AlertTitle>
        File Context Added
      </AlertTitle>
      <AlertDescription>
        {message.context.fileName} - Line{' '}
        {message.context.selectedLineNumbers.start} to Line{' '}
        {message.context.selectedLineNumbers.end}
      </AlertDescription>
    </Alert>
  );
}
