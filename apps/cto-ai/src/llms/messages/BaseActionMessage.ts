import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';
import { actionToActionString } from './actions';
import { AnyAction } from './actions/Action';

export class BaseActionMessage<T extends AnyAction> extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'assistant';
  name: T['name'];
  props: T['props'];

  get action(): T {
    return {
      name: this.name,
      props: this.props,
      contents: this.contents,
    } as T;
  }

  constructor(action: T) {
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
