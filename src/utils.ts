import { getInput } from '@actions/core';

export const getVariables = () => {
  const host = getInput('jiraHost', { required: true });
  const email = getInput('jiraEmail', { required: true });
  const apiToken = getInput('jiraApiToken', { required: true });
  const projectKey = getInput('jiraProjectKey', { required: true });
  const versionPrefix = getInput('jiraVersionPrefix', { required: true });
  const version = getInput('jiraReleaseVersion', { required: true });
  const versionName = `${versionPrefix}${version}`;
  const jiraIssueKeys = getInput('jiraIssueKeys', { required: true });
  const issueKeys = jiraIssueKeys?.split(',') ?? [];

  return {
    host,
    email,
    apiToken,
    projectKey,
    versionName,
    issueKeys,
  };
};
