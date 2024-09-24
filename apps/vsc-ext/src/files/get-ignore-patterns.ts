import fs from 'fs';
import path from 'path';
import parse from 'parse-gitignore';

export function getGitIgnoredFiles(dir: string): string[] {
  const gitignorePath = path.join(dir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    return [];
  }

  //TODO: Fix types
  const parsed = parse(fs.readFileSync(gitignorePath, 'utf8')) as any;

  const ignoredGlobs: string[] = parsed.globs().flatMap((val: any) => {
    if (val.type !== 'ignore') return [];
    return val.patterns as string[];
  });

  ignoredGlobs.push('.git/**');

  const additionalGlobs = ignoredGlobs
    .filter((glob) => glob.startsWith('.') && !glob.startsWith('./'))
    .map((glob) => `**/${glob}`);

  ignoredGlobs.push(...additionalGlobs);

  return ignoredGlobs;
}
