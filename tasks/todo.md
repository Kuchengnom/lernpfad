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

- [x] Publish the tested mobile-import/scout update and verify the new live assets and input flow.
      Resolved 2026-09-12: the user switched Pages source to GitHub Actions; live HTML now serves
      the compiled bundle and the published commit's own smoke script passes against the live
      site. See `experiment/publication.md`.

Publication status: mobile/scout commit `156853d` was pushed. A competing dynamic Jekyll job still publishes repository source and can overwrite the custom build; live HTML reverted to `/app/main.js`. Await the repository Pages Source switch to GitHub Actions, then rerun custom deployment after the legacy job ends. Implementation and local QA are complete; durable live publication remains blocked on the repository setting.

# Next product direction — 2026-09-12

User requested assessment of math, device speech, QR/hash transport, multiple local courses and an emotional scout learning loop. Code, actual fixture sizes, current browser API documentation and path/reward/mission reference images were inspected. See `experiment/next-product-increment.md` for scope, evidence and proposed acceptance criteria. This is a design/feasibility answer, not an implementation-complete claim.

- [ ] Add a local multi-book library and full-profile backup with migration of existing progress.
- [ ] Add lasting cross-book stamp awards, an illustrated album and prominent completion presentation.
- [ ] Add an accessible mountain route and optional Bergzeit with honest active-time accounting.
- [ ] Add device speech with explicit language, local-voice handling and an actual iPhone check.
- [ ] Run the real-material parent/child pilot, then choose a bounded math topic and sharing expansion.

# Library and scout experience implementation — 2026-09-12

User authorized starting the proposed sequence. Root integrates model, UI and migration; independent workstreams own profile validation/tests, book views and generated stamp/rest artwork.

- [ ] Implement atomic migration from one workspace into a multi-book local profile; preserve active round and old backups.
- [ ] Add book selection/rename/import identity handling and full-profile backup/restore with a reviewed preview.
- [ ] Add persistent illustrated milestone stamps, prominent collection and completion moments.
- [ ] Add accessible mountain-route progress and optional resumable Bergzeit between tasks.
- [ ] Verify migrations, duplicate/revised imports, profile round-trip, failed writes, course switching, responsive/offline UI and independent QA.
- [ ] Record outcome and deliver the tested increment; device speech follows this foundation.

# Device speech — 2026-09-12 (Claude, parallel to the library work)

Claimed while another agent works on the library/stamps/Bergzeit items (`app/profile.js`,
`app/books-view.js`, `app/stamps.js`, `app/journey.js`, `app/ui.js`, `app/main.js`). This is
step 3 of the sequence in `experiment/next-product-increment.md` and was untouched.

Scope deliberately kept to files nobody else holds: new `app/speech.js`, new
`tests/speech.test.js`, plus a three-line edit in `app/ui.js` (import `speak`, delete the
old `speak` stub at ~line 201, pass `state.curriculum?.targetLanguage` to the `[data-audio]`
listener at ~line 262). No browser specs, no schema, no storage changes.

- [x] `app/speech.js`: explicit `lang` tags (de-DE/en-GB/fr-FR), pure `pickVoice(voices, tag)`
      preferring `localService`, base-language fallback, never a cross-language voice,
      delayed `getVoices()`/`voiceschanged` handling, cancel before speak, error-safe.
- [x] `tests/speech.test.js`: node --test coverage for `pickVoice` and `speak` against a fake synth.
- [x] Result of `npm test` recorded below.

Not done and not claimed: the real iPhone flight-mode check with system voices. That remains a
manual user step from `next-product-increment.md` and no offline-voice promise is made in code.

## Device speech review

`npm test` passes: 52 of 52, no failures — 41 pre-existing checks plus 11 new ones in
`tests/speech.test.js` (exact-tag match, `localService` preference, base-language fallback,
refusal to return a cross-language voice, empty list; and for `speak`: lang is set, cancel
runs first, blank text is a no-op, no voice is assigned when none matches). The Playwright
suite was deliberately not run because the library workstream is mid-change in those specs.

Verified by re-reading the files after the run: the old lang-less `speak` stub is gone,
`app/ui.js:9` imports `speak` from `./speech.js`, and `app/ui.js:259` passes
`state.curriculum?.targetLanguage`. No other line of `ui.js` was altered, so the concurrent
library edits are intact.

Open follow-ups for whoever continues this:
- `cancelSpeech()` is exported but not yet called on exercise/course change. Those transitions
  live in `app/main.js`, which the library workstream holds; wire it there after that lands.
- The iPhone flight-mode check with real system voices is still outstanding. Until it is done,
  make no offline-voice claim in the UI or documentation.
- No `[data-audio]` control exists outside the exercise card yet, so only exercise audio speaks.

# Parent landing page — 2026-09-12 (Claude)

User asked for a German landing page aimed at non-technical parents who just want a tool for
their child. Built as a second static Vite entry so it does not touch `app/main.js` or the
application router, both held by the library workstream.

- [x] `welcome.html` + `app/welcome.css`: static, no JS, no webfont request, reuses the shipped
      palette and the existing trail illustration.
- [x] `vite.config.js`: two build entries; `scripts/build-sw.js` precaches the page unchanged.
- [x] German copy for parents, including an explicit "Was Lernpfad nicht ist" section. Every
      claim checked against shipped behaviour; unshipped library/stamps/maths not advertised.
- [x] Rendered and inspected at 1280px and 375px: no overflow, one h1, alt text present,
      44px targets, native `<details>` FAQ, visible focus, reduced motion respected.
- [x] `npm run build` and `npm test` (52/52) pass.
- [x] Share image `public/lernpfad-share.png` (1200×630, 39 kB) rendered from the page's own
      tokens, plus the full `og:`/`twitter:` set. Image/`og:url`/`canonical` are absolute URLs;
      a relative `og:image` renders no preview card at all, which a subagent got wrong first.
- [x] `impressum.html` + `datenschutz.html` drafts with `app/legal.css`, linked from the
      landing page footer, built as Vite entries. Data-protection text derived from the
      verified implementation; both marked "Entwurf, keine Rechtsberatung".
- [ ] Remaining GPT assets: app screenshots (held until the library UI settles), parent-facing
      hero, paste-flow recording, stamps once shipped. See `experiment/welcome-page.md`.
- [ ] USER must fill before publishing the legal pages: `[Vor- und Nachname]`,
      `[Straße und Hausnummer]`, `[PLZ und Ort]`, `[E-Mail-Adresse]`. No email was inserted
      automatically — publishing one exposes it to scrapers, which is the user's call.
- [x] Root swap applied locally: landing page at `index.html`, application at `lernen.html`,
      `start_url` → `./lernen.html` (`id` unchanged so existing installs survive), legal and
      landing links rewired, `check-pages.mjs` extended to cover both. No first-visit redirect:
      IndexedDB is async and would flash; `start_url` covers daily use instead.
      `node scripts/check-pages.mjs` passes end to end against the local build.
- [x] Live deployment verified green on 2026-09-12, so the root swap is now clear to push
      against a known-good baseline.
- [ ] Add a quiet "Was ist Lernpfad?" link from the app chrome back to the landing page, in
      `app/ui.js`, once the library workstream releases that file.

See `experiment/welcome-page.md` for design rationale, the claim/basis table and the full
asset brief.

# Branch split and verified main — 2026-09-14

GPT/Codex unavailable, so the in-flight library work was assessed, committed and parked
rather than left loose in the working tree.

`main` (verified: build, 39 unit tests, 16/16 browser workflows, all green):
- `ba38500` device speech module and tests
- `0eee1ea` parent landing page, Impressum/Datenschutz drafts, share image, root swap to
  `lernen.html`, `check-pages.mjs` and browser specs updated for the new URL
- `9384b41` speech wired into the exercise audio button

`library-wip` branch — `a7ac1e3`, multi-book profile, stamps, album and Bergzeit. Deliberately
not on main because it is unfinished:
- **Artwork does not exist.** `app/journey.js` renders `./illustrations/lernpfad-bergzeit.webp`
  and `app/stamps.js` renders `./illustrations/stamps/<id>.webp`; neither the file nor the
  directory is in `public/`, so every stamp and the rest screen render a broken image.
- **Three browser tests fail**, all in the import flow, because import was redesigned to add a
  book instead of replacing the workspace. `milestone3` still expects the old replacement
  wording and `confirm-import` placement; `paste-import`'s offline scout-asset check fails.
  Fixing these means settling the new import contract — a design decision for whoever finishes
  the feature, not a mechanical test edit.

Two test breakages were mechanical and are fixed on both: every spec navigated to `/`, which
the root swap broke, and the answer helper raced the render instead of waiting for the app to
settle on an exercise, the Bergzeit screen or the completion screen.

- [ ] Generate the missing artwork: one Bergzeit bench scene and six stamps (fox, tent,
      compass, backpack, pine cone, mountain bird), matching the existing scout illustrations.
- [ ] Settle the new import contract and reconcile the three failing specs, then merge
      `library-wip`.

# Finish parked library increment — 2026-09-14

Plan checked against `ASTRA.md`, the branch-split record and current code. Merge the parked implementation with the completed landing/speech work, then finish and verify before committing it.

- [x] Recover `library-wip` onto current main without losing speech or the landing entry.
- [x] Settle additive imports, duplicate-book progress retention and explicit profile replacement; correct data/UI review findings.
- [x] Generate and inspect six original stamp assets plus the Bergzeit bench.
- [x] Test migration, independent book progress, renaming, profile restore, awards, pause/resume and failed writes.
- [x] Inspect desktop/mobile, offline assets, keyboard and reduced-motion behavior independently.
- [x] Record results, commit the integrated increment and update the preview.

## Review of the completed library increment — 2026-09-14

Verified after Astra's merge and artwork: production build, 55 unit checks, fixture validation
for both courses, and 21 of 21 browser workflows pass. Stamp and Bergzeit artwork inspected
visually; both match the established gouache scout palette.

One defect found and fixed. `app/ui.js` renders the "Vorlesen" button when an exercise has
`audioText`, and a hint line when it has `hint`. Neither field was in the curriculum schema,
and every exercise variant sets `additionalProperties: false`, so any curriculum carrying them
was rejected as malformed. Both appear in zero fixtures. Device speech was therefore
unreachable in production — three commits and two workstreams built a feature whose only
trigger could not legally exist. Both fields are now optional additions to `exerciseBase` and
to all five variants; existing curricula and backups still validate. The authoring prompt
embeds the schema and now also states that `audioText` carries target-language text, never
German.

This surfaced only because Astra's new `library.spec.js` speech test built a curriculum with
`audioText` and failed at import. Worth noting that no existing test would have caught it: the
feature was verified by unit tests against a fake synthesizer, never against real content.

- [ ] Add `audioText` to a few French fixture exercises so the read-aloud path is exercised by
      a real course rather than only by an injected test document.
- [ ] Still outstanding from the speech work: the real iPhone flight-mode check with local
      system voices. No offline-speech claim is made anywhere until that is done.


# Mathe auf Basis der neuen Quellen — 2026-09-14

- [x] Aktuellen Stand mit den von Opus abgeschlossenen Commits abgleichen; erneuter Produktionsbuild und 21/21 Browserchecks bestanden.
- [x] Alle sieben Fotos in `references/textbook/mathe/` direkt ansehen und ein Quelleninventar erstellen.
- [x] Ersten Umfang und ausführbaren Integrationsplan mit Datenversionen, Zahlen-/Listenbewertung, Autorenworkflow und Definition of Done festhalten: `experiment/mathe-integration.md`.
- [ ] Geplanten Mathe-Meilenstein implementieren und gegen seine Definition of Done prüfen.

Planungsreview: Umfang auf belegte Teilbarkeit/Primzahlen und ganze Zahlen begrenzt. Handschrift ist keine Lösungsvorlage. Bibliothek, Runden, Wiederholung und Sammelstempel werden fachübergreifend weiterverwendet; Mathe ist noch nicht im laufenden Build freigeschaltet.


# Mathe-Implementierung — nach 17e3623

- [x] Zahlenmodul und korrekte Testbasis übernommen; drei offene Listen-/Längenregeln präzisiert.
- [ ] Verträge: v2-Curriculum/Backup, gemischtes Profil 2.0, validierte Migration und Autorenlösungen (Agent math_contracts).
- [ ] Oberfläche: Fachwahl, Zahlen-/Listenfelder, verständliche Fehler und Mathe-Texte (Agent math_ui).
- [ ] Lernstoff: 40 quellenbezogene Originalaufgaben, Autorenprompt und unabhängige Rechenprüfung (Agent math_content).
- [ ] Astra: Engine-Dispatch, gemeinsames Antwortformat, Zustandsintegration und echte Import-/Lern-/Sicherungsabläufe.
- [ ] Unabhängige QA, mobile/Offline-Prüfung, Korrekturen und vollständige Definition of Done.

# Wiederaufnahme mit Luna — 2026-09-15

Nutzer verlangt reine Astra-Orchestrierung und Luna für alle Programmieraufgaben. Zwischenstand zuerst in `tasks/HANDOFF.md` gesichert; Kontingent-Momentaufnahme 3 % / 33 %.

- [x] Unterbrochene Arbeiten inventarisieren und manuell nutzbare Übergabe sichern.
- [x] Luna: v2-Verträge und Migration abschließen, eigene Tests prüfen.
- [x] Luna: 40er-Quellenfixture, fehlenden Mathe-Prompt und unabhängige Rechenprüfung abschließen.
- [x] Luna: UI-/Zustandsintegration vervollständigen, erste gezielte Browserregression hinzufügen.
- [x] Astra: Ergebnisse prüfen, unabhängige QA zuweisen, Inhaltskorrekturen an Luna zurückgeben und Übergabe aktualisieren.
- [ ] Erweiterte Mathe-Browserabnahme abschließen: vollständige Runde/Feedback nach Reload, alle Listenvarianten, gemischte Sicherung, Entwurfsisolation und mobile/Offline-Fälle.

Review 15.09.2026: Lokale Integration mit 82/82 Unit-Tests, Build und zunächst 22/22 Browserchecks verifiziert. Zwei danach ergänzte Browserfälle brauchen eine isolierte Abschlussprüfung. Kein reproduzierbarer Implementierungsfehler im unabhängigen Review; zusätzliche Abnahmen bleiben offen. Maßgeblicher aktueller Stand: `tasks/HANDOFF.md`; ältere Planungsnotizen oben beschreiben den damaligen Zustand.
