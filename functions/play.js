/* Google Play purchases, checked with Google before anything is delivered (Google Play Developer API).
 * The functions' service account must be invited in the Play Console (Users and permissions) with the permissions
 * "View financial data" and "Manage orders and subscriptions"; until then every check answers 'store-unreachable'
 * and nothing is delivered (the player keeps the purchase and it is delivered at a later launch).
 * On the emulators (tests only) a pretend Google accepts tokens that start with "test-ok-". */
'use strict';
const crypto = require('crypto');

const PACKAGE = 'com.dreadhollow.game';
const API = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' + PACKAGE + '/purchases/products/';
const FAKE = process.env.FUNCTIONS_EMULATOR === 'true';

let auth = null;
async function accessToken() {
  const { GoogleAuth } = require('google-auth-library');
  auth = auth || new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/androidpublisher'] });
  const client = await auth.getClient();
  const t = await client.getAccessToken();
  return typeof t === 'string' ? t : t.token;
}

async function google(method, url) {
  const res = await fetch(url, { method, headers: { Authorization: 'Bearer ' + (await accessToken()), 'Content-Length': '0' } });
  let json = null;
  try { json = await res.json(); } catch (e) { /* empty answer */ }
  return { status: res.status, json };
}

/** What Google knows of a purchase token: null if it is not a real purchase of this product. */
async function verify(productId, token) {
  if (FAKE) {
    if (!token.startsWith('test-ok-')) return null;
    return { purchaseState: token.includes('-pending') ? 2 : 0, consumptionState: 0, acknowledgementState: 0, orderId: 'GPA.TEST-' + token.slice(-6),
      purchaseType: 0, obfuscatedExternalAccountId: token.includes('-other') ? 'someone-else' : undefined };
  }
  const r = await google('GET', API + encodeURIComponent(productId) + '/tokens/' + encodeURIComponent(token));
  if (r.status === 400 || r.status === 404 || r.status === 410) return null;
  if (r.status !== 200 || !r.json) {
    console.error('play check failed', r.status, r.json && r.json.error && r.json.error.message);
    const e = new Error('store-unreachable'); e.code = 'store-unreachable'; throw e;
  }
  return r.json;
}

/** Tell Google the purchase was delivered (else it is refunded after three days). */
async function acknowledge(productId, token) {
  if (FAKE) return;
  const r = await google('POST', API + encodeURIComponent(productId) + '/tokens/' + encodeURIComponent(token) + ':acknowledge');
  if (r.status !== 200 && r.status !== 204) console.warn('play acknowledge', r.status, r.json && r.json.error && r.json.error.message);
}

/** The account a purchase belongs to, as the game sends it to Google (a hash, never the id itself; js/services/iap.js). */
const accountHash = (uid) => crypto.createHash('sha256').update('dh:' + uid).digest('hex');
/** A purchase's record id (the token itself is long and never stored). */
const tokenId = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { verify, acknowledge, accountHash, tokenId };
