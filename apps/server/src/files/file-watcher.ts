import {
  booleanFilter,
  folderMapToGeneratedFolder,
} from '@cto-ai/shared-helpers';
import { GeneratedFile, GeneratedFolder } from '@cto-ai/shared-types';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { getWorkingDir } from '../helpers/get-working-dir';
import { supabase } from '../supabaseClient';
import { getGitIgnoredFiles } from './get-ignore-patterns';
import { generateEmbedding } from '../helpers/generate-embeddings';

const workingDir = getWorkingDir();

let watcherReady = false;
const watcher = chokidar.watch(workingDir, {
  ignored: getGitIgnoredFiles(workingDir),
});
watcher.on('ready', () => (watcherReady = true));

export const watchForChanges = () => {
  // Watch for file changes and update embeddings
  watcher.on('change', async (filePath) => {
    console.log(`File changed: ${filePath}`);

    // Read file content
    const content = await fs.promises.readFile(filePath, 'utf-8');

    // Generate new embedding for the updated file content
    const embedding = await generateEmbedding(content);

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
};

// New function to return structure in Record<string, string> format
export async function getFilesObj(): Promise<Record<string, GeneratedFile>> {
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
  const record: Record<string, GeneratedFile> = {};

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
