/* The Dungeon (Trials), mixed into DH.Run.prototype. A level is five floors and a boss floor, each a small closed
 * chamber of the catacombs of one hall (E.DUNGEON.halls), against the clock:
 *   a floor    its quota of the hall's foes comes in batches from the walls; when the last falls the iron grate over
 *              the stairs rises (and, on a floor that hides one, the vault's door opens); down the stairs is the next
 *   the clock  2 min, +18 s for a floor cleared, +10 s for each hourglass on the floor; out of it: +60 s for gems, once
 *   the boss   on the sixth floor the hall's Lord rises from the dark; when it falls, a portal opens to leave by
 *   a vault    a bonus chamber of 30 s (the clock stopped) full of gold or iron, foes pouring in, a Gilded Ooze inside;
 *              its reward is paid at once on the server (js/meta/dungeon.js), kept even if the level is lost
 * The foes are a hall's own, as strong as the Crypt's grown by the level (E.DUNGEON.hpPerLv / dmgPerLv) and by the
 * floor (as if that many minutes into a hall); the level's hazards are the Pit's (pit.js). The chamber: dunArt. */
(function (DH) {
  'use strict';
  const U = DH.util, C = DH.content, E = DH.economy;
  const R = DH.Run.prototype;
  const TAU = Math.PI * 2;
  /** The chamber: W, H its floor's half width and height, wall the far wall's height as seen. */
  const AR = C.DUN_ARENA = { W: 190, H: 160, wall: 96, side: 26, lip: 22 };
  AR.stairs = { x: 0, y: -AR.H + 18 }; AR.start = { x: 0, y: -40 }; // the hero comes in in the middle of what is seen (the chamber's floor and its far wall)
  const D = () => E.DUNGEON;
  const BOSS_FLOOR = () => D().floors; // floors 0..4, then the boss floor (5)

  /** A copy of a level's hall: its floor and foes, the Crypt's strength grown by the level, none of its own rules. */
  R.constructor.dunStage = function (lv) {
    const hall = D().halls[(Math.max(1, lv) - 1) % D().halls.length], base = C.stages.crypt, sl = lv - 1 + D().lvShift, kh = 1 + D().hpPerLv * sl, kd = 1 + D().dmgPerLv * sl; // level 1 as strong as the tenth was
    const def = Object.assign({}, C.stages[hall], { hpMult: base.hpMult * kh, dmgMult: base.dmgMult * kd * D().foeDmg, foeHp: D().foeHp, // (health apart: the hero's items scale by hpMult) dmgGrow: base.dmgGrow, index: 0, bossHp: base.bossHp,
      bosses: [], dissonator: false, vault: false, lordKills: 0, goldMult: base.goldMult * (1 + 0.04 * (lv - 1)), bridge: 0 });
    def.theme = Object.assign({}, C.stages[hall].theme, { noCandles: true }); // the candles stand on the columns only, not on the floor
    const lord = (C.stages[hall].bosses || []).find((b) => b.final);
    return { id: hall, def, lord: lord ? lord.id : 'anguish' };
  };

  R.initDun = function () {
    const Q = this.dun;
    // none of the hall's own business: no secret, no prisoner, no Hex, no Well, no puzzle; no revive of the hero's own
    this.sec = null; this.rescue = null; this.hex = null; this.disso = null; this.wellOpen = false; this.lordKills = 0; this.revives = 0;
    Object.assign(Q, { floor: 0, cleared: 0, secs: D().secs, fx: {}, tm: 0, need: 0, got: 0, left: 0, bt: 0, exit: null, vault: null, quartz: 0,
      gems: null, done: false, begun: false, art: 0 });
    dunArt(this.stage, 0);
    this.player.x = AR.start.x; this.player.y = AR.start.y;
  };
  /** The fight begins (after the start screen, the ad's offer and the 3-2-1): the first floor, an Arcane Tome by the hero. */
  R.dunBegin = function () {
    this.dun.begun = true; this.dunFloor(0);
    const p = this.player; this.drop('tome', p.x + 30, p.y - 14);
    this.resume();
  };
  /** Floor f (0-based; the boss floor last): a fresh chamber, the hero in its middle, three waves of the floor's quota,
   *  two hourglasses. */
  R.dunFloor = function (f) {
    const Q = this.dun; Q.floor = f; Q.tm = f * 60; Q.exit = null; Q.got = 0; Q.bt = 0.6; Q.idle = 0; Q.st = 4; Q.bossT = f === BOSS_FLOOR() ? 2.5 : -1;
    Q.need = f === BOSS_FLOOR() ? 0 : D().quota(Q.lv, f); Q.art = (Q.lv + f) % 3; Q.vault = null; Q.gather = 0;
    dunArt(this.stage, Q.art);
    this.clearChamber();
    const p = this.player; p.x = AR.start.x; p.y = AR.start.y; p.inv = Math.max(p.inv, 1.2);
    for (let i = 0; i < D().bonusPerFloor; i++) this.pickups.push({ type: 'time', x: U.rand(-AR.W + 30, AR.W - 30), y: U.rand(-AR.H + 50, AR.H - 70), val: D().bonusSecs, cluster: false, vx: 0, vy: 0, z: 0, vz: 0, mag: false, t: 1 });
    const real = this.time; this.time = Math.min(599, Q.tm + 30); Q.mix = this.spawnRate().mix; this.time = real; // the hall's mix of that moment
    if (Q.need) this.dunWave(1);
    DH.events.emit('run:warning', f === BOSS_FLOOR() ? t('hud.dunBossFloor') : t('hud.dunFloor', { n: f + 1, m: BOSS_FLOOR() + 1 }));
  };
  /** Wave w (1..waves) of the floor: its share of the quota, an elite in every 25 of it. */
  R.dunWave = function (w) {
    const Q = this.dun, n = D().waves; Q.wave = w; Q.wq = w < n ? Math.round(Q.need / n) : Q.need - Math.round(Q.need / n) * (n - 1);
    Q.wgot = 0; Q.left = Q.wq; Q.bt = 0.4; Q.wpause = 0; Q.idle = 0; Q.elites = Math.floor(Q.wq / 25) + (w === n ? 1 : 0);
    if (w > 1) DH.events.emit('run:warning', t('hud.dunWave', { n: w, m: n }));
  };
  /** Everything of the floor before goes (the hero's summons follow down the stairs). */
  R.clearChamber = function () {
    this.enemies.length = 0; this.proj.length = 0; this.eproj.length = 0; this.hazards.length = 0; this.zones.length = 0; this.warns.length = 0; this.bosses.length = 0;
    this.pickups.length = 0; // (what mattered was gathered on the way down: dunDescend)
    const p = this.player; for (const a of this.allies || []) { a.x = p.x + U.rand(-12, 12); a.y = p.y + U.rand(-8, 8); }
    this.dun.fx = {}; this.decals.length = 0;
  };
  const alive = (run) => { let n = 0; for (const e of run.enemies) if (!e.dead && !e.def.prop && !e.boss) n++; return n; };

  /** Each frame in place of the hall's spawning: the clock, the waves' batches, the boss, the stairs, the vault, the hazards. */
  R.updateDun = function (dt) {
    const Q = this.dun; if (!Q.begun || Q.done) return;
    if (Q.vault) { this.updateVault(dt); return; }
    if (!this.won) { // the clock runs until the boss falls
      Q.secs -= dt;
      if (Q.secs <= 0) { Q.secs = 0; this.dunOutOfTime(); return; }
    }
    if (Q.need && !Q.exit) {
      if (Q.wpause > 0) { if ((Q.wpause -= dt) <= 0) this.dunWave(Q.wave + 1); }
      else {
        if (Q.left > 0 && (Q.bt -= dt) <= 0) {
          Q.bt = 0.65; const n = Math.min(Q.left, 12, 70 - alive(this));
          if (n > 0) { this.dunBatch(n); Q.left -= n; }
        }
        if (Q.left <= 0) this.dunStragglers(dt);
        if (Q.left <= 0 && (Q.wgot >= Q.wq || !alive(this))) { // the wave has fallen
          if (Q.wave < D().waves) { Q.wpause = D().wavePause; this.text(this.player.x, this.player.y - 24, t('hud.dunWaveDone', { n: Q.wave, m: D().waves }), '#ffd35a', true); DH.audio.play('reward'); }
          else this.dunCleared();
        }
      }
    }
    if (Q.bossT > 0 && (Q.bossT -= dt) <= 0) this.dunBoss();
    if (Q.floor === BOSS_FLOOR() && !this.won && Q.bossUp && (Q.bt -= dt) <= 0) { Q.bt = 2.2; if (alive(this) < 14) this.dunBatch(3); } // a trickle of the hall's foes beside the Lord
    if (Q.exit) this.updateExits(dt);
    if (Q.affixes.length) this.hazardsTick(dt, Q.affixes);
  };
  /** A wave's last foes never hold it up: every 4 s the ones keeping their distance are drawn out of the dark close to
   *  the hero; and if nothing has fallen for 20 s, what is left of the wave crumbles away (a caster kiting a melee hero
   *  round a closed room could otherwise stall it for good). */
  R.dunStragglers = function (dt) {
    const Q = this.dun, p = this.player;
    Q.idle = (Q.idle || 0) + dt;
    if ((Q.st = (Q.st || 0) - dt) <= 0) {
      Q.st = 4;
      for (const e of this.enemies) {
        if (e.dead || e.def.prop || e.boss || U.dist2(e.x, e.y, p.x, p.y) < 90 * 90) continue;
        const a = Math.random() * TAU; this.burst(e.x, e.y, 6, ['#0a0608', '#3a1a20'], 30);
        e.x = p.x + Math.cos(a) * 55; e.y = p.y + Math.sin(a) * 40; e.kx = e.ky = 0;
      }
    }
    if (Q.idle >= 20) {
      for (const e of this.enemies) if (!e.dead && !e.def.prop && !e.boss) { e.dead = true; Q.got++; Q.wgot++; this.burst(e.x, e.y, 8, ['#000', '#2a1a20', '#6a4a50'], 40); }
      Q.idle = 0;
    }
  };
  /** n of the floor's foes, from the walls and the dark corners, never on top of the hero. */
  R.dunBatch = function (n) {
    const Q = this.dun, p = this.player;
    for (let i = 0; i < n; i++) {
      const pt = this.dunEntry();
      const elite = Q.elites > 0 && Math.random() < Q.elites / Math.max(1, Q.left - i) ? (Q.elites--, true) : false;
      const e = this.spawnEnemy(U.weighted(Q.mix), pt.x, pt.y, elite ? { elite: true } : undefined); if (!e) continue;
      if (Q.affixes.includes('stone')) e.armor = Math.min(0.75, e.armor + C.PIT_FX.stone);
      e.dunF = Q.floor; this.burst(pt.x, pt.y, 5, ['#0a0608', '#3a1a20'], 26);
      if (U.dist2(e.x, e.y, p.x, p.y) < 60 * 60) { e.x = -e.x; e.y = -e.y; }
    }
  };
  /** A point along the chamber's walls (inside them), at least 110 from the hero. */
  R.dunEntry = function () {
    const p = this.player;
    for (let k = 0; k < 12; k++) {
      const side = U.randi(0, 3), m = 14;
      const x = side === 0 ? -AR.W + m : side === 1 ? AR.W - m : U.rand(-AR.W + m, AR.W - m), y = side === 2 ? -AR.H + m : side === 3 ? AR.H - m : U.rand(-AR.H + m, AR.H - m);
      if (U.dist2(x, y, p.x, p.y) > 110 * 110) return { x, y };
    }
    return { x: -Math.sign(p.x || 1) * (AR.W - 14), y: -Math.sign(p.y || 1) * (AR.H - 14) };
  };
  /** A foe of the Dungeon fell (run.killEnemy): the wave's count; the Treasure Hunter's quartz now and then. */
  R.dunKill = function (e) {
    const Q = this.dun;
    if (!e.def.prop && !e.boss) { Q.got++; Q.wgot = (Q.wgot || 0) + 1; Q.idle = 0; }
    const sk = Q.perks.seeker; if (sk && !e.def.prop && Math.random() < sk) this.drop('quartz', e.x, e.y, Q.perks.seekerN || 15);
  };
  /** The floor is cleared (its third wave fallen): time won, the grate over the stairs rises. A floor that hides a vault:
   *  the stairs lead into the vault first (its 30 s in place of the way down), then on to the next floor. */
  R.dunCleared = function () {
    const Q = this.dun, p = this.player;
    Q.cleared = Q.floor + 1; Q.secs += D().floorSecs;
    const vault = Q.vaults.includes(Q.floor) ? Q.kinds[Q.vaults.indexOf(Q.floor)] : null;
    Q.exit = { t: 0, vault, auto: Q.perks.step ? 1.4 : -1 };
    this.pickups.forEach((k) => { if (k.type === 'xp' || k.type === 'coin' || k.type === 'quartz') k.mag = true; });
    this.text(p.x, p.y - 26, t('hud.dunCleared', { s: D().floorSecs }), '#ffd35a', true); DH.audio.play('reward');
    DH.events.emit('run:warning', vault ? t('hud.dunVaultBelow.' + vault) : t('hud.dunStairs'));
  };
  /** The Lord of the hall rises (the boss floor). */
  R.dunBoss = function () {
    const Q = this.dun, id = Q.lord;
    const e = this.spawnEnemy(id, 0, -AR.H + 60, { boss: true, final: true }); if (!e) return;
    const kh = D().bossHp * D().lordHp / D().foeHp; e.hp *= kh; e.maxHp *= kh; e.dmg *= D().lordDmg / D().foeDmg; // the Lord: +20%, not the foes' +50%
    this.bosses.push(e); Q.bossUp = true; Q.bt = 3;
    this.shake = 8; this.whiteFlash = 0.4; this.burst(e.x, e.y, 40, ['#000', '#3a0010', '#ff2040'], 120); DH.audio.play('roar', e.painter); DH.audio.vibrate(120);
    DH.events.emit('run:boss', { name: t('enemy.' + id), final: true });
  };
  /** The way on: the stairs once the grate is up (down to the next floor, or into the vault); Sure Step goes by itself.
   *  After the Lord the portal is the way out (run.js); a vault there still waits down the stairs. */
  R.updateExits = function (dt) {
    const Q = this.dun, X = Q.exit, p = this.player; X.t += dt;
    if (X.t < 0.8) return; // the grate is still rising
    if (this.won && !X.vault) return;
    const onStairs = Math.abs(p.x - AR.stairs.x) < 16 && p.y < AR.stairs.y + 14;
    if (onStairs || (X.auto > 0 && X.t >= 0.8 + X.auto)) { if (X.vault) this.dunEnterVault(X.vault); else this.dunDescend(); }
  };
  /** What lies on the floor comes along (gems, coins, quartz; a tome or chest opens below). */
  R.dunGatherAll = function () {
    for (const k of this.pickups.slice()) if (k.type === 'xp' || k.type === 'coin' || k.type === 'quartz' || k.type === 'tome' || k.type === 'food' || k.type.startsWith('chest')) { this.pickups.splice(this.pickups.indexOf(k), 1); this.collect(k); }
  };
  /** Down the stairs: a fade, the next floor. */
  R.dunDescend = function () {
    const Q = this.dun; if (Q.going) return; Q.going = true;
    this.dunGatherAll(); DH.audio.play('chest');
    const run = this, next = Q.floor + 1;
    this.state = 'stairs';
    DH.ui.dunFade(t(next === BOSS_FLOOR() ? 'hud.dunDownBoss' : 'hud.dunDown', { n: next + 1, m: BOSS_FLOOR() + 1 }), () => {
      if (DH.game.run !== run || Q.done) return;
      Q.going = false; run.dunFloor(next); if (run.state === 'stairs') run.resume();
    });
  };

  /* ---------------- the vault ---------------- */
  /** Down into the vault: a chamber heaped with gold (or metal) for 30 s, the clock stopped, foes pouring in, a Gilded
   *  Ooze among them. */
  R.dunEnterVault = function (kind) {
    const Q = this.dun; if (Q.going) return; Q.going = true;
    this.dunGatherAll();
    const run = this; this.state = 'stairs';
    DH.ui.dunFade(t('hud.dunVault.' + kind), () => {
      if (DH.game.run !== run || Q.done) return;
      Q.going = false;
      if (run.portal) { run.portalKept = run.portal; run.portal = null; } // after the Lord: the portal waits for the hero's return
      if (run.well) { run.wellKept = run.well; run.well = null; } // (and the Well)
      run.clearChamber();
      Q.vault = { kind, t: D().vaultSecs, floor: Q.floor, bt: 0.4, gather: 0 };
      const p = run.player; p.x = AR.start.x; p.y = AR.start.y; p.inv = Math.max(p.inv, 1.2);
      const o = run.spawnEnemy('gildedooze', 0, -40); if (o) { o.hp = o.maxHp = o.def.hits; o.life = Infinity; o.dunVault = true; } // it stays the whole 30 s
      DH.events.emit('run:warning', t('hud.dunVaultIn', { s: D().vaultSecs }));
      if (run.state === 'stairs') run.resume();
    });
  };
  /** The vault's 30 s; then every foe in it falls (with what it drops), everything flies to the hero and is taken, the
   *  vault pays (on the server), and the way leads on to the next floor (or back to the portal after the Lord). */
  R.updateVault = function (dt) {
    const Q = this.dun, V = Q.vault, run = this;
    if (V.gather > 0) { // gathering the spoils
      if ((V.gather -= dt) > 0) return;
      V.gather = -1; this.dunGatherAll();
      this.state = 'stairs';
      const next = V.floor + 1;
      DH.ui.dunFade(V.floor >= BOSS_FLOOR() ? t('hud.dunVaultOut') : t(next === BOSS_FLOOR() ? 'hud.dunDownBoss' : 'hud.dunDown', { n: next + 1, m: BOSS_FLOOR() + 1 }), () => {
        if (DH.game.run !== run || Q.done) return;
        if (V.floor >= BOSS_FLOOR()) { // back where the Lord fell: the portal waits
          run.clearChamber(); Q.vault = null; Q.exit.vault = null;
          const p = run.player; p.x = AR.start.x; p.y = AR.start.y;
          if (run.portalKept) { run.portal = run.portalKept; run.portalKept = null; run.portal.t = 1; }
          if (run.wellKept) { run.well = run.wellKept; run.wellKept = null; }
        } else run.dunFloor(next);
        if (run.state === 'stairs') run.resume();
      }, 0.5);
      return;
    }
    if (V.gather < 0) return;
    V.t -= dt;
    if ((V.bt -= dt) <= 0) { V.bt = 0.5; if (alive(this) < 60) this.dunBatch(6); }
    if (V.t > 0) return;
    // over: its foes fall where they stand (and drop what they carry), everything is drawn to the hero
    for (const e of this.enemies.slice()) if (!e.dead && !e.def.prop) { this.killEnemy(e); this.burst(e.x, e.y, 4, ['#fff', '#ffd35a'], 40); }
    this.pickups.forEach((k) => { k.mag = true; });
    V.gather = 1.8;
    DH.ui.act('dunVault', { floor: V.floor }).then((r) => { if (r && r.items) { Q.vaultPaid = (Q.vaultPaid || []).concat(r.items); if (DH.game.run === run) DH.events.emit('run:dunVault', r); } });
    DH.events.emit('run:warning', t('hud.dunVaultOver'));
  };
  /** The clock ran out: +60 s for gems once (if no gem revive was bought), else the level is lost. */
  R.dunOutOfTime = function () {
    if (this.state !== 'playing') return;
    this.state = 'dunTime'; DH.audio.play('defeat');
    DH.events.emit('run:dunTime', this);
  };
  /** The level is over (lost, left, or won through the portal): the game settles it (main.js). */
  R.dunOver = function () {
    const Q = this.dun; if (Q.done) return; Q.done = true;
    if (this.state !== 'victory') this.state = 'over';
    DH.events.emit('run:dunEnd', this);
  };
  /** Floors cleared for the server: the boss floor counts once its Lord has fallen. */
  R.dunFloorsDone = function () { const Q = this.dun; return this.won ? BOSS_FLOOR() + 1 : Math.min(BOSS_FLOOR(), Q.cleared); };

  /** Nothing leaves the chamber: the hero, the horde, their summons, the loot, the Stalker, the portal. */
  R.dunClamp = function () {
    const keep = (o, pad) => { if (!o) return; o.x = U.clamp(o.x, -AR.W + pad, AR.W - pad); o.y = U.clamp(o.y, -AR.H + pad, AR.H - pad); };
    keep(this.player, 6);
    for (const e of this.enemies) keep(e, Math.min(12, (e.r || 6) * 0.6));
    for (const a of this.allies || []) keep(a, 6);
    for (const k of this.pickups) keep(k, 6);
    const F = this.dun.fx, S = F && F.stalker; if (S && S.s) keep(S.s, 4);
    if (this.portal) { keep(this.portal, 26); if (this.portal.y < -AR.H + 70) this.portal.y = -AR.H + 70; }
    if (this.won && this.dun.exit === null && !this.dun.vault) { // the Lord fell: a vault on this floor waits down the stairs
      const Q = this.dun, f = BOSS_FLOOR(); Q.cleared = f + 1;
      const v = Q.vaults.includes(f) ? Q.kinds[Q.vaults.indexOf(f)] : null;
      Q.exit = { t: 0, vault: v, auto: -1 };
      // the Well rises beside the hero's way: a piece found on the floors can be sent to the Wellkeeper (as at a hall's end)
      const px = this.portal ? this.portal.x : 0; this.well = { x: px > 0 ? -70 : 70, y: 20, used: false };
      DH.events.emit('run:warning', v ? t('hud.dunVaultBelow.' + v) : t('hud.well'));
    }
  };

  /* ---------------- the chamber ---------------- */
  /** The chamber's stone, painted once per hall and look (three looks, by floor) at the floor's pixel density: the far
   *  wall a tall face of black ashlar with pointed niches (skulls heaped in one, a coffin stood upright in another, a
   *  hooded saint in the third), buttresses between them, a barred window bleeding red light, chains and a hanging
   *  cage; the side walls dark with half-columns; the near wall a low lip; the floor's edges sunk in shadow, old blood,
   *  bones and a ritual ring. The candles' flames, the grate, the glows: drawDunArena. */
  const PX = 2, EX = AR.W + AR.side + 14, ET = AR.H + AR.wall + 26, EB = AR.H + AR.lip + 14;
  const ARTS = {};
  const rgb = (c, m) => 'rgb(' + c.map((v) => Math.max(0, Math.min(255, Math.round(v * (m == null ? 1 : m))))).join(',') + ')';
  const mixc = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  function dunArt(stage, look) {
    const key = (stage.theme.floor || 'crypt') + ':' + look; if (ARTS[key]) return ARTS[key];
    const G = DH.gfx, T = stage.theme, w = Math.round(EX * 2 * PX), hgt = Math.round((ET + EB) * PX), c = G.canvas(w, hgt), g = c.getContext('2d');
    let sd = 9173 + look * 7919 + (T.floor || '').length * 131; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    g.setTransform(PX, 0, 0, PX, EX * PX, ET * PX); g.lineJoin = 'round'; g.lineCap = 'round';
    const W = AR.W, H = AR.H, WH = AR.wall, SD = AR.side;
    // the stone: the hall's floor colours sunk towards black and drained, so every hall's catacombs are its own but grim
    const base = mixc(mixc(T.floorA, [70, 64, 68], 0.4), [0, 0, 0], 0.12), dark = T.dark || [6, 5, 8];
    const block = (x, y, bw, bh, k) => { // one ashlar block: a lit top edge, a dark under-edge, grit
      const col = mixc(base, [0, 0, 0], k); g.fillStyle = rgb(col, 0.9 + r() * 0.2); g.fillRect(x + 0.4, y + 0.4, bw - 0.8, bh - 0.8);
      g.fillStyle = rgb(mixc(col, [220, 200, 190], 0.18)); g.fillRect(x + 0.4, y + 0.4, bw - 0.8, 1);
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x + 0.4, y + bh - 1.4, bw - 0.8, 1);
      for (let j = 0; j < bw * bh / 14; j++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.25)' : 'rgba(255,240,230,0.05)'; g.fillRect(x + r() * bw, y + r() * bh, 1, 1); }
      if (r() < 0.12) { g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 0.6; g.beginPath(); const cx = x + r() * bw; g.moveTo(cx, y + 1); g.lineTo(cx + (r() - 0.5) * 4, y + bh * 0.6); g.lineTo(cx + (r() - 0.5) * 5, y + bh - 1); g.stroke(); }
    };
    // ---- beyond everything: black rock
    g.fillStyle = rgb(dark); g.fillRect(-EX, -ET, EX * 2, ET + EB);
    // ---- the floor: cut out (the hall's own floor shows), its edges sunk in shadow
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fillRect(-W, -H, W * 2, H * 2); g.restore();
    const vg = g.createRadialGradient(0, 0, Math.min(W, H) * 0.35, 0, 0, Math.hypot(W, H)); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(0.7, 'rgba(0,0,0,0.35)'); vg.addColorStop(1, 'rgba(0,0,0,0.85)');
    g.fillStyle = vg; g.fillRect(-W, -H, W * 2, H * 2);
    const edge = (x0, y0, x1, y1) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); return gr; };
    g.fillStyle = edge(0, -H, 0, -H + 34); g.fillRect(-W, -H, W * 2, 34); g.fillStyle = edge(-W, 0, -W + 22, 0); g.fillRect(-W, -H, 22, H * 2); g.fillStyle = edge(W, 0, W - 22, 0); g.fillRect(W - 22, -H, 22, H * 2);
    // old blood: dark pools and drag marks
    for (let i = 0; i < 5 + look; i++) {
      const x = (r() - 0.5) * W * 1.7, y = (r() - 0.5) * H * 1.6, s = 6 + r() * 12;
      g.fillStyle = 'rgba(70,6,8,' + (0.35 + r() * 0.25) + ')'; g.beginPath(); for (let j = 0; j < 9; j++) { const a = j / 9 * TAU, rr = s * (0.6 + r() * 0.5); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.6); } g.closePath(); g.fill();
      if (r() < 0.6) { g.strokeStyle = 'rgba(60,4,6,0.35)'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 30, x + (r() - 0.5) * 70, y + (r() - 0.5) * 50); g.stroke(); }
    }
    // bones and skulls strewn about, heaped against the walls
    const skull = (x, y, s) => {
      g.fillStyle = '#b8ab98'; g.beginPath(); g.ellipse(x, y, s, s * 0.9, 0, 0, TAU); g.fill(); g.fillRect(x - s * 0.55, y + s * 0.5, s * 1.1, s * 0.6);
      g.fillStyle = '#2a1e1a'; g.beginPath(); g.ellipse(x - s * 0.38, y + 0.1 * s, s * 0.26, s * 0.3, 0, 0, TAU); g.ellipse(x + s * 0.38, y + 0.1 * s, s * 0.26, s * 0.3, 0, 0, TAU); g.fill();
      g.fillRect(x - 0.4, y + s * 0.45, 0.8, s * 0.3); g.fillStyle = 'rgba(255,250,230,0.25)'; g.fillRect(x - s * 0.6, y - s * 0.7, s * 0.5, s * 0.3);
    };
    const bone = (x, y, l, a) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = '#a89c8a'; g.fillRect(-l / 2, -0.7, l, 1.4); for (const e2 of [-l / 2, l / 2]) { g.beginPath(); g.arc(e2, -0.9, 1, 0, TAU); g.arc(e2, 0.9, 1, 0, TAU); g.fill(); } g.restore(); };
    for (let i = 0; i < 26; i++) { const ex = r(), x = ex < 0.5 ? (r() < 0.5 ? -W + 6 + r() * 26 : W - 6 - r() * 26) : (r() - 0.5) * W * 1.8, y = ex < 0.5 ? (r() - 0.5) * H * 1.8 : (r() < 0.7 ? -H + 8 + r() * 20 : (r() - 0.5) * H * 1.6); bone(x, y, 4 + r() * 5, r() * TAU); }
    for (let i = 0; i < 9; i++) skull(r() < 0.5 ? -W + 8 + r() * 14 : W - 8 - r() * 14, -H + 20 + r() * (H * 1.7), 2 + r() * 1.2);
    // the ritual ring in the middle: a scratched circle, runes round it, a darker stain at its heart
    { const R0 = 52 + look * 6; g.strokeStyle = 'rgba(120,20,20,0.35)'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, 4, R0, R0 * 0.62, 0, 0, TAU); g.stroke(); g.lineWidth = 0.8; g.beginPath(); g.ellipse(0, 4, R0 - 7, (R0 - 7) * 0.62, 0, 0, TAU); g.stroke();
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, x = Math.cos(a) * (R0 - 3.5), y = 4 + Math.sin(a) * (R0 - 3.5) * 0.62; g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(-1.6, -1.4); g.lineTo(0, 1.4); g.lineTo(1.6, -1.4); if (i % 3 === 0) { g.moveTo(0, -1.8); g.lineTo(0, 1.8); } g.stroke(); g.restore(); }
      const st = g.createRadialGradient(0, 4, 2, 0, 4, R0 * 0.5); st.addColorStop(0, 'rgba(40,0,4,0.5)'); st.addColorStop(1, 'rgba(40,0,4,0)'); g.fillStyle = st; g.beginPath(); g.ellipse(0, 4, R0 * 0.5, R0 * 0.32, 0, 0, TAU); g.fill(); }
    // two iron drain grates, a red glow under them
    for (const [x, y] of [[-W * 0.55, H * 0.35], [W * 0.5, -H * 0.15 + look * 20]]) {
      const gl = g.createRadialGradient(x, y, 1, x, y, 14); gl.addColorStop(0, 'rgba(150,20,10,0.5)'); gl.addColorStop(1, 'rgba(150,20,10,0)'); g.fillStyle = gl; g.fillRect(x - 14, y - 10, 28, 20);
      g.fillStyle = '#0a0606'; g.fillRect(x - 7, y - 4.5, 14, 9); g.fillStyle = '#3a3438'; for (let k = -6; k <= 6; k += 3) g.fillRect(x + k - 0.6, y - 4.5, 1.2, 9); g.fillRect(x - 7, y - 4.5, 14, 1); g.fillRect(x - 7, y + 3.5, 14, 1);
    }

    // ---- the side walls: the inner face a dark strip of courses, the top a cap of slabs; half-columns along them
    for (const sx of [-1, 1]) {
      const x0 = sx < 0 ? -W - SD : W;
      for (let y = -H - 6; y < H + AR.lip; y += 8) { block(x0, y, SD, 8, 0.25 + 0.3 * ((y + H) / (2 * H))); }
      const fc = g.createLinearGradient(sx < 0 ? -W - 6 : W + 6, 0, sx < 0 ? -W : W, 0); fc.addColorStop(0, 'rgba(0,0,0,0)'); fc.addColorStop(1, 'rgba(0,0,0,0.55)');
      g.fillStyle = fc; g.fillRect(sx < 0 ? -W - 6 : W, -H, 6, H * 2 + AR.lip);
      for (let y = -H + 50; y < H - 10; y += 74) { // half-columns standing out of the wall: a round shaft, a base, a capital
        const cx = sx < 0 ? -W + 2 : W - 2, cg = g.createLinearGradient(cx - 6, 0, cx + 6, 0); cg.addColorStop(0, rgb(base, 0.6)); cg.addColorStop(0.45, rgb(mixc(base, [200, 190, 180], 0.25))); cg.addColorStop(1, rgb(base, 0.35));
        g.fillStyle = 'rgba(0,0,0,0.5)'; g.beginPath(); g.ellipse(cx, y + 18, 9, 4, 0, 0, TAU); g.fill();
        g.fillStyle = cg; g.fillRect(cx - 5.5, y - 22, 11, 40); g.fillStyle = rgb(base, 0.5); g.fillRect(cx - 7.5, y + 14, 15, 5); g.fillRect(cx - 7.5, y - 26, 15, 5);
        g.fillStyle = rgb(mixc(base, [220, 210, 200], 0.2)); g.fillRect(cx - 7.5, y - 26, 15, 1.2);
        g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 0.6; for (let k = -3; k <= 3; k += 3) { g.beginPath(); g.moveTo(cx + k, y - 21); g.lineTo(cx + k, y + 14); g.stroke(); } // fluting
      }
    }
    // ---- the near wall: a low lip of coping stones
    for (let x = -W - SD; x < W + SD; x += 12) block(x, H, 12, AR.lip, 0.15);
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(-W, H - 3, W * 2, 3);

    // ---- the far wall: courses of black ashlar, rising from the floor's north edge
    const top = -H - WH;
    for (let y = top, row = 0; y < -H; y += 10, row++) for (let x = -W - SD - (row % 2) * 9; x < W + SD; x += 18) block(x, y, 18, 10, 0.55 - 0.35 * ((y - top) / WH));
    // a cornice along its top: a row of corbels, a dark band of shadow under it
    for (let x = -W - SD; x < W + SD; x += 9) { g.fillStyle = rgb(base, 0.7); g.fillRect(x + 1, top - 2, 7, 6); g.fillStyle = 'rgba(255,240,230,0.12)'; g.fillRect(x + 1, top - 2, 7, 1); }
    g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(-W - SD, top + 4, (W + SD) * 2, 4);
    // the wall's foot in shadow
    { const fg = g.createLinearGradient(0, -H - 22, 0, -H); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = fg; g.fillRect(-W - SD, -H - 22, (W + SD) * 2, 22); }
    // a pointed arch (opening) in the far wall: (x, foot y, width, height); dark inside
    const arch = (x, w2, h2, fill) => {
      const y0 = -H, sp = y0 - h2 + w2 * 0.9;
      g.beginPath(); g.moveTo(x - w2 / 2, y0); g.lineTo(x - w2 / 2, sp); g.quadraticCurveTo(x - w2 / 2, y0 - h2, x, y0 - h2 - 4); g.quadraticCurveTo(x + w2 / 2, y0 - h2, x + w2 / 2, sp); g.lineTo(x + w2 / 2, y0); g.closePath();
      g.fillStyle = fill; g.fill();
      // its voussoirs: a ring of lit stones round the opening
      g.strokeStyle = rgb(mixc(base, [210, 200, 190], 0.25)); g.lineWidth = 2.4; g.stroke();
      g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 0.8; g.stroke();
    };
    const niches = [[-W * 0.62, 'skulls'], [-W * 0.3, 'coffin'], [W * 0.3, 'saint'], [W * 0.62, 'skulls']];
    if (look === 1) niches[3][1] = 'cage'; if (look === 2) { niches[0][1] = 'saint'; niches[3][1] = 'coffin'; }
    for (const [x, kind] of niches) {
      arch(x, 30, 62, '#050304');
      const y0 = -H - 4;
      if (kind === 'skulls') { for (let row = 0; row < 5; row++) for (let k = 0; k < 5 - row; k++) skull(x - 9 + k * 4.5 + row * 2.2, y0 - row * 4.6, 2.3); } // an ossuary heap
      else if (kind === 'coffin') { // a coffin stood upright, its lid ajar, dark between
        g.fillStyle = '#2a1a14'; g.beginPath(); g.moveTo(x - 6, y0); g.lineTo(x - 8, y0 - 26); g.lineTo(x - 4, y0 - 40); g.lineTo(x + 4, y0 - 40); g.lineTo(x + 8, y0 - 26); g.lineTo(x + 6, y0); g.closePath(); g.fill();
        g.fillStyle = '#4a3020'; g.beginPath(); g.moveTo(x - 4, y0 - 1); g.lineTo(x - 6, y0 - 26); g.lineTo(x - 2, y0 - 38); g.lineTo(x + 2.5, y0 - 38); g.lineTo(x + 4, y0 - 26); g.lineTo(x + 2, y0 - 1); g.closePath(); g.fill();
        g.fillStyle = '#000'; g.fillRect(x + 2.5, y0 - 34, 2, 30); g.fillStyle = '#8a6a40'; g.fillRect(x - 1.2, y0 - 30, 2.4, 0.8); g.fillRect(x - 0.4, y0 - 33, 0.8, 7); // a cross on the lid
        g.fillStyle = '#c8bca8'; for (let k = 0; k < 3; k++) g.fillRect(x + 4, y0 - 22 + k * 2.4, 2.4, 0.9); // bony fingers round its edge
      } else if (kind === 'saint') { // a hooded statue, its face a shadow, its hands joined over a sword
        g.fillStyle = rgb(base, 0.95); g.beginPath(); g.moveTo(x - 7, y0); g.quadraticCurveTo(x - 9, y0 - 24, x - 5, y0 - 34); g.quadraticCurveTo(x, y0 - 44, x + 5, y0 - 34); g.quadraticCurveTo(x + 9, y0 - 24, x + 7, y0); g.closePath(); g.fill();
        g.fillStyle = rgb(mixc(base, [200, 190, 180], 0.25)); g.beginPath(); g.moveTo(x - 6, y0); g.quadraticCurveTo(x - 8, y0 - 24, x - 4.5, y0 - 34); g.quadraticCurveTo(x - 2, y0 - 38, x, y0 - 38); g.lineTo(x, y0); g.closePath(); g.fill();
        g.fillStyle = '#020102'; g.beginPath(); g.ellipse(x, y0 - 33, 3, 3.6, 0, 0, TAU); g.fill();
        g.fillStyle = '#ff2030'; g.fillRect(x - 1.8, y0 - 33.5, 1, 0.9); g.fillRect(x + 0.8, y0 - 33.5, 1, 0.9); // two red points of light under the hood
        g.fillStyle = '#5a5460'; g.fillRect(x - 0.6, y0 - 24, 1.2, 22); g.fillRect(x - 3.5, y0 - 24, 7, 1.2);
      } else if (kind === 'cage') { // an iron cage hung in the niche, a skeleton slumped inside
        g.strokeStyle = '#5a5058'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y0 - 56); g.lineTo(x, y0 - 40); g.stroke();
        g.fillStyle = '#c0b4a0'; skull(x, y0 - 30, 2.2); g.fillRect(x - 1.5, y0 - 27, 3, 8); bone(x, y0 - 20, 6, 0.4);
        g.strokeStyle = '#4a4248'; g.lineWidth = 0.9; for (let k = -6; k <= 6; k += 3) { g.beginPath(); g.moveTo(x + k * 0.8, y0 - 40); g.lineTo(x + k, y0 - 14); g.stroke(); } g.beginPath(); g.ellipse(x, y0 - 40, 5, 1.6, 0, 0, TAU); g.ellipse(x, y0 - 14, 6, 2, 0, 0, TAU); g.stroke();
      }
    }
    // buttresses between the niches: tall piers stepping out of the wall
    for (const x of [-W * 0.86, -W * 0.46, -W * 0.14, W * 0.14, W * 0.46, W * 0.86]) {
      const pg = g.createLinearGradient(x - 5, 0, x + 5, 0); pg.addColorStop(0, rgb(mixc(base, [210, 200, 190], 0.2))); pg.addColorStop(1, rgb(base, 0.4));
      g.fillStyle = pg; g.fillRect(x - 4.5, top + 6, 9, WH - 6); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x + 4.5, top + 6, 2, WH - 6);
      for (let y = top + 18; y < -H; y += 22) { g.fillStyle = rgb(base, 0.55); g.fillRect(x - 6, y, 12, 2.5); g.fillStyle = 'rgba(255,240,230,0.12)'; g.fillRect(x - 6, y, 12, 0.8); }
    }
    // the great arch of the stairs, in the middle: deeper, wider, its steps going down into the dark
    arch(0, 44, 78, '#030202');
    for (let k = 0; k < 6; k++) { const yy = -H - 3 - k * 3.4, ww = 38 - k * 3.2, l = 70 - k * 11; g.fillStyle = 'rgb(' + l + ',' + (l - 10) + ',' + (l - 8) + ')'; g.fillRect(-ww / 2, yy, ww, 2.4); g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(-ww / 2, yy + 2.4, ww, 1); }
    skull(0, -H - WH + 6, 4.2); // a great skull keystone over it
    // a barred window high on the wall, beside the arch: red light bleeds through
    for (const x of [-W * 0.46 + 16, W * 0.46 - 16]) {
      const y = top + 18; g.fillStyle = '#120202'; g.fillRect(x - 6, y, 12, 16);
      const wg = g.createLinearGradient(0, y, 0, y + 16); wg.addColorStop(0, 'rgba(200,30,20,0.85)'); wg.addColorStop(1, 'rgba(90,6,6,0.6)'); g.fillStyle = wg; g.fillRect(x - 5, y + 1, 10, 14);
      g.fillStyle = '#1a1416'; for (let k = -4; k <= 4; k += 2.6) g.fillRect(x + k - 0.5, y, 1, 16); g.fillRect(x - 6, y + 7, 12, 1);
    }
    // chains hanging down the face, a meat hook on one
    for (const x of [-W * 0.78, W * 0.05, W * 0.74]) {
      g.strokeStyle = '#4a4448'; g.lineWidth = 1; for (let y = top + 8; y < top + 40 + (x > 0 ? 14 : 0); y += 2.6) { g.beginPath(); g.ellipse(x + Math.sin(y * 0.2) * 0.6, y, 0.9, 1.4, 0, 0, TAU); g.stroke(); }
    }
    // cobwebs in the corners
    for (const [x, y, sx] of [[-W, -H, 1], [W, -H, -1]]) { g.strokeStyle = 'rgba(200,200,210,0.18)'; g.lineWidth = 0.5; for (let k = 1; k <= 4; k++) { g.beginPath(); g.moveTo(x + sx * k * 6, y); g.quadraticCurveTo(x + sx * k * 3, y - k * 3, x, y - k * 6); g.stroke(); } for (let k = 0; k < 5; k++) { const a = k / 4 * Math.PI / 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + sx * Math.cos(a) * 26, y - Math.sin(a) * 26); g.stroke(); } }
    G.grade && G.grade(g, c); // the game's palette, as every sprite
    c.lights = [];
    // a candle on the far wall's piers (their flames are drawn live), and
    // on the side walls every other half-column (a torch)
    for (const x of [-W * 0.86, -W * 0.46, -W * 0.14, W * 0.14, W * 0.46, W * 0.86]) c.lights.push({ x, y: -H - WH * 0.42, s: 1, pier: true }); // (the middle pair too: the ones in view on a phone)
    for (const sx of [-1, 1]) for (let y = -H + 50, i = 0; y < H - 10; y += 74, i++) if (i % 2 === 0) c.lights.push({ x: sx * (W - 2), y: y - 28, s: 1.1, torch: true });
    ARTS[key] = c; return c;
  }
  R.dunArtWarm = function () { dunArt(this.stage, 0); dunArt(this.stage, 1); dunArt(this.stage, 2); };

  /** The chamber, drawn right after the floor: the painted stone (dunArt), then what moves: the candles and torches,
   *  the grate over the stairs (down until the floor is cleared, rising after), the stairs' glow, the vault's door. */
  R.drawDunArena = function (g, cx, cy, W, H, now, lights) {
    const Q = this.dun, art = dunArt(this.stage, Q.art || 0), ox = -cx, oy = -cy;
    g.save();
    g.fillStyle = 'rgb(' + (this.stage.theme.dark || [6, 5, 8]).join(',') + ')'; // beyond the painting: the dark
    if (oy - ET > 0) g.fillRect(0, 0, W, oy - ET); if (oy + EB < H) g.fillRect(0, oy + EB, W, H - oy - EB);
    if (ox - EX > 0) g.fillRect(0, 0, ox - EX, H); if (ox + EX < W) g.fillRect(ox + EX, 0, W - ox - EX, H);
    g.imageSmoothingEnabled = false; g.drawImage(art, ox - EX, oy - ET, EX * 2, ET + EB);
    // the flames
    for (const l of art.lights) {
      const x = ox + l.x, y = oy + l.y; if (x < -30 || y < -30 || x > W + 30 || y > H + 30) continue;
      const fl = 0.75 + 0.25 * Math.sin(now * (l.torch ? 9 : 13) + l.x * 1.7) + 0.08 * Math.sin(now * 31 + l.y);
      if (l.torch) { g.fillStyle = '#1a1210'; g.fillRect(x - 1.2, y, 2.4, 7); g.fillStyle = '#3a2a20'; g.fillRect(x - 2.5, y - 1, 5, 2); }
      else if (l.pier) { g.fillStyle = '#1a1416'; g.fillRect(x - 3.5, y + 0.4, 7, 1.6); g.fillRect(x - 0.6, y + 2, 1.2, 3); g.fillStyle = '#4a4248'; g.fillRect(x - 3.5, y + 0.4, 7, 0.5); }
      else { g.fillStyle = '#d8ccb0'; g.fillRect(x - 0.8, y - 3 * l.s, 1.6, 3 * l.s); g.fillStyle = 'rgba(200,190,170,0.6)'; g.fillRect(x - 1.2, y - 0.6, 2.4, 0.8); }
      const fy = l.torch ? y - 1 : y - 3 * l.s, fh = (l.torch ? 8 : 3.6 * l.s) * fl;
      g.fillStyle = '#ff7a2a'; g.beginPath(); g.moveTo(x - (l.torch ? 2.6 : 1), fy); g.quadraticCurveTo(x, fy - fh * 1.6, x + (l.torch ? 2.6 : 1), fy); g.fill();
      g.fillStyle = '#ffe2a0'; g.beginPath(); g.moveTo(x - (l.torch ? 1.2 : 0.5), fy); g.quadraticCurveTo(x, fy - fh, x + (l.torch ? 1.2 : 0.5), fy); g.fill();
      lights.push({ x: l.x, y: fy - 2 - oy, r: l.torch ? 70 : 44, kind: 'brazier' }); // (lights are in the world)
    }
    // the stairs: a red glow rising from below once the grate is up; the grate itself
    const X = Q.exit, up = X ? Math.min(1, X.t / 0.8) : 0, sx = ox + AR.stairs.x, sy = oy - AR.H;
    const vk = X && X.vault, vc = vk === 'gold' ? [255, 200, 70] : vk ? [150, 205, 255] : [255, 90, 40]; // a vault waiting below: its glow, gold or steel
    if (!Q.vault && ((!this.won && Q.floor < BOSS_FLOOR()) || vk)) {
      if (up > 0) {
        g.save(); g.globalCompositeOperation = 'lighter';
        const pu = 0.7 + 0.3 * Math.sin(now * 3);
        const gl = g.createRadialGradient(sx, sy - 10, 2, sx, sy - 10, vk ? 60 : 46); gl.addColorStop(0, 'rgba(' + vc.join(',') + ',' + (vk ? 0.75 : 0.55) * up * pu + ')'); gl.addColorStop(1, 'rgba(' + vc.join(',') + ',0)');
        g.fillStyle = gl; g.fillRect(sx - 64, sy - 70, 128, 90); g.restore();
        lights.push(vk ? { x: AR.stairs.x, y: -AR.H - 10, r: 100 * up, kind: 'tint', color: vk === 'gold' ? '#ffd35a' : '#8ac8ff', a: 0.9 } : { x: AR.stairs.x, y: -AR.H - 10, r: 80 * up, kind: 'lava' });
        if (Math.random() < (vk ? 0.5 : 0.25)) this.parts.push({ x: AR.stairs.x + U.rand(-14, 14), y: -AR.H - U.rand(0, 8), vx: U.rand(-3, 3), vy: -U.rand(10, 24), life: 1, max: 1, c: vk === 'gold' ? (Math.random() < 0.5 ? '#ffe080' : '#fff6c0') : vk ? '#c8e4ff' : Math.random() < 0.5 ? '#ff8a40' : '#ffd0a0', s: 1 });
        // an arrow on the floor before the stairs, pulsing: the way down
        const ay = sy + 20 + Math.sin(now * 5) * 2; g.fillStyle = 'rgba(255,200,120,' + (0.5 + 0.3 * Math.sin(now * 5)) * up + ')'; g.beginPath(); g.moveTo(sx - 7, ay + 6); g.lineTo(sx, ay - 2); g.lineTo(sx + 7, ay + 6); g.lineTo(sx + 4, ay + 6); g.lineTo(sx, ay + 2); g.lineTo(sx - 4, ay + 6); g.closePath(); g.fill();
      }
      // the portcullis: iron bars with spiked feet, raised by up
      const gh = 62, gy = sy - 4 - gh * up;
      g.save(); g.beginPath(); g.rect(sx - 22, sy - 84, 44, 82); g.clip();
      g.fillStyle = '#171214'; for (let k = -18; k <= 18; k += 6) g.fillRect(sx + k - 1.1, gy - gh, 2.2, gh);
      for (const yy of [gy - gh + 10, gy - gh * 0.55, gy - 10]) g.fillRect(sx - 20, yy, 40, 2);
      g.fillStyle = '#4a4248'; for (let k = -18; k <= 18; k += 6) { g.fillRect(sx + k - 0.4, gy - gh, 0.8, gh); g.beginPath(); g.moveTo(sx + k - 1.6, gy); g.lineTo(sx + k, gy + 3); g.lineTo(sx + k + 1.6, gy); g.fill(); }
      g.restore();
    }
    // in a vault: the whole chamber heaped with its treasure (gold, or ingots of the level's metals), lit by it
    if (Q.vault) {
      const gold = Q.vault.kind === 'gold', cols = gold ? ['#ffe070', '#ffc83a', '#c8902a', '#8a5a14'] : ['#e8eef6', '#a8b0bc', '#ffcf4a', '#8ab8ff'];
      for (let i = 0; i < 26; i++) {
        const ring = i < 16, a2 = i * 2.39996, rx = ring ? AR.W * 0.86 : AR.W * 0.45, ry = ring ? AR.H * 0.82 : AR.H * 0.4;
        const wx = Math.cos(a2) * rx, wy = Math.sin(a2) * ry, x = ox + wx, y = oy + wy; if (x < -30 || y < -30 || x > W + 30 || y > H + 30) continue;
        const sz = ring ? 1.4 : 0.9;
        for (let k = 0; k < 12; k++) { const px = x + Math.sin(k * 1.7 + i) * 9 * sz * (1 - k / 14), py = y + Math.cos(k * 2.3 + i) * 3.4 * sz - k * 0.9 * sz; g.fillStyle = cols[(k + i) % cols.length]; g.fillRect(px - 2.4, py - 1.2, 4.8, 2.4); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(px - 2.4, py + 0.8, 4.8, 0.6); }
        if (i % 3 === 0) lights.push({ x: wx, y: wy - 4, r: 36, kind: 'tint', color: gold ? '#ffd35a' : '#c8dcff', a: 0.55 });
        if (Math.random() < 0.03) this.parts.push({ x: wx + U.rand(-6, 6), y: wy - 6, vx: 0, vy: -10, life: 0.7, max: 0.7, c: gold ? '#fff6c0' : '#e8f4ff', s: 1 });
      }
    }
    g.restore();
  };
})(window.DH);
