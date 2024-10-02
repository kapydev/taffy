import path from 'path';

export function toPosix(filePath: string): string {
    return filePath.split(path.sep).join(path.posix.sep);
}