import { ee } from '../event-emitter';
import { getBestColForWebView } from '../helpers/get-best-col';
import { getCurWebView } from '../main';
import { FileEditor } from './file-editor';

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
  const fileChangeRemoved = new Promise<void>((res) => {
    ee.on('fileChangeRemoved', (removedId) => {
      if (removedId !== previewId) return;
      res();
    });
  });
  const editor = new FileEditor(filePath);
  await editor.showDiffView(newContents);
  //Refocus taffy
  getCurWebView()?.reveal(getBestColForWebView());

  fileChangeRemoved.then(async () => {
    editor.declineDiff();
  });
  await fileChangeApproved;
  editor.acceptDiff();
}
