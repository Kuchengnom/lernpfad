export function mountainRoute(state) {
  const total = state.session.exercises.length;
  const complete = state.index + (state.feedback && (state.feedback.correct !== null || state.feedback.selfCheck) ? 1 : 0);
  const points = Array.from({ length: total + 1 }, (_, i) => {
    const x = 12 + (i / total) * 256;
    const y = 59 - (i / total) * 40 + Math.sin(i / total * Math.PI * 4) * 8;
    return [x, y];
  });
  return `<div class="mountain-progress" role="img" aria-label="${complete} von ${total} Aufgaben bearbeitet"><svg viewBox="0 0 280 80" aria-hidden="true"><polyline points="${points.map(p => p.join(',')).join(' ')}" class="mountain-line"/>${points.map(([x,y], i) => `<circle cx="${x}" cy="${y}" r="${i === complete ? 6 : 3}" class="${i <= complete ? 'waypoint-done' : 'waypoint-open'}"/>`).join('')}<path d="M268 19V3l-12 4 12 4" class="summit-flag"/></svg><span>${complete} von ${total} bearbeitet</span></div>`;
}
export function restView(state, button) {
  return `<section class="rest-page" aria-labelledby="rest-title"><p class="eyebrow">Bergzeit</p><h1 id="rest-title">Einmal kurz verschnaufen.</h1><img class="rest-art" src="./illustrations/lernpfad-bergzeit.webp" alt="Eine Bank mit Aussicht auf ein ruhiges Bergtal" width="1200" height="800"><p class="lede">Du hast ${state.index} Aufgaben bearbeitet. Noch ${state.session.exercises.length - state.index} bis zum Ziel.</p><p>Schau kurz in die Ferne und lass die Schultern locker. Du entscheidest, wann es weitergeht.</p><div class="rest-actions">${button('Weiterwandern', 'continue-rest', 'button button--primary')}${button('Später fortsetzen', 'exit', 'button button--quiet')}</div></section>`;
}
