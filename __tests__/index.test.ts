import { parseCommaSeparated, filterFiles, extractUniqueDirs } from '../src/utils';

describe('parseCommaSeparated', () => {
  it('parses a comma-separated string into an array', () => {
    expect(parseCommaSeparated('.ts,.js,.json')).toEqual(['.ts', '.js', '.json']);
  });

  it('trims whitespace from each entry', () => {
    expect(parseCommaSeparated(' .ts , .js , .json ')).toEqual(['.ts', '.js', '.json']);
  });

  it('filters out empty entries', () => {
    expect(parseCommaSeparated('.ts,,.js')).toEqual(['.ts', '.js']);
  });

  it('returns an empty array for an empty string', () => {
    expect(parseCommaSeparated('')).toEqual([]);
  });
});

describe('filterFiles', () => {
  const extensions = ['.ts', '.js', '.json'];
  const ignoredDirs = ['node_modules', 'docs', 'tests'];

  it('includes files with matching extensions', () => {
    const files = ['src/app.ts', 'src/utils.js', 'config.json'];
    expect(filterFiles(files, extensions, ignoredDirs)).toEqual(files);
  });

  it('excludes files with non-matching extensions', () => {
    const files = ['src/app.ts', 'README.md', 'script.sh'];
    expect(filterFiles(files, extensions, ignoredDirs)).toEqual(['src/app.ts']);
  });

  it('excludes files in ignored directories', () => {
    const files = ['node_modules/lodash/index.js', 'src/app.ts', 'docs/guide.ts'];
    expect(filterFiles(files, extensions, ignoredDirs)).toEqual(['src/app.ts']);
  });

  it('excludes files in nested ignored directories', () => {
    const files = ['src/tests/unit.test.ts', 'src/app.ts'];
    expect(filterFiles(files, extensions, ignoredDirs)).toEqual(['src/app.ts']);
  });

  it('returns empty array when no files match', () => {
    const files = ['node_modules/pkg/index.js', 'README.md'];
    expect(filterFiles(files, extensions, ignoredDirs)).toEqual([]);
  });
});

describe('extractUniqueDirs', () => {
  it('extracts directory paths from file paths', () => {
    const files = ['src/app.ts', 'src/utils.ts', 'lib/helper.js'];
    expect(extractUniqueDirs(files)).toEqual(['src', 'lib']);
  });

  it('deduplicates directory paths', () => {
    const files = ['src/app.ts', 'src/utils.ts'];
    expect(extractUniqueDirs(files)).toEqual(['src']);
  });

  it('returns "." for files in the root directory', () => {
    const files = ['config.json'];
    expect(extractUniqueDirs(files)).toEqual(['.']);
  });

  it('does not include trailing slashes', () => {
    const files = ['src/app.ts'];
    const result = extractUniqueDirs(files);
    result.forEach((dir) => {
      expect(dir.endsWith('/')).toBe(false);
    });
  });

  it('handles deeply nested paths', () => {
    const files = ['a/b/c/file.ts', 'a/b/c/other.ts', 'a/b/file.js'];
    expect(extractUniqueDirs(files)).toEqual(['a/b/c', 'a/b']);
  });

  it('returns empty array for empty input', () => {
    expect(extractUniqueDirs([])).toEqual([]);
  });
});
