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
  // The root is the parent-facing landing page: static, no bundle, and the URL that
  // gets shared, so its share metadata is checked here rather than assumed.
  const landing = await page.goto(url);
  assert.equal(landing.status(), 200);
  assert.match(await page.title(), /Lernpfad/);
  await page.locator('a[href="./lernen.html"]').first().waitFor();
  // og:image is pinned to the production host on purpose, so it is checked for
  // absoluteness rather than against whatever host this run targets.
  const shareImage = await page.locator('meta[property="og:image"]').getAttribute('content');
  assert.match(shareImage, /^https:\/\/.+\/lernpfad-share\.png$/,
    'og:image must be an absolute URL: crawlers do not resolve relative paths');
  assert.equal((await page.request.get(new URL('lernpfad-share.png', url).href)).status(), 200);
  for (const path of ['impressum.html', 'datenschutz.html']) {
    assert.equal((await page.request.get(new URL(path, url).href)).status(), 200);
  }

  // The application itself, and the only page that registers the service worker.
  const response = await page.goto(new URL('lernen.html', url).href);
  assert.equal(response.status(), 200);
  await page.locator('[data-action="start-learn"]').first().waitFor();
  assert.match(await page.title(), /Lernpfad/);
  await page.evaluate(() => Promise.race([
    navigator.serviceWorker.ready,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker was not ready within 20 seconds')), 20000)),
  ]));
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
  console.log(`PASS ${url}: landing page, share image, legal pages, app at lernen.html, project scope, uncached offline reload, authoring and lesson start.`);
} finally {
  await browser.close();
}
