// Device speech: window.speechSynthesis with explicit lang tags, never a silent
// cross-language voice fallback. See experiment/next-product-increment.md "Device speech".

export const LANG_TAGS = { de: 'de-DE', en: 'en-GB', fr: 'fr-FR' };

export function languageTag(code) {
  return LANG_TAGS[code] || LANG_TAGS.de;
}

const normalize = lang => String(lang || '').replace(/_/g, '-').toLowerCase();
const baseLang = lang => normalize(lang).split('-')[0];

// Pure selection: never guess a voice for a different language than requested.
export function pickVoice(voices, tag) {
  const list = voices || [];
  const wanted = normalize(tag);
  const exact = list.filter(voice => normalize(voice.lang) === wanted);
  if (exact.length) return exact.find(voice => voice.localService === true) || exact[0];
  const sameBase = list.filter(voice => baseLang(voice.lang) === baseLang(wanted));
  if (sameBase.length) return sameBase.find(voice => voice.localService === true) || sameBase[0];
  return null;
}

// ponytail: caching voices because getVoices() is often [] until 'voiceschanged' fires.
let cachedVoices = [];
let listenerAttached = false;

function refreshVoices(synth) {
  if (!synth) return [];
  cachedVoices = synth.getVoices?.() || [];
  if (!listenerAttached && 'addEventListener' in synth) {
    synth.addEventListener('voiceschanged', () => { cachedVoices = synth.getVoices?.() || []; });
    listenerAttached = true;
  }
  return cachedVoices;
}

// ponytail: Node (tests) has no SpeechSynthesisUtterance global; fall back to a
// plain holder so speak() stays testable against a fake synth without a browser.
const Utterance = globalThis.SpeechSynthesisUtterance || class { constructor(text) { this.text = text; } };

export function speak(text, code, synth = globalThis.speechSynthesis) {
  if (!synth || !text) return;
  try {
    synth.cancel();
    const utterance = new Utterance(text);
    utterance.lang = languageTag(code);
    const voices = refreshVoices(synth);
    // ponytail: if voices are still empty here, we speak anyway with the explicit
    // lang set — the platform picks its own default voice for that language.
    const voice = pickVoice(voices, utterance.lang);
    if (voice) utterance.voice = voice;
    synth.speak(utterance);
  } catch {
    // ponytail: a speech failure must never break the UI.
  }
}

export function cancelSpeech(synth = globalThis.speechSynthesis) {
  try {
    synth?.cancel();
  } catch {
    // ponytail: cancellation failure is not worth surfacing to the learner.
  }
}
