import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';

export class HumanMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'user';
  constructor(public userInput: string) {
    super();
  }

  toRawMessages(): RawMessage[] {
    return [
      {
        role: 'user',
        content: this.userInput,
      },
    ];
  }
}
