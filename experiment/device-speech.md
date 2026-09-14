# Device speech — 2026-09-12

## Result

Exercise audio buttons now speak with an explicit language tag instead of the browser's
guess. `app/speech.js` maps the curriculum's `targetLanguage` to `de-DE`, `en-GB` or `fr-FR`
and sets `utterance.lang` on every request. The previous helper in `app/ui.js` constructed a
bare `SpeechSynthesisUtterance` with no `lang` at all, which left the spoken language to
whatever the platform defaulted to — French vocabulary could be read in a German voice.

Voice selection is a pure function, `pickVoice(voices, tag)`. It considers only voices the
platform actually returned from `getVoices()`. An exact `lang` match wins, preferring
`localService === true` so an on-device voice is chosen over a remote one where both exist.
Failing that, a voice sharing the base language is accepted (`fr-CA` for a requested
`fr-FR`), again preferring a local one. Otherwise it returns `null` and no `voice` is
assigned, so the platform picks its own default for the explicitly set `lang`. A voice for a
different language is never substituted.

`getVoices()` commonly returns an empty list until the `voiceschanged` event fires. The
module caches voices, refreshes them on that event, and — when the list is still empty at
speak time — speaks anyway with the explicit `lang` set rather than blocking the button.
Each request cancels any utterance still in progress. Every call is wrapped so a speech
failure cannot break the learning UI.

`cancelSpeech()` is exported for exercise and course transitions but is **not yet wired**;
see the limitations below.

## Verification

- `npm test` passes: 52 of 52 checks, no failures — 41 pre-existing plus 11 new.
- `tests/speech.test.js` covers `pickVoice` (exact match, local-service preference among
  exact matches, base-language fallback, local-service preference among fallbacks, refusal
  to cross languages, empty list) and `speak` (lang is set, a matching voice is assigned,
  cancel runs before speaking, no voice assigned when none matches, speech still proceeds
  with an empty voice list, no-op on blank text or a missing synthesizer) and `cancelSpeech`.
- The integration in `app/ui.js` is three lines: the import, removal of the old stub, and
  passing `state.curriculum?.targetLanguage` to the `[data-audio]` handler. Re-read after the
  test run to confirm nothing else in that file changed.
- The Playwright suite was deliberately not run: the parallel library/stamps workstream is
  mid-change in those specs, so a run would not attribute failures honestly.

## Limitations

- **No real-device verification.** The iPhone flight-mode check with actual system voices has
  not been performed. Nothing in the code or UI claims offline speech availability. On iOS we
  can enumerate whatever voices the system returns; access to a specific named Siri voice is
  not something this implementation can promise.
- Verified only against a fake synthesizer in Node and the existing Chromium setup. Safari and
  Firefox speech behaviour, and installed-PWA behaviour, are not certified.
- `cancelSpeech()` is unused. Speech started on one exercise is cancelled only when the next
  `speak()` call happens, not when the learner leaves the round or switches course. The
  transition points live in `app/main.js`, held by the parallel workstream; wire it there.
- Only the exercise card renders a `[data-audio]` control, and only when the author supplied
  `audioText`. Vocabulary entries in the Lernbuch have no speak button yet.
- No recorded source audio, speech recognition or microphone access is involved. This is
  synthesis of authored text only.
