import { Alert, AlertDescription, AlertTitle } from '@cto-ai/components';
import { FilePlus2Icon } from 'lucide-react';
import { Button } from 'react-day-picker';
import { FileContextMessage } from '../../llms/messages/FileContextMessage';
import { ReadFileActionMessage } from '../../llms/messages/ReadFileActionMessage';
import { chatStore, runPrompts } from '../../stores/chat-store';
import { getFileContentsByPath } from '../../stores/file-store';

export function ReadFileActionMessageRender({
  message,
}: {
  message: ReadFileActionMessage;
}) {
  const addFilesToContext = async () => {
    const fileContextMsgs = await Promise.all(
      message.files.map(async (filePath) => {
        const contents = await getFileContentsByPath(filePath);
        return new FileContextMessage(filePath, contents);
      })
    );
    chatStore.set('messages', [
      ...chatStore.get('messages'),
      ...fileContextMsgs,
    ]);
    runPrompts();
  };

  return (
    <Alert>
      <FilePlus2Icon className="w-4 h-4" />
      <AlertTitle>Requesting permission to read the following files</AlertTitle>
      <AlertDescription>
        {message.files.map((fileName) => (
          <div key={fileName}>{fileName}</div>
        ))}
      </AlertDescription>
      <div className="flex gap-2">
        <Button className="text-vsc-errorForeground">Decline</Button>
        <Button onClick={addFilesToContext} className="text-vsc-foreground">
          Approve
        </Button>
      </div>
    </Alert>
  );
}
