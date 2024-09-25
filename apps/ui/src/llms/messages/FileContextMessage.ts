import { GeneratedFile, RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';
import { addLineNumbers } from '@cto-ai/shared-helpers';

export class FileContextMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'user';
  constructor(public filePath: string, public file: GeneratedFile | undefined) {
    super();
  }

  toRawMessages(): RawMessage[] {
    if (this.file?.content === undefined) {
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
        content: `These are the latest contents of \`${
          this.filePath
        }\`. IGNORE ANY PREVIOUS FILES. The lines numbers are NOT part of the files, and after each line number there is a single space, regardless of how many digits the line numbers have.
        
${addLineNumbers(this.file.content)}`,
      },
    ];
  }
}
