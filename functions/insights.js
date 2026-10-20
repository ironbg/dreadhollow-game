/* What the developer may see of the game's players (Settings → Overview, admins only), and what players send:
 *   activity/{YYYY-MM-DD}  one document a day (UTC): players.{uid} = { p, v, runs, secs, at } for whoever played
 *   feedback/{auto}        a message a player sent from Settings → Send feedback
 *   admin/access           { emails: [...] } kept by hand in the Firebase console: who may open the overview
 * No name, address or device is stored: an account id, the platform, the game version and how much was played.
 * The account's email is looked up (Firebase Auth) only when an admin opens the overview, and only for players who
 * signed in with Google or email. Deleting an account removes its entries too (wipe in index.js). */
'use strict';
const { FieldValue } = require('firebase-admin/firestore');

const dayKey = (t) => new Date(t).toISOString().slice(0, 10);
const FEEDBACK_KINDS = ['bug', 'idea', 'balance', 'other'];
const FEEDBACK_MAX = 1000, FEEDBACK_PER_DAY = 6, KEEP_DAYS = 60;

/** Note that a player was here today (a sync) or finished a fight (runEnd). Never fails the call it rides on. */
async function note(db, uid, d, fight) {
  try {
    const p = d && d.p === 'app' ? 'app' : 'web', v = String((d && d.v) || '').slice(0, 16);
    const entry = { p, v, at: Date.now() };
    if (fight) { entry.runs = FieldValue.increment(1); entry.secs = FieldValue.increment(Math.max(0, Math.min(3600, Math.round(+fight.time || 0)))); }
    await db.collection('activity').doc(dayKey(Date.now())).set({ players: { [uid]: entry } }, { merge: true });
  } catch (e) { console.warn('activity note', e.message); }
}

/** A player's message. Short, a few a day, with the version and platform so a report can be traced. */
async function feedback(db, uid, token, d) {
  const text = String((d && d.text) || '').trim().slice(0, FEEDBACK_MAX);
  if (text.length < 3) return { error: 'too-short' };
  const kind = FEEDBACK_KINDS.includes(d.kind) ? d.kind : 'other';
  const limRef = db.collection('feedbackRate').doc(uid), today = dayKey(Date.now());
  const allowed = await db.runTransaction(async (tx) => {
    const s = await tx.get(limRef), c = s.exists && s.data().day === today ? s.data().n : 0;
    if (c >= FEEDBACK_PER_DAY) return false;
    tx.set(limRef, { day: today, n: c + 1 });
    return true;
  });
  if (!allowed) return { error: 'too-many' };
  await db.collection('feedback').add({
    uid, text, kind, at: Date.now(),
    p: d.p === 'app' ? 'app' : 'web', v: String(d.v || '').slice(0, 16), lang: String(d.lang || '').slice(0, 5),
    hero: String(d.hero || '').slice(0, 24), level: Math.max(0, Math.min(999, Math.floor(+d.level || 0))),
    guest: !!(token && token.firebase && token.firebase.sign_in_provider === 'anonymous'),
  });
  return { ok: true };
}

/** Is this caller an admin? Their proven email is in admin/access (read at most once a minute).
 *  Proven = a verified email, OR a federated sign-in (Google/Apple) that owns the address — linking a
 *  provider to a guest account can leave email_verified false on the token though Google proved the address.
 *  An unverified email+password account claiming an admin's address is still turned away. */
let adminList = null, adminAt = 0;
async function isAdmin(db, token) {
  if (!token || !token.email) return false;
  const ids = token.firebase && token.firebase.identities;
  const federated = !!(ids && (ids['google.com'] || ids['apple.com']));
  if (token.email_verified !== true && !federated) return false;
  if (!adminList || Date.now() - adminAt > 60e3) {
    const s = await db.collection('admin').doc('access').get();
    adminList = ((s.exists && s.data().emails) || []).map((e) => String(e).trim().toLowerCase());
    adminAt = Date.now();
  }
  return adminList.includes(String(token.email).toLowerCase());
}

/** The overview: players a day, who played and how much, and the latest messages. */
async function stats(db, auth, days) {
  days = Math.max(1, Math.min(KEEP_DAYS, Math.floor(+days || 21)));
  const keys = []; for (let i = days - 1; i >= 0; i--) keys.push(dayKey(Date.now() - i * 864e5));
  const snaps = await db.getAll(...keys.map((k) => db.collection('activity').doc(k)));
  const perDay = [], players = {};
  snaps.forEach((s, i) => {
    const P = (s.exists && s.data().players) || {};
    const row = { day: keys[i], players: 0, app: 0, web: 0, runs: 0, secs: 0 };
    for (const uid in P) {
      const e = P[uid]; row.players++; row[e.p === 'app' ? 'app' : 'web']++; row.runs += e.runs || 0; row.secs += e.secs || 0;
      const o = players[uid] = players[uid] || { uid, days: 0, runs: 0, secs: 0, first: keys[i], last: keys[i], p: e.p, v: e.v };
      o.days++; o.runs += e.runs || 0; o.secs += e.secs || 0; o.last = keys[i]; o.p = e.p || o.p; o.v = e.v || o.v;
    }
    perDay.push(row);
  });
  const list = Object.values(players).sort((a, b) => (b.last > a.last ? 1 : b.last < a.last ? -1 : b.runs - a.runs)).slice(0, 300);
  // who they are, when they signed in with Google or email (guests stay an id)
  for (let i = 0; i < list.length; i += 100) {
    try {
      const r = await auth.getUsers(list.slice(i, i + 100).map((o) => ({ uid: o.uid })));
      r.users.forEach((u) => { const o = list.find((x) => x.uid === u.uid); if (o) o.email = u.email || null; });
    } catch (e) { console.warn('admin users', e.message); }
  }
  const fb = await db.collection('feedback').orderBy('at', 'desc').limit(100).get();
  const emails = Object.fromEntries(list.filter((o) => o.email).map((o) => [o.uid, o.email]));
  const messages = fb.docs.map((x) => { const m = x.data(); return { uid: m.uid, email: emails[m.uid] || null, text: m.text, kind: m.kind, at: m.at, p: m.p, v: m.v, hero: m.hero, level: m.level, guest: m.guest }; });
  return { days: perDay, players: list, feedback: messages, now: Date.now() };
}

/** An account is deleted: its days of activity and its messages go with it. */
async function forget(db, uid) {
  const batch = db.batch();
  const refs = []; for (let i = 0; i < KEEP_DAYS + 5; i++) refs.push(db.collection('activity').doc(dayKey(Date.now() - i * 864e5)));
  (await db.getAll(...refs)).forEach((s) => { if (s.exists && s.data().players && s.data().players[uid]) batch.update(s.ref, { ['players.' + uid]: FieldValue.delete() }); });
  const fb = await db.collection('feedback').where('uid', '==', uid).limit(400).get();
  fb.docs.forEach((x) => batch.delete(x.ref));
  batch.delete(db.collection('feedbackRate').doc(uid));
  await batch.commit();
}

module.exports = { note, feedback, isAdmin, stats, forget, dayKey, FEEDBACK_KINDS };
