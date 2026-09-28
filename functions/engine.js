/* The game's own economy code (js/meta/meta.js with its data), run on the server. tools/build-functions.js copies the
 * files into functions/game/ before a deploy, so the server and the game always run the same rules. Every call gets a
 * fresh, closed sandbox: the player's profile goes in, the action runs, the changed profile comes out. */
'use strict';
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const FILES = ['core/ns.js', 'i18n/i18n.js', 'i18n/en.js', 'data/content.js', 'data/economy.js', 'data/artifacts.js', 'data/deeds.js', 'core/save.js', 'meta/meta.js', 'meta/actions.js'];
const DIR = path.join(__dirname, 'game');
const scripts = FILES.map((f) => new vm.Script(fs.readFileSync(path.join(DIR, f), 'utf8'), { filename: 'game/' + f }));

const noop = () => 0;
const clone = (o) => (o === undefined ? null : JSON.parse(JSON.stringify(o)));

/** A sandbox with the game's economy loaded. live: the live.json settings (events, boards). */
function boot(live) {
  const ctx = {
    console, Math, Date, JSON, Promise, Intl, Number, String, Object, Array, Error, RegExp, Set, Map, isFinite, parseInt, parseFloat,
    setTimeout: noop, clearTimeout: noop, addEventListener: noop,
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    navigator: { userAgent: 'server', language: 'en' },
    document: { addEventListener: noop, hidden: false, documentElement: { style: { setProperty: noop } } },
    location: { hostname: 'server', search: '' },
  };
  ctx.window = ctx; ctx.self = ctx;
  ctx.DH = {
    platform: { native: false, os: 'server', plugin: () => null, deviceLabel: () => 'server',
      storage: { get: async () => null, set: async () => {}, remove: async () => {} } },
  };
  vm.createContext(ctx);
  for (const s of scripts) s.runInContext(ctx);
  const DH = ctx.DH;
  DH.i18n.set('en');
  // what the economy code reaches for outside itself: the live settings, and nothing that talks to a player
  DH.live = { config: live || {}, offset: 0, events: () => [] };
  DH.ads = { rewarded: async () => true }; // the player watched it on the device (checked with the ad network later)
  DH.audio = { play: noop, vibrate: noop };
  DH.ui = { rewardPopup: noop, toast: noop, refresh: noop };
  DH.cloud = { user: null, submitBoards: noop };
  return DH;
}

/** Run fn(DH) on a profile. Returns what fn returned and the profile after it. */
async function withProfile(profile, live, fn) {
  const DH = boot(live);
  DH.save.adopt(profile || {});
  const result = await fn(DH);
  return { result: clone(result), profile: clone(DH.save.data), DH };
}

/** A fresh profile as the game makes one. */
function freshProfile(live) { const DH = boot(live); return clone(DH.save.adopt({})); }

module.exports = { boot, withProfile, freshProfile };
