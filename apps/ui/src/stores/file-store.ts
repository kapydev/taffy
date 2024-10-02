// import { FilesObj, GeneratedFile } from '@taffy/shared-types';
// import type { AppRouter } from '@taffy/vsc-ext/types';
// import { inferProcedureOutput } from '@trpc/server';
// import { trpc } from '../client';
// import { createToolMessage } from '../llms/messages/ToolMessage';
// import { chatStore } from './chat-store';
// import { createBetterStore } from './create-better-store';

// export const fileStore = createBetterStore({
//   files: undefined as FilesObj | undefined,
//   selectionData: undefined as
//     | inferProcedureOutput<AppRouter['files']['onSelectionChange']>
//     | undefined,
// });

// export async function getFileContentsByPath(
//   filePath: string
// ): Promise<GeneratedFile | undefined> {
//   const data = await trpc.files.getFileByPath.query({ filePath });
//   const curFiles = fileStore.get('files');
//   if (!curFiles || !data) return data;
//   curFiles[filePath] = data;
//   fileStore.set('files', curFiles);
//   return data;
// }

// export async function updateFileContentsByPath(
//   filePath: string,
//   contents: string,
//   preview: boolean,
//   lineData?: {
//     start: number;
//     end: number;
//   }
// ): Promise<void> {
//   await trpc.files.updateFileByPath.mutate({
//     filePath,
//     lineData,
//     content: contents,
//     preview,
//   });
//   const data = await trpc.files.getFileByPath.query({ filePath });
//   if (!data) throw new Error('File not found');

//   const curFiles = fileStore.get('files');
//   if (curFiles) {
//     curFiles[filePath] = data;
//     fileStore.set('files', curFiles);
//   }
// }

// trpc.files.getWorkingDirFilesObj.query().then((fileTree) => {
//   if (!fileTree) return;
//   fileStore.set('files', fileTree as FilesObj);
// });
