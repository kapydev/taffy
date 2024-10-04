import {
  chatStore,
  CompletionMode,
  getInlineStopSequence,
  getLatestFileContent,
  getToolMessages,
} from '../../stores/chat-store';
import {
  TOOL_END_MATCH_REGEX,
  TOOL_START_MATCH_REGEX,
  ToolMessage,
} from './ToolMessage';
import { getToolEndString, TOOL_RENDER_TEMPLATES } from './tools';

const logger = console;

export class LLMOutputParser {
  async handleTextStream(stream: AsyncIterable<string>, mode: CompletionMode) {
    let curLine = '';
    for await (const textChunk of stream) {
      curLine += textChunk;
      if (!curLine.includes('\n')) continue;
      const lines = curLine.split('\n');
      curLine = lines.pop() || '';
      this.parseLines(lines);
    }
    //If we completed generation in inline mode need to auto complete the remaining text
    if (mode.includes('inline')) {
      const inlineStopSeq = await getInlineStopSequence();
      if (inlineStopSeq) {
        const latestFileContent = await getLatestFileContent();
        if (!latestFileContent) {
          throw new Error('Expected latest file content');
        }
        const remainder =
          inlineStopSeq +
          latestFileContent.postSelection
            .split(inlineStopSeq)
            .slice(1)
            .join(inlineStopSeq);
        curLine += remainder;
        curLine += getToolEndString('ASSISTANT_WRITE_FILE');
      }
    }
    if (curLine) {
      this.parse(curLine);
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
    const toolStartMatch = line.match(TOOL_START_MATCH_REGEX);
    const toolEndMatch = line.match(TOOL_END_MATCH_REGEX);
    if (toolStartMatch) {
      chatStore.set('messages', [
        ...chatStore.get('messages'),
        new ToolMessage(),
      ]);
    }

    const latestMsg = getToolMessages().at(-1);
    if (!latestMsg) {
      throw new Error('Expected at least one message!');
    }

    latestMsg.contents += `${line}\n`;

    if (toolEndMatch) {
      if (!latestMsg.type) return;
      const renderTemplate = TOOL_RENDER_TEMPLATES[latestMsg.type];
      if (!renderTemplate) return;
      if (!renderTemplate.onFocus) return;
      renderTemplate.onFocus(latestMsg as any);
      //TODO: Stop parsing until user finishes focus action
    }

    //Trigger rerender, cos I'm not sure how else to ensure proper updating
    chatStore.set('messages', [...chatStore.get('messages')]);
  }
}
