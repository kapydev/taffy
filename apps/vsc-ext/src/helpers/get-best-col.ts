import * as vscode from 'vscode';
import { getCurWebView } from '../main';

export function getBestColForWebView(): vscode.ViewColumn {
  const editor = vscode.window.activeTextEditor;
  const baseCol: vscode.ViewColumn = vscode.ViewColumn.Beside;
  const curWebView = getCurWebView();
  if (curWebView?.visible && curWebView.viewColumn !== undefined) {
    return curWebView.viewColumn;
  }

  // Get all visible text editors
  const visibleColumns = vscode.window.tabGroups.all.map((tg) => tg.viewColumn);

  if (visibleColumns.length <= 1) {
    return baseCol;
  }

  //Use existing view column
  const bestCol = visibleColumns.find(
    (otherColumn) => otherColumn !== editor?.viewColumn
  );

  if (bestCol !== undefined) {
    return bestCol;
  }

  return baseCol;
}

export function getBestColForEditor(): vscode.ViewColumn {
  const curWebView = getCurWebView(); // Get the current webview, if any
  const editor = vscode.window.activeTextEditor; // Get the active text editor
  const baseCol: vscode.ViewColumn = vscode.ViewColumn.Beside; // Default column

  // If there is an active editor, return its view column
  if (editor?.viewColumn) {
    return editor.viewColumn ?? baseCol;
  }

  // Get all visible view columns
  const visibleColumns = vscode.window.tabGroups.all.map((tg) => tg.viewColumn);

  // Find the first column that is not occupied by the current webview
  const bestCol = visibleColumns.find(
    (col) => col !== curWebView?.viewColumn && curWebView?.visible
  );

  // Return the found column or the base column
  return bestCol ?? baseCol;
}
