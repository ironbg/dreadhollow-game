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
  /** The Pit's own ground, as in its picture: a deep shaft of rough dark rock around the start (the far and side walls
   *  seen rising, the near one only as a lip), veined with glowing cracks, lava running down it in falls into pools of
   *  fire, rubble at its foot, chains hanging from the rim and an iron fence of spikes along it; now and then a stone
   *  breaks off the rim and falls. R: the floor's mean radius (its edge wavers, rAt); wall: the far wall's height. */
  const AR = C.PIT_ARENA = { R: 240, wall: 104 };
  AR.rAt = (a) => AR.R * (1 + 0.055 * Math.sin(3 * a + 1.3) + 0.035 * Math.sin(5 * a + 0.4) + 0.02 * Math.sin(11 * a + 2.1));
  AR.hAt = (a) => AR.wall * Math.pow(Math.max(0, (-Math.sin(a) + 1.05) / 2.05), 0.55) * (1 + 0.1 * Math.sin(7 * a + 0.9)); // the face seen: all of it far off, most at the sides, none right in front
  AR.falls = [-2.25, -1.35, -0.5]; // the lava falls' angles
  AR.chains = [-2.75, -1.75, -1.05, -0.2];
  AR.torches = [-3.0, -1.95, -0.85, 0.1];

  /** A copy of the hall the Pit's waves come from: its floor and foes from E.PIT.halls, its strength from
   *  E.PIT.hallStats, and none of its own rules (no Lords, puzzles, seals or kill count). */
  R.constructor.pitStage = function (from) {
    const P = E.PIT, tier = Math.min(P.halls.length - 1, Math.floor(from / P.every)), floor = P.halls[tier], st = C.stages[P.hallStats[tier]];
    const def = Object.assign({}, C.stages[floor], { hpMult: st.hpMult, dmgMult: st.dmgMult, dmgGrow: st.dmgGrow, index: st.index, bossHp: st.bossHp,
      bosses: [], dissonator: false, vault: false, lordKills: 0, goldMult: 0, bridge: 0 }); // the Pit's own round arena, even on the viaduct's floor
    return { id: floor, def, tier };
  };

  R.initPit = function () {
    const P = this.pit, from = P.from | 0;
    // none of the hall's own business: no secret, no prisoner, no Hex, no Well, no puzzle
    this.sec = null; this.rescue = null; this.hex = null; this.disso = null; this.wellOpen = false; this.lordKills = 0;
    P.wave = from; P.cleared = 0; P.base = Math.floor(from / E.PIT.every) * E.PIT.every; P.next = 2; P.need = 0; P.got = 0; P.left = 0; P.coming = from + 1; P.fx = {};
    P.combo = { n: 0, t: 0, best: 0 };
    // the strength of the waves skipped: their levels and their tomes, chosen at the start
    const lv = Math.min(45, Math.round(from * 0.8)), tomes = Math.min(5, Math.floor(from / E.PIT.every));
    for (let i = 0; i < lv; i++) { this.level++; this.xpNext = C.xpToNext(this.level, this.stageId); this.pendingLevels++; }
    if (lv) this.recompute(true);
    P.startTomes = tomes; // one Arcane Tome for every ten waves skipped (given when the fight begins: pitBegin); one more for an ad
    pitArt(); // the walls painted now, not on the first frame
    this.revives = 0;
  };

  /** The fight begins (the start screen's Ready): the Arcane Tomes of the start, one after another (each offered when
   *  the one before is chosen, so no ability comes twice), then a tome more for an ad (the adventurer's reward). */
  R.pitBegin = function () {
    const P = this.pit;
    for (let i = 0; i < (P.startTomes || 0); i++) this.queue.push({ state: 'tome', ev: 'run:tome', make: () => { this.tomes++; return Object.assign(this.tomeChoices(3), { mastery: false }); } });
    P.startTomes = 0;
    if (!this.startBonus) this.queue.push({ state: 'startbonus', ev: 'run:startbonus' });
    this.resume();
  };

  /** Each frame in place of the hall's spawning: the clock, the wave's batches, the combo, the pause between waves,
   *  the hazards. A wave is E.PIT.quota(n) kills; its foes come in batches (never more than E.PIT.alive at once) until
   *  the quota is out. The combo (pitKill) counts kills that follow within combo.window seconds; when the wave falls
   *  the next one is max(1, combo / combo.per) waves on (up to combo.max), and the combo starts again. */
  R.updatePit = function (dt) {
    const P = this.pit, EP = E.PIT;
    if (this.time >= (P.secs || EP.secs)) { this.pitOver(); return; }
    const K = P.combo;
    if (K.n > 0 && (K.t -= dt) <= 0) { // the combo ran out: its waves are lost
      if (K.n >= EP.combo.per) this.text(this.player.x, this.player.y - 30, t('hud.comboLost'), '#c06050', true);
      K.n = 0; K.t = 0;
    }
    if (P.left > 0) { // the wave's next batch
      if ((P.bt -= dt) <= 0) {
        P.bt = EP.batchEvery;
        let alive = 0; for (const e of this.enemies) if (e.pitW && !e.dead) alive++;
        const n = Math.min(P.left, EP.batch, EP.alive - alive);
        if (n > 0) { this.pitBatch(n); P.left -= n; }
      }
    } else if (P.need > 0) this.pitStragglers(dt);
    if (P.need > 0 && P.left <= 0 && (P.got >= P.need || !this.enemies.some((e) => e.pitW === P.wave && !e.dead))) { // the wave has fallen (all of it spawned and dead)
      const skip = Math.max(1, Math.min(EP.combo.max, Math.floor(K.n / EP.combo.per)));
      P.cleared += skip; P.need = 0; P.next = this.time + EP.pause; P.coming = P.wave + skip; K.n = 0; K.t = 0;
      this.text(this.player.x, this.player.y - 26, skip > 1 ? t('hud.pitSkip', { n: skip }) : t('hud.pitCleared', { n: P.wave }), '#ffd35a', true); DH.audio.play('reward');
      DH.events.emit('run:warning', t('hud.pitStarting', { n: P.coming }));
    }
    if (!P.need && this.time >= P.next) this.pitWave(P.coming || P.wave + 1);
    for (const k of P.affixes) if (FX[k]) FX[k].call(this, dt);
  };

  /** The last of a wave never hides: every 2 s the ones left far from the hero come down off the wall near him. */
  R.pitStragglers = function (dt) {
    const P = this.pit; if ((P.st = (P.st || 0) - dt) > 0) return; P.st = 2;
    const p = this.player, v = DH.view, Rr = Math.hypot(v.w || 270, v.h || 480) / 2;
    for (const e of this.enemies) {
      if (e.dead || e.def.prop || e.pitW !== P.wave || U.dist2(e.x, e.y, p.x, p.y) < (Rr * 0.8) ** 2) continue;
      const a = Math.random() * TAU, pt = this.pitEntry({ x: p.x + Math.cos(a) * Rr * 0.7, y: p.y + Math.sin(a) * Rr * 0.7 });
      this.burst(e.x, e.y, 6, ['#2a1a20', '#6a3a40'], 30); e.x = pt.x; e.y = pt.y; e.kx = e.ky = 0;
    }
  };

  /** How long the combo waits for the next kill: longer with the Mastery's Combo Master card. */
  R.pitComboWindow = function () { return E.PIT.combo.window * (1 + ((this.pit.perks && this.pit.perks.combo) || 0)); };

  /** A foe of the Pit fell (run.killEnemy): the wave's count and the combo. */
  R.pitKill = function (e) {
    const P = this.pit, K = P.combo;
    if (e.pitW === P.wave || !e.pitW) P.got++; // what the wave's foes call up counts too
    K.n++; K.t = this.pitComboWindow(); K.best = Math.max(K.best, K.n);
  };

  /** Wave n: its quota of kills, stronger by E.PIT.hpGrow / dmgGrow each wave on from the checkpoint; an elite in every
   *  25 of it. Its first batch comes at once, the rest in updatePit. */
  R.pitWave = function (n) {
    const P = this.pit, EP = E.PIT; P.wave = n; P.coming = 0;
    P.need = EP.quota(n); P.got = 0; P.left = P.need; P.bt = 0; P.next = Infinity;
    const k = n - P.base - 1; P.hpK = Math.pow(EP.hpGrow, k); P.dmgK = Math.pow(EP.dmgGrow, k);
    const real = this.time; this.time = ((n - 1) % EP.every) * 55 + 30; P.mix = this.spawnRate().mix; this.time = real; // the hall's mix of that moment
    P.elites = Math.floor(P.need / 25);
    if (!P.cleared) DH.events.emit('run:warning', t('hud.pitWave', { n }));
  };
  /** n foes of the wave, round the edge of the screen (or down off the wall). */
  R.pitBatch = function (n) {
    const P = this.pit, p = this.player, v = DH.view, Rr = Math.hypot(v.w || 270, v.h || 480) / 2 + 14, a0 = Math.random() * TAU;
    for (let i = 0; i < n; i++) {
      const pt = this.pitEntry({ x: p.x + Math.cos(a0 + i / n * TAU) * Rr * U.rand(0.95, 1.1), y: p.y + Math.sin(a0 + i / n * TAU) * Rr * U.rand(0.95, 1.1) });
      const elite = P.elites > 0 && Math.random() < P.elites / Math.max(1, P.left - i) ? (P.elites--, true) : false;
      const e = this.spawnEnemy(U.weighted(P.mix), pt.x, pt.y, elite ? { elite: true } : undefined); if (!e) continue;
      e.pitW = P.wave; e.hp *= P.hpK; e.maxHp *= P.hpK; e.dmg *= P.dmgK;
      if (P.affixes.includes('stone')) e.armor = Math.min(0.75, e.armor + PF.stone);
    }
  };

  /** Where a foe of the wave comes in: round the screen's edge, or, past the wall, down off the wall at the rim
   *  (never right on top of the hero: then from across the pit). */
  R.pitEntry = function (pt) {
    const d = Math.hypot(pt.x, pt.y), A = AR.rAt(Math.atan2(pt.y, pt.x)) - 14, p = this.player;
    if (d <= A) return pt;
    let x = pt.x / d * A, y = pt.y / d * A;
    if (U.dist2(x, y, p.x, p.y) < 130 * 130) { x = -x; y = -y; }
    return { x, y };
  };
  /** Nothing leaves the pit: the hero, the horde, their summons, the loot, the Stalker. */
  R.pitClamp = function () {
    const keep = (o, pad) => { if (!o) return; const d = Math.hypot(o.x, o.y); if (d < AR.R * 0.8) return; const A = AR.rAt(Math.atan2(o.y, o.x)) - pad; if (d > A) { o.x *= A / d; o.y *= A / d; } };
    keep(this.player, 6);
    for (const e of this.enemies) keep(e, Math.min(14, (e.r || 6) * 0.6));
    for (const a of this.allies || []) keep(a, 6);
    for (const k of this.pickups) keep(k, 6);
    const S = this.pit.fx.stalker; if (S && S.s) keep(S.s, 4);
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
  /** The pit's walls, painted once at the floor's pixel density and graded to the game's palette like every sprite.
   *  The faces are cliffs: columns of rock split by black fissures, each column broken into ledged slabs (a lit top, a
   *  face, a shadow under the ledge, lit from the top left and warmed red from the fire below), cut by glowing cracks;
   *  the rim a row of rugged lumps overhanging the drop; rubble of every size at the foot; pools of molten rock under a
   *  floating crust; the ground above scorched and fissured; iron spikes and chains as in the Pit's picture. The lava's
   *  running and the glows: drawPitArena. */
  const PX = 2, AE = AR.R * 1.08 + AR.wall + 60;
  let ART = null;
  const mix = (a, b, k) => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * k));
  const rgb = (c, m) => 'rgb(' + Math.max(0, Math.min(255, Math.round(c[0] * (m || 1)))) + ',' + Math.max(0, Math.min(255, Math.round(c[1] * (m || 1)))) + ',' + Math.max(0, Math.min(255, Math.round(c[2] * (m || 1)))) + ')';
  const pitArt = () => {
    if (ART) return ART;
    const G = DH.gfx, P = G.P, S = Math.round(AE * 2 * PX), c = G.canvas(S, S), g = c.getContext('2d');
    let sd = 4711; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    g.setTransform(PX, 0, 0, PX, AE * PX, AE * PX); g.lineJoin = 'round'; g.lineCap = 'round';
    const N = 240, pts = [];
    for (let i = 0; i < N; i++) { const a = -Math.PI + i / N * Math.PI * 2, rr = AR.rAt(a), x = Math.cos(a) * rr, y = Math.sin(a) * rr; pts.push({ a, x, y, h: AR.hAt(a) }); }
    const top = pts.map((q) => ({ x: q.x, y: q.y - q.h }));
    const poly = (pp) => { g.beginPath(); pp.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
    const floorPath = () => poly(pts.map((q) => [q.x, q.y]));
    const facePath = () => { const pp = pts.map((q) => [q.x, q.y]); for (let i = N - 1; i >= 0; i--) pp.push([top[i].x, top[i].y]); poly(pp); };
    const at = (a2) => { const rr = AR.rAt(a2); return { x: Math.cos(a2) * rr, y: Math.sin(a2) * rr, h: AR.hAt(a2) }; };
    const ROCK_TOP = [122, 106, 100], ROCK_MID = [70, 56, 58], ROCK_LOW = [44, 30, 32], WARM = [150, 52, 30];
    const rockAt = (k) => (k < 0.5 ? mix(ROCK_TOP, ROCK_MID, k * 2) : mix(ROCK_MID, ROCK_LOW, (k - 0.5) * 2)); // k: 0 at the rim, 1 at the foot

    // ---- the ground above: scorched stone slabs, fissured, ash in the cracks, a faint ember here and there
    g.fillStyle = '#211918'; g.fillRect(-AE, -AE, AE * 2, AE * 2);
    for (let i = 0; i < 520; i++) {
      const x = (r() - 0.5) * 2 * AE, y = (r() - 0.5) * 2 * AE, w = 8 + r() * 18, hh = 6 + r() * 12, l = 30 + r() * 16;
      const pp = []; for (let j = 0; j < 6; j++) { const t = j / 6 * Math.PI * 2; pp.push([x + Math.cos(t) * w * (0.7 + r() * 0.35), y + Math.sin(t) * hh * (0.7 + r() * 0.35)]); }
      poly(pp); g.fillStyle = 'rgb(' + (l + 4 | 0) + ',' + (l - 4 | 0) + ',' + (l - 5 | 0) + ')'; g.fill(); g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 1; g.stroke();
      g.strokeStyle = 'rgba(255,230,210,0.07)'; g.beginPath(); g.moveTo(pp[3][0], pp[3][1]); g.lineTo(pp[4][0], pp[4][1]); g.stroke();
    }
    for (let i = 0; i < 40; i++) { let x = (r() - 0.5) * 2 * AE, y = (r() - 0.5) * 2 * AE; const v = [[x, y]]; for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 18; y += (r() - 0.5) * 18; v.push([x, y]); }
      g.strokeStyle = 'rgba(0,0,0,0.8)'; g.lineWidth = 2; g.beginPath(); v.forEach(([a2, b2], j) => (j ? g.lineTo(a2, b2) : g.moveTo(a2, b2))); g.stroke();
      if (r() < 0.35) { g.strokeStyle = 'rgba(200,60,20,0.55)'; g.lineWidth = 0.8; g.stroke(); } }

    // ---- the floor: cut out (the hall's floor shows), darkened and reddened towards the walls
    g.save(); floorPath(); g.globalCompositeOperation = 'destination-out'; g.fill(); g.restore();
    g.save(); floorPath(); g.clip();
    const sh = g.createRadialGradient(0, 0, AR.R * 0.45, 0, 0, AR.R * 1.1); sh.addColorStop(0, 'rgba(30,4,2,0)'); sh.addColorStop(0.65, 'rgba(34,6,3,0.3)'); sh.addColorStop(1, 'rgba(12,2,2,0.8)');
    g.fillStyle = sh; g.fillRect(-AE, -AE, AE * 2, AE * 2);
    g.restore();

    // ---- the cliffs
    g.save(); facePath(); g.clip();
    g.fillStyle = '#120a0b'; g.fillRect(-AE, -AE, AE * 2, AE * 2); // the fissures' dark shows between the slabs
    const pAt = (i, f) => { const q = pts[((Math.round(i) % N) + N) % N]; return [q.x, q.y - q.h * f]; };
    const veins = [];
    for (let i0 = 0; i0 < N;) {
      const w = 2 + (r() * 7 | 0), i1 = Math.min(N, i0 + w), mid = pts[(i0 + (w >> 1)) % N];
      if (mid.h < 3) { i0 = i1; continue; }
      // the column's slabs, from the rim (f = 1) down to the foot (f = 0); each ledge a little uneven
      let f1 = 1;
      while (f1 > 0.001) {
        const f0 = Math.max(0, f1 - (0.16 + r() * 0.2) * (f1 > 0.6 ? 1.2 : 0.9)), jt = () => (r() - 0.5) * 0.04;
        const topE = [], botE = [];
        for (let i = i0; i <= i1; i++) { topE.push(pAt(i, Math.min(1, f1 + jt()))); botE.push(pAt(i, Math.max(0, f0 + jt()))); }
        const inset = 0.6, k = 1 - (f0 + f1) / 2, base = rockAt(k), warm = Math.max(0, (k - 0.55) / 0.45);
        const sx = (r() - 0.5) * 3, col = mix(base, WARM, warm * 0.35), slab = topE.map(([x, y]) => [x + sx, y + inset]).concat(botE.reverse().map(([x, y]) => [x + sx, y - inset])); // some slabs stand out, some sit back
        for (const q2 of slab) q2[0] += (r() - 0.5) * 1.6;
        slab[0][0] += inset; slab[topE.length - 1][0] -= inset; slab[topE.length][0] -= inset; slab[slab.length - 1][0] += inset;
        poly(slab); g.fillStyle = rgb(col, 0.92 + r() * 0.16); g.fill();
        // its lit top (the ledge's upper plane), a highlight down its left, shade down its right, dark under it
        const tH = Math.min(3.2, (f1 - f0) * mid.h * 0.3);
        g.fillStyle = rgb(mix(col, [200, 186, 176], 0.35)); g.beginPath(); topE.forEach(([x, y], j) => (j ? g.lineTo(x, y + inset) : g.moveTo(x + inset, y + inset))); for (let j = topE.length - 1; j >= 0; j--) g.lineTo(topE[j][0], topE[j][1] + inset + tH); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(255,236,220,0.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(slab[0][0] + 0.4, slab[0][1] + tH); g.lineTo(slab[slab.length - 1][0] + 0.4, slab[slab.length - 1][1] - 0.5); g.stroke();
        g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(slab[topE.length - 1][0] - 0.6, slab[topE.length - 1][1] + tH); g.lineTo(slab[topE.length][0] - 0.6, slab[topE.length][1]); g.stroke();
        const bot = slab.slice(topE.length); g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 2; g.beginPath(); bot.forEach(([x, y], j) => (j ? g.lineTo(x, y - 0.6) : g.moveTo(x, y - 0.6))); g.stroke();
        if (warm > 0.2) { g.strokeStyle = 'rgba(255,110,40,' + (warm * 0.45) + ')'; g.lineWidth = 1; g.beginPath(); bot.forEach(([x, y], j) => (j ? g.lineTo(x, y - 1.8) : g.moveTo(x, y - 1.8))); g.stroke(); } // the fire's glow on its underside
        // pits and grit on its face
        const area = Math.abs((f1 - f0) * mid.h * w * 6);
        for (let j = 0; j < area / 28; j++) { const u = r(), v = r(), [x, y] = pAt(i0 + u * (i1 - i0), f0 + (f1 - f0) * (0.15 + v * 0.7)); g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.3)' : 'rgba(255,230,210,0.08)'; g.fillRect(x, y, 1 + r(), 1); }
        // a crack across it now and then
        if (r() < 0.22) { const [x, y] = pAt(i0 + r() * (i1 - i0), f0 + (f1 - f0) * (0.3 + r() * 0.5)); g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y + 3 + r() * 4); g.lineTo(x + (r() - 0.5) * 8, y + 6 + r() * 4); g.stroke(); }
        f1 = f0;
      }
      // now and then a glowing vein runs down the column's fissure
      if (mid.h > 30 && r() < 0.22) {
        const v = []; let f = 0.25 + r() * 0.35; const ii = i1;
        while (f > 0) { const [x, y] = pAt(ii, f); v.push([x + (r() - 0.5) * 2, y]); f -= 0.07 + r() * 0.06; }
        v.push(pAt(ii, 0)); veins.push(v);
        for (const [w2, cc] of [[3.4, 'rgba(110,14,6,0.9)'], [1.8, '#ff5a18'], [0.8, '#ffd27a']]) { g.strokeStyle = cc; g.lineWidth = w2; g.beginPath(); v.forEach(([a2, b2], j) => (j ? g.lineTo(a2, b2) : g.moveTo(a2, b2))); g.stroke(); }
      }
      i0 = i1;
    }
    // great boulders bedded in the cliffs, breaking up the columns
    for (let j = 0; j < 46; j++) {
      const i = r() * N | 0, q = pts[i]; if (q.h < 30) continue;
      const f = 0.15 + r() * 0.7, [x, y] = pAt(i, f), w = 6 + r() * 9, hh = w * (0.6 + r() * 0.25), k = 1 - f, base = mix(rockAt(k), WARM, Math.max(0, (k - 0.55) / 0.45) * 0.3), pp = [];
      for (let m = 0; m < 8; m++) { const t = m / 8 * Math.PI * 2; pp.push([x + Math.cos(t) * w * (0.75 + r() * 0.3), y + Math.sin(t) * hh * (0.75 + r() * 0.3)]); }
      P.ell(g, x + 1.5, y + hh * 0.9, w * 0.95, hh * 0.35, 'rgba(0,0,0,0.6)');
      poly(pp); g.fillStyle = rgb(base, 1.05); g.fill(); g.strokeStyle = '#0a0606'; g.lineWidth = 1.2; g.stroke();
      g.fillStyle = rgb(mix(base, [210, 196, 186], 0.32)); g.beginPath(); g.ellipse(x - w * 0.25, y - hh * 0.35, w * 0.55, hh * 0.32, -0.25, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.32)'; g.beginPath(); g.ellipse(x + w * 0.3, y + hh * 0.35, w * 0.5, hh * 0.3, 0.2, 0, Math.PI * 2); g.fill();
      if (r() < 0.4) { g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x - w * 0.2, y - hh * 0.6); g.lineTo(x, y); g.lineTo(x + w * 0.1, y + hh * 0.6); g.stroke(); }
    }
    // the lava falls' channels: worn smooth and scorched, the rock beside them glowing
    for (const fa of AR.falls) { const q = at(fa); const gl = g.createLinearGradient(q.x - 18, 0, q.x + 18, 0); gl.addColorStop(0, 'rgba(255,80,20,0)'); gl.addColorStop(0.3, 'rgba(255,90,30,0.35)'); gl.addColorStop(0.5, 'rgba(20,4,2,0.95)'); gl.addColorStop(0.7, 'rgba(255,90,30,0.35)'); gl.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gl; g.fillRect(q.x - 18, q.y - q.h - 2, 36, q.h + 6); }
    g.restore();

    // ---- the rim: rugged lumps of rock overhanging the drop, lit on top, dark beneath
    for (let i = 0; i < N; i += 2) {
      const q = pts[i], t2 = top[i]; if (q.h < 3) continue;
      const w = 4 + r() * 5, hh = 2.5 + r() * 3, x = t2.x + (r() - 0.5) * 3, y = t2.y - 1 - r() * 2;
      P.ell(g, x, y + hh * 0.9, w * 1.05, hh * 0.6, 'rgba(0,0,0,0.55)'); // its shadow on the face below
      const pp = []; for (let j = 0; j < 7; j++) { const t = j / 7 * Math.PI * 2; pp.push([x + Math.cos(t) * w * (0.75 + r() * 0.3), y + Math.sin(t) * hh * (0.75 + r() * 0.3)]); }
      poly(pp); g.fillStyle = rgb(mix(ROCK_TOP, ROCK_MID, 0.35 + r() * 0.3)); g.fill(); g.strokeStyle = '#0a0606'; g.lineWidth = 1; g.stroke();
      g.fillStyle = 'rgba(255,236,220,0.22)'; g.beginPath(); g.ellipse(x - w * 0.2, y - hh * 0.35, w * 0.55, hh * 0.35, 0, 0, Math.PI * 2); g.fill();
    }
    // iron spikes along the far rim, a rail across them (as in the Pit's picture)
    let prev = null;
    for (let i = 0; i < N; i += 3) {
      const q = top[i]; if (pts[i].h < AR.wall * 0.5) { prev = null; continue; }
      const x = q.x, y = q.y - 6;
      if (prev) { g.strokeStyle = '#080506'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(prev.x, prev.y - 6); g.lineTo(x, y - 6); g.stroke(); g.strokeStyle = '#5a5054'; g.lineWidth = 0.6; g.stroke(); }
      g.fillStyle = '#080506'; g.fillRect(x - 1, y - 11, 2, 12); g.beginPath(); g.moveTo(x - 2.4, y - 11); g.lineTo(x, y - 17); g.lineTo(x + 2.4, y - 11); g.fill();
      g.fillStyle = '#6a6064'; g.fillRect(x - 0.4, y - 10, 0.8, 9); g.fillRect(x - 0.4, y - 15, 0.8, 3);
      prev = { x, y };
    }
    // chains hanging from staples in the rim, sagging down the faces
    for (const ca of AR.chains) {
      const q = at(ca), len = q.h * (0.6 + r() * 0.25);
      for (let y = 0, n = 0; y < len; y += 2.6, n++) { const sx = Math.sin(y * 0.06) * 1.6, x = q.x + sx, yy = q.y - q.h + y; g.fillStyle = '#0a0708'; g.fillRect(x - (n % 2 ? 1.3 : 0.7), yy - 0.3, n % 2 ? 2.6 : 1.4, 3.2); g.fillStyle = n % 2 ? '#7a7074' : '#4a4246'; g.fillRect(x - (n % 2 ? 0.8 : 0.3), yy + 0.2, n % 2 ? 1.6 : 0.6, 2.2); }
      g.fillStyle = '#080506'; g.fillRect(q.x - 3.5, q.y - q.h - 3, 7, 3.5); g.fillStyle = '#5a5054'; g.fillRect(q.x - 3, q.y - q.h - 2.6, 6, 1);
    }
    // the near rim (no face seen): an overhang of dark stones over the floor
    for (let i = 0; i < N; i += 2) {
      const q = pts[i]; if (q.h >= 3) continue;
      const k = 1.02 + r() * 0.03, x = q.x * k, y = q.y * k, w = 5 + r() * 5, hh = 3 + r() * 3;
      P.ell(g, x - Math.cos(q.a) * 3, y - Math.sin(q.a) * 3, w, hh * 0.6, 'rgba(0,0,0,0.5)');
      const pp = []; for (let j = 0; j < 7; j++) { const t = j / 7 * Math.PI * 2; pp.push([x + Math.cos(t) * w * (0.75 + r() * 0.3), y + Math.sin(t) * hh * (0.75 + r() * 0.3)]); }
      poly(pp); g.fillStyle = rgb(mix([52, 40, 40], [80, 66, 64], r())); g.fill(); g.strokeStyle = '#080505'; g.lineWidth = 1; g.stroke();
      g.fillStyle = 'rgba(255,236,220,0.14)'; g.beginPath(); g.ellipse(x - w * 0.2, y - hh * 0.3, w * 0.5, hh * 0.3, 0, 0, Math.PI * 2); g.fill();
    }

    // ---- rubble at the foot of the walls: boulders, stones and gravel, each lit from the top left
    const stone = (x, y, s2, hot) => {
      P.ell(g, x + s2 * 0.6, y + s2 * 0.9, s2 * 1.3, s2 * 0.55, 'rgba(0,0,0,0.55)');
      const pp = []; for (let j = 0; j < 6; j++) { const t = j / 6 * Math.PI * 2 + r() * 0.4; pp.push([x + Math.cos(t) * s2 * (0.8 + r() * 0.35), y + Math.sin(t) * s2 * 0.75 * (0.8 + r() * 0.35)]); }
      poly(pp); g.fillStyle = '#0a0606'; g.fill(); g.strokeStyle = '#0a0606'; g.lineWidth = 1.2; g.stroke();
      const base = mix(ROCK_MID, ROCK_TOP, r() * 0.5); g.fillStyle = rgb(base); g.fill();
      g.fillStyle = rgb(mix(base, [210, 196, 186], 0.35)); g.beginPath(); g.ellipse(x - s2 * 0.25, y - s2 * 0.3, s2 * 0.5, s2 * 0.3, -0.3, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(x + s2 * 0.3, y + s2 * 0.3, s2 * 0.45, s2 * 0.25, 0.3, 0, Math.PI * 2); g.fill();
      if (hot) { g.strokeStyle = 'rgba(255,100,30,0.6)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(pp[0][0], pp[0][1]); g.lineTo(pp[1][0], pp[1][1]); g.lineTo(pp[2][0], pp[2][1]); g.stroke(); }
    };
    for (let i = 0; i < N; i++) {
      const q = pts[i]; if (q.h < 3) continue;
      if (r() < 0.3) stone(q.x * (0.955 + r() * 0.03), q.y * (0.955 + r() * 0.03), 2.6 + r() * 3.6, r() < 0.2);
      for (let j = 0; j < 3; j++) { const k = 0.9 + r() * 0.08; g.fillStyle = r() < 0.5 ? '#3a2e2e' : '#5a4c4a'; g.fillRect(q.x * k + (r() - 0.5) * 4, q.y * k + (r() - 0.5) * 3, 1 + r(), 1); } // gravel
    }
    // ---- the lava pools under the falls: molten rock under a floating crust, rimmed with rocks
    const pools = [];
    for (const fa of AR.falls) {
      const q = at(fa), px = q.x * 0.97, py = q.y * 0.97 + 6, pp = [];
      for (let j = 0; j < 14; j++) { const t = j / 14 * Math.PI * 2; pp.push([px + Math.cos(t) * (20 + r() * 6), py + Math.sin(t) * (8 + r() * 3)]); }
      poly(pp); g.fillStyle = '#1a0604'; g.fill(); g.strokeStyle = '#080404'; g.lineWidth = 3; g.stroke();
      g.save(); poly(pp); g.clip();
      const lg = g.createRadialGradient(px - 4, py - 2, 1, px, py, 26); lg.addColorStop(0, '#fff0a0'); lg.addColorStop(0.3, '#ffa030'); lg.addColorStop(0.7, '#e04010'); lg.addColorStop(1, '#801808');
      g.fillStyle = lg; g.fillRect(px - 30, py - 14, 60, 28);
      for (let j = 0; j < 9; j++) { // crust plates drifting on it, glowing at their edges
        const cx2 = px + (r() - 0.5) * 34, cy2 = py + (r() - 0.5) * 12, w = 3 + r() * 5, hh = 1.6 + r() * 2.2, cp = [];
        for (let k = 0; k < 5; k++) { const t = k / 5 * Math.PI * 2 + r(); cp.push([cx2 + Math.cos(t) * w, cy2 + Math.sin(t) * hh]); }
        poly(cp); g.fillStyle = '#2a1210'; g.fill(); g.strokeStyle = '#ffb040'; g.lineWidth = 0.6; g.stroke();
      }
      g.restore();
      for (let j = 0; j < 7; j++) { const t = Math.PI * (0.05 + j / 6 * 0.9); stone(px + Math.cos(t) * 24, py + Math.sin(t) * 10, 2.2 + r() * 2, true); }
      pools.push({ x: px, y: py });
      // its source on the ground above: a molten channel winding to the rim
      const sx = q.x, sy = q.y - q.h;
      const curve = () => { g.beginPath(); g.moveTo(sx, sy + 2); g.bezierCurveTo(sx + 8, sy - 8, sx - 12, sy - 14, sx - 22, sy - 24); };
      curve(); g.strokeStyle = '#0a0404'; g.lineWidth = 13; g.stroke(); g.strokeStyle = '#7a1a08'; g.lineWidth = 9; g.stroke(); g.strokeStyle = '#ff7a20'; g.lineWidth = 5; g.stroke(); g.strokeStyle = '#ffd890'; g.lineWidth = 1.6; g.stroke();
    }
    const id = g.getImageData(0, 0, S, S); G.quantize(id, { dither: 5, sat: 1, contrast: 1.06 }); g.putImageData(id, 0, 0);
    c.veins = veins; c.pools = pools;
    // the falling lava's texture: molten streaks that tile from top to bottom (scrolled to make it run)
    const LW = 16, LH = 64, lt = G.canvas(LW * PX, LH * PX), lg2 = lt.getContext('2d'); lg2.scale(PX, PX);
    const lgr = lg2.createLinearGradient(0, 0, LW, 0); lgr.addColorStop(0, '#9a2008'); lgr.addColorStop(0.25, '#ff6a18'); lgr.addColorStop(0.5, '#ffc050'); lgr.addColorStop(0.75, '#ff6a18'); lgr.addColorStop(1, '#9a2008');
    lg2.fillStyle = lgr; lg2.fillRect(0, 0, LW, LH);
    for (let j = 0; j < 40; j++) { const x = r() * LW, y = r() * LH, l = 4 + r() * 12; lg2.fillStyle = r() < 0.55 ? 'rgba(255,240,170,0.8)' : 'rgba(90,14,4,0.7)'; lg2.fillRect(x, y, 1, l); if (y + l > LH) lg2.fillRect(x, y - LH, 1, l); }
    c.lava = lt; c.lavaH = LH;
    return (ART = c);
  };

  /** The pit, drawn right after the floor: the painted walls (pitArt), the ground beyond them, then what moves: lava
   *  running down its falls and glowing in its pools and veins, the torches' flames, and now and then a stone falling
   *  from the rim to break at the foot. */
  R.drawPitArena = function (g, cx, cy, W, H, now, lights) {
    const art = pitArt(), ox = -cx, oy = -cy;
    g.save();
    g.fillStyle = '#1b1414'; // beyond the painting: more of the ground
    if (oy - AE > 0) g.fillRect(0, 0, W, oy - AE); if (oy + AE < H) g.fillRect(0, oy + AE, W, H - oy - AE);
    if (ox - AE > 0) g.fillRect(0, 0, ox - AE, H); if (ox + AE < W) g.fillRect(ox + AE, 0, W - ox - AE, H);
    g.imageSmoothingEnabled = false; g.drawImage(art, ox - AE, oy - AE, AE * 2, AE * 2);
    const vis = (x, y, m) => x > -m && x < W + m && y > -m && y < H + m;
    // the lava falls: the molten texture running down a wavering channel, bright at its heart, a crust at its edges;
    // where it spills over the rim and where it plunges into its pool it flares
    for (const fa of AR.falls) {
      const rr = AR.rAt(fa), x = ox + Math.cos(fa) * rr, y = oy + Math.sin(fa) * rr, hh = AR.hAt(fa), top = y - hh;
      if (!vis(x, (y + top) / 2, hh)) continue;
      const wv = (yy) => 6 + 1.6 * Math.sin(yy * 0.12 + now * 2 + fa) + 1.2 * Math.sin(yy * 0.31 - now * 3);
      g.save(); g.beginPath();
      for (let yy = 0; yy <= hh + 6; yy += 3) g.lineTo(x - wv(yy) + Math.sin(yy * 0.05 + fa) * 1.5, top + yy);
      for (let yy = hh + 6; yy >= 0; yy -= 3) g.lineTo(x + wv(yy + 40) + Math.sin(yy * 0.05 + fa) * 1.5, top + yy);
      g.closePath(); g.clip();
      const lh = art.lavaH, off = (now * 34 + fa * 50) % lh;
      g.imageSmoothingEnabled = false;
      for (let yy = top - lh + off; yy < y + 8; yy += lh) g.drawImage(art.lava, x - 9, yy, 18, lh);
      g.restore();
      g.strokeStyle = 'rgba(60,8,4,0.85)'; g.lineWidth = 1.4; g.beginPath(); for (let yy = 0; yy <= hh + 4; yy += 3) g.lineTo(x - wv(yy) + Math.sin(yy * 0.05 + fa) * 1.5, top + yy); g.stroke();
      g.beginPath(); for (let yy = 0; yy <= hh + 4; yy += 3) g.lineTo(x + wv(yy + 40) + Math.sin(yy * 0.05 + fa) * 1.5, top + yy); g.stroke();
      g.save(); g.globalCompositeOperation = 'lighter';
      const fl = 0.75 + 0.25 * Math.sin(now * 5 + fa * 2);
      for (const [yy, rad] of [[top + 2, 12], [y + 4, 22]]) { const gl = g.createRadialGradient(x, yy, 1, x, yy, rad * fl + 6); gl.addColorStop(0, 'rgba(255,200,110,0.55)'); gl.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gl; g.fillRect(x - rad - 8, yy - rad - 8, rad * 2 + 16, rad * 2 + 16); }
      g.restore();
      for (let k = 0; k < 5; k++) { const t2 = (now * 1.4 + k / 5) % 1, sx = x + Math.sin(k * 2.1 + fa) * 9 * t2, sy = y + 2 - Math.sin(t2 * Math.PI) * 9; g.fillStyle = 'rgba(255,' + (200 - t2 * 120 | 0) + ',80,' + (1 - t2) + ')'; g.fillRect(sx, sy, 1.6, 1.6); } // molten droplets thrown up
      lights.push({ x: x + cx, y: y + cy, r: 64, kind: 'lava' });
      lights.push({ x: x + cx, y: top + hh * 0.4 + cy, r: 42, kind: 'lava' });
    }
    // the pools' surface breathing, bubbles rising and bursting
    for (let i = 0; i < art.pools.length; i++) {
      const q = art.pools[i], x = ox + q.x, y = oy + q.y; if (!vis(x, y, 40)) continue;
      g.save(); g.globalCompositeOperation = 'lighter';
      const pl = g.createRadialGradient(x, y, 1, x, y, 24); pl.addColorStop(0, 'rgba(255,170,60,' + (0.22 + 0.12 * Math.sin(now * 2 + i)) + ')'); pl.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = pl; g.fillRect(x - 26, y - 14, 52, 28);
      g.restore();
      for (let k = 0; k < 3; k++) { const t2 = (now * 0.7 + k / 3 + i * 0.37) % 1, bx = x + Math.sin(k * 2.7 + i) * 13, by = y + Math.cos(k * 1.9 + i) * 4; g.strokeStyle = 'rgba(255,230,140,' + (1 - t2) + ')'; g.lineWidth = 0.8; g.beginPath(); g.arc(bx, by, 0.6 + t2 * 2.4, Math.PI, 0); g.stroke(); }
    }
    // the veins' glow breathing
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < art.veins.length; i++) {
      const v = art.veins[i], [x0, y0] = v[0], [x1, y1] = v[v.length - 1], mx = ox + (x0 + x1) / 2, my = oy + (y0 + y1) / 2; if (!vis(mx, my, 40)) continue;
      const a2 = 0.1 + 0.12 * Math.sin(now * 1.6 + i * 1.3);
      g.strokeStyle = 'rgba(255,100,40,' + a2 + ')'; g.lineWidth = 5; g.beginPath(); v.forEach(([a3, b3], j) => (j ? g.lineTo(ox + a3, oy + b3) : g.moveTo(ox + a3, oy + b3))); g.stroke();
    }
    g.restore();
    // torches on the walls
    for (const ta of AR.torches) {
      const rr = AR.rAt(ta), x = ox + Math.cos(ta) * rr, y = oy + Math.sin(ta) * rr - AR.hAt(ta) * 0.5;
      if (!vis(x, y, 40)) continue;
      const fl = 0.8 + 0.2 * Math.sin(now * 9 + ta * 3);
      g.fillStyle = '#1a1210'; g.fillRect(x - 1.5, y - 2, 3, 9); g.fillStyle = '#4a3a2e'; g.fillRect(x - 3, y - 3, 6, 2);
      g.fillStyle = '#ff9a3a'; g.beginPath(); g.moveTo(x - 3, y - 3); g.quadraticCurveTo(x, y - 12 * fl, x + 3, y - 3); g.fill();
      g.fillStyle = '#ffe0a0'; g.beginPath(); g.moveTo(x - 1.4, y - 3); g.quadraticCurveTo(x, y - 7 * fl, x + 1.4, y - 3); g.fill();
      if (lights) lights.push({ x: x + cx, y: y + cy, r: 50, kind: 'brazier' });
    }
    // a stone breaks off the rim now and then, falls down the face (spinning, trailing dust) and shatters at the foot
    const RK = this.pitRocks || (this.pitRocks = { t: 2, list: [] }), dt = Math.min(0.1, now - (RK.last || now)); RK.last = now;
    if ((RK.t -= dt) <= 0) {
      RK.t = 1.2 + Math.random() * 2.2;
      const a2 = -Math.PI * (0.05 + Math.random() * 0.9), q = { rr: AR.rAt(a2), a: a2 }, x = Math.cos(a2) * q.rr, y = Math.sin(a2) * q.rr, hh = AR.hAt(a2);
      if (hh > 20) RK.list.push({ x: x + (Math.random() - 0.5) * 6, y0: y - hh, y1: y + 2, t: 0, s: 1.6 + Math.random() * 2, spin: Math.random() * 6 });
    }
    for (let i = RK.list.length - 1; i >= 0; i--) {
      const k = RK.list[i]; k.t += dt;
      const fall = Math.sqrt((k.y1 - k.y0) / 260), x = ox + k.x;
      if (k.t < fall) {
        const y = oy + k.y0 + 130 * k.t * k.t; if (!vis(x, y, 20)) continue;
        g.fillStyle = 'rgba(80,70,66,0.4)'; g.fillRect(x - 0.5, y - 10, 1, 8); // its dust trail
        g.save(); g.translate(x, y); g.rotate(k.spin + k.t * 8); g.fillStyle = '#0c0808'; g.fillRect(-k.s - 0.6, -k.s - 0.6, k.s * 2 + 1.2, k.s * 2 + 1.2); g.fillStyle = '#5a4c4a'; g.fillRect(-k.s, -k.s, k.s * 2, k.s * 2); g.fillStyle = '#8a7a74'; g.fillRect(-k.s, -k.s, k.s, 1); g.restore();
      } else {
        const u = (k.t - fall) / 0.6; if (u >= 1) { RK.list.splice(i, 1); continue; }
        const y = oy + k.y1; if (!vis(x, y, 20)) continue;
        for (let j = 0; j < 6; j++) { const a3 = -Math.PI * (j + 0.5) / 6, d = u * (6 + j % 3 * 3); g.fillStyle = 'rgba(110,96,90,' + (1 - u) + ')'; g.fillRect(x + Math.cos(a3) * d, y + Math.sin(a3) * d * 0.6 + u * u * 6, 1.6, 1.6); }
        g.fillStyle = 'rgba(90,80,76,' + (0.35 * (1 - u)) + ')'; g.beginPath(); g.ellipse(x, y - 2, 4 + u * 10, 2 + u * 4, 0, 0, Math.PI * 2); g.fill();
      }
    }
    g.restore();
  };

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
