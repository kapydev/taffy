import {
  BookPlusIcon,
  BotIcon,
  FileInput,
  FileInputIcon,
  FilePlus2Icon,
  LucideProps,
  ShieldAlertIcon,
  UserIcon,
  WaypointsIcon,
} from 'lucide-react';
import { trpc } from '../../../client';
import {
  addAddtionalContext,
  chatStore,
  continuePrompt,
  getLatestFocusedContent,
} from '../../../stores/chat-store';
import { ToolMessage } from '../ToolMessage';
import { CustomMessage } from '../Messages';
import { findLatest } from '@taffy/shared-helpers';
import { toolToToolString } from './toolToLLMDescription';

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

/**returns undefined or a string to pass back to llm to scold it to do better */
type ToolRuleResult = string | undefined;

//TODO: ToolRules need to be moved to render templates for type inference
/**Used to enforce certain formats for the LLM output and to hint it in the right direction if it messes up */
export interface ToolRule {
  /**Description passed to LLM regarding tool usage. */
  description: string;
  /**Checks to be done for the tool. Always just check the latest message, REGARDLESS of type*/
  check: (messagesWithoutErrors: ToolMessage[]) => ToolRuleResult;
}

export interface ToolTemplate {
  DISABLED?: true;
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
    desc: "For the assistant to plan how to tackle the task from the user. Reason how to tackle the user's task step by step, placing steps in a logical order. After the planning tool is done, execute the plan. In each step, indicate what tool you will use, and how you will use it",
    propDesc: {},
    sampleProps: {},
    sampleBody: `Example 1:
    1. Read the src/utils/index.ts and other relevant files to understand what files need to be updated
    2. Update the src/utils/helloWorld.ts file using ASSISTANT_REPLACE_BLOCK
    3. Update the barrel file src/utils/index.ts to include the export from helloWorld.ts using ASSISTANT_WRITE_FILE`,
    data: {},
  },
  ASSISTANT_WRITE_FILE: {
    role: 'assistant',
    desc: `Ask the user for permission to create/overwrite a file.  `,
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
    desc: `A block from the assistant to address a user's focus block. The focus block will be the only part of the code programmatically replaced with the replace block, so make sure the outputs are immediately runnable. Instead of including comments in the output of the replace block, any parts of the thought process should be in the planning block or info block instead.`,
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
  ASSISTANT_FILE_SEARCH: {
    DISABLED: true, //TODO: Readd this in the future, right now the gitignore isn't being properly respected
    role: 'assistant',
    desc: "Recursively search a directory for a particular regex. Use this tool when you need to understand the user's codebase at a wider scale, for example when you need to replace all instances of a function call with an updated function signature.",
    propDesc: {
      filePath: 'The path in which you want to perform the search',
      search: 'The regex you are searching for',
    },
    sampleProps: { filePath: 'apps', search: 'SUPABASE' },
    sampleBody: '',
    data: {},
  },
  ASSISTANT_READ_PATHS: {
    role: 'assistant',
    desc: "Ask the user for permission to add certain paths to the context. The contents of the tool call should be all the paths that need to be read, seperated by newlines. After calling this tool, no other tool calls can be made by the assistant, as we have to wait for the user's response. This tool can be used to read file contents, read files available in a directory, and check if a path exists.",
    propDesc: {},
    sampleProps: {},
    sampleBody:
      'src/index.ts\nsrc/messages/helloWorld.ts\nsrc\nsrc/does-this-file-exist.ts',
    data: {},
  },

  //USER TOOLS
  USER_FILE_SEARCH_RESULT: {
    DISABLED: true, //TODO: Readd this in the future, right now the gitignore isn't being properly respected
    role: 'user',
    desc: 'The result from a regex search in a directory',
    propDesc: {
      filePath: 'The path where the search was performed',
    },
    sampleProps: {
      filePath: 'apps',
    },
    data: {},
    sampleBody: `Found 7 results.

apps/server/src/supabase.ts
│----
│const supabaseUrl = process.env.VITE_SUPABASE_URL;
│----
│
│const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
│
│----

apps/frontend/src/utility/supabaseClient.ts
│----
│const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
│----
│const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
│
│----
│if (!SUPABASE_URL || !SUPABASE_KEY) {
│  throw new Error('Missing Supabase URL or Key');
│export const supabaseClient = createClient<Database>(
│----
│  SUPABASE_URL,
│----
│  SUPABASE_KEY,
│  {
│----`,
  },
  USER_TOOL_ERROR: {
    role: 'user',
    desc: 'Information regarding incorrect tool usage. The occurence of this indicates a previous generation produced a result that did not follow a particular rule. Take extra notice of the rule that was not followed correctly in subsequent generations',
    propDesc: {},
    sampleProps: {},
    sampleBody:
      'We tried to write to a file without first reading the contents',
    data: {},
  },
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
    desc: 'Information from the user regarding the contents of a file. If there are multiple FILE_CONTENTS tool responses, the latest one should be considered as the correct one. If exists is true, the body can be considered the entire contents of the file. Otherwise, the body may consider additional info on the file not existing.',
    propDesc: {
      filePath: 'The file path where the contents are from',
      type: 'What exists at the specified path',
    },
    sampleProps: {
      filePath: 'src/utils/helloWorld.ts',
      type: 'file | folder | non-existent',
    },
    sampleBody: `export default function HelloWorld() {
  const name = 'Thomas';
  ${'console'}.log("Hello World");
}
>>>>OR<<<<
Nothing exists at the path
>>>>OR<<<<
The specified path contains a folder with the following sub paths:
src/index.ts
src/README.md
src/components (FOLDER)
src/pages (FOLDER)
`,
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
  body: (message: ToolMessage<ToolName>) => React.ReactNode;
  content: (message: ToolMessage<ToolName>) => string; // THIS IS FOR SHOWING MARKDOWN BUT ITS QUITE BUGGY. FIX AND USE THIS IN THE UI NEXT TIME
  onRemove?: ToolAction<ToolName>;
  onFocus?: ToolAction<ToolName>;
  actions?: ToolActionMeta<ToolName>[];
  rules: ToolRule[];
};
export const TOOL_RENDER_TEMPLATES: {
  [ToolName in ToolType]: ToolRenderTemplate<ToolName>;
} = {
  USER_PROMPT: {
    Icon: UserIcon,
    title: () => 'You',
    body: (data) => data.body,
    content: (data) => data.contents,
    rules: [],
  },
  ASSISTANT_INFO: {
    Icon: BotIcon,
    title: () => 'Taffy',
    body: (data) => data.body,
    content: (data) => data.contents,
    rules: [],
  },
  USER_FILE_SEARCH_RESULT: {
    Icon: UserIcon,
    title: (msg) => `Search result for in ${msg.props?.filePath}`,
    body: (data) => {
      return data.body.split('\n')[0];
    },
    content: (data) => data.contents,
    rules: [],
  },
  ASSISTANT_PLANNING: {
    Icon: WaypointsIcon,
    title: () => 'Taffy Planning',
    body: (data) => data.body,
    content: (data) => data.contents,
    rules: [
      {
        description:
          'Planning should only come immediately after an assistant info block',
        check: (messages) => {
          if (
            messages.at(-1)?.type === 'ASSISTANT_PLANNING' &&
            messages.at(-2)?.type !== 'ASSISTANT_INFO'
          ) {
            return (
              'The latest message is of type ASSISTANT_PLANNING but the previous message is of type ' +
              messages.at(-2)?.type
            );
          }
          return undefined;
        },
      },
    ],
  },
  ASSISTANT_READ_PATHS: {
    Icon: BookPlusIcon,
    title: () => 'Can I read these files?',
    body: (data) => data.body,
    content: (data) => data.contents,
    onRemove: (data) => {},
    rules: [],
    actions: [
      {
        name: 'Approve',
        action: async (msg) => {
          const fileNames = msg.body.trim().split('\n');
          for (const fileName of fileNames) {
            await addAddtionalContext(fileName);
          }

          await continuePrompt(chatStore.get('mode'));
        },
        shortcutEnd: 'enter',
      },
    ],
  },

  ASSISTANT_FILE_SEARCH: {
    Icon: BookPlusIcon,
    title: (msg) =>
      `Can I search "${msg.props?.filePath}" for "${msg.props?.search}"`,
    body: (data) => undefined,
    content: (data) => '',
    rules: [],
    actions: [
      {
        name: 'Approve',
        action: async (msg) => {
          if (!msg.props) return;
          const searchResult =
            (await trpc.files.searchFilesContents.query({
              search: msg.props.search,
              relativeDir: msg.props.filePath,
            })) ?? 'Search failed, please use alternative method';

          const searchResultMsg = new ToolMessage(
            toolToToolString('USER_FILE_SEARCH_RESULT', {
              body: searchResult,
              props: { filePath: msg.props.filePath },
            })
          );

          chatStore.set('messages', [
            ...chatStore.get('messages'),
            searchResultMsg,
          ]);

          await continuePrompt(chatStore.get('mode'));
        },
        shortcutEnd: 'enter',
      },
    ],
  },
  USER_TOOL_ERROR: {
    Icon: ShieldAlertIcon,
    title: () => 'Tool error',
    body: (data) => data.body,
    content: (data) => data.contents,
    rules: [],
  },
  USER_FOCUS_BLOCK: {
    Icon: FileInput,
    title: () => 'File Context Added',
    rules: [],
    body: (data) => {
      if (!data.props) return;
      return (
        <p className="">
          {data.props.filePath} <br />
          Line {data.props.startLine} to Line {data.props.endLine}
        </p>
      );
    },
    content: (data) =>
      data.props?.filePath +
      'Line ' +
      data.props?.startLine +
      ' to Line ' +
      data.props?.endLine,
  },
  ASSISTANT_REPLACE_BLOCK: {
    Icon: FilePlus2Icon,
    title: () => 'Can I edit these files?',
    rules: [
      {
        description:
          'The file editing action after a USER_FOCUS_BLOCK must be an ASSISTANT_REPLACE_BLOCK. Other file editing actions like ASSISTANT_WRITE_FILE are not allowed.',
        check: (messages) => {
          const latestFocusBlock = findLatest(
            messages,
            (msg) => msg.type === 'USER_FOCUS_BLOCK'
          );
          if (!latestFocusBlock) return undefined;
          const checkStartIdx = messages.indexOf(latestFocusBlock) + 1;
          for (let i = checkStartIdx; i < messages.length; i += 1) {
            const curMsg = messages[i];
            if (curMsg.role === 'user') continue;
            if (curMsg.type === 'ASSISTANT_WRITE_FILE') {
              return `We expected only legal actions after a USER_FOCUS_BLOCK, but instead found ${curMsg.type}`;
            }
            if (curMsg.type === 'ASSISTANT_REPLACE_BLOCK') break;
          }
          return undefined;
        },
      },
      {
        description:
          'Each USER_FOCUS_BLOCK should have exactly one corresponding REPLACE_BLOCK, otherwise, use ASSISTANT_WRITE_FILE and overwrite the full file. ',
        check: (messages) => {
          //This looks like a double of the previous, but is required because sometimes when we are halfway generating the rule is not complete yet
          const latestReplaceBLock = findLatest(
            messages,
            (msg) => msg.type === 'ASSISTANT_REPLACE_BLOCK'
          );
          if (!latestReplaceBLock) return undefined;
          const checkStartIdx = messages.indexOf(latestReplaceBLock) - 1;
          for (let i = checkStartIdx; i >= 0; i -= 1) {
            const curMsg = messages[i];
            if (curMsg.role === 'user') continue;
            if (curMsg.type === 'ASSISTANT_INFO') continue;
            if (curMsg.type === 'ASSISTANT_PLANNING') continue;
            if (curMsg.type === 'ASSISTANT_READ_PATHS') continue;
            if (curMsg.type === 'ASSISTANT_REPLACE_BLOCK') break;
            return `We expected only legal actions after a USER_FOCUS_BLOCK, but instead found ${curMsg.type}`;
          }
          return undefined;
        },
      },
      {
        description:
          'Each USER_FOCUS_BLOCK should have exactly one corresponding REPLACE_BLOCK, otherwise, use ASSISTANT_WRITE_FILE and overwrite the full file. The filename of the replace block should match the preceding FOCUS_BLOCK',
        check: (messages) => {
          const latestMsg = messages.at(-1);
          if (!latestMsg?.isType('ASSISTANT_REPLACE_BLOCK')) {
            return undefined;
          }
          const checkStartIdx = messages.indexOf(latestMsg) - 1;
          let latestFocusBlock: ToolMessage<'USER_FOCUS_BLOCK'> | undefined;
          for (let i = checkStartIdx; i >= 0; i -= 1) {
            const curMsg = messages[i];
            if (curMsg.isType('ASSISTANT_REPLACE_BLOCK')) {
              return `Each replace block can only correspond to a single focus block, there are two replace blocks one after another! Use ASSISTANT_WRITE_FILE instead for the second one.`;
            }
            if (curMsg.isType('USER_FOCUS_BLOCK')) {
              latestFocusBlock = curMsg;
              break;
            }
          }
          if (!latestFocusBlock) {
            return 'We can only run ASSISTANT_REPLACE_BLOCK when there is a preceding FOCUS_BLOCK, but there was none found!';
          }
          if (!latestFocusBlock?.isType('USER_FOCUS_BLOCK')) {
            throw new Error('Expected user focus block');
          }
          if (!latestMsg.props?.filePath) return undefined;
          if (!latestFocusBlock.props?.filePath) return undefined;
          if (latestMsg.props.filePath !== latestFocusBlock.props.filePath) {
            return `Expected replace block filePath to match latest focus block filePath ${latestFocusBlock.props.filePath} but instead got ${latestMsg.props.filePath}`;
          }
          return undefined;
        },
      },
      // {
      //   description:
      //     'Repeat the preceding 4 lines before the replace block, if any, matching the original indentation exactly. The preceding lines should be inside a {PRECEDING_START}\n{PRECEDING_END} block',
      //   check: () => undefined,
      // },
      // {
      //   description:
      //     'Start and end the new code to replace the existing focused code with a {REPLACE_START}\n{REPLACE_END} block',
      //   check: () => undefined,
      // },
      // {
      //   description:
      //     'End the block with a {SUCCEEDING_START}\n{SUCCEEDING_END} block, whose contents should be the 4 lines after the replace block, if any, matching the original indentation exactly.',
      //   check: () => undefined,
      // },
    ],
    body: (data) => {
      if (!data.props) return;
      const thoughtsString = data.thoughts ? `💡${data.thoughts}` : '';
      let fullStr = data.loading
        ? `${data.body.length} characters loaded so far`
        : '';
      if (thoughtsString) {
        fullStr += '\n\n' + thoughtsString;
      }

      return (
        <>
          <div>{data.props?.filePath} </div>
          {fullStr}
        </>
      );
    },
    content: (data) => {
      if (!data.props) return '';
      const thoughtsString = data.thoughts ? `💡${data.thoughts}` : '';
      let fullStr = data.loading
        ? `${data.body.length} characters loaded so far`
        : '';
      if (thoughtsString) {
        fullStr += '\n\n' + thoughtsString;
      }
      return data.props?.filePath + '\n' + fullStr;
    },

    onFocus: async (message) => {
      if (!message.props) return;
      const curContents = await getLatestFocusedContent();
      if (curContents?.props.filePath !== message.props.filePath) {
        // throw new Error("Mismatch file path for replace block")
        return;
      }
      message.data.oldContents = curContents.fullContents;
      const newContentsArr: string[] = [];
      if (curContents.preSelection) {
        newContentsArr.push(curContents.preSelection);
      }
      newContentsArr.push(message.body);
      if (curContents.postSelection) {
        newContentsArr.push(curContents.postSelection);
      }
      //We need to do it like above to prevent new line issues
      message.data.newContents = newContentsArr.join('\n');
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
        name: 'Reject',
        action: (message) => {
          if (!message.props) return;
          trpc.files.removeFileChange.mutate({
            id: message.id,
          });
        },
        shortcutEnd: 'enter',
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
  USER_FILE_CONTENTS: {
    Icon: FileInputIcon,
    title: () => 'File Context Added',
    body: (data) => {
      if (!data.props) return;
      return data.props.filePath;
    },
    content: (data) => data.props?.filePath ?? '',
    rules: [],
  },
  ASSISTANT_WRITE_FILE: {
    Icon: FilePlus2Icon,
    title: () => 'Shall I update the following file?',
    rules: [
      {
        description:
          'You cannot write to a file until the file contents have been provided to you. Do not make assumptions about the contents of a file.',
        check: (messages) => {
          const latestMsg = messages.at(-1);
          if (!latestMsg?.isType('ASSISTANT_WRITE_FILE')) return undefined;
          if (!latestMsg.props) return undefined;
          const precedingFileContents = findLatest(messages, (msg) => {
            if (
              !msg.isType('USER_FOCUS_BLOCK') &&
              !msg.isType('USER_FILE_CONTENTS')
            ) {
              return false;
            }
            if (msg.props?.filePath !== latestMsg.props?.filePath) return false;
            return true;
          });
          if (!precedingFileContents) {
            return `You are trying to write to ${latestMsg.props.filePath}, but there is no such file in the context! Ask for permission to read the file first.`;
          }
          return undefined;
        },
      },
      {
        description:
          'You will need to provide the FULL FILE CONTENTS, because the action suggested to the user will be a full override of the existing file.',
        check: () => undefined,
      },
      // {
      //   description:
      //     'You cannot write to a file more than once until you obtain the updated contents of that file',
      //   check: () => undefined,
      // },
    ],
    body: (data) => {
      if (!data.props) return;
      const thoughtsString = data.thoughts ? `💡${data.thoughts}` : '';
      let fullStr = data.loading
        ? `${data.body.length} characters loaded so far`
        : '';
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
    content: (data) => {
      if (!data.props) return '';
      const thoughtsString = data.thoughts ? `💡${data.thoughts}` : '';
      let fullStr = data.loading
        ? `${data.body.length} characters loaded so far`
        : '';
      if (thoughtsString) {
        fullStr += '\n\n' + thoughtsString;
      }
      return 'File Path - ' + data.props?.filePath + '\n' + fullStr;
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
        name: 'Reject',
        action: (message) => {
          if (!message.props) return;
          trpc.files.removeFileChange.mutate({
            id: message.id,
          });
        },
        shortcutEnd: 'enter',
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
    rules: [],
    body: (data) => {
      const numFiles = data.body.split('\n').length;
      return `${numFiles} filenames added to context`;
    },
    content: (data) => {
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
