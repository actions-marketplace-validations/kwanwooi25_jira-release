import { getInput, info } from '@actions/core';
import { Version2Client } from 'jira.js';
import { Version } from 'jira.js/out/version2/models';
import { getVariables } from './utils';

export const initJiraClient = () => {
  const { host, email, apiToken } = getVariables();

  info('Initializing Jira client...');

  return new Version2Client({
    newErrorHandling: true,
    host,
    authentication: {
      basic: {
        email,
        apiToken,
      },
    },
  });
};

export const getProjectVersion = async (jiraClient: Version2Client) => {
  const { projectKey, versionName } = getVariables();

  info(`Looking for project version ${versionName}...`);

  const projectVersions = await jiraClient.projectVersions.getProjectVersions({
    projectIdOrKey: projectKey,
  });
  const projectVersion = projectVersions.find((v) => v.name === versionName);

  if (projectVersion) {
    return projectVersion;
  }

  info(`Version ${versionName} not found, creating new one...`);

  return await jiraClient.projectVersions.createVersion({
    name: versionName,
    project: projectKey,
  });
};

export const updateIssues = async (jiraClient: Version2Client) => {
  const { issueKeys, versionName } = getVariables();

  info('Updating related issues...');

  await Promise.all(
    issueKeys.map(async (issueKey) => {
      info(`Updating ${issueKey}...`);

      const transitions = await jiraClient.issues.getTransitions({ issueIdOrKey: issueKey });
      const doneTransition = transitions.transitions?.find((t) => t.name === 'Done');
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

export const releaseProjectVersion = async (
  jiraClient: Version2Client,
  projectVersion: Version,
) => {
  const { projectKey, shouldRelease } = getVariables();

  if (!shouldRelease) {
    return;
  }

  info(`Releasing project version ${projectVersion.name}(${projectVersion.id})...`);

  await jiraClient.projectVersions.updateVersion({
    id: projectVersion.id!,
    project: projectKey,
    released: true,
  });
};
