import { Alert, AlertDescription, AlertTitle } from '@taffy/components';
import { FilePlus2Icon } from 'lucide-react';
import { FileSelectionMessage } from '../../llms/messages/FileSelectionMessage';
import { useCallback } from 'react';
import { chatStore } from '../../stores/chat-store';
import { Button } from 'react-day-picker';

export function FileSelectionMessageRender({
  message,
}: {
  message: FileSelectionMessage;
}) {
  const removeMessage = useCallback(() => {
    chatStore.set(
      'messages',
      chatStore.get('messages').filter((msg) => msg !== message)
    );
  }, [message]);

  return (
    <Alert>
      <FilePlus2Icon className="w-4 h-4" />
      <AlertTitle>File Context Added</AlertTitle>
      <AlertDescription>
        {message.context.fileName} - Line{' '}
        {message.context.selectedLineNumbers.start} to Line{' '}
        {message.context.selectedLineNumbers.end}
      </AlertDescription>
      <div className="flex gap-2">
        <Button className="text-vsc-errorForeground" onClick={removeMessage}>
          Remove
        </Button>
      </div>
    </Alert>
  );
}
