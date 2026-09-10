# Design-system specification

## Intent

Use a restrained travel field-notebook identity for a German-speaking child
learning English. It should feel warm, local, and practical: a notebook for
short journeys through a unit. This is an original system, informed by
interaction research recorded in [design research](../../experiment/design-research.md),
not a derivative of any reference application.

## Foundations

### Typography

- UI and body: `Nunito Sans`, `Avenir Next`, `Segoe UI`, sans-serif; use the
  system fallbacks when no font is locally available.
- Display: 700–800 weight, `clamp(1.7rem, 3vw, 2.6rem)`, 1.1 line height.
- Section heading: 700 weight, `clamp(1.25rem, 2vw, 1.6rem)`.
- Body: 400–600 weight, 1rem minimum, 1.5 line height.
- Labels: 700 weight, .75rem minimum, letter spacing .06em; never use labels
  as the only presentation of essential information.

### Tokens

Implement the following as CSS custom properties. Components must consume the
semantic aliases rather than hard-coded values.

| Family | Token values / role |
| --- | --- |
| Canvas | `--canvas: #F7F3EA`, `--paper: #FFFCF6`, `--paper-muted: #F0E9DA` |
| Ink | `--ink: #18313A`, `--ink-muted: #52666B`, `--line: #D7D2C7` |
| Action | `--action: #087E75`, `--action-strong: #05665F`, `--action-on: #FFFFFF` |
| Status | `--success: #18794E`, `--success-bg: #E2F3E8`, `--error: #B7382D`, `--error-bg: #FBE8E5`, `--notice: #9A5B00`, `--notice-bg: #FFF0C9` |
| Progress | `--sun: #E7A51B`, `--coral: #D35D46`, `--route: #A8C7C1` |
| Shape | `--radius-sm: .5rem`, `--radius-md: .875rem`, `--radius-lg: 1.25rem`, `--radius-pill: 999px` |
| Space | `--space-1: .25rem`, `--space-2: .5rem`, `--space-3: .75rem`, `--space-4: 1rem`, `--space-6: 1.5rem`, `--space-8: 2rem`, `--space-12: 3rem` |
| Layout | `--content: 44rem`, `--shell: 76rem`, `--touch: 2.75rem` |
| Depth | `--shadow-card: 0 2px 0 rgba(24,49,58,.08), 0 8px 20px rgba(24,49,58,.06)` |

Use dark ink on paper and white on the action surface. Text and controls must
meet WCAG AA contrast; do not place instructional text directly on `--sun`.

### Layout

The desktop shell has a 14rem labelled side rail and a fluid content area,
with a `--shell` maximum width. The learner task uses a `--content` maximum
width. At 760px and below, the side rail becomes a labelled bottom navigation
for top-level destinations; the learning session does not show global
navigation. At 480px and below, cards use `--space-4` padding and utilities
stack. No essential content may depend on hover or horizontal scrolling.

## Components

| Component | Contract | Semantic HTML and keyboard behaviour |
| --- | --- | --- |
| Button | Primary action is solid teal; secondary is paper with ink border; quiet is text-like. All are at least `--touch` high. Disabled state communicates why where relevant. | `<button>`; Enter/Space activate. Use `aria-busy` during an in-progress local action, never an unexplained permanent disabled state. |
| Navigation | Selected destination has an ink label and route marker; visual colour is supplementary. | `<nav aria-label>` with links/buttons. Current item uses `aria-current="page"`; Tab reaches each item. |
| Progress route | Displays completed, current, and upcoming learning stops with textual state. | Ordered list plus `<progress>` or an `aria-label`led meter. Do not encode completion only by colour or a path position. |
| Exercise card | One prompt, optional audio, answer controls, and feedback in a stable centered card. | `<main>` contains an `<article>` or `<form>`; prompt uses a heading. Native radio/checkbox/input controls are preferred. |
| Word tile | A moveable-looking but deterministic answer choice. Selected state is obvious and reversible. | `<button aria-pressed>`; Tab navigates each tile, Enter/Space selects. Provide an Undo button and live status for selected order. |
| Feedback panel | Success, correction, explanation, and exactly one next decision. | `role="status"` for non-blocking response; error feedback additionally identifies the affected answer control. Use an icon plus visible text. |
| Stamp / reward | A small progress acknowledgement after a completed lesson, never a currency or pressure device. | Decorative mark is `aria-hidden`; the achievement message is text in a status region. |
| Import drop zone | Resting, selected, validating, error, and complete states; supports click and file chooser. | Native `<input type="file" accept="application/json,.json">` remains operable. Drop is an optional enhancement, with clear status text. |
| Export | Lets a learner/parent download a portable state deliberately. | A named `<button>`; only create the download after activation. State what data is included. |
| Modal / confirm | Used only for leaving an in-progress session or a destructive local replacement. | Native `<dialog>`; focus moves into it, Escape closes non-destructive dialogs, and focus returns to invoker. |

## States and feedback

Selected controls have an ink border plus action-colour fill/mark. Correct
feedback uses success colour, a check mark, and a sentence such as “Correct —
*drove* is the past form of *drive*.” Incorrect feedback names the correct
form and gives a short reason when the fixture supplies one. Inputs expose
`aria-invalid` and a programmatic error description. Empty, loading, imported,
and no-review states each state what the learner can do next.

## Motion

State changes must be immediate. Buttons may use a 120ms colour/shadow
transition; panels may use opacity/transform over 160ms; a completion stamp
may use one 220ms ease-out entrance. Motion cannot be required to understand
selection, feedback, or progress. Under `prefers-reduced-motion: reduce`,
remove transform animation and reduce transitions to a near-instant opacity
change.

## Verification checklist

- Tab through dashboard, import/export, every answer option, feedback, and
  leave confirmation; focus is obvious and ordered.
- Check 320px, 768px, and 1280px widths. The primary action is visible without
  horizontal scrolling and every target remains at least 44px.
- Enable reduced motion and complete an answer. Meaning and completion remain
  clear without movement.
- Check text/status combinations without colour perception and inspect focus,
  disabled, selected, error, success, and empty states.

Rendered QA correction: action text darkened to #066e66 for small-label contrast. Mobile has a compact progress/offline header and bottom navigation; artwork is bounded above its caption. Native disabled states are used without redundant stale aria-disabled flags.
