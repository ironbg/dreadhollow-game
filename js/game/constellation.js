/* The Constellation's Specialties in a fight (mixed into DH.Run.prototype). this.cs = { fury, bastion, plunder }:
 * how many of each branch's five are unlocked (E.CONST.specials, meta.consSpecials).
 *   Fury     1 a Wrath Star falls on the toughest foe near the hero every 15 s, for 10x the weapon's base damage
 *            2 it bursts, hitting the foes around for 35% of that
 *            3 up to twice the damage on a wounded foe (by the health it has lost)
 *            4 every 8 s instead
 *            5 it leaves 3 stacks each of Burn, Spark and Frost
 *   Bastion  1 every 10 s a pulse round the hero for 3x the weapon's base damage, throwing the horde back
 *            2 for 4 s after it you take 15% less damage (run.js hurtPlayer)
 *            3 and have +20 Defense (run.js hurtPlayer)
 *            4 the pulse heals 4% of your health
 *            5 +2% pulse damage per point of Defense
 *   Plunder  1 +20% Essence in the Pit, 3 one more Pit entry a day (meta.js); 2 elites drop a purse (run.js),
 *            4 metals now and then come in twos (run.js), 5 the Gilded Ooze twice as often (run.js) */
(function (DH) {
  'use strict';
  const U = DH.util, C = DH.content;
  const R = DH.Run.prototype;
  const TAU = Math.PI * 2;
  C.CONS_FX = {
    star: { every: 15, fast: 8, mult: 10, reach: 220, R: 42, splash: 0.35, exec: 1, stacks: 3 },
    pulse: { every: 10, mult: 3, R: 72, heal: 0.04, perDef: 0.02 },
    ward: { secs: 4, cut: 0.15, def: 0.2 },
    pouch: { n: 6, v: 4 }, metal: 0.3,
  };
  /** The weapon's base damage, with the hero's damage bonus: what the Specialties scale with. */
  R.consBase = function () { const w = this.abilities[0]; return w && w.s ? (w.s.dmg + this.P.addBase) * (1 + this.P.dmgPct) : 10; };

  R.updateCons = function (dt) {
    const cs = this.cs; if (!cs) return;
    if (cs.fury >= 1) this.consStar(dt);
    if (cs.bastion >= 1) this.consPulse(dt);
  };

  R.consStar = function (dt) {
    const F = C.CONS_FX.star, cs = this.cs, p = this.player;
    this.starT = (this.starT == null ? 4 : this.starT) - dt;
    if (this.starT > 0) return;
    let best = null;
    for (const e of this.enemies) if (!e.dead && !e.def.prop && !e.sealed && U.dist2(e.x, e.y, p.x, p.y) < F.reach * F.reach && (!best || e.hp > best.hp)) best = e;
    if (!best) { this.starT = 0.5; return; }
    this.starT = cs.fury >= 4 ? F.fast : F.every;
    const base = this.consBase(), x = best.x, y = best.y;
    const exec = cs.fury >= 3 ? 1 + F.exec * Math.max(0, 1 - best.hp / best.maxHp) : 1;
    const dmg = base * F.mult * exec;
    this.fx.push({ k: 'starfall', x, y, life: 0.5, max: 0.5 });
    this.burst(x, y, 18, ['#fff4c0', '#ffb040', '#ff5030'], 90); DH.audio.play('boom'); this.shake = Math.max(this.shake, 3);
    this.rawDamage(best, dmg, '#ffcf60', 'cons');
    if (cs.fury >= 5 && !best.dead) { this.addBurn(best, F.stacks, base); this.addSpark(best, F.stacks, base); this.addFrost(best, F.stacks, base); }
    if (best.hp <= 0 && !best.dead) this.killEnemy(best);
    if (cs.fury >= 2) { // the burst round it
      this.fx.push({ k: 'explosion', x, y, R: F.R, life: 0.4, max: 0.4 });
      for (const e of this.enemies) if (e !== best && !e.dead && !e.def.prop && U.dist2(e.x, e.y, x, y) < F.R * F.R) { this.rawDamage(e, dmg * F.splash, '#ffcf60', 'cons'); if (e.hp <= 0 && !e.dead) this.killEnemy(e); }
    }
  };

  R.consPulse = function (dt) {
    const Q = C.CONS_FX.pulse, cs = this.cs, p = this.player;
    this.pulseT = (this.pulseT == null ? 6 : this.pulseT) - dt;
    if (this.pulseT > 0) return;
    this.pulseT = Q.every;
    const dmg = this.consBase() * Q.mult * (cs.bastion >= 5 ? 1 + Q.perDef * this.P.defense * 100 : 1);
    this.fx.push({ k: 'ring', x: p.x, y: p.y, life: 0.5, max: 0.5, r0: 8, r1: Q.R, color: '#7cf090' });
    DH.audio.play('block'); this.shake = Math.max(this.shake, 2);
    for (const e of this.enemies) {
      if (e.dead || e.def.prop || U.dist2(e.x, e.y, p.x, p.y) >= Q.R * Q.R) continue;
      this.rawDamage(e, dmg, '#9cf0a8', 'cons');
      const d = Math.hypot(e.x - p.x, e.y - p.y) || 1; e.kx += (e.x - p.x) / d * 160 / Math.sqrt(e.mass); e.ky += (e.y - p.y) / d * 160 / Math.sqrt(e.mass);
      if (e.hp <= 0 && !e.dead) this.killEnemy(e);
    }
    if (cs.bastion >= 2) this.consWard = this.time + C.CONS_FX.ward.secs;
    if (cs.bastion >= 4) this.heal(this.P.maxHp * Q.heal);
  };
})(window.DH);
