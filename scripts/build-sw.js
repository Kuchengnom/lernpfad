import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? files(`${dir}/${e.name}`) : `${dir}/${e.name}`))).flat();
}
// The landing-page film is excluded: precaching ~6 MB of video would make the
// offline install slow and can fail addAll outright. It streams on demand.
const paths = (await files('dist')).filter(p => !p.endsWith('/sw.js') && !p.endsWith('.mp4')).sort();
const hash = createHash('sha256');
hash.update(await readFile(new URL(import.meta.url)));
for (const p of paths) hash.update(await readFile(p));
const cacheName = `trailbook-${hash.digest('hex').slice(0, 12)}`;
const urls = paths.map(p => `./${p.slice(5)}`);
// Build-generated precache includes every hashed JS/CSS chunk and the bundled course.
await writeFile('dist/sw.js', `const CACHE = ${JSON.stringify(cacheName)};
const FILES = ${JSON.stringify(urls)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('trailbook-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    // These are fixed same-origin build artifacts. Preview/CDN Vary: Origin headers
    // differ between precache fetches and module requests, but not their contents.
    const cached = await cache.match(event.request, { ignoreVary: true });
    if (cached) return cached;
    if (event.request.mode === 'navigate') return cache.match(new URL('./index.html', self.registration.scope));
    return fetch(event.request);
  }));
});
`);
console.log(`Offline shell: ${paths.length} files, ${cacheName}`);
