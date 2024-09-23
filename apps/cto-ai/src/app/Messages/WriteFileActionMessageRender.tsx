import { Alert, AlertDescription, AlertTitle } from '@cto-ai/components';
import { FilePlus2Icon } from 'lucide-react';
import { Button } from 'react-day-picker';
import { WriteFileActionMessage } from '../../llms/messages/WriteFileActionMessage';
import { updateFileContentsByPath } from '../../stores/file-store';

export function WriteFileActionMessageRender({
  message,
}: {
  message: WriteFileActionMessage;
}) {
  const writeUpdatedFile = async () => {
    await updateFileContentsByPath(message.props?.filePath, message.body);
  };

  return (
    <Alert>
      <FilePlus2Icon className="w-4 h-4" />
      <AlertTitle>
        Requesting permission to write the following files
      </AlertTitle>
      <AlertDescription>
        <div>File Path - {message.props?.filePath} </div>
        <pre>
          <code>{message.body}</code>
        </pre>
      </AlertDescription>
      <div className="flex gap-2">
        <Button className="text-vsc-errorForeground">Decline</Button>
        <Button onClick={writeUpdatedFile} className="text-black">
          Approve
        </Button>
      </div>
    </Alert>
  );
}
