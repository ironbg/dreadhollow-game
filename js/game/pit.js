/* The Pit (Trials), mixed into DH.Run.prototype. Three minutes of waves of a hall's foes, normal and elite, with no
 * boss, no loot and no coming back: a wave cleared calls the next at once, each one harder (E.PIT). The fight starts
 * at the player's checkpoint, with as many levels and tomes as the waves before it would have given. Two hazards
 * rolled by the server join each fight:
 *   blades   Rain of Blades   an X marked on the ground, then four blades sweep in along it, cross and fly on
 *   stalker  the Stalker      a slow shade that follows the hero; its touch is death
 *   stars    Falling Stars    circles where the hero is about to be, then a blast
 *   beams    Altar Beams      diagonal stripes burn, then the gaps between them
 *   chains   Chained Flesh    the hero takes 25% more damage (combat.js)
 *   stone    Stoneskin        the waves come with +15% armor
 *   mist     Poison Mist      three clouds drift after the hero, faster the farther they are
 * The hazards hit for a share of the hero's health (through block and defense, like any blow). */
(function (DH) {
  'use strict';
  const U = DH.util, C = DH.content, E = DH.economy;
  const R = DH.Run.prototype;
  const TAU = Math.PI * 2;
  const PF = {
    blades: { every: [8, 12], warn: 1.3, len: 150, speed: 150, r: 8, dmg: 0.4 },
    stalker: { first: 4, wait: 1.5, dist: [70, 150], speed: 15, r: 6, ring: 30 },
    stars: { every: [6, 9], warn: 1.3, R: 26, dmg: 0.55 },
    beams: { every: [11, 15], warnA: 1.1, warnB: 0.8, width: 30, dmg: 0.45 },
    stone: 0.15, chains: 1.25,
    mist: { n: 3, R: 24, life: 18, gap: 2.5, dist: 140, pull: 0.4, max: 70, tick: 0.75, dmg: 0.18 },
  };
  C.PIT_FX = PF;

  /** A copy of the hall the Pit's waves come from: its floor and foes from E.PIT.halls, its strength from
   *  E.PIT.hallStats, and none of its own rules (no Lords, puzzles, seals or kill count). */
  R.constructor.pitStage = function (from) {
    const P = E.PIT, tier = Math.min(P.halls.length - 1, Math.floor(from / P.every)), floor = P.halls[tier], st = C.stages[P.hallStats[tier]];
    const def = Object.assign({}, C.stages[floor], { hpMult: st.hpMult, dmgMult: st.dmgMult, dmgGrow: st.dmgGrow, index: st.index, bossHp: st.bossHp,
      bosses: [], dissonator: false, vault: false, lordKills: 0, goldMult: 0 });
    return { id: floor, def, tier };
  };

  R.initPit = function () {
    const P = this.pit, from = P.from | 0;
    // none of the hall's own business: no secret, no prisoner, no Hex, no Well, no puzzle
    this.sec = null; this.rescue = null; this.hex = null; this.disso = null; this.wellOpen = false; this.lordKills = 0;
    P.wave = from; P.cleared = 0; P.base = Math.floor(from / E.PIT.every) * E.PIT.every; P.next = 2; P.alive = 0; P.fx = {};
    // the strength of the waves skipped: their levels and their tomes, chosen at the start
    const lv = Math.min(45, Math.round(from * 0.8)), tomes = Math.min(5, Math.floor(from / E.PIT.every));
    for (let i = 0; i < lv; i++) { this.level++; this.xpNext = C.xpToNext(this.level, this.stageId); this.pendingLevels++; }
    if (lv) this.recompute(true);
    for (let i = 0; i < tomes; i++) this.collect({ type: 'tome' });
    this.revives = 0;
  };

  /** Each frame in place of the hall's spawning: the clock, the waves, the hazards. */
  R.updatePit = function (dt) {
    const P = this.pit;
    if (this.time >= (P.secs || E.PIT.secs)) { this.pitOver(); return; }
    let alive = 0; for (const e of this.enemies) if (e.pitW && !e.dead) alive++;
    if (P.alive > 0 && alive === 0) { // a wave falls: the next one comes at once
      P.cleared++; P.next = this.time + 0.6;
      this.text(this.player.x, this.player.y - 26, t('hud.pitCleared', { n: P.wave }), '#ffd35a', true); DH.audio.play('reward');
    }
    P.alive = alive;
    if (alive === 0 && this.time >= P.next) this.pitWave(P.wave + 1);
    for (const k of P.affixes) if (FX[k]) FX[k].call(this, dt);
  };

  /** Wave n: more foes with every wave, elites every fifth, stronger by E.PIT.hpGrow / dmgGrow each. */
  R.pitWave = function (n) {
    const P = this.pit, EP = E.PIT; P.wave = n; P.next = Infinity;
    const k = n - P.base - 1, hpK = Math.pow(EP.hpGrow, k), dmgK = Math.pow(EP.dmgGrow, k);
    const real = this.time; this.time = ((n - 1) % EP.every) * 55 + 30; const { mix } = this.spawnRate(); this.time = real; // the hall's mix of that moment
    const count = Math.min(40, 10 + Math.round(n * 0.5)), elites = n % 5 === 0 ? Math.min(5, 1 + Math.floor(n / 15)) : 0;
    const p = this.player, v = DH.view, Rr = Math.hypot(v.w || 270, v.h || 480) / 2 + 14, a0 = Math.random() * TAU;
    const one = (type, i, all, o) => {
      const pt = this.bridge ? this.hallEdgePoint() : { x: p.x + Math.cos(a0 + i / all * TAU) * Rr * U.rand(0.95, 1.1), y: p.y + Math.sin(a0 + i / all * TAU) * Rr * U.rand(0.95, 1.1) };
      const e = this.spawnEnemy(type, pt.x, pt.y, o); if (!e) return;
      e.pitW = n; e.hp *= hpK; e.maxHp *= hpK; e.dmg *= dmgK;
      if (P.affixes.includes('stone')) e.armor = Math.min(0.75, e.armor + PF.stone);
    };
    for (let i = 0; i < count; i++) one(U.weighted(mix), i, count + elites);
    for (let i = 0; i < elites; i++) one(U.weighted(mix), count + i, count + elites, { elite: true });
    P.alive = count + elites;
    DH.events.emit('run:warning', t('hud.pitWave', { n }));
  };

  /** The Pit is over (time or death): the game settles it (main.js). */
  R.pitOver = function () {
    if (this.state === 'over' || this.pit.done) return;
    this.pit.done = true; this.state = 'over'; DH.audio.play(this.player.hp > 0 ? 'victory' : 'defeat');
    DH.events.emit('run:pitEnd', this);
  };

  const hit = (run, frac) => run.hurtPlayer(run.P.maxHp * frac, null);
  const FX = {
    blades(dt) {
      const B = PF.blades, F = this.pit.fx, p = this.player;
      const S = F.blades || (F.blades = { t: 5, list: [] });
      if ((S.t -= dt) <= 0) {
        S.t = U.rand(B.every[0], B.every[1]);
        const a = Math.random() * TAU, d = U.rand(0, 50);
        S.list.push({ x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, rot: Math.random() * Math.PI / 2, t: -B.warn, hit: [false, false, false, false] });
      }
      for (let i = S.list.length - 1; i >= 0; i--) {
        const X = S.list[i]; X.t += dt;
        if (X.t < 0) continue;
        const along = B.len - X.t * B.speed; // from the ends inwards, through the middle and on
        if (along < -B.len * 1.6) { S.list.splice(i, 1); continue; }
        for (let k = 0; k < 4; k++) {
          const ang = X.rot + k * Math.PI / 2, bx = X.x + Math.cos(ang) * along, by = X.y + Math.sin(ang) * along;
          if (!X.hit[k] && U.dist2(bx, by, p.x, p.y) < (B.r + p.r) ** 2) { X.hit[k] = true; hit(this, B.dmg); }
        }
      }
    },
    stalker(dt) {
      const Q = PF.stalker, F = this.pit.fx, p = this.player;
      const S = F.stalker || (F.stalker = { t: Q.first, s: null, rec: null });
      if (!S.s) {
        if ((S.t -= dt) > 0) return;
        if (!S.rec) { S.rec = { x: p.x, y: p.y, d: U.rand(Q.dist[0], Q.dist[1]), w: Q.wait }; return; } // where the hero stood: it rises a little way off
        if ((S.rec.w -= dt) > 0) return;
        const a = Math.random() * TAU; S.s = { x: S.rec.x + Math.cos(a) * S.rec.d, y: S.rec.y + Math.sin(a) * S.rec.d, t: 0 };
        this.burst(S.s.x, S.s.y, 14, ['#000', '#3a0010', '#ff2040'], 40); DH.events.emit('run:warning', t('hud.pitStalker'));
        return;
      }
      const s = S.s, dx = p.x - s.x, dy = p.y - s.y, d = Math.hypot(dx, dy) || 1;
      s.t += dt; s.x += dx / d * Q.speed * dt; s.y += dy / d * Q.speed * dt; s.near = d < Q.ring + 15;
      if (d < Q.r + p.r) hit(this, 99); // its touch is death (a wraith's veil or a fresh hit's grace still guard)
    },
    stars(dt) {
      const Q = PF.stars, F = this.pit.fx, p = this.player;
      const S = F.stars || (F.stars = { t: 4 });
      if ((S.t -= dt) > 0) return;
      S.t = U.rand(Q.every[0], Q.every[1]);
      const n = U.randi(1, 4), mv = p.moving, a = mv ? Math.atan2(p.dirY, p.dirX) : Math.random() * TAU, sp = this.P.speed * Q.warn;
      for (let k = 0; k < n; k++) { // where the hero will be if they keep going
        const d = mv ? sp * (0.7 + 0.45 * k) : k * Q.R * 1.6, j = U.rand(-0.25, 0.25);
        this.warns.push({ x: p.x + Math.cos(a + j) * d, y: p.y + Math.sin(a + j) * d, R: Q.R, t: Q.warn + k * 0.12, max: Q.warn + k * 0.12, dmg: this.P.maxHp * Q.dmg, star: true });
      }
    },
    beams(dt) {
      const Q = PF.beams, F = this.pit.fx, p = this.player;
      const S = F.beams || (F.beams = { t: 7, cur: null });
      if (S.last) S.last.t -= dt;
      if (!S.cur) {
        if ((S.t -= dt) > 0) return;
        const a = Math.random() < 0.5 ? Math.PI / 4 : -Math.PI / 4;
        S.cur = { a, nx: Math.cos(a + Math.PI / 2), ny: Math.sin(a + Math.PI / 2), off: Math.random() * Q.width * 2, set: 0, t: Q.warnA, flash: 0 };
        return;
      }
      const B = S.cur; B.t -= dt; B.flash = Math.max(0, B.flash - dt);
      if (B.t > 0) return;
      const s = p.x * B.nx + p.y * B.ny + B.off, idx = Math.floor(s / Q.width), even = ((idx % 2) + 2) % 2 === 0;
      if ((B.set === 0) === even) hit(this, Q.dmg);
      B.flash = 0.25; this.shake = Math.max(this.shake, 3); DH.audio.play('boom');
      if (B.set === 0) { B.set = 1; B.t = Q.warnB; } else { S.cur = null; S.t = U.rand(Q.every[0], Q.every[1]); S.last = { b: B, t: 0.25 }; }
    },
    mist(dt) {
      const Q = PF.mist, F = this.pit.fx, p = this.player;
      const S = F.mist || (F.mist = { t: 3, life: 0, list: [], tick: 0 });
      if (!S.list.length) {
        if ((S.t -= dt) > 0) return;
        const a0 = Math.random() * TAU;
        for (let i = 0; i < Q.n; i++) S.list.push({ x: p.x + Math.cos(a0 + i / Q.n * TAU) * Q.dist, y: p.y + Math.sin(a0 + i / Q.n * TAU) * Q.dist, ph: Math.random() * TAU });
        S.life = Q.life; return;
      }
      if ((S.life -= dt) <= 0) { S.list.length = 0; S.t = Q.gap; return; } // they thin out now and then: a breath of clean air
      let inside = false;
      for (const c of S.list) {
        const dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy) || 1, v = Math.min(Q.max, d * Q.pull); // fast from afar, a crawl up close
        c.x += dx / d * v * dt; c.y += dy / d * v * dt; c.ph += dt;
        if (d < Q.R + p.r * 0.5) inside = true;
      }
      if (inside && (S.tick -= dt) <= 0) { S.tick = Q.tick; hit(this, Q.dmg); } else if (!inside) S.tick = 0;
    },
  };

  /** The hazards on the ground and the Stalker (render.js, under the foes). */
  R.drawPit = function (g, cx, cy, now, lights) {
    const F = this.pit.fx, v = DH.view;
    const B = F.blades;
    if (B) for (const X of B.list) {
      const L = PF.blades.len, warn = X.t < 0, k = warn ? 1 + X.t / PF.blades.warn : 1;
      g.save(); g.translate(X.x - cx, X.y - cy);
      if (warn) { // the X they will run along
        g.strokeStyle = 'rgba(255,40,40,' + (0.18 + 0.25 * k + 0.12 * Math.sin(now * 18)) + ')'; g.lineWidth = 10; g.lineCap = 'butt';
        for (let q = 0; q < 2; q++) { const ang = X.rot + q * Math.PI / 2; g.beginPath(); g.moveTo(-Math.cos(ang) * L, -Math.sin(ang) * L * 0.6); g.lineTo(Math.cos(ang) * L, Math.sin(ang) * L * 0.6); g.stroke(); }
      } else {
        const along = L - X.t * PF.blades.speed;
        for (let q = 0; q < 4; q++) {
          if (X.hit[q] && along < 0 && along < -L * 1.5) continue;
          const ang = X.rot + q * Math.PI / 2, bx = Math.cos(ang) * along, by = Math.sin(ang) * along * 0.6, sp = now * 22 + q;
          g.save(); g.translate(bx, by); g.rotate(sp);
          g.fillStyle = '#d8dde8'; g.strokeStyle = '#3a3f4a'; g.lineWidth = 1;
          for (let w = 0; w < 4; w++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, -1.5); g.lineTo(9, 0); g.lineTo(0, 1.5); g.closePath(); g.fill(); g.stroke(); }
          g.restore();
          lights.push({ x: X.x + bx, y: X.y + by / 0.6, r: 18, kind: 'tint', color: '#c8d8ff', a: 0.5 });
        }
      }
      g.restore();
    }
    const M = F.mist;
    if (M) for (const c of M.list) {
      const x = c.x - cx, y = c.y - cy, R = PF.mist.R, fade = Math.min(1, M.life / 2);
      g.fillStyle = 'rgba(80,190,60,' + (0.28 * fade) + ')';
      for (let i = 0; i < 5; i++) { const a = c.ph * 0.8 + i * 1.26, rr = R * (0.55 + 0.15 * Math.sin(c.ph * 2 + i)); g.beginPath(); g.ellipse(x + Math.cos(a) * R * 0.35, y + Math.sin(a) * R * 0.22, rr, rr * 0.62, 0, 0, TAU); g.fill(); }
      g.strokeStyle = 'rgba(255,60,50,' + (0.55 * fade) + ')'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, R, R * 0.6, 0, 0, TAU); g.stroke();
    }
    const S = F.beams, cur = S && (S.cur || (S.last && S.last.t > 0 ? S.last.b : null));
    if (cur) { // the stripes, drawn in the world: each covers one band of the cut across the hall
      const W = PF.beams.width, wx = cx + v.w / 2, wy = cy + v.h / 2, D = Math.hypot(v.w, v.h) / 2 + 40;
      const dx = Math.cos(cur.a), dy = Math.sin(cur.a), sC = wx * cur.nx + wy * cur.ny, tc = wx * dx + wy * dy;
      const firing = S.cur ? (cur.set === 0 ? 0 : 1) : 1, warnK = S.cur ? 1 - cur.t / (cur.set === 0 ? PF.beams.warnA : PF.beams.warnB) : 1;
      for (let k = Math.floor((sC - D + cur.off) / W) - 1; k <= Math.ceil((sC + D + cur.off) / W) + 1; k++) {
        const even = ((k % 2) + 2) % 2 === 0, set = even ? 0 : 1;
        const isNow = set === firing, burnt = S.cur && cur.set === 1 && set === 0 && cur.flash > 0;
        if (!isNow && !burnt) continue;
        const s0 = k * W - cur.off, s1 = s0 + W, pts = [[s0, tc - D], [s0, tc + D], [s1, tc + D], [s1, tc - D]];
        g.fillStyle = burnt || (cur.flash > 0 && !S.cur) ? 'rgba(255,230,200,0.55)' : 'rgba(255,40,30,' + (0.1 + 0.28 * warnK) + ')';
        g.beginPath(); pts.forEach(([s, tt], i) => { const X = cur.nx * s + dx * tt - cx, Y = cur.ny * s + dy * tt - cy; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.closePath(); g.fill();
      }
    }
    const T = F.stalker && F.stalker.s;
    if (T) { // a hooded shade in a red ring; a red "!" when it is close
      const x = T.x - cx, y = T.y - cy, Q = PF.stalker, bob = Math.sin(now * 3) * 1.5;
      g.strokeStyle = 'rgba(255,30,50,' + (0.45 + 0.2 * Math.sin(now * 5)) + ')'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y + 4, Q.ring, Q.ring * 0.6, 0, 0, TAU); g.stroke();
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(x, y + 5, 7, 3, 0, 0, TAU); g.fill();
      g.fillStyle = '#0c0610'; g.beginPath(); g.moveTo(x - 7, y + 5); g.quadraticCurveTo(x - 6, y - 10 + bob, x, y - 16 + bob); g.quadraticCurveTo(x + 6, y - 10 + bob, x + 7, y + 5); g.closePath(); g.fill();
      g.fillStyle = '#ff2848'; g.fillRect(x - 3, y - 10 + bob, 2, 1.5); g.fillRect(x + 1, y - 10 + bob, 2, 1.5);
      lights.push({ x: T.x, y: T.y - 6, r: 26, kind: 'tint', color: '#ff2040', a: 0.45 });
      if (T.near) { g.fillStyle = '#ff3040'; g.font = 'bold 14px sans-serif'; g.textAlign = 'center'; g.fillText('!', x, y - 22 + bob); }
    }
  };
})(window.DH);
