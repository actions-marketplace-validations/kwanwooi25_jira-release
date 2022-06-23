import { initJiraClient } from './jira';

(async () => {
  const jiraClient = initJiraClient();
  const issue = await jiraClient.issues.getIssue({ issueIdOrKey: 'ACTION-1' });
  console.log(issue);
})();
