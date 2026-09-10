import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeReadiness } from '../app/readiness.js';

const course = (concepts, exercises) => ({ id: 'readiness-course', version: '1.0', concepts, exercises });
const concept = (id, dependsOn = []) => ({ id, dependsOn });
const objective = (id, conceptIds) => ({ id, type: 'choice', conceptIds });
const writing = (id, conceptIds) => ({ id, type: 'writing', conceptIds, selfCheck: true });

test('counts only exercises whose complete prerequisite set is fresh-learner ready', () => {
  const curriculum = course(
    [concept('base'), concept('advanced', ['base'])],
    [objective('base-practice', ['base']), objective('advanced-practice', ['advanced']), writing('advanced-write', ['advanced'])],
  );

  assert.deepEqual(analyzeReadiness(curriculum), {
    availableExerciseCount: 1,
    lockedExerciseCount: 2,
    unreachableConceptIds: [],
    unusedConceptIds: [],
  });
});

test('finds multi-hop concepts unlocked by repeated objective successes', () => {
  const curriculum = course(
    [concept('first'), concept('second', ['first']), concept('third', ['second'])],
    [objective('first-practice', ['first']), objective('second-practice', ['second']), objective('third-practice', ['third'])],
  );

  assert.deepEqual(analyzeReadiness(curriculum).unreachableConceptIds, []);
});

test('does not let playable writing unlock an objective prerequisite', () => {
  const curriculum = course(
    [concept('draft'), concept('published', ['draft'])],
    [writing('draft-writing', ['draft']), objective('published-practice', ['published'])],
  );

  assert.deepEqual(analyzeReadiness(curriculum), {
    availableExerciseCount: 1,
    lockedExerciseCount: 1,
    unreachableConceptIds: ['published'],
    unusedConceptIds: [],
  });
});

test('detects exercise-level cycles created by multi-concept gating despite acyclic concepts', () => {
  const curriculum = course(
    [concept('base'), concept('dependent', ['base'])],
    [objective('combined-practice', ['base', 'dependent'])],
  );

  assert.deepEqual(analyzeReadiness(curriculum), {
    availableExerciseCount: 0,
    lockedExerciseCount: 1,
    unreachableConceptIds: ['base', 'dependent'],
    unusedConceptIds: [],
  });
});

test('reports unused concepts separately and never mutates the curriculum', () => {
  const curriculum = course(
    [concept('practised'), concept('unused')],
    [objective('practice', ['practised'])],
  );
  const before = structuredClone(curriculum);

  assert.deepEqual(analyzeReadiness(curriculum), {
    availableExerciseCount: 1,
    lockedExerciseCount: 0,
    unreachableConceptIds: [],
    unusedConceptIds: ['unused'],
  });
  assert.deepEqual(curriculum, before);
});
