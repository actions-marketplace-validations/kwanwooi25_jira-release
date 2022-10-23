import { info } from '@actions/core';
import { Version2Client } from 'jira.js';
import { Issue } from 'jira.js/out/version2/models';
import { getVariables } from '../utils/inputs';

export const createReleaseNote = async (jiraClient: Version2Client, issueKeys: string[] = []) => {
  if (!issueKeys.length) {
    info('No issues to create release note');
    return 'No related Jira issues';
  }

  info('Creating release note...');

  const issuesByIssueType: Record<string, Issue[]> = {};
  await Promise.all(
    issueKeys.map(async (issueKey) => {
      const issue = await jiraClient.issues.getIssue({ issueIdOrKey: issueKey });
      const issueType = issue.fields?.issuetype?.name ?? 'ETC';
      if (!issuesByIssueType[issueType]) {
        issuesByIssueType[issueType] = [];
      }
      issuesByIssueType[issueType].push(issue);
    }),
  );

  return Object.keys(issuesByIssueType)
    .map(
      (issueType) => `
*${issueType}*

${issuesByIssueType[issueType].map((issue) => `- ${issue.fields?.summary}`).join('\n')}
`,
    )
    .join('\n\n');
};

export const notifyReleaseNote = async (releaseNote: string) => {
  const { slackWebhookUrl } = getVariables();
  if (!slackWebhookUrl) {
    return;
  }

  info('Notifying release note on Slack...');

  try {
    await fetch(slackWebhookUrl, {
      method: 'POST',
      body: JSON.stringify({ releaseNote }),
      headers: { 'Content-Type': 'application/json' },
    });
    info('Release note notified on Slack');
  } catch (error) {
    info('Failed to notify release note on Slack');
  }
};
