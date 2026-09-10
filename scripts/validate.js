import { readFile } from 'node:fs/promises';
import { parseImport } from '../app/validation.js';
try {
  const path = process.argv[2] || 'fixtures/unit-1a/curriculum.json';
  const { curriculum, learner } = parseImport(await readFile(path, 'utf8'));
  console.log(`Valid ${learner ? 'backup' : 'curriculum'}: ${curriculum.title}; ${curriculum.concepts.length} concepts, ${curriculum.exercises.length} exercises.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
