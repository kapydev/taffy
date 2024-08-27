import { Action, ActionTemplate, AnyAction } from './Action';

export function actionToLLMDescription(action: ActionTemplate): string {
  const propDescStr = Object.keys(action.propDesc)
    .map((key) => `${key} - ${action.propDesc[key]}`)
    .join('\n');

  const sampleAction: AnyAction = {
    name: action.name,
    props: action.sampleProps,
    contents: action.sampleContents,
  };

  return `Name: ${action.name}
Description:
${action.desc}
Props:
${propDescStr}
Sample:
${actionToActionString(sampleAction)}`;
}

export function actionToActionString(action: AnyAction): string {
  const samplePropsStr = JSON.stringify(action.props);

  let result = `{ACTION ${action.name} ${samplePropsStr}}`;

  if (action.contents !== undefined) {
    result += action.contents + '\n';
  }

  result += `{END_ACTION ${action.name}}`;
  return result;
}
