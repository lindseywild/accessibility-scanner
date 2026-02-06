import type { Octokit } from '@octokit/core';
import type { Issue } from './Issue.js';
import type { Finding } from './types.d.js';
import { generateIssueBody } from './generateIssueBody.js';

export async function reopenIssue(
  octokit: Octokit, 
  issue: Issue, 
  finding: Finding,
  runId?: string
) {
  // Extract repoWithOwner from the issue's owner and repository
  const repoWithOwner = `${issue.owner}/${issue.repository}`;
  const body = generateIssueBody(finding, repoWithOwner, runId);
  
  return octokit.request(`PATCH /repos/${issue.owner}/${issue.repository}/issues/${issue.issueNumber}`, {
    owner: issue.owner,
    repository: issue.repository,
    issue_number: issue.issueNumber,
    state: 'open',
    body // Update body with current screenshot info
  });
}
