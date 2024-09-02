import { Alert, AlertDescription, AlertTitle } from '@cto-ai/components';
import { FilePlus2Icon } from 'lucide-react';
import { Button } from 'react-day-picker';
import { WriteFileActionMessage } from '../../llms/messages/WriteFileActionMessage';

export function WriteFileActionMessageRender({
  message,
}: {
  message: WriteFileActionMessage;
}) {
  const writeUpdatedFile = async () => {};

  return (
    <Alert>
      <FilePlus2Icon className="w-4 h-4" />
      <AlertTitle>
        Requesting permission to write the following files
      </AlertTitle>
      <AlertDescription>
        <div>File Path - {message.props?.filePath} </div>
        <div>Start line - </div>
        <div>End line - {}</div>
        <pre>
          <code>{message.contents}</code>
        </pre>
      </AlertDescription>
      <div className="flex gap-2">
        <Button className="text-red-500">Decline</Button>
        <Button onClick={writeUpdatedFile} className="text-black">
          Approve
        </Button>
      </div>
    </Alert>
  );
}
