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

/**
 * Returns true when `file` lives inside a directory matching `pattern`.
 * `pattern` may contain multiple path segments separated by `/` (e.g.
 * `.github/workflows`), and each segment may contain `*`/`?` wildcards.
 * Matching is checked against every consecutive sub-path of the file's
 * directory components, so `a/b/.github/workflows/ci.tf` is correctly
 * excluded by the pattern `.github/workflows`.
 */
export function isInIgnoredDirectory(file: string, ignoredDirs: string[]): boolean {
  const parts = file.split('/');
  // Only the directory portions (everything except the filename) participate.
  const dirParts = parts.slice(0, -1);

  return ignoredDirs.some((pattern) => {
    const normalizedPattern = pattern.replace(/\/+$/, '');
    if (!normalizedPattern) {
      return false;
    }

    const patternParts = normalizedPattern.split('/');
    const windowSize = patternParts.length;
    for (let i = 0; i <= dirParts.length - windowSize; i++) {
      const window = dirParts.slice(i, i + windowSize);
      if (window.every((seg, j) => matchesPattern(patternParts[j], seg))) {
        return true;
      }
    }
    return false;
  });
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
    return !isInIgnoredDirectory(file, ignoredDirs);
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
