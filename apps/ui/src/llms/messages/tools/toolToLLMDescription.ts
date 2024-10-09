import {
  TOOL_RENDER_TEMPLATES,
  TOOL_TEMPLATES,
  Tools,
  ToolTemplate,
  ToolType,
} from './toolTemplates';

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

  const toolRules = TOOL_RENDER_TEMPLATES[toolName].rules;

  const additionalRules =
    toolRules.length > 0
      ? toolRules
          .map((rule, idx) => `${idx + 1}. ${rule.description}`)
          .join('\n')
      : 'There are no rules for this tool.';

  return `Name: ${toolName}
Description:
${tool.desc}
Props:
${propDescStr}
Tool Rules:
${additionalRules}
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
  const propsStr = JSON.stringify(tool.props);

  let result = getToolStartString(toolName, propsStr);

  if (tool.body !== undefined) {
    result += '\n' + tool.body;
  }

  if (!opts?.excludeEnd) {
    result += '\n' + getToolEndString(toolName);
  }
  return result;
}

export function getToolStartString<T extends ToolType>(
  toolName: T,
  propsStr: string
): string {
  if (
    propsStr &&
    JSON.parse(propsStr) &&
    Object.keys(JSON.parse(propsStr)).length > 0
  ) {
    return `{TOOL ${toolName} ${propsStr}}`;
  } else {
    return `{TOOL ${toolName}}`;
  }
}

export function getToolEndString<T extends ToolType>(toolName: T): string {
  return `{END_TOOL ${toolName}}`;
}
