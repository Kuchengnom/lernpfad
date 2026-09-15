import test from 'node:test';
import assert from 'node:assert/strict';
import fixture from '../fixtures/unit-1a/curriculum.json' with { type: 'json' };
import french from '../fixtures/french-smoke/curriculum.json' with { type: 'json' };
import { newLearner, generateSession, recordAnswer } from '../app/engine.js';
import { backupPackage } from '../app/validation.js';
import { createProfile, activeBook, updateActiveBook, selectBook, renameBook, importBook, previewBookImport, profilePackage, parseProfilePackage, validateProfile, MAX_PROFILE_BYTES } from '../app/profile.js';

const now = '2026-09-12T12:00:00.000Z';
const course = fixture.curriculum;
const copy = value => structuredClone(value);
const workspace = (curriculum = course) => ({ curriculum, learner: newLearner(curriculum), session: null, index: 0, feedback: null });
function started() {
  const result = workspace();
  result.session = generateSession(course, result.learner, { now });
  const exercise = result.session.exercises[0];
  result.learner = recordAnswer(result.learner, exercise, { correct: false, selfCheck: false, answerId: 'answer-1', sessionId: result.session.id, curriculumId: course.id, curriculumVersion: course.version }, { now });
  result.feedback = { correct: true, selfCheck: false, expectedAnswer: 'untrusted answer', explanation: 'untrusted explanation' };
  return result;
}

test('legacy migration preserves all learner records and reconstructs feedback without inventing stamps', () => {
  const old = started();
  const snapshot = copy(old);
  const profile = createProfile(old, now);
  const book = activeBook(profile);
  assert.deepEqual(old, snapshot);
  assert.deepEqual(book.workspace.learner, old.learner);
  assert.equal(book.importedAt, now);
  assert.match(book.id, /^[0-9a-f-]{36}$/);
  assert.equal(book.workspace.feedback.correct, false);
  assert.notEqual(book.workspace.feedback.expectedAnswer, 'untrusted answer');
  assert.deepEqual(profile.stampAwards, []);
});

test('switch and rename retain independent progress, session state, stable identities and collection', () => {
  const profile = createProfile(started(), now);
  const original = copy(profile);
  const first = activeBook(profile);
  const withFrench = importBook(profile, { curriculum: french.curriculum }, now);
  assert.equal(withFrench.books.length, 2);
  assert.notEqual(withFrench.activeBookId, first.id);
  assert.deepEqual(activeBook(withFrench).workspace.learner, newLearner(french.curriculum));
  const renamed = renameBook(withFrench, first.id, '  Mein Englischbuch  ');
  const selected = selectBook(renamed, first.id);
  assert.equal(activeBook(selected).title, 'Mein Englischbuch');
  assert.deepEqual(activeBook(selected).workspace, first.workspace);
  assert.deepEqual(profile, original);
  assert.throws(() => selectBook(profile, 'missing'), /nicht/);
  assert.throws(() => renameBook(profile, first.id, '  '), /Titel/);
});

test('identical curriculum import opens existing book, including reordered JSON keys, without losing learner data', () => {
  const profile = createProfile(started(), now);
  const reversed = Object.fromEntries(Object.entries(course).reverse());
  assert.deepEqual(previewBookImport(profile, { curriculum: reversed }), { action: 'open', targetBookId: profile.activeBookId });
  assert.deepEqual(importBook(profile, { curriculum: reversed }, now), profile);
  assert.equal(importBook(importBook(profile, { curriculum: course }, now), { curriculum: course }, now).books.length, 1);
});

test('same version with changed answer semantics refuses even a backup; new version adds independently', () => {
  const profile = createProfile(started(), now);
  const revised = copy(course);
  revised.exercises[0].explanation += ' Updated.';
  assert.throws(() => importBook(profile, { curriculum: revised }, now), /curriculum.version/);
  assert.throws(() => importBook(profile, { curriculum: revised, learner: newLearner(revised) }, now), /curriculum.version/);
  revised.version = '2.0';
  const next = importBook(profile, { curriculum: revised }, now);
  assert.equal(next.books.length, 2);
  assert.deepEqual(next.books[0], profile.books[0]);
  assert.equal(activeBook(next).workspace.learner.answerRecords.length, 0);
});

test('single-course backup replacement changes only its matching book after preview', () => {
  let profile = createProfile(started(), now);
  profile = importBook(profile, { curriculum: french.curriculum }, now);
  const original = copy(profile);
  const imported = { curriculum: course, learner: newLearner(course) };
  assert.deepEqual(previewBookImport(profile, imported), { action: 'replace', targetBookId: profile.books[0].id });
  assert.deepEqual(profile, original);
  const replaced = importBook(profile, imported, now);
  assert.deepEqual(replaced.books[1], original.books[1]);
  assert.equal(replaced.books[0].id, original.books[0].id);
  assert.equal(replaced.books[0].importedAt, original.books[0].importedAt);
  assert.equal(replaced.books[0].workspace.session, null);
  assert.deepEqual(replaced.books[0].workspace.learner, imported.learner);
});

test('active workspace update persists only the active book and forbids curriculum replacement', () => {
  let profile = createProfile(workspace(french.curriculum), now);
  profile = importBook(profile, { curriculum: course }, now);
  const updated = updateActiveBook(profile, started());
  assert.deepEqual(updated.books[0], profile.books[0]);
  assert.equal(activeBook(updated).workspace.learner.answerRecords.length, 1);
  assert.throws(() => updateActiveBook(profile, workspace(french.curriculum)), /Version/);
});

test('full profile portable backup retains books, progress, titles and stamps, excludes unfinished interaction', () => {
  let profile = createProfile(started(), now);
  profile = importBook(profile, { curriculum: french.curriculum }, now);
  profile.stampAwards = [{ id: 'award-one', stampId: 'fox', earnedAt: now, bookId: profile.books[0].id, sessionId: 'historic-session' }];
  const snapshot = copy(profile);
  const exported = profilePackage(profile);
  assert.equal(exported.kind, 'profile-backup');
  for (const book of exported.profile.books) {
    assert.equal(book.workspace.session, null);
    assert.equal(book.workspace.feedback, null);
    assert.equal(book.workspace.index, 0);
  }
  assert.deepEqual(exported.profile.books[0].workspace.learner, profile.books[0].workspace.learner);
  assert.deepEqual(parseProfilePackage(JSON.stringify(exported)), { profile: exported.profile });
  assert.deepEqual(profile, snapshot);
});

test('existing curriculum and backup formats remain accepted through the profile parser', () => {
  assert.deepEqual(parseProfilePackage(JSON.stringify(fixture)), { curriculum: course, learner: null });
  const learner = started().learner;
  assert.deepEqual(parseProfilePackage(JSON.stringify(backupPackage(course, learner))), { curriculum: course, learner });
});

test('malformed packages, unsupported versions, unknown properties and oversize payloads reject', () => {
  const valid = profilePackage(createProfile(workspace(), now));
  assert.throws(() => parseProfilePackage('{'), /JSON/);
  assert.throws(() => parseProfilePackage(JSON.stringify({ ...valid, schemaVersion: '3.0' })), /Format/);
  assert.throws(() => parseProfilePackage(JSON.stringify({ ...valid, extra: true })), /Format/);
  assert.throws(() => parseProfilePackage(' '.repeat(MAX_PROFILE_BYTES + 1)), /groß/);
  assert.throws(() => parseProfilePackage(JSON.stringify(fixture) + ' '.repeat(5 * 1024 * 1024)), /groß/);
});

test('all profile books are validated, including inactive learners and duplicate course identities', () => {
  const profile = importBook(createProfile(workspace(), now), { curriculum: french.curriculum }, now);
  for (const mutate of [
    p => { p.books[0].workspace.learner.xp = 99; },
    p => { p.books[1].id = p.books[0].id; },
    p => { p.books.push(copy(p.books[0])); p.books[2].id = 'different-local-id'; },
    p => { p.activeBookId = 'missing'; },
    p => { p.books[0].importedAt = '2026-02-30T12:00:00.000Z'; },
    p => { p.books[0].workspace.draft = 'private typed answer'; },
    p => { p.books[0].title = ' '; },
  ]) {
    const tampered = copy(profile); mutate(tampered);
    assert.throws(() => validateProfile(tampered));
  }
});

test('session restore rejects unknown exercises and skipped answers, restores canonical content and rest state', () => {
  const profile = createProfile(started(), now);
  const tampered = JSON.parse(JSON.stringify(profile));
  activeBook(tampered).workspace.session.exercises[0].explanation = 'forged';
  activeBook(tampered).workspace.session.restAcknowledged = true;
  activeBook(tampered).workspace.session.resting = false;
  const restored = activeBook(validateProfile(tampered)).workspace;
  assert.notEqual(restored.session.exercises[0].explanation, 'forged');
  assert.equal(restored.session.restAcknowledged, true);
  for (const mutate of [
    w => { w.session.exercises[0].id = 'missing-exercise'; },
    w => { w.index = 2; },
    w => { w.session.id = '__proto__'; },
    w => { w.session.curriculumVersion = 'unrelated'; },
    w => { w.session.startedAt = '2026-02-30T12:00:00.000Z'; },
  ]) {
    const invalid = copy(profile); mutate(activeBook(invalid).workspace);
    assert.throws(() => validateProfile(invalid));
  }
});

test('collection rejects unknown artwork, image bytes, duplicate awards and invalid dates', () => {
  const profile = createProfile(workspace(), now);
  const award = { id: 'award-one', stampId: 'fox', earnedAt: now, bookId: profile.activeBookId, sessionId: 'session-one' };
  for (const awards of [
    [{ ...award, stampId: 'untrusted-artwork' }],
    [{ ...award, image: 'data:image/png;base64,AAA' }],
    [award, award],
    [award, { ...award, id: 'award-two' }],
    [award, { ...award, id: 'award-two', bookId: 'another-book', sessionId: 'another-session' }],
    [{ ...award, earnedAt: '2026-02-30T12:00:00.000Z' }],
  ]) assert.throws(() => validateProfile({ ...profile, stampAwards: awards }));
});

test('library limit refuses another book before mutating existing progress', () => {
  const profile = createProfile(workspace(french.curriculum), now);
  const book = profile.books[0];
  profile.books = Array.from({ length: 50 }, (_, index) => {
    const c = { ...french.curriculum, id: `course-${index}` };
    return { ...book, id: `book-${index}`, workspace: workspace(c) };
  });
  profile.activeBookId = 'book-0';
  assert.equal(validateProfile(profile).books.length, 50);
  const snapshot = copy(profile);
  assert.throws(() => importBook(profile, { curriculum: course }, now), /50/);
  assert.deepEqual(profile, snapshot);
});
