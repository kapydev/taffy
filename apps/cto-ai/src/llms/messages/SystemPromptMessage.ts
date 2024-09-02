import dedent from 'dedent-js';
import { BaseMessage } from './BaseMessage';
import { prettyPrintGeneratedFolder } from '@cto-ai/shared-helpers';
import { GeneratedFolder, RawMessage } from '@cto-ai/shared-types';
import { readFileActionTemplate } from './actions/readFileAction';
import { actionToLLMDescription } from './actions/actionToLLMDescription';
import {
  deleteFileActionTemplate,
  updateFileActionTemplate,
  writeFileActionTemplate,
} from './actions';

export class SystemPromptMessage extends BaseMessage {
  role: 'user' | 'assistant' | 'system' = 'system';
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
      1. Request additional context, from the user or other information source
      2. Prompt the user to make a change to their codebase

      You can request to perform multiple actions at once. 
      
      Below are the actions available to you and instructions on how to use them.`,
      actionToLLMDescription(readFileActionTemplate),
      actionToLLMDescription(writeFileActionTemplate),
      actionToLLMDescription(updateFileActionTemplate),
      actionToLLMDescription(deleteFileActionTemplate),
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
