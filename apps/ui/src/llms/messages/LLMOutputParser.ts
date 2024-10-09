import {
  chatStore,
  CompletionMode,
  getInlineStopSequence,
  getLatestFocusedContent,
  getToolMessagesWithoutErrors,
} from '../../stores/chat-store';
import { CustomMessage } from './Messages';
import {
  TOOL_END_MATCH_REGEX,
  TOOL_START_MATCH_REGEX,
  ToolMessage,
} from './ToolMessage';
import {
  getToolEndString,
  TOOL_RENDER_TEMPLATES,
  TOOL_TEMPLATES,
  toolToToolString,
} from './tools';

const logger = console;

export class LLMOutputParser {
  earlyExit = false;
  async handleTextStream(stream: AsyncIterable<string>, mode: CompletionMode) {
    let curLine = '';
    for await (const textChunk of stream) {
      if (this.earlyExit) break;
      curLine += textChunk;
      if (!curLine.includes('\n')) continue;
      const lines = curLine.split('\n');
      curLine = lines.pop() || '';
      this.parseLines(lines);
    }
    if (this.earlyExit) return;
    //If we completed generation in inline mode need to auto complete the remaining text
    if (mode.includes('inline')) {
      const inlineStopSeq = await getInlineStopSequence();
      const toolEndStr = getToolEndString('ASSISTANT_WRITE_FILE');
      //If LLM already outputted the toolEndStr, don't append stuff
      if (inlineStopSeq && !curLine.includes(toolEndStr)) {
        const latestFileContent = await getLatestFocusedContent();
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
        curLine += toolEndStr;
      }
    }
    if (curLine) {
      this.parse(curLine);
    }
    if (this.earlyExit) return;
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

    const toolMsgs = getToolMessagesWithoutErrors();
    const latestMsg = toolMsgs.at(-1);
    if (!latestMsg) {
      throw new Error('Expected at least one message!');
    }

    latestMsg.contents += `${line}\n`;

    if (
      toolEndMatch &&
      latestMsg.type &&
      TOOL_RENDER_TEMPLATES[latestMsg.type].onFocus
    ) {
      TOOL_RENDER_TEMPLATES[latestMsg.type].onFocus?.(latestMsg as any);
      //TODO: Stop parsing until user finishes focus action
    }

    //Run checks
    const errors = checkRules();

    if (errors.length > 0) {
      //Add the errors to the context window
      const additionalErrors = errorsToMessages(errors);
      chatStore.set('messages', [
        //Remove the latest message with the error
        ...chatStore.get('messages').filter((msg) => msg !== latestMsg),
        ...additionalErrors,
      ]);
      this.earlyExit = true;
      return;
    }

    //Trigger rerender, cos I'm not sure how else to ensure proper updating
    chatStore.set('messages', [...chatStore.get('messages')]);
  }
}

function errorsToMessages(
  errors: ReturnType<typeof checkRules>
): ToolMessage<'USER_TOOL_ERROR'>[] {
  return errors.map((err) => {
    const errorMsg = `Type: ${err.type}
{FAULTY_MESSAGE_START} 
${err.faultyMsg?.contents}
{FAULTY_MESSAGE_END} 
Description: ${err.desc}
Message:
${err.errDesc}`;
    return new ToolMessage(
      toolToToolString('USER_TOOL_ERROR', {
        body: errorMsg,
        props: {},
      })
    );
  });
}

function checkRules() {
  const messages = getToolMessagesWithoutErrors();
  const errors: {
    type: string;
    desc: string;
    errDesc: string;
    faultyMsg: ToolMessage | undefined;
  }[] = [];
  Object.entries(TOOL_TEMPLATES).forEach(([toolType, toolMeta]) => {
    toolMeta.rules.forEach((rule) => {
      const checkResult = rule.check(messages);
      if (checkResult === undefined) return;
      errors.push({
        type: toolType,
        desc: rule.description,
        errDesc: checkResult,
        faultyMsg: messages.at(-1),
      });
    });
  });
  return errors;
}
