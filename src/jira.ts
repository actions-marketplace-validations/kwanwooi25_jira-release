import { getInput } from '@actions/core';
import { Version2Client } from 'jira.js';

export const initJiraClient = () => {
  const host = getInput('jiraHost', { required: true });
  const email = getInput('jiraEmail', { required: true });
  const apiToken = getInput('jiraApiToken', { required: true });

  return new Version2Client({
    host,
    authentication: {
      basic: {
        email,
        apiToken,
      },
    },
  });
};
