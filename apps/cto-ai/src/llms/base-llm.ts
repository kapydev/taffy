import { RawMessage } from '@cto-ai/shared-types';

export abstract class LLM {
  protected maxTokens: number;

  constructor() {
    this.maxTokens = 1024;
  }

  abstract prompt(messages: RawMessage[]): AsyncIterable<string>;
}
