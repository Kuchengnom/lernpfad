import assert from 'node:assert/strict';
import test from 'node:test';
import { completeSession, evaluateAnswer, generateSession, getReviewItems, newLearner, recordAnswer } from '../app/engine.js';

const NOW = '2026-09-09T10:00:00.000Z';
const course = {
  id: 'course-1', version: '1.0.0',
  concepts: ['train', 'beach', 'past', 'reading'].map((id) => ({ id, kind: 'vocabulary' })),
  exercises: Array.from({ length: 12 }, (_, index) => {
    const type = ['choice', 'text-input', 'word-tiles', 'reading'][index % 4];
    const base = { id: `ex-${String(index + 1).padStart(2, '0')}`, type, conceptIds: [index === 11 ? 'train' : ['train', 'beach', 'past', 'reading'][index % 4]], difficulty: (index % 3) + 1 };
    if (type === 'choice' || type === 'reading') return { ...base, correctChoiceIds: ['yes'], choices: [{ id: 'yes', text: 'yes' }] };
    if (type === 'word-tiles') return { ...base, correctOrder: ['one', 'two'], tiles: [{ id: 'one', text: 'one' }, { id: 'two', text: 'two' }] };
    return { ...base, acceptedAnswers: ['went home', 'Went   home'] };
  }),
};

test('session is deterministic, unique, bounded, and changes priority after a mistake', () => {
  const learner = newLearner(course);
  const first = generateSession(course, learner, { now: NOW, length: 10 });
  assert.equal(first.exercises.length, 10);
  assert.equal(new Set(first.exercises.map(({ id }) => id)).size, 10);
  assert.deepEqual(first, generateSession(course, learner, { now: NOW, length: 10 }));
  assert.ok(first.exercises.every((exercise, index) => index === 0 || exercise.type !== first.exercises[index - 1].type));

  const missed = recordAnswer(learner, course.exercises[11], { sessionId: 's-mistake', answerId: 'a-mistake', curriculumId: course.id, curriculumVersion: course.version, correct: false, selfCheck: false }, { now: NOW });
  const afterMistake = generateSession(course, missed, { now: NOW, length: 8 });
  assert.ok(afterMistake.exercises[0].conceptIds.includes('train'));
  assert.equal(missed.conceptProgress.train.nextDueAt, NOW);
});

test('objective evaluator uses the authoring keys for each objective type', () => {
  assert.equal(evaluateAnswer(course.exercises[0], 'yes').correct, true);
  assert.equal(evaluateAnswer(course.exercises[0], 'no').correct, false);
  assert.equal(evaluateAnswer(course.exercises[1], ' WENT  HOME ').correct, true);
  assert.equal(evaluateAnswer(course.exercises[2], ['one', 'two']).correct, true);
  assert.equal(evaluateAnswer(course.exercises[2], ['two', 'one']).correct, false);
});

test('one answer updates shared concept mastery once and duplicate answer IDs cannot inflate it', () => {
  let learner = newLearner(course);
  const result = { sessionId: 's-1', answerId: 'a-1', curriculumId: course.id, curriculumVersion: course.version, correct: true, selfCheck: false };
  learner = recordAnswer(learner, course.exercises[0], result, { now: NOW });
  assert.deepEqual(learner.conceptProgress.train, { attempts: 1, correct: 1, incorrect: 0, correctStreak: 1, mastery: 0.2, lastAnsweredAt: NOW, nextDueAt: '2026-09-10T10:00:00.000Z' });
  const duplicate = recordAnswer(learner, course.exercises[11], result, { now: NOW });
  assert.strictEqual(duplicate, learner);
  learner = recordAnswer(learner, course.exercises[11], { ...result, answerId: 'a-2' }, { now: NOW });
  assert.equal(learner.conceptProgress.train.correct, 2);
  assert.equal(learner.conceptProgress.train.mastery, 0.4);
});

test('writing self-check is never objectively correct and cannot raise mastery or XP', () => {
  const writing = { id: 'write-1', type: 'writing', conceptIds: ['past'], selfCheck: true, checklist: [] };
  const evaluated = evaluateAnswer(writing, 'I went to the beach.');
  assert.deepEqual(evaluated, { correct: null, selfCheck: true, selfChecked: false, normalizedAnswer: 'I went to the beach.' });
  const learner = recordAnswer(newLearner(course), writing, { ...evaluated, sessionId: 's-write', answerId: 'a-write', curriculumId: course.id, curriculumVersion: course.version }, { now: NOW });
  assert.equal(learner.conceptProgress.past.mastery, 0);
  assert.equal(learner.conceptProgress.past.correct, 0);
  assert.equal(learner.xp, 0);
});

test('session rewards require every exercise response and are idempotent', () => {
  const session = { id: 's-complete', curriculumId: course.id, curriculumVersion: course.version, exercises: course.exercises.slice(0, 2) };
  let learner = newLearner(course);
  learner = recordAnswer(learner, session.exercises[0], { sessionId: session.id, answerId: 'a-first', curriculumId: course.id, curriculumVersion: course.version, correct: true, selfCheck: false }, { now: NOW });
  assert.strictEqual(completeSession(learner, session, { now: NOW }), learner);
  learner = recordAnswer(learner, session.exercises[1], { sessionId: session.id, answerId: 'a-second', curriculumId: course.id, curriculumVersion: course.version, correct: true, selfCheck: false }, { now: NOW });
  learner = completeSession(learner, session, { now: NOW });
  assert.equal(learner.xp, 10); // 2 * 5 completion XP; retrieval itself is not a reward
  assert.equal(learner.gems, 1);
  assert.equal(learner.sessionCounter, 1);
  assert.strictEqual(completeSession(learner, session, { now: NOW }), learner);
});

test('unseen concepts start easy and prerequisites gate advanced exercises until introduced', () => {
  const adaptive = {
    id: 'adaptive', version: '1',
    concepts: [{ id: 'base', kind: 'grammar', dependsOn: [] }, { id: 'advanced', kind: 'grammar', dependsOn: ['base'] }],
    exercises: [
      { id: 'easy', type: 'text-input', conceptIds: ['base'], difficulty: 1, acceptedAnswers: ['x'] },
      { id: 'hard', type: 'text-input', conceptIds: ['base'], difficulty: 3, acceptedAnswers: ['x'] },
      { id: 'blocked', type: 'text-input', conceptIds: ['advanced'], difficulty: 1, acceptedAnswers: ['x'] },
    ],
  };
  let learner = newLearner(adaptive);
  assert.deepEqual(generateSession(adaptive, learner, { now: NOW }).exercises.map(({ id }) => id), ['easy', 'hard']);
  learner = recordAnswer(learner, adaptive.exercises[0], { sessionId: 'intro', answerId: 'intro-answer', curriculumId: adaptive.id, curriculumVersion: adaptive.version, correct: true, selfCheck: false }, { now: NOW });
  const unlocked = generateSession(adaptive, learner, { now: NOW });
  assert.ok(unlocked.exercises.some(({ id }) => id === 'blocked'));
  assert.strictEqual(completeSession(learner, { id: 'empty', curriculumId: adaptive.id, curriculumVersion: adaptive.version, exercises: [] }, { now: NOW }), learner);
});

test('answer and completion reject a foreign curriculum binding', () => {
  const learner = newLearner(course);
  const session = generateSession(course, learner, { now: NOW });
  assert.equal(session.curriculumId, course.id);
  assert.throws(() => recordAnswer(learner, course.exercises[0], { sessionId: session.id, answerId: 'foreign', curriculumId: 'other', curriculumVersion: course.version, correct: true, selfCheck: false }, { now: NOW }), /different curriculum/);
  assert.throws(() => completeSession(learner, { ...session, curriculumVersion: 'other' }, { now: NOW }), /different curriculum/);
  assert.throws(() => getReviewItems(course, newLearner({ ...course, id: 'other-course' }), { now: NOW }), /different curriculum/);
  assert.throws(() => generateSession(course, newLearner({ ...course, id: 'other-course' }), { now: NOW }), /different curriculum/);
});

test('review items are empty for a fresh learner and ignore writing-only concepts', () => {
  const reviewCourse = {
    ...course,
    concepts: [...course.concepts, { id: 'writing-only', kind: 'writing-skill', dependsOn: [] }],
    exercises: [...course.exercises, { id: 'write-only', type: 'writing', conceptIds: ['writing-only'], selfCheck: true, checklist: [], modelAnswer: 'A sentence.' }],
  };
  let learner = newLearner(reviewCourse);
  assert.deepEqual(getReviewItems(reviewCourse, learner, { now: NOW }), []);
  learner = recordAnswer(learner, reviewCourse.exercises.at(-1), { sessionId: 'writing', answerId: 'writing-answer', curriculumId: reviewCourse.id, curriculumVersion: reviewCourse.version, correct: null, selfCheck: true }, { now: NOW });
  assert.deepEqual(getReviewItems(reviewCourse, learner, { now: NOW }), []);
  const session = generateSession(reviewCourse, learner, { now: NOW, mode: 'review' });
  assert.deepEqual(session.exercises, []);
  assert.deepEqual(session.conceptIds, []);
});

test('a corrected objective error stops being a mistake, while a due retrieval remains reviewable', () => {
  let learner = newLearner(course);
  learner = recordAnswer(learner, course.exercises[11], { sessionId: 'failed', answerId: 'failed-answer', curriculumId: course.id, curriculumVersion: course.version, correct: false, selfCheck: false }, { now: NOW });
  assert.deepEqual(getReviewItems(course, learner, { now: NOW }), [{ conceptId: 'train', reason: 'mistake', lastSeen: NOW, nextDueAt: NOW }]);
  learner = recordAnswer(learner, course.exercises[0], { sessionId: 'fixed', answerId: 'fixed-answer', curriculumId: course.id, curriculumVersion: course.version, correct: true, selfCheck: false }, { now: NOW });
  assert.deepEqual(getReviewItems(course, learner, { now: NOW }), []);
  const dueAt = '2026-09-10T10:00:00.000Z';
  assert.deepEqual(getReviewItems(course, learner, { now: dueAt }), [{ conceptId: 'train', reason: 'due', lastSeen: NOW, nextDueAt: dueAt }]);
});

test('review and concept-focused sessions never add unrelated filler and stay deterministic', () => {
  let learner = newLearner(course);
  learner = recordAnswer(learner, course.exercises[11], { sessionId: 'review', answerId: 'review-answer', curriculumId: course.id, curriculumVersion: course.version, correct: false, selfCheck: false }, { now: NOW });
  const review = generateSession(course, learner, { now: NOW, mode: 'review', seed: 'focused' });
  assert.ok(review.exercises.length > 0 && review.exercises.length < 8);
  assert.ok(review.exercises.every((exercise) => exercise.conceptIds.includes('train')));
  assert.deepEqual(review, generateSession(course, learner, { now: NOW, mode: 'review', seed: 'focused' }));
  const focused = generateSession(course, learner, { now: NOW, conceptIds: ['train'], seed: 'learn-focused' });
  assert.deepEqual(focused.conceptIds, ['train']);
  assert.ok(focused.exercises.every((exercise) => exercise.conceptIds.includes('train')));
  assert.throws(() => generateSession(course, learner, { now: NOW, conceptIds: ['unknown'] }), /unknown concept/);
  assert.throws(() => generateSession(course, learner, { now: NOW, conceptIds: 'train' }), /must be an array/);
  assert.throws(() => generateSession(course, learner, { now: NOW, mode: 'anything' }), /must be learn or review/);
});

test('review excludes self-check writing even when it shares an eligible objective concept', () => {
  const sharedWriting = {
    ...course,
    exercises: [...course.exercises, { id: 'train-writing', type: 'writing', conceptIds: ['train'], selfCheck: true, checklist: [], modelAnswer: 'I travelled by train.' }],
  };
  let learner = newLearner(sharedWriting);
  learner = recordAnswer(learner, sharedWriting.exercises[11], { sessionId: 'missed-train', answerId: 'missed-train-answer', curriculumId: sharedWriting.id, curriculumVersion: sharedWriting.version, correct: false, selfCheck: false }, { now: NOW });
  const review = generateSession(sharedWriting, learner, { now: NOW, mode: 'review' });
  assert.ok(review.exercises.length > 0);
  assert.ok(review.exercises.every((exercise) => exercise.type !== 'writing' && exercise.conceptIds.includes('train')));
});
