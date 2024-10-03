import { Tools, ToolTemplate, ToolType } from './toolTemplates';

export function toolToLLMDescription<T extends ToolType>(
  toolName: T,
  tool: ToolTemplate
): string {
  const propDescStr = Object.keys(tool.propDesc)
    .map((key) => `${key} - ${tool.propDesc[key]}`)
    .join('\n');

  const sampleTool: Tools[T] = {
    props: tool.sampleProps as Record<keyof typeof tool.sampleProps, string>,
  } as any;

  if (tool.sampleBody) {
    sampleTool.body = tool.sampleBody;
  }

  return `Name: ${toolName}
Description:
${tool.desc}
Props:
${propDescStr}
Sample:
${toolToToolString(toolName, sampleTool)}`;
}

interface ToolToToolStringOpts {
  excludeEnd: boolean;
}

export function toolToToolString<T extends ToolType>(
  toolName: T,
  tool: Tools[T],
  opts?: ToolToToolStringOpts
): string {
  const samplePropsStr = JSON.stringify(tool.props);

  let result = `{TOOL ${toolName}`;

  if (tool.props && Object.keys(tool.props).length > 0) {
    result += ` ${samplePropsStr}}`;
  } else {
    result += `}`;
  }

  if (tool.body !== undefined) {
    result += '\n' + tool.body;
  }

  if (!opts?.excludeEnd) {
    result += `\n{END_TOOL ${toolName}}`;
  }
  return result;
}
