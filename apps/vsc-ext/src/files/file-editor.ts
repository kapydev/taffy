import fs from 'fs/promises';
import path from 'path';
import { v4 } from 'uuid';
import * as vscode from 'vscode';
import { getBestColForEditor } from '../helpers/get-best-col';
import { getFullPath } from './file-watcher';
import { toUtf8 } from '../helpers/to-utf8';

const allFileEditors: Set<FileEditor> = new Set();

async function createReadonlyUri(
  contents: string,
  viewName: string
): Promise<vscode.Uri> {
  const encodedContents = Buffer.from(contents).toString('base64');
  return vscode.Uri.parse(`readonly-view:${viewName}`).with({
    query: encodedContents,
  });
}
export class FileEditor {
  //Only have one readonlyuri per class
  private _readonlyUri: vscode.Uri | undefined;
  private modifiedContents: string | undefined;
  private _doc: vscode.TextDocument | undefined;

  constructor(public filePath: string) {
    allFileEditors.add(this);
  }

  get absPath() {
    return getFullPath(this.filePath);
  }

  get uri() {
    return vscode.Uri.file(this.absPath);
  }

  /**Just the file name without preceeding folder names */
  get fileName() {
    return path.basename(this.filePath);
  }

  async exists() {
    return await fs
      .access(this.absPath)
      .then(() => true)
      .catch(() => false);
  }

  /**Create the file if it does not exist */
  async createIfNotExists() {
    if (await this.exists()) return;
    await fs.mkdir(path.dirname(this.absPath), { recursive: true });
    await fs.writeFile(this.absPath, '');
  }

  async getDoc(): Promise<vscode.TextDocument | undefined> {
    if (!this._doc) {
      if (!(await this.exists())) return undefined;
      this._doc = await vscode.workspace.openTextDocument(this.uri);
    }
    return this._doc;
  }

  /**Gets the contents currently on disk. Does not include unsaved changes */
  // async getDiskContents(): Promise<string | undefined> {
  //   const fileContentsArr = await vscode.workspace.fs.readFile(this.uri);
  //   return toUtf8(fileContentsArr);
  // }

  /**Gets the contents including unsaved changes */
  async getContents(): Promise<string | undefined> {
    const document = await this.getDoc();
    return document?.getText();

    //Previously there's this code but I'm not sure if 100% necessary - its to prevent git from showing weird eol warnings
    // const fileExists =
    // let originalContent = '';
    // if (fileExists) {
    //   originalContent = await fs.readFile(absolutePath, 'utf-8');
    //   const eol = originalContent.includes('\r\n') ? '\r\n' : '\n';
    //   if (originalContent endsWith(eol) && !newContents.endsWith(eol)) {
    //     newContents += eol;
    //   }
    // }
  }

  async getFileReadonlyUri(): Promise<vscode.Uri> {
    const contents = await this.getContents();
    if (this._readonlyUri) return this._readonlyUri;
    this._readonlyUri = await createReadonlyUri(
      contents || '',
      `${v4()}-${this.fileName}`
    );
    return this._readonlyUri;
  }

  async setDocContents(contents: string) {
    const doc = await this.getDoc();
    if (!doc) return;
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      doc.positionAt(0),
      doc.positionAt(doc.getText().length)
    );
    if (!fullRange.isEmpty) {
      edit.replace(doc.uri, fullRange, contents);
    } else {
      edit.insert(doc.uri, new vscode.Position(0, 0), contents);
    }
    vscode.workspace.applyEdit(edit);
  }

  //TODO: Stream diff view - easier for users to see what is changing when it is streaming
  async showDiffView(newContents: string) {
    const curReadonlyUri = await this.getFileReadonlyUri();
    const newReadonlyUri = await createReadonlyUri(
      newContents,
      `${v4()}-new-${this.fileName}`
    );
    const openOpts: vscode.TextDocumentShowOptions = {
      viewColumn: getBestColForEditor(),
    };
    await vscode.commands.executeCommand(
      'vscode.diff',
      curReadonlyUri,
      newReadonlyUri,
      `${this.fileName}: Suggested Changes`,
      openOpts
    );
    this.modifiedContents = newContents;
    const originalTab = await this.getOriginalDocTab();
    const activeEditor = vscode.window.activeTextEditor;
    if (
      originalTab?.isActive &&
      originalTab.group.viewColumn === activeEditor?.viewColumn
    ) {
      const visibleRanges = activeEditor.visibleRanges;
      if (visibleRanges.length > 0) {
        const range = visibleRanges[0];
        activeEditor.revealRange(range, vscode.TextEditorRevealType.AtTop);
      }
    }
  }

  async getDiffTab(): Promise<vscode.Tab | undefined> {
    const uri = await this.getFileReadonlyUri();
    const tabs = vscode.window.tabGroups.all
      .map((tg) => tg.tabs)
      .flat()
      .filter((tab) => {
        if (!(tab.input instanceof vscode.TabInputTextDiff)) return;
        if (tab.input?.original?.scheme !== 'readonly-view') return;
        const ogUri = tab.input.original.toString();
        const readonlyUri = uri.toString();
        return ogUri === readonlyUri;
      });

    if (tabs.length > 1) {
      throw new Error(
        'Expected exactly one tab to have the specific readonly uri!'
      );
    }

    return tabs[0];
  }

  async getOriginalDocTab(): Promise<vscode.Tab | undefined> {
    const uri = this.uri.toString();
    const tabs = vscode.window.tabGroups.all
      .map((tg) => tg.tabs)
      .flat()
      .filter((tab) => {
        if (!(tab.input instanceof vscode.TabInputText)) return;
        const tabUri = tab.input.uri.toString();
        return tabUri === uri;
      });

    return tabs[0];
  }

  async closeDiff() {
    const tab = await this.getDiffTab();
    if (!tab) return;
    if (tab.isDirty) {
      throw new Error('Cannot close dirty tab without showing user prompt');
    }
    await vscode.window.tabGroups.close(tab);
  }

  async declineDiff() {
    await this.closeDiff();
    // Remove this instance from the set
    allFileEditors.delete(this);
  }

  async acceptDiff() {
    await this.createIfNotExists();
    const doc = await this.getDoc();
    if (!doc) {
      throw new Error('Should have document');
    }
    if (this.modifiedContents === undefined) {
      throw new Error('No modified contents yet!');
    }
    await this.setDocContents(this.modifiedContents);
    await doc.save();
    await vscode.window.showTextDocument(vscode.Uri.file(this.absPath), {
      preview: false,
      viewColumn: getBestColForEditor(),
    });
    await this.closeDiff();
    // Remove this instance from the set
    allFileEditors.delete(this);
  }
}

async function unlinkFileAndParents(filePath: string) {
  let currentPath = filePath;
  while (currentPath !== path.dirname(currentPath)) {
    await fs.unlink(currentPath).catch((err) => {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    });
    const parentPath = path.dirname(currentPath);
    const siblings = await fs.readdir(parentPath);
    if (siblings.length > 0) {
      break;
    }
    currentPath = parentPath;
  }
}

export async function removeAllEditors() {
  await Promise.all([...allFileEditors].map(async (e) => e.closeDiff()));
}
