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

  if (tool.sampleContents) {
    sampleTool.contents = tool.sampleContents;
  }

  return `Name: ${toolName}
Description:
${tool.desc}
Props:
${propDescStr}
Sample:
${toolToToolString(toolName, sampleTool)}`;
}

export function toolToToolString<T extends ToolType>(
  toolName: T,
  tool: Tools[T]
): string {
  const samplePropsStr = JSON.stringify(tool.props);

  let result = `{TOOL ${toolName}`;

  if (tool.props && Object.keys(tool.props).length > 0) {
    result += ` ${samplePropsStr}}`;
  } else {
    result += `}`;
  }

  if (tool.contents !== undefined) {
    result += '\n' + tool.contents;
  }

  result += `\n{END_TOOL ${toolName}}`;
  return result;
}
