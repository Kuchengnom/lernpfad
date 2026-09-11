# Repository setup

- [x] Recover the referenced project brief and inspect available assets.
- [x] Establish the documentation, reference, specification, fixture, prompt, experiment, and app directories.
- [x] Add the operational product and quality contracts.
- [x] Copy and catalogue the available application-reference screenshots without altering originals.
- [x] Catalogue textbook source photos with page-level provenance and descriptive copies.
- [x] Begin architecture/schema work in the authorized Astra implementation task.

## Learning engine implementation plan

- [x] Read the project brief and existing specification stubs; propose the curriculum and learner-state contract to the curriculum and integration workstreams.
- [x] Specify the deterministic activity selection, answer evaluation, and idempotent reward rules.
- [x] Implement the dependency-free ES module engine.
- [x] Add focused node tests for scheduling, answer semantics, and duplicate-write protection.
- [x] Run the engine test suite and record the result.

## Learning engine review

`node --test tests/engine.test.js` passed: six tests cover deterministic unique sessions, mistake-led selection, objective evaluation, concept-level shared mastery, self-check writing, prerequisites, difficulty adaptation, complete-session gating, and duplicate-submit protection.

## Focused review plan — milestone 2

- [x] Define a pure, history-based review-item contract without changing portable learner state.
- [x] Add strict due/mistake review selection and optional concept-focused learn sessions.
- [x] Add regression tests for corrected errors, writing exclusion, due review, filtering, and course binding.
- [x] Verify focused review behavior and document the public contract.

## Setup review

This repository is documentation-first. It deliberately contains no application implementation, package manager configuration, generated curriculum, or invented textbook content.

# First milestone execution — 2026-09-09

The setup review above records the starting state. ASTRA.md now authorizes implementation through its first milestone. Plan reviewed against source manifests and the empty implementation directories before coding.

- [x] Read ASTRA.md, inspect repository and available evidence; allocate bounded Terra work.
- [x] Inspect actual textbook and app references; establish curriculum and design contracts.
- [x] Define and validate versioned curriculum and portable learner schemas; author original Unit 1A fixture and parent prompt.
- [x] Implement deterministic, state-aware sessions, feedback, mastery/review and rewards with critical-logic tests.
- [x] Build accessible responsive dashboard, exercise templates and complete lesson flow.
- [x] Integrate atomic local persistence, validated import/export and offline application shell.
- [x] Run production build and browser workflows: mistakes, completion, reload, export/restore, offline, keyboard and small screens.
- [x] Obtain independent curriculum, engine, UX, accessibility and privacy review; fix material defects and retest.
- [x] Update handoff documentation and evaluate each ASTRA milestone criterion against evidence.

## Implementation plan and ownership

Astra owns architecture, integration, persistence, PWA, product decisions and final QA. Terra curriculum owns source inspection, fixture, schema and authoring prompt. Terra engine owns session/mastery logic and focused tests. Terra design owns reference analysis, design system and UI. Reviews cross implementation ownership after integration.

The initial slice is a static app with a small finite exercise library and a portable package containing separate curriculum and learner sections. No account, backend or runtime AI. Source photos stay outside the deployed application. Scope includes explicit self-check for writing; browser speech, reminders, QR sharing and long-term efficacy are assessed and documented as optional follow-up.

## Milestone review

First milestone reached. 47 source-grounded concepts, 59 original exercises and five reusable primitives. Production build, 13 critical tests and 5 browser workflows pass. Independent review and browser QA found and fixed schema, learning-priority, persistence-integrity, focus, contrast and offline-caching defects. See experiment/evaluation.md and its evidence links. Remaining optional capabilities and platform validation are explicit in experiment/known-limitations.md.

## Verification results

- Confirmed 11 descriptive textbook copies match their original HEIC uploads byte-for-byte.
- Confirmed 11 descriptive app-reference copies exist; original uploads remain beside them.
- Visually inspected and catalogued the source pages and interaction references.
- Confirmed `.DS_Store` is ignored and the scaffold has no tracked-diff whitespace errors.

# Milestone 2 — learn before testing, then practise what needs attention

User authorized continuation on 2026-09-10. Plan checked against ASTRA, the accepted first milestone, existing code and recorded limitations. This slice deepens the learning loop using existing source-grounded content; no new infrastructure or data format is required.

- [x] Inspect accepted milestone, outstanding gaps and source/module contracts.
- [x] Add a searchable Lernbuch: vocabulary translations, grammar explanations/examples and prerequisite-aware concept practice; browsing never changes mastery.
- [x] Make review truthful: show due concepts and unresolved mistakes, exclude writing self-check from error lists, offer an honest empty state and short focused sessions without unrelated fillers.
- [x] Clarify active-round handling: resume explicitly or deliberately replace with another practice focus while preserving answered progress.
- [x] Keep existing backups and browser learner state compatible; verify reload, import/export and offline use.
- [x] Run independent learning/data review, automated critical checks and rendered desktop/mobile/keyboard QA; correct material findings.
- [x] Document milestone evidence, decisions and next limitations.

Astra owns integration, state compatibility and browser tests. Terra engine owns review/focus selection and pure tests; Terra design owns study/review UI; Terra curriculum independently audits learning semantics and edge cases.

Acceptance: a learner can look up an unfamiliar word/rule, practise that concept, see a mistake in a clear review queue, complete a focused review, reload and retain the result. Fresh learners must not see a fabricated mistake list. Existing five exercise types and portable backups remain functional.

## Milestone 2 review

Complete: production build, fixture validation, 20 unit tests and 8 browser workflows pass. The final browser run includes focused practice, cleared mistakes, paused-review resume, cancelled/accepted focus replacement, writing-draft reload expectations, four-item mobile navigation, offline lookup and unchanged backup restoration. Astra inspected desktop and phone screenshots. Independent review prompted German explanations and honest score wording; separate lifecycle review caught and fixed the paused-review defect. See `experiment/milestone-2-evaluation.md` for evidence and remaining platform/pilot work.
# Milestone 3 — inspect school material before replacing the current course

User authorized continuation on 2026-09-10. Plan reviewed against ASTRA's external authoring/import contract, current atomic storage and the independent review's prerequisite reachability concern. Keep package schemas and existing learning semantics unchanged.

- [x] Add a pure readiness analysis for reachable exercises and unreachable/unused concepts, including imported prerequisite chains.
- [x] Present a validated file preview with course identity, content counts, exercise samples, source information, incoming progress and explicit replacement consequences.
- [x] Keep preview/cancel read-only; offer current backup download before explicit acceptance. Handle overlapping file reads, failures and second-tab restrictions safely.
- [x] Use the same preview for switching to the bundled example; preserve compatibility with existing curriculum and backup files.
- [x] Verify import/cancel/replace, failed persistence, malformed and hostile text, keyboard/mobile accessibility and previous learning/offline flows.
- [x] Obtain independent integration review, inspect rendered output, fix defects and record the milestone results.

Ownership: Astra integrates the state machine and browser tests. Terra design owns preview UI/CSS. Terra learning owns readiness analysis and tests. A separate Terra reviewer audits preservation and import concurrency. Acceptance: choosing a file never replaces saved data; cancel keeps course, progress and active round; explicit acceptance atomically replaces them; imported content is displayed as text; inaccessible practice is reported honestly without invalidating compatible old backups.

## Milestone 3 review

Complete. Build and fixture validation pass, with 25 unit checks and 12 browser workflows. Independent static review found no remaining material issue; integration QA confirmed exact workspace preservation on cancel, discarded preview, slow/failed reads and aborted transactions. Explicit acceptance and retry restore the intended data. Desktop and 390/320px screenshots were inspected. See `experiment/milestone-3-evaluation.md` for evidence and follow-up boundaries.
# Authoring handoff and French import — 2026-09-10

User wants to generate a French dataset in a new external conversation and test import. Existing prompt is repository-only and English-only; schema rejects French. Plan: expose authoring instructions and a complete copyable/downloadable prompt with the current schema; support English/French target metadata while retaining German instructions; validate a clearly synthetic French QA fixture across five primitives, import/export/reload and offline authoring access. No external conversation is started and no user files are sent automatically.

- [x] Integrate language-selectable authoring guide, prompt copy/download and schema download in the app.
- [x] Support French in schema and target-language presentation without breaking English packages.
- [x] Verify French import, answers with accents/apostrophes, backup/reload, authoring downloads and keyboard/mobile UI.
- [x] Record instructions and remaining limits, and give the user the exact testing steps.

Review: build, both fixtures and 27 unit checks pass. All 14 browser workflows pass, including real clipboard copying, exact schema/prompt downloads, clipboard fallback, offline authoring access and a complete five-type French round with persisted/exported progress. The mobile guide was rendered and inspected. See `experiment/authoring-french-evaluation.md`.
# Publish Lernpfad to GitHub Pages

- [x] Verify the supplied empty repository and SSH access; install GitHub CLI.
- [x] Rename the visible product to Lernpfad while retaining compatible storage keys.
- [x] Exclude supplied reference media and local evidence from the initial public source commit.
- [x] Add CI checks and a GitHub Pages workflow that publishes only dist; verify locally.
- [x] Push the initial repository (user completed; remote main is `4c2edee`).
- [x] Enable Pages with GitHub Actions and inspect the deployed site including offline use.

Repository: Kuchengnom/lernpfad. GitHub CLI authorization is separate from working SSH and is requested through GitHub's device flow. No new SSH key is required.

Publication review: 27 unit tests and 14 browser workflows pass. The production build also passes `node scripts/check-pages.mjs http://127.0.0.1:4175/lernpfad/`, including project-scoped service worker, HTTP-cache-cleared offline reload, authoring and lesson start. Independent review prompted a main-branch-only dispatch guard and a bounded service-worker readiness check. The user subsequently pushed the local commits successfully. GitHub CI confirms the build and checks pass on `4c2edee`, but the custom deploy failed at Pages configuration. The live site currently contains unbuilt source from a separate legacy Pages job; see the repair plan below. GitHub CLI 2.100.0 is installed but not authenticated. Live application acceptance remains pending.

## Live Pages repair — 2026-09-11

Plan checked against the successful application build, failed deploy annotations and live HTML.

- [x] Diagnose the live response and failed Actions step.
- [x] Switch repository Pages source to GitHub Actions and rerun the tested deployment (user completed).
- [x] Verify live rendering, project-scoped service worker and offline learning; update publication evidence.

Diagnosis: the user successfully pushed commit `4c2edee`. The custom workflow's build passed; `configure-pages` failed because Pages was not enabled/configured for Actions. A subsequent legacy Pages job published source `index.html`, which requests `/app/main.js` instead of the built assets. Fix the repository publishing source; the existing relative Vite base already passes local subdirectory checks.

Repair review: run `34579670888` successfully built and deployed `4c2edee`. The public HTML now references the compiled assets. The live smoke check passed: rendering, `/lernpfad/` worker scope, HTTP-cache-cleared offline reload, French authoring prompt and lesson start, without JavaScript exceptions. The public dashboard screenshot was visually inspected. Independent static review found no deployment-path defect; remaining user-visible blank output may be stale browser HTML, so try a hard reload or cache-busting URL before further diagnosis. The Node 20 notices are non-fatal upstream action warnings.

# Mobile ChatGPT handoff and Lernpfad visual identity — 2026-09-11

User requests pasted learning JSON and a scout/pathfinding image world. Plan reviewed against atomic import, offline-first assets, existing design and German product naming. Root owns integration, authoring guide, generated illustrations and browser QA; bounded Terra tasks implement pasted-import state/helper and scout art/CSS.

- [x] Add a discoverable pasted-JSON entry, preserving draft text through errors and preview; accept raw JSON or one complete Markdown JSON fence.
- [x] Reuse schema/readiness preview and explicit replacement transaction; retain file imports, existing learner data and 5 MB limit.
- [x] Update the mobile authoring instructions/prompt and all current visible naming/downloads to Lernpfad, retaining storage compatibility.
- [x] Generate and inspect original scout illustrations, copy optimized production assets into the repository and integrate them with responsive layout and offline cache.
- [x] Run critical automated checks, rendered desktop/mobile/keyboard and offline QA, obtain independent review and correct findings.
- [x] Document evidence and the next pilot test; prepare the tested change for delivery.

Mobile handoff review: 28 unit tests, both fixture validations and all 16 browser workflows pass. Root inspected final desktop/mobile artwork, import entry placement and pasted-text UI. Independent review prompted neutral JSON error guidance; final QA also moved the import entry ahead of decorative/secondary content. See `experiment/mobile-paste-evaluation.md` and `experiment/lernpfad-artwork.md`. The next pilot is copying a real French course from ChatGPT on a physical phone, reviewing the preview and completing a round.

- [ ] Publish the tested mobile-import/scout update and verify the new live assets and input flow.
