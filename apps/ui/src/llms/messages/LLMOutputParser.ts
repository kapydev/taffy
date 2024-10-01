import { sleep } from '@taffy/shared-helpers';
import { CustomMessage } from './Messages';
import { ToolMessage } from './ToolMessage';
import { TOOL_RENDER_TEMPLATES } from './tools';

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
    //The tool matches are more fuzzy than the actual instructions given to the models, to try to render as far as possible.
    const toolStartMatch = line.match(/{TOOL (\w+)(?: (.*))?}/);
    const toolEndMatch = line.match(/{END_TOOL\s?(\w+)}/);
    if (toolStartMatch && !this.inTool) {
      this.messages.push(new ToolMessage());
      this.inTool = true;
    }

    const latestMsg = this.messages.at(-1);
    if (!latestMsg) {
      throw new Error('Expected at least one message!');
    }
    if (this.inTool) {
      latestMsg.contents += `${line}\n`;
      if (latestMsg instanceof ToolMessage) {
        latestMsg.loading = true;
      }
    }

    if (toolEndMatch) {
      this.inTool = false;
      if (latestMsg instanceof ToolMessage) {
        latestMsg.loading = false;
        if (!latestMsg.type) return;
        const renderTemplate = TOOL_RENDER_TEMPLATES[latestMsg.type];
        if (!renderTemplate) return;
        if (!renderTemplate.onFocus) return;
        renderTemplate.onFocus(latestMsg as any);
        //TODO: Stop parsing until user finishes focus action
      }
    }
  }

  getMessages(): CustomMessage[] {
    return this.messages;
  }
}
