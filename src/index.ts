import { setFailed } from '@actions/core';
import { getProjectVersion, initJiraClient, releaseProjectVersion, updateIssues } from './jira';

(async () => {
  try {
    const jiraClient = initJiraClient();
    const projectVersion = await getProjectVersion(jiraClient);

    if (!projectVersion) {
      setFailed('Project Version not found');
      return;
    }

    await updateIssues(jiraClient);
    await releaseProjectVersion(jiraClient, projectVersion);
  } catch (error: any) {
    console.table(error);
    setFailed(error?.errorMessages);
  }
})();
