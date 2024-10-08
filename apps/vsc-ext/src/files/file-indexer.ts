import { createBetterStore, sleep } from '@taffy/shared-helpers';
import vscode from 'vscode';
import path from 'path';
import globToRegexp from 'glob-to-regexp';
import { toPosix } from '../helpers/to-posix';
import { getGitIgnoredFiles } from './get-ignore-patterns';

const fileStore = createBetterStore({
  filePaths: new Set<string>(),
});

async function runIndexer() {
  const getFiles = async (
    basePath: string,
    ignoreRegexes: RegExp[],
    pathFromBase: string = ''
  ) => {
    const curPath = path.posix.join(basePath, pathFromBase);
    const folderUri = vscode.Uri.file(curPath);
    const files = await vscode.workspace.fs.readDirectory(folderUri);

    for (const [name, type] of files) {
      const curPathFromPath = path.posix.join(pathFromBase, name);
      const isIgnored = ignoreRegexes.some((ignorePattern) =>
        ignorePattern.test(curPathFromPath)
      );
      if (isIgnored) continue;
      if (type === vscode.FileType.Directory) {
        await getFiles(basePath, ignoreRegexes, curPathFromPath);
      } else {
        fileStore.set(
          'filePaths',
          new Set(fileStore.get('filePaths')).add(curPathFromPath)
        );
      }
    }
  };

  const root = getRootPath();
  if (!root) return;
  const ignorePatternGlobs = getGitIgnoredFiles(root);
  const ignorePatternRegexes = ignorePatternGlobs.map((glob) =>
    globToRegexp(glob)
  );
  return getFiles(root, ignorePatternRegexes);
}

/**For now only support single root folder otherwise relative paths will get nasty */
function getRootPath() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return undefined;
  }

  const rootFolders = workspaceFolders.map((workspaceFolder) =>
    toPosix(workspaceFolder.uri.fsPath)
  );

  return rootFolders[0];
}

vscode.workspace.onDidCreateFiles((event) => {
  const rootPath = getRootPath();
  if (!rootPath) return;
  for (const file of event.files) {
    const relativePath = path.posix.relative(rootPath, toPosix(file.fsPath));
    fileStore.set(
      'filePaths',
      new Set(fileStore.get('filePaths')).add(relativePath)
    );
  }
});

vscode.workspace.onDidDeleteFiles((event) => {
  const rootPath = getRootPath();
  if (!rootPath) return;
  for (const file of event.files) {
    const relativePath = path.posix.relative(rootPath, toPosix(file.fsPath));
    const updatedSet = new Set(fileStore.get('filePaths'));
    updatedSet.delete(relativePath);
    fileStore.set('filePaths', updatedSet);
  }
});

runIndexer();
