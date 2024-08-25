import chokidar from 'chokidar';
import { getWorkingDir } from '../helpers/get-working-dir';
import { getGitIgnoredFiles } from './get-ignore-patterns';
import { GeneratedFolder, GeneratedFile } from '@cto-ai/shared-types';

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

  function createFolderStructure(
    path: string,
    files: string[]
  ): GeneratedFolder {
    return {
      name: path,
      files: files.map(
        (file) =>
          ({
            name: file,
            content: undefined,
            contentEncoding: 'utf8',
          } as GeneratedFile)
      ),
      subFolders: [],
    };
  }

  const rootFolder: GeneratedFolder = {
    name: workingDir,
    files: [],
    subFolders: [],
  };

  for (const [path, files] of Object.entries(watchedPaths)) {
    if (path === workingDir) {
      rootFolder.files = files.map(
        (file) =>
          ({
            name: file,
            content: undefined,
            contentEncoding: 'utf8',
          } as GeneratedFile)
      );
    } else {
      rootFolder.subFolders.push(createFolderStructure(path, files));
    }
  }

  return rootFolder;
}
