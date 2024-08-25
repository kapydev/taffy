import chokidar from 'chokidar';
import path from 'path';
import { getWorkingDir } from '../helpers/get-working-dir';
import { getGitIgnoredFiles } from './get-ignore-patterns';
import { GeneratedFolder, GeneratedFile } from '@cto-ai/shared-types';
import {
  booleanFilter,
  folderMapToGeneratedFolder,
} from '@cto-ai/shared-helpers';

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
  //Make all paths relative unix paths
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
