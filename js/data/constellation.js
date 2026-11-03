/* The Constellation: a great tree of stars bought with the Pit's Essence. Three branches grow out of one heart:
 *   fury     (red, up)          attack
 *   bastion  (green, low left)  defence
 *   plunder  (yellow, low right) rewards
 * Each branch is a run of tiers: a hub star, then two or three chains of lesser stars that meet again at the next hub,
 * with side stars hanging off the hubs. A star can be raised once a star next to it is full (the heart is always full).
 * A point costs 100 more than the one before in its branch, each branch counting from its own start (E.CONST.cost). Points spent in a branch unlock its
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
    fury: { ang: -Math.PI / 2, spread: 0.95, tiers: 8, chains: 3, len: 3, color: '#a8352c' },     // old blood
    bastion: { ang: Math.PI * 5 / 6, spread: 0.8, tiers: 6, chains: 2, len: 3, color: '#5f8a5a' }, // verdigris
    plunder: { ang: Math.PI / 6, spread: 0.8, tiers: 5, chains: 2, len: 2, color: '#b8913e' },     // tarnished gold
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
  // Where the stars sit, laid out again by rule so every gap is about the same (the shape above only gives which star
  // touches which): each branch a straight spine of hubs; the chains between two hubs run beside it, one step of LINE
  // between stars, the outer ones bowing out; side stars stand out level with their hub. Only the drawing uses this.
  const RAD = { heart: 34, hub: 22, notable: 18, minor: 14 }, LINE = 66;
  nodes.forEach((x) => { x.r = RAD[x.kind]; });
  const put = (x, ang, r, lat) => { const a = ang + (r > 0 ? lat / r : 0); x.x = Math.round(Math.cos(a) * r); x.y = Math.round(Math.sin(a) * r); };
  for (const b in BR) {
    const D = BR[b], step = (D.len + 1) * LINE * 0.9, ring = (t) => 26 + step * (t + 1);
    for (let t = 0; t < D.tiers; t++) {
      put(byId[b + '_h' + t], D.ang, ring(t), 0);
      const chains = t === 0 ? 1 : D.chains, spread = D.chains === 3 ? 1.3 * LINE : 0.8 * LINE;
      for (let c = 0; c < chains; c++) {
        const off = chains === 1 ? 0 : (c - (chains - 1) / 2) * spread * (chains === 3 ? 1 : 2);
        for (let k = 1; k <= D.len; k++) {
          const f = k / (D.len + 1), r0 = t ? ring(t - 1) : 26;
          put(byId[b + '_' + t + '_' + c + '_' + k], D.ang, r0 + (ring(t) - r0) * f, off * Math.sin(f * Math.PI));
        }
      }
      for (let s2 = 0; s2 < 2; s2++) {
        const a1 = byId[b + '_s' + t + '_' + s2], a2 = byId[b + '_n' + t + '_' + s2], dir = s2 === 0 ? 1 : -1;
        if (!a1) continue;
        const out = (D.chains === 3 ? 1.3 : 0.8) * LINE + LINE * 0.42;
        put(a1, D.ang, ring(t), dir * out); put(a2, D.ang, ring(t) + LINE * 0.35, dir * (out + LINE * 1.05));
      }
    }
  }
  const total = {}; nodes.forEach((x) => { if (x.b) total[x.b] = (total[x.b] || 0) + x.max; });

  E.CONST = {
    nodes, edges, byId, branches: BR, total,
    /** The price of the next point of a branch that already holds p points: 100 more with every point, and every branch
     *  counts its own from the start (a branch with p points has cost step * p * (p + 1) / 2 in all). */
    step: 100,
    cost: (p) => 100 * (p + 1),
    spentIn: (p) => 100 * p * (p + 1) / 2,
    /** Specialties: the points a branch needs for each of its five. */
    specials: { fury: [30, 60, 90, 150, 200], bastion: [25, 50, 75, 100, 140], plunder: [15, 30, 50, 75, 95] },
  };
})(window.DH);
