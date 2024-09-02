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

  let result = `{ACTION ${action.name}`;

  if (action.props && Object.keys(action.props).length > 0) {
    result += ` ${samplePropsStr}`;
  } else {
    result += ``;
  }

  if (action.contents !== undefined) {
    result += '\n' + action.contents;
  }

  result += `\n{END_ACTION ${action.name}}`;
  return result;
}
