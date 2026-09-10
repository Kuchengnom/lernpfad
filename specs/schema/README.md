# JSON contracts v1

The runtime accepts two UTF-8 JSON documents up to 5 MB. Machine-readable contracts: [curriculum](curriculum.schema.json), [learner](learner.schema.json), [backup](backup.schema.json). `app/validation.js` adds relationship and consistency checks. `npm run validate -- file.json` runs the same boundary as the app.

- Curriculum: `{ "schemaVersion": "1.0", "kind": "curriculum", "curriculum": { ... } }`.
- Backup: `{ "schemaVersion": "1.0", "kind": "backup", "curriculum": { ... }, "learner": { ... } }`.

A backup includes its exact curriculum. Curricula can be shared without progress. The current course language pair is `de` → `en`. IDs are stable lowercase strings using letters, digits, dots and hyphens; minimum 3 characters. Sources reference supplied files for provenance only: paths are never fetched or executed. Concepts encode knowledge, have an acyclic `dependsOn` graph and reference known sources. Exercises point to concepts, carry difficulty 1–3 and explanatory feedback, and use exactly one of five primitives documented in the authoring prompt. `correctChoiceIds` is an array with exactly one ID in v1.

## Semantic validation

Duplicate IDs, missing provenance, unknown concepts, dependency cycles, invalid correct-choice references and inconsistent word-tile solutions are rejected before storage. Unknown fields and versions are rejected. Content is rendered as escaped text, never HTML. The original fixture is validated in automated tests.

Learner state stores per-concept attempts, correct/incorrect counts, streak, mastery, last answer and due date. `answerRecords` retain only outcome and identifiers, not typed text. Completed sessions include ordered exercise IDs and course binding; rewards are verified against those manifests. Import replays outcome records to verify aggregate counts, mastery and schedules. This is consistency validation, not cryptographic authenticity or an exam anti-cheating system.

Local storage also holds the current session and cursor so reload resumes. Portable backups preserve all saved progress, but start a fresh round on the destination; unsubmitted drafts and the active cursor are intentionally not portable.

## Versioning and migration

`schemaVersion: "1.0"` and learner `schemaVersion: "learner-state.v1"` are the only supported contracts. Unsupported versions return a clear error and leave stored data intact. A future migration must be a named, pure, tested conversion; preserve the original download, migrate only known older versions, validate the result before saving, and never infer a forward migration. Content authors bump course `version` when answer semantics or concept identity changes.

Milestone 2 clarification: `answerRecords` is an append-ordered event log. Array order is the logical order used by replay and by unresolved-mistake detection. Timestamps record the device wall clock for review scheduling; they are not used to reorder events (a device clock can move backward). Backups preserve this array order exactly. Scores and writing outcomes are unchanged; no v1 learner migration is needed for the new study/review views.
French extension (2026-09-10): `sourceLanguage` remains `de`; `targetLanguage` now accepts `en` or `fr`. This widens the existing 1.0 format without changing existing English files or learner structure. Older English-only validators reject French packages; this is an app compatibility boundary, not an automatic migration. The authoring guide embeds this exact published schema in copied/downloaded prompts. Objective text evaluation normalizes canonically equivalent Unicode with NFC but never removes accents.
