import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';
import { ActionTemplate } from './actions/Action';

export class ActionMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'assistant';

  constructor(public actionString: string) {
    super();
  }

  toRawMessages(): RawMessage[] {
    return [
      {
        role: this.role,
        content: this.actionString,
      },
    ];
  }
}
