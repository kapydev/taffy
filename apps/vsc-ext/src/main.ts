import '@taffy/shared-types';
import fuzzysort from 'fuzzysort';
import * as vscode from 'vscode';
import html from '../../../dist/apps/taffy/static/index.html?raw';
import { createVscExtHandler } from './adapter/createVscExtHandler';
import { ee } from './event-emitter';
import { removeAllEditors } from './files/file-editor';
import { getWorkspaceFiles } from './files/get-folder-structure';
import { getBestColForWebView } from './helpers/get-best-col';
import { fileRouter } from './routers/files';
import { publicProcedure, router } from './trpc';

const logger = console;
export let latestActiveEditor = vscode.window.activeTextEditor;
let currentWebview: vscode.WebviewPanel | undefined = undefined;

export function getCurWebView() {
  return currentWebview;
}

export const appRouter = router({
  files: fileRouter,
  testFunc: publicProcedure.query(async () => {
    const files = await getWorkspaceFiles();
    const glob = 'vite';
    // Import the fuzzy matching library

    // Perform a fuzzy match on filteredFiles
    const fuzzyResults = fuzzysort.go(glob, files);
    console.log(fuzzyResults);
    debugger;

    // Remove 'debugger' and replace with the return of the results
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
  const disposable = vscode.commands.registerCommand('taffy.init', () => {
    const bestCol = getBestColForWebView();

    if (currentWebview) {
      currentWebview.reveal(bestCol);
      return ee.emit('mainKeyboardShortcutPressed');
    }

    // Create and show a new webview
    currentWebview = vscode.window.createWebviewPanel(
      'taffy', // Identifies the type of the webview. Used internally
      'taffy', // Title of the panel displayed to the user
      bestCol, // Editor column to show the new webview panel in.
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      } // Webview options. More on these later.
    );

    createVscExtHandler({ panel: currentWebview, context, router: appRouter });
    currentWebview.webview.html = getWebViewContent();
    currentWebview.onDidDispose(
      () => {
        currentWebview = undefined;
        removeAllEditors();
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
      'readonly-view',
      diffContentProvider
    )
  );
  // Push the command to the subscriptions
  context.subscriptions.push(disposable);
}

function getWebViewContent(): string {
  return html;
}
