import * as vscode from 'vscode';
import html from '../../../dist/apps/cto-ai/static/index.html?raw';
import '@cto-ai/shared-types';
import { createVscExtHandler } from './adapter/createVscExtHandler';
import { router, publicProcedure } from './trpc';
import { fileRouter } from './routers/files';

const logger = console;

export const appRouter = router({
  files: fileRouter,
  hello: publicProcedure.query(() => {
    return {
      message: 'Hello, world!',
    };
  }),
});

export function activate(context: vscode.ExtensionContext) {
  // Register the command
  const disposable = vscode.commands.registerCommand(
    'cto-ai.logSelectedTextAndFile',
    () => {
      // Get the active text editor
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showInformationMessage('No active editor found');
        return;
      }
      // Get the selected text
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      // Get the file name
      const fileName = editor.document.fileName;

      // Log the information
      logger.log(`Selected text: ${selectedText}`);
      logger.log(`File name: ${fileName}`);

      // You can also show the message to the user
      vscode.window.showInformationMessage(
        `Selected text: ${selectedText}, File: ${fileName}`
      );

      // Get all visible text editors
      const visibleEditors = vscode.window.visibleTextEditors;

      let bestCol: vscode.ViewColumn | undefined = vscode.ViewColumn.Beside;
      if (visibleEditors.length > 1) {
        //Use existing view column
        const newBestCol = visibleEditors.find(
          (otherEditor) => otherEditor.viewColumn !== editor.viewColumn
        )?.viewColumn;
        if (newBestCol) {
          bestCol = newBestCol;
        }
      }

      // Create and show a new webview
      const panel = vscode.window.createWebviewPanel(
        'cto-ai', // Identifies the type of the webview. Used internally
        'CTO AI', // Title of the panel displayed to the user
        bestCol, // Editor column to show the new webview panel in.
        {
          enableScripts: true,
        } // Webview options. More on these later.
      );

      panel.webview.html = getWebViewContent();

      createVscExtHandler({ panel, context, router: appRouter });
    }
  );

  // Push the command to the subscriptions
  context.subscriptions.push(disposable);
}

function getWebViewContent(): string {
  return html;
}
