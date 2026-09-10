import { chromium } from '@playwright/test';
import { strict as assert } from 'node:assert';
import config from '../playwright.config.js';

const url = process.argv[2];
if (!url) throw new Error('Usage: node scripts/check-pages.mjs https://owner.github.io/repo/');
const browser = await chromium.launch(config.use.launchOptions);
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(url);
  assert.equal(response.status(), 200);
  await page.locator('[data-action="start-learn"]').first().waitFor();
  assert.match(await page.title(), /Lernpfad/);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  assert.equal(scope, url);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.clearBrowserCache');
  await cdp.detach();
  await context.setOffline(true);
  await page.reload();
  await page.locator('[data-view="library"]:visible').first().click();
  await page.getByRole('button', { name: 'Anleitung & Prompt' }).click();
  assert.match(await page.locator('[data-authoring-prompt]').inputValue(), /targetLanguage: "fr"/);
  await page.locator('[data-view="home"]:visible').first().click();
  await page.locator('[data-action="start-learn"]').first().click();
  await page.locator('#exercise-title').waitFor();
  await page.screenshot({ path: 'experiment/evidence/pages-offline.png' });
  assert.deepEqual(errors, []);
  console.log(`PASS ${url}: app, project scope, uncached offline reload, authoring and lesson start.`);
} finally {
  await browser.close();
}
