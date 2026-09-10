# Authoring guide and French support

Completed 2026-09-10 in response to the user's intended French authoring/import test.

The former prompt existed only in the repository and its schema rejected French. The app now exposes **Üben → Anleitung & Prompt**, defaulting to French with English also selectable. The copied/downloaded prompt contains German authoring instructions and the exact current curriculum schema; no second schema attachment is required. A schema-only download is available. The user opens their own external conversation and attaches their materials; the app sends nothing automatically.

The schema now accepts `en` and `fr` as target languages while keeping German source/instruction language and the existing learner format. Older English files remain compatible. Older app builds reject French files, so cached app tabs should be closed and reopened before testing. Target labels, language attributes and answer prompts now follow the imported course. Canonical Unicode is normalized to NFC; accents remain significant and apostrophe alternatives are accepted only when authored.

The small `fixtures/french-smoke/curriculum.json` is an original synthetic software test, explicitly labelled as such. It exercises accents, apostrophes, a short reading, word tiles and writing self-check. It is not a textbook-derived French curriculum or proof of an external model's output quality.

## Verification

- Production build and validation of English and French fixtures pass.
- 27 unit checks pass, including French schema/backup round-trip, all five evaluators, composed/decomposed accents, explicit straight/curly apostrophes and rejection of missing accents.
- 14 browser workflows pass. New checks verify actual clipboard contents, copied/downloaded prompt equivalence, embedded schema equality, English/French selection, schema download, clipboard failure fallback, offline guide access, mobile overflow/axe checks, five French types, French language metadata, and progress after reload/export.
- [Browser log](evidence/authoring-browser-tests.txt) and [mobile guide](evidence/authoring-guide-mobile.png) provide evidence. Astra inspected the rendered guide.

A Terra workstream drafted the template and prompt builder before reaching its usage limit. The French implementation workstream also hit that limit; Astra completed integration, French support, the fixture, tests and review. No separate final independent review is claimed for this increment. A test-only timing issue was corrected by waiting for the saved exercise transition before reading the next question. Previous English/import/offline workflows remain green.

## User test

Select French, copy the prompt, paste into a new AI conversation with French school materials, and save the generated JSON. In the app choose Lernstoff importieren, inspect preview and warnings, export the current backup if desired, then accept. If validation fails, return the precise error and generated file to the authoring conversation for correction. Review the French content against the supplied material; automated schema validation cannot establish educational accuracy.
