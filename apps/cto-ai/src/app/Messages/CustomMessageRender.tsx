import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cto-ai/components';
import { CustomMessage } from '../../llms/messages/Messages';
import { SystemPromptMessage } from '../../llms/messages/SystemPromptMessage';
import { HumanMessage } from '../../llms/messages/HumanMessage';
import { AssistantMessage } from '../../llms/messages/AssistantMessage';
import { BaseActionMessage } from '../../llms/messages/BaseActionMessage';
import { ReadFileActionMessage } from '../../llms/messages/ReadFileActionMessage';
import { FilePlus2Icon, ServerIcon } from 'lucide-react';

export function CustomMessageRender({ message }: { message: CustomMessage }) {
  if (message instanceof SystemPromptMessage) {
    return <SystemPromptRender message={message} />;
  } else if (message instanceof HumanMessage) {
    return <HumanMessageRender message={message} />;
  } else if (message instanceof AssistantMessage) {
    return <AssistantMessageRender message={message} />;
  } else if (message instanceof ReadFileActionMessage) {
    return <ReadFileActionMessageRender message={message} />;
  }
  return <>TODO: {message.constructor.name}</>;
}

function ReadFileActionMessageRender({
  message,
}: {
  message: ReadFileActionMessage;
}) {
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
        <Button className="text-black">Approve</Button>
      </div>
    </Alert>
  );
}

function AssistantMessageRender({ message }: { message: CustomMessage }) {
  return <div>{message.contents}</div>;
}

function HumanMessageRender({ message }: { message: HumanMessage }) {
  return <div>{message.contents}</div>;
}

function SystemPromptRender({ message }: { message: SystemPromptMessage }) {
  return (
    <Alert>
      <ServerIcon className="w-4 h-4" />
      <AlertTitle>System Prompt Overview</AlertTitle>
      <AlertDescription>
        {message.titles.map((title) => (
          <div key={title}>{title}</div>
        ))}
      </AlertDescription>
    </Alert>
  );
}
