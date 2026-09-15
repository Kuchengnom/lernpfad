import test from 'node:test';
import assert from 'node:assert/strict';
import Ajv from 'ajv';
import legacy from '../fixtures/unit-1a/curriculum.json' with { type: 'json' };
import curriculumSchema from '../specs/schema/curriculum-v2.schema.json' with { type: 'json' };
import backupSchema from '../specs/schema/backup-v2.schema.json' with { type: 'json' };
import profileSchema from '../specs/schema/profile-v2.schema.json' with { type: 'json' };
import { curriculumPackage, backupPackage, parseImport, validateCurriculum } from '../app/validation.js';
import { CURRENT_PROFILE_VERSION, createProfile, validateProfile, importBook, profilePackage, parseProfilePackage, activeBook, selectBook } from '../app/profile.js';
import { newLearner, generateSession, recordAnswer, completeSession } from '../app/engine.js';
import { expectedAnswer } from '../app/answer-format.js';

const now = '2026-09-14T12:00:00.000Z';
function mathCourse() {
  const base = { conceptIds: ['math.divisors'], difficulty: 1, prompt: 'Löse die Aufgabe.', explanation: 'Prüfe die Faktoren.', provenance: ['source.math'] };
  return {
    id: 'math.contracts', version: '1.0', title: 'Mathe Test', subject: 'math', instructionLanguage: 'de',
    sources: [{ id: 'source.math', kind: 'teacher-note', file: 'test', notes: 'Eigene Testaufgaben.' }],
    concepts: [{ id: 'math.divisors', kind: 'math-skill', label: 'Teiler', learningGoal: 'Teiler bestimmen.', dependsOn: [], provenance: ['source.math'], rule: 'Teile ohne Rest.', examples: ['2 teilt 6.'] }],
    exercises: [
      { ...base, id: 'math.numeric', type: 'numeric-input', numberDomain: 'nonnegative-integer', acceptedValues: ['0', '999999'] },
      { ...base, id: 'math.set', type: 'number-list', numberDomain: 'nonnegative-integer', comparison: 'set', expectedValues: ['1', '2', '7', '14'] },
      { ...base, id: 'math.sequence', type: 'number-list', numberDomain: 'nonnegative-integer', comparison: 'sequence', expectedValues: ['2', '2', '7'] },
      { ...base, id: 'math.multiset', type: 'number-list', numberDomain: 'nonnegative-integer', comparison: 'multiset', expectedValues: ['2', '2', '7'] },
      { ...base, id: 'math.choice', type: 'choice', choices: [{ id: 'choice.yes', text: 'Ja' }, { id: 'choice.no', text: 'Nein' }], correctChoiceIds: ['choice.yes'] },
    ],
  };
}
const workspace = curriculum => ({ curriculum, learner: newLearner(curriculum), session: null, index: 0, feedback: null });
function started(curriculum) {
  const result = workspace(curriculum);
  result.session = generateSession(curriculum, result.learner, { now });
  const e = result.session.exercises[0];
  result.learner = recordAnswer(result.learner, e, { correct: false, selfCheck: false, answerId: 'answer.first', sessionId: result.session.id, curriculumId: curriculum.id, curriculumVersion: curriculum.version }, { now });
  return result;
}

test('legacy, explicit language v2 and math v2 dispatch without rewriting course objects', () => {
  const language = { ...structuredClone(legacy.curriculum), subject: 'language', instructionLanguage: 'de' };
  for (const [course, version] of [[legacy.curriculum, '1.0'], [language, '2.0'], [mathCourse(), '2.0']]) {
    const snapshot = structuredClone(course);
    const packaged = curriculumPackage(course);
    assert.equal(packaged.schemaVersion, version);
    assert.strictEqual(validateCurriculum(packaged), course);
    assert.deepEqual(parseImport(JSON.stringify(packaged)), { curriculum: course, learner: null });
    assert.deepEqual(course, snapshot);
  }
  assert.equal(Object.hasOwn(legacy.curriculum, 'subject'), false);
});

test('math schema excludes linguistic fields/types, requires domain and forbids ambiguous answer modes', () => {
  for (const mutate of [
    c => { c.targetLanguage = 'en'; }, c => { c.sourceLanguage = 'de'; },
    c => { delete c.subject; }, c => { delete c.instructionLanguage; },
    c => { c.instructionLanguage = 'en'; }, c => { c.concepts[0].kind = 'grammar'; },
    c => { delete c.concepts[0].rule; }, c => { delete c.exercises[0].numberDomain; },
    c => { c.exercises[0].numberDomain = 'decimal'; }, c => { c.exercises[1].comparison = 'unordered'; },
    c => { c.exercises[4].correctChoiceIds.push('choice.no'); },
    c => { c.exercises[0] = { ...legacy.curriculum.exercises.find(e => e.type === 'text-input') }; },
  ]) {
    const course = mathCourse(); mutate(course);
    assert.throws(() => validateCurriculum({ schemaVersion: '2.0', kind: 'curriculum', curriculum: course }));
  }
});

test('authored answer keys obey parser bounds and canonical digit strings', () => {
  const invalid = [[], ['1000000'], ['00'], ['02'], [' 2'], ['2 '], ['2.0'], ['2e1'], ['-1'], ['2+2'], [2], [null], [''], Array(21).fill('2')];
  for (const type of ['numeric-input', 'number-list']) {
    for (const values of invalid) {
      const course = mathCourse(), e = course.exercises.find(item => item.type === type);
      e[type === 'numeric-input' ? 'acceptedValues' : 'expectedValues'] = values;
      assert.throws(() => validateCurriculum(curriculumPackage(course)), `${type}: ${JSON.stringify(values)}`);
    }
  }
  const course = mathCourse();
  course.exercises[0].acceptedValues = Array.from({ length: 20 }, (_, i) => String(i));
  assert.equal(validateCurriculum(curriculumPackage(course)), course);
  course.exercises[1].expectedValues = ['2', '2'];
  assert.throws(() => validateCurriculum(curriculumPackage(course)));
  course.exercises[1].comparison = 'sequence';
  assert.equal(validateCurriculum(curriculumPackage(course)), course);
  course.exercises[1].comparison = 'multiset';
  assert.equal(validateCurriculum(curriculumPackage(course)), course);
});

test('single-course backups choose actual contract and keep learner-state.v1', () => {
  for (const course of [legacy.curriculum, mathCourse()]) {
    const learner = started(course).learner;
    const backup = backupPackage(course, learner);
    assert.equal(backup.schemaVersion, course.subject ? '2.0' : '1.0');
    assert.equal(backup.learner.schemaVersion, 'learner-state.v1');
    assert.deepEqual(parseProfilePackage(JSON.stringify(backup)), { curriculum: course, learner });
    assert.throws(() => parseImport(JSON.stringify({ ...backup, schemaVersion: course.subject ? '1.0' : '2.0' })));
    assert.throws(() => parseImport(JSON.stringify({ ...backup, schemaVersion: '3.0' })));
  }
});

test('all published v2 schemas compile independently with no external references', () => {
  const math = mathCourse(), p = createProfile(started(math), now);
  for (const [schema, sample] of [[curriculumSchema, curriculumPackage(math)], [backupSchema, backupPackage(math, newLearner(math))], [profileSchema, p]]) {
    const refs = JSON.stringify(schema).matchAll(/"\$ref":"([^"]+)"/g);
    assert.ok([...refs].every(([, ref]) => ref.startsWith('#')));
    const validate = new Ajv({ strict: false }).compile(schema);
    assert.equal(validate(sample), true, JSON.stringify(validate.errors));
  }
});

test('v1 profile migration is pure, preserves records, completed rounds, active session and stamps', () => {
  const w = workspace(legacy.curriculum);
  const session = generateSession(w.curriculum, w.learner, { now });
  session.exercises.forEach((e, index) => {
    w.learner = recordAnswer(w.learner, e, { correct: e.type === 'writing' ? null : true, selfCheck: e.type === 'writing', answerId: `answer.${index}`, sessionId: session.id, curriculumId: w.curriculum.id, curriculumVersion: w.curriculum.version }, { now });
  });
  w.learner = completeSession(w.learner, session, { now });
  w.session = generateSession(w.curriculum, w.learner, { now });
  const old = createProfile(w, now);
  old.profileVersion = '1.0';
  old.stampAwards = [{ id: 'award.first', stampId: 'fox', earnedAt: now, bookId: old.activeBookId, sessionId: session.id }];
  const snapshot = structuredClone(old), migrated = validateProfile(old);
  assert.equal(CURRENT_PROFILE_VERSION, '2.0');
  assert.deepEqual(migrated, { ...snapshot, profileVersion: '2.0' });
  assert.deepEqual(old, snapshot);
  assert.deepEqual(validateProfile(migrated), migrated);
});

test('mixed profiles preserve legacy identity and restore numeric and list feedback in paused sessions', () => {
  for (const type of ['numeric-input', 'number-list']) {
    const math = mathCourse(), w = workspace(math);
    const e = math.exercises.find(item => item.type === type);
    w.session = { id: `session.${type}`, curriculumId: math.id, curriculumVersion: math.version, exercises: [e], mode: 'learn', startedAt: now };
    w.learner = recordAnswer(w.learner, e, { correct: false, selfCheck: false, answerId: 'answer.first', sessionId: w.session.id, curriculumId: math.id, curriculumVersion: math.version }, { now });
    let p = createProfile(w, now);
    const mathBookId = p.activeBookId;
    p = importBook(p, { curriculum: legacy.curriculum }, now);
    assert.deepEqual(activeBook(p).workspace.curriculum, legacy.curriculum);
    p = selectBook(p, mathBookId);
    const restored = validateProfile(JSON.parse(JSON.stringify(p)));
    assert.deepEqual(restored, p);
    assert.equal(activeBook(restored).workspace.feedback.expectedAnswer, expectedAnswer(e));
    const exported = profilePackage(p), imported = parseProfilePackage(JSON.stringify(exported));
    assert.equal(exported.schemaVersion, '2.0');
    assert.deepEqual(imported.profile, exported.profile);
    assert.deepEqual(imported.profile.books[0].workspace.learner, w.learner);
    assert.equal(imported.profile.books[0].workspace.session, null);
  }
});

test('profile backup versions are matched explicitly; legacy package upgrades and future versions reject', () => {
  const legacyPackage = profilePackage(createProfile(workspace(legacy.curriculum), now));
  legacyPackage.schemaVersion = '1.0'; legacyPackage.profile.profileVersion = '1.0';
  const snapshot = structuredClone(legacyPackage);
  const imported = parseProfilePackage(JSON.stringify(legacyPackage)).profile;
  assert.deepEqual(imported, { ...legacyPackage.profile, profileVersion: '2.0' });
  assert.deepEqual(legacyPackage, snapshot);
  for (const [schemaVersion, profileVersion] of [['1.0', '2.0'], ['2.0', '1.0'], ['3.0', '2.0'], ['2.0', '3.0']]) {
    assert.throws(() => parseProfilePackage(JSON.stringify({ ...legacyPackage, schemaVersion, profile: { ...imported, profileVersion } })));
  }
  const future = { ...imported, profileVersion: '3.0' }, before = structuredClone(future);
  assert.throws(() => validateProfile(future));
  assert.deepEqual(future, before);
  const mixed = importBook(imported, { curriculum: mathCourse() }, now);
  assert.throws(() => validateProfile({ ...mixed, profileVersion: '1.0' }));
});
