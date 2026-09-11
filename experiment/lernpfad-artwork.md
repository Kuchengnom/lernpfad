# Lernpfad artwork — 2026-09-11

The user requested a scout/pathfinding visual world. Two original illustrations were created with the built-in image generation tool, inspected visually, copied into this workspace and encoded as WebP with `cwebp -q 82`. No third-party artwork, scout organization insignia or supplied textbook images were used. Generated text is deliberately absent; all labels remain accessible HTML.

Production assets (1536 × 1024 each):

- `public/illustrations/lernpfad-trail.webp` — 341,174 bytes; home dashboard.
- `public/illustrations/lernpfad-field-kit.webp` — 183,784 bytes; authoring entry.

Original PNG copies are retained locally under `experiment/evidence/artwork-originals/` and excluded from Git. Generated originals also remain in the default Codex generated-images directory. Production assets are committed with the app, served from relative project URLs and included in the generated offline cache. Both load offline after HTTP cache is cleared. The two assets together cost 524,958 bytes; there is no runtime image API.

The brand compass/path symbol and PWA icon are original SVG code. Existing browser storage identifiers remain unchanged for compatibility; current visible application branding and download filenames use Lernpfad.

## Final generation prompt: trail

Use case: illustration-story. Create an original production illustration for Lernpfad, a German children's school-learning app with a scout/pathfinding world. Asset: landscape dashboard artwork, 3:2 composition, no UI, no text. A winding ochre walking trail leads from the bottom foreground across gentle sage hills into a deep teal pine forest; a small wooden direction sign and a modest ochre canvas scout tent beside the path suggest finding your own way. Small coral trail markers, warm sun, calm cream sky. Hand-painted editorial picture-book illustration with tactile gouache and subtle paper texture, confident simple shapes, tasteful detail, warm and inviting for ages 10–14 rather than preschool. Palette grounded in #17353e dark forest, #0b7067 teal, #85aaa0 sage, #efb832 ochre, #d65d46 coral, #f6f2e8 parchment. Composition cohesive, no characters needed, no lettering, no emblems or real scout organization symbols, no photorealism, no exaggerated 3D gloss. Artwork fills the rectangular landscape frame and stays clearly legible at 400px wide.

## Final generation prompt: field kit

Use case: illustration-story. Original production illustration for Lernpfad school-learning web app in a warm scout/pathfinding visual world. Landscape 3:2 editorial still life: an open field notebook with a few abstract nonverbal marks, a folded hiking map with a winding ochre path, a handsome simple brass compass, a pencil, and a folded teal/coral scout neckerchief, arranged together on a warm parchment ground. A small pine twig suggests outdoors. Hand-painted gouache with subtle paper grain and confident shapes, sophisticated picture-book/editorial illustration appropriate ages10–14. Palette dark forest #17353e, teal #0b7067, sage #85aaa0, ochre #efb832, coral #d65d46, parchment #f6f2e8. Calm generous empty space around objects, forms legible at 300px, objects grouped centrally. No words, no letters, no numbers, no UI, no fake seals, no official scout organization insignia, no photographs, no 3D gloss. It should evoke preparing your own journey and collecting knowledge, complementing an illustrated winding trail through a pine forest.

## Inspection

Accepted both first outputs: the winding route and trail markers are readable; field-kit objects are coherent and nonverbal. The hero is cropped responsively with a solid-enough caption surface; course name and start button remain separate HTML. Mobile start action precedes artwork. The import card is first under Üben so decorative imagery does not push the returning user's primary action down the page. Decorative images have empty alternative text and intrinsic dimensions. Final layout evidence lives under `experiment/evidence/scout-*.png`.
