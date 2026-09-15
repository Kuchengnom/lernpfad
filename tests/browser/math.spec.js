import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import mathPackage from '../../fixtures/math-divisibility/curriculum.json' with { type: 'json' };

const packageFile = (document, name = 'mathe.json') => ({
  name,
  mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify(document)),
});

async function importMath(page) {
  await page.goto('/lernen.html');
  await page.locator('[data-view="library"]:visible').first().click();
  await page.locator('[data-import-file]').setInputFiles(packageFile(mathPackage));
  await expect(page.locator('[data-action="confirm-import"]')).toBeVisible();
  await page.locator('[data-action="confirm-import"]').click();
  await expect(page.getByText(/Dein Lernstoff ist bereit/)).toBeVisible();
}

async function savedWorkspace(page) {
  return page.evaluate(() => new Promise(resolve => {
    const request = indexedDB.open('trailbook-local', 1);
    request.onsuccess = () => {
      const db = request.result;
      const get = db.transaction('workspace').objectStore('workspace').get('current');
      get.onsuccess = () => {
        const profile = get.result;
        resolve({ profile, workspace: profile.books.find(book => book.id === profile.activeBookId).workspace });
        db.close();
      };
    };
  }));
}

function wrongAnswer(item) {
  if (item.type === 'choice') return item.choices.find(choice => !item.correctChoiceIds.includes(choice.id)).id;
  if (item.type === 'numeric-input') return item.acceptedValues[0] === '0' ? '1' : '0';
  return item.comparison === 'set' ? ['0'] : item.expectedValues.map(value => String(Number(value) + 1));
}

// ponytail: writes a hand-picked exercise list straight into the paused session so a test can
// land on a specific comparison/type without hunting for it through the real scheduler.
async function injectSession(page, exercises) {
  await page.evaluate(exercises => new Promise((resolve, reject) => {
    const request = indexedDB.open('trailbook-local', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('workspace', 'readwrite');
      const store = tx.objectStore('workspace');
      const get = store.get('current');
      get.onsuccess = () => {
        const profile = get.result;
        const book = profile.books.find(entry => entry.id === profile.activeBookId);
        book.workspace.session = { id: `test-session-${Date.now()}`, curriculumId: book.workspace.curriculum.id, curriculumVersion: book.workspace.curriculum.version, exercises, mode: 'learn', startedAt: new Date().toISOString() };
        book.workspace.index = 0;
        book.workspace.feedback = null;
        store.put(profile, 'current');
      };
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    };
  }), exercises);
  await page.reload();
  await page.locator('[data-action="start-learn"]').first().click();
}

function correctAnswerFor(item) {
  return item.type === 'choice' ? item.correctChoiceIds[0] : item.type === 'numeric-input' ? item.acceptedValues[0] : item.expectedValues;
}

async function answerCurrent(page, item, answer) {
  if (item.type === 'choice') await page.locator(`[data-choice="${answer}"]`).click();
  else if (item.type === 'numeric-input') await page.locator('[data-draft-numeric]').fill(answer);
  else {
    for (const [index, value] of answer.entries()) {
      if (index) await page.locator('[data-action="add-number"]').click();
      await page.locator(`[data-number-entry="${index}"]`).fill(value);
    }
  }
  await page.locator('[data-action="submit"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
}

test('math import renders math controls and invalid numeric syntax does not create an attempt', async ({ page }) => {
  await importMath(page);
  await page.locator('[data-action="start-learn"]').first().click();

  // The scheduler may interleave the first few choices; advance through them
  // until the first numeric task while exercising the real rendered controls.
  for (let step = 0; step < 8 && !(await page.locator('[data-draft-numeric]').count()); step++) {
    const exerciseId = await page.evaluate(async () => new Promise(resolve => {
      const request = indexedDB.open('trailbook-local', 1);
      request.onsuccess = () => {
        const db = request.result;
        const get = db.transaction('workspace').objectStore('workspace').get('current');
        get.onsuccess = () => { const p = get.result; const w = p.books.find(b => b.id === p.activeBookId).workspace; resolve(w.session.exercises[w.index].id); db.close(); };
      };
    }));
    const exercise = mathPackage.curriculum.exercises.find(item => item.id === exerciseId);
    expect(exercise).toBeTruthy();
    if (exercise.type === 'numeric-input') {
      await expect(page.locator('[data-draft-numeric]')).toBeVisible();
      break;
    } else if (exercise.type === 'choice') {
      await page.locator(`[data-choice="${exercise.correctChoiceIds[0]}"]`).click();
    } else if (exercise.type === 'number-list') {
      for (const [index, value] of exercise.expectedValues.entries()) {
        if (index) await page.locator('[data-action="add-number"]').click();
        await page.locator(`[data-number-entry="${index}"]`).fill(value);
      }
    } else {
      throw new Error(`Expected a math input task, got ${exercise.type}`);
    }
    await page.locator('[data-action="submit"]').click();
    await page.locator('[data-action="next"]').click();
  }
  await expect(page.locator('[data-draft-numeric]')).toBeVisible();
  expect(await page.locator('[data-draft-numeric]').evaluate(input => getComputedStyle(input).minHeight)).toBe('48px');

  const before = await page.evaluate(async () => new Promise(resolve => {
    const request = indexedDB.open('trailbook-local', 1);
    request.onsuccess = () => {
      const db = request.result;
      const get = db.transaction('workspace').objectStore('workspace').get('current');
      get.onsuccess = () => {
        const profile = get.result;
        const workspace = profile.books.find(book => book.id === profile.activeBookId).workspace;
        resolve(workspace.learner.answerRecords.length);
        db.close();
      };
    };
  }));
  await page.locator('[data-draft-numeric]').fill('4abc');
  await page.keyboard.press('Enter');
  await expect(page.locator('#numeric-input-error')).toContainText('ganze Zahl');
  const after = await page.evaluate(async () => new Promise(resolve => {
    const request = indexedDB.open('trailbook-local', 1);
    request.onsuccess = () => {
      const db = request.result;
      const get = db.transaction('workspace').objectStore('workspace').get('current');
      get.onsuccess = () => {
        const profile = get.result;
        resolve(profile.books.find(book => book.id === profile.activeBookId).workspace.learner.answerRecords.length);
        db.close();
      };
    };
  }));
  expect(after).toBe(before);
});

test('full math round records a mistake, restores feedback, reviews it, and completes with a stamp', async ({ page }) => {
  await importMath(page);
  await page.locator('[data-action="start-learn"]').first().click();
  let madeMistake = false;
  for (let step = 0; step < 20; step++) {
    if (await page.locator('[data-action="continue-rest"]').count()) {
      await page.locator('[data-action="continue-rest"]').click();
      // Wait for the exercise to render: count() does not wait, so checking the
      // break condition straight after the click races the re-render and exits mid-round.
      await page.locator('[data-action="submit"]').first().waitFor();
    }
    if (!(await page.locator('[data-action="next"]').count()) && !(await page.locator('[data-action="submit"]').count())) break;
    const { workspace } = await savedWorkspace(page);
    const item = mathPackage.curriculum.exercises.find(exercise => exercise.id === workspace.session.exercises[workspace.index].id);
    expect(item).toBeTruthy();
    // The mistake goes on the last exercise deliberately. A concept answered
    // correctly later in the same round stops being due, so a mistake made
    // earlier would leave an honestly empty review queue and prove nothing.
    const wrong = workspace.index === workspace.session.exercises.length - 1 && !madeMistake;
    const answer = wrong ? wrongAnswer(item) : item.type === 'choice' ? item.correctChoiceIds[0] : item.type === 'numeric-input' ? item.acceptedValues[0] : item.expectedValues;
    await answerCurrent(page, item, answer);
    if (wrong) {
      madeMistake = true;
      await page.locator('[data-action="exit"]').click();
      await page.reload();
      await page.locator('[data-action="start-learn"], [data-action="resume-session"]').first().click();
      await expect(page.locator('[data-action="next"]')).toBeVisible();
      await expect(page.locator('.feedback')).toContainText('schau noch mal hin');
    }
    await page.locator('[data-action="next"]').click();
    // Settle on one of the three post-answer states before the next iteration inspects the page.
    await page.locator('[data-action="submit"], [data-action="continue-rest"], #complete-title').first().waitFor();
  }
  expect(madeMistake).toBe(true);
  const completed = await savedWorkspace(page);
  expect(completed.workspace.session).toBe(null);
  expect(completed.profile.stampAwards.length).toBeGreaterThan(0);
  // start-review lives on the review page. That page is reached from the home
  // quick actions; the main navigation only offers home/library/study/progress.
  await page.locator('[data-view="home"]:visible').first().click();
  await page.locator('[data-view="review"]:visible').first().click();
  await page.locator('[data-action="start-review"]').first().click();
  await expect(page.locator('[data-action="submit"]')).toBeVisible();
});

test('math authoring selects the math v2 schema and pasted fixture reaches preview', async ({ page }) => {
  await page.goto('/lernen.html');
  await page.locator('[data-view="library"]:visible').first().click();
  await page.locator('[data-action="navigate"][data-view="authoring"]').click();
  await page.locator('[data-authoring-subject]').selectOption('math');
  await expect(page.locator('[data-authoring-prompt]')).toContainText('numberDomain');
  await expect(page.locator('[data-authoring-prompt]')).toContainText('subject');
  await page.locator('[data-view="import-text"]').click();
  await page.locator('[data-import-text]').fill(JSON.stringify(mathPackage));
  // The paste form's controls are type="button" from the shared helper; there is
  // no submit button, so the validate action is the real entry point.
  await page.locator('[data-action="validate-pasted-import"]').click();
  await expect(page.locator('[data-action="confirm-import"]')).toBeVisible();
  await expect(page.getByText(/Teilbarkeit|Mathe/).first()).toBeVisible();
});

test('number-list comparison semantics are enforced through the UI for set, sequence and multiset', async ({ page }) => {
  await importMath(page);
  const setEx = mathPackage.curriculum.exercises.find(item => item.id === 'math.ex.teilers-22');
  const sequenceEx = mathPackage.curriculum.exercises.find(item => item.id === 'math.ex.multiples-18');
  const multisetEx = mathPackage.curriculum.exercises.find(item => item.id === 'math.ex.prime-factors-84');
  expect(setEx.comparison).toBe('set');
  expect(sequenceEx.comparison).toBe('sequence');
  expect(multisetEx.comparison).toBe('multiset');

  // set: a canonical duplicate ("02" and "2" are the same number) is rejected before it
  // ever becomes an attempt, not just marked wrong.
  await injectSession(page, [setEx]);
  const before = (await savedWorkspace(page)).workspace.learner.answerRecords.length;
  await page.locator('[data-number-entry="0"]').fill('02');
  await page.locator('[data-action="add-number"]').click();
  await page.locator('[data-number-entry="1"]').fill('2');
  await page.locator('[data-action="submit"]').click();
  await expect(page.locator('#numeric-input-error')).toContainText('nur einmal');
  expect((await savedWorkspace(page)).workspace.learner.answerRecords.length).toBe(before);

  // sequence: the right numbers in the wrong order is a valid, wrong attempt (not invalid input).
  await injectSession(page, [sequenceEx]);
  await answerCurrent(page, sequenceEx, [...sequenceEx.expectedValues].reverse());
  expect((await savedWorkspace(page)).workspace.feedback.correct).toBe(false);

  // multiset: reordering is accepted...
  await injectSession(page, [multisetEx]);
  await answerCurrent(page, multisetEx, [...multisetEx.expectedValues].reverse());
  expect((await savedWorkspace(page)).workspace.feedback.correct).toBe(true);

  // ...but losing a repeated factor is not, even though the remaining values are all correct.
  await injectSession(page, [multisetEx]);
  await answerCurrent(page, multisetEx, [...new Set(multisetEx.expectedValues)]);
  expect((await savedWorkspace(page)).workspace.feedback.correct).toBe(false);
});

test('number fields can be added and removed, keep correct values and indices, and stay keyboard-reachable', async ({ page }) => {
  await importMath(page);
  const setEx = mathPackage.curriculum.exercises.find(item => item.id === 'math.ex.teilers-22');
  await injectSession(page, [setEx]);

  await page.locator('[data-number-entry="0"]').fill('1');
  await page.locator('[data-action="add-number"]').click();
  await page.locator('[data-number-entry="1"]').fill('2');
  await page.locator('[data-action="add-number"]').click();
  await page.locator('[data-number-entry="2"]').fill('11');
  await page.locator('[data-action="add-number"]').click();
  await page.locator('[data-number-entry="3"]').fill('22');
  await expect(page.locator('[data-number-entry]')).toHaveCount(4);

  // Remove the second field ("2"); the remaining three shift down and keep their order.
  await page.locator('[data-action="remove-number"][data-number-index="1"]').click();
  await expect(page.locator('[data-number-entry]')).toHaveCount(3);
  expect(await page.locator('[data-number-entry="0"]').inputValue()).toBe('1');
  expect(await page.locator('[data-number-entry="1"]').inputValue()).toBe('11');
  expect(await page.locator('[data-number-entry="2"]').inputValue()).toBe('22');

  // Focus lands on a real, reachable field rather than being lost to <body>.
  await expect(page.locator('[data-number-entry="1"]')).toBeFocused();
  await page.keyboard.press('End');
  await page.keyboard.type('9');
  expect(await page.locator('[data-number-entry="1"]').inputValue()).toBe('119');

  // Removing down to one field disables its own remove control (a set needs at least one entry).
  await page.locator('[data-action="remove-number"][data-number-index="0"]').click();
  await page.locator('[data-action="remove-number"][data-number-index="0"]').click();
  await expect(page.locator('[data-number-entry]')).toHaveCount(1);
  await expect(page.locator('[data-action="remove-number"]')).toBeDisabled();
});

test('session id and answered progress stay stable across a book switch', async ({ page }) => {
  await importMath(page);
  await page.locator('[data-action="start-learn"]').first().click();
  const { workspace: started } = await savedWorkspace(page);
  const first = mathPackage.curriculum.exercises.find(item => item.id === started.session.exercises[0].id);
  await answerCurrent(page, first, correctAnswerFor(first));
  await page.locator('[data-action="next"]').click();
  await page.locator('[data-action="submit"], [data-action="continue-rest"], #complete-title').first().waitFor();
  await page.locator('[data-action="exit"]').click();

  const paused = await savedWorkspace(page);
  const mathBookId = paused.profile.activeBookId;
  const sessionId = paused.workspace.session.id;
  const answeredIndex = paused.workspace.index;
  const answeredCount = paused.workspace.learner.answerRecords.length;
  expect(sessionId).toBeTruthy();

  await page.locator('[data-view="books"]:visible').first().click();
  const bookIds = await page.locator('[data-action="open-book"]').evaluateAll(nodes => nodes.map(node => node.dataset.bookId));
  const otherBookId = bookIds.find(id => id !== mathBookId);
  expect(otherBookId).toBeTruthy();

  await page.locator(`[data-action="open-book"][data-book-id="${otherBookId}"]`).click();
  await expect(page.locator('[data-action="start-learn"]').first()).toBeEnabled();
  expect((await savedWorkspace(page)).profile.activeBookId).toBe(otherBookId);

  await page.locator('[data-view="books"]:visible').first().click();
  await page.locator(`[data-action="open-book"][data-book-id="${mathBookId}"]`).click();
  await expect(page.locator('[data-action="start-learn"]').first()).toBeEnabled();

  const resumed = await savedWorkspace(page);
  expect(resumed.profile.activeBookId).toBe(mathBookId);
  expect(resumed.workspace.session.id).toBe(sessionId);
  expect(resumed.workspace.index).toBe(answeredIndex);
  expect(resumed.workspace.learner.answerRecords.length).toBe(answeredCount);
});

test('a mixed language and math profile round-trips through export/import on a fresh browser', async ({ page, browser }) => {
  await page.goto('/lernen.html');
  await expect(page.locator('[data-action="start-learn"]').first()).toBeEnabled();
  await page.locator('[data-action="start-learn"]').first().click();
  // ponytail: minimal generic answer for whichever bundled language exercise comes up first,
  // adapted from library.spec.js's submitCurrent rather than importing across spec files.
  const languageExercise = async () => {
    const { workspace: state } = await savedWorkspace(page);
    return state.session.exercises[state.index];
  };
  const first = await languageExercise();
  if (['choice', 'reading'].includes(first.type)) await page.locator(`[data-choice="${first.correctChoiceIds[0]}"]`).click();
  else if (first.type === 'word-tiles') { for (const id of first.correctOrder) await page.locator(`[data-tile="${id}"]`).click(); }
  else if (first.type === 'writing') await page.locator('textarea').fill('Meine eigene Übungsantwort.');
  else await page.locator('[data-draft-text]').fill(first.acceptedAnswers[0]);
  await page.locator('[data-action="submit"]').click();
  if (first.type === 'writing') await page.locator('[data-action="self-check"]').click();
  await expect(page.locator('[data-action="next"]')).toBeEnabled();
  await page.locator('[data-action="exit"]').click();
  const languageBefore = await savedWorkspace(page);

  await importMath(page);
  await page.locator('[data-action="start-learn"]').first().click();
  // Complete the whole math round so at least one stamp exists to prove stamps survive too.
  for (let step = 0; step < 20; step++) {
    if (await page.locator('[data-action="continue-rest"]').count()) {
      await page.locator('[data-action="continue-rest"]').click();
      await page.locator('[data-action="submit"]').first().waitFor();
    }
    if (!(await page.locator('[data-action="next"]').count()) && !(await page.locator('[data-action="submit"]').count())) break;
    const { workspace } = await savedWorkspace(page);
    const item = mathPackage.curriculum.exercises.find(exercise => exercise.id === workspace.session.exercises[workspace.index].id);
    await answerCurrent(page, item, correctAnswerFor(item));
    await page.locator('[data-action="next"]').click();
    await page.locator('[data-action="submit"], [data-action="continue-rest"], #complete-title').first().waitFor();
  }
  const mathBefore = await savedWorkspace(page);
  expect(mathBefore.workspace.session).toBe(null);
  expect(mathBefore.profile.stampAwards.length).toBeGreaterThan(0);

  await page.locator('[data-view="home"]:visible').first().click();
  await page.locator('[data-view="books"]:visible').first().click();
  const pending = page.waitForEvent('download');
  await page.locator('[data-action="export-profile"]').click();
  const download = await pending;
  const backup = JSON.parse(await readFile(await download.path(), 'utf8'));
  expect(backup.profile.books).toHaveLength(2);
  expect(backup.profile.stampAwards.length).toBeGreaterThan(0);

  const fresh = await browser.newContext();
  const restoredPage = await fresh.newPage();
  await restoredPage.goto('/lernen.html');
  await restoredPage.locator('[data-view="library"]:visible').first().click();
  await restoredPage.locator('[data-import-file]').setInputFiles(packageFile(backup, 'backup.json'));
  await expect(restoredPage.locator('[data-action="confirm-import"]')).toBeVisible();
  await restoredPage.locator('[data-action="confirm-import"]').click();
  await expect(restoredPage.locator('[data-action="start-learn"]').first()).toBeEnabled();

  const restored = await savedWorkspace(restoredPage);
  expect(restored.profile.books).toHaveLength(2);
  expect(restored.profile.stampAwards).toEqual(backup.profile.stampAwards);
  const restoredMath = restored.profile.books.find(book => book.workspace.curriculum.id === mathPackage.curriculum.id);
  const restoredLanguage = restored.profile.books.find(book => book.workspace.curriculum.id !== mathPackage.curriculum.id);
  expect(restoredMath.workspace.learner.answerRecords.length).toBe(mathBefore.workspace.learner.answerRecords.length);
  expect(restoredLanguage.workspace.learner.answerRecords.length).toBe(languageBefore.workspace.learner.answerRecords.length);
  await fresh.close();
});

test('math stays usable at 320px and offline after the service worker is ready', async ({ page, context }) => {
  await importMath(page);
  const setEx = mathPackage.curriculum.exercises.find(item => item.id === 'math.ex.teilers-22');
  await injectSession(page, [setEx]);

  // 320px: a number-list exercise must not force horizontal scrolling.
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(page.locator('[data-number-entry="0"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth)).toBe(true);

  // Offline: the service worker must already control the page before the network is cut.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('[data-action="start-learn"]').first()).toBeEnabled();
  await page.locator('[data-action="start-learn"]').first().click();
  const { workspace } = await savedWorkspace(page);
  const item = mathPackage.curriculum.exercises.find(exercise => exercise.id === workspace.session.exercises[workspace.index].id);
  await answerCurrent(page, item, correctAnswerFor(item));
  await context.setOffline(false);
});

test('the downloaded authoring schema file is actually the math v2 schema', async ({ page }) => {
  await page.goto('/lernen.html');
  await page.locator('[data-view="library"]:visible').first().click();
  await page.locator('[data-action="navigate"][data-view="authoring"]').click();
  await page.locator('[data-authoring-subject]').selectOption('math');
  await expect(page.locator('[data-authoring-prompt]')).toContainText('numberDomain');

  const pending = page.waitForEvent('download');
  await page.locator('[data-action="download-schema"]').click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('curriculum.schema.json');
  const schema = JSON.parse(await readFile(await download.path(), 'utf8'));
  expect(schema.title).toBe('Trailbook subject-aware curriculum package v2');
  const text = JSON.stringify(schema);
  expect(text).toContain('"subject"');
  expect(text).toContain('numeric-input');
  expect(text).toContain('number-list');
  expect(text).toContain('numberDomain');
});
