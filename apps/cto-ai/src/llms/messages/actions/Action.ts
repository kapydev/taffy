import { ReadFileAction } from './readFileAction';

export interface ActionTemplate {
  name: string;
  desc: string;
  sampleContents?: string;
  propDesc: Record<string, string>;
  sampleProps: Record<string, string | number>;
}

export type InferAction<T extends ActionTemplate> = {
  name?: T['name'];
  contents?: T['sampleContents'];
  props?: T['sampleProps'];
};

export type AnyAction = InferAction<ActionTemplate>;
export type Action = ReadFileAction;
