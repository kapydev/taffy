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
  console.log({ ignorePatterns });

  return getFiles(rootFolder, ignorePatterns);
};

export const getFiles = async (
  folderPathPosix: string,
  ignorePatterns: string[]
): Promise<string[]> => {
  const folderUri = vscode.Uri.file(folderPathPosix);
  const files = await vscode.workspace.fs.readDirectory(folderUri);

  let results: string[] = [];
  for (const [name, type] of files) {
    const filePath = path.posix.join(folderPathPosix, name);
    const isIgnored = ignorePatterns.some((ignorePattern) =>
      globToRegexp(ignorePattern).test(filePath)
    );
    if (isIgnored) continue;
    if (type === vscode.FileType.Directory) {
      results = results.concat(await getFiles(filePath, ignorePatterns));
    } else {
      results.push(filePath);
    }
  }

  return results;
};
