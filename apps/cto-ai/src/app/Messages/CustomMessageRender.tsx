import { AssistantMessage } from '../../llms/messages/AssistantMessage';
import { FileContextMessage } from '../../llms/messages/FileContextMessage';
import { HumanMessage } from '../../llms/messages/HumanMessage';
import { CustomMessage } from '../../llms/messages/Messages';
import { ReadFileActionMessage } from '../../llms/messages/ReadFileActionMessage';
import { SystemPromptMessage } from '../../llms/messages/SystemPromptMessage';
import { AssistantMessageRender } from './AssistantMessageRender';
import { FileContextMessageRender } from './FileContextMessageRender';
import { HumanMessageRender } from './HumanMessageRender';
import { ReadFileActionMessageRender } from './ReadFileActionMessageRender';
import { SystemPromptRender } from './SystemPromptRender';

export function CustomMessageRender({ message }: { message: CustomMessage }) {
  if (message instanceof SystemPromptMessage) {
    return <SystemPromptRender message={message} />;
  } else if (message instanceof HumanMessage) {
    return <HumanMessageRender message={message} />;
  } else if (message instanceof AssistantMessage) {
    return <AssistantMessageRender message={message} />;
  } else if (message instanceof ReadFileActionMessage) {
    return <ReadFileActionMessageRender message={message} />;
  } else if (message instanceof FileContextMessage) {
    return <FileContextMessageRender message={message} />;
  }
  return <>TODO: {message.constructor.name}</>;
}
