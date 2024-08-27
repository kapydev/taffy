import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';
import { CustomMessage } from './Messages';

export class AssistantMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'assistant';
  constructor(public response: string) {
    super();
  }

  toParsedMessages(): CustomMessage[] {
    return [this];
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
