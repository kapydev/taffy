import { ActionTemplate } from './Action';

export function actionToLLMDescription(action: ActionTemplate): string {
  const propDescStr = Object.keys(action.propDesc)
    .map((key) => `${key} - ${action.propDesc[key]}`)
    .join('\n');

  const samplePropsStr = JSON.stringify(action.sampleProps);

  let result = `Name: ${action.name}
Description:
${action.desc}
Props:
${propDescStr}
Sample:
{ACTION ${action.name} ${samplePropsStr}}\n`;

  if (action.sampleContents !== undefined) {
    result += action.sampleContents + '\n';
  }

  result += `{END_ACTION ${action.name}}`;

  return result;
}
