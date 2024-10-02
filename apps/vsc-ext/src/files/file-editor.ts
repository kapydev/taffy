import path from 'path';
import { getBestColForEditor } from '../helpers/get-best-col';
import { toUtf8 } from '../helpers/to-utf8';
import { getFullPath } from './file-watcher';
import * as vscode from 'vscode';

export class FileEditor {
  private _doc: vscode.TextDocument | undefined;

  constructor(public filePath: string) {}

  get fullPath() {
    return getFullPath(this.filePath);
  }

  get uri() {
    return vscode.Uri.file(this.fullPath);
  }

  /**Just the file name without preceeding folder names */
  get fileName() {
    return path.basename(this.filePath);
  }

  async getDoc(): Promise<vscode.TextDocument | undefined> {
    if (!this._doc) {
      this._doc = await vscode.workspace.openTextDocument(this.uri);
    }
    return this._doc;
  }

  /**Gets the contents currently on disk. Does not include unsaved changes */
  async getDiskContents(): Promise<string | undefined> {
    const fileContentsArr = await vscode.workspace.fs.readFile(this.uri);
    return toUtf8(fileContentsArr);
  }

  /**Gets the contents including unsaved changes */
  async getContents(): Promise<string | undefined> {
    const document = await this.getDoc();
    return document?.getText();
  }

  async createReadonlyUri(): Promise<vscode.Uri> {
    const curContents = await this.getContents();
    return vscode.Uri.parse(`readonly-view:${this.fileName}`).with({
      query: curContents,
    });
  }

  async showDiffView(newContents: string) {
    const openOpts: vscode.TextDocumentShowOptions = {
      viewColumn: getBestColForEditor(),
    };
    const doc = await this.getDoc();
    if (!doc) return;
    await vscode.commands.executeCommand(
      'vscode.diff',
      await this.createReadonlyUri(),
      doc.uri,
      `${this.fileName}: Suggested Changes`,
      openOpts
    );
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      doc.positionAt(0),
      doc.positionAt(doc.getText().length)
    );

    // edit.insert(doc.uri);
  }
}

