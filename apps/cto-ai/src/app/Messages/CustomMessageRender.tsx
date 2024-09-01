import {
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
    <Card>
      <CardHeader>
        <CardTitle>Requesting permission to read the following files</CardTitle>
      </CardHeader>
      <CardContent>
        {message.files.map((fileName) => (
          <div>{fileName}</div>
        ))}
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardDescription>
          {message.titles.map((title) => (
            <div key={title}>{title}</div>
          ))}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
