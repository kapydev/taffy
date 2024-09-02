import { GeneratedFolder, GeneratedFile } from '@cto-ai/shared-types';
import path from 'path';
import archy from 'archy';

/**
 * Find a file within the folder structure by a specified key.
 * The fileKey should be a concatenation of folder and file names joined by a separator.
 * @param folder - The root folder to start the search from
 * @param fileKey - The concatenated key of folder and file names
 * @param separator - The separator used in fileKey
 * @returns The file object if found, or undefined if not found
 */
export function findFileByKey(
  folder: GeneratedFolder,
  fileKey: string,
  separator = '/'
): GeneratedFile | undefined {
  // Iterate through each file in the current folder
  for (const file of folder.files) {
    // Create the current file's key by concatenating the folder name and file name
    let currentKey = folder.name + separator + file.name;
    if (file.fileType) {
      currentKey += `.${file.fileType}`;
    }
    if (currentKey === fileKey) {
      return file;
    }
  }

  // Prepare the modified file key that excludes the current folder's name from the front
  const modifiedFileKey = fileKey.startsWith(folder.name + separator)
    ? fileKey.slice((folder.name + separator).length)
    : fileKey;

  // Recursively search in subfolders
  for (const subFolder of folder.subFolders) {
    if (modifiedFileKey.startsWith(subFolder.name + separator)) {
      const result = findFileByKey(subFolder, modifiedFileKey, separator);
      if (result) {
        return result;
      }
    }
  }

  // Return undefined if the file is not found in the current folder and its subfolders
  return undefined;
}
/**
 * Update a file within the folder structure by a specified key.
 * The fileKey should be a concatenation of folder and file names joined by a separator.
 * If the file is defined, replace the file if it exists, or create the folders recursively, then the file, if it doesn't.
 * If the file is undefined, then delete the file if it exists.
 * @param folder - The root folder to start the search from
 * @param fileKey - The concatenated key of folder and file names
 * @param newFile - The new file to replace or create, or undefined to delete the file
 * @param separator - The separator used in fileKey
 * @returns Whether the file was found or created
 */
export function updateFileByKey(
  folder: GeneratedFolder,
  fileKey: string,
  newFile: GeneratedFile | undefined,
  separator = '/'
): boolean {
  // Iterate through each file in the current folder
  for (let i = 0; i < folder.files.length; i++) {
    const file = folder.files[i];
    // Create the current file's key by concatenating the folder name and file name
    let currentKey = folder.name + separator + file.name;
    if (file.fileType) {
      currentKey += `.${file.fileType}`;
    }
    if (currentKey === fileKey) {
      if (newFile) {
        // Replace the file
        folder.files[i] = newFile;
      } else {
        // Delete the file
        folder.files.splice(i, 1);
      }
      return true;
    }
  }

  // Prepare the modified file key that excludes the current folder's name from the front
  const modifiedFileKey = fileKey.startsWith(folder.name + separator)
    ? fileKey.slice((folder.name + separator).length)
    : fileKey;

  // Recursively search in subfolders
  for (const subFolder of folder.subFolders) {
    if (modifiedFileKey.startsWith(subFolder.name + separator)) {
      const result = updateFileByKey(
        subFolder,
        modifiedFileKey,
        newFile,
        separator
      );
      if (result) {
        return result;
      }
    }
  }

  // If the file is not found and newFile is defined, create the file and necessary folders
  if (newFile) {
    const splitKey = modifiedFileKey.split(separator);
    let currentFolder = folder;

    for (let i = 0; i < splitKey.length - 1; i++) {
      const folderName = splitKey[i];
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

    currentFolder.files.push(newFile);
    return true;
  }

  // Return false if the file is not found and newFile is undefined
  return false;
}

export function folderMapToGeneratedFolder(
  name: string,
  structure: Record<string, string[]>
): GeneratedFolder {
  const folder: GeneratedFolder = {
    name,
    files: [],
    subFolders: [],
  };

  for (const [curPath, items] of Object.entries(structure)) {
    const splitPath = curPath.split('/').filter(Boolean);
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
      const resolvedPath = path.posix.join(curPath, item);
      if (structure[resolvedPath]) return;
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

function convertToArchy(node: GeneratedFolder): archy.Data {
  return {
    label: node.name,
    nodes: [
      ...node.files.map((file) => file.name),
      ...node.subFolders.map((subFolder) => convertToArchy(subFolder)),
    ],
  };
}

export function prettyPrintGeneratedFolder(folder: GeneratedFolder): string {
  const archyData = convertToArchy(folder);
  return archy(archyData);
}
