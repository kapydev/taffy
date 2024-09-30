import { EventEmitter } from 'tseep';
import * as vscode from 'vscode';

export const ee = new EventEmitter<{
  mainKeyboardShortcutPressed: () => void;
  fileChangeApproved: (previewId: string) => void;
}>();
