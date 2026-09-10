/** A deterministic, persistence-free learning engine for a JSON curriculum. */

const DAY_MS = 86_400_000;
const DEFAULT_SESSION_LENGTH = 10;
const MIN_SESSION_LENGTH = 8;
const MAX_SESSION_LENGTH = 12;
const REVIEW_INTERVAL_DAYS = [1, 2, 4, 8, 16, 30];

const toMillis = (value) => {
  const millis = value instanceof Date ? value.getTime() : Date.parse(value ?? new Date().toISOString());
  if (Number.isNaN(millis)) throw new TypeError('now must be a valid Date or ISO timestamp');
  return millis;
};
const iso = (value) => new Date(toMillis(value)).toISOString();
const normalize = (value) => String(value ?? '').normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
const stableHash = (value) => {
  let hash = 2166136261;
  for (const char of value) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(36);
};
const emptyConceptProgress = () => ({ attempts: 0, correct: 0, incorrect: 0, correctStreak: 0, mastery: 0, lastAnsweredAt: null, nextDueAt: null });

function conceptIds(exercise) {
  const ids = exercise.conceptIds ?? (exercise.conceptId ? [exercise.conceptId] : []);
  return [...new Set(ids)];
}

function assertCurriculum(curriculum) {
  if (!curriculum?.id || !curriculum?.version || !Array.isArray(curriculum.concepts) || !Array.isArray(curriculum.exercises)) throw new TypeError('curriculum requires id, version, concepts, and exercises arrays');
  const conceptSet = new Set(curriculum.concepts.map(({ id }) => id));
  if (conceptSet.size !== curriculum.concepts.length || conceptSet.has(undefined)) throw new TypeError('concept IDs must be unique and stable');
  if (curriculum.concepts.some((concept) => !(concept.dependsOn ?? []).every((id) => conceptSet.has(id)))) throw new TypeError('concept prerequisites must reference known concept IDs');
  const exerciseSet = new Set();
  for (const exercise of curriculum.exercises) {
    if (!exercise?.id || !exercise?.type || exerciseSet.has(exercise.id)) throw new TypeError('exercise IDs must be unique and stable');
    exerciseSet.add(exercise.id);
    if (conceptIds(exercise).length === 0 || conceptIds(exercise).some((id) => !conceptSet.has(id))) throw new TypeError(`exercise ${exercise.id} must reference known conceptIds`);
  }
}

function assertLearnerCourse(curriculum, learner) {
  if (learner && (learner.curriculumId !== curriculum.id || learner.curriculumVersion !== curriculum.version)) {
    throw new TypeError('learner belongs to a different curriculum');
  }
}

export function newLearner(curriculum) {
  assertCurriculum(curriculum);
  return { schemaVersion: 'learner-state.v1', curriculumId: curriculum.id, curriculumVersion: curriculum.version, conceptProgress: {}, answerRecords: [], completedSessionIds: [], completedSessions: [], sessionCounter: 0, xp: 0, gems: 0 };
}

const copyLearner = (learner) => ({ ...learner, conceptProgress: { ...learner.conceptProgress }, answerRecords: [...(learner.answerRecords ?? [])], completedSessionIds: [...(learner.completedSessionIds ?? [])], completedSessions: [...(learner.completedSessions ?? [])] });

function exerciseProgress(exercise, learner) {
  const values = conceptIds(exercise).map((id) => learner?.conceptProgress?.[id] ?? emptyConceptProgress());
  return values.reduce((total, item) => ({ attempts: total.attempts + item.attempts, correct: total.correct + item.correct, incorrect: total.incorrect + item.incorrect, mastery: total.mastery + item.mastery, nextDueAt: !total.nextDueAt || (item.nextDueAt && item.nextDueAt < total.nextDueAt) ? item.nextDueAt : total.nextDueAt }), { attempts: 0, correct: 0, incorrect: 0, mastery: 0, nextDueAt: null });
}

function candidateScore(exercise, learner, now, mode) {
  const progress = exerciseProgress(exercise, learner);
  const conceptCount = conceptIds(exercise).length;
  const due = progress.nextDueAt && Date.parse(progress.nextDueAt) <= now;
  const selfCheck = exercise.type === 'writing';
  const weak = !selfCheck && (progress.incorrect > progress.correct || progress.mastery / conceptCount < 0.35);
  let score = due ? 1000 : 0;
  if (weak && progress.attempts) score += 500;
  if (!progress.attempts) score += mode === 'review' ? 0 : 300;
  if (mode === 'review' && progress.attempts && !selfCheck) score += 200;
  // A self-check supplies no failure evidence. Never mistake its zero mastery for weakness.
  if (selfCheck && progress.attempts) score -= 100;
  const mastery = progress.mastery / conceptCount;
  const difficulty = Number(exercise.difficulty ?? 1);
  const difficultyFit = mastery < 0.2 ? (4 - difficulty) * 15 : mastery >= 0.8 ? difficulty * 15 : 10 - Math.abs(difficulty - 2) * 10;
  return score + Math.min(progress.incorrect * 20, 100) + Math.round((1 - mastery) * 20) + difficultyFit;
}

function prerequisitesReady(exercise, curriculum, learner) {
  const concepts = new Map(curriculum.concepts.map((concept) => [concept.id, concept]));
  return conceptIds(exercise).every((id) => (concepts.get(id).dependsOn ?? []).every((dependencyId) => (learner?.conceptProgress?.[dependencyId]?.mastery ?? 0) >= 0.2));
}

/**
 * Return objective concepts that warrant an intentional review. The last
 * objective response wins: an old error does not remain a mistake after a
 * successful retrieval.
 */
export function getReviewItems(curriculum, learner, { now = new Date().toISOString() } = {}) {
  assertCurriculum(curriculum);
  assertLearnerCourse(curriculum, learner);
  const time = toMillis(now);
  const exercises = new Map(curriculum.exercises.map((exercise) => [exercise.id, exercise]));
  const objectiveConceptIds = new Set(curriculum.exercises.filter((exercise) => exercise.type !== 'writing' && exercise.selfCheck !== true).flatMap(conceptIds));
  return curriculum.concepts.flatMap(({ id: conceptId }) => {
    if (!objectiveConceptIds.has(conceptId)) return [];
    const objectiveHistory = (learner?.answerRecords ?? []).filter((answer) => {
      const exercise = exercises.get(answer.exerciseId);
      return exercise && exercise.type !== 'writing' && exercise.selfCheck !== true && conceptIds(exercise).includes(conceptId);
    });
    const lastObjective = objectiveHistory.at(-1);
    const progress = learner?.conceptProgress?.[conceptId] ?? emptyConceptProgress();
    const due = progress.nextDueAt && Date.parse(progress.nextDueAt) <= time;
    if (lastObjective?.correct === false) return [{ conceptId, reason: 'mistake', lastSeen: lastObjective.answeredAt, nextDueAt: progress.nextDueAt }];
    if (due) return [{ conceptId, reason: 'due', lastSeen: lastObjective?.answeredAt ?? progress.lastAnsweredAt, nextDueAt: progress.nextDueAt }];
    return [];
  });
}

export function generateSession(curriculum, learner, { now = new Date().toISOString(), length = DEFAULT_SESSION_LENGTH, mode = 'learn', seed, conceptIds: requestedConceptIds } = {}) {
  assertCurriculum(curriculum);
  assertLearnerCourse(curriculum, learner);
  if (mode !== 'learn' && mode !== 'review') throw new TypeError('mode must be learn or review');
  if (requestedConceptIds !== undefined && !Array.isArray(requestedConceptIds)) throw new TypeError('conceptIds filter must be an array');
  const startedAt = iso(now);
  const time = toMillis(now);
  const knownConceptIds = new Set(curriculum.concepts.map(({ id }) => id));
  const focusIds = requestedConceptIds === undefined ? undefined : [...new Set(requestedConceptIds)];
  if (focusIds?.some((id) => !knownConceptIds.has(id))) throw new TypeError('concept filter references an unknown concept');
  const reviewIds = mode === 'review' ? getReviewItems(curriculum, learner, { now }).map(({ conceptId }) => conceptId) : undefined;
  const appliedConceptIds = mode === 'review'
    ? (focusIds === undefined ? reviewIds : focusIds.filter((id) => reviewIds.includes(id)))
    : focusIds;
  const target = mode === 'review'
    ? Math.max(1, Math.min(MAX_SESSION_LENGTH, Math.trunc(length) || DEFAULT_SESSION_LENGTH))
    : Math.max(MIN_SESSION_LENGTH, Math.min(MAX_SESSION_LENGTH, Math.trunc(length) || DEFAULT_SESSION_LENGTH));
  const ranked = curriculum.exercises
    .filter((exercise) => prerequisitesReady(exercise, curriculum, learner))
    .filter((exercise) => mode !== 'review' || (exercise.type !== 'writing' && exercise.selfCheck !== true))
    .filter((exercise) => appliedConceptIds === undefined || conceptIds(exercise).some((id) => appliedConceptIds.includes(id)))
    .map((exercise) => ({ exercise, score: candidateScore(exercise, learner, time, mode) }))
    .sort((a, b) => b.score - a.score || a.exercise.id.localeCompare(b.exercise.id));
  const exercises = [];
  const used = new Set();
  const typeCounts = new Map();
  const conceptCounts = new Map();
  let lastType;
  while (exercises.length < Math.min(target, ranked.length)) {
    // Variety competes within priority bands; an urgent mistake still outweighs new content.
    const candidates = ranked.filter(({ exercise }) => !used.has(exercise.id)).map(candidate => ({
      ...candidate,
      sessionScore: candidate.score - (typeCounts.get(candidate.exercise.type) ?? 0) * 65
        - conceptIds(candidate.exercise).reduce((n, id) => n + (conceptCounts.get(id) ?? 0) * 35, 0)
        - (candidate.exercise.type === lastType ? 25 : 0),
    })).sort((a, b) => b.sessionScore - a.sessionScore || a.exercise.id.localeCompare(b.exercise.id));
    const next = candidates[0];
    if (!next) break;
    exercises.push(next.exercise); used.add(next.exercise.id); lastType = next.exercise.type;
    typeCounts.set(lastType, (typeCounts.get(lastType) ?? 0) + 1);
    for (const id of conceptIds(next.exercise)) conceptCounts.set(id, (conceptCounts.get(id) ?? 0) + 1);
  }
  const run = seed ?? learner?.sessionCounter ?? 0;
  const id = `session-${stableHash([curriculum.id, curriculum.version, startedAt, mode, run, ...(appliedConceptIds ?? []), ...exercises.map(({ id }) => id)].join('|'))}`;
  return { id, curriculumId: curriculum.id, curriculumVersion: curriculum.version, exercises, mode, startedAt, ...(appliedConceptIds === undefined ? {} : { conceptIds: appliedConceptIds }) };
}

export function evaluateAnswer(exercise, answer) {
  if (!exercise?.id || !exercise?.type) throw new TypeError('exercise requires id and type');
  if (exercise.selfCheck === true || exercise.type === 'writing') return { correct: null, selfCheck: true, selfChecked: answer?.selfChecked === true, normalizedAnswer: String(answer?.text ?? answer ?? '').trim() };
  if (exercise.type === 'choice' || exercise.type === 'reading') {
    if (!Array.isArray(exercise.correctChoiceIds) || exercise.correctChoiceIds.length !== 1) throw new TypeError(`choice exercise ${exercise.id} requires one correctChoiceId`);
    return { correct: answer === exercise.correctChoiceIds[0], selfCheck: false, normalizedAnswer: answer };
  }
  if (exercise.type === 'word-tiles') {
    if (!Array.isArray(exercise.correctOrder)) throw new TypeError(`word-tiles exercise ${exercise.id} requires correctOrder`);
    return { correct: Array.isArray(answer) && answer.length === exercise.correctOrder.length && answer.every((id, index) => id === exercise.correctOrder[index]), selfCheck: false, normalizedAnswer: Array.isArray(answer) ? answer.join('|') : String(answer ?? '') };
  }
  if (exercise.type !== 'text-input' || !Array.isArray(exercise.acceptedAnswers) || exercise.acceptedAnswers.length === 0) throw new TypeError(`objective exercise ${exercise.id} has no answer key`);
  const normalizedAnswer = normalize(answer);
  return { correct: exercise.acceptedAnswers.some((expected) => normalize(expected) === normalizedAnswer), selfCheck: false, normalizedAnswer };
}

export function recordAnswer(learner, exercise, result, { now = new Date().toISOString() } = {}) {
  if (!learner?.conceptProgress || !Array.isArray(learner.answerRecords)) throw new TypeError('learner must be created with newLearner');
  if (!exercise?.id || conceptIds(exercise).length === 0) throw new TypeError('exercise requires stable id and conceptIds');
  if (!result?.sessionId || !result.answerId || !result.curriculumId || !result.curriculumVersion) throw new TypeError('result needs session, answer, and curriculum IDs');
  if (result.curriculumId !== learner.curriculumId || result.curriculumVersion !== learner.curriculumVersion) throw new TypeError('answer belongs to a different curriculum');
  if (![true, false, null].includes(result.correct) || (result.correct === null && result.selfCheck !== true)) throw new TypeError('result must be objective or an explicit self-check');
  if (learner.answerRecords.some(({ id, sessionId, exerciseId }) => id === result.answerId || (sessionId === result.sessionId && exerciseId === exercise.id))) return learner;
  const updated = copyLearner(learner);
  const answeredAt = iso(now);
  for (const conceptId of conceptIds(exercise)) {
    const previous = updated.conceptProgress[conceptId] ?? emptyConceptProgress();
    const progress = { ...previous, attempts: previous.attempts + 1, lastAnsweredAt: answeredAt };
    if (result.correct === true) {
      progress.correct += 1; progress.correctStreak += 1; progress.mastery = Math.min(1, Number((previous.mastery + 0.2).toFixed(3)));
      progress.nextDueAt = new Date(toMillis(now) + REVIEW_INTERVAL_DAYS[Math.min(progress.correctStreak - 1, REVIEW_INTERVAL_DAYS.length - 1)] * DAY_MS).toISOString();
    } else if (result.correct === false) {
      progress.incorrect += 1; progress.correctStreak = 0; progress.mastery = Math.max(0, Number((previous.mastery - 0.25).toFixed(3))); progress.nextDueAt = answeredAt;
    }
    updated.conceptProgress[conceptId] = progress;
  }
  // Self-check writing is an encounter only: it never gains correctness, mastery, or XP.
  updated.answerRecords.push({ id: result.answerId, sessionId: result.sessionId, exerciseId: exercise.id, correct: result.correct, selfCheck: result.selfCheck === true, answeredAt });
  return updated;
}

export function completeSession(learner, session, { now = new Date().toISOString() } = {}) {
  if (!learner?.completedSessionIds || !Array.isArray(learner.completedSessions) || !Array.isArray(learner.answerRecords)) throw new TypeError('learner must be created with newLearner');
  if (!session?.id || !Array.isArray(session.exercises)) throw new TypeError('session requires id and exercises');
  if (session.curriculumId !== learner.curriculumId || session.curriculumVersion !== learner.curriculumVersion) throw new TypeError('session belongs to a different curriculum');
  if (learner.completedSessionIds.includes(session.id)) return learner;
  const exerciseIds = new Set(session.exercises.map(({ id }) => id));
  if (exerciseIds.size === 0 || exerciseIds.size !== session.exercises.length || exerciseIds.size > MAX_SESSION_LENGTH) return learner;
  const completed = new Set(learner.answerRecords.filter((answer) => answer.sessionId === session.id && exerciseIds.has(answer.exerciseId)).map(({ exerciseId }) => exerciseId));
  if (completed.size !== exerciseIds.size) return learner;
  toMillis(now);
  const updated = copyLearner(learner);
  updated.completedSessionIds.push(session.id);
  updated.completedSessions.push({ id: session.id, exerciseIds: [...exerciseIds], curriculumId: session.curriculumId, curriculumVersion: session.curriculumVersion });
  updated.sessionCounter = (updated.sessionCounter ?? 0) + 1;
  updated.xp += completed.size * 5;
  updated.gems += 1;
  return updated;
}
