// ponytail: form -> div; nothing ever submitted it (no submit button, Enter in textarea just inserts a newline)
export function importTextView(state, esc, button) {
  const draft = state.importTextDraft || '';
  const error = state.importTextError;
  const disabled = state.busy || state.readOnly ? 'disabled aria-disabled="true"' : '';
  return `<section class="import-text-page" aria-labelledby="import-text-title">
    <p class="eyebrow">Lernstoff einfügen</p>
    <h1 id="import-text-title">Lernstoff aus ChatGPT einfügen</h1>
    <p class="lede">Kopiere die vollständige JSON-Antwort aus deiner KI-Unterhaltung. Tippe unten in das Feld und wähle „Einfügen“. Ein einzelner <code>\`\`\`json</code>-Codeblock ist ebenfalls möglich. Die Prüfung speichert noch nichts.</p>
    <div class="card import-text-form">
      <label for="import-text">Lernstoff oder Sicherung als JSON</label>
      <textarea id="import-text" data-import-text rows="14" spellcheck="false" autocapitalize="off" autocomplete="off" inputmode="text" aria-invalid="${error ? 'true' : 'false'}" aria-describedby="import-text-help${error ? ' import-text-error' : ''}" placeholder='{"schemaVersion":"1.0", …}' ${disabled}>${esc(draft)}</textarea>
      <p id="import-text-help" class="import-text-help">Bis zu 5 MB. Dein Entwurf bleibt in diesem geöffneten Lernpfad-Tab. Beim Neuladen geht er verloren. Dein Lernbuch ändert sich erst, wenn du den Import in der Vorschau übernimmst.</p>
      ${error ? `<p id="import-text-error" class="import-text-error" role="alert">${esc(error)}</p>` : ''}
      <div class="import-text-actions">${button('Vorschau öffnen', 'validate-pasted-import', 'button button--primary', disabled)}${button('Zur Import-Auswahl', 'navigate', 'button button--quiet', 'data-view="library"')}</div>
    </div>
  </section>`;
}
