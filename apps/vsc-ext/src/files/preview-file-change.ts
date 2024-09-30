import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { getFullPath } from './file-watcher';
import { latestActiveEditor } from '../main';
import { ee } from '../event-emitter';
import { closeDiffViews } from '../helpers/close-diff-views';
import { getBestColForEditor } from '../helpers/get-best-col';

export async function previewFileChange(
  filePath: string,
  newContents: string,
  previewId: string
) {
  const fileChangeApproved = new Promise<void>((res) => {
    ee.on('fileChangeApproved', (approvedId) => {
      if (approvedId !== previewId) return;
      res();
    });
  });
  const absolutePath = getFullPath(filePath);
  const fileExists = await fs
    .access(absolutePath)
    .then(() => true)
    .catch(() => false);

  let originalContent = '';
  if (fileExists) {
    originalContent = await fs.readFile(absolutePath, 'utf-8');
    const eol = originalContent.includes('\r\n') ? '\r\n' : '\n';
    if (originalContent.endsWith(eol) && !newContents.endsWith(eol)) {
      newContents += eol;
    }
  }

  const fileName = path.basename(absolutePath);

  if (!fileExists) {
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, '');
  }

  const updatedDocument = await vscode.workspace.openTextDocument(
    vscode.Uri.file(absolutePath)
  );

  const openOpts: vscode.TextDocumentShowOptions = {
    viewColumn: latestActiveEditor?.viewColumn,
  };

  await vscode.commands.executeCommand(
    'vscode.diff',
    vscode.Uri.parse(`diff-view:${fileName}`).with({
      query: Buffer.from(originalContent).toString('base64'),
    }),
    updatedDocument.uri,
    `${fileName}: Suggested Changes`,
    openOpts
  );

  const edit = new vscode.WorkspaceEdit();
  if (!fileExists) {
    edit.insert(updatedDocument.uri, new vscode.Position(0, 0), newContents);
  } else {
    const fullRange = new vscode.Range(
      updatedDocument.positionAt(0),
      updatedDocument.positionAt(updatedDocument.getText().length)
    );
    edit.replace(updatedDocument.uri, fullRange, newContents);
  }
  await vscode.workspace.applyEdit(edit);

  await fileChangeApproved;

  //TODO: file change declined

  await updatedDocument.save();
  await vscode.window.showTextDocument(vscode.Uri.file(absolutePath), {
    preview: false,
    viewColumn: getBestColForEditor(),
  });
  await closeDiffViews();
}
