import * as vscode from 'vscode';

export function getWorkingDir(): string {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
}
