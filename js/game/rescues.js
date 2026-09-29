/* The keepers of the camp, lost in the halls (mixed into DH.Run.prototype). Until one is rescued, the camp lacks what
 * they keep (C.RESCUE_OPENS); an old hand who used it before has them already (DH.meta.npcFreed).
 *   abyss      the Wellkeeper sits in a cage; its key lies elsewhere in the hall. Bring it back and open the cage.
 *   aqueduct   the Cupbearer is stranded by the water: a drowned thief ran off with his flask. Slay it, bring the flask back.
 *   catacombs  the Scriptor is frozen in a block of ice. It thaws while you stand by it, and far faster while foes
 *              burn around it.
 * A rescued keeper leaves for the camp; the run's summary carries `rescued` and the settlement frees them for good. */
(function (DH) {
  'use strict';
  const U = DH.util, C = DH.content;
  const R = DH.Run.prototype;
  const TAU = Math.PI * 2;
  const Q = { dist: [650, 950], itemDist: [420, 620], touch: 20, notice: 110, thaw: 25, burnThaw: 0.03, burnR: 70 };

  R.initRescue = function () {
    this.rescue = null; this.rescued = null;
    this.wellOpen = DH.meta.npcFreed('wellkeeper');
    const npc = C.RESCUE[this.stageId];
    if (!npc || DH.meta.npcFreed(npc)) return;
    const a = Math.random() * TAU, d = U.rand(Q.dist[0], Q.dist[1]);
    const at = this.lmFree(this.secPoint({ x: 0, y: 0 }, a, d), 30);
    this.rescue = { npc, x: at.x, y: at.y, step: 'find', item: null, thaw: 0, left: 0, dir: a };
  };

  R.rescueSay = function (key) { DH.events.emit('run:warning', t('resc.' + this.rescue.npc + '.' + key)); };

  /** The keeper is free: a banner, and they leave for the camp. */
  R.rescueDone = function () {
    const Z = this.rescue; if (!Z || Z.step === 'free') return;
    Z.step = 'free'; Z.left = 0; this.rescued = Z.npc;
    if (Z.npc === 'wellkeeper') { this.wellOpen = true; this.wellT = Math.min(this.wellT || 30, 20); }
    this.whiteFlash = 0.4; DH.audio.play('reward');
    this.burst(Z.x, Z.y - 10, 40, ['#ffe070', '#ffffff', '#80d0ff'], 100);
    DH.events.emit('run:boss', { name: t('npc.' + Z.npc), final: false, hex: true, sub: t('resc.freed.' + Z.npc) });
  };

  /** A kill: the Cupbearer's thief drops the flask. */
  R.rescueKill = function (e) {
    const Z = this.rescue; if (!Z || !e.rescueThief || Z.step !== 'thief') return;
    Z.item = { x: e.x, y: e.y, kind: 'flask' }; Z.step = 'item';
    this.rescueSay('dropped');
  };

  R.updateRescue = function (dt) {
    const Z = this.rescue; if (!Z || this.state !== 'playing') return;
    const p = this.player, near = (o, r) => U.dist2(o.x, o.y, p.x, p.y) < r * r;
    if (Z.step === 'free') { Z.left += dt; return; }
    if (Z.step === 'find' && near(Z, Q.notice)) { // found: the keeper says what they need
      DH.audio.play('page');
      if (Z.npc === 'scriptor') { Z.step = 'thaw'; this.rescueSay('found'); }
      else if (Z.npc === 'wellkeeper') { const q = this.lmFree(this.secPoint(Z, Z.dir + U.rand(-1.4, 1.4), U.rand(Q.itemDist[0], Q.itemDist[1])), 16); Z.item = { x: q.x, y: q.y, kind: 'key' }; Z.step = 'item'; this.rescueSay('found'); }
      else { // the thief: a drowned Elite that keeps its ground far off
        const q = this.lmFree(this.secPoint(Z, Z.dir + U.rand(-1.4, 1.4), U.rand(Q.itemDist[0], Q.itemDist[1])), 16);
        const e = this.spawnEnemy(C.enemies.drowned ? 'drowned' : 'ghoul', q.x, q.y, { elite: true });
        if (e) { e.keep = true; e.rescueThief = true; Z.thief = e; Z.step = 'thief'; } else { Z.item = { x: q.x, y: q.y, kind: 'flask' }; Z.step = 'item'; }
        this.rescueSay('found');
      }
    } else if (Z.step === 'thief' && Z.thief && Z.thief.dead && !Z.item) { Z.item = { x: Z.thief.x, y: Z.thief.y, kind: 'flask' }; Z.step = 'item'; this.rescueSay('dropped'); }
    else if (Z.step === 'item' && near(Z.item, Q.touch)) { Z.item.taken = true; Z.step = 'return'; DH.audio.play('reward'); this.burst(Z.item.x, Z.item.y, 14, ['#ffe070', '#ffffff'], 60); this.rescueSay('got'); }
    else if (Z.step === 'return' && near(Z, Q.touch + 10)) this.rescueDone();
    else if (Z.step === 'thaw') {
      let burning = 0; this.grid.query(Z.x, Z.y, Q.burnR, this._rq || (this._rq = []));
      for (const e of this._rq) if (!e.dead && e.st && e.st.burn > 0 && U.dist2(e.x, e.y, Z.x, Z.y) < Q.burnR * Q.burnR) burning++;
      const rate = (near(Z, 36) ? 1 / Q.thaw : 0) + Q.burnThaw * Math.min(10, burning);
      Z.thaw = Math.min(1, Z.thaw + rate * dt);
      if (rate > 0 && Math.random() < dt * 8) this.parts.push({ x: Z.x + U.rand(-8, 8), y: Z.y - U.rand(4, 18), vx: 0, vy: 10, life: 0.5, max: 0.5, c: '#bfe8ff', s: 1 }); // meltwater
      if (Z.thaw >= 1) { this.burst(Z.x, Z.y - 10, 30, ['#e8f8ff', '#9fdcff', '#ffffff'], 90); DH.audio.play('glass'); this.rescueDone(); }
    }
  };

  /** Drawn in the entity pass: the keeper (in the cage, by the water, in the ice), and what they need. */
  R.drawRescue = function (g, cx, cy, W, H, now, lights) {
    const Z = this.rescue; if (!Z) return;
    const P = DH.gfx.P, vis = (o, m) => o.x - cx > -m && o.y - cy > -m && o.x - cx < W + m && o.y - cy < H + m;
    if (Z.item && !Z.item.taken && vis(Z.item, 20)) {
      const x = Z.item.x - cx, y = Z.item.y - cy - 4 + Math.sin(now * 3) * 1.5;
      if (Z.item.kind === 'key') { // an old iron key
        g.save(); g.translate(x, y); g.rotate(-0.5);
        g.strokeStyle = '#1a1208'; g.lineWidth = 2.6; g.beginPath(); g.arc(-4, 0, 2.6, 0, TAU); g.moveTo(-1.4, 0); g.lineTo(6, 0); g.stroke();
        g.strokeStyle = '#e8c060'; g.lineWidth = 1.2; g.beginPath(); g.arc(-4, 0, 2.6, 0, TAU); g.moveTo(-1.4, 0); g.lineTo(6, 0); g.moveTo(4.4, 0); g.lineTo(4.4, 2.4); g.moveTo(6, 0); g.lineTo(6, 2.4); g.stroke();
        g.restore();
      } else this.sprite(g, 'potion', null, 0, x, y, false, 1);
      lights.push({ x: Z.item.x, y: Z.item.y, r: 34, kind: 'magic' });
    }
    if (!vis(Z, 40)) return;
    const fade = Z.step === 'free' ? Math.max(0, 1 - Math.max(0, Z.left - 2.5) / 1.5) : 1; // freed: they wave, then leave for the camp
    if (fade <= 0) return;
    const x = Z.x - cx, y = Z.y - cy;
    this.sprite(g, 'npc_' + Z.npc, null, Z.step === 'free' && Z.left < 2.5 ? Math.floor(now * 4) % 2 : 0, x, y, this.player.x < Z.x, 1, false, fade);
    if (Z.npc === 'wellkeeper' && Z.step !== 'free') { // the cage
      g.fillStyle = '#1a1614'; g.fillRect(x - 11, y - 25, 22, 2.4); g.fillRect(x - 11, y + 1, 22, 2.4);
      for (let i = 0; i < 6; i++) { const bx = x - 10 + i * 4; g.fillStyle = '#16120e'; g.fillRect(bx - 0.4, y - 24, 1.8, 26); g.fillStyle = '#6a625a'; g.fillRect(bx, y - 24, 0.8, 26); }
      g.fillStyle = '#c8a040'; g.fillRect(x + 8, y - 12, 3, 3); // the lock
    }
    if (Z.npc === 'cupbearer' && Z.step !== 'free') { P.ell(g, x, y + 2, 14, 4, 'rgba(60,110,140,0.55)'); P.ell(g, x - 3, y + 1.5, 6, 1.2, 'rgba(180,220,240,0.35)'); } // stranded on a plank over the water
    if (Z.npc === 'scriptor' && Z.step !== 'free') { // the ice, melting as it thaws
      const k = 1 - Z.thaw, top = y - 26 * (0.35 + 0.65 * k);
      g.save(); g.globalAlpha = 0.72;
      g.beginPath(); g.moveTo(x - 11, y + 2); g.lineTo(x - 12, top + 6); g.lineTo(x - 5, top); g.lineTo(x + 6, top + 2); g.lineTo(x + 12, top + 8); g.lineTo(x + 11, y + 2); g.closePath();
      g.fillStyle = P.lg(g, x - 12, top, x + 12, y, ['#f0fbff', '#9fd8f4', '#4a8ab8']); g.fill();
      g.globalAlpha = 1; g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x - 9, top + 8); g.lineTo(x - 6, top + 3); g.stroke();
      g.restore();
      if (Z.thaw > 0) { g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x - 12, y + 6, 24, 3); g.fillStyle = '#8ad8ff'; g.fillRect(x - 11.5, y + 6.5, 23 * Z.thaw, 2); }
      lights.push({ x: Z.x, y: Z.y - 10, r: 40, kind: 'frost' });
    } else lights.push({ x: Z.x, y: Z.y - 10, r: 44, kind: 'torch' });
  };

  /** Off-screen arrows: to the keeper, or to what they need. */
  R.rescueMarks = function (mark) {
    const Z = this.rescue; if (!Z || Z.step === 'free') return;
    if (Z.step === 'item' && Z.item) mark(Z.item.x, Z.item.y, '#ffe070', Z.item.kind === 'key' ? 'npc_wellkeeper' : 'potion');
    else if (Z.step === 'thief' && Z.thief && !Z.thief.dead) mark(Z.thief.x, Z.thief.y, '#ff5060', Z.thief.painter, Z.thief.variant);
    else if (Z.step !== 'find' || U.dist2(Z.x, Z.y, this.player.x, this.player.y) < 700 * 700) mark(Z.x, Z.y, '#8ad8ff', 'npc_' + Z.npc);
  };
})(window.DH);
