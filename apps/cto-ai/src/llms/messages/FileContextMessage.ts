import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';

export class FileContextMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'user';
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
