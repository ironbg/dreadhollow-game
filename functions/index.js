/* Dreadhollow's server: the player's profile lives here (players/{uid}), and only these functions change it.
 *   sync      the device's settings and on-screen choices onto the profile; the first call brings an existing profile in
 *   act       one player action from js/meta/actions.js (the same list the game uses), run on the server's copy
 *   runStart  a fight begins: torches are paid and the server notes the time, the hall, the hero and the Agony
 *   runEnd    a fight ends: its summary is checked against that (runcheck.js) and only then rewarded
 * Every write is a transaction on the player's document, so two devices can never double-spend. */
'use strict';
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');
const { boot, withProfile, freshProfile } = require('./engine');
const { checkRun } = require('./runcheck');

admin.initializeApp();
const db = admin.firestore();
setGlobalOptions({ region: 'europe-west1', maxInstances: 20, memory: '512MiB', timeoutSeconds: 30 });

/* ---------- live settings: the same live.json the game reads (kept a minute), the copy from the deploy if offline ---------- */
const LIVE_URL = 'https://dreadhollow-b49c7.web.app/live.json';
let live = null, liveAt = 0;
async function liveConfig() {
  if (live && Date.now() - liveAt < 60e3) return live;
  try { const r = await fetch(LIVE_URL, { cache: 'no-store' }); if (r.ok) { live = await r.json(); liveAt = Date.now(); return live; } } catch (e) { /* fall back */ }
  if (!live) { try { live = require('./game/live.json'); } catch (e) { live = {}; } liveAt = Date.now(); }
  return live;
}

const fail = (code, msg, status) => new HttpsError(status || 'failed-precondition', msg || code, { code });
/** Guests (anonymous accounts) play but stay off the leaderboards. */
const isGuest = (req) => !!(req.auth && req.auth.token && req.auth.token.firebase && req.auth.token.firebase.sign_in_provider === 'anonymous');
const uidOf = (req) => { if (!req.auth || !req.auth.uid) throw fail('requires-login', 'sign in first', 'unauthenticated'); return req.auth.uid; };
const cmp = (a, b) => { const x = String(a || '0').split('.').map(Number), y = String(b || '0').split('.').map(Number); for (let i = 0; i < 4; i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
/** Too old a game build is turned away (its economy code would not match the server's). */
function checkVersion(v, cfg) { const min = cfg && cfg.web && cfg.web.min; if (min && cmp(v, min) < 0) throw fail('outdated', 'update the game'); }

/* ---------- the first time an account reaches the server: its profile so far, with sane ceilings ---------- */
const CAPS = { gold: 3e6, gems: 3e4, shards: 5000, energy: 300, accountLevel: 250 };
function bringIn(p) {
  const out = JSON.parse(JSON.stringify(p || {}));
  for (const k in CAPS) if (typeof out[k] === 'number') out[k] = Math.max(0, Math.min(CAPS[k], Math.floor(out[k]) || 0));
  if (Array.isArray(out.gear) && out.gear.length > 400) out.gear = out.gear.slice(0, 400);
  delete out.lastRun;
  return out;
}

/** Read the player's document, let fn change the profile, write it back (one transaction). */
async function onProfile(uid, fn) {
  const ref = db.collection('players').doc(uid);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const doc = snap.exists ? snap.data() : null;
    const out = await fn(doc ? JSON.parse(doc.save) : null, doc, tx);
    if (out.write !== false) {
      const rev = (doc ? doc.rev : 0) + 1;
      tx.set(ref, Object.assign({ save: JSON.stringify(out.profile), rev, v: out.profile.v, updated: FieldValue.serverTimestamp() },
        doc ? {} : { created: FieldValue.serverTimestamp() }, out.extra || {}), { merge: true });
      out.rev = rev;
    } else out.rev = doc ? doc.rev : 0;
    return out;
  });
}

/** Too many calls in a minute (a script, not a player): refused. */
function rate(doc) {
  const now = Date.now(), r = (doc && doc.rate) || { t: now, n: 0 };
  if (now - r.t > 60e3) { r.t = now; r.n = 0; }
  r.n++;
  if (r.n > 150) throw fail('too-many', 'slow down', 'resource-exhausted');
  return r;
}

/* ---------- sync ---------- */
exports.sync = onCall(async (req) => {
  const uid = uidOf(req), d = req.data || {}, cfg = await liveConfig();
  checkVersion(d.v, cfg);
  const out = await onProfile(uid, async (profile, doc) => {
    let from = profile, extra = {};
    if (!profile) { // first visit: the old cloud save if there is one, else what this device holds
      const old = await db.collection('saves').doc(uid).get();
      from = bringIn(old.exists && old.data().data ? JSON.parse(old.data().data) : d.local || null);
      extra.broughtIn = old.exists ? 'cloud' : d.local ? 'device' : 'fresh';
    }
    const r = await withProfile(from || freshProfile(cfg), cfg, (DH) => { DH.actions.overlayFree(DH.save.data, d.free); DH.meta.ensureDaily(); DH.meta.ensureSeason(); });
    return { profile: r.profile, extra: Object.assign(extra, { rate: rate(doc) }) };
  });
  return { save: out.profile, rev: out.rev };
});

/* ---------- act ---------- */
exports.act = onCall(async (req) => {
  const uid = uidOf(req), d = req.data || {}, cfg = await liveConfig();
  checkVersion(d.v, cfg);
  const name = String(d.name || '');
  if (!boot(cfg).actions.list[name]) throw fail('unknown-action', name);
  const out = await onProfile(uid, async (profile, doc) => {
    if (!profile) throw fail('no-profile', 'sync first');
    const r = await withProfile(profile, cfg, async (DH) => {
      DH.actions.overlayFree(DH.save.data, d.free);
      return DH.actions.list[name].run(d.args || {});
    });
    return { profile: r.profile, result: r.result, extra: { rate: rate(doc) } };
  });
  if (!isGuest(req)) await sendBoards(uid, out.profile, cfg);
  return { save: out.profile, rev: out.rev, result: out.result };
});

/* ---------- a fight ---------- */
exports.runStart = onCall(async (req) => {
  const uid = uidOf(req), d = req.data || {}, cfg = await liveConfig();
  checkVersion(d.v, cfg);
  const out = await onProfile(uid, async (profile, doc) => {
    if (!profile) throw fail('no-profile', 'sync first');
    let ticket = null;
    const r = await withProfile(profile, cfg, (DH) => {
      const C = DH.content, s = DH.save.data;
      DH.actions.overlayFree(s, d.free);
      const stage = s.selectedStage, hero = s.selectedHero, i = C.stageOrder.indexOf(stage);
      if (!(i === 0 || s.cleared[C.stageOrder[i - 1]])) throw fail('stage-locked', stage);
      if (!DH.meta.heroOwned(hero)) throw fail('hero-locked', hero);
      if (!DH.meta.useEnergy(C.stages[stage].energy || C.RUN_ENERGY)) return; // not enough torches: no ticket
      ticket = { id: crypto.randomBytes(12).toString('hex'), stage, hero, start: Date.now(),
        agony: !!(s.cleared[stage] && s.agony[stage]), dread: DH.meta.dreadRank() };
    });
    return { profile: r.profile, extra: { run: ticket, rate: rate(doc) }, ticket };
  });
  return { save: out.profile, rev: out.rev, ticket: out.ticket ? out.ticket.id : null };
});

exports.runEnd = onCall(async (req) => {
  const uid = uidOf(req), d = req.data || {}, cfg = await liveConfig();
  checkVersion(d.v, cfg);
  const out = await onProfile(uid, async (profile, doc) => {
    if (!profile) throw fail('no-profile', 'sync first');
    const run = doc.run;
    if (!run || !d.ticket || run.id !== d.ticket) throw fail('no-run', 'no fight to end');
    const DHc = boot(cfg), why = checkRun(d.summary, run, Date.now(), DHc);
    if (why) { // not rewarded; the fight is closed and noted
      const flags = Object.assign({ invalidRuns: 0 }, doc.flags); flags.invalidRuns++; flags.last = why; flags.lastAt = Date.now();
      return { profile, extra: { run: null, flags }, invalid: why };
    }
    const r = await withProfile(profile, cfg, (DH) => DH.meta.settleRun(Object.assign({}, d.summary, { stage: run.stage, hero: run.hero })));
    return { profile: r.profile, result: r.result, extra: { run: null, rate: rate(doc) } };
  });
  if (out.invalid) throw fail('invalid-run', out.invalid);
  if (!isGuest(req)) await sendBoards(uid, out.profile, cfg);
  return { save: out.profile, rev: out.rev, result: out.result };
});

/* ---------- leaderboards: only the server writes them, from profiles it settled itself ---------- */
async function sendBoards(uid, profile, cfg) {
  const r = await withProfile(profile, cfg, (DH) => DH.meta.boardPending());
  const list = r.result || [];
  if (!list.length) return;
  const batch = db.batch();
  list.forEach((b) => batch.set(db.collection('boards').doc(b.key).collection('scores').doc(uid),
    Object.assign({}, b.entry, { at: FieldValue.serverTimestamp() })));
  await batch.commit();
  // remember what went up, so it is not sent again
  await onProfile(uid, async (p) => {
    const w = await withProfile(p, cfg, (DH) => list.forEach((b) => DH.meta.boardSent(b.key, b.entry.score)));
    return { profile: w.profile };
  });
}

/* ---------- the player starts over (Settings → Reset progress): a fresh profile; bought things stay ---------- */
exports.reset = onCall(async (req) => {
  const uid = uidOf(req), cfg = await liveConfig();
  const out = await onProfile(uid, async (profile, doc) => {
    const fresh = freshProfile(cfg), keep = (profile && profile.purchases) || null;
    if (keep) { fresh.purchases = keep; if (keep.once && keep.once.reaper) fresh.heroes.reaper = true; }
    return { profile: fresh, extra: { run: null, rate: rate(doc) } };
  });
  return { save: out.profile, rev: out.rev };
});

/* ---------- the player deletes their account: everything the server holds for it goes too ---------- */
exports.wipe = onCall(async (req) => {
  const uid = uidOf(req);
  const doc = await db.collection('players').doc(uid).get();
  const keys = doc.exists ? Object.keys((JSON.parse(doc.data().save).boards || {}).best || {}) : [];
  const batch = db.batch();
  keys.forEach((k) => batch.delete(db.collection('boards').doc(k).collection('scores').doc(uid)));
  batch.delete(db.collection('players').doc(uid));
  batch.delete(db.collection('saves').doc(uid));
  await batch.commit();
  return { ok: true };
});

// for tests
exports._internal = { checkRun, bringIn, cmp };
