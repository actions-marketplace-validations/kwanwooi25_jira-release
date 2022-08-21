import { info } from '@actions/core';
import dayjs from 'dayjs';
import { Version2Client } from 'jira.js';
import { Version } from 'jira.js/out/version2/models';
import { getVariables } from '../utils/inputs';

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
    releaseDate: dayjs().format('YYYY-MM-DD'),
  });
};
