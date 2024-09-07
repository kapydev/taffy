import {
  booleanFilter,
  folderMapToGeneratedFolder,
} from '@cto-ai/shared-helpers';
import { GeneratedFolder } from '@cto-ai/shared-types';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { getWorkingDir } from '../helpers/get-working-dir';
import { supabase } from '../supabaseClient';
import { getGitIgnoredFiles } from './get-ignore-patterns';

const workingDir = getWorkingDir();

const watcher = chokidar.watch(workingDir, {
  ignored: getGitIgnoredFiles(workingDir),
});

let watcherReady = false;

watcher.on('ready', () => (watcherReady = true));

export async function getFolderStructure(): Promise<GeneratedFolder> {
  await new Promise<void>((resolve) => {
    watcher.on('ready', resolve);
    if (watcherReady) resolve();
  });
  const watchedPaths = watcher.getWatched();
  const basePath = workingDir.split(path.sep).join(path.posix.sep);

  // Make all paths relative unix paths
  const relUnixPaths = Object.fromEntries(
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

  const generatedFolder = folderMapToGeneratedFolder('/', relUnixPaths);
  return generatedFolder;
}
console.log('oioiio');
// Watch for file changes and update embeddings
watcher.on('change', async (filePath) => {
  console.log(`File changed: ${filePath}`);

  // Read file content
  const content = await fs.promises.readFile(filePath, 'utf-8');

  // Generate new embedding for the updated file content
  const embedding = await generateEmbedding(content);

  console.log("dwqniodqwni")

  // Update Supabase with the new embedding
  const { data, error } = await supabase
    .from('documents')
    .upsert({ embedding })
    .eq('file_path', filePath);

  if (error) {
    console.error('Error updating embedding in Supabase:', error);
  } else {
    console.log('Successfully updated embedding in Supabase for:', filePath);
  }
});

// Dummy function to generate embeddings
async function generateEmbedding(content: string): Promise<string> {
  // Implement this with your actual logic to generate embeddings
  return 'new-embedding-for-content';
}
