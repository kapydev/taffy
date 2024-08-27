import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';
import { actionToActionString } from './actions';
import { Action, AnyAction } from './actions/Action';

export class ActionMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'assistant';

  constructor(public action: AnyAction) {
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
