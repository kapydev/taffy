import { Alert, AlertDescription, AlertTitle } from '@cto-ai/components';
import { FilePlus2Icon } from 'lucide-react';
import { FileContextMessage } from '../../llms/messages/FileContextMessage';
import { useMemo } from 'react';

export function FileContextMessageRender({
  message,
}: {
  message: FileContextMessage;
}) {
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
    </Alert>
  );
}
