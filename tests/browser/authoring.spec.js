import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
import french from '../../fixtures/french-smoke/curriculum.json' with {type:'json'};
import schema from '../../specs/schema/curriculum.schema.json' with {type:'json'};
const library=page=>page.locator('[data-view="library"]:visible').first().click();
const downloadText=async(page,action)=>{
  const ready=page.waitForEvent('download');await page.locator(`[data-action="${action}"]`).click();
  return readFile(await (await ready).path(),'utf8');
};

test('authoring guide supplies the selected prompt with exact schema, working clipboard, downloads and offline fallback',async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/lernen.html');await library(page);await page.getByRole('button',{name:'Lernstoff erstellen'}).click();
  await expect(page.locator('[data-authoring-language]')).toHaveValue('fr');
  const prompt=await page.locator('[data-authoring-prompt]').inputValue();
  expect(prompt).toContain('targetLanguage: "fr"');expect(prompt).not.toContain('{{TARGET_');
  expect(JSON.parse(prompt.split('```json\n').at(-1).split('\n```')[0])).toEqual(schema);
  await page.locator('[data-action="copy-authoring"]').click();
  await expect(page.getByText(/Anweisung mit Schema kopiert/)).toBeVisible();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(prompt);
  expect(await downloadText(page,'download-authoring')).toBe(prompt);
  expect(JSON.parse(await downloadText(page,'download-schema'))).toEqual(schema);
  await page.locator('[data-authoring-language]').selectOption('en');
  await expect(page.locator('[data-authoring-language]')).toBeFocused();
  expect(await page.locator('[data-authoring-prompt]').inputValue()).toContain('targetLanguage: "en"');
  await page.locator('[data-authoring-language]').selectOption('fr');
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:'experiment/evidence/authoring-guide-mobile.png',fullPage:true});
  await page.evaluate(()=>navigator.serviceWorker.ready);await context.setOffline(true);await page.reload();
  await library(page);await page.getByRole('button',{name:'Lernstoff erstellen'}).click();
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('Unavailable');}},configurable:true});});
  await page.locator('[data-action="copy-authoring"]').click();
  await expect(page.getByText(/Die Anweisung ist unten markiert/)).toBeVisible();
  await expect(page.locator('[data-authoring-prompt]')).toBeFocused();
  expect(await page.locator('[data-authoring-prompt]').evaluate(e=>e.selectionEnd-e.selectionStart)).toBe(prompt.length);
});

test('French file imports and all five exercise types complete with French language metadata and portable progress',async({page})=>{
  await page.goto('/lernen.html');await library(page);
  await page.locator('[data-import-file]').setInputFiles({name:'franzoesisch.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(french))});
  await expect(page.getByText(/Deutsch → Französisch/)).toBeVisible();
  await page.locator('[data-action="confirm-import"]').click();
  await page.locator('[data-action="start-learn"]').first().click();
  await expect(page.locator('#exercise-title')).toBeVisible();
  const types=new Set();
  while(await page.locator('#exercise-title').count()){
    const prompt=await page.locator('#exercise-title').innerText();
    const exercise=french.curriculum.exercises.find(e=>e.prompt===prompt);types.add(exercise.type);
    if(exercise.type==='choice'||exercise.type==='reading'){
      await expect(page.locator('.choices')).toHaveAttribute('lang','fr');
      if(exercise.type==='reading') await expect(page.locator('.reading-passage')).toHaveAttribute('lang','fr');
      await page.locator(`[data-choice="${exercise.correctChoiceIds[0]}"]`).click();
    }else if(exercise.type==='text-input'){
      await expect(page.locator('[data-draft-text]')).toHaveAttribute('lang','fr');
      await page.locator('[data-draft-text]').fill('l’été'.normalize('NFD'));
    }else if(exercise.type==='word-tiles'){
      await expect(page.locator('.tiles')).toHaveAttribute('lang','fr');
      for(const id of exercise.correctOrder) await page.locator(`[data-tile="${id}"]`).click();
    }else{
      await expect(page.getByText('Dein Satz auf Französisch')).toBeVisible();
      await expect(page.locator('textarea')).toHaveAttribute('lang','fr');
      await page.locator('textarea').fill("Je m'appelle Camille.");
    }
    await page.locator('[data-action="submit"]').click();
    if(exercise.type==='writing'){
      await expect(page.locator('.model-answer')).toHaveAttribute('lang','fr');
      await page.locator('[data-action="self-check"]').click();
    }else await expect(page.getByText('Das stimmt.',{exact:true})).toBeVisible();
    await page.locator('[data-action="next"]').click();
    await expect(page.getByRole('heading',{name:prompt,exact:true})).toHaveCount(0);
  }
  expect(types.size).toBe(5);await expect(page.getByText('Etappe geschafft',{exact:true})).toBeVisible();
  await page.reload();await library(page);
  const backup=JSON.parse(await downloadText(page,'export-backup'));
  expect(backup.curriculum.targetLanguage).toBe('fr');expect(backup.learner.answerRecords).toHaveLength(5);expect(backup.learner.xp).toBe(25);
  await page.locator('[data-view="study"]:visible').first().click();
  await page.locator('[data-study-query]').fill('Sommer');
  await expect(page.locator('.vocabulary-pair [lang="fr"]')).toContainText("l'été");
});
