import test from 'node:test';
import assert from 'node:assert/strict';
import coursePackage from '../fixtures/math-divisibility/curriculum.json' with { type: 'json' };
import { evaluateAnswer, newLearner, recordAnswer } from '../app/engine.js';

const course = coursePackage.curriculum;
const exercise = id => course.exercises.find(item => item.id === id);

test('engine grades numeric and all three list comparisons', () => {
  const cases = [
    ['math.ex.factor-77', '7', true],
    ['math.ex.teilers-22', ['22', '11', '2', '1'], true],
    ['math.ex.multiples-18', ['18', '36', '54', '72'], true],
    ['math.ex.prime-factors-84', ['7', '2', '2', '3'], true],
  ];
  for (const [id, answer, correct] of cases) assert.equal(evaluateAnswer(exercise(id), answer).correct, correct, id);
});

test('invalid math syntax is returned before recordAnswer can change attempts', () => {
  const item = exercise('math.ex.factor-77');
  const learner = newLearner(course);
  const result = evaluateAnswer(item, '4abc');
  assert.deepEqual(result, { invalid: true, reason: 'non-digit' });
  const afterSubmit = result.invalid ? learner : recordAnswer(learner, item, result);
  assert.deepEqual(afterSubmit, learner);
});
