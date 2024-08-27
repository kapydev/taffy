import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';
import { CustomMessage } from './Messages';
import { ActionMessage } from './ActionMessage';

export class AssistantMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'assistant';
  constructor(public response: string) {
    super();
  }

  toParsedMessages(): CustomMessage[] {
    const parsedMessages: CustomMessage[] = [];

    return parsedMessages;
  }

  toRawMessages(): RawMessage[] {
    return [
      {
        role: 'assistant',
        content: this.response,
      },
    ];
  }
}
