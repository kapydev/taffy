import { Alert, AlertDescription, AlertTitle } from '@cto-ai/components';
import { FileEditIcon } from 'lucide-react';
import { Button } from 'react-day-picker';
import { UpdateFileActionMessage } from '../../llms/messages/UpdateFileActionMessage';
import { updateFileContentsByPath } from '../../stores/file-store';

export function UpdateFileActionMessageRender({
  message,
}: {
  message: UpdateFileActionMessage;
}) {
  const updateFile = async () => {
    await updateFileContentsByPath(message.props.filePath, message.body, {
      start: message.props.startLine,
      end: message.props.endLine,
    });
  };

  return (
    <Alert>
      <FileEditIcon className="w-4 h-4" />
      <AlertTitle>
        Requesting permission to update the following files
      </AlertTitle>
      <AlertDescription>
        <div>File Path - {message.props.filePath} </div>
        <div>Start line - {message.props.startLine}</div>
        <div>End line - {message.props.endLine}</div>
        <pre>
          <code>{message.body}</code>
        </pre>
      </AlertDescription>
      <div className="flex gap-2">
        <Button className="text-red-500">Decline</Button>
        <Button onClick={updateFile} className="text-black">
          Approve
        </Button>
      </div>
    </Alert>
  );
}
