# Learning model

Progress belongs to concepts, never to an exercise ID. Several exercise forms can therefore strengthen or expose the same vocabulary item, grammar point, phrase, or reading/writing skill.

Each concept starts **unseen** (`attempts: 0`, `mastery: 0`). Its observable state is derived rather than stored separately:

| State | Condition |
| --- | --- |
| unseen | no encounters |
| introduced | at least one encounter and low mastery |
| practising | mastery is 0.35–0.79 and not due |
| weak | incorrect answers exceed correct answers, or mastery is below 0.35 after an encounter |
| due | `nextDueAt` is at or before the current time |
| learned | mastery is at least 0.8 and not due |
| mastered | mastery is 1 and the retrieval interval has reached its final band |

Objective correct retrieval raises mastery by 0.20 (capped at 1), increments a correct streak, and schedules the next review after 1, 2, 4, 8, 16, then 30 days. An incorrect objective answer lowers mastery by 0.25 (floored at 0), resets that streak, and makes the concept due immediately. Both outcomes remain visible in cumulative encounter/correct/incorrect counts and a timestamp.

Writing self-check is intentionally different: it records an encounter and the learner's explicit self-check status but changes neither correctness counts, mastery, scheduling, nor XP. A writing prompt can support reflection and teacher/parent discussion; it cannot claim automated assessment.

The engine selects retrieval opportunities by due status, recent weakness/errors, new material, and exercise-type variety. A focused review is narrower: it lists only an objective concept whose latest objective result is incorrect, or whose scheduled review is due. A corrected older error does not remain on that list, and a self-checked writing response never creates it. This small model rewards repeated successful retrieval without using punishment, hidden engagement scoring, or claims of diagnostic precision.

Self-check exposure is excluded from weak/error ranking: zero mastery on an ungraded writing task is not a mistake. Seen writing has lower selection priority than unseen objective material. Completion XP is an effort reward across all finished exercises, including self-check; answering writing itself gives no correctness/mastery points.
