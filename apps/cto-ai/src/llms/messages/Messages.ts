import { ActionMessage } from './ActionMessage';
import { AssistantMessage } from './AssistantMessage';
import { FileContextMessage } from './FileContextMessage';
import { HumanMessage } from './HumanMessage';
import { SystemPromptMessage } from './SystemPromptMessage';

export type LLMGeneratedMessage = AssistantMessage | ActionMessage;
export type CustomMessage =
  | SystemPromptMessage
  | FileContextMessage
  | HumanMessage
  | LLMGeneratedMessage;
