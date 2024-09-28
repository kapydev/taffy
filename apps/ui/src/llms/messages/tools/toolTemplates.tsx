import { addLineNumbers } from '@taffy/shared-helpers';
import {
  BotIcon,
  FilePlus2Icon,
  LucideProps,
  UserIcon,
  WaypointsIcon,
} from 'lucide-react';
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
  USER_PROMPT: {
    role: 'user',
    desc: 'The prompt from the user',
    propDesc: {},
    sampleProps: {},
    sampleBody: `Stop commiting .env files into the codebase`,
  },
  ASSISTANT_INFO: {
    role: 'assistant',
    desc: 'For the assistant to write a response to the user. all messages from the assistant should start with an assistant info block.',
    propDesc: {},
    sampleProps: {},
    sampleBody:
      'To prevent .env files from being committed into the codebase, we need to update the .gitignore file',
  },
  ASSISTANT_PLANNING: {
    role: 'assistant',
    desc: "For the assistant to plan how to tackle the task from the user. There should be a planning block after every assistant info tool block. Reason how to tackle the user's task step by step, placing steps in a logical order. After the planning tool is done, the user will be able to update the plan if required, before the plan is executed. using the read tool or the write tool, for example.",
    propDesc: {},
    sampleProps: {},
    sampleBody: `Example 1:
    1. Read the .gitignore file using the read tool
    2. Update the .gitignore file using the write tool`,
  },
  READ_FILE: {
    desc: "Ask the user for permission to add a file to the context. The contents should be all the files that need to be read, seperated by newlines. DO NOT ask to read non existent files that are not provided in the codebase context. After calling this tool, no other tool calls can be made by the assistant, as we have to wait for the user's response",
    propDesc: {},
    sampleProps: {},
    sampleBody: 'src/index.ts\nsrc/messages/helloWorld.ts',
    role: 'assistant',
  },
  FILE_CONTENTS: {
    role: 'user',
    desc: 'Information from the user regarding the contents of a file. If there are multiple FILE_CONTENTS tool responses, the latest one should be considered as the correct one. Line numbers, if any are NOT part of the file, every line number is followed by a space, which contains the actual contents of the file',
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
    sampleBody: addLineNumbers(`export default function HelloWorld() {
    console.log("Hello World");
  }`),
  },
  WRITE_FILE: {
    role: 'assistant',
    desc: 'Ask the user for permission to create/overwrite a file. The contents should be the full file contents, seperated by newlines.',
    propDesc: {
      filePath:
        "The path to which the file is written. If the file path doesn't exist, directories will be recursively created until we are able to create the file.",
    },
    sampleProps: {
      filePath: 'src/utils/helloWorld.ts',
    },
    sampleBody: `export function helloWorld() {
      ${'console'}.log("Hello World!")
    }`,
  },
} satisfies Record<string, ToolTemplate>;

export type ToolRenderTemplate<ToolName extends ToolType> = {
  icon: MessageIcon;
  title: (message: ToolMessage<ToolName>) => React.ReactNode;
  description: (message: ToolMessage<ToolName>) => React.ReactNode;
};
export const TOOL_RENDER_TEMPLATES: {
  [ToolName in ToolType]: ToolRenderTemplate<ToolName>;
} = {
  USER_PROMPT: {
    icon: UserIcon,
    title: () => 'User Prompt',
    description: (data) => data.body,
  },
  ASSISTANT_INFO: {
    icon: BotIcon,
    title: () => 'Assistant Info',
    description: (data) => data.body,
  },
  ASSISTANT_PLANNING: {
    icon: WaypointsIcon,
    title: () => 'Assistant Planning',
    description: (data) => data.body,
  },
  READ_FILE: {
    icon: FilePlus2Icon,
    title: () => 'Requesting permission to read the following files',
    description: (data) => data.body,
  },
  FILE_CONTENTS: {
    icon: FilePlus2Icon,
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
  WRITE_FILE: {
    icon: FilePlus2Icon,
    title: () => 'Requesting permission to write the following files',
    description: (data) => {
      if (!data.props) return;
      return (
        <>
          <div>File Path - {data.props.filePath} </div>
          <pre>
            <code>{data.body}</code>
          </pre>
        </>
      );
    },
  },
};
