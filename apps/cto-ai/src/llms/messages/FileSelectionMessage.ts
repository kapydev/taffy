import { RawMessage } from '@cto-ai/shared-types';
import { BaseMessage } from './BaseMessage';
import { inferProcedureOutput } from '@trpc/server';
import { AppRouter } from '@cto-ai/vsc-ext/types';
import { addLineNumbers } from '@cto-ai/shared-helpers';

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
        content: `I have a specific question about the file ${this.context.fileName} from lines ${this.context.selectedLineNumbers.start} to ${this.context.selectedLineNumbers.end}

Here are the latest file contents:

${addLineNumbers(this.context.fullFileContents)}`,
      },
    ];
  }
}
