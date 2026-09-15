import mathPromptTemplate from '../prompts/parent-math-authoring-prompt.md?raw';
import mathSchema from '../specs/schema/curriculum-v2.schema.json' with { type: 'json' };
import authoringPromptTemplate from '../prompts/parent-authoring-prompt.md?raw';
import authoringSchema from '../specs/schema/curriculum.schema.json' with { type: 'json' };

const targets = {
  en: { language: 'Englisch', code: 'en' },
  fr: { language: 'Französisch', code: 'fr' }
};

export { authoringSchema };

export function authoringSchemaFor(subject = 'language') {
  if (subject === 'language') return authoringSchema;
  if (subject === 'math') return mathSchema;
  throw new RangeError(`Nicht unterstütztes Fach: ${subject}`);
}

export function buildAuthoringPrompt(targetLanguage = 'fr', subject = 'language') {
  const schema = authoringSchemaFor(subject);
  const target = targets[targetLanguage];
  if (subject === 'language' && !target) throw new RangeError(`Nicht unterstützte Zielsprache: ${targetLanguage}`);

  const prompt = subject === 'math' ? mathPromptTemplate.trim() : authoringPromptTemplate
    .replaceAll('{{TARGET_LANGUAGE}}', target.language)
    .replaceAll('{{TARGET_CODE}}', target.code)
    .trim();

  return `${prompt}\n\n## Veröffentlichtes Lernpfad-Curriculum-Schema\n\nDas folgende vollständige Schema gehört zur Eingabe. Erzeuge danach ausschließlich die JSON-Datei ohne Prosa oder Markdown-Zaun.\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``;
}
