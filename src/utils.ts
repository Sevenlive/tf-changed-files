export function parseCommaSeparated(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Returns true when `str` matches `pattern`, where `*` matches any sequence
 * of characters and `?` matches any single character (neither crosses a `/`).
 */
export function matchesPattern(pattern: string, str: string): boolean {
  const regexSource = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]');
  return new RegExp(`^${regexSource}$`).test(str);
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
    const isInIgnoredDir = ignoredDirs.some((pattern) =>
      parts.some((segment) => matchesPattern(pattern, segment))
    );
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
