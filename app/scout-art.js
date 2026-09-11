const compassPath = `<svg class="brand-mark__insignia" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="12.25"/><path d="m20.75 10.9-2.45 6.2-6.2 2.45 2.45-6.2 6.2-2.45Z"/><path class="brand-mark__trail" d="M7.5 22.5c2.1-1.9 3.8-.8 5.3-2.8 1.3-1.7.7-3.5 2.2-5.1"/></svg>`;

/** A small, original route-and-compass insignia for the application chrome. */
export function brandMark() {
  return compassPath;
}

/**
 * Decorative home artwork. The fixed intrinsic dimensions prevent layout shift
 * while the image is loading; adjacent text still describes the learning task.
 */
export function heroArtwork() {
  return `<div class="scout-art scout-art--hero" aria-hidden="true"><img src="./illustrations/lernpfad-trail.webp" alt="" width="1536" height="1024" decoding="async" fetchpriority="high"></div>`;
}

/** Decorative field-kit image for authoring and calm completion moments. */
export function fieldKitArtwork({ placement = 'authoring' } = {}) {
  return `<div class="scout-art scout-art--field-kit scout-art--${placement}" aria-hidden="true"><img src="./illustrations/lernpfad-field-kit.webp" alt="" width="1536" height="1024" decoding="async" loading="lazy"></div>`;
}
