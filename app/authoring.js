import authoringPromptTemplate from '../prompts/parent-authoring-prompt.md?raw';
import authoringSchema from '../specs/schema/curriculum.schema.json' with { type: 'json' };

const targets = {
  en: { language: 'Englisch', code: 'en' },
  fr: { language: 'Französisch', code: 'fr' }
};

export { authoringSchema };

export function buildAuthoringPrompt(targetLanguage = 'fr') {
  const target = targets[targetLanguage];
  if (!target) throw new RangeError(`Nicht unterstützte Zielsprache: ${targetLanguage}`);

  const prompt = authoringPromptTemplate
    .replaceAll('{{TARGET_LANGUAGE}}', target.language)
    .replaceAll('{{TARGET_CODE}}', target.code)
    .trim();

  return `${prompt}\n\n## Veröffentlichtes Lernpfad-Curriculum-Schema\n\nDas folgende vollständige Schema gehört zur Eingabe. Erzeuge danach ausschließlich die JSON-Datei ohne Prosa oder Markdown-Zaun.\n\n\`\`\`json\n${JSON.stringify(authoringSchema, null, 2)}\n\`\`\``;
}
