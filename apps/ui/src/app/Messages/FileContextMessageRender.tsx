import { Alert, AlertDescription, AlertTitle } from '@taffy/components';
import { FilePlus2Icon } from 'lucide-react';
import { FileContextMessage } from '../../llms/messages/FileContextMessage';
import { useMemo, useState, useCallback } from 'react';
import { chatStore } from '../../stores/chat-store';
import { Button } from 'react-day-picker';

export function FileContextMessageRender({
  message,
}: {
  message: FileContextMessage;
}) {
  const removeMessage = useCallback(() => {
    chatStore.set(
      'messages',
      chatStore.get('messages').filter((msg) => msg !== message)
    );
  }, [message]);

  const title = useMemo(() => {
    if (message.file?.content) {
      return 'The following file have been added to the context';
    } else if (message.file && message.file.contentEncoding !== 'utf8') {
      return 'The requested file is not utf-8 encoded';
    }
    return 'The requested file was not found';
  }, [message]);

  return (
    <Alert>
      <FilePlus2Icon className="w-4 h-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message.filePath}</AlertDescription>
      <div className="flex gap-2">
        <Button className="text-vsc-errorForeground" onClick={removeMessage}>
          Remove
        </Button>
      </div>
    </Alert>
  );
}
