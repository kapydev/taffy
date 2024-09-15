export interface GeneratedFolder {
  name: string;
  files: GeneratedFile[];
  subFolders: GeneratedFolder[];
  timestamp?: number;
}

interface GeneratedFileBase {
  name: string;
  fileType?: string;
}

export interface GeneratedTextFile extends GeneratedFileBase {
  content?: string;
  contentEncoding: 'utf8' | 'base64';
}

/**
 * WARNING: this cannot be deserialized with JSON.parse as it will parse content as an array. It is also very ineffecient to serialize to JSON
 * When using JSON. base64 is preferred
 */
export interface GeneratedBinaryFile extends GeneratedFileBase {
  content?: Uint8Array;
  contentEncoding: 'binary';
}

export type GeneratedFile = GeneratedTextFile | GeneratedBinaryFile;

export declare type FileEncoding = 'base64' | 'utf8' | 'binary';

export type FilesObj = Record<string, GeneratedFile>