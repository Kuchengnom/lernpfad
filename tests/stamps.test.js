import test from 'node:test';
import assert from 'node:assert/strict';
import { awardStamps, completedRounds } from '../app/stamps.js';

const now = '2026-09-14T12:00:00.000Z';
const book = (id, sessions) => ({ id, workspace: { learner: { completedSessionIds: sessions } } });
test('collection counts completed rounds per book, including shared session identities, and awards thresholds once', () => {
  const profile = { activeBookId: 'fr', books: [book('en', ['a', 'b']), book('fr', ['b', 'c'])], stampAwards: [] };
  const snapshot = structuredClone(profile);
  assert.equal(completedRounds(profile), 4);
  const awarded = awardStamps(profile, 'c', now);
  assert.deepEqual(awarded.stampAwards.map(a => a.stampId), ['fox', 'tent']);
  assert.ok(awarded.stampAwards.every(a => a.bookId === 'fr' && a.sessionId === 'c' && a.earnedAt === now));
  assert.equal(awardStamps(awarded, 'c', now), awarded);
  assert.deepEqual(profile, snapshot);
});

test('earned stamps survive replacing a learner with an earlier backup and appear only for completed rounds', () => {
  const empty = { activeBookId: 'en', books: [book('en', [])], stampAwards: [] };
  assert.equal(awardStamps(empty, 'unfinished', now), empty);
  const earned = awardStamps({ ...empty, books: [book('en', ['first'])] }, 'first', now);
  const olderBackup = { ...earned, books: [book('en', [])] };
  assert.equal(awardStamps(olderBackup, 'unfinished', now), olderBackup);
  assert.equal(olderBackup.stampAwards[0].stampId, 'fox');
});
