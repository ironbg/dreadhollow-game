// The server's engine and fight checks without Firebase: node functions/test/engine.js
'use strict';
const assert = require('assert');
const { boot, withProfile, freshProfile } = require('../engine');
const { checkRun } = require('../runcheck');
const live = require('../game/live.json');
(async () => {
  const p0 = freshProfile(live);
  assert.strictEqual(p0.gems, 60); assert.strictEqual(p0.gold, 800);
  // an action runs on the profile and changes it
  let r = await withProfile(Object.assign({}, p0, { gems: 1000 }), live, (DH) => DH.actions.list.buyChest.run({ type: 'silver' }));
  assert.ok(Array.isArray(r.result) && r.result.length === 1, 'chest gives an item');
  assert.strictEqual(r.profile.gems, 850, 'silver chest costs 150');
  assert.strictEqual(r.profile.gear.length, 1);
  // not enough gems: nothing happens
  r = await withProfile(p0, live, (DH) => DH.actions.list.buyChest.run({ type: 'gold' }));
  assert.ok(!r.result); assert.strictEqual(r.profile.gems, 60);
  // rename: first change free, then 200
  r = await withProfile(Object.assign({}, p0, { playerName: 'Aaa', gems: 500 }), live, (DH) => DH.actions.list.rename.run({ name: 'Bbb' }));
  assert.deepStrictEqual(r.result, { ok: true }); assert.strictEqual(r.profile.gems, 500);
  r = await withProfile(r.profile, live, (DH) => DH.actions.list.rename.run({ name: 'Ccc' }));
  assert.strictEqual(r.profile.gems, 300);
  // free fields: settings pass, a hero not owned does not
  r = await withProfile(p0, live, (DH) => { DH.actions.overlayFree(DH.save.data, { settings: { music: 0.1 }, selectedHero: 'reaper', gems: 99999 }); });
  assert.strictEqual(r.profile.settings.music, 0.1); assert.strictEqual(r.profile.selectedHero, 'knight'); assert.strictEqual(r.profile.gems, 60);
  // a fight: an honest summary passes and pays; impossible ones do not
  const DH = boot(live), run = { stage: 'crypt', hero: 'knight', start: Date.now() - 620e3, agony: false, dread: 0 };
  const sum = { stage: 'crypt', hero: 'knight', time: 609, kills: 2913, gold: 1636, level: 33, bossKills: 4, eliteKills: 3, championKills: 0, tomes: 2, bosses: [], victory: true, agony: 0, agonyOn: false, dmgByAb: { cleave: 27000 }, wellSent: null, wellExtra: [], herbs: { moss: 3 }, mats: { iron: 12, silver: 1 }, dread: 0, potionsUsed: {}, lateLevels: 0, runLength: 600, artifactsFound: [], shards: 0, hexed: false, elemApplied: false, abTimes: [], oozes: 10, crits: 50, dmgTags: {} };
  assert.strictEqual(checkRun(sum, run, Date.now(), DH), null, 'honest fight passes');
  assert.strictEqual(checkRun(Object.assign({}, sum, { time: 900 }), run, Date.now(), DH), 'time-beyond-clock');
  assert.strictEqual(checkRun(Object.assign({}, sum, { kills: 99999 }), run, Date.now(), DH), 'kills');
  assert.strictEqual(checkRun(Object.assign({}, sum, { gold: 1e7 }), run, Date.now(), DH), 'gold');
  assert.strictEqual(checkRun(Object.assign({}, sum, { level: 400 }), run, Date.now(), DH), 'level');
  assert.strictEqual(checkRun(Object.assign({}, sum, { time: 120, kills: 500, level: 10, bossKills: 0 }), run, Date.now(), DH), 'victory-too-early');
  assert.strictEqual(checkRun(Object.assign({}, sum, { stage: 'reliquary' }), run, Date.now(), DH), 'wrong-hall-or-hero');
  assert.strictEqual(checkRun(Object.assign({}, sum, { artifactsFound: ['nope'] }), run, Date.now(), DH), 'artifacts');
  assert.strictEqual(checkRun(Object.assign({}, sum, { mats: { mithril: 3 } }), run, Date.now(), DH), 'mats');
  assert.strictEqual(checkRun(Object.assign({}, sum, { mats: { iron: 9999 } }), run, Date.now(), DH), 'mats');
  assert.strictEqual(checkRun(Object.assign({}, sum, { mats: { iron: -2 } }), run, Date.now(), DH), 'mats');
  r = await withProfile(p0, live, (DHp) => DHp.meta.settleRun(sum));
  assert.strictEqual(r.profile.mats.iron, 10 + 12, 'materials come home'); assert.strictEqual(r.profile.mats.silver, 1);
  // forging: a level costs gold and a material; without the material nothing happens
  const pg = Object.assign({}, p0, { gold: 1e6, gear: [{ id: 1, type: 'striders', rarity: 0, level: 1 }], nextGearId: 2, mats: { iron: 0, silver: 0, gold: 0, starsteel: 0 } });
  let f = await withProfile(pg, live, (DHp) => DHp.actions.list.levelGear.run({ id: 1 }));
  assert.strictEqual(f.result, false); assert.strictEqual(f.profile.gear[0].level, 1); assert.strictEqual(f.profile.gold, 1e6);
  f = await withProfile(Object.assign({}, pg, { mats: { iron: 100 } }), live, (DHp) => DHp.actions.list.levelGearAll.run({ id: 1 }));
  assert.strictEqual(f.result, 9); assert.strictEqual(f.profile.gear[0].level, 10); assert.strictEqual(f.profile.mats.iron, 100 - 21, 'common 1 to 10 takes 21 iron');
  f = await withProfile(f.profile, live, (DHp) => DHp.actions.list.salvage.run({ id: 1 }));
  assert.strictEqual(f.profile.mats.iron, 79 + 1 + 10, 'salvage gives back its metal and half the forging');
  assert.ok(r.result.gold > 3000 && r.profile.gold >= 800 + r.result.gold, 'fight pays gold (deeds may add more)');
  assert.ok(r.result.firstClear && r.profile.gems >= 60 + 150, 'first clear pays gems');
  // doubling pays the recorded gold once, whatever the device says
  const d1 = await withProfile(r.profile, live, (DHp) => DHp.actions.list.doubleRunGold.run({ gold: 1e9 }));
  const d2 = await withProfile(d1.profile, live, (DHp) => DHp.actions.list.doubleRunGold.run({}));
  assert.strictEqual(d1.profile.gold, r.profile.gold + r.result.gold); assert.strictEqual(d2.result, 0);
  console.log('engine tests: all passed');
})().catch((e) => { console.error(e); process.exit(1); });
