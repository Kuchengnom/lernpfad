export const STAMPS = [
  { id: 'fox', title: 'Neugieriger Fuchs', rounds: 1 },
  { id: 'tent', title: 'Gemütliches Basislager', rounds: 3 },
  { id: 'compass', title: 'Dein eigener Kompass', rounds: 5 },
  { id: 'backpack', title: 'Rucksack voller Wissen', rounds: 10 },
  { id: 'pinecone', title: 'Waldentdecker', rounds: 20 },
  { id: 'bird', title: 'Hoch hinaus', rounds: 40 },
];
export function completedRounds(profile) {
  return (profile?.books || []).reduce((count, book) => count + new Set(book.workspace.learner.completedSessionIds).size, 0);
}
export function awardStamps(profile, sessionId, now = new Date().toISOString()) {
  const count = completedRounds(profile);
  const awarded = new Set(profile.stampAwards.map(a => a.stampId));
  const fresh = STAMPS.filter(stamp => count >= stamp.rounds && !awarded.has(stamp.id));
  if (!fresh.length) return profile;
  return { ...profile, stampAwards: [...profile.stampAwards, ...fresh.map(stamp => ({ id: stamp.id, stampId: stamp.id, earnedAt: now, bookId: profile.activeBookId, sessionId }))] };
}
const picture = stamp => `<img src="./illustrations/stamps/${stamp.id}.webp" alt="" width="512" height="512" loading="lazy" decoding="async">`;
export function stampStrip(state, button) {
  const awards = state.profile?.stampAwards || [];
  const latest = awards.slice(-3).map(award => STAMPS.find(stamp => stamp.id === award.stampId)).filter(Boolean);
  return `<section class="card collection-entry"><div><p class="eyebrow">Deine Sammelmappe</p><h2>${awards.length ? `${awards.length} kleine Erinnerungen an deinen Weg` : 'Dein erster Stempel wartet.'}</h2><p>Jede abgeschlossene Runde zählt. Deine Sammlung bleibt bei dir, auch wenn du das Lernbuch wechselst.</p>${button('Sammelmappe öffnen', 'navigate', 'button button--secondary', 'data-view="album"')}</div><div class="stamp-strip" aria-hidden="true">${latest.length ? latest.map(picture).join('') : picture(STAMPS[0])}</div></section>`;
}
export function albumView(state, esc, button) {
  const awards = state.profile?.stampAwards || [];
  const count = completedRounds(state.profile);
  return `<section class="album-page"><p class="eyebrow">Dein Weg bleibt sichtbar</p><h1>Meine Sammelmappe</h1><p class="lede">${awards.length} von ${STAMPS.length} Motiven gesammelt. ${count} abgeschlossene Lernrunde${count === 1 ? '' : 'n'} in deinen Lernbüchern.</p><p>Die Stempel würdigen dein Dranbleiben. Du brauchst dafür keine fehlerfreie Runde.</p><div class="stamp-grid">${STAMPS.map(stamp => { const award = awards.find(a => a.stampId === stamp.id); return `<article class="card stamp-card ${award ? 'is-earned' : 'is-future'}">${picture(stamp)}<h2>${esc(stamp.title)}</h2><p>${stamp.rounds === 1 ? 'Deine erste abgeschlossene Runde' : `${stamp.rounds} abgeschlossene Runden`}</p><strong>${award ? 'Gesammelt' : 'Noch zu entdecken'}</strong>${award ? `<p>Verliehen am ${esc(new Date(award.earnedAt).toLocaleDateString('de-DE'))}</p>` : ''}</article>`; }).join('')}</div><p>Mit „Alles sichern“ nimmst du auch deine Sammelmappe auf ein anderes Gerät mit.</p>${button('Alles sichern', 'export-profile', 'button button--primary')}</section>`;
}
export function completionStamps(state) {
  const earned = STAMPS.filter(stamp => state.summary?.newStampIds?.includes(stamp.id));
  if (!earned.length) return '';
  return `<section class="new-stamps" aria-label="Neu in deiner Sammelmappe"><p class="eyebrow">Neu in deiner Sammelmappe</p>${earned.map(stamp => `<div class="new-stamp">${picture(stamp)}<h2>${stamp.title}</h2></div>`).join('')}</section>`;
}
