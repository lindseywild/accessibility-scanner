import type { Finding } from './types.d.js';
import * as url from 'node:url';
const URL = url.URL;

/**
 * Generates the issue body content for an accessibility finding
 */
export function generateIssueBody(
  finding: Finding,
  repoWithOwner: string,
  runId?: string
): string {
  const solutionLong = finding.solutionLong
    ?.split("\n")
    .map((line) =>
      !line.trim().startsWith("Fix any") &&
      !line.trim().startsWith("Fix all") &&
      line.trim() !== ""
        ? `- ${line}`
        : line
    )
    .join("\n");
  
  // Add screenshot section if screenshot was captured
  let screenshotSection = '';
  if (finding.screenshotId && runId) {
    const artifactUrl = `https://github.com/${repoWithOwner}/actions/runs/${runId}/artifacts`;
    screenshotSection = `\n\n## Screenshot

A screenshot was captured when this issue was detected. You can view it in the workflow artifacts.

[📸 View screenshots in workflow artifacts](${artifactUrl})

> Screenshot ID: \`${finding.screenshotId}\`
`;
  }
  
  const acceptanceCriteria = `## Acceptance Criteria
- [ ] The specific axe violation reported in this issue is no longer reproducible.
- [ ] The fix MUST meet WCAG 2.1 guidelines OR the accessibility standards specified by the repository or organization.
- [ ] A test SHOULD be added to ensure this specific axe violation does not regress.
- [ ] This PR MUST NOT introduce any new accessibility issues or regressions.
`;

  return `## What
An accessibility scan flagged the element \`${finding.html}\` on ${finding.url} because ${finding.problemShort}. Learn more about why this was flagged by visiting ${finding.problemUrl}.
${screenshotSection}
To fix this, ${finding.solutionShort}.
${solutionLong ? `\nSpecifically:\n\n${solutionLong}` : ''}

${acceptanceCriteria}
`;
}
