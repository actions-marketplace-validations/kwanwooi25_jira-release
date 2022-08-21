import { setFailed } from '@actions/core';
import { initJiraClient } from './jira/init';
import { getIssueKeys, updateIssues } from './jira/issues';
import { getProjectVersion, releaseProjectVersion } from './jira/projectVersion';

(async () => {
  try {
    const jiraClient = initJiraClient();
    const projectVersion = await getProjectVersion(jiraClient);

    if (!projectVersion) {
      setFailed('Project Version not found');
      return;
    }

    const issueKeys = await getIssueKeys();
    await updateIssues(jiraClient, issueKeys);
    await releaseProjectVersion(jiraClient, projectVersion);
  } catch (error: any) {
    console.table(error);
    setFailed(error?.errorMessages);
  }
})();
