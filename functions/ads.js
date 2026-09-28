/* Rewarded ads, confirmed by AdMob itself (server-side verification). When a player finishes a rewarded ad, AdMob
 * calls adReward (the URL set in AdMob → the ad unit → Server-side verification) with the player's account id and a
 * signature made with Google's key. Each confirmed ad becomes a ticket: players/{uid}/adTickets/{transaction}. An
 * action that pays for an ad takes one ticket when live.json "ads": { "verify": true }; with it off, the device's word
 * is taken (as before AdMob is set up). */
'use strict';
const crypto = require('crypto');

const KEYS_URL = 'https://www.gstatic.com/admob/reward/verifier-keys.json';
const TICKET_MS = 2 * 3600e3; // a ticket not used within two hours is no longer good
let keys = null, keysAt = 0;

async function verifierKeys(db) {
  if (process.env.FUNCTIONS_EMULATOR === 'true') { // tests: their own key, from the emulator's database
    const t = await db.collection('test').doc('adkeys').get();
    if (t.exists) return t.data().keys;
  }
  if (keys && Date.now() - keysAt < 12 * 3600e3) return keys;
  const r = await fetch(KEYS_URL);
  const j = await r.json();
  const map = {};
  (j.keys || []).forEach((k) => { map[String(k.keyId)] = k.pem; });
  keys = map; keysAt = Date.now();
  return keys;
}

/** The callback's parameters if AdMob signed them, else null. The signed text is the query up to "&signature=";
 *  signature and key_id are always the last two parameters, in that order. */
function checkSignature(query, keyMap) {
  const i = query.indexOf('&signature=');
  if (i < 0) return null;
  const params = new URLSearchParams(query);
  const pem = keyMap[params.get('key_id')], sig = params.get('signature');
  if (!pem || !sig) return null;
  const der = Buffer.from(sig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  try {
    return crypto.verify('sha256', Buffer.from(query.slice(0, i)), { key: pem, dsaEncoding: 'der' }, der) ? params : null;
  } catch (e) { return null; }
}

/** AdMob's callback: note the ad as a ticket for that player. */
async function onCallback(db, query) {
  if (!query) return { status: 200, body: 'ok' }; // AdMob checks that the address answers
  const p = checkSignature(query, await verifierKeys(db));
  if (!p) return { status: 400, body: 'bad signature' };
  const uid = p.get('user_id'), tx = p.get('transaction_id');
  if (!uid || !tx || uid.length > 128 || tx.length > 256 || /\//.test(uid + tx)) return { status: 200, body: 'ignored' };
  await db.collection('players').doc(uid).collection('adTickets').doc(tx)
    .create({ at: Date.now(), unit: p.get('ad_unit') || null, used: false })
    .catch((e) => { if (e.code !== 6) throw e; }); // 6: already there (AdMob retried)
  return { status: 200, body: 'ok' };
}

/** Wait (a few seconds at most: AdMob's call can come just after the ad closes) for an unused ticket. */
async function waitTicket(db, uid, ms) {
  const col = db.collection('players').doc(uid).collection('adTickets');
  const until = Date.now() + (ms || 8000);
  for (;;) {
    const snap = await col.where('used', '==', false).limit(10).get();
    const fresh = snap.docs.filter((d) => Date.now() - d.data().at < TICKET_MS);
    if (fresh.length) return true;
    if (Date.now() > until) return false;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

/** Inside the player's transaction: take one unused ticket, or null if there is none. */
async function takeTicket(tx, db, uid) {
  const snap = await tx.get(db.collection('players').doc(uid).collection('adTickets').where('used', '==', false).limit(10));
  const d = snap.docs.filter((x) => Date.now() - x.data().at < TICKET_MS).sort((a, b) => a.data().at - b.data().at)[0];
  return d ? d.ref : null;
}

module.exports = { onCallback, checkSignature, waitTicket, takeTicket, TICKET_MS };
