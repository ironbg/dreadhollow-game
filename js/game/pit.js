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
  /** The pit's walls, painted once (at the floor's pixel density, then graded to the game's palette like every sprite):
   *  scorched ground above, the faces of broken dark rock (lit red from below, darker at the foot) veined with glowing
   *  cracks, the lava falls' channels and their pools of fire, rubble along the foot, an iron fence of spikes on the far
   *  rim, the near rim as a lip over the floor, the floor reddening and darkening towards the walls. What moves (the lava
   *  flowing, the fire's glow, the torches, the falling stones): drawPitArena. */
  const PX = 2, AE = AR.R * 1.08 + AR.wall + 60;
  let ART = null;
  const pitArt = () => {
    if (ART) return ART;
    const G = DH.gfx, P = G.P, S = Math.round(AE * 2 * PX), c = G.canvas(S, S), g = c.getContext('2d');
    let sd = 4711; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    g.setTransform(PX, 0, 0, PX, AE * PX, AE * PX); g.lineJoin = 'round'; g.lineCap = 'round';
    const N = 240, pts = [];
    for (let i = 0; i < N; i++) { const a = -Math.PI + i / N * Math.PI * 2, rr = AR.rAt(a), x = Math.cos(a) * rr, y = Math.sin(a) * rr; pts.push({ a, x, y, h: AR.hAt(a) }); }
    const top = pts.map((q) => ({ x: q.x, y: q.y - q.h }));
    const floorPath = () => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); g.closePath(); };
    const facePath = () => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); for (let i = N - 1; i >= 0; i--) g.lineTo(top[i].x, top[i].y); g.closePath(); };
    const at = (a2) => { const rr = AR.rAt(a2); return { x: Math.cos(a2) * rr, y: Math.sin(a2) * rr, h: AR.hAt(a2) }; };
    // the ground above: scorched dark stone, cracked, with ash
    g.fillStyle = '#1e1716'; g.fillRect(-AE, -AE, AE * 2, AE * 2);
    for (let i = 0; i < 700; i++) { const x = (r() - 0.5) * 2 * AE, y = (r() - 0.5) * 2 * AE, k = r(); g.fillStyle = k < 0.5 ? 'rgba(48,38,36,0.6)' : k < 0.8 ? 'rgba(12,8,8,0.55)' : 'rgba(90,80,76,0.25)'; g.beginPath(); g.ellipse(x, y, 3 + r() * 10, 2 + r() * 6, r() * 3, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 1;
    for (let i = 0; i < 160; i++) { let x = (r() - 0.5) * 2 * AE, y = (r() - 0.5) * 2 * AE; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 3; k++) { x += (r() - 0.5) * 16; y += (r() - 0.5) * 16; g.lineTo(x, y); } g.stroke(); }
    // the floor: cut out (the hall's floor shows), then darkened and reddened towards the walls
    g.save(); floorPath(); g.globalCompositeOperation = 'destination-out'; g.fill(); g.restore();
    g.save(); floorPath(); g.clip();
    const sh = g.createRadialGradient(0, 0, AR.R * 0.5, 0, 0, AR.R * 1.1); sh.addColorStop(0, 'rgba(30,4,2,0)'); sh.addColorStop(0.7, 'rgba(30,4,2,0.35)'); sh.addColorStop(1, 'rgba(14,2,2,0.75)');
    g.fillStyle = sh; g.fillRect(-AE, -AE, AE * 2, AE * 2);
    g.restore();
    // the faces: broken dark rock, lit red from the fire below and darker in the middle
    g.save(); facePath(); g.clip();
    const fg = g.createLinearGradient(0, -AR.R * 1.1 - AR.wall, 0, AR.R * 0.4); fg.addColorStop(0, '#5a4a48'); fg.addColorStop(0.5, '#3a2c2e'); fg.addColorStop(1, '#2a1616');
    g.fillStyle = fg; g.fillRect(-AE, -AE, AE * 2, AE * 2);
    for (let i = 0; i < N; i += 2) {
      const q = pts[i]; if (q.h < 4) continue;
      for (let y = q.y - q.h - 2; y < q.y + 4; y += 8 + r() * 5) {
        const k = (y - (q.y - q.h)) / Math.max(1, q.h), x = q.x + (r() - 0.5) * 8, rad = 5 + r() * 5, pp = [];
        for (let j = 0; j < 7; j++) { const t = j / 7 * Math.PI * 2; pp.push([x + Math.cos(t) * rad * (0.7 + r() * 0.5), y + Math.sin(t) * rad * 0.7 * (0.7 + r() * 0.5)]); }
        const l = Math.round(104 - Math.sin(k * Math.PI) * 50 - k * 10 + (r() - 0.5) * 18), red = Math.round(k * k * 40); // the foot warmed by the fire
        g.beginPath(); pp.forEach(([a2, b2], j) => (j ? g.lineTo(a2, b2) : g.moveTo(a2, b2))); g.closePath();
        g.fillStyle = 'rgb(' + (l + 4 + red) + ',' + (l - 6) + ',' + (l - 8) + ')'; g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 1; g.stroke();
        g.strokeStyle = 'rgba(255,230,210,' + (0.2 * (1 - k)) + ')'; g.beginPath(); g.moveTo(pp[3][0], pp[3][1]); g.lineTo(pp[4][0], pp[4][1]); g.lineTo(pp[5][0], pp[5][1]); g.stroke();
        if (k > 0.6) { g.strokeStyle = 'rgba(255,90,30,' + ((k - 0.6) * 0.8) + ')'; g.beginPath(); g.moveTo(pp[0][0], pp[0][1]); g.lineTo(pp[1][0], pp[1][1]); g.lineTo(pp[2][0], pp[2][1]); g.stroke(); } // fire-lit undersides
      }
    }
    // glowing cracks: veins of fire running through the rock
    const veins = [];
    for (let i = 0; i < 26; i++) {
      const q = pts[r() * N | 0]; if (q.h < 25) continue;
      let x = q.x + (r() - 0.5) * 6, y = q.y - q.h * (0.15 + r() * 0.5); const v = [[x, y]];
      for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 10; y += 6 + r() * 8; v.push([x, y]); }
      veins.push(v);
      for (const [w2, col] of [[3.2, 'rgba(120,20,8,0.8)'], [1.6, '#ff6a20'], [0.7, '#ffd070']]) { g.strokeStyle = col; g.lineWidth = w2; g.beginPath(); v.forEach(([a2, b2], j) => (j ? g.lineTo(a2, b2) : g.moveTo(a2, b2))); g.stroke(); }
    }
    // the lava falls' channels, scorched dark
    for (const fa of AR.falls) { const q = at(fa); g.fillStyle = 'rgba(20,6,4,0.8)'; g.fillRect(q.x - 10, q.y - q.h, 20, q.h + 4); }
    g.restore();
    // the rim along the faces' top: a dark lip with a lit edge
    g.strokeStyle = '#0a0606'; g.lineWidth = 4; g.beginPath(); top.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); g.closePath(); g.stroke();
    g.strokeStyle = '#6a5a56'; g.lineWidth = 1.4; g.beginPath(); top.forEach((q, i) => { if (pts[i].h > 3) { if (i && pts[i - 1].h > 3) g.lineTo(q.x, q.y - 1.8); else g.moveTo(q.x, q.y - 1.8); } }); g.stroke();
    // an iron fence of spikes along the far rim, a rail across them
    let prev = null;
    for (let i = 0; i < N; i += 3) {
      const q = top[i]; if (pts[i].h < AR.wall * 0.45) { prev = null; continue; }
      const x = q.x, y = q.y - 3;
      g.fillStyle = '#0a0708'; g.fillRect(x - 0.8, y - 11, 1.6, 11); g.beginPath(); g.moveTo(x - 2, y - 11); g.lineTo(x, y - 16); g.lineTo(x + 2, y - 11); g.fill();
      g.fillStyle = '#4a4246'; g.fillRect(x - 0.3, y - 10, 0.6, 9);
      if (prev) { g.strokeStyle = '#0a0708'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(prev.x, prev.y - 7); g.lineTo(x, y - 7); g.stroke(); }
      prev = { x, y };
    }
    // chains hanging from the rim down the faces
    for (const ca of AR.chains) {
      const q = at(ca), len = q.h * 0.75;
      for (let y = 0; y < len; y += 3) { const sx = Math.sin(y * 0.05) * 1.5; g.fillStyle = (y / 3) % 2 ? '#5a5054' : '#2a2226'; g.fillRect(q.x + sx - 1, q.y - q.h + y, 2, 3); }
      g.fillStyle = '#1a1416'; g.fillRect(q.x - 3, q.y - q.h - 2, 6, 3); // its staple in the rim
    }
    // the near rim (no face seen): a dark lip of broken stones over the floor
    g.strokeStyle = '#080505'; g.lineWidth = 3; g.beginPath(); let on = false;
    pts.forEach((q) => { if (q.h < 3) { if (on) g.lineTo(q.x, q.y); else { g.moveTo(q.x, q.y); on = true; } } else on = false; }); g.stroke();
    // rubble at the walls' foot, and the lava pools under the falls
    const stone = (x, y, s2) => { P.ell(g, x, y + 1.5 * s2, 4 * s2, 1.6 * s2, 'rgba(0,0,0,0.5)'); g.fillStyle = '#0c0808'; g.beginPath(); g.ellipse(x, y, 4.2 * s2, 3.4 * s2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#4a3e3e'; g.beginPath(); g.ellipse(x, y - 0.3 * s2, 3.4 * s2, 2.6 * s2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#7a6a66'; g.fillRect(x - 2 * s2, y - 2 * s2, 1.6 * s2, 1 * s2); };
    for (let i = 0; i < N; i += 2) { const q = pts[i]; if (r() < 0.45) continue; const k = 0.93 + r() * 0.05; stone(q.x * k + (r() - 0.5) * 4, q.y * k, 0.6 + r() * 0.8); }
    for (const fa of AR.falls) {
      const q = at(fa);
      P.ell(g, q.x, q.y + 8, 26, 10, '#140404'); P.ell(g, q.x, q.y + 8, 23, 8.5, '#8a1a08'); P.ell(g, q.x, q.y + 8, 17, 6, '#e05010'); P.ell(g, q.x - 3, q.y + 7, 9, 3, '#ffb040');
      for (const sx of [-25, -13, 15, 24]) stone(q.x + sx, q.y + 9 + (sx % 3), 0.9);
      // its source: a glowing mouth on the ground above
      g.strokeStyle = '#3a0a04'; g.lineWidth = 12; g.beginPath(); g.moveTo(q.x, q.y - q.h + 2); g.bezierCurveTo(q.x + 14, q.y - q.h - 14, q.x - 18, q.y - q.h - 26, q.x - 6, q.y - q.h - 44); g.stroke();
      g.strokeStyle = '#c03a10'; g.lineWidth = 7; g.stroke(); g.strokeStyle = '#ffb040'; g.lineWidth = 2; g.stroke();
    }
    const id = g.getImageData(0, 0, S, S); G.quantize(id, { dither: 6, sat: 1, contrast: 1.05 }); g.putImageData(id, 0, 0);
    c.veins = veins;
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
    // the lava falls: molten streaks running down, a glowing foot, the pool's crust breathing
    for (const fa of AR.falls) {
      const rr = AR.rAt(fa), x = ox + Math.cos(fa) * rr, y = oy + Math.sin(fa) * rr, hh = AR.hAt(fa), top = y - hh;
      if (!vis(x, (y + top) / 2, hh)) continue;
      const lg = g.createLinearGradient(0, top, 0, y); lg.addColorStop(0, '#ffb040'); lg.addColorStop(0.5, '#ff6a18'); lg.addColorStop(1, '#c02a08');
      g.fillStyle = lg; g.fillRect(x - 7, top, 14, hh + 4);
      g.fillStyle = '#ffd070'; g.beginPath(); g.ellipse(x, top + 1, 8, 3, 0, 0, Math.PI * 2); g.fill(); // where it spills over the rim
      for (let k = 0; k < 8; k++) { const sx = x - 6 + (k * 5.3) % 12, sp = 22 + (k % 3) * 8, yy = top + ((now * sp + k * 19) % (hh + 8)); g.fillStyle = k % 3 ? 'rgba(255,230,150,0.85)' : 'rgba(120,20,4,0.7)'; g.fillRect(Math.round(sx), Math.round(yy), 1.5, 5 + (k % 4) * 2); }
      const pulse = 0.5 + 0.5 * Math.sin(now * 2.2 + fa * 3);
      g.save(); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(x, y + 8, 2, x, y + 8, 34); gl.addColorStop(0, 'rgba(255,140,40,' + (0.35 + 0.2 * pulse) + ')'); gl.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = gl; g.fillRect(x - 36, y - 26, 72, 70); g.restore();
      for (let k = 0; k < 3; k++) { const t2 = (now * 0.5 + k / 3) % 1, bx = x + Math.sin(k * 2.3 + fa) * 12, by = y + 8 + Math.cos(k * 1.7) * 3; g.fillStyle = 'rgba(255,220,120,' + (1 - t2) + ')'; g.beginPath(); g.arc(bx, by - t2 * 3, 1 + t2 * 2.5, 0, Math.PI * 2); g.fill(); } // bubbles
      lights.push({ x: x + cx, y: y + 8 + cy, r: 60, kind: 'lava' });
      lights.push({ x: x + cx, y: top + hh * 0.4 + cy, r: 40, kind: 'lava' });
    }
    // the veins' glow breathing
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < art.veins.length; i++) {
      const v = art.veins[i], [x0, y0] = v[0], [x1, y1] = v[v.length - 1], mx = ox + (x0 + x1) / 2, my = oy + (y0 + y1) / 2; if (!vis(mx, my, 40)) continue;
      const a2 = 0.12 + 0.12 * Math.sin(now * 1.6 + i * 1.3);
      g.strokeStyle = 'rgba(255,110,40,' + a2 + ')'; g.lineWidth = 5; g.beginPath(); v.forEach(([a3, b3], j) => (j ? g.lineTo(ox + a3, oy + b3) : g.moveTo(ox + a3, oy + b3))); g.stroke();
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
