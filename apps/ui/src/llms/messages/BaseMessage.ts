import { RawMessage } from '@taffy/shared-types';

let idCounter = 0;
export abstract class BaseMessage {
  private _id: string;
  public contents = '';
  private _titles: string[] = [];
  abstract role: RawMessage['role'];
  abstract toRawMessages(): RawMessage[];

  constructor() {
    this._id = String(idCounter);
    idCounter += 1;
  }

  /** Add a title to your message with markdown headings */
  addTitle(title: string, contents: string) {
    const formattedTitle = `# ${title}\n${contents}`;
    this._titles.push(title);
    return formattedTitle;
  }

  get id() {
    return this._id;
  }

  get titles(): readonly string[] {
    return this._titles;
  }
}
