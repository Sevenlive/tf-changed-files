import { parseCommaSeparated, matchesPattern, filterFiles, extractUniqueDirs } from '../src/utils';

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

describe('matchesPattern', () => {
  it('matches an exact string (no wildcards)', () => {
    expect(matchesPattern('node_modules', 'node_modules')).toBe(true);
    expect(matchesPattern('node_modules', 'node_modules_extra')).toBe(false);
  });

  it('* matches any sequence of characters within a segment', () => {
    expect(matchesPattern('*.backup', 'prod.backup')).toBe(true);
    expect(matchesPattern('*.backup', 'backup')).toBe(false);
    expect(matchesPattern('test-*', 'test-unit')).toBe(true);
    expect(matchesPattern('test-*', 'test-integration')).toBe(true);
    expect(matchesPattern('test-*', 'unit')).toBe(false);
  });

  it('? matches exactly one character', () => {
    expect(matchesPattern('v?', 'v1')).toBe(true);
    expect(matchesPattern('v?', 'v12')).toBe(false);
    expect(matchesPattern('v?', 'v')).toBe(false);
  });

  it('* does not cross a / boundary', () => {
    expect(matchesPattern('a*', 'a/b')).toBe(false);
  });

  it('handles patterns with regex special characters', () => {
    expect(matchesPattern('.terraform', '.terraform')).toBe(true);
    expect(matchesPattern('.terraform', 'xterraform')).toBe(false);
  });
});

describe('filterFiles (wildcard ignored_directories)', () => {
  const extensions = ['.tf', '.tfvars'];

  it('ignores directories matching a wildcard pattern', () => {
    const files = ['envs/prod.backup/main.tf', 'modules/vpc/main.tf'];
    expect(filterFiles(files, extensions, ['*.backup'])).toEqual(['modules/vpc/main.tf']);
  });

  it('ignores .terraform hidden directories', () => {
    const files = ['.terraform/providers/main.tf', 'modules/vpc/main.tf'];
    expect(filterFiles(files, extensions, ['.terraform'])).toEqual(['modules/vpc/main.tf']);
  });

  it('ignores directories matched by ? wildcard', () => {
    const files = ['v1/main.tf', 'v2/main.tf', 'v12/main.tf'];
    expect(filterFiles(files, extensions, ['v?'])).toEqual(['v12/main.tf']);
  });

  it('multiple patterns including wildcard all apply', () => {
    const files = [
      'node_modules/pkg/main.tf',
      'envs/staging.backup/main.tf',
      'modules/vpc/main.tf',
    ];
    expect(filterFiles(files, extensions, ['node_modules', '*.backup'])).toEqual([
      'modules/vpc/main.tf',
    ]);
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
