import { RawMessage } from '@taffy/shared-types';
import { BaseMessage } from './BaseMessage';
import { TOOL_TEMPLATES, Tools, toolToToolString, ToolType } from './tools';
import { makeObservable, observable, computed } from 'mobx';

export const TOOL_START_MATCH_REGEX = /{TOOL (\w+)(?: (.*))?}/;
export const TOOL_END_MATCH_REGEX = /{END_TOOL\s?(\w*)}/;
export const THINKING_START_MATCH_REGEX =
  /{THINKING_START}\n(.*?)\n(?:{THINKING_END})?/g;

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
      loading: computed,
    });
    this.contents = contents ?? '';
  }

  /**For type assertion */
  isType<T extends ToolType>(type: T): this is ToolMessage<T> {
    const curType = this.type;
    return (curType as any) === type;
  }

  get loading(): boolean {
    const ended = Boolean(this.contents.match(TOOL_END_MATCH_REGEX));
    return !ended;
  }

  //TODO: Memoize
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
      .replace(TOOL_END_MATCH_REGEX, '')
      .replace(THINKING_START_MATCH_REGEX, '');
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

  get thoughts(): string | undefined {
    const thoughtMatches = this.contents.matchAll(THINKING_START_MATCH_REGEX);
    const thoughts: string[] = [];
    for (const match of thoughtMatches) {
      thoughts.push(match[1].trim());
    }
    return thoughts.join('\n');
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

export function isToolMessageType<T extends ToolType>(
  toolMessage: ToolMessage,
  type: T
): toolMessage is ToolMessage<T> {
  return toolMessage.type === type;
}
