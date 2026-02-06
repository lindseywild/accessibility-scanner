import type { Finding } from './types.d.js';

/**
 * Generates the body text for a GitHub issue based on a finding
 * @param finding The accessibility finding
 * @param repoOwner The repository owner
 * @param repoName The repository name
 * @returns The formatted issue body
 */
export function generateIssueBody(finding: Finding, repoOwner: string, repoName: string): string {
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
  
  // Generate screenshot URL if available
  let screenshotSection = '';
  if (finding.screenshotPath) {
    const screenshotUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/gh-cache/${finding.screenshotPath}`;
    screenshotSection = `\n## Screenshot\n\n![Screenshot of accessibility violation](${screenshotUrl})\n`;
  }
  
  const acceptanceCriteria = `## Acceptance Criteria
- [ ] The specific axe violation reported in this issue is no longer reproducible.
- [ ] The fix MUST meet WCAG 2.1 guidelines OR the accessibility standards specified by the repository or organization.
- [ ] A test SHOULD be added to ensure this specific axe violation does not regress.
- [ ] This PR MUST NOT introduce any new accessibility issues or regressions.
`;

  return `## What
An accessibility scan flagged the element \`${finding.html}\` on ${finding.url} because ${finding.problemShort}. Learn more about why this was flagged by visiting ${finding.problemUrl}.

To fix this, ${finding.solutionShort}.
${solutionLong ? `\nSpecifically:\n\n${solutionLong}` : ''}
${screenshotSection}
${acceptanceCriteria}
`;
}
