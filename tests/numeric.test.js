import assert from 'node:assert/strict';
import test from 'node:test';
import { checkNumberList, checkNumericInput, parseNumberListField, parseNumericField, validateAuthorValues } from '../app/numeric.js';

test('004 equals 4', () => {
  assert.deepEqual(parseNumericField('004'), { ok: true, value: 4 });
  assert.deepEqual(parseNumericField(' 004 '), { ok: true, value: 4 });
});

test('rejected input forms are input problems, not wrong answers', () => {
  assert.equal(parseNumericField('').reason, 'empty');
  assert.equal(parseNumericField('   ').reason, 'empty');
  assert.equal(parseNumericField('4abc').reason, 'non-digit');
  assert.equal(parseNumericField('4.5').reason, 'non-digit');
  assert.equal(parseNumericField('4,5').reason, 'non-digit');
  assert.equal(parseNumericField('2+2').reason, 'non-digit');
  assert.equal(parseNumericField('4/1').reason, 'non-digit');
  assert.equal(parseNumericField('4e2').reason, 'non-digit');
  assert.equal(parseNumericField('1E3').reason, 'non-digit');
  assert.equal(parseNumericField('-4').reason, 'non-digit');
  assert.equal(parseNumericField('a'.repeat(33)).reason, 'too-long');
});

test('numeric-input accepts every alternative correct value, not just the first', () => {
  assert.equal(checkNumericInput('3', ['3', '9']).correct, true);
  assert.equal(checkNumericInput('9', ['3', '9']).correct, true);
  assert.equal(checkNumericInput('009', ['3', '9']).correct, true);
  assert.equal(checkNumericInput('7', ['3', '9']).correct, false);
  assert.equal(checkNumericInput('4abc', ['3', '9']).invalid, true);
  assert.equal(checkNumericInput('4abc', ['3', '9']).reason, 'non-digit');
});

test('boundary values 0, 999999 and 1000000', () => {
  assert.deepEqual(parseNumericField('0'), { ok: true, value: 0 });
  assert.deepEqual(parseNumericField('999999'), { ok: true, value: 999999 });
  assert.equal(parseNumericField('1000000').reason, 'out-of-range');
});

test('set comparison: divisors of 14 in any order', () => {
  assert.equal(checkNumberList(['1', '2', '7', '14'], ['1', '2', '7', '14'], 'set').correct, true);
  assert.equal(checkNumberList(['14', '7', '2', '1'], ['1', '2', '7', '14'], 'set').correct, true);
  assert.equal(checkNumberList(['1', '2', '7'], ['1', '2', '7', '14'], 'set').correct, false);
  assert.equal(checkNumberList(['1', '2', '7', '14', '3'], ['1', '2', '7', '14'], 'set').correct, false);
});

test('set comparison rejects duplicates as an input problem before grading', () => {
  const result = checkNumberList(['2', '02', '7', '14'], ['1', '2', '7', '14'], 'set');
  assert.equal(result.invalid, true);
  assert.equal(result.reason, 'duplicate-values');
});

test('sequence comparison: first five positive multiples of 4, order enforced, 0 excluded', () => {
  const expected = ['4', '8', '12', '16', '20'];
  assert.equal(checkNumberList(['4', '8', '12', '16', '20'], expected, 'sequence').correct, true);
  assert.equal(checkNumberList(['8', '4', '12', '16', '20'], expected, 'sequence').correct, false);
  assert.equal(checkNumberList(['0', '4', '8', '12', '16'], expected, 'sequence').correct, false);
});

test('multiset comparison: prime factors of 28 preserve repeats regardless of order', () => {
  const expected = ['2', '2', '7'];
  assert.equal(checkNumberList(['2', '2', '7'], expected, 'multiset').correct, true);
  assert.equal(checkNumberList(['7', '2', '2'], expected, 'multiset').correct, true);
  assert.equal(checkNumberList(['4', '7'], expected, 'multiset').correct, false);
  assert.equal(checkNumberList(['2', '7'], expected, 'multiset').correct, false);
});

test('canonicalisation before comparing: 02 and 2 are the same number', () => {
  assert.equal(checkNumberList(['02', '7', '2'], ['2', '2', '7'], 'multiset').correct, true);
});

test('empty list, whitespace-only entries, and 21 entries are input problems', () => {
  assert.equal(parseNumberListField([]).reason, 'empty');
  assert.equal(parseNumberListField(['   ']).reason, 'empty');
  assert.equal(parseNumberListField(Array.from({ length: 21 }, (_, i) => String(i))).reason, 'too-many-entries');
  assert.equal(checkNumberList([], ['1'], 'set').invalid, true);
  assert.equal(checkNumberList(['   '], ['1'], 'set').invalid, true);
});

test('invalid syntax inside a list bubbles up the specific reason', () => {
  assert.equal(checkNumberList(['4', '4.5'], ['4', '5'], 'sequence').reason, 'non-digit');
});

test('unknown comparison mode is a programming error, not a grading outcome', () => {
  assert.throws(() => checkNumberList(['1'], ['1'], 'bogus'), TypeError);
});

test('author solutions must obey the same limits as the input they are graded against', () => {
  assert.equal(validateAuthorValues(['1', '2', '7', '14']).ok, true);
  assert.equal(validateAuthorValues([]).reason, 'empty');
  assert.equal(validateAuthorValues(Array.from({ length: 21 }, (_, i) => String(i))).reason, 'too-many-entries');
  assert.equal(validateAuthorValues(['004']).reason, 'non-canonical');
  assert.equal(validateAuthorValues(['1000000']).reason, 'out-of-range');
  assert.equal(validateAuthorValues(['999999']).ok, true);
});
