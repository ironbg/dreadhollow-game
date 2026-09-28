// The server end to end on the Firebase emulators:
//   npx firebase-tools emulators:exec --only auth,firestore,functions --project demo-dreadhollow "node functions/test/emulator.js"
'use strict';
const assert = require('assert');
const admin = require('firebase-admin');
const PROJECT = process.env.GCLOUD_PROJECT || 'demo-dreadhollow';
const AUTH = 'http://' + process.env.FIREBASE_AUTH_EMULATOR_HOST, FS = 'http://' + process.env.FIRESTORE_EMULATOR_HOST;
const FN = 'http://127.0.0.1:5001/' + PROJECT + '/europe-west1/';
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

const post = async (url, body, token) => {
  const r = await fetch(url, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}), body: JSON.stringify(body) });
  return { status: r.status, json: await r.json().catch(() => ({})) };
};
const call = async (name, data, token) => { const r = await post(FN + name, { data }, token); return r.json.error ? { error: r.json.error.details ? r.json.error.details.code : r.json.error.status } : r.json.result; };

(async () => {
  // a guest: an anonymous account
  const su = await post(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=test', { returnSecureToken: true });
  const token = su.json.idToken, uid = su.json.localId;
  assert.ok(token, 'anonymous account');

  // no account: refused
  assert.strictEqual((await call('sync', { free: {} })).error, 'requires-login');

  // first sync brings the device's profile in, with ceilings on what it claims
  let r = await call('sync', { free: { settings: { music: 0.3 } }, local: { gold: 1234, gems: 999999, accountLevel: 7, playerName: 'Гост' }, v: '9.9.9' }, token);
  assert.strictEqual(r.save.gold, 1234); assert.strictEqual(r.save.gems, 30000, 'gems capped at bring-in'); assert.strictEqual(r.save.settings.music, 0.3);
  // later syncs cannot set protected fields
  r = await call('sync', { free: { gems: 5, gold: 1e9 }, local: { gems: 1e9 }, v: '9.9.9' }, token);
  assert.strictEqual(r.save.gems, 30000); assert.strictEqual(r.save.gold, 1234);

  // an action: a silver chest costs 150 gems and gives one item
  r = await call('act', { name: 'buyChest', args: { type: 'silver' }, free: {}, v: '9.9.9' }, token);
  assert.strictEqual(r.save.gems, 29850); assert.strictEqual(r.result.length, 1);
  assert.strictEqual((await call('act', { name: 'grant', args: { gems: 1e6 }, v: '9.9.9' }, token)).error, 'unknown-action');

  // a fight: torches paid at the start
  const e0 = r.save.energy;
  r = await call('runStart', { free: { selectedStage: 'crypt', selectedHero: 'knight' }, v: '9.9.9' }, token);
  assert.ok(r.ticket); assert.strictEqual(r.save.energy, e0 - 5);
  const ticket = r.ticket;
  const sum = { stage: 'crypt', hero: 'knight', time: 609, kills: 2913, gold: 1636, level: 33, bossKills: 4, eliteKills: 3, championKills: 0, tomes: 2, bosses: [], victory: true, agony: 0, agonyOn: false, dmgByAb: { cleave: 27000 }, wellSent: null, wellExtra: [], herbs: { moss: 3 }, dread: 0, potionsUsed: {}, lateLevels: 0, runLength: 600, artifactsFound: [], shards: 0, hexed: false, elemApplied: false, abTimes: [], oozes: 10, crits: 50, dmgTags: {} };
  // ten minutes claimed one second after the start: not rewarded
  r = await call('runEnd', { ticket, summary: sum, v: '9.9.9' }, token);
  assert.strictEqual(r.error, 'invalid-run');
  let doc = (await db.collection('players').doc(uid).get()).data();
  assert.strictEqual(doc.flags.last, 'time-beyond-clock'); assert.strictEqual(doc.run, null);
  // the same fight, really started eleven minutes ago: rewarded
  r = await call('runStart', { free: {}, v: '9.9.9' }, token);
  await db.collection('players').doc(uid).update({ 'run.start': Date.now() - 660e3 });
  const gold0 = r.save.gold;
  r = await call('runEnd', { ticket: r.ticket, summary: sum, v: '9.9.9' }, token);
  assert.ok(r.result && r.result.gold > 3000, 'fight rewarded'); assert.ok(r.save.gold >= gold0 + r.result.gold);
  // the same ticket twice: refused
  assert.strictEqual((await call('runEnd', { ticket: r.ticket, summary: sum, v: '9.9.9' }, token)).error, 'no-run');
  // doubling pays once, whatever gold is claimed
  const g1 = r.save.gold;
  r = await call('act', { name: 'doubleRunGold', args: { gold: 1e9 }, v: '9.9.9' }, token);
  assert.ok(r.save.gold > g1 && r.save.gold - g1 < 20000);
  r = await call('act', { name: 'doubleRunGold', args: {}, v: '9.9.9' }, token);
  assert.strictEqual(r.result, 0);

  // the device cannot write its profile, nor another player's, nor a leaderboard entry
  const write = await fetch(FS + '/v1/projects/' + PROJECT + '/databases/(default)/documents/players/' + uid + '?updateMask.fieldPaths=save', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ fields: { save: { stringValue: '{"gems":1000000}' } } }) });
  assert.strictEqual(write.status, 403, 'profile is server-only');
  const bw = await fetch(FS + '/v1/projects/' + PROJECT + '/databases/(default)/documents/boards/x__all/scores/' + uid, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ fields: { score: { integerValue: '999999' } } }) });
  assert.strictEqual(bw.status, 403, 'boards are server-only');

  // an old game build is turned away
  assert.strictEqual((await call('sync', { free: {}, v: '1.0.0' }, token)).error, 'outdated');

  // deleting the account removes what the server holds
  r = await call('wipe', {}, token);
  assert.ok(r.ok); assert.ok(!(await db.collection('players').doc(uid).get()).exists);
  console.log('emulator tests: all passed');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
