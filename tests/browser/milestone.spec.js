import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import fixture from '../../fixtures/unit-1a/curriculum.json' with { type: 'json' };
import { readWorkspace as getWorkspace } from './profile-db.js';
async function start(page) {
  await page.goto('/lernen.html');
  await expect(page.locator('[data-action="start-learn"]').first()).toBeEnabled();
  await page.locator('[data-action="start-learn"]').first().click();
  await expect(page.locator('#exercise-title')).toBeVisible();
}
async function answerCurrent(page, wrong = false, keyboard = false) {
  const activate = async locator => { if (keyboard) { await expect(locator).toBeEnabled(); await locator.focus(); await page.keyboard.press('Enter'); } else await locator.click(); };
  const prompt = await page.locator('#exercise-title').innerText();
  const e = fixture.curriculum.exercises.find(e => e.prompt === prompt);
  expect(e, `fixture exercise for ${prompt}`).toBeTruthy();
  if (e.type === 'choice' || e.type === 'reading') {
    if (e.type === 'reading') await expect(page.getByText(e.passage, { exact: true })).toBeVisible();
    const id = wrong ? e.choices.find(c => c.id !== e.correctChoiceIds[0]).id : e.correctChoiceIds[0];
    await activate(page.locator(`[data-choice="${id}"]`));
  } else if (e.type === 'word-tiles') {
    const ids = wrong ? [...e.correctOrder].reverse() : e.correctOrder;
    for (const id of ids) await activate(page.locator(`[data-tile="${id}"]`));
  } else if (e.type === 'writing') await page.locator('textarea').fill('We went to a lake and played a game.');
  else await page.locator('[data-draft-text]').fill(wrong ? 'not-the-answer' : e.acceptedAnswers[0]);
  await activate(page.locator('[data-action="submit"]'));
  if (e.type === 'writing') {
    await expect(page.getByText(e.modelAnswer, { exact: true })).toBeVisible();
    await activate(page.locator('[data-action="self-check"]'));
  }
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  await activate(page.locator('[data-action="next"]'));
  await expect(page.getByRole('heading', { name: prompt, exact: true })).toHaveCount(0);
  // Wait for the app to settle on one of its three post-answer states before
  // inspecting it: count() does not wait, so checking too early races the render.
  await page.locator('#exercise-title, [data-action="continue-rest"], #complete-title').first().waitFor();
  // Bergzeit appears once at the midpoint of longer rounds; continue through it.
  const rest = page.locator('[data-action="continue-rest"]');
  if (await rest.count()) { await activate(rest); await page.locator('#exercise-title').first().waitFor(); }
  return e;
}

test('real lesson, mistake, reload, reward, exported backup restores on a fresh device', async ({ page, browser }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await start(page);
  const first = await answerCurrent(page, true);
  await page.reload();
  await page.locator('[data-action="start-learn"]').first().click();
  await expect(page.locator('#exercise-title')).toBeVisible();
  const seen = new Set([first.type]);
  while (await page.locator('#exercise-title').count()) seen.add((await answerCurrent(page)).type);
  await expect(page.getByText('Etappe geschafft', { exact: true })).toBeVisible();
  const saved = await getWorkspace(page);
  expect(saved.learner.xp).toBeGreaterThan(0);
  expect(saved.learner.completedSessionIds).toHaveLength(1);
  expect(Object.values(saved.learner.conceptProgress).some(p => p.incorrect > 0)).toBe(true);
  expect(seen.size).toBeGreaterThanOrEqual(3);
  await page.getByRole('button', {name:'Zur Übersicht'}).click();
  await page.locator('[data-view="review"]').first().click();
  await page.locator('[data-action="start-review"]').click();
  await expect(page.locator('#exercise-title')).toBeVisible();
  const next = await getWorkspace(page);
  expect(next.session.exercises.some(e => e.conceptIds.some(id => first.conceptIds.includes(id)))).toBe(true);
  await page.locator('[data-action="exit"]').click();
  await page.locator('.sidebar [data-view="library"]').click();
  const pending = page.waitForEvent('download');
  await page.locator('[data-action="export-backup"]').click();
  const download = await pending;
  const backup = JSON.parse(await readFile(await download.path(), 'utf8'));
  expect(backup.learner).toEqual(saved.learner);
  const fresh = await browser.newContext();
  const other = await fresh.newPage();
  await other.goto('/lernen.html');
  await other.locator('.sidebar [data-view="library"]').click();
  await other.locator('[data-import-file]').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await other.locator('[data-action="confirm-import"]').click();
  await expect(other.getByText(/Sicherung wurde wiederhergestellt/)).toBeVisible();
  expect((await getWorkspace(other)).learner).toEqual(saved.learner);
  await fresh.close();
  expect(errors).toEqual([]);
});

test('offline production reload and practice make no remote requests', async ({ page, context }) => {
  const remote = []; page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1:4173') && !r.url().startsWith('blob:')) remote.push(r.url()); });
  await page.goto('/lernen.html');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.clearBrowserCache');
  await cdp.detach();
  await context.setOffline(true);
  await page.reload();
  await page.locator('[data-action="start-learn"]').first().click();
  await expect(page.locator('#exercise-title')).toBeVisible();
  while (await page.locator('#exercise-title').count()) await answerCurrent(page);
  await expect(page.getByText('Etappe geschafft', { exact: true })).toBeVisible();
  expect(remote).toEqual([]);
});

test('malformed imports preserve data and keyboard/mobile accessibility basics', async ({ page }) => {
  await page.goto('/lernen.html');
  await expect(page.locator('[data-action="start-learn"]').first()).toBeEnabled();
  const initial = await getWorkspace(page);
  await page.locator('.sidebar [data-view="library"]').click();
  await page.locator('[data-import-file]').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  await expect(page.getByText(/kein gültiges JSON/)).toBeVisible();
  expect((await getWorkspace(page)).learner).toEqual(initial.learner);
  await page.locator('.sidebar [data-view="home"]').click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({path:'experiment/evidence/home-desktop.png',fullPage:true});
  await page.setViewportSize({width:1024,height:768});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:'experiment/evidence/home-tablet.png',fullPage:true});
  await page.setViewportSize({width:320,height:568});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'experiment/evidence/home-mobile.png', fullPage: true });
  await page.locator('[data-action="start-learn"]').first().click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const choice = page.locator('[data-choice]').first();
  if (await choice.count()) {
    await choice.focus();
    await page.keyboard.press('Space');
    await page.locator('[data-action="submit"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-action="next"]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#exercise-title')).toBeVisible();
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.button').first().evaluate(e => parseFloat(getComputedStyle(e).transitionDuration))).toBeLessThan(.01);
  await page.screenshot({ path: 'experiment/evidence/exercise-mobile.png', fullPage: true });
});

test('all five exercise types work by keyboard and meet automated accessibility checks', async ({page})=>{
  await start(page);
  const types=new Set();
  while(await page.locator('#exercise-title').count()) {
    const prompt=await page.locator('#exercise-title').innerText();
    const exercise=fixture.curriculum.exercises.find(e=>e.prompt===prompt);
    if (exercise.type === 'writing') {
      const beforeDraft = await getWorkspace(page);
      await page.locator('textarea').fill('This unsubmitted draft stays only in this tab.');
      await page.locator('[data-action="exit"]').click();
      await expect(page.getByText(/Noch nicht geprüfte Eingaben gehen beim Neuladen verloren/)).toBeVisible();
      await page.reload();
      await page.locator('[data-action="start-learn"]').first().click();
      await expect(page.locator('textarea')).toHaveValue('');
      expect((await getWorkspace(page)).learner).toEqual(beforeDraft.learner);
    }
    if(!types.has(exercise.type)) {
      expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
      await page.screenshot({path:`experiment/evidence/exercise-${exercise.type}.png`,fullPage:true});
    }
    types.add((await answerCurrent(page,false,true)).type);
  }
  expect([...types].sort()).toEqual(['choice','reading','text-input','word-tiles','writing']);
  await expect(page.getByText('Etappe geschafft',{exact:true})).toBeVisible();
  await page.screenshot({path:'experiment/evidence/lesson-complete.png',fullPage:true});
});

test('storage failure leaves an answer retryable and second tabs cannot overwrite progress',async({page,context})=>{
  await start(page);
  const prompt=await page.locator('#exercise-title').innerText();
  const first=fixture.curriculum.exercises.find(e=>e.prompt===prompt);
  expect(first.type).toBe('text-input');
  await page.locator('[data-draft-text]').fill(first.acceptedAnswers[0]);
  await page.evaluate(()=>{window.originalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(){throw new Error('Simulierter Speicherfehler');};});
  await page.locator('[data-action="submit"]').click();
  await expect(page.getByText('Simulierter Speicherfehler')).toBeVisible();
  expect((await getWorkspace(page)).learner.answerRecords).toHaveLength(0);
  await page.evaluate(()=>{IDBObjectStore.prototype.put=window.originalPut;});
  await page.locator('[data-action="submit"]').click();
  await expect(page.locator('[data-action="next"]')).toBeEnabled();
  expect((await getWorkspace(page)).learner.answerRecords).toHaveLength(1);
  const second=await context.newPage();await second.goto('/lernen.html');
  await expect(second.getByText(/Ein anderer Tab nutzt/)).toBeVisible();
  await expect(second.locator('[data-action="start-learn"]').first()).toBeDisabled();
  await second.close();
});
