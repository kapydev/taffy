import path from 'path';
import { getBestColForEditor } from '../helpers/get-best-col';
import { toUtf8 } from '../helpers/to-utf8';
import { getFullPath } from './file-watcher';
import fs from 'fs/promises';
import { v4 } from 'uuid';
import * as vscode from 'vscode';

export class FileEditor {
  //Only have one readonlyuri per class
  private _readonlyUri: vscode.Uri | undefined;
  private _doc: vscode.TextDocument | undefined;
  private contentsBeforeDiff: string | undefined;

  constructor(public filePath: string) {}

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

  async getReadonlyUri(): Promise<vscode.Uri> {
    if (this._readonlyUri) return this._readonlyUri;
    const contents = await this.getContents();
    const encodedContents = Buffer.from(contents || '').toString('base64');
    const uri = vscode.Uri.parse(`readonly-view:${this.fileName}-${v4()}`).with(
      {
        query: encodedContents,
      }
    );
    return uri;
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
    const readonlyUri = await this.getReadonlyUri();
    this.contentsBeforeDiff = (
      await vscode.workspace.openTextDocument(readonlyUri)
    ).getText();
    await this.createIfNotExists();
    const doc = await this.getDoc();
    if (!doc) {
      throw new Error('Doc creation unsuccessful!');
    }
    const openOpts: vscode.TextDocumentShowOptions = {
      viewColumn: getBestColForEditor(),
    };
    await vscode.commands.executeCommand(
      'vscode.diff',
      readonlyUri,
      doc.uri,
      `${this.fileName}: Suggested Changes`,
      openOpts
    );
    await this.setDocContents(newContents);
    //Find the corresponding tab and store it
  }

  async getTab() {
    const uri = await this.getReadonlyUri();
    const tabs = vscode.window.tabGroups.all
      .map((tg) => tg.tabs)
      .flat()
      .filter(
        (tab) =>
          tab.input instanceof vscode.TabInputTextDiff &&
          tab.input?.original?.scheme === 'readonly-view' &&
          tab.input.original.toString() === uri.toString()
      );

    if (tabs.length > 1) {
      throw new Error(
        'Expected exactly one tab to have the specific readonly uri!'
      );
    }

    return tabs[0];
  }

  async closeDiff() {
    const tab = await this.getTab();
    if (!tab) return;
    try {
      await vscode.window.tabGroups.close(tab);
    } catch (e) {
      const tabs = vscode.window.tabGroups.all;
      console.log({ e, tabs });
      debugger;
    }
  }

  async declineDiff() {
    const doc = await this.getDoc();
    if (!doc) return;
    //Save first so the editor is not dirty and we can close it
    await doc.save();
    await this.closeDiff();
    if (this.contentsBeforeDiff === undefined) {
      //Remove file and recursively remove empty parent directories
      await unlinkFileAndParents(this.absPath);
    } else {
      //Return file to original state
      await this.setDocContents(this.contentsBeforeDiff);
    }
    //TODO: Edge case where user ignores taffy, makes changes to the file, then declines taffy much later is not accounted for - it will revert to state before talking to taffy
  }

  async acceptDiff() {
    const doc = await this.getDoc();
    if (!doc) return;
    await doc.save();
    await vscode.window.showTextDocument(vscode.Uri.file(this.absPath), {
      preview: false,
      viewColumn: getBestColForEditor(),
    });
    await this.closeDiff();
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
