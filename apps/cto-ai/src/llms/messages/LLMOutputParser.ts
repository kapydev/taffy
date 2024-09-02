import { AssistantMessage } from './AssistantMessage';
import { DeleteFileActionMessage } from './DeleteFileActionMessage';
import { LLMGeneratedMessage } from './Messages';
import { ReadFileActionMessage } from './ReadFileActionMessage';
import { UpdateFileActionMessage } from './UpdateFileActionMessage';
import { WriteFileActionMessage } from './WriteFileActionMessage';

const logger = console;

const actionTypeToMessage: {
  [key: string]: new (actionType: string) => LLMGeneratedMessage;
} = {
  READ_FILE: ReadFileActionMessage,
  WRITE_FILE: WriteFileActionMessage,
  DELETE_FILE: DeleteFileActionMessage,
  UPDATE_FILE: UpdateFileActionMessage,
};

export class LLMOutputParser {
  private messages: LLMGeneratedMessage[] = [new AssistantMessage()];

  async handleTextStream(
    stream: AsyncIterable<string>,
    onMsgUpdate?: () => void
  ) {
    let curLine = '';
    for await (const textChunk of stream) {
      curLine += textChunk;
      if (!curLine.includes('\n')) continue;
      const lines = curLine.split('\n');
      curLine = lines.pop() || '';
      this.parseLines(lines);
      logger.log(lines.join('\n'));
      onMsgUpdate?.();
    }
    if (curLine) {
      this.parse(curLine);
      logger.log(curLine);
      onMsgUpdate?.();
    }
  }

  parse(lines: string) {
    this.parseLines(lines.split('\n'));
  }

  parseLines(lines: string[]) {
    lines.forEach(this.parseLine, this);
  }

  parseLine(line: string) {
    const actionStartMatch = line.match(/{ACTION (\w+)(?: (.*))?}/);
    const actionEndMatch = line.match(/{END_ACTION (\w+)}/);
    if (actionStartMatch) {
      const actionType = actionStartMatch[1];
      const constructor = actionTypeToMessage[actionType];
      if (!constructor) {
        throw new Error('MISSING_CONSTRUCTOR');
      }
      this.messages.push(new constructor(actionType));
      this.messages.at(-1)!.contents += `${line}\n`;
    } else if (actionEndMatch) {
      this.messages.at(-1)!.contents += `${line}\n`;
      const assistantMessage = new AssistantMessage(''); // Create a new assistant message with empty response
      this.messages.push(assistantMessage);
    } else {
      this.messages.at(-1)!.contents += `${line}\n`;
    }
  }

  getMessages(): LLMGeneratedMessage[] {
    return this.messages;
  }
}
