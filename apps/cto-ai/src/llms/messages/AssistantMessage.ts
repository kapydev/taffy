import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';

export class AssistantMessage extends BaseMessage {
  constructor(public assistantResponse: string) {
    super();
  }

  toRawMessages(): RawMessage[] {
    return [
      {
        role: 'assistant',
        content: this.assistantResponse,
      },
    ];
  }
}
