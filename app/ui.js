import { booksView, profileImportView, bookImportMessage } from './books-view.js';
import { stampStrip, albumView, completionStamps } from './stamps.js';
import { mountainRoute, restView } from './journey.js';
import { importTextView } from './import-text-view.js';
import { brandMark, fieldKitArtwork, heroArtwork } from './scout-art.js';
import { authoringView } from './authoring-view.js';
import { getReviewItems } from './engine.js';
import { foldForSearch, learnerText, isMath, contentLanguage, subjectName, curriculumLanguageLabel } from './study-language.js';
import { backupReminder } from './profile.js';

const drafts = new Map();
let pendingFocus = null;
let draftSession = null;
const draftKey = (state, index) => `${state.profile?.activeBookId || 'book'}:${state.session?.id || 'session'}:${index}`;

const icons = {
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.7c2.6-1.1 5.2-.7 8 1.3v12c-2.8-2-5.4-2.4-8-1.3v-12Z M20 5.7c-2.6-1.1-5.2-.7-8 1.3v12c2.8-2 5.4-2.4 8-1.3v-12Z"/></svg>',
  route: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c4.7 0 1.7-9 7-9s2.2-5 7-5M5 19l1.8-2M5 19l1.8 2M19 5l-1.8-2M19 5l-1.8 2"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Zm7 13 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></svg>',
  archive: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v13H4zM3 4h18v3H3zM9 11h6"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.2 4.2L19 6.5"/></svg>',
  volume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4Zm12.5-2.5a6 6 0 0 1 0 9M19 5a9.5 9.5 0 0 1 0 14"/></svg>',
};

const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const button = (text, action, className = 'button button--primary', extra = '') => `<button class="${className}" type="button" data-action="${action}" ${extra}>${text}</button>`;
function conceptProgress(state) {
  const known = state.curriculum?.concepts || [];
  return known.map(concept => ({ concept, ...(state.learner?.conceptProgress?.[concept.id] || { attempts: 0, correct: 0, incorrect: 0, mastery: 0, nextDueAt: null }) }));
}
const isDue = item => item.nextDueAt && Date.parse(item.nextDueAt) <= Date.now();
const isLocked = state => Boolean(state.busy || state.readOnly);


function nav(view) {
  const items = [['home', 'Heute', 'route'], ['library', 'Üben', 'book'], ['study', 'Lernbuch', 'archive'], ['progress', 'Fortschritt', 'spark']];
  return `<nav class="app-nav" aria-label="Hauptnavigation">${items.map(([id, label, icon]) => `<button type="button" class="nav-item ${view === id ? 'is-active' : ''}" data-action="navigate" data-view="${id}" ${view === id ? 'aria-current="page"' : ''}>${icons[icon]}<span>${label}</span></button>`).join('')}</nav>`;
}

function noticeBanner(state) { return state.notice ? `<div class="notice notice--${esc(state.notice.type)}" role="status">${esc(state.notice.text)}</div>` : ''; }
function shell(state, content) {
  const notice = state.notice ? `<div class="notice notice--${esc(state.notice.type)}" role="status">${esc(state.notice.text)}</div>` : '';
  return `<div class="app-shell">
    <aside class="sidebar"><a href="#main" class="brand"><span class="brand-mark">${brandMark()}</span><span>Lernpfad<small>Wissen entdecken</small></span></a>${nav(state.view)}<div class="sidebar-library">${button('Meine Lernbücher', 'navigate', `nav-item ${state.view === 'books' ? 'is-active' : ''}`, `data-view="books" ${state.view === 'books' ? 'aria-current="page"' : ''}`)}${button('Sammelmappe', 'navigate', `nav-item ${state.view === 'album' ? 'is-active' : ''}`, `data-view="album" ${state.view === 'album' ? 'aria-current="page"' : ''}`)}</div><div class="learner-tally"><span>${state.learner?.xp || 0} Punkte</span><span>${state.profile?.stampAwards.length || 0} Sammelstempel</span></div><a class="about-link" href="./index.html">Was ist Lernpfad?</a><div class="sidebar-foot"><span class="privacy-dot ${state.offlineReady ? 'is-ready' : ''}"></span>${state.offlineReady ? 'Offline bereit.' : 'Wird lokal vorbereitet …'}</div></aside>
    <main id="main" class="main-content" tabindex="-1"><div class="mobile-meta"><strong>Lernpfad</strong><span>${state.learner?.xp || 0} Punkte · ${state.profile?.stampAwards.length || 0} Sammelstempel<br>${state.offlineReady ? 'Offline bereit' : 'Lernstand auf diesem Gerät'}</span></div>${notice}${content}</main>
    ${nav(state.view)}
  </div>`;
}

function courseTitle(state) { return state.profile?.books.find(book => book.id === state.profile.activeBookId)?.title || state.curriculum?.title || 'Dein Lernbuch'; }

function backupReminderCard(state) {
  const reason = backupReminder(state.profile);
  if (!reason) return '';
  const heading = reason === 'never' ? 'Du übst schon eine Weile — magst du deinen Lernstand sichern?' : 'Es ist etwas her, dass du zuletzt gesichert hast.';
  return `<section class="backup-reminder card" aria-labelledby="backup-reminder-title"><div><p class="eyebrow">Nicht vergessen</p><h2 id="backup-reminder-title">${heading}</h2><p>Dein Lernstand liegt nur auf diesem Gerät. Eine Sicherungsdatei bringt ihn zurück, falls Browserdaten gelöscht werden oder das Gerät wechselt.</p></div>${button('Alles sichern', 'export-profile', 'button button--secondary')}</section>`;
}
function home(state) {
  const progress = conceptProgress(state);
  const mastered = progress.filter(item => (item.mastery ?? 0) >= .8).length;
  const due = progress.filter(isDue).length;
  const started = progress.filter(item => item.attempts).length;
  return shell(state, `<section class="home-grid" aria-labelledby="home-title">
    <div class="home-intro"><p class="eyebrow">Dein Wissen. Dein Weg.</p><h1 id="home-title">Hallo! Bereit für<br><em>deine nächste Etappe?</em></h1><p class="lede">Heute übst du ${esc(subjectName(state.curriculum))} aus <strong>${esc(courseTitle(state))}</strong> — kurz, klar und in deinem Tempo.</p>${button(`${state.session ? 'Runde fortsetzen' : 'Lernrunde starten'} ${icons.arrow}`, 'start-learn', 'button button--primary button--with-icon')}</div>
    <div class="hero-card scout-hero">${heroArtwork()}<div class="hero-card__caption"><span class="stamp">Heute</span><strong>${esc(courseTitle(state))}</strong><span>Eine kurze Runde wartet auf dich.</span></div></div>
    ${state.session ? `<section class="resume-banner card"><div><p class="eyebrow">Noch offen</p><h2>Deine Lernrunde wartet.</h2><p>Du bist bei Aufgabe ${state.index + 1} von ${state.session.exercises.length}.</p></div>${button(`Runde fortsetzen ${icons.arrow}`, 'start-learn', 'button button--primary button--with-icon')}</section>` : `<section class="continue-card card" aria-labelledby="continue-title"><div><p class="eyebrow">Empfohlen</p><h2 id="continue-title">Weiterlernen</h2><p>${due ? `${due} ${due === 1 ? 'Thema wartet' : 'Themen warten'} auf Wiederholung.` : (isMath(state.curriculum) ? 'Eine neue Mischung aus Zahlen und Regeln.' : 'Eine neue Mischung aus Wörtern und Sätzen.')}</p></div>${button(`Los geht’s ${icons.arrow}`, 'start-learn', 'button button--primary button--with-icon')}</section>`}
    <section class="route-card card" aria-labelledby="route-title"><div class="section-title"><div><p class="eyebrow">Dein Lernstoff</p><h2 id="route-title">${esc(courseTitle(state))}</h2></div><span class="route-badge">${mastered} oft richtig geübt</span></div><div class="truthful-counts"><span><strong>${progress.length}</strong> Themen</span><span><strong>${started}</strong> begonnen</span><span><strong>${due}</strong> fällig</span></div>${button(`Lernbuch öffnen ${icons.arrow}`, 'navigate', 'button button--secondary button--with-icon', 'data-view="study"')}</section>
    ${backupReminderCard(state)}
    ${stampStrip(state, button)}<section class="quick-card card" aria-labelledby="quick-title"><p class="eyebrow">Kurz & gezielt</p><h2 id="quick-title">Was brauchst du?</h2><div class="quick-actions">${button(`${icons.route}<span>Wiederholungen ansehen${due ? ` (${due})` : ''}</span>`, 'navigate', 'quick-action', 'data-view="review"')}${button(`${icons.archive}<span>Meine Lernbücher</span>`, 'navigate', 'quick-action', 'data-view="books"')}</div></section>
  </section>`);
}

function prerequisiteState(concept, state) {
  const missing = (concept.dependsOn || []).filter(id => (state.learner?.conceptProgress?.[id]?.mastery || 0) < .2);
  return { locked: missing.length > 0, missing };
}
function conceptCanPractice(concept, state) {
  const conceptIds = exercise => exercise.conceptIds || (exercise.conceptId ? [exercise.conceptId] : []);
  return (state.curriculum?.exercises || []).some(exercise => conceptIds(exercise).includes(concept.id) && conceptIds(exercise).every(id => (state.curriculum.concepts.find(c => c.id === id)?.dependsOn || []).every(dependency => (state.learner?.conceptProgress?.[dependency]?.mastery || 0) >= .2)));
}
function kindLabel(kind) { return ({ vocabulary: 'Wortschatz', grammar: 'Grammatik', 'reading-skill': 'Lesen', 'writing-skill': 'Schreiben', 'math-skill': 'Mathematik' })[kind] || kind; }
function study(state) {
  const query = foldForSearch(state.studyQuery || '');
  const kinds = [...new Set((state.curriculum?.concepts || []).map(c => c.kind))];
  const concepts = (state.curriculum?.concepts || []).filter(c => {
    const haystack = [c.native, c.target, c.label, learnerText(c.label), c.rule, learnerText(c.rule), c.learningGoal, learnerText(c.learningGoal), ...(c.examples || [])].filter(Boolean).join(' ');
    return (state.studyKind === 'all' || !state.studyKind || c.kind === state.studyKind) && (!query || foldForSearch(haystack).includes(query));
  });
  return shell(state, `<section class="study-page" aria-labelledby="study-title"><p class="eyebrow">Nachschlagen ohne Druck</p><h1 id="study-title">Lernbuch</h1><p class="lede">Sieh dir ${isMath(state.curriculum) ? 'Zahlen und Regeln' : 'Wörter und Regeln'} an. Erst „Dieses Thema üben“ startet eine Lernrunde.</p><div class="study-tools card"><label class="study-search"><span>Suchen</span><input type="search" data-study-query value="${esc(state.studyQuery || '')}" placeholder="${isMath(state.curriculum) ? 'Thema, Zahl oder Regel suchen' : 'Wort, Übersetzung oder Regel suchen'}"></label><div class="kind-filters" role="group" aria-label="Themen filtern">${button('Alle', 'study-kind', `filter-button ${(state.studyKind || 'all') === 'all' ? 'is-active' : ''}`, `data-kind="all" aria-pressed="${(state.studyKind || 'all') === 'all'}"`)}${kinds.map(kind => button(esc(kindLabel(kind)), 'study-kind', `filter-button ${state.studyKind === kind ? 'is-active' : ''}`, `data-kind="${esc(kind)}" aria-pressed="${state.studyKind === kind}"`)).join('')}</div></div><p class="result-count">${concepts.length} von ${(state.curriculum?.concepts || []).length} Themen</p><div class="study-list">${concepts.map(concept => { const prerequisites = prerequisiteState(concept, state); const available = !prerequisites.locked && conceptCanPractice(concept, state); const detail = concept.kind === 'vocabulary' ? `<p class="vocabulary-pair"><span lang="${esc(contentLanguage(state.curriculum))}">${esc(concept.target || concept.label)}</span><span>${esc(concept.native || '')}</span></p>` : concept.rule ? `<details><summary>Regel und Beispiele</summary><p>${esc(learnerText(concept.rule))}</p>${concept.examples?.length ? `<ul lang="${esc(contentLanguage(state.curriculum))}">${concept.examples.map(example => `<li>${esc(example)}</li>`).join('')}</ul>` : ''}</details>` : `<p>${esc(learnerText(concept.learningGoal || ''))}</p>`; const lockText = prerequisites.locked ? `Zum Üben zuerst: ${prerequisites.missing.map(id => esc(learnerText(state.curriculum.concepts.find(c => c.id === id)?.label || id))).join(', ')} sicherer machen.` : 'Für dieses Thema gibt es noch keine freigeschaltete Übung.'; return `<article class="study-card card"><div class="study-card__head"><div><p class="eyebrow">${esc(kindLabel(concept.kind))}</p><h2>${esc(learnerText(concept.label || concept.target || concept.id))}</h2></div>${available ? '<span class="ready-label">Bereit</span>' : '<span class="lock-label">Noch gesperrt</span>'}</div>${detail}${concept.kind !== 'vocabulary' && concept.rule ? `<p class="learning-goal">${esc(learnerText(concept.learningGoal || ''))}</p>` : ''}${available ? button('Dieses Thema üben', 'practice-concept', 'button button--secondary', `data-concept-id="${esc(concept.id)}"`) : `<p class="unlock-note">${lockText}</p>`}</article>`; }).join('') || '<div class="empty-state"><h2>Keine passenden Themen</h2><p>Versuche es mit einem anderen Wort oder Filter.</p></div>'}</div></section>`);
}
function review(state) {
  const items = getReviewItems(state.curriculum, state.learner);
  return shell(state, `<section class="review-page" aria-labelledby="review-title"><p class="eyebrow">Gezielt wiederholen</p><h1 id="review-title">Deine Wiederholungen</h1><p class="lede">Diese Themen warten, weil sie noch unsicher sind oder wiederholt werden dürfen.</p>${items.length ? `<div class="review-list">${items.map(item => { const concept = state.curriculum.concepts.find(candidate => candidate.id === item.conceptId); const reason = item.reason === 'mistake' ? 'Noch einmal anschauen' : 'Wieder fällig'; const detail = item.reason === 'mistake' ? 'Die letzte Antwort war noch nicht richtig. Eine kurze Wiederholung hilft.' : 'Du hast dieses Thema schon geübt. Jetzt ist ein guter Zeitpunkt, es wieder abzurufen.'; return `<article class="review-item card"><div><p class="eyebrow">${reason}</p><h2>${esc(concept?.label || item.conceptId)}</h2><p>${detail}</p></div></article>`; }).join('')}</div>${button(`Wiederholung starten ${icons.arrow}`, 'start-review', 'button button--primary button--with-icon')}` : `<div class="empty-state"><div class="completion-stamp" aria-hidden="true">${icons.check}</div><h2>Im Moment ist nichts fällig.</h2><p>Du kannst neue Themen lernen oder später wieder vorbeischauen.</p>${button(`Zum Lernbuch ${icons.arrow}`, 'navigate', 'button button--secondary button--with-icon', 'data-view="study"')}</div>`}</section>`);
}

function exerciseBody(exercise, state) {
  const key = draftKey(state, state.index);
  const draft = drafts.get(key);
  const locked = state.feedback || isLocked(state);
  if (exercise.type === 'choice' || exercise.type === 'reading') {
    return `<div class="choices" role="radiogroup" aria-label="Antwortmöglichkeiten" lang="${esc(contentLanguage(state.curriculum))}">${(exercise.choices || []).map(choice => `<button type="button" class="choice ${draft === choice.id ? 'is-selected' : ''}" role="radio" aria-checked="${draft === choice.id}" data-choice="${esc(choice.id)}" ${locked ? 'disabled' : ''}><span class="choice-dot"></span>${esc(choice.text)}</button>`).join('')}</div>`;
  }
  if (exercise.type === 'word-tiles') {
    const selected = Array.isArray(draft) ? draft : [];
    const tiles = exercise.tiles || [];
    return `<div class="tile-answer" aria-live="polite"><p class="answer-slot" lang="${esc(contentLanguage(state.curriculum))}">${selected.length ? selected.map(id => esc(tiles.find(tile => tile.id === id)?.text || '')).join(' ') : 'Wähle die Wörter in der richtigen Reihenfolge.'}</p><button type="button" class="undo-link" data-action="undo-tile" ${selected.length && !locked ? '' : 'disabled'}>Letztes Wort zurücknehmen</button></div><div class="tiles" aria-label="Wortbausteine" lang="${esc(contentLanguage(state.curriculum))}">${tiles.map(tile => `<button type="button" class="tile ${selected.includes(tile.id) ? 'is-used' : ''}" data-tile="${esc(tile.id)}" ${selected.includes(tile.id) || locked ? 'disabled' : ''}>${esc(tile.text)}</button>`).join('')}</div>`;
  }
  if (exercise.type === 'numeric-input' || exercise.type === 'number-list') {
    const error = state.inputError;
    const describedBy = `math-input-help${error ? ' numeric-input-error' : ''}`;
    const input = (value, index = null, fixedFieldCount = null) => `<input id="math-number-${index ?? 'answer'}" ${index === null ? 'data-draft-numeric' : `data-number-entry="${index}"${fixedFieldCount === null ? '' : ` data-number-fields="${fixedFieldCount}"`}`} type="text" inputmode="numeric" maxlength="32" autocomplete="off" spellcheck="false" value="${esc(value)}" aria-describedby="${describedBy}" aria-invalid="${Boolean(error)}" ${locked ? 'readonly' : ''}>`;
    const errorView = error ? `<p id="numeric-input-error" class="numeric-input-error" role="alert">${esc(error)}</p>` : '';
    if (exercise.type === 'numeric-input') return `<div class="math-answer"><label class="text-field" for="math-number-answer"><span>Deine Zahl</span>${input(draft || '')}</label><p id="math-input-help" class="math-input-help">Gib eine ganze Zahl von 0 bis 999999 ein.</p>${errorView}</div>`;
    const fixedSequence = exercise.comparison === 'sequence';
    const draftValues = Array.isArray(draft) ? draft : [];
    const values = fixedSequence ? exercise.expectedValues.map((_, index) => draftValues[index] ?? '') : draftValues.length ? draftValues : [''];
    const comparisonHint = { set: 'Die Reihenfolge ist egal. Trage jede Zahl nur einmal ein.', sequence: 'Die Reihenfolge zählt. Trage die Zahlen in der geforderten Reihenfolge ein.', multiset: 'Die Reihenfolge ist egal. Trage gleiche Faktoren so oft ein, wie sie vorkommen.' }[exercise.comparison];
    const fixedFields = `<div class="number-list__fixed-fields">${values.map((value, index) => `${index ? '<span class="number-list__separator" aria-hidden="true">,</span>' : ''}<div class="number-list__fixed-item"><label class="number-list__fixed-label" for="math-number-${index}">Zahl ${index + 1} von ${values.length}</label>${input(value, index, values.length)}</div>`).join('')}</div>`;
    const flexibleFields = `<div class="number-list__fields">${values.map((value, index) => `<div class="number-list__row"><label for="math-number-${index}">Zahl ${index + 1}</label>${input(value, index)}${button('Entfernen', 'remove-number', 'button button--quiet', `data-number-index="${index}" aria-label="Zahl ${index + 1} entfernen" ${locked || values.length === 1 ? 'disabled' : ''}`)}</div>`).join('')}</div>`;
    return `<fieldset class="math-answer number-list ${fixedSequence ? 'number-list--fixed' : ''}"><legend>Deine Zahlen</legend><p id="math-input-help" class="math-input-help">${esc(comparisonHint)} Ganze Zahlen von 0 bis 999999; höchstens 20 Zahlen.</p>${fixedSequence ? fixedFields : flexibleFields}${fixedSequence ? '' : button('Zahl hinzufügen', 'add-number', 'button button--secondary', locked || values.length >= 20 ? 'disabled' : '')}${errorView}</fieldset>`;
  }
  if (exercise.type === 'writing') {
    return `<label class="writing-field"><span>Dein Satz auf ${esc(subjectName(state.curriculum))}</span><textarea data-draft-writing rows="5" lang="${esc(contentLanguage(state.curriculum))}" placeholder="Schreibe hier deine Antwort …" ${locked ? 'readonly' : ''}>${esc(draft || '')}</textarea><small>Du vergleichst deine Antwort gleich selbst mit einem Beispiel.</small></label>`;
  }
  return `<label class="text-field"><span>Deine Antwort</span><input data-draft-text type="text" lang="${esc(contentLanguage(state.curriculum))}" autocomplete="off" value="${esc(draft || '')}" placeholder="Schreibe deine Antwort …" ${locked ? 'readonly' : ''}></label>`;
}

function feedback(exercise, state) {
  const result = state.feedback;
  if (!result) return '';
  const key = draftKey(state, state.index);
  const writingPrompt = exercise.type === 'writing' && result.correct === null && !result.selfCheck;
  if (writingPrompt) return `<section class="feedback feedback--notice" role="status"><div class="feedback-icon">${icons.book}</div><div><p class="eyebrow">Vergleiche in Ruhe</p><h2>Ein mögliches Beispiel</h2><p class="model-answer" lang="${esc(contentLanguage(state.curriculum))}">${esc(exercise.modelAnswer || result.expectedAnswer || '')}</p><p>Deine Antwort muss nicht genau gleich sein. Prüfe: ${esc((exercise.checklist || []).join(' · '))}</p></div>${button(`${icons.check} Ich habe verglichen`, 'self-check', 'button button--primary button--with-icon')}</section>`;
  const correct = result.correct;
  if (exercise.type === 'writing' && correct === null) return `<section class="feedback feedback--success" role="status"><div class="feedback-icon">${icons.check}</div><div><p class="eyebrow">Selbst geprüft</p><h2>Gut, dass du deinen Satz verglichen hast.</h2><p>Du kannst jetzt zur nächsten Aufgabe gehen.</p></div>${button(`Weiter ${icons.arrow}`, 'next', 'button button--primary button--with-icon')}</section>`;
  const eyebrow = correct ? 'Gut gemacht' : result.near ? 'Fast — schau noch mal hin' : 'Noch nicht — so ist es richtig';
  return `<section class="feedback feedback--${correct ? 'success' : 'error'}" role="status"><div class="feedback-icon">${correct ? icons.check : '!'}</div><div><p class="eyebrow">${eyebrow}</p><h2>${correct ? 'Das stimmt.' : `Richtig ist: ${esc(result.expectedAnswer || '')}`}</h2>${result.explanation ? `<p>${esc(result.explanation)}</p>` : ''}</div>${button(`Weiter ${icons.arrow}`, 'next', 'button button--primary button--with-icon')}</section>`;
}

function session(state) {
  const exercise = state.session?.exercises?.[state.index];
  if (!exercise) return shell(state, '<section class="empty-state"><h1>Diese Runde ist fertig vorbereitet.</h1></section>');
  const total = state.session.exercises.length;
  const index = state.index + 1;
  const submitLabel = exercise.type === 'writing' ? 'Beispiel ansehen' : 'Antwort prüfen';
  const reading = exercise.type === 'reading' && exercise.passage ? `<blockquote class="reading-passage" lang="${esc(contentLanguage(state.curriculum))}">${esc(exercise.passage)}</blockquote>` : '';
  const prompt = exercise.type === 'reading' ? (exercise.question || exercise.prompt) : (exercise.prompt || exercise.question);
  return `<div class="session-shell"><header class="session-head"><button type="button" class="leave-button" data-action="exit">Runde verlassen</button>${mountainRoute(state)}<span class="session-mode">${state.session.mode === 'review' ? 'Wiederholen' : 'Lernen'}</span></header><main id="main" class="exercise-main" tabindex="-1">${noticeBanner(state)}<article class="exercise-card" aria-labelledby="exercise-title"><p class="eyebrow">${esc(({choice:'Wähle aus',reading:'Lesen & verstehen','text-input':'Erinnere dich','word-tiles':'Baue einen Satz',writing:'Schreibwerkstatt','numeric-input':'Zahl eingeben','number-list':'Zahlen sammeln'})[exercise.type] || 'Übung')}</p>${reading}<h1 id="exercise-title">${esc(prompt || 'Wähle die richtige Antwort.')}</h1>${exercise.hint ? `<p class="exercise-hint">${esc(exercise.hint)}</p>` : ''}${exercise.audioText ? `<button class="audio-button" type="button" data-audio="${esc(exercise.audioText)}">${icons.volume} Vorlesen</button>` : ''}<div class="exercise-answer">${exerciseBody(exercise, state)}</div>${!state.feedback ? button(submitLabel, 'submit', 'button button--primary submit-button') : ''}</article>${feedback(exercise, state)}</main></div>`;
}

function complete(state) {
  const summary = state.summary || { xp: 0, gems: 0, correct: 0, total: 0 };
  const missed = summary.missedConcepts || [];
  const resolved = summary.resolvedConcepts || [];
  const isReview = summary.mode === 'review';
  const names = list => list.map(item => esc(item.label)).join(', ');
  const headline = isReview ? (missed.length ? 'Ein Stück weiter aufgelöst.' : 'Das sitzt jetzt sicherer.') : 'Das war eine gute Runde.';
  const lede = isReview
    ? (missed.length ? `${names(resolved) ? `${names(resolved)} sitzt jetzt sicherer. ` : ''}${names(missed)} braucht noch eine Runde.` : `${names(resolved) || 'Dieses Thema'} war noch unsicher — jetzt hast du es richtig gelöst.`)
    : 'Du hast dir Zeit genommen und weitergeübt. Dein Lernbuch ist ein Stück voller geworden.';
  // Peak-end moment: name what's still open instead of letting the tally speak for it, and offer a direct way back in.
  const openNote = !isReview && missed.length
    ? `<p class="complete-open-note">${names(missed)} kommt in einer der nächsten Runden wieder.</p>`
    : '';
  const secondaryAction = missed.length ? button(`Das gleich üben ${icons.arrow}`, 'start-review', 'button button--secondary button--with-icon') : '';
  return shell(state, `<section class="complete" aria-labelledby="complete-title"><div class="completion-stamp" aria-hidden="true">${icons.check}</div><p class="eyebrow">Etappe geschafft</p><h1 id="complete-title">${headline}</h1><p class="lede">${lede}</p>${openNote}${summary.selfChecks ? `<p>${summary.selfChecks} Schreibaufgabe${summary.selfChecks === 1 ? '' : 'n'} selbst geprüft · ohne automatische Bewertung</p>` : ''}${completionStamps(state)}<div class="summary-row"><div><strong>${summary.correct}/${summary.total}</strong><span>richtig</span></div><div><strong>+${summary.xp}</strong><span>Punkte</span></div><div><strong>+${summary.gems}</strong><span>Runde geschafft</span></div></div><div class="complete-actions">${button(`Zur Übersicht ${icons.arrow}`, 'navigate', 'button button--primary button--with-icon', 'data-view="home"')}${secondaryAction}</div></section>`);
}

function library(state) {
  return shell(state, `<section class="utility-page" aria-labelledby="library-title">
    <p class="eyebrow">Dein Lernbuch</p><h1 id="library-title">Üben & verwalten</h1>
    <p class="lede">Dein Material und dein Fortschritt liegen nur auf diesem Gerät. Browserspeicher ist kein Tresor: Löschst du die Browserdaten oder geht das Gerät verloren, ist der Lernstand weg — bis du ihn selbst gesichert hast.</p>
    <div class="import-preview__actions">${button('Meine Lernbücher', 'navigate', 'button button--secondary', 'data-view="books"')}${button('Sammelmappe', 'navigate', 'button button--secondary', 'data-view="album"')}${button('Alles sichern', 'export-profile', 'button button--primary')}</div><div class="library-handoff">
      <article class="card utility-card"><div class="utility-icon">${icons.archive}</div><h2>Lernstoff importieren</h2><p>Kopiere die JSON-Antwort aus ChatGPT hierher oder wähle eine Datei. Erst in der Vorschau übernimmst du den neuen Lernstoff.</p><div class="import-entry-actions">${button('Text einfügen', 'navigate', 'button button--primary', 'data-view="import-text"')}<label class="button button--secondary file-button">Datei auswählen<input type="file" accept="application/json,.json" data-import-file></label></div></article>
      <div class="card authoring-entry scout-authoring-entry"><div class="authoring-entry__copy"><h2>Eigenen Lernstoff erstellen</h2><p>Aus deinem Schulmaterial wird dein eigener Lernpfad. Mit Anleitung und Prompt für Sprachen oder Mathematik.</p>${button('Anleitung & Prompt', 'navigate', 'button button--primary', 'data-view="authoring"')}</div>${fieldKitArtwork()}</div>
    </div>
    <div class="utility-grid">
      <article class="card utility-card"><div class="utility-icon">${icons.route}</div><h2>Dieses Lernbuch sichern</h2><p>Sichere den aktuellen Lernstoff und seinen Lernstand. „Alles sichern“ enthält zusätzlich die anderen Lernbücher und deine Sammelmappe.</p>${button('Sicherung exportieren', 'export-backup', 'button button--secondary')}</article>
      <article class="card utility-card"><div class="utility-icon">${icons.spark}</div><h2>Lernstoff teilen</h2><p>Exportiere nur das Lernbuch ohne deinen Fortschritt.</p>${button('Lernstoff exportieren', 'export-curriculum', 'button button--secondary')}</article>
      <article class="card utility-card"><div class="utility-icon">${icons.book}</div><h2>Beispiel starten</h2><p>Öffne die kleine Holiday-Stories-Lernreise.</p>${button('Beispiel laden', 'load-example', 'button button--secondary')}</article>
      <article class="card utility-card"><div class="utility-icon">${icons.spark}</div><h2>Mathe ausprobieren</h2><p>Entdecke Teilbarkeit und Primzahlen mit Zahlen, Regeln und kurzen Aufgaben.</p>${button('Mathe-Beispiel laden', 'load-math-example', 'button button--secondary')}</article>
    </div>
  </section>`);
}

function exerciseLabel(type) { return ({ choice: 'Auswahl', reading: 'Lesen & verstehen', 'text-input': 'Antwort eingeben', 'word-tiles': 'Satz bauen', writing: 'Schreibwerkstatt', 'numeric-input': 'Zahl eingeben', 'number-list': 'Zahlenliste' })[type] || type || 'Unbekannt'; }
function importSourceText(source) {
  const kind = ({ 'textbook-page': 'Lehrbuchseite', 'teacher-note': 'Lehrkraft-Notiz', worksheet: 'Arbeitsblatt', vocabulary: 'Wortschatzliste', grammar: 'Grammatikhinweis' })[source.kind] || 'Quellhinweis';
  return [kind, source.page ? `Seite ${source.page}` : '', source.file, source.notes].filter(Boolean).join(' · ');
}
function importPrompt(exercise) { return exercise.question || exercise.prompt || exercise.modelAnswer || exercise.id || 'Ohne Vorschau'; }
function importPreview(state) {
  const pending = state.pendingImport;
  if (pending?.profile) return shell(state, profileImportView(state, esc, button));
  if (!pending?.curriculum) return library(state);
  const curriculum = pending.curriculum;
  const report = pending.report || {};
  const exercises = curriculum.exercises || [];
  const concepts = curriculum.concepts || [];
  const incomingLearner = pending.learner;
  const sourceText = (curriculum.sources || []).map(importSourceText).filter(Boolean);
  const conceptLabel = id => curriculum.concepts?.find(concept => concept.id === id)?.label || id;
  const typeCounts = [...exercises.reduce((counts, exercise) => counts.set(exercise.type, (counts.get(exercise.type) || 0) + 1), new Map()).entries()];
  const currentSession = state.session;
  const currentCourse = state.curriculum;
  const disabled = isLocked(state);
  const disabledAttribute = disabled ? 'disabled aria-disabled="true"' : '';
  const importKind = incomingLearner ? 'Sicherung mit Lernstand' : 'Lernstoff ohne Lernstand';
  const backupSummary = incomingLearner ? `<p class="import-preview__backup"><strong>${incomingLearner.xp || 0} Punkte</strong> und <strong>${(incomingLearner.completedSessionIds || []).length} abgeschlossene Runde${(incomingLearner.completedSessionIds || []).length === 1 ? '' : 'n'}</strong> werden mit importiert. Dieser gespeicherte Fortschritt kann weitere Übungen freischalten.</p>` : pending.action === 'open' ? '<p class="import-preview__backup">Dein vorhandener Lernstand und deine pausierte Runde bleiben erhalten.</p>' : '<p class="import-preview__backup">Dieser Lernstoff enthält keinen Lernstand. Der neue Kurs beginnt ohne importierten Fortschritt.</p>';
  const availability = Number.isFinite(report.availableExerciseCount) ? report.availableExerciseCount : exercises.length;
  const locked = Number.isFinite(report.lockedExerciseCount) ? report.lockedExerciseCount : 0;
  const unreachable = report.unreachableConceptIds || [];
  const unused = report.unusedConceptIds || [];
  return shell(state, `<section class="import-preview" aria-labelledby="import-preview-title">
    <p class="eyebrow">Import prüfen</p>
    <h1 id="import-preview-title">${pending.fromText ? 'Dein Lernstoff ist bereit zur Vorschau.' : 'Deine Datei ist bereit zur Vorschau.'}</h1>
    <p class="import-preview__filename">${pending.fromText ? 'Quelle' : 'Datei'}: ${esc(pending.fileName || 'Ausgewählte JSON-Datei')}</p>
    <p class="lede">Das Dateiformat passt. Bitte prüfe auch, ob Inhalte und Lösungen zu deinem Unterricht passen.</p>
    <article class="card import-preview__course">
      <div class="import-preview__course-head"><div><p class="eyebrow">${esc(importKind)}</p><h2>${esc(curriculum.title || curriculum.id || 'Unbenannter Lernstoff')}</h2><p>Version ${esc(curriculum.version || '–')} · ${esc(curriculumLanguageLabel(curriculum))}</p></div><span class="import-preview__mark" aria-hidden="true">${icons.check}</span></div>
      <div class="import-preview__counts" aria-label="Umfang des neuen Lernstoffs"><div><strong>${concepts.length}</strong><span>Themen</span></div><div><strong>${exercises.length}</strong><span>Übungen</span></div></div>
      ${backupSummary}
    </article>
    <section class="import-preview__section" aria-labelledby="import-types-title"><h2 id="import-types-title">Übungsformen im neuen Lernstoff</h2><ul class="import-preview__type-list">${typeCounts.map(([type, count]) => `<li><span>${esc(exerciseLabel(type))}</span><strong>${count}</strong></li>`).join('') || '<li><span>Keine Übungen</span><strong>0</strong></li>'}</ul></section>
    <section class="import-preview__section" aria-labelledby="import-examples-title"><h2 id="import-examples-title">${exercises.length < 3 ? 'Beispielaufgaben' : 'Drei Beispielaufgaben'}</h2><p>Nur zur Orientierung: Die Vorschau verändert nichts.</p><details class="import-preview__details"><summary>Beispiele anzeigen</summary><ol>${exercises.slice(0, 3).map(exercise => `<li><span>${esc(exerciseLabel(exercise.type))}</span><p lang="${esc(curriculum.instructionLanguage || curriculum.sourceLanguage || 'de')}">${esc(importPrompt(exercise))}</p></li>`).join('') || '<li>Keine Beispielaufgabe vorhanden.</li>'}</ol></details></section>
    <section class="import-preview__section" aria-labelledby="import-sources-title"><h2 id="import-sources-title">Quellhinweise</h2><p>Die ${sourceText.length} Angabe${sourceText.length === 1 ? '' : 'n'} ${sourceText.length === 1 ? 'beschreibt' : 'beschreiben'} nur die Herkunft im Import. Lernpfad öffnet oder lädt daraus keine Dateien.</p><details class="import-preview__details"><summary>Quellhinweise anzeigen</summary><ul class="import-preview__sources">${sourceText.map(text => `<li>${esc(text)}</li>`).join('') || '<li>Keine Quellhinweise vorhanden.</li>'}</ul></details></section>
    <section class="import-preview__section import-preview__validation" aria-labelledby="import-validation-title"><h2 id="import-validation-title">Übungen ohne bisherigen Lernstand</h2><p><strong>${availability}</strong> Übung${availability === 1 ? '' : 'en'} ${availability === 1 ? 'wäre' : 'wären'} zu Beginn verfügbar. <strong>${locked}</strong> ${locked === 1 ? 'bliebe' : 'blieben'} zunächst gesperrt, weil ein vorausgesetztes Thema noch geübt werden muss.</p>${unreachable.length ? `<p class="import-preview__warning">${unreachable.length} ${unreachable.length === 1 ? 'Thema ist' : 'Themen sind'} aus den Übungsbeziehungen nicht erreichbar: ${esc(unreachable.map(conceptLabel).join(', '))}.</p>` : unused.length ? '' : '<p class="import-preview__ok">Alle Themen sind über mindestens eine Übung erreichbar.</p>'}${unused.length ? `<p class="import-preview__warning">${unused.length} ${unused.length === 1 ? 'Thema wird' : 'Themen werden'} von keiner Übung verwendet: ${esc(unused.map(conceptLabel).join(', '))}.</p>` : ''}</section>
    <section class="import-preview__section import-preview__replacement" aria-labelledby="import-replacement-title"><h2 id="import-replacement-title">Was beim Übernehmen passiert</h2>${bookImportMessage(state, esc)}<p>„Alles sichern“ enthält alle Lernbücher und deine Sammelmappe. „Aktuelle Sicherung exportieren“ enthält nur das gerade geöffnete Lernbuch.</p><div class="import-preview__actions">${button('Alles sichern', 'export-profile', 'button button--secondary', disabledAttribute)}${button('Aktuelle Sicherung exportieren', 'export-backup', 'button button--secondary', disabledAttribute)}${button('Import übernehmen', 'confirm-import', 'button button--primary', disabledAttribute)}${pending.fromText ? button('Text bearbeiten', 'navigate', 'button button--secondary', 'data-view="import-text"') : ''}${button('Abbrechen', 'cancel-import', 'button button--quiet', disabledAttribute)}</div></section>
  </section>`);
}

function progressView(state) {
  const items = conceptProgress(state);
  return shell(state, `<section class="progress-page" aria-labelledby="progress-title"><p class="eyebrow">Dein Weg</p><h1 id="progress-title">Fortschritt</h1><p class="lede">Der Übungsstand zeigt, wie oft Antworten in Lernpfad richtig waren. Er ist keine Note oder Prüfung.</p><div class="progress-overview card"><div><span class="stamp">${items.length} Themen</span><h2>Du baust dein Wissen Schritt für Schritt auf.</h2></div><div class="compass" aria-hidden="true">${icons.route}</div></div><section class="concept-list" aria-label="Themenfortschritt">${items.length ? items.map(item => { const level = Math.round((item.mastery || 0) * 100); const label = item.concept.label || item.concept.learningGoal || item.concept.id; return `<article class="concept-row"><div><h2>${esc(label)}</h2><p>${!item.attempts ? 'Noch nicht geübt' : item.concept.kind === 'writing-skill' ? 'Selbst geprüft · ohne automatische Bewertung' : level >= 80 ? 'Oft richtig geübt' : level >= 45 ? 'Schon gut geübt' : isDue(item) ? 'Jetzt zum Wiederholen bereit' : 'Weiter üben'}</p></div><div class="mastery"><progress aria-label="${esc(label)}: Übungsstand ${level} Prozent" value="${level}" max="100">${level}%</progress><span>${level}%<small>Übungsstand</small></span></div></article>`; }).join('') : '<div class="empty-state"><h2>Deine ersten Spuren erscheinen nach einer Lernrunde.</h2><p>Starte eine kurze Runde und komm dann hierher zurück.</p></div>'}</section></section>`);
}

export function renderApp(root, state, actions) {
  const draftContext = `${state.profile?.activeBookId || 'book'}:${state.session?.id || 'session'}`;
  if (draftContext !== draftSession) { drafts.clear(); draftSession = draftContext; }
  const active = root.contains(document.activeElement) ? document.activeElement : null;
  const activeField = active?.matches('[data-draft-text], [data-draft-writing], [data-draft-numeric], [data-number-entry], [data-study-query], [data-import-text], [data-book-title]') ? { selector: active.matches('[data-draft-numeric], [data-number-entry]') ? `#${active.id}` : active.matches('[data-book-title]') ? `#${active.id}` : active.matches('[data-import-text]') ? '[data-import-text]' : active.matches('textarea') ? '[data-draft-writing]' : active.matches('[data-study-query]') ? '[data-study-query]' : '[data-draft-text]', start: active.selectionStart, end: active.selectionEnd } : null;
  const views = { books: state => shell(state, booksView(state, esc, button)), album: state => shell(state, albumView(state, esc, button)), rest: state => shell(state, restView(state, button)), 'import-text': state => shell(state, importTextView(state, esc, button)), authoring: state => shell(state, authoringView(state, esc, button)), home, session, complete, library, progress: progressView, study, review, 'import-preview': importPreview };
  root.innerHTML = (views[state.view] || home)(state);
  root.querySelectorAll('[data-action]').forEach(control => control.addEventListener('click', () => {
    const action = control.dataset.action;
    const exercise = state.session?.exercises?.[state.index];
    const key = draftKey(state, state.index);
    if (action === 'validate-pasted-import') actions.validatePastedImport(root.querySelector('[data-import-text]')?.value);
    if (action === 'open-book') actions.openBook(control.dataset.bookId);
    if (action === 'rename-book') actions.renameBook(control.dataset.bookId, [...root.querySelectorAll('[data-book-title]')].find(input => input.dataset.bookId === control.dataset.bookId)?.value);
    if (action === 'export-profile') actions.exportProfile();
    if (action === 'continue-rest') actions.continueAfterRest();
    if (action === 'copy-authoring') actions.copyAuthoringPrompt();
    if (action === 'download-authoring') actions.downloadAuthoringPrompt();
    if (action === 'download-schema') actions.downloadSchema();
    if (action === 'navigate') actions.navigate(control.dataset.view);
    if (action === 'start-learn') state.session ? actions.resumeSession() : actions.startSession('learn');
    if (action === 'start-review') actions.startSession('review');
    if (action === 'practice-concept') actions.startSession('learn', [control.dataset.conceptId]);
    if (action === 'study-kind') { pendingFocus = { type: 'study-kind', id: control.dataset.kind }; actions.setStudyKind(control.dataset.kind); }
    if (action === 'exit') actions.exitSession();
    if (action === 'next') actions.next();
    if (action === 'load-example') actions.loadExample({ example: control.dataset.example, keepActiveBook: control.dataset.keepActiveBook === 'true' });
    if (action === 'load-math-example') actions.loadMathExample({ keepActiveBook: control.dataset.keepActiveBook === 'true' });
    if (action === 'export-backup') actions.exportBackup();
    if (action === 'export-curriculum') actions.exportCurriculum();
    if (action === 'confirm-import') actions.confirmImport();
    if (action === 'cancel-import') actions.cancelImport();
    if (action === 'self-check') { actions.submit({ text: drafts.get(key) || '', selfChecked: true }); }
    if (action === 'undo-tile') { const current = Array.isArray(drafts.get(key)) ? drafts.get(key) : []; drafts.set(key, current.slice(0, -1)); pendingFocus = { type: 'tile-next' }; renderApp(root, state, actions); }
    if ((action === 'add-number' || action === 'remove-number') && !state.feedback && !isLocked(state)) {
      const values = Array.isArray(drafts.get(key)) ? [...drafts.get(key)] : [''];
      if (action === 'add-number' && values.length < 20) { values.push(''); pendingFocus = { type: 'number', index: values.length - 1 }; }
      if (action === 'remove-number' && values.length > 1) { const index = Number(control.dataset.numberIndex); values.splice(index, 1); pendingFocus = { type: 'number', index: Math.min(index, values.length - 1) }; }
      drafts.set(key, values); state.inputError = null; renderApp(root, state, actions);
    }
    if (action === 'submit') {
      const math = ['numeric-input', 'number-list'].includes(exercise?.type);
      const answer = exercise?.type === 'writing' ? { text: drafts.get(key) || '' } : drafts.get(key) ?? (exercise?.type === 'number-list' ? [''] : '');
      if (!math && (answer === undefined || answer === '' || (Array.isArray(answer) && !answer.length))) return;
      actions.submit(answer);
    }
  }));
  root.querySelectorAll('[data-choice]').forEach(control => {
    const select = () => { drafts.set(draftKey(state, state.index), control.dataset.choice); pendingFocus = { type: 'choice', id: control.dataset.choice }; renderApp(root, state, actions); };
    control.addEventListener('click', select);
    control.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) return;
      event.preventDefault();
      const choices = [...root.querySelectorAll('[data-choice]')];
      const delta = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
      const next = choices[(choices.indexOf(control) + delta + choices.length) % choices.length];
      next.click();
    });
  });
  root.querySelectorAll('[data-tile]').forEach(control => control.addEventListener('click', () => { const key = draftKey(state, state.index); drafts.set(key, [...(drafts.get(key) || []), control.dataset.tile]); pendingFocus = { type: 'tile-next' }; renderApp(root, state, actions); }));
  root.querySelectorAll('[data-draft-text], [data-draft-writing]').forEach(control => control.addEventListener('input', () => drafts.set(draftKey(state, state.index), control.value)));
  root.querySelectorAll('[data-draft-numeric], [data-number-entry]').forEach(input => {
    input.addEventListener('input', () => {
      const key = draftKey(state, state.index);
      if (input.matches('[data-number-entry]')) {
        const existing = Array.isArray(drafts.get(key)) ? drafts.get(key) : [];
        const fixedFieldCount = Number(input.dataset.numberFields);
        const values = fixedFieldCount ? Array.from({ length: fixedFieldCount }, (_, index) => existing[index] ?? '') : [...existing.length ? existing : ['']];
        values[Number(input.dataset.numberEntry)] = input.value;
        drafts.set(key, values);
      }
      else drafts.set(key, input.value);
      state.inputError = null;
      root.querySelector('#numeric-input-error')?.remove();
      root.querySelectorAll('[data-draft-numeric], [data-number-entry]').forEach(field => { field.setAttribute('aria-invalid', 'false'); field.setAttribute('aria-describedby', 'math-input-help'); });
    });
    input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.isComposing) { event.preventDefault(); root.querySelector('[data-action="submit"]:not(:disabled)')?.click(); } });
  });
  root.querySelectorAll('[data-book-title]').forEach(input => input.addEventListener('input', () => { state.bookTitleDrafts[input.dataset.bookId] = input.value; }));
  root.querySelectorAll('[data-study-query]').forEach(input => input.addEventListener('input', () => actions.setStudyQuery(input.value)));
  root.querySelectorAll('[data-import-text]').forEach(input => input.addEventListener('input', () => { state.importTextDraft = input.value; state.importTextError = null; root.querySelector('#import-text-error')?.remove(); input.setAttribute('aria-invalid', 'false'); input.setAttribute('aria-describedby', 'import-text-help'); }));
  root.querySelectorAll('[data-authoring-subject]').forEach(input => input.addEventListener('change', () => actions.setAuthoringSubject(input.value)));
  root.querySelectorAll('[data-authoring-language]').forEach(input => input.addEventListener('change', () => actions.setAuthoringLanguage(input.value)));
  root.querySelectorAll('[data-import-file]').forEach(input => { input.disabled = Boolean(state.busy || state.readOnly); input.addEventListener('change', () => input.files?.[0] && actions.importFile(input.files[0])); });
  root.querySelectorAll('[data-audio]').forEach(control => control.addEventListener('click', () => actions.playAudio(control.dataset.audio)));
  const currentExercise = state.session?.exercises?.[state.index];
  const hasAnswer = () => {
    const value = drafts.get(draftKey(state, state.index));
    if (['numeric-input', 'number-list'].includes(currentExercise?.type)) return true;
    if (currentExercise?.type === 'word-tiles') return Array.isArray(value) && value.length === currentExercise.tiles.length;
    return typeof value === 'string' && Boolean(value.trim());
  };
  const submitControl = root.querySelector('[data-action="submit"]');
  if (submitControl) submitControl.disabled = !hasAnswer();
  root.querySelectorAll('[data-draft-text], [data-draft-writing]').forEach(input => input.addEventListener('input', () => {
    if (submitControl) submitControl.disabled = isLocked(state) || !hasAnswer();
  }));
  root.querySelectorAll('[data-action]').forEach(control => {
    const mutating = ['start-learn', 'start-review', 'practice-concept', 'load-example', 'load-math-example', 'add-number', 'remove-number', 'submit', 'self-check', 'confirm-import', 'cancel-import', 'validate-pasted-import', 'open-book', 'rename-book', 'continue-rest'].includes(control.dataset.action);
    control.disabled = control.disabled || Boolean(state.busy || (state.readOnly && mutating));
  });
  {
    let focus;
    if (pendingFocus?.type === 'number') focus = root.querySelector(`#math-number-${pendingFocus.index}`);
    if (pendingFocus?.type === 'choice') focus = [...root.querySelectorAll('[data-choice]')].find(node => node.dataset.choice === pendingFocus.id);
    if (pendingFocus?.type === 'tile-next') focus = root.querySelector('[data-tile]:not(:disabled)') || root.querySelector('[data-action="submit"]');
    if (pendingFocus?.type === 'study-kind') focus = [...root.querySelectorAll('[data-action="study-kind"]')].find(node => node.dataset.kind === pendingFocus.id);
    pendingFocus = null;
    const target = focus || (activeField && root.querySelector(activeField.selector));
    target?.focus({ preventScroll: true });
    if (!focus && activeField && target) target.setSelectionRange(activeField.start, activeField.end);
  }
}
