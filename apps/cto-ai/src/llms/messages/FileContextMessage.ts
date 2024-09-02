import { GeneratedFile, RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';

export class FileContextMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'user';
  constructor(public filePath: string, public file: GeneratedFile | undefined) {
    super();
  }

  toRawMessages(): RawMessage[] {
    if (this.file === undefined) {
      return [
        {
          role: 'user',
          content: `The file \`${this.filePath}\` does not exist`,
        },
      ];
    }
    if (this.file.contentEncoding !== 'utf8') {
      return [
        {
          role: 'user',
          content: `The file \`${this.filePath}\` is encoded in ${this.file.contentEncoding}`,
        },
      ];
    }
    return [
      {
        role: 'user',
        content: `These are the latest contents of \`${this.filePath}\`. IGNORE ANY PREVIOUS FILES.
        
${this.file.content}`,
      },
    ];
  }
}
