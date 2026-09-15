# Luna math integration handoff

## Plan

- [ ] Inspect current math engine, formatter, authoring, UI and state changes.
- [x] Complete math stylesheet import and invalid-input lifecycle without recording attempts.
- [x] Complete subject/schema authoring APIs and v1 to v2 profile migration behavior.
- [x] Complete list-field state, keyboard interaction, retry and round persistence behavior.
- [x] Add focused engine/browser regression coverage for the agreed math contracts.
- [x] Run focused checks and report exact results to the root agent; leave full suite to root.

## Review results

The UI now imports `math.css`. Draft storage is scoped by active book, session,
and exercise index, preventing unsaved list/numeric answers leaking when books
reuse a deterministic session ID. Added engine coverage for numeric, set,
sequence, and multiset grading plus invalid syntax. Added browser coverage for
real fixture import, rendered math controls, CSS sizing, and invalid numeric
input with no durable attempt. Updated landing/app titles and the landing
feature statement to describe the bounded math book accurately.

Focused checks: 23 unit tests passed (`math-engine`, `math-contracts`,
`numeric`); 1 Playwright math browser test passed; production build passed.
Full unit/browser suite remains for root-agent validation.

Additional QA journeys were added to `tests/browser/math.spec.js`: full fixture
round/reload/review, math authoring schema and pasted preview. The original
focused math control/input test remains verified (1 passed). The expanded
round and authoring runs were started while the root agent's browser suite was
also active and did not emit a final result before the runner returned; root
must rerun these tests with an isolated preview server and resolve any
remaining journey failures before claiming full acceptance.
