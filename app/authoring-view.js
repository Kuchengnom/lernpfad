import { buildAuthoringPrompt } from './authoring.js';

export function authoringView(state, esc, button) {
  const language = state.authoringLanguage || 'fr';
  return `<section class="authoring-page" aria-labelledby="authoring-title">
    <p class="eyebrow">Für Eltern und Lehrkräfte</p>
    <h1 id="authoring-title">Eigenen Lernstoff erstellen</h1>
    <p class="lede">Mit deinen Schulmaterialien und diesem Prompt lässt du in einer neuen KI-Unterhaltung passenden Lernstoff erstellen. Auf dem Handy kannst du die Antwort direkt kopieren und hier einfügen.</p>
    <ol class="authoring-steps">
      <li><strong>Sprache wählen und Prompt kopieren.</strong> Er enthält die Anleitung und das vollständige Dateiformat. Eine zusätzliche Schema-Datei ist nicht nötig.</li>
      <li><strong>Neue Unterhaltung öffnen.</strong> Füge den Prompt ein und hänge deine französischen oder englischen Schulmaterialien an. Ergänze Klassenstufe und gewünschten Umfang. Lernpfad überträgt selbst keine Dateien.</li>
      <li><strong>Antwort kopieren.</strong> Kopiere die vollständige JSON-Antwort oder nutze „Code kopieren“ am Codeblock. Alternativ speicherst du sie als <code>lernstoff.json</code>. Prüfe Inhalte und Lösungen. Unleserliche Stellen soll die KI benennen und auslassen.</li>
      <li><strong>Hier importieren und ausprobieren.</strong> Wähle unten „Text einfügen“, füge die Antwort ein und öffne die Vorschau. Sichere bei Bedarf deinen bisherigen Stand und übernimm den neuen Lernstoff. Bei einem Formatfehler gibst du die Fehlermeldung in die KI-Unterhaltung zurück und lässt den JSON-Text korrigieren.</li>
    </ol>
    <div class="card authoring-tools">
      <label class="study-search" for="authoring-language">Zielsprache<select id="authoring-language" data-authoring-language><option value="fr" ${language === 'fr' ? 'selected' : ''}>Französisch</option><option value="en" ${language === 'en' ? 'selected' : ''}>Englisch</option></select></label>
      <p>Erklärungen und Aufgabenstellungen bleiben auf Deutsch. Der gewählte Prompt ist für <strong>${language === 'fr' ? 'Französisch' : 'Englisch'}</strong>.</p>
      <div class="import-preview__actions">${button('Prompt kopieren','copy-authoring','button button--primary')}${button('Prompt herunterladen','download-authoring','button button--secondary')}${button('Schema herunterladen','download-schema','button button--quiet')}</div>
      <details class="import-preview__details" data-authoring-details><summary>Prompt ansehen oder manuell kopieren</summary><label for="authoring-prompt">Vollständiger Prompt mit Schema</label><textarea id="authoring-prompt" data-authoring-prompt readonly rows="14" spellcheck="false">${esc(buildAuthoringPrompt(language))}</textarea></details>
    </div>
    <p>Die generierten Inhalte werden erst beim Import geprüft. Die Anleitung erstellt selbst noch keinen Lernstoff.</p>
    <div class="import-preview__actions">${button('Text einfügen','navigate','button button--primary','data-view="import-text"')}
    ${button('Zur Import-Auswahl','navigate','button button--secondary','data-view="library"')}</div>
  </section>`;
}
