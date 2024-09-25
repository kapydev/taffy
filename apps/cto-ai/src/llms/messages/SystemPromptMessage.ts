import dedent from 'dedent-js';
import { BaseMessage } from './BaseMessage';
import {
  prettyPrintFilesObj,
  prettyPrintGeneratedFolder,
} from '@cto-ai/shared-helpers';
import {
  FilesObj,
  GeneratedFile,
  GeneratedFolder,
  RawMessage,
} from '@cto-ai/shared-types';
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

  constructor(root: FilesObj) {
    super();
    this.prompt = [
      this.addTitle('PERSONA', this.getPersona()),
      this.addTitle('ACTION TUTORIAL', this.getActionTutorial()),
      this.addTitle('CODEBASE CONTEXT', this.getCodebaseContext(root)),
    ].join('\n\n');
  }

  getCodebaseContext(folder: FilesObj): string {
    return `The following is the user's codebase structure. 
    
If it does not provide enough context to you solve the user's problem, use the actions as necessary to get more context.

${prettyPrintFilesObj(folder)}

At this point you DO NOT KNOW about any of the users files. DO NOT MAKE ASSUMPTIONS. Ask the user for permission to read files before coming up with plans or suggestions.`;
  }

  getPersona(): string {
    return `You are an expert Software Engineer. Keep your answers concise. If the user asks for changes to be made to their codebase, the changes NEED to be in the appropriate action blocks so their code can be updated. DO NOT use backticks AT ALL. Always answer the user in the context of his codebase, DO NOT use general answers`;
    
    //TODO: Try adapt the below to work better
    // OBJECTIVE

    // You accomplish a given task iteratively, breaking it down into clear steps and working through them methodically.
    
    // 1. Analyze the user's task and set clear, achievable goals to accomplish it. Prioritize these goals in a logical order.
    // 2. Work through these goals sequentially, utilizing available tools as necessary. Each goal should correspond to a distinct step in your problem-solving process. It is okay for certain steps to take multiple iterations, i.e. if you need to create many files, it's okay to create a few files at a time as each subsequent iteration will keep you informed on the work completed and what's remaining. 
    // 3. Remember, you have extensive capabilities with access to a wide range of tools that can be used in powerful and clever ways as necessary to accomplish each goal. Before calling a tool, do some analysis within <thinking></thinking> tags. First, analyze the file structure provided in environment_details to gain context and insights for proceeding effectively. Then, think about which of the provided tools is the most relevant tool to accomplish the user's task. Next, go through each of the required parameters of the relevant tool and determine if the user has directly provided or given enough information to infer a value. When deciding if the parameter can be inferred, carefully consider all the context to see if it supports a specific value. If all of the required parameters are present or can be reasonably inferred, close the thinking tag and proceed with the tool call. BUT, if one of the values for a required parameter is missing, DO NOT invoke the function (not even with fillers for the missing params) and instead, ask the user to provide the missing parameters using the ask_followup_question tool. DO NOT ask for more information on optional parameters if it is not provided.
    // 4. Once you've completed the user's task, you must use the attempt_completion tool to present the result of the task to the user. You may also provide a CLI command to showcase the result of your task; this can be particularly useful for web development tasks, where you can run e.g. \`open index.html\` to show the website you've built.
    // 5. The user may provide feedback, which you can use to make improvements and try again. But DO NOT continue in pointless back and forth conversations, i.e. don't end your responses with questions or offers for further assistance.`;
     
  }

  getActionTutorial(): string {
    return [
      dedent`There are several actions available to you to use where necessary.
      
      The following rules apply to the rules:
      1. Analyze the user's task and set clear, achievable goals to accomplish it. Prioritize these goals in a logical order.
      2. Work through these goals sequentially, utilizing available tools as necessary. Each goal should correspond to a distinct step in your problem-solving process.
      3. You MUST stop generation after calling an action. Wait for user to approve the action, and only then continue with the generation, based on the result.
      4. Before writing or updating a file, ALWAYS ask for the latest contents of the file. If the user has not provided the file contents in the last request, the writing and updating actions are banned.
      
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
