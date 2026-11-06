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
  // a number past a magnitude cap is clamped to the ceiling, not rejected: the fight still pays, up to it
  { const s = Object.assign({}, sum, { kills: 99999 }); assert.strictEqual(checkRun(s, run, Date.now(), DH), null); assert.strictEqual(s.kills, 150 * 609 + 2000, 'kills clamped'); }
  { const s = Object.assign({}, sum, { gold: 1e7 }); assert.strictEqual(checkRun(s, run, Date.now(), DH), null); assert.ok(s.gold > 0 && s.gold < 1e7, 'gold clamped'); }
  { const s = Object.assign({}, sum, { level: 400 }); assert.strictEqual(checkRun(s, run, Date.now(), DH), null); assert.strictEqual(s.level, Math.floor(40 + 609 / 2), 'level clamped'); }
  { const s = Object.assign({}, sum, { time: 120, kills: 500, level: 10, bossKills: 0 }); assert.strictEqual(checkRun(s, run, Date.now(), DH), null); assert.strictEqual(s.victory, false, 'unearned victory stripped, run still paid'); }
  { const s = Object.assign({}, sum, { mats: { iron: 9999 } }); assert.strictEqual(checkRun(s, run, Date.now(), DH), null); assert.strictEqual(s.mats.iron, DH.economy.MAT_RUN_MAX || 250, 'mats clamped'); }
  // integrity failures are still never rewarded
  assert.strictEqual(checkRun(Object.assign({}, sum, { stage: 'reliquary' }), run, Date.now(), DH), 'wrong-hall-or-hero');
  // an unknown piece is dropped, the fight is still paid (a Mythic piece in the Well once cost players their victory)
  { const s = Object.assign({}, sum, { artifactsFound: ['nope'] }); assert.strictEqual(checkRun(s, run, Date.now(), DH), null); assert.deepStrictEqual(s.artifactsFound, []); }
  { const s = Object.assign({}, sum, { mats: { mithril: 3, iron: -2, silver: 1 } }); assert.strictEqual(checkRun(s, run, Date.now(), DH), null); assert.deepStrictEqual(s.mats, { silver: 1 }); }
  { const s = Object.assign({}, sum, { wellSent: { type: DH.economy.gearOrder[0], rarity: 5 }, wellExtra: [{ type: 'nope', rarity: 1 }, { type: DH.economy.gearOrder[1], rarity: 9 }] });
    assert.strictEqual(checkRun(s, run, Date.now(), DH), null, 'a Mythic piece in the Well is a fight like any other');
    assert.strictEqual(s.wellSent.rarity, 5); assert.strictEqual(s.wellExtra.length, 1); assert.strictEqual(s.wellExtra[0].rarity, DH.economy.rarities.length - 1); }
  { const s = Object.assign({}, sum, { dmgByAb: { nope: 5, burn: 3 }, potionsUsed: { nope: 1 }, herbs: { nope: 2 } }); assert.strictEqual(checkRun(s, run, Date.now(), DH), null); assert.deepStrictEqual(s.dmgByAb, { burn: 3 }); assert.deepStrictEqual(s.potionsUsed, {}); assert.deepStrictEqual(s.herbs, {}); }
  r = await withProfile(p0, live, (DHp) => DHp.meta.settleRun(sum));
  let lvIron = 0; for (let l = 2; l <= r.profile.accountLevel; l++) lvIron += DH.economy.accountLevelReward(l).mats.iron || 0;
  assert.strictEqual(r.profile.mats.iron, 10 + 12 + lvIron, 'materials come home (and each account level adds its metal)'); assert.strictEqual(r.profile.mats.silver, 1);
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
  // rewards hold materials, herbs and potions; the Forge sells a few packs a day
  let g2 = await withProfile(p0, live, (DHp) => DHp.meta.grant({ mats: { iron: 7, mithril: 5 }, herbs: { moss: 2 }, potions: { lethe: 1 } }));
  assert.strictEqual(g2.profile.mats.iron, 17); assert.ok(!('mithril' in g2.profile.mats)); assert.strictEqual(g2.profile.herbs.moss, 2); assert.strictEqual(g2.profile.potions.lethe, 1);
  const iIron = DH.economy.stockPacks.findIndex((x) => x.id === 'p_iron');
  let pk = { profile: Object.assign({}, p0, { gold: 1e6 }) };
  for (let k = 0; k < 6; k++) pk = await withProfile(pk.profile, live, (DHp) => DHp.actions.list.buyPack.run({ i: iIron }));
  assert.strictEqual(pk.result, null, 'the sixth iron pack of a day is refused');
  assert.strictEqual(pk.profile.mats.iron, 10 + 5 * 20); assert.strictEqual(pk.profile.gold, 1e6 - 5 * 2500);
  pk = await withProfile(Object.assign({}, p0, { gems: 10 }), live, (DHp) => DHp.actions.list.buyPack.run({ i: DH.economy.stockPacks.findIndex((x) => x.id === 'p_starsteel') }));
  assert.ok(!pk.result); assert.strictEqual(pk.profile.gems, 10);
  // the Vigil gathers the metal of the deepest hall won
  const vg = await withProfile(Object.assign({}, p0, { cleared: { crypt: 1, aqueduct: 1 }, vigil: { ts: Date.now() - 4 * 3600e3 } }), live, (DHp) => DHp.meta.claimVigil(false));
  assert.strictEqual(vg.profile.mats.silver, 6, 'four hours: six silver');
  // an account level pays metal too
  const al = await withProfile(Object.assign({}, p0, { accountXp: 99 }), live, (DHp) => DHp.meta.addAccountXp(1));
  assert.strictEqual(al.profile.accountLevel, 2); assert.strictEqual(al.profile.mats.iron, 15);
  // every pass, calendar, mission, deal and newcomer reward only names things that exist
  const E2 = DH.economy, ok = (rw) => { for (const k in rw.mats || {}) assert.ok(E2.materials.includes(k), k); for (const k in rw.herbs || {}) assert.ok(E2.herbs.includes(k), k); for (const k in rw.potions || {}) assert.ok(E2.potions[k], k); };
  E2.passRewards.free.concat(E2.passRewards.prem, E2.loginRewards, E2.missionPool.map((m) => m.reward), E2.dealPool.map((x) => x.grant), E2.stockPacks.map((x) => x.grant), E2.NEWBIE.milestones.map((x) => x.r), [].concat(...E2.NEWBIE.tasks).map((x) => x.r)).forEach(ok);
  live.events.forEach((ev) => ev.shop.forEach((it) => ok(it.reward)));
  // the Shrine is per hero: an old profile's Blessings go to every hero it owns; a purchase raises only the selected hero
  const oldP = Object.assign({}, p0, { gold: 1e6, heroes: { knight: true, ranger: true }, shrine: { might: 2 }, selectedHero: 'ranger' }); delete oldP.shrineBy;
  let sh = await withProfile(oldP, live, (DHp) => DHp.actions.list.buyShrine.run({ id: 'swiftness' }));
  assert.strictEqual(sh.result, true);
  assert.deepStrictEqual(sh.profile.shrineBy.knight, { might: 2 }, 'knight keeps the old Blessings, gets nothing new');
  assert.deepStrictEqual(sh.profile.shrineBy.ranger, { might: 2, swiftness: 1 }, 'the selected hero gets the purchase');
  sh = await withProfile(sh.profile, live, (DHp) => ({ k: DHp.meta.baseStats('knight').speedPct || 0, a: DHp.meta.baseStats('ranger').speedPct || 0, tot: DHp.meta.shrineTotal() }));
  assert.ok(sh.result.a > sh.result.k, 'only the ranger runs faster'); assert.strictEqual(sh.result.tot, 3, 'the deeds count the hero with the most');
  // daily missions pay activity points; the points open the chests of the track
  let dm = await withProfile(Object.assign({}, p0, { cleared: { crypt: 1 } }), live, (DHp) => {
    const M = DHp.meta, d = M.ensureDaily(), E3 = DHp.economy;
    const sum = d.missions.reduce((n, m) => n + M.missionDef(m.id).pts, 0);
    const out = { sum, n: d.missions.length, early: M.claimActivity(0) };
    d.missions.forEach((m) => { m.done = true; m.p = M.missionDef(m.id).target; });
    d.missions.forEach((m, i) => M.claimMission(i));
    out.pts = M.activityPts(); out.gems0 = DHp.save.data.gems;
    out.claimed = E3.ACTIVITY_CHESTS.map((c, i) => !!M.claimActivity(i));
    out.again = M.claimActivity(0); out.gems = DHp.save.data.gems;
    return out;
  });
  assert.ok(dm.result.sum >= 55 && dm.result.n >= 8, 'a day always reaches the last chest');
  assert.strictEqual(dm.result.early, null, 'no chest before its points');
  assert.strictEqual(dm.result.pts, dm.result.sum); assert.deepStrictEqual(dm.result.claimed, [true, true, true, true, true]);
  assert.strictEqual(dm.result.again, null, 'a chest opens once'); assert.strictEqual(dm.result.gems, dm.result.gems0 + 50);
  // a fresh player (no hall won) is never offered the Agony mission; a fight counts materials and herbs
  dm = await withProfile(p0, live, (DHp) => { const d = DHp.meta.ensureDaily(); d.missions = [{ id: 'mats', p: 0 }, { id: 'herbs', p: 0 }]; DHp.meta.settleRun(Object.assign({}, sum, { mats: { iron: 12, silver: 9 }, herbs: { moss: 3 } })); return d.missions.filter((m) => m.id !== 'pit').map((m) => m.done); });
  assert.deepStrictEqual(dm.result, [true, true]);
  // the Pit's mission comes every day, and joins a day dealt before it existed; a sweep or a fight counts
  dm = await withProfile(p0, live, (DHp) => { const d = DHp.meta.ensureDaily(), first = d.missions.some((m) => m.id === 'pit'); d.missions = d.missions.filter((m) => m.id !== 'pit');
    const back = DHp.meta.ensureDaily().missions.some((m) => m.id === 'pit'); DHp.meta.pitStart(); return [first, back, DHp.meta.ensureDaily().missions.find((m) => m.id === 'pit').done]; });
  assert.deepStrictEqual(dm.result, [true, true, true]);
  dm = await withProfile(p0, live, (DHp) => DHp.meta.ensureDaily().missions.some((m) => m.id === 'agony'));
  assert.strictEqual(dm.result, false);
  // the account's reward track: once per milestone, only when reached
  r = await withProfile(Object.assign({}, p0, { accountLevel: 22 }), live, (DH) => DH.actions.list.claimAcct.run({ lvl: 20 }));
  assert.ok(Array.isArray(r.result) && r.result.some((x) => x.kind === 'gear'), 'level 20 gives a sure relic');
  assert.strictEqual(r.profile.acctTrack[20], true);
  r = await withProfile(r.profile, live, (DH) => DH.actions.list.claimAcct.run({ lvl: 20 }));
  assert.strictEqual(r.result, null, 'a milestone is taken once');
  r = await withProfile(r.profile, live, (DH) => DH.actions.list.claimAcct.run({ lvl: 25 }));
  assert.strictEqual(r.result, null, 'not before its level');
  // the Pit: three entries a day, the checkpoint paid on entry, waves no faster than the clock allows, sweep pays the best
  r = await withProfile(Object.assign({}, p0, { pit: { best: 34, day: null, used: 0, active: null, pass: false } }), live, (DH) => DH.actions.list.pitStart.run({}));
  assert.strictEqual(r.result.from, 30); assert.strictEqual(r.result.paid, 432); assert.strictEqual(r.profile.essence, 432); assert.strictEqual(r.result.affixes.length, 2);
  r = await withProfile(r.profile, live, (DH) => DH.actions.list.pitEnd.run({ waves: 400 }));
  assert.strictEqual(r.result.waves, 0, 'no waves can fall in no time');
  r.profile.pit.active = { at: Date.now() - 60000, from: 30, affixes: [] };
  r = await withProfile(r.profile, live, (DH) => DH.actions.list.pitEnd.run({ waves: 12 }));
  assert.strictEqual(r.result.reached, 42); assert.strictEqual(r.profile.pit.best, 42); assert.strictEqual(r.profile.essence, 432 + 173);
  r = await withProfile(r.profile, live, (DH) => DH.actions.list.pitSweep.run({}));
  assert.strictEqual(r.result.paid, 302, 'a sweep pays half the best wave'); assert.strictEqual(r.profile.pit.used, 2);
  r = await withProfile(r.profile, live, (DH) => [DH.actions.list.pitStart.run({}), DH.actions.list.pitSweep.run({})]);
  assert.ok(r.result[0] && r.result[1] === null, 'three entries a day');
  // the Constellation: a star opens only next to a full one, Essence pays, the reset gives every Essence back
  r = await withProfile(Object.assign({}, p0, { essence: 1000 }), live, (DH) => [DH.actions.list.consBuy.run({ id: 'fury_h3', n: 1 }), DH.actions.list.consBuy.run({ id: 'fury_0_0_1', n: 10 })]);
  assert.strictEqual(r.result[0], null, 'a star far from the heart is locked'); assert.strictEqual(r.result[1], 3);
  assert.ok(r.profile.essence < 1000 && r.profile.cons.spent === 1000 - r.profile.essence);
  r = await withProfile(r.profile, live, (DH) => [DH.actions.list.consBuy.run({ id: 'fury_0_0_2', n: 1 }), DH.actions.list.consLower.run({ id: 'fury_0_0_1' }), DH.meta.consCanLower('fury_0_0_2')]);
  assert.strictEqual(r.result[0], 1); assert.strictEqual(r.result[1], null, 'a star another one needs cannot be lowered'); assert.strictEqual(r.result[2], true);
  const ess0 = r.profile.essence, spent0 = r.profile.cons.spent;
  r = await withProfile(r.profile, live, (DH) => DH.actions.list.consLower.run({ id: 'fury_0_0_2' }));
  assert.ok(r.result.back > 0 && r.profile.essence === ess0 + r.result.back && r.profile.cons.spent === spent0 - r.result.back && !r.profile.cons.r.fury_0_0_2, 'a rank back returns its Essence');
  r = await withProfile(r.profile, live, (DH) => DH.actions.list.consReset.run({}));
  assert.strictEqual(r.profile.essence, 1000); assert.deepStrictEqual(r.profile.cons.r, {});
  // Loadouts: the one in use follows each change; a new one starts empty (all Essence back); picking one raises its stars again
  r = await withProfile(Object.assign({}, p0, { essence: 5000 }), live, (DH) => { const L = DH.actions.list;
    L.consBuy.run({ id: 'fury_0_0_1', n: 3 }); const e1 = DH.meta.essence();
    const nw = L.consLoadNew.run({}); const e2 = DH.meta.essence(); L.consBuy.run({ id: 'bastion_0_0_1', n: 2 });
    const back = L.consLoadPick.run({ i: 0 }); return [e1, nw.i, e2, back.full, DH.meta.consRank('fury_0_0_1'), DH.meta.consRank('bastion_0_0_1'), DH.meta.consLoadouts().cur, DH.meta.essence()]; });
  assert.deepStrictEqual(r.result, [4400, 1, 5000, true, 3, 0, 0, 4400]);
  r = await withProfile(r.profile, live, (DH) => { const L = DH.actions.list; return [L.consLoadName.run({ i: 1, name: 'Defence' }), L.consLoadPick.run({ i: 1 }).full, DH.meta.consRank('bastion_0_0_1'), L.consLoadDelete.run({ i: 1 }).i, DH.meta.consRank('fury_0_0_1'), DH.meta.consLoadouts().list.length]; });
  assert.deepStrictEqual(r.result, [true, true, 2, 0, 3, 1]); assert.strictEqual(r.profile.cons.ps.length, 1);
  r = await withProfile(Object.assign({}, r.profile, { essence: 0 }), live, (DH) => { const L = DH.actions.list; L.consReset.run({}); const e = DH.meta.essence(); DH.save.data.essence = 150; return [e, L.consLoadAgain.run({}).full]; });
  assert.strictEqual(r.result[0], 600); assert.strictEqual(r.result[1], true, 'the reset emptied the loadout too');
  // 100 more Essence with every point, each branch counting from its own start; stars bought at the old prices come back as Essence
  r = await withProfile(Object.assign({}, p0, { essence: 5000 }), live, (DH) => { const L = DH.actions.list; L.consBuy.run({ id: 'fury_0_0_1', n: 3 }); L.consBuy.run({ id: 'bastion_0_0_1', n: 1 }); return [DH.meta.consNext('fury'), DH.meta.consNext('bastion'), DH.meta.consSpentIn('fury')]; });
  assert.deepStrictEqual(r.result, [400, 200, 600]); assert.strictEqual(r.profile.essence, 5000 - 600 - 100);
  r = await withProfile(p0, live, (DH) => { const C = DH.economy.CONST; let sum = 0; for (let p = 0; p < 300; p++) sum += C.cost(p); return [C.cost(248), C.cost(249), C.cost(299), sum === C.spentIn(300)]; });
  assert.deepStrictEqual(r.result, [24900, 25000, 25000, true], 'a point never costs more than 25 000');
  r = await withProfile(Object.assign({}, p0, { essence: 10, cons: { r: { fury_0_0_1: 3 }, spent: 72 } }), live, (DH) => DH.meta.consRank('fury_0_0_1'));
  assert.strictEqual(r.result, 0); assert.strictEqual(r.profile.essence, 82); assert.strictEqual(r.profile.cons.pv, 2);
  // at checkpoint 1450 with the Pass, entering pays 31 320 (21.6 a wave)
  r = await withProfile(Object.assign({}, p0, { essence: 0, pit: { best: 1457, day: null, used: 0, active: null, pass: true } }), live, (DH) => DH.actions.list.pitStart.run({}));
  assert.strictEqual(r.result.paid, 31320);
  // the Pit Pass: +50% Essence a wave and a fourth entry; a Pit fight goes on the Pit's boards
  r = await withProfile(Object.assign({}, p0, { pit: { best: 0, day: null, used: 0, active: null, pass: false } }), live, (DH) => { DH.meta.fulfillProduct('pitpass', true); return [DH.meta.pitEntries(), DH.meta.pitPerWave()]; });
  assert.deepStrictEqual(r.result, [4, 21.6]); assert.strictEqual(r.profile.pit.pass, true);
  r.profile.pit.active = { at: Date.now() - 90000, from: 0, affixes: [] };
  r = await withProfile(r.profile, live, (DH) => { DH.actions.list.pitEnd.run({ waves: 17 }); return DH.meta.boardPending().map((b) => b.key.split('__')[0] + ':' + b.entry.score); });
  assert.deepStrictEqual(r.result, ['pit:17', 'pit:17']);
  // the Mastery's rules: level 1 with 1 point at the start; a card opens at its level; cost by tier; Extra Entry stays through
  // a reset and costs 100 000 gems to take back; cards bought at the old prices come back once
  r = await withProfile(Object.assign({}, p0, { gems: 150000, pit: { best: 0, day: null, used: 0, active: null, pass: false, mxp: 0, perks: { power: 3, entry: 1 } } }), live, (DH) => {
    const M = DH.meta, L = DH.actions.list; M.pitMastery(); const mig = JSON.stringify(DH.save.data.pit.perks || {});
    const a = [M.pitMastery().lv, M.pitPointsFree(), L.pitPerkUp.run({ id: 'fort' }), L.pitPerkUp.run({ id: 'power' }), M.pitPointsFree()];
    DH.save.data.pit.mxp = 1e6; L.pitPerkUp.run({ id: 'entry' }); L.pitPerkUp.run({ id: 'fort' }); const used = M.pitPointsUsed(); L.pitPerkReset.run({});
    const kept = [M.pitPerk('entry'), M.pitPerk('fort'), M.pitPointsUsed()];
    const g0 = DH.save.data.gems, down = L.pitPerkDown.run({ id: 'entry' });
    return [mig, a, used, kept, down, g0 - DH.save.data.gems]; });
  assert.deepStrictEqual(r.result, ['{}', [1, 1, null, 1, 0], 1 + 35 + 5, [1, 0, 35], 0, 100000]);
  r = await withProfile(Object.assign({}, r.profile, { gems: 10 }), live, (DH) => { DH.actions.list.pitPerkUp.run({ id: 'entry' }); return DH.actions.list.pitPerkDown.run({ id: 'entry' }); });
  assert.strictEqual(r.result, false, 'no gems, no refund'); assert.strictEqual(r.profile.pit.perks.entry, 1);
  // the Pit's Mastery: experience from a fight, points per level, a card bought, the time and Essence it adds, a free reset
  r = await withProfile(Object.assign({}, p0, { pit: { best: 0, day: null, used: 0, active: { at: Date.now() - 120000, from: 40, affixes: [] }, pass: false } }), live, (DH) => { DH.actions.list.pitEnd.run({ waves: 20 }); return DH.meta.pitMastery(); });
  assert.strictEqual(r.result.lv, 1, 'wave 60 gives 62 experience: not yet the 68 of level 2');
  r.profile.pit.mxp = 300000;
  r = await withProfile(r.profile, live, (DH) => { const M = DH.meta; for (let i = 0; i < 4; i++) DH.actions.list.pitPerkUp.run({ id: 'time' }); DH.actions.list.pitPerkUp.run({ id: 'essence' }); return [M.pitSecs(), M.pitPerWave(), M.pitPerk('time'), DH.actions.list.pitPerkUp.run({ id: 'time' })]; });
  assert.deepStrictEqual(r.result, [240, 15.84, 4, 5]);
  r = await withProfile(r.profile, live, (DH) => [DH.actions.list.pitPerkDown.run({ id: 'time' }), DH.meta.pitSecs(), DH.actions.list.pitPerkDown.run({ id: 'power' })]);
  assert.deepStrictEqual(r.result, [4, 240, null], 'a card level back');
  r = await withProfile(r.profile, live, (DH) => { DH.actions.list.pitPerkReset.run({}); return DH.meta.pitSecs(); });
  assert.strictEqual(r.result, 180);
  // Combo Master: three levels, and the top Mastery level pays for every card
  r = await withProfile(r.profile, live, (DH) => { const PM = DH.economy.PIT_MASTERY; let all = 0; for (const k in PM.perks) all += PM.perks[k].max * PM.perks[k].cost;
    for (let i = 0; i < 4; i++) DH.actions.list.pitPerkUp.run({ id: 'combo' }); DH.save.data.pit.mxp = 1e7; return [DH.meta.pitPerk('combo'), DH.meta.pitPerkVal('combo'), all, PM.max, DH.meta.pitMastery().lv]; });
  assert.strictEqual(r.result[0], 3, 'no more than three levels'); assert.ok(Math.abs(r.result[1] - 0.3) < 1e-9);
  assert.strictEqual(r.result[3], 200); assert.strictEqual(r.result[4], 200, 'the Mastery stops at level 200');
  r = await withProfile(r.profile, live, (DH) => { DH.actions.list.pitPerkReset.run({}); return 0; });
  // the Full Sweep card: all of the best wave at its top; a sweep of several entries at once
  r.profile.pit = Object.assign(r.profile.pit, { best: 40, used: 0, day: null }); r.profile.essence = 0;
  r = await withProfile(r.profile, live, (DH) => { for (let i = 0; i < 5; i++) DH.actions.list.pitPerkUp.run({ id: 'sweep' }); return [DH.meta.pitSweepShare(), DH.actions.list.pitSweep.run({ n: 2 }), DH.actions.list.pitSweep.run({ n: 9 })]; });
  assert.strictEqual(r.result[0], 1); assert.strictEqual(r.result[1].paid, 1152); assert.strictEqual(r.result[1].n, 2); assert.strictEqual(r.result[2].n, 1, 'no more than the entries left');
  assert.strictEqual(r.profile.essence, 1728); assert.strictEqual(r.profile.pit.used, 3);
  // the Mastery Pass (on its own, not the Pit Pass): twice the experience
  r = await withProfile(Object.assign({}, p0, { pit: { best: 30, day: null, used: 0, active: null, pass: true } }), live, (DH) => { DH.actions.list.pitSweep.run({}); return DH.save.data.pit.mxp; });
  assert.strictEqual(r.result, 16, 'the Pit Pass does not double the Mastery (+30% in the Pit); a sweep gives half: 30 waves x 0.8 x 1.3 x 0.5');
  r = await withProfile(r.profile, live, (DH) => { DH.meta.fulfillProduct('masterypass', true); DH.actions.list.pitSweep.run({}); return DH.save.data.pit.mxp; });
  assert.strictEqual(r.result, 47); assert.strictEqual(r.profile.masteryPass, true);
  // the slower Mastery: 7520 experience for level 139 -> 140, 1 077 386 in all to level 200; an older save keeps a fifth of
  // its experience (what the new rules would have given), its cards come back and Extra Entry stays
  r = await withProfile(Object.assign({}, p0, { pit: { best: 0, day: null, used: 0, active: null, pass: false, mv: 2, mxp: 50000, perks: { power: 3, entry: 1 } } }), live, (DH) => {
    const PM = DH.economy.PIT_MASTERY; let all = 0; for (let l = 1; l < PM.max; l++) all += PM.next(l);
    const m = DH.meta.pitMastery(); return [PM.next(139), all, DH.save.data.pit.mxp, JSON.stringify(DH.save.data.pit.perks), m.lv, DH.meta.pitPointsFree()]; });
  assert.deepStrictEqual(r.result, [7520, 1077386, 10000, '{"entry":1}', 19, 0]);
  r = await withProfile(r.profile, live, (DH) => { DH.meta.pitMastery(); return DH.save.data.pit.mxp; });
  assert.strictEqual(r.result, 10000, 'the experience is cut once only');
  // the Pit's Deeds: a first fight, 50 waves in one fight, wave 100 (from the best wave), the Essence it paid; a sweep checks too
  r = await withProfile(Object.assign({}, p0, { pit: { best: 0, day: null, used: 0, active: { at: Date.now() - 170000, from: 60, affixes: [] }, pass: false, mv: 3 } }), live, (DH) => {
    const res = DH.actions.list.pitEnd.run({ waves: 55 }); return [res.deeds.map((d) => d.id).sort(), DH.save.data.stats.pitFights]; });
  assert.deepStrictEqual(r.result, [['d_pit_first', 'd_pit_run_50', 'd_pit_wave_100'], 1]);
  r = await withProfile(Object.assign({}, r.profile, { stats: Object.assign({}, r.profile.stats, { essence: 99990 }) }), live, (DH) => DH.actions.list.pitSweep.run({}).deeds.map((d) => d.id));
  assert.deepStrictEqual(r.result, ['d_pit_essence']);
  // the Trials' trophies read the Pit and the Constellation
  r = await withProfile(r.profile, live, (DH) => { const A = DH.economy.achievements, v = (id) => DH.meta.achValue(A.find((a) => a.id === id)); return [v('pitdepth'), v('pitfights'), v('pitessence') >= 100000, v('stargazer'), DH.actions.list.claimAch.run({ id: 'pitdepth' }) ? DH.save.data.achievements.pitdepth : 0]; });
  assert.deepStrictEqual(r.result, [115, 1, true, 0, 1]);
  // the Pit's shop: a free handful once a day, the ads only after it, Essence for gems so many times a day
  r = await withProfile(Object.assign({}, p0, { essence: 0 }), live, (DH) => [DH.actions.list.claimPitFree.run({}), DH.actions.list.claimPitFree.run({}), DH.meta.pitAdsLeft()]);
  assert.ok(r.result[0] && r.result[1] === null); assert.strictEqual(r.result[2], 3); assert.strictEqual(r.profile.essence, 150);
  // an Essence pack bought with real money
  r = await withProfile(r.profile, live, (DH) => { DH.meta.fulfillProduct('ess_3', true); return DH.meta.essence(); });
  assert.strictEqual(r.result, 150 + 27000);
  // the Constellation, shaken: a thousand random raises and lowerings (some with all that hangs on them), and after each
  // the tree holds together, every point is paid for at its price and no Essence is made or lost
  r = await withProfile(Object.assign({}, p0, { essence: 3e7 }), live, (DH) => {
    const M = DH.meta, L = DH.actions.list, CS = DH.economy.CONST, B = CS.byId, start = 3e7; let sd = 99; const rnd = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    const bad = [];
    const check = (k) => {
      const c = DH.save.data.cons, r = c.r, full = (x) => x === 'heart' || (r[x] || 0) >= B[x].max, seen = new Set(['heart']), q = ['heart'];
      while (q.length) { const x = q.pop(); for (const a of B[x].adj) if (!seen.has(a) && full(a)) { seen.add(a); q.push(a); } }
      for (const x in r) { if (!(r[x] > 0) || r[x] > B[x].max) bad.push(k + ' rank ' + x); if (!B[x].adj.some((a) => seen.has(a))) bad.push(k + ' cut off ' + x); }
      let paid = 0; for (const b in CS.branches) paid += CS.spentIn(M.consPoints(b));
      if (paid !== c.spent) bad.push(k + ' spent ' + c.spent + ' vs ' + paid);
      if (M.essence() + c.spent !== start) bad.push(k + ' essence ' + (M.essence() + c.spent));
    };
    let ups = 0, downs = 0, cascades = 0, refused = 0;
    for (let k = 0; k < 1000; k++) {
      if (rnd() < 0.6) { const open = CS.nodes.filter((x) => x.b && M.consOpen(x.id)); if (open.length) { L.consBuy.run({ id: open[rnd() * open.length | 0].id, n: 1 + (rnd() * 5 | 0) }); ups++; } }
      else {
        const has = Object.keys(DH.save.data.cons.r); if (!has.length) continue;
        const id = has[rnd() * has.length | 0], n = M.consLowerCost(id), all = rnd() < 0.7;
        const res = L.consLower.run({ id, all });
        if (n > 1 && !all) { if (res !== null) bad.push(k + ' lowered without asking'); refused++; } else { downs++; if (n > 1) cascades++; if (!res || res.n !== n) bad.push(k + ' lowered ' + (res && res.n) + ' of ' + n); }
      }
      check(k); if (bad.length) break;
    }
    return { bad: bad.slice(0, 5), ups, downs, cascades, refused };
  });
  assert.deepStrictEqual(r.result.bad, [], 'the Constellation holds together'); console.log('constellation shaken:', JSON.stringify(r.result)); assert.ok(r.result.cascades > 5 && r.result.refused > 0, JSON.stringify(r.result));
  // the pass: a level for gems (500 for the first, 20 more each), the premium pass gives a Pit entry a day, Essence on the tracks
  r = await withProfile(Object.assign({}, p0, { gems: 2000 }), live, (DH) => { const L = DH.actions.list, M = DH.meta; M.ensureSeason();
    const e0 = M.pitEntries(), a = L.buyPassTier.run({}), t1 = M.passTier(), g1 = DH.save.data.gems; L.buyPassTier.run({}); const g2 = DH.save.data.gems;
    DH.save.data.pass.premium = true; return [a, t1, 2000 - g1, g1 - g2, M.pitEntries() - e0, DH.economy.passTierCost(13), DH.economy.passRewards.free[6].essence > 0, DH.economy.passRewards.prem[6].essence > 0]; });
  assert.deepStrictEqual(r.result, [true, 1, 500, 520, 1, 740, true, true]);
  // Shop → Free: gold for an ad, 1000 / 2000 / 3000 a day, then none
  r = await withProfile(p0, live, async (DH) => { const L = DH.actions.list, g = []; for (let i = 0; i < 4; i++) { const g0 = DH.save.data.gold; await L.adGold.run({}); g.push(DH.save.data.gold - g0); } return g; });
  assert.deepStrictEqual(r.result, [1000, 2000, 3000, 0], 'gold for ads');
  // Daily deals: one for an ad (never the retired gold one), six bought ones (at least one for gold, two for gems, one per group)
  r = await withProfile(Object.assign({}, p0, { gems: 5000, gold: 100000 }), live, async (DH) => { const E = DH.economy, d = DH.meta.ensureDaily();
    const defs = d.deals.map((x) => E.dealPool[x.i]), paid = defs.filter((x) => !x.cost.ad), grps = paid.map((x) => x.grp).filter(Boolean);
    const bought = []; for (let i = 0; i < d.deals.length; i++) bought.push(!!(await DH.actions.list.buyDeal.run({ idx: i })));
    return [defs.filter((x) => x.cost.ad && !x.off).length, defs.some((x) => x.off), paid.length, paid.filter((x) => x.cost.gold).length >= 1, paid.filter((x) => x.cost.gems).length >= 2, new Set(grps).size === grps.length, bought.every(Boolean)];
  });
  assert.deepStrictEqual(r.result, [1, false, 6, true, true, true, true], 'daily deals');
  // a day dealt before the second row (the gold-for-ad deal, three bought ones) gets three more, and the retired one cannot be bought
  r = await withProfile(p0, live, async (DH) => { const d = DH.meta.ensureDaily(); d.deals = [{ i: 0, bought: false }, { i: 3, bought: false }, { i: 5, bought: false }, { i: 13, bought: false }];
    const n = DH.meta.ensureDaily().deals.length, n2 = DH.meta.ensureDaily().deals.length; return [n, n2, await DH.actions.list.buyDeal.run({ idx: 0 })]; });
  assert.deepStrictEqual(r.result, [7, 7, null], 'old day gets the second row');
  // ---- the Dungeon (js/meta/dungeon.js)
  {
    const L = (DH) => DH.actions.list, back = (prof, ms) => { prof.dungeon.active.at -= ms; return prof; };
    // shut until the third hall is cleared
    r = await withProfile(p0, live, (DH) => L(DH).dunStart.run({ lv: 1 }));
    assert.strictEqual(r.result, null, 'dungeon locked');
    const p1 = Object.assign({}, p0, { cleared: { crypt: true, abyss: true, aqueduct: true }, gems: 2000 });
    r = await withProfile(p1, live, (DH) => [DH.meta.dunEntries(), L(DH).dunStart.run({ lv: 3 }), L(DH).dunStart.run({ lv: 1 })]);
    assert.strictEqual(r.result[0], 10); assert.strictEqual(r.result[1], null, 'no further than the best + 1');
    assert.strictEqual(r.result[2].lv, 1); assert.strictEqual(r.result[2].hall, 'crypt'); assert.deepStrictEqual(r.result[2].affixes, []);
    // a level cannot be won faster than its floors allow
    r = await withProfile(r.profile, live, (DH) => L(DH).dunEnd.run({ floors: 6, won: true, gold: 999999 }));
    assert.strictEqual(r.result.won, false, 'too fast: not won'); assert.strictEqual(r.result.floors, 0); assert.strictEqual(r.profile.dungeon.best, 0);
    // won the first time: gold, iron, quartz, a Gold chest and two Wooden, the best level, the board, the Mastery
    r = await withProfile(r.profile, live, (DH) => L(DH).dunStart.run({ lv: 1 }));
    const g0 = r.profile.gold, gear0 = r.profile.gear.length;
    r = await withProfile(back(r.profile, 300e3), live, (DH) => L(DH).dunEnd.run({ floors: 6, won: true, gold: 500 }));
    assert.strictEqual(r.result.won, true); assert.strictEqual(r.result.first, true); assert.strictEqual(r.result.record, true);
    assert.strictEqual(r.profile.dungeon.best, 1); assert.strictEqual(r.result.gear.length, 3, 'a Gold chest and two Wooden');
    assert.strictEqual(r.profile.gear.length - gear0, 3); assert.strictEqual(r.profile.gold - g0, 720 + 500);
    assert.strictEqual(r.profile.quartz, 15); assert.strictEqual(r.profile.mats.iron - p1.mats.iron, 4);
    assert.strictEqual(r.profile.dungeon.mxp, 25, '6 floors x 4 + level 1 x 1');
    assert.ok(r.profile.boards.best.dungeon__all && r.profile.boards.best.dungeon__all.score === 1, 'the Dungeon board');
    // again: one Wooden chest
    r = await withProfile(r.profile, live, (DH) => L(DH).dunStart.run({ lv: 1 }));
    r = await withProfile(back(r.profile, 300e3), live, (DH) => L(DH).dunEnd.run({ floors: 6, won: true, gold: 0 }));
    assert.strictEqual(r.result.first, false); assert.strictEqual(r.result.gear.length, 1); assert.strictEqual(r.profile.dungeon.used, 3);
    // the hazards: none below 20, one to 49, two to 99, three from 100; the same every time; the Seal keeps the Stalker out
    r = await withProfile(r.profile, live, (DH) => { const M = DH.meta; const a = [19, 20, 49, 50, 99, 100, 250].map((l) => M.dunAffixes(l).length);
      let stalker = 0; for (let l = 100; l < 400; l++) if (M.dunAffixes(l).includes('stalker')) stalker++;
      DH.save.data.dungeon.perks.seal = 1; let after = 0; for (let l = 100; l < 400; l++) if (M.dunAffixes(l).includes('stalker')) after++;
      return [a, M.dunAffixes(77).join() === M.dunAffixes(77).join(), stalker > 0, after, M.dunHall(8), M.dunHall(7)]; });
    assert.deepStrictEqual(r.result, [[0, 1, 1, 2, 2, 3, 3], true, true, 0, 'crypt', 'reliquary']);
    // vaults: rolled at the start, paid once each, five a day at most, kept even if the level is lost
    r = await withProfile(Object.assign({}, r.profile, { dungeon: Object.assign({}, r.profile.dungeon, { perks: {} }) }), live, (DH) => { DH.economy.DUNGEON.vaultChance = 1; return L(DH).dunStart.run({ lv: 2 }); });
    assert.strictEqual(r.result.vaults.length, 5, 'five a day'); assert.ok(r.result.kinds.every((k) => k === 'gold' || k === 'iron'));
    r = await withProfile(back(r.profile, 300e3), live, (DH) => { const out = []; for (const f of [0, 0, 1, 2, 3, 4, 5]) out.push(L(DH).dunVault.run({ floor: f })); return out.map((x) => (x ? x.kind : null)); });
    assert.strictEqual(r.result.filter(Boolean).length, 5); assert.strictEqual(r.result[1], null, 'once each'); assert.strictEqual(r.profile.dungeon.vaults, 5);
    r = await withProfile(r.profile, live, (DH) => [L(DH).dunEnd.run({ floors: 2, won: false, gold: 0 }), DH.economy.DUNGEON.vaultChance = 1, L(DH).dunStart.run({ lv: 2 })]);
    assert.strictEqual(r.result[0].won, false); assert.strictEqual(r.result[2].vaults.length, 0, 'no more vaults today');
    // one gem purchase a fight: a revive, or more time
    r = await withProfile(r.profile, live, (DH) => [L(DH).dunBuy.run({ what: 'revive' }), L(DH).dunBuy.run({ what: 'time' })]);
    assert.deepStrictEqual(r.result, [true, null]); assert.strictEqual(r.profile.gems, 1500);
    r = await withProfile(Object.assign({}, r.profile, { gems: 100 }), live, (DH) => { L(DH).dunEnd.run({ floors: 0 }); L(DH).dunStart.run({ lv: 1 }); return L(DH).dunBuy.run({ what: 'time' }); });
    assert.strictEqual(r.result, false, 'not enough gems'); assert.strictEqual(r.profile.gems, 100);
    // the sweep: half the best level's gold and quartz, half the experience, no chests
    r = await withProfile(r.profile, live, (DH) => { L(DH).dunEnd.run({ floors: 0 }); const q0 = DH.save.data.quartz, g = DH.save.data.gold, x = DH.save.data.dungeon.mxp, gear = DH.save.data.gear.length;
      const w = L(DH).dunSweep.run({ n: 2 }); return [w.n, DH.save.data.gold - g, DH.save.data.quartz - q0, DH.save.data.dungeon.mxp - x, DH.save.data.gear.length - gear]; });
    assert.deepStrictEqual(r.result, [2, 720, 16, 25, 0], 'sweep x2: 360 gold, 8 quartz, 2 x (24 + 1) x 0.5 experience');
    // the Leap: three entries clear three new levels at once (uncleared levels only)
    r = await withProfile(Object.assign({}, r.profile, { dungeon: Object.assign({}, r.profile.dungeon, { used: 0, perks: { leap: 2 } }) }), live, (DH) => [DH.meta.dunLeapMax(1), DH.meta.dunLeapMax(2), L(DH).dunStart.run({ lv: 2, n: 3 })]);
    assert.strictEqual(r.result[0], 1); assert.strictEqual(r.result[1], 3); assert.strictEqual(r.result[2].n, 3); assert.strictEqual(r.profile.dungeon.used, 3);
    r = await withProfile(back(r.profile, 600e3), live, (DH) => L(DH).dunEnd.run({ floors: 6, won: true }));
    assert.strictEqual(r.profile.dungeon.best, 4); assert.strictEqual(r.result.gear.length, 9, 'three first clears');
    // the boss's chest only within 120 levels of the best; the Jailer's Key: two more entries, kept through a reset, taken back for gems
    r = await withProfile(Object.assign({}, r.profile, { gems: 100, dungeon: Object.assign({}, r.profile.dungeon, { best: 200, perks: { key: 1, fury: 3 } }) }), live, (DH) => {
      const M = DH.meta, a = [M.dunBossLoot(79), M.dunBossLoot(80), M.dunEntries()]; M.dunPerkReset(); a.push(JSON.stringify(DH.save.data.dungeon.perks), M.dunPerkDown('key')); return a; });
    assert.deepStrictEqual(r.result, [false, true, 12, '{"key":1}', false]);
    // the gold picked up on the floors is capped by the level and the time
    r = await withProfile(r.profile, live, (DH) => DH.meta.dunRunGoldCap(10, 300));
    assert.strictEqual(r.result, 7000);
  }
  console.log('engine tests: all passed');
})().catch((e) => { console.error(e); process.exit(1); });
