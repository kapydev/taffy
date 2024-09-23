import { ActionTemplate, InferAction } from './Action';

export const writeFileActionTemplate = {
  name: 'WRITE_FILE',
  desc: 'Ask the user for permission to create a new file. The contents should be all the files that needs to be written, seperated by newlines.',
  propDesc: {
    filePath:
      "The path to which the file is written. If the file path doesn't exist, directories will be recursively created until we are able to create the file.",
  },
  sampleProps: {
    filePath: 'src/utils/helloWorld.ts',
  },
  sampleContents: `export function helloWorld() {
  ${'console'}.log("Hello World!")
}`,
} satisfies ActionTemplate;

export type WriteFileAction = InferAction<typeof writeFileActionTemplate>;
