import { LLMGeneratedMessage } from './Messages';
import { ActionMessage } from './ActionMessage';
import { AssistantMessage } from './AssistantMessage';

export class LLMOutputParser {
  private messages: LLMGeneratedMessage[] = [new AssistantMessage()];

  parseLine(line: string) {
    const actionStartMatch = line.match(/{ACTION (\w+) (.*)}/);
    const actionEndMatch = line.match(/{END_ACTION (\w+)}/);
    if (actionStartMatch) {
      const actionType = actionStartMatch[1];
      const actionPayload = JSON.parse(actionStartMatch[2]);
      const actionMessage = new ActionMessage({
        name: actionType,
        ...actionPayload,
      });
      this.messages.push(actionMessage);
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
