import { AssistantMessage } from './AssistantMessage';
import { FileContextMessage } from './FileContextMessage';
import { HumanMessage } from './HumanMessage';
import { ReadFileActionMessage } from './ReadFileActionMessage';
import { SystemPromptMessage } from './SystemPromptMessage';

export type LLMGeneratedMessage = AssistantMessage | ReadFileActionMessage;
export type CustomMessage =
  | SystemPromptMessage
  | FileContextMessage
  | HumanMessage
  | LLMGeneratedMessage;
