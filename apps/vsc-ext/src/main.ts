import * as vscode from 'vscode';
import html from '../../../dist/apps/cto-ai/static/index.html?raw';
import '@cto-ai/shared-types';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('cto-ai.start', () => {
      console.log('Hello World!');
      // Create and show a new webview
      const panel = vscode.window.createWebviewPanel(
        'cto-ai', // Identifies the type of the webview. Used internally
        'CTO AI', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
          enableScripts: true,
        } // Webview options. More on these later.
      );

      panel.webview.html = getWebViewContent();
    })
  );

  // Register the command
  const disposable = vscode.commands.registerCommand(
    'cto-ai.logSelectedTextAndFile',
    () => {
      // Get the active text editor
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        // Get the selected text
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        // Get the file name
        const fileName = editor.document.fileName;

        // Log the information
        console.log(`Selected text: ${selectedText}`);
        console.log(`File name: ${fileName}`);

        // You can also show the message to the user
        vscode.window.showInformationMessage(
          `Selected text: ${selectedText}, File: ${fileName}`
        );
      } else {
        vscode.window.showInformationMessage('No active editor found');
      }
    }
  );

  console.log('All registered :)');

  // Push the command to the subscriptions
  context.subscriptions.push(disposable);
}

function getWebViewContent(): string {
  return html;
}
