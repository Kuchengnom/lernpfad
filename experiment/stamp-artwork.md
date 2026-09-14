# Collectible stamp and Bergzeit artwork

Created 2026-09-14 with the built-in `image_gen` tool, using one generation call per asset. No CLI/API generation fallback was used.

The existing `public/illustrations/lernpfad-trail.webp` / original `experiment/evidence/artwork-originals/lernpfad-trail.png` was visually inspected for the established palette and gouache style. It served as a visual style reference during prompt preparation; no reference image was passed into generation.

## Deliverables

| Asset | Final WebP | Preserved PNG original | Dimensions |
| --- | --- | --- | --- |
| fox | `public/illustrations/stamps/fox.webp` | `experiment/evidence/artwork-originals/stamp-fox.png` | 512 × 512 |
| tent | `public/illustrations/stamps/tent.webp` | `experiment/evidence/artwork-originals/stamp-tent.png` | 512 × 512 |
| compass | `public/illustrations/stamps/compass.webp` | `experiment/evidence/artwork-originals/stamp-compass.png` | 512 × 512 |
| backpack | `public/illustrations/stamps/backpack.webp` | `experiment/evidence/artwork-originals/stamp-backpack.png` | 512 × 512 |
| pinecone | `public/illustrations/stamps/pinecone.webp` | `experiment/evidence/artwork-originals/stamp-pinecone.png` | 512 × 512 |
| bird | `public/illustrations/stamps/bird.webp` | `experiment/evidence/artwork-originals/stamp-bird.png` | 512 × 512 |
| bergzeit | `public/illustrations/lernpfad-bergzeit.webp` | `experiment/evidence/artwork-originals/lernpfad-bergzeit.png` | 1200 × 800 |

## Preparation and visual review

Generated originals were copied from the built-in output location into the repository. Final WebP files were converted with `cwebp -quiet -q 85 -resize 512 512` for stamps and `-resize 1200 800` for Bergzeit. Each final WebP was opened and visually inspected: requested subjects are recognizable and fully framed, the six stamps share warm cream backgrounds and a gouache field-guide style, the mountain scene contains the empty bench and calm valley, and no visible words, logos, borders, or watermarks are present. The originals remain intact for future exports.

## Exact prompts and source provenance

### fox

Built-in source: `/Users/shaase/.codex/generated_images/01a09f9e-54f7-7cc2-bf3f-c7cb803a3a99/exec-39fe195a-ce4e-414f-8700-3dbc5fc68c81.png`

```text
Use case: illustration-story. Asset type: square collectible scout stamp illustration for Lernpfad, a cozy language-learning app. Primary request: a friendly seated red fox with a large curling tail, simple gentle face. Style: original charming hand-painted gouache, subtle paper grain, simple confident shapes, detailed enough to feel crafted yet readable as a small icon; match a vintage illustrated mountain hiking field guide. Composition: one centered subject, generous empty margin on all four sides, square 1:1 image. Background: flat warm cream #f5f0e5, no scene or frame. Cohesive palette: deep petrol teal, muted sage, golden ochre, tiny warm coral accents. Constraints: no words, letters, numbers, logos, watermark, border, human, or UI. Produce a single standalone illustration, not a contact sheet.
```

### tent

Built-in source: `/Users/shaase/.codex/generated_images/01a09f9e-54f7-7cc2-bf3f-c7cb803a3a99/exec-9e6f3e7d-1f32-46a6-ae72-3c8bdb480ad8.png`

```text
Use case: illustration-story. Asset type: square collectible scout stamp illustration for Lernpfad, a cozy language-learning app. Primary request: a small ochre canvas triangular scout tent with teal shading, a warmly inviting open entrance. Style: original charming hand-painted gouache, subtle paper grain, simple confident shapes, detailed enough to feel crafted yet readable as a small icon; match a vintage illustrated mountain hiking field guide. Composition: one centered subject, generous empty margin on all four sides, square 1:1 image. Background: flat warm cream #f5f0e5, no scene or frame. Cohesive palette: deep petrol teal, muted sage, golden ochre, tiny warm coral accents. Constraints: no words, letters, numbers, logos, watermark, border, human, or UI. Produce a single standalone illustration, not a contact sheet.
```

### compass

Built-in source: `/Users/shaase/.codex/generated_images/01a09f9e-54f7-7cc2-bf3f-c7cb803a3a99/exec-2226f565-ea32-4b4b-986a-eeae111eaeaf.png`

```text
Use case: illustration-story. Asset type: square collectible scout stamp illustration for Lernpfad, a cozy language-learning app. Primary request: a handsome round pocket compass in brass ochre and deep teal, with a coral needle, simple direction ticks without letters or numerals. Style: original charming hand-painted gouache, subtle paper grain, simple confident shapes, detailed enough to feel crafted yet readable as a small icon; match a vintage illustrated mountain hiking field guide. Composition: one centered subject, generous empty margin on all four sides, square 1:1 image. Background: flat warm cream #f5f0e5, no scene or frame. Cohesive palette: deep petrol teal, muted sage, golden ochre, tiny warm coral accents. Constraints: no words, letters, numbers, logos, watermark, border, human, or UI. Produce a single standalone illustration, not a contact sheet.
```

### backpack

Built-in source: `/Users/shaase/.codex/generated_images/01a09f9e-54f7-7cc2-bf3f-c7cb803a3a99/exec-8fa69cb5-f554-48a3-8be2-502ff74174f4.png`

```text
Use case: illustration-story. Asset type: square collectible scout stamp illustration for Lernpfad, a cozy language-learning app. Primary request: a well-loved ochre canvas hiking backpack, teal straps and a sage rolled blanket. Style: original charming hand-painted gouache, subtle paper grain, simple confident shapes, detailed enough to feel crafted yet readable as a small icon; match a vintage illustrated mountain hiking field guide. Composition: one centered subject, generous empty margin on all four sides, square 1:1 image. Background: flat warm cream #f5f0e5, no scene or frame. Cohesive palette: deep petrol teal, muted sage, golden ochre, tiny warm coral accents. Constraints: no words, letters, numbers, logos, watermark, border, human, or UI. Produce a single standalone illustration, not a contact sheet.
```

### pinecone

Built-in source: `/Users/shaase/.codex/generated_images/01a09f9e-54f7-7cc2-bf3f-c7cb803a3a99/exec-c040fcae-7ff3-459a-a05d-deea1b27fbfa.png`

```text
Use case: illustration-story. Asset type: square collectible scout stamp illustration for Lernpfad, a cozy language-learning app. Primary request: one beautifully shaped woodland pinecone in ochre and warm brown, with a small sage pine sprig. Style: original charming hand-painted gouache, subtle paper grain, simple confident shapes, detailed enough to feel crafted yet readable as a small icon; match a vintage illustrated mountain hiking field guide. Composition: one centered subject, generous empty margin on all four sides, square 1:1 image. Background: flat warm cream #f5f0e5, no scene or frame. Cohesive palette: deep petrol teal, muted sage, golden ochre, tiny warm coral accents. Constraints: no words, letters, numbers, logos, watermark, border, human, or UI. Produce a single standalone illustration, not a contact sheet.
```

### bird

Built-in source: `/Users/shaase/.codex/generated_images/01a09f9e-54f7-7cc2-bf3f-c7cb803a3a99/exec-b0f54258-b0bb-4e98-883b-07d9a0814965.png`

```text
Use case: illustration-story. Asset type: square collectible scout stamp illustration for Lernpfad, a cozy language-learning app. Primary request: a small friendly woodland songbird with an ochre breast, coral cheek, teal and sage wings, perched on a short twig. Style: original charming hand-painted gouache, subtle paper grain, simple confident shapes, detailed enough to feel crafted yet readable as a small icon; match a vintage illustrated mountain hiking field guide. Composition: one centered subject, generous empty margin on all four sides, square 1:1 image. Background: flat warm cream #f5f0e5, no scene or frame. Cohesive palette: deep petrol teal, muted sage, golden ochre, tiny warm coral accents. Constraints: no words, letters, numbers, logos, watermark, border, human, or UI. Produce a single standalone illustration, not a contact sheet.
```

### bergzeit

Built-in source: `/Users/shaase/.codex/generated_images/01a09f9e-54f7-7cc2-bf3f-c7cb803a3a99/exec-40753d2d-ad27-48aa-a97b-5cdbffa7b2b1.png`

```text
Use case: illustration-story. Asset type: landscape 3:2 scenic illustration for Lernpfad, a cozy language-learning app. Primary request: a peaceful empty wooden bench on a grassy mountain overlook facing a calm alpine valley, layered blue-green mountains and a still distant lake, a few fir trees framing the sides, soft golden sun in a warm cream sky. Style: original hand-painted gouache with visible subtle paper grain and organic confident brushwork, evocative vintage hiking field guide. Palette: deep petrol teal firs, muted sage meadow, blue-green mountains, golden ochre sunshine and wood, tiny warm coral wildflowers. Composition: inviting bench in the lower foreground seen from behind at a gentle angle, landscape opens into the distance with spacious calm sky. Mood: quiet rest and reflection, gentle warm daylight. Constraints: no people, animals, words, letters, numbers, logos, watermark, border, or UI. Landscape 3:2 image, suitable for delivery at 1200x800.
```

