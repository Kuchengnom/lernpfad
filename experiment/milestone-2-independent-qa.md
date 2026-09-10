# Milestone 2 independent learning and data review

Date: 2026-09-10

Scope: source-grounded Unit 1A course, `app/engine.js`, import/export validation, and the proposed Lernbuch/review flow. This was an independent static and automated review, separate from the implementation owners. `npm test` passed (16 tests) on this checkout.

## What is sound

- The fixture is substantial and source-provenanced: 47 concepts, 59 original exercises, and all five supported primitives. It does not depend on the marked-but-unsupplied textbook audio.
- Objective answers feed shared concept progress; a writing self-check stores an encounter but cannot mark an answer correct, increase mastery, or enter the review list. `getReviewItems` uses the most recent objective answer, so a later successful retrieval clears an earlier mistake.
- Review/focused generation filters to the requested concepts and can return an empty round. It does not quietly add unrelated filler. The visible empty state is honest.
- Import validates package shape, stable references, cycles, answer/tile references, course binding, and reconstructed learner progress before replacement. Unknown versions fail instead of being guessed as migrations.

## Findings to resolve before accepting Milestone 2

### P1 — Grammar explanations are not usable for the stated German-first learner

The Lernbuch renders `concept.rule`, examples, and learning goals directly. The Unit 1A grammar rules and goals are English (for example, the regular-past rule starts “Usually add -ed”), even though the product and instruction language are German. This makes the new lookup surface least useful at the point where a learner needs an explanation.

Acceptance: grammar and reading/writing strategy concepts in the shipped German-to-English fixture provide concise German learner-facing explanations; English forms and examples remain marked with `lang="en"`. Add a test or fixture assertion that these concepts have an explicit German explanation, rather than assuming the source language implies it.

### P1 — A concept’s score can look mastered after one easy retrieval

`recordAnswer` adds `0.2` mastery per correct answer, and `progressView` labels 45% “Wird immer sicherer” and 80% “Sitzt schon gut.” A concept can reach the latter after four identical low-difficulty prompts; selection has no requirement that the learner succeeds at more than one exercise shape or difficulty before the UI says it “sits well.” That can overstate knowledge, especially for irregular past forms where recognition is easier than recall.

Acceptance: make the displayed wording evidence-sensitive. Either require successful retrieval across at least two distinct exercise IDs/types (and a non-trivial difficulty where available) before showing “Sitzt schon gut”, or label the current number as practice progress rather than knowledge. Cover repeated success on one exercise in an engine/UI regression test.

### P2 — Interrupted writing loses the draft and the “resume” promise is incomplete

The workspace persists the session/index/feedback, but typed drafts live in the module-local `drafts` map. A reload or leaving a writing task before self-check discards the child’s text. The home notice says answered work is saved and starting resumes the round, which is accurate for recorded answers but not for an in-progress writing response. This is particularly painful for the longest task.

Acceptance: either persist a bounded per-session draft (including writing text) with the workspace, or change the leave/reload copy to say unsubmitted answers are not saved. Add a reload test that enters writing, types text, reloads, and verifies the chosen promise.

### Accepted contract note — answer-record array order

Validation reconstructs concept progress by replaying `answerRecords` in array order; review semantics also uses the final array record as the latest answer. The team confirmed this is intentional: it is an append-only logical event log, while timestamps are wall-clock values and cannot safely order events after device-clock changes.

Acceptance: document that array order is canonical in the portable learner-state contract and add a regression test where a later-appended correct result clears an earlier mistake even if its timestamp is earlier. Do not sort old backups by timestamp.

## Prerequisite check

The only current prerequisite gate is holiday writing after regular and irregular past reach 0.2 mastery. Both prerequisite concepts have objective exercises available from a fresh learner, so this cannot permanently block the fixture. The study card correctly explains what remains. Recheck this invariant whenever imported curricula introduce a prerequisite chain: every prerequisite must have at least one objectively answerable, reachable exercise.

## Retest checklist

- Read the regular/irregular-past explanation on mobile as a German learner.
- Complete the same easy prompt four times and verify the resulting mastery label is honest.
- Reload mid-writing and verify draft persistence or explicit loss copy.
- Import a reordered valid backup and verify the documented behavior.
- Re-run `npm test`, then browser keyboard/mobile flows after the implementation owners land their changes.

## Closure review

Reviewed again after the Lernbuch/review UI and language adapter landed. `npm test` passed 20 tests, including the three independent assertions in `tests/milestone2-review.test.js`.

| Earlier finding | Disposition | Evidence |
| --- | --- | --- |
| German-first grammar explanations | Closed | `app/study-language.js` exact-maps the shipped English grammar/strategy copy and `ui.js` applies it only in the Lernbuch. Unknown parent-authored text passes through unchanged, preserving curriculum 1.0 data. |
| Misleading mastery wording | Closed | The progress screen now calls the value “Übungsstand”, states it is neither grade nor exam, and says “Oft richtig geübt” instead of claiming knowledge. The regression test demonstrates that four successes can still be one exercise shape. |
| Writing draft lost on reload | Open until the visible copy is changed and browser-tested | The draft is still module-local and current `exitSession()` says answered work is saved. This is acceptable only if leave/reload wording explicitly says unsubmitted responses are not saved; a writing-reload browser test must verify that promise. |
| Answer-record order | Closed as an explicit contract decision | Append order remains the logical event order; the new regression test proves a later-appended correct result clears an earlier mistake despite a clock reversal. The schema documentation still needs the one-sentence append-order statement before release. |

No newly observed permanent prerequisite block: each currently gated writing prerequisite has reachable objective exercises, and the Lernbuch disables only concepts with no reachable exercise while explaining why.

## Final integration closure — Astra

The independent review above is preserved as written. Astra verified the remaining conditions after integration: `exitSession()` explicitly says unsubmitted inputs are lost on reload, and the writing browser workflow types a draft, checks that notice, reloads/resumes, verifies an empty draft and exact retained learner state. `specs/schema/README.md` documents append order as canonical. The repeated-practice browser check verifies the actual “Oft richtig geübt” label and no-grade/no-exam explanation. All 20 unit tests and 8 browser workflows pass; these final checks were performed by the integration owner.

A separate engine-agent read-only review found the paused-review focus comparison defect. Astra fixed it and verified identical session ID and no replacement dialog on resume. Root screenshot inspection also found and corrected mobile navigation wrapping. No material finding remains open for this bounded milestone; platform and learning-efficacy limits remain in `known-limitations.md`.
