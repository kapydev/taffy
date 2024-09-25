import { ReadFileActionMessage } from '../ReadFileActionMessage';
import { ActionTemplate, InferAction } from './Action';

export const readFileActionTemplate = {
  name: 'READ_FILE',
  desc: 'Ask the user for permission to add a file to the context. The contents should be all the files that need to be read, seperated by newlines. DO NOT ask to read non existent files that are not provided in the codebase context.',
  propDesc: {},
  sampleProps: {},
  sampleContents: 'src/index.ts\nsrc/messages/helloWorld.ts',
} satisfies ActionTemplate;

export type ReadFileAction = InferAction<typeof readFileActionTemplate>;
