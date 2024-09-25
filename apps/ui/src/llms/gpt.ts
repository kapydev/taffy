import { RawMessage } from '@taffy/shared-types';
import OpenAI from 'openai';
import { LLM } from './base-llm';
export class GPT extends LLM {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async *prompt(messages: RawMessage[]): AsyncIterable<string> {
    const client = new OpenAI({
      apiKey: this.apiKey,
      dangerouslyAllowBrowser: true,
    });

    const stream = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: this.maxTokens,
      stream: true,
    });

    for await (const event of stream) {
      if (event.choices && event.choices.length > 0) {
        const delta = event.choices[0].delta;
        if (delta && delta.content) {
          yield delta.content;
        }
      }
    }
  }
}
