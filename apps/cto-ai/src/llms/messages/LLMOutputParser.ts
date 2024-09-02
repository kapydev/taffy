import { writeFileActionTemplate } from './actions';
import { AssistantMessage } from './AssistantMessage';
import { LLMGeneratedMessage } from './Messages';
import { ReadFileActionMessage } from './ReadFileActionMessage';
import { WriteFileActionMessage } from './WriteFileActionMessage';

const logger = console;

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
      const actionPayload = actionStartMatch[2]
        ? JSON.parse(actionStartMatch[2])
        : {};
      if (actionType === writeFileActionTemplate.name) {
        this.messages.push(
          new WriteFileActionMessage({
            name: actionType,
            ...actionPayload,
          })
        );
      }
    } else if (actionEndMatch) {
      const assistantMessage = new AssistantMessage(''); // Create a new assistant message with empty response
      this.messages.push(assistantMessage);
    } else {
      const lastMessage = this.messages[this.messages.length - 1];
      lastMessage.contents += `${line}\n`;
    }
  }

  getMessages(): LLMGeneratedMessage[] {
    return this.messages;
  }
}
