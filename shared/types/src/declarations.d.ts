declare module '*?raw' {
  const content: string;
  export default content;
}
declare module 'vscode' {
  declare namespace workspace {
    const fs = {
      copy: (
        source: string,
        destination: string,
        options?: { overwrite?: boolean }
      ) => Thenable<void>,
      createDirectory: (uri: string) => Thenable<void>,
      delete: (uri: string, options?: { recursive?: boolean }) =>
        Thenable<void>,
      isWritableFileSystem: (scheme: string) => boolean,
      readDirectory: (uri: string) => Thenable<[string, { type: number }][]>,
      readFile: (uri: string) => Thenable<Uint8Array>,
      rename: (
        source: string,
        target: string,
        options?: { overwrite?: boolean }
      ) => Thenable<void>,
      stat: (uri: string) =>
        Thenable<{ type: number; ctime: number; mtime: number; size: number }>,
      writeFile: (uri: string, content: Uint8Array) => Thenable<void>,
    };
    export { fs };
  }
}
