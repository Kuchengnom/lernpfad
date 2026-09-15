import { test, expect } from '@playwright/test';
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
