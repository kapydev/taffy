import { RawMessage } from '@taffy/shared-types';
import { BaseMessage } from './BaseMessage';
import { Tools, toolToToolString, ToolType } from './tools';

const logger = console;
export class ToolMessage<
  ToolName extends ToolType = ToolType
> extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'assistant';

  get data() {
    return { toolData: this.toolData, type: this.type };
  }

  get toolData(): Tools[ToolName] | undefined {
    if (this.props) {
      return {
        props: this.props,
        contents: this.contents,
      } as any;
    }
    return undefined;
  }

  constructor(contents?: string) {
    super();
    this.contents = contents ?? '';
  }

  get type(): ToolName | undefined {
    const toolStartMatch = this.contents.match(/{TOOL (\w+) (.*)}/);

    return (toolStartMatch?.[1] as ToolName) ?? undefined;
  }

  get props(): Tools[ToolName]['props'] | undefined {
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
