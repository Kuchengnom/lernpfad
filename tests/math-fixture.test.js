import test from 'node:test';
import assert from 'node:assert/strict';
import fixture from '../fixtures/math-divisibility/curriculum.json' with { type: 'json' };
import { validateCurriculum } from '../app/validation.js';
import { evaluateAnswer, generateSession, newLearner, recordAnswer } from '../app/engine.js';

const course = fixture.curriculum;
const divisors = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a, b) => (a / gcd(a, b)) * b;
const factors = (n) => { const out = []; for (let p = 2; p * p <= n; p += 1) while (n % p === 0) { out.push(p); n /= p; } if (n > 1) out.push(n); return out; };
const numbers = (text) => [...text.matchAll(/\d+/g)].map(([value]) => Number(value));
const sorted = (values) => [...values].map(Number).sort((a, b) => a - b);

function independentlyExpected(exercise) {
  const id = exercise.id;
  if (id === 'math.ex.divisor-66' || id === 'math.ex.divisor-98') {
    const n = Number(id.split('-').at(-1));
    return exercise.choices.filter((choice) => n % Number(choice.text) === 0).map((choice) => choice.id);
  }
  if (id === 'math.ex.pair-85') return exercise.choices.filter((choice) => {
    const [a, b] = numbers(choice.text); return a * b === 85;
  }).map((choice) => choice.id);
  if (id === 'math.ex.factor-77' || id === 'math.ex.factor-91') {
    const [factor, product] = numbers(exercise.prompt);
    return [String(product / factor)];
  }
  if (id === 'math.ex.positive-26') return exercise.choices.filter((choice) => Number(choice.text) > 0 && Number(choice.text) % 26 === 0).map((choice) => choice.id);
  const endRule = /^math\.ex\.end-(2|4|5|8|10|25)$/.exec(id);
  if (endRule) {
    const d = Number(endRule[1]);
    return exercise.choices.filter((choice) => Number(choice.text) % d === 0).map((choice) => choice.id);
  }
  if (id === 'math.ex.sum-rule-3' || id === 'math.ex.sum-rule-9') {
    const d = Number(id.endsWith('-3') ? 3 : 9);
    return exercise.choices.filter((choice) => Number(choice.text) % d === 0).map((choice) => choice.id);
  }
  if (id === 'math.ex.prime-101' || id === 'math.ex.prime-2') return exercise.choices.filter((choice) => { const n = Number(choice.text); return n > 1 && divisors(n).length === 2; }).map((choice) => choice.id);
  if (id.startsWith('math.ex.teilers-')) return divisors(Number(id.split('-').at(-1))).map(String);
  if (id.startsWith('math.ex.multiples-')) { const [n, count] = [Number(id.split('-').at(-1)), id.endsWith('18') ? 4 : id.endsWith('22') ? 3 : 4]; return Array.from({ length: count }, (_, i) => String(n * (i + 1))); }
  if (id === 'math.ex.common-divisors-28-70') return divisors(28).filter((d) => 70 % d === 0).map(String);
  if (id === 'math.ex.common-multiples-4-7') { const first = lcm(4, 7); return Array.from({ length: 3 }, (_, i) => String(first * (i + 1))); }
  if (id.startsWith('math.ex.prime-factors-')) return factors(Number(id.split('-').at(-1))).map(String);
  if (id === 'math.ex.primes-40-50') return Array.from({ length: 11 }, (_, i) => i + 40).filter((n) => n > 1 && divisors(n).length === 2).map(String);
  if (id.startsWith('math.ex.sum-')) return [String([...id.matchAll(/\d/g)].slice(-4).reduce((sum, match) => sum + Number(match[0]), 0))];
  if (id === 'math.ex.missing-end-4') return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => Number(`638${d}`) % 4 === 0).map(String);
  if (id === 'math.ex.missing-sum-3') return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => Number(`42${d}`) % 3 === 0).map(String);
  if (id.startsWith('math.ex.gcd-')) { const [, a, b] = id.match(/gcd-(\d+)-(\d+)/); return [String(gcd(Number(a), Number(b)))]; }
  if (id.startsWith('math.ex.lcm-')) { const [, a, b] = id.match(/(?:lcm|timer)-(\d+)-(\d+)/) ?? []; return [String(lcm(Number(a), Number(b)))]; }
  return null;
}

test('math fixture has the planned eight concepts and forty authored tasks', () => {
  assert.equal(validateCurriculum(fixture), course);
  assert.equal(course.concepts.length, 8);
  assert.equal(course.exercises.length, 40);
  for (const concept of course.concepts) assert.ok(course.exercises.filter((e) => e.conceptIds.includes(concept.id)).length >= 3, concept.id);
  assert.ok(course.exercises.every((e) => e.provenance.every((sourceId) => course.sources.some((source) => source.id === sourceId))));
});

test('every fixture answer and choice distractor is independently recomputed', () => {
  for (const exercise of course.exercises) {
    const expected = independentlyExpected(exercise);
    assert.ok(expected, `missing independent calculation for ${exercise.id}`);
    if (exercise.type === 'choice') {
      assert.deepEqual(exercise.correctChoiceIds, expected, exercise.id);
      assert.equal(expected.length, 1, `${exercise.id} must have one valid choice`);
    } else if (exercise.type === 'numeric-input') assert.deepEqual(sorted(exercise.acceptedValues), sorted(expected), exercise.id);
    else if (exercise.comparison === 'set') assert.deepEqual(sorted(exercise.expectedValues), sorted(expected), exercise.id);
    else if (exercise.comparison === 'sequence') assert.deepEqual(exercise.expectedValues, expected, exercise.id);
    else assert.deepEqual(exercise.expectedValues.slice().sort(), expected.slice().sort(), exercise.id);
  }
});

test('each math concept is reachable after real prerequisite answers', () => {
  let learner = newLearner(course);
  for (const concept of course.concepts) {
    const session = generateSession(course, learner, { conceptIds: [concept.id], length: 8, seed: 1, now: '2026-09-15T10:00:00.000Z' });
    assert.ok(session.exercises.some((exercise) => exercise.conceptIds.includes(concept.id)), concept.id);
    for (const [index, exercise] of session.exercises.entries()) {
      const expected = independentlyExpected(exercise);
      const answer = exercise.type === 'choice' ? exercise.correctChoiceIds[0] : exercise.type === 'numeric-input' ? expected[0] : expected;
      const evaluation = evaluateAnswer(exercise, answer);
      learner = recordAnswer(learner, exercise, { ...evaluation, answerId: `fixture-${concept.id}-${index}`, sessionId: session.id, curriculumId: course.id, curriculumVersion: course.version }, { now: '2026-09-15T10:00:00.000Z' });
    }
  }
});

test('engine evaluates the fixture answer keys via its public math paths', () => {
  for (const exercise of course.exercises) {
    const expected = independentlyExpected(exercise);
    const answer = exercise.type === 'choice' ? exercise.correctChoiceIds[0] : exercise.type === 'numeric-input' ? expected[0] : expected;
    assert.equal(evaluateAnswer(exercise, answer).correct, true, exercise.id);
  }
});
