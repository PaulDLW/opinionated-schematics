export function toPosixFileSeparator(path: string) {
  return path.replace(/\\/g, "/");
}
