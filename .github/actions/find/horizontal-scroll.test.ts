import { test, expect } from '@playwright/test';

test.describe('Horizontal scroll test at 320x256', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to 320px x 256px
    await page.setViewportSize({ width: 320, height: 256 });
  });

  test('no horizontal scrolling required on home page', async ({ page }) => {
    await page.goto('http://127.0.0.1:4000/');

    // Check document doesn't require horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
  });

  test('no horizontal scrolling required on about page', async ({ page }) => {
    await page.goto('http://127.0.0.1:4000/about/');

    // Check document doesn't require horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
  });

  test('no horizontal scrolling required on 404 page', async ({ page }) => {
    await page.goto('http://127.0.0.1:4000/404.html');

    // Check document doesn't require horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
  });

  test('no horizontal scrolling required on blog post page', async ({ page }) => {
    await page.goto('http://127.0.0.1:4000/jekyll/update/2025/07/30/welcome-to-jekyll.html');

    // Check document doesn't require horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
  });
});
