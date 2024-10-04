import { BotIcon, FilePlus2Icon, LucideProps, UserIcon } from 'lucide-react';
import { trpc } from '../../../client';
import { ToolMessage } from '../ToolMessage';

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
}

export const TOOL_TEMPLATES = {
  //ASSISTANT TOOLS
  ASSISTANT_INFO: {
    role: 'assistant',
    desc: 'For the assistant to write a response to the user.',
    propDesc: {},
    sampleProps: {},
    sampleBody:
      'To prevent .env files from being committed into the codebase, we need to update the .gitignore file',
  },
  // TODO: For multi file, replace assistant planning with thinking blocks
  // ASSISTANT_PLANNING: {
  //   role: 'assistant',
  //   desc: "For the assistant to plan how to tackle the task from the user. There should be a planning block after every assistant info tool block. Reason how to tackle the user's task step by step, placing steps in a logical order. After the planning tool is done, execute the plan. In each step, indicate what tool you will use, and how you will use it",
  //   propDesc: {},
  //   sampleProps: {},
  //   sampleBody: `Example 1:
  //   1. Read the .gitignore file using ASSISTANT_READ_FILE
  //   2. Update the .gitignore file using ASSISTANT_WRITE_FILE`,
  // },
  //   ASSISTANT_WRITE_FILE: {
  //     role: 'assistant',
  //     desc: `Ask the user for permission to create/overwrite a file. You will need to provide the FULL FILE CONTENTS, because the action suggested to the user will be a full override of the existing file. DO NOT INCLUDE LINE NUMBERS IN THE OUTPUT.`,
  //     propDesc: {
  //       filePath:
  //         "The path to which the file is written. If the file path doesn't exist, directories will be recursively created until we are able to create the file.",
  //     },
  //     sampleProps: {
  //       filePath: 'src/utils/helloWorld.ts',
  //     },
  //     sampleBody: `export function helloWorld() {
  // ${'console'}.log("Hello World!");
  // }`,
  //   },
  //I'm not sure about the thinking start version
  ASSISTANT_WRITE_FILE: {
    role: 'assistant',
    desc: `Ask the user for permission to create/overwrite a file. You will need to provide the FULL FILE CONTENTS, because the action suggested to the user will be a full override of the existing file. Stopping generation before reaching the end of the file will result in a confusing output to the end user after the result is parsed. DO NOT INCLUDE LINE NUMBERS IN THE OUTPUT. Before tackling a challenging part of the code, you can walk yourself through the coding process in a THINKING block

  {THINKING_START}
  In order to write this function, I will need to...
  {THINKING_END}

  The thinking blocks will not be included in the outputted code.
  Within the thinking blocks, consider the user's existing code style and practices and follow those.
  DO NOT WRITE CODE WITHIN THE THINKING BLOCKS. The thinking blocks are soley meant for planning. Any code will need to be written outside the thinking block, in order to be included in the final suggestion to the user.

  `,
    propDesc: {
      filePath:
        "The path to which the file is written. If the file path doesn't exist, directories will be recursively created until we are able to create the file.",
    },
    sampleProps: {
      filePath: 'src/utils/helloWorld.ts',
    },
    sampleBody: `export function helloWorld() {
{THINKING_START}
The hello world function should log hello world.
{THINKING_END}
  ${'console'}.log("Hello World!");
}`,
  },
  ASSISTANT_READ_FILE: {
    role: 'assistant',
    desc: "Ask the user for permission to add a file to the context. The contents of the tool call should be all the files that need to be read, seperated by newlines. After calling this tool, no other tool calls can be made by the assistant, as we have to wait for the user's response",
    propDesc: {},
    sampleProps: {},
    sampleBody: 'src/index.ts\nsrc/messages/helloWorld.ts',
  },
  //USER TOOLS
  USER_PROMPT: {
    role: 'user',
    desc: 'The prompt from the user',
    propDesc: {},
    sampleProps: {},
    sampleBody: `Stop commiting .env files into the codebase`,
  },
  USER_FILE_CONTENTS: {
    role: 'user',
    desc: 'Information from the user regarding the contents of a file. If there are multiple FILE_CONTENTS tool responses, the latest one should be considered as the correct one. Questions from the user should be focused on parts of the code within a FOCUS fence block ',
    propDesc: {
      startLine: 'The start line of the specific area to focus on',
      endLine: 'The end line of the specific area to focus on',
      filePath: 'The file path where the contents are from',
    },
    sampleProps: {
      startLine: '1',
      endLine: '25',
      filePath: 'src/utils/helloWorld.ts',
    },
    sampleBody: `export default function HelloWorld() {
{FOCUS_START}
    const name = 'Thomas';
{FOCUS_END}
    ${'console'}.log("Hello World");
  }`,
  },
  USER_AVAILABLE_FILES: {
    role: 'user',
    desc: 'Information from the user regarding available files in the repository',
    propDesc: {},
    sampleProps: {},
    sampleBody: 'src/index.ts\nsrc/utils/anotherFile.ts',
  },
} satisfies Record<string, ToolTemplate>;

type ToolAction<ToolName extends ToolType> = (
  message: ToolMessage<ToolName>
) => void;

export type ToolActionMeta<ToolName extends ToolType> = {
  name: string;
  action: ToolAction<ToolName>;
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
    title: () => 'Assistant Info',
    description: (data) => data.body,
  },
  // ASSISTANT_PLANNING: {
  //   Icon: WaypointsIcon,
  //   title: () => 'Assistant Planning',
  //   description: (data) => data.body,
  // },
  ASSISTANT_READ_FILE: {
    Icon: FilePlus2Icon,
    title: () => 'Requesting permission to read the following files',
    description: (data) => data.body,
    actions: [
      {
        name: 'approve',
        action: () => {},
      },
    ],
  },
  USER_FILE_CONTENTS: {
    Icon: FilePlus2Icon,
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
  ASSISTANT_WRITE_FILE: {
    Icon: FilePlus2Icon,
    title: () => 'Requesting permission to write the following files',
    description: (data) => {
      if (!data.props) return;
      const thoughtsString = data.thoughts ? `💡${data.thoughts}` : '';
      const infoString = data.loading
        ? `${data.body.length} characters loaded so far`
        : 'Loading Complete!';
      const fullStr = infoString + '\n\n' + thoughtsString;
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
        name: 'Approve Change',
        action: (message) => {
          trpc.files.approveFileChange.mutate({ id: message.id });
        },
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
