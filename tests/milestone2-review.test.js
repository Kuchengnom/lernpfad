import assert from 'node:assert/strict';
import test from 'node:test';
import { learnerText } from '../app/study-language.js';
import { getReviewItems, newLearner, recordAnswer } from '../app/engine.js';

test('bundled English study copy has German learner-facing text while unknown imports are untouched', () => {
  assert.equal(learnerText('regular simple past'), 'Regelmäßige Verben im Simple Past');
  assert.equal(learnerText('Usually add -ed; change consonant+y to -ied; add -d after final e.'), 'Meist ergänzt du -ed. Nach Konsonant + y wird daraus -ied; nach einem abschließenden e ergänzt du nur -d.');
  assert.equal(learnerText('A parent-authored rule'), 'A parent-authored rule');
});

test('four successes on the same easy exercise remain practice progress, not independent mastery evidence', () => {
  const course = { id: 'review-course', version: '1', concepts: [{ id: 'past', kind: 'grammar', dependsOn: [] }], exercises: [{ id: 'easy', type: 'text-input', conceptIds: ['past'], difficulty: 1, acceptedAnswers: ['went'] }] };
  let learner = newLearner(course);
  for (let index = 0; index < 4; index += 1) learner = recordAnswer(learner, course.exercises[0], { sessionId: `s-${index}`, answerId: `a-${index}`, curriculumId: course.id, curriculumVersion: course.version, correct: true, selfCheck: false }, { now: `2026-09-0${index + 1}T10:00:00.000Z` });
  assert.equal(learner.conceptProgress.past.mastery, 0.8);
  assert.equal(learner.conceptProgress.past.correct, 4);
  assert.equal(new Set(learner.answerRecords.map(record => record.exerciseId)).size, 1, 'the learner has only shown one exercise shape');
});

test('answer-record append order, rather than device-clock order, clears a past mistake', () => {
  const course = { id: 'order-course', version: '1', concepts: [{ id: 'word', kind: 'vocabulary', dependsOn: [] }], exercises: [{ id: 'word-exercise', type: 'text-input', conceptIds: ['word'], difficulty: 1, acceptedAnswers: ['bus'] }] };
  let learner = newLearner(course);
  learner = recordAnswer(learner, course.exercises[0], { sessionId: 'first', answerId: 'wrong', curriculumId: course.id, curriculumVersion: course.version, correct: false, selfCheck: false }, { now: '2026-09-10T12:00:00.000Z' });
  learner = recordAnswer(learner, course.exercises[0], { sessionId: 'second', answerId: 'right', curriculumId: course.id, curriculumVersion: course.version, correct: true, selfCheck: false }, { now: '2026-09-09T12:00:00.000Z' });
  assert.deepEqual(getReviewItems(course, learner, { now: '2026-09-09T13:00:00.000Z' }), []);
});
