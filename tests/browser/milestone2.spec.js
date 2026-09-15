import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readWorkspace as workspace } from './profile-db.js';
async function openStudy(page) {
  await page.locator('[data-view="study"]:visible').first().click();
  await expect(page.locator('#study-title')).toBeVisible();
}
async function focusBeach(page) {
  await page.locator('[data-study-query]').fill('Strand');
  await page.locator('[data-action="practice-concept"][data-concept-id="u1a.vocab.beach"]').click();
  await expect(page.locator('#exercise-title')).toBeVisible();
}
async function answerBeach(page, answer) {
  await page.locator('[data-draft-text]').fill(answer);
  await page.locator('[data-action="submit"]').click();
  await expect(page.locator('[data-action="next"]')).toBeEnabled();
  await page.locator('[data-action="next"]').click();
  await expect(page.getByText('Etappe geschafft',{exact:true})).toBeVisible();
}

test('study lookup is read-only, concept practice creates a real mistake and a short review resolves it',async({page})=>{
  await page.goto('/lernen.html');
  await expect(page.locator('[data-action="start-learn"]').first()).toBeEnabled();
  const before=await workspace(page);
  await openStudy(page);
  const search=page.locator('[data-study-query]');
  await search.pressSequentially('Strand');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('Strand');
  await expect(page.locator('.study-card')).toHaveCount(1);
  await expect(page.locator('.study-card').getByText('beach',{exact:true}).first()).toBeVisible();
  expect((await workspace(page)).learner).toEqual(before.learner);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:'experiment/evidence/milestone2-study-desktop.png',fullPage:true});
  await focusBeach(page);
  expect((await workspace(page)).session.exercises).toHaveLength(1);
  await answerBeach(page,'forest');
  await page.getByRole('button',{name:'Zur Übersicht'}).click();
  await page.locator('[data-view="review"]').first().click();
  await expect(page.locator('.review-item')).toHaveCount(1);
  await expect(page.locator('.review-item')).toContainText('beach');
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:'experiment/evidence/milestone2-review.png',fullPage:true});
  await page.locator('[data-action="start-review"]').click();
  await expect(page.locator('#exercise-title')).toBeVisible();
  expect((await workspace(page)).session.exercises).toHaveLength(1);
  const reviewSession = (await workspace(page)).session.id;
  await page.locator('[data-action="exit"]').click();
  await page.locator('[data-view="review"]').first().click();
  const dialogs = [];
  page.on('dialog', async dialog => { dialogs.push(dialog.message()); await dialog.dismiss(); });
  await page.locator('[data-action="start-review"]').click();
  await expect(page.locator('#exercise-title')).toBeVisible();
  expect((await workspace(page)).session.id).toBe(reviewSession);
  expect(dialogs).toEqual([]);
  await answerBeach(page,'beach');
  await page.reload();
  const saved=await workspace(page);
  expect(saved.learner.answerRecords).toHaveLength(2);
  expect(saved.learner.xp).toBe(10);
  await page.locator('[data-view="review"]').first().click();
  await expect(page.locator('.review-item')).toHaveCount(0);
  await expect(page.locator('[data-action="start-review"]')).toHaveCount(0);
  for (let repetition = 0; repetition < 3; repetition += 1) {
    await openStudy(page);
    await focusBeach(page);
    await answerBeach(page, 'beach');
    await page.getByRole('button', {name:'Zur Übersicht'}).click();
  }
  await page.locator('[data-view="progress"]').first().click();
  await expect(page.locator('.concept-row').filter({has:page.getByRole('heading',{name:'beach',exact:true})})).toContainText('Oft richtig geübt');
  await expect(page.getByText(/Er ist keine Note oder Prüfung/)).toBeVisible();
});

test('new learners get an honest empty review, grammar is readable on mobile and filters preserve keyboard focus',async({page,context})=>{
  await page.goto('/lernen.html');
  await page.locator('[data-view="review"]').first().click();
  await expect(page.locator('[data-action="start-review"]')).toHaveCount(0);
  await expect(page.locator('.review-item')).toHaveCount(0);
  await openStudy(page);
  await page.setViewportSize({width:390,height:844});
  const navTops = await page.locator('.app-shell > .app-nav .nav-item').evaluateAll(items => items.map(item => item.getBoundingClientRect().top));
  expect(new Set(navTops).size).toBe(1);
  await page.locator('[data-kind="grammar"]').click();
  await expect(page.locator('[data-kind="grammar"]')).toBeFocused();
  await page.locator('[data-study-query]').fill('regular simple past');
  await page.locator('.study-card details summary').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.study-card details').first()).toHaveAttribute('open','');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.locator('.study-card details').first().evaluate(element => element.scrollIntoView({block:'center'}));
  await page.screenshot({path:'experiment/evidence/milestone2-study-mobile.png'});
  await page.locator('[data-study-query]').fill('nothing-matches');
  await expect(page.locator('.study-card')).toHaveCount(0);
  await page.locator('[data-study-query]').fill('');
  await page.locator('[data-kind="all"]').click();
  await page.locator('[data-study-query]').fill('holiday paragraph');
  await expect(page.locator('.study-card')).toContainText(/gesperrt|Voraussetzung|zuerst/);
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await openStudy(page);
  await page.locator('[data-study-query]').fill('Fahrrad');
  await expect(page.locator('.study-card')).toContainText('bike');
});

test('changing an unfinished practice focus is deliberate and preserves answered progress',async({page})=>{
  await page.goto('/lernen.html');await openStudy(page);await focusBeach(page);
  await page.locator('[data-draft-text]').fill('forest');
  await page.locator('[data-action="submit"]').click();
  await expect(page.locator('[data-action="next"]')).toBeEnabled();
  await page.locator('[data-action="exit"]').click();
  const original=await workspace(page);
  await openStudy(page);
  await page.locator('[data-study-query]').fill('bike');
  page.once('dialog',dialog=>dialog.dismiss());
  await page.locator('[data-action="practice-concept"][data-concept-id="u1a.vocab.bike"]').click();
  expect((await workspace(page)).session.id).toBe(original.session.id);
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('[data-action="practice-concept"][data-concept-id="u1a.vocab.bike"]').click();
  await expect(page.locator('#exercise-title')).toBeVisible();
  const changed=await workspace(page);
  expect(changed.session.id).not.toBe(original.session.id);
  expect(changed.learner).toEqual(original.learner);
  expect(changed.session.conceptIds).toEqual(['u1a.vocab.bike']);
  await page.reload();
  await page.locator('[data-action="start-learn"]').first().click();
  await expect(page.locator('#exercise-title')).toContainText('Fahrrad');
});
