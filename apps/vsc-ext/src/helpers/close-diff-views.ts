import * as vscode from 'vscode';

export async function closeDiffViews() {
  const tabs = vscode.window.tabGroups.all
    .map((tg) => tg.tabs)
    .flat()
    .filter(
      (tab) =>
        tab.input instanceof vscode.TabInputTextDiff &&
        tab.input?.original?.scheme === 'diff-view'
    );

  for (const tab of tabs) {
    // trying to close dirty views results in save popup
    if (!tab.isDirty) {
      await vscode.window.tabGroups.close(tab);
    }
  }
}
