import { CustomMessage } from './Messages';
import { createToolMessage, ToolMessage } from './ToolMessage';

const logger = console;

export class LLMOutputParser {
  private inTool = false;
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
    const toolStartMatch = line.match(/{TOOL (\w+)(?: (.*))?}/);
    const toolEndMatch = line.match(/{END_TOOL (\w+)}/);
    if (toolStartMatch && !this.inTool) {
      this.messages.push(new ToolMessage());
      this.inTool = true;
    }
    if (this.inTool) {
      this.messages.at(-1)!.contents += `${line}\n`;
    }

    if (toolEndMatch) {
      this.inTool = false;
    }
  }

  getMessages(): CustomMessage[] {
    return this.messages;
  }
}
