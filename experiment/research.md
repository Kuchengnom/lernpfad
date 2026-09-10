# Research ledger — 2026-09-09

- [Curriculum evidence](curriculum-research.md): source photos, direct observations, original exercise construction and independent answer-key review.
- [Interaction/design analysis](design-research.md): inspected application screenshots and DesignMotion principles; patterns selected/rejected before UI construction.
- [Architecture](../ARCHITECTURE.md): primary Vite, Ajv and MDN references for static builds, validation, service-worker lifecycle and secure contexts.
- [Data-boundary QA](data-qa.md): independent import/persistence findings, followed by corrections recorded in evaluation.

Inference: a static browser runtime is sufficient for this milestone. This was verified by a production offline lesson and portable backup restore rather than inferred merely from the absence of a backend.

Reminders: service workers are event-driven and cannot promise a chosen wall-clock alarm while the browser is closed. No server push or unreliable timer is presented as a reminder feature. The milestone uses self-paced practice without notifications. See [MDN service-worker lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers). Browser speech and Web Share remain optional investigations; no microphone permission or remote voice is used.
