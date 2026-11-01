// The developer's panel (admin.js) against a small in-memory Firestore: node functions/test/admin.js
'use strict';
const assert = require('assert');
const { boot, withProfile, freshProfile } = require('../engine');
const { makeAdmin, cleanReward } = require('../admin');
const live = require('../game/live.json');

/* ---------- a tiny Firestore: enough of the API for admin.js ---------- */
const DEL = { del: true }, TS = () => { const t = Date.now(); return { toMillis: () => t }; };
const FieldValue = { delete: () => DEL, serverTimestamp: () => TS() };
const val = (v) => (v && typeof v.toMillis === 'function' ? v.toMillis() : v instanceof Date ? v.getTime() : v);
function makeDb() {
  const data = new Map(); let auto = 0;
  const snap = (path, id) => ({ id, exists: data.has(path), data: () => (data.has(path) ? Object.assign({}, data.get(path)) : undefined), ref: docRef(path) });
  function docRef(path) {
    const id = path.split('/').pop();
    return {
      id, path,
      get: async () => snap(path, id),
      set: async (o, opt) => { const cur = opt && opt.merge && data.has(path) ? Object.assign({}, data.get(path)) : {}; for (const k in o) { if (o[k] === DEL) delete cur[k]; else cur[k] = o[k]; } data.set(path, cur); },
      delete: async () => { data.delete(path); },
      collection: (n) => coll(path + '/' + n),
    };
  }
  function coll(path, q) {
    q = q || { where: [], order: null, lim: 1e9, start: null, end: null };
    const run = () => {
      let docs = [...data.keys()].filter((k) => k.startsWith(path + '/') && k.slice(path.length + 1).indexOf('/') < 0).map((k) => snap(k, k.split('/').pop()));
      docs = docs.filter((d) => q.where.every(([f, op, v]) => { const x = val(d.data()[f]), y = val(v); return op === '==' ? x === y : op === '>=' ? x >= y : op === '<=' ? x <= y : true; }));
      if (q.order) {
        const key = (d) => (q.order.f === '__name__' ? d.id : val(d.data()[q.order.f]));
        docs.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0) * (q.order.dir === 'desc' ? -1 : 1));
        if (q.start != null) docs = docs.filter((d) => key(d) >= q.start);
        if (q.end != null) docs = docs.filter((d) => key(d) <= q.end);
      }
      return { docs: docs.slice(0, q.lim) };
    };
    const next = (ch) => coll(path, Object.assign({}, q, ch));
    return {
      doc: (id) => docRef(path + '/' + id),
      add: async (o) => { const id = 'a' + (++auto); await docRef(path + '/' + id).set(o); return docRef(path + '/' + id); },
      where: (f, op, v) => next({ where: q.where.concat([[f, op, v]]) }),
      orderBy: (f, dir) => next({ order: { f, dir } }),
      limit: (n) => next({ lim: n }), startAt: (v) => next({ start: v }), endAt: (v) => next({ end: v }),
      get: async () => run(),
    };
  }
  return {
    data,
    collection: (n) => coll(n),
    getAll: async (...refs) => Promise.all(refs.filter((r) => r && r.get).map((r) => r.get())),
    batch: () => { const ops = []; return { delete: (r) => ops.push(() => r.delete()), set: (r, o, opt) => ops.push(() => r.set(o, opt)), commit: async () => { for (const f of ops) await f(); } }; },
    runTransaction: async (fn) => fn({ get: (r) => r.get(), set: (r, o, opt) => r.set(o, opt) }),
  };
}

(async () => {
  const db = makeDb(), auth = {
    getUser: async (uid) => { if (uid !== 'u1') throw new Error('none'); return { uid, email: 'p@x.y', providerData: [{ providerId: 'google.com' }], metadata: { creationTime: 'x', lastSignInTime: 'y' } }; },
    getUserByEmail: async (e) => { if (e !== 'p@x.y') throw new Error('none'); return { uid: 'u1', email: e }; },
    getUsers: async () => ({ users: [] }), deleteUser: async () => {},
  };
  // the same transaction the server runs (index.js onProfile), without the ban gate (the panel passes it)
  const onProfile = async (uid, fn) => {
    const ref = db.collection('players').doc(uid), snap = await ref.get(), doc = snap.exists ? snap.data() : null;
    const out = await fn(doc ? JSON.parse(doc.save) : null, doc);
    if (out.write !== false) await ref.set(Object.assign({ save: JSON.stringify(out.profile), rev: (doc ? doc.rev : 0) + 1, name: out.profile.playerName || '' }, out.extra || {}), { merge: true });
    return out;
  };
  let ovr = {};
  const insights = { stats: async () => ({ days: [], players: [], feedback: [] }), dropAdminCache: () => {} }; // insights.js needs firebase-admin
  const run = makeAdmin({ db, auth, FieldValue, boot, withProfile, freshProfile, onProfile,
    liveConfig: async () => Object.assign({}, live, ovr), liveBase: () => live, setOverride: (o) => { ovr = o; }, insights,
    wipeAccount: async (uid) => { await db.collection('players').doc(uid).delete(); } });
  const who = 'admin@x.y';

  // a player
  const p = Object.assign(freshProfile(live), { playerName: 'Ivan', gold: 100, gems: 5 });
  await db.collection('players').doc('u1').set({ save: JSON.stringify(p), rev: 1, name: 'Ivan', created: TS() });
  await db.collection('purchases').doc('t1').set({ uid: 'u1', productId: 'gems_1', at: TS() });
  await db.collection('feedback').doc('f1').set({ uid: 'u1', text: 'no reward', kind: 'bug', at: Date.now() });
  await db.collection('admin').doc('access').set({ emails: [who] });

  const dash = await run({ op: 'dash', days: 7 }, who); assert.strictEqual(dash.buys, 1); assert.strictEqual(dash.byProduct.gems_1, 1);
  // search: by name, email, id
  assert.deepStrictEqual((await run({ op: 'players', q: 'Iv' }, who)).list.map((x) => x.uid), ['u1'], 'name prefix');
  assert.deepStrictEqual((await run({ op: 'players', q: 'p@x.y' }, who)).list.map((x) => x.uid), ['u1'], 'email');
  assert.deepStrictEqual((await run({ op: 'players', q: 'u1' }, who)).list.map((x) => x.uid), ['u1'], 'account id');
  // one player
  let pl = await run({ op: 'player', uid: 'u1', raw: true }, who);
  assert.strictEqual(pl.summary.name, 'Ivan'); assert.strictEqual(pl.summary.gold, 100); assert.strictEqual(pl.account.email, 'p@x.y');
  assert.strictEqual(pl.purchases.length, 1); assert.strictEqual(pl.feedback.length, 1); assert.ok(pl.raw.length > 100);
  // a gift with a message: given, and waiting in the inbox
  await run({ op: 'grant', uid: 'u1', reward: { gold: 500, gems: 20, mats: { iron: 3, nope: 9 }, gear: { rarity: 9 }, hero: 'nobody' }, msg: 'Sorry for the lost reward' }, who);
  pl = await run({ op: 'player', uid: 'u1' }, who);
  assert.strictEqual(pl.summary.gold, 600); assert.strictEqual(pl.summary.gems, 25); assert.strictEqual(pl.summary.mats.iron, 13);
  assert.strictEqual(pl.summary.gear, 1, 'one relic'); assert.strictEqual(pl.summary.gearByRarity[5], 1, 'rarity clamped to Mythic');
  assert.strictEqual(pl.inbox.length, 1); assert.strictEqual(pl.inbox[0].msg, 'Sorry for the lost reward');
  await assert.rejects(run({ op: 'grant', uid: 'u1', reward: { gold: -5 } }, who), /empty-reward/);
  // set values, a message, ban / unban, flags, a stuck fight
  await run({ op: 'setv', uid: 'u1', gold: 7, gems: '', accountLevel: 9 }, who);
  pl = await run({ op: 'player', uid: 'u1' }, who); assert.strictEqual(pl.summary.gold, 7); assert.strictEqual(pl.summary.gems, 25); assert.strictEqual(pl.summary.level, 9);
  await run({ op: 'message', uid: 'u1', msg: 'Hello' }, who);
  await run({ op: 'ban', uid: 'u1', reason: 'cheating' }, who);
  pl = await run({ op: 'player', uid: 'u1' }, who); assert.strictEqual(pl.ban.reason, 'cheating'); assert.strictEqual(pl.inbox.length, 2);
  await run({ op: 'unban', uid: 'u1' }, who);
  pl = await run({ op: 'player', uid: 'u1' }, who); assert.strictEqual(pl.ban, null);
  await db.collection('players').doc('u1').set({ flags: { invalidRuns: 2, last: 'well' }, run: { stage: 'crypt' } }, { merge: true });
  await run({ op: 'flags', uid: 'u1' }, who); await run({ op: 'endrun', uid: 'u1' }, who);
  pl = await run({ op: 'player', uid: 'u1' }, who); assert.strictEqual(pl.flags, null); assert.strictEqual(pl.run, null);
  // feedback handled
  await run({ op: 'fbset', id: 'f1', status: 'done' }, who);
  assert.strictEqual((await run({ op: 'feedback', status: 'done' }, who)).list.length, 1);
  assert.strictEqual((await run({ op: 'feedback', status: 'open' }, who)).list.length, 0);
  // purchases
  assert.strictEqual((await run({ op: 'purchases' }, who)).totals.gems_1.n, 1);
  // live: an override, bad JSON refused
  await run({ op: 'liveset', override: { maintenance: { on: true, msg: { bg: 'Профилактика', en: 'Maintenance' } } } }, who);
  assert.strictEqual(ovr.maintenance.on, true);
  assert.strictEqual((await run({ op: 'live' }, who)).override.maintenance.on, true);
  await assert.rejects(run({ op: 'liveset', override: '{bad' }, who), /bad-json/);
  await assert.rejects(run({ op: 'liveset', override: [1] }, who), /bad-json/);
  // admins: never without yourself
  await assert.rejects(run({ op: 'adminset', emails: ['other@x.y'] }, who), /keep-self/);
  await run({ op: 'adminset', emails: [who, 'Other@X.y', 'not an email'] }, who);
  assert.deepStrictEqual((await run({ op: 'admins' }, who)).emails, [who, 'other@x.y']);
  // reset keeps the name and the purchases; wipe needs the id typed again
  await run({ op: 'reset', uid: 'u1' }, who);
  pl = await run({ op: 'player', uid: 'u1' }, who); assert.strictEqual(pl.summary.gold, 800); assert.strictEqual(pl.summary.name, 'Ivan');
  await assert.rejects(run({ op: 'wipe', uid: 'u1', confirm: 'x' }, who), /confirm/);
  await run({ op: 'wipe', uid: 'u1', confirm: 'u1' }, who);
  await assert.rejects(run({ op: 'player', uid: 'u1' }, who), /no-player/);
  // the log holds every change
  const ops = (await run({ op: 'log' }, who)).list.map((x) => x.op);
  ['grant', 'setv', 'message', 'ban', 'unban', 'flags', 'endrun', 'fbset', 'liveset', 'adminset', 'reset', 'wipe'].forEach((o) => assert.ok(ops.includes(o), 'logged: ' + o));
  await assert.rejects(run({ op: 'nope' }, who), /unknown-op/);

  // gifts to everyone: given once while open, with a message in the inbox
  const gifts = [{ id: 'sorry1', reward: { gems: 50 }, msg: { bg: 'Извинете', en: 'Sorry' } }, { id: 'later', start: '2999-01-01T00:00:00Z', reward: { gems: 1 } }];
  let r = await withProfile(freshProfile(live), live, (DH) => { DH.meta.takeGifts(gifts); DH.meta.takeGifts(gifts); });
  assert.strictEqual(r.profile.gems, 110, 'given once'); assert.strictEqual(r.profile.inbox.length, 1); assert.strictEqual(r.profile.inbox[0].msg.en, 'Sorry');
  r = await withProfile(r.profile, live, (DH) => DH.actions.list.inboxRead.run({ id: r.profile.inbox[0].id }));
  assert.strictEqual(r.profile.inbox.length, 0, 'read and gone');
  assert.deepStrictEqual(cleanReward({ gold: 1.9, chest: 'gold', herbs: { moss: 2 } }, boot(live)), { gold: 1, herbs: { moss: 2 }, chest: 'gold' });
  console.log('admin tests: all passed');
})().catch((e) => { console.error(e); process.exit(1); });
