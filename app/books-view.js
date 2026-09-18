import { subjectName } from './study-language.js';
const bookTitle = book => book.title || book.workspace?.curriculum?.title || 'Lernbuch';
const lock = state => state.busy || state.readOnly ? 'disabled aria-disabled="true"' : '';

function dateLabel(value) {
  if (typeof value !== 'string' || !value || !Number.isFinite(Date.parse(value))) return null;
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

function sourceHints(curriculum) {
  return [...new Set((curriculum.sources || []).map(source => [source.file, source.page !== undefined && source.page !== null && source.page !== '' ? `Seite ${source.page}` : ''].filter(Boolean).join(' · ')).filter(Boolean))];
}

function bookCard(book, index, state, esc, button) {
  const workspace = book.workspace || {};
  const curriculum = workspace.curriculum || {};
  const learner = workspace.learner || {};
  const selected = book.id === state.profile.activeBookId;
  const title = bookTitle(book);
  const sources = sourceHints(curriculum);
  const imported = dateLabel(book.importedAt);
  const answers = learner.answerRecords || [];
  const lastAnswer = answers.reduce((latest, answer) => Number.isFinite(Date.parse(answer.answeredAt)) && (!latest || Date.parse(answer.answeredAt) > Date.parse(latest)) ? answer.answeredAt : latest, null);
  const lastPractised = dateLabel(lastAnswer);
  const concepts = curriculum.concepts || [];
  const started = concepts.filter(concept => (learner.conceptProgress?.[concept.id]?.attempts || 0) > 0).length;
  const rounds = (learner.completedSessionIds || []).length;
  const roundLength = workspace.session?.exercises?.length || 0;
  const completed = Math.min(roundLength, Math.max(0, (Number.isInteger(workspace.index) ? workspace.index : 0) + (workspace.feedback ? 1 : 0)));
  const attributes = `data-book-id="${esc(book.id)}" ${lock(state)}`;
  return `<article class="card book-card ${selected ? 'book-card--selected' : ''}" aria-labelledby="book-title-${index}">
    <div class="book-card__head"><p class="eyebrow">${esc(subjectName(curriculum))}</p>${selected ? '<span class="book-card__selected">Ausgewählt</span>' : ''}</div>
    <h2 id="book-title-${index}">${esc(title)}</h2>
    ${sources.length ? `<ul class="book-card__sources" aria-label="Quelldateien und Seiten">${sources.map(source => `<li>${esc(source)}</li>`).join('')}</ul>` : '<p class="book-card__meta">Keine Datei- oder Seitenangaben vorhanden.</p>'}
    <p class="book-card__meta">${imported ? `Importiert am ${esc(imported)}` : 'Importdatum nicht erfasst'}<br>${lastPractised ? `Zuletzt geübt am ${esc(lastPractised)}` : 'Noch keine Antwort gespeichert'}</p>
    <dl class="book-card__counts"><div><dt>Übungen</dt><dd>${(curriculum.exercises || []).length}</dd></div><div><dt>Themen begonnen</dt><dd>${started} / ${concepts.length}</dd></div><div><dt>Runden geschafft</dt><dd>${rounds}</dd></div></dl>
    ${roundLength ? `<p class="book-card__paused">Runde pausiert · ${completed} von ${roundLength} Aufgaben beantwortet. Du kannst im Buch weiterlernen.</p>` : '<p class="book-card__meta">Keine pausierte Runde</p>'}
    <div class="book-card__open">${button(selected ? 'Zum ausgewählten Buch' : 'Buch öffnen', 'open-book', selected ? 'button button--primary' : 'button button--secondary', attributes)}</div>
    <div class="book-card__rename"><label for="book-rename-${index}">Buchtitel bearbeiten</label><div><input id="book-rename-${index}" type="text" name="book-title" data-book-title data-book-id="${esc(book.id)}" value="${esc(state.bookTitleDrafts?.[book.id] ?? title)}" maxlength="200" autocomplete="off" ${lock(state)}>${button('Titel speichern', 'rename-book', 'button button--secondary', attributes)}</div></div>
  </article>`;
}

export function booksView(state, esc, button) {
  const books = state.profile?.books || [];
  return `<section class="books-page" aria-labelledby="books-title">
    <p class="eyebrow">Deine Sammlung</p><h1 id="books-title">Meine Lernbücher</h1>
    <p class="lede">Wechsle zwischen deinen Büchern in dieser Sammlung. Jedes behält seinen Lernstand und seine pausierte Runde.</p>

    <section class="card books-examples" aria-labelledby="books-examples-title"><div><p class="eyebrow">Schnell testen</p><h2 id="books-examples-title">Beispiel-Lernbücher hinzufügen</h2><p>Füge Mathe oder Französisch einzeln über die gewohnte Importvorschau hinzu. Dein aktuell ausgewähltes Buch bleibt geöffnet.</p></div><div class="books-examples__actions">${button('Französisch-Beispiel hinzufügen', 'load-example', 'button button--secondary', 'data-example="french" data-keep-active-book="true"')}${button('Mathe-Beispiel hinzufügen', 'load-math-example', 'button button--secondary', 'data-keep-active-book="true"')}</div></section>
    <div class="books-toolbar"><p>${books.length} ${books.length === 1 ? 'Lernbuch' : 'Lernbücher'}</p><div>${button('Text einfügen', 'navigate', 'button button--secondary', 'data-view="import-text"')}${button('Datei & Import-Auswahl', 'navigate', 'button button--secondary', 'data-view="library"')}</div></div>
    <div class="books-grid">${books.map((book, index) => bookCard(book, index, state, esc, button)).join('') || '<div class="empty-state"><h2>Platz für dein erstes Lernbuch</h2><p>Füge Lernstoff als Text ein oder wähle eine JSON-Datei in der Import-Auswahl.</p></div>'}</div>
    <section class="card books-backup" aria-labelledby="books-backup-title"><div><h2 id="books-backup-title">Deine ganze Sammlung mitnehmen</h2><p>„Alles sichern“ enthält alle Lernbücher, Lernstände und gesammelten Stempel. Beantwortete Aufgaben bleiben gesichert; auf einem anderen Gerät beginnst du eine neue Runde. Bewahre die Datei auf, damit du deine Sammlung auch nach einem Gerätewechsel oder dem Löschen von Browserdaten wiederherstellen kannst.</p></div>${button('Alles sichern', 'export-profile', 'button button--primary', state.busy ? 'disabled aria-disabled="true"' : '')}</section>
  </section>`;
}

export function profileImportView(state, esc, button) {
  const incoming = state.pendingImport?.profile;
  if (!incoming) return booksView(state, esc, button);
  const books = incoming.books || [];
  const current = state.profile?.books || [];
  const awards = incoming.stampAwards || [];
  const currentAwards = state.profile?.stampAwards || [];
  const exerciseCount = books.reduce((count, book) => count + (book.workspace?.curriculum?.exercises || []).length, 0);
  const paused = books.filter(book => book.workspace?.session).length;
  return `<section class="import-preview profile-import" aria-labelledby="profile-import-title">
    <p class="eyebrow">Gesamte Sicherung prüfen</p><h1 id="profile-import-title">Deine Sammlung wiederherstellen</h1>
    <p class="lede">Diese Sicherung enthält mehrere Bereiche deines Lernprofils. Die Vorschau verändert noch nichts.</p>
    <p class="import-preview__filename">${state.pendingImport.fromText ? 'Quelle' : 'Datei'}: ${esc(state.pendingImport.fileName || 'Profil-Sicherung')}</p>
    <article class="card import-preview__course"><h2>Das steckt in der Sicherung</h2><div class="import-preview__counts"><div><strong>${books.length}</strong><span>Lernbücher</span></div><div><strong>${exerciseCount}</strong><span>Übungen</span></div><div><strong>${awards.length}</strong><span>gesammelte Stempel</span></div><div><strong>${paused}</strong><span>pausierte Runden</span></div></div><ul class="profile-import__books">${books.map(book => `<li><strong>${esc(bookTitle(book))}</strong><span>${esc(subjectName(book.workspace?.curriculum))}${book.id === incoming.activeBookId ? ' · danach ausgewählt' : ''}</span></li>`).join('')}</ul></article>
    <section class="import-preview__section import-preview__replacement" aria-labelledby="profile-replacement-title"><h2 id="profile-replacement-title">Deine aktuelle Sammlung wird ersetzt</h2><p>Beim Übernehmen werden alle ${current.length} aktuellen Lernbücher mit ihren Lernständen und pausierten Runden sowie ${currentAwards.length} gesammelte Stempel durch die Sicherung ersetzt. Die beiden Sammlungen werden nicht zusammengeführt.</p>${current.length ? `<p>Aktuelle Bücher: ${current.map(book => `„${esc(bookTitle(book))}“`).join(', ')}.</p>` : ''}<p>Sichere vorher deine aktuelle Sammlung mit „Alles sichern“. Die Vorschau bleibt dabei geöffnet.</p><div class="import-preview__actions">${button('Alles sichern', 'export-profile', 'button button--secondary', state.busy ? 'disabled aria-disabled="true"' : '')}${button('Sammlung ersetzen', 'confirm-import', 'button button--primary', lock(state))}${button('Abbrechen', 'cancel-import', 'button button--quiet', state.busy ? 'disabled aria-disabled="true"' : '')}</div></section>
  </section>`;
}

export function bookImportMessage(state, esc) {
  const pending = state.pendingImport;
  if (!pending?.curriculum) return '';
  const existing = (state.profile?.books || []).find(book => book.id === pending.targetBookId);
  if (pending.keepActiveBook && pending.action === 'open' && existing) return `<p>„${esc(bookTitle(existing))}“ ist bereits in deiner Sammlung. Es wird nicht doppelt angelegt; dein aktuell ausgewähltes Buch bleibt geöffnet.</p>`;
  if (pending.keepActiveBook) return '<p>Dieses Beispiel fügt deiner Sammlung ein neues Lernbuch hinzu. Dein aktuell ausgewähltes Buch bleibt geöffnet; sein Lernstand und seine pausierte Runde bleiben unverändert.</p>';
  if (pending.action === 'open' && existing) return `<p>„${esc(bookTitle(existing))}“ ist mit diesem Inhalt bereits in deiner Sammlung. Beim Übernehmen öffnest du das vorhandene Buch. Sein bisheriger Lernstand und seine pausierte Runde bleiben erhalten.</p>`;
  if (pending.action === 'replace' && existing) return `<p>Diese Sicherung ersetzt den Lernstand von „${esc(bookTitle(existing))}“. Eine Sicherung enthält nie eine pausierte Runde: Falls gerade eine offen ist, geht sie beim Übernehmen verloren. Die anderen Bücher und deine gesammelten Stempel bleiben erhalten. Mit „Alles sichern“ kannst du vorher die aktuelle Sammlung herunterladen.</p>`;
  return '<p>Dieser Import fügt deiner Sammlung ein neues Lernbuch hinzu. Deine bisherigen Bücher, Lernstände, pausierten Runden und gesammelten Stempel bleiben erhalten. Auch eine neue Version eines Buches wird getrennt aufgenommen.</p>';
}
