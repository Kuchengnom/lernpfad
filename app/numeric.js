/**
 * Pure number/list grading for math exercises (numeric-input, number-list).
 * Grammar and length are checked before any conversion. No eval, no Function,
 * no regex arithmetic, no rounding, no tolerant string comparison.
 *
 * Reason codes are stable and machine-readable; the UI owns the German wording.
 */

const MAX_FIELD_CHARS = 32;
const MAX_VALUE = 999_999;
const MAX_LIST_ENTRIES = 20;

/** Parse one raw field into a canonical non-negative integer, or report why it can't be graded. */
export function parseNumericField(raw) {
  const text = typeof raw === 'string' ? raw : String(raw ?? '');
  if (text.length > MAX_FIELD_CHARS) return { ok: false, reason: 'too-long' };
  const trimmed = text.trim();
  if (trimmed === '') return { ok: false, reason: 'empty' };
  if (!/^\d+$/.test(trimmed)) return { ok: false, reason: 'non-digit' };
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value) || value > MAX_VALUE) return { ok: false, reason: 'out-of-range' };
  return { ok: true, value };
}

/** Parse a list of raw field values (one per "Zahl hinzufügen" entry) into canonical integers. */
export function parseNumberListField(rawEntries) {
  if (!Array.isArray(rawEntries) || rawEntries.length === 0) return { ok: false, reason: 'empty' };
  if (rawEntries.length > MAX_LIST_ENTRIES) return { ok: false, reason: 'too-many-entries' };
  const values = [];
  for (const entry of rawEntries) {
    const parsed = parseNumericField(entry);
    if (!parsed.ok) return { ok: false, reason: parsed.reason };
    values.push(parsed.value);
  }
  return { ok: true, values };
}

/** Grade a numeric-input answer against a finite set of accepted canonical values. */
export function checkNumericInput(raw, acceptedValues) {
  const parsed = parseNumericField(raw);
  if (!parsed.ok) return { invalid: true, reason: parsed.reason };
  const accepted = acceptedValues.map(Number);
  return { invalid: false, correct: accepted.includes(parsed.value) };
}

/** Grade a number-list answer under 'set' | 'sequence' | 'multiset' comparison. */
export function checkNumberList(rawEntries, expectedValues, comparison) {
  const parsed = parseNumberListField(rawEntries);
  if (!parsed.ok) return { invalid: true, reason: parsed.reason };
  const { values } = parsed;
  const expected = expectedValues.map(Number);

  if (comparison === 'set') {
    if (new Set(values).size !== values.length) return { invalid: true, reason: 'duplicate-values' };
    const a = [...new Set(values)].sort((x, y) => x - y);
    const b = [...new Set(expected)].sort((x, y) => x - y);
    return { invalid: false, correct: a.length === b.length && a.every((v, i) => v === b[i]) };
  }
  if (comparison === 'sequence') {
    return { invalid: false, correct: values.length === expected.length && values.every((v, i) => v === expected[i]) };
  }
  if (comparison === 'multiset') {
    const a = [...values].sort((x, y) => x - y);
    const b = [...expected].sort((x, y) => x - y);
    return { invalid: false, correct: a.length === b.length && a.every((v, i) => v === b[i]) };
  }
  throw new TypeError(`unknown comparison: ${comparison}`);
}

/**
 * Import-time trust boundary: check an author-supplied answer key (acceptedValues /
 * expectedValues) obeys the same limits the app offers the learner, so a book can't
 * ship an answer that's unanswerable through its own input.
 */
export function validateAuthorValues(values) {
  if (!Array.isArray(values) || values.length === 0) return { ok: false, reason: 'empty' };
  if (values.length > MAX_LIST_ENTRIES) return { ok: false, reason: 'too-many-entries' };
  for (const value of values) {
    const text = typeof value === 'string' ? value : String(value);
    if (!/^\d+$/.test(text) || text !== String(Number(text))) return { ok: false, reason: 'non-canonical' };
    if (Number(text) > MAX_VALUE) return { ok: false, reason: 'out-of-range' };
  }
  return { ok: true };
}
