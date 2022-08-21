import { info } from '@actions/core';
import { Version2Client } from 'jira.js';
import { getVariables } from '../utils/inputs';

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
