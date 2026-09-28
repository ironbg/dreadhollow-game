/* Every change a player can make to their profile, as one list. The game runs them through DH.server.act(name, args):
 * on this device while the game plays offline-first, and on the game's server once it is switched on (live.json
 * "server"), where the same list and the same DH.meta code run on the server's own copy of the profile. Nothing
 * outside this list can change currencies, items or progress on the server; arguments are read as plain values
 * (numbers, short strings), never as objects to trust.
 * ad: the rewarded ad this action pays for (on the server's side the player has already watched it on the device);
 * adOutside: the DH.meta code does not show that ad itself, so the device shows it first in every mode. */
(function (DH) {
  'use strict';
  const M = () => DH.meta;
  const int = (v) => (Number.isInteger(v) ? v : Number.isInteger(Number(v)) ? Number(v) : -1);
  const str = (v, max) => (typeof v === 'string' ? v.slice(0, max || 40) : '');
  const bool = (v) => v === true;

  const A = {
    // daily, login, vigil, energy
    claimLogin: { run: (a) => M().claimLogin(bool(a.double)) },
    claimVigil: { run: (a) => M().claimVigil(bool(a.double)) },
    quickVigil: { run: (a) => M().quickVigil(str(a.mode, 8)), ad: (a) => (a.mode === 'ad' ? 'quick_vigil' : null) },
    adEnergy: { run: () => M().adEnergy(), ad: () => 'energy' },
    gemEnergy: { run: () => M().gemEnergy() },
    adGems: { run: () => M().adGems(), ad: () => 'free_gems' },
    claimSoulCard: { run: () => M().claimSoulCard() },
    // shop
    buyChest: { run: (a) => M().buyChest(str(a.type, 12), bool(a.x10)) },
    freeChestAd: { run: () => M().freeChestAd(), ad: () => 'free_chest' },
    buyDeal: { run: (a) => M().buyDeal(int(a.idx)), ad: (a) => { const d = M().ensureDaily().deals[int(a.idx)]; return d && DH.economy.dealPool[d.i].cost.ad ? 'deal' : null; } },
    buyGoldPack: { run: (a) => M().buyGoldPack(int(a.i)) },
    // quests, pass, deeds
    claimMission: { run: (a) => M().claimMission(int(a.i)) },
    claimMissionBonus: { run: () => M().claimMissionBonus() },
    claimAch: { run: (a) => M().claimAch(str(a.id)) },
    claimPass: { run: (a) => M().claimPass(int(a.tier), a.track === 'prem' ? 'prem' : 'free') },
    claimAllPass: { run: () => M().claimAllPass() },
    buyPassTier: { run: () => M().buyPassTier() },
    claimMainQuest: { run: () => M().claimMainQuest() },
    trackDeed: { run: (a) => M().trackDeed(a.id == null ? null : str(a.id)) },
    nbClaimTask: { run: (a) => M().nbClaimTask(int(a.night), int(a.i)) },
    nbClaimMilestone: { run: (a) => M().nbClaimMilestone(int(a.i)) },
    // heroes, gear, shrine, archive, potions, artifacts, the well
    unlockHero: { run: (a) => M().unlockHero(str(a.id, 24)) },
    equip: { run: (a) => M().equip(int(a.id), str(a.slot, 8)) },
    unequipItem: { run: (a) => M().unequipItem(int(a.id)) },
    equipMark: { run: (a) => M().equipMark(a.hero == null ? null : str(a.hero, 24)) },
    levelGear: { run: (a) => M().levelGear(int(a.id)) },
    merge: { run: (a) => M().merge(int(a.id)) },
    mergeAll: { run: () => M().mergeAll() },
    salvage: { run: (a) => M().salvage(int(a.id)) },
    wellClaim: { run: (a) => M().wellClaim(int(a.idx), bool(a.withGems)) },
    buyShrine: { run: (a) => M().buyShrine(str(a.id, 24)) },
    buyArchive: { run: (a) => M().buyArchive(str(a.id, 24)) },
    resetArchive: { run: (a) => M().resetArchive(a.hero == null ? undefined : str(a.hero, 24)) },
    toggleArtifact: { run: (a) => M().toggleArtifact(str(a.k, 24)) },
    brew: { run: (a) => M().brew(str(a.k, 24)) },
    buyPotion: { run: (a) => M().buyPotion(str(a.k, 24)) },
    // events, name
    eventBuy: { run: (a) => M().eventBuyById(str(a.eventId, 60), str(a.itemId, 40)) },
    rename: { run: (a) => M().rename(str(a.name, 40), bool(a.first)) },
    // after a fight
    doubleRunGold: { run: () => M().doubleRunGold(), ad: () => 'double_gold', adOutside: true },
    reviveGems: { run: (a) => M().reviveGems(int(a.n)) },
  };

  /** Fields the player sets freely (settings, choices on screen): the server takes them from the device, checked. */
  const FREE = ['settings', 'selectedHero', 'selectedStage', 'trackedDeed', 'tutorialDone', 'titleChosen', 'seen', 'agony', 'killMode'];
  /** Copy the free fields of `from` onto `to` (both profiles), keeping only values that make sense for `to`. */
  const overlayFree = (to, from) => {
    if (!from || typeof from !== 'object') return to;
    const C = DH.content;
    if (from.settings && typeof from.settings === 'object') to.settings = Object.assign({}, to.settings, from.settings);
    if (typeof from.selectedHero === 'string' && C.heroes[from.selectedHero] && (to.heroes[from.selectedHero] || C.heroes[from.selectedHero].unlock.free)) to.selectedHero = from.selectedHero;
    if (typeof from.selectedStage === 'string' && C.stages[from.selectedStage]) to.selectedStage = from.selectedStage;
    if (from.trackedDeed === null || typeof from.trackedDeed === 'string') to.trackedDeed = from.trackedDeed;
    ['tutorialDone', 'titleChosen', 'killMode'].forEach((k) => { if (typeof from[k] === 'boolean') to[k] = from[k]; });
    if (from.seen && typeof from.seen === 'object') to.seen = Object.assign({}, to.seen, from.seen);
    if (from.agony && typeof from.agony === 'object') { to.agony = {}; for (const k in from.agony) if (C.stages[k] && to.cleared[k]) to.agony[k] = !!from.agony[k]; }
    return to;
  };

  DH.actions = { list: A, FREE, overlayFree };
})(window.DH);
