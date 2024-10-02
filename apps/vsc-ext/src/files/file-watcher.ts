import { booleanFilter } from '@taffy/shared-helpers';
import { FilesObj, GeneratedFile } from '@taffy/shared-types';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { getWorkingDir } from '../helpers/get-working-dir';
import { getGitIgnoredFiles } from './get-ignore-patterns';
import { toPosix } from '../helpers/to-posix';
// import { supabase } from '../supabaseClient';

const logger = console;

const workingDir = getWorkingDir();

let watcherReady = false;
const watcher = chokidar.watch(workingDir, {
  ignored: getGitIgnoredFiles(workingDir),
});
watcher.on('ready', () => (watcherReady = true));

export function extractWorkspacePath(fullPath: string): string | undefined {
  const basePath = toPosix(workingDir);
  const resolvedFullPath = toPosix(fullPath);
  if (!resolvedFullPath.includes(basePath)) return undefined;
  let relPath = resolvedFullPath.replace(basePath, '');
  if (relPath === '') {
    relPath = '/';
  }
  return relPath;
}

export function getFullPath(relPath: string): string {
  const basePath = toPosix(workingDir);
  const relativePath = toPosix(relPath);

  return path.posix.join(basePath, relativePath);
}

export const watchForChanges = () => {
  // Watch for file changes and update embeddings
  // watcher.on('change', async (filePath) => {
  //   logger.log(`File changed: ${filePath}`);
  //   // Read file content
  //   const content = await fs.promises.readFile(filePath, 'utf-8');
  //   // Generate new embedding for the updated file content
  //   const embedding = await generateEmbedding(content);
  //   // Update Supabase with the new embedding
  //   const { data, error } = await supabase
  //     .from('documents')
  //     .upsert({ embedding })
  //     .eq('file_path', filePath);
  //   if (error) {
  //     logger.error('Error updating embedding in Supabase:', error);
  //   } else {
  //     logger.log('Successfully updated embedding in Supabase for:', filePath);
  //   }
  // });
};

//URGENT TODO: I think the function is fine but it gets OOM very fast on large codebases
// New function to return structure in Record<string, string> format
export async function getFilesObj(): Promise<FilesObj> {
  await new Promise<void>((resolve) => {
    watcher.on('ready', resolve);
    if (watcherReady) resolve();
  });
  const watchedPaths = watcher.getWatched();

  // Make all paths relative unix paths
  const relUnixPaths: Record<string, string[]> = Object.fromEntries(
    Object.entries(watchedPaths)
      .map(([rawFolderPath, val]) => {
        const relPath = extractWorkspacePath(rawFolderPath);
        if (!relPath) return undefined;
        return [relPath, val];
      })
      .filter(booleanFilter)
  );
  const record: FilesObj = {};

  for (const [folder, files] of Object.entries(relUnixPaths)) {
    for (const file of files) {
      const filePath = path.posix.join(folder, file);
      const fullPath = path.posix.join(workingDir, filePath);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        // const content = fs.readFileSync(fullPath, 'utf-8');
        const generatedFile: GeneratedFile = {
          name: file,
          // content: content,
          content: undefined,
          contentEncoding: 'utf8',
        };
        record[filePath] = generatedFile;
      }
    }
  }

  return record;
}
