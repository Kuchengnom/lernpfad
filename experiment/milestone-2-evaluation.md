# Milestone 2 evaluation — 2026-09-10

Status: complete. The accepted first milestone now supports looking up a word or rule, practising it deliberately, and resolving mistakes through short, focused review. The original five exercise primitives, local storage and portable 1.0 packages remain supported.

## Acceptance and evidence

| Criterion | Verified outcome |
| --- | --- |
| Learn before retrieval | Search/filter the 47-concept Lernbuch, read translation or German grammar explanation, and practise a selected concept. Browsing leaves learner state identical. |
| Honest review | Fresh learners have no invented review debt. A real wrong beach answer creates a review item; a later correct answer clears it. A one-concept review contains one exercise. Writing self-check is excluded, including exercises sharing an objective concept. |
| Deliberate session changes | Paused focused and review sessions resume with the same ID. Cancelling replacement retains the active round; accepting changes the focus while retaining checked outcomes and withholding unfinished-session rewards. |
| Portable data | Original production backup/download/restore test still restores exact learner equality. No schema bump or silent rewrite of existing course data. Append order is documented and tested even when the device clock moves backward. |
| Offline and accessible | Production offline lesson after HTTP-cache clearing passes; mobile offline Lernbuch search passes. Five types remain keyboard operable. Axe finds no violations in audited views. Mobile navigation remains one row. |
| Honest progress and drafts | Four successes on one exercise display practice progress, with an explicit no-grade/no-exam explanation. Leaving writing states that unsubmitted drafts are lost on reload; the browser test confirms both loss and preservation of recorded progress. |

Checks: `npm run build`, `npm run validate`, **20 unit/validation/review tests**, and **8 production browser workflows** pass. The browser suite runs in isolated Chromium contexts on macOS. It includes original import/export, storage failure and second-tab safety coverage alongside the new flows.

Screenshots were inspected by Astra: [desktop lookup](evidence/milestone2-study-desktop.png), [mobile grammar](evidence/milestone2-study-mobile.png), and [mistake review](evidence/milestone2-review.png). The [final browser log](evidence/milestone2-browser-tests.txt) records the run. These checks do not certify other browser engines or learning effectiveness.

## Review and corrections

Three Terra workstreams handled engine selection, study/review presentation and independent learning/data review. Astra integrated state handling and tested the product in the browser. [Independent findings](milestone-2-independent-qa.md) led to German study explanations, restrained practice-score wording, an explicit draft-loss promise and an append-order contract. A separate engine-agent review of Astra's lifecycle integration caught paused review being mistaken for a new focus; the resume comparison and browser regression now cover it.

Rendered inspection caught the new fourth mobile destination wrapping into a second row because the old navigation used three columns. The grid now has four columns, with a browser assertion. A hidden desktop navigation locator also caused a test-only mobile failure; the helper now selects the visible navigation. Both corrections were rerun before acceptance.

The independent curriculum reviewer hit a usage limit after writing its review, helper and three regression tests. Astra completed the final writing-reload check and closure verification; those final confirmations are identified as integration review, not attributed to a separate reviewer.

## Next product boundary

Prioritize parent/teacher and child feedback, real-device keyboards and Safari/Firefox before enlarging the curriculum. The finite exercise library makes focused rounds intentionally short. Practice scores and review intervals remain experimental; see [known limitations](known-limitations.md). No backend, runtime AI, source-image deployment or new permission request was introduced.
