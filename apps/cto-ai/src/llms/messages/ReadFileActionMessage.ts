import { ReadFileAction } from './actions';
import { BaseActionMessage } from './BaseActionMessage';

export class ReadFileActionMessage extends BaseActionMessage<ReadFileAction> {
  get files() {
    return this.contents.split('\n').filter((file) => file.trim() !== '');
  }
}
