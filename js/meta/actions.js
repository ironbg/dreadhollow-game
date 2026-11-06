/* Every change a player can make to their profile, as one list. The game runs them through DH.server.act(name, args):
 * on this device while the game plays offline-first, and on the game's server once it is switched on (live.json
 * "server"), where the same list and the same DH.meta code run on the server's own copy of the profile. Nothing
 * outside this list can change currencies, items or progress on the server; arguments are read as plain values
 * (numbers, short strings), never as objects to trust.
 * ad: the rewarded ad this action pays for (on the server's side the player has already watched it on the device);
 * adOutside: the DH.meta code does not show that ad itself, so the device shows it first in every mode.
 * fast: the device applies it at once and the server follows (DH.server.act): the player never waits for a tap; the
 * server runs the same code on its own copy and its answer is taken in the end. One that turns out to need chance this
 * time (a reward with a chest or a relic in it) is undone on the device and waits for the server like any other. */
(function (DH) {
  'use strict';
  const M = () => DH.meta;
  const int = (v) => (Number.isInteger(v) ? v : Number.isInteger(Number(v)) ? Number(v) : -1);
  const str = (v, max) => (typeof v === 'string' ? v.slice(0, max || 40) : '');
  const bool = (v) => v === true;

  const A = {
    // daily, login, vigil, energy
    claimLogin: { run: (a) => M().claimLogin(bool(a.double)) },
    claimSignin: { fast: true, run: (a) => M().claimSignin(a.kind === 'month' ? 'month' : 'week', a.track === 'prem' ? 'prem' : 'free', int(a.day)) },
    claimVigil: { run: (a) => M().claimVigil(bool(a.double)) },
    quickVigil: { run: (a) => M().quickVigil(str(a.mode, 8)), ad: (a) => (a.mode === 'ad' ? 'quick_vigil' : null) },
    adEnergy: { run: () => M().adEnergy(), ad: () => 'energy' },
    gemEnergy: { fast: true, run: () => M().gemEnergy() },
    claimResFree: { fast: true, run: () => M().claimResFree() },
    adRes: { run: () => M().adRes(), ad: () => (M().ensureDaily().resFree && M().resAdsLeft() > 0 ? 'res_shop' : null) },
    adGems: { run: () => M().adGems(), ad: () => 'free_gems' },
    adGold: { run: () => M().adGold(), ad: () => 'free_gold' },
    claimSoulCard: { fast: true, run: () => M().claimSoulCard() },
    // shop
    buyChest: { run: (a) => M().buyChest(str(a.type, 12), bool(a.x10)) },
    freeChestAd: { run: () => M().freeChestAd(), ad: () => 'free_chest' },
    buyDeal: { run: (a) => M().buyDeal(int(a.idx)), ad: (a) => { const d = M().ensureDaily().deals[int(a.idx)]; return d && DH.economy.dealPool[d.i].cost.ad ? 'deal' : null; } },
    buyGoldPack: { fast: true, run: (a) => M().buyGoldPack(int(a.i)) },
    // quests, pass, deeds
    claimMission: { fast: true, run: (a) => M().claimMission(int(a.i)) },
    claimMissionBonus: { run: () => M().claimMissionBonus() },
    claimActivity: { fast: true, run: (a) => M().claimActivity(int(a.i)) },
    claimAch: { fast: true, run: (a) => M().claimAch(str(a.id)) },
    claimPass: { fast: true, run: (a) => M().claimPass(int(a.tier), a.track === 'prem' ? 'prem' : 'free') },
    claimAllPass: { fast: true, run: () => M().claimAllPass() },
    claimPassBonus: { fast: true, run: () => M().claimPassBonus() },
    claimAcct: { fast: true, run: (a) => M().claimAcct(int(a.lvl)) },
    pitStart: { run: () => M().pitStart() },
    pitEnd: { run: (a) => M().pitEnd(int(a.waves)) },
    pitSweep: { run: (a) => M().pitSweep(int(a.n) || 1) },
    pitPerkUp: { fast: true, run: (a) => M().pitPerkUp(str(a.id, 12)) },
    pitPerkDown: { fast: true, run: (a) => M().pitPerkDown(str(a.id, 12)) },
    claimPitFree: { fast: true, run: () => M().claimPitFree() },
    adPit: { run: () => M().adPit(), ad: () => (!M().pitFreeReady() && M().pitAdsLeft() > 0 ? 'pit_shop' : null) },
    pitPerkReset: { fast: true, run: () => M().pitPerkReset() },
    // the Dungeon (js/meta/dungeon.js)
    dunStart: { run: (a) => M().dunStart(int(a.lv), int(a.n) || 1) },
    dunVault: { run: (a) => M().dunVault(int(a.floor)) },
    dunBuy: { run: (a) => M().dunBuy(a.what === 'time' ? 'time' : 'revive') },
    dunEnd: { run: (a) => M().dunEnd(int(a.floors), a.won === true, int(a.gold), int(a.quartz)) },
    dunSweep: { run: (a) => M().dunSweep(int(a.n) || 1) },
    dunPerkUp: { fast: true, run: (a) => M().dunPerkUp(str(a.id, 12)) },
    dunPerkDown: { fast: true, run: (a) => M().dunPerkDown(str(a.id, 12)) },
    dunPerkReset: { fast: true, run: () => M().dunPerkReset() },
    consBuy: { fast: true, run: (a) => M().consBuy(str(a.id, 40), int(a.n)) },
    consLower: { fast: true, run: (a) => M().consLower(str(a.id, 40), a.all === true) },
    consReset: { fast: true, run: () => M().consReset() },
    consLoadNew: { fast: true, run: () => M().consLoadNew() },
    consLoadPick: { fast: true, run: (a) => M().consLoadPick(int(a.i)) },
    consLoadAgain: { fast: true, run: () => M().consLoadAgain() },
    consLoadName: { fast: true, run: (a) => M().consLoadName(int(a.i), str(a.name, 40)) },
    consLoadDelete: { fast: true, run: (a) => M().consLoadDelete(int(a.i)) },
    buyPassTier: { fast: true, run: () => M().buyPassTier() },
    claimMainQuest: { fast: true, run: () => M().claimMainQuest() },
    trackDeed: { fast: true, run: (a) => M().trackDeed(a.id == null ? null : str(a.id)) },
    nbClaimTask: { fast: true, run: (a) => M().nbClaimTask(int(a.night), int(a.i)) },
    nbClaimMilestone: { fast: true, run: (a) => M().nbClaimMilestone(int(a.i)) },
    // heroes, gear, shrine, archive, potions, artifacts, the well
    unlockHero: { run: (a) => M().unlockHero(str(a.id, 24)) },
    equip: { fast: true, run: (a) => M().equip(int(a.id), str(a.slot, 8)) },
    unequipItem: { fast: true, run: (a) => M().unequipItem(int(a.id)) },
    equipMark: { fast: true, run: (a) => M().equipMark(a.hero == null ? null : str(a.hero, 24)) },
    levelGear: { fast: true, run: (a) => M().levelGear(int(a.id)) },
    levelGearAll: { fast: true, run: (a) => M().levelGearAll(int(a.id)) },
    buyPack: { fast: true, run: (a) => M().buyPack(int(a.i)) },
    merge: { run: (a) => M().merge(int(a.id)) },
    mergeAll: { run: () => M().mergeAll() },
    salvage: { run: (a) => M().salvage(int(a.id)) },
    wellClaim: { run: (a) => M().wellClaim(int(a.idx), bool(a.withGems)) },
    buyShrine: { fast: true, run: (a) => M().buyShrine(str(a.id, 24)) },
    setAvatar: { fast: true, run: (a) => M().setAvatar(a.id == null ? null : str(a.id, 32)) },
    setTributes: { fast: true, run: (a) => M().setTributes(Array.isArray(a.ids) ? a.ids.slice(0, 12).map((x) => str(x, 24)) : []) },
    buyArchive: { fast: true, run: (a) => M().buyArchive(str(a.id, 24)) },
    resetArchive: { fast: true, run: (a) => M().resetArchive(a.hero == null ? undefined : str(a.hero, 24)) },
    toggleArtifact: { fast: true, run: (a) => M().toggleArtifact(str(a.k, 24)) },
    brew: { run: (a) => M().brew(str(a.k, 24)) },
    buyPotion: { run: (a) => M().buyPotion(str(a.k, 24)) },
    // events, name
    eventBuy: { run: (a) => M().eventBuyById(str(a.eventId, 60), str(a.itemId, 40)) },
    rename: { run: (a) => M().rename(str(a.name, 40), bool(a.first)) },
    // after a fight
    doubleRunGold: { run: () => M().doubleRunGold(), ad: () => 'double_gold', adOutside: true },
    adSeen: { run: () => M().adSeen() }, // records a watched ad for the "watch N ads" tasks; shows no ad itself (DH.ads calls it after one)
    reviveGems: { run: (a) => M().reviveGems(int(a.n)) },
    // the developer's messages and gifts, once seen
    inboxRead: { run: (a) => M().inboxRead(str(a.id, 40)) },
  };

  /** Fields the player sets freely (settings, choices on screen): the server takes them from the device, checked. */
  const FREE = ['settings', 'selectedHero', 'selectedStage', 'trackedDeed', 'tutorialDone', 'titleChosen', 'seen', 'agony'];
  /** Copy the free fields of `from` onto `to` (both profiles), keeping only values that make sense for `to`. */
  const overlayFree = (to, from) => {
    if (!from || typeof from !== 'object') return to;
    const C = DH.content;
    if (from.settings && typeof from.settings === 'object') to.settings = Object.assign({}, to.settings, from.settings);
    if (typeof from.selectedHero === 'string' && C.heroes[from.selectedHero] && (to.heroes[from.selectedHero] || C.heroes[from.selectedHero].unlock.free)) to.selectedHero = from.selectedHero;
    if (typeof from.selectedStage === 'string' && C.stages[from.selectedStage]) to.selectedStage = from.selectedStage;
    if (from.trackedDeed === null || typeof from.trackedDeed === 'string') to.trackedDeed = from.trackedDeed;
    ['tutorialDone', 'titleChosen'].forEach((k) => { if (typeof from[k] === 'boolean') to[k] = from[k]; });
    if (from.seen && typeof from.seen === 'object') to.seen = Object.assign({}, to.seen, from.seen);
    if (from.agony && typeof from.agony === 'object') { to.agony = {}; for (const k in from.agony) if (C.stages[k] && to.cleared[k]) to.agony[k] = !!from.agony[k]; }
    return to;
  };

  DH.actions = { list: A, FREE, overlayFree };
})(window.DH);
