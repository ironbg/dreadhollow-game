/* Items that act on their own during a run (mixed into DH.Run.prototype): emitters that fire as the hero walks or on a
 * clock, summons, and hooks on hits, kills, slows and blows taken. Their strengths are the gear specials named it_<key>
 * (E.gear[...].special, scaled by rarity), gathered on this.P.it by the stat recompute. */
(function (DH) {
  'use strict';
  const U = DH.util, E = DH.economy;
  const R = DH.Run.prototype;
  const TAU = Math.PI * 2;
  const tmp = [];
  const TAGS = { firewalk: ['fire', 'area'], stormstep: ['lightning', 'area'], spikes: ['physical', 'area'], goo: ['physical', 'area'], shadow: ['magic', 'area'],
    thunder: ['lightning', 'area'], gorgon: ['magic', 'area'], skel: ['physical', 'summon', 'melee'], rat: ['physical', 'summon', 'melee'], beast: ['ice', 'summon', 'melee'],
    tcrown: ['lightning', 'magic'] };

  /** A strike of an item: an ability-shaped object (so hits, crits and effects work) whose base damage grows with the
   *  hall and the clock, as the foes do. Its id is 'item', so its hits never set off other items. */
  R.itemAb = function (key, base, eff) {
    this.itemAbs = this.itemAbs || {};
    let a = this.itemAbs[key];
    if (!a) a = this.itemAbs[key] = { id: 'item', item: key, tags: TAGS[key] || ['physical'], s: { dmg: 0, dmgPct: 0, cd: 1, area: 1, count: 1, knock: 20, crit: 0.05, ms: 0, speed: 80, burn: 0, spark: 0, frost: 0, decay: 0, fragile: 0, affliction: 0, stun: 0 } };
    a.s.dmg = base * this.itemScale();
    if (eff) Object.assign(a.s, eff);
    return a;
  };
  R.itemScale = function () { return Math.pow(this.stage.hpMult || 1, 0.85) * (1 + (this.time || 0) / 60 * 0.18); };

  /** The walking items fire every `step` world units walked. */
  R.walked = function (key, step) { const w = (this.walkAcc[key] || 0) + this.stepLen; if (w >= step) { this.walkAcc[key] = w - step; return true; } this.walkAcc[key] = w; return false; };
  R.every = function (key, period, dt) { const t = (this.itemT[key] == null ? period * 0.5 : this.itemT[key]) - dt; if (t <= 0) { this.itemT[key] = period; return true; } this.itemT[key] = t; return false; };
  /** Living foes within R0 of the hero (a new array). */
  R.itemNear = function (R0) {
    const p = this.player; this.grid.query(p.x, p.y, R0, tmp);
    return tmp.filter((e) => !e.dead && !e.def.prop && !e.under && U.dist2(e.x, e.y, p.x, p.y) < R0 * R0);
  };

  R.updateItems = function (dt) {
    const I = this.P.it, p = this.player;
    if (!this.walkAcc) { this.walkAcc = {}; this.itemT = {}; this.lastPos = { x: p.x, y: p.y }; this.madness = 0; this.windCharges = 0; this.tearT = 0; this.itemPctCache = 0; }
    this.stepLen = Math.hypot(p.x - this.lastPos.x, p.y - this.lastPos.y); this.lastPos.x = p.x; this.lastPos.y = p.y;
    if (this.stepLen > 60) this.stepLen = 0; // a teleport, not a step
    const pr = this.P.pickupR;
    // ---- walking emitters ----
    if (I.firewalk && this.walked('fire', 30)) this.puddle(this.itemAb('firewalk', I.firewalk), 'fire', p.x, p.y + 3, 14, 2.5, 1, false, 0.1); // Cinder Treads
    if (I.stormstep && this.walked('storm', 45)) { this.hitCircle(p.x, p.y, 40, this.itemAb('stormstep', I.stormstep, { spark: 0.3 })); this.fx.push({ k: 'pulse', x: p.x, y: p.y, R: 40, life: 0.3, max: 0.3, color: '#fff080' }); } // Storm Treads
    if (I.goo && this.walked('goo', 35)) this.puddle(this.itemAb('goo', 1), 'earth', p.x, p.y + 3, 16, I.goo, 0.05, true, 0); // Mire Boots: goo that slows
    // ---- on a clock ----
    if (I.shadow) {
      if (this.every('shadow', 2, dt)) this.puddle(this.itemAb('shadow', I.shadow), 'magic', p.x, p.y + 2, 24, 3, 0.6, false, 0); // Shadow Cloak
      this.inShadow = this.zones.some((z) => z.kind === 'brew' && z.el === 'magic' && z.a.id === 'item' && U.dist2(z.x, z.y, p.x, p.y) < z.r * z.r);
    }
    if (I.warcry && this.every('warcry', 3, dt)) { // War Horn: a cry that leaves the foes about you Fragile
      for (const e of this.itemNear(60)) { const n = this.stacks(I.warcry); if (n) e.st.fragile += n; }
      this.fx.push({ k: 'ring', x: p.x, y: p.y, life: 0.4, max: 0.4, r0: 8, r1: 60, color: '#ffb070' }); DH.audio.play('roar');
    }
    if (I.thunder && this.every('thunder', 2, dt)) { // Thunder Mantle: the strongest foe in reach is struck, a shockwave round it
      let tg = null; for (const e of this.itemNear(pr * 1.4)) if (!tg || e.hp > tg.hp) tg = e;
      if (tg) {
        this.hitCircle(tg.x, tg.y, 26, this.itemAb('thunder', I.thunder, { spark: 1 }));
        this.fx.push({ k: 'chain', pts: [[p.x, p.y - 8], [tg.x, tg.y]], life: 0.2, max: 0.2, seed: Math.random() * 999, color: '#fff080' }, { k: 'pulse', x: tg.x, y: tg.y, R: 26, life: 0.3, max: 0.3, color: '#fff080' });
        DH.audio.play('zap');
      }
    }
    if (I.gorgon && this.every('gorgon', 1, dt)) { // Gorgon Mask: the gaze in front of you slows, and wounds the slowed the more
      const ab = this.itemAb('gorgon', I.gorgon), f = Math.atan2(p.dirY, p.dirX);
      for (const e of this.itemNear(64)) { let d = Math.atan2(e.y - p.y, e.x - p.x) - f; d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d) < 0.7) { this.addSlow(e, 3); this.hit(e, ab, Math.min(4, (e.slowS || 0) / 3)); } }
      this.fx.push({ k: 'slash', x: p.x, y: p.y, ang: f, R: 60, arc: 1.4, life: 0.25, max: 0.25, color: '#9aff9a' });
    }
    if (I.frostaura && this.every('frost', 1, dt)) { const b = 30 * this.itemScale(); for (const e of this.itemNear(pr)) if (Math.random() < I.frostaura) this.addFrost(e, 1, b); } // Frost Greaves
    if (I.broker && this.every('broker', 1, dt)) for (const e of this.itemNear(45)) if (Math.random() < I.broker) { const k = U.randi(0, 2); if (k === 0) e.st.fragile++; else if (k === 1) e.st.affl++; else this.addSlow(e, 3); } // Broker's Cape
    // ---- summons ----
    if (I.skeletons) this.keepItemAllies('skel', E.itemCount('it_skeletons', I.skeletons), 14, { speed: 85, cd: 0.9 });
    if (I.rats) this.keepItemAllies('rat', E.itemCount('it_rats', I.rats), 7, { speed: 120, cd: 0.6, fragile: 0.5, affliction: 0.5 });
    if (I.beast) this.keepItemAllies('beast', 1, I.beast, { speed: 70, cd: 1.3, frost: 0.6, knock: 80 });
    const want = { skel: I.skeletons ? E.itemCount('it_skeletons', I.skeletons) : 0, rat: I.rats ? E.itemCount('it_rats', I.rats) : 0, beast: I.beast ? 1 : 0 };
    for (let i = this.allies.length - 1; i >= 0; i--) { const al = this.allies[i]; if (al.item && --want[al.kind] < 0) this.allies.splice(i, 1); } // an item taken off takes its summons
    // ---- states that change the numbers ----
    if (I.pace) { // Pace Setter: at full health strike faster, wounded run faster; standing still mends
      if (!p.moving) { this.paceT = (this.paceT || 0) + dt; if (this.paceT >= 5) { this.paceT = 0; this.heal(this.P.maxHp * I.pace / 6); } } else this.paceT = 0;
      const st = p.hp >= this.P.maxHp - 0.5 ? 'full' : 'hurt';
      if (st !== this.paceState) { this.paceState = st; this.recompute(); }
    }
    if (I.wind) { // Wind Crown: kills gather charges of attack speed that blow away
      this.windCharges *= Math.pow(0.67, dt);
      if (this.every('windRe', 0.5, dt) && Math.abs(this.windCharges - (this.windApplied || 0)) >= 1) { this.windApplied = Math.floor(this.windCharges); this.recompute(); }
    }
    if (I.madness && this.every('madness', 30, dt)) { // Mask of Madness: it bites, and every bite makes you stronger
      this.madness++; const d = Math.min(p.hp - 1, this.P.maxHp * 0.05);
      if (d > 0) { p.hp -= d; this.hurtFlash = 0.5; this.text(p.x, p.y - 12, '-' + Math.round(d), '#c060ff'); }
      this.text(p.x, p.y - 22, t('hud.madness'), '#c060ff', true);
    }
    if (I.tear && !this.tearReady) { this.tearT += dt; if (this.tearT >= E.itemCount('it_tear', I.tear)) { this.tearT = 0; this.tearReady = true; } } // Maiden's Tear gathers
    if (this.every('itemPct', 0.5, dt)) this.itemPctCache = this.itemPctSlow();
  };

  /** Summons of items, kept at their number while the item is worn. */
  R.keepItemAllies = function (kind, n, base, s) {
    const a = this.itemAb(kind, base, s), p = this.player;
    let have = 0; for (const al of this.allies) if (al.kind === kind) have++;
    while (have < n) { this.allies.push({ kind, a, x: p.x + U.rand(-14, 14), y: p.y + U.rand(-14, 14), t: 0, life: Infinity, face: 1, item: true }); have++; }
  };

  /** Damage bonuses that change slowly (foes about, life missing, grown charges), refreshed twice a second. */
  R.itemPctSlow = function () {
    const I = this.P.it, p = this.player; let pct = 0;
    if (I.collar) pct += I.collar * Math.min(1, this.itemNear(this.P.pickupR).length / 30); // Collar of Confidence
    if (I.scars) pct += I.scars * Math.max(0, 1 - p.hp / this.P.maxHp); // Scars of Toil
    if (I.madness) pct += I.madness * this.madness; // Mask of Madness
    if (I.visor) pct += I.visor * (1 - Math.exp(-(this.dmgTotal || 0) / (4e5 * (this.stage.hpMult || 1)))); // War Chief's Visor
    if (I.bloodshirt) pct += I.bloodshirt * (1 - Math.exp(-this.kills / 800)); // Blood-Soaked Shirt
    return pct;
  };
  /** Extra damage from items on a hit by ability `a` (added to its damage %). */
  R.itemPct = function (a) {
    const I = this.P.it; if (a.id === 'item') return 0;
    let pct = this.itemPctCache || 0;
    if (I.spell && !a.weapon) pct += I.spell; // Spellcaster's Gloves
    return pct;
  };
  /** After a hit by ability `a` landed for `d`. */
  R.itemsOnHit = function (e, a, d) {
    const I = this.P.it; if (a.id === 'item') return;
    this.dmgTotal = (this.dmgTotal || 0) + d;
    const tags = a.tags;
    if (I.frostthorn && a.weapon && e.st.frost > 0 && Math.random() < 0.1) this.rawDamage(e, I.frostthorn * e.st.frost * this.itemScale(), '#a8e8ff', 'item'); // Frost Thorns
    if (I.tcrown && tags.includes('magic') && e.st.spark > 0 && (this.tcrT || 0) <= this.time && Math.random() < 0.25) { // Thunder Crown: lightning leaps from a sparking foe
      this.tcrT = this.time + 0.5; const ab = this.itemAb('tcrown', I.tcrown, { spark: 0.3 }); let cur = e; const ex = new Set([e]), pts = [[e.x, e.y]];
      for (let i = 0; i < 3; i++) { const o = this.nearest(cur.x, cur.y, 70, ex); if (!o) break; ex.add(o); pts.push([o.x, o.y]); this.hit(o, ab, 1); cur = o; }
      if (pts.length > 1) this.fx.push({ k: 'chain', pts, life: 0.2, max: 0.2, seed: Math.random() * 999, color: '#fff080' });
    }
    if (I.echoring && tags.includes('physical') && (this.echoT || 0) <= this.time && Math.random() < I.echoring) { // Echoing Band: the blow rings out round the foe
      this.echoT = this.time + 0.1; this.grid.query(e.x, e.y, 30, tmp);
      for (const o of tmp.slice()) if (o !== e && !o.dead && !o.def.prop && U.dist2(o.x, o.y, e.x, e.y) < 900) this.rawDamage(o, d * 0.4, null, 'item');
      this.fx.push({ k: 'pop', x: e.x, y: e.y, R: 30, life: 0.25, max: 0.25, color: '#e8dcc0' });
    }
    if (I.unholy && tags.includes('melee')) { const n = this.stacks(I.unholy); if (n) e.st.fragile += n; } // Unholy Touch
    if (I.leech && a.weapon && e.st.decay > 0 && Math.random() < 0.25) { const take = Math.max(1, Math.floor(e.st.decay * 0.1)); e.st.decay -= take; this.heal(I.leech * take, true); } // Leeching Fingers
  };
  R.itemsOnKill = function () {
    const I = this.P.it;
    if (I.wind) this.windCharges = Math.min(200, (this.windCharges || 0) + 1); // Wind Crown
    if (I.bloodshirt && Math.random() < 0.05) this.heal(1, true); // Blood-Soaked Shirt
  };
  /** Before a blow lands on the hero: true when an item takes it. */
  R.itemsOnHurt = function () {
    const I = this.P.it, p = this.player;
    if (I.spikes && (this.spikeT || 0) <= this.time) { // Spiked Boots: spikes burst from the ground round you (at most once a second)
      this.spikeT = this.time + 1;
      const ab = this.itemAb('spikes', I.spikes, { stun: 0.5 });
      for (let i = 0; i < 6; i++) { const an = i / 6 * TAU, x = p.x + Math.cos(an) * 24, y = p.y + Math.sin(an) * 24 * 0.8; this.hitCircle(x, y, 11, ab); this.fx.push({ k: 'spike', x, y, R: 9, life: 0.45, max: 0.45, steel: true }); }
    }
    if (I.tear && this.tearReady) { this.tearReady = false; p.inv = 0.4; this.text(p.x, p.y - 14, t('hud.tear'), '#a8e8ff'); DH.audio.play('block'); return true; } // Maiden's Tear
    return false;
  };
  R.itemsOnSlow = function (e) { // Blighted Ring: a slowed foe may rot
    if (Math.random() < this.P.it.blight) { e.st.decay = (e.st.decay || 0) + 1; e.st.decayPS = Math.max(e.st.decayPS || 0, 8 * this.itemScale()); }
  };
  R.itemsOnPotion = function () { // Warrior's Fervor: a potion puts fury and haste in you
    const I = this.P.it; if (!I.fervor) return;
    const fresh = !(this.buffs.fury > 0 && this.buffs.haste > 0);
    this.buffs.fury = Math.max(this.buffs.fury || 0, I.fervor); this.buffs.haste = Math.max(this.buffs.haste || 0, I.fervor);
    this.fx.push({ k: 'ring', x: this.player.x, y: this.player.y, life: 0.5, max: 0.5, r0: 6, r1: 40, color: '#ff7040' });
    if (fresh) this.recompute();
  };
  /** Stat changes of items that follow a state, applied by the recompute before the stats are built. */
  R.itemStats = function (st, I) {
    if (I.pace) { if (this.paceState === 'full') st.as = (st.as || 0) + I.pace; else if (this.paceState === 'hurt') st.speedPct = (st.speedPct || 0) + I.pace; } // Pace Setter
    if (I.wind && this.windApplied) st.as = (st.as || 0) + I.wind * this.windApplied; // Wind Crown
    if (I.seal) st.revives = (st.revives || 0) + E.itemCount('it_seal', I.seal); // Seal of Rebirth
  };
})(window.DH);
