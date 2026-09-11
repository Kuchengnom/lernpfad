# Lernpfad · Local-first language practice

A working static learning app built under [ASTRA.md](ASTRA.md). The first milestone turns supplied English Unit 1A textbook concepts into **59 original exercises across 47 concepts**, with five reusable interaction types, adaptive practice, local progress and portable JSON backups.

Repository: [Kuchengnom/lernpfad](https://github.com/Kuchengnom/lernpfad). The app was previously named Trailbook; legacy local storage and backup compatibility are preserved.

## GitHub Pages

The `Check and deploy Lernpfad` workflow runs on pushes to `main` and on pull requests. It installs dependencies, runs unit and browser checks, validates both fixtures and builds the app. Only tested `dist/` output is deployed on `main`; pull requests run checks without publishing. In repository Settings → Pages, select **GitHub Actions** as the source. The expected project URL is `https://kuchengnom.github.io/lernpfad/`.

No runtime secrets, server or database service is required. The relative Vite base and service-worker scope support the project subdirectory. Each tester has their own browser-local learner state. Moving from localhost to the published URL does not transfer that state automatically: export/import a backup if needed.

Original school/app reference media and local screenshots/test logs are excluded from Git. Reference manifests and evaluation reports remain in the repository; their local evidence links require the original workspace. Deployment includes neither the supplied images nor learner backups.

## Run locally

Requires Node 22.12+.

```sh
npm ci
npm run dev
```

For the production build and offline demonstration:

```sh
npm run build
npm run preview -- --port 4173
```

Open `http://127.0.0.1:4173`. Wait for **Offline bereit** after initial loading. The production app caches its own shell, so you can reload and practise with the network disconnected. Use HTTPS when deploying elsewhere; `file://` is not supported.

## Use the app

- Start a short practice round from **Heute**. Wrong answers return in future practice; completed rounds award effort points and a stamp. Leaving a round or reloading retains answered progress and lets you resume.
- **Lernbuch** lets you search words, translations and German grammar explanations, then practise a chosen concept. Looking things up never changes progress. Prerequisites are shown before advanced practice.
- **Heute → Wiederholen** shows unresolved objective mistakes and due concepts. Reviews stay focused and may be short; a fresh learner sees an empty list. A paused round can be resumed or deliberately replaced while retaining checked answers.
- **Üben → Lernstoff importieren** offers **Text einfügen** for a copied ChatGPT JSON answer and **Datei auswählen** for a file. Both open the same preview of curriculum JSON or a complete backup. Pasted text can be raw JSON or one complete Markdown `json` code block. The draft survives editing, errors and preview cancellation within the open tab; it is not saved across reloads. Review its file name, content, sample tasks, sources and prerequisite warnings; export the current backup directly from the preview. Only **Import übernehmen** replaces the current course and learner. Cancel or leave the preview to keep the current round and progress. A curriculum-only file starts fresh; a full backup restores its saved outcomes.
- **Sicherung exportieren** downloads course and learner outcomes. Import on another device to restore them. **Lernstoff exportieren** shares only curriculum.
- **Fortschritt** shows concept-level progress. Writing uses a model and explicit self-check, never automatic grading.

Data is saved in this browser's IndexedDB. No accounts, analytics, backend, remote fonts or runtime AI. Clearing site data removes local progress: keep a downloaded backup. One tab can write at a time; another tab displays a notice. A current browser with IndexedDB, Web Locks and service-worker support is recommended. Original textbook/app reference images are never included in the build.

## Checks

```sh
npm run validate                 # bundled curriculum
npm run validate -- file.json    # curriculum or backup
npm test                        # critical engine and validation tests
npm run build
npm run test:browser             # production flow, offline, keyboard, accessibility, storage
```

Browser tests use Playwright. They detect this workstation's isolated Chrome installation; elsewhere run `npx playwright install chromium`, or set `CHROME_PATH` to your Chrome executable. No production data or real accounts are used by the tests.

## Author and continue

Open **Üben → Anleitung & Prompt**. Select **Französisch** or **Englisch**, then copy or download the complete prompt. It already includes the current JSON Schema. Paste it into a new external AI conversation, attach your school material, and copy the complete generated JSON answer. Return to **Text einfügen** (available in the guide and under **Üben**), paste, choose **Vorschau öffnen**, inspect it and explicitly accept. Downloading and selecting `lernstoff.json` remains available. The app does not send material to an AI.

The [prompt template](prompts/parent-authoring-prompt.md) and [schema](specs/schema/curriculum.schema.json) remain the source files. The app replaces the language placeholders and embeds the schema automatically. Instructions stay German; target content supports English and French. The small [French QA fixture](fixtures/french-smoke/curriculum.json) is an original technical test, not a source-derived French course.

Read [PRODUCT.md](PRODUCT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [QUALITY-RUBRIC.md](QUALITY-RUBRIC.md) and [the milestone evaluation](experiment/evaluation.md) for decisions, evidence and limits. The engine and design contracts live under `specs/`; source evidence is catalogued under `references/`. `tasks/todo.md` tracks the handoff.

The second milestone adds learn-before-practice and focused review. See [its evaluation](experiment/milestone-2-evaluation.md) for verification and independent-review closure. Existing 1.0 backups remain compatible. After rebuilding an already cached app, close its open tabs and reopen it to activate the new offline version.

The third milestone adds preview-before-import and advisory checks for unreachable practice. See [Milestone 3 evidence](experiment/milestone-3-evaluation.md). Choosing a file, viewing it or downloading the current backup never installs the previewed data.

Main module boundaries: `app/main.js` coordinates state, `ui.js` and `styles.css` render, `engine.js` selects/evaluates, `validation.js` guards imports, and `storage.js` persists atomically. `scripts/build-sw.js` generates the offline worker from the exact production files. There is no deployment service dependency.

The Lernpfad visual identity uses original scout-inspired illustrations and a route/compass symbol. Artwork is bundled locally and precached; no external image service is used at runtime. See [artwork provenance and prompts](experiment/lernpfad-artwork.md) and [mobile paste-import evaluation](experiment/mobile-paste-evaluation.md).
