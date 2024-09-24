import {
  booleanFilter,
  folderMapToGeneratedFolder,
} from '@cto-ai/shared-helpers';
import { FilesObj, GeneratedFile, GeneratedFolder } from '@cto-ai/shared-types';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { getWorkingDir } from '../helpers/get-working-dir';
import { getGitIgnoredFiles } from './get-ignore-patterns';
import { generateEmbedding } from '../helpers/generate-embeddings';
import { supabase } from '../supabaseClient';

const logger = console;

const workingDir = getWorkingDir();

let watcherReady = false;
const watcher = chokidar.watch(workingDir, {
  ignored: getGitIgnoredFiles(workingDir),
});
watcher.on('ready', () => (watcherReady = true));

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
  const basePath = workingDir.split(path.sep).join(path.posix.sep);

  // Make all paths relative unix paths
  const relUnixPaths: Record<string, string[]> = Object.fromEntries(
    Object.entries(watchedPaths)
      .map(([rawFolderPath, val]) => {
        const unixPath = rawFolderPath.split(path.sep).join(path.posix.sep);
        if (!unixPath.includes(basePath)) return undefined;
        let relPath = unixPath.replace(basePath, '');
        if (relPath === '') {
          relPath = '/';
        }
        return [relPath, val];
      })
      .filter(booleanFilter)
  );
  const record: FilesObj = {};

  for (const [folder, files] of Object.entries(relUnixPaths)) {
    for (const file of files) {
      const filePath = path.posix.join(folder, file);
      const fullPath = path.join(workingDir, filePath);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const generatedFile: GeneratedFile = {
          name: file,
          content: content,
          contentEncoding: 'utf8',
        };
        record[filePath] = generatedFile;
      }
    }
  }

  return record;
}
