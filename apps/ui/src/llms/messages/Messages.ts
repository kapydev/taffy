import { AssistantMessage } from './AssistantMessage';
import { DeleteFileActionMessage } from './DeleteFileActionMessage';
import { FileContextMessage } from './FileContextMessage';
import { HumanMessage } from './HumanMessage';
import { ReadFileActionMessage } from './ReadFileActionMessage';
import { SystemPromptMessage } from './SystemPromptMessage';
import { UpdateFileActionMessage } from './UpdateFileActionMessage';
import { WriteFileActionMessage } from './WriteFileActionMessage';

export type LLMGeneratedMessage =
  | AssistantMessage
  | ReadFileActionMessage
  | WriteFileActionMessage
  | DeleteFileActionMessage
  | UpdateFileActionMessage;
export type CustomMessage =
  | SystemPromptMessage
  | FileContextMessage
  | HumanMessage
  | LLMGeneratedMessage;
