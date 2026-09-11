# Mobile ChatGPT handoff — 2026-09-11

## Result

Parents can copy a generated curriculum response on their phone, choose **Üben → Text einfügen**, paste it into a normal textarea, and open the same validation/readiness preview used by file imports. The guide also links directly to this entry. The prompt explicitly requests the complete JSON response instead of only a download link.

Raw JSON and exactly one complete Markdown `json` fence are accepted. Arbitrary prose is not scanned for JSON fragments, and invalid or incomplete material is never silently repaired. The 5 MB UTF-8 cap and existing schema/semantic validation apply. No clipboard-read permission or AI connection is needed.

Draft text stays in memory through validation errors, preview editing and cancellation. It is excluded from IndexedDB and exports. The screen explains that reloading discards the draft. Typing does not rerender the textarea; incidental renders preserve focus and selection. Validation errors are announced and cleared as the user edits. Only explicit confirmation uses the existing atomic replacement transaction.

## Verification

- Production build, both fixture validations and 28 unit tests pass.
- 16 browser workflows cover the previous learning/import/export flows plus new mobile paste checks.
- Invalid JSON, raw French JSON, fenced JSON, hostile text, preview edit/cancel, saved progress preservation, failed transaction/retry, reload and backup download are exercised.
- On 320px and 390px layouts, no horizontal overflow; automated accessibility checks pass. Keyboard activation of the preview action works.
- After clearing HTTP cache and disabling network, both new illustrations load and the guide → pasted French import → lesson start flow works.
- Desktop and mobile dashboard, mobile management and pasted-input screenshots were rendered and inspected.
- Independent read-only review found no material data-loss, XSS or hosting defect. It identified a file-specific parse error conflicting with accepted fences; this was replaced by import-neutral correction guidance.

## Boundaries and next pilot

This verifies the implementation in Chromium, including narrow viewports. A physical iPhone/Android clipboard and software keyboard have not been exercised. The next meaningful pilot is the user's complete real-material French flow: generate from supplied school pages in a separate ChatGPT conversation, copy on the phone, paste here, review the content and complete a round. Record schema correction friction and ambiguous educational answers before expanding exercise types or adding further decoration.

An AI may still generate invalid or pedagogically weak content; the app checks the data contract, not all educational truth. No new schema, learner-state migration, backend or account is introduced.
