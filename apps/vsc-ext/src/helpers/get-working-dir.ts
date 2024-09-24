import * as vscode from 'vscode';

export function getWorkingDir(): string | undefined {
  return vscode.workspace.workspaceFolders[0]?.uri.fsPath;
}
