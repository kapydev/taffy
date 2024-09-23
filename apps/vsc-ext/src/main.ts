import * as vscode from 'vscode';
import html from '../../../dist/apps/cto-ai/static/index.html?raw';
import '@cto-ai/shared-types';
import { createVscExtHandler } from './adapter/createVscExtHandler';
import { router, publicProcedure } from './trpc';
import { fileRouter } from './routers/files';
import { ee } from './event-emitter';

const logger = console;
export let latestActiveEditor = vscode.window.activeTextEditor;

export const appRouter = router({
  files: fileRouter,
  hello: publicProcedure.query(() => {
    return {
      message: 'Hello, world!',
    };
  }),
});

export function activate(context: vscode.ExtensionContext) {
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (!editor) return;
    latestActiveEditor = editor;
  });
  let currentPanel: vscode.WebviewPanel | undefined = undefined;
  // Register the command
  const disposable = vscode.commands.registerCommand('cto-ai.init', () => {
    const bestCol = getBestColForWebView();

    if (currentPanel) {
      currentPanel.reveal(bestCol);
      return ee.emit('ctrlKPressed');
    }

    // Create and show a new webview
    currentPanel = vscode.window.createWebviewPanel(
      'cto-ai', // Identifies the type of the webview. Used internally
      'CTO AI', // Title of the panel displayed to the user
      bestCol, // Editor column to show the new webview panel in.
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      } // Webview options. More on these later.
    );

    createVscExtHandler({ panel: currentPanel, context, router: appRouter });
    currentPanel.webview.html = getWebViewContent();
    currentPanel.onDidDispose(
      () => {
        currentPanel = undefined;
      },
      null,
      context.subscriptions
    );
    return;
  });

  // Push the command to the subscriptions
  context.subscriptions.push(disposable);
}

function getWebViewContent(): string {
  return html;
}

function getBestColForWebView(): vscode.ViewColumn {
  const editor = vscode.window.activeTextEditor;
  const baseCol: vscode.ViewColumn = vscode.ViewColumn.Beside;

  // Get all visible text editors
  const visibleEditors = vscode.window.visibleTextEditors;

  if (visibleEditors.length <= 1) {
    return baseCol;
  }

  //Use existing view column
  const bestCol = visibleEditors.find(
    (otherEditor) => otherEditor.viewColumn !== editor?.viewColumn
  )?.viewColumn;

  if (bestCol !== undefined) {
    return bestCol;
  }

  return baseCol;
}
