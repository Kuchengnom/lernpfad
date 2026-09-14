# Landing page for parents (`/welcome`) — 2026-09-12

## What it is

`welcome.html` is a static, parent-facing entry page. It does not load the application
bundle: no JavaScript, no framework, no webfont request, one reused illustration. Vite now
builds two entries (`index.html`, `welcome.html`) and `scripts/build-sw.js` precaches both,
so the page is available offline like the rest of the shell.

Audience: a German-speaking parent who is not technical and only wants a usable tool for
their child. The page has one job — make that parent understand what Lernpfad is and press
**Lernpfad öffnen**.

## Design decisions

**Identity follows the shipped product.** The palette (`--canvas #f7f3ea`, `--action #066e66`,
`--sun`, `--coral`, `--route`) and the Nunito Sans stack are copied from `app/styles.css`
rather than invented, so the landing page and the app are recognisably one thing. The token
block is duplicated at the top of `app/welcome.css` with a comment; change both together.

**No external fonts, ever.** A page whose central promise is "nothing leaves your device"
must not issue a request to `fonts.gstatic.com` to render its own headline. The system stack
is the honest choice. A self-hosted display face is listed below as an optional asset.

**The route is the structure.** The three steps sit on a dashed trail with waypoint pins,
turning horizontal above 60rem, instead of decorative `01 / 02 / 03` markers. The order is
real information — you cannot practise material you have not put in — and the trail is the
product's own metaphor, not ornament.

**One saturated block.** Only the privacy section inverts to deep pine. It is the thing
parents actually decide on, so it gets the page's single strong colour moment; everything
else stays on paper.

**Copy is the risk.** The page includes a "Was Lernpfad nicht ist" section — no substitute for
lessons, no grade or diagnosis, languages only, no microphone, not yet checked on Safari or
iPhone, not yet trialled with children. Landing pages do not normally admit this. For a tool
a parent is being asked to hand to their child, stating the limits is what earns the click,
and it matches the honesty standard the rest of this repository is held to.

## Claims and their basis

Every claim is checked against shipped behaviour. Nothing is advertised that is unbuilt or
unverified:

| Claim on the page | Basis |
| --- | --- |
| No account, no ads, no tracking | No backend, no analytics, no network calls beyond the static assets |
| Learner data stays in this browser | IndexedDB only; export is a user-initiated file download |
| Works offline after first open | Service worker precache, verified in `experiment/publication.md` |
| Written answers are not sent or stored in the backup | `experiment/known-limitations.md` |
| Five exercise types | Shipped: choice, text-input, word-tiles, reading, writing |
| Paste school material from a chat, with a preview first | Shipped, `experiment/mobile-paste-evaluation.md` |
| Read-aloud "where your device has a suitable voice" | Deliberately hedged; see `experiment/device-speech.md` |
| Practice score is not a grade | `experiment/known-limitations.md` |

Deliberately **not** claimed: the multi-book library and stamp album (in progress, unshipped),
maths, QR sharing, device sync, efficacy, age ranges, user numbers, testimonials.

## Verification

- `npm run build` succeeds with both entries; `dist/welcome.html` is 11.4 kB (4.1 kB gzip)
  plus a 7.9 kB stylesheet, and the service worker precaches 9 files.
- `npm test` still passes 52 of 52.
- Rendered and inspected at 1280px and at 375px. No horizontal overflow at either width
  (`scrollWidth === innerWidth`), exactly one `h1`, every image carries an `alt`, all internal
  links resolve. Interactive targets are at least 44px high after a correction.
- The illustration sits after the headline on phones, so the promise and both calls to action
  are above the fold at 375×812.
- FAQ uses native `<details>`, so it works with JavaScript disabled and is announced correctly.
- Focus is visible on every link and summary; `prefers-reduced-motion` is respected.

## Missing assets — for the GPT/Codex side to pick up

Ordered by how much each one is holding the page back.

1. **Three real app screenshots.** The page currently describes the product without showing
   it. Needed: a running exercise with feedback, the review queue, and the import preview.
   Each at 390px wide (phone) and ~1100px (desktop), PNG, taken against the bundled English
   course so no real child's data appears. Intended slot: a new section between "So
   funktioniert's" and "Wie geübt wird".
2. ~~**Open Graph / share image**~~ — **done.** `public/lernpfad-share.png`, 1200×630, 39 kB,
   rendered headlessly from the page's own tokens and wordmark rather than generated. The full
   `og:`/`twitter:` set is in `welcome.html`. Note the image, `og:url` and `canonical` use
   absolute `https://kuchengnom.github.io/lernpfad/` URLs: link crawlers do not resolve
   relative paths, and a relative `og:image` silently renders no preview card at all. Update
   those four values if the deployment host changes.
3. **A parent-facing hero illustration.** The current hero reuses
   `illustrations/lernpfad-trail.webp`, which was drawn for the child-facing dashboard. A
   variant showing a parent and child at a table with a school exercise book would match the
   audience. Same style, WebP, 1536×1024, under 350 kB.
4. **A 20–30 second screen recording** of the paste-import flow on a phone, as WebP/MP4 with a
   poster frame. This is the step parents find hardest to picture. Must be muted, must not
   autoplay under `prefers-reduced-motion`.
5. **Stamp illustrations**, once the collection work lands — six small images (fox, tent,
   compass, backpack, pine cone, mountain bird) would give the page a concrete reward visual.
   Do not add these to the page until the feature actually ships.
6. **Optional: a self-hosted display face**, subset to Latin, WOFF2, under 25 kB, with
   `font-display: swap`. Only worth it if it is genuinely served from the same origin — an
   external font request would contradict the page's own privacy claim.

Copy is complete and needs no placeholder text.

## Entry point: landing page at the root — 2026-09-12

Applied locally, **not yet pushed**. The root now serves the landing page and the application
moved to `lernen.html`.

Reasoning: people share the bare project URL, never `/welcome.html`, so the shared URL is the
one that needs the explanation and the share metadata. A cold visitor landing directly in the
app sees an exercise interface with no statement of what it is or where the data goes.

**No first-visit redirect.** The obvious design — serve the landing page, detect existing
progress, bounce returning visitors into the app — was deliberately rejected. Progress lives in
IndexedDB (`app/storage.js`), and IndexedDB reads are asynchronous, so the landing page would
paint and then jump: a visible flash on every visit for every returning user. Avoiding that
needs a synchronous `localStorage` marker, which is a second source of truth about "has used
this" that can disagree with the actual data. Instead the manifest's `start_url` points at
`./lernen.html`, so an installed home-screen icon opens the app directly and never shows the
landing page — the daily-use path, solved by one line of JSON. `id` deliberately stays `"./"`
so existing installs are not treated as a new application. If the extra tap turns out to
bother real users, the synchronous flag is a small later change.

`/app/` was avoided as a name because a source directory `app/` already exists and Vite serves
`/app/main.js` from it in development.

`scripts/build-sw.js` needed no change. Its navigation fallback returns `index.html`, which is
now the landing page — a sensible destination for an uncached offline navigation, and the
application page is precached under its own URL, so it is served from cache directly.

`scripts/check-pages.mjs` now checks the root landing page (title, a link to the application,
an absolute `og:image`, a reachable share image and both legal pages) and then runs the
existing application, service-worker-scope, offline-reload, authoring and lesson-start
assertions against `lernen.html`. `og:image` is asserted to be absolute rather than compared to
the host being checked, since it is pinned to the production host on purpose.

Verified: `npm run build` produces all four pages, `npm test` passes 52/52, and
`node scripts/check-pages.mjs http://127.0.0.1:4323/` passes end to end against the built
output, including the cache-cleared offline reload.

**Follow-up not done:** the application has no link back to the landing page. That belongs in
the app chrome in `app/ui.js`, which the library workstream currently holds. Add a quiet
"Was ist Lernpfad?" link there once that work lands.
## Legal pages

`impressum.html` and `datenschutz.html` were added as drafts, styled from the same tokens via
`app/legal.css`, linked from the landing page footer and built as their own Vite entries. Both
carry an explicit "Entwurf, keine Rechtsberatung" note.

The data-protection content is prefilled from the verified implementation, not from a template:
no cookies, no tracking, no analytics, no third-party embeds and no webfonts (checked by
grepping `app/*.js` for `fetch`, `XMLHttpRequest`, `sendBeacon` and `document.cookie` — there
are none); IndexedDB-only storage in the visitor's own browser (`app/storage.js`); the
user-initiated backup download as the recovery path; and no raw child-written text in the
backup (`experiment/known-limitations.md`). Two real data flows are disclosed rather than
glossed: GitHub Pages necessarily logging the visitor's IP address when the page is requested,
and the optional authoring step where a parent pastes a prompt into a third-party chat service,
with an explicit warning not to paste personal details about the child.

`§ 5 DDG` is cited as the current basis, the Digitale-Dienste-Gesetz having replaced `§ 5 TMG`
in May 2024. The `§ 18 Abs. 2 MStV` "Verantwortlich für den Inhalt" line is included with a
hedge, as it is common practice but not clearly required for a private, non-editorial page.

**Still required from the user before either page may be published:** `[Vor- und Nachname]`,
`[Straße und Hausnummer]`, `[PLZ und Ort]` and `[E-Mail-Adresse]`. German law requires a real,
reachable name and postal address on a publicly available page. No email address was written
into the files deliberately: publishing one exposes it permanently to scrapers, and that is the
operator's decision to make.

Neither page is asserted to be legally sufficient. A German page aimed at children's learning
warrants a lawyer's review before it goes public. Open questions the draft deliberately does
not settle: whether an explicit GDPR Art. 6(1) basis should be stated for the hosting log,
whether the competent supervisory authority should be named, and the MStV framing above.
