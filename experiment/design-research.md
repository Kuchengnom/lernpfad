# Design research — field notebook learning

**Scope.** This record turns the supplied application screenshots and the public
[DesignMotion pattern library](https://www.designmotionhq.com/patterns) into
interaction principles for the local-first prototype. The sources are evidence
for behaviour and hierarchy only. No reference branding, characters, copy,
illustrations, layouts, or reward treatments are design inputs.

## Direction adopted

The product should feel like a young learner's *travel field notebook*: tactile,
calm, observant, and ready to use. It is a companion for a German-speaking
child learning English around holiday stories and getting around—not a game
world competing with the lesson.

The visual vocabulary is warm off-white paper, ink-like navy text, a sea-glass
teal action colour, tomato-red correction colour, and small sun-yellow progress
marks. A route line, destination stamps, ticket-like labels, and tiny map
marks may convey progression, but must remain abstract CSS/SVG shapes rather
than mascot art. Headings use a friendly rounded sans serif; body copy remains
highly legible and compact. The result should have generous space, clear
paper-like cards, and small moments of delight without a high-saturation
arcade aesthetic.

## Screenshot observations

| Source | Purpose and hierarchy | Reusable behaviour | Accessibility and non-copy boundary |
| --- | --- | --- | --- |
| Learning path | Makes the next available lesson unmistakable while showing a larger journey. | Show one primary “continue” point, then a quiet route of completed and upcoming stops. | A path alone is not a sufficient state indicator; use text, status, and a conventional action. Do not copy the serpentine map, icons, colour palette, or mascot.
| New-word introduction | Establishes a single learning objective before asking for an answer. A progress bar sits above the task. | One exercise at a time; stable session position; optional audio control adjacent to the phrase. | Audio needs a text alternative/label and answer choices need full keyboard access. Do not copy its task wording or character scene.
| Sentence feedback | Keeps the submitted work visible, then adds success, explanation, and a clear continuation action. | Feedback belongs to the answered exercise and gives a short reason when useful. | Feedback needs semantic live announcement and more than a green treatment. Do not copy the bottom-sheet composition, reward wording, or token styling.
| Practice collections | Turns learner needs (listening, speaking, mistakes) into distinct, scannable entry points. | Dashboard offers targeted review alongside the default next lesson. | Treat unsupported browser speaking as optional; do not show it as a broken requirement. Do not copy illustrated collection cards or navigation iconography.
| Challenge, reward, and mission screens | Reward and optional challenge are intentionally separated from the next required step. | Completion can reveal a small stamp/XP update; challenge is always deferrable. | No pressure, loss timers, or streak penalties. Do not copy currencies, challenge framing, or the reward reveal treatment.
| Comparative feature boards | Role-play, pronunciation, conversation, progress, and achievements are presented as separate capabilities. | Use concise capability labels and contextual entry points, not feature overload in an exercise. | Never imply reliable automatic speaking assessment when the platform cannot provide it. Do not copy AI claims, people/avatars, or collage composition.

## DesignMotion observations

The DesignMotion library’s public catalogue was inspected on 2026-09-09. The
patterns most relevant here are **Focus States**, **Navigation Patterns**,
**Animation Timing**, **Form Field States**, **File Upload UX**, **Error
States**, **Peak-End Rule**, and **Design Tokens**.

- **Focus is navigational information.** Keyboard focus must be visible on
  every interactive control; it must not rely on a faint shadow or hover.
- **Navigation changes by context.** The parent-facing desktop shell can use a
  labelled side rail; compact learner views use a labelled bottom bar only for
  top-level destinations. A session itself suppresses both in favour of one
  close/leave decision and its progress position.
- **Timing communicates cause.** A response should acknowledge immediately;
  only short 120–180ms transitions are appropriate for selection and feedback.
  Reward stamps may use one 220ms scale/fade moment. No animation may delay
  the next exercise, and `prefers-reduced-motion` removes transform animation.
- **Upload and error are states, not alerts.** Import has an empty drop zone,
  selected-file state, validating state, actionable schema-error state, and
  finished state. Errors occur beside the affected control and keep the file
  selection available for correction.
- **The peak and end matter.** The completion view confirms what was learned,
  changes progress, and offers one calm next action; it does not demand sharing
  or turn completion into an interruption.

## Screen model

| Screen | Primary action | Supporting information | Responsive treatment |
| --- | --- | --- | --- |
| Home / dashboard | Continue the suggested short session | Unit route, review queue, recent stamps, import/export utility | Two columns on wide screens; main continuation card first on narrow screens.
| Learn | Answer the current exercise | Session position, optional audio, leave action | Centered reading column, no competing dashboard navigation.
| Answer feedback | Continue after understanding outcome | Submitted answer, correct form, brief explanation | Anchored below the exercise on desktop; a persistent but non-obscuring action area on narrow screens.
| Review | Start a specific weak-concept set | Why it is due, concept count, latest success state | Cards become single-column; no horizontal scroll.
| Progress | Inspect concepts and route | Mastery labels, completed lesson stamps, learning history | Summary first; table/list adapts to stacked labelled rows.
| Import/export | Choose a JSON file or download portable state | Privacy statement, validation result, data ownership | Desktop side-by-side actions; mobile stacked actions with generous targets.

## Decisions for implementation

1. Use native buttons, inputs, dialog, progress, and lists before custom
   interaction widgets. Word tiles are buttons; selected order is announced in
   a live status region and can be undone.
2. Make the page background quiet and the current action the only saturated
   large element. Colour names never stand in for state text.
3. Keep answer feedback in the same reading flow. A child should not need to
   remember an answer after a modal replaces the exercise.
4. Use a 44px minimum pointer target, 16px minimum normal text, 1.5 line
   height for explanations, and an explicit 3px focus ring.
5. Use CSS custom properties for all colour, spacing, shape, shadow, and
   timing decisions so child-facing screens cannot drift into independent
   styling.

## Open questions to validate in the built prototype

- Does the route metaphor clarify curriculum progress when the fixture has
  only one unit, or should it appear only after additional units are imported?
- Is a fixed feedback action area comfortable on a 320px-wide mobile viewport
  with a software keyboard open?
- Does the chosen text contrast remain legible on low-quality school devices
  and under dark-system settings if a dark mode is later introduced?

## Final implementation check

The four core learning/path/feedback/practice screenshots were directly inspected; remaining grouped reference rows also use the supplied catalogue descriptions. The product uses a labelled file picker with validation/status messages, not the proposed drop zone. Optional audio, challenge and fixed feedback overlays were not needed for the milestone. Final rendered evidence and corrections are in evaluation.md.
