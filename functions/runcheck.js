/* Is a fight's summary possible? The device plays the fight; the server knows when it started (its own clock), the
 * hall, the hero and the Agony it was started with, and holds every number the device reports against what a fight of
 * that length could have produced. A summary that fails is not rewarded. The limits are generous for honest play (well
 * above the best builds) and still far below what an edited number would claim. */
'use strict';

const num = (v) => (typeof v === 'number' && isFinite(v) ? v : NaN);
const int = (v) => (Number.isInteger(v) ? v : NaN);

/**
 * sum: the device's summary (DH.Run.summary()); run: the ticket the server wrote at the start
 * ({ stage, hero, start, agony, dread }); now: the server's time; DH: the game's code (content, economy).
 * Returns null when the summary holds up, or a short reason.
 */
function checkRun(sum, run, now, DH) {
  const C = DH.content, E = DH.economy, st = C.stages[run.stage];
  if (!sum || typeof sum !== 'object') return 'no-summary';
  if (sum.stage !== run.stage || sum.hero !== run.hero) return 'wrong-hall-or-hero';
  const T = num(sum.time), elapsed = (now - run.start) / 1000;
  if (!(T >= 0)) return 'time';
  if (T > elapsed + 15) return 'time-beyond-clock'; // a fight cannot last longer than the time since it started
  if (T > 4 * 3600) return 'time-cap';
  const kills = int(sum.kills), level = int(sum.level), bossKills = int(sum.bossKills);
  if (!(kills >= 0) || !(level >= 1) || !(bossKills >= 0)) return 'numbers';
  if (kills > 30 * T + 300) return 'kills';
  if (level > 15 + T / 4) return 'level';
  const bossesDue = (st.bosses || []).filter((b) => b.t <= T + 5).length;
  if (bossKills > bossesDue + 8) return 'bosses';
  if (!(int(sum.eliteKills) >= 0) || sum.eliteKills > kills) return 'elites';
  if ((sum.championKills || 0) > 60 || (sum.tomes || 0) > 60 || (sum.oozes || 0) > kills + 1) return 'counts';
  const gold = num(sum.gold);
  const tribGold = (run.tributes || []).reduce((a, id) => a + ((E.tributes && E.tributes[id] && E.tributes[id].boon.gold) || 0), 0); // the Reliquary's tribute of Fortune
  if (!(gold >= 0) || gold > (st.goldMult || 1) * (kills * 4 + T * 12) * (1 + (run.dread || 0) * 0.5) * (1 + tribGold) + 5000) return 'gold';
  if (sum.agonyOn !== !!run.agony) return 'agony';
  if (!(int(sum.agony) >= 0) || sum.agony > C.AGONY_MAX) return 'agony-level';
  if (int(sum.dread) !== (run.dread || 0)) return 'dread';
  if (sum.victory) {
    const lord = (st.bosses || []).find((b) => b.final);
    const byTime = lord ? T >= lord.t - 10 : T >= (sum.runLength || C.RUN_LENGTH) - 10;
    const byKills = st.lordKills ? kills >= st.lordKills : false;
    if (!byTime && !byKills) return 'victory-too-early';
  }
  if (sum.rescued != null && (C.RESCUE || {})[run.stage] !== sum.rescued) return 'rescue';
  if (!(int(sum.lateLevels || 0) >= 0) || (sum.lateLevels || 0) > 300) return 'late-levels';
  if (!(int(sum.shards || 0) >= 0) || (sum.shards || 0) > 60) return 'shards';
  const herbs = sum.herbs || {};
  for (const k in herbs) if (!(E.herbs || []).concat('dust').includes(k) || !(int(herbs[k]) >= 0) || herbs[k] > 40) return 'herbs';
  const mats = sum.mats || {};
  for (const k in mats) if (!(E.materials || []).includes(k) || !(int(mats[k]) >= 0) || mats[k] > (E.MAT_RUN_MAX || 250)) return 'mats';
  const arts = sum.artifactsFound || [];
  if (!Array.isArray(arts) || arts.length > 3 || arts.some((k) => !E.artifacts[k])) return 'artifacts';
  const wells = [sum.wellSent].concat(sum.wellExtra || []).filter(Boolean);
  if (wells.length > 4 || wells.some((w) => !E.gear[w.type] || !(int(w.rarity) >= 0) || w.rarity > 4)) return 'well';
  for (const k in sum.potionsUsed || {}) if (!E.potions[k] || !(int(sum.potionsUsed[k]) >= 0) || sum.potionsUsed[k] > 20) return 'potions';
  const OTHER = ['burn', 'spark', 'frost', 'decay', 'imp', 'item', 'revive']; // damage of effects, the imps and the items, not of an ability
  for (const k in sum.dmgByAb || {}) if ((!C.abilities[k] && !OTHER.includes(k)) || !(num(sum.dmgByAb[k]) >= 0) || sum.dmgByAb[k] > 1e10) return 'damage';
  return null;
}

module.exports = { checkRun };
