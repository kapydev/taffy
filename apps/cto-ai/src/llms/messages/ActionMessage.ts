import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';
import { actionToActionString } from './actions';
import { Action, AnyAction } from './actions/Action';

export class ActionMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'assistant';
  name: AnyAction['name'];
  props: AnyAction['props'];

  get action(): AnyAction {
    return {
      name: this.name,
      props: this.props,
      contents: this.contents,
    };
  }

  constructor(action: AnyAction) {
    super();
    this.name = action.name;
    if (action.contents) {
      this.contents = action.contents;
    }
    this.props = action.props;
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
