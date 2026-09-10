# First milestone evaluation — 2026-09-09

**Result: ASTRA.md section 37 first milestone reached.** This is a working local product slice, with documented platform and learning-validation limits. No backend, publishing service, account or runtime AI was introduced.

## Executed evidence

Environment: macOS, Node 22.22.3, Vite 7.3.6, Chromium 148 via Playwright 1.63.0 and agent-browser. Tests run against the production build at localhost:4173, using isolated disposable browser contexts.

- [`unit-tests.txt`](evidence/unit-tests.txt): **13/13 passed**. Deterministic sessions, answer types, shared concept mastery, duplicate submissions/rewards, prerequisites/difficulty, foreign-course rejection, genuine fixture validation, corrupt imports, backup replay, writing scheduling and published backup schema.
- [`browser-tests.txt`](evidence/browser-tests.txt): **5/5 passed**. Full lesson with an intentional error, reload/resume, reward and future mistake review; downloaded backup imported into a fresh browser; offline reload and full lesson with the HTTP cache cleared; invalid imports preserve prior data; all five exercise types controlled by keyboard; injected failed-save recovery; second-tab writer protection.
- [`build.txt`](evidence/build.txt): production build succeeded; five static files precached, including bundled course; no reference images in the build. App JS ~201 kB (60 kB gzip), CSS ~16 kB (4 kB gzip).
- [`fixture-validation.txt`](evidence/fixture-validation.txt): **47 concepts / 59 exercises** validate through the same boundary as user import.
- No page errors during the principal learning/export/restore flow. Production offline test observed no external requests. Tests use no real learner information.

Axe reported no violations on the dashboard and all five exercise views in the passing run. Keyboard tests actually selected options/tiles, entered text, submitted, acknowledged self-check and advanced through completion. Reduced-motion preference was applied and transition duration checked. Viewport checks at 1440×1000, 1024×768, 390×844 and 320×568 found no horizontal overflow.

Astra visually inspected the rendered [desktop](evidence/home-desktop.png), [tablet](evidence/home-tablet.png), [phone](evidence/home-mobile.png), [mobile exercise](evidence/exercise-mobile.png), [reading](evidence/exercise-reading.png), [tiles](evidence/exercise-word-tiles.png) and [completion](evidence/lesson-complete.png). Typography, spacing, task hierarchy and responsive composition were coherent. Phone screenshots are full-page captures; the fixed navigation appears at the original viewport bottom, while lower content is reachable by scrolling.

## Definition of Done mapping

| ASTRA criterion | Evidence / disposition |
| --- | --- |
| Real textbook-derived fixture | Source photographs inspected; original content grounded in pp. 18, 20, 21, 22, 25; curriculum-research.md records provenance. |
| Schema documented and validated | Three published schemas, semantic validator, fixture and backup tests; unknown versions rejected without mutation. |
| Plausible compatible authoring prompt | Exact field/type contracts, stable IDs, self-check rule, worked full fixture, validation command and uncertainty/copyright guidance. |
| Local application launches | Production preview and browser tests. |
| Several reusable exercise types | Choice, text input, word tiles, reading and writing all exercised in browser and keyboard tests. |
| Learner-aware session generation | State/due/mistake/prerequisite/difficulty/variety tests and independent review. |
| Repetition | Intentional error affects a later review session; writing regression prevents false weakness. |
| Persistent progress | Transactional IndexedDB, reload/resume check and failed-write recovery. |
| JSON import/export | Downloaded backup restored in a fresh browser context with exact learner equality; curriculum-only export omits learner. |
| Offline/local-first demonstrated | Service worker loads a complete lesson offline after HTTP cache clearing; no external runtime requests. |
| Responsive experience | Desktop/tablet/phone screenshots plus 320px overflow check. |
| Coherent design system | Shared tokens, buttons, containers, feedback, navigation and motion policy; visual inspection. |
| Accessibility basics | Keyboard-complete five types, labelled controls/progress, focus correction, automated contrast/semantic checks and reduced motion. |
| Critical automated tests | 13 unit/validation tests and 5 production browser workflows. |
| QA found and fixed real defects | Closure table below; independent reviews and root inspection both changed code. |
| Decisions documented | ARCHITECTURE, PRODUCT, specs and experiment records. |
| Handoff usable by another agent | README commands, module map, schemas, prompt, evidence, task checklist and explicit limitations. |

## Defects identified and corrected

| Finding | Detection | Fix and confirmation |
| --- | --- | --- |
| Incorrect progress field and omitted reading passage | Root review of Terra UI | Join conceptProgress to course concepts; render original passage. Browser/axe checks pass. |
| Choice-key contract drift and invalid short option IDs | Integration validation | Freeze plural correctChoiceIds; consistent option IDs; real fixture validates. |
| Harder unseen tasks and weak type variety | Root review of engine and fixture simulation | Difficulty fit plus bounded type/concept variety penalties; critical tests and five-type browser round pass. |
| Imported mastery/rewards could contradict outcome history | Independent Terra data review | Replay outcomes and check completed-session manifests, binding, duplicates and XP. Corrupt-import tests reject them. |
| Cross-course/empty session rewards and duplicate answer paths | Independent/root engine review | Course bindings, nonempty unique exercise guard and idempotent answer/session checks. Unit tests pass. |
| Writing permanently ranked as weak | Independent Terra 30-session simulation | Self-check exposure excluded from weakness/error boost; regression test passes. |
| Two small labels failed contrast (4.46 / 4.29) | Axe browser audit | Darken action token to #066e66; no violations in final checked views. |
| Artwork overlapped phone caption | Root screenshot inspection | Bound artwork height above caption; visually rechecked at three sizes. |
| Delayed focus could select the wrong tile | Keyboard browser test | Synchronous focus restoration; all five types now complete by keyboard. |
| Stale aria-disabled contradicted native button state | Browser test after answer-input polish | Remove redundant aria-disabled; native disabled state now updates correctly. |
| Offline module requests missed precache due to Vary: Origin | Browser trace of failed offline reload | Match fixed same-origin artifacts independent of Vary; clear HTTP cache before offline test; final full offline round passes. |
| No-lock fallback could allow concurrent overwrites | Independent data review | Require Web Locks, visible unsupported-browser error; second-tab write test passes. |

Original independent findings are in data-qa.md; this closure record supersedes its pending statuses.

## Agentic experiment

Astra read the brief and repository, set the architecture/module contracts and integrated the product. Three bounded Terra workstreams addressed source/schema, learning engine and design/reference analysis. Their separate perspectives caught curriculum, scheduling and data-boundary problems. A later engine-agent audit independently checked all 59 answer keys, orphan concepts, prerequisite depth and backup replay.

Delegation saved exploration context, but contract drift and partially completed artifacts required integration work. Two agents reached a usage limit; Astra completed the remaining fixture/prompt/UI and browser work, then obtained a further independent engine/curriculum audit. No partial agent output was accepted solely because the agent said it was ready. The strongest final defects came from actual browser execution and independent multi-session simulation.

## Next iteration

Update 2026-09-10: the accepted first milestone was extended with learn-before-practice and focused review. See [Milestone 2 evaluation](milestone-2-evaluation.md) for current results; the first-milestone evidence above remains the historical baseline.

Run a parent/teacher and child usability pilot, then test Safari/Firefox and real phone keyboards. Use that evidence to tune sequencing, vocabulary introduction and review intervals. Extend source-grounded pronunciation/listening only when appropriate media is available. Known platform and scope limits are listed in known-limitations.md; they do not block the first milestone and are not claimed as implemented features.
