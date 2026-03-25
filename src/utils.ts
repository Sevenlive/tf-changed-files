export function parseCommaSeparated(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function filterFiles(
  files: string[],
  extensions: string[],
  ignoredDirs: string[]
): string[] {
  return files.filter((file) => {
    const hasMatchingExtension = extensions.some((ext) => file.endsWith(ext));
    if (!hasMatchingExtension) {
      return false;
    }

    const parts = file.split('/');
    const isInIgnoredDir = ignoredDirs.some((dir) => parts.includes(dir));
    return !isInIgnoredDir;
  });
}

export function extractUniqueDirs(files: string[]): string[] {
  const dirs = files.map((file) => {
    const lastSlash = file.lastIndexOf('/');
    if (lastSlash === -1) {
      return '.';
    }
    return file.substring(0, lastSlash);
  });

  const unique = [...new Set(dirs)];
  return unique.map((dir) => dir.replace(/\/+$/, ''));
}
