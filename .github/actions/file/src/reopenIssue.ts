import type { Octokit } from '@octokit/core';
import type { Issue } from './Issue.js';
import type { Finding } from './types.d.js';
import { generateIssueBody } from './generateIssueBody.js';

export async function reopenIssue(octokit: Octokit, issue: Issue, finding?: Finding) {
  const params: any = {
    owner: issue.owner,
    repo: issue.repository,
    issue_number: issue.issueNumber,
    state: 'open'
  };
  
  // If finding is provided, update the body with the new screenshot
  if (finding) {
    params.body = generateIssueBody(finding, issue.owner, issue.repository);
  }
  
  return octokit.request(`PATCH /repos/${issue.owner}/${issue.repository}/issues/${issue.issueNumber}`, params);
}
