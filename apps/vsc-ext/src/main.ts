import * as vscode from 'vscode';
// import html from '../../../dist/apps/cto-ai/static/index.html?raw';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('cto-ai.start', () => {
      console.log('Hello World!');
      // Create and show a new webview
      const panel = vscode.window.createWebviewPanel(
        'catCoding', // Identifies the type of the webview. Used internally
        'CTO AI', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
          enableScripts: true,
        } // Webview options. More on these later.
      );

      panel.webview.html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <base href="http://localhost:4200" target="_blank">
    <script type="module">
import { inject } from "/@vite-plugin-checker-runtime";
inject({
  overlayConfig: {"position":"tr","panelStyle":"\n      \tleft: 1rem;\n      \tbottom: 1rem;\n      \twidth: calc(100vw - 2rem);\n      \tmax-height: 90vh;\n      \theight: auto;\n      \tborder-radius: 10px;\n      \tbackground: #450a0a55;\n        backdrop-filter: blur(8px);\n      }"},
  base: "/",
});
</script>

    <script type="module">
import RefreshRuntime from "/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
</script>

    <script type="module" src="/@vite/client"></script>

    <meta charset="utf-8" />
    <title>CtoAi</title>
    <base href="/" />

    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
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
