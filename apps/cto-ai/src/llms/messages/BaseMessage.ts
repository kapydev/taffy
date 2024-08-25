import { RawMessage } from '@cto-ai/shared-types';

export abstract class BaseMessage {
  abstract toRawMessages(): RawMessage[];

  /** Add a title to your message with markdown headings */
  addTitle(title: string, contents: string) {
    return `# ${title}\n${contents}`;
  }
}
