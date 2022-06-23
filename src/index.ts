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
    let projectVersion =
      projectVersions.find((v) => v.name === versionName) ||
      (await jiraClient.projectVersions.createVersion({
        name: versionName,
        project: PROJECT_KEY,
      }));

    if (!projectVersion) {
      setFailed('Project Version not found');
      return;
    }

    await Promise.all(
      ISSUE_KEYS.map(async (issueKey) => {
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

    await jiraClient.projectVersions.updateVersion({
      id: projectVersion.id!,
      project: PROJECT_KEY,
      released: true,
    });
  } catch (error: any) {
    console.table(error);
    setFailed(error?.errorMessages);
  }
})();
