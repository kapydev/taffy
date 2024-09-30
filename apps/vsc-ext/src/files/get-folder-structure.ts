import * as vscode from 'vscode';

export const getFolderStructure = async () => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return [];
  }

  const rootFolder = workspaceFolders[0].uri.fsPath;

  return getFiles(rootFolder);
};

const getFiles = async (folderPath: string) => {
  const folderUri = vscode.Uri.file(folderPath);
  const files = await vscode.workspace.fs.readDirectory(folderUri);

  const results = 
    files.map(async ([name, type]) => {
      const filePath = `${folderPath}/${name}`;
      if (type === vscode.FileType.Directory) {
        return {
          name,
          type: 'directory',
          children: await getFiles(filePath),
        };
      } else {
        return { name, type: 'file' };
      }
    })
};
