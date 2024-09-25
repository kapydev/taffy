import * as vscode from 'vscode';
import html from '../../../dist/apps/cto-ai/static/index.html?raw';
import '@cto-ai/shared-types';
import { createVscExtHandler } from './adapter/createVscExtHandler';
import { router, publicProcedure } from './trpc';
import { fileRouter } from './routers/files';
import { ee } from './event-emitter';
import { previewFileChange } from './files/preview-file-change';

const logger = console;
export let latestActiveEditor = vscode.window.activeTextEditor;
let currentPanel: vscode.WebviewPanel | undefined = undefined;

export const appRouter = router({
  files: fileRouter,
  testFunc: publicProcedure.query(async () => {
    await previewFileChange('.gitignore', ':) Hello there');
    return {};
  }),
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

  // Register the command
  const disposable = vscode.commands.registerCommand('cto-ai.init', () => {
    const bestCol = getBestColForWebView();

    if (currentPanel) {
      currentPanel.reveal(bestCol);
      return ee.emit('mainKeyboardShortcutPresed');
    }

    // Create and show a new webview
    currentPanel = vscode.window.createWebviewPanel(
      'cto-ai', // Identifies the type of the webview. Used internally
      'cto-ai', // Title of the panel displayed to the user
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

  //Add the diff view
  const diffContentProvider = new (class
    implements vscode.TextDocumentContentProvider
  {
    provideTextDocumentContent(uri: vscode.Uri): string {
      return Buffer.from(uri.query, 'base64').toString('utf-8');
    }
  })();
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      'diff-view',
      diffContentProvider
    )
  );
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
  const visibleColumns = vscode.window.visibleTextEditors.map(
    (editor) => editor.viewColumn
  );

  if (currentPanel?.visible) {
    visibleColumns.push(currentPanel.viewColumn);
  }

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
