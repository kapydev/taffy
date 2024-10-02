import * as vscode from 'vscode';
import path from 'path';
import { getGitIgnoredFiles } from './get-ignore-patterns';
import { toPosix } from '../helpers/to-posix';
import globToRegexp from 'glob-to-regexp';

export const getWorkspaceFiles = async () => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return [];
  }

  const rootFolder = toPosix(workspaceFolders[0].uri.fsPath);
  const ignorePatterns = getGitIgnoredFiles(rootFolder);

  return getFiles(rootFolder, ignorePatterns);
};

export const getFiles = async (
  basePath: string,
  ignorePatterns: string[],
  pathFromBase: string = ''
): Promise<string[]> => {
  const curPath = path.posix.join(basePath, pathFromBase);
  const folderUri = vscode.Uri.file(curPath);
  const files = await vscode.workspace.fs.readDirectory(folderUri);

  let results: string[] = [];
  for (const [name, type] of files) {
    const curPathFromPath = path.posix.join(pathFromBase, name);
    const isIgnored = ignorePatterns.some((ignorePattern) =>
      globToRegexp(ignorePattern).test(curPathFromPath)
    );
    if (isIgnored) continue;
    if (type === vscode.FileType.Directory) {
      results = results.concat(
        await getFiles(basePath, ignorePatterns, curPathFromPath)
      );
    } else {
      results.push(curPathFromPath);
    }
  }

  return results;
};
