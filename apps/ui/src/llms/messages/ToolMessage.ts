import { RawMessage } from '@taffy/shared-types';
import { BaseMessage } from './BaseMessage';
import { TOOL_TEMPLATES, Tools, toolToToolString, ToolType } from './tools';
import { makeObservable, observable, computed } from 'mobx';

const logger = console;
export class ToolMessage<
  ToolName extends ToolType = ToolType
> extends BaseMessage {
  get role(): 'user' | 'assistant' | 'system' {
    return this.type ? TOOL_TEMPLATES[this.type].role : 'assistant';
  }

  constructor(contents?: string) {
    super();
    makeObservable(this, {
      type: computed,
      role: computed,
      props: computed,
      contents: observable,
      body: computed,
    });
    this.contents = contents ?? '';
  }

  get type(): ToolName | undefined {
    const toolStartMatch = this.contents.match(/{TOOL (\w+)(.*)}/);

    return (toolStartMatch?.[1] as ToolName) ?? undefined;
  }

  get props(): Tools[ToolName]['props'] {
    const toolStartMatch = this.contents.match(/{TOOL (\w+) (.*)}/);
    if (toolStartMatch) {
      try {
        return JSON.parse(toolStartMatch[2]);
      } catch {
        logger.error('Unable to parse tool');
        return undefined;
      }
    }
    return undefined;
  }

  get body(): string {
    const bodyMatch = this.contents.match(
      /{TOOL \w+.*}\n([\s\S]*?)\n{END_TOOL \w+}/
    );
    return bodyMatch ? bodyMatch[1] : '';
  }

  toRawMessages(): RawMessage[] {
    return [
      {
        role: this.role,
        content: this.contents,
      },
    ];
  }
}

export function createToolMessage<T extends ToolType>(
  toolName: T,
  toolData: Tools[T]
): ToolMessage {
  return new ToolMessage(toolToToolString(toolName, toolData));
}
