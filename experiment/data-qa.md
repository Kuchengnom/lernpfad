# Data-boundary QA review — 2026-09-09

Reviewed `app/validation.js`, `app/storage.js`, `specs/schema/learner.schema.json`, and the engine's learner/session boundary. This is a review only; no integration files were changed.

## Findings

### P0 — validation module currently imports a missing curriculum schema

`app/validation.js` imports `specs/schema/curriculum.schema.json`, but that file is not yet present. Any browser path importing validation fails before an import, export, or example-course workflow can run. This is expected while the curriculum workstream lands its artifact, but it blocks an integrated build until then.

**Acceptance criterion:** add the schema at that exact path and exercise `parseImport`, `curriculumPackage`, and `backupPackage` with a real course before declaring import/export ready.

### P1 — imported concept counts are not reconciled with recorded answers

`validateLearner` accepts a concept whose `attempts` exceeds `correct + incorrect` by any amount. Only writing self-checks can account for that difference, and it is not reconciled against `answerRecords` or the course's `conceptIds`. A backup can therefore claim arbitrary attempts/mastery-history combinations while passing validation.

**Acceptance criterion:** derive expected per-concept encounters/correct/incorrect from each answer record and its course exercise. Require exact agreement with `conceptProgress` (including self-check encounters), and reject answer records whose IDs or outcome fields are inconsistent. This also gives backup import a meaningful record-count limit.

### P1 — completed session integrity requires validation replay

The learner originally stored only `completedSessionIds`; validation merely required one answer with the same ID, so an imported state could mark a 10-exercise session complete after one answer. The engine now emits course-bound sessions, requires matching course bindings on records/completion, and writes an exercise-ID manifest on completion. Validation still needs to replay those manifests and verify every recorded exercise before accepting an import.

**Acceptance criterion:** validate every compact completed-session manifest (`id`, ordered exercise IDs, course binding) against learner records and exact course exercises. Reject a foreign, incomplete, duplicate, or reward-inconsistent session on import.

### P2 — ID reservation is inconsistent across the portable state

Curriculum concept/exercise IDs reject `__proto__`, `constructor`, and `prototype`, while answer IDs, session IDs, and completed-session IDs do not. The current implementation keeps those values in arrays, so this is not an immediate prototype-pollution path. It is nevertheless an unstable contract for future map/index use and weakens the stated stable-ID boundary.

**Acceptance criterion:** share one ID validator across curriculum and learner schema/semantic checks; reserve these names everywhere and set a documented character/length policy for answer and session IDs.

### P2 — writer-lock fallback does not prevent concurrent tab writes

On browsers without Web Locks, `acquireWriter()` returns `true`, so concurrent tabs may both read and replace the single IndexedDB workspace. On supporting browsers the intentionally unresolved lock promise holds correctly for the page lifetime. IndexedDB writes are atomic individually, but this fallback can still lose a later learner update.

**Acceptance criterion:** either label the fallback explicitly as best-effort and warn before a second writer, or use a lightweight `BroadcastChannel`/lease fallback. Keep the existing visible storage error path; it correctly avoids reporting a failed write as saved.

## Positive checks

- Imported top-level packages have a size limit and reject unknown fields.
- Curriculum IDs are unique; concept prerequisites are checked for missing references and cycles.
- Answer IDs and session/exercise answer pairs are checked for duplicate records.
- IndexedDB saves course and learner together in one transaction, and error/abort paths surface a recovery-oriented message rather than silently discarding failure.

## Closure by Astra

All material findings above are closed for the milestone: schema landed and real fixture validates; answer replay verifies concept state; completed manifests and course binding guard reward integrity; reserved IDs are rejected; Web Locks are required instead of an unsafe multi-writer fallback. Production tests demonstrate failed-save recovery and second-tab exclusion. See evaluation.md for final evidence and the additional independent writing-scheduler finding.
