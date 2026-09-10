# Decisions — first milestone

| Decision | Evidence and reason | Trade-off / revisit |
| --- | --- | --- |
| Static Vite app, vanilla modules | Repository had no app; finite templates and local data fit a small dependency surface. | Revisit a component framework if complexity grows. |
| German interface, English Unit 1A | Supplied English textbook pages include German vocabulary support; app references use German. | User can author other content; interface localization is future work. |
| Trailbook notebook identity | Application references supply pacing/feedback principles; no proprietary identity needed. | Inspect rendered mobile/desktop output before acceptance. |
| IndexedDB atomic workspace | Course, learner and session must survive reload consistently. | Browser deletion/quota can still lose data; downloads provide portability. |
| Five exercise primitives | Covers vocabulary, grammar, construction, reading and guided writing without missing media. | Speech/listening unavailable source audio remains explicitly absent. |
| Explicit writing self-check | Deterministic grading cannot reliably judge open English writing. | Exposure recorded separately, no claim of objective mastery. |
| File sharing only | JSON backup/restore meets cross-device ownership without servers. | QR/compression deferred until a concrete need. |
| Service worker precaches production artifacts | Offline requirement concerns deployed/static app, not hot-reload tooling. | First visit still requires server access; secure context required. |
| Cross-agent independent review | Implementers alone cannot establish learning quality, privacy or accessibility. | Findings and correction evidence recorded in evaluation. |

## Findings that changed the implementation

- Cross-agent field drift (`correctChoiceId` vs `correctChoiceIds`) was settled on the explicit plural contract before integration; schema and fixture now share the same key. A minimally saved fixture also used option IDs too short for its schema. Validation caught this before browser use.
- Source decoding inside the sandbox could silently yield black images. Successful native decode was visually checked before authoring.
- Initial UI used the wrong progress property, omitted reading content and reused a fictional route state. Root review corrected these to engine data and source-driven content.
- Backup validation now replays outcome records and verifies completion manifests; inconsistent mastery or fabricated reward totals fail without overwriting stored data.
- Independent simulation found writing self-checks were incorrectly given permanent weak-item priority. Their exposure now stays out of mistake/weakness priority.
- Browser accessibility checks found contrast ratios of 4.46 and 4.29 for small labels. Darker action text fixed both. Rendered mobile inspection found the decorative scene overlapped its caption; its height is now bounded above the text.
- The subagent quota interrupted curriculum/design work after partial artifacts. Astra integrated, repaired and completed those outputs; the engine agent later supplied a separate curriculum/scheduler review. Partial agent output was treated as unverified until validation and runtime checks passed.
- The final keyboard suite exposed an animation-frame focus race that could activate a different word tile. Focus restoration is now synchronous after rendering.
- A failed offline run showed `Vary: Origin` differences between precache and ES-module requests. Cache matching for fixed same-origin build artifacts now ignores Vary. The offline test clears the HTTP cache, preventing a false pass from cached network responses.

## Milestone 2 — 2026-09-10

The next slice improves curriculum discovery and intentional practice rather than adding accounts/media: a searchable study notebook, explicit due/mistake review, and concept-focused sessions. Existing source data is sufficient. Review has no unrelated filler and may be shorter than a normal round. Looking up a word or opening a rule never changes progress.

Unfinished rounds are resumed explicitly or replaced after a deliberate user choice. Previously checked answers stay in the learner event log; incomplete rounds receive no completion reward. The learner schema and outcome replay remain unchanged.

Independent review highlighted misleading confidence wording, English legacy explanations, draft loss and timestamp ordering. UI language describes practice evidence instead of certified mastery. Exact English legacy phrases can be translated for display without rewriting saved v1 course content. Unsubmitted drafts remain memory-only and that limit is disclosed. The append order of answerRecords remains the authoritative logical order, avoiding clock-based reorder of existing backups.
# Milestone 2 final QA corrections

Paused review sessions retain the exact generated concept scope and resume when the user reopens review without requesting a new filter. This prevents a derived review filter being mistaken for a deliberate focus change. Browser regression asserts unchanged session ID and absence of a replacement dialog. The fourth navigation destination also required four mobile grid columns; rendered inspection and a single-row assertion verify the correction.
# Milestone 3 — import preparation is read-only

Selecting a file now validates and previews it in memory. The user sees the incoming course, optional saved outcomes and replacement consequences before an explicit apply action. Current backup export remains separate from incoming data. File reads share the busy guard with writes to prevent overlapping imports; all failures retain current data, and failed writes retain the preview for retry. Readiness diagnostics are advisory so schema-compatible old files remain usable. Counts are explicitly fresh-learner estimates, and self-check writing cannot unlock an objective prerequisite. No new schema or infrastructure is needed.
