import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';
import { CustomMessage } from './Messages';
import { ActionMessage } from './ActionMessage';

export class AssistantMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'assistant';
  constructor(response?: string) {
    super();
    if (!response) return;
    this.contents = response;
  }

  toParsedMessages(): CustomMessage[] {
    const parsedMessages: CustomMessage[] = [];

    return parsedMessages;
  }

  toRawMessages(): RawMessage[] {
    return [
      {
        role: 'assistant',
        content: this.contents,
      },
    ];
  }
}
