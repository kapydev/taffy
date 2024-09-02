import { Alert, AlertDescription, AlertTitle } from '@cto-ai/components';
import { FilePlus2Icon } from 'lucide-react';
import { Button } from 'react-day-picker';
import { ReadFileActionMessage } from '../../llms/messages/ReadFileActionMessage';
import { FileContextMessage } from '../../llms/messages/FileContextMessage';
import { getFileContentsByPath } from '../../stores/file-store';

export function ReadFileActionMessageRender({
  message,
}: {
  message: ReadFileActionMessage;
}) {
  const addFilesToContext = () => {
    message.files.map((filePath) => {
      const contents = getFileContentsByPath(filePath);
      const fileContextMsg = new FileContextMessage(filePath, contents);
    });
  };

  return (
    <Alert>
      <FilePlus2Icon className="w-4 h-4" />
      <AlertTitle>Requesting permission to read the following files</AlertTitle>
      <AlertDescription>
        {message.files.map((fileName) => (
          <div>{fileName}</div>
        ))}
      </AlertDescription>
      <div className="flex gap-2">
        <Button className="text-red-500">Decline</Button>
        <Button onClick={addFilesToContext} className="text-black">
          Approve
        </Button>
      </div>
    </Alert>
  );
}
