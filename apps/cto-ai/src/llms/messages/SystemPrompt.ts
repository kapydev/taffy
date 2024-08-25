import dedent from 'dedent-js';
import { BaseMessage } from './BaseMessage';
import { prettyPrintGeneratedFolder } from '@cto-ai/shared-helpers';
import { GeneratedFolder, RawMessage } from '@cto-ai/shared-types';

export class SystemPrompt extends BaseMessage {
  prompt: string;

  constructor(root: GeneratedFolder) {
    super();
    this.prompt = [
      this.addTitle('PERSONA', this.getPersona()),
      this.addTitle('ACTION TUTORIAL', this.getActionTutorial()),
      this.addTitle('CODEBASE CONTEXT', this.getCodebaseContext(root)),
    ].join('\n\n');
  }

  getCodebaseContext(folder: GeneratedFolder): string {
    return `The following is the user's codebase structure. 
    
If it does not provide enough context to you solve the user's problem, use the actions as necessary to get more context.

${prettyPrintGeneratedFolder(folder)}`;
  }

  getPersona(): string {
    return 'You are an expert Software Engineer';
  }

  getActionTutorial(): string {
    return [
      dedent`There are several actions available to you to use where necessary.
      
      The actions are used for these cases:
      1. Request additional data from users
      2. Prompt the user to make a change to their codebase
      
      Below are the actions available to you and instructions on how to use them`,
      actionToLLMDescription(readFileAction),
    ].join('\n\n');
  }

  toRawMessages(): RawMessage[] {
    return [
      {
        role: 'system',
        content: this.prompt,
      },
    ];
  }
}

function actionToLLMDescription(action: Action): string {
  const propDescStr = Object.keys(action.propDesc)
    .map((key) => `${key} - ${action.propDesc[key]}`)
    .join('\n');

  const samplePropsStr = Object.keys(action.sampleProps)
    .map((key) => `${key}=${action.sampleProps[key]}`)
    .join(' ');

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

interface Action {
  name: string;
  desc: string;
  sampleContents?: string;
  propDesc: Record<string, string>;
  sampleProps: Record<string, string>;
}

const readFileAction: Action = {
  name: 'READ_FILE',
  desc: 'Ask the user for permission to add a file to the context',
  propDesc: {
    file: 'The file referenced for the action',
  },
  sampleProps: {
    file: JSON.stringify('src/index.ts'),
  },
  sampleContents: undefined,
};
