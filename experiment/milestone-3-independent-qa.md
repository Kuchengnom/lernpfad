# Milestone 3 independent import-preview QA

Date: 2026-09-10

Scope: the proposed import preview for curriculum packages and full Trailbook backups. This review is independent and read-only. It covers the boundary between file selection, parsing, preview, confirmation, cancellation, export, and the single IndexedDB workspace record. It does not change package schemas or learner semantics.

## Contract under review

`pendingImport` is ephemeral UI state containing the parsed curriculum, optional learner, selected file name, and a report. It must never be included in `workspace()` or passed to `saveWorkspace()`.

Selecting a file must leave the live curriculum, learner, session, index, feedback, and persisted workspace unchanged. A preview may replace the Library content, but it is not an applied course. Explicit confirmation is the sole operation that may replace the saved workspace. Cancellation and navigation away discard only the preview.

An import read is serialized by setting `state.busy` before `await file.text()`. While it is busy, the file control and mutating/navigation controls are unavailable. This makes a second selection, cancellation, or navigation unable to interleave with the outstanding read, so a generation token is unnecessary. Every parse, size, or read error must restore `busy` and render an error without changing live data.

## Preservation risks and acceptance checks

| Risk | Required behavior | Focused check |
| --- | --- | --- |
| Preview leaks into persistence | `workspace()` remains limited to live curriculum, learner, session, index, and feedback; preview creation performs no `saveWorkspace`. | Record IndexedDB before selecting a valid file; select it; compare the complete workspace before confirming. Reload at the preview and confirm the old course/progress/session remains. |
| A selected backup is exported by mistake | Export reads live `state.curriculum` and `state.learner`, never `pendingImport`. | Start with progress, select a valid replacement backup, export before applying, and assert the downloaded backup equals the original live workspace. |
| File read races with UI state | Busy is synchronous before `file.text()` and is restored on every rejection path. | Hold `File.text()` with a deferred promise; assert the input and mutating/navigation controls are disabled before resolving it. Attempt a second change while busy; resolve the first and assert exactly its preview appears. Repeat with a rejected read/invalid JSON and verify controls recover. |
| Apply is non-atomic or a failed save loses retryability | Only confirmation builds a replacement workspace; `commit` writes it as one IndexedDB transaction. On failure, the live state and preview remain so Apply can be retried. | Seed a completed learner, choose a valid backup, patch `IDBObjectStore.put` to throw on Apply, then assert IndexedDB and visible live tally are unchanged and the preview/Apply action remains. Restore `put`, apply again, and verify the replacement workspace. |
| Session or unsaved draft is silently discarded during preview | Preview keeps the live session untouched; confirmation states that it replaces the current learning state and ends the open session. | Begin a session, type an unsubmitted writing draft, enter preview, cancel, resume, and assert the session remains. Apply only after the visible replacement explanation; assert the new workspace has no old session. |
| Cancellation or navigation changes data | Both remove `pendingImport` only; neither calls `commit`. | Capture IndexedDB and live learner, select a valid file, cancel and separately navigate away; reload each time and compare with the capture. |
| Invalid or oversized input overwrites a prior preview or live state | A failure clears/replaces the pending UI according to the selected-file policy but never affects live data; busy always clears. | With progress and an existing valid preview, choose malformed JSON and an over-limit file. Verify the error, re-enabled file control, unchanged IndexedDB, and no actionable stale preview. |

## Browser QA sequence before acceptance

1. Create observable live progress and an open session; snapshot the IndexedDB workspace.
2. In the Library, select a valid curriculum package. Verify a preview identifies the file and package type and provides Apply, Cancel, and a clear replacement explanation. Verify the live course/progress shown by export has not changed.
3. Reload without applying. The pre-preview workspace and resumable session must return.
4. Select again, cancel, and then navigate home/library. Reload after each route. Both must preserve the exact snapshot.
5. Select a full backup with recognizable progress. Apply it. Verify the stored curriculum and learner equal that backup, the old session is absent, and the success notice matches the package type.
6. Repeat Apply with a forced IndexedDB failure, then retry after restoring storage. The first attempt must preserve both live data and preview; the retry must be the only replacement.
7. Exercise deferred file read, invalid JSON, size rejection, keyboard focus, 320 px viewport, and automated accessibility checks. The busy state must have no clickable duplicate action and error recovery must return focus to a useful control.

## Static review status before integration

The existing implementation replaces live state immediately after `await file.text()` and therefore cannot satisfy the preview contract yet. Its persistence projection is already suitably narrow: `workspace()` does not include arbitrary UI fields, and `saveWorkspace()` writes one object-store record in a transaction. Existing malformed-import and failed-save browser coverage provides a useful base, but it must be extended to observe the interval before confirmation and retry a failed confirmation.

## Integration review — static audit

The landed implementation meets the core data-boundary design on static inspection.

- `workspace()` projects only the live curriculum, learner, session, index, and feedback. `pendingImport`, the selected file name, and readiness report are therefore excluded from IndexedDB writes. The explicit replacement path clears `pendingImport` in its proposed next state and makes one normal `commit` transaction.
- Import parsing is serialized by setting `busy` and clearing an old preview before `await file.text()`. Size, read, parse, and validation failures clear `busy` and leave the live workspace intact. A pending preview is only constructed after successful parsing.
- A failed confirmation leaves `state` as the original preview state because `commit` does not install `next` until after `saveWorkspace()` resolves. The preview and its Apply button remain available for retry. The export action still packages live state while preview is visible.
- Previewed package strings, source notes, and exercise prompts are passed through the UI escaping helper. The source disclosure explicitly says the application neither opens nor fetches referenced files. `analyzeReadiness()` is a pure advisory traversal and does not mutate the curriculum.

### Remaining static UI conditions

The shared action-control loop disables every `data-action` control, including navigation, while `busy`; `actions.navigate()` has a matching guard. The browser coverage now asserts a visible navigation control is disabled during a deferred file read, alongside its disabled file-input check.

The final copy labels readiness as the situation without prior learner state. Backup copy explains that imported progress may unlock further exercises. Preview prompts use the curriculum instruction/source language, human-readable source disclosures remain escaped and collapsed, and the all-reachable success message is suppressed when unused concepts are reported. No material static UI condition remains open.

### Automated evidence pending from the integration owner

No build, unit test, or browser test was run by this independent reviewer. Before closure, retain the integration owner's results for the Milestone 3 Playwright coverage: preservation before confirmation, export of live data, cancellation/reload, failed-transaction retry, escaped preview text, serialized slow reads, second-tab lock, mobile overflow, and automated accessibility. The static audit above is not a substitute for those runtime checks.
# Runtime closure — integration owner

Astra ran the final production build, fixture validation, 25 unit checks and 12 browser workflows. All passed; see `evidence/milestone3-browser-tests.txt` and `evidence/milestone3-unit-tests.txt`. Browser evidence covers unchanged workspace before confirmation, current-data export, cancellation/reload, aborted-transaction retry, hostile text, serialized slow reads, read failure recovery, second-tab restrictions, keyboard operation and 390/320px overflow checks. Astra inspected the resulting screenshots. These runtime results close the evidence conditions above; the independent review itself remains a static audit.
