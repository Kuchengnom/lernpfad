# Architecture

Lernpfad is a static, local-first web application. Astra owns integration; bounded Terra agents own curriculum, learning-engine and design work. Contracts are established before coupling modules.

## Decisions

- **Vite + plain JavaScript ES modules and CSS.** Five small exercise templates and a few screens do not require a framework or state-management library. Modules keep the pure engine independent from rendering and persistence. Node 22 and the lockfile make builds repeatable.
- **Versioned JSON Schema + Ajv.** Validate document structure, then semantic relationships and learner compatibility. Unknown major/version strings fail with actionable errors; never guess migrations. Imported content is plain text, never executable markup.
- **Course and learner are separate domains.** A curriculum package contains only the course. A backup includes the exact course and learner. Stable concept IDs aggregate knowledge across exercise types. Course ID/version bind learner state; content replacement is explicit in the parent area.
- **Atomic IndexedDB profile.** The existing database/store/key now holds a versioned profile of learning books, selected book and global stamp awards. Each book contains its curriculum, learner and in-progress session. Validated legacy single-workspace data migrates in one transaction without clearing the store. Every write persists the whole profile together. Answers are recorded once; transitions save before reporting success. Web Locks prevent concurrent writer tabs on supporting browsers. Storage failures stay visible; never silently claim persistence.
- **Pure explainable engine.** See specs/learning-model and specs/lesson-engine. No runtime AI, adaptive opaque scores, server or grading of free writing.
- **Build-generated service worker.** Precache only the static build and bundled original curriculum, with a content-hashed cache name. After first production load and activation, the shell serves offline. No source reference photos or external fonts in the build. Updates wait for old tabs to close to avoid replacing code during a lesson.
- **Original accessible visual language.** See specs/design-system. Native buttons/inputs, labelled navigation and live feedback; no external asset dependencies.

## Boundaries

`app/main.js`: state machine and integration. `app/ui.js` / `styles.css`: rendering and user interaction. `app/engine.js`: deterministic selection, answer evaluation, mastery and rewards. `app/validation.js`: structural and semantic import boundaries. `app/storage.js`: transactional local storage. `scripts/build-sw.js`: offline shell generation. `fixtures/unit-1a/curriculum.json`: original source-grounded course.

Normal production use makes only same-origin static requests. The app has no fetch route for uploading learner information. Files downloaded by the user are the only implemented sharing mechanism. Clearing browser/site storage deletes local progress; a downloaded backup is the recovery path.

## Capability limits and follow-up

Import preparation is ephemeral. `pendingImport` contains a validated package and `readiness.js` report only in memory; the workspace projection excludes it. The busy guard serializes file reads, navigation and writes. Explicit confirmation performs an atomic additive book import, matching-book learner replacement or full-profile replacement according to the preview. Exact duplicate content opens the existing book. Same identity/version with changed content is rejected; a new version gets independent progress. Failure retains the current workspace and preview for retry. Readiness computes a fixed point of reachable objective practice under the engine's prerequisite rules; it reports fresh-learner availability, unreachable concepts and unused concepts without changing validation or scores.

HTTPS or localhost is required for service workers. Development mode is for editing; demonstrate offline using `npm run build` then `npm run preview`. Installation UX varies across browsers and is not necessary for offline use. No platform-independent scheduled local notifications are promised; reminders, speech recognition, QR payloads and compressed sharing are deferred, with file exchange meeting the milestone.

## Technical references consulted 2026-09-09

- [Vite guide](https://vite.dev/guide/): ES-module development and static builds; installed Node is compatible.
- [Ajv getting started](https://ajv.js.org/guide/getting-started.html): compile/reuse JSON Schema validation.
- [MDN service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers): lifecycle, secure contexts and offline caching.

These sources inform implementation; actual browser evidence is in experiment/evaluation.md.


## Profile and scout increment — 2026-09-14

`app/profile.js` validates every active and inactive book with `specs/schema/profile.schema.json`; session exercise content/feedback is reconstructed against the canonical curriculum and answer records. Import previews never write. Metadata changes and profile restores use the same transaction/error boundary. Limits: 50 books, 25 MB human-readable profile export; individual imports and pasted text remain 5 MB. Full-profile exports contain durable outcomes and award metadata, excluding in-progress sessions and drafts. Older curriculum/learner packages stay accepted.

`app/stamps.js` counts completed rounds within each book (session IDs need not be unique across courses), grants each catalog motif once and keeps historical awards across single-book restores. Legacy numerical gems remain internally compatible; the displayed collectible count uses actual awards. `app/journey.js` renders code-native progress plus a midpoint pause for rounds of at least eight tasks. Rest acknowledgment is persisted; task counts are shown without inventing active minutes. Six stamp WebPs and the bench WebP are local precached assets.

`app/speech.js` selects matching `localService` voices only, querying availability on every tap. Unavailable voices return visible guidance; no deferred speech may start after navigation. Leaving a view, task, book or visible page cancels speech. Physical iPhone offline playback remains a manual verification item.
