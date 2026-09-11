import { MAX_FILE_BYTES, parseImport } from './validation.js';

const fencedJson = /^\s*```json[\t ]*\r?\n([\s\S]*?)\r?\n```\s*$/i;

/**
 * Validate the two formats deliberately offered by the authoring handoff:
 * raw JSON and one complete Markdown JSON fence. We intentionally do not
 * extract JSON-looking fragments from prose, because that would hide an
 * incomplete or altered import from the person reviewing it.
 */
export function pastedImportText(text) {
  const source = String(text ?? '');
  if (new TextEncoder().encode(source).length > MAX_FILE_BYTES) {
    throw new Error('Der eingefügte Text ist zu groß. Bitte füge höchstens 5 MB JSON ein.');
  }
  const match = source.match(fencedJson);
  if (source.trimStart().startsWith('```') && !match) {
    throw new Error('Bitte füge reines JSON oder genau einen vollständigen ```json-Codeblock ein.');
  }
  if (!match && !source.trimStart().startsWith('{')) {
    throw new Error('Bitte füge reines JSON oder genau einen vollständigen ```json-Codeblock ein.');
  }
  return match ? match[1] : source;
}

export function parsePastedImport(text) {
  return parseImport(pastedImportText(text));
}
