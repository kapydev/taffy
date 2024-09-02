import { ActionTemplate, InferAction } from './Action';

export const deleteFileActionTemplate = {
  name: 'DELETE_FILE',
  desc: 'Ask the user for permission to delete an existing file. The props should be the path to the file that needs to be deleted.',
  propDesc: {
    filePath: 'The path to the file that needs to be deleted.',
  },
  sampleProps: {
    filePath: 'src/utils/helloWorld.ts',
  },
} satisfies ActionTemplate;

export type DeleteFileAction = InferAction<typeof deleteFileActionTemplate>;
