import type { Finding } from './types.d.js';
import AxeBuilder from '@axe-core/playwright'
import playwright from 'playwright';
import { AuthContext } from './AuthContext.js';

export async function findForUrl(url: string, authContext?: AuthContext): Promise<Finding[]> {
  const browser = await playwright.chromium.launch({ headless: true, executablePath: process.env.CI ? '/usr/bin/google-chrome' : undefined });
  const contextOptions = authContext?.toPlaywrightBrowserContextOptions() ?? {};
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  await page.goto(url);
  console.log(`Scanning ${page.url()}`);

  let findings: Finding[] = [];
  try {
    const rawFindings = await new AxeBuilder({ page }).analyze();
    findings = rawFindings.violations.map(violation => ({
      scannerType: 'axe',
      url,
      html: violation.nodes[0].html.replace(/'/g, "&apos;"),
      problemShort: violation.help.toLowerCase().replace(/'/g, "&apos;"),
      problemUrl: violation.helpUrl.replace(/'/g, "&apos;"),
      ruleId: violation.id,
      solutionShort: violation.description.toLowerCase().replace(/'/g, "&apos;"),
      solutionLong: violation.nodes[0].failureSummary?.replace(/'/g, "&apos;")
    }));
  } catch (e) {
    // do something with the error
  }

  try {
    console.log('testing!')
    // await page.waitForLoadState('domcontentloaded');
    await page.setViewportSize({ width: 320, height: 256 });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    console.log('widths of page', scrollWidth, clientWidth)
    
    if (scrollWidth > clientWidth) {
      console.log('this page is too wide')
      // findings.push({
      //   scannerType: 'viewport',
      //   ruleId: 'horizontal-scroll-320x256',
      //   url,
      //   html: 'n/a',
      //   problemShort: 'page requires horizontal scrolling at 320x256 viewport',
      //   problemUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/reflow.html',
      //   solutionShort: 'ensure content is responsive and does not require horizontal scrolling at small viewport sizes',
      //   solutionLong: `The page has a scroll width of ${scrollWidth}px but a client width of only ${clientWidth}px at 320x256 viewport, requiring horizontal scrolling. This violates WCAG 2.1 Level AA Success Criterion 1.4.10 (Reflow).`
      // });
    }
  } catch (e) {
    console.error('Error checking horizontal scroll:', e);
  }
  await context.close();
  await browser.close();
  return findings;
}
