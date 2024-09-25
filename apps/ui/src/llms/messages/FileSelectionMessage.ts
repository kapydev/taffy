import { RawMessage } from '@taffy/shared-types';
import { BaseMessage } from './BaseMessage';
import { inferProcedureOutput } from '@trpc/server';
import type { AppRouter } from '@taffy/vsc-ext/types';
import { addLineNumbers } from '@taffy/shared-helpers';

export class FileSelectionMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'user';
  constructor(
    public context: inferProcedureOutput<
      AppRouter['files']['onSelectionChange']
    >
  ) {
    super();
  }

  toRawMessages(): RawMessage[] {
    return [
      {
        role: 'user',
        content: `I have a specific question about the file ${
          this.context.fileName
        } from lines ${this.context.selectedLineNumbers.start} to ${
          this.context.selectedLineNumbers.end
        }

Here are the latest file contents:

${addLineNumbers(this.context.fullFileContents)}`,
      },
    ];
  }
}
