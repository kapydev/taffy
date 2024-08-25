import { RawMessage } from '@cto-ai/shared-types';

export abstract class BaseMessage {
  abstract toRawMessages: () => RawMessage[];
}
