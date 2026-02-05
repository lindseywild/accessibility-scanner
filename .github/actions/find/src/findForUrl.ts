import type { Finding } from './types.d.js';
import { AxeBuilder } from '@axe-core/playwright'
import playwright from 'playwright';
import { AuthContext } from './AuthContext.js';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Use GITHUB_WORKSPACE to ensure screenshots are saved in the workflow workspace root
// where the artifact upload step can find them
const SCREENSHOT_DIR = path.join(process.env.GITHUB_WORKSPACE || process.cwd(), '.screenshots');

export async function findForUrl(url: string, authContext?: AuthContext): Promise<Finding[]> {
  const browser = await playwright.chromium.launch({ headless: true, executablePath: process.env.CI ? '/usr/bin/google-chrome' : undefined });
  const contextOptions = authContext?.toPlaywrightBrowserContextOptions() ?? {};
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  await page.goto(url);
  console.log(`Scanning ${page.url()}`);

  // Ensure screenshot directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    console.log(`Created screenshot directory: ${SCREENSHOT_DIR}`);
  } else {
    console.log(`Screenshot directory already exists: ${SCREENSHOT_DIR}`);
  }

  let findings: Finding[] = [];
  try {
    const rawFindings = await new AxeBuilder({ page }).analyze();
    
    // Process violations and capture screenshots
    const findingsWithScreenshots = await Promise.all(
      rawFindings.violations.map(async (violation: any) => {
        let screenshotId: string | undefined;
        
        try {
          const screenshotBuffer = await page.screenshot({ 
            fullPage: false,
            type: 'png'
          });
          
          screenshotId = crypto.randomUUID();
          const filename = `${screenshotId}.png`;
          const filepath = path.join(SCREENSHOT_DIR, filename);
          
          fs.writeFileSync(filepath, screenshotBuffer);
          console.log(`Screenshot saved: ${filename}`);
        } catch (error) {
          console.error('Failed to capture/save screenshot:', error);
          screenshotId = undefined;
        }

        return {
          scannerType: 'axe',
          url,
          html: violation.nodes[0].html.replace(/'/g, "&apos;"),
          problemShort: violation.help.toLowerCase().replace(/'/g, "&apos;"),
          problemUrl: violation.helpUrl.replace(/'/g, "&apos;"),
          ruleId: violation.id,
          solutionShort: violation.description.toLowerCase().replace(/'/g, "&apos;"),
          solutionLong: violation.nodes[0].failureSummary?.replace(/'/g, "&apos;"),
          screenshotId
        };
      })
    );
    
    findings = findingsWithScreenshots;
  } catch (e) {
    // do something with the error
  }
  await context.close();
  await browser.close();
  return findings;
}
