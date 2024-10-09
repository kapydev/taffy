import { ee } from '../event-emitter';
import { getBestColForWebView } from '../helpers/get-best-col';
import { getCurWebView } from '../main';
import { FileEditor } from './file-editor';

export async function previewFileChange(
  filePath: string,
  newContents: string,
  previewId: string
) {
  const listeners: ((...args: any[]) => any)[] = [];
  const fileChangeApproved = new Promise<void>((res) => {
    const listener = (approvedId: string) => {
      if (approvedId !== previewId) return;
      editor.acceptDiff();
      res();
    };
    ee.on('fileChangeApproved', listener);
    listeners.push(listener);
  });
  const fileChangeRemoved = new Promise<void>((res) => {
    const listener = (removedId: string) => {
      if (removedId !== previewId) return;
      editor.declineDiff();
      res();
    };
    ee.on('fileChangeRemoved', listener);
    listeners.push(listener);
  });
  const editor = new FileEditor(filePath);
  await editor.showDiffView(newContents);
  //Refocus taffy
  getCurWebView()?.reveal(getBestColForWebView());

  await Promise.race([fileChangeApproved, fileChangeRemoved]);
  listeners.forEach((listener) => {
    ee.off('fileChangeApproved', listener);
    ee.off('fileChangeRemoved', listener);
  });
}
