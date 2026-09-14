import './books.css';
import './journey.css';
import { createProfile, validateProfile, activeBook, updateActiveBook, selectBook, renameBook, importBook, previewBookImport, profilePackage, parseProfilePackage, MAX_PROFILE_BYTES } from './profile.js';
import { awardStamps } from './stamps.js';
import './styles.css';
import './scout.css';
import './import-text.css';
import { renderApp } from './ui.js';
import { newLearner, generateSession, evaluateAnswer, recordAnswer, completeSession } from './engine.js';
import { loadWorkspace, saveWorkspace, acquireWriter } from './storage.js';
import { analyzeReadiness } from './readiness.js';
import { buildAuthoringPrompt, authoringSchema } from './authoring.js';
import { validateCurriculum, validateLearner, parseImport, backupPackage, curriculumPackage, MAX_FILE_BYTES } from './validation.js';
import { pastedImportText } from './import-text.js';
import example from '../fixtures/unit-1a/curriculum.json';

const root = document.querySelector('#app');
let state = {
  profile: null, view: 'home', curriculum: validateCurriculum(example), learner: null,
  session: null, index: 0, feedback: null, summary: null, notice: null,
  offlineReady: false, busy: true, readOnly: false,
  studyQuery: '', studyKind: 'all',
  pendingImport: null,
  importTextDraft: '', importTextError: null,
  authoringLanguage: 'fr',
};
state.learner = newLearner(state.curriculum);
const workspace = value => ({ curriculum: value.curriculum, learner: value.learner, session: value.session, index: value.index, feedback: value.feedback });
const show = () => renderApp(root, state, actions);
const notify = (text, type = 'error') => { state.notice = { type, text }; show(); };
function focusMain() { root.querySelector('#main')?.focus({ preventScroll: true }); }

async function commit(next) {
  if (state.readOnly) return notify('Dieses Lernbuch ist schon in einem anderen Tab geöffnet. Schließe den anderen Tab und lade diese Seite neu.');
  if (state.busy) return;
  state.busy = true;
  show();
  try {
    const profile = updateActiveBook(next.profile, workspace(next));
    await saveWorkspace(profile);
    state = { ...next, profile, busy: false };
    show();
    return true;
  } catch (error) {
    state.busy = false;
    notify(error.message);
    return false;
  }
}

function expectedAnswer(exercise) {
  if (exercise.type === 'choice' || exercise.type === 'reading') return exercise.choices.find(c => c.id === exercise.correctChoiceIds[0]).text;
  if (exercise.type === 'word-tiles') return exercise.correctOrder.map(id => exercise.tiles.find(t => t.id === id).text).join(' ');
  if (exercise.type === 'writing') return exercise.modelAnswer;
  return exercise.acceptedAnswers[0];
}

function download(document, filename) {
  downloadText(JSON.stringify(document, null, 2), filename, 'application/json');
}
function downloadText(text, filename, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = documentElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const documentElement = tag => window.document.createElement(tag);

function fromProfile(profile, extra = {}) {
  return { ...state, ...activeBook(profile).workspace, profile, pendingImport: null, studyQuery: '', studyKind: 'all', summary: null, ...extra };
}

function previewImport(imported, fileName, fromText = false) {
  state.pendingImport = imported.profile
    ? { ...imported, fileName, fromText }
    : { ...imported, fileName, fromText, ...previewBookImport(state.profile, imported), report: analyzeReadiness(imported.curriculum) };
  state.view = 'import-preview';
  state.notice = null;
  show(); focusMain();
}

const actions = {
  setAuthoringLanguage(language) {
    if (state.busy || !['fr', 'en'].includes(language)) return;
    state.authoringLanguage = language; state.notice = null; show();
    root.querySelector('[data-authoring-language]')?.focus();
  },
  async copyAuthoringPrompt() {
    try {
      await navigator.clipboard.writeText(buildAuthoringPrompt(state.authoringLanguage));
      if (state.view !== 'authoring') return;
      notify('Prompt mit Schema kopiert. Füge ihn in deine neue Unterhaltung ein.', 'success');
      root.querySelector('[data-action="copy-authoring"]')?.focus();
    } catch {
      if (state.view !== 'authoring') return;
      notify('Kopieren ist hier nicht verfügbar. Der Prompt ist unten markiert; kopiere ihn manuell oder lade ihn herunter.', 'info');
      const details = root.querySelector('[data-authoring-details]');
      if (details) details.open = true;
      const field = root.querySelector('[data-authoring-prompt]');
      field?.focus(); field?.select();
    }
  },
  downloadAuthoringPrompt() { downloadText(buildAuthoringPrompt(state.authoringLanguage), `lernpfad-autorenprompt-${state.authoringLanguage}.md`); },
  downloadSchema() { download(authoringSchema, 'curriculum.schema.json'); },
  navigate(view) { if (!state.busy) { state.view = view; state.pendingImport = null; state.notice = null; show(); focusMain(); } },
  cancelImport() { if (!state.busy) actions.navigate('library'); },
  async openBook(id) {
    if (state.busy || state.readOnly) return;
    try { await commit(fromProfile(selectBook(state.profile, id), { view: 'home', notice: null })); focusMain(); }
    catch (error) { notify(error.message); }
  },
  async renameBook(id, title) {
    if (state.busy || state.readOnly) return;
    try { await commit({ ...state, profile: renameBook(state.profile, id, title), notice: { type: 'success', text: 'Name gespeichert.' } }); }
    catch (error) { notify(error.message); }
  },
  exportProfile() {
    try { download(profilePackage(state.profile), 'lernpfad-profil.json'); notify('Alles gesichert: deine Lernbücher, Lernstände und Sammelstempel.', 'success'); }
    catch (error) { notify(error.message); }
    root.querySelector('[data-action="export-profile"]')?.focus();
  },
  async confirmImport() {
    if (state.busy || state.readOnly || !state.pendingImport) return;
    try {
      const pending = state.pendingImport;
      const profile = pending.profile || importBook(state.profile, pending);
      const text = pending.profile ? 'Dein gesamtes Profil wurde wiederhergestellt.' : pending.learner ? 'Deine Sicherung wurde wiederhergestellt. Die anderen Lernbücher bleiben erhalten.' : pending.action === 'open' ? 'Dein Lernbuch ist schon da. Du kannst weiterlernen.' : 'Dein Lernstoff ist bereit. Das neue Lernbuch wurde hinzugefügt.';
      await commit(fromProfile(profile, { view: 'home', notice: { type: 'success', text } }));
      focusMain();
    } catch (error) { notify(error.message); }
  },
  setStudyQuery(query) { state.studyQuery = String(query).slice(0, 200); show(); },
  setStudyKind(kind) { state.studyKind = kind; show(); },
  resumeSession() {
    if (state.busy || state.readOnly || !state.session) return;
    state.view = state.session.resting ? 'rest' : 'session'; state.notice = null; show(); focusMain();
  },
  async startSession(mode = 'learn', conceptIds) {
    if (state.busy || state.readOnly) return;
    const sameFocus = state.session && state.session.mode === mode && (
      (mode === 'review' && conceptIds === undefined) ||
      JSON.stringify([...(state.session.conceptIds ?? [])].sort()) === JSON.stringify([...(conceptIds ?? [])].sort())
    );
    if (sameFocus) return actions.resumeSession();
    let session;
    try { session = generateSession(state.curriculum, state.learner, { mode, conceptIds, seed: crypto.randomUUID() }); }
    catch (error) { return notify(error.message); }
    if (!session.exercises.length) return notify(mode === 'review' ? 'Gerade ist keine passende Wiederholung offen. Du kannst im Lernbuch etwas Neues entdecken.' : 'Für dieses Thema sind noch keine Übungen freigeschaltet. Schau dir zuerst die angegebenen Voraussetzungen an.', 'info');
    if (state.session && !window.confirm('Eine Runde ist noch offen. Jetzt eine andere Runde beginnen? Deine beantworteten Aufgaben bleiben gespeichert. Für die unvollständige Runde gibt es keinen Abschlussstempel.')) return;
    await commit({ ...state, session, index: 0, feedback: null, view: 'session', notice: null });
    focusMain();
  },
  async submit(answer) {
    if (state.busy || state.readOnly || !state.session) return;
    const exercise = state.session.exercises[state.index];
    if (state.feedback && !(exercise.type === 'writing' && !state.feedback.selfCheck)) return;
    const text = typeof answer === 'object' && !Array.isArray(answer) ? answer?.text : answer;
    if ((exercise.type === 'text-input' || exercise.type === 'writing') && (!String(text ?? '').trim() || String(text).length > 5000)) return notify('Schreibe zuerst eine kurze Antwort (höchstens 5.000 Zeichen).');
    if (exercise.type === 'writing' && !answer?.selfChecked) {
      state.feedback = { correct: null, selfCheck: false, expectedAnswer: exercise.modelAnswer };
      show();
      root.querySelector('[data-action="self-check"]')?.focus();
      return;
    }
    const result = evaluateAnswer(exercise, answer);
    const learner = recordAnswer(state.learner, exercise, { ...result, curriculumId: state.curriculum.id, curriculumVersion: state.curriculum.version, sessionId: state.session.id, answerId: `${state.session.id}:${exercise.id}` });
    const feedback = { ...result, expectedAnswer: expectedAnswer(exercise), explanation: exercise.explanation || exercise.feedback || '', selfCheck: exercise.type === 'writing' };
    delete feedback.normalizedAnswer;
    if (await commit({ ...state, learner, feedback, notice: null })) root.querySelector('[data-action="next"]')?.focus();
  },
  async continueAfterRest() {
    if (state.busy || state.readOnly || !state.session) return;
    if (await commit({ ...state, session: { ...state.session, resting: false }, view: 'session' })) focusMain();
  },
  async next() {
    if (state.busy || !state.feedback || (state.feedback.correct === null && !state.feedback.selfCheck)) return;
    if (state.index + 1 < state.session.exercises.length) {
      const nextIndex = state.index + 1;
      const rest = state.session.exercises.length >= 8 && nextIndex === Math.ceil(state.session.exercises.length / 2) && !state.session.restAcknowledged;
      const session = rest ? { ...state.session, restAcknowledged: true, resting: true } : state.session;
      await commit({ ...state, session, index: nextIndex, feedback: null, notice: null, view: rest ? 'rest' : 'session' });
      focusMain();
      return;
    }
    const learner = completeSession(state.learner, state.session);
    const records = learner.answerRecords.filter(a => a.sessionId === state.session.id);
    const objective = records.filter(a => !a.selfCheck);
    const summary = { xp: learner.xp - state.learner.xp, gems: learner.gems - state.learner.gems, correct: objective.filter(a => a.correct).length, total: objective.length, selfChecks: records.length - objective.length };
    const updated = { ...state, learner, session: null, index: 0, feedback: null };
    const profile = awardStamps(updateActiveBook(state.profile, workspace(updated)), state.session.id);
    summary.newStampIds = profile.stampAwards.filter(award => !state.profile.stampAwards.some(old => old.id === award.id)).map(award => award.stampId);
    await commit({ ...updated, profile, summary, view: 'complete', notice: null });
    focusMain();
  },
  exitSession() { state.view = 'home'; state.notice = { type: 'info', text: 'Deine geprüften Aufgaben sind gespeichert. Die Runde lässt sich fortsetzen. Noch nicht geprüfte Eingaben gehen beim Neuladen verloren.' }; show(); focusMain(); },
  async importFile(file) {
    if (state.busy || state.readOnly) return;
    // Serialize file reads as well as writes: an older read must never replace
    // a newer preview, and a preview must never be persisted before acceptance.
    state.busy = true;
    state.pendingImport = null;
    state.notice = { type: 'info', text: 'Die Datei wird auf diesem Gerät geprüft …' };
    show();
    try {
      if (file.size > MAX_PROFILE_BYTES) throw new Error('Die Datei ist zu groß. Profilsicherungen dürfen höchstens 25 MB haben; einzelne Lernbücher höchstens 5 MB.');
      const imported = parseProfilePackage(await file.text());
      state.busy = false;
      previewImport(imported, file.name);
    } catch (error) { state.busy = false; notify(error.message); focusMain(); }
  },
  validatePastedImport(text) {
    if (state.busy || state.readOnly) return;
    state.importTextDraft = String(text ?? '');
    state.importTextError = null;
    try {
      const imported = parseProfilePackage(pastedImportText(state.importTextDraft));
      previewImport(imported, 'Eingefügtes JSON', true);
    } catch (error) {
      state.importTextError = error.message;
      show();
      root.querySelector('[data-import-text]')?.focus({ preventScroll: true });
    }
  },
  exportBackup() {
    try { download(backupPackage(state.curriculum, state.learner), 'lernpfad-sicherung.json'); notify('Sicherung heruntergeladen. Sie enthält Lernstoff und Lernstand.', 'success'); }
    catch (error) { notify(error.message); }
    root.querySelector('[data-action="export-backup"]')?.focus();
  },
  exportCurriculum() { download(curriculumPackage(state.curriculum), 'lernpfad-lernstoff.json'); notify('Lernstoff heruntergeladen — ohne deinen Lernstand.', 'success'); },
  async loadExample() {
    if (state.busy || state.readOnly) return;
    if (state.curriculum.id === example.curriculum.id && state.curriculum.version === example.curriculum.version) { actions.navigate('home'); return; }
    previewImport({ curriculum: validateCurriculum(example), learner: null }, 'Holiday Stories · Beispiel');
  },
};

async function initialize() {
  try {
    state.readOnly = !(await acquireWriter());
    const stored = await loadWorkspace();
    const profile = stored?.profileVersion ? validateProfile(stored) : createProfile(stored || workspace(state));
    state = fromProfile(profile);
    // Persist legacy migration atomically only after complete validation.
    if (!stored?.profileVersion && !state.readOnly) await saveWorkspace(profile);

  } catch (error) {
    // Preserve existing storage on failed validation instead of overwriting it with a demo.
    state.readOnly = true;
    state.notice = { type: 'error', text: `${error.message} Der gespeicherte Stand wurde nicht überschrieben.` };
  }
  if (state.readOnly && !state.notice) state.notice = { type: 'info', text: 'Ein anderer Tab nutzt dieses Lernbuch. Schließe ihn und lade diese Seite neu, um hier zu lernen.' };
  state.busy = false;
  show();
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
      await navigator.serviceWorker.ready;
      state.offlineReady = true;
      show();
    } catch { notify('Offline-Speicherung ist in diesem Browser gerade nicht verfügbar. Dein Lernstand bleibt lokal gespeichert.', 'info'); }
  }
}

document.addEventListener('keydown', () => { document.documentElement.dataset.keyboardInput = ''; });
document.addEventListener('pointerdown', () => { delete document.documentElement.dataset.keyboardInput; });
show();
initialize();
