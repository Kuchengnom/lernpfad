# Lesson engine

`app/engine.js` is a deterministic, local ES-module library. It consumes a validated course object; it neither calls a model nor derives facts that are absent from the course.

## Inputs and output

The engine receives the `course` object from a curriculum package:

```js
{
  id: 'holiday-stories-1a', version: '1.0',
  concepts: [{ id: 'vocab-train', kind: 'vocabulary', /* … */ }],
  exercises: [{ id: 'choice-train', type: 'choice', conceptIds: ['vocab-train'], /* … */ }]
}
```

Exercise IDs and concept IDs are global, stable identifiers. The supported finite types and answer payloads are:

| Type | Learner answer | Authoring key |
| --- | --- | --- |
| `choice`, `reading` | selected choice ID | one `correctChoiceIds` entry |
| `text-input` | text | `acceptedAnswers` strings, matched case- and whitespace-insensitively |
| `word-tiles` | ordered tile-ID array | `correctOrder` tile-ID array |
| `writing` | `{text, selfChecked:true}` | `selfCheck: true`, checklist and model answer; no answer key |

`newLearner(course)` returns portable state with `conceptProgress`, immutable answer records, completed session IDs and manifests, a session counter, XP, and gems.

`getReviewItems(course, learner, { now })` returns zero or more `{ conceptId, reason, lastSeen, nextDueAt }` records. `reason` is `mistake` only when the last objective answer for that concept was incorrect; a later correct retrieval clears an older error. `reason` is `due` when its objective review time is now or earlier. Writing/self-check history never creates a review item.

`generateSession(course, learner, { now, length, mode, seed, conceptIds })` accepts only `learn` or `review`, and requires `conceptIds` to be an array when supplied. It returns `{ id, curriculumId, curriculumVersion, exercises, mode, startedAt }`, plus `conceptIds` when a focus/review filter is active. Standard learn sessions are constrained to 8–12 activities (or the number actually supplied by a smaller course). A `conceptIds` learn session contains only exercises touching those known IDs; prerequisite gates still apply. A review session is strict: it contains only objective exercises touching current review-item concepts, returns an empty exercise list when there are none, and returns a short list instead of unrelated filler. It contains unique exercises and is repeatable for identical course, learner, time, mode, filters, and seed/run counter inputs. A completed session increments the counter so a later run cannot reuse its answer IDs. Callers can provide `seed` to define an explicit run identity.

`evaluateAnswer(exercise, answer)` returns `{ correct, selfCheck, normalizedAnswer }`. A writing answer can be `{ text, selfChecked: true }`; its response additionally preserves that explicit learner confirmation. Writing always returns `correct: null`; this engine must never present a writing response as objectively correct.

`recordAnswer(learner, exercise, result, { now })` requires the evaluated result plus stable `sessionId`, `answerId`, `curriculumId`, and `curriculumVersion`. It returns a new learner state. Reusing an answer ID returns the original state unchanged, preventing duplicate submit events from inflating counters, mastery, or rewards. A mismatched course binding fails before it can update state.

`completeSession(learner, session, { now })` verifies course binding, a nonempty unique session of at most 12 exercises, and an answer record for every exercise. An incomplete session is returned unchanged. A complete session receives five XP for each actually completed exercise and one gem exactly once, then persists its compact exercise-ID manifest for backup verification.

`analyzeReadiness(course)` in `app/readiness.js` is a pure import-preview helper for a validated course. It returns fresh-learner `availableExerciseCount` and `lockedExerciseCount`, plus `unreachableConceptIds` and `unusedConceptIds`. Availability uses the same AND prerequisite gate as session selection: every prerequisite of every concept attached to an exercise must be mastered. For reachability, the helper repeatedly assumes success on each available objective exercise, granting its linked concepts the 0.2 mastery threshold; writing can be listed as playable but never grants mastery. A concept without any exercise is unused, reported separately, and never duplicated as unreachable. The helper neither mutates input nor rejects otherwise valid schema data.

## Selection and reproducibility

Selection is explainable: due concepts rank first, then weak concepts with errors, then unseen material in learn mode. Review mode does not reuse that broad ordering as a fallback: it starts only from `getReviewItems`. Recent mistakes make their concepts immediately due. Exercises whose concept prerequisites have not reached 0.2 mastery are gated. Within a band, unseen concepts prefer difficulty 1, developing concepts prefer difficulty 2, and high-mastery concepts prefer difficulty 3; exercise ID resolves final ties. The selector alternates exercise types where candidates permit, avoiding a static run of one interaction form. It performs no random sampling, engagement optimization, or static playlist replay.

Within the priority bands, the selector subtracts 65 per prior occurrence of an exercise type in the current session, 35 per already-selected concept and 25 for repeating the preceding type. These bounded variety penalties allow the five primitives to appear without overwhelming an urgent mistake's 1000-point due priority. Writing never receives a weak/error boost merely because its objective mastery is zero.
