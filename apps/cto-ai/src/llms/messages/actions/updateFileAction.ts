import { ActionTemplate, InferAction } from './Action';

export const updateFileActionTemplate = {
  name: 'UPDATE_FILE',
  desc: 'Ask the user for permission to update an existing file. The props should be the start line and the end line of the existing file to replace, and the contents should be the value to replace it with, with all of the indentation included. If only one line is being replaced, the start and end line should be the same.',
  propDesc: {
    filePath: 'The path to the file that needs to be updated.',
    startLine: 'The starting line number of the content to be replaced.',
    endLine: 'The ending line number of the content to be replaced.',
  },
  sampleProps: {
    filePath: 'src/utils/helloWorld.ts',
    startLine: 2,
    endLine: 2,
  },
  sampleContents: `${'console'}.log("Updated Hello World!")`,
} satisfies ActionTemplate;

export type UpdateFileAction = InferAction<typeof updateFileActionTemplate>;
