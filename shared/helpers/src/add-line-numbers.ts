export function addLineNumbers(content: string): string {
  return content
    .split('\n')
    .map((line, index) => `${index + 1} ${line}`)
    .join('\n');
}
