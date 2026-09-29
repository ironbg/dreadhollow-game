/* Ability behaviours, summons and projectiles (mixed into DH.Run.prototype). */
(function (DH) {
  'use strict';
  const U = DH.util, C = DH.content;
  const R = DH.Run.prototype;
  const TAU = Math.PI * 2;
  const tmp = [];
  const aimAt = (run, range) => { const p = run.player, e = run.nearest(p.x, p.y, range); return e ? Math.atan2(e.y - p.y, e.x - p.x) : Math.atan2(p.dirY, p.dirX); };
  const angDiff = (a, b) => { let d = a - b; return Math.atan2(Math.sin(d), Math.cos(d)); };
  /** Manual aim for the hero's main weapon (right stick / mouse), else null: abilities always aim themselves. */
  R.manualAimAngle = function () { const v = DH.input.aim(); return v ? Math.atan2(v.y, v.x) : null; };
  R.manualAim = function (a) { if (a && !a.weapon) return null; const v = DH.input.aim(); return v ? Math.atan2(v.y, v.x) : null; };
  /** The nearest foe within `range` whose bearing lies within `half` radians of `ang`. */
  R.nearestInCone = function (x, y, range, ang, half, ex) {
    let best = null, bd = range * range;
    for (const e of this.enemies) { if (e.dead || e.def.prop || (ex && ex.has(e))) continue; const dx = e.x - x, dy = e.y - y, d = dx * dx + dy * dy; if (d < bd && Math.abs(angDiff(Math.atan2(dy, dx), ang)) <= half) { bd = d; best = e; } }
    return best;
  };
  const PLANTS = ['snare', 'biter', 'pod', 'spitter'];
  // Crone's plants: each strikes with its own damage type
  const PLANT_TAGS = { snare: ['physical', 'summon', 'area'], biter: ['physical', 'summon', 'melee'], pod: ['magic', 'summon', 'area'], spitter: ['magic', 'summon', 'projectile'] };
  // Alchemist's brews: the bomb (no puddle) and four elements, enabled by other sources of that element
  const BREW = { bomb: { tags: ['physical', 'area'], col: '#d8c8a0' }, fire: { tags: ['fire', 'area'], eff: 'burn', col: '#ff7a30' }, lightning: { tags: ['lightning', 'area'], eff: 'spark', col: '#fff080' },
    ice: { tags: ['ice', 'area'], eff: 'frost', col: '#80d8ff' }, earth: { tags: ['physical', 'area'], eff: 'decay', col: '#9adf50' }, magic: { tags: ['magic', 'area'], eff: null, col: '#b080ff' } };
  C.BREW = BREW;
  const proj = (run, o) => { o.hit = o.hit || new Set(); o.life = o.life || 1; run.proj.push(o); return o; };

  /** A volley in one direction: along the hand aim (hero weapon) or at the nearest foe; shots fan out by `spread`.
   *  Returns the base angle, or null when there is nothing to shoot at (and `need` is set). */
  const volley = (run, a, range, spread, need, shot) => {
    const p = run.player, man = run.manualAim(a); let base = man;
    if (base == null) { const tg = run.nearest(p.x, p.y, range); if (tg) base = Math.atan2(tg.y - p.y, tg.x - p.x); else if (need) return null; else base = U.rand(0, TAU); }
    const n = a.s.count; for (let i = 0; i < n; i++) shot(base + (i - (n - 1) / 2) * spread, i);
    if (man != null) p.face = Math.cos(man) >= 0 ? 1 : -1;
    return base;
  };
  R.after = function (d, fn) { (this.timers || (this.timers = [])).push({ t: d, fn }); };

  const AB = {
    /* ---------- hero weapons ---------- */
    cleave: { fire(run, a) {
      const p = run.player, s = a.s, R = 36 * s.area, arc = 2.3;
      const man = run.manualAim(a), near = man == null ? run.nearest(p.x, p.y, R * 1.3) : null;
      const base = man != null ? man : near ? Math.atan2(near.y - p.y, near.x - p.x) : Math.atan2(p.dirY, p.dirX);
      if (man != null) p.face = Math.cos(man) >= 0 ? 1 : -1; else if (near) p.face = near.x > p.x ? 1 : -1;
      for (let i = 0; i < s.count; i++) {
        const ang = base + i * TAU / s.count;
        run.fx.push({ k: 'slash', x: p.x, y: p.y, ang, R, arc, life: 0.22, max: 0.22, follow: true, flip: i % 2, color: '#e8f0ff' });
        run.hitCircle(p.x, p.y, R, a, 1, (e) => Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), ang)) <= arc / 2 + 0.2);
      }
      DH.audio.play('swing');
    } },
    longbow: { fire(run, a) {
      // one volley in one direction: along the hand aim, or at the nearest foe; extra arrows fan out beside the first
      const p = run.player, s = a.s;
      const base = volley(run, a, 240, 0.08, true, (ang) => proj(run, { k: 'arrow', a, x: p.x, y: p.y - 2, vx: Math.cos(ang) * s.speed, vy: Math.sin(ang) * s.speed, ang, r: 4, pierce: s.pierce, life: 1.3 }));
      if (base == null) return false;
      p.face = Math.cos(base) >= 0 ? 1 : -1; DH.audio.play('bow');
    } },
    judgment: { fire(run, a) {
      const s = a.s, used = new Set();
      let fired = 0;
      for (let i = 0; i < s.count; i++) {
        const man = run.manualAim(a); let tg = man != null ? run.nearestInCone(run.player.x, run.player.y, 170, man, 0.7, used) : null;
        for (let k = 0; k < 5 && !tg; k++) { const c = run.randomTarget(170); if (c && !used.has(c)) tg = c; }
        if (!tg) { if (!fired) return false; break; }
        used.add(tg); fired++;
        const x = tg.x, y = tg.y, R = 28 * s.area;
        run.fx.push({ k: 'smite', x, y, R, life: 0.45, max: 0.45 }); run.castCircle(x, y, R, '#ffe08a');
        run.after(0.18, () => { run.hitCircle(x, y, R, a); run.shake = Math.max(run.shake, 2); DH.audio.play('boom'); run.burst(x, y, 10, ['#fff6c0', '#ffd35a'], 80); });
      }
    } },
    flamejet: { fire(run, a) {
      const p = run.player, s = a.s, man = run.manualAim(a), tg = man == null ? run.nearest(p.x, p.y, 120) : null;
      if (man == null && !tg) return false;
      const base = man != null ? man : Math.atan2(tg.y - p.y, tg.x - p.x); p.face = Math.cos(base) >= 0 ? 1 : -1;
      const ang = base + U.rand(-0.3, 0.3) * s.area, sp = U.rand(130, 170);
      proj(run, { k: 'flame', a, x: p.x + Math.cos(base) * 8, y: p.y + Math.sin(base) * 8 - 2, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: 4 * s.area, grow: 10 * s.area, pierce: 999, life: 0.55 * (1 + s.duration), max: 0.55 * (1 + s.duration) });
      DH.audio.play('fire');
    } },
    spirits: { fire(run, a) {
      const p = run.player, s = a.s;
      for (let i = 0; i < s.count; i++) {
        const ang = U.rand(0, TAU);
        run.allies.push({ kind: 'spirit', a, x: p.x, y: p.y, vx: Math.cos(ang) * 60, vy: Math.sin(ang) * 60, life: s.duration, t: 0 });
      }
      DH.audio.play('wisp');
    } },
    shieldbash: { fire(run, a) {
      const p = run.player, s = a.s, R = 30 * s.area, arc = 2.4, man = run.manualAim(a), near = man == null ? run.nearest(p.x, p.y, R * 1.4) : null;
      const base = man != null ? man : near ? Math.atan2(near.y - p.y, near.x - p.x) : Math.atan2(p.dirY, p.dirX);
      if (man != null) p.face = Math.cos(man) >= 0 ? 1 : -1; else if (near) p.face = near.x > p.x ? 1 : -1;
      for (let i = 0; i < s.count; i++) {
        const ang = base + i * TAU / s.count;
        run.fx.push({ k: 'bash', x: p.x, y: p.y, ang, R, life: 0.25, max: 0.25, follow: true });
        run.hitCircle(p.x, p.y, R, a, 1, (e) => Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), ang)) <= arc / 2 + 0.2);
      }
      DH.audio.play('swing'); DH.audio.play('block');
    } },
    arcbolt: { fire(run, a) {
      const p = run.player, s = a.s, ex = new Set();
      let fired = 0;
      for (let i = 0; i < s.count; i++) {
        const man = run.manualAim(a), tg = man != null ? run.nearestInCone(p.x, p.y, 220, man, 0.6, ex) : run.nearest(p.x, p.y, 220, ex); if (!tg) break;
        fired++;
        let from = { x: p.x, y: p.y - 4 }, cur = tg; const pts = [[from.x, from.y]];
        for (let c = 0; c <= s.chain && cur; c++) {
          ex.add(cur); pts.push([cur.x, cur.y]); run.hit(cur, a, c ? 0.8 : 1);
          cur = run.nearest(cur.x, cur.y, 80, ex);
        }
        run.fx.push({ k: 'chain', pts, life: 0.2, max: 0.2, seed: Math.random() * 999, color: '#bfe6ff' });
      }
      if (!fired) return false;
      DH.audio.play('zap');
    } },
    wolves: { update(run, a) { run.keepAllies('wolf', a, a.s.count); } },
    frostaxe: { fire(run, a) {
      const p = run.player, s = a.s, man = run.manualAim(a), ang0 = man != null ? man : aimAt(run, 70);
      for (let i = 0; i < s.count; i++) {
        const ang = ang0 + i * Math.PI, x = p.x + Math.cos(ang) * 16, y = p.y + Math.sin(ang) * 16, R = 28 * s.area;
        run.fx.push({ k: 'slam', x, y, R, life: 0.4, max: 0.4, color: '#bfefff' });
        run.hitCircle(x, y, R, a);
      }
      run.shake = Math.max(run.shake, 2); DH.audio.play('frost'); DH.audio.play('swing');
    } },
    arcaneorb: { fire(run, a) {
      const p = run.player, s = a.s, man = run.manualAim(a), base = man != null ? man : aimAt(run, 200);
      for (let i = 0; i < s.count; i++) {
        const ang = base + (i - (s.count - 1) / 2) * 0.5;
        // a slow, grinding sphere: it lingers in the horde and hits everything inside it five times a second
        proj(run, { k: 'orb', a, x: p.x, y: p.y - 3, vx: Math.cos(ang) * s.speed, vy: Math.sin(ang) * s.speed, r: 10 * Math.sqrt(s.area), pierce: 999, life: s.duration, cdHit: 0.2 });
      }
      DH.audio.play('arcane');
    } },
    bloodpulse: { fire(run, a) {
      const p = run.player, s = a.s;
      if (!run.nearest(p.x, p.y, 60 * s.area)) return false;
      const cost = Math.max(1, p.hp * s.hpCost);
      if (p.hp - cost < 1) return false;
      p.hp -= cost;
      for (let i = 0; i < s.count; i++) run.after(i * 0.25, () => {
        const R = 46 * s.area;
        run.fx.push({ k: 'pulse', x: p.x, y: p.y, R, life: 0.35, max: 0.35, follow: true, color: '#ff2040' });
        run.hitCircle(p.x, p.y, R, a);
      });
      DH.audio.play('blood');
    } },
    scythes: { update(run, a, dt) { orbit(run, a, dt, 'scythe', 40, 8, 0.4); } },

    /* ---------- Landsknecht, Alchemist, Crone ---------- */
    arquebus: {
      update(run, a, dt) { // Grenades: every 3s (not sped up by attack speed) a throw of the projectile damage dealt since the last one
        if (!run.hero.grenades) return;
        if (run.gAcc == null) run.gAcc = 0;
        a.gT = (a.gT == null ? 3 : a.gT) - dt;
        if (a.gT > 0) return;
        a.gT = 3;
        const acc = run.gAcc; run.gAcc = 0;
        if (acc <= 0) return; // no projectile damage, no grenade
        const p = run.player, dmg = Math.max(1, 0.04 * acc + 0.3 * Math.pow(acc, 0.8)) * Math.max(0.1, 1 + run.P.grenadePct), n = 1 + run.detStacks(a, run.P.ms);
        for (let i = 0; i < n; i++) {
          const tg = run.randomTarget(140) || run.nearest(p.x, p.y, 200), an = U.rand(0, TAU);
          const tx = tg ? tg.x + U.rand(-6, 6) : p.x + Math.cos(an) * 60, ty = tg ? tg.y + U.rand(-6, 6) : p.y + Math.sin(an) * 50;
          run.after(i * 0.15, () => proj(run, { k: 'grenade', a, x: p.x, y: p.y - 4, sx: p.x, sy: p.y - 4, tx, ty, ft: 0, fd: 0.55, ang: 0, r: 0, pierce: 0, life: 2, gdmg: dmg, R: 35 * (1 + run.P.area) }));
        }
        DH.audio.play('throw');
      },
      fire(run, a) {
        const p = run.player, s = a.s, man = run.manualAim(a);
        let base = man;
        if (base == null) { const tg = run.nearest(p.x, p.y, 260); if (!tg) return false; base = Math.atan2(tg.y - p.y, tg.x - p.x); }
        p.face = Math.cos(base) >= 0 ? 1 : -1;
        const mx = p.x + Math.cos(base) * 14, my = p.y - 3 + Math.sin(base) * 14;
        for (let i = 0; i < s.count; i++) {
          const ang = base + (i - (s.count - 1) / 2) * 0.12 + U.rand(-0.03, 0.03);
          proj(run, { k: 'bullet', a, x: mx, y: my, vx: Math.cos(ang) * s.speed, vy: Math.sin(ang) * s.speed, ang, r: 3, pierce: s.pierce, life: 0.7 });
        }
        run.fx.push({ k: 'muzzle', x: mx, y: my, ang: base, life: 0.14, max: 0.14 });
        for (let i = 0; i < 7; i++) { const sp = U.rand(8, 40); run.parts.push({ x: mx, y: my, vx: Math.cos(base) * sp + U.rand(-10, 10), vy: Math.sin(base) * sp - U.rand(6, 22), life: U.rand(0.5, 1.1), max: 1.1, c: U.pick(['#8a8a90', '#6a6a72', '#b4b4bc']), s: U.pick([1, 2]) }); }
        run.shake = Math.max(run.shake, 1.2); DH.audio.play('gun');
      },
    },
    concoction: { fire(run, a) {
      const p = run.player, s = a.s, els = run.brewElements(), man = run.manualAim(a);
      for (let i = 0; i < s.count; i++) {
        a.spin = (a.spin || 0) + 2.4; // the throws walk around the Alchemist
        const ang = man != null ? man + U.rand(-0.35, 0.35) : a.spin, d = U.rand(44, 70) * Math.sqrt(s.area);
        const tg = run.nearestInCone(p.x, p.y, 115, ang, 1.3) || (man == null ? run.randomTarget(100) : null); // it lands on a foe in the sector it swings through
        a.elI = (a.elI || 0) + 1;
        const el = els.length ? els[a.elI % els.length] : null;
        proj(run, { k: 'brewflask', a, el, x: p.x, y: p.y - 4, sx: p.x, sy: p.y - 4, tx: tg ? tg.x + U.rand(-5, 5) : p.x + Math.cos(ang) * d, ty: tg ? tg.y + U.rand(-4, 4) : p.y + Math.sin(ang) * d * 0.8, ft: 0, fd: 0.42, ang: 0, r: 0, pierce: 0, life: 2 });
      }
      if (man != null) p.face = Math.cos(man) >= 0 ? 1 : -1;
      DH.audio.play('flask');
    } },
    bogplants: { update(run, a, dt) {
      const p = run.player, s = a.s, mine = [];
      for (const al of run.allies) if (al.kind === 'plant' && al.a === a) mine.push(al);
      a.nPlants = mine.length;
      if (run.hero.blessing) run.plantSlow = Math.max(0.72, 1 - 0.035 * mine.length); // Crone's Curse
      a.moved = (a.moved || 0) + (p.moving ? run.P.speed * dt : 0);
      a.t -= dt;
      const walk = a.moved >= 60;
      if (a.t > 0 && !walk) return;
      if (mine.length >= s.count) {
        if (!walk) { a.t = 0.25; return; }
        let old = mine[0]; for (const al of mine) if (al.life < old.life) old = al; // walking on: the oldest plant withers and a new one sprouts
        old.life = Math.min(old.life, 0.3); old.wither = true;
      }
      a.t = s.cd; a.moved = 0;
      const tg = run.nearest(p.x, p.y, 90); let x, y;
      if (tg) { const k = U.rand(0.45, 0.75); x = p.x + (tg.x - p.x) * k + U.rand(-8, 8); y = p.y + (tg.y - p.y) * k + U.rand(-6, 6); }
      else { const an = U.rand(0, TAU), d = U.rand(18, 34); x = p.x + Math.cos(an) * d; y = p.y + Math.sin(an) * d * 0.8; }
      a.pi = ((a.pi == null ? -1 : a.pi) + 1) % PLANTS.length;
      run.allies.push({ kind: 'plant', type: PLANTS[a.pi], a, x, y, t: 0, life: s.duration, max: s.duration, face: tg && tg.x < x ? -1 : 1, cd: U.rand(0.1, 0.4) });
      for (let i = 0; i < 6; i++) run.parts.push({ x: x + U.rand(-5, 5), y: y + U.rand(-2, 2), vx: U.rand(-15, 15), vy: U.rand(-30, -10), life: 0.5, max: 0.5, c: U.pick(['#4a3a22', '#6a8a30', '#2a3a18']), s: 1 });
    } },

    /* ---------- tome abilities ---------- */
    hexlance: { fire(run, a) {
      const p = run.player, s = a.s, shot = (ang) => proj(run, { k: 'hex', a, x: p.x, y: p.y - 3, vx: Math.cos(ang) * s.speed, vy: Math.sin(ang) * s.speed, ang, r: 4, pierce: 999, life: 1.2, fork: s.fork });
      const base = volley(run, a, 230, 0.12, false, shot);
      if (s.backshot) for (let i = 0; i < s.count; i++) shot(base + Math.PI + (i - (s.count - 1) / 2) * 0.12); // Crippling Cuts: behind you too
      DH.audio.play('hex');
    } },
    chakrams: { fire(run, a) {
      const p = run.player, s = a.s;
      const blade = (ang, o) => proj(run, Object.assign({ k: 'chakram', a, x: p.x, y: p.y, vx: Math.cos(ang) * s.speed, vy: Math.sin(ang) * s.speed, ang, r: 6 * Math.sqrt(s.area), pierce: 999, life: s.duration * 2 + 2, out: s.duration, cdHit: 0.3, orbit: s.orbit ? { a: ang, rad: 8, t: s.duration } : null }, o));
      const base = volley(run, a, 200, 0.3, false, (ang) => blade(ang));
      if (s.crippling) for (const o of [-0.55, 0.55]) blade(base + o, { cripple: true }); // Crippling Blades
      if (s.piercingblades) for (const o of [-0.9, 0.9]) blade(base + o, { a: run.subAb(a, 'pblade', ['magic', 'projectile'], 'fragile', 0.5), magicBlade: true }); // Piercing Blades
      DH.audio.play('blade');
    } },
    orbs: { update(run, a, dt) { orbit(run, a, dt, 'orb', 30, 6, 0.5); } },
    darts: { fire(run, a) {
      const p = run.player, s = a.s;
      if (volley(run, a, 230, 0.08, true, (ang) => proj(run, { k: 'dart', a, x: p.x, y: p.y - 2, vx: Math.cos(ang) * s.speed, vy: Math.sin(ang) * s.speed, ang, r: 3, pierce: s.pierce, life: 0.8 })) == null) return false;
      DH.audio.play('dart');
    } },
    wyrmfire: { fire(run, a) {
      const p = run.player, s = a.s, tg = run.nearest(p.x, p.y, 150);
      if (!tg) return false;
      const base = Math.atan2(tg.y - p.y, tg.x - p.x);
      const stream = s.stream > 0;
      const n = stream ? 1 : s.count;
      for (let i = 0; i < n; i++) {
        const ang = base + (stream ? U.rand(-0.08, 0.08) : (i - (n - 1) / 2) * 0.24);
        proj(run, { k: 'wave', a, x: p.x, y: p.y - 2, vx: Math.cos(ang) * s.speed, vy: Math.sin(ang) * s.speed, ang, r: 4, grow: 9 * s.area, pierce: 999, life: s.duration, max: s.duration, mult: stream ? 0.5 : 1 });
      }
      if (stream) a.cdNext = a.s.cd * 0.18;
      DH.audio.play('fire');
    } },
    stormsphere: { fire(run, a) {
      const p = run.player, s = a.s;
      volley(run, a, 160, 0.35, false, (ang) => proj(run, { k: 'sphere', a, x: p.x, y: p.y - 3, vx: Math.cos(ang) * s.speed, vy: Math.sin(ang) * s.speed, r: 5, pierce: 999, life: s.duration * (s.discharge ? 0.6 : 1), pulse: 0, cdHit: 99, volt: 0 }));
      DH.audio.play('zap');
    } },
    halo: { update(run, a, dt) {
      const p = run.player, s = a.s; a.R = 42 * s.area; a.ang += dt; a.pulse = Math.max(0, (a.pulse || 0) - dt * 3);
      a.t -= dt;
      if (a.t <= 0) {
        a.t = s.cd; a.pulse = 1;
        if (!s.punitive && !s.sacredflame && !s.echolight) { run.hitCircle(p.x, p.y, a.R, a); return; }
        run.grid.query(p.x, p.y, a.R + 20, tmp);
        const list = tmp.filter((e) => !e.dead && U.dist2(e.x, e.y, p.x, p.y) < (a.R + e.r) * (a.R + e.r));
        const m = list.length ? Math.max(1 / list.length, 0.12) : 1; // the light is shared among all it reaches
        for (const e of list) {
          const d = run.hit(e, a, m);
          if (s.punitive) { e.st.fragile++; e.st.affl++; } // Punitive Light
          if (s.echolight && d > 0 && Math.random() < 0.3) { const o = run.nearest(e.x, e.y, 30, new Set(list)); if (o) { run.rawDamage(o, d, '#ffe08a', a.id); run.fx.push({ k: 'chain', pts: [[e.x, e.y], [o.x, o.y]], life: 0.2, max: 0.2, seed: Math.random() * 999, color: '#ffe8a0' }); } } // Echoing Light
        }
        if (s.sacredflame && list.length) { const n = Math.round(2 * (1 + s.burn)), eb = (s.dmg + run.P.addBase) * 0.5; for (let i = 0; i < n; i++) run.addBurn(U.pick(list), 1, eb); } // Sacred Flame
      }
    } },
    rifts: {
      fire(run, a) {
        const p = run.player, s = a.s, mine = run.zones.filter((z) => z.kind === 'rift' && z.a === a).length;
        if (mine >= s.count * 3) return false;
        const ang = U.rand(0, TAU), d = U.rand(40, 110);
        run.zones.push({ kind: 'rift', a, x: p.x + Math.cos(ang) * d, y: p.y + Math.sin(ang) * d, r: 10, life: s.duration, max: s.duration });
        run.castCircle(p.x + Math.cos(ang) * d, p.y + Math.sin(ang) * d, 16, '#c070ff');
      },
    },
    skyfall: { fire(run, a) {
      const p = run.player, s = a.s;
      for (let i = 0; i < 3 * s.count; i++) { // three meteors a cast, three more for every Amount past the first
        const tg = run.randomTarget(220); const x = tg ? tg.x + U.rand(-8, 8) : p.x + U.rand(-120, 120), y = tg ? tg.y + U.rand(-8, 8) : p.y + U.rand(-90, 90), R = 30 * s.area;
        run.fx.push({ k: 'meteor', x, y, R, life: 0.7, max: 0.7 }); run.castCircle(x, y, R, '#ff7a30');
        run.after(0.7, () => {
          run.hitCircle(x, y, R, a); run.fx.push({ k: 'explosion', x, y, R, life: 0.4, max: 0.4 }); run.burst(x, y, 14, ['#ff6a1a', '#ffd35a', '#7c1624'], 100); run.shake = Math.max(run.shake, 2.5); DH.audio.play('boom');
          if (s.craters) run.puddle(a, 'fire', x, y, R * 0.8, 2.5, 0.1, false, 0); // Burning Craters
          if (s.earthimpact) run.puddle(a, 'earth', x, y, R * 0.8, 2.5, 0.08); // Earthen Impact
          if (s.scatter) for (let j = 0; j < 2; j++) { // Scattered Debris: two smaller rocks thrown off
            const an = U.rand(0, TAU), sx = x + Math.cos(an) * R * 1.3, sy = y + Math.sin(an) * R * 1.3, sr = R * 0.6;
            run.after(0.25, () => { run.hitCircle(sx, sy, sr, a, 0.5); run.fx.push({ k: 'explosion', x: sx, y: sy, R: sr, life: 0.3, max: 0.3 }); });
          }
        });
      }
    } },
    golem: { update(run, a) { run.keepAllies('golem', a, a.s.count); } },
    phantom: { update(run, a) { run.keepAllies('phantom', a, a.s.count); a.pos = a.s.spiritorbs ? [] : null; } }, // lasting warriors, one per Amount (their orbs are listed afresh each frame)
    avalanche: { fire(run, a) {
      // four waves of ice spikes run out along the diagonals; every Amount past the first adds four more between them
      const p = run.player, s = a.s, n = 4 * s.count, hit = new Set(), x0 = p.x, y0 = p.y;
      for (let i = 0; i < n; i++) {
        const ang = Math.PI / 4 + i * TAU / n;
        const R = 13 * Math.sqrt(s.area), step = 15 * Math.sqrt(s.area);
        const spike = (x, y, t, patch) => run.after(t, () => {
          run.fx.push({ k: 'spike', x, y, R, life: 0.5, max: 0.5 }); run.hitCircle(x, y, R, a, 1, (e) => !hit.has(e) && hit.add(e)); // each foe once a cast
          if (patch) run.puddle(a, 'ice', x, y, R, 2.5, 0.15, true); // Quick Freeze: a patch of ice that slows
        });
        for (let k = 0; k < 7; k++) spike(x0 + Math.cos(ang) * (16 + k * step), y0 + Math.sin(ang) * (16 + k * step), k * 0.06, s.icetrail && k % 2 === 1);
        if (s.debris) for (const o of [-0.6, 0.6]) { // Debris: the wave breaks in two near its end
          const bx = x0 + Math.cos(ang) * (16 + 4 * step), by = y0 + Math.sin(ang) * (16 + 4 * step);
          for (let k = 1; k <= 3; k++) spike(bx + Math.cos(ang + o) * k * step, by + Math.sin(ang + o) * k * step, (4 + k) * 0.06, false);
        }
      }
      DH.audio.play('frost');
    } },
    hail: { fire(run, a) {
      // Hailstorm gathers hailstones while the hero keeps moving and drops them all, heavier, once they stop
      const p = run.player, s = a.s; a.store = a.store || 0;
      if (p.moving && s.hailspikes) { const R = 16 * Math.sqrt(s.area); run.fx.push({ k: 'spike', x: p.x, y: p.y + 2, R, life: 0.45, max: 0.45 }); run.hitCircle(p.x, p.y, R, a, 0.6); } // Hailstorm Spikes
      if (p.moving && a.store < s.count * 5) { a.store += s.count; return; }
      const heavy = a.store > 0, n = Math.max(s.count, a.store), k = heavy ? 1.3 : 1; a.store = 0;
      for (let i = 0; i < n; i++) {
        const tg = run.randomTarget(170); const x = tg ? tg.x + U.rand(-6, 6) : p.x + U.rand(-100, 100), y = tg ? tg.y + U.rand(-6, 6) : p.y + U.rand(-80, 80), R = 12 * s.area * (heavy ? 1.2 : 1);
        run.after(i * 0.04, () => run.fx.push({ k: 'hail', x, y, R, life: 0.35, max: 0.35 }));
        run.after(0.3 + i * 0.04, () => {
          run.hitCircle(x, y, R, a, k); run.burst(x, y, 5, s.frozenfire ? ['#ffd35a', '#ff7a30'] : ['#e8f8ff', '#9fd8ff'], 50);
          if (s.vortex && heavy) { // Hailstorm Vortex: foes round the impact are dragged into it and slowed
            const VR = R * 3; run.grid.query(x, y, VR, tmp);
            for (const e of tmp) if (!e.dead && !e.boss) { const dx = x - e.x, dy = y - e.y, d = Math.hypot(dx, dy) || 1; if (d < VR) { e.kx += dx / d * 140 / Math.sqrt(e.mass); e.ky += dy / d * 140 / Math.sqrt(e.mass); run.addSlow(e, 3); } }
            run.fx.push({ k: 'ring', x, y, life: 0.4, max: 0.4, r0: VR, r1: 4, color: '#a8e8ff' });
          }
        });
      }
      DH.audio.play('glass');
    } },
    // a heavy ball on a chain swung in a slow figure-eight through the hero: the chain pays out to full reach and draws back in,
    // while the whole eight turns slowly so every side is swept in time; more balls swing crossed eights
    flail: { update(run, a, dt) {
      const p = run.player, s = a.s, n = s.count + (s.butterfly ? 1 : 0), reach = 56 * (0.55 + 0.45 * s.area), wide = reach * 0.62; // Butterfly Swing: one more ball
      a.ph = (a.ph || 0) + s.speed * 0.55 * dt; // along the eight: about 5 s a figure at base speed
      a.rot = (a.rot == null ? Math.random() * TAU : a.rot) + s.speed * 0.13 * dt; // the eight itself turns
      a.pos = a.pos || []; a.pos.length = n;
      for (let i = 0; i < n; i++) {
        const t = a.ph + i * TAU / n, ax = a.rot + i * Math.PI / n, u = Math.cos(t) * reach, v = Math.sin(2 * t) * wide / 2;
        const bx = p.x + u * Math.cos(ax) - v * Math.sin(ax), by = p.y + u * Math.sin(ax) + v * Math.cos(ax);
        const prev = a.pos[i], trail = prev ? prev.trail : [];
        trail.push(bx, by); if (trail.length > 12) trail.splice(0, 2);
        a.pos[i] = { x: bx, y: by, a: Math.atan2(by - (prev ? prev.y : by), bx - (prev ? prev.x : bx)), kind: 'flail', trail, spin: (prev ? prev.spin : 0) + dt * 5 };
        const hits = run.hitCircle(bx, by, 11 * Math.sqrt(s.area), a, 1, (e) => run.canHit(e, a.id, 0.5));
        if (s.spikedchain) for (const f of [0.3, 0.55, 0.8]) { // Spiked Chain: the links wound and slow
          const cx = p.x + (bx - p.x) * f, cy = p.y + (by - p.y) * f;
          run.hitCircle(cx, cy, 6, a, 0.4, (e) => run.canHit(e, 'fch' + i, 0.5) && (run.addSlow(e, 2), true));
        }
        if (s.unleashed && hits && (a.uT = (a.uT || 0)) <= run.time && Math.random() < 0.6) { // Unleashed Stars: a loose star flung off, bouncing between foes
          a.uT = run.time + 0.4; const tg = run.nearest(bx, by, 90);
          if (tg) { const an = Math.atan2(tg.y - by, tg.x - bx); proj(run, { k: 'star', a, x: bx, y: by, vx: Math.cos(an) * 220, vy: Math.sin(an) * 220, ang: an, r: 5, pierce: 3, bounce: 3, life: 1.6, mult: 0.6 }); }
        }
      }
    } },
    fists: { fire(run, a) {
      const p = run.player;
      if (volley(run, a, 80, 0.15, true, (ang) => proj(run, { k: 'fist', a, x: p.x + Math.cos(ang) * 6, y: p.y + Math.sin(ang) * 6, vx: Math.cos(ang) * 280, vy: Math.sin(ang) * 280, ang, r: 5, pierce: 0, life: 0.35 })) == null) return false;
      const s = a.s;
      if (s.groundpound) run.after(0.25, () => { const R = 32 * Math.sqrt(s.area); run.hitCircle(p.x, p.y, R, a, 0.3); run.fx.push({ k: 'slam', x: p.x, y: p.y + 3, R, life: 0.35, max: 0.35, color: '#c8a8ff' }); }); // Ground Pound
      if (s.clutch) { const tg = run.strongest(120); if (tg) { const R = 14 * s.area; run.hitCircle(tg.x, tg.y, R, a, 0.7); run.grid.query(tg.x, tg.y, R, tmp); for (const e of tmp) if (!e.dead && !e.boss && U.dist2(e.x, e.y, tg.x, tg.y) < R * R) run.addSlow(e, 4); run.fx.push({ k: 'pop', x: tg.x, y: tg.y, R, life: 0.3, max: 0.3, color: '#b070ff' }); } } // Spectral Clutch
      DH.audio.play('punch');
    } },
    storm: { fire(run, a) {
      const s = a.s, used = new Set(), targets = []; let n = 0;
      if (s.concentrated) { // the strongest foe in reach, then those closest to it
        const top = run.strongest(200);
        if (top) { targets.push(top); const ex = new Set([top]); while (targets.length < s.count) { const nx = run.nearest(top.x, top.y, 90, ex); if (!nx) break; ex.add(nx); targets.push(nx); } }
      } else for (let i = 0; i < s.count; i++) {
        let tg = null; for (let k = 0; k < 6 && !tg; k++) { const c = run.randomTarget(200); if (c && !used.has(c)) tg = c; }
        if (!tg) break; used.add(tg); targets.push(tg);
      }
      for (const tg of targets) {
        n++;
        run.fx.push({ k: 'bolt', x: tg.x, y: tg.y, life: 0.28, max: 0.28, seed: Math.random() * 1000 });
        const c0 = run.crits || 0, R = 14 * s.area;
        run.hitCircle(tg.x, tg.y, R, a, s.concentrated ? Math.min(3, 1 + 0.05 * run.stackCount(tg)) : 1);
        if (s.electrify) { run.grid.query(tg.x, tg.y, R * 1.8, tmp); for (const e of tmp) if (!e.dead && e.stun > 0 && Math.random() < 0.4) run.addSpark(e, 2, s.dmg + run.P.addBase); }
        if (s.explosive && (run.crits || 0) > c0) { // a critical strike bursts into fire
          const sub = run.subAb(a, 'explosive', ['fire', 'area'], 'burn', 0.5), ER = 26 * s.area;
          run.hitCircle(tg.x, tg.y, ER, sub, 0.3); run.fx.push({ k: 'explosion', x: tg.x, y: tg.y, R: ER, life: 0.35, max: 0.35 }); DH.audio.play('boom');
        }
        let cur = tg; const ex = new Set([tg]); const pts = [[tg.x, tg.y]];
        for (let c = 0; c < s.chain; c++) { cur = run.nearest(cur.x, cur.y, 70, ex); if (!cur) break; ex.add(cur); pts.push([cur.x, cur.y]); run.hit(cur, a, 0.7); }
        if (pts.length > 1) run.fx.push({ k: 'chain', pts, life: 0.2, max: 0.2, seed: Math.random() * 999, color: '#fff6a0' });
        run.burst(tg.x, tg.y, 6, ['#fff0a0', '#ffffff', '#6ad8f0'], 70);
      }
      if (!n) return false;
      DH.audio.play('storm');
    } },
    axes: { fire(run, a) {
      const p = run.player, s = a.s;
      for (let i = 0; i < s.count; i++) {
        const side = (i % 2 ? -1 : 1) * p.face;
        proj(run, { k: 'axe', a, x: p.x, y: p.y, vx: side * U.rand(30, 90) + p.dirX * 20, vy: -U.rand(210, 250), g: 420, ang: 0, spin: side * 14, r: 7 * s.area, pierce: 999, life: 1.6, max: 1.6 });
      }
      DH.audio.play('axe');
    } },
    nova: { fire(run, a) {
      // the reach grows with the square root of Area and stops at 1.6x: bonuses widen it, never to the whole screen
      const p = run.player, s = a.s, R = 64 * Math.min(1.6, Math.sqrt(s.area));
      run.castCircle(p.x, p.y, R * 0.55, '#a8e8ff');
      for (let i = 0; i < s.count; i++) run.after(i * 0.3, () => run.fx.push({ k: 'nova', x: p.x, y: p.y, life: 0.4, max: 0.4, R, hit: new Set(), a, update: novaUpdate }));
      if (s.aftershock) run.after(0.5 + s.count * 0.3, () => run.fx.push({ k: 'nova', x: p.x, y: p.y, life: 0.4, max: 0.4, R: R * 0.8, hit: new Set(), a, mult: 0.5, update: novaUpdate })); // Aftershock
      if (s.iceshards) for (let i = 0; i < 8; i++) { const an = i / 8 * TAU; proj(run, { k: 'shard', ice: true, a, x: p.x, y: p.y - 3, vx: Math.cos(an) * 190, vy: Math.sin(an) * 190, ang: an, r: 3.4, pierce: 2, life: 0.9, max: 0.9, drag: 1.5, mult: 0.7 }); } // Ice Shards
      DH.audio.play('frost');
    } },
    plague: { fire(run, a) {
      const p = run.player, s = a.s;
      for (let i = 0; i < s.count; i++) {
        const tg = run.randomTarget(140); const tx = tg ? tg.x : p.x + U.rand(-80, 80), ty = tg ? tg.y : p.y + U.rand(-80, 80);
        proj(run, { k: 'flask', a, x: p.x, y: p.y, sx: p.x, sy: p.y, tx, ty, ft: 0, fd: 0.5, ang: 0, r: 0, pierce: 0, life: 1 });
      }
      DH.audio.play('plague');
    } },
    /* ---------- Skald songs (on the beat) ---------- */
    chord: { fire(run, a) {
      const p = run.player, s = a.s, R = 58 * s.area, arc = 1.5, near = run.nearest(p.x, p.y, R * 1.2);
      if (!near) return false;
      const base = Math.atan2(near.y - p.y, near.x - p.x); p.face = near.x > p.x ? 1 : -1;
      for (let i = 0; i < s.count; i++) {
        const ang = base + i * TAU / s.count;
        for (let k = 0; k < 3; k++) run.fx.push({ k: 'slash', x: p.x, y: p.y, ang, R: R * (0.5 + k * 0.25), arc, life: 0.3, max: 0.3, follow: true, color: k === 1 ? '#ffe08a' : '#ffb050' });
        run.hitCircle(p.x, p.y, R, a, 1, (e) => Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), ang)) <= arc / 2 + 0.15);
      }
    } },
    wardrum: { fire(run, a) {
      const p = run.player, s = a.s, n = s.count * (s.doublekick ? 2 : 1), col = s.firebass ? '#ff7a30' : '#ffb050'; // Kick Bass Amount: two beats at once
      for (let i = 0; i < n; i++) run.after(Math.floor(i / (s.doublekick ? 2 : 1)) * 0.2 + (i % 2 && s.doublekick ? 0.07 : 0), () => {
        const R = 72 * s.area;
        run.castCircle(p.x, p.y, R * 0.5, col);
        run.fx.push({ k: 'pulse', x: p.x, y: p.y, R, life: 0.45, max: 0.45, follow: true, color: col });
        run.hitCircle(p.x, p.y, R, a, s.doublekick && i % 2 ? 0.6 : 1); run.shake = Math.max(run.shake, 3);
        if (s.innercircle) { const IR = R * 0.45; run.grid.query(p.x, p.y, IR, tmp); for (const e of tmp) if (!e.dead && !e.boss && U.dist2(e.x, e.y, p.x, p.y) < IR * IR) e.stun = Math.max(e.stun || 0, 0.8); run.fx.push({ k: 'pulse', x: p.x, y: p.y, R: IR, life: 0.3, max: 0.3, follow: true, color: '#fff0c0' }); } // Inner Circle: stuns
      });
    } },
    deathwall: { fire(run, a) {
      // a rank of spectral warriors charges through the horde from behind the hero
      const p = run.player, s = a.s, ang = aimAt(run, 220), nx = -Math.sin(ang), ny = Math.cos(ang);
      const n = Math.max(1, s.count), sx = p.x - Math.cos(ang) * 70, sy = p.y - Math.sin(ang) * 70;
      for (let i = 0; i < n; i++) {
        const o = (i - (n - 1) / 2) * 16 * s.area;
        proj(run, { k: 'wall', a, x: sx + nx * o, y: sy + ny * o, vx: Math.cos(ang) * s.speed, vy: Math.sin(ang) * s.speed, ang, r: 8 * Math.sqrt(s.area), pierce: 999, life: 1.6, cripple: s.slowing, trailT: 0 });
        if (s.crashing) { // Crashing Waves: a second rank charges from the far side; where they meet, they crash
          const fx0 = p.x + Math.cos(ang) * 70, fy0 = p.y + Math.sin(ang) * 70;
          proj(run, { k: 'wall', a, x: fx0 + nx * o, y: fy0 + ny * o, vx: -Math.cos(ang) * s.speed, vy: -Math.sin(ang) * s.speed, ang: ang + Math.PI, r: 8 * Math.sqrt(s.area), pierce: 999, life: 1.6, cripple: s.slowing, trailT: 0, mult: 0.35 });
        }
      }
      if (s.crashing) run.after(70 / s.speed, () => { const R = 24 * Math.sqrt(s.area); run.hitCircle(p.x, p.y, R, a, 0.6); run.fx.push({ k: 'slam', x: p.x, y: p.y + 3, R, life: 0.4, max: 0.4, color: '#b8a8ff' }); run.shake = Math.max(run.shake, 3); DH.audio.play('boom'); });
      DH.audio.play('deathwall');
    } },
    moshpit: { fire(run, a) {
      const p = run.player, s = a.s;
      for (let i = 0; i < s.count * (s.doubling ? 2 : 1); i++) { // Moshpit Doubling
        const tg = run.randomTarget(150); const x = tg ? tg.x : p.x + U.rand(-60, 60), y = tg ? tg.y : p.y + U.rand(-50, 50);
        run.zones.push({ kind: 'mosh', a, x, y, r: 40 * s.area, life: s.duration * 60 / DH.audio.BATTLE_BPM * 1.05, max: s.duration * 60 / DH.audio.BATTLE_BPM, beat: -1 });
      }
    } },
    smite: { fire(run, a) {
      // damage and crit build up while the strike waits for a target (up to 3x after ~6s)
      const p = run.player, s = a.s, tg = run.nearest(p.x, p.y, 70);
      a.wait = (a.wait || 0);
      if (!tg) { a.wait += 0.2; return false; }
      const charge = Math.min(3, 1 + a.wait * 0.35), bonusCrit = Math.min(0.5, a.wait * 0.08);
      a.wait = 0;
      const ex = new Set(), ice = !!s.froststrike, eb = s.dmg + run.P.addBase;
      for (let i = 0; i < s.count; i++) {
        const e = i ? run.nearest(p.x, p.y, 70, ex) : tg; if (!e) break; ex.add(e);
        const ang = Math.atan2(e.y - p.y, e.x - p.x); p.face = e.x > p.x ? 1 : -1;
        const lit = ice ? e.st.frost : e.st.burn; // Scattered Sparks: a foe already alight (frozen, as Frost Strike) blows apart
        s.crit += bonusCrit; run.hit(e, a, charge, Math.cos(ang), Math.sin(ang)); s.crit -= bonusCrit;
        if (ice) run.fx.push({ k: 'frostburst', x: e.x, y: e.y, R: 16 * s.area * Math.sqrt(charge), life: 0.35, max: 0.35 });
        else run.fx.push({ k: 'explosion', x: e.x, y: e.y, R: 16 * s.area * Math.sqrt(charge), life: 0.3, max: 0.3 });
        run.burst(e.x, e.y, 10 + charge * 4, ice ? ['#80d8ff', '#e8f8ff', '#ffffff'] : ['#ff6a1a', '#ffd35a', '#fff0a0'], 90);
        if (s.sparks && lit > 0) {
          const SR = 24 * s.area; run.hitCircle(e.x, e.y, SR, a, 0.4 + 0.05 * Math.min(20, lit), (o) => o !== e);
          run.fx.push({ k: ice ? 'frostburst' : 'explosion', x: e.x, y: e.y, R: SR, life: 0.35, max: 0.35 });
        }
      }
      if (s.emberfall) { // a wave of flame (of frost) sweeps out: every foe it reaches is set alight, no direct damage
        const R = 50 * Math.sqrt(s.area); run.grid.query(p.x, p.y, R, tmp);
        for (const e of tmp) if (!e.dead && U.dist2(e.x, e.y, p.x, p.y) < R * R) { if (ice) run.addFrost(e, 1, eb * 0.3); else run.addBurn(e, 1, eb * 0.3); } // one light stack each
        run.fx.push({ k: 'ring', x: p.x, y: p.y, life: 0.45, max: 0.45, r0: 8, r1: R, color: ice ? '#a8e8ff' : '#ff9a3a' });
      }
      run.shake = Math.max(run.shake, 1 + charge); DH.audio.play(ice ? 'frost' : 'fire'); DH.audio.play('boom');
    } },
    thorns: { fire(run, a) {
      const p = run.player, s = a.s;
      for (let i = 0; i < s.count; i++) {
        const tg = run.randomTarget(120); const x = tg ? tg.x : p.x + U.rand(-70, 70), y = tg ? tg.y : p.y + U.rand(-60, 60);
        run.zones.push({ kind: 'thorns', a, x, y, r: 22 * s.area, r0: 22 * s.area, life: s.duration, max: s.duration, tick: 0, seed: Math.random() * 99 });
      }
      DH.audio.play('thorns');
    } },
    illumination: { fire(run, a) {
      const p = run.player, s = a.s, waves = s.count + (s.embrace ? 1 : 0) + (s.shielding ? 1 : 0); // Shining Embrace, Shielding Light: one more wave each
      for (let i = 0; i < waves; i++) run.after(i * 0.35, () => {
        const R = 52 * s.area;
        run.castCircle(p.x, p.y, R * 0.6, '#fff0a0');
        run.fx.push({ k: 'pulse', x: p.x, y: p.y, R, life: 0.4, max: 0.4, follow: true, color: '#fff0a0' });
        const d0 = run.dmgByAb[a.id] || 0;
        run.hitCircle(p.x, p.y, R, a);
        if (s.embrace) run.heal(Math.min(((run.dmgByAb[a.id] || 0) - d0) * 0.05, run.P.maxHp * 0.02)); // its damage flows back as health
        if (s.purge) { const r2 = R * R; run.eproj = run.eproj.filter((b) => U.dist2(b.x, b.y, p.x, p.y) > r2); } // Luminous: burns away enemy projectiles
      });
      DH.audio.play('heal');
    } },
    prism: { fire(run, a) {
      const p = run.player, s = a.s, ex = new Set(); let fired = 0;
      const EL = [['#ff7a30', { burn: 1 }], ['#80d8ff', { frost: 1 }], ['#fff080', { spark: 1 }]];
      for (let i = 0; i < s.count; i++) {
        let cur = run.nearest(p.x, p.y, 200, ex); if (!cur) break; fired++;
        const pts = [[p.x, p.y - 4]];
        for (let c = 0; c <= s.chain && cur; c++) {
          ex.add(cur); pts.push([cur.x, cur.y]);
          // cycle the element on every bounce: only that element's effect can apply
          const el = EL[c % 3][1], keep = { burn: s.burn, frost: s.frost, spark: s.spark };
          for (const k in keep) s[k] = el[k] ? keep[k] * 1.6 : 0;
          run.hit(cur, a, 1 + c * 0.08);
          Object.assign(s, keep);
          const hx = cur.x, hy = cur.y;
          if (s.prismfire && c % 3 === 0) { const R = 18 * s.area; run.hitCircle(hx, hy, R, run.subAb(a, 'pfire', ['fire', 'area'], 'burn', 0.4), 0.5, (e) => e !== cur); run.fx.push({ k: 'explosion', x: hx, y: hy, R, life: 0.3, max: 0.3 }); } // a fire bounce explodes
          if (s.prismice && c % 3 === 1) { const R = 40 * s.area; run.grid.query(hx, hy, R, tmp); for (const e of tmp) if (!e.dead && !e.boss && e !== cur) { const dx = hx - e.x, dy = hy - e.y, d = Math.hypot(dx, dy) || 1; if (d < R) { e.kx += dx / d * 120 / Math.sqrt(e.mass); e.ky += dy / d * 120 / Math.sqrt(e.mass); run.addSlow(e, 3); } } run.fx.push({ k: 'ring', x: hx, y: hy, life: 0.35, max: 0.35, r0: R, r1: 4, color: '#80d8ff' }); } // an ice bounce drags foes in
          if (s.prismbolt && c % 3 === 2) { const ex2 = new Set([cur]); for (let q = 0; q < 2; q++) { const o = run.nearest(hx, hy, 60, ex2); if (!o) break; ex2.add(o); run.hit(o, run.subAb(a, 'pbolt', ['lightning', 'projectile'], 'spark', 0.4), 0.5); run.fx.push({ k: 'chain', pts: [[hx, hy], [o.x, o.y]], life: 0.2, max: 0.2, seed: Math.random() * 999, color: '#fff080' }); } } // a lightning bounce strikes two more
          cur = run.nearest(cur.x, cur.y, 90, ex);
        }
        for (let k = 1; k < pts.length; k++) run.fx.push({ k: 'chain', pts: [pts[k - 1], pts[k]], life: 0.25, max: 0.25, seed: Math.random() * 999, color: EL[(k - 1) % 3][0] });
      }
      if (!fired) return false;
      DH.audio.play('prism');
    } },
    shards: { fire(run, a) {
      // two fans, one thrown up and one down, 75 degrees wide (wider with Area)
      const p = run.player, s = a.s, n = s.shivers ? Math.max(2, s.count - 2) : s.count, half = 0.65 * Math.min(1.6, Math.sqrt(s.area));
      for (const dir of [-Math.PI / 2, Math.PI / 2]) for (let i = 0; i < n; i++) {
        const ang = dir + (n > 1 ? (i / (n - 1) - 0.5) * 2 * half : 0) + U.rand(-0.06, 0.06), sp = s.speed * U.rand(0.8, 1.1);
        // Arcane Unrest: never quite still, and stronger with time; Arcane Shivers: fewer, each bursting into three
        proj(run, { k: 'shard', a, x: p.x, y: p.y - 3, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, ang, r: 3.2 * Math.sqrt(s.area), pierce: 999, life: s.duration, max: s.duration, drag: 2.6, minSp: s.unrest ? 24 : 0, decay: s.unrest ? -0.3 : 0.25, cdHit: 0.45, shiver: s.shivers ? 0.35 : null });
      }
      DH.audio.play('hex');
    } },
    confetti: { fire(run, a) {
      const p = run.player, s = a.s; a.dir = (a.dir == null ? U.rand(0, TAU) : a.dir) + Math.PI / 4; a.turns = (a.turns || 0) + 1;
      const CONF = s.iceconfetti ? ['#e8f8ff', '#9fdcff', '#6ab8ff', '#ffffff'] : ['#ff5a8a', '#ffd35a', '#6ad8ff', '#8aff6a', '#c890ff', '#ff9a3a'];
      const full = s.fullcircle && a.turns % 8 === 0; // Full Circle: a whole turn done, every direction at once and harder
      const dirs = full ? [0, 1, 2, 3, 4, 5, 6, 7].map((k) => a.dir + k * Math.PI / 4) : s.moredirs ? [a.dir, a.dir + TAU / 3, a.dir + 2 * TAU / 3] : [a.dir]; // More directions
      const per = full ? Math.ceil(s.count / 2) : s.moredirs ? Math.ceil(s.count / 2) : s.count;
      for (const d0 of dirs) for (let i = 0; i < per; i++) {
        const ang = d0 + U.rand(-0.45, 0.45), sp = s.speed * U.rand(0.6, 1.15);
        proj(run, { k: 'confetti', a, x: p.x, y: p.y - 4, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, ang: U.rand(0, TAU), spin: U.rand(-12, 12), col: U.pick(CONF), r: 3.5 * Math.sqrt(s.area), pierce: 999, life: s.duration, max: s.duration, drag: 3, cdHit: 0.3, mult: full ? 1.5 : 1 });
      }
      DH.audio.play('throw');
    } },
    riff: { fire(run, a) {
      const p = run.player, s = a.s;
      if (!run.randomTarget(200)) return false;
      for (let i = 0; i < s.count; i++) run.after(i * 0.07, () => {
        const tg = run.randomTarget(200); if (!tg) return;
        const ang = Math.atan2(tg.y - p.y, tg.x - p.x);
        proj(run, { k: 'note', a, x: p.x, y: p.y - 4, vx: Math.cos(ang) * s.speed, vy: Math.sin(ang) * s.speed, ang, r: 3.5, pierce: s.pierce, life: 0.9, alt: i % 2 });
      });
      DH.audio.play('dart');
    } },
    pyro: { fire(run, a) {
      const p = run.player, s = a.s, R0 = 52 * Math.min(1.6, Math.sqrt(s.area)), R = 16 * Math.sqrt(s.area), n = s.count * (s.moreflames ? 2 : 1); // Additional Flames
      a.rot = (a.rot || 0) + Math.PI / n;
      const rings = [[R0, a.rot, n]]; if (s.smallcircle) rings.push([R0 * 0.5, -a.rot * 1.5, Math.max(3, Math.round(n / 2))]); // Small Circle: an inner ring the other way
      const cols = s.hotspark ? ['#fff080', '#ffd35a', '#ffffff'] : ['#ffd35a', '#ff7a20', '#fff0a0'];
      for (const [RR, rot, m] of rings) for (let i = 0; i < m; i++) run.after(i * 0.05, () => {
        const ang = rot + i * TAU / m, x = p.x + Math.cos(ang) * RR, y = p.y + Math.sin(ang) * RR * 0.85;
        run.hitCircle(x, y, R, a);
        run.fx.push({ k: 'fountain', x, y, R, life: 0.55, max: 0.55 });
        run.burst(x, y, 8, cols, 110);
      });
      DH.audio.play('fire');
    } },
    fireball: { fire(run, a) {
      const p = run.player, s = a.s;
      if (volley(run, a, 260, 0.15, true, (ang) => proj(run, { k: 'fireball', a, x: p.x, y: p.y, vx: Math.cos(ang) * s.speed, vy: Math.sin(ang) * s.speed, ang, r: 5, pierce: 0, life: 1.8, boom: 26 * s.area })) == null) return false;
      DH.audio.play('fire');
    } },
  };
  function novaUpdate(run, f) {
    const k = 1 - f.life / f.max, R = f.R * Math.min(1, k * 1.3), p = run.player;
    f.x = p.x; f.y = p.y; f.cur = R;
    run.grid.query(f.x, f.y, R + 10, tmp);
    for (const e of tmp.slice()) {
      if (e.dead || f.hit.has(e)) continue;
      if (U.dist2(f.x, f.y, e.x, e.y) < (R + e.r) * (R + e.r)) {
        f.hit.add(e); run.addSlow(e, 6);
        const d = Math.hypot(e.x - f.x, e.y - f.y) || 1, k = Math.min(1, d / f.R);
        if (f.a.s.frostcore && k < 0.4 && !e.boss) e.stun = Math.max(e.stun || 0, 1.2); // Frozen Heart: the core freezes solid
        run.hit(e, f.a, (1 - 0.7 * k) * (f.mult || 1), (e.x - f.x) / d, (e.y - f.y) / d); // full damage at the heart, 30% at the rim
      }
    }
  }
  function orbit(run, a, dt, kind, radius, hitR, cd) {
    const p = run.player, s = a.s, def = C.abilities[a.id], n = s.count, lanes = s.innerorbit ? 2 : 1;
    a.ang += s.speed * dt * (def && def.moveSpin && p.moving ? 1 + run.P.speed / 110 : 1); a.R = radius * s.area;
    a.pos = a.pos || []; a.pos.length = n * lanes;
    const zap = s.electrified && p.moving ? 1.25 : 1; // Electrified Orbs: harder while you move
    for (let L = 0; L < lanes; L++) for (let i = 0; i < n; i++) {
      const inner = L === 1, ang = (inner ? -a.ang * 1.3 + Math.PI / n : a.ang) + i / n * TAU; // Inner Orbit: a second ring the other way
      const R = a.R * (inner ? 0.55 : s.eccentric ? 1 + 0.45 * Math.sin(a.ang * 0.8 + i * 2.1) : 1); // Orbital Shift: the ring breathes
      const bx = p.x + Math.cos(ang) * R, by = p.y + Math.sin(ang) * R;
      a.pos[L * n + i] = { x: bx, y: by, a: ang, kind };
      run.hitCircle(bx, by, hitR * Math.sqrt(s.area), a, zap * (s.eccentric && !inner ? R / a.R : 1), (e) => run.canHit(e, a.id + (inner ? 'i' : ''), cd));
      if (zap > 1 && Math.random() < dt * 5) run.parts.push({ x: bx + U.rand(-3, 3), y: by + U.rand(-3, 3), vx: U.rand(-20, 20), vy: U.rand(-20, 20), life: 0.2, max: 0.2, c: '#fff080', s: 1 });
    }
  }
  C.AB = AB;

  /** A copy of ability `a` that strikes with other tags / an extra effect chance (plants, brews); rebuilt when `a` is recomputed. */
  R.subAb = function (a, key, tags, eff, add) {
    a.subs = a.subs || {};
    let sub = a.subs[key];
    if (!sub || sub.src !== a.s) {
      const s = Object.assign({}, a.s); if (eff) s[eff] = (s[eff] || 0) + add;
      sub = a.subs[key] = { id: a.id, weapon: a.weapon, tags, s, src: a.s, noCrit: a.noCrit, split: false };
    }
    return sub;
  };
  /** The Alchemist's elements: each one another of his damage sources already wields (abilities, traits, items). */
  R.brewElements = function () {
    const P = this.P, have = { fire: P.burn > 0 || P.tag.fire > 0, lightning: P.spark > 0 || P.tag.lightning > 0, ice: P.frost > 0 || P.tag.ice > 0, earth: P.decay > 0 };
    for (const b of this.abilities) {
      if (b.id === 'concoction' || !b.tags) continue;
      if (b.tags.includes('fire') || b.s.burn > 0) have.fire = true;
      if (b.tags.includes('lightning') || b.s.spark > 0) have.lightning = true;
      if (b.tags.includes('ice') || b.s.frost > 0) have.ice = true;
      if (b.s.decay > 0) have.earth = true;
    }
    return ['fire', 'lightning', 'ice', 'earth'].filter((k) => have[k]);
  };
  R.landBrew = function (b) {
    const s = b.a.s, key = b.el || 'bomb', E = BREW[key], R = 24 * s.area;
    const sub = this.subAb(b.a, key, E.tags, E.eff, 0.6 * (1 + this.P.effectPct));
    this.hitCircle(b.tx, b.ty, R, sub);
    this.fx.push({ k: 'pop', x: b.tx, y: b.ty, R: R * 1.1, life: 0.3, max: 0.3, color: E.col });
    this.burst(b.tx, b.ty, 10, [E.col, '#ffffff', '#6a5a4a'], 70);
    if (b.el) this.zones.push({ kind: 'brew', a: sub, el: b.el, col: E.col, x: b.tx, y: b.ty, r: R, life: s.duration, max: s.duration, tick: 0.3, seed: Math.random() * 99 });
    DH.audio.play('glass'); if (!b.el) DH.audio.play('boom');
  };
  R.landGrenade = function (b) {
    const R = b.R, x = b.tx, y = b.ty;
    this.grid.query(x, y, R + 20, tmp);
    for (const e of tmp.slice()) if (!e.dead && U.dist2(x, y, e.x, e.y) < (R + e.r) * (R + e.r)) { this.rawDamage(e, b.gdmg, '#ffb060', b.a.id); if (!e.dead && !e.boss) { const d = Math.hypot(e.x - x, e.y - y) || 1, k = 90 / Math.sqrt(e.mass); e.kx += (e.x - x) / d * k; e.ky += (e.y - y) / d * k; } }
    this.fx.push({ k: 'explosion', x, y, R, life: 0.4, max: 0.4 });
    for (let i = 0; i < 10; i++) { const an = Math.random() * TAU, sp = U.rand(40, 120); this.gpart({ x, y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - 30, g: 80, life: U.rand(0.4, 0.8), max: 0.8, c: '#ff8a30', r: 1.1, core: '#fff0a0' }); }
    for (let i = 0; i < 8; i++) this.parts.push({ x: x + U.rand(-8, 8), y: y + U.rand(-6, 4), vx: U.rand(-12, 12), vy: U.rand(-26, -8), life: U.rand(0.8, 1.4), max: 1.4, c: U.pick(['#5a5a60', '#7a7a82', '#3a3a40']), s: 2 });
    this.shake = Math.max(this.shake, 2.5); DH.audio.play('boom');
  };
  /** Crone's plants. Crone's Blessing: +5% damage per level, shared among her living plants. */
  R.updatePlant = function (al, dt) {
    const a = al.a, s = a.s, sub = this.subAb(a, al.type, PLANT_TAGS[al.type]);
    const bless = this.hero.blessing ? 1 + 0.05 * (this.level - 1) / Math.max(1, a.nPlants || 1) : 1;
    al.cd -= dt; al.bite = Math.max(0, (al.bite || 0) - dt);
    if (al.t < 0.35 || al.wither) return; // still sprouting / withering
    if (al.type === 'snare') { // roots and lashes everything around it
      const R = 26 * s.area;
      if (al.cd <= 0) { al.cd = 0.8; if (this.hitCircle(al.x, al.y, R, sub, 0.55 * bless)) al.bite = 0.25; }
      this.grid.query(al.x, al.y, R, tmp);
      for (const e of tmp) if (!e.dead && !e.boss && U.dist2(al.x, al.y, e.x, e.y) < R * R && (e.slowS || 0) < 6) this.addSlow(e, 6 - (e.slowS || 0));
    } else if (al.type === 'biter') { // snaps at whatever comes close
      const tg = this.nearest(al.x, al.y, 26 * Math.sqrt(s.area));
      if (tg) { al.face = tg.x < al.x ? -1 : 1; if (al.cd <= 0) { al.cd = 0.55; const dx = tg.x - al.x, dy = tg.y - al.y, d = Math.hypot(dx, dy) || 1; this.hit(tg, sub, 1.3 * bless, dx / d, dy / d); al.bite = 0.2; } }
    } else if (al.type === 'pod') { // swells when a foe steps near and bursts
      if (al.arm == null) { if (this.nearest(al.x, al.y, 22 * Math.sqrt(s.area))) al.arm = 0.45; }
      else if ((al.arm -= dt) <= 0) {
        const R = 36 * s.area; this.hitCircle(al.x, al.y, R, sub, 2.4 * bless);
        this.fx.push({ k: 'pop', x: al.x, y: al.y, R, life: 0.35, max: 0.35, color: '#b070ff' });
        this.burst(al.x, al.y, 14, ['#b070ff', '#6a8a30', '#e0c0ff'], 90); this.shake = Math.max(this.shake, 1.5); DH.audio.play('boom');
        al.life = 0;
      }
    } else { // spitter: lobs thorny seeds at range
      if (al.cd <= 0) {
        const tg = this.nearest(al.x, al.y, 150);
        if (tg) { al.cd = 1.0; al.face = tg.x < al.x ? -1 : 1; const ang = Math.atan2(tg.y - al.y + 6, tg.x - al.x); proj(this, { k: 'spit', a: sub, mult: 0.9 * bless, x: al.x + al.face * 4, y: al.y - 7, vx: Math.cos(ang) * 190, vy: Math.sin(ang) * 190, ang, r: 3, pierce: 0, life: 1 }); al.bite = 0.2; }
        else al.cd = 0.2;
      }
    }
  };

  /** Position in beats of the battle music (the Skald's songs land on it); falls back to run time at the same tempo. */
  R.beatPos = function () { const b = DH.audio.beatPos(); return b == null ? this.time * DH.audio.BATTLE_BPM / 60 : b; };
  R.updateAbility = function (a, dt) {
    const B = AB[a.id]; if (!B) return;
    if (B.update) B.update(this, a, dt);
    if (!B.fire) { // weapons that act on their own (wolves, scythes, plants): the hero still strikes out at foes nearby
      if (a.weapon && (a.animT = (a.animT || 0) - dt) <= 0) { a.animT = 1.1; if (this.nearest(this.player.x, this.player.y, 90)) this.attackAnim(a); }
      return;
    }
    if (a.s.every) { // beat-synced song
      const idx = Math.floor(this.beatPos() / a.s.every);
      if (a.lastBeat == null) a.lastBeat = idx;
      if (idx !== a.lastBeat) {
        a.lastBeat = idx;
        if (B.fire(this, a) !== false) { if (a.weapon) this.onWeaponFire(a); const n = this.detStacks(a, a.s.ms); for (let i = 0; i < n; i++) a.rep.push(0.1 * (i + 1)); }
      }
      for (let i = a.rep.length - 1; i >= 0; i--) { a.rep[i] -= dt; if (a.rep[i] <= 0) { a.rep.splice(i, 1); B.fire(this, a); } }
      return;
    }
    a.t -= dt;
    if (a.t <= 0) {
      a.cdNext = 0;
      if (B.fire(this, a) === false) a.t = 0.2;
      else {
        if (a.weapon) this.onWeaponFire(a);
        a.t = a.cdNext || a.s.cd;
        const n = this.detStacks(a, a.s.ms);
        for (let i = 0; i < n; i++) a.rep.push(0.1 * (i + 1));
      }
    }
    for (let i = a.rep.length - 1; i >= 0; i--) { a.rep[i] -= dt; if (a.rep[i] <= 0) { a.rep.splice(i, 1); B.fire(this, a); } }
  };

  /* ---------------- summons ---------------- */
  R.keepAllies = function (kind, a, n) {
    let have = 0; for (const al of this.allies) if (al.kind === kind && al.a === a) have++;
    const p = this.player;
    while (have < n) { this.allies.push({ kind, a, x: p.x + U.rand(-10, 10), y: p.y + U.rand(-10, 10), t: 0, life: Infinity, face: 1 }); have++; }
  };
  R.updateAllies = function (dt) {
    if (this.timers) for (let i = this.timers.length - 1; i >= 0; i--) { const tm = this.timers[i]; tm.t -= dt; if (tm.t <= 0) { this.timers.splice(i, 1); tm.fn(); } }
    const p = this.player;
    // imps from the Infernal Pact ring
    if (this.P.imps) { let n = 0; for (const al of this.allies) if (al.kind === 'imp') n++; if (n < this.P.imps) this.allies.push({ kind: 'imp', a: this.impAbility(), x: p.x, y: p.y, t: 0, life: Infinity, face: 1 }); }
    for (let i = this.allies.length - 1; i >= 0; i--) {
      const al = this.allies[i]; al.t += dt; al.life -= dt;
      if (al.life <= 0 || !this.abilities.includes(al.a) && al.kind !== 'imp') { this.allies.splice(i, 1); continue; }
      const s = al.a.s;
      if (al.kind === 'spirit') {
        const tg = this.nearest(al.x, al.y, 200);
        if (tg) { const d = Math.hypot(tg.x - al.x, tg.y - al.y) || 1; al.vx += (tg.x - al.x) / d * 600 * dt; al.vy += (tg.y - al.y) / d * 600 * dt; }
        const sp = Math.hypot(al.vx, al.vy), mx = s.speed * 1.6; if (sp > mx) { al.vx *= mx / sp; al.vy *= mx / sp; }
        al.x += al.vx * dt; al.y += al.vy * dt;
        if (tg && U.dist2(al.x, al.y, tg.x, tg.y) < (tg.r + 4) * (tg.r + 4)) {
          this.hitCircle(al.x, al.y, 14 * s.area, al.a); this.fx.push({ k: 'pop', x: al.x, y: al.y, R: 14 * s.area, life: 0.25, max: 0.25, color: '#d890ff' });
          this.allies.splice(i, 1);
        }
        continue;
      }
      if (al.kind === 'phantom') { this.updatePhantom(al, dt); continue; }
      if (al.kind === 'plant') { this.updatePlant(al, dt); continue; }
      // melee summons: wolf, golem, imp
      const leash = 150;
      const tg = this.nearest(al.x, al.y, 140);
      const tooFar = U.dist2(al.x, al.y, p.x, p.y) > leash * leash;
      let tx = p.x + Math.cos(al.t + i) * 18, ty = p.y + Math.sin(al.t + i) * 12;
      if (tg && !tooFar) { tx = tg.x; ty = tg.y; }
      const spd = (al.kind === 'golem' ? s.speed : al.kind === 'phantom' ? s.speed * 1.4 : al.kind === 'imp' ? 90 : s.speed) * (tooFar ? 1.8 : 1);
      const dx = tx - al.x, dy = ty - al.y, d = Math.hypot(dx, dy);
      const reach = al.kind === 'golem' ? 14 : 10;
      if (d > reach) { al.x += dx / d * spd * dt; al.y += dy / d * spd * dt; al.moving = true; } else al.moving = false;
      if (Math.abs(dx) > 1) al.face = dx > 0 ? 1 : -1;
      al.cd = (al.cd || 0) - dt;
      if (tg && d <= reach + 4 && al.cd <= 0) {
        if (al.kind === 'golem') { al.cd = s.cd; const R = 22 * s.area; this.hitCircle(al.x, al.y, R, al.a); this.fx.push({ k: 'slam', x: al.x, y: al.y + 4, R, life: 0.35, max: 0.35, color: s.magma ? '#ff8a30' : '#e8dcc0' }); this.shake = Math.max(this.shake, 1.5); DH.audio.play('boom'); }
        else if (al.kind === 'phantom') { al.cd = 0.55; const R = 18 * s.area; this.hitCircle(al.x, al.y, R, al.a); this.fx.push({ k: 'slash', x: al.x, y: al.y, ang: Math.atan2(dy, dx), R, arc: 2.4, life: 0.2, max: 0.2, color: '#b8a8ff' }); }
        else { al.cd = al.kind === 'imp' ? 0.9 : s.cd; this.hit(tg, al.a, 1, dx / (d || 1), dy / (d || 1)); al.bite = 0.15; }
      }
      al.bite = Math.max(0, (al.bite || 0) - dt);
      if (al.kind === 'golem' && s.earthen && al.moving && (al.trail = (al.trail || 0) - dt) <= 0) { al.trail = 0.8; this.puddle(al.a, 'earth', al.x, al.y + 3, 14 * Math.sqrt(s.area), 3, 0.15); } // Earthen Trails
    }
  };
  /** Spirit Warrior: fights where it stands; when the hero moves away it dashes after them, cutting through everything on the way. */
  R.updatePhantom = function (al, dt) {
    const p = this.player, s = al.a.s;
    al.cd = (al.cd || 0) - dt;
    if (al.dash) {
      const dx = al.dash.x - al.x, dy = al.dash.y - al.y, d = Math.hypot(dx, dy), step = s.speed * 5 * dt;
      if (Math.abs(dx) > 1) al.face = dx > 0 ? 1 : -1;
      if (d <= step) {
        al.x = al.dash.x; al.y = al.dash.y; al.dash = null;
        if (s.dashimpact) { const R = 30 * s.area; this.hitCircle(al.x, al.y, R, al.a); this.grid.query(al.x, al.y, R, tmp); for (const e of tmp) if (!e.dead && !e.boss && U.dist2(e.x, e.y, al.x, al.y) < R * R) this.addSlow(e, 4); this.fx.push({ k: 'slam', x: al.x, y: al.y + 3, R, life: 0.35, max: 0.35, color: '#b8a8ff' }); } // Dash Impact
      }
      else { al.x += dx / d * step; al.y += dy / d * step; }
      this.hitCircle(al.x, al.y, 14 * s.area, al.a, 1.5, (e) => this.canHit(e, 'phd' + al.id, 0.5));
      if (Math.random() < 0.6) this.parts.push({ x: al.x, y: al.y, vx: 0, vy: 0, life: 0.3, max: 0.3, c: '#b8a8ff', s: 1 });
      al.moving = true;
      return;
    }
    al.moving = false; al.id = al.id || Math.random();
    this.phantomExtras(al, dt);
    if (U.dist2(al.x, al.y, p.x, p.y) > 90 * 90) {
      const a = Math.random() * TAU; al.dash = { x: p.x + Math.cos(a) * 16, y: p.y + Math.sin(a) * 12 };
      this.fx.push({ k: 'slash', x: al.x, y: al.y, ang: Math.atan2(al.dash.y - al.y, al.dash.x - al.x), R: 20, arc: 1.2, life: 0.2, max: 0.2, color: '#d8c8ff' });
      DH.audio.play('swing'); return;
    }
    const tg = this.nearest(al.x, al.y, 28 * s.area);
    if (tg && al.cd <= 0) {
      al.cd = s.cd; const dx = tg.x - al.x, dy = tg.y - al.y, R = 18 * s.area;
      if (Math.abs(dx) > 1) al.face = dx > 0 ? 1 : -1;
      this.hitCircle(al.x, al.y, R, al.a); this.fx.push({ k: 'slash', x: al.x, y: al.y, ang: Math.atan2(dy, dx), R, arc: 2.4, life: 0.2, max: 0.2, color: '#b8a8ff' });
    }
  };
  /** The Phantom Knight's upgrades that work wherever it stands: orbs about it, darts thrown from it. */
  R.phantomExtras = function (al, dt) {
    const s = al.a.s;
    if (s.spiritorbs) { // Spirit Orbs
      al.oa = (al.oa || 0) + dt * 3;
      for (let i = 0; i < 2; i++) { const an = al.oa + i * Math.PI, ox = al.x + Math.cos(an) * 16, oy = al.y + Math.sin(an) * 12; if (al.a.pos) al.a.pos.push({ x: ox, y: oy, a: an, kind: 'orb' }); this.hitCircle(ox, oy, 6, al.a, 0.5, (e) => this.canHit(e, 'pho' + al.id + i, 0.5)); }
    }
    if (s.spiritneedles && (al.nd = (al.nd || 0) - dt) <= 0) { // Spirit Needles
      const tg = this.randomTarget(150, al.x, al.y);
      if (tg) { al.nd = 0.8; const ang = Math.atan2(tg.y - al.y, tg.x - al.x); proj(this, { k: 'dart', a: al.a, x: al.x, y: al.y - 4, vx: Math.cos(ang) * 320, vy: Math.sin(ang) * 320, ang, r: 3, pierce: 0, life: 0.7, mult: 0.5 }); }
      else al.nd = 0.3;
    }
  };
  R.impAbility = function () {
    if (!this._impA) { this._impA = { id: 'imp', tags: ['fire', 'summon', 'melee'], s: { dmg: 10, dmgPct: 0, cd: 0.9, knock: 20, crit: 0.05, ms: 0, burn: 0.3, spark: 0, frost: 0, decay: 0, fragile: 0, affliction: 0, speed: 90, area: 1 } }; }
    this._impA.s.dmg = 10 * (1 + this.stage.index * 0.6);
    return this._impA;
  };

  /* ---------------- projectiles ---------------- */
  R.updateProjectiles = function (dt) {
    const list = this.proj, p = this.player;
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      b.life -= dt;
      if (b.k === 'grenade' || b.k === 'brewflask') { // lobbed: an arc to the target point
        b.ft += dt; const k = Math.min(1, b.ft / b.fd);
        b.x = U.lerp(b.sx, b.tx, k); b.y = U.lerp(b.sy, b.ty, k) - Math.sin(k * Math.PI) * (b.k === 'grenade' ? 40 : 30); b.ang += dt * (b.k === 'grenade' ? 9 : 12);
        if (k >= 1) { if (b.k === 'grenade') this.landGrenade(b); else this.landBrew(b); list.splice(i, 1); }
        continue;
      }
      if (b.k === 'flask') {
        b.ft += dt; const k = Math.min(1, b.ft / b.fd);
        b.x = U.lerp(b.sx, b.tx, k); b.y = U.lerp(b.sy, b.ty, k) - Math.sin(k * Math.PI) * 30; b.ang += dt * 12;
        if (k >= 1) {
          const s = b.a.s;
          this.zones.push({ kind: 'pool', a: b.a, x: b.tx, y: b.ty, r: 24 * s.area, life: s.duration, max: s.duration, tick: 0 });
          DH.audio.play('glass'); this.burst(b.tx, b.ty, 8, ['#6cc04a', '#7dffb0'], 60);
          list.splice(i, 1);
        }
        continue;
      }
      if (b.k === 'chakram') {
        if (b.orbit && b.orbit.t > 0) { b.orbit.t -= dt; b.orbit.a += 7 * dt; b.orbit.rad = Math.min(70, b.orbit.rad + 60 * dt); b.x = p.x + Math.cos(b.orbit.a) * b.orbit.rad; b.y = p.y + Math.sin(b.orbit.a) * b.orbit.rad; }
        else {
          b.out -= dt;
          if (b.out <= 0) { const d = Math.hypot(p.x - b.x, p.y - b.y) || 1, sp = Math.hypot(b.vx, b.vy); b.vx = (p.x - b.x) / d * sp; b.vy = (p.y - b.y) / d * sp; if (d < 10) b.life = 0; }
          b.x += b.vx * dt; b.y += b.vy * dt;
        }
        b.ang += dt * 16;
      } else {
        if (b.g) { b.vy += b.g * dt; b.ang += b.spin * dt; }
        if (b.drag) { const k = Math.exp(-b.drag * dt), v = Math.hypot(b.vx, b.vy); if (!b.minSp || v * k > b.minSp) { b.vx *= k; b.vy *= k; } if (b.spin) b.ang += b.spin * dt * Math.min(1, Math.hypot(b.vx, b.vy) / 40 + 0.15); } // slows to a hover
        b.x += b.vx * dt; b.y += b.vy * dt;
      }
      if (b.decay) b.mult = Math.min(2, Math.max(0.25, 1 - b.decay * (b.max - b.life))); // loses (or, restless, gains) a share of its strength every second
      if (b.shiver != null && (b.shiver -= dt) <= 0) { // Arcane Shivers: bursts into three smaller shards
        b.shiver = null; b.life = 0; const sp = Math.max(60, Math.hypot(b.vx, b.vy)), an = Math.atan2(b.vy, b.vx);
        for (const o of [-0.5, 0, 0.5]) proj(this, { k: 'shard', a: b.a, x: b.x, y: b.y, vx: Math.cos(an + o) * sp, vy: Math.sin(an + o) * sp, ang: an + o, r: b.r * 0.7, pierce: 999, life: b.max * 0.8, max: b.max * 0.8, drag: b.drag, decay: b.decay, cdHit: 0.45, mult: 0.4 });
      }
      if (b.k === 'wall' && b.a.s.devilhorns && (b.trailT -= dt) <= 0) { b.trailT = 0.3; this.puddle(b.a, 'magic', b.x, b.y + 3, 10, 1.2, 0.15, false, 0); } // Devil's Horns: a trail that wounds
      if (b.k === 'axe' && b.a.s.returning && !b.ret && b.life < 0.75) { b.ret = true; b.hit = new Set(); b.g = 0; b.life = 1.2; } // Returning Axes: back to your hand
      if (b.ret) { const d = Math.hypot(p.x - b.x, p.y - b.y) || 1; b.vx = (p.x - b.x) / d * 260; b.vy = (p.y - b.y) / d * 260; if (d < 10) b.life = 0; }
      if (b.grow) b.r = 4 + b.grow * (1 - b.life / b.max);
      if (b.k === 'sphere') {
        const s = b.a.s; b.pulse -= dt * (1 + s.ms);
        if (s.attraction) { const tg = this.nearest(b.x, b.y, 80); if (tg) { const sp = Math.hypot(b.vx, b.vy) || 1, cur = Math.atan2(b.vy, b.vx); let da = Math.atan2(tg.y - b.y, tg.x - b.x) - cur; da = Math.atan2(Math.sin(da), Math.cos(da)); const na = cur + U.clamp(da, -2.5 * dt, 2.5 * dt); b.vx = Math.cos(na) * sp; b.vy = Math.sin(na) * sp; } } // Static Attraction
        if (s.highvoltage && (b.volt -= dt) <= 0) { // High Voltage: chain lightning to foes it passes
          b.volt = 0.5; let cur = { x: b.x, y: b.y }; const ex = new Set(), pts = [[b.x, b.y]];
          for (let c = 0; c < 3; c++) { const e = this.nearest(cur.x, cur.y, 60, ex); if (!e) break; ex.add(e); pts.push([e.x, e.y]); this.hit(e, b.a, 0.6); cur = e; }
          if (pts.length > 1) this.fx.push({ k: 'chain', pts, life: 0.2, max: 0.2, seed: Math.random() * 999, color: '#fff6a0' });
        }
        if (b.pulse <= 0) { b.pulse = s.pulse ? 0.3 : 0.5; const R = 30 * s.area; this.fx.push({ k: 'pop', x: b.x, y: b.y, R, life: 0.2, max: 0.2, color: '#fff6a0' }); this.hitCircle(b.x, b.y, R, b.a); if (Math.random() < 0.5) DH.audio.play('zap'); }
      }
      let remove = b.life <= 0;
      if (!remove && b.k !== 'sphere') {
        this.grid.query(b.x, b.y, b.r + 12, tmp);
        for (const e of tmp) {
          if (e.dead) continue;
          if (b.cdHit) { if (!this.canHit(e, 'pj' + (b.id || (b.id = Math.random())), b.cdHit)) continue; }
          else if (b.hit.has(e)) continue;
          const rr = b.r + e.r;
          if (U.dist2(b.x, b.y, e.x, e.y) >= rr * rr) continue;
          if (!b.cdHit) b.hit.add(e);
          const sp = Math.hypot(b.vx, b.vy) || 1;
          if (b.k === 'fireball') { this.explode(b); remove = true; break; }
          if (b.k === 'fist') { this.hitCircle(b.x, b.y, 10 * b.a.s.area, b.a); this.fx.push({ k: 'pop', x: b.x, y: b.y, R: 10 * b.a.s.area, life: 0.2, max: 0.2, color: '#c8a8ff' }); remove = true; break; }
          // a Shieldbearer's shield faces the hero: shots striking it from the front glance off for a quarter and stop there
          if (e.def.shield && !(e.stun > 0)) {
            const fx = this.player.x - e.x, fy = this.player.y - e.y;
            if ((b.vx * fx + b.vy * fy) / (sp * (Math.hypot(fx, fy) || 1)) < -0.35) {
              this.hit(e, b.a, (b.mult || 1) * e.def.shield, b.vx / sp, b.vy / sp);
              this.burst(b.x, b.y, 5, ['#fff0c0', '#c8ccd8'], 60); if (Math.random() < 0.3) DH.audio.play('block');
              remove = true; break;
            }
          }
          const pm = this.projPre(b, e);
          this.hit(e, b.a, (b.mult || 1) * (b.a.s.falloff ? Math.pow(b.a.s.falloff, b.nh || 0) : 1) * pm, b.vx / sp, b.vy / sp);
          this.projPost(b, e);
          b.nh = (b.nh || 0) + 1;
          if (b.fork && !b.forked) { b.forked = true; for (const o of [-0.5, 0.5]) { const ang = Math.atan2(b.vy, b.vx) + o; proj(this, { k: 'hex', a: b.a, x: b.x, y: b.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, ang, r: 4, pierce: 999, life: 0.6, forked: true, hit: new Set([e]) }); } }
          if (b.pierce-- <= 0 || (e.def.noPierce && b.pierce < 900)) { remove = true; break; } // some foes cannot be pierced
        }
      }
      if (remove) { if (b.k === 'fireball' && b.life <= 0) this.explode(b); this.projEnd(b); list.splice(i, 1); }
    }
    // enemy projectiles
    for (let i = this.eproj.length - 1; i >= 0; i--) {
      const b = this.eproj[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.acc) { b.vx *= 1 + b.acc * dt; b.vy *= 1 + b.acc * dt; }
      if (b.home) { // a homing orb turns toward you, slowly
        const cur = Math.atan2(b.vy, b.vx), sp = Math.hypot(b.vx, b.vy); let da = Math.atan2(p.y - b.y, p.x - b.x) - cur; da = Math.atan2(Math.sin(da), Math.cos(da));
        const a = cur + U.clamp(da, -b.home * dt, b.home * dt); b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp;
      }
      if (U.dist2(b.x, b.y, p.x, p.y) < (b.r + p.r - 1) * (b.r + p.r - 1)) {
        if (b.kind === 'curse' && !(p.inv > 0) && !(this.buffs.wraith > 0) && !(this.curse > 0)) { this.curse = C.STATUS.curse; DH.audio.play('roar'); DH.events.emit('run:warning', t('hud.cursed')); } // Curse Bolt
        if (b.kind === 'frost' || b.kind === 'web') this.pslow = Math.max(this.pslow || 0, b.kind === 'web' ? 1.8 : 1); // frost shards numb your step
        this.hurtPlayer(b.dmg); this.eproj.splice(i, 1); continue;
      }
      if (b.life <= 0) this.eproj.splice(i, 1);
    }
  };
  /** Upgrade hooks on a projectile's hit: a damage factor before it, effects after it, and when the projectile is spent. */
  R.projPre = function (b, e) {
    const s = b.a.s; let m = 1;
    if (s.amputation) m *= 1 + 0.1 * this.statusKinds(e); // Amputation
    if (s.fetters && b.k === 'dart') { b.cb = Math.min(0.6, (e.slowS || 0) * 0.03); s.crit += b.cb; } // Phantom Fetters: crits come easier on the slowed
    return m;
  };
  R.projPost = function (b, e) {
    const s = b.a.s;
    if (b.cb) { s.crit -= b.cb; b.cb = 0; }
    if ((s.fetters && b.k === 'dart') || (s.backshot && b.k === 'hex') || b.cripple) this.addSlow(e, 3);
    if (b.k === 'note' && s.splitharmony && !b.child) { // Split Harmony: the note splits in two on its first hit
      b.child = true; const sp = Math.hypot(b.vx, b.vy), an = Math.atan2(b.vy, b.vx);
      for (const o of [-0.45, 0.45]) proj(this, { k: 'note', a: b.a, x: b.x, y: b.y, vx: Math.cos(an + o) * sp, vy: Math.sin(an + o) * sp, ang: an + o, r: 3, pierce: 0, life: 0.5, child: true, mult: 0.45, alt: 1, hit: new Set([e]) });
    }
    if (b.k === 'axe' && s.splitaxe && !b.child && !b.split) { // Splitting Axes: the first blow breaks it in two
      b.split = true;
      for (const side of [-1, 1]) proj(this, { k: 'axe', a: b.a, x: b.x, y: b.y, vx: side * 140, vy: -120, g: 420, ang: 0, spin: side * 16, r: b.r * 0.7, pierce: 999, life: 0.9, child: true, mult: 0.5, hit: new Set([e]) });
    }
    if (b.bounce > 0) { const nx = this.nearest(e.x, e.y, 80, b.hit); if (nx) { b.bounce--; const sp = Math.hypot(b.vx, b.vy) || 200, an = Math.atan2(nx.y - b.y, nx.x - b.x); b.vx = Math.cos(an) * sp; b.vy = Math.sin(an) * sp; b.ang = an; } }
    if (s.split && b.k === 'dart' && this.lastCrit && !b.child && b.pierce > 0) { // Phantom Split
      const sp = Math.hypot(b.vx, b.vy), ang = Math.atan2(b.vy, b.vx);
      for (const o of [-0.35, 0.35]) proj(this, { k: 'dart', a: b.a, x: b.x, y: b.y, vx: Math.cos(ang + o) * sp, vy: Math.sin(ang + o) * sp, ang: ang + o, r: b.r, pierce: b.pierce - 1, life: Math.max(0.3, b.life), child: true, hit: new Set(b.hit) });
    }
  };
  R.projEnd = function (b) {
    const s = b.a && b.a.s; if (!s) return;
    if (s.sonicboom && b.k === 'note') { const R = 16 * Math.sqrt(s.area); this.hitCircle(b.x, b.y, R, b.a, 0.35); this.fx.push({ k: 'pop', x: b.x, y: b.y, R, life: 0.25, max: 0.25, color: '#ffd98a' }); } // Sonic Boom
    if (s.discharge && b.k === 'sphere') { // Final Discharge: a shockwave that Sparks all it reaches
      const R = 60 * s.area; this.hitCircle(b.x, b.y, R, b.a, 1.5);
      this.grid.query(b.x, b.y, R, tmp); for (const e of tmp) if (!e.dead && U.dist2(e.x, e.y, b.x, b.y) < R * R) this.addSpark(e, 2, s.dmg + this.P.addBase);
      this.fx.push({ k: 'pulse', x: b.x, y: b.y, R, life: 0.4, max: 0.4, color: '#fff6a0' }); DH.audio.play('storm');
    }
    if (s.riftdart && b.k === 'dart') { // Phantom Rift: a spent dart bursts in magic, harder for every pierce it had left
      const R = 14 * Math.sqrt(s.area), sub = this.subAb(b.a, 'riftdart', ['magic', 'area']);
      this.hitCircle(b.x, b.y, R, sub, 0.5 * (1 + Math.min(4, Math.max(0, b.pierce))));
      this.fx.push({ k: 'pop', x: b.x, y: b.y, R, life: 0.25, max: 0.25, color: '#c070ff' });
    }
  };
  /** A puddle of an element that keeps working on those in it (the Alchemist's brews use the same). */
  R.puddle = function (a, el, x, y, r, dur, mult, slow, eff) {
    const E = BREW[el], sub = this.subAb(a, 'pud_' + el, E.tags, E.eff, (eff == null ? 0.3 : eff) * (1 + this.P.effectPct));
    this.zones.push({ kind: 'brew', a: sub, el, col: E.col, x, y, r, life: dur, max: dur, tick: 0.2, seed: Math.random() * 99, mult, slow });
  };
  R.explode = function (b) {
    this.hitCircle(b.x, b.y, b.boom, b.a, b.mult || 1);
    const s = b.a.s;
    if (s.napalm) this.puddle(b.a, 'fire', b.x, b.y, b.boom * 0.8, 2.5, 0.12, false, 0.1); // Napalm: the ground burns
    if (s.bouncing && !b.bounced) { const tg = this.nearest(b.x, b.y, 120, b.hit); if (tg) { const an = Math.atan2(tg.y - b.y, tg.x - b.x), sp = s.speed; proj(this, { k: 'fireball', a: b.a, x: b.x, y: b.y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, ang: an, r: 5, pierce: 0, life: 1, boom: b.boom, bounced: true, mult: 0.7, hit: new Set(b.hit) }); } } // Bouncing
    for (let i = 0; i < 10; i++) { const an = Math.random() * TAU, sp = U.rand(40, 120); this.gpart({ x: b.x, y: b.y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - 30, g: 80, life: U.rand(0.4, 0.8), max: 0.8, c: '#ff8a30', r: 1.1, core: '#fff0a0' }); }
    this.fx.push({ k: 'explosion', x: b.x, y: b.y, R: b.boom, life: 0.35, max: 0.35 });
    this.burst(b.x, b.y, 12, ['#ff6a1a', '#ffd35a', '#fff0a0', '#7c1624'], 90);
    this.shake = Math.max(this.shake, 1.5);
    DH.audio.play('boom');
  };
  R.updateZones = function (dt) {
    const p = this.player;
    for (let i = this.zones.length - 1; i >= 0; i--) {
      const z = this.zones[i]; z.life -= dt;
      if (z.kind === 'pool') {
        const s = z.a.s;
        if (s.miasma) { const tg = this.nearest(z.x, z.y, 120); if (tg) { const dx = tg.x - z.x, dy = tg.y - z.y, d = Math.hypot(dx, dy) || 1; if (d > 4) { z.x += dx / d * 25 * dt; z.y += dy / d * 25 * dt; } } } // Miasma: the cloud creeps after foes
        z.tick -= dt;
        if (z.tick <= 0) { z.tick = 0.33; this.hitCircle(z.x, z.y, z.r, z.a, 1, s.contagion ? (e) => { e.plagued = this.time; } : null); } // Contagion marks who stands in it
        if (Math.random() < dt * 12) this.parts.push({ x: z.x + U.rand(-z.r, z.r) * 0.8, y: z.y + U.rand(-z.r, z.r) * 0.5, vx: 0, vy: -12, life: 0.6, max: 0.6, c: '#9adf50', s: 1 });
      } else if (z.kind === 'brew') { // the Alchemist's puddle: its element keeps working on whoever stands in it
        z.tick -= dt;
        if (z.tick <= 0) { z.tick = 0.5; this.hitCircle(z.x, z.y, z.r, z.a, z.mult || 0.35); if (z.slow) { this.grid.query(z.x, z.y, z.r, tmp); for (const e of tmp) if (!e.dead && !e.boss && U.dist2(z.x, z.y, e.x, e.y) < z.r * z.r) this.addSlow(e, 2); } }
        if (Math.random() < dt * 10) this.parts.push({ x: z.x + U.rand(-z.r, z.r) * 0.8, y: z.y + U.rand(-z.r, z.r) * 0.5, vx: 0, vy: z.el === 'ice' ? -4 : -14, life: 0.6, max: 0.6, c: z.col, s: 1 });
      } else if (z.kind === 'mosh') {
        const bi = Math.floor(this.beatPos());
        if (bi !== z.beat) {
          z.beat = bi; z.flash = 1;
          this.grid.query(z.x, z.y, z.r, tmp);
          for (const e of tmp.slice()) if (!e.dead && U.dist2(z.x, z.y, e.x, e.y) < z.r * z.r) { this.hit(e, z.a, 1); if (z.a.s.innermosh && !e.dead && U.dist2(z.x, z.y, e.x, e.y) < z.r * z.r * 0.25) this.hit(e, z.a, 0.6); } // Inner Moshpit: the heart of it strikes again
        }
        // the brawl drags everyone nearby into the circle
        this.grid.query(z.x, z.y, z.r * 1.6, tmp);
        for (const e of tmp) if (!e.dead && !e.boss) { const dx = z.x - e.x, dy = z.y - e.y, d = Math.hypot(dx, dy) || 1; if (d < z.r * 1.6 && d > 6) { const k = 90 / Math.sqrt(e.mass) * dt; e.x += dx / d * k; e.y += dy / d * k; } }
        z.flash = Math.max(0, (z.flash || 0) - dt * 4);
      } else if (z.kind === 'thorns') {
        const s = z.a.s, age = 1 - z.life / z.max;
        if (s.crown) z.r = z.r0 * (1 + 0.6 * age); // Crown of Thorns: the brambles spread as they grow
        z.tick -= dt;
        if (z.tick <= 0) { z.tick = 0.4; this.hitCircle(z.x, z.y, z.r, z.a, s.strong ? 1 + age : 1); } // Strong Growth: harder with age
        if (s.flyingthorns && z.life <= 0 && !z.flung) { z.flung = true; for (let i = 0; i < 8; i++) { const an = i / 8 * TAU; proj(this, { k: 'thorn', a: z.a, x: z.x, y: z.y, vx: Math.cos(an) * 220, vy: Math.sin(an) * 220, ang: an, r: 3, pierce: 1, life: 0.6, mult: 0.6 }); } } // Flying Thorns
        this.grid.query(z.x, z.y, z.r, tmp);
        for (const e of tmp) if (!e.dead && !e.boss && U.dist2(z.x, z.y, e.x, e.y) < z.r * z.r && (e.slowS || 0) < 8) this.addSlow(e, 8 - (e.slowS || 0)); // rooted in brambles
      } else if (z.kind === 'rift') {
        if (z.a.s.wandering) { // Wandering Rifts: drift toward you, burst on the first foe they touch
          const dx = p.x - z.x, dy = p.y - z.y, d = Math.hypot(dx, dy) || 1, sp = 18 + this.P.speed * 0.25; z.x += dx / d * sp * dt; z.y += dy / d * sp * dt;
          this.grid.query(z.x, z.y, 12, tmp); if (tmp.some((e) => !e.dead && !e.def.prop && U.dist2(e.x, e.y, z.x, z.y) < (10 + e.r) * (10 + e.r))) this.detonateRift(z, 1);
        }
        if (z.gone) { /* burst above */ } else if (U.dist2(z.x, z.y, p.x, p.y) < 14 * 14) this.detonateRift(z, 2); // touched: the stronger blast
        else if (z.life <= 0) this.detonateRift(z, 1); // left alone, it bursts by itself when its time is up
      }
      if (z.life <= 0 || z.gone) this.zones.splice(i, 1);
    }
  };
  R.detonateRift = function (z, mult) {
    if (z.gone) return; z.gone = true;
    const R = 38 * z.a.s.area * (mult > 1 ? 1.15 : 1);
    this.hitCircle(z.x, z.y, R, z.a, mult || 1);
    if (z.a.s.riftsplinters) { const sub = this.subAb(z.a, 'riftshard', ['magic', 'projectile']); for (let i = 0; i < 6; i++) { const an = i / 6 * TAU + Math.random() * 0.5; proj(this, { k: 'shard', a: sub, x: z.x, y: z.y, vx: Math.cos(an) * 200, vy: Math.sin(an) * 200, ang: an, r: 3.2, pierce: 999, life: 1.4, max: 1.4, drag: 3, decay: 0.4, cdHit: 0.45, mult: 0.3 }); } } // Rift Splinters
    this.fx.push({ k: 'pop', x: z.x, y: z.y, R, life: 0.35, max: 0.35, color: '#c070ff' });
    this.burst(z.x, z.y, 14, ['#c070ff', '#ffffff', '#40106a'], 90);
    DH.audio.play('boom');
    if (z.a.s.chainRift) for (const o of this.zones) if (o.kind === 'rift' && !o.gone && o !== z && U.dist2(o.x, o.y, z.x, z.y) < 90 * 90) this.after(0.15, () => this.detonateRift(o, 1));
  };
})(window.DH);
