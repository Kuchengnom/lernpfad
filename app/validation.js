import Ajv from 'ajv';
import curriculumSchema from '../specs/schema/curriculum.schema.json' with { type: 'json' };
import curriculumV2Schema from '../specs/schema/curriculum-v2.schema.json' with { type: 'json' };
import learnerSchema from '../specs/schema/learner.schema.json' with { type: 'json' };
import { newLearner, recordAnswer } from './engine.js';
import { validateAuthorValues } from './numeric.js';

// ponytail: one Ajv instance shared with profile.js (which also registers the profile schemas on it),
// so every schema $id is added here exactly once instead of being registered on two instances.
export const ajv = new Ajv({ allErrors: true, strict: false });
ajv.addSchema(curriculumSchema);
ajv.addSchema(curriculumV2Schema);
ajv.addSchema(learnerSchema, 'https://language-learning.local/schema/learner-state.v1.json');
const validateCurriculumShape = ajv.getSchema(curriculumSchema.$id);
const validateCurriculumV2Shape = ajv.getSchema(curriculumV2Schema.$id);
const validateLearnerShape = ajv.getSchema('https://language-learning.local/schema/learner-state.v1.json');
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
const fail = message => { throw new Error(message); };
const unique = values => new Set(values).size === values.length;
const unsafe = id => ['__proto__', 'constructor', 'prototype'].includes(id);
const dateValid = value => value === null || (typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value);
function shapeError(validator, subject) {
  const errors = (validator.errors ?? []).slice(0, 4).map(e => `${e.instancePath || '/'} ${e.message}${e.params?.missingProperty ? ` (${e.params.missingProperty})` : ''}`).join('; ');
  fail(`${subject} passt nicht zum unterstützten Format (schemaVersion und Inhalt): ${errors}. Bitte mit der Anweisung für den KI-Chat und dem Schema prüfen.`);
}

export function validateCurriculum(document) {
  const shape = document?.schemaVersion === '2.0' ? validateCurriculumV2Shape : validateCurriculumShape;
  if (!shape(document)) shapeError(shape, 'Der Lernstoff');
  const course = document.curriculum;
  const conceptIds = course.concepts.map(c => c.id);
  const exerciseIds = course.exercises.map(e => e.id);
  if (!unique(conceptIds) || !unique(exerciseIds)) fail('IDs müssen eindeutig sein: Ein Konzept oder eine Aufgabe kommt mehrfach vor.');
  if ([...conceptIds, ...exerciseIds].some(unsafe)) fail('Eine ID ist reserviert. Bitte verwende eine andere stabile ID.');
  const concepts = new Map(course.concepts.map(c => [c.id, c]));
  const sources = new Set(course.sources.map(s => s.id));
  if (sources.size !== course.sources.length) fail('Quellen-IDs müssen eindeutig sein.');
  for (const item of [...course.concepts, ...course.exercises]) if (item.provenance.some(id => !sources.has(id))) fail(`${item.id}: Eine angegebene Quelle fehlt im Lernstoff.`);
  for (const c of course.concepts) {
    if ((c.dependsOn ?? []).some(id => !concepts.has(id))) fail(`Konzept ${c.id}: Eine Voraussetzung fehlt im Lernstoff. Bitte die KI-Unterhaltung bitten, die fehlende Voraussetzung zu ergänzen oder dieses Konzept zu entfernen.`);
  }
  const visiting = new Set(), visited = new Set();
  function visit(id) {
    if (visiting.has(id)) fail(`Konzept ${id}: Voraussetzungen bilden einen Kreis.`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const parent of concepts.get(id).dependsOn ?? []) visit(parent);
    visiting.delete(id); visited.add(id);
  }
  for (const id of conceptIds) visit(id);
  for (const e of course.exercises) {
    if (e.type === 'numeric-input' || e.type === 'number-list') {
      const values = e.type === 'numeric-input' ? e.acceptedValues : e.expectedValues;
      const result = validateAuthorValues(values);
      if (!result.ok) fail(`Aufgabe ${e.id}: Die Zahlenlösung überschreitet das unterstützte Format (${result.reason}).`);
      if (e.comparison === 'set' && !unique(values)) fail(`Aufgabe ${e.id}: Eine Lösungsmenge darf keine doppelten Zahlen enthalten.`);
    }
    if (!unique(e.conceptIds) || e.conceptIds.some(id => !concepts.has(id))) fail(`Aufgabe ${e.id}: Ein verknüpftes Konzept fehlt oder kommt doppelt vor.`);
    if (e.choices) {
      if (!unique(e.choices.map(c => c.id)) || e.correctChoiceIds.some(id => !e.choices.some(c => c.id === id))) fail(`Aufgabe ${e.id}: Die richtige Antwort muss auf eine eindeutige Auswahl zeigen.`);
      if (!unique(e.choices.map(c => c.text.trim().toLowerCase()))) fail(`Aufgabe ${e.id}: Antwortmöglichkeiten dürfen nicht gleich lauten.`);
    }
    if (e.tiles && (!unique(e.tiles.map(t => t.id)) || !unique(e.correctOrder) || e.correctOrder.length !== e.tiles.length || e.correctOrder.some(id => !e.tiles.some(t => t.id === id)))) fail(`Aufgabe ${e.id}: Die Lösung muss jeden Wortbaustein genau einmal enthalten.`);
    if (e.tiles && !unique(e.tiles.map(t => t.text.trim().toLowerCase()))) fail(`Aufgabe ${e.id}: Gleiche Wortbausteine sind in dieser Version nicht unterstützt.`);
    if (!e.prompt.trim() || !e.explanation.trim() || e.acceptedAnswers?.some(a => !a.trim())) fail(`Aufgabe ${e.id}: Aufgabe, Erklärung und Lösung dürfen nicht leer sein.`);
    if (e.type === 'writing' && e.conceptIds.some(id => concepts.get(id).kind !== 'writing-skill')) fail(`Aufgabe ${e.id}: Selbstprüfung darf nur mit Schreibkompetenzen verknüpft sein.`);
  }
  return course;
}

export function validateLearner(learner, course) {
  if (!validateLearnerShape(learner)) shapeError(validateLearnerShape, 'Der Lernstand');
  if (learner.curriculumId !== course.id || learner.curriculumVersion !== course.version) fail('Dieser Lernstand gehört zu einer anderen Lernstoff-Version. Bitte exportiere eine vollständige Sicherung.');
  const exercises = new Map(course.exercises.map(e => [e.id, e]));
  const concepts = new Set(course.concepts.map(c => c.id));
  for (const [id, progress] of Object.entries(learner.conceptProgress)) {
    if (!concepts.has(id)) fail(`Lernstand: Das Konzept ${id} fehlt im Lernstoff.`);
    if (progress.correct + progress.incorrect > progress.attempts || progress.correctStreak > progress.correct || !dateValid(progress.lastAnsweredAt) || !dateValid(progress.nextDueAt)) fail(`Lernstand: Die Zähler oder Zeitangaben für ${id} sind widersprüchlich.`);
  }
  if (!unique(learner.answerRecords.map(a => a.id)) || !unique(learner.answerRecords.map(a => `${a.sessionId}:${a.exerciseId}`))) fail('Lernstand: Antworten sind doppelt gespeichert.');
  for (const a of learner.answerRecords) {
    const e = exercises.get(a.exerciseId);
    if (!e || !dateValid(a.answeredAt)) fail('Lernstand: Eine Antwort verweist auf eine unbekannte Aufgabe oder ungültige Zeit.');
    if (a.selfCheck !== (e.type === 'writing') || (a.correct === null) !== a.selfCheck) fail('Lernstand: Selbstprüfung und bewertete Antworten sind nicht konsistent.');
    if (unsafe(a.id) || unsafe(a.sessionId)) fail('Lernstand: Eine Antwort- oder Runden-ID ist reserviert.');
  }
  // Replay the recorded outcomes, not raw learner answers (which are never exported).
  // This validates mastery, schedules and encounter counts against the exact course.
  let reconstructed = newLearner(course);
  for (const a of learner.answerRecords) reconstructed = recordAnswer(reconstructed, exercises.get(a.exerciseId), { ...a, answerId: a.id, curriculumId: course.id, curriculumVersion: course.version }, { now: a.answeredAt });
  const canonical = object => JSON.stringify(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)).map(([id, value]) => [id, Object.entries(value).sort(([a], [b]) => a.localeCompare(b))]));
  if (canonical(reconstructed.conceptProgress) !== canonical(learner.conceptProgress)) fail('Lernstand: Der Themenfortschritt stimmt nicht mit den gespeicherten Antworten überein.');
  if (learner.sessionCounter !== learner.completedSessionIds.length || learner.gems !== learner.completedSessionIds.length) fail('Lernstand: Die Anzahl der abgeschlossenen Runden ist widersprüchlich.');
  if (!unique(learner.completedSessions.map(s => s.id)) || learner.completedSessions.length !== learner.completedSessionIds.length) fail('Lernstand: Die Rundenübersicht ist widersprüchlich.');
  let expectedXp = 0;
  for (const session of learner.completedSessions) {
    if (unsafe(session.id) || !learner.completedSessionIds.includes(session.id) || session.curriculumId !== course.id || session.curriculumVersion !== course.version) fail('Lernstand: Eine Runde gehört zu einem anderen Lernstoff.');
    const records = learner.answerRecords.filter(a => a.sessionId === session.id);
    if (records.length !== session.exerciseIds.length || session.exerciseIds.some(id => !exercises.has(id) || !records.some(a => a.exerciseId === id))) fail('Lernstand: Eine abgeschlossene Runde enthält unbeantwortete Aufgaben.');
    expectedXp += session.exerciseIds.length * 5;
  }
  if (learner.xp !== expectedXp) fail('Lernstand: Die Punkte stimmen nicht mit den abgeschlossenen Runden überein.');
  return learner;
}

export function parseImport(text) {
  if (new TextEncoder().encode(text).length > MAX_FILE_BYTES) fail('Die Datei ist zu groß. Bitte verwende eine JSON-Datei bis 5 MB.');
  let data;
  try { data = JSON.parse(text); } catch { fail('Dieser Import enthält kein gültiges JSON. Bitte kopiere die vollständige Antwort oder lasse den JSON-Text korrigieren.'); }
  if (!data || !['1.0', '2.0'].includes(data.schemaVersion)) fail('Diese Dateiversion wird noch nicht unterstützt. Erwartet wird schemaVersion „1.0“ oder „2.0“. Dein bisheriger Lernstand bleibt erhalten.');
  if (!['curriculum', 'backup'].includes(data.kind)) fail('Bitte wähle einen Lernstoff oder eine vollständige Lernpfad-Sicherung.');
  const allowed = data.kind === 'backup' ? ['schemaVersion', 'kind', 'curriculum', 'learner'] : ['schemaVersion', 'kind', 'curriculum'];
  if (Object.keys(data).some(key => !allowed.includes(key))) fail('Die Datei enthält unbekannte Felder. Bitte verwende das veröffentlichte Schema.');
  const curriculum = validateCurriculum({ schemaVersion: data.schemaVersion, kind: 'curriculum', curriculum: data.curriculum });
  const learner = data.kind === 'backup' ? validateLearner(data.learner, curriculum) : null;
  return { curriculum, learner };
}

export const curriculumPackage = curriculum => ({ schemaVersion: Object.hasOwn(curriculum, 'subject') ? '2.0' : '1.0', kind: 'curriculum', curriculum });
export function backupPackage(curriculum, learner) {
  validateCurriculum(curriculumPackage(curriculum));
  validateLearner(learner, curriculum);
  return { ...curriculumPackage(curriculum), kind: 'backup', learner };
}
