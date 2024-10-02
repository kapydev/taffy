import { RawMessage } from '@taffy/shared-types';
import { BaseMessage } from './BaseMessage';
import { TOOL_TEMPLATES, Tools, toolToToolString, ToolType } from './tools';
import { makeObservable, observable, computed } from 'mobx';

export const TOOL_START_MATCH_REGEX = /{TOOL (\w+)(?: (.*))?}/;
export const TOOL_END_MATCH_REGEX = /{END_TOOL\s?(\w*)}/;

const logger = console;
export class ToolMessage<
  ToolName extends ToolType = ToolType
> extends BaseMessage {
  loading: boolean = false;

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
      loading: observable,
    });
    this.contents = contents ?? '';
  }

  get type(): ToolName | undefined {
    const toolStartMatch = this.contents.match(TOOL_START_MATCH_REGEX);

    return (toolStartMatch?.[1] as ToolName) ?? undefined;
  }

  get props(): Tools[ToolName]['props'] {
    const toolStartMatch = this.contents.match(TOOL_START_MATCH_REGEX);
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
    let bodyMatch = this.contents
      .replace(TOOL_START_MATCH_REGEX, '')
      .replace(TOOL_END_MATCH_REGEX, '');
    if (bodyMatch.startsWith('\n')) {
      bodyMatch = bodyMatch.substring(1);
    }
    if (bodyMatch.endsWith('\n')) {
      bodyMatch = bodyMatch.substring(0, bodyMatch.length - 1);
    }
    return bodyMatch;
  }

  set body(newBody: string) {
    if (!this.type) {
      throw new Error("Can't set for undefined type!");
    }
    this.contents = toolToToolString(this.type, {
      body: newBody,
      props: this.props,
    } as any);
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
