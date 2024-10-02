import * as vscode from 'vscode';

export async function closeDiffViews() {
  const tabs = vscode.window.tabGroups.all
    .map((tg) => tg.tabs)
    .flat()
    .filter(
      (tab) =>
        tab.input instanceof vscode.TabInputTextDiff &&
        tab.input?.original?.scheme === 'readonly-view'
    );

  for (const tab of tabs) {
    await vscode.window.tabGroups.close(tab);
  }
}
