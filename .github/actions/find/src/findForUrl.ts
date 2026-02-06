import type { Finding } from './types.d.js';
import AxeBuilder from '@axe-core/playwright'
import playwright from 'playwright';
import { AuthContext } from './AuthContext.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';

export async function findForUrl(url: string, authContext?: AuthContext): Promise<Finding[]> {
  const browser = await playwright.chromium.launch({ headless: true, executablePath: process.env.CI ? '/usr/bin/google-chrome' : undefined });
  const contextOptions = authContext?.toPlaywrightBrowserContextOptions() ?? {};
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  await page.goto(url);
  console.log(`Scanning ${page.url()}`);

  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(process.env.GITHUB_WORKSPACE || process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  let findings: Finding[] = [];
  try {
    const rawFindings = await new AxeBuilder({ page }).analyze();
    
    for (const violation of rawFindings.violations) {
      // Capture screenshot for each violation
      let screenshotPath: string | undefined;
      try {
        const screenshotFilename = `${randomUUID()}.png`;
        screenshotPath = path.join('screenshots', screenshotFilename);
        const fullPath = path.join(screenshotsDir, screenshotFilename);
        await page.screenshot({ path: fullPath, fullPage: true });
        console.log(`Screenshot captured: ${screenshotPath}`);
      } catch (screenshotError) {
        console.error(`Failed to capture screenshot for violation ${violation.id}:`, screenshotError);
        screenshotPath = undefined;
      }

      findings.push({
        scannerType: 'axe',
        url,
        html: violation.nodes[0].html.replace(/'/g, "&apos;"),
        problemShort: violation.help.toLowerCase().replace(/'/g, "&apos;"),
        problemUrl: violation.helpUrl.replace(/'/g, "&apos;"),
        ruleId: violation.id,
        solutionShort: violation.description.toLowerCase().replace(/'/g, "&apos;"),
        solutionLong: violation.nodes[0].failureSummary?.replace(/'/g, "&apos;"),
        screenshotPath
      });
    }
  } catch (e) {
    console.error('Error during scanning:', e);
  }
  await context.close();
  await browser.close();
  return findings;
}
