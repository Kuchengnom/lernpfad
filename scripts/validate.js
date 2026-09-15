import { readFile } from 'node:fs/promises';
import { parseProfilePackage } from '../app/profile.js';
try {
  const path = process.argv[2] || 'fixtures/unit-1a/curriculum.json';
  const { curriculum, learner, profile } = parseProfilePackage(await readFile(path, 'utf8'));
  console.log(profile
    ? `Valid profile v${profile.profileVersion}: ${profile.books.length} books.`
    : `Valid ${learner ? 'backup' : 'curriculum'}: ${curriculum.title}; ${curriculum.concepts.length} concepts, ${curriculum.exercises.length} exercises.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
