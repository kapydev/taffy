import * as vscode from 'vscode';
import html from '../../../dist/apps/cto-ai/static/index.html?raw';
import '@cto-ai/shared-types';

const logger = console;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('cto-ai.start', () => {
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
      panel.webview.onDidReceiveMessage(
        (message) => {
          logger.log(message);
        },
        undefined,
        context.subscriptions
      );
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
        logger.log(`Selected text: ${selectedText}`);
        logger.log(`File name: ${fileName}`);

        // You can also show the message to the user
        vscode.window.showInformationMessage(
          `Selected text: ${selectedText}, File: ${fileName}`
        );
      } else {
        vscode.window.showInformationMessage('No active editor found');
      }
    }
  );

  // Push the command to the subscriptions
  context.subscriptions.push(disposable);
}

function getWebViewContent(): string {
  return html;

  // return `<!DOCTYPE html>
  // <html lang="en">
  // <head>
  // <base href="http://localhost:4200"/>
  //     <meta charset="UTF-8">
  //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //     <title>Cat Coding</title>
  // </head>
  // <body>
  //     <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
  //     <h1 id="lines-of-code-counter">0</h1>

  //     <script>
  //         (function() {
  //             const vscode = acquireVsCodeApi();
  //             const counter = document.getElementById('lines-of-code-counter');

  //             let count = 0;
  //             setInterval(() => {
  //                 counter.textContent = count++;

  //                 // Alert the extension when our cat introduces a bug
  //                 if (Math.random() < 0.001 * count) {
  //                     vscode.postMessage({
  //                         command: 'alert',
  //                         text: '🐛  on line ' + count
  //                     })
  //                 }
  //             }, 100);
  //         }())
  //     </script>
  // </body>
  // </html>`
}
