// The Pit's weekly payout (pitpay.js) against the in-memory Firestore: node functions/test/pitpay.js
'use strict';
const assert = require('assert');
const { boot, withProfile, freshProfile } = require('../engine');
const { makePitPay, weekKey } = require('../pitpay');
const live = require('../game/live.json');
const { makeDb, FieldValue } = require('./fakedb');

(async () => {
  const db = makeDb();
  const onProfile = async (uid, fn) => {
    const ref = db.collection('players').doc(uid), snap = await ref.get(), doc = snap.exists ? snap.data() : null;
    const out = await fn(doc ? JSON.parse(doc.save) : null, doc);
    if (out.write !== false) await ref.set({ save: JSON.stringify(out.profile), rev: (doc ? doc.rev : 0) + 1 }, { merge: true });
    return out;
  };
  const now = Date.UTC(2026, 10, 9, 8); // a Monday morning (week 46): last week is 2026-w45
  assert.strictEqual(weekKey(now - 7 * 86400000), '2026-w45');
  const key = 'pit__2026-w45';
  const scores = { a: 120, b: 95, c: 40, ghost: 30 }; // ghost: on the board, no profile any more
  for (const uid in scores) {
    await db.collection('boards').doc(key).collection('scores').doc(uid).set({ name: uid, score: scores[uid] });
    if (uid !== 'ghost') await db.collection('players').doc(uid).set({ save: JSON.stringify(Object.assign(freshProfile(live), { essence: 0, gems: 0 })), rev: 1 });
  }
  const pay = makePitPay({ db, FieldValue, onProfile, withProfile, boot });
  assert.strictEqual(await pay.payIfDue(live, now), 3, 'three profiles paid');
  const P = async (uid) => JSON.parse((await db.collection('players').doc(uid).get()).data().save);
  const a = await P('a'), b = await P('b'), c = await P('c');
  assert.deepStrictEqual([a.essence, a.gems], [3000, 500], 'first place');
  assert.deepStrictEqual([b.essence, b.gems], [2000, 300], 'second place');
  assert.deepStrictEqual([c.essence, c.gems], [1500, 200], 'third place');
  assert.ok(a.inbox.length === 1 && a.inbox[0].kind === 'gift' && a.inbox[0].msg.en.includes('Place 1'), 'a message comes with it');
  // once only: this server, and another one that never saw it
  assert.strictEqual(await pay.payIfDue(live, now), 0);
  const other = makePitPay({ db, FieldValue, onProfile, withProfile, boot });
  assert.strictEqual(await other.payIfDue(live, now), 0, 'another server does not pay again');
  assert.strictEqual((await P('a')).essence, 3000);
  console.log('pit payout tests: all passed');
})().catch((e) => { console.error(e); process.exit(1); });
