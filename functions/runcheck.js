/* Is a fight's summary possible? The device plays the fight; the server knows when it started (its own clock), the
 * hall, the hero and the Agony it was started with, and holds every number the device reports against what a fight of
 * that length could have produced.
 *
 * Two kinds of guard:
 *  - integrity: a summary that fails one of these is edited or corrupt (wrong hall/hero, time beyond the server's
 *    clock, a mismatched Agony/Torment, an unknown item id). The fight is NOT rewarded. These never trip on honest
 *    same-version play.
 *  - magnitude caps: generous ceilings, well above the best builds. Past them the fight is still rewarded — the
 *    offending number is CLAMPED to the ceiling (the summary is edited in place) and the reward is paid up to it.
 *    So a huge honest run always pays, and an edited number is worth no more than the best possible honest run for
 *    the time that really elapsed (the time-beyond-clock guard keeps every time-based ceiling honest).
 */
'use strict';

const num = (v) => (typeof v === 'number' && isFinite(v) ? v : NaN);
const int = (v) => (Number.isInteger(v) ? v : NaN);

/**
 * sum: the device's summary (DH.Run.summary()); run: the ticket the server wrote at the start
 * ({ stage, hero, start, agony, dread }); now: the server's time; DH: the game's code (content, economy).
 * Mutates sum, clamping any number past its cap. Returns null when the summary holds up, or a short reason
 * (integrity failure) when it must not be rewarded at all.
 */
function checkRun(sum, run, now, DH) {
  const C = DH.content, E = DH.economy, st = C.stages[run.stage];

  /* ---- integrity: edited or corrupt summaries, never rewarded ---- */
  if (!sum || typeof sum !== 'object') return 'no-summary';
  if (sum.stage !== run.stage || sum.hero !== run.hero) return 'wrong-hall-or-hero';
  const T = num(sum.time), elapsed = (now - run.start) / 1000;
  if (!(T >= 0)) return 'time';
  if (T > elapsed + 15) return 'time-beyond-clock'; // a fight cannot last longer than the time since it started
  if (T > 4 * 3600) return 'time-cap';
  if (!(int(sum.kills) >= 0) || !(int(sum.level) >= 1) || !(int(sum.bossKills) >= 0)) return 'numbers';
  if (sum.agonyOn !== !!run.agony) return 'agony';
  if (int(sum.dread) !== (run.dread || 0)) return 'dread';
  if (sum.rescued != null && (C.RESCUE || {})[run.stage] !== sum.rescued) return 'rescue';
  const herbs = sum.herbs || {};
  for (const k in herbs) if (!(E.herbs || []).concat('dust').includes(k) || !(int(herbs[k]) >= 0)) return 'herbs';
  const mats = sum.mats || {};
  for (const k in mats) if (!(E.materials || []).includes(k) || !(int(mats[k]) >= 0)) return 'mats';
  const arts = sum.artifactsFound || [];
  if (!Array.isArray(arts) || arts.some((k) => !E.artifacts[k])) return 'artifacts';
  const wells = [sum.wellSent].concat(sum.wellExtra || []).filter(Boolean);
  if (wells.some((w) => !E.gear[w.type] || !(int(w.rarity) >= 0) || w.rarity > 4)) return 'well';
  for (const k in sum.potionsUsed || {}) if (!E.potions[k] || !(int(sum.potionsUsed[k]) >= 0)) return 'potions';
  const OTHER = ['burn', 'spark', 'frost', 'decay', 'imp', 'item', 'revive']; // damage of effects, the imps and the items, not of an ability
  for (const k in sum.dmgByAb || {}) if ((!C.abilities[k] && !OTHER.includes(k)) || !(num(sum.dmgByAb[k]) >= 0)) return 'damage';

  /* ---- magnitude caps: clamp past the ceiling, still rewarded ---- */
  const cap = (k, max) => { if (num(sum[k]) > max) sum[k] = max; };
  cap('kills', 150 * T + 2000);                         // bullet-heaven AoE clears far faster than a flat rate
  cap('level', Math.floor(40 + T / 2));
  const bossesDue = (st.bosses || []).filter((b) => b.t <= T + 5).length;
  cap('bossKills', bossesDue + 20);                     // secret guardians, gilded, revived bosses
  if (num(sum.eliteKills) > sum.kills) sum.eliteKills = sum.kills; else if (!(int(sum.eliteKills) >= 0)) sum.eliteKills = 0;
  cap('championKills', 400);                            // Agony spawns champions constantly
  cap('tomes', 200);
  if (num(sum.oozes) > sum.kills + 1) sum.oozes = sum.kills + 1;
  if (!(int(sum.agony) >= 0)) sum.agony = 0; else if (sum.agony > C.AGONY_MAX) sum.agony = C.AGONY_MAX;
  const tribGold = (run.tributes || []).reduce((a, id) => a + ((E.tributes && E.tributes[id] && E.tributes[id].boon.gold) || 0), 0); // the Reliquary's tribute of Fortune
  const goldMax = (st.goldMult || 1) * (sum.kills * 25 + T * 80) * (1 + (run.dread || 0)) * (1 + tribGold) + 100000;
  if (!(num(sum.gold) >= 0)) sum.gold = 0; else if (sum.gold > goldMax) sum.gold = Math.floor(goldMax);
  if (sum.victory) { // a victory not actually earned keeps the run's rewards, but not the victory bonus
    const lord = (st.bosses || []).find((b) => b.final);
    const byTime = lord ? T >= lord.t - 30 : T >= (sum.runLength || C.RUN_LENGTH) - 30;
    const byKills = st.lordKills ? sum.kills >= st.lordKills : false;
    if (!byTime && !byKills) sum.victory = false;
  }
  cap('lateLevels', 600);
  cap('shards', 120);
  cap('maxPlants', 120);
  for (const k in herbs) if (herbs[k] > 100) herbs[k] = 100;
  const matMax = E.MAT_RUN_MAX || 250;
  for (const k in mats) if (mats[k] > matMax) mats[k] = matMax;
  if (arts.length > 6) sum.artifactsFound = arts.slice(0, 6);
  if (wells.length > 6) { const keep = wells.slice(0, 6); sum.wellSent = keep[0] || null; sum.wellExtra = keep.slice(1); }
  for (const k in sum.potionsUsed || {}) if (sum.potionsUsed[k] > 40) sum.potionsUsed[k] = 40;
  for (const k in sum.dmgByAb || {}) if (sum.dmgByAb[k] > 1e10) sum.dmgByAb[k] = 1e10;
  return null;
}

module.exports = { checkRun };
