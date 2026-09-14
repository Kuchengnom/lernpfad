// Use only an explicitly identified local device voice. An OS default can use
// a network service, so an empty/remote voice list must not trigger synthesis.
export const LANG_TAGS = { de: 'de-DE', en: 'en-GB', fr: 'fr-FR' };
export const languageTag = code => LANG_TAGS[code] || LANG_TAGS.de;
const normalize = lang => String(lang || '').replace(/_/g, '-').toLowerCase();
const baseLang = lang => normalize(lang).split('-')[0];

export function pickVoice(voices, tag) {
  const local = (voices || []).filter(voice => voice.localService === true);
  return local.find(voice => normalize(voice.lang) === normalize(tag))
    || local.find(voice => baseLang(voice.lang) === baseLang(tag)) || null;
}

export function speak(text, code, synth = globalThis.speechSynthesis) {
  if (!synth || !String(text || '').trim()) return { spoken: false, reason: 'unavailable' };
  try {
    synth.cancel();
    const tag = languageTag(code);
    // Read on every tap: initially empty voice lists may have loaded since the
    // last attempt. No delayed callback may start speech after leaving a task.
    const voice = pickVoice(synth.getVoices?.(), tag);
    if (!voice) return { spoken: false, reason: 'no-local-voice' };
    const Utterance = globalThis.SpeechSynthesisUtterance || class { constructor(value) { this.text = value; } };
    const utterance = new Utterance(text);
    utterance.lang = tag;
    utterance.voice = voice;
    synth.speak(utterance);
    return { spoken: true };
  } catch { return { spoken: false, reason: 'unavailable' }; }
}

export function cancelSpeech(synth = globalThis.speechSynthesis) {
  try { synth?.cancel(); } catch { /* Device failures must not stop learning. */ }
}
