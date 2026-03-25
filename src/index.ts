import * as core from '@actions/core';
import * as github from '@actions/github';
import { parseCommaSeparated, filterFiles, extractUniqueDirs } from './utils';

export { parseCommaSeparated, filterFiles, extractUniqueDirs };

async function run(): Promise<void> {
  try {
    const token = core.getInput('github_token', { required: true });
    const fileExtensionsInput = core.getInput('file_extensions');
    const ignoredDirsInput = core.getInput('ignored_directories');

    const extensions = parseCommaSeparated(fileExtensionsInput);
    const ignoredDirs = parseCommaSeparated(ignoredDirsInput);

    const octokit = github.getOctokit(token);
    const context = github.context;

    if (!context.payload.pull_request) {
      core.setFailed('This action must be run in the context of a pull request.');
      return;
    }

    const pullNumber = context.payload.pull_request.number;
    const { owner, repo } = context.repo;

    const allFiles: string[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
        per_page: perPage,
        page,
      });

      const fileNames = response.data.map((f) => f.filename);
      allFiles.push(...fileNames);

      if (response.data.length < perPage) {
        break;
      }
      page++;
    }

    const filtered = filterFiles(allFiles, extensions, ignoredDirs);
    const changedDirs = extractUniqueDirs(filtered);

    core.setOutput('changed_dirs', JSON.stringify(changedDirs));
    core.info(`Changed directories: ${JSON.stringify(changedDirs)}`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred.');
    }
  }
}

run();
