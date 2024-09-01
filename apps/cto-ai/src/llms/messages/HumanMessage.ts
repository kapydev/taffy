import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';

export class HumanMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'user';
  constructor(userInput: string) {
    super();
    this.contents = userInput;
  }

  toRawMessages(): RawMessage[] {
    return [
      {
        role: 'user',
        content: this.contents,
      },
    ];
  }
}
