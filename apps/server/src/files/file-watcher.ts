import chokidar from 'chokidar';
import { getWorkingDir } from '../helpers/get-working-dir';
import { getGitIgnoredFiles } from './get-ignore-patterns';

const workingDir = getWorkingDir();
console.log(getGitIgnoredFiles(workingDir));
const watcher = chokidar.watch(workingDir, {
  ignored: getGitIgnoredFiles(workingDir),
});

watcher.on('ready', () => {
  const watchedPaths = watcher.getWatched();
  console.log(watchedPaths);
});
