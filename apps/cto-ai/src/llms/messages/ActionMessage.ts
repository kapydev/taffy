import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';
import { actionToActionString } from './actions';
import { Action } from './actions/Action';

export class ActionMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'assistant';

  constructor(public action: Action) {
    super();
  }

  toRawMessages(): RawMessage[] {
    return [
      {
        role: this.role,
        content: actionToActionString(this.action),
      },
    ];
  }
}
