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
  // paths out to the sides (added later, on their own seed, so the stars above keep their names and gifts): from each
  // side star a path of two lesser stars to another bright one
  let seed2 = 5531;
  const rnd2 = () => { seed2 = (seed2 * 16807) % 2147483647; return (seed2 - 1) / 2147483646; };
  const pick2 = (a) => a[Math.floor(rnd2() * a.length)];
  for (const b in BR) {
    const S = STATS[b];
    for (let t = 1; t < BR[b].tiers; t++) for (let s2 = 0; s2 < 2; s2++) {
      const from = b + '_n' + t + '_' + s2; if (!nodes.some((x) => x.id === from)) continue;
      let last = from;
      for (let k = 1; k <= 3; k++) {
        const id = add({ id: b + '_x' + t + '_' + s2 + '_' + k, b, kind: k === 3 ? 'notable' : 'minor', max: k === 2 ? 5 : 3, st: pick2(k === 3 ? S.notable : S.minor), x: 0, y: 0 });
        link(last, id); last = id;
      }
    }
  }
  const byId = {}; nodes.forEach((x) => { byId[x.id] = x; x.adj = []; });
  edges.forEach(([a, b]) => { byId[a].adj.push(b); byId[b].adj.push(a); });
  // Where the stars sit (only the drawing uses this): each branch a spine of hubs that winds as it goes (a slow wave
  // across its way); between two hubs its chains run beside the spine, bowing out; from a hub the side stars go out and a
  // little forward, and their paths bend on outward and forward again, so each branch gathers into a broad, ragged crown.
  const RAD = { heart: 34, hub: 22, notable: 18, minor: 14 }, LINE = 66;
  nodes.forEach((x) => { x.r = RAD[x.kind]; });
  const at = (x, X, Y) => { if (x) { x.x = Math.round(X); x.y = Math.round(Y); } };
  const norm = (x, y) => { const d = Math.hypot(x, y) || 1; return [x / d, y / d]; };
  const PH = { fury: 0.4, bastion: 2.1, plunder: 4.0 };
  for (const b in BR) {
    const D = BR[b], step = (D.len + 1) * LINE * 0.9;
    let px = 0, py = 0;
    for (let t = 0; t < D.tiers; t++) {
      const th = D.ang + 0.34 * Math.sin(t * 1.15 + PH[b]), len = step + (t ? 0 : 26);
      const qx = px + Math.cos(th) * len, qy = py + Math.sin(th) * len;
      at(byId[b + '_h' + t], qx, qy);
      const [ux, uy] = norm(qx - px, qy - py), nx = -uy, ny = ux;
      const chains = t === 0 ? 1 : D.chains, spread = D.chains === 3 ? 1.3 * LINE : 0.8 * LINE;
      for (let c = 0; c < chains; c++) {
        const off = chains === 1 ? 0 : (c - (chains - 1) / 2) * spread * (chains === 3 ? 1 : 2);
        for (let k = 1; k <= D.len; k++) {
          const f = k / (D.len + 1), sx = t ? px : px + ux * 26, sy = t ? py : py + uy * 26;
          at(byId[b + '_' + t + '_' + c + '_' + k], sx + (qx - sx) * f + nx * off * Math.sin(f * Math.PI), sy + (qy - sy) * f + ny * off * Math.sin(f * Math.PI));
        }
      }
      for (let s2 = 0; s2 < 2; s2++) {
        const dir = s2 === 0 ? 1 : -1, a1 = byId[b + '_s' + t + '_' + s2]; if (!a1) continue;
        const out = spread + LINE * 0.45;
        let [dx, dy] = norm(nx * dir + ux * 0.3, ny * dir + uy * 0.3);
        let x = qx + dx * out, y = qy + dy * out; at(a1, x, y);
        [dx, dy] = norm(dx + ux * 0.25, dy + uy * 0.25); x += dx * LINE * 1.05; y += dy * LINE * 1.05; at(byId[b + '_n' + t + '_' + s2], x, y);
        for (let k = 1; k <= 3; k++) { // its path bends on, outward and forward
          [dx, dy] = norm(dx + ux * 0.3 - nx * dir * 0.05, dy + uy * 0.3 - ny * dir * 0.05); x += dx * LINE * (k === 3 ? 1.1 : 0.95); y += dy * LINE * (k === 3 ? 1.1 : 0.95);
          at(byId[b + '_x' + t + '_' + s2 + '_' + k], x, y);
        }
      }
      px = qx; py = qy;
    }
  }
  // then a few rounds of easing: stars closer than their sizes allow push apart, lines pull gently towards LINE (the
  // heart stays put), so the winding shape keeps but nothing overlaps. Only the screen needs the places (E.CONST.place,
  // called when the Constellation opens): the server, which runs this file for every action, never pays for it.
  let placed = false;
  const place = () => {
    if (placed) return; placed = true;
    const N = nodes.length, idx = {}; nodes.forEach((x, i) => { idx[x.id] = i; });
    const ed = edges.map(([a2, b2]) => [idx[a2], idx[b2]]);
    for (let it = 0; it < 160; it++) {
      for (let i = 1; i < N; i++) for (let j = i + 1; j < N; j++) {
        const A2 = nodes[i], B2 = nodes[j], dx = B2.x - A2.x, dy = B2.y - A2.y, min = A2.r + B2.r + 24, d2 = dx * dx + dy * dy;
        if (d2 >= min * min) continue;
        const d = Math.sqrt(d2) || 0.01, f = (min - d) / d * 0.5;
        A2.x -= dx * f; A2.y -= dy * f; B2.x += dx * f; B2.y += dy * f;
      }
      for (const [i, j] of ed) {
        const A2 = nodes[i], B2 = nodes[j], dx = B2.x - A2.x, dy = B2.y - A2.y, d = Math.hypot(dx, dy) || 0.01, want = Math.max(LINE, A2.r + B2.r + 24), f = (d - want) / d * 0.08;
        if (i) { A2.x += dx * f; A2.y += dy * f; } if (j) { B2.x -= dx * f; B2.y -= dy * f; }
      }
    }
    nodes.forEach((x) => { x.x = Math.round(x.x); x.y = Math.round(x.y); });
  };
  const total = {}; nodes.forEach((x) => { if (x.b) total[x.b] = (total[x.b] || 0) + x.max; });

  E.CONST = {
    nodes, edges, byId, branches: BR, total, place,
    /** The price of the next point of a branch that already holds p points: 100 more with every point up to 25 000 a
     *  point at most, and every branch counts its own from the start. */
    step: 100, maxCost: 25000,
    cost: (p) => Math.min(25000, 100 * (p + 1)),
    /** All a branch with p points has cost. */
    spentIn: (p) => { const k = Math.min(p, 250); return 50 * k * (k + 1) + Math.max(0, p - 250) * 25000; },
    /** Specialties: the points a branch needs for each of its five. */
    specials: { fury: [30, 60, 90, 150, 200], bastion: [25, 50, 75, 100, 140], plunder: [15, 30, 50, 75, 95] },
    plunderEssence: 0.1, // the fourth Plunder Specialty: +10% Essence from the Pit
  };
})(window.DH);
