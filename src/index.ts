import { setFailed } from '@actions/core';
import { initJiraClient } from './jira';

const PROJECT_KEY = 'ACTION';
const VERSION_PREFIX = 'v';
const ISSUE_KEYS = ['ACTION-1', 'ACTION-2'];
const VERSION = '0.0.1';

(async () => {
  try {
    const versionName = `${VERSION_PREFIX}${VERSION}`;
    const jiraClient = initJiraClient();
    const projectVersions = await jiraClient.projectVersions.getProjectVersions({
      projectIdOrKey: PROJECT_KEY,
    });
    const existingVersion = projectVersions.find((v) => v.name === versionName);
    if (!existingVersion) {
      await jiraClient.projectVersions.createVersion({ name: versionName, project: PROJECT_KEY });
    }

    await jiraClient.issues.editIssue({
      issueIdOrKey: ISSUE_KEYS[0],
      fields: {
        fixVersions: [{ name: versionName }],
      },
    });
    // await Promise.all(
    //   ISSUE_KEYS.map(
    //     async (issueKey) =>
    //   ),
    // );
  } catch (error: any) {
    console.table(error);
    setFailed(error?.errorMessages);
  }
})();
