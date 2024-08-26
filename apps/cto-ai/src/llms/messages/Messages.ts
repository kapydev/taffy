import { AssistantMessage } from './AssistantMessage';
import { FileContextMessage } from './FileContextMessage';
import { HumanMessage } from './HumanMessage';
import { SystemPromptMessage } from './SystemPromptMessage';

export type CustomMessage =
  | SystemPromptMessage
  | FileContextMessage
  | HumanMessage
  | AssistantMessage;
