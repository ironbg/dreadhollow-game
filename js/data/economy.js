/* Meta-game economy data: permanent upgrades, gear, chests, missions,
 * achievements, season pass, login calendar and store catalogue. */
(function (DH) {
  'use strict';
  const E = {};

  /* ---------- Shrine (permanent gold upgrades) ---------- */
  E.shrine = {
    might:    { icon: 'fistup',    per: { dmgPct: 0.05 },   cost: [1350, 1800, 2550, 3600, 5100, 6900, 9600, 13200, 18300, 25500], unlock: 'd_level_30' },
    vitality: { icon: 'heart',     per: { maxHpPct: 0.08 }, cost: [1200, 1500, 2100, 3000, 4200, 5700, 8100, 11100, 15300, 21300] },
    armor:    { icon: 'hide',      per: { defense: 0.02 },  cost: [2700, 4500, 7200, 11700, 18900] },
    fortitude:{ icon: 'shield',    per: { block: 1.5 },     cost: [3300, 5100, 8400, 13500, 21900], unlock: 'd_stage_crypt_s8' },
    recovery: { icon: 'cross',     per: { regen: 0.2 },     cost: [2250, 3600, 5400, 8100, 12600], unlock: 'd_brew_1' },
    swiftness:{ icon: 'boot',      per: { speedPct: 0.04 }, cost: [1800, 2700, 4200, 6600, 9900] },
    haste:    { icon: 'hourglass', per: { as: 0.03 },       cost: [3300, 5100, 7800, 12600, 19800], unlock: 'd_kills_run_1000' },
    reach:    { icon: 'rings',     per: { area: 0.05 },     cost: [2250, 3600, 5400, 8100, 12600] },
    magnet:   { icon: 'magnet',    per: { pickup: 0.12 },   cost: [1350, 1950, 2850, 4200, 6000] },
    greed:    { icon: 'i_gold',    per: { greed: 0.08 },    cost: [1800, 2550, 3600, 5400, 7500, 10800, 15600, 22500, 33000, 45000], unlock: 'd_elites_50' },
    wisdom:   { icon: 't_wisdom',  per: { growth: 0.06 },   cost: [2250, 3600, 5400, 8100, 12600], unlock: 'd_tomes_20' },
    luck:     { icon: 'target',    per: { critPct: 0.05 },  cost: [2700, 4200, 6300, 9900, 15000], unlock: 'd_crits' },
    revival:  { icon: 'i_revive',  per: { revives: 1 },     cost: [27000, 54000], unlock: 'd_stage_crypt_s3' },
    reroll:   { icon: 'i_reroll',  per: { rerolls: 1 },     cost: [6900, 12000, 21900], unlock: 'd_champions_10' },
    echo:     { icon: 'tr_multistrike', per: { ms: 0.04 },  cost: [2400, 3900, 6300, 9900, 15600], unlock: 'd_level_50' },
    ferocity: { icon: 'tr_brutality',   per: { critBonus: 0.06 }, cost: [2100, 3300, 5100, 8100, 12600], unlock: 'd_stage_abyss_win' },
    sorcery:  { icon: 'tr_afflictor',   per: { effectPct: 0.06 }, cost: [2100, 3300, 5100, 8100, 12600], unlock: 'd_stage_aqueduct_win' },
    elements: { icon: 'tr_elementalist', per: { firePct: 0.06, icePct: 0.06, lightningPct: 0.06 }, cost: [2700, 4200, 6600, 10500, 16500], unlock: 'd_dmg_lightning' },
    brawn:    { icon: 'tr_honed',       per: { physPct: 0.08 }, cost: [2100, 3300, 5100, 8100, 12600], unlock: 'd_dmg_physical' },
    arcana:   { icon: 'tr_arcana',      per: { magicPct: 0.08 }, cost: [2100, 3300, 5100, 8100, 12600], unlock: 'd_dmg_magic' },
    plunder:  { icon: 'tr_plunder',      per: { chestDrop: 0.03 }, cost: [3600, 6000, 9600, 15000, 24000], unlock: 'd_elites_300' },
    scholar:  { icon: 'tr_scholar',      per: { tomeDrop: 0.1 }, cost: [3000, 4800, 7800, 12300, 19500], unlock: 'd_tomes_100' },
  };
  // unlock: the deed that opens a Blessing (as Blessings open with quests); the rest are open from the start
  E.shrineOrder = Object.keys(E.shrine);
  Object.values(E.shrine).forEach((d) => { d.max = d.cost.length; }); // one price per level: the level count follows the list
  E.shrineCost = (id, level) => E.shrine[id].cost[level];

  /* ---------- Gear: 7 slots, named items, 6 rarities ---------- */
  E.rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  E.rarityColor = ['#b8b2a7', '#5fd06a', '#4aa3ff', '#b366ff', '#ffb52e', '#ff4a4a'];
  E.rarityMult = [1, 1.5, 2.2, 3.2, 4.6, 6.5];
  E.rarityMaxLevel = [10, 15, 20, 30, 40, 50];
  E.slots = ['head', 'neck', 'chest', 'hands', 'feet', 'ring1', 'ring2'];
  E.slotOf = (type) => E.gear[type].slot === 'ring' ? 'ring' : E.gear[type].slot;
  E.gear = {
    gale_circlet:     { slot: 'head',  stats: { as: 0.02 },               special: { killAs: 0.004, killAsMax: 0.1 } },
    brawler_band:     { slot: 'head',  stats: { maxHpPct: 0.03 },         special: { eliteHeal: 0.06 } },
    warden_helm:      { slot: 'head',  stats: { defense: 0.025, block: 1 } },
    crimson_chalice:  { slot: 'neck',  stats: { dmgPct: 0.05 },           special: { killHealChance: 0.02 } },
    jade_talisman:    { slot: 'neck',  stats: { growth: 0.06 } },
    wrath_amulet:     { slot: 'neck',  stats: { dmgPct: 0.06 } },
    gore_tunic:       { slot: 'chest', stats: { maxHpPct: 0.04 },         special: { killHeal: 0.03 } },
    stalwart_cuirass: { slot: 'chest', stats: { defense: 0.03 },          special: { hitRegen: 1.5 } },
    stillhunter_garb: { slot: 'chest', stats: { critPct: 0.05 },          special: { stillDmg: 0.1 } },
    blazing_shell:    { slot: 'chest', stats: { firePct: 0.04 },          special: { thornBurn: 0.1 } },
    defiant_plate:    { slot: 'chest', stats: { defense: 0.02 },          special: { hitDefense: 0.01 } },
    stalker_grips:    { slot: 'hands', stats: { ms: 0.07 } },
    spark_gauntlets:  { slot: 'hands', stats: { firePct: 0.06 },          special: { fireSpark: 0.08 } },
    duelist_ember:    { slot: 'hands', stats: { critBonus: 0.08, addCrit: 0.015 } },
    tempo_treads:     { slot: 'feet',  stats: { as: 0.025, speedPct: 0.025 } },
    striders:         { slot: 'feet',  stats: { speedPct: 0.05 } },
    grave_walkers:    { slot: 'feet',  stats: { pickup: 0.12, regen: 0.15 } },
    oak_band:         { slot: 'ring',  stats: { addCrit: 0.02 } },
    bronze_loop:      { slot: 'ring',  stats: { critBonus: 0.08 } },
    steel_signet:     { slot: 'ring',  stats: { addBase: 1.5 } },
    infernal_pact:    { slot: 'ring',  stats: { summonPct: 0.05 },        special: { imps: 1 } },
    greed_signet:     { slot: 'ring',  stats: { greed: 0.06, growth: 0.02 } },
    aegis_ring:       { slot: 'ring',  stats: { block: 1.2 } },
    // Ability Signets: each allows extra upgrade picks (and one extra rank) for abilities of its element
    signet_flame:     { slot: 'ring',  stats: { firePct: 0.03 },          special: { sig_fire: 1 },      signet: 'fire' },
    signet_frost:     { slot: 'ring',  stats: { icePct: 0.03 },           special: { sig_ice: 1 },       signet: 'ice' },
    signet_storm:     { slot: 'ring',  stats: { lightningPct: 0.03 },     special: { sig_lightning: 1 }, signet: 'lightning' },
    signet_arcana:    { slot: 'ring',  stats: { magicPct: 0.03 },         special: { sig_magic: 1 },     signet: 'magic' },
    signet_steel:     { slot: 'ring',  stats: { physPct: 0.03 },          special: { sig_physical: 1 },  signet: 'physical' },
    signet_legion:    { slot: 'ring',  stats: { summonPct: 0.03 },        special: { sig_summon: 1 },    signet: 'summon' },
    // items that act on their own during a run (js/game/items.js); it_ specials are read by the run
    cinder_treads:     { slot: 'feet',  stats: { speedPct: 0.03 },       special: { it_firewalk: 5 } },
    storm_treads:      { slot: 'feet',  stats: { speedPct: 0.03 },       special: { it_stormstep: 5 } },
    spiked_boots:      { slot: 'feet',  stats: { defense: 0.015 },       special: { it_spikes: 5 } },
    mire_boots:        { slot: 'feet',  stats: { regen: 0.1 },           special: { it_goo: 1.2 } },
    frost_greaves:     { slot: 'feet',  stats: { icePct: 0.04 },         special: { it_frostaura: 0.1 } },
    pace_setter:       { slot: 'feet',  stats: { speedPct: 0.02 },       special: { it_pace: 0.06 } },
    plated_boots:      { slot: 'feet',  stats: { defense: 0.015, block: 0.8 } },
    shadow_cloak:      { slot: 'chest', stats: { block: 0.8 },           special: { it_shadow: 2 } },
    thunder_mantle:    { slot: 'chest', stats: { lightningPct: 0.04 },   special: { it_thunder: 5 } },
    brokers_cape:      { slot: 'chest', stats: { greed: 0.04 },          special: { it_broker: 0.08 } },
    frostbeast_hide:   { slot: 'chest', stats: { maxHpPct: 0.03 },       special: { it_beast: 16 } },
    toil_scars:        { slot: 'chest', stats: { maxHpPct: 0.03 },       special: { it_scars: 0.25 } },
    fervor_mail:       { slot: 'chest', stats: { defense: 0.02 },        special: { it_fervor: 1.5 } },
    blood_shirt:       { slot: 'chest', stats: { regen: 0.1 },           special: { it_bloodshirt: 0.1 } },
    chain_mail:        { slot: 'chest', stats: { defense: 0.02, maxHpPct: 0.03 } },
    war_horn:          { slot: 'neck',  stats: { dmgPct: 0.03 },         special: { it_warcry: 0.5 } },
    seal_rebirth:      { slot: 'neck',  stats: { regen: 0.1 },           special: { it_seal: 1 } },
    philosopher_stone: { slot: 'neck',  stats: { dmgPct: 0.015, as: 0.015, area: 0.015, critPct: 0.015, speedPct: 0.015 } },
    collar_confidence: { slot: 'neck',  stats: { defense: 0.01 },        special: { it_collar: 0.1 } },
    maiden_tear:       { slot: 'neck',  stats: { maxHpPct: 0.03 },       special: { it_tear: 1 } },
    gorgon_mask:       { slot: 'head',  stats: { effectPct: 0.03 },      special: { it_gorgon: 3 } },
    wind_crown:        { slot: 'head',  stats: { as: 0.015 },            special: { it_wind: 0.001 } },
    madness_mask:      { slot: 'head',  stats: { critPct: 0.03 },        special: { it_madness: 0.005 } },
    warchief_visor:    { slot: 'head',  stats: { defense: 0.015 },       special: { it_visor: 0.1 } },
    ruby_circlet:      { slot: 'head',  stats: { firePct: 0.03 },        special: { it_ruby: 0.15 } },
    thunder_crown:     { slot: 'head',  stats: { magicPct: 0.03 },       special: { it_tcrown: 5 } },
    necro_clutch:      { slot: 'hands', stats: { summonPct: 0.05 },      special: { it_skeletons: 1 } },
    longfinger_gloves: { slot: 'hands', stats: { pickup: 0.1, greed: 0.03 } },
    spellcaster_gloves:{ slot: 'hands', stats: { effectPct: 0.02 },      special: { it_spell: 0.06 } },
    frost_thorns:      { slot: 'hands', stats: { icePct: 0.03 },         special: { it_frostthorn: 3 } },
    unholy_touch:      { slot: 'hands', stats: { dmgPct: 0.02 },         special: { it_unholy: 0.15 } },
    leech_fingers:     { slot: 'hands', stats: { regen: 0.1 },           special: { it_leech: 0.3 } },
    hunting_gloves:    { slot: 'hands', stats: { ms: 0.05, critPct: 0.02 } },
    pest_ring:         { slot: 'ring',  stats: { summonPct: 0.03 },      special: { it_rats: 1.5 } },
    ring_ember:        { slot: 'ring',  stats: { firePct: 0.03 },        special: { wBurn: 0.1 } },
    ring_rime:         { slot: 'ring',  stats: { icePct: 0.03 },         special: { wFrost: 0.1 } },
    ring_storm:        { slot: 'ring',  stats: { lightningPct: 0.03 },   special: { wSpark: 0.1 } },
    ring_earth:        { slot: 'ring',  stats: { physPct: 0.03 },        special: { wDecay: 0.1 } },
    echo_band:         { slot: 'ring',  stats: { physPct: 0.03 },        special: { it_echoring: 0.1 } },
    blight_ring:       { slot: 'ring',  stats: { effectPct: 0.02 },      special: { it_blight: 0.1 } },
  };
  /** How an item special reads (and, for counts and times, what the run uses): base damage whole, counts and seconds
   *  derived from the rarity-scaled value; any other key is a share shown as a percent. */
  const whole = (v) => Math.round(v), tenth = (v) => Math.round(v * 10) / 10;
  E.ITEM_FMT = { it_firewalk: whole, it_stormstep: whole, it_spikes: whole, it_shadow: whole, it_thunder: whole, it_gorgon: whole, it_beast: whole, it_tcrown: whole, it_frostthorn: tenth,
    it_goo: tenth, it_fervor: tenth, it_leech: tenth,
    it_skeletons: (v) => Math.min(4, Math.floor(v + 1e-6)), it_rats: (v) => Math.min(6, Math.floor(v + 1e-6)), it_seal: (v) => (v >= 4.6 - 1e-6 ? 2 : 1), it_tear: (v) => Math.round(30 / (0.6 + 0.4 * v)) };
  E.itemCount = (k, v) => E.ITEM_FMT[k](v);

  /* ---------- Tributes: the Reliquary is entered only after paying at least one. Each is a pact: a boon for the fight
   * and a hardship (the same effects as the Artifacts' curses). Every further tribute costs more. ---------- */
  E.TRIBUTE_STAGE = 'reliquary';
  E.tributes = {
    shard:   { boon: { shards: 1 },       bane: { enemyHp: 1.3 } },
    scholar: { boon: { scrolls: 0.5 },    bane: { enemyDmg: 1.25 } },
    plunder: { boon: { eliteChest: 0.3 }, bane: { spawn: 1.25 } },
    insight: { boon: { xp: 0.3 },         bane: { darkness: 1 } },
    fortune: { boon: { gold: 0.5 },       bane: { magma: 1 } },
    relic:   { boon: { loot: 1 },         bane: { urn: 0.06 } },
    fury:    { boon: { dmg: 0.2 },        bane: { heal: 0.5 } },
    vigil:   { boon: { revives: 1 },      bane: { traps: 1 } },
  };
  E.tributeOrder = Object.keys(E.tributes);
  /** The price of the k-th tribute of one fight (0-based): 600, 1000, 1750, 2950, ... */
  E.tributeCost = (k) => Math.round(600 * Math.pow(1.7, k) / 50) * 50;
  E.tributesCost = (n) => { let c = 0; for (let k = 0; k < n; k++) c += E.tributeCost(k); return c; };
  E.gearOrder = Object.keys(E.gear);
  E.STARTER_GEAR = ['wrath_amulet', 'striders', 'oak_band', 'warden_helm', 'gore_tunic', 'tempo_treads'];
  E.gearStat = (type, rarity, level) => {
    const out = {}; const g = E.gear[type];
    for (const k in g.stats) out[k] = g.stats[k] * E.rarityMult[rarity] * (1 + 0.1 * (level - 1));
    return out;
  };
  E.gearSpecial = (type, rarity) => {
    const sp = E.gear[type].special; if (!sp) return null;
    const out = {}; for (const k in sp) out[k] = sp[k] * E.rarityMult[rarity];
    return out;
  };
  E.gearLevelCost = (rarity, level) => Math.floor(60 * Math.pow(level, 1.35) * (1 + rarity * 0.6) / 5) * 5;
  /* ---------- Forging materials: every level of an item costs gold and a material. The metal follows the level being
   * reached (to 10 iron, to 20 silver, to 30 gold, beyond that starsteel); the count grows within each ten and with the
   * rarity. They fall from elites, champions and bosses (the deeper the hall, the finer the metal) and come back from
   * salvaged items. ---------- */
  E.materials = ['iron', 'silver', 'gold', 'starsteel'];
  E.MAT_COLOR = { iron: '#9aa4ae', silver: '#dfe8f2', gold: '#ffcf4a', starsteel: '#8ab8ff' };
  /** The metal of a hall: iron in the first two, then silver, gold, and starsteel in the Reliquary. */
  E.MAT_HALL = { crypt: 0, abyss: 0, aqueduct: 1, catacombs: 1, discord: 2, blightmire: 2, reliquary: 3 };
  /** The material that lifts an item of this rarity from `level` to the next: { mat, n }. */
  E.gearMatCost = (rarity, level) => ({ mat: E.materials[Math.min(3, Math.floor(level / 10))], n: (1 + Math.floor((level % 10) / 3)) * (1 + Math.floor(rarity / 2)) });
  /** Level milestones: at these levels an item gains one more stat. It follows the slot, so every armour, every pair of
   *  boots, every pair of gloves grows the same way; its size grows with the rarity as the item's own stats do. */
  E.GEAR_MILESTONES = [10, 20, 30, 40];
  E.SLOT_MILESTONES = {
    chest: [['maxHpPct', 0.03], ['critBonus', 0.05], ['regen', 0.1], ['block', 0.6]],
    feet:  [['area', 0.03], ['chestDrop', 0.01], ['pickup', 0.1], ['regen', 0.1]],
    hands: [['addBase', 1], ['block', 0.6], ['as', 0.02], ['critBonus', 0.05]],
    head:  [['growth', 0.04], ['effectPct', 0.03], ['tomeDrop', 0.04], ['area', 0.03]],
    neck:  [['dmgPct', 0.025], ['maxHpPct', 0.03], ['greed', 0.04], ['as', 0.02]],
    ring:  [['growth', 0.03], ['as', 0.02], ['critPct', 0.02], ['greed', 0.04]],
  };
  /** The stats an item type gains at its milestones, in order: [{ lv, k, v }] (v before the rarity). */
  E.gearMilestoneDefs = (type) => E.SLOT_MILESTONES[E.gear[type].slot].map(([k, v], i) => ({ lv: E.GEAR_MILESTONES[i], k, v }));
  /** What an item's milestones give at this rarity and level (only those reached). */
  E.gearMilestones = (type, rarity, level) => {
    const out = {};
    for (const m of E.gearMilestoneDefs(type)) if (level >= m.lv) out[m.k] = (out[m.k] || 0) + m.v * E.rarityMult[rarity];
    return out;
  };
  /** A material drop in a run: the hall's metal, now and then one finer (by Torment Rank) or one coarser. */
  E.rollMat = (stage, dread, rnd) => {
    const r = rnd || Math.random;
    let t = E.MAT_HALL[stage] || 0;
    if (t > 0 && r() < 0.35) t--;
    else if (t < 3 && r() < 0.05 + 0.06 * (dread || 0)) t++;
    return E.materials[t];
  };
  E.MAT_RUN_MAX = 250; // the most of one material a run can bring home (the server checks it)
  /* Wellkeeper redemption price for items sent up the Well */
  E.wellPrice = (rarity) => [300, 700, 1600, 3500, 8000, 18000][rarity];
  E.wellGems = (rarity) => [10, 20, 40, 80, 150, 300][rarity];
  E.WELL_MAX = 12;

  /* ---------- Potions (Apothecary) & ingredients ---------- */
  E.herbs = ['moss', 'ember', 'lily', 'frostcap', 'nightshade'];
  // use: where it is drunk (level: on a level-up card; tome: rerolls a tome's abilities; chest: rerolls a chest's items)
  E.potions = {
    remembrance: { recipe: { moss: 3, lily: 2 }, gold: 500, gems: 40, unlock: 'd_boss_gravechief', use: 'level' },
    resonance:   { recipe: { ember: 3, moss: 2 }, gold: 800, gems: 60, unlock: 'd_stage_abyss_win', use: 'level' },
    lethe:       { recipe: { lily: 2, ember: 2 }, gold: 400, gems: 25, unlock: 'd_stage_crypt_win', use: 'level' },
    renewal:     { recipe: { frostcap: 3, moss: 2 }, gold: 600, gems: 45, unlock: 'd_stage_catacombs_win', use: 'tome' },
    visions:     { recipe: { nightshade: 3, lily: 2 }, gold: 700, gems: 50, unlock: 'd_stage_discord_win', use: 'chest' },
  };
  E.potionOrder = ['remembrance', 'resonance', 'lethe', 'renewal', 'visions'];
  E.POTION_USES_PER_RUN = 2;

  /* ---------- Altar of Anguish: artifacts raise the Dread Rank ---------- */
  E.artifacts = {
    hourglass: { rank: 2, unlock: 'd_stage_crypt_win',      fx: { runLength: 0.7, spawn: 1.4 } },
    exchange:  { rank: 2, unlock: 'd_stage_abyss_win',      fx: { swapCrit: 1 } },
    bloodmoon: { rank: 3, unlock: 'd_stage_aqueduct_win',   fx: { elites: 2 } },
    ironhorde: { rank: 3, unlock: 'd_boss_anguish',         fx: { enemyHp: 1.6 } },
    famine:    { rank: 2, unlock: 'd_stage_catacombs_win',  fx: { heal: 0.5 } },
    frenzy:    { rank: 2, unlock: 'd_stage_discord_win',    fx: { enemySpeed: 1.25 } },
    glasssoul: { rank: 3, unlock: 'd_stage_blightmire_win', fx: { maxHp: 0.6 } },
  };
  E.artifactOrder = Object.keys(E.artifacts);
  E.DREAD = { gold: 0.1, hp: 0.06 };

  /* ---------- The Archivist: permanent upgrades bought with Lament Shards (dropped by Lords) ---------- */
  E.archive = {
    vigor:     { icon: 'heart',     per: { maxHpPct: 0.04 }, max: 10, cost: 1, step: 1 },
    ferocity:  { icon: 'fistup',    per: { dmgPct: 0.04 },   max: 10, cost: 1, step: 1 },
    precision: { icon: 'target',    per: { addCrit: 0.01 },  max: 5,  cost: 2, step: 1 },
    celerity:  { icon: 'hourglass', per: { as: 0.03 },       max: 5,  cost: 2, step: 1 },
    expanse:   { icon: 'rings',     per: { area: 0.04 },     max: 5,  cost: 2, step: 1 },
    bulwark:   { icon: 'shield',    per: { block: 1.5 },     max: 5,  cost: 2, step: 1 },
    resolve:   { icon: 'hide',      per: { defense: 0.015 }, max: 5,  cost: 2, step: 2 },
    insight:   { icon: 't_wisdom',  per: { growth: 0.04 },   max: 5,  cost: 2, step: 1 },
    fortune:   { icon: 'i_reroll',  per: { rerolls: 1 },     max: 2,  cost: 4, step: 4 },
    legion:    { icon: 'orbs',      per: { count: 1 },       max: 1,  cost: 14, step: 0 },
  };
  E.archiveOrder = Object.keys(E.archive);
  E.archiveCost = (id, level) => E.archive[id].cost + E.archive[id].step * level;

  /* ---------- Main quests: a guided path through the deeds, each pays out gems ---------- */
  E.mainQuests = [
    ['d_stage_crypt_s3', 30], ['d_stage_crypt_s5', 30], ['d_boss_gravechief', 40], ['d_hero_knight_l20', 30], ['d_stage_crypt_win', 60],
    ['d_brew_1', 30], ['d_stage_abyss_s5', 40], ['d_well_1', 40], ['d_secret_crypt', 50], ['d_stage_abyss_win', 80],
    ['d_stage_crypt_a1', 60], ['d_level_50', 60], ['d_stage_aqueduct_win', 100], ['d_champions_10', 60], ['d_dread_4', 80],
    ['d_stage_catacombs_win', 120], ['d_stage_discord_win', 150], ['d_stage_blightmire_win', 180], ['d_stage_reliquary_win', 250],
  ];

  /* ---------- Chests ---------- */
  E.chests = {
    wood:   { icon: 'c_wood',   price: { gold: 1500 }, odds: [70, 25, 5, 0, 0, 0],           adEveryMs: 4 * 3600e3 },
    silver: { icon: 'c_silver', price: { gems: 150 },  odds: [0, 55, 35, 9, 1, 0] },
    gold:   { icon: 'c_gold',   price: { gems: 400 },  odds: [0, 0, 60, 32.5, 7, 0.5], pity: 10, x10: 3600 },
  };

  /* ---------- Daily missions ---------- */
  E.missionPool = [
    { id: 'kills',    target: 400,  reward: { gold: 600, passXp: 60 } },
    { id: 'kills2',   stat: 'kills', target: 1500, reward: { gems: 15, passXp: 90 } },
    { id: 'runs',     target: 2,    reward: { gold: 500, passXp: 60 } },
    { id: 'survive',  target: 300,  reward: { gems: 10, passXp: 80 } },
    { id: 'level',    target: 20,   reward: { gold: 800, passXp: 70 } },
    { id: 'boss',     target: 1,    reward: { gems: 20, passXp: 100 } },
    { id: 'gold',     target: 400,  reward: { energy: 10, passXp: 60 } },
    { id: 'chest',    target: 1,    reward: { gold: 700, passXp: 60 } },
    { id: 'ads',      target: 2,    reward: { gems: 15, passXp: 80 } },
    { id: 'upgrade',  target: 2,    reward: { mats: { iron: 8 }, gold: 300, passXp: 60 } },
    { id: 'elites',   target: 3,    reward: { mats: { iron: 6 }, gems: 5, passXp: 70 } },
  ];
  E.MISSIONS_PER_DAY = 5;
  E.missionBonus = { chest: 'silver', gems: 30, mats: { silver: 5 }, passXp: 150 };
  E.missionPool.push({ id: 'tomes', target: 3, reward: { gold: 600, passXp: 60 } }, { id: 'champions', target: 1, reward: { gems: 10, mats: { silver: 3 }, passXp: 80 } });

  /* ---------- Achievements (tiered) ---------- */
  E.achievements = [
    { id: 'slayer',    stat: 'kills',        tiers: [500, 5000, 25000, 100000, 500000], gems: [20, 40, 80, 150, 300] },
    { id: 'survivor',  stat: 'wins',         tiers: [1, 5, 20, 50, 150],                 gems: [30, 50, 100, 200, 400] },
    { id: 'bosshunter',stat: 'bossKills',    tiers: [1, 10, 40, 100, 300],               gems: [20, 40, 80, 150, 300] },
    { id: 'elitehunter',stat: 'eliteKills',  tiers: [5, 50, 200, 800],                   gems: [15, 40, 80, 150] },
    { id: 'hoarder',   stat: 'goldEarned',   tiers: [5000, 50000, 250000, 1000000],      gems: [20, 50, 100, 250] },
    { id: 'ascendant', stat: 'maxLevel',     tiers: [15, 30, 45, 60],                    gems: [15, 40, 80, 150] },
    { id: 'veteran',   stat: 'runs',         tiers: [3, 20, 75, 250, 1000],              gems: [15, 30, 60, 120, 250] },
    { id: 'heroes',    stat: 'heroesOwned',  tiers: [2, 3, 4, 5],                        gems: [30, 60, 100, 200] },
    { id: 'blacksmith',stat: 'itemsMerged',  tiers: [1, 10, 40, 120],                    gems: [20, 50, 100, 200] },
    { id: 'opener',    stat: 'chestsOpened', tiers: [3, 20, 80, 300],                    gems: [15, 40, 80, 150] },
    { id: 'faithful',  stat: 'loginDays',    tiers: [3, 7, 30, 100],                     gems: [20, 50, 150, 400] },
    { id: 'devotee',   stat: 'shrineLevels', tiers: [5, 20, 45, 75],                     gems: [20, 50, 100, 200] },
    { id: 'patron',    stat: 'adsWatched',   tiers: [5, 25, 100, 300],                   gems: [15, 40, 80, 150] },
    { id: 'conqueror', stat: 'stagesCleared',tiers: [1, 2, 3],                           gems: [50, 150, 300] },
    { id: 'forger',    stat: 'forged',       tiers: [5, 30, 120, 400],                   gems: [15, 40, 90, 200] },
  ];

  /* ---------- Season pass ---------- */
  E.PASS_TIERS = 30;
  E.PASS_XP_PER_TIER = 300;
  E.PASS_TIER_GEM_COST = 90;
  E.passRewards = (function () {
    const free = [], prem = [];
    for (let i = 1; i <= 30; i++) {
      // free track
      if (i % 10 === 0) free.push({ chest: 'gold' });
      else if (i % 5 === 0) free.push({ chest: 'silver' });
      else if (i % 3 === 0) free.push({ gems: 20 + i * 2 });
      else if (i % 4 === 0) free.push({ mats: { [i < 10 ? 'iron' : i < 20 ? 'silver' : 'gold']: i < 10 ? 15 : 10 } }); // forging metal, finer as the season goes on
      else if (i % 2 === 0) free.push({ energy: 10 });
      else free.push({ gold: 400 + i * 80 });
      // premium track
      if (i === 1) prem.push({ hero: 'reaper' });
      else if (i === 30) prem.push({ gear: { rarity: 5 } });
      else if (i % 10 === 0) prem.push({ gear: { rarity: 4 } });
      else if (i % 5 === 0) prem.push({ chest: 'gold' });
      else if (i % 3 === 0) prem.push({ gems: 60 + i * 4 });
      else if (i % 2 === 0) prem.push({ chest: 'silver' });
      else if (i % 4 === 3) prem.push({ mats: { [i < 10 ? 'silver' : i < 20 ? 'gold' : 'starsteel']: i < 20 ? 15 : 10 } });
      else prem.push({ gold: 1500 + i * 200 });
    }
    return { free, prem };
  })();

  /* ---------- 7-day login calendar ---------- */
  E.loginRewards = [
    { gold: 1000 }, { gems: 25 }, { energy: 20 }, { mats: { iron: 25 } }, { chest: 'silver' }, { gems: 60 }, { chest: 'gold' },
  ];

  /* ---------- Vigil (idle) rewards ---------- */
  E.VIGIL_CAP_MS = 12 * 3600e3;
  E.vigilRates = (stagesCleared) => ({ goldPerMin: 2 + stagesCleared * 3, xpPerMin: 1 + stagesCleared }); // one hall: 5 a minute, 3600 over the full 12 hours (about one won run)
  E.VIGIL_MATS_PER_HOUR = 1.5; // forging metal while away: the metal of the deepest hall won
  E.QUICK_VIGIL_MS = 2 * 3600e3;
  E.QUICK_VIGIL_ADS = 3;
  E.QUICK_VIGIL_GEMS = 40;

  /* ---------- Energy ---------- */
  E.ENERGY_MAX = 30;
  E.RENAME_GEMS = 200; // changing the player's name: the first change is free, every one after costs this
  E.ENERGY_REGEN_MS = 6 * 60e3;
  E.ENERGY_AD_AMOUNT = 10;
  E.ENERGY_AD_LIMIT = 3;
  E.ENERGY_GEM_COST = 50;
  E.ENERGY_GEM_AMOUNT = 30;

  /* ---------- Revive ---------- */
  E.REVIVE_GEMS = [150, 300, 600]; // gem revives per run: each costs double the last, three at most

  /* ---------- Free gems via ads ---------- */
  E.FREE_GEM_ADS = 5;
  E.FREE_GEM_AMOUNT = 10;

  /* ---------- Account level ---------- */
  E.accountXpNext = (lvl) => 100 + (lvl - 1) * 60;
  E.accountLevelReward = (lvl) => ({ gems: 20 + lvl * 2, gold: 300 * lvl, mats: { [E.materials[Math.min(3, Math.floor(lvl / 10))]]: lvl % 5 === 0 ? 15 : 5 } }); // metal: finer every ten levels, more every fifth

  /* ---------- Store catalogue (real money) ----------
   * Prices are placeholders in USD. On a real store the platform returns
   * localized prices; see js/services/iap.js. */
  E.products = {
    gems_1: { type: 'gems', gems: 80,    price: 0.99,  icon: 'gems_s' },
    gems_2: { type: 'gems', gems: 450,   price: 4.99,  icon: 'gems_m', bonus: 10 },
    gems_3: { type: 'gems', gems: 1000,  price: 9.99,  icon: 'gems_m', bonus: 20, tag: 'popular' },
    gems_4: { type: 'gems', gems: 2200,  price: 19.99, icon: 'gems_l', bonus: 30 },
    gems_5: { type: 'gems', gems: 6000,  price: 49.99, icon: 'gems_l', bonus: 50 },
    gems_6: { type: 'gems', gems: 13500, price: 99.99, icon: 'gems_xl', bonus: 70, tag: 'best' },
    starter:  { type: 'bundle', price: 1.99, once: true, grant: { gems: 300, gold: 10000, gear: { rarity: 3 }, energy: 30, mats: { iron: 60, silver: 20 } }, value: 800 },
    noads:    { type: 'noads', price: 4.99, once: true },
    soulcard: { type: 'sub', price: 4.99, grant: { gems: 300 }, daily: { gems: 100, energy: 10, mats: { iron: 5 } }, days: 30 },
    pass:     { type: 'pass', price: 9.99 },
    reaper:   { type: 'bundle', price: 4.99, once: true, grant: { hero: 'reaper', gems: 500, chest: 'gold' }, value: 400 },
    legend:   { type: 'bundle', price: 19.99, once: true, grant: { gems: 2500, gear: { rarity: 4 }, chest: 'gold', gold: 50000, mats: { gold: 40, starsteel: 20 } }, value: 500 },
  };
  E.gemPackOrder = ['gems_1', 'gems_2', 'gems_3', 'gems_4', 'gems_5', 'gems_6'];

  /* Gold for gems */
  E.goldPacks = [
    { id: 'gold_s', gems: 60,  gold: 4000 },
    { id: 'gold_m', gems: 250, gold: 18000 },
    { id: 'gold_l', gems: 600, gold: 48000 },
  ];

  /* The Forge: forging metal, herbs and potions for gold or gems, each a few times a day */
  E.stockPacks = [
    { id: 'p_iron',      cost: { gold: 2500 }, grant: { mats: { iron: 20 } },      daily: 5 },
    { id: 'p_silver',    cost: { gold: 6000 }, grant: { mats: { silver: 12 } },    daily: 3 },
    { id: 'p_gold',      cost: { gems: 90 },   grant: { mats: { gold: 12 } },      daily: 3 },
    { id: 'p_starsteel', cost: { gems: 200 },  grant: { mats: { starsteel: 10 } }, daily: 2 },
    { id: 'p_herbs',     cost: { gold: 3000 }, grant: { herbs: { moss: 3, ember: 3, lily: 3, frostcap: 3, nightshade: 3 } }, daily: 2 },
    { id: 'p_forge',     cost: { gems: 300 },  grant: { mats: { iron: 30, silver: 20, gold: 10, starsteel: 5 } }, daily: 1 },
  ];

  /* Daily deals: rotated every day. kind: ad (free with ad), gold, gems */
  E.dealPool = [
    { id: 'd_gold_ad',   cost: { ad: 1 },     grant: { gold: 1500 } },
    { id: 'd_gems_ad',   cost: { ad: 1 },     grant: { gems: 15 } },
    { id: 'd_energy_ad', cost: { ad: 1 },     grant: { energy: 15 } },
    { id: 'd_gear_rare', cost: { gems: 90 },  grant: { gear: { rarity: 2 } } },
    { id: 'd_gear_epic', cost: { gems: 280 }, grant: { gear: { rarity: 3 } } },
    { id: 'd_silver',    cost: { gold: 9000 },grant: { chest: 'silver' } },
    { id: 'd_gear_unc',  cost: { gold: 4000 },grant: { gear: { rarity: 1 } } },
    { id: 'd_energy',    cost: { gems: 30 },  grant: { energy: 30 } },
    { id: 'd_gold_big',  cost: { gems: 120 }, grant: { gold: 12000 } },
    { id: 'd_iron_ad',   cost: { ad: 1 },     grant: { mats: { iron: 12 } } },
    { id: 'd_silver_mat',cost: { gold: 4500 },grant: { mats: { silver: 12 } } },
    { id: 'd_gold_mat',  cost: { gems: 70 },  grant: { mats: { gold: 12 } } },
    { id: 'd_star_mat',  cost: { gems: 150 }, grant: { mats: { starsteel: 10 } } },
    { id: 'd_potion',    cost: { gold: 5000 },grant: { potions: { remembrance: 1 } } },
  ];

  /* Ads */
  E.INTERSTITIAL_EVERY = 3; // runs between interstitials (skipped with No Ads)

  /* ---------- The Seven Nights: a newcomer event ----------
   * Seven nights of tasks, one night opening per calendar day from a player's first visit (10 days in all to claim).
   * Tasks count everything done so far, from the start; a night's tasks can be claimed once that night has opened.
   * Each task pays Seals plus a small reward; Seals fill a track of seven rewards up to a Legendary relic.
   * k = what is counted (see DH.meta.nbValue), n = target, st = hall, s = Seals, r = reward. */
  E.NEWBIE = {
    nights: 7, lengthDays: 10,
    tasks: [
      [{ k: 'login', n: 1, s: 5, r: { gold: 300 } }, { k: 'runs', n: 1, s: 5, r: { gold: 300 } }, { k: 'kills', n: 300, s: 10, r: { gold: 500 } },
        { k: 'survive', st: 'crypt', n: 300, s: 10, r: { gems: 20 } }, { k: 'shrine', n: 1, s: 5, r: { gold: 300 } }, { k: 'equip', n: 1, s: 5, r: { gold: 300 } },
        { k: 'ads', n: 1, s: 5, r: { gems: 10 } }],
      [{ k: 'login', n: 2, s: 5, r: { gold: 400 } }, { k: 'clear', st: 'crypt', n: 1, s: 10, r: { gems: 30 } }, { k: 'level', n: 20, s: 10, r: { gold: 600 } },
        { k: 'gearLv', n: 3, s: 10, r: { mats: { iron: 15 } } }, { k: 'chests', n: 1, s: 5, r: { gold: 400 } }, { k: 'bosses', n: 3, s: 5, r: { energy: 10 } },
        { k: 'shrine', n: 3, s: 5, r: { gold: 400 } }],
      [{ k: 'login', n: 3, s: 5, r: { gold: 500 } }, { k: 'survive', st: 'abyss', n: 300, s: 10, r: { gems: 30 } }, { k: 'merge', n: 1, s: 10, r: { gold: 600 } },
        { k: 'heroes', n: 2, s: 10, r: { gems: 40 } }, { k: 'level', n: 30, s: 10, r: { gold: 700 } }, { k: 'elites', n: 30, s: 5, r: { mats: { iron: 12 } } },
        { k: 'ads', n: 3, s: 5, r: { gems: 15 } }],
      [{ k: 'login', n: 4, s: 5, r: { gold: 600 } }, { k: 'clear', st: 'abyss', n: 1, s: 10, r: { gems: 40 } }, { k: 'gearLv', n: 10, s: 10, r: { mats: { iron: 25 } } },
        { k: 'shrine', n: 8, s: 5, r: { gold: 600 } }, { k: 'tomes', n: 25, s: 5, r: { gold: 600 } }, { k: 'kills', n: 5000, s: 10, r: { energy: 15 } },
        { k: 'deeds', n: 10, s: 10, r: { gems: 30 } }],
      [{ k: 'login', n: 5, s: 5, r: { gold: 700 } }, { k: 'survive', st: 'aqueduct', n: 300, s: 10, r: { gems: 40 } }, { k: 'acct', n: 5, s: 10, r: { gold: 1000 } },
        { k: 'agony', n: 1, s: 10, r: { gems: 40 } }, { k: 'brew', n: 1, s: 5, r: { herbs: { moss: 3, lily: 3 } } }, { k: 'champions', n: 10, s: 5, r: { gold: 700 } },
        { k: 'ads', n: 5, s: 5, r: { gems: 20 } }],
      [{ k: 'login', n: 6, s: 5, r: { gold: 800 } }, { k: 'clear', st: 'aqueduct', n: 1, s: 15, r: { gems: 50 } }, { k: 'gearLv', n: 15, s: 10, r: { mats: { silver: 15 } } },
        { k: 'merge', n: 3, s: 10, r: { gold: 1000 } }, { k: 'shrine', n: 15, s: 5, r: { gold: 800 } }, { k: 'level', n: 40, s: 10, r: { energy: 20 } },
        { k: 'wins', n: 5, s: 5, r: { gems: 30 } }],
      [{ k: 'login', n: 7, s: 5, r: { gold: 1000 } }, { k: 'heroes', n: 3, s: 10, r: { gems: 60 } }, { k: 'runs', n: 30, s: 10, r: { gold: 1500 } },
        { k: 'agony', n: 3, s: 15, r: { gems: 60 } }, { k: 'kills', n: 20000, s: 10, r: { gold: 1500 } }, { k: 'deeds', n: 25, s: 10, r: { gems: 40 } },
        { k: 'acct', n: 8, s: 10, r: { gold: 1500 } }],
    ],
    // 385 Seals in all: the last reward asks for most of them, not every single task
    milestones: [
      { at: 40, r: { gold: 3000 } }, { at: 90, r: { mats: { iron: 40 } } }, { at: 150, r: { chest: 'silver' } }, { at: 210, r: { gems: 200 } },
      { at: 270, r: { gear: { rarity: 3 } } }, { at: 320, r: { chest: 'gold' } }, { at: 360, r: { gear: { rarity: 4 } } },
    ],
  };

  DH.economy = E;
})(window.DH);
