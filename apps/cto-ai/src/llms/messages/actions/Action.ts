export interface Action {
  name: string;
  desc: string;
  sampleContents?: string;
  propDesc: Record<string, string>;
  sampleProps: Record<string, string>;
}
