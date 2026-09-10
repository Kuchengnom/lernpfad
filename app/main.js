import './styles.css';
import { renderApp } from './ui.js';
import { newLearner, generateSession, evaluateAnswer, recordAnswer, completeSession } from './engine.js';
import { loadWorkspace, saveWorkspace, acquireWriter } from './storage.js';
import { analyzeReadiness } from './readiness.js';
import { buildAuthoringPrompt, authoringSchema } from './authoring.js';
import { validateCurriculum, validateLearner, parseImport, backupPackage, curriculumPackage, MAX_FILE_BYTES } from './validation.js';
import example from '../fixtures/unit-1a/curriculum.json';

const root = document.querySelector('#app');
let state = {
  view: 'home', curriculum: validateCurriculum(example), learner: null,
  session: null, index: 0, feedback: null, summary: null, notice: null,
  offlineReady: false, busy: true, readOnly: false,
  studyQuery: '', studyKind: 'all',
  pendingImport: null,
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
    await saveWorkspace(workspace(next));
    state = { ...next, busy: false };
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

function previewImport(imported, fileName) {
  state.pendingImport = { ...imported, fileName, report: analyzeReadiness(imported.curriculum) };
  state.view = 'import-preview';
  state.notice = null;
  show();
  focusMain();
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
  downloadAuthoringPrompt() { downloadText(buildAuthoringPrompt(state.authoringLanguage), `trailbook-autorenprompt-${state.authoringLanguage}.md`); },
  downloadSchema() { download(authoringSchema, 'curriculum.schema.json'); },
  navigate(view) { if (!state.busy) { state.view = view; state.pendingImport = null; state.notice = null; show(); focusMain(); } },
  cancelImport() { if (!state.busy) actions.navigate('library'); },
  async confirmImport() {
    if (state.busy || state.readOnly || !state.pendingImport) return;
    const { curriculum, learner } = state.pendingImport;
    await commit({ ...state, curriculum, learner: learner ?? newLearner(curriculum), pendingImport: null, session: null, index: 0, feedback: null, summary: null, studyQuery: '', studyKind: 'all', view: 'home', notice: { type: 'success', text: learner ? 'Deine Sicherung wurde wiederhergestellt. Du kannst hier weiterlernen.' : 'Dein Lernstoff ist bereit. Auf zur nächsten Lernrunde!' } });
    focusMain();
  },
  setStudyQuery(query) { state.studyQuery = String(query).slice(0, 200); show(); },
  setStudyKind(kind) { state.studyKind = kind; show(); },
  resumeSession() {
    if (state.busy || state.readOnly || !state.session) return;
    state.view = 'session'; state.notice = null; show(); focusMain();
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
  async next() {
    if (state.busy || !state.feedback || (state.feedback.correct === null && !state.feedback.selfCheck)) return;
    if (state.index + 1 < state.session.exercises.length) {
      await commit({ ...state, index: state.index + 1, feedback: null, notice: null });
      focusMain();
      return;
    }
    const learner = completeSession(state.learner, state.session);
    const records = learner.answerRecords.filter(a => a.sessionId === state.session.id);
    const objective = records.filter(a => !a.selfCheck);
    const summary = { xp: learner.xp - state.learner.xp, gems: learner.gems - state.learner.gems, correct: objective.filter(a => a.correct).length, total: objective.length, selfChecks: records.length - objective.length };
    await commit({ ...state, learner, session: null, index: 0, feedback: null, summary, view: 'complete', notice: null });
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
      if (file.size > MAX_FILE_BYTES) throw new Error('Die Datei ist zu groß. Bitte verwende eine JSON-Datei bis 5 MB.');
      const imported = parseImport(await file.text());
      state.busy = false;
      previewImport(imported, file.name);
    } catch (error) { state.busy = false; notify(error.message); focusMain(); }
  },
  exportBackup() {
    try { download(backupPackage(state.curriculum, state.learner), 'trailbook-sicherung.json'); notify('Sicherung heruntergeladen. Sie enthält Lernstoff und Lernstand.', 'success'); }
    catch (error) { notify(error.message); }
    root.querySelector('[data-action="export-backup"]')?.focus();
  },
  exportCurriculum() { download(curriculumPackage(state.curriculum), 'trailbook-lernstoff.json'); notify('Lernstoff heruntergeladen — ohne deinen Lernstand.', 'success'); },
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
    if (stored) {
      const curriculum = validateCurriculum(curriculumPackage(stored.curriculum));
      const learner = validateLearner(stored.learner, curriculum);
      state = { ...state, curriculum, learner };
      // Restore only a session that refers exactly to this curriculum and valid answer records.
      if (stored.session && stored.session.curriculumId === curriculum.id && stored.session.curriculumVersion === curriculum.version && Array.isArray(stored.session.exercises) && stored.session.exercises.length && new Set(stored.session.exercises.map(e => e.id)).size === stored.session.exercises.length && Number.isInteger(stored.index) && stored.index >= 0 && stored.index < stored.session.exercises.length && stored.session.exercises.every(e => curriculum.exercises.some(c => c.id === e.id)) && !learner.completedSessionIds.includes(stored.session.id)) {
        const exercises = stored.session.exercises.map(e => curriculum.exercises.find(c => c.id === e.id));
        const current = exercises[stored.index];
        const answer = learner.answerRecords.find(a => a.sessionId === stored.session.id && a.exerciseId === current.id);
        state = { ...state, session: { ...stored.session, exercises }, index: stored.index, feedback: answer ? { correct: answer.correct, selfCheck: answer.selfCheck, expectedAnswer: expectedAnswer(current), explanation: current.explanation || current.feedback || '' } : null };
      }
    } else if (!state.readOnly) await saveWorkspace(workspace(state));
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

show();
initialize();
