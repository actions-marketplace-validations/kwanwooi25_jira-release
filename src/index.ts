import { initJiraClient } from './jira';

(async () => {
  const jiraClient = initJiraClient();
  await jiraClient.projectVersions.createVersion({ name: 'v0.0.1', project: 'ACTION' });
})();
