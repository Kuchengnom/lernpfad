/**
 * Analyse what a fresh learner can practise in a validated curriculum.
 *
 * The result is advisory: it does not change learner state or reject a
 * curriculum. It deliberately uses the engine's exercise-level AND gate:
 * every prerequisite of every concept linked to an exercise must be mastered.
 */

const isObjective = exercise => exercise.type !== 'writing' && exercise.selfCheck !== true;

function prerequisitesReady(exercise, concepts, mastered) {
  return exercise.conceptIds.every((conceptId) =>
    (concepts.get(conceptId).dependsOn ?? []).every((dependencyId) => mastered.has(dependencyId)),
  );
}

/**
 * Return import-readiness counts and concept IDs for a validated curriculum.
 *
 * `availableExerciseCount` is the number of exercises a fresh learner can
 * receive now. `lockedExerciseCount` is the remainder. To find concepts that
 * cannot be practised, objective exercises are repeatedly treated as correct:
 * a correct response gives each linked concept the 0.2 mastery needed by a
 * prerequisite. Writing remains playable when its prerequisites are met, but
 * self-checking it never adds mastery. Concepts with no exercises are reported
 * as `unusedConceptIds`, rather than also appearing as unreachable.
 */
export function analyzeReadiness(curriculum) {
  const concepts = new Map(curriculum.concepts.map((concept) => [concept.id, concept]));
  const exercises = curriculum.exercises;
  const freshAvailable = exercises.filter((exercise) => prerequisitesReady(exercise, concepts, new Set()));
  const mastered = new Set();

  let changed = true;
  while (changed) {
    changed = false;
    for (const exercise of exercises) {
      if (!isObjective(exercise) || !prerequisitesReady(exercise, concepts, mastered)) continue;
      for (const conceptId of exercise.conceptIds) {
        if (!mastered.has(conceptId)) {
          mastered.add(conceptId);
          changed = true;
        }
      }
    }
  }

  const ultimatelyPlayableConceptIds = new Set(
    exercises
      .filter((exercise) => prerequisitesReady(exercise, concepts, mastered))
      .flatMap((exercise) => exercise.conceptIds),
  );
  const usedConceptIds = new Set(exercises.flatMap((exercise) => exercise.conceptIds));
  const unusedConceptIds = curriculum.concepts
    .map((concept) => concept.id)
    .filter((conceptId) => !usedConceptIds.has(conceptId));
  const unreachableConceptIds = curriculum.concepts
    .map((concept) => concept.id)
    .filter((conceptId) => usedConceptIds.has(conceptId) && !ultimatelyPlayableConceptIds.has(conceptId));

  return {
    availableExerciseCount: freshAvailable.length,
    lockedExerciseCount: exercises.length - freshAvailable.length,
    unreachableConceptIds,
    unusedConceptIds,
  };
}
