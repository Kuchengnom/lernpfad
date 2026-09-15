// Keep authored 1.0 curriculum data intact: this only localizes known bundled
// English study copy for German learners and leaves imported author content unchanged.
const GERMAN = new Map([
  ['regular simple past', 'Regelmäßige Verben im Simple Past'],
  ['Form common regular past forms.', 'Häufige regelmäßige Formen im Simple Past bilden.'],
  ['Usually add -ed; change consonant+y to -ied; add -d after final e.', 'Meist ergänzt du -ed. Nach Konsonant + y wird daraus -ied; nach einem abschließenden e ergänzt du nur -d.'],
  ['irregular simple past', 'Unregelmäßige Verben im Simple Past'],
  ['Retrieve common irregular past forms.', 'Häufige unregelmäßige Formen im Simple Past abrufen.'],
  ['Irregular past forms must be learned individually.', 'Unregelmäßige Vergangenheitsformen lernst du einzeln.'],
  ['holiday detail', 'Detail in einem Urlaubstext'],
  ['Find a stated travel detail in a short text.', 'Eine genannte Reiseinformation in einem kurzen Text finden.'],
  ['holiday paragraph', 'Urlaubsabsatz'],
  ['Write a short, supported holiday description.', 'Eine kurze, unterstützte Urlaubsbeschreibung schreiben.'],
]);

export function learnerText(text) {
  return GERMAN.get(text) ?? text;
}


export const isMath = curriculum => curriculum?.subject === 'math';
export const contentLanguage = curriculum => isMath(curriculum) ? (curriculum.instructionLanguage || 'de') : (curriculum?.targetLanguage || 'de');
const languageName = code => ({ de: 'Deutsch', en: 'Englisch', fr: 'Französisch' })[code] || code || 'unbekannt'; // ponytail: only used in this module, no longer exported
export const subjectName = curriculum => isMath(curriculum) ? 'Mathematik' : languageName(curriculum?.targetLanguage);
export const curriculumLanguageLabel = curriculum => isMath(curriculum) ? 'Mathematik · Aufgaben auf Deutsch' : `${languageName(curriculum?.sourceLanguage)} → ${languageName(curriculum?.targetLanguage)}`;
