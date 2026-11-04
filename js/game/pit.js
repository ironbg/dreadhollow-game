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
  /** The Pit's own ground: a natural pit around the start, its floor ringed by rough rock walls (the far ones seen
   *  rising, the near ones only as a lip), grown with moss, ferns and hanging vines, two waterfalls running down into
   *  pools. R: the floor's mean radius (its edge wavers, rAt); wall: how tall the far wall stands on screen. */
  const AR = C.PIT_ARENA = { R: 240, wall: 104 };
  AR.rAt = (a) => AR.R * (1 + 0.055 * Math.sin(3 * a + 1.3) + 0.035 * Math.sin(5 * a + 0.4) + 0.02 * Math.sin(11 * a + 2.1));
  AR.hAt = (a) => AR.wall * Math.pow(Math.max(0, (-Math.sin(a) + 0.55) / 1.55), 0.8) * (1 + 0.12 * Math.sin(7 * a + 0.9)); // the face seen: all of it far off, some at the sides, none near
  AR.falls = [-1.95, -0.85]; // the waterfalls' angles (on the far side)
  AR.torches = [-2.95, -2.3, -1.42, -0.62, -0.05];

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
   *  the ground above, the far walls' faces of broken rock (dark at the foot, lit at the top), moss and vines hanging
   *  from the rim, ferns and bushes on it, the near rim as a lip over the floor, the floor darkening towards the walls,
   *  and the waterfalls' still parts (stream, wet rock, pool). The moving water and the torches' flames: drawPitArena. */
  const PX = 2, AE = AR.R * 1.08 + AR.wall + 60;
  let ART = null;
  const pitArt = () => {
    if (ART) return ART;
    const G = DH.gfx, P = G.P, S = Math.round(AE * 2 * PX), c = G.canvas(S, S), g = c.getContext('2d');
    let sd = 4711; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    g.setTransform(PX, 0, 0, PX, AE * PX, AE * PX); g.lineJoin = 'round'; g.lineCap = 'round';
    const N = 240, pts = [], glows = [];
    for (let i = 0; i < N; i++) { const a = -Math.PI + i / N * Math.PI * 2, rr = AR.rAt(a), x = Math.cos(a) * rr, y = Math.sin(a) * rr; pts.push({ a, x, y, h: AR.hAt(a) }); }
    const floorPath = () => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); g.closePath(); };
    // the ground above: dark earth with moss and stones
    g.fillStyle = '#2a231a'; g.fillRect(-AE, -AE, AE * 2, AE * 2);
    for (let i = 0; i < 900; i++) { const x = (r() - 0.5) * 2 * AE, y = (r() - 0.5) * 2 * AE, k = r(); g.fillStyle = k < 0.4 ? 'rgba(52,74,34,' + (0.25 + r() * 0.35) + ')' : k < 0.7 ? 'rgba(40,32,24,0.6)' : 'rgba(84,76,66,0.35)'; g.beginPath(); g.ellipse(x, y, 3 + r() * 9, 2 + r() * 5, r() * 3, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 500; i++) { const x = (r() - 0.5) * 2 * AE, y = (r() - 0.5) * 2 * AE; g.strokeStyle = r() < 0.5 ? '#3a5a26' : '#4e6e2c'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - 3 - r() * 3); g.stroke(); }
    // the floor: cut out (the hall's floor shows), then darkened towards the walls
    g.save(); floorPath(); g.globalCompositeOperation = 'destination-out'; g.fill(); g.restore();
    g.save(); floorPath(); g.clip();
    const sh = g.createRadialGradient(0, 0, AR.R * 0.55, 0, 0, AR.R * 1.1); sh.addColorStop(0, 'rgba(6,4,6,0)'); sh.addColorStop(0.7, 'rgba(6,4,6,0.35)'); sh.addColorStop(1, 'rgba(6,4,6,0.75)');
    g.fillStyle = sh; g.fillRect(-AE, -AE, AE * 2, AE * 2);
    g.restore();
    // the far walls' faces: one shape from the floor's edge up to the rim
    const top = pts.map((q) => ({ x: q.x, y: q.y - q.h }));
    const facePath = () => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); for (let i = N - 1; i >= 0; i--) g.lineTo(top[i].x, top[i].y); g.closePath(); };
    g.save(); facePath(); g.clip();
    const fy0 = -AR.R * 1.1 - AR.wall, fg = g.createLinearGradient(0, fy0, 0, AR.R * 0.2); fg.addColorStop(0, '#8a7c70'); fg.addColorStop(0.45, '#5a4e4c'); fg.addColorStop(1, '#2a2226');
    g.fillStyle = fg; g.fillRect(-AE, -AE, AE * 2, AE * 2);
    // broken rock: rows of boulders, lit from the top left, each row a little darker going down
    for (let i = 0; i < N; i += 2) {
      const q = pts[i]; if (q.h < 4) continue;
      for (let y = q.y - q.h - 2; y < q.y + 4; y += 9 + r() * 5) {
        const k = (y - (q.y - q.h)) / Math.max(1, q.h), x = q.x + (r() - 0.5) * 8, rad = 5 + r() * 5, pp = [];
        for (let j = 0; j < 7; j++) { const t = j / 7 * Math.PI * 2; pp.push([x + Math.cos(t) * rad * (0.7 + r() * 0.5), y + Math.sin(t) * rad * 0.7 * (0.7 + r() * 0.5)]); }
        const l = Math.round(128 - k * 62 + (r() - 0.5) * 18);
        g.beginPath(); pp.forEach(([a2, b2], j) => (j ? g.lineTo(a2, b2) : g.moveTo(a2, b2))); g.closePath();
        g.fillStyle = 'rgb(' + (l + 6) + ',' + (l - 2) + ',' + (l - 4) + ')'; g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.65)'; g.lineWidth = 1; g.stroke();
        g.strokeStyle = 'rgba(255,240,220,' + (0.22 * (1 - k)) + ')'; g.beginPath(); g.moveTo(pp[3][0], pp[3][1]); g.lineTo(pp[4][0], pp[4][1]); g.lineTo(pp[5][0], pp[5][1]); g.stroke();
      }
    }
    // ledges and cracks
    for (let i = 0; i < 90; i++) { const q = pts[r() * N | 0]; if (q.h < 20) continue; const y = q.y - q.h * (0.2 + r() * 0.7); g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(q.x - 6, y); g.lineTo(q.x + (r() - 0.5) * 6, y + 6 + r() * 10); g.lineTo(q.x + 4, y + 14 + r() * 12); g.stroke(); }
    // moss creeping down from the rim, darker and thinner going down
    for (let i = 0; i < N; i++) {
      const q = pts[i]; if (q.h < 6 || r() < 0.35) continue;
      const len = q.h * (0.15 + r() * 0.5);
      for (let j = 0; j < 4; j++) { const y = q.y - q.h + r() * len, k = (y - (q.y - q.h)) / q.h; g.fillStyle = 'rgba(' + (60 - k * 20 | 0) + ',' + (98 - k * 40 | 0) + ',' + (40 - k * 10 | 0) + ',' + (0.75 - k * 0.6) + ')'; g.beginPath(); g.ellipse(q.x + (r() - 0.5) * 6, y, 3 + r() * 4, 2 + r() * 3, 0, 0, Math.PI * 2); g.fill(); }
    }
    // the waterfalls' wet rock
    for (const fa of AR.falls) { const rr = AR.rAt(fa), x = Math.cos(fa) * rr, y = Math.sin(fa) * rr, hh = AR.hAt(fa); g.fillStyle = 'rgba(20,40,50,0.55)'; g.fillRect(x - 9, y - hh, 18, hh + 4); }
    g.restore();
    // the rim along the faces' top: a lit lip of earth and grass
    g.strokeStyle = '#0c0a08'; g.lineWidth = 4; g.beginPath(); top.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); g.closePath(); g.stroke();
    g.strokeStyle = '#4a5e2a'; g.lineWidth = 1.6; g.beginPath(); top.forEach((q, i) => { if (pts[i].h > 3) { if (i && pts[i - 1].h > 3) g.lineTo(q.x, q.y - 1.5); else g.moveTo(q.x, q.y - 1.5); } }); g.stroke();
    // the near rim (no face seen): a dark lip, its grass leaning over the floor
    g.strokeStyle = '#0a0806'; g.lineWidth = 3; g.beginPath(); let on = false;
    pts.forEach((q) => { if (q.h < 3) { if (on) g.lineTo(q.x, q.y); else { g.moveTo(q.x, q.y); on = true; } } else on = false; }); g.stroke();
    for (let i = 0; i < N; i++) { const q = pts[i]; if (q.h >= 3) continue; const ux = -Math.cos(q.a), uy = -Math.sin(q.a); for (let j = 0; j < 3; j++) { const bx = q.x + (r() - 0.5) * 6, by = q.y + (r() - 0.5) * 3; g.strokeStyle = r() < 0.5 ? '#3e5a24' : '#557a2c'; g.lineWidth = 1; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + ux * 3, by + uy * 3 - 2, bx + ux * (4 + r() * 4), by + uy * (4 + r() * 4)); g.stroke(); } }
    // vines hanging from the rim over the faces, leaves along them
    for (let i = 0; i < N; i += 3) {
      const q = pts[i]; if (q.h < 20 || r() < 0.45) continue;
      const len = q.h * (0.3 + r() * 0.65); let x = q.x + (r() - 0.5) * 4, y = q.y - q.h;
      g.strokeStyle = '#2a4018'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y);
      const sw = (r() - 0.5) * 6; for (let k = 1; k <= 6; k++) g.lineTo(x + Math.sin(k * 0.9) * sw * 0.3, y + len * k / 6); g.stroke();
      for (let k = 1; k < 9; k++) { const yy = y + len * k / 9, xx = x + Math.sin(k * 0.6) * sw * 0.3; P.ell(g, xx + (k % 2 ? 2 : -2), yy, 2, 1.2, k % 3 ? '#4a7a2a' : '#3a6022', k % 2 ? 0.6 : -0.6); }
    }
    // bushes and ferns on the rim, and ferns, mushrooms and stones at the walls' foot
    const bush = (x, y, s2) => { for (let j = 0; j < 5; j++) P.circle(g, x + (r() - 0.5) * 8 * s2, y - r() * 4 * s2, (3 + r() * 3) * s2, j % 2 ? '#2e4a1c' : '#3e6024'); P.circle(g, x - 2 * s2, y - 4 * s2, 2 * s2, '#5a8a32'); };
    const fern = (x, y, s2, up) => { for (let j = -3; j <= 3; j++) { const a2 = (up ? -Math.PI / 2 : Math.PI / 2) + j * 0.32; g.strokeStyle = j % 2 ? '#3e6a26' : '#5a8a30'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a2) * 5 * s2, y + Math.sin(a2) * 5 * s2 - 2, x + Math.cos(a2) * 9 * s2, y + Math.sin(a2) * 9 * s2 + (up ? 2 : 0)); g.stroke(); } };
    for (let i = 0; i < N; i += 4) { const q = top[i]; if (r() < 0.5) bush(q.x + (r() - 0.5) * 6, q.y - 2 - r() * 10, 0.8 + r() * 0.6); else if (r() < 0.6) fern(q.x, q.y - 4, 0.9, true); }
    for (let i = 0; i < N; i += 3) {
      const q = pts[i], k = r(); if (k < 0.45) continue;
      const x = q.x * 0.97 + (r() - 0.5) * 4, y = q.y * 0.97;
      if (k < 0.7) fern(x, y, 0.8 + r() * 0.4, true);
      else if (k < 0.85) { P.ell(g, x, y + 1, 4, 1.5, 'rgba(0,0,0,0.5)'); P.circle(g, x, y - 2, 3, '#4e4448'); P.circle(g, x - 1, y - 3, 1.2, '#7a6e70'); }
      else { const glow = r() < 0.6; for (let j = 0; j < 3; j++) { const mx = x + j * 3 - 3; g.fillStyle = '#d8d0c0'; g.fillRect(mx, y - 3, 1, 3); P.ell(g, mx + 0.5, y - 3.5, 2, 1.2, glow ? '#7af0d0' : j === 1 ? '#a04a3a' : '#c8b8a0'); } if (glow) glows.push({ x, y: y - 3 }); } // glowing mushrooms light the walls' foot
    }
    // the waterfalls' streams on the ground above, and their pools at the foot
    for (const fa of AR.falls) {
      const rr = AR.rAt(fa), x = Math.cos(fa) * rr, y = Math.sin(fa) * rr, hh = AR.hAt(fa);
      g.strokeStyle = '#1c3a48'; g.lineWidth = 12; g.beginPath(); g.moveTo(x, y - hh + 2); g.bezierCurveTo(x + 10, y - hh - 30, x - 14, y - hh - 60, x + 6, y - hh - 110); g.stroke();
      g.strokeStyle = '#3a7a90'; g.lineWidth = 7; g.stroke(); g.strokeStyle = 'rgba(160,220,230,0.45)'; g.lineWidth = 1; g.stroke();
      for (const sx of [-9, 9]) { P.circle(g, x + sx, y - hh + 1, 4, '#4e4448'); P.circle(g, x + sx - 1, y - hh, 1.6, '#8a7e78'); }
      P.ell(g, x, y + 8, 24, 9, '#0e1e26'); P.ell(g, x, y + 8, 21, 7.5, '#2a6a80'); P.ell(g, x - 4, y + 6, 12, 3.5, 'rgba(150,220,230,0.35)');
      for (const sx of [-22, -10, 14, 21]) { P.circle(g, x + sx, y + 9 + (sx % 3), 2.5, '#3e3438'); fern(x + sx * 1.1, y + 10, 0.6, true); }
    }
    const id = g.getImageData(0, 0, S, S); G.quantize(id, { dither: 6, sat: 0.95, contrast: 1.05 }); g.putImageData(id, 0, 0);
    c.glows = glows;
    return (ART = c);
  };

  /** The pit, drawn right after the floor: the painted walls (pitArt), the ground beyond them, then what moves: the water
   *  falling, foaming and rippling, the torches' flames (their light on the fight). */
  R.drawPitArena = function (g, cx, cy, W, H, now, lights) {
    const art = pitArt(), ox = -cx, oy = -cy;
    g.save();
    g.fillStyle = '#251f17'; // beyond the painting: more of the ground
    if (oy - AE > 0) g.fillRect(0, 0, W, oy - AE); if (oy + AE < H) g.fillRect(0, oy + AE, W, H - oy - AE);
    if (ox - AE > 0) g.fillRect(0, 0, ox - AE, H); if (ox + AE < W) g.fillRect(ox + AE, 0, W - ox - AE, H);
    g.imageSmoothingEnabled = false; g.drawImage(art, ox - AE, oy - AE, AE * 2, AE * 2);
    // the falling water: streaks running down, a foaming foot, rings on the pool
    for (const fa of AR.falls) {
      const rr = AR.rAt(fa), x = ox + Math.cos(fa) * rr, y = oy + Math.sin(fa) * rr, hh = AR.hAt(fa), top = y - hh;
      if (x < -40 || x > W + 40 || y + 30 < 0 || top - 120 > H) continue;
      const wg = g.createLinearGradient(0, top, 0, y); wg.addColorStop(0, 'rgba(120,200,220,0.75)'); wg.addColorStop(1, 'rgba(60,140,170,0.55)');
      g.fillStyle = wg; g.fillRect(x - 7, top, 14, hh + 4);
      for (let k = 0; k < 9; k++) { const sx = x - 6 + (k * 5.3) % 12, sp = 46 + (k % 3) * 12, yy = top + ((now * sp + k * 23) % (hh + 10)); g.fillStyle = k % 3 ? 'rgba(220,245,250,0.7)' : 'rgba(255,255,255,0.9)'; g.fillRect(Math.round(sx), Math.round(yy), 1, 6 + (k % 4) * 2); }
      for (let k = 0; k < 6; k++) { const a2 = now * 2 + k, fx = x + Math.sin(a2 * 1.7 + k) * 8, fy = y + 4 + Math.abs(Math.sin(a2)) * -5; g.fillStyle = 'rgba(235,250,255,0.8)'; g.beginPath(); g.arc(fx, fy, 1.6 + (k % 3), 0, Math.PI * 2); g.fill(); }
      for (let k = 0; k < 2; k++) { const t2 = (now * 0.6 + k * 0.5) % 1; g.strokeStyle = 'rgba(180,230,240,' + (0.5 * (1 - t2)) + ')'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y + 8, 6 + t2 * 14, 2 + t2 * 5, 0, 0, Math.PI * 2); g.stroke(); }
      lights.push({ x: x + cx, y: y + cy, r: 40, kind: 'tint', color: '#60c0e0', a: 0.12 });
    }
    for (const q of art.glows) { const x = ox + q.x, y = oy + q.y; if (x > -40 && x < W + 40 && y > -40 && y < H + 40) lights.push({ x: q.x, y: q.y, r: 30, kind: 'crystal', color: '#70e8c8' }); }
    // torches on the far walls
    for (const ta of AR.torches) {
      const rr = AR.rAt(ta), x = ox + Math.cos(ta) * rr, y = oy + Math.sin(ta) * rr - AR.hAt(ta) * 0.5;
      if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
      const fl = 0.8 + 0.2 * Math.sin(now * 9 + ta * 3);
      g.fillStyle = '#1a1210'; g.fillRect(x - 1.5, y - 2, 3, 9); g.fillStyle = '#4a3a2e'; g.fillRect(x - 3, y - 3, 6, 2);
      g.fillStyle = '#ff9a3a'; g.beginPath(); g.moveTo(x - 3, y - 3); g.quadraticCurveTo(x, y - 12 * fl, x + 3, y - 3); g.fill();
      g.fillStyle = '#ffe0a0'; g.beginPath(); g.moveTo(x - 1.4, y - 3); g.quadraticCurveTo(x, y - 7 * fl, x + 1.4, y - 3); g.fill();
      if (lights) lights.push({ x: x + cx, y: y + cy, r: 50, kind: 'brazier' });
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
