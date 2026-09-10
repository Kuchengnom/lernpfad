# Milestone 3 — review material before import

Completed 2026-09-10. The import workflow now separates selecting a file from replacing a course. Parents can inspect the validated file, exercise mix, sample prompts, sources and incoming progress, then export the current backup, cancel or explicitly accept.

## Verified behavior

- Selecting, inspecting, cancelling or leaving a preview preserves the exact stored curriculum, learner and paused session. Reload discards the preview and resumes the prior workspace.
- Backup export while previewing contains the current live course and learner, not the incoming file. Export keeps the preview open and returns keyboard focus to its control.
- Accepting curriculum starts a fresh learner; accepting a backup restores its exact outcomes. Both replace the old session only after a successful atomic transaction. A deliberately aborted transaction retains the old workspace and leaves the preview retryable.
- The synchronous busy guard serializes file reads. A second input event cannot start another read; navigation and file selection are disabled during the read. A file-read rejection releases the guard and permits retry. Another tab cannot import over the writer's state.
- Imported markup in title and source notes remains text. Sources are neither fetched nor opened. Original malformed-import, backup round-trip, keyboard exercise and offline-learning tests remain green.
- Readiness analysis mirrors all prerequisites of all concepts linked to each exercise. Objective success can unlock further practice; writing self-check cannot. Tests cover multi-hop unlocking, unused concepts, writing-only prerequisites and exercise-level deadlocks even when the concept graph is acyclic. This report is advisory and preserves existing package compatibility.

## Evidence

`npm run build`, `npm run validate`, **25 unit tests** and **12 production browser workflows** pass. Logs: [unit checks](evidence/milestone3-unit-tests.txt), [browser checks](evidence/milestone3-browser-tests.txt). The browser tests run in isolated Chromium contexts on macOS and inspect IndexedDB state before and after each critical transition.

Astra used an isolated agent-browser session to inspect the actual bundled-course preview and reviewed rendered screenshots: [reference preview](evidence/milestone3-import-reference.png), [mobile warning preview](evidence/milestone3-import-mobile.png), [320px action area](evidence/milestone3-import-phone-actions.png). Automated accessibility checks report no violations in the tested preview views; 390px and 320px checks find no horizontal overflow. These are not claims about untested browsers or real-device usability.

## Independent review and correction

Terra learning implemented the pure readiness report and five edge-case tests. Terra design implemented preview presentation. A third Terra agent independently audited Astra's state integration, storage boundaries and escaping; its [review](milestone-3-independent-qa.md) records no remaining material static issue. Astra performed runtime QA and final integration.

Review corrected the distinction between fresh-learner availability and imported backup progress, suppressed a misleading success statement for unused concepts, fixed language metadata on German example prompts, and kept source metadata behind an optional disclosure. Root visual inspection restored explicit file identification and corrected singular/plural copy. The first forced-abort browser assertion expected only the abort message, while IndexedDB first emitted its generic error event; the check now accepts either error and still proves exact preservation and a successful retry.

No schema, fixture content, learner scoring, backend or cloud dependency changed. Remaining needs are a parent/teacher and child pilot, other browser engines and real phone keyboards. See [known limitations](known-limitations.md).
