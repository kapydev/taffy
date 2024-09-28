import { SystemPromptMessage } from './SystemPromptMessage';
import { ToolMessage } from './ToolMessage';

export type CustomMessage = ToolMessage | SystemPromptMessage;
