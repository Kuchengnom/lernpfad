# Application modules

The app is implemented as plain ES modules, bundled by the root Vite project. Run commands from the repository root; see ../README.md.

- `main.js`: transaction-aware learning state machine and file exchange.
- `engine.js`: pure session selection, answer evaluation, concept review, idempotent completion.
- `validation.js`: JSON Schema + semantic checks, backup replay integrity.
- `profile.js`: versioned multi-book migration, validation and full-profile exchange.
- `stamps.js`, `journey.js`, `books-view.js`: collection, mountain pause and book views.
- `speech.js`: local device voice selection and cancellation.
- `storage.js`: IndexedDB transaction and origin writer lock.
- `ui.js`, `styles.css`: original responsive design system and five exercise primitives.

No raw answer text is persisted/exported. UI drafts live only until the current session ends. The app imports the original curriculum JSON from fixtures at build time; it never loads reference image paths.
