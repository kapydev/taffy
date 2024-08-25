import fs from 'fs';
import path from 'path';

export function getGitIgnoredFiles(dir: string): string[] {
  const gitignorePath = path.join(dir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    return [];
  }

  const content = fs.readFileSync(gitignorePath, 'utf8');
  return content
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.startsWith('#'));
}

