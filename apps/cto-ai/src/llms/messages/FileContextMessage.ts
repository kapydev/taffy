import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';

export class FileContextMessage extends BaseMessage {
  constructor(public filePath: string, public fileContent: string) {
    super();
  }

  toRawMessages(): RawMessage[] {
    return [
      {
        role: 'user',
        content: `These are the latest contents of \`${this.filePath}\`. IGNORE ANY PREVIOUS FILES.
        
${this.fileContent}`,
      },
    ];
  }
}
