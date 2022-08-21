import { info } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { Version2Client } from 'jira.js';
import { getVariables } from '../utils/inputs';

const ISSUE_NUMBER_REGEX = /[A-Z]{2,}-\d+/;

export const getIssueKeys = async () => {
  const { githubToken } = getVariables();
  const octokit = getOctokit(githubToken);
  const payload = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: Number(context.payload.pull_request?.number),
  };

  let shouldFetchMore = true;
  let issueKeys: string[] = [];

  info('Extracting issueKeys from commits...');

  while (shouldFetchMore) {
    const res = await octokit.rest.pulls.listCommits({ ...payload, per_page: 100 });
    const filtered = res.data
      .map(({ commit }) => ISSUE_NUMBER_REGEX.exec(commit.message)?.[0])
      .filter(Boolean) as string[];
    issueKeys = [...issueKeys, ...filtered];
    if (res.data?.length !== 100) {
      shouldFetchMore = false;
    }
  }

  const uniqueIssueKeys = [...new Set(issueKeys)];

  info(`Found ${uniqueIssueKeys.length} issueKeys`);

  return uniqueIssueKeys;
};

export const updateIssues = async (jiraClient: Version2Client, issueKeys: string[] = []) => {
  const { versionName, doneStatusName } = getVariables();

  if (!issueKeys.length) {
    info('No issues to update');
    return;
  }

  info('Updating related issues...');

  await Promise.all(
    issueKeys.map(async (issueKey) => {
      info(`Updating ${issueKey}...`);

      const transitions = await jiraClient.issues.getTransitions({ issueIdOrKey: issueKey });
      const doneTransition = transitions.transitions?.find((t) => t.name?.includes(doneStatusName));
      if (!doneTransition) {
        return;
      }
      return await Promise.all([
        await jiraClient.issues.doTransition({
          issueIdOrKey: issueKey,
          transition: { id: doneTransition.id },
        }),
        await jiraClient.issues.editIssue({
          issueIdOrKey: issueKey,
          fields: { fixVersions: [{ name: versionName }] },
        }),
      ]);
    }),
  );

  info(`${issueKeys.length} issues updated`);
};
