import chokidar from 'chokidar';
import { getWorkingDir } from '../helpers/get-working-dir';

const ignoredFiles = process;
const watcher = chokidar.watch(getWorkingDir(), {});
