/* Is the game's server live and answering? A throwaway guest account signs up, syncs, takes the login reward,
 * starts a fight, and is deleted again. Also checks AdMob's callback address and the live settings.
 * Usage: node tools/check-server.js   (exit code 0 when everything answers) */
'use strict';
const KEY = 'AIzaSyD-nAf06uPFKjLqD199MunLhD1HMA8dzsM';
const FN = 'https://europe-west1-dreadhollow-b49c7.cloudfunctions.net/';
const V = require('../package.json').version;

const ok = (m) => console.log('  ok   ' + m), bad = (m) => { console.log('  FAIL ' + m); process.exitCode = 1; };
const call = async (name, data, token) => {
  const r = await fetch(FN + name, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ data }) });
  const j = await r.json().catch(() => ({}));
  if (j.error) throw new Error(name + ': ' + r.status + ' ' + ((j.error.details && j.error.details.code) || j.error.status || '') + (j.error.message ? ' — ' + j.error.message : ''));
  return j.result;
};

(async () => {
  console.log('Dreadhollow server check (game ' + V + ')');
  const live = await (await fetch('https://dreadhollow-b49c7.web.app/live.json?t=' + Date.now())).json();
  ok('live.json: server ' + live.server + ', web.min ' + (live.web && live.web.min) + ', app.min ' + (live.app && live.app.min) + ', ads.verify ' + !!(live.ads && live.ads.verify));
  const su = await (await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + KEY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) })).json();
  if (!su.idToken) { bad('guest accounts: ' + (su.error && su.error.message) + ' (Firebase → Authentication → Sign-in method → Anonymous)'); return; }
  ok('guest account created');
  const token = su.idToken;
  try {
    const t0 = Date.now();
    const s = await call('sync', { free: {}, v: V, p: 'web' }, token);
    ok('sync answered in ' + (Date.now() - t0) + ' ms (profile rev ' + s.rev + ', ' + s.save.gems + ' gems)');
    const a = await call('act', { name: 'claimLogin', args: { double: false }, free: {}, v: V, p: 'web' }, token);
    ok('an action: gems ' + s.save.gems + ' → ' + a.save.gems);
    const r = await call('runStart', { free: { selectedStage: 'crypt', selectedHero: 'knight' }, v: V, p: 'web' }, token);
    ok('a fight started: ticket ' + (r.ticket ? 'yes' : 'no') + ', torches ' + r.save.energy);
    try { await call('purchase', { productId: 'gems_1', token: 'not-a-real-token', v: V, p: 'web' }, token); bad('a forged purchase was accepted'); } catch (e) {
      if (/bad-purchase/.test(e.message)) ok('purchases: a forged token is refused (Google answered)');
      else if (/store-unreachable/.test(e.message)) bad('purchases: Google cannot be asked yet (Play Console invite / Android Developer API): ' + e.message);
      else bad('purchases: ' + e.message);
    }
  } catch (e) { bad(e.message); }
  try { await call('wipe', {}, token); ok('test account data removed'); } catch (e) { bad('wipe: ' + e.message); }
  await fetch('https://identitytoolkit.googleapis.com/v1/accounts:delete?key=' + KEY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }) });
  const ad = await fetch(FN + 'adReward');
  if (ad.status === 200) ok('AdMob callback address answers'); else bad('adReward: HTTP ' + ad.status);
  console.log(process.exitCode ? 'Something is not ready yet.' : 'Everything answers.');
})().catch((e) => { console.error(e); process.exit(1); });
