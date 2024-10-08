import {
  BotIcon,
  FileInput,
  FileInputIcon,
  FilePlus2Icon,
  LucideProps,
  UserIcon,
  WaypointsIcon,
} from 'lucide-react';
import { trpc } from '../../../client';
import { ToolMessage } from '../ToolMessage';
import {
  getLatestFocusedContent,
  getSelectionDetailsByFile,
} from '../../../stores/chat-store';

export type MessageIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
>;

export type ToolType = keyof typeof TOOL_TEMPLATES;

export type Tools = {
  [K in ToolType]: {
    body: (typeof TOOL_TEMPLATES)[K]['sampleBody'];
    props:
      | Record<keyof (typeof TOOL_TEMPLATES)[K]['propDesc'], string>
      | undefined;
  };
};

export interface ToolTemplate {
  role: 'assistant' | 'user';
  desc: string;
  sampleBody: string;
  propDesc: Record<string, string>;
  sampleProps: Record<string, string>;
  /**Used for storing additional data in a particular message, for example the contents at the time of parsing */
  data: object;
}

/**
 * Prompt Engineering Guidelines:
 * CoT - Ask LLM to explain thought process step by step for better outputs
 * Citations - By asking LLM for citation, we can run a bullshit detector using regex
 * Prefer positives - Instead of saying `DO NOT DO XXX`, which places a focus on XXX cos that's how attention models work, say `DO YYY`. Negatives are okay from time to time but if you can put both you might as well
 * Avoid controlling termination behaviour - the models can't control themselves if you ask them `STOP GENERATING AFTER YYY`. Use stop sequences instead, or if you use xml tags, with rules, they can recognise that as a reason to stop
 * Common terminology - Instead of using uncommon terminology like 'planning block' and 'fence blocks', stick to what is common for the LLM to have a better understanding of the rules, like 'thinking blocks' and 'xml tags'
 *
 * Prompt Engineering Ideas:
 * Switch from fence blocks to XML tags <taffythinking> for example
 * Make language positive instead of negative
 * Fail fallback to repeat prompt if output is not parsable
 * Rename planning block to thinking block
 * Add more files in folder to context automatically
 * Add diagnositcs to context automatically
 * Add typescript types to context automatically - To what depth?
 * Add token limit registrar to context adder
 * Explicitly state indentation for replace block flow
 * Fix assistant read file
 * Rule follower - make sure LLM output follows rules at every step otherwise restart prompting
 */

export const TOOL_TEMPLATES = {
  //ASSISTANT TOOLS
  ASSISTANT_INFO: {
    role: 'assistant',
    desc: 'For the assistant to write a response to the user. Every response to the user should start with an assistant info block.',
    propDesc: {},
    sampleProps: {},
    sampleBody:
      'To prevent .env files from being committed into the codebase, we need to update the .gitignore file.',
    data: {},
  },
  ASSISTANT_PLANNING: {
    role: 'assistant',
    desc: "For the assistant to plan how to tackle the task from the user. If an assistant info block or the user's prompt suggests that the user's codebase will be edited, the planning block should be between the info block and the write file block, or whatever action on the users codebase. Reason how to tackle the user's task step by step, placing steps in a logical order. After the planning tool is done, execute the plan. In each step, indicate what tool you will use, and how you will use it",
    propDesc: {},
    sampleProps: {},
    sampleBody: `Example 1:
    1. Update the src/utils/helloWorld.ts file using ASSISTANT_REPLACE_BLOCK
    2. Update the barrel file src/utils/index.ts to include the export from helloWorld.ts using ASSISTANT_WRITE_FILE`,
    data: {},
  },
  ASSISTANT_WRITE_FILE: {
    role: 'assistant',
    desc: `Ask the user for permission to create/overwrite a file. You will need to provide the FULL FILE CONTENTS, because the action suggested to the user will be a full override of the existing file. This tool cannot be used after an USER_FOCUS_BLOCK, until an ASSISTANT_REPLACE_BLOCK is used.`,
    propDesc: {
      filePath:
        "The path to which the file is written. If the file path doesn't exist, directories will be recursively created until we are able to create the file.",
    },
    sampleProps: {
      filePath: 'src/utils/helloWorld.ts',
    },
    sampleBody: `export function helloWorld() {
  ${'console'}.log("Hello World!");
}`,
    data: {},
  },
  ASSISTANT_REPLACE_BLOCK: {
    role: 'assistant',
    desc: `A block from the assistant to address a user's focus block. You will need to provide ONLY the contents of the code to replace the block. The focus block will be the only part of the code programmatically replaced with the replace block, so make sure the outputs are immediately runnable. Instead of including comments in the output of the replace block, any parts of the thought process should be in the planning block or info block instead. A replace block should only address the latest USER_FOCUS_BLOCK in the prompt history. If there is more than one USER_FOCUS_BLOCK in the prompt history, the rest can be ignored. Always use this as the first code writing action after an USER_FOCUS_BLOCK, after the info and planning blocks.`,
    propDesc: {
      filePath: 'The file path where the contents are from',
    },
    sampleProps: {
      filePath: 'src/utils/helloWorld.ts',
    },
    sampleBody: `  const name = 'Robert';`,
    data: {
      oldContents: undefined as string | undefined,
      newContents: undefined as string | undefined,
    },
  },
  // ASSISTANT_READ_FILE: {
  //   role: 'assistant',
  //   desc: "Ask the user for permission to add a file to the context. The contents of the tool call should be all the files that need to be read, seperated by newlines. After calling this tool, no other tool calls can be made by the assistant, as we have to wait for the user's response",
  //   propDesc: {},
  //   sampleProps: {},
  //   sampleBody: 'src/index.ts\nsrc/messages/helloWorld.ts',
  // },
  //USER TOOLS
  USER_PROMPT: {
    role: 'user',
    desc: 'The prompt from the user',
    propDesc: {},
    sampleProps: {},
    sampleBody: `Stop commiting .env files into the codebase`,
    data: {},
  },
  USER_FILE_CONTENTS: {
    role: 'user',
    desc: 'Information from the user regarding the contents of a file. If there are multiple FILE_CONTENTS tool responses, the latest one should be considered as the correct one.',
    propDesc: {
      filePath: 'The file path where the contents are from',
    },
    sampleProps: {
      filePath: 'src/utils/helloWorld.ts',
    },
    sampleBody: `export default function HelloWorld() {
  const name = 'Thomas';
  ${'console'}.log("Hello World");
}`,
    data: {},
  },
  USER_FOCUS_BLOCK: {
    role: 'user',
    desc: 'A block from the user that specifies a particular section of the code that he has a question about, or he wants to replace. If only a question is asked, just reply the question in the info block. If the user wants the code to be edited, run through the info -> planning -> replace block flow. Make sure to match the original indendation of the line.',
    propDesc: {
      filePath: 'The file path where the contents are from',
      startLine: 'The start line of the specific area to focus on',
      endLine: 'The end line of the specific area to focus on',
    },
    sampleProps: {
      filePath: 'src/utils/helloWorld.ts',
      startLine: '2',
      endLine: '2',
    },
    sampleBody: `  const name = 'Thomas';`,
    data: {},
  },
  USER_AVAILABLE_FILES: {
    role: 'user',
    desc: 'Information from the user regarding available files in the repository',
    propDesc: {},
    sampleProps: {},
    sampleBody: 'src/index.ts\nsrc/utils/anotherFile.ts',
    data: {},
  },
} satisfies Record<string, ToolTemplate>;

type ToolAction<ToolName extends ToolType> = (
  message: ToolMessage<ToolName>
) => void;

export type ToolActionMeta<ToolName extends ToolType> = {
  name: string;
  action: ToolAction<ToolName>;
  /**For a keyboard shortcut Ctrl+T, or Ctrl+1+T for an older
   * message for example, just put 't' as the shortcut - it
   * will be concatenated to the end */
  shortcutEnd: string;
};
export type ToolRenderTemplate<ToolName extends ToolType> = {
  Icon: MessageIcon;
  title: (message: ToolMessage<ToolName>) => React.ReactNode;
  description: (message: ToolMessage<ToolName>) => React.ReactNode;
  onRemove?: ToolAction<ToolName>;
  onFocus?: ToolAction<ToolName>;
  actions?: ToolActionMeta<ToolName>[];
};
export const TOOL_RENDER_TEMPLATES: {
  [ToolName in ToolType]: ToolRenderTemplate<ToolName>;
} = {
  USER_PROMPT: {
    Icon: UserIcon,
    title: () => 'User Prompt',
    description: (data) => data.body,
  },
  ASSISTANT_INFO: {
    Icon: BotIcon,
    title: () => 'Assistant',
    description: (data) => data.body,
  },
  ASSISTANT_PLANNING: {
    Icon: WaypointsIcon,
    title: () => 'Assistant Planning',
    description: (data) => data.body,
  },
  // ASSISTANT_READ_FILE: {
  //   Icon: FilePlus2Icon,
  //   title: () => 'Shall I add the following?',
  //   description: (data) => data.body,
  //   actions: [
  //     {
  //       name: 'approve',
  //       action: () => {},
  //       shortcutEnd: 'enter',
  //     },
  //   ],
  // },
  USER_FOCUS_BLOCK: {
    Icon: FileInput,
    title: () => 'File Context Added',
    description: (data) => {
      if (!data.props) return;
      return (
        <>
          {data.props.filePath} <br /> Line {data.props.startLine} to Line{' '}
          {data.props.endLine}
        </>
      );
    },
  },
  ASSISTANT_REPLACE_BLOCK: {
    Icon: FilePlus2Icon,
    title: () => 'Requesting permission to write the following files',
    description: (data) => {
      if (!data.props) return;
      const thoughtsString = data.thoughts ? `💡${data.thoughts}` : '';
      let fullStr = data.loading
        ? `${data.body.length} characters loaded so far`
        : 'Loading Complete!';
      if (thoughtsString) {
        fullStr += '\n\n' + thoughtsString;
      }

      return (
        <>
          <div>File Path - {data.props.filePath} </div>
          {fullStr}
        </>
      );
    },
    onFocus: async (message) => {
      if (!message.props) return;
      const curContents = await getLatestFocusedContent();
      if (curContents?.props.filePath !== message.props.filePath) {
        // throw new Error("Mismatch file path for replace block")
        return;
      }
      message.data.oldContents = curContents.fullContents;
      message.data.newContents = [
        curContents.preSelection,
        message.body,
        curContents.postSelection,
      ].join('\n');
      trpc.files.previewFileChange.mutate({
        fileName: message.props.filePath,
        newContents: message.data.newContents,
        id: message.id,
      });
    },
    onRemove: (message) => {
      if (!message.props) return;
      trpc.files.removeFileChange.mutate({
        id: message.id,
      });
    },
    actions: [
      {
        name: 'Preview',
        action: (message) => {
          if (!message.props) return;
          if (!message.data.newContents) return;
          trpc.files.previewFileChange.mutate({
            fileName: message.props.filePath,
            newContents: message.data.newContents,
            id: message.id,
          });
        },
        shortcutEnd: 'p',
      },
      {
        name: 'Approve Change',
        action: (message) => {
          trpc.files.approveFileChange.mutate({ id: message.id });
        },
        shortcutEnd: 'enter',
      },
    ],
  },
  USER_FILE_CONTENTS: {
    Icon: FileInputIcon,
    title: () => 'File Context Added',
    description: (data) => {
      if (!data.props) return;
      return data.props.filePath;
    },
  },
  ASSISTANT_WRITE_FILE: {
    Icon: FilePlus2Icon,
    title: () => 'Shall I add the following?',
    description: (data) => {
      if (!data.props) return;
      const thoughtsString = data.thoughts ? `💡${data.thoughts}` : '';
      let fullStr = data.loading
        ? `${data.body.length} characters loaded so far`
        : 'Loading Complete!';
      if (thoughtsString) {
        fullStr += '\n\n' + thoughtsString;
      }

      return (
        <>
          <div>File Path - {data.props.filePath} </div>
          {fullStr}
        </>
      );
    },
    onFocus: (message) => {
      if (!message.props) return;
      trpc.files.previewFileChange.mutate({
        fileName: message.props.filePath,
        newContents: message.body,
        id: message.id,
      });
    },
    onRemove: (message) => {
      if (!message.props) return;
      trpc.files.removeFileChange.mutate({
        id: message.id,
      });
    },
    actions: [
      {
        name: 'Preview',
        action: (message) => {
          if (!message.props) return;
          trpc.files.previewFileChange.mutate({
            fileName: message.props.filePath,
            newContents: message.body,
            id: message.id,
          });
        },
        shortcutEnd: 'p',
      },
      {
        name: 'Approve',
        action: (message) => {
          trpc.files.approveFileChange.mutate({ id: message.id });
        },
        shortcutEnd: 'enter',
      },
    ],
  },
  USER_AVAILABLE_FILES: {
    Icon: FilePlus2Icon,
    title: () => 'Available Files in Repository',
    description: (data) => {
      const numFiles = data.body.split('\n').length;
      return `${numFiles} filenames added to context`;
    },
  },
};

// //I'm not sure about the thinking start version
// ASSISTANT_WRITE_FILE: {
//   role: 'assistant',
//   desc: `Ask the user for permission to create/overwrite a file. You will need to provide the FULL FILE CONTENTS, because the action suggested to the user will be a full override of the existing file. Stopping generation before reaching the end of the file will result in a confusing output to the end user after the result is parsed. DO NOT INCLUDE LINE NUMBERS IN THE OUTPUT. Before tackling a challenging part of the code, you can walk yourself through the coding process in a THINKING block

// {THINKING_START}
// In order to write this function, I will need to...
// {THINKING_END}

// The thinking blocks will not be included in the outputted code.
// Within the thinking blocks, consider the user's existing code style and practices and follow those.
// DO NOT WRITE CODE WITHIN THE THINKING BLOCKS. The thinking blocks are soley meant for planning. Any code will need to be written outside the thinking block, in order to be included in the final suggestion to the user.

// Do not generate comments in the generated code, unless the user explicitly asks for it. Use thinking blocks instead if absolutely necessary.
// `,
//   propDesc: {
//     filePath:
//       "The path to which the file is written. If the file path doesn't exist, directories will be recursively created until we are able to create the file.",
//   },
//   sampleProps: {
//     filePath: 'src/utils/helloWorld.ts',
//   },
//   sampleBody: `export function helloWorld() {
// {THINKING_START}
// The hello world function should log hello world.
// {THINKING_END}
// ${'console'}.log("Hello World!");
// }`,
// },
