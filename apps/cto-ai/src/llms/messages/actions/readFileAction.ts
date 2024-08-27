import { Action } from "./Action";

export const readFileAction: Action = {
  name: 'READ_FILE',
  desc: 'Ask the user for permission to add a file to the context. You can ask to read multiple files, BUT WAIT FOR THE USERS RESPONSE BEFORE CONTINUING TO RESPOND TO THE ORIGINAL QUESTION.',
  propDesc: {
    file: 'The file referenced for the action',
  },
  sampleProps: {
    file: JSON.stringify('src/index.ts'),
  },
  sampleContents: undefined,
};
