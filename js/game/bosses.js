/* Boss behaviour and telegraphed hazards (mixed into DH.Run.prototype). */
(function (DH) {
  'use strict';
  const U = DH.util, C = DH.content;
  const R = DH.Run.prototype;
  const TAU = Math.PI * 2;

  R.hazard = function (h) { h.t = 0; h.fired = false; h.tick = 0; this.hazards.push(h); return h; };
  R.inHazard = function (h, x, y) {
    if (h.kind === 'circle') return U.dist2(x, y, h.x, h.y) < h.r * h.r;
    if (h.kind === 'ring') {
      const d2 = U.dist2(x, y, h.x, h.y); if (!(d2 < h.r * h.r && d2 > h.r0 * h.r0)) return false;
      if (h.gap == null) return true;
      let a = Math.atan2(y - h.y, x - h.x) - h.gap; a = Math.atan2(Math.sin(a), Math.cos(a)); return Math.abs(a) > h.gw; // a gap in the wave lets you through
    }
    if (h.kind === 'line') {
      const dx = x - h.x, dy = y - h.y, ca = Math.cos(h.ang), sa = Math.sin(h.ang);
      const along = dx * ca + dy * sa, perp = -dx * sa + dy * ca;
      return along > -h.w && along < h.len && Math.abs(perp) < h.w / 2;
    }
    if (h.kind === 'cone') {
      const d = Math.hypot(x - h.x, y - h.y); if (d > h.len) return false;
      let a = Math.atan2(y - h.y, x - h.x) - h.ang; a = Math.atan2(Math.sin(a), Math.cos(a));
      return Math.abs(a) < h.arc / 2;
    }
    return false;
  };
  R.updateHazards = function (dt) {
    const p = this.player;
    this.pslow = Math.max(0, (this.pslow || 0) - dt); this.proot = Math.max(0, (this.proot || 0) - dt);
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i]; h.t += dt;
      if (h.follow && h.t < h.follow) { const k = Math.min(1, dt * 5); h.x += (p.x - h.x) * k; h.y += (p.y - h.y) * k; } // a judgment mark follows you, then locks
      if (!h.fired && h.t >= h.delay) {
        h.fired = true;
        const eye = this.crackedEye && h.src && h.src.def && h.src.def.lord; // Cracked Ember Eye: the Lord's bombs and flames pass you by
        if (!eye && h.dmg && this.inHazard(h, p.x, p.y)) { this.hurtPlayer(h.dmg); if (h.slow) this.pslow = Math.max(this.pslow, h.slow); }
        if (h.onFire) h.onFire(this, h);
        this.fx.push({ k: 'hzfire', h: Object.assign({}, h), life: 0.35, max: 0.35 });
        if (h.sound) DH.audio.play(h.sound);
      }
      if (h.fired && h.dur) {
        h.tick -= dt;
        if (h.pull) { const d = Math.hypot(p.x - h.x, p.y - h.y); if (d > 3 && d < h.r * 2.4) { p.x -= (p.x - h.x) / d * h.pull * dt; p.y -= (p.y - h.y) / d * h.pull * dt; } } // a rift drags you toward it
        if ((h.dmg || h.slow) && !(this.crackedEye && h.src && h.src.def && h.src.def.lord) && this.inHazard(h, p.x, p.y)) { if (h.slow) this.pslow = Math.max(this.pslow, 0.25); if (h.dmg && h.tick <= 0) { h.tick = 0.5; this.hurtPlayer(h.dmg * 0.5); } } // a slowing puddle may do no harm at all
      }
      if (h.fired && h.t >= h.delay + (h.dur || 0)) this.hazards.splice(i, 1);
    }
  };

  R.bossAI = function (e, dt, dx, dy, dist) {
    e.alive = (e.alive || 0) + dt;
    const eat = e.hexed ? C.HEX.enrageAt : 45;
    if (e.def.lord && e.alive > eat) { const k = 1 + (e.alive - eat) * (e.hexed ? 0.006 : 0.012); e.enr = k; } else e.enr = 1;
    const f = AI[e.def.ai]; if (f) f(this, e, dt, dx, dy, dist);
    e.cspd *= e.enr;
  };
  const shot = (run, e, ang, spd, mult, color, kind) => run.enemyShot(e, ang, spd, e.dmg * mult * e.enr, color, kind);

  function charge(run, e, dt, dx, dy, dist, spd) {
    e.phaseT = (e.phaseT || 0) + dt;
    if (e.phase === 0) { e.mx = dx; e.my = dy; e.cspd = e.spd; if (e.phaseT > 3.2 && dist < 220) { e.phase = 1; e.phaseT = 0; e.lockX = dx; e.lockY = dy; } return false; }
    if (e.phase === 1) { e.mx = 0; e.my = 0; e.cspd = 0; e.tele = true; if (e.phaseT > 0.7) { e.phase = 2; e.phaseT = 0; e.tele = false; DH.audio.play('roar'); } return false; }
    e.mx = e.lockX; e.my = e.lockY; e.cspd = spd || 230;
    if (Math.random() < dt * 20) run.parts.push({ x: e.x, y: e.y + 10, vx: U.rand(-20, 20), vy: U.rand(-30, -5), life: 0.5, max: 0.5, c: '#6a5a4a', s: 2 });
    if (e.phaseT > 0.85) { e.phase = 0; e.phaseT = 0; run.shake = 4; return true; }
    return false;
  }

  const AI = {
    b_charge(run, e, dt, dx, dy, dist) {
      if (charge(run, e, dt, dx, dy, dist)) {
        for (let i = 0; i < 10; i++) shot(run, e, i / 10 * TAU, 85, 0.6, '#ebdfc0');
        if (Math.random() < 0.5) for (let i = 0; i < 4; i++) run.spawnEnemy('skeleton', e.x + U.rand(-30, 30), e.y + U.rand(-30, 30));
      }
    },
    b_caster(run, e, dt, dx, dy, dist) {
      e.cspd = e.spd; e.mx = dist < 110 ? -dx : dist > 150 ? dx : -dy * 0.6; e.my = dist < 110 ? -dy : dist > 150 ? dy : dx * 0.6;
      e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
      const col = e.variant === 'ice' ? '#8ff0ff' : e.variant === 'gold' ? '#fff0a0' : '#7dffb0';
      if (e.c1 > 2.8) { e.c1 = 0; const off = Math.random() * TAU; for (let i = 0; i < 14; i++) shot(run, e, off + i / 14 * TAU, 70, 0.7, col); DH.audio.play('frost'); }
      if (e.c2 > 4.6) { e.c2 = 0; const a = Math.atan2(dy, dx); [-0.25, 0, 0.25].forEach((o) => shot(run, e, a + o, 120, 0.8, col)); }
      if (e.c3 > 8) { e.c3 = 0; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; run.spawnEnemy('skeleton', e.x + Math.cos(a) * 30, e.y + Math.sin(a) * 30); } run.burst(e.x, e.y, 18, [col, '#ffffff'], 60); }
    },
    b_demon(run, e, dt, dx, dy, dist) {
      charge(run, e, dt, dx, dy, dist);
      e.c1 = (e.c1 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
      if (e.c1 > 3.4 && e.phase === 0) { e.c1 = 0; const off = Math.random() * TAU; for (let i = 0; i < 18; i++) shot(run, e, off + i / 18 * TAU, 80, 0.6, '#ff8a3a'); DH.audio.play('fire'); }
      if (e.c3 > 9) { e.c3 = 0; for (let i = 0; i < 6; i++) run.spawnEnemy('imp', e.x + U.rand(-40, 40), e.y + U.rand(-40, 40)); }
      if (e.c4 == null) e.c4 = 0; e.c4 += dt;
      if (e.c4 > 6) { e.c4 = 0; const p = run.player; for (let i = 0; i < 4; i++) run.hazard({ kind: 'circle', x: p.x + U.rand(-50, 50), y: p.y + U.rand(-50, 50), r: 26, delay: 1.1, dmg: e.dmg, color: '#ff5a1a', src: e, boss: true, sound: 'boom', fire: true }); }
    },
    /* Lord of Anguish: mounted charges & skull formations, then on foot: fire waves & grasping hands */
    b_lord(run, e, dt, dx, dy, dist) {
      const p = run.player;
      if (!e.footed && e.hp < e.maxHp * 0.5) {
        e.footed = true; e.painter = e.def.painter2; e.phase = 0; e.phaseT = 0; e.tele = false; e.spd *= 0.75;
        run.burst(e.x, e.y, 50, ['#ff6a2a', '#2a1a22', '#ffffff'], 140); run.shake = 8; DH.audio.play('roar');
        DH.events.emit('run:warning', t('hud.dismounted'));
      }
      e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt;
      if (e.def.lord) { e.cb = (e.cb || 0) + dt; if (e.cb > 14) { e.cb = 0; shot(run, e, Math.atan2(p.y - e.y, p.x - e.x), 55, 0.3, '#a040ff', 'curse'); DH.audio.play('frost'); } } // Curse Bolt: slow, but deadly in 40 s
      if (!e.footed) {
        charge(run, e, dt, dx, dy, dist, 280);
        if (e.c1 > 3.4 && e.phase === 0) {
          e.c1 = 0; e.pat = ((e.pat || 0) + 1) % 3;
          const base = Math.atan2(dy, dx);
          if (e.pat === 0) { for (let i = 0; i < 22; i++) { const a = base + i / 22 * TAU; if (Math.abs(Math.atan2(Math.sin(a - base - Math.PI), Math.cos(a - base - Math.PI))) < 0.45) continue; shot(run, e, a, 75, 0.7, '#b060ff', 'skull'); } }
          else if (e.pat === 1) { for (let w = 0; w < 3; w++) run.after(w * 0.35, () => { for (let i = 0; i < 10; i++) shot(run, e, w * 0.3 + i / 10 * TAU, 85, 0.6, '#b060ff', 'skull'); }); }
          else { for (let k = 0; k < 4; k++) { const a = base + k * Math.PI / 2 + Math.PI / 4; for (let j = 0; j < 5; j++) run.after(j * 0.12, () => shot(run, e, a, 110, 0.6, '#b060ff', 'skull')); } }
          DH.audio.play('frost');
        }
      } else {
        e.cspd = e.spd; e.mx = dx; e.my = dy;
        if (e.c1 > 3) { // wave of fire with a single gap
          e.c1 = 0; const gap = Math.atan2(dy, dx) + U.rand(-1.2, 1.2);
          for (let i = 0; i < 36; i++) { const a = i / 36 * TAU; if (Math.abs(Math.atan2(Math.sin(a - gap), Math.cos(a - gap))) < 0.38) continue; shot(run, e, a, 60, 0.7, '#ff7a20', 'fire'); }
          DH.audio.play('fire');
        }
        if (e.c2 > 5) { // demonic hands claw up from the floor
          e.c2 = 0;
          run.hazard({ kind: 'circle', x: p.x, y: p.y, r: 18, delay: 1, dur: 2.5, dmg: e.dmg * 0.8, slow: 0.6, color: '#b02030', src: e, boss: true, hands: true });
          for (let i = 0; i < 4; i++) { const a = Math.random() * TAU, d = U.rand(30, 70); run.hazard({ kind: 'circle', x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, r: 18, delay: 1, dur: 2.5, dmg: e.dmg * 0.8, slow: 0.6, color: '#b02030', src: e, boss: true, hands: true }); }
        }
      }
    },
    b_overlord(run, e, dt, dx, dy, dist) {
      const p = run.player;
      e.cspd = e.spd; e.mx = dx; e.my = dy;
      e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt;
      if (e.c1 > 3.5) {
        e.c1 = 0;
        run.hazard({ kind: 'circle', x: p.x, y: p.y, r: 40, delay: 1.1, dmg: e.dmg * 1.4, color: '#ff4a2a', src: e, boss: true, sound: 'boom',
          onFire: (r, h) => { r.shake = 6; for (let i = 0; i < 12; i++) r.enemyShot({ x: h.x, y: h.y }, i / 12 * TAU, 90, e.dmg * 0.5, '#ffb030'); } });
      }
      if (e.c2 > 8) { e.c2 = 0; for (let i = 0; i < 5; i++) run.spawnEnemy('imp', e.x + U.rand(-40, 40), e.y + U.rand(-40, 40)); DH.audio.play('roar'); }
    },
    b_wyrm(run, e, dt, dx, dy, dist) {
      const p = run.player;
      e.cspd = e.spd * 1.2; e.mx = dist < 100 ? -dx : dist > 150 ? dx : -dy; e.my = dist < 100 ? -dy : dist > 150 ? dy : dx;
      e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt;
      if (e.c1 > 4) { e.c1 = 0; const a = Math.atan2(p.y - e.y, p.x - e.x); run.hazard({ kind: 'cone', x: e.x, y: e.y, ang: a, arc: 0.9, len: 170, delay: 0.9, dmg: e.dmg * 1.2, color: e.variant === 'bog' ? '#90d040' : '#ff6a1a', src: e, boss: true, sound: 'fire', fire: true }); }
      if (e.c2 > 2.4) { e.c2 = 0; const a = Math.atan2(dy, dx); [-0.3, 0, 0.3].forEach((o, i) => run.after(i * 0.15, () => shot(run, e, a + o, 140, 0.7, e.variant === 'bog' ? '#b0ff50' : '#ff8a3a', 'fire'))); }
    },
    b_horseman(run, e, dt, dx, dy, dist) {
      const p = run.player, S = C.SECRET;
      // the Lord turns ethereal now and then: nothing touches it (the Sentinel Orb forbids it)
      e.eth = Math.max(0, (e.eth || 0) - dt);
      if (e.def.lord && !run.sentinel) { e.ethT = (e.ethT || 0) + dt; if (e.ethT >= S.ethEvery) { e.ethT = 0; e.eth = S.ethDur; run.text(e.x, e.y - e.r - 12, t('sec.ethereal'), '#80f0ff', true); DH.audio.play('frost'); } }
      charge(run, e, dt, dx, dy, dist, 290);
      e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt;
      if (e.c1 > 3.8 && e.phase === 0) {
        e.c1 = 0; const a0 = Math.random() * Math.PI;
        for (let k = 0; k < 3; k++) { const a = a0 + k * Math.PI / 3; run.hazard({ kind: 'line', x: p.x - Math.cos(a) * 140, y: p.y - Math.sin(a) * 140, ang: a, len: 280, w: 16, delay: 1.1, dmg: e.dmg, color: '#80f0ff', src: e, boss: true, sound: 'zap' }); }
      }
      if (e.c2 > 10) { e.c2 = 0; for (let i = 0; i < 5; i++) run.spawnEnemy('wraith', e.x + U.rand(-40, 40), e.y + U.rand(-40, 40)); }
    },
    b_basilisk(run, e, dt, dx, dy, dist) {
      const p = run.player;
      e.cspd = e.spd; e.mx = dx; e.my = dy;
      e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
      if (e.c1 > 4.5) { e.c1 = 0; run.hazard({ kind: 'cone', x: e.x, y: e.y, ang: Math.atan2(p.y - e.y, p.x - e.x), arc: 0.8, len: 200, delay: 0.8, dmg: e.dmg * 0.7, slow: 2, color: '#e8e080', src: e, boss: true, sound: 'frost' }); }
      if (e.c2 > 3) { e.c2 = 0; for (let i = 0; i < 3; i++) run.hazard({ kind: 'circle', x: p.x + U.rand(-40, 40), y: p.y + U.rand(-40, 40), r: 20, delay: 0.9, dur: 3, dmg: e.dmg * 0.5, color: '#90d040', src: e, boss: true, pool: true }); }
      if (e.c3 > 2 && dist < 50) { e.c3 = 0; run.hazard({ kind: 'circle', x: e.x, y: e.y, r: 44, delay: 0.6, dmg: e.dmg, color: '#ff5040', src: e, boss: true, sound: 'swing' }); }
    },
    b_jotun(run, e, dt, dx, dy, dist) {
      const p = run.player;
      e.cspd = e.spd; e.mx = dx; e.my = dy;
      e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt;
      if (e.c1 > 3.6) {
        e.c1 = 0;
        run.hazard({ kind: 'circle', x: e.x, y: e.y, r: 58, delay: 0.9, dmg: e.dmg * 1.2, slow: 1, color: '#9fe8ff', src: e, boss: true, sound: 'boom',
          onFire: (r, h) => { r.shake = 7; for (let i = 0; i < 16; i++) r.enemyShot({ x: h.x, y: h.y }, i / 16 * TAU, 80, e.dmg * 0.5, '#cfefff'); } });
      }
      if (e.c2 > 5) { e.c2 = 0; for (let i = 0; i < 3; i++) run.after(i * 0.3, () => run.hazard({ kind: 'circle', x: p.x + (run.hatingHeart ? 0 : U.rand(-20, 20)), y: p.y + (run.hatingHeart ? 0 : U.rand(-20, 20)), r: 22, delay: run.hatingHeart ? 1.5 : 1.2, dmg: e.dmg, slow: 1, color: '#9fe8ff', src: e, boss: true, sound: 'boom', boulder: true })); }
    },
  };
  /* ---------- the Crypt ---------- */
  // Grave Chieftain: lumbers after you; raises its tombstone hammer (a marked circle), the blow throws bone shards all around;
  // stamps the ground in a line toward you; calls the hall's hounds
  AI.b_chieftain = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    e.cspd = e.slam > 0 ? 0 : e.spd; e.mx = dx; e.my = dy; e.slam = Math.max(0, (e.slam || 0) - dt);
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.c1 > 3.4) {
      e.c1 = 0; e.slam = 1.1;
      run.hazard({ kind: 'circle', x: p.x, y: p.y, r: 36, delay: 1.1, dmg: e.dmg * 1.4 * e.enr, color: '#c8a070', src: e, boss: true, sound: 'boom',
        onFire: (r, h) => { r.shake = 6; for (let i = 0; i < 10; i++) r.enemyShot({ x: h.x, y: h.y }, i / 10 * TAU, 85, e.dmg * 0.5, '#e8dcc0', 'skull'); } });
    }
    if (e.c2 > 6.5) {
      e.c2 = 0; const a = Math.atan2(dy, dx);
      for (let i = 0; i < 5; i++) run.after(i * 0.16, () => run.hazard({ kind: 'circle', x: e.x + Math.cos(a) * (24 + i * 24), y: e.y + Math.sin(a) * (24 + i * 24), r: 15, delay: 0.7, dmg: e.dmg * 0.9 * e.enr, color: '#c8a070', src: e, boss: true, sound: i === 0 ? 'boom' : null }));
    }
    if (e.c3 > 11) { e.c3 = 0; run.spawnPack('hound', { x: e.x, y: e.y }, 4); DH.audio.play('roar'); }
  };
  // Bone Tyrant: strides at you; its curse rings the ground around you (only the heart of the ring is safe); a wide sweep of
  // the greatsword when you come close; raises a guard of skeletons
  AI.b_tyrant = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    e.cspd = e.spd; e.mx = dx; e.my = dy;
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.c1 > 4.2) { e.c1 = 0; run.hazard({ kind: 'ring', x: p.x, y: p.y, r: 70, r0: 22, delay: 1.2, dmg: e.dmg * 1.3 * e.enr, color: '#b060ff', src: e, boss: true, sound: 'frost' }); }
    if (e.c2 > 1.6 && dist < 60) { e.c2 = 0; run.hazard({ kind: 'cone', x: e.x, y: e.y, ang: Math.atan2(dy, dx), arc: 2.2, len: 62, delay: 0.55, dmg: e.dmg * 1.2 * e.enr, color: '#ff5040', src: e, boss: true, sound: 'swing' }); }
    if (e.c3 > 9) { e.c3 = 0; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; run.spawnEnemy('skeleton', e.x + Math.cos(a) * 26, e.y + Math.sin(a) * 26); } run.burst(e.x, e.y, 20, ['#b060ff', '#e6dcc0'], 70); }
  };
  /* ---------- the Abyss ---------- */
  // Flamedancer: circles you in a dance; flicks fans of fire; dashes through you leaving a line of flame; rings you in fire
  // (the band of the ring burns while it lasts: stay inside or cross it quickly)
  AI.b_dancer = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.dashT > 0) { e.dashT -= dt; e.mx = e.lockX; e.my = e.lockY; e.cspd = 260; if (Math.random() < dt * 30) run.hazard({ kind: 'circle', x: e.x, y: e.y, r: 10, delay: 0.1, dur: 2.2, dmg: e.dmg * 0.4 * e.enr, color: '#ff7a20', src: e, boss: true }); return; }
    const orbit = dist < 90 ? -1 : dist > 130 ? 1 : 0; e.cspd = e.spd; e.mx = dx * orbit - dy * 0.8; e.my = dy * orbit + dx * 0.8;
    if (e.c1 > 2.6) { e.c1 = 0; const a = Math.atan2(dy, dx); for (const o of [-0.4, -0.2, 0, 0.2, 0.4]) shot(run, e, a + o, 110, 0.6, '#ff8a3a', 'fire'); DH.audio.play('fire'); }
    if (e.c2 > 6) { e.c2 = 0; e.dashT = 0.7; e.lockX = dx; e.lockY = dy; DH.audio.play('roar'); }
    if (e.c3 > 11) { e.c3 = 0; run.hazard({ kind: 'ring', x: p.x, y: p.y, r: 64, r0: 52, delay: 0.9, dur: 4, dmg: e.dmg * 0.8 * e.enr, color: '#ff5a1a', src: e, boss: true, sound: 'fire', fire: true }); }
  };
  // Ashen Warlord: casts two hollow copies of itself that each dash along a marked line through you, then stands where the last
  // one ended; rains fire arrows on three marked circles around you
  AI.b_warlord = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    e.cspd = e.spd * 0.8; e.mx = dx; e.my = dy;
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt;
    if (e.c1 > 6) {
      e.c1 = 0; let last = null;
      for (let k = 0; k < 2; k++) {
        const a = Math.random() * TAU, d = 110, sx = p.x + Math.cos(a) * d, sy = p.y + Math.sin(a) * d, ux = -Math.cos(a), uy = -Math.sin(a);
        run.hazard({ kind: 'line', x: sx, y: sy, ang: Math.atan2(uy, ux), len: 220, w: 18, delay: 0.8, dmg: 0, color: '#ffb070', src: e, boss: true });
        const c = run.spawnEnemy('ashclone', sx, sy); if (c) { c.mdx = ux; c.mdy = uy; c.ttl = 1.6; c.dmg = e.dmg * 0.9; c.face = ux >= 0 ? 1 : -1; }
        last = { x: sx + ux * 220, y: sy + uy * 220 };
      }
      if (last) run.after(1.6, () => { if (e.dead) return; run.burst(e.x, e.y, 20, ['#5a5452', '#ff7030'], 80); e.x = last.x; e.y = last.y; run.burst(e.x, e.y, 20, ['#5a5452', '#ff7030'], 80); });
      DH.audio.play('roar');
    }
    if (e.c2 > 4) { e.c2 = 0; for (let i = 0; i < 3; i++) run.hazard({ kind: 'circle', x: p.x + U.rand(-45, 45), y: p.y + U.rand(-45, 45), r: 24, delay: 1.2, dmg: e.dmg * e.enr, color: '#ff9040', src: e, boss: true, sound: i ? null : 'boom', fire: true }); }
  };
  /* ---------- the Aqueduct ---------- */
  // Hydra: three heads spit in turn; fouled water rains in pools that drag at you; it sinks from sight (untouchable) and rises
  // under where you stood (a marked circle), throwing a ring of spit
  AI.b_hydra = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    if (e.sub) { e.mx = 0; e.my = 0; e.cspd = 0; e.kx = e.ky = 0; return; } // under the water
    e.cspd = e.spd; e.mx = dx; e.my = dy;
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.c1 > 1.3) { e.c1 = 0; e.head = ((e.head || 0) + 1) % 3; const a = Math.atan2(dy, dx) + (e.head - 1) * 0.3; for (const o of [-0.14, 0, 0.14]) shot(run, e, a + o, 100, 0.45, '#70e0c0'); DH.audio.play('zap'); }
    if (e.c2 > 6) { e.c2 = 0; for (let i = 0; i < 3; i++) run.hazard({ kind: 'circle', x: p.x + U.rand(-40, 40), y: p.y + U.rand(-40, 40), r: 20, delay: 1.2, dur: 3, dmg: e.dmg * 0.5 * e.enr, slow: 1, color: '#40c0a0', src: e, boss: true, sound: i ? null : 'splash' }); }
    if (e.c3 > 11) {
      e.c3 = 0; e.sub = true; e.eth = 99; run.burst(e.x, e.y, 24, ['#70e0c0', '#2e5a52', '#c8f0ff'], 90); DH.audio.play('splash');
      run.hazard({ kind: 'circle', x: p.x, y: p.y, r: 40, delay: 1.6, dmg: e.dmg * 1.3 * e.enr, color: '#40c0a0', src: e, boss: true, sound: 'splash',
        onFire: (r, h) => { if (e.dead) return; e.x = h.x; e.y = h.y; e.sub = false; e.eth = 0; r.shake = 6; r.burst(h.x, h.y, 30, ['#70e0c0', '#c8f0ff'], 110); for (let i = 0; i < 10; i++) r.enemyShot({ x: h.x, y: h.y }, i / 10 * TAU, 80, e.dmg * 0.45 * e.enr, '#70e0c0'); } });
    }
  };
  // Bell Warden: tolls its bell, and waves of sound roll out from it; each wave has a gap to slip through; brings its clapper
  // down where you stand (a marked circle that stuns your step); rings in a procession of monks
  AI.b_bell = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    e.toll = Math.max(0, (e.toll || 0) - dt); e.cspd = e.toll > 0 ? 0 : e.spd; e.mx = dx; e.my = dy;
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.c1 > 5.5) {
      e.c1 = 0; e.toll = 2; DH.audio.play('bell'); run.shake = Math.max(run.shake, 3);
      const g0 = Math.atan2(dy, dx) + U.rand(-1.2, 1.2), turn = Math.random() < 0.5 ? -0.7 : 0.7;
      for (let i = 0; i < 3; i++) { const r0 = 22 + i * 46; run.hazard({ kind: 'ring', x: e.x, y: e.y, r0, r: r0 + 28, gap: g0 + i * turn, gw: 0.42, delay: 1.0 + i * 0.45, dmg: e.dmg * 1.1 * e.enr, color: '#ffd070', src: e, boss: true, sound: i ? null : 'boom' }); }
    }
    if (e.c2 > 3.2 && e.toll <= 0) { e.c2 = 0; run.hazard({ kind: 'circle', x: p.x, y: p.y, r: 28, delay: 1.0, dmg: e.dmg * 1.2 * e.enr, slow: 1.2, color: '#c8a060', src: e, boss: true, sound: 'boom', onFire: (r) => { r.shake = Math.max(r.shake, 4); } }); }
    if (e.c3 > 13) { e.c3 = 0; run.runEvent({ type: 'march', rows: 2, cols: 7 }); }
  };
  // Sunken Knight: charges with a marked line; hurls its trident along a marked line, and the water it drags floods the path
  // (pools that slow you); calls the drowned spirits up around you
  AI.b_sunken = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    charge(run, e, dt, dx, dy, dist, 250);
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt;
    if (e.c1 > 4.4 && e.phase === 0) {
      e.c1 = 0; const a = Math.atan2(dy, dx), L = 260, ca = Math.cos(a), sa = Math.sin(a);
      run.hazard({ kind: 'line', x: e.x, y: e.y, ang: a, len: L, w: 14, delay: 0.8, dmg: e.dmg * 1.2 * e.enr, color: '#70ffd0', src: e, boss: true, sound: 'throw',
        onFire: (r, h) => { for (let i = 1; i <= 3; i++) r.hazard({ kind: 'circle', x: h.x + ca * L * i / 4, y: h.y + sa * L * i / 4, r: 18, delay: 0.1, dur: 3.5, dmg: 0, slow: 1, color: '#3a8aa0', src: e }); } });
    }
    if (e.c2 > 10) { e.c2 = 0; for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4; run.spawnEnemy('spirit', p.x + Math.cos(a) * 95, p.y + Math.sin(a) * 95); } DH.audio.play('frost'); }
  };
  /* ---------- the Catacombs ---------- */
  // Frost Construct: stamps, and lines of ice spikes burst out from it in a cross (then turned by half); hurls ice boulders
  // that numb your step; its core wakes ice skulls; at half health its ice thickens (sturdier, slower, stamps sooner)
  AI.b_construct = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    if (!e.hard && e.hp < e.maxHp * 0.5) { e.hard = true; e.armor = Math.min(0.75, e.armor + 0.2); run.burst(e.x, e.y, 30, ['#d8f4ff', '#7ab8e0'], 100); DH.audio.play('frost'); run.text(e.x, e.y - e.r - 12, t('hud.iceArmor'), '#9fd8ff', true); }
    e.stamp = Math.max(0, (e.stamp || 0) - dt); e.cspd = e.stamp > 0 ? 0 : e.spd * (e.hard ? 0.8 : 1); e.mx = dx; e.my = dy;
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.c1 > (e.hard ? 4.6 : 5.8)) {
      e.c1 = 0; e.stamp = 0.7; e.cross = !e.cross; const a0 = e.cross ? Math.PI / 4 : 0;
      run.shake = Math.max(run.shake, 4); DH.audio.play('boom');
      for (let k = 0; k < 4; k++) { const a = a0 + k * Math.PI / 2; for (let i = 0; i < 6; i++) run.after(i * 0.1, () => run.hazard({ kind: 'circle', x: e.x + Math.cos(a) * (26 + i * 22), y: e.y + Math.sin(a) * (26 + i * 22), r: 13, delay: 0.7, dmg: e.dmg * 1.1 * e.enr, slow: 1, color: '#9fd8ff', src: e, boss: true, sound: i === 0 && k === 0 ? 'frost' : null })); }
    }
    if (e.c2 > 5.2) { e.c2 = 0; run.hazard({ kind: 'circle', x: p.x, y: p.y, r: 26, delay: 1.1, dmg: e.dmg * 1.2 * e.enr, slow: 1.5, color: '#9fd8ff', src: e, boss: true, sound: 'boom', boulder: true }); DH.audio.play('throw'); }
    if (e.c3 > 9) { e.c3 = 0; for (let i = 0; i < 4; i++) { const a = i / 4 * TAU; run.spawnEnemy('iceskull', e.x + Math.cos(a) * 22, e.y + Math.sin(a) * 22); } run.burst(e.x, e.y, 16, ['#c8f4ff', '#8ff0ff'], 70); }
  };
  // Ice Prism: drifts in on a slow spiral; a beam of cold light sweeps across a marked arc; flings fans of frost shards;
  // shatters into light and reforms elsewhere around you, shards bursting out
  AI.b_prism = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    const orbit = dist < 36 ? -1 : 1; e.cspd = e.sweep > 0 ? 0 : e.spd; e.mx = dx * orbit - dy * 0.4; e.my = dy * orbit + dx * 0.4; // drifts in on a slow spiral
    e.sweep = Math.max(0, (e.sweep || 0) - dt);
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.c1 > 7) {
      e.c1 = 0; e.sweep = 2.6; const a0 = Math.atan2(dy, dx), dir = Math.random() < 0.5 ? -1 : 1;
      for (let i = 0; i < 9; i++) run.after(i * 0.22, () => { if (e.dead) return; run.hazard({ kind: 'line', x: e.x, y: e.y, ang: a0 + dir * (-0.9 + i * 0.225), len: 280, w: 14, delay: 0.7, dmg: e.dmg * 1.1 * e.enr, color: '#c8f4ff', src: e, boss: true, sound: i % 3 ? null : 'zap' }); });
    }
    if (e.c2 > 3 && e.sweep <= 0) { e.c2 = 0; const a = Math.atan2(dy, dx); for (const o of [-0.36, -0.18, 0, 0.18, 0.36]) shot(run, e, a + o, 105, 0.5, '#a8e0ff', 'frost'); DH.audio.play('frost'); }
    if (e.c3 > 10 && e.sweep <= 0) {
      e.c3 = 0; run.burst(e.x, e.y, 26, ['#ffffff', '#8ff0ff'], 110);
      const a = Math.random() * TAU; e.x = p.x + Math.cos(a) * 130; e.y = p.y + Math.sin(a) * 130;
      run.burst(e.x, e.y, 26, ['#ffffff', '#8ff0ff'], 110); DH.audio.play('frost');
      for (let i = 0; i < 8; i++) shot(run, e, i / 8 * TAU, 80, 0.45, '#a8e0ff', 'frost');
    }
  };
  /* ---------- the Halls of Discord ---------- */
  // Void Caller: drifts in; looses orbs of void that follow you; tears rifts that drag you in, and each spits out a homunculus
  // as it closes; steps through the void to elsewhere and calls a brood of homunculi
  AI.b_voidcaller = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    const orbit = dist < 40 ? -1 : 1; e.cspd = e.spd; e.mx = dx * orbit - dy * 0.5; e.my = dy * orbit + dx * 0.5;
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.c1 > 3.2) { e.c1 = 0; const a = Math.atan2(dy, dx); for (const o of [-0.5, 0, 0.5]) { const b = shot(run, e, a + o, 60, 0.5, '#b050ff'); b.home = 1.3; b.life = 5; } DH.audio.play('zap'); }
    if (e.c2 > 7) {
      e.c2 = 0;
      for (let i = 0; i < 2; i++) {
        const a = Math.random() * TAU, x = p.x + Math.cos(a) * 50, y = p.y + Math.sin(a) * 50;
        run.hazard({ kind: 'circle', x, y, r: 24, delay: 0.9, dur: 4.5, dmg: e.dmg * 0.6 * e.enr, pull: 34, color: '#b050ff', src: e, boss: true, sound: i ? null : 'frost' });
        run.after(5.4, () => run.spawnEnemy('homunculus', x, y));
      }
    }
    if (e.c3 > 11) {
      e.c3 = 0; run.burst(e.x, e.y, 24, ['#b050ff', '#140420'], 100);
      const a = Math.random() * TAU; e.x = p.x + Math.cos(a) * 120; e.y = p.y + Math.sin(a) * 120;
      run.burst(e.x, e.y, 24, ['#b050ff', '#140420'], 100); DH.audio.play('frost');
      for (let i = 0; i < 3; i++) { const b = i / 3 * TAU; run.spawnEnemy('homunculus', e.x + Math.cos(b) * 18, e.y + Math.sin(b) * 18); }
    }
  };
  // Twisted Knight: charges along a marked line; close in, it strikes before and behind at once (two marked cones);
  // splits the floor with crystal in six lines radiating from it; at half health it grows faster
  AI.b_twisted = function (run, e, dt, dx, dy, dist) {
    if (!e.frenzy && e.hp < e.maxHp * 0.5) { e.frenzy = true; e.spd *= 1.25; run.burst(e.x, e.y, 26, ['#e060ff', '#ffffff'], 100); DH.audio.play('roar'); }
    charge(run, e, dt, dx, dy, dist, 270);
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt;
    if (e.c1 > 3 && e.phase === 0 && dist < 75) {
      e.c1 = 0; const a = Math.atan2(dy, dx);
      for (const o of [0, Math.PI]) run.hazard({ kind: 'cone', x: e.x, y: e.y, ang: a + o, arc: 1.5, len: 72, delay: 0.6, dmg: e.dmg * 1.2 * e.enr, color: '#e060ff', src: e, boss: true, sound: o ? null : 'swing' });
    }
    if (e.c2 > 8 && e.phase === 0) {
      e.c2 = 0; e.split = !e.split; const a0 = (e.split ? 0 : Math.PI / 6) + Math.atan2(dy, dx);
      for (let i = 0; i < 6; i++) run.hazard({ kind: 'line', x: e.x, y: e.y, ang: a0 + i / 6 * TAU, len: 180, w: 12, delay: 0.9, dmg: e.dmg * 1.1 * e.enr, color: '#e060ff', src: e, boss: true, sound: i ? null : 'frost' });
    }
  };
  /* ---------- the Blightmire ---------- */
  // Blightfiend: vomits a cone of bile that lingers on the ground; calls a cloud of mosquitoes; brings its fists down when you close in
  AI.b_blightfiend = function (run, e, dt, dx, dy, dist) {
    e.slam = Math.max(0, (e.slam || 0) - dt); e.cspd = e.slam > 0 ? 0 : e.spd; e.mx = dx; e.my = dy;
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.c1 > 4.2) { e.c1 = 0; e.slam = 0.8; run.hazard({ kind: 'cone', x: e.x, y: e.y, ang: Math.atan2(dy, dx), arc: 0.9, len: 115, delay: 0.8, dur: 2.5, dmg: e.dmg * 0.6 * e.enr, color: '#90b030', src: e, boss: true, sound: 'fire' }); }
    if (e.c2 > 9) { e.c2 = 0; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; run.spawnEnemy('mosquito', e.x + Math.cos(a) * 20, e.y + Math.sin(a) * 20); } DH.audio.play('roar'); }
    if (e.c3 > 2.6 && dist < 60) { e.c3 = 0; e.slam = 0.7; run.hazard({ kind: 'circle', x: e.x, y: e.y, r: 46, delay: 0.7, dmg: e.dmg * 1.2 * e.enr, color: '#c8a060', src: e, boss: true, sound: 'boom' }); }
  };
  // Bog Serpent: lunges along a marked line; spits acid in pools that burn and drag at you; sweeps its tail round in a ring
  AI.b_serpent = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    charge(run, e, dt, dx, dy, dist, 260);
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt;
    if (e.c1 > 3.6 && e.phase === 0) { e.c1 = 0; for (let i = 0; i < 3; i++) run.hazard({ kind: 'circle', x: p.x + U.rand(-36, 36), y: p.y + U.rand(-36, 36), r: 20, delay: 1.1, dur: 2.5, dmg: e.dmg * 0.5 * e.enr, slow: 1, color: '#a0e040', src: e, boss: true, sound: i ? null : 'fire' }); DH.audio.play('throw'); }
    if (e.c2 > 4 && e.phase === 0 && dist < 80) { e.c2 = 0; run.hazard({ kind: 'ring', x: e.x, y: e.y, r0: 16, r: 80, delay: 0.8, dmg: e.dmg * 1.2 * e.enr, color: '#6a9a3a', src: e, boss: true, sound: 'swing' }); }
  };
  // Elder Treant: roots burst from the ground in three lines toward you and hold you fast; spores fall and fester;
  // wakes treants from the mire
  AI.b_eldertreant = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    e.cspd = e.spd; e.mx = dx; e.my = dy;
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.c1 > 5) {
      e.c1 = 0; const a0 = Math.atan2(dy, dx); run.enemyAttackAnim(e);
      for (const o of [-0.35, 0, 0.35]) for (let i = 0; i < 6; i++) run.after(i * 0.12, () => run.hazard({ kind: 'circle', x: e.x + Math.cos(a0 + o) * (26 + i * 24), y: e.y + Math.sin(a0 + o) * (26 + i * 24), r: 13, delay: 0.7, dmg: e.dmg * 0.9 * e.enr, color: '#8a6a3a', src: e, boss: true, sound: i || o ? null : 'swing', onFire: (r, h) => { if (r.inHazard(h, r.player.x, r.player.y)) r.proot = 1; } }));
    }
    if (e.c3 > 4.5) { e.c3 = 0; for (let i = 0; i < 4; i++) run.hazard({ kind: 'circle', x: p.x + U.rand(-60, 60), y: p.y + U.rand(-60, 60), r: 16, delay: 1.2, dur: 2, dmg: e.dmg * 0.4 * e.enr, color: '#b0c040', src: e, boss: true }); }
    if (e.c2 > 11) { e.c2 = 0; for (const s of [-1, 1]) run.spawnEnemy('treant', e.x + s * 30, e.y + 10); run.burst(e.x, e.y, 20, ['#4a3a24', '#4a6a1a'], 80); DH.audio.play('roar'); }
  };
  // Lord of Rot: swings its censer and a ring of blight clouds settles round it; a plague rolls out in waves with gaps;
  // the dead of the mire rise around you
  AI.b_rotlord = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    e.swing = Math.max(0, (e.swing || 0) - dt); e.cspd = e.swing > 0 ? 0 : e.spd; e.mx = dx; e.my = dy;
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.c1 > 6) { e.c1 = 0; e.swing = 1; const o = Math.random() * TAU; for (let i = 0; i < 8; i++) { const a = o + i / 8 * TAU; run.hazard({ kind: 'circle', x: e.x + Math.cos(a) * 62, y: e.y + Math.sin(a) * 62, r: 20, delay: 0.8, dur: 4, dmg: e.dmg * 0.45 * e.enr, color: '#90b030', src: e, boss: true, sound: i ? null : 'fire' }); } }
    if (e.c2 > 9) {
      e.c2 = 0; e.swing = 1.6; DH.audio.play('roar');
      const g0 = Math.atan2(dy, dx) + U.rand(-1, 1), turn = Math.random() < 0.5 ? -0.8 : 0.8;
      for (let i = 0; i < 3; i++) { const r0 = 24 + i * 44; run.hazard({ kind: 'ring', x: e.x, y: e.y, r0, r: r0 + 26, gap: g0 + i * turn, gw: 0.45, delay: 1.0 + i * 0.45, dmg: e.dmg * 1.1 * e.enr, color: '#b0d040', src: e, boss: true, sound: i ? null : 'boom' }); }
    }
    if (e.c3 > 12) { e.c3 = 0; for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4; run.spawnEnemy('bogcorpse', p.x + Math.cos(a) * 90, p.y + Math.sin(a) * 90); } }
  };
  // Blight Worm (secret): spits fans of acid; sinks into the mire (untouchable) and erupts beneath you, a ring of spit around it
  AI.b_blightworm = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    if (e.sub) { e.mx = 0; e.my = 0; e.cspd = 0; e.kx = e.ky = 0; return; }
    e.cspd = e.spd * 0.6; e.mx = dx; e.my = dy;
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt;
    if (e.c1 > 2.4) { e.c1 = 0; const a = Math.atan2(dy, dx); for (const o of [-0.4, -0.2, 0, 0.2, 0.4]) shot(run, e, a + o, 100, 0.45, '#b0d040'); DH.audio.play('fire'); }
    if (e.c2 > 8) {
      e.c2 = 0; e.sub = true; e.eth = 99; run.burst(e.x, e.y, 24, ['#3a4a1a', '#8a6a5a'], 90); DH.audio.play('boom');
      run.hazard({ kind: 'circle', x: p.x, y: p.y, r: 36, delay: 1.5, dmg: e.dmg * 1.3 * e.enr, color: '#b0d040', src: e, boss: true, sound: 'boom',
        onFire: (r, h) => { if (e.dead) return; e.x = h.x; e.y = h.y; e.sub = false; e.eth = 0; r.shake = 7; r.burst(h.x, h.y, 30, ['#3a4a1a', '#b0d040'], 110); for (let i = 0; i < 10; i++) r.enemyShot({ x: h.x, y: h.y }, i / 10 * TAU, 80, e.dmg * 0.45 * e.enr, '#b0d040'); } });
    }
  };
  /* ---------- the Reliquary ---------- */
  // Mimic King: lunges along a marked line; spits a fan of gold; its tongue lashes along a marked line and reels you in;
  // sets mimics about you
  AI.b_mimicking = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    charge(run, e, dt, dx, dy, dist, 250);
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.c1 > 4 && e.phase === 0) { e.c1 = 0; const a = Math.atan2(dy, dx); for (let i = -3; i <= 3; i++) shot(run, e, a + i * 0.16, 100, 0.45, '#ffd35a', 'coin'); DH.audio.play('coin'); }
    if (e.c2 > 6 && e.phase === 0 && dist < 140) {
      e.c2 = 0; const a = Math.atan2(dy, dx), tx = e.x, ty = e.y;
      run.hazard({ kind: 'line', x: e.x, y: e.y, ang: a, len: 150, w: 12, delay: 0.7, dmg: e.dmg * e.enr, color: '#c83050', src: e, boss: true, sound: 'swing', onFire: (r, h) => { const q = r.player; if (r.inHazard(h, q.x, q.y)) { q.x += (tx - q.x) * 0.6; q.y += (ty - q.y) * 0.6; } } });
    }
    if (e.c3 > 12) { e.c3 = 0; for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + Math.random(); run.spawnEnemy('mimic', p.x + Math.cos(a) * 80, p.y + Math.sin(a) * 80); } }
  };
  // Gilded Sentinel: raises its tower shield (all but proof), then thrusts its spear three times along marked lines;
  // its halo flares in a ring of light
  AI.b_sentinel = function (run, e, dt, dx, dy, dist) {
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt;
    if (e.guard > 0) {
      e.guard -= dt; e.cspd = 0; e.mx = e.my = 0;
      if (e.guard <= 0) { const a = Math.atan2(dy, dx); [0, -0.4, 0.4].forEach((o, i) => run.hazard({ kind: 'line', x: e.x, y: e.y, ang: a + o, len: 170, w: 14, delay: 0.6 + i * 0.25, dmg: e.dmg * 1.2 * e.enr, color: '#fff0a0', src: e, boss: true, sound: 'swing' })); }
      return;
    }
    e.cspd = e.spd; e.mx = dx; e.my = dy;
    if (e.c1 > 7) { e.c1 = 0; e.guard = 2; run.burst(e.x, e.y - 10, 14, ['#fff0a0', '#d0a840'], 60); DH.audio.play('block'); }
    if (e.c2 > 5) { e.c2 = 0; for (let i = 0; i < 12; i++) shot(run, e, i / 12 * TAU + Math.random() * 0.3, 85, 0.45, '#fff0a0'); DH.audio.play('zap'); }
  };
  // Hollow Magistrate: passes judgment: a mark follows you, locks, then strikes; brings the gavel down and the verdict rolls
  // out in waves with gaps; summons coin wraiths
  AI.b_magistrate = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    const orbit = dist < 40 ? -1 : 1; e.cspd = e.spd; e.mx = dx * orbit - dy * 0.4; e.my = dy * orbit + dx * 0.4;
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.c1 > 5) { e.c1 = 0; run.hazard({ kind: 'circle', x: p.x, y: p.y, r: 30, delay: 2, follow: 1.3, dmg: e.dmg * 1.4 * e.enr, color: '#ff5040', src: e, boss: true, sound: 'boom' }); run.text(p.x, p.y - 18, t('hud.judged'), '#ff5040', true); }
    if (e.c2 > 8) {
      e.c2 = 0; DH.audio.play('boom'); run.shake = Math.max(run.shake, 3);
      const g0 = Math.atan2(dy, dx) + U.rand(-1, 1), turn = Math.random() < 0.5 ? -0.7 : 0.7;
      for (let i = 0; i < 3; i++) { const r0 = 22 + i * 44; run.hazard({ kind: 'ring', x: e.x, y: e.y, r0, r: r0 + 26, gap: g0 + i * turn, gw: 0.45, delay: 1.0 + i * 0.45, dmg: e.dmg * 1.1 * e.enr, color: '#d8b050', src: e, boss: true }); }
    }
    if (e.c3 > 11) { e.c3 = 0; for (const s of [-1, 1]) run.spawnEnemy('coinwraith', e.x + s * 26, e.y); run.burst(e.x, e.y, 16, ['#d8b050', '#1e1a24'], 70); }
  };
  // Gold Custodian (Lord): gold rains on marked circles round you; its key sweeps a beam across a marked arc; it wards itself
  // and calls vault wardens
  AI.b_custodian = function (run, e, dt, dx, dy, dist) {
    const p = run.player;
    e.sweep = Math.max(0, (e.sweep || 0) - dt); e.cspd = e.sweep > 0 ? 0 : e.spd; e.mx = dx; e.my = dy;
    e.c1 = (e.c1 || 0) + dt; e.c2 = (e.c2 || 0) + dt; e.c3 = (e.c3 || 0) + dt;
    if (e.c1 > 4.5) { e.c1 = 0; for (let i = 0; i < 6; i++) run.hazard({ kind: 'circle', x: p.x + U.rand(-70, 70), y: p.y + U.rand(-70, 70), r: 20, delay: 1.2, dmg: e.dmg * e.enr, color: '#ffd35a', src: e, boss: true, sound: i ? null : 'coin' }); }
    if (e.c2 > 8) {
      e.c2 = 0; e.sweep = 2.4; const a0 = Math.atan2(dy, dx), dir = Math.random() < 0.5 ? -1 : 1;
      for (let i = 0; i < 9; i++) run.after(i * 0.2, () => { if (e.dead) return; run.hazard({ kind: 'line', x: e.x, y: e.y, ang: a0 + dir * (-0.9 + i * 0.225), len: 260, w: 14, delay: 0.7, dmg: e.dmg * 1.1 * e.enr, color: '#40e0ff', src: e, boss: true, sound: i % 3 ? null : 'zap' }); });
    }
    if (e.c3 > 13) { e.c3 = 0; e.ward = 4; for (const s of [-1, 1]) run.spawnEnemy('vaultwarden', e.x + s * 30, e.y - 10); DH.audio.play('frost'); }
  };
  C.BOSS_AI = AI;
})(window.DH);
