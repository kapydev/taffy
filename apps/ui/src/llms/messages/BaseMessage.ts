import { RawMessage } from '@taffy/shared-types';

export abstract class BaseMessage {
  public contents = '';
  private _titles: string[] = [];
  abstract role: RawMessage['role'];
  abstract toRawMessages(): RawMessage[];

  /** Add a title to your message with markdown headings */
  addTitle(title: string, contents: string) {
    const formattedTitle = `# ${title}\n${contents}`;
    this._titles.push(title);
    return formattedTitle;
  }

  get titles(): readonly string[] {
    return this._titles;
  }
}
