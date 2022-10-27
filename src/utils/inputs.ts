import { getInput } from '@actions/core';

export const getVariables = () => {
  const githubToken = getInput('githubToken', { required: true });
  const host = getInput('jiraHost', { required: true });
  const email = getInput('jiraEmail', { required: true });
  const apiToken = getInput('jiraApiToken', { required: true });
  const projectKey = getInput('jiraProjectKey', { required: true });
  const versionPrefix = getInput('jiraVersionPrefix', { required: true });
  const version = getInput('jiraReleaseVersion', { required: true });
  const versionName = `${versionPrefix}${version}`;
  const shouldRelease = getInput('shouldRelease') === 'true';
  const doneStatusName = getInput('jiraIssueDoneStatusName');
  const slackWebhookUrl = getInput('slackWebhookUrl');
  const projectName = getInput('projectName');

  return {
    githubToken,
    host,
    email,
    apiToken,
    projectKey,
    versionName,
    shouldRelease,
    doneStatusName,
    slackWebhookUrl,
    projectName,
  };
};
