import { RawMessage } from '@cto-ai/shared-types';
import { LLM } from './base-llm';
import Anthropic from '@anthropic-ai/sdk';

export class Claude extends LLM {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async *prompt(messages: RawMessage[]): AsyncIterable<string> {
    const client = new Anthropic({
      apiKey: this.apiKey,
      //URGENT TODO: Fix this
      dangerouslyAllowBrowser: true,
    });

    let systemMessage: string | undefined = undefined;
    let remainingMessages = messages;

    if (messages.length > 0 && messages[0].role === 'system') {
      systemMessage = messages[0].content;
      remainingMessages = messages.slice(1);
    }

    if (remainingMessages.some((msg) => msg.role === 'system')) {
      throw new Error('Only the first message can be a system prompt.');
    }

    const stream = client.messages.stream({
      model: 'claude-3-5-sonnet-20240620',
      system: systemMessage,
      max_tokens: this.maxTokens,
      messages: remainingMessages.map((msg) => {
        if (msg.role === 'system') {
          throw new Error('Should not have system prompt in messages');
        }
        return msg;
      }),
      stream: true,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  }
}
