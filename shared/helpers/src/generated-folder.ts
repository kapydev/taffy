import { GeneratedFolder, GeneratedFile } from '@cto-ai/shared-types';

export function folderMapToGeneratedFolder(
  name: string,
  structure: Record<string, string[]>
): GeneratedFolder {
  const folder: GeneratedFolder = {
    name,
    files: [],
    subFolders: [],
  };

  for (const [path, items] of Object.entries(structure)) {
    const splitPath = path.split('/').filter(Boolean);
    let currentFolder = folder;

    for (let i = 0; i < splitPath.length; i++) {
      const folderName = splitPath[i];
      let existingFolder = currentFolder.subFolders.find(
        (subFolder) => subFolder.name === folderName
      );

      if (!existingFolder) {
        existingFolder = {
          name: folderName,
          files: [],
          subFolders: [],
        };
        currentFolder.subFolders.push(existingFolder);
      }

      currentFolder = existingFolder;
    }

    items.forEach((item) => {
      const fileType = item.includes('.') ? item.split('.').pop() : undefined;
      const file: GeneratedFile = {
        name: item,
        fileType,
        contentEncoding: 'utf8', // Assuming default encoding as 'utf8'
      };

      currentFolder.files.push(file);
    });
  }

  return folder;
}
