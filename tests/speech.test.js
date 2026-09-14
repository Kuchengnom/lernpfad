import test from 'node:test';
import assert from 'node:assert/strict';
import { pickVoice, speak, cancelSpeech, languageTag, LANG_TAGS } from '../app/speech.js';

const voice = (lang, localService, name = lang) => ({ lang, localService, name });

test('languageTag maps known codes and falls back to German', () => {
  assert.equal(languageTag('en'), LANG_TAGS.en);
  assert.equal(languageTag('fr'), LANG_TAGS.fr);
  assert.equal(languageTag('xx'), LANG_TAGS.de);
  assert.equal(languageTag(undefined), LANG_TAGS.de);
});

test('pickVoice prefers an exact lang match', () => {
  const voices = [voice('en-US', true), voice('en-GB', true), voice('fr-FR', true)];
  assert.equal(pickVoice(voices, 'en-GB').lang, 'en-GB');
});

test('pickVoice prefers a local-service voice among exact matches', () => {
  const voices = [voice('en-GB', false, 'remote'), voice('en-GB', true, 'local')];
  assert.equal(pickVoice(voices, 'en-GB').name, 'local');
});

test('pickVoice falls back to same base language when no exact match exists', () => {
  const voices = [voice('fr-CA', true), voice('de-DE', false)];
  assert.equal(pickVoice(voices, 'fr-FR').lang, 'fr-CA');
});

test('pickVoice prefers local-service among base-language fallbacks', () => {
  const voices = [voice('fr-CA', false, 'remote'), voice('fr-BE', true, 'local')];
  assert.equal(pickVoice(voices, 'fr-FR').name, 'local');
});

test('pickVoice never crosses languages and returns null when nothing matches', () => {
  const voices = [voice('de-DE', true), voice('es-ES', true)];
  assert.equal(pickVoice(voices, 'en-GB'), null);
  assert.equal(pickVoice([], 'en-GB'), null);
});

function fakeSynth(voices = []) {
  const calls = { cancel: 0, spoken: [] };
  return {
    calls,
    getVoices: () => voices,
    addEventListener: () => {},
    cancel: () => { calls.cancel += 1; },
    speak: utterance => calls.spoken.push(utterance),
  };
}

test('speak sets the explicit lang, assigns a matching voice, and cancels first', () => {
  const synth = fakeSynth([voice('fr-FR', true, 'local-fr')]);
  speak('Bonjour', 'fr', synth);
  assert.equal(synth.calls.cancel, 1);
  assert.equal(synth.calls.spoken.length, 1);
  const utterance = synth.calls.spoken[0];
  assert.equal(utterance.lang, 'fr-FR');
  assert.equal(utterance.voice.name, 'local-fr');
});

test('speech never silently falls back to remote or unspecified device voices', () => {
  for (const voices of [[], [voice('de-DE', true)], [voice('en-GB', false)]]) {
    const synth = fakeSynth(voices);
    assert.deepEqual(speak('Hello', 'en', synth), { spoken: false, reason: 'no-local-voice' });
    assert.equal(synth.calls.spoken.length, 0);
  }
});

test('a later tap uses newly available voices without queued speech', () => {
  const voices = [];
  const synth = fakeSynth(voices);
  speak('Bonjour', 'fr', synth);
  assert.equal(synth.calls.spoken.length, 0);
  voices.push(voice('fr-FR', true));
  assert.deepEqual(speak('Bonjour', 'fr', synth), { spoken: true });
  assert.equal(synth.calls.spoken.length, 1);
});

test('local same-language voice wins over an exact remote voice', () => {
  assert.equal(pickVoice([voice('fr-FR', false), voice('fr-BE', true)], 'fr-FR').lang, 'fr-BE');
});

test('speak is a no-op for blank text or a missing synth', () => {
  const synth = fakeSynth([voice('de-DE', true)]);
  speak('', 'de', synth);
  speak('   '.trim(), 'de', synth);
  assert.equal(synth.calls.spoken.length, 0);
  assert.doesNotThrow(() => speak('hallo', 'de', undefined));
});

test('cancelSpeech calls cancel and swallows errors', () => {
  const synth = fakeSynth();
  cancelSpeech(synth);
  assert.equal(synth.calls.cancel, 1);
  assert.doesNotThrow(() => cancelSpeech(undefined));
  assert.doesNotThrow(() => cancelSpeech({ cancel: () => { throw new Error('boom'); } }));
});
