import { writeFileActionTemplate } from './actions';
import { AssistantMessage } from './AssistantMessage';
import { LLMGeneratedMessage } from './Messages';
import { ReadFileActionMessage } from './ReadFileActionMessage';

export class LLMOutputParser {
  private messages: LLMGeneratedMessage[] = [new AssistantMessage()];

  parse(lines: string) {
    lines.split('\n').forEach((line) => this.parseLine(line));
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
          new ReadFileActionMessage({
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
