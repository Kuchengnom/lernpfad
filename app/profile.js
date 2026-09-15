import profileSchema from '../specs/schema/profile.schema.json' with { type: 'json' };
import profileV2Schema from '../specs/schema/profile-v2.schema.json' with { type: 'json' };
import { ajv, curriculumPackage, parseImport, validateCurriculum, validateLearner } from './validation.js';
import { newLearner } from './engine.js';
import { expectedAnswer } from './answer-format.js';

export const CURRENT_PROFILE_VERSION = '2.0';
export const MAX_PROFILE_BYTES = 25 * 1024 * 1024;
const MAX_BOOKS = 50; // ponytail: only used in this module, no longer exported
const legacyShape = ajv.compile(profileSchema);
const shape = ajv.compile(profileV2Schema);
const workspaceShape = ajv.compile({ $ref: `${profileV2Schema.$id}#/$defs/workspace` });
const legacyPackageShape = ajv.compile({ $ref: `${profileSchema.$id}#/$defs/package` });
const packageShape = ajv.compile({ $ref: `${profileV2Schema.$id}#/$defs/package` });
const fail = message => { throw new Error(message); };
const unique = values => new Set(values).size === values.length;
const canonical = value => JSON.stringify(sortKeys(value));
function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortKeys(value[key])]));
  return value;
}
function checkShape(validator, value) {
  if (!validator(value)) fail(`Die Bibliothek passt nicht zum unterstützten Format: ${(validator.errors ?? []).slice(0, 3).map(e => `${e.instancePath || '/'} ${e.message}`).join('; ')}.`);
}
function checkDate(value) {
  if (!Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) fail('Die Bibliothek enthält eine ungültige Zeitangabe.');
}
function timestamp(now = new Date()) {
  const value = new Date(now).toISOString();
  checkDate(value);
  return value;
}
// Session content and feedback are reconstructed from the validated course and
// durable answer records. Stored feedback is never accepted as grading evidence.
function safeWorkspace(workspace) {
  checkShape(workspaceShape, workspace);
  const curriculum = validateCurriculum(curriculumPackage(workspace.curriculum));
  const learner = validateLearner(workspace.learner, curriculum);
  const { session, index } = workspace;
  if (!session) {
    if (index !== 0) fail('Eine Bibliothek ohne laufende Runde muss bei Aufgabe 0 beginnen.');
    return { curriculum, learner, session: null, index: 0, feedback: null };
  }
  checkDate(session.startedAt);
  if (session.curriculumId !== curriculum.id || session.curriculumVersion !== curriculum.version || learner.completedSessionIds.includes(session.id)) fail('Die gespeicherte Runde gehört nicht zu diesem offenen Lernbuch.');
  const exerciseIds = session.exercises.map(e => e.id);
  if (!unique(exerciseIds) || index >= exerciseIds.length) fail('Die gespeicherte Runde enthält doppelte Aufgaben oder eine ungültige Position.');
  const exercises = exerciseIds.map(id => curriculum.exercises.find(e => e.id === id));
  if (exercises.some(e => !e) || session.conceptIds?.some(id => !curriculum.concepts.some(c => c.id === id))) fail('Die gespeicherte Runde verweist auf unbekannten Lernstoff.');
  if (session.mode === 'review' && exercises.some(e => e.type === 'writing')) fail('Eine Wiederholung darf keine unbewertete Schreibaufgabe enthalten.');
  const records = learner.answerRecords.filter(a => a.sessionId === session.id);
  if (records.some(a => !exerciseIds.includes(a.exerciseId)) || exerciseIds.slice(0, index).some(id => !records.some(a => a.exerciseId === id)) || exerciseIds.slice(index + 1).some(id => records.some(a => a.exerciseId === id))) fail('Die gespeicherte Rundenposition stimmt nicht mit den Antworten überein.');
  const current = exercises[index];
  const answer = records.find(a => a.exerciseId === current.id);
  const feedback = answer ? { correct: answer.correct, selfCheck: answer.selfCheck, expectedAnswer: expectedAnswer(current), explanation: current.explanation } : null;
  return { curriculum, learner, session: { ...session, exercises }, index, feedback };
}

function portable(profile) {
  return { schemaVersion: CURRENT_PROFILE_VERSION, kind: 'profile-backup', profile: { ...profile, books: profile.books.map(book => ({ ...book, workspace: { curriculum: book.workspace.curriculum, learner: book.workspace.learner, session: null, index: 0, feedback: null } })) } };
}
function checkSize(profile) {
  // Match the human-readable export, including its envelope and whitespace.
  if (new TextEncoder().encode(JSON.stringify(portable(profile), null, 2)).length > MAX_PROFILE_BYTES) fail('Die Bibliothek ist zu groß. Vollständige Sicherungen dürfen höchstens 25 MB enthalten.');
}

/** Validate every book, including inactive books; return safe restored state. */
export function validateProfile(profile) {
  checkShape(profile?.profileVersion === '1.0' ? legacyShape : shape, profile);
  checkSize(profile);
  if (!unique(profile.books.map(book => book.id))) fail('Die Bibliothek enthält doppelte Lernbuch-IDs.');
  if (!unique(profile.books.map(book => canonical([book.workspace.curriculum.id, book.workspace.curriculum.version])))) fail('Die Bibliothek enthält dieselbe Lernstoff-Version mehrfach.');
  if (!profile.books.some(book => book.id === profile.activeBookId)) fail('Das ausgewählte Lernbuch fehlt in der Bibliothek.');
  if (!unique(profile.stampAwards.map(award => award.id)) || !unique(profile.stampAwards.map(award => award.stampId))) fail('Ein Stempel wurde mehrfach gespeichert.');
  for (const award of profile.stampAwards) checkDate(award.earnedAt);
  return { ...profile, profileVersion: CURRENT_PROFILE_VERSION, books: profile.books.map(book => {
    checkDate(book.importedAt);
    return { ...book, workspace: safeWorkspace(book.workspace) };
  }) };
}

export function createProfile(workspace, now) {
  const safe = safeWorkspace(workspace);
  const id = crypto.randomUUID();
  return validateProfile({ profileVersion: CURRENT_PROFILE_VERSION, activeBookId: id, books: [{ id, title: safe.curriculum.title, importedAt: timestamp(now), workspace: safe }], stampAwards: [] });
}

export function activeBook(profile) {
  const book = profile.books.find(item => item.id === profile.activeBookId);
  if (!book) fail('Das ausgewählte Lernbuch fehlt in der Bibliothek.');
  return book;
}

export function updateActiveBook(profile, workspace) {
  const previous = activeBook(profile);
  if (canonical(previous.workspace.curriculum) !== canonical(workspace.curriculum)) fail('Lernstoffänderungen müssen als eigene Version importiert werden.');
  return validateProfile({ ...profile, books: profile.books.map(book => book.id === profile.activeBookId ? { ...book, workspace } : book) });
}

export function selectBook(profile, id) {
  if (!profile.books.some(book => book.id === id)) fail('Dieses Lernbuch ist nicht in der Bibliothek.');
  return validateProfile({ ...profile, activeBookId: id });
}

export function renameBook(profile, id, title) {
  if (!profile.books.some(book => book.id === id)) fail('Dieses Lernbuch ist nicht in der Bibliothek.');
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 200) fail('Bitte gib einen Lernbuch-Titel mit 1 bis 200 Zeichen ein.');
  return validateProfile({ ...profile, books: profile.books.map(book => book.id === id ? { ...book, title: title.trim() } : book) });
}

/** Pure preview classification; applying a replacement is the caller's explicit confirmation step. */
export function previewBookImport(profile, { curriculum, learner }) {
  validateCurriculum(curriculumPackage(curriculum));
  if (learner != null) validateLearner(learner, curriculum);
  const match = profile.books.find(book => book.workspace.curriculum.id === curriculum.id && book.workspace.curriculum.version === curriculum.version);
  if (match && canonical(match.workspace.curriculum) !== canonical(curriculum)) fail('Dieser Lernstoff wurde bei gleicher ID und Version verändert. Bitte erhöhe curriculum.version und importiere die neue Version als eigenes Lernbuch. Dein bisheriger Lernstand bleibt erhalten.');
  if (!match && profile.books.length >= MAX_BOOKS) fail('Die Bibliothek enthält bereits 50 Lernbücher.');
  return { action: match ? learner != null ? 'replace' : 'open' : 'add', targetBookId: match?.id ?? null };
}

export function importBook(profile, imported, now) {
  const { action, targetBookId } = previewBookImport(profile, imported);
  if (action === 'open') return selectBook(profile, targetBookId);
  const workspace = { curriculum: imported.curriculum, learner: imported.learner ?? newLearner(imported.curriculum), session: null, index: 0, feedback: null };
  if (action === 'replace') return validateProfile({ ...profile, activeBookId: targetBookId, books: profile.books.map(book => book.id === targetBookId ? { ...book, workspace } : book) });
  const id = crypto.randomUUID();
  return validateProfile({ ...profile, activeBookId: id, books: [...profile.books, { id, title: imported.curriculum.title, importedAt: timestamp(now), workspace }] });
}

export function profilePackage(profile) {
  return portable(validateProfile(profile));
}

export function parseProfilePackage(text) {
  if (typeof text !== 'string') fail('Bitte verwende vollständiges JSON.');
  if (new TextEncoder().encode(text).length > MAX_PROFILE_BYTES) fail('Die Datei ist zu groß. Bibliotheks-Sicherungen dürfen höchstens 25 MB enthalten.');
  let data;
  try { data = JSON.parse(text); } catch { fail('Dieser Import enthält kein gültiges JSON.'); }
  if (data?.kind !== 'profile-backup') return parseImport(text);
  checkShape(data.schemaVersion === '1.0' ? legacyPackageShape : packageShape, data);
  return { profile: validateProfile(data.profile) };
}
