import { RawMessage } from '@cto-ai/shared-types';

export abstract class BaseMessage {
  public contents = '';
  abstract role: RawMessage['role'];
  abstract toRawMessages(): RawMessage[];

  /** Add a title to your message with markdown headings */
  addTitle(title: string, contents: string) {
    return `# ${title}\n${contents}`;
  }
}
