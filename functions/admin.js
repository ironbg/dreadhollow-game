/* The developer's panel on the server (Settings → Admin panel in the game). One callable, `admin`, with an `op`;
 * every op is for the emails listed in admin/access only, and every change is written to adminLog with who made it.
 *
 *   dash        players a day, new accounts, fights, minutes, purchases, refused fights, versions in use
 *   players     the latest players (activity), or a search: an account id, an email, or a name (its beginning)
 *   player      one player: profile summary, account, purchases, messages, refused fights, ban, the raw profile
 *   grant       give a player a reward (gold, gems, torches, materials, herbs, potions, pass XP, a hero, a relic,
 *               a chest) with a message they see in the game; setv: set gold / gems / torches / account level exactly
 *   ban/unban   a banned account cannot play (every call turns it away with the reason)
 *   flags       clear the refused-fights record; reset: progress starts over (purchases kept); wipe: delete it all
 *   unboard     take a player off the leaderboards
 *   feedback    the messages (filters), mark one handled or open, delete one
 *   purchases   the latest store purchases and the totals by product
 *   live        the live settings in effect: live.json as deployed, and the override kept in Firestore (config/live)
 *               that the panel edits (maintenance, minimum versions, news, gifts to everyone, any other key)
 *   admins      who may open the panel; log: the panel's own record
 * No password or key passes through here; emails are read from Firebase Auth only for the panel. */
'use strict';

const RARITIES = 6;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const int = (v) => (Number.isFinite(+v) ? Math.floor(+v) : 0);
const str = (v, n) => String(v == null ? '' : v).slice(0, n || 200);
const dayKey = (t) => new Date(t).toISOString().slice(0, 10);
const tsMs = (v) => (v && typeof v.toMillis === 'function' ? v.toMillis() : typeof v === 'number' ? v : null);

/** A reward as the panel may give it: only known keys and ids, whole positive numbers, sane ceilings. */
function cleanReward(rw, DH) {
  const E = DH.economy, C = DH.content, out = {};
  if (!rw || typeof rw !== 'object') return out;
  const n = (k, max) => { const v = int(rw[k]); if (v > 0) out[k] = Math.min(v, max); };
  n('gold', 1e8); n('gems', 1e6); n('energy', 10000); n('passXp', 1e6); n('accountXp', 1e7);
  const stock = (key, list) => { const o = {}; for (const k in rw[key] || {}) { const v = int(rw[key][k]); if (v > 0 && list.includes(k)) o[k] = Math.min(v, 1e6); } if (Object.keys(o).length) out[key] = o; };
  stock('mats', E.materials || []); stock('herbs', E.herbs || []); stock('potions', E.potionOrder || []);
  if (rw.hero && C.heroes[rw.hero]) out.hero = rw.hero;
  if (rw.gear && typeof rw.gear === 'object') { const g = { rarity: clamp(int(rw.gear.rarity), 0, RARITIES - 1) }; if (rw.gear.type && E.gear[rw.gear.type]) g.type = rw.gear.type; out.gear = g; }
  if (rw.chest && E.chests[rw.chest]) out.chest = rw.chest;
  return out;
}

/** The parts of a profile the panel shows. */
function summary(p, DH) {
  const E = DH.economy, C = DH.content, rar = [0, 0, 0, 0, 0, 0];
  (p.gear || []).forEach((g) => { rar[clamp(g.rarity | 0, 0, 5)]++; });
  return {
    name: p.playerName || '', level: p.accountLevel || 1, xp: p.accountXp || 0, gold: p.gold || 0, gems: p.gems || 0, energy: p.energy || 0,
    heroes: Object.keys(p.heroes || {}).filter((k) => p.heroes[k]), hero: p.selectedHero, stage: p.selectedStage,
    cleared: p.cleared || {}, best: p.bestTime || {}, gear: (p.gear || []).length, gearByRarity: rar,
    mats: p.mats || {}, herbs: p.herbs || {}, potions: p.potions || {}, shards: p.shards || 0,
    pass: { season: (p.pass || {}).season, xp: (p.pass || {}).xp || 0, premium: !!(p.pass || {}).premium, tier: Math.min(E.PASS_TIERS || 60, Math.floor(((p.pass || {}).xp || 0) / (E.PASS_XP_PER_TIER || 500))) },
    purchases: p.purchases || {}, stats: p.stats || {}, deeds: Object.keys(p.deeds || {}).length,
    artifacts: Object.keys(p.artifacts || {}).filter((k) => p.artifacts[k]), created: p.created || null, version: p.v,
    inbox: (p.inbox || []).length, stages: C.stageOrder,
  };
}

/**
 * ctx: { db, auth, FieldValue, boot, withProfile, freshProfile, onProfile, liveConfig, liveBase, setOverride, insights, wipeAccount }
 * Returns the callable's body: (req, adminEmail) => result.
 */
function makeAdmin(ctx) {
  const { db, auth, FieldValue, boot, withProfile, freshProfile, onProfile, liveConfig } = ctx;
  const log = (who, op, target, details) => db.collection('adminLog').add({ at: Date.now(), who, op, target: target || null, details: details || null })
    .catch((e) => console.warn('adminLog', e.message));
  const fail = (code) => { const e = new Error(code); e.adminCode = code; throw e; };
  const playerRef = (uid) => db.collection('players').doc(str(uid, 128));
  const needUid = (d) => { const u = str(d.uid, 128); if (!u) fail('no-uid'); return u; };

  const ops = {
    /* ---------- the dashboard ---------- */
    async dash(d) {
      const days = clamp(int(d.days) || 14, 1, 60);
      const st = await ctx.insights.stats(db, auth, days);
      const since = Date.now() - days * 864e5;
      // purchases in the period, and the latest refused fights
      const ps = await db.collection('purchases').orderBy('at', 'desc').limit(500).get().catch(() => ({ docs: [] }));
      const byDay = {}, byProduct = {}; let buys = 0, test = 0;
      ps.docs.forEach((x) => { const v = x.data(), at = tsMs(v.at); if (!at || at < since) return; buys++; if (v.test) test++; byDay[dayKey(at)] = (byDay[dayKey(at)] || 0) + 1; byProduct[v.productId] = (byProduct[v.productId] || 0) + 1; });
      const versions = {}; st.players.forEach((o) => { const k = (o.p === 'app' ? 'app ' : 'web ') + (o.v || '?'); versions[k] = (versions[k] || 0) + 1; });
      const newDocs = await db.collection('players').where('created', '>=', new Date(since)).get().catch(() => ({ docs: [] }));
      const fresh = {}; newDocs.docs.forEach((x) => { const at = tsMs(x.data().created); if (at) fresh[dayKey(at)] = (fresh[dayKey(at)] || 0) + 1; });
      const fbOpen = st.feedback.filter((f) => !f.status || f.status === 'open').length;
      const live = await liveConfig(true);
      return { days: st.days.map((r) => Object.assign({}, r, { buys: byDay[r.day] || 0, fresh: fresh[r.day] || 0 })), players: st.players.length, buys, test, byProduct, versions,
        refused: st.feedback.filter((f) => f.refused).length, fbOpen, maintenance: !!(live.maintenance && live.maintenance.on), now: Date.now() };
    },

    /* ---------- players ---------- */
    async players(d) {
      const q = str(d.q, 120).trim();
      if (!q) { const st = await ctx.insights.stats(db, auth, clamp(int(d.days) || 14, 1, 60)); return { list: st.players.slice(0, 200) }; }
      const out = new Map(), add = (uid, extra) => out.set(uid, Object.assign(out.get(uid) || { uid }, extra));
      if (q.includes('@')) { try { const u = await auth.getUserByEmail(q); add(u.uid, { email: u.email }); } catch (e) { /* none */ } }
      const byId = await playerRef(q).get().catch(() => null); if (byId && byId.exists) add(q, {});
      const names = await db.collection('players').where('name', '>=', q).where('name', '<=', q + '').limit(30).get().catch(() => ({ docs: [] }));
      names.docs.forEach((x) => add(x.id, { name: x.data().name }));
      if (!out.size && q.length >= 6) { // the beginning of an account id
        const pre = await db.collection('players').orderBy('__name__').startAt(q).endAt(q + '').limit(20).get().catch(() => ({ docs: [] }));
        pre.docs.forEach((x) => add(x.id, { name: x.data().name || '' }));
      }
      return { list: [...out.values()] };
    },
    async player(d) {
      const uid = needUid(d), snap = await playerRef(uid).get();
      if (!snap.exists) fail('no-player');
      const doc = snap.data(), p = JSON.parse(doc.save || '{}'), DH = boot(await liveConfig());
      let account = null;
      try { const u = await auth.getUser(uid); account = { email: u.email || null, providers: (u.providerData || []).map((x) => x.providerId), created: u.metadata.creationTime, lastSignIn: u.metadata.lastSignInTime, disabled: !!u.disabled, guest: !(u.providerData || []).length }; } catch (e) { account = null; }
      const pur = await db.collection('purchases').where('uid', '==', uid).limit(100).get().catch(() => ({ docs: [] }));
      const fb = await db.collection('feedback').where('uid', '==', uid).limit(50).get().catch(() => ({ docs: [] }));
      return {
        uid, summary: summary(p, DH), account, ban: doc.ban || null, flags: doc.flags || null, rev: doc.rev || 0, v: doc.v || null,
        updated: tsMs(doc.updated), created: tsMs(doc.created), run: doc.run ? { stage: doc.run.stage, hero: doc.run.hero, start: doc.run.start } : null,
        purchases: pur.docs.map((x) => Object.assign({ id: x.id }, x.data(), { at: tsMs(x.data().at) })).sort((a, b) => (b.at || 0) - (a.at || 0)),
        feedback: fb.docs.map((x) => Object.assign({ id: x.id }, x.data())).sort((a, b) => (b.at || 0) - (a.at || 0)),
        inbox: p.inbox || [], raw: d.raw ? doc.save : undefined,
      };
    },
    async grant(d, who) {
      const uid = needUid(d), cfg = await liveConfig(), rw = cleanReward(d.reward, boot(cfg));
      if (!Object.keys(rw).length) fail('empty-reward');
      const msg = str(d.msg, 400);
      const out = await onProfile(uid, async (profile) => {
        if (!profile) fail('no-player');
        const r = await withProfile(profile, cfg, (DH) => { const g = DH.meta.grant(rw); DH.meta.inboxAdd({ kind: 'gift', msg, reward: rw }); return g.length; });
        return { profile: r.profile, result: r.result };
      });
      await log(who, 'grant', uid, { reward: rw, msg });
      return { ok: true, items: out.result };
    },
    async setv(d, who) {
      const uid = needUid(d), set = {};
      for (const k of ['gold', 'gems', 'energy', 'accountLevel']) if (d[k] !== undefined && d[k] !== '' && d[k] !== null) set[k] = clamp(int(d[k]), k === 'accountLevel' ? 1 : 0, k === 'accountLevel' ? 500 : 1e9);
      if (!Object.keys(set).length) fail('nothing');
      await onProfile(uid, async (profile) => { if (!profile) fail('no-player'); Object.assign(profile, set); return { profile }; });
      await log(who, 'setv', uid, set);
      return { ok: true, set };
    },
    async message(d, who) { // a message alone, no reward
      const uid = needUid(d), msg = str(d.msg, 400), cfg = await liveConfig();
      if (!msg) fail('empty');
      await onProfile(uid, async (profile) => { if (!profile) fail('no-player'); const r = await withProfile(profile, cfg, (DH) => DH.meta.inboxAdd({ kind: 'note', msg })); return { profile: r.profile }; });
      await log(who, 'message', uid, { msg });
      return { ok: true };
    },
    async ban(d, who) {
      const uid = needUid(d), reason = str(d.reason, 300);
      await playerRef(uid).set({ ban: { reason, at: Date.now(), by: who } }, { merge: true });
      await log(who, 'ban', uid, { reason });
      return { ok: true };
    },
    async unban(d, who) {
      const uid = needUid(d);
      await playerRef(uid).set({ ban: FieldValue.delete() }, { merge: true });
      await log(who, 'unban', uid);
      return { ok: true };
    },
    async flags(d, who) {
      const uid = needUid(d);
      await playerRef(uid).set({ flags: FieldValue.delete() }, { merge: true });
      await log(who, 'flags', uid);
      return { ok: true };
    },
    async endrun(d, who) { // a fight stuck open on the server: closed, unrewarded
      const uid = needUid(d);
      await playerRef(uid).set({ run: null }, { merge: true });
      await log(who, 'endrun', uid);
      return { ok: true };
    },
    async reset(d, who) {
      const uid = needUid(d), cfg = await liveConfig();
      await onProfile(uid, async (profile) => {
        if (!profile) fail('no-player');
        const fresh = freshProfile(cfg), keep = profile.purchases || null;
        if (keep) { fresh.purchases = keep; if (keep.once && keep.once.reaper) fresh.heroes.reaper = true; }
        fresh.playerName = profile.playerName || ''; fresh.titleChosen = true; fresh.tutorialDone = !!profile.tutorialDone;
        return { profile: fresh, extra: { run: null } };
      });
      await log(who, 'reset', uid);
      return { ok: true };
    },
    async wipe(d, who) {
      const uid = needUid(d);
      if (str(d.confirm, 128) !== uid) fail('confirm');
      await ctx.wipeAccount(uid);
      if (d.auth) { try { await auth.deleteUser(uid); } catch (e) { /* no such sign-in */ } }
      await log(who, 'wipe', uid, { auth: !!d.auth });
      return { ok: true };
    },
    async unboard(d, who) {
      const uid = needUid(d), snap = await playerRef(uid).get();
      const keys = snap.exists ? Object.keys((JSON.parse(snap.data().save || '{}').boards || {}).best || {}) : [];
      const batch = db.batch(); keys.forEach((k) => batch.delete(db.collection('boards').doc(k).collection('scores').doc(uid))); await batch.commit();
      await log(who, 'unboard', uid, { boards: keys.length });
      return { ok: true, boards: keys.length };
    },

    /* ---------- messages from players ---------- */
    async feedback(d) {
      const snap = await db.collection('feedback').orderBy('at', 'desc').limit(clamp(int(d.limit) || 200, 1, 500)).get();
      let list = snap.docs.map((x) => Object.assign({ id: x.id }, x.data()));
      if (d.kind) list = list.filter((f) => f.kind === d.kind);
      if (d.status) list = list.filter((f) => (f.status || 'open') === d.status);
      if (d.q) { const q = String(d.q).toLowerCase(); list = list.filter((f) => String(f.text || '').toLowerCase().includes(q) || f.uid === d.q); }
      return { list };
    },
    async fbset(d, who) {
      const id = str(d.id, 64); if (!id) fail('no-id');
      const status = ['open', 'done', 'later'].includes(d.status) ? d.status : 'open';
      await db.collection('feedback').doc(id).set({ status, note: str(d.note, 300), by: who, statusAt: Date.now() }, { merge: true });
      await log(who, 'fbset', id, { status });
      return { ok: true };
    },
    async fbdel(d, who) {
      const id = str(d.id, 64); if (!id) fail('no-id');
      await db.collection('feedback').doc(id).delete();
      await log(who, 'fbdel', id);
      return { ok: true };
    },

    /* ---------- store ---------- */
    async purchases(d) {
      const snap = await db.collection('purchases').orderBy('at', 'desc').limit(clamp(int(d.limit) || 200, 1, 1000)).get();
      const list = snap.docs.map((x) => Object.assign({ id: x.id }, x.data(), { at: tsMs(x.data().at) }));
      const totals = {}; list.forEach((p) => { const t = totals[p.productId] = totals[p.productId] || { n: 0, test: 0 }; t.n++; if (p.test) t.test++; });
      return { list, totals };
    },

    /* ---------- live settings ---------- */
    async live() {
      const base = ctx.liveBase(), o = await db.collection('config').doc('live').get();
      const od = o.exists ? o.data() : {};
      return { base, override: od.json ? JSON.parse(od.json) : {}, by: od.by || null, at: od.at || null, effective: await liveConfig(true) };
    },
    async liveset(d, who) {
      let o = d.override;
      if (typeof o === 'string') { try { o = JSON.parse(o); } catch (e) { fail('bad-json'); } }
      if (!o || typeof o !== 'object' || Array.isArray(o)) fail('bad-json');
      const json = JSON.stringify(o);
      if (json.length > 200000) fail('too-big');
      await db.collection('config').doc('live').set({ json, by: who, at: Date.now() });
      ctx.setOverride(o);
      await log(who, 'liveset', null, { keys: Object.keys(o) });
      return { ok: true };
    },

    /* ---------- the panel itself ---------- */
    async admins() {
      const s = await db.collection('admin').doc('access').get();
      return { emails: (s.exists && s.data().emails) || [] };
    },
    async adminset(d, who) {
      const emails = (Array.isArray(d.emails) ? d.emails : []).map((e) => str(e, 120).trim().toLowerCase()).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
      if (!emails.includes(String(who).toLowerCase())) fail('keep-self'); // never lock yourself out
      await db.collection('admin').doc('access').set({ emails: [...new Set(emails)] }, { merge: true });
      ctx.insights.dropAdminCache && ctx.insights.dropAdminCache();
      await log(who, 'adminset', null, { n: emails.length });
      return { ok: true };
    },
    async log(d) {
      const snap = await db.collection('adminLog').orderBy('at', 'desc').limit(clamp(int(d.limit) || 200, 1, 500)).get();
      return { list: snap.docs.map((x) => Object.assign({ id: x.id }, x.data())) };
    },
  };

  return async (data, who) => {
    const op = str(data && data.op, 24), fn = ops[op];
    if (!fn) fail('unknown-op');
    return fn(data || {}, who);
  };
}

module.exports = { makeAdmin, cleanReward, summary };
