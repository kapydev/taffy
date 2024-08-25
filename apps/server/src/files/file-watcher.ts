import chokidar from 'chokidar';
import { getWorkingDir } from '../helpers/get-working-dir';
import { getGitIgnoredFiles } from './get-ignore-patterns';

const workingDir = getWorkingDir();
const watcher = chokidar.watch(workingDir, {
  ignored: getGitIgnoredFiles(workingDir),
});
'bu'
watcher.on('ready', () => {
//   const watchedPaths = watcher.gedtWatched(); 
  console.log(getGitIgnoredFiles(workingDir));
});
