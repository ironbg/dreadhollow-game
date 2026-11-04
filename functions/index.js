/* Dreadhollow's server: the player's profile lives here (players/{uid}), and only these functions change it.
 *   sync      the device's settings and on-screen choices onto the profile; the first call brings an existing profile in
 *   act       one player action from js/meta/actions.js (the same list the game uses), run on the server's copy
 *   runStart  a fight begins: torches are paid and the server notes the time, the hall, the hero and the Agony
 *   runEnd    a fight ends: its summary is checked against that (runcheck.js) and only then rewarded
 *   purchase  a Google Play purchase: checked with Google (play.js), delivered once
 *   adReward  AdMob's confirmation that a rewarded ad was watched (ads.js); actions paid by an ad take one
 *   feedback  a player's message (Settings → Send feedback); adminCheck / adminStats  the developer's overview (insights.js)
 *   admin     the developer's panel (admin.js): players, rewards, bans, messages, purchases, live settings, its own log
 *   live      live.json as deployed with the panel's override on top (config/live): what newer game copies read
 * The Pit's weekly board pays its top 50 at the first sync of a new week (pitpay.js).
 * A banned account is turned away by every call that plays; under maintenance (live: maintenance.on) the game's
 * own calls wait, except settling a fight or a purchase already made.
 * Every write is a transaction on the player's document, so two devices can never double-spend. */
'use strict';
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');
const { boot, withProfile, freshProfile } = require('./engine');
const { checkRun } = require('./runcheck');
const play = require('./play');
const ads = require('./ads');
const insights = require('./insights');
const { makeAdmin } = require('./admin');
const { makePitPay } = require('./pitpay');

admin.initializeApp();
const db = admin.firestore();
setGlobalOptions({ region: 'europe-west1', maxInstances: 20, memory: '512MiB', timeoutSeconds: 30 });

/* ---------- live settings: the same live.json the game reads (kept a minute), the copy from the deploy if offline ---------- */
const LIVE_URL = 'https://dreadhollow-b49c7.web.app/live.json';
let live = null, liveAt = 0;
async function liveBaseConfig() {
  if (process.env.FUNCTIONS_EMULATOR === 'true') { // tests: live.json as the test sets it (test/live), else the deployed copy
    const t = await db.collection('test').doc('live').get();
    if (t.exists) return Object.assign({}, require('./game/live.json'), t.data());
  }
  if (live && Date.now() - liveAt < 60e3) return live;
  try { const r = await fetch(LIVE_URL, { cache: 'no-store' }); if (r.ok) { live = await r.json(); liveAt = Date.now(); return live; } } catch (e) { /* fall back */ }
  if (!live) { try { live = require('./game/live.json'); } catch (e) { live = {}; } liveAt = Date.now(); }
  return live;
}
/* The panel's override (config/live): its keys replace live.json's (kept 30 s; the panel's own change applies at once). */
let override = null, overrideAt = 0;
async function liveOverride(force) {
  if (!force && override && Date.now() - overrideAt < 30e3) return override;
  try { const o = await db.collection('config').doc('live').get(); override = o.exists && o.data().json ? JSON.parse(o.data().json) : {}; } catch (e) { override = override || {}; }
  overrideAt = Date.now();
  return override;
}
const withOverride = (base, o) => Object.assign({}, base, o || {});
async function liveConfig(force) { return withOverride(await liveBaseConfig(), await liveOverride(force)); }
/** live.json as this deploy carries it (functions/game/live.json, copied at build time). */
function liveBundled() { try { return require('./game/live.json'); } catch (e) { return {}; } }

/** A callable whose unexpected errors are logged and answered with their cause (a Firestore or Google error code and
 *  message), so a failure can be read from the game or tools/check-server.js without opening the Cloud logs. */
const callable = (fn) => onCall(async (req) => {
  try { return await fn(req); } catch (e) {
    if (e instanceof HttpsError) throw e;
    console.error('unexpected', e);
    throw new HttpsError('internal', 'server: ' + String((e && e.code) || '') + ' ' + String((e && e.message) || e).slice(0, 300), { code: 'server' }); // 'server': the game keeps the call and tries again later
  }
});
const fail = (code, msg, status) => new HttpsError(status || 'failed-precondition', msg || code, { code });
/** Guests (anonymous accounts) play but stay off the leaderboards. */
const isGuest = (req) => !!(req.auth && req.auth.token && req.auth.token.firebase && req.auth.token.firebase.sign_in_provider === 'anonymous');
const uidOf = (req) => { if (!req.auth || !req.auth.uid) throw fail('requires-login', 'sign in first', 'unauthenticated'); return req.auth.uid; };
const cmp = (a, b) => { const x = String(a || '0').split('.').map(Number), y = String(b || '0').split('.').map(Number); for (let i = 0; i < 4; i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
/** Too old a game build is turned away (its economy code would not match the server's). The store app (p: 'app') has
 *  its own minimum (live.json app.min): an app update takes days to reach every phone, the web version minutes. */
/** Maintenance (live: maintenance { on, msg }): the game's own calls wait; admins pass. msg: one text for every language. */
async function checkOpen(req, cfg) {
  const m = cfg && cfg.maintenance;
  if (!(m && m.on)) return;
  if (req.auth && await insights.isAdmin(db, req.auth.token)) return;
  const lang = (req.data && req.data.lang) === 'bg' ? 'bg' : 'en';
  const reason = typeof m.msg === 'string' ? m.msg : (m.msg && (m.msg[lang] || m.msg.en || m.msg.bg)) || ''; // one text for every language (or an older { bg, en })
  throw new HttpsError('unavailable', 'maintenance', { code: 'maintenance', reason: String(reason).slice(0, 400) });
}
function checkVersion(d, cfg) {
  const rules = (cfg && (d.p === 'app' ? cfg.app : cfg.web)) || {};
  if (rules.min && cmp(d.v, rules.min) < 0) throw fail('outdated', 'update the game');
}

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
async function onProfile(uid, fn, opts) {
  const ref = db.collection('players').doc(uid);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const doc = snap.exists ? snap.data() : null;
    if (doc && doc.ban && !(opts && opts.admin)) throw new HttpsError('permission-denied', 'banned', { code: 'banned', reason: doc.ban.reason || '' }); // a banned account plays no more
    const out = await fn(doc ? JSON.parse(doc.save) : null, doc, tx);
    if (out.write !== false) {
      const rev = (doc ? doc.rev : 0) + 1;
      tx.set(ref, Object.assign({ save: JSON.stringify(out.profile), rev, v: out.profile.v, name: String(out.profile.playerName || '').slice(0, 40), updated: FieldValue.serverTimestamp() },
        doc ? {} : { created: FieldValue.serverTimestamp() }, out.extra || {}), { merge: true });
      out.rev = rev;
    } else out.rev = doc ? doc.rev : 0;
    return out;
  });
}

let pitPayer = null;
const pitPay = () => pitPayer || (pitPayer = makePitPay({ db, FieldValue, onProfile, withProfile, boot }));

/** Too many calls in a minute (a script, not a player): refused. */
function rate(doc) {
  const now = Date.now(), r = (doc && doc.rate) || { t: now, n: 0 };
  if (now - r.t > 60e3) { r.t = now; r.n = 0; }
  r.n++;
  if (r.n > 150) throw fail('too-many', 'slow down', 'resource-exhausted');
  return r;
}

/* ---------- sync ---------- */
exports.sync = callable(async (req) => {
  const uid = uidOf(req), d = req.data || {}, cfg = await liveConfig();
  checkVersion(d, cfg); await checkOpen(req, cfg);
  try { await pitPay().payIfDue(cfg); } catch (e) { console.error('pit payout', e); } // a new week: last week's Pit board is paid (once)
  const out = await onProfile(uid, async (profile, doc) => {
    let from = profile, extra = {};
    if (!profile) { // first visit: the old cloud save if there is one, else what this device holds
      const old = await db.collection('saves').doc(uid).get();
      from = bringIn(old.exists && old.data().data ? JSON.parse(old.data().data) : d.local || null);
      extra.broughtIn = old.exists ? 'cloud' : d.local ? 'device' : 'fresh';
    }
    const r = await withProfile(from || freshProfile(cfg), cfg, (DH) => { DH.actions.overlayFree(DH.save.data, d.free); DH.meta.ensureDaily(); DH.meta.ensureSeason(); DH.meta.takeGifts(cfg.gifts); DH.meta.checkDeeds(null); }); // and the Deeds already earned (a wave or a Mastery level reached before the Deed existed) // gifts to everyone (the panel) come with a sync
    return { profile: r.profile, extra: Object.assign(extra, { rate: rate(doc) }) };
  });
  await insights.note(db, uid, d, null); // played today
  if (!isGuest(req)) { try { await sendBoards(uid, out.profile, cfg); } catch (e) { console.error('boards on sync', e); } } // a score left unsent (a call that failed) goes up with the next visit
  return { save: out.profile, rev: out.rev };
});

/* ---------- act ---------- */
/** The actions that can change what a leaderboard shows: a Pit fight's end (its wave) and a new name (sent again). */
const BOARD_ACTS = new Set(['pitEnd', 'rename']);
exports.act = callable(async (req) => {
  const uid = uidOf(req), d = req.data || {}, cfg = await liveConfig();
  checkVersion(d, cfg);
  await checkOpen(req, cfg);
  const name = String(d.name || '');
  const def = boot(cfg).actions.list[name];
  if (!def) throw fail('unknown-action', name);
  // an action paid by a rewarded ad: with verification on, AdMob must have confirmed one (ads.js)
  let needAd = false;
  if (def.ad && cfg.ads && cfg.ads.verify) {
    const snap = await db.collection('players').doc(uid).get();
    if (snap.exists) {
      const r = await withProfile(JSON.parse(snap.data().save), cfg, (DH) => {
        DH.actions.overlayFree(DH.save.data, d.free);
        return !DH.meta.noAds() && !!def.ad(d.args || {}); // No Ads (bought, or the season's premium pass): the reward comes without an ad
      });
      needAd = !!r.result;
    }
    if (needAd && !(await ads.waitTicket(db, uid))) throw fail('ad-not-verified');
  }
  const out = await onProfile(uid, async (profile, doc, tx) => {
    if (!profile) throw fail('no-profile', 'sync first');
    if (needAd) {
      const ticket = await ads.takeTicket(tx, db, uid);
      if (!ticket) throw fail('ad-not-verified');
      tx.update(ticket, { used: true, usedFor: name });
    }
    const r = await withProfile(profile, cfg, async (DH) => {
      DH.actions.overlayFree(DH.save.data, d.free);
      return DH.actions.list[name].run(d.args || {});
    });
    return { profile: r.profile, result: r.result, extra: { rate: rate(doc) } };
  });
  if (!isGuest(req) && BOARD_ACTS.has(name)) await sendBoards(uid, out.profile, cfg); // only what can put a score on a board (a star or a card never does)
  return { save: out.profile, rev: out.rev, result: out.result };
});

/* ---------- a fight ---------- */
exports.runStart = callable(async (req) => {
  const uid = uidOf(req), d = req.data || {}, cfg = await liveConfig();
  checkVersion(d, cfg); await checkOpen(req, cfg);
  const out = await onProfile(uid, async (profile, doc) => {
    if (!profile) throw fail('no-profile', 'sync first');
    let ticket = null;
    const r = await withProfile(profile, cfg, (DH) => {
      const C = DH.content, s = DH.save.data;
      DH.actions.overlayFree(s, d.free);
      const stage = s.selectedStage, hero = s.selectedHero, i = C.stageOrder.indexOf(stage);
      if (!(i === 0 || s.cleared[C.stageOrder[i - 1]])) throw fail('stage-locked', stage);
      if (!DH.meta.heroOwned(hero)) throw fail('hero-locked', hero);
      if (!DH.meta.beginRun(C.stages[stage].energy || C.RUN_ENERGY)) return; // not enough torches (or tributes for the Reliquary): no ticket
      ticket = { id: crypto.randomBytes(12).toString('hex'), stage, hero, start: Date.now(),
        agony: !!(s.cleared[stage] && s.agony[stage]), dread: DH.meta.dreadRank(), tributes: (s.runTributes || []).slice() };
    });
    return { profile: r.profile, extra: { run: ticket, rate: rate(doc) }, ticket };
  });
  return { save: out.profile, rev: out.rev, ticket: out.ticket ? out.ticket.id : null };
});

exports.runEnd = callable(async (req) => {
  const uid = uidOf(req), d = req.data || {}, cfg = await liveConfig();
  checkVersion(d, cfg);
  const out = await onProfile(uid, async (profile, doc) => {
    if (!profile) throw fail('no-profile', 'sync first');
    const run = doc.run;
    if (!run || !d.ticket || run.id !== d.ticket) throw fail('no-run', 'no fight to end');
    const DHc = boot(cfg), why = checkRun(d.summary, run, Date.now(), DHc);
    if (why) { // not rewarded; the fight is closed and noted
      const flags = Object.assign({ invalidRuns: 0 }, doc.flags); flags.invalidRuns++; flags.last = why; flags.lastAt = Date.now();
      flags.log = (Array.isArray(flags.log) ? flags.log : []).concat({ why, stage: run.stage, hero: run.hero, at: Date.now(), v: String(d.v || '').slice(0, 16) }).slice(-8); // shown in the developer's overview
      return { profile, extra: { run: null, flags }, invalid: why };
    }
    const r = await withProfile(profile, cfg, (DH) => DH.meta.settleRun(Object.assign({}, d.summary, { stage: run.stage, hero: run.hero })));
    return { profile: r.profile, result: r.result, extra: { run: null, rate: rate(doc) } };
  });
  if (out.invalid) throw fail('invalid-run', out.invalid);
  await insights.note(db, uid, d, d.summary || {}); // a fight played today
  if (!isGuest(req)) await sendBoards(uid, out.profile, cfg);
  return { save: out.profile, rev: out.rev, result: out.result };
});

/* ---------- a Google Play purchase ---------- */
exports.purchase = callable(async (req) => {
  const uid = uidOf(req), d = req.data || {}, cfg = await liveConfig();
  checkVersion(d, cfg);
  const productId = String(d.productId || ''), token = String(d.token || '');
  if (!boot(cfg).economy.products[productId] || !token || token.length > 2000) throw fail('bad-purchase');
  let g;
  try { g = await play.verify(productId, token); } catch (e) { throw fail(e.code || 'store-unreachable', 'try later', 'unavailable'); }
  if (!g) throw fail('bad-purchase');
  if (g.purchaseState === 2) throw fail('pending');
  if (g.purchaseState !== 0) throw fail('bad-purchase'); // cancelled or refunded
  if (g.obfuscatedExternalAccountId && g.obfuscatedExternalAccountId !== play.accountHash(uid)) throw fail('other-account');
  const ref = db.collection('purchases').doc(play.tokenId(token));
  const out = await onProfile(uid, async (profile, doc, tx) => {
    if (!profile) throw fail('no-profile', 'sync first');
    const seen = await tx.get(ref);
    if (seen.exists) { // delivered before (a retry, a restore): nothing more
      if (seen.data().uid !== uid) throw fail('other-account');
      return { write: false, profile, result: [] };
    }
    if (g.consumptionState === 1) throw fail('bad-purchase'); // used up without ever reaching the game
    const r = await withProfile(profile, cfg, (DH) => DH.meta.fulfillProduct(productId, true));
    tx.set(ref, { uid, productId, orderId: g.orderId || null, test: g.purchaseType === 0, at: FieldValue.serverTimestamp() });
    return { profile: r.profile, result: r.result, extra: { rate: rate(doc) } };
  });
  if (g.acknowledgementState === 0) await play.acknowledge(productId, token).catch((e) => console.warn('acknowledge', e.message));
  return { save: out.profile, rev: out.rev, result: out.result || [] };
});

/* ---------- AdMob's confirmation of a watched rewarded ad (a plain web address, called by Google) ---------- */
exports.adReward = onRequest(async (req, res) => {
  const q = (req.originalUrl || '').split('?')[1] || '';
  try { const r = await ads.onCallback(db, q); res.status(r.status).send(r.body); } catch (e) { console.error('adReward', e); res.status(500).send('error'); }
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
exports.reset = callable(async (req) => {
  const uid = uidOf(req), cfg = await liveConfig();
  const out = await onProfile(uid, async (profile, doc) => {
    const fresh = freshProfile(cfg), keep = (profile && profile.purchases) || null;
    if (keep) { fresh.purchases = keep; if (keep.once && keep.once.reaper) fresh.heroes.reaper = true; }
    return { profile: fresh, extra: { run: null, rate: rate(doc) } };
  });
  return { save: out.profile, rev: out.rev };
});

/* ---------- the player deletes their account: everything the server holds for it goes too ---------- */
async function wipeAccount(uid) {
  const doc = await db.collection('players').doc(uid).get();
  const keys = doc.exists ? Object.keys((JSON.parse(doc.data().save).boards || {}).best || {}) : [];
  const batch = db.batch();
  keys.forEach((k) => batch.delete(db.collection('boards').doc(k).collection('scores').doc(uid)));
  batch.delete(db.collection('players').doc(uid));
  batch.delete(db.collection('saves').doc(uid));
  await batch.commit();
  await insights.forget(db, uid);
}
exports.wipe = callable(async (req) => {
  await wipeAccount(uidOf(req));
  return { ok: true };
});

/* ---------- a player's message to the developer (Settings → Send feedback) ---------- */
exports.feedback = callable(async (req) => {
  const uid = uidOf(req), r = await insights.feedback(db, uid, req.auth.token, req.data || {});
  if (r.error) throw fail(r.error, r.error, r.error === 'too-many' ? 'resource-exhausted' : 'invalid-argument');
  return r;
});

/* ---------- the developer's overview (Settings → Overview): only for emails listed in admin/access ---------- */
exports.adminCheck = callable(async (req) => ({ admin: !!(req.auth && await insights.isAdmin(db, req.auth.token)) }));
exports.adminStats = callable(async (req) => {
  uidOf(req);
  if (!(await insights.isAdmin(db, req.auth.token))) throw fail('not-admin', 'not an admin', 'permission-denied');
  return insights.stats(db, admin.auth(), (req.data || {}).days);
});

/* ---------- the developer's panel (admin.js): every op for admins only, each change logged ---------- */
const adminOps = makeAdmin({ db, auth: admin.auth(), FieldValue, boot, withProfile, freshProfile,
  onProfile: (uid, fn) => onProfile(uid, fn, { admin: true }), liveConfig, liveBase: liveBundled,
  setOverride: (o) => { override = o; overrideAt = Date.now(); }, insights, wipeAccount });
exports.admin = callable(async (req) => {
  uidOf(req);
  if (!(await insights.isAdmin(db, req.auth.token))) throw fail('not-admin', 'not an admin', 'permission-denied');
  try { return await adminOps(req.data || {}, String(req.auth.token.email || '').toLowerCase()); } catch (e) {
    if (e && e.adminCode) throw fail(e.adminCode, e.adminCode, 'invalid-argument');
    throw e;
  }
});

/* ---------- live.json with the panel's override, for newer copies of the game (they fall back to the plain file) ---------- */
exports.live = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*'); res.set('Access-Control-Expose-Headers', 'Date'); res.set('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  try { res.status(200).json(withOverride(liveBundled(), await liveOverride())); } catch (e) { console.error('live', e); res.status(500).send('error'); }
});

// for tests
exports._internal = { checkRun, bringIn, cmp };
