import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import fixture from '../../fixtures/unit-1a/curriculum.json' with { type: 'json' };
import french from '../../fixtures/french-smoke/curriculum.json' with { type: 'json' };
import math from '../../fixtures/math-divisibility/curriculum.json' with { type: 'json' };
import { newLearner, generateSession, recordAnswer } from '../../app/engine.js';
import { readProfile } from './profile-db.js';

const now = '2026-09-14T12:00:00.000Z';
const active = profile => profile.books.find(book => book.id === profile.activeBookId);
const navigate = (page, view) => page.locator(`[data-view="${view}"]:visible`).first().click();
const ready = page => expect(page.locator('[data-action="start-learn"]').first()).toBeEnabled();
async function preview(page, document) {
  await navigate(page, 'library');
  await page.locator('[data-import-file]').setInputFiles({ name: 'library.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(document)) });
  await expect(page.locator('[data-action="confirm-import"]')).toBeVisible();
}
async function abortWrites(page, abort = true) {
  await page.evaluate(abort => {
    if (abort) {
      window.libraryRealPut = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (...args) { const request = window.libraryRealPut.apply(this, args); this.transaction.abort(); return request; };
    } else IDBObjectStore.prototype.put = window.libraryRealPut;
  }, abort);
}
async function submitCurrent(page) {
  const book = active(await readProfile(page));
  const exercise = book.workspace.session.exercises[book.workspace.index];
  if (['choice', 'reading'].includes(exercise.type)) await page.locator(`[data-choice="${exercise.correctChoiceIds[0]}"]`).click();
  else if (exercise.type === 'word-tiles') {
    for (const id of exercise.correctOrder) await page.locator(`[data-tile="${id}"]`).click();
  } else if (exercise.type === 'writing') await page.locator('textarea').fill('This is my own practice sentence.');
  else await page.locator('[data-draft-text]').fill(exercise.acceptedAnswers[0]);
  await page.locator('[data-action="submit"]').click();
  if (exercise.type === 'writing') await page.locator('[data-action="self-check"]').click();
  await expect(page.locator('[data-action="next"]')).toBeEnabled();
}
async function next(page) {
  const prompt = await page.locator('#exercise-title').innerText();
  await page.locator('[data-action="next"]').click();
  await expect(page.getByRole('heading', { name: prompt, exact: true })).toHaveCount(0);
  await page.locator('#exercise-title, #rest-title, #complete-title').first().waitFor();
}

test('legacy IndexedDB migration preserves answers and a paused round exactly across reload', async ({ page }) => {
  const curriculum = fixture.curriculum;
  let learner = newLearner(curriculum);
  const session = generateSession(curriculum, learner, { now, seed: 'legacy-profile' });
  learner = recordAnswer(learner, session.exercises[0], { correct: false, selfCheck: false, sessionId: session.id, answerId: `${session.id}:${session.exercises[0].id}`, curriculumId: curriculum.id, curriculumVersion: curriculum.version }, { now });
  const legacy = { curriculum, learner, session, index: 0, feedback: { correct: false, selfCheck: false } };
  await page.goto('/');
  await page.evaluate(legacy => new Promise((resolve, reject) => {
    const open = indexedDB.open('trailbook-local', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('workspace');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const transaction = db.transaction('workspace', 'readwrite');
      transaction.objectStore('workspace').put(legacy, 'current');
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => reject(transaction.error);
    };
  }), legacy);
  await page.goto('/lernen.html'); await ready(page);
  const migrated = await readProfile(page);
  expect(migrated.books).toHaveLength(1);
  expect(migrated.stampAwards).toEqual([]);
  expect(active(migrated).workspace.learner).toEqual(learner);
  expect(active(migrated).workspace.session).toMatchObject(session);
  await page.locator('[data-action="start-learn"]').first().click();
  await expect(page.locator('[data-action="next"]')).toBeEnabled();
  await page.reload(); await ready(page);
  expect(await readProfile(page)).toEqual(migrated);
});

test('bundled math and French examples add through the library without changing the selected book or creating duplicates', async ({ page }) => {
  await page.goto('/lernen.html'); await ready(page);
  const initial = await readProfile(page);
  const initialBookId = initial.activeBookId;
  await navigate(page, 'books');
  await expect(page.getByRole('button', { name: 'Französisch-Beispiel hinzufügen' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mathe-Beispiel hinzufügen' })).toBeVisible();

  await page.getByRole('button', { name: 'Französisch-Beispiel hinzufügen' }).click();
  await expect(page.getByRole('heading', { name: french.curriculum.title })).toBeVisible();
  await expect(page.getByText(/aktuell ausgewähltes Buch bleibt geöffnet/)).toBeVisible();
  await page.locator('[data-action="confirm-import"]').click(); await ready(page);
  let profile = await readProfile(page);
  expect(profile.activeBookId).toBe(initialBookId);
  expect(profile.books.map(book => book.workspace.curriculum.id)).toEqual([fixture.curriculum.id, french.curriculum.id]);

  await navigate(page, 'books');
  await page.getByRole('button', { name: 'Mathe-Beispiel hinzufügen' }).click();
  await expect(page.getByRole('heading', { name: math.curriculum.title })).toBeVisible();
  await page.locator('[data-action="confirm-import"]').click(); await ready(page);
  profile = await readProfile(page);
  expect(profile.activeBookId).toBe(initialBookId);
  expect(profile.books.map(book => book.workspace.curriculum.id)).toEqual([fixture.curriculum.id, french.curriculum.id, math.curriculum.id]);

  await navigate(page, 'books');
  await expect(page.locator('.book-card')).toHaveCount(3);
  await expect(page.locator('.book-card').filter({ hasText: french.curriculum.title }).getByText('Französisch', { exact: true })).toBeVisible();
  await expect(page.locator('.book-card').filter({ hasText: math.curriculum.title }).getByText('Mathematik', { exact: true })).toBeVisible();
  const beforeDuplicate = structuredClone(profile);
  await page.getByRole('button', { name: 'Französisch-Beispiel hinzufügen' }).click();
  await expect(page.getByText(/wird nicht doppelt angelegt/)).toBeVisible();
  await page.locator('[data-action="confirm-import"]').click(); await ready(page);
  expect(await readProfile(page)).toEqual(beforeDuplicate);
  await page.reload(); await ready(page);
  expect(await readProfile(page)).toEqual(beforeDuplicate);

  await navigate(page, 'books');
  const frenchCard = page.locator('.book-card').filter({ hasText: french.curriculum.title });
  await frenchCard.getByRole('button', { name: 'Buch öffnen', exact: true }).click(); await ready(page);
  expect(active(await readProfile(page)).workspace.curriculum.id).toBe(french.curriculum.id);
  await navigate(page, 'books');
  const mathCard = page.locator('.book-card').filter({ hasText: math.curriculum.title });
  await mathCard.getByRole('button', { name: 'Buch öffnen', exact: true }).click(); await ready(page);
  expect(active(await readProfile(page)).workspace.curriculum.id).toBe(math.curriculum.id);
});

test('two paused books rename and switch independently; duplicates preserve and conflicting revisions reject; full backup restores on a fresh device', async ({ page, browser }) => {
  await page.goto('/lernen.html'); await ready(page);
  await page.locator('[data-action="start-learn"]').first().click();
  await submitCurrent(page);
  await page.locator('[data-action="exit"]').click();
  const english = active(await readProfile(page));
  await preview(page, french);
  await page.locator('[data-action="confirm-import"]').click(); await ready(page);
  await page.locator('[data-action="start-learn"]').first().click();
  await submitCurrent(page);
  await page.locator('[data-action="exit"]').click();
  const frenchBook = active(await readProfile(page));
  await navigate(page, 'books');
  await expect(page.locator('.book-card')).toHaveCount(2);
  await expect(page.locator('.book-card__paused')).toHaveCount(2);
  const card = page.locator('.book-card').filter({ has: page.locator(`[data-action="open-book"][data-book-id="${english.id}"]`) });
  await card.getByLabel('Buchtitel bearbeiten').fill('Englisch · Klasse 6');
  await card.getByRole('button', { name: 'Titel speichern' }).click();
  await expect(card.getByRole('heading')).toHaveText('Englisch · Klasse 6');
  const beforeSwitch = await readProfile(page);
  await abortWrites(page);
  await card.getByRole('button', { name: 'Buch öffnen', exact: true }).click();
  await expect(page.getByText(/Speichern (wurde abgebrochen|fehlgeschlagen)/)).toBeVisible();
  expect(await readProfile(page)).toEqual(beforeSwitch);
  await abortWrites(page, false);
  await card.getByRole('button', { name: 'Buch öffnen', exact: true }).click(); await ready(page);
  expect(active(await readProfile(page)).workspace).toEqual(english.workspace);
  await page.locator('[data-action="start-learn"]').first().click();
  await expect(page.locator('[data-action="next"]')).toBeEnabled();
  await page.locator('[data-action="exit"]').click();
  const beforeDuplicate = await readProfile(page);
  await preview(page, fixture);
  await expect(page.locator('#import-replacement-title').locator('..').getByText(/pausierte Runde bleiben erhalten/)).toBeVisible();
  await page.locator('[data-action="confirm-import"]').click(); await ready(page);
  expect(await readProfile(page)).toEqual(beforeDuplicate);
  const conflicting = structuredClone(fixture);
  conflicting.curriculum.exercises[0].explanation += ' Changed semantics.';
  await navigate(page, 'library');
  await page.locator('[data-import-file]').setInputFiles({ name: 'conflict.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(conflicting)) });
  await expect(page.getByText(/curriculum.version/)).toBeVisible();
  expect(await readProfile(page)).toEqual(beforeDuplicate);
  await navigate(page, 'books');
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'experiment/evidence/library-mobile.png', fullPage: true });
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Alles sichern', exact: true }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('lernpfad-profil.json');
  const backup = JSON.parse(await readFile(await download.path(), 'utf8'));
  expect(backup.profile.books.map(book => book.workspace.learner)).toEqual([english.workspace.learner, frenchBook.workspace.learner]);
  expect(backup.profile.books.every(book => book.workspace.session === null)).toBe(true);
  expect(backup.profile.books[0].title).toBe('Englisch · Klasse 6');
  const fresh = await browser.newContext();
  const restored = await fresh.newPage();
  await restored.goto('/lernen.html'); await ready(restored);
  const initial = await readProfile(restored);
  await preview(restored, backup);
  await expect(restored.getByRole('heading', { name: 'Deine aktuelle Sammlung wird ersetzt' })).toBeVisible();
  expect(await readProfile(restored)).toEqual(initial);
  await abortWrites(restored);
  await restored.getByRole('button', { name: 'Sammlung ersetzen' }).click();
  await expect(restored.getByText(/Speichern (wurde abgebrochen|fehlgeschlagen)/)).toBeVisible();
  expect(await readProfile(restored)).toEqual(initial);
  await abortWrites(restored, false);
  await restored.getByRole('button', { name: 'Sammlung ersetzen' }).click(); await ready(restored);
  expect(await readProfile(restored)).toEqual(backup.profile);
  await restored.reload(); await ready(restored);
  expect(await readProfile(restored)).toEqual(backup.profile);
  await fresh.close();
});

test('Bergzeit survives reload, continues once, and completed stamps survive a course backup and full export', async ({ page, browser }) => {
  await page.goto('/lernen.html'); await ready(page);
  await page.locator('[data-action="start-learn"]').first().click();
  const session = active(await readProfile(page)).workspace.session;
  expect(session.exercises.length).toBeGreaterThanOrEqual(8);
  const midpoint = Math.ceil(session.exercises.length / 2);
  for (let index = 0; index < midpoint; index++) { await submitCurrent(page); await next(page); }
  await expect(page.locator('#rest-title')).toBeVisible();
  const resting = await readProfile(page);
  expect(active(resting).workspace.session).toMatchObject({ resting: true, restAcknowledged: true });
  await page.reload(); await ready(page);
  await page.locator('[data-action="start-learn"]').first().click();
  await expect(page.locator('#rest-title')).toBeVisible();
  expect(await readProfile(page)).toEqual(resting);
  await abortWrites(page);
  await page.getByRole('button', { name: 'Weiterwandern' }).click();
  await expect(page.getByText(/Speichern (wurde abgebrochen|fehlgeschlagen)/)).toBeVisible();
  expect(await readProfile(page)).toEqual(resting);
  await abortWrites(page, false);
  await page.getByRole('button', { name: 'Weiterwandern' }).click();
  await expect(page.locator('#exercise-title')).toBeVisible();
  await page.reload(); await ready(page);
  await page.locator('[data-action="start-learn"]').first().click();
  await expect(page.locator('#exercise-title')).toBeVisible();
  for (let index = midpoint; index < session.exercises.length; index++) {
    await submitCurrent(page); await next(page);
    await expect(page.locator('#rest-title')).toHaveCount(0);
  }
  await expect(page.locator('#complete-title')).toBeVisible();
  const completed = await readProfile(page);
  expect(completed.stampAwards.map(award => award.stampId)).toEqual(['fox']);
  expect(active(completed).workspace.learner.completedSessionIds).toEqual([session.id]);
  await page.reload(); await ready(page);
  expect(await readProfile(page)).toEqual(completed);
  await navigate(page, 'album');
  await expect(page.locator('.stamp-card.is-earned')).toHaveCount(1);
  const olderBackup = { schemaVersion: '1.0', kind: 'backup', curriculum: fixture.curriculum, learner: newLearner(fixture.curriculum) };
  await preview(page, olderBackup);
  await page.locator('[data-action="confirm-import"]').click(); await ready(page);
  const replaced = await readProfile(page);
  expect(active(replaced).workspace.learner.answerRecords).toEqual([]);
  expect(replaced.stampAwards).toEqual(completed.stampAwards);
  await navigate(page, 'album');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Alles sichern', exact: true }).click();
  const exported = JSON.parse(await readFile(await (await pending).path(), 'utf8'));
  expect(exported.profile.stampAwards).toEqual(completed.stampAwards);
  const fresh = await browser.newContext();
  const other = await fresh.newPage();
  await other.goto('/lernen.html'); await ready(other);
  await preview(other, exported);
  await other.getByRole('button', { name: 'Sammlung ersetzen' }).click(); await ready(other);
  expect(await readProfile(other)).toEqual(exported.profile);
  await navigate(other, 'album');
  await expect(other.locator('.stamp-card.is-earned')).toHaveCount(1);
  await fresh.close();
});

test('book title drafts survive export and saving another title without entering backups', async ({ page }) => {
  await page.goto('/lernen.html'); await ready(page);
  await preview(page, french);
  await page.locator('[data-action="confirm-import"]').click(); await ready(page);
  await navigate(page, 'books');
  const titles = page.getByLabel('Buchtitel bearbeiten');
  await titles.nth(0).fill('Unsubmitted English name');
  await titles.nth(1).fill('Französisch gespeichert');
  await page.locator('.book-card').nth(1).getByRole('button', { name: 'Titel speichern' }).click();
  await expect(titles.nth(0)).toHaveValue('Unsubmitted English name');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Alles sichern', exact: true }).click();
  const exported = JSON.parse(await readFile(await (await pending).path(), 'utf8'));
  await expect(titles.nth(0)).toHaveValue('Unsubmitted English name');
  expect(exported.profile.books[0].title).toBe(fixture.curriculum.title);
  expect(exported.profile.books[1].title).toBe('Französisch gespeichert');
  expect(JSON.stringify(exported)).not.toContain('Unsubmitted English name');
  await page.reload(); await ready(page); await navigate(page, 'books');
  await expect(titles.nth(0)).toHaveValue(fixture.curriculum.title);
});

test('speech retries newly available local voices and cancels on leaving the exercise or hiding the page', async ({ page }) => {
  await page.addInitScript(() => {
    window.voiceCalls = [];
    window.testVoices = [];
    window.cancelCalls = 0;
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: class { constructor(text) { this.text = text; } } });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => window.testVoices,
      cancel: () => { window.cancelCalls++; },
      speak: utterance => window.voiceCalls.push({ text: utterance.text, lang: utterance.lang, local: utterance.voice.localService }),
    } });
  });
  const spoken = structuredClone(french);
  spoken.curriculum.version = '2.0';
  for (const exercise of spoken.curriculum.exercises) exercise.audioText = 'Bonjour.';
  await page.goto('/lernen.html'); await ready(page);
  await preview(page, spoken);
  await page.locator('[data-action="confirm-import"]').click(); await ready(page);
  await page.locator('[data-action="start-learn"]').first().click();
  await page.getByRole('button', { name: 'Vorlesen', exact: true }).click();
  await expect(page.getByText(/keine lokale Stimme verfügbar/)).toBeVisible();
  expect(await page.evaluate(() => window.voiceCalls)).toEqual([]);
  await page.evaluate(() => { window.testVoices = [{ lang: 'fr-FR', localService: true }]; });
  await page.getByRole('button', { name: 'Vorlesen', exact: true }).click();
  expect(await page.evaluate(() => window.voiceCalls)).toEqual([{ text: 'Bonjour.', lang: 'fr-FR', local: true }]);
  const beforeExit = await page.evaluate(() => window.cancelCalls);
  await page.locator('[data-action="exit"]').click();
  expect(await page.evaluate(() => window.cancelCalls)).toBeGreaterThan(beforeExit);
  const beforeHide = await page.evaluate(() => window.cancelCalls);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  expect(await page.evaluate(() => window.cancelCalls)).toBeGreaterThan(beforeHide);
  expect(await page.evaluate(() => window.voiceCalls.length)).toBe(1);
});
