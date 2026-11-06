/* The Dungeon (Trials): its place in the profile, the day's entries, the levels, what a cleared level pays, the vaults,
 * the sweep and the Dungeon's own Mastery (E.DUNGEON, E.DUNGEON_MASTERY). Mixed into DH.meta; the server runs it too
 * (functions/engine.js), so every reward is decided there. */
(function (DH) {
  'use strict';
  const U = DH.util, E = DH.economy, M = DH.meta;
  const S = () => DH.save.data;
  const changed = () => { DH.save.persist(); DH.events.emit('meta'); };
  const D = () => E.DUNGEON, DM = () => E.DUNGEON_MASTERY;
  /** The Dungeon's part of the profile: the best level cleared, today's entries and vaults, the Mastery, the fight going on. */
  const dunS = () => {
    const s = S(); if (!s.dungeon || typeof s.dungeon !== 'object') s.dungeon = { best: 0, day: null, used: 0, vaults: 0, mxp: 0, perks: {}, active: null };
    const d = s.dungeon, day = U.dayKey(); if (d.day !== day) { d.day = day; d.used = 0; d.vaults = 0; }
    if (!d.perks || typeof d.perks !== 'object') d.perks = {};
    return d;
  };
  M.dunUnlocked = () => !!S().cleared[D().unlock];
  M.dunBest = () => dunS().best;
  M.dunActive = () => dunS().active;
  M.dunVaultsToday = () => dunS().vaults;

  /* ---------------- the Mastery ---------------- */
  M.dunMastery = () => { const d = dunS(); let lv = 1, xp = d.mxp || 0; for (let g = 0; lv < DM().max && xp >= DM().next(lv) && g < 1000; g++) { xp -= DM().next(lv); lv++; } return { lv, xp, next: lv < DM().max ? DM().next(lv) : 0 }; };
  M.dunPerk = (id) => (dunS().perks[id] || 0);
  M.dunPerkVal = (id) => M.dunPerk(id) * ((DM().perks[id] || {}).per || 0);
  M.dunPointsUsed = () => { const pk = dunS().perks; let n = 0; for (const id in pk) if (DM().perks[id]) n += pk[id] * DM().perks[id].cost; return n; };
  M.dunPointsFree = () => Math.max(0, M.dunMastery().lv - M.dunPointsUsed());
  M.dunPerkOpen = (id) => { const p = DM().perks[id]; return !!p && M.dunMastery().lv >= (p.lv || 1); };
  /** Can any card be raised now? (the Mastery button's badge) */
  M.dunCanRaise = () => { const f = M.dunPointsFree(); return Object.keys(DM().perks).some((id) => M.dunPerkOpen(id) && M.dunPerk(id) < DM().perks[id].max && f >= DM().perks[id].cost); };
  M.dunPerkUp = (id) => {
    const p = DM().perks[id], d = dunS(); if (!p || !M.dunPerkOpen(id) || M.dunPerk(id) >= p.max || M.dunPointsFree() < p.cost) return null;
    d.perks[id] = M.dunPerk(id) + 1; changed(); return d.perks[id];
  };
  M.dunPerkDown = (id) => {
    const d = dunS(), lv = M.dunPerk(id); if (!DM().perks[id] || lv <= 0) return null;
    if (id === 'key' && !M.spend({ gems: DM().keyRefund })) return false; // the Jailer's Key: taken back for gems only
    d.perks[id] = lv - 1; if (!d.perks[id]) delete d.perks[id]; changed(); return lv - 1;
  };
  /** Every point back (free), except the Jailer's Key, which stays. */
  M.dunPerkReset = () => { const d = dunS(), keep = d.perks.key; d.perks = keep ? { key: keep } : {}; changed(); return true; };
  const addXp = (x) => { const d = dunS(); d.mxp = (d.mxp || 0) + Math.round(x * (M.masteryPass() ? 2 : 1)); }; // the Mastery Pass: twice

  /* ---------------- entries, levels ---------------- */
  M.dunEntries = () => D().entries + M.dunPerkVal('key');
  M.dunLeft = () => Math.max(0, M.dunEntries() - dunS().used);
  /** The catacombs of a level: one hall after another (its floor, its foes, its boss). */
  M.dunHall = (lv) => D().halls[(Math.max(1, lv | 0) - 1) % D().halls.length];
  M.dunAffixCount = (lv) => { for (const [at, n] of D().affixAt) if (lv >= at) return n; return 0; };
  /** A level's hazards: the same every time (shown before entering), drawn from the Pit's; the Seal keeps the Stalker out. */
  M.dunAffixes = (lv) => {
    const n = M.dunAffixCount(lv); if (!n) return [];
    const pool = E.PIT.affixes.filter((k) => !(k === 'stalker' && M.dunPerk('seal')));
    return U.shuffle(pool.slice(), U.seeded(U.strSeed('dungeon-' + lv))).slice(0, n);
  };
  /** How many levels one fight can clear at once (the Leap: 2-5 entries for as many levels, uncleared levels only). */
  M.dunLeapMax = (lv) => (lv > dunS().best ? 1 + M.dunPerk('leap') : 1);
  /** What a cleared level pays (first: the first time it is cleared). */
  M.dunReward = (lv, first) => ({
    gold: D().gold(lv), mats: { iron: Math.round(D().iron(lv) * (1 + M.dunPerkVal('share'))) }, quartz: D().quartz(lv), accountXp: D().acctXp(lv),
    chests: first ? D().chestsFirst : D().chestsAgain,
  });
  /** Does the boss of a level drop its chest? Only within E.DUNGEON.bossLootWithin levels of the best cleared. */
  M.dunBossLoot = (lv) => lv >= dunS().best - D().bossLootWithin;
  M.dunVaultChance = () => (M.dunPerk('nose') ? D().vaultChance + M.dunPerkVal('nose') : D().vaultChance);
  /** Gold a fight can pick up on its floors (coins, the Gilded Ooze in a vault): at most this much, by the level and the time. */
  M.dunRunGoldCap = (lv, secs) => Math.round((300 + 30 * lv) * Math.max(1, secs) / 60) + 4000;

  /** Enter a level (n entries at once with the Leap). The vaults are rolled here, on the server: on which floors, and of
   *  what kind (gold or iron; iron always with the Iron Bargain). { lv, n, hall, affixes, vaults, kinds, loot } */
  M.dunStart = (lv, n) => {
    const d = dunS(); lv = lv | 0; n = Math.max(1, Math.min(M.dunLeapMax(lv), n | 0 || 1));
    if (!M.dunUnlocked() || lv < 1 || lv > d.best + 1 || M.dunLeft() < n) return null;
    d.used += n;
    const floors = D().floors + 1, chance = M.dunVaultChance(), room = Math.max(0, D().vaultsPerDay - d.vaults), vaults = [];
    for (let f = 0; f < floors && vaults.length < room; f++) if (Math.random() < chance) vaults.push(f);
    const kinds = vaults.map(() => (M.dunPerk('deal') || Math.random() < 0.5 ? 'iron' : 'gold'));
    d.active = { at: U.now(), lv, n, affixes: M.dunAffixes(lv), vaults, kinds, paid: [], gems: null };
    M.track('dungeon', 1); changed();
    return { lv, n, hall: M.dunHall(lv), affixes: d.active.affixes, vaults, kinds, loot: M.dunBossLoot(lv) };
  };
  /** A vault's 30 seconds are over: it pays now (kept even if the level is lost), once, within the day's vaults. */
  M.dunVault = (floor) => {
    const d = dunS(), a = d.active; floor = floor | 0;
    if (!a || !a.vaults.includes(floor) || a.paid.includes(floor) || d.vaults >= D().vaultsPerDay) return null;
    if ((U.now() - a.at) / 1000 < floor * D().minFloorSecs) return null; // that floor cannot have been reached yet
    a.paid.push(floor); d.vaults++;
    const kind = a.kinds[a.vaults.indexOf(floor)], rw = kind === 'iron' ? { mats: { iron: D().vaultIron(a.lv) } } : { gold: D().vaultGold(a.lv) };
    const items = M.grant(rw); changed();
    return { kind, items };
  };
  /** One gem purchase a fight: a revive, or +60 s once the time is out (not both). */
  M.dunBuy = (what) => {
    const a = dunS().active; if (!a || a.gems) return null;
    const time = what === 'time';
    if (!M.spend({ gems: time ? D().buyGems : D().reviveGems })) return false;
    a.gems = time ? 'time' : 'revive'; changed(); return true;
  };
  /** The fight is over: floors cleared (the boss floor the last), won (the boss fell and the portal was taken), the gold
   *  picked up. A won level pays it (for each level of a Leap), the chests opened at once; the best level, the boards, the
   *  Mastery. { lv, n, floors, won, record, first, items, gear, best, mastery, deeds } */
  M.dunEnd = (floors, won, gold, quartz) => {
    const d = dunS(), a = d.active; if (!a) return null;
    d.active = null;
    const secs = Math.max(0, (U.now() - a.at) / 1000), all = D().floors + 1, best0 = d.best;
    floors = Math.max(0, Math.min(all, floors | 0, Math.floor(secs / D().minFloorSecs)));
    won = !!won && floors >= all;
    gold = Math.max(0, Math.min(Math.floor(+gold || 0), M.dunRunGoldCap(a.lv, secs)));
    quartz = M.dunPerk('seeker') ? Math.max(0, Math.min(Math.floor(+quartz || 0), Math.round(secs * 1.5))) : 0; // the Treasure Hunter's: only with its card, as much as the time allows
    const lv0 = M.dunMastery().lv, items = [], gear = [];
    let xp = floors * DM().xpFloor, first = false;
    if (won) {
      for (let i = 0; i < a.n; i++) {
        const lv = a.lv + i, f = lv > best0, rw = M.dunReward(lv, f); if (f) first = true;
        items.push(...M.grant({ gold: rw.gold, mats: rw.mats, quartz: rw.quartz, accountXp: rw.accountXp }));
        for (const k in rw.chests) gear.push(...M.openChestContents(k, rw.chests[k]));
        xp += lv * DM().xpLevel;
      }
      d.best = Math.max(d.best, a.lv + a.n - 1);
      M.boardRecord({ dunLevel: d.best, hero: S().selectedHero, stage: null, victory: true }, {}); // the Dungeon's boards: the best level
    }
    if (gold || quartz) items.push(...M.grant({ gold, quartz }));
    addXp(xp);
    const st = S().stats; st.dunFights = (st.dunFights || 0) + 1; if (won) st.dunWins = (st.dunWins || 0) + 1;
    const deeds = M.checkDeeds(null); changed();
    return { lv: a.lv, n: a.n, floors, won, record: d.best > best0, first, items, gear, best: d.best, mastery: M.dunMastery().lv - lv0, deeds };
  };
  /* the sweep: a share of the best level's gold and Dark Quartz, without fighting (no chests, no relics, no vaults), and
   * half the Mastery experience of clearing it */
  M.dunSweepShare = () => Math.min(1, D().sweep + M.dunPerkVal('guide'));
  M.dunSweepPay = () => { const b = dunS().best, sh = M.dunSweepShare(); return b > 0 ? { gold: Math.round(D().gold(b) * sh), quartz: Math.round(D().quartz(b) * sh) } : null; };
  M.dunSweep = (n) => {
    const d = dunS(), pay = M.dunSweepPay(); if (!M.dunUnlocked() || !pay || M.dunLeft() <= 0) return null;
    n = Math.max(1, Math.min(M.dunLeft(), n | 0 || 1));
    const lv0 = M.dunMastery().lv;
    d.used += n;
    const items = M.grant({ gold: pay.gold * n, quartz: pay.quartz * n });
    addXp(n * ((D().floors + 1) * DM().xpFloor + d.best * DM().xpLevel) * DM().sweepXp);
    M.track('dungeon', n); const deeds = M.checkDeeds(null); changed();
    return { items, n, mastery: M.dunMastery().lv - lv0, deeds };
  };
})(window.DH);
