import { CustomMessage } from './Messages';
import { createToolMessage, ToolMessage } from './ToolMessage';

const logger = console;

export class LLMOutputParser {
  private messages: CustomMessage[] = [new ToolMessage()];

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
      this.messages.push(new ToolMessage());
      this.messages.at(-1)!.contents += `${line}\n`;
    } else if (actionEndMatch) {
      this.messages.at(-1)!.contents += `${line}\n`;
      const assistantMessage = new ToolMessage(); // Create a new assistant message with empty response
      this.messages.push(assistantMessage);
    } else {
      this.messages.at(-1)!.contents += `${line}\n`;
    }
  }

  getMessages(): CustomMessage[] {
    return this.messages;
  }
}
