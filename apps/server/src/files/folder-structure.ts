import fs from 'fs';
import path from 'path';

type FolderStructure = {
  name: string;
  type: 'folder' | 'file';
  children?: FolderStructure[];
};

export function getFolderStructure(dir: string): FolderStructure {
  const result: FolderStructure = {
    name: path.basename(dir),
    type: 'folder',
    children: [],
  };

  function readDirectory(directory: string, obj: FolderStructure) {
    const files = fs.readdirSync(directory);
    files.forEach((file) => {
      const fullPath = path.join(directory, file);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        const folder: FolderStructure = {
          name: file,
          type: 'folder',
          children: [],
        };
        obj.children.push(folder);
        readDirectory(fullPath, folder);
      } else {
        obj.children.push({
          name: file,
          type: 'file',
        });
      }
    });
  }

  readDirectory(dir, result);
  return result;
}
