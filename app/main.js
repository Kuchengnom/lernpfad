import { createProfile, validateProfile, activeBook, updateActiveBook, selectBook, renameBook, importBook, previewBookImport, profilePackage, parseProfilePackage, MAX_PROFILE_BYTES } from './profile.js';
import { expectedAnswer } from './answer-format.js';
import { cancelSpeech, speak } from './speech.js';
import { awardStamps } from './stamps.js';
import './styles.css';
import './math.css';
import './scout.css';
import './import-text.css';
import './books.css';
import './journey.css';
import { renderApp } from './ui.js';
import { newLearner, generateSession, evaluateAnswer, recordAnswer, completeSession } from './engine.js';
import { loadWorkspace, saveWorkspace, acquireWriter } from './storage.js';
import { analyzeReadiness } from './readiness.js';
import { buildAuthoringPrompt, authoringSchemaFor } from './authoring.js';
import { validateCurriculum, validateLearner, parseImport, backupPackage, curriculumPackage, MAX_FILE_BYTES } from './validation.js';
import { pastedImportText } from './import-text.js';
import example from '../fixtures/unit-1a/curriculum.json';
import frenchExample from '../fixtures/french-smoke/curriculum.json';
import mathExample from '../fixtures/math-divisibility/curriculum.json';

const root = document.querySelector('#app');
let state = {
  bookTitleDrafts: {}, profile: null, view: 'home', curriculum: validateCurriculum(example), learner: null,
  session: null, index: 0, feedback: null, summary: null, notice: null,
  offlineReady: false, busy: true, readOnly: false,
  studyQuery: '', studyKind: 'all',
  pendingImport: null,
  importTextDraft: '', importTextError: null,
  authoringLanguage: 'fr', authoringSubject: 'language', inputError: null,
};
state.learner = newLearner(state.curriculum);
const workspace = value => ({ curriculum: value.curriculum, learner: value.learner, session: value.session, index: value.index, feedback: value.feedback });
let speechContext;
const show = () => {
  const context = [state.view, state.profile?.activeBookId, state.session?.id, state.index].join(':');
  if (context !== speechContext) cancelSpeech();
  speechContext = context;
  renderApp(root, state, actions);
};
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
  return { ...state, ...activeBook(profile).workspace, profile, inputError: null, bookTitleDrafts: {}, pendingImport: null, studyQuery: '', studyKind: 'all', summary: null, ...extra };
}

function previewImport(imported, fileName, fromText = false, extra = {}) {
  state.pendingImport = imported.profile
    ? { ...imported, fileName, fromText }
    : { ...imported, fileName, fromText, ...extra, ...previewBookImport(state.profile, imported), report: analyzeReadiness(imported.curriculum) };
  state.view = 'import-preview';
  state.notice = null;
  show(); focusMain();
}

// ponytail: inlined from the former math-messages.js — one map, one caller (submit action below)
const numericInputMessages = {
  empty: 'Trage in jedes Zahlenfeld eine Zahl ein. Entferne Felder, die du nicht brauchst.',
  'too-long': 'Eine Eingabe darf höchstens 32 Zeichen haben, einschließlich Leerzeichen.',
  'non-digit': 'Gib eine ganze Zahl ohne Minuszeichen ein, zum Beispiel 24. Rechenzeichen, Brüche und Kommazahlen passen hier nicht.',
  'out-of-range': 'Hier sind Zahlen von 0 bis 999999 möglich.',
  'too-many-entries': 'Eine Liste darf höchstens 20 Zahlen enthalten.',
  'duplicate-values': 'In einer Menge darf jede Zahl nur einmal stehen. Entferne doppelte Zahlen; auch 02 und 2 sind dieselbe Zahl.',
};
const numericInputMessage = reason => numericInputMessages[reason] || 'Prüfe deine Zahlen noch einmal. Diese Eingabe lässt sich noch nicht bewerten.';

const actions = {
  playAudio(text) {
    const result = speak(text, state.curriculum?.targetLanguage || state.curriculum?.instructionLanguage);
    if (!result.spoken) {
      notify(result.reason === 'no-local-voice' ? 'Für diese Sprache ist gerade keine lokale Stimme verfügbar. Lade sie gegebenenfalls in den Spracheinstellungen deines Geräts herunter und versuche es erneut.' : 'Vorlesen ist auf diesem Gerät gerade nicht verfügbar.', 'info');
      root.querySelector('[data-audio]')?.focus();
    }
  },
  setAuthoringSubject(subject) {
    if (state.busy || !['language', 'math'].includes(subject)) return;
    state.authoringSubject = subject; state.notice = null; show();
    root.querySelector('[data-authoring-subject]')?.focus();
  },
  setAuthoringLanguage(language) {
    if (state.busy || !['fr', 'en'].includes(language)) return;
    state.authoringLanguage = language; state.notice = null; show();
    root.querySelector('[data-authoring-language]')?.focus();
  },
  async copyAuthoringPrompt() {
    try {
      await navigator.clipboard.writeText(buildAuthoringPrompt(state.authoringLanguage, state.authoringSubject));
      if (state.view !== 'authoring') return;
      notify('Anweisung mit Schema kopiert. Füge sie in deine neue Unterhaltung ein.', 'success');
      root.querySelector('[data-action="copy-authoring"]')?.focus();
    } catch {
      if (state.view !== 'authoring') return;
      notify('Kopieren ist hier nicht verfügbar. Die Anweisung ist unten markiert; kopiere sie manuell oder lade sie herunter.', 'info');
      const details = root.querySelector('[data-authoring-details]');
      if (details) details.open = true;
      const field = root.querySelector('[data-authoring-prompt]');
      field?.focus(); field?.select();
    }
  },
  downloadAuthoringPrompt() { downloadText(buildAuthoringPrompt(state.authoringLanguage, state.authoringSubject), `lernpfad-anweisung-${state.authoringSubject === 'math' ? 'mathe' : state.authoringLanguage}.md`); },
  downloadSchema() { download(authoringSchemaFor(state.authoringSubject), 'curriculum.schema.json'); },
  navigate(view) { if (!state.busy) { state.view = view; state.pendingImport = null; state.notice = null; show(); focusMain(); } },
  cancelImport() { if (!state.busy) actions.navigate('library'); },
  async openBook(id) {
    if (state.busy || state.readOnly) return;
    try { await commit(fromProfile(selectBook(state.profile, id), { view: 'home', notice: null })); focusMain(); }
    catch (error) { notify(error.message); }
  },
  async renameBook(id, title) {
    if (state.busy || state.readOnly) return;
    try { const bookTitleDrafts = { ...state.bookTitleDrafts }; delete bookTitleDrafts[id]; await commit({ ...state, bookTitleDrafts, profile: renameBook(state.profile, id, title), notice: { type: 'success', text: 'Name gespeichert.' } }); }
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
      let profile = pending.profile || importBook(state.profile, pending);
      if (pending.keepActiveBook && !pending.profile) profile = selectBook(profile, state.profile.activeBookId);
      const text = pending.profile ? 'Dein gesamtes Profil wurde wiederhergestellt.' : pending.learner ? 'Deine Sicherung wurde wiederhergestellt. Die anderen Lernbücher bleiben erhalten.' : pending.keepActiveBook && pending.action === 'open' ? 'Dieses Beispiel ist schon in deiner Sammlung. Es wurde nicht doppelt angelegt; dein ausgewähltes Lernbuch bleibt geöffnet.' : pending.keepActiveBook ? 'Das Beispiel wurde hinzugefügt. Dein ausgewähltes Lernbuch und sein Lernstand bleiben erhalten.' : pending.action === 'open' ? 'Dein Lernbuch ist schon da. Du kannst weiterlernen.' : 'Dein Lernstoff ist bereit. Das neue Lernbuch wurde hinzugefügt.';
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
    await commit({ ...state, session, inputError: null, index: 0, feedback: null, view: 'session', notice: null });
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
    if (result.invalid) {
      state.inputError = numericInputMessage(result.reason);
      show();
      root.querySelector('[data-draft-numeric], [data-number-entry]')?.focus();
      return;
    }
    state.inputError = null;
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
      await commit({ ...state, session, index: nextIndex, feedback: null, inputError: null, notice: null, view: rest ? 'rest' : 'session' });
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
  previewBundledExample(curriculum, fileName, keepActiveBook = false) {
    if (state.busy || state.readOnly) return;
    try { previewImport({ curriculum: validateCurriculum(curriculum), learner: null }, fileName, false, { keepActiveBook }); }
    catch (error) { notify(error.message); }
  },
  loadMathExample({ keepActiveBook = false } = {}) { actions.previewBundledExample(mathExample, 'Mathe · Teilbarkeit & Primzahlen · Beispiel', keepActiveBook); },
  async loadExample({ example: bundledExample, keepActiveBook = false } = {}) {
    if (state.busy || state.readOnly) return;
    if (bundledExample === 'french') {
      actions.previewBundledExample(frenchExample, 'Französisch · Technischer Testkurs · Beispiel', keepActiveBook);
      return;
    }
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
    if (stored?.profileVersion !== profile.profileVersion && !state.readOnly) await saveWorkspace(profile);

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

document.addEventListener('visibilitychange', () => { if (document.hidden) cancelSpeech(); });
window.addEventListener('pagehide', () => cancelSpeech());
document.addEventListener('keydown', () => { document.documentElement.dataset.keyboardInput = ''; });
document.addEventListener('pointerdown', () => { delete document.documentElement.dataset.keyboardInput; });
show();
initialize();
