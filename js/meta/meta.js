/* Meta progression: everything that happens outside a run. */
(function (DH) {
  'use strict';
  const U = DH.util, E = DH.economy, C = DH.content;
  const S = () => DH.save.data;
  const persist = () => DH.save.persist();
  const changed = () => { persist(); DH.events.emit('meta'); };

  const meta = {};

  /* ---------------- Currency ---------------- */
  meta.canAfford = (price) => {
    const s = S();
    if (!price) return true;
    if (price.gold && s.gold < price.gold) return false;
    if (price.gems && s.gems < price.gems) return false;
    return true;
  };
  meta.spend = (price) => {
    if (!meta.canAfford(price)) return false;
    const s = S();
    if (price.gold) s.gold -= price.gold;
    if (price.gems) { s.gems -= price.gems; s.stats.gemsSpent += price.gems; }
    changed();
    return true;
  };

  /* ---------------- Energy ---------------- */
  meta.energy = () => {
    const s = S(), now = U.now();
    if (s.energyTs > now) s.energyTs = now; // written while the clock ran ahead
    if (s.energy >= E.ENERGY_MAX) return s.energy; // the regen clock restarts in useEnergy when it drops below full
    const gained = Math.floor((now - s.energyTs) / E.ENERGY_REGEN_MS);
    if (gained > 0) {
      s.energy = Math.min(E.ENERGY_MAX, s.energy + gained);
      s.energyTs = s.energy >= E.ENERGY_MAX ? now : s.energyTs + gained * E.ENERGY_REGEN_MS;
      persist();
    }
    return s.energy;
  };
  meta.energyNextMs = () => {
    const s = S(); if (meta.energy() >= E.ENERGY_MAX) return 0;
    return E.ENERGY_REGEN_MS - (U.now() - s.energyTs);
  };
  /* ---------------- Tributes (the Reliquary) ---------------- */
  meta.tributes = () => (S().tributes || []).filter((id) => E.tributes[id]);
  meta.setTributes = (ids) => {
    const list = []; (Array.isArray(ids) ? ids : []).forEach((id) => { if (E.tributes[id] && !list.includes(id)) list.push(id); });
    S().tributes = list; changed(); return true;
  };
  /** A fight begins: its torches and, for the Reliquary, its tributes (at least one, paid in gold). false: not enough. */
  meta.beginRun = (energy) => {
    const s = S(), due = s.selectedStage === E.TRIBUTE_STAGE, list = due ? meta.tributes() : [], cost = E.tributesCost(list.length);
    if (due && (!list.length || s.gold < cost)) return false;
    if (!meta.useEnergy(energy)) return false;
    if (cost) meta.spend({ gold: cost });
    s.runTributes = list; changed();
    return true;
  };
  meta.useEnergy = (n) => { if (meta.energy() < n) return false; S().energy -= n; if (S().energy < E.ENERGY_MAX && S().energy + n >= E.ENERGY_MAX) S().energyTs = U.now(); changed(); return true; };
  meta.addEnergy = (n) => { meta.energy(); S().energy += n; changed(); };

  /* ---------------- Rewards ---------------- */
  /** Grants a reward object and returns display entries [{icon, text, rarity?}]. */
  meta.grant = (rw, opts) => {
    const s = S(), out = [];
    if (!rw) return out;
    if (rw.gold) { const g = Math.floor(rw.gold); s.gold += g; out.push({ icon: 'i_gold', text: '+' + U.fmt(g), kind: 'gold' }); }
    if (rw.gems) { s.gems += rw.gems; out.push({ icon: 'i_gem', text: '+' + U.fmt(rw.gems), kind: 'gems' }); }
    if (rw.energy) { meta.energy(); s.energy += rw.energy; out.push({ icon: 'i_energy', text: '+' + rw.energy, kind: 'energy' }); }
    if (rw.passXp) { meta.addPassXp(rw.passXp); out.push({ icon: 'n_pass', text: '+' + rw.passXp + ' ' + t('pass.xp'), kind: 'pass' }); }
    if (rw.accountXp) meta.addAccountXp(rw.accountXp);
    if (rw.hero) {
      if (s.heroes[rw.hero]) { s.gems += 300; out.push({ icon: 'i_gem', text: '+300', kind: 'gems' }); }
      else { s.heroes[rw.hero] = true; out.push({ icon: 'h_' + rw.hero, text: t('hero.' + rw.hero + '.name'), kind: 'hero' }); }
    }
    if (rw.gear) {
      const g = meta.createGear(rw.gear.rarity, rw.gear.type);
      out.push({ icon: 'g_' + g.type, text: t('gear.' + g.type), rarity: g.rarity, kind: 'gear', gear: g });
    }
    if (rw.chest) {
      const items = meta.openChestContents(rw.chest, 1);
      items.forEach((g) => out.push({ icon: 'g_' + g.type, text: t('gear.' + g.type), rarity: g.rarity, kind: 'gear', gear: g }));
    }
    changed();
    return out;
  };
  meta.rewardPreview = (rw) => {
    const out = [];
    if (rw.gold) out.push({ icon: 'i_gold', text: U.fmt(rw.gold) });
    if (rw.gems) out.push({ icon: 'i_gem', text: U.fmt(rw.gems) });
    if (rw.energy) out.push({ icon: 'i_energy', text: rw.energy });
    if (rw.passXp) out.push({ icon: 'n_pass', text: rw.passXp });
    if (rw.chest) out.push({ icon: E.chests[rw.chest].icon, text: t('chest.' + rw.chest) });
    if (rw.gear) out.push({ icon: 'g_wrath_amulet', text: t('rarity.' + E.rarities[rw.gear.rarity]), rarity: rw.gear.rarity });
    if (rw.hero) out.push({ icon: 'h_' + rw.hero, text: t('hero.' + rw.hero + '.name') });
    return out;
  };

  /* ---------------- Account level ---------------- */
  meta.addAccountXp = (n) => {
    const s = S(); s.accountXp += Math.floor(n);
    let leveled = false;
    while (s.accountXp >= E.accountXpNext(s.accountLevel)) {
      s.accountXp -= E.accountXpNext(s.accountLevel);
      s.accountLevel++;
      const rw = E.accountLevelReward(s.accountLevel);
      s.gems += rw.gems; s.gold += rw.gold;
      meta.pendingLevelUps = (meta.pendingLevelUps || []).concat([{ level: s.accountLevel, reward: rw }]);
      leveled = true;
    }
    if (leveled) DH.events.emit('accountLevel');
    persist();
  };

  /* ---------------- Player stats for a run ---------------- */
  meta.addStats = (acc, mods, mult) => {
    for (const k in mods) acc[k] = (acc[k] || 0) + mods[k] * (mult == null ? 1 : mult);
    return acc;
  };
  meta.baseStats = (heroId, runGear) => {
    const s = S(), hero = C.heroes[heroId];
    const st = { baseHp: hero.hp, baseSpeed: hero.speed, regen: hero.regen || 0, defense: hero.defense || 0, block: hero.block || 0,
      critBonus: 0.5, rerolls: 1, revives: 0 };
    meta.addStats(st, hero.bonus || {});
    for (const id in s.shrine) if (E.shrine[id]) meta.addStats(st, E.shrine[id].per, s.shrine[id]);
    const sup = (meta.artifactFx().suppress || 1); // Torment Suppressor weakens the Archive
    const arc = (s.archiveBy && s.archiveBy[heroId]) || {}, eqp = meta.eq(heroId); // this hero's own Archive and loadout
    for (const id in arc) if (E.archive[id]) { const n = arc[id], whole = 'count' in E.archive[id].per || 'rerolls' in E.archive[id].per; meta.addStats(st, E.archive[id].per, whole ? Math.floor(n * sup) : n * sup); }
    for (const slot of E.slots) {
      const g = (runGear && runGear[slot]) || meta.gearById(eqp[slot]);
      if (!g) continue;
      meta.addStats(st, E.gearStat(g.type, g.rarity, g.level));
      const sp = E.gearSpecial(g.type, g.rarity); if (sp) meta.addStats(st, sp);
    }
    const mk = eqp.mark;
    if (mk && C.heroes[mk] && meta.markUnlocked(mk)) meta.addStats(st, C.heroes[mk].mark);
    st.growth = (st.growth || 0) + meta.deedCount() * DH.deeds.XP_PER_DEED;
    st.deedXp = meta.deedCount() * DH.deeds.XP_PER_DEED; // Veil of Forgetting halves this part
    return st;
  };
  meta.powerScore = (heroId) => {
    const st = meta.baseStats(heroId || S().selectedHero), z = (k) => st[k] || 0;
    return Math.round(st.baseHp * 0.6 * (1 + z('dmgPct')) * (1 + z('maxHpPct')) * (1 + z('as')) * (1 + z('area') * 0.5) * (1 + z('critPct') * 0.3) * (1 + z('growth') * 0.2)
      + z('defense') * 300 + z('block') * 6 + z('regen') * 20 + z('revives') * 80 + z('addBase') * 8 + z('ms') * 120);
  };

  /* ---------------- Archivist (Lament Shards) ---------------- */
  /** Archive levels are per hero (default: the selected one). */
  meta.archiveOf = (hero) => { const s = S(); s.archiveBy = s.archiveBy || {}; hero = hero || s.selectedHero; return s.archiveBy[hero] || (s.archiveBy[hero] = {}); };
  meta.archiveLevel = (id, hero) => meta.archiveOf(hero)[id] || 0;
  meta.archiveSpent = (hero) => { const a = meta.archiveOf(hero); let n = 0; for (const id in a) if (E.archive[id]) for (let l = 0; l < a[id]; l++) n += E.archiveCost(id, l); return n; };
  /** Take back every shard a hero has assigned. */
  /** Lament Shards are a shared total: every hero may assign all of them to their own Archive. */
  meta.shardsFree = (hero) => Math.max(0, (S().shards || 0) - meta.archiveSpent(hero));
  meta.resetArchive = (hero) => { const s = S(), n = meta.archiveSpent(hero); s.archiveBy[hero || s.selectedHero] = {}; changed(); return n; };
  meta.buyArchive = (id) => {
    const s = S(), def = E.archive[id], lvl = meta.archiveLevel(id);
    if (lvl >= def.max) return false;
    const cost = E.archiveCost(id, lvl);
    if (meta.shardsFree() < cost) return false;
    meta.archiveOf()[id] = lvl + 1; changed();
    return true;
  };
  meta.archiveAffordable = () => E.archiveOrder.some((id) => meta.archiveLevel(id) < E.archive[id].max && meta.shardsFree() >= E.archiveCost(id, meta.archiveLevel(id)));
  /* ---------------- Main quests ---------------- */
  meta.mainQuest = () => {
    const s = S(), q = E.mainQuests[s.mainQuest];
    if (!q) return null;
    return { idx: s.mainQuest, deed: DH.deeds.byId[q[0]], gems: q[1], done: !!s.deeds[q[0]] };
  };
  meta.claimMainQuest = () => {
    const q = meta.mainQuest(); if (!q || !q.done) return 0;
    const s = S(); s.gems += q.gems; s.mainQuest++; changed();
    return q.gems;
  };

  /* ---------------- Shrine ---------------- */
  meta.shrineLevel = (id) => S().shrine[id] || 0;
  /** A Blessing with an 'unlock' deed stays sealed until that deed is done (levels already bought keep working). */
  meta.shrineUnlocked = (id) => !E.shrine[id].unlock || meta.deedDone(E.shrine[id].unlock);
  meta.buyShrine = (id) => {
    const lvl = meta.shrineLevel(id), def = E.shrine[id];
    if (lvl >= def.max || !meta.shrineUnlocked(id)) return false;
    if (!meta.spend({ gold: E.shrineCost(id, lvl) })) return false;
    S().shrine[id] = lvl + 1;
    meta.track('upgrade', 1);
    changed();
    return true;
  };
  meta.shrineTotal = () => Object.values(S().shrine).reduce((a, b) => a + b, 0);

  /* ---------------- Heroes ---------------- */
  meta.heroOwned = (id) => { const h = C.heroes[id]; return !!S().heroes[id] || !!h.unlock.free || (h.unlock.deed && meta.deedDone(h.unlock.deed)); };
  meta.unlockHero = (id) => {
    const h = C.heroes[id], s = S();
    if (meta.heroOwned(id)) { s.heroes[id] = true; return true; }
    const price = h.unlock.gold ? { gold: h.unlock.gold } : h.unlock.gems ? { gems: h.unlock.gems } : null;
    if (!price || !meta.spend(price)) return false;
    s.heroes[id] = true; changed();
    return true;
  };

  /* ---------------- Gear ---------------- */
  meta.gearById = (id) => (id == null ? null : S().gear.find((g) => g.id === id) || null);
  /* ---------- per-hero loadouts (gear + Mark) ---------- */
  const EMPTY_LOADOUT = () => ({ head: null, neck: null, chest: null, hands: null, feet: null, ring1: null, ring2: null, mark: null });
  /** The equipment of a hero (default: the selected one). A new hero starts with a copy of the current loadout. */
  meta.eq = (hero) => {
    const s = S(); hero = hero || s.selectedHero; s.loadouts = s.loadouts || {};
    if (!s.loadouts[hero]) s.loadouts[hero] = Object.assign(EMPTY_LOADOUT(), s.loadouts[s.selectedHero] || {});
    return s.loadouts[hero];
  };
  /** Remove a gear id from every hero's loadout (it was merged or sold). */
  meta.unequipEverywhere = (id) => { const s = S(); for (const h in s.loadouts || {}) E.slots.forEach((sl) => { if (s.loadouts[h][sl] === id) s.loadouts[h][sl] = null; }); };
  meta.equippedItem = (slot) => meta.gearById(meta.eq()[slot]);
  meta.slotsFor = (type) => (E.gear[type].slot === 'ring' ? ['ring1', 'ring2'] : [E.gear[type].slot]);
  meta.createGear = (rarity, type) => {
    const s = S();
    const g = { id: s.nextGearId++, type: type || meta.rollItemType(), rarity: U.clamp(rarity | 0, 0, 5), level: 1, isNew: true };
    s.gear.push(g); s.discovered[g.type] = true;
    const eqp = meta.eq(), free = meta.slotsFor(g.type).find((sl) => eqp[sl] == null);
    if (free) eqp[free] = g.id;
    return g;
  };
  meta.isEquipped = (id) => { const eqp = meta.eq(); return E.slots.some((sl) => eqp[sl] === id); };
  meta.equip = (id, slot) => {
    const g = meta.gearById(id); if (!g) return;
    const s = S(), slots = meta.slotsFor(g.type);
    const eqp = meta.eq();
    slots.forEach((sl) => { if (eqp[sl] === id) eqp[sl] = null; });
    const target = slot && slots.includes(slot) ? slot : (slots.find((sl) => eqp[sl] == null) || slots[0]);
    eqp[target] = id; g.isNew = false; changed();
  };
  meta.unequip = (slot) => { meta.eq()[slot] = null; changed(); };
  meta.unequipItem = (id) => { const eqp = meta.eq(); E.slots.forEach((sl) => { if (eqp[sl] === id) eqp[sl] = null; }); changed(); };
  meta.gearMaxLevel = (g) => E.rarityMaxLevel[g.rarity];
  meta.levelGear = (id) => {
    const g = meta.gearById(id); if (!g || g.level >= meta.gearMaxLevel(g)) return false;
    if (!meta.spend({ gold: E.gearLevelCost(g.rarity, g.level) })) return false;
    g.level++; meta.track('upgrade', 1); changed(); return true;
  };
  meta.mergeCandidates = (id) => {
    const g = meta.gearById(id); if (!g || g.rarity >= 5) return [];
    return S().gear.filter((o) => o.id !== id && o.type === g.type && o.rarity === g.rarity)
      .sort((a, b) => (meta.isEquipped(a.id) - meta.isEquipped(b.id)) || (a.level - b.level));
  };
  meta.merge = (id) => {
    const g = meta.gearById(id), c = meta.mergeCandidates(id);
    if (!g || c.length < 2) return false;
    const used = c.slice(0, 2), s = S();
    used.forEach((o) => { meta.unequipEverywhere(o.id); g.level = Math.max(g.level, o.level); });
    s.gear = s.gear.filter((o) => !used.includes(o));
    g.rarity++; s.stats.itemsMerged++;
    const eqp = meta.eq(), free = meta.slotsFor(g.type).find((sl) => eqp[sl] == null);
    if (free && !meta.isEquipped(g.id)) eqp[free] = g.id;
    changed();
    return true;
  };
  /** Merge everything that can merge, lowest first, until nothing can: what each merge made (type and new rarity). */
  meta.mergeAll = () => {
    const out = []; let again = true;
    while (again) {
      again = false;
      for (const g of S().gear.slice().sort((a, b) => a.rarity - b.rarity)) if (meta.gearById(g.id) && meta.mergeCandidates(g.id).length >= 2) { meta.merge(g.id); out.push({ id: g.id, type: g.type, rarity: g.rarity }); again = true; break; }
    }
    return out;
  };
  meta.salvageValue = (g) => Math.floor(80 * Math.pow(2.2, g.rarity) + (g.level - 1) * 40 * (1 + g.rarity * 0.6));
  meta.salvage = (id) => {
    const g = meta.gearById(id); if (!g) return 0;
    const s = S();
    meta.unequipEverywhere(id);
    s.gear = s.gear.filter((o) => o !== g);
    const v = meta.salvageValue(g); s.gold += v; changed();
    return v;
  };
  /** Loot type: items you have discovered but are NOT wearing are strongly preferred
   *  (unequip what you don't want before opening a chest to steer the drop). */
  meta.rollItemType = (runGear) => {
    const s = S(), table = {};
    const worn = new Set(E.slots.map((sl) => ((runGear && runGear[sl]) || meta.gearById(meta.eq()[sl]) || {}).type).filter(Boolean));
    E.gearOrder.forEach((t) => { table[t] = s.discovered[t] ? (worn.has(t) ? 1 : 6) : 1.5; });
    return U.weighted(table);
  };
  /** Rarity from the loot score (Dread Rank + Agony + stage + boss). Above 18 (champion) / 23 (boss) the best rarity is guaranteed. */
  meta.rollItemRarity = (score, boss) => {
    const top = boss ? 5 : 4;
    if (score > (boss ? 23 : 18)) return top;
    const base = Math.min(top, Math.floor(score / 5)); // the boss bonus is part of the score
    const r = Math.random();
    return U.clamp(r < 0.55 ? base : r < 0.85 ? base + 1 : r < 0.97 ? base - 1 : base + 2, 0, top);
  };
  meta.slotForRun = (type, runGear) => {
    const slots = meta.slotsFor(type);
    if (slots.length === 1) return slots[0];
    const eqp = meta.eq(), cur = slots.map((sl) => (runGear[sl] || meta.gearById(eqp[sl])));
    if (!cur[0]) return slots[0]; if (!cur[1]) return slots[1];
    return cur[0].rarity <= cur[1].rarity ? slots[0] : slots[1];
  };

  /* ---------------- Marks ---------------- */
  meta.markUnlocked = (hero) => meta.deedDone('d_mark_' + hero);
  meta.equipMark = (hero) => { meta.eq().mark = hero; changed(); };

  /* ---------------- Wellkeeper ---------------- */
  meta.wellClaim = (idx, withGems) => {
    const s = S(), it = s.wellkeeper[idx]; if (!it) return null;
    const price = withGems ? { gems: E.wellGems(it.rarity) } : { gold: E.wellPrice(it.rarity) };
    if (!meta.spend(price)) return null;
    s.wellkeeper.splice(idx, 1);
    const g = meta.createGear(it.rarity, it.type);
    changed();
    return g;
  };

  /* ---------------- Apothecary ---------------- */
  meta.potionUnlocked = (k) => meta.deedDone(E.potions[k].unlock);
  meta.canBrew = (k) => {
    const s = S(), p = E.potions[k];
    if (!meta.potionUnlocked(k) || s.gold < p.gold) return false;
    for (const h in p.recipe) if ((s.herbs[h] || 0) < p.recipe[h]) return false;
    return true;
  };
  meta.brew = (k) => {
    if (!meta.canBrew(k)) return false;
    const s = S(), p = E.potions[k];
    s.gold -= p.gold; for (const h in p.recipe) s.herbs[h] -= p.recipe[h];
    s.potions[k] = (s.potions[k] || 0) + 1; s.stats.brewed++;
    changed(); return true;
  };
  meta.buyPotion = (k) => { if (!meta.spend({ gems: E.potions[k].gems })) return false; S().potions[k] = (S().potions[k] || 0) + 1; changed(); return true; };

  /* ---------------- Altar of Anguish ---------------- */
  /* ---------------- Artifacts (Torment) ---------------- */
  meta.artifactUnlocked = (k) => { const a = E.artifacts[k]; return !!S().artifactsOwned[k] || (!!a.deed && meta.deedDone(a.deed)); };
  meta.artifactsOwnedCount = () => E.artifactOrder.filter(meta.artifactUnlocked).length;
  meta.toggleArtifact = (k) => { const s = S(); if (!meta.artifactUnlocked(k)) return; s.artifacts[k] = !s.artifacts[k]; changed(); };
  /** The Altar opens after the Chapter V Lord falls (saves that already own Artifacts keep it open). */
  /** Is this keeper of the camp free (rescued in their hall; profiles from before v8 have them all, see save.js)? */
  meta.npcFreed = (id) => { const s = S(); return !!(s.npcs && s.npcs[id]); };
  meta.altarUnlocked = () => meta.deedDone('d_stage_discord_win') || Object.keys(S().artifactsOwned).length > 0;
  meta.activeArtifacts = () => meta.altarUnlocked() ? E.artifactOrder.filter((k) => S().artifacts[k] && meta.artifactUnlocked(k)) : [];
  /** Torment Rank: one per active Artifact. */
  meta.dreadRank = () => meta.activeArtifacts().length;
  const FX_MULT = ['runLength', 'spawn', 'allSpeed', 'heal', 'enemyDmg', 'enemyHp', 'playerSpeed', 'enemySpeed', 'silver', 'apocrypha', 'deedXp'];
  /** Adds effects f to fx: factors multiply, the rest add up. */
  meta.addFx = (fx, f) => { for (const key in f) fx[key] = fx[key] == null ? f[key] : FX_MULT.includes(key) ? fx[key] * f[key] : fx[key] + f[key]; return fx; };
  meta.artifactFx = () => {
    const fx = {};
    meta.activeArtifacts().forEach((k) => meta.addFx(fx, E.artifacts[k].fx));
    if (fx.apocrypha) { // Apocryphal Tome: every penalty is 20% harsher
      const k = fx.apocrypha, worse = (v) => (v > 1 ? 1 + (v - 1) * k : v);
      ['spawn', 'enemyDmg', 'enemySpeed'].forEach((key) => { if (fx[key]) fx[key] = worse(fx[key]); });
      ['heal', 'deedXp', 'silver'].forEach((key) => { if (fx[key] && fx[key] < 1) fx[key] = 1 - (1 - fx[key]) * k; });
      if (fx.allSpeed && fx.allSpeed < 1) fx.allSpeed = 1 - (1 - fx.allSpeed) * k;
      ['burden', 'regret', 'scorch', 'targe', 'lessSlots'].forEach((key) => { if (fx[key]) fx[key] *= k; });
    }
    return fx;
  };
  meta.uncollectedGeneric = () => E.artifactOrder.filter((k) => E.artifacts[k].generic && !meta.artifactUnlocked(k)).length;
  /** Lord drop: the hall's own Artifact first (guaranteed), otherwise a Generic one with chance min(1, 0.6 + 0.015 x uncollected). */
  meta.rollArtifact = (stageId, heroId, taken, uncollectedAtStart) => {
    const free = (k) => !meta.artifactUnlocked(k) && !taken.includes(k);
    const hall = E.hallArtifact[stageId];
    if (hall && free(hall)) return hall;
    const pool = E.artifactOrder.filter((k) => { const a = E.artifacts[k]; return a.generic && free(k) && (!a.only || a.only === stageId) && (!a.hero || a.hero === heroId); });
    if (!pool.length || Math.random() >= Math.min(1, uncollectedAtStart * 0.015 + 0.6)) return null;
    return U.pick(pool);
  };

  /* ---------------- Abilities ---------------- */
  meta.abilityUnlocked = (id) => { const d = C.lockedAbilities[id]; return !d || meta.deedDone(d); };
  meta.abilityTraitUnlocked = (ab, idx) => idx < 2 || meta.deedDone('d_ab_' + ab + '_' + (idx - 1));

  /* ---------------- Deeds ---------------- */
  meta.deedDone = (id) => !!S().deeds[id];
  meta.deedCount = () => Object.keys(S().deeds).length;
  meta.deedProgress = (d) => {
    const s = S(), c = d.cond;
    if (c.type === 'abDmg') return { v: s.stats.abDmg[c.ab] || 0, n: c.n };
    if (c.type === 'stat') return { v: s.stats[c.stat] || 0, n: c.n };
    return null;
  };
  /** Live progress of a deed during a run (the pinned quest on the HUD): { v, n, time, here }.
   *  `here` is false when this run cannot count toward it (another hall or hero). */
  meta.deedLive = (d, run) => {
    const s = S(), c = d.cond, R = run, k = R.runLength / C.RUN_LENGTH, dmgAll = () => Object.values(R.dmgByAb).reduce((a, b) => a + b, 0);
    let here = (!c.stage || c.stage === R.stageId) && (!c.hero || c.hero === R.heroId);
    const yes = (b) => ({ v: b ? 1 : 0, n: 1 });
    let o;
    switch (c.type) {
      case 'survive': case 'adept': case 'heathen': case 'direct': o = { v: R.time, n: c.t * k, time: true }; break;
      case 'win': case 'heroWin': o = yes(R.state === 'victory'); break;
      case 'agony': case 'mark': here = here && R.agonyOn; o = { v: Math.floor(R.maxAgony + 1e-6), n: c.a }; break;
      case 'killsRun': o = { v: R.kills, n: c.n }; break;
      case 'boss': here = C.stages[R.stageId].bosses.some((b) => b.id === c.id); o = yes(R.bossesKilled.includes(c.id)); break;
      case 'heroLevel': case 'level': o = { v: R.level, n: c.n }; break;
      case 'abDmg': here = R.abilities.some((a) => a.id === c.ab); o = { v: (s.stats.abDmg[c.ab] || 0) + (R.dmgByAb[c.ab] || 0), n: c.n }; break;
      case 'stat': { const live = { kills: R.kills, tomes: R.tomes, wellSent: R.wellSent, eliteKills: R.eliteKills, championKills: R.championKills, oozes: R.oozes }[c.stat]; o = { v: (s.stats[c.stat] || 0) + (live || 0), n: c.n }; break; }
      case 'dread': here = R.dread >= c.n; o = yes(R.state === 'victory' && here); break;
      case 'secret': case 'secretBy': o = yes(R.secretT != null || (c.type === 'secret' && !!s.secrets[c.stage])); break;
      case 'dmgRun': o = { v: R.dmgTags()[c.tag] || 0, n: c.n }; break;
      case 'abRun': here = R.abilities.some((a) => a.id === c.ab); o = { v: R.dmgByAb[c.ab] || 0, n: c.n }; break;
      case 'crits': o = { v: R.crits || 0, n: c.n }; break;
      case 'dmgStage': o = { v: dmgAll(), n: c.n }; break;
      case 'abilitiesBy': o = { v: R.abilities.length, n: c.n }; break;
      case 'shardsRun': o = { v: R.shards || 0, n: c.n }; break;
      default: o = yes(false);
    }
    o.here = here; return o;
  };
  /** The quest pinned to the HUD (a deed id), or null once it is done. */
  meta.trackedDeed = () => { const id = S().trackedDeed, d = id && DH.deeds.byId[id]; return d && !S().deeds[id] ? d : null; };
  meta.trackDeed = (id) => { const s = S(); s.trackedDeed = s.trackedDeed === id ? null : id; changed(); return s.trackedDeed; };
  /** Evaluate deeds after a run (r = run summary). Returns newly completed deeds. */
  meta.checkDeeds = (r) => {
    const s = S(), done = [];
    for (const d of DH.deeds.list) {
      if (s.deeds[d.id]) continue;
      const c = d.cond; let ok = false;
      switch (c.type) {
        case 'survive': ok = r && r.stage === c.stage && r.time >= c.t * (r.runLength / C.RUN_LENGTH); break;
        case 'win': ok = r && r.victory && r.stage === c.stage; break;
        case 'agony': ok = r && r.victory && r.stage === c.stage && r.agony >= c.a; break;
        case 'killsRun': ok = r && r.kills >= c.n && (!c.stage || r.stage === c.stage); break;
        case 'boss': ok = r && r.bosses.includes(c.id); break;
        case 'heroLevel': ok = r && r.hero === c.hero && r.level >= c.n; break;
        case 'heroWin': ok = r && r.hero === c.hero && r.victory; break;
        case 'mark': ok = r && r.hero === c.hero && r.victory && r.stage === c.stage && r.agony >= c.a; break;
        case 'abDmg': ok = (s.stats.abDmg[c.ab] || 0) >= c.n; break;
        case 'level': ok = r && r.level >= c.n; break;
        case 'stat': ok = (s.stats[c.stat] || 0) >= c.n; break;
        case 'dread': ok = r && r.victory && r.dread >= c.n; break;
        case 'secret': ok = !!s.secrets[c.stage]; break;
        case 'dmgRun': ok = r && (r.dmgTags[c.tag] || 0) >= c.n; break;
        case 'abRun': ok = r && (r.dmgByAb[c.ab] || 0) >= c.n; break;
        case 'crits': ok = r && (r.crits || 0) >= c.n; break;
        case 'dmgStage': ok = r && r.stage === c.stage && Object.values(r.dmgByAb).reduce((a, b) => a + b, 0) >= c.n; break;
        case 'adept': { // survive with the main attack only: other abilities deal no damage
          if (!r || r.stage !== c.stage || r.time < c.t * (r.runLength / C.RUN_LENGTH)) break;
          const w = C.heroes[r.hero].weapon, tot = Object.values(r.dmgByAb).reduce((a, b) => a + b, 0);
          ok = tot > 0 && Object.entries(r.dmgByAb).every(([k, v]) => k === w || ['burn', 'spark', 'frost', 'decay'].includes(k) || v <= tot * 0.005); break; // effects of the main attack are fine
        }
        case 'secretBy': ok = r && r.stage === c.stage && r.secretT != null && r.secretT <= c.t * (r.runLength / C.RUN_LENGTH); break;
        case 'abilitiesBy': ok = r && r.stage === c.stage && r.abTimes && r.abTimes.length >= c.n && r.abTimes[c.n - 1] <= c.t * (r.runLength / C.RUN_LENGTH); break;
        case 'heathen': ok = r && r.time >= c.t * (r.runLength / C.RUN_LENGTH) && !['fire', 'ice', 'lightning'].some((tg) => (r.dmgTags[tg] || 0) > 0); break;
        case 'direct': ok = r && r.time >= c.t * (r.runLength / C.RUN_LENGTH) && !r.elemApplied; break;
        case 'shardsRun': ok = r && r.stage === c.stage && (r.shards || 0) >= c.n; break;
        default: break;
      }
      if (ok) { s.deeds[d.id] = U.now(); if (d.gold) s.gold += d.gold; done.push(d); }
    }
    if (done.length) changed();
    return done;
  };

  /* ---------------- Chests ---------------- */
  meta.rollRarity = (odds) => {
    const table = {}; odds.forEach((w, i) => { if (w > 0) table[i] = w; });
    return +U.weighted(table);
  };
  meta.openChestContents = (type, n) => {
    const s = S(), def = E.chests[type], out = [];
    for (let i = 0; i < n; i++) {
      let r = meta.rollRarity(def.odds);
      if (def.pity) {
        s.chestPity++;
        if (r >= 4) s.chestPity = 0;
        else if (s.chestPity >= def.pity) { r = 4; s.chestPity = 0; }
      }
      out.push(meta.createGear(r));
      s.stats.chestsOpened++;
    }
    meta.track('chest', n);
    changed();
    return out;
  };
  meta.buyChest = (type, x10) => {
    const def = E.chests[type];
    const price = x10 ? { gems: def.x10 } : def.price;
    if (!meta.spend(price)) return null;
    return meta.openChestContents(type, x10 ? 10 : 1);
  };
  meta.freeChestReadyIn = () => Math.max(0, S().freeChestTs + E.chests.wood.adEveryMs - U.now());
  meta.pityLeft = () => E.chests.gold.pity - S().chestPity;

  /* ---------------- Daily state ---------------- */
  meta.ensureDaily = () => {
    const s = S(), today = U.dayKey();
    if (s.daily && s.daily.day === today) return s.daily;
    const rng = U.seeded(U.strSeed(today + (s.created % 997)));
    const pool = U.shuffle(E.missionPool.slice(), rng).slice(0, E.MISSIONS_PER_DAY);
    const dealIdx = U.shuffle(E.dealPool.map((d, i) => i).filter((i) => i > 2), rng).slice(0, 3);
    s.daily = {
      day: today,
      missions: pool.map((m) => ({ id: m.id, p: 0, done: false, claimed: false })),
      bonusClaimed: false,
      ads: { energy: 0, vigil: 0, gems: 0 },
      quickVigilFree: true,
      deals: [U.randi(0, 2)].concat(dealIdx).map((i) => ({ i, bought: false })),
    };
    persist();
    return s.daily;
  };
  meta.missionDef = (id) => E.missionPool.find((m) => m.id === id);
  meta.track = (kind, amount, isMax) => {
    const d = meta.ensureDaily();
    let any = false;
    d.missions.forEach((m) => {
      const def = meta.missionDef(m.id);
      const k = def.stat || def.id;
      if (k !== kind || m.done) return;
      if (isMax) m.p = Math.max(m.p, amount); else m.p += amount;
      if (m.p >= def.target) { m.p = def.target; m.done = true; any = true; }
    });
    if (any) DH.events.emit('missionDone');
    persist();
  };
  meta.claimMission = (i) => {
    const d = meta.ensureDaily(), m = d.missions[i];
    if (!m || !m.done || m.claimed) return null;
    m.claimed = true;
    return meta.grant(meta.missionDef(m.id).reward);
  };
  meta.missionBonusReady = () => { const d = meta.ensureDaily(); return !d.bonusClaimed && d.missions.every((m) => m.claimed); };
  meta.claimMissionBonus = () => {
    if (!meta.missionBonusReady()) return null;
    meta.ensureDaily().bonusClaimed = true;
    return meta.grant(E.missionBonus);
  };

  /* ---------------- Achievements ---------------- */
  meta.achValue = (a) => {
    const s = S();
    switch (a.stat) {
      case 'heroesOwned': return C.heroOrder.filter((h) => meta.heroOwned(h)).length;
      case 'shrineLevels': return meta.shrineTotal();
      case 'stagesCleared': return Object.keys(s.cleared).length;
      default: return s.stats[a.stat] || 0;
    }
  };
  meta.achClaimed = (id) => S().achievements[id] || 0;
  meta.achClaimable = (a) => { const c = meta.achClaimed(a.id); return c < a.tiers.length && meta.achValue(a) >= a.tiers[c]; };
  meta.claimAch = (id) => {
    const a = E.achievements.find((x) => x.id === id);
    if (!a || !meta.achClaimable(a)) return null;
    const c = meta.achClaimed(id);
    S().achievements[id] = c + 1;
    return meta.grant({ gems: a.gems[c] });
  };

  /* ---------------- Season pass: a new season every calendar month ---------------- */
  // Season 1 is September 2026, each month after it the next (on the game clock, in the player's time zone)
  meta.seasonNow = () => { const d = new Date(U.now()); return (d.getFullYear() - 2026) * 12 + d.getMonth() - 8 + 1; };
  meta.seasonEndsIn = () => { const d = new Date(U.now()); return new Date(d.getFullYear(), d.getMonth() + 1, 1) - d; };
  /** A new month: what was earned and not taken is handed over (shown on the home screen), then the pass starts again. */
  meta.ensureSeason = () => {
    const s = S(), p = s.pass, cur = meta.seasonNow();
    if (!(p.season < cur)) return;
    let out = [];
    const reached = Math.min(E.PASS_TIERS, Math.floor(p.xp / E.PASS_XP_PER_TIER));
    for (let i = 1; i <= reached; i++) ['free', 'prem'].forEach((tr) => { if ((tr === 'free' || p.premium) && !p[tr][i]) { p[tr][i] = true; out = out.concat(meta.grant(E.passRewards[tr][i - 1])); } });
    if (out.length) meta.pendingSeason = { n: p.season, rewards: out };
    s.pass = { season: cur, xp: 0, premium: false, free: {}, prem: {} };
    changed();
  };
  meta.passTier = () => { meta.ensureSeason(); return Math.min(E.PASS_TIERS, Math.floor(S().pass.xp / E.PASS_XP_PER_TIER)); };
  meta.addPassXp = (n) => { meta.ensureSeason(); S().pass.xp = Math.min(S().pass.xp + Math.floor(n), E.PASS_TIERS * E.PASS_XP_PER_TIER); persist(); };
  meta.passClaimable = (tier, track) => {
    meta.ensureSeason();
    const p = S().pass;
    if (tier > meta.passTier()) return false;
    if (track === 'prem' && !p.premium) return false;
    return !p[track][tier];
  };
  meta.claimPass = (tier, track) => {
    if (!meta.passClaimable(tier, track)) return null;
    S().pass[track][tier] = true;
    return meta.grant(E.passRewards[track][tier - 1]);
  };
  meta.claimAllPass = () => {
    let out = [];
    for (let i = 1; i <= meta.passTier(); i++) ['free', 'prem'].forEach((tr) => { if (meta.passClaimable(i, tr)) out = out.concat(meta.claimPass(i, tr)); });
    return out;
  };
  meta.buyPassTier = () => {
    if (meta.passTier() >= E.PASS_TIERS) return false;
    if (!meta.spend({ gems: E.PASS_TIER_GEM_COST })) return false;
    const p = S().pass; p.xp = (meta.passTier() + 1) * E.PASS_XP_PER_TIER; changed();
    return true;
  };

  /* ---------------- Login calendar ---------------- */
  meta.checkLogin = () => {
    const s = S(), today = U.dayKey();
    if (s.login.lastDay !== today) {
      s.login.pendingDay = today;
      return true;
    }
    return false;
  };
  meta.loginPending = () => S().login.lastDay !== U.dayKey();
  meta.claimLogin = (double) => {
    const s = S(); if (!meta.loginPending()) return null;
    const rw = Object.assign({}, E.loginRewards[s.login.index % 7]);
    if (double) for (const k in rw) if (typeof rw[k] === 'number') rw[k] *= 2;
    s.login.lastDay = U.dayKey(); s.login.index++;
    s.stats.loginDays++;
    const out = meta.grant(rw);
    if (double && rw.chest) out.push(...meta.grant({ chest: rw.chest }));
    return out;
  };

  /* ---------------- Vigil (idle rewards) ---------------- */
  /** The Vigil opens once a hall has been cleared (the first victory); until then nothing piles up. */
  meta.vigilOpen = () => Object.keys(S().cleared).length > 0;
  meta.vigil = () => {
    const s = S(), r = E.vigilRates(Object.keys(s.cleared).length);
    if (!meta.vigilOpen()) return { ms: 0, gold: 0, xp: 0, full: false, rate: r, locked: true };
    const ms = Math.max(0, Math.min(E.VIGIL_CAP_MS, U.now() - s.vigil.ts)), mins = ms / 60000;
    return { ms, gold: Math.floor(r.goldPerMin * mins), xp: Math.floor(r.xpPerMin * mins), full: ms >= E.VIGIL_CAP_MS, rate: r };
  };
  meta.claimVigil = (double) => {
    const v = meta.vigil(); if (v.gold <= 0) return null;
    S().vigil.ts = U.now();
    return meta.grant({ gold: v.gold * (double ? 2 : 1), accountXp: v.xp });
  };
  meta.quickVigil = async (mode) => {
    if (!meta.vigilOpen()) return null;
    const d = meta.ensureDaily();
    if (mode === 'free') { if (!d.quickVigilFree) return null; d.quickVigilFree = false; }
    else if (mode === 'ad') { if (d.ads.vigil >= E.QUICK_VIGIL_ADS) return null; if (!(await DH.ads.rewarded('quick_vigil'))) return null; d.ads.vigil++; }
    else if (mode === 'gems') { if (!meta.spend({ gems: E.QUICK_VIGIL_GEMS })) return null; }
    const r = E.vigilRates(Object.keys(S().cleared).length), mins = E.QUICK_VIGIL_MS / 60000;
    return meta.grant({ gold: Math.floor(r.goldPerMin * mins), accountXp: Math.floor(r.xpPerMin * mins) });
  };

  /* ---------------- Products (IAP fulfilment) ---------------- */
  meta.productName = (id) => t('product.' + id);
  meta.fulfillProduct = (id, silent) => {
    const s = S(), p = E.products[id];
    let out = [];
    if (p.type === 'gems') {
      let n = p.gems;
      if (!s.purchases.firstGems[id]) { n *= 2; s.purchases.firstGems[id] = true; }
      out = meta.grant({ gems: n });
    } else if (p.type === 'bundle') { out = meta.grant(p.grant); }
    else if (p.type === 'noads') { s.purchases.noAds = true; out = [{ icon: 'n_ad', text: t('product.noads') }]; }
    else if (p.type === 'pass') { meta.ensureSeason(); S().pass.premium = true; // premium for the season it is bought in
      out = [{ icon: 'n_pass', text: t('pass.premiumOn') }]; }
    else if (p.type === 'sub') {
      s.purchases.soulUntil = Math.max(U.now(), s.purchases.soulUntil) + p.days * 86400e3;
      out = meta.grant(p.grant);
    }
    if (p.once) s.purchases.once[id] = true;
    s.purchases.total += p.price;
    changed();
    if (!silent) { DH.audio.play('buy'); DH.ui.rewardPopup(t('iap.thanks'), out); }
    return out;
  };
  meta.soulCardActive = () => S().purchases.soulUntil > U.now();
  meta.soulCardClaimable = () => meta.soulCardActive() && S().purchases.soulLastDay !== U.dayKey();
  meta.claimSoulCard = () => {
    if (!meta.soulCardClaimable()) return null;
    S().purchases.soulLastDay = U.dayKey();
    return meta.grant(E.products.soulcard.daily);
  };

  /* ---------------- Daily deals ---------------- */
  meta.buyDeal = async (idx) => {
    const d = meta.ensureDaily(), deal = d.deals[idx]; if (!deal || deal.bought) return null;
    const def = E.dealPool[deal.i];
    if (def.cost.ad) { if (!(await DH.ads.rewarded('deal'))) return null; }
    else if (!meta.spend(def.cost)) return null;
    deal.bought = true;
    return meta.grant(def.grant);
  };

  /* ---------------- Free gems / energy via ads ---------------- */
  meta.adGems = async () => {
    const d = meta.ensureDaily(); if (d.ads.gems >= E.FREE_GEM_ADS) return null;
    if (!(await DH.ads.rewarded('free_gems'))) return null;
    d.ads.gems++; return meta.grant({ gems: E.FREE_GEM_AMOUNT });
  };
  meta.adEnergy = async () => {
    const d = meta.ensureDaily(); if (d.ads.energy >= E.ENERGY_AD_LIMIT) return null;
    if (!(await DH.ads.rewarded('energy'))) return null;
    d.ads.energy++; return meta.grant({ energy: E.ENERGY_AD_AMOUNT });
  };
  meta.gemEnergy = () => { if (!meta.spend({ gems: E.ENERGY_GEM_COST })) return null; return meta.grant({ energy: E.ENERGY_GEM_AMOUNT }); };
  meta.freeChestAd = async () => {
    if (meta.freeChestReadyIn() > 0) return null;
    if (!(await DH.ads.rewarded('free_chest'))) return null;
    S().freeChestTs = U.now();
    return meta.openChestContents('wood', 1);
  };

  /* ---------------- Run settlement ---------------- */
  meta.settleRun = (r) => {
    const s = S(), st = C.stages[r.stage];
    const dk = 1 + r.dread * E.DREAD.gold;
    const timeBonus = Math.floor(r.time / 60 * 40 * st.goldMult * dk);
    const winBonus = r.victory ? Math.floor(1200 * st.goldMult * dk * (1 + r.agony * 0.3)) : 0;
    const gold = Math.floor(r.gold + timeBonus + winBonus);
    const res = {
      gold, goldRun: Math.floor(r.gold), timeBonus, winBonus,
      accountXp: Math.floor(r.kills / 6 + r.time / 8 + (r.victory ? 120 : 0)),
      passXp: Math.floor(15 + r.kills / 20 + (r.victory ? 120 : 0) + r.bossKills * 30),
      gems: 0, gear: [], firstClear: false,
    };
    if (r.victory) {
      if (!s.cleared[r.stage]) { res.firstClear = true; res.gems = 150 + st.index * 100; }
      if (!meta.vigilOpen()) { s.vigil.ts = U.now(); res.vigilOpened = true; } // the first victory opens the Vigil: it starts from now
      s.cleared[r.stage] = (s.cleared[r.stage] || 0) + 1;
      // boss trophy: one piece of gear, better odds on harder stages
      const odds = st.index === 0 ? [40, 40, 17, 3, 0, 0] : st.index === 1 ? [0, 45, 40, 13, 2, 0] : [0, 10, 50, 32, 7.5, 0.5];
      res.gear.push(meta.createGear(meta.rollRarity(odds)));
    }
    // stats
    s.stats.runs++; s.stats.kills += r.kills; s.stats.bossKills += r.bossKills; s.stats.eliteKills += r.eliteKills;
    s.stats.championKills += r.championKills || 0; s.stats.tomes += r.tomes || 0;
    s.stats.oozes += r.oozes || 0;
    res.shards = r.shards || 0;
    if (r.hexed && !s.secrets[r.stage]) { s.secrets[r.stage] = U.now(); s.stats.secrets++; res.secret = true; res.shards += C.HEX.firstShards; }
    if (r.rescued && C.RESCUE[r.stage] === r.rescued && !meta.npcFreed(r.rescued)) { s.npcs = s.npcs || {}; s.npcs[r.rescued] = U.now(); res.rescued = r.rescued; } // a keeper of the camp comes home
    s.shards += res.shards; s.stats.shardsEarned += res.shards;
    res.artifacts = (r.artifactsFound || []).filter((k) => !s.artifactsOwned[k]);
    res.artifacts.forEach((k) => { s.artifactsOwned[k] = U.now(); });
    for (const k in r.dmgByAb) if (C.abilities[k]) s.stats.abDmg[k] = (s.stats.abDmg[k] || 0) + Math.round(r.dmgByAb[k]);
    for (const k in r.herbs) s.herbs[k] = (s.herbs[k] || 0) + r.herbs[k];
    for (const k in r.potionsUsed) s.potions[k] = Math.max(0, (s.potions[k] || 0) - r.potionsUsed[k]);
    [r.wellSent].concat(r.wellExtra || []).forEach((w) => { if (!w) return; s.stats.wellSent++; s.wellkeeper.push({ type: w.type, rarity: w.rarity }); if (s.wellkeeper.length > E.WELL_MAX) s.wellkeeper.shift(); s.discovered[w.type] = true; });
    if (r.agonyOn) s.stats.maxAgony[r.stage] = Math.max(s.stats.maxAgony[r.stage] || 0, r.agony);
    if (r.victory) s.stats.wins++;
    s.stats.maxLevel = Math.max(s.stats.maxLevel, r.level);
    s.stats.playTime += r.time;
    s.stats.bestSurvival = Math.max(s.stats.bestSurvival, r.time);
    s.bestTime[r.stage] = Math.max(s.bestTime[r.stage] || 0, r.time);
    s.stats.goldEarned += gold;
    s.gold += gold; s.gems += res.gems;
    s.lastRun = { gold, doubled: false };
    meta.addAccountXp(res.accountXp);
    meta.addPassXp(res.passXp);
    // missions
    meta.track('kills', r.kills); meta.track('runs', 1); meta.track('survive', Math.floor(r.time), true);
    meta.track('level', r.level, true); meta.track('boss', r.bossKills); meta.track('gold', gold); meta.track('elites', r.eliteKills);
    meta.track('tomes', r.tomes || 0); meta.track('champions', r.championKills || 0);
    res.deeds = meta.checkDeeds(r);
    // event tokens: every running collect event takes its share of the run
    res.events = meta.liveEvents().filter(meta.eventCollecting).map((ev) => {
      const n = meta.eventTokensFor(ev, r); meta.eventState(ev).tokens += n;
      return { id: ev.id, n, icon: meta.eventIcon(ev), name: meta.loc(ev.token) };
    }).filter((e) => e.n > 0);
    meta.boardRecord(r, res);
    s.runsSinceAd++;
    changed();
    return res;
  };
  /* ---------------- Live events (live.json, type 'collect'): tokens from every run, spent in the event's shop ---------------- */
  const SHOP_GRACE_MS = 3 * 86400e3; // after the collecting ends, the shop stays open this long (unless shopEnd says otherwise)
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  /** A text from live.json in the player's language ({ bg, en }), English when missing. */
  meta.loc = (o) => (o && typeof o === 'object' ? o[DH.i18n.current] || o.en || '' : o || '');
  meta.eventEnd = (ev) => Date.parse(ev.end);
  meta.eventShopEnd = (ev) => Date.parse(ev.shopEnd || '') || meta.eventEnd(ev) + SHOP_GRACE_MS;
  /** Events that are collecting now, or whose shop is still open. */
  meta.liveEvents = () => {
    const now = U.now(), cfg = DH.live && DH.live.config;
    return ((cfg && cfg.events) || []).filter((ev) => ev && ev.type === 'collect' && ev.id && Array.isArray(ev.shop)
      && Date.parse(ev.start) <= now && now < meta.eventShopEnd(ev));
  };
  meta.eventCollecting = (ev) => U.now() < meta.eventEnd(ev);
  meta.eventIcon = (ev) => 'ev_' + (['candle', 'bone'].includes(ev.icon) ? ev.icon : 'candle');
  meta.eventState = (ev) => { const s = S(); s.events = s.events || {}; return s.events[ev.id] || (s.events[ev.id] = { tokens: 0, bought: {} }); };
  /** Tokens for one run: kills, minutes survived, bosses and a win, more in the harder halls (all tunable in live.json). */
  meta.eventTokensFor = (ev, r) => {
    const k = ev.earn || {}, st = C.stages[r.stage], idx = st ? st.index : 0;
    const base = r.kills * num(k.perKill, 0.01) + r.time / 60 * num(k.perMinute, 1.5) + r.bossKills * num(k.perBoss, 3) + (r.victory ? num(k.win, 15) : 0);
    return Math.max(0, Math.round(base * (1 + idx * num(k.perHall, 0.15)) * num(ev.rate, 1)));
  };
  meta.eventItemLeft = (ev, item) => (item.limit ? Math.max(0, item.limit - (meta.eventState(ev).bought[item.id] || 0)) : Infinity);
  meta.eventBuy = (ev, item) => {
    const st = meta.eventState(ev);
    if (meta.eventItemLeft(ev, item) <= 0 || st.tokens < item.cost) return null;
    st.tokens -= item.cost; st.bought[item.id] = (st.bought[item.id] || 0) + 1;
    return meta.grant(item.reward);
  };
  /** Shop items the player can buy right now, across the running events (the home badge). */
  meta.eventAffordable = () => meta.liveEvents().reduce((n, ev) => n + ev.shop.filter((it) => it && it.cost <= meta.eventState(ev).tokens && meta.eventItemLeft(ev, it) > 0).length, 0);
  /* ---------------- Leaderboards: which boards exist is set in live.json ('boards'), nothing here decides it ----------------
   * A board: { id, metric, mode: best|total, period: all|month|week|event, event (for period event), stage, hero, win,
   * start, end, name { bg, en } }. Scores live in boards/<id>__<period>/scores/<uid>; months and weeks count in UTC. */
  const pad2 = (n) => String(n).padStart(2, '0');
  /** How one run scores on a board. total boards add the runs up over the board's period. */
  const METRICS = {
    kills: (r) => r.kills, time: (r) => Math.floor(r.time), level: (r) => r.level, bosses: (r) => r.bossKills,
    gold: (r, res) => res.goldRun, wins: (r) => (r.victory ? 1 : 0), agony: (r) => (r.victory && r.agonyOn ? r.agony : 0),
    tokens: (r, res, b) => ((res.events || []).find((e) => e.id === b.event) || {}).n || 0,
  };
  meta.BOARD_METRICS = Object.keys(METRICS);
  meta.boardPeriodKey = (b) => {
    const d = new Date(U.now());
    if (b.period === 'month') return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1);
    if (b.period === 'week') { // ISO week: the week of the Thursday
      const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())), day = t.getUTCDay() || 7;
      t.setUTCDate(t.getUTCDate() + 4 - day);
      const w = Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
      return t.getUTCFullYear() + '-w' + pad2(w);
    }
    if (b.period === 'event') return String(b.event || 'event');
    return 'all';
  };
  meta.boardKey = (b) => (b.id + '__' + meta.boardPeriodKey(b)).replace(/[^A-Za-z0-9_-]/g, '-');
  /** The boards open now. An event board is open while its event is collecting. */
  meta.boards = () => {
    const cfg = DH.live && DH.live.config, now = U.now();
    return ((cfg && cfg.boards) || []).filter((b) => b && b.id && METRICS[b.metric]
      && !(b.start && now < Date.parse(b.start)) && !(b.end && now >= Date.parse(b.end))
      && (b.period !== 'event' || meta.liveEvents().some((ev) => ev.id === b.event && meta.eventCollecting(ev))));
  };
  const boardStore = () => { const s = S(); return s.boards || (s.boards = { best: {}, sent: {} }); };
  /** After a run: the player's best (or running total) on every open board the run counts for. */
  meta.boardRecord = (r, res) => {
    const bs = boardStore();
    for (const b of meta.boards()) {
      if ((b.stage && b.stage !== r.stage) || (b.hero && b.hero !== r.hero) || (b.win && !r.victory)) continue;
      const v = Math.floor(METRICS[b.metric](r, res, b) || 0); if (v <= 0) continue;
      const key = meta.boardKey(b), cur = bs.best[key], score = b.mode === 'total' ? (cur ? cur.score : 0) + v : v;
      if (!cur || score > cur.score) bs.best[key] = { score, hero: r.hero, stage: r.stage };
    }
  };
  /** Best scores not yet on their (open) boards, ready to send. */
  meta.boardPending = () => {
    const s = S(), bs = boardStore(), open = new Set(meta.boards().map(meta.boardKey));
    return Object.keys(bs.best).filter((k) => open.has(k) && bs.best[k].score > (bs.sent[k] || 0)).map((k) => ({
      key: k, entry: { name: (s.playerName || '').slice(0, 24) || '?', score: bs.best[k].score, hero: String(bs.best[k].hero || ''), stage: String(bs.best[k].stage || ''), ver: DH.VERSION } }));
  };
  meta.boardSent = (key, score) => { const bs = boardStore(); bs.sent[key] = Math.max(bs.sent[key] || 0, score); changed(); };
  meta.boardBest = (key) => boardStore().best[key] || null;
  /** A new name: the entries on the open boards are sent again, to carry it. */
  meta.boardRename = () => { const bs = boardStore(); meta.boards().forEach((b) => { const k = meta.boardKey(b); if (bs.best[k]) bs.sent[k] = 0; }); changed(); };
  /** Every board this profile ever scored on (to remove its entries with the account). */
  meta.boardKeysPlayed = () => Object.keys(boardStore().best);
  /** The run just settled pays its gold once more (after an ad); only the gold the profile recorded, and only once. */
  meta.doubleRunGold = () => { const s = S(), l = s.lastRun; if (!l || l.doubled) return 0; l.doubled = true; s.gold += l.gold; s.stats.goldEarned += l.gold; changed(); return l.gold; };
  /** Gold for gems (the shop's gold packs). */
  meta.buyGoldPack = (i) => { const p = E.goldPacks[i]; if (!p || !meta.spend({ gems: p.gems })) return null; return meta.grant({ gold: p.gold }); };
  /** A revive for gems during a fight: the price of the n-th one (0-based). */
  meta.reviveGems = (n) => { const cost = E.REVIVE_GEMS[n]; return cost != null && meta.spend({ gems: cost }); };
  /** The event shop by ids (as the server takes it): the event and the item come from live.json, never from the caller. */
  meta.eventBuyById = (eventId, itemId) => { const ev = meta.liveEvents().find((e) => e.id === eventId), it = ev && ev.shop.find((x) => x && x.id === itemId); return it ? meta.eventBuy(ev, it) : null; };
  /** The player's name: 3 to 16 letters, digits and a few marks; the first change after the first choice is free, then E.RENAME_GEMS. */
  meta.NAME_OK = /^[\p{L}\p{N}][\p{L}\p{N} _'.-]*$/u;
  meta.renameCost = (first) => (first ? 0 : (S().nameChanges || 0) >= 1 ? E.RENAME_GEMS : 0);
  meta.rename = (name, first) => {
    const s = S(), v = String(name || '').replace(/\s+/g, ' ').trim();
    if (v.length < 3 || v.length > 16 || !meta.NAME_OK.test(v)) return { error: 'bad' };
    first = !!first && !s.playerName; // only a profile without a name gets the opening choice
    if (!first && v === s.playerName) return { same: true };
    const cost = meta.renameCost(first);
    if (cost > 0 && !meta.spend({ gems: cost })) return { error: 'gems' };
    s.playerName = v; if (!first) s.nameChanges = (s.nameChanges || 0) + 1;
    meta.boardRename(); changed();
    return { ok: true };
  };

  /* ---------------- The Seven Nights (a newcomer event, see E.NEWBIE) ---------------- */
  const NB = E.NEWBIE;
  /** The event's state; it starts the first day a profile sees it and remembers each day the game was opened. */
  meta.newbie = () => {
    const s = S(), today = U.dayKey();
    if (!s.newbie) { s.newbie = { start: today, seen: [], claimed: {}, ms: {} }; persist(); }
    const nb = s.newbie;
    if (!nb.seen.includes(today) && U.daysBetween(nb.start, today) < NB.lengthDays) { nb.seen.push(today); persist(); }
    return nb;
  };
  /** Which night it is (1 on the first day); nights past the seventh only leave time to claim. */
  meta.nbDay = () => U.daysBetween(meta.newbie().start, U.dayKey()) + 1;
  meta.nbEndsIn = () => { const d = new Date(meta.newbie().start + 'T00:00:00'); d.setDate(d.getDate() + NB.lengthDays); return Math.max(0, d - U.now()); };
  meta.nbTaskId = (night, i) => 'n' + night + '_' + i;
  meta.nbSeals = () => { const c = meta.newbie().claimed; let n = 0; NB.tasks.forEach((list, d) => list.forEach((tk, i) => { if (c[meta.nbTaskId(d + 1, i)]) n += tk.s; })); return n; };
  /** What a task counts, from everything done so far. */
  meta.nbValue = (tk) => {
    const s = S(), st = s.stats;
    switch (tk.k) {
      case 'login': return meta.newbie().seen.length;
      case 'runs': return st.runs; case 'kills': return st.kills; case 'bosses': return st.bossKills; case 'elites': return st.eliteKills;
      case 'champions': return st.championKills || 0; case 'tomes': return st.tomes || 0; case 'wins': return st.wins; case 'brew': return st.brewed || 0;
      case 'merge': return st.itemsMerged; case 'chests': return st.chestsOpened; case 'ads': return st.adsWatched;
      case 'survive': return Math.floor(s.bestTime[tk.st] || 0);
      case 'clear': return s.cleared[tk.st] ? 1 : 0;
      case 'level': return st.maxLevel;
      case 'shrine': return meta.shrineTotal();
      case 'equip': { const eqp = meta.eq(); return E.slots.filter((sl) => eqp[sl] != null && meta.gearById(eqp[sl])).length; }
      case 'gearLv': return s.gear.reduce((m, g) => Math.max(m, g.level || 1), 0);
      case 'heroes': return meta.achValue({ stat: 'heroesOwned' });
      case 'acct': return s.accountLevel;
      case 'deeds': return meta.deedCount();
      case 'agony': return Object.values(st.maxAgony || {}).reduce((m, v) => Math.max(m, v), 0);
      default: return 0;
    }
  };
  meta.nbTask = (night, i) => {
    const tk = NB.tasks[night - 1][i], id = meta.nbTaskId(night, i), v = meta.nbValue(tk);
    return { tk, id, v: Math.min(v, tk.n), done: v >= tk.n, claimed: !!meta.newbie().claimed[id], open: meta.nbDay() >= night && meta.nbDay() <= NB.lengthDays };
  };
  const sealEntry = (n) => ({ icon: 'u_seal', text: '+' + n, kind: 'seals' });
  meta.nbClaimTask = (night, i) => {
    const x = meta.nbTask(night, i); if (!x.open || !x.done || x.claimed) return null;
    meta.newbie().claimed[x.id] = U.now();
    return [sealEntry(x.tk.s)].concat(meta.grant(x.tk.r));
  };
  meta.nbMilestoneReady = (i) => !meta.newbie().ms[i] && meta.nbSeals() >= NB.milestones[i].at && meta.nbDay() <= NB.lengthDays;
  meta.nbClaimMilestone = (i) => { if (!meta.nbMilestoneReady(i)) return null; meta.newbie().ms[i] = U.now(); return meta.grant(NB.milestones[i].r); };
  /** Tasks and track rewards waiting to be claimed. */
  meta.nbClaimable = (night) => {
    let n = 0;
    NB.tasks.forEach((list, d) => { if (night && night !== d + 1) return; list.forEach((tk, i) => { const x = meta.nbTask(d + 1, i); if (x.open && x.done && !x.claimed) n++; }); });
    if (!night) NB.milestones.forEach((m, i) => { if (meta.nbMilestoneReady(i)) n++; });
    return n;
  };
  /** Shown while its ten days last and something is left to claim. */
  meta.nbActive = () => {
    if (meta.nbDay() > NB.lengthDays) return false;
    const nb = meta.newbie();
    return NB.milestones.some((m, i) => !nb.ms[i]) || NB.tasks.some((list, d) => list.some((tk, i) => !nb.claimed[meta.nbTaskId(d + 1, i)]));
  };

  /* ---------------- Badges (red dots) ---------------- */
  meta.badges = () => {
    const d = meta.ensureDaily();
    const missions = d.missions.filter((m) => m.done && !m.claimed).length + (meta.missionBonusReady() ? 1 : 0);
    const ach = E.achievements.filter(meta.achClaimable).length;
    let pass = 0; for (let i = 1; i <= meta.passTier(); i++) { if (meta.passClaimable(i, 'free')) pass++; if (meta.passClaimable(i, 'prem')) pass++; }
    const shop = (meta.freeChestReadyIn() <= 0 ? 1 : 0) + (meta.soulCardClaimable() ? 1 : 0) + (d.ads.gems < E.FREE_GEM_ADS ? 0 : 0);
    const newGear = S().gear.filter((g) => g.isNew).length;
    let shrineAff = 0;
    E.shrineOrder.forEach((id) => { const l = meta.shrineLevel(id); if (l < E.shrine[id].max && meta.shrineUnlocked(id) && S().gold >= E.shrineCost(id, l)) shrineAff++; });
    const well = S().wellkeeper.length;
    if (meta.archiveAffordable()) shrineAff++;
    return { missions, ach, pass, quests: missions + ach + pass, login: meta.loginPending() ? 1 : 0, shop, gear: newGear + well, well, shrine: shrineAff, nights: meta.nbActive() ? meta.nbClaimable() : 0 };
  };

  DH.meta = meta;
})(window.DH);
