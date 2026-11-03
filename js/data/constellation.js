/* The Constellation: a great tree of stars bought with the Pit's Essence. Three branches grow out of one heart:
 *   fury     (red, up)          attack
 *   bastion  (green, low left)  defence
 *   plunder  (yellow, low right) rewards
 * Each branch is a run of tiers: a hub star, then two or three chains of lesser stars that meet again at the next hub,
 * with side stars hanging off the hubs. A star can be raised once a star next to it is full (the heart is always full).
 * A point costs more the more points its branch already holds (E.CONST.cost). Points spent in a branch unlock its
 * five Specialties (passives, js/game/constellation.js). Resetting is free and gives every Essence back.
 * Built here from a fixed seed, so the server (functions/) and the game draw and check the very same tree. */
(function (DH) {
  'use strict';
  const E = DH.economy;
  let seed = 9173;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  // stats per rank: lesser stars (minor), side stars and hubs (notable)
  const STATS = {
    fury: {
      minor: [['dmgPct', 0.012], ['critBonus', 0.03], ['critPct', 0.012], ['as', 0.006], ['area', 0.01], ['ms', 0.006], ['firePct', 0.02], ['icePct', 0.02], ['lightningPct', 0.02], ['physPct', 0.02], ['magicPct', 0.02], ['summonPct', 0.025], ['effectPct', 0.012], ['duration', 0.012]],
      notable: [['dmgPct', 0.035], ['as', 0.018], ['critPct', 0.035], ['critBonus', 0.09], ['ms', 0.018], ['addBase', 1]],
    },
    bastion: {
      minor: [['maxHpPct', 0.012], ['regen', 0.06], ['block', 0.35], ['defense', 0.006], ['speedPct', 0.004]],
      notable: [['maxHpPct', 0.035], ['defense', 0.018], ['block', 1], ['regen', 0.18]],
    },
    plunder: {
      minor: [['greed', 0.012], ['growth', 0.012], ['pickup', 0.03], ['speedPct', 0.005], ['tomeDrop', 0.012], ['essencePct', 0.008]],
      notable: [['greed', 0.035], ['growth', 0.035], ['speedPct', 0.015], ['essencePct', 0.025], ['chestDrop', 0.004]],
    },
  };
  // the branches: direction, width of their sector, tiers, chains per tier, stars per chain
  const BR = {
    fury: { ang: -Math.PI / 2, spread: 0.95, tiers: 8, chains: 3, len: 3, color: '#ff4a3a' },
    bastion: { ang: Math.PI * 5 / 6, spread: 0.8, tiers: 6, chains: 2, len: 3, color: '#4ad86a' },
    plunder: { ang: Math.PI / 6, spread: 0.8, tiers: 5, chains: 2, len: 2, color: '#f0c040' },
  };
  const nodes = [{ id: 'heart', b: null, x: 0, y: 0, max: 0, kind: 'heart', st: null }], edges = [];
  const link = (a, b) => edges.push([a, b]);
  const add = (o) => { nodes.push(o); return o.id; };
  for (const b in BR) {
    const D = BR[b], S = STATS[b];
    let prev = 'heart', r0 = 60, n = 0;
    for (let t = 0; t < D.tiers; t++) {
      const r = r0 + 170, zig = (t % 2 ? 1 : -1) * 0.06 * D.spread;
      const hub = add({ id: b + '_h' + t, b, kind: 'hub', max: 3, st: pick(S.notable), x: Math.cos(D.ang + zig) * r, y: Math.sin(D.ang + zig) * r });
      // the chains between the last hub and this one: arcs that fan out and meet again
      const pa = nodes.find((x) => x.id === prev), ka = Math.atan2(pa.y, pa.x) || D.ang, kr = Math.hypot(pa.x, pa.y);
      const chains = t === 0 ? 1 : D.chains;
      for (let c = 0; c < chains; c++) {
        const off = chains === 1 ? 0 : (c / (chains - 1) - 0.5) * D.spread * (0.55 + 0.05 * t) * (1.2 - t / D.tiers * 0.4);
        let last = prev;
        for (let k = 1; k <= D.len; k++) {
          const f = k / (D.len + 1), bulge = Math.sin(f * Math.PI);
          const ang = ka + (D.ang + zig - ka) * f + off * bulge, rr = kr + (r - kr) * f;
          const id = add({ id: b + '_' + t + '_' + c + '_' + k, b, kind: 'minor', max: (k === Math.ceil(D.len / 2) ? 5 : 3), st: pick(S.minor), x: Math.cos(ang) * rr, y: Math.sin(ang) * rr });
          link(last, id); last = id; n++;
        }
        link(last, hub);
      }
      // side stars off the hub: one or two, sometimes a pair in a row
      const sides = t === 0 ? 0 : 1 + (rnd() < 0.5 ? 1 : 0);
      for (let s = 0; s < sides; s++) {
        const dir = s === 0 ? 1 : -1, ang = D.ang + zig + dir * D.spread * (0.32 + 0.1 * rnd()), rr = r + 30;
        const a1 = add({ id: b + '_s' + t + '_' + s, b, kind: 'minor', max: 3, st: pick(S.minor), x: Math.cos(ang) * (rr - 25), y: Math.sin(ang) * (rr - 25) });
        link(hub, a1);
        const a2 = add({ id: b + '_n' + t + '_' + s, b, kind: 'notable', max: 3, st: pick(S.notable), x: Math.cos(ang + dir * 0.06) * (rr + 30), y: Math.sin(ang + dir * 0.06) * (rr + 30) });
        link(a1, a2);
      }
      prev = hub; r0 = r;
    }
  }
  const byId = {}; nodes.forEach((x) => { byId[x.id] = x; x.adj = []; });
  edges.forEach(([a, b]) => { byId[a].adj.push(b); byId[b].adj.push(a); });
  const total = {}; nodes.forEach((x) => { if (x.b) total[x.b] = (total[x.b] || 0) + x.max; });

  E.CONST = {
    nodes, edges, byId, branches: BR, total,
    /** The price of the next point of a branch that already holds p points. */
    cost: (p) => Math.min(3000, Math.round(20 + 4 * Math.pow(p + 1, 1.5))),
    /** Specialties: the points a branch needs for each of its five. */
    specials: { fury: [30, 60, 90, 150, 200], bastion: [25, 50, 75, 100, 140], plunder: [15, 30, 50, 75, 95] },
  };
})(window.DH);
