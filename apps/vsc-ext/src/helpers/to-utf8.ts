export function toUtf8(input: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(input);
}
