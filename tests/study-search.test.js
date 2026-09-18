import assert from 'node:assert/strict';
import test from 'node:test';
import { foldForSearch } from '../app/study-language.js';

const finds = (query, text) => foldForSearch(text).includes(foldForSearch(query));

test('looking up a word works without reproducing its accents', () => {
  assert.ok(finds('ete', "l'été"));
  assert.ok(finds('été', "l'été"));
  assert.ok(finds('Cafe', 'le café'));
});

test('ß and ss are interchangeable when searching', () => {
  assert.ok(finds('regelmassige', 'Regelmäßige Verben im Simple Past'));
  assert.ok(finds('regelmässige', 'Regelmäßige Verben im Simple Past'));
  assert.ok(finds('Regelmäßige', 'Regelmäßige Verben im Simple Past'));
});

test('folding does not turn the search into a match-anything', () => {
  assert.ok(!finds('xyz', 'bike'));
  assert.ok(!finds('beach', 'bike'));
});
