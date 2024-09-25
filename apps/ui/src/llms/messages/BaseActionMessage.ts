import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';
import { AnyAction } from './actions/Action';

const logger = console;
export class BaseActionMessage<T extends AnyAction> extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'assistant';
  name: T['type'];

  get action(): T {
    return {
      type: this.name,
      props: this.props,
      body: this.contents,
    } as T;
  }

  constructor(actionType: T['type']) {
    super();
    this.name = actionType;
  }

  get props(): T['props'] {
    const actionStartMatch = this.contents.match(/{ACTION \w+ (.*)}/);
    if (actionStartMatch) {
      try {
        return JSON.parse(actionStartMatch[1]);
      } catch {
        logger.error('Unable to parse action');
        return {};
      }
    }
    return {} as T['props'];
  }

  get body(): string {
    const bodyMatch = this.contents.match(
      /{ACTION \w+.*}\n([\s\S]*?)\n{END_ACTION \w+}/
    );
    return bodyMatch ? bodyMatch[1] : '';
  }

  toRawMessages(): RawMessage[] {
    return [
      {
        role: this.role,
        content: this.contents,
      },
    ];
  }
}
