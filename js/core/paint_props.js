/* HD vector painters: pickups, props and projectiles. */
(function (DH) {
  'use strict';
  const G = DH.gfx, P = G.P, sh = G.shade;
  const def = (name, o) => { G.painters[name] = o; };

  function gem(g, cx, cy, r, col) {
    const pts = [cx, cy - r * 1.3, cx + r, cy - r * 0.2, cx + r * 0.55, cy + r * 1.1, cx - r * 0.55, cy + r * 1.1, cx - r, cy - r * 0.2];
    P.path(g, pts); P.fill(g, P.lg(g, cx - r, cy - r, cx + r, cy + r, [sh(col, 0.55), col, sh(col, -0.45)]));
    P.path(g, [cx, cy - r * 1.3, cx + r, cy - r * 0.2, cx, cy + 0.1 * r]); P.fill(g, G.rgba(sh(col, 0.7), 0.55));
    P.path(g, [cx - r, cy - r * 0.2, cx, cy + 0.1 * r, cx - r * 0.55, cy + r * 1.1]); P.fill(g, G.rgba(sh(col, -0.6), 0.35));
    P.circle(g, cx - r * 0.35, cy - r * 0.55, r * 0.22, 'rgba(255,255,255,0.9)');
  }
  const GEMS = { gem1: '#4aa8ff', gem10: '#ffd040', gem100: '#c060ff', gem1000: '#ffb020', cluster: '#e02838', clusterX: '#2a1a2a' };
  /** A faceted crystal standing upright at (x,y) (its foot), height h: a lit left face, a dark right face, a bright crown, a glint. */
  function crystal(g, x, y, h, col, lean) {
    const w = h * 0.46, top = y - h, tx = x + (lean || 0);
    P.path(g, [x - w, y - h * 0.3, tx - w, top + h * 0.34, tx, top, x, y]); P.fill(g, P.lg(g, x - w, top, x, y, [sh(col, 0.5), sh(col, 0.1)]));
    P.path(g, [x, y, tx, top, tx + w, top + h * 0.34, x + w, y - h * 0.3]); P.fill(g, P.lg(g, x, top, x + w, y, [sh(col, -0.25), sh(col, -0.7)]));
    P.path(g, [tx - w, top + h * 0.34, tx, top, tx, top + h * 0.5]); P.fill(g, sh(col, 0.75)); // the lit crown facet
    P.circle(g, tx - w * 0.35, top + h * 0.3, Math.max(0.25, h * 0.07), '#ffffff'); // a glint
  }
  Object.keys(GEMS).forEach((k) => {
    const big = k.startsWith('cluster');
    def(k, { w: big ? 10 : 6, h: big ? 10 : 7, draw(g) {
      if (big) { // three crystals grown out of a lump of dark rock
        const col = GEMS[k] === '#2a1a2a' ? '#8a2a6a' : GEMS[k];
        P.glow(g, 5, 5, 5, k === 'clusterX' ? '#ff2040' : col, 0.25);
        P.ell(g, 5, 8.6, 4, 1.4, P.lg(g, 1, 7.4, 9, 10, ['#5a5058', '#2a242a']));
        crystal(g, 3.2, 8.4, 4.6, col, -1); crystal(g, 7, 8.4, 4.2, sh(col, -0.1), 1); crystal(g, 5, 8.8, 6.6, sh(col, 0.1), 0);
        return;
      }
      const h = k === 'gem1' ? 4.8 : k === 'gem10' ? 5.4 : k === 'gem100' ? 5.9 : 6.4;
      P.glow(g, 3, 3.8, h * 0.7, GEMS[k], 0.25);
      crystal(g, 3, 6.6, h, GEMS[k], 0);
    } });
  });
  /** A gold coin face-on at (x,y), radius r: a raised rim, a skull stamped in it, a shine. */
  function coinFace(g, x, y, r) {
    P.circle(g, x, y, r, P.lg(g, x - r, y - r, x + r, y + r, ['#fff0a0', '#e0a020', '#8a5a10']));
    P.circle(g, x, y, r * 0.72, P.lg(g, x - r, y - r, x + r, y + r, ['#c88a18', '#f0c040']));
    P.circle(g, x, y - r * 0.08, r * 0.34, '#8a5a10'); P.rect(g, x - r * 0.2, y + r * 0.18, r * 0.4, r * 0.2, '#8a5a10'); // a stamped skull
    P.circle(g, x - r * 0.13, y - r * 0.1, r * 0.09, '#f0c040'); P.circle(g, x + r * 0.13, y - r * 0.1, r * 0.09, '#f0c040');
    P.ell(g, x - r * 0.45, y - r * 0.5, r * 0.28, r * 0.14, 'rgba(255,255,255,0.8)', -0.6);
  }
  def('coin', { w: 6, h: 6, draw(g) { coinFace(g, 3, 3, 2.7); } });
  def('potion', { w: 8, h: 10, draw(g) { // a round flask of blood-red draught: a cork under a wax seal, a label, a bubble rising
    P.glow(g, 4, 6.6, 4.4, '#ff3040', 0.4);
    P.rrect(g, 3.1, 1.6, 1.8, 1.8, 0.3, G.rgba('#d8e8ff', 0.7));
    P.rrect(g, 2.8, 0.3, 2.4, 1.5, 0.5, '#8a5a30'); P.ell(g, 4, 0.5, 1.4, 0.5, '#b82838'); // cork and wax
    P.circle(g, 4, 6.3, 3.3, G.rgba('#d8e8ff', 0.45));
    g.save(); g.beginPath(); g.arc(4, 6.3, 3.1, 0, Math.PI * 2); g.clip(); P.rect(g, 0, 4.8, 8, 5, P.lg(g, 0, 4.8, 0, 9.6, ['#ff6070', '#c01828', '#5a0810'])); P.ell(g, 4, 4.9, 3.2, 0.5, '#ff8a90'); g.restore();
    P.rrect(g, 2.4, 6, 3.2, 1.6, 0.3, '#e8dcb8'); P.line(g, 2.9, 6.8, 5.1, 6.8, 0.25, '#6a4a2a'); // a label
    P.circle(g, 5.2, 8.4, 0.35, 'rgba(255,200,200,0.8)'); P.ell(g, 2.4, 4.6, 0.6, 1.3, 'rgba(255,255,255,0.8)', 0.4);
  } });
  def('magnet', { w: 9, h: 9, draw(g) { // a horseshoe of dark iron, its arms painted red, bright steel poles, a hum of blue sparks
    g.lineCap = 'butt'; g.beginPath(); g.arc(4.5, 4.4, 2.8, Math.PI, 0, true); g.strokeStyle = P.lg(g, 1, 0, 8, 0, ['#a01828', '#ff5a60', '#a01828']); g.lineWidth = 2.1; g.stroke();
    g.beginPath(); g.arc(4.5, 4.4, 3.8, Math.PI * 1.1, Math.PI * 1.9, true); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 0.35; g.stroke();
    for (const x of [0.7, 6.2]) { P.rect(g, x, 1.4, 2.1, 3, P.lg(g, x, 0, x + 2.1, 0, ['#e02838', '#801018'])); P.rect(g, x, 0.2, 2.1, 1.3, P.lg(g, x, 0, x + 2.1, 0, ['#ffffff', '#9aa4b4'])); }
    for (const [x, y] of [[4.5, 0.6], [3.4, 1.2], [5.6, 1.1]]) P.circle(g, x, y, 0.3, '#8ad8ff'); P.glow(g, 4.5, 1, 2.2, '#6ac8ff', 0.5);
  } });
  def('bomb', { w: 9, h: 10, draw(g) { // an iron bomb: a riveted band, a skull daubed on it, a fuse spitting sparks
    P.circle(g, 4.5, 6.2, 3.4, P.vol(g, 3.8, 5.2, 3.6, '#4a4450'));
    P.line(g, 1.2, 6.8, 7.8, 6.4, 0.7, '#6a6470'); for (const x of [2, 4.4, 6.8]) P.circle(g, x, 6.6, 0.3, '#9a94a0');
    P.circle(g, 4.6, 5, 0.9, '#d8d0c0'); P.circle(g, 4.3, 4.9, 0.25, '#2a2430'); P.circle(g, 4.9, 4.9, 0.25, '#2a2430');
    P.rrect(g, 3.5, 2, 2, 1.4, 0.3, '#8a8290');
    g.beginPath(); g.moveTo(4.5, 2); g.quadraticCurveTo(5.6, 0.6, 6.8, 0.9); g.strokeStyle = '#c8a070'; g.lineWidth = 0.4; g.stroke();
    P.glow(g, 7, 0.9, 2.6, '#ffb040', 0.9); P.circle(g, 7, 0.9, 0.5, '#fff8c0'); for (const [x, y] of [[8.2, 0.3], [7.8, 1.8], [8.4, 1.2]]) P.rect(g, x, y, 0.3, 0.3, '#ffd060');
    P.ell(g, 3, 4.6, 0.9, 0.5, 'rgba(255,255,255,0.3)', -0.6);
  } });
  /** An iron-bound chest in three-quarter view: a domed lid of planks, iron corner caps, a lock with a keyhole. */
  function chest(g, body, band, glow, runes) {
    P.ell(g, 7, 11.4, 6.2, 0.9, 'rgba(0,0,0,0.4)');
    P.rrect(g, 1, 5.2, 12, 6.2, 0.6, P.lg(g, 0, 5, 0, 11.4, [sh(body, 0.2), body, sh(body, -0.45)]));
    g.strokeStyle = G.rgba(sh(body, -0.6), 0.9); g.lineWidth = 0.3; for (const y of [7.2, 9.2]) { g.beginPath(); g.moveTo(1.2, y); g.lineTo(12.8, y); g.stroke(); } // planks
    g.beginPath(); g.moveTo(1, 5.4); g.quadraticCurveTo(1, 0.6, 7, 0.6); g.quadraticCurveTo(13, 0.6, 13, 5.4); g.closePath(); P.fill(g, P.lg(g, 0, 0.6, 0, 5.4, [sh(body, 0.5), body]));
    g.strokeStyle = G.rgba(sh(body, -0.5), 0.8); for (const x of [4.6, 9.4]) { g.beginPath(); g.moveTo(x, 0.9); g.quadraticCurveTo(x + (x < 7 ? -0.6 : 0.6), 3, x + (x < 7 ? -0.8 : 0.8), 5.2); g.stroke(); }
    for (const x of [2.8, 11.2]) { g.beginPath(); g.moveTo(x - 0.7, 1.2); g.quadraticCurveTo(x - 0.9, 0.9, x, 0.8); g.lineTo(x + 0.7, 1.1); g.lineTo(x + 0.7, 11.4); g.lineTo(x - 0.7, 11.4); g.closePath(); P.fill(g, P.lg(g, x - 0.7, 0, x + 0.7, 0, [sh(band, 0.45), band, sh(band, -0.4)])); for (const y of [3, 8, 10.4]) P.circle(g, x, y, 0.25, sh(band, 0.6)); }
    P.rrect(g, 1, 4.9, 12, 0.9, 0.3, P.lg(g, 0, 4.9, 0, 5.8, [sh(band, 0.3), sh(band, -0.3)]));
    for (const [x, y] of [[1, 9.8], [11.4, 9.8]]) P.rrect(g, x, y, 1.6, 1.6, 0.3, sh(band, -0.1)); // corner caps
    P.rrect(g, 5.6, 4.4, 2.8, 3.2, 0.5, P.lg(g, 5.6, 4.4, 8.4, 7.6, [sh(band, 0.55), band, sh(band, -0.4)]));
    P.circle(g, 7, 5.7, 0.45, '#140a08'); P.rect(g, 6.8, 5.8, 0.4, 0.9, '#140a08');
    if (glow) { P.glow(g, 7, 5.2, 3, glow, 0.35); P.line(g, 1.4, 5.3, 12.6, 5.3, 0.25, G.rgba(glow, 0.8)); } // light leaking from under the lid
    if (runes) for (const [x, y] of [[4, 8.2], [10, 8.2], [7, 9.8]]) { P.circle(g, x, y, 0.5, G.rgba(glow, 0.9)); P.glow(g, x, y, 1.4, glow, 0.5); }
  }
  def('chest_wood', { w: 14, h: 12, draw(g) { chest(g, '#6a4424', '#8a8478', null); } }); // the plainest chest: common pieces only
  def('chest_red', { w: 14, h: 12, draw(g) { chest(g, '#6a1420', '#c8ccd8', '#ff3040'); } });
  def('chest_gold', { w: 14, h: 12, draw(g) { P.glow(g, 7, 6, 8, '#ffd35a', 0.3); chest(g, '#4a2a14', '#ffd35a', '#ffe070'); } });
  def('chest', { w: 14, h: 12, draw(g) { chest(g, '#6a4222', '#7a808a', null); } });
  def('chest_new', { w: 14, h: 12, frames: 2, draw(g, f) { P.glow(g, 7, 6, 8, '#c070ff', f ? 0.7 : 0.45); chest(g, '#2a1438', '#b890e0', '#d080ff', true); } }); // the Strange Pendulum's chest
  // coins: a stack (5) and a bag (25)
  def('coin_stack', { w: 8, h: 8, draw(g) { // two short stacks and a coin leaning on them
    for (const [x, n] of [[2.6, 3], [5.4, 2]]) for (let i = 0; i < n; i++) { const y = 6.8 - i * 0.9; P.ell(g, x, y, 2.2, 0.9, P.lg(g, x - 2, 0, x + 2, 0, ['#8a5a10', '#e0a020', '#8a5a10'])); P.ell(g, x, y - 0.3, 2.2, 0.8, P.lg(g, x - 2, y - 1, x + 2, y + 1, ['#fff0a0', '#e0a020'])); }
    coinFace(g, 5.6, 3.4, 1.9);
  } });
  def('coin_bag', { w: 10, h: 10, draw(g) { // a fat leather purse tied with a cord, coins spilling at its foot
    P.glow(g, 5, 6, 5, '#ffd35a', 0.35);
    g.beginPath(); g.moveTo(3.6, 3); g.quadraticCurveTo(0.4, 5, 1.2, 8.2); g.quadraticCurveTo(2.2, 9.8, 5, 9.8); g.quadraticCurveTo(7.8, 9.8, 8.8, 8.2); g.quadraticCurveTo(9.6, 5, 6.4, 3); g.closePath();
    P.fill(g, P.lg(g, 1, 3, 9, 10, ['#b88a50', '#7a4e24', '#3a2210']));
    g.strokeStyle = 'rgba(40,20,8,.6)'; g.lineWidth = 0.3; for (const x of [3.4, 5, 6.6]) { g.beginPath(); g.moveTo(x, 3.6); g.quadraticCurveTo(x + (x - 5) * 0.4, 6.4, x + (x - 5) * 0.2, 9.4); g.stroke(); } // gathers
    P.path(g, [3.4, 3, 2.8, 1, 4.4, 1.8, 5, 0.6, 5.6, 1.8, 7.2, 1, 6.6, 3]); P.fill(g, P.lg(g, 0, 0.6, 0, 3, ['#c8985a', '#7a4e24'])); // the neck, puckered
    P.line(g, 3.2, 3, 6.8, 3, 0.6, '#c8a878'); P.line(g, 6.6, 3, 7.8, 4.6, 0.4, '#c8a878'); // the cord
    coinFace(g, 5, 6.4, 1.6); P.ell(g, 8.6, 9.4, 1, 0.45, '#e0a020'); P.ell(g, 1.6, 9.6, 0.9, 0.4, '#c89020');
  } });
  // food: soup, carrot, cheese (a mouthful of health)
  def('food_soup', { w: 9, h: 8, draw(g) { // a wooden bowl of stew: meat and roots in it, steam rising
    g.beginPath(); g.moveTo(0.6, 3.6); g.quadraticCurveTo(1, 7.6, 4.5, 7.6); g.quadraticCurveTo(8, 7.6, 8.4, 3.6); g.closePath(); P.fill(g, P.lg(g, 0, 3, 9, 8, ['#a8784a', '#6a4424', '#3a2210']));
    g.strokeStyle = 'rgba(40,20,8,.5)'; g.lineWidth = 0.3; g.beginPath(); g.moveTo(1.4, 5.4); g.quadraticCurveTo(4.5, 6.2, 7.6, 5.4); g.stroke();
    P.ell(g, 4.5, 3.6, 3.9, 1.2, P.lg(g, 0, 2.4, 0, 4.8, ['#d8803a', '#8a4a1a'])); P.circle(g, 3.2, 3.4, 0.6, '#7a3a2a'); P.circle(g, 5.8, 3.7, 0.5, '#f0c050'); P.circle(g, 4.6, 3.2, 0.4, '#5a9a30');
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(3.4, 2); g.quadraticCurveTo(2.8, 1.1, 3.6, 0.3); g.moveTo(5.6, 2.1); g.quadraticCurveTo(6.2, 1.2, 5.4, 0.4); g.stroke();
  } });
  def('food_carrot', { w: 9, h: 9, draw(g) { // a fat carrot, ridged, its greens fanned
    g.beginPath(); g.moveTo(1.2, 8); g.quadraticCurveTo(3.4, 4.4, 5.8, 2.4); g.quadraticCurveTo(7.4, 2.6, 7.6, 4); g.quadraticCurveTo(5, 6.6, 1.2, 8); g.closePath(); P.fill(g, P.lg(g, 1, 8, 7, 2.4, ['#b83e0c', '#ff8a2a', '#ffb060']));
    g.strokeStyle = '#8a2e08'; g.lineWidth = 0.3; for (const [x, y] of [[3.4, 5.8], [4.6, 4.6], [5.8, 3.6]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 0.8, y + 0.6); g.stroke(); }
    for (const [x, y, c] of [[8.6, 0.6, '#4a9a24'], [8.8, 2.6, '#5ab030'], [6.8, 0.4, '#6ac040']]) P.line(g, 6.9, 3.1, x, y, 0.7, c);
  } });
  def('food_cheese', { w: 9, h: 8, draw(g) { // a wedge of hard cheese, a waxed rind, holes
    P.path(g, [0.8, 6.8, 8.2, 6.8, 8.2, 3.2, 0.8, 5]); P.fill(g, P.lg(g, 0, 3, 0, 7, ['#ffe070', '#e0a830', '#b07818']));
    P.path(g, [0.8, 5, 8.2, 3.2, 6, 1.8]); P.fill(g, P.lg(g, 1, 2, 8, 5, ['#fff4b0', '#f0d060']));
    P.path(g, [8.2, 3.2, 8.2, 6.8, 8.9, 6.4, 8.9, 3.1]); P.fill(g, '#a01818'); // the waxed rind
    for (const [x, y, r] of [[3, 5.8, 0.6], [6, 5.3, 0.8], [7.2, 6.3, 0.4], [4.6, 3.6, 0.4]]) { P.circle(g, x, y, r, '#b88018'); P.circle(g, x + r * 0.2, y + r * 0.2, r * 0.6, '#9a6810'); }
  } });
  def('tome', { w: 12, h: 11, draw(g) { // a leather tome: iron corners, a clasp, a sigil burning on its cover
    P.glow(g, 6, 5.8, 5, '#6a8aff', 0.35);
    P.rrect(g, 1.6, 2.4, 9.4, 7.6, 0.6, '#efe4c8'); P.line(g, 2, 9.6, 10.6, 9.6, 0.4, '#b8a888'); // the pages
    P.rrect(g, 1, 1.6, 9.6, 7.8, 0.8, P.lg(g, 0, 1.6, 10, 9.4, ['#4a5ac0', '#28348a', '#161e56']));
    P.rrect(g, 1, 1.6, 1.4, 7.8, 0.5, '#101640'); // the spine
    for (const [x, y] of [[9, 1.6], [9, 7.8]]) P.rrect(g, x, y, 1.6, 1.6, 0.3, P.lg(g, x, y, x + 1.6, y + 1.6, ['#d8dce8', '#6a7080'])); // iron corners
    g.strokeStyle = '#9ab4ff'; g.lineWidth = 0.45; g.beginPath(); g.arc(6, 5.5, 1.9, 0, Math.PI * 2); g.moveTo(6, 3.2); g.lineTo(6, 7.8); g.moveTo(3.8, 5.5); g.lineTo(8.2, 5.5); g.stroke(); P.glow(g, 6, 5.5, 2.6, '#8ab0ff', 0.6);
    P.rrect(g, 10.2, 4.6, 1.4, 1.8, 0.3, '#c9a24a'); // the clasp
  } });
  const HERBS = { moss: '#7ad04a', ember: '#ff7a2a', lily: '#8ae8ff', frostcap: '#8a9cff', nightshade: '#b060ff', dust: '#fff0a0' };
  Object.keys(HERBS).forEach((k) => def('herb_' + k, { w: 8, h: 8, draw(g) { // a sprig: two leaves, a small flower glowing
    const c = HERBS[k];
    P.line(g, 4, 7.6, 4, 3.6, 0.45, '#4a6a2a');
    for (const [a, l] of [[-2.4, 2.4], [-0.7, 2.4]]) { g.save(); g.translate(4, 6.4); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(l * 0.5, -0.9, l, 0); g.quadraticCurveTo(l * 0.5, 0.9, 0, 0); P.fill(g, P.lg(g, 0, -1, l, 1, ['#8ac050', '#3a6a1a'])); g.restore(); }
    P.glow(g, 4, 3, 3, c, 0.5);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - 1.57; P.ell(g, 4 + Math.cos(a) * 1.2, 3 + Math.sin(a) * 1.2, 1, 0.65, P.lg(g, 2, 1, 6, 5, [sh(c, 0.4), c, sh(c, -0.4)]), a); }
    P.circle(g, 4, 3, 0.7, sh(c, 0.7));
  } }));
  // forging materials: an ingot of each metal, a bevelled bar with a lit top face; starsteel glints
  const MATS = { iron: ['#b4bcc6', '#5a626c'], silver: ['#f4f8ff', '#8a96a8'], gold: ['#ffe07a', '#b07a10'], starsteel: ['#b8d8ff', '#3a5aa8'] };
  Object.keys(MATS).forEach((k) => def('mat_' + k, { w: 10, h: 8, draw(g) {
    const [hi, lo] = MATS[k];
    if (k !== 'iron') P.glow(g, 5, 4.5, 4.6, hi, k === 'starsteel' ? 0.55 : 0.3);
    P.path(g, [0.6, 6.6, 9.4, 6.6, 8, 3.4, 2, 3.4]); P.fill(g, P.lg(g, 0, 3.4, 0, 6.6, [sh(hi, -0.15), lo])); // the sides
    P.path(g, [2, 3.4, 8, 3.4, 7.2, 1.8, 2.8, 1.8]); P.fill(g, P.lg(g, 2, 1.8, 8, 3.4, [sh(hi, 0.4), hi, sh(hi, -0.2)])); // the top face
    P.line(g, 2.9, 2.2, 6.2, 2.2, 0.35, 'rgba(255,255,255,0.8)'); // a gleam along the top edge
    P.line(g, 0.6, 6.6, 9.4, 6.6, 0.4, sh(lo, -0.45)); // the shadowed foot
    if (k === 'starsteel') for (const [x, y, r] of [[7.4, 1.4, 1.2], [2.4, 4.8, 0.8]]) { P.line(g, x - r, y, x + r, y, 0.3, '#ffffff'); P.line(g, x, y - r, x, y + r, 0.3, '#ffffff'); }
  } }));
  def('urn', { w: 10, h: 12, draw(g) { // a funerary urn of fired clay: a lid, two handles, a band of painted figures, a crack
    for (const s of [-1, 1]) { g.beginPath(); g.arc(5 + s * 3.8, 4.4, 1.1, s < 0 ? Math.PI * 0.5 : -Math.PI * 0.5, s < 0 ? Math.PI * 1.5 : Math.PI * 0.5); g.strokeStyle = '#7a4424'; g.lineWidth = 0.6; g.stroke(); } // handles
    g.beginPath(); g.moveTo(3.4, 2); g.quadraticCurveTo(0.2, 5, 1.6, 9.4); g.quadraticCurveTo(2.4, 11.4, 5, 11.4); g.quadraticCurveTo(7.6, 11.4, 8.4, 9.4); g.quadraticCurveTo(9.8, 5, 6.6, 2); g.closePath();
    P.fill(g, P.lg(g, 1, 2, 9, 11.4, ['#d0925a', '#9a5a2e', '#4a2410']));
    P.path(g, [1.2, 5.6, 8.8, 5.6, 8.9, 7.6, 1.1, 7.6]); P.fill(g, '#2a1a10'); // a black band
    for (let i = 0; i < 4; i++) { const x = 2.2 + i * 1.8; P.circle(g, x, 6, 0.3, '#e8b070'); P.line(g, x, 6.3, x, 7.1, 0.3, '#e8b070'); } // little painted figures
    P.rrect(g, 2.8, 0.6, 4.4, 1.6, 0.6, P.lg(g, 0, 0.6, 0, 2.2, ['#c8844a', '#6a3a1a'])); P.circle(g, 5, 0.5, 0.6, '#9a5a2e'); // the lid
    g.strokeStyle = '#3a1a0a'; g.lineWidth = 0.3; g.beginPath(); g.moveTo(7.4, 8.4); g.lineTo(6.8, 9.6); g.lineTo(7.2, 10.6); g.stroke(); // a crack
    P.ell(g, 3, 4.4, 0.6, 1.4, 'rgba(255,230,200,0.35)', 0.3);
  } });
  def('well', { w: 30, h: 30, cy: 20, draw(g) {
    P.ell(g, 15, 25, 13, 4.4, 'rgba(0,0,0,0.4)');
    P.ell(g, 15, 19, 12, 5.4, P.lg(g, 3, 14, 27, 24, ['#8a8a96', '#5a5a66', '#34343e']));
    P.rrect(g, 3, 19, 24, 6, 1, P.lg(g, 0, 19, 0, 25, ['#6a6a76', '#3a3a44']));
    for (let i = 0; i < 6; i++) P.line(g, 5 + i * 4, 19.4, 5 + i * 4, 24.6, 0.4, '#2a2a32');
    P.ell(g, 15, 19, 9.4, 3.8, P.rg(g, 15, 19, 9, ['#1a3a5a', '#08101a']));
    P.glow(g, 15, 19, 10, '#4ab0ff', 0.35);
    P.line(g, 4.4, 19, 4.4, 4, 1.2, '#5a3a22'); P.line(g, 25.6, 19, 25.6, 4, 1.2, '#5a3a22');
    P.path(g, [1, 5.6, 15, -0.4, 29, 5.6, 26, 7, 15, 2, 4, 7]); P.fill(g, P.lg(g, 0, 0, 0, 7, ['#8a4a2a', '#4a2412']));
    P.line(g, 4.4, 6.4, 25.6, 6.4, 0.8, '#3a2412'); P.line(g, 15, 6.4, 15, 12, 0.3, '#c8b890');
    P.rrect(g, 13.4, 12, 3.2, 2.6, 0.5, '#7a5230');
  } });

  /* projectiles & weapon parts (drawn rotated at runtime, pointing right) */
  def('axe_p', { w: 10, h: 10, outline: 0.5, draw(g) { // a bearded throwing axe: a leather-wrapped haft, a crescent blade with a hooked beard
    P.line(g, 1, 9, 7, 3, 1, '#4a2e18'); for (let i = 0; i < 3; i++) P.line(g, 1.6 + i * 0.7, 8.4 - i * 0.7, 2.2 + i * 0.7, 8.8 - i * 0.7, 0.3, '#8a6a4a');
    g.beginPath(); g.moveTo(5.4, 2.2); g.quadraticCurveTo(7.2, -0.2, 9.8, 0.8); g.quadraticCurveTo(9.4, 4, 8.8, 6.4); g.quadraticCurveTo(7.6, 4.6, 6.6, 5.4); g.lineTo(7.4, 3.6); g.closePath();
    P.fill(g, P.lg(g, 5, 0, 10, 6, ['#f4f8ff', '#9aa2b4', '#4a5264']));
    g.beginPath(); g.moveTo(7.2, 0.4); g.quadraticCurveTo(9.8, 0.4, 9.8, 1); g.quadraticCurveTo(9.4, 4, 8.8, 6.4); g.strokeStyle = '#ffffff'; g.lineWidth = 0.35; g.stroke(); // the honed edge
  } });
  def('scythe_p', { w: 14, h: 12, outline: 0.5, draw(g) { // the reaper's scythe: a dark snath, a long curved blade, a ghost-green edge
    P.line(g, 7, 11.6, 7.6, 3.4, 0.9, '#2a1e2a'); P.line(g, 6.2, 8.6, 7.8, 8.4, 0.6, '#4a3a4a');
    g.beginPath(); g.moveTo(7.6, 3.2); g.quadraticCurveTo(3, -0.6, 0.2, 4.8); g.quadraticCurveTo(3.4, 2.2, 7.4, 5.2); g.closePath();
    P.fill(g, P.lg(g, 0, 0, 8, 5, ['#4a5264', '#c8d0e0', '#6a7488']));
    g.beginPath(); g.moveTo(0.2, 4.8); g.quadraticCurveTo(3, -0.6, 7.6, 3.2); g.strokeStyle = '#b0ffe0'; g.lineWidth = 0.4; g.stroke(); P.glow(g, 3.6, 2, 4, '#8affd0', 0.5);
  } });
  def('dagger_p', { w: 9, h: 4, outline: 0.4, draw(g) { // a throwing knife: a wrapped grip, a steel guard, a blade with a fuller
    P.rrect(g, 0, 1.2, 2.5, 1.6, 0.5, '#4a2e18'); P.line(g, 0.8, 1.2, 0.8, 2.8, 0.25, '#8a6a4a'); P.line(g, 1.6, 1.2, 1.6, 2.8, 0.25, '#8a6a4a');
    P.rrect(g, 2.3, 0.3, 0.8, 3.4, 0.3, P.lg(g, 0, 0.3, 0, 3.7, ['#e8ecf4', '#6a7080']));
    P.path(g, [3.1, 1.1, 8.9, 2, 3.1, 2.9]); P.fill(g, P.lg(g, 0, 1.1, 0, 2.9, ['#ffffff', '#b8c0d0', '#5a6274']));
    P.line(g, 3.4, 2, 7, 2, 0.25, 'rgba(60,66,80,.8)');
  } });
  def('arrow_p', { w: 11, h: 4, outline: 0.35, draw(g) { // an arrow: a stout ash shaft, a steel broadhead, red fletching
    P.line(g, 1.2, 2, 8.8, 2, 0.75, '#b08858'); P.line(g, 1.2, 1.8, 8.8, 1.8, 0.25, '#d8b888');
    P.path(g, [8.4, 0.7, 11, 2, 8.4, 3.3, 9, 2]); P.fill(g, P.lg(g, 8, 0.7, 8, 3.3, ['#ffffff', '#9aa2b4']));
    P.path(g, [0, 0.4, 2.8, 1.7, 1.2, 1.9]); P.fill(g, '#e84a4a'); P.path(g, [0, 3.6, 2.8, 2.3, 1.2, 2.1]); P.fill(g, '#a02828');
  } });
  def('flask_p', { w: 6, h: 8, outline: 0.4, draw(g) { // a thrown vial of venom: a green brew, a skull scratched on the glass
    P.rrect(g, 2, 0, 2, 1.4, 0.3, '#7a5230'); P.circle(g, 3, 5, 2.7, 'rgba(210,255,220,0.5)');
    g.save(); g.beginPath(); g.arc(3, 5, 2.5, 0, Math.PI * 2); g.clip(); P.rect(g, 0, 4, 6, 4, P.lg(g, 0, 4, 0, 8, ['#a0ff70', '#40a030'])); g.restore();
    P.circle(g, 3, 5.4, 0.8, '#1a3a10'); P.circle(g, 2.7, 5.3, 0.2, '#a0ff70'); P.circle(g, 3.3, 5.3, 0.2, '#a0ff70');
    P.circle(g, 2, 3.8, 0.45, 'rgba(255,255,255,0.8)'); P.glow(g, 3, 5, 3.4, '#80ff60', 0.5);
  } });
  def('grenade_p', { w: 7, h: 8, outline: 0.4, draw(g) { // an iron powder grenade with a lit fuse
    P.circle(g, 3.5, 4.8, 2.8, P.vol(g, 3.5, 4.8, 2.8, '#4a4a52')); P.rrect(g, 2.6, 1.4, 1.8, 1.2, 0.3, '#6a6a72');
    P.line(g, 3.5, 1.4, 4.6, 0.4, 0.4, '#c8a878'); P.glow(g, 4.8, 0.4, 2, '#ffb040', 0.9); P.circle(g, 4.8, 0.4, 0.4, '#fff0a0');
  } });
  // the Alchemist's flasks: a round bomb and one bottle per element
  [['bomb', '#c8b890', '#8a7a5a'], ['fire', '#ff7a30', '#ffd070'], ['lightning', '#f0e060', '#ffffff'], ['ice', '#70d0ff', '#e8faff'], ['earth', '#80c040', '#d8ff90']].forEach(([el, col, hi]) => {
    def('flask_' + el + '_p', { w: 7, h: 9, outline: 0.4, draw(g) {
      if (el === 'bomb') { P.circle(g, 3.5, 5.4, 2.8, P.vol(g, 3.5, 5.4, 2.8, '#6a5a44')); P.rrect(g, 2.7, 1.8, 1.6, 1.4, 0.3, '#8a7a5a'); P.line(g, 3.5, 1.8, 4.4, 0.6, 0.4, '#c8a878'); P.circle(g, 4.5, 0.6, 0.45, '#ffd070'); return; }
      P.rrect(g, 2.6, 0.2, 1.8, 1, 0.3, '#7a5230'); P.rect(g, 2.9, 1.2, 1.2, 1.6, 'rgba(220,240,255,0.6)');
      P.circle(g, 3.5, 5.6, 2.9, 'rgba(220,240,255,0.45)');
      g.save(); g.beginPath(); g.arc(3.5, 5.6, 2.7, 0, Math.PI * 2); g.clip(); P.rect(g, 0, 4.6, 7, 5, P.lg(g, 0, 4.6, 0, 8.6, [hi, col, sh(col, -0.35)])); g.restore();
      P.circle(g, 2.6, 4.6, 0.55, 'rgba(255,255,255,0.85)'); P.glow(g, 3.5, 5.8, 4, col, 0.45);
    } });
  });
  /* ---------------- summons: the hero's allies, each its own model (never an enemy's) ---------------- */
  // Huntress's wolves: dire wolves of the frost-spirits: heavy-shouldered, dark blue-grey, a thick ruff at the neck, ears up,
  // jaws open on white fangs, eyes of cold light, rime crystals grown on the shoulders, breath smoking, a brush of a tail
  def('sum_wolf', { w: 24, h: 15, frames: 2, draw(g, f) {
    const fur = '#4a5c7a', fl = sh(fur, 0.45), fd = sh(fur, -0.45), ice = '#bfe8ff', eye = '#8ff0ff', gal = f ? 1 : -1;
    P.ell(g, 12, 14.2, 8, 0.8, 'rgba(0,0,0,0.35)');
    P.glow(g, 12, 8, 10, eye, 0.12);
    const leg = (x, y, kx, ky, fx, fy, col, w0) => { P.limb(g, x, y, kx, ky, w0, w0 * 0.7, col); P.limb(g, kx, ky, fx, fy, w0 * 0.7, 0.45, col); P.ell(g, fx + 0.3, fy + 0.2, 0.8, 0.4, col); };
    leg(7.6, 8.6, 5.4 - gal * 0.8, 11.2, 4.4 - gal * 1.6, 13.6, fd, 1.5); leg(15, 9, 16.8 + gal, 11.6, 17.8 + gal * 1.4, 13.6, fd, 1.2);
    // the tail: a thick brush streaming back
    g.beginPath(); g.moveTo(5.8, 7); g.quadraticCurveTo(2.6, 6 + gal * 0.5, 0.6, 8 + gal * 0.8); g.quadraticCurveTo(2.2, 9.6, 5.8, 9); g.closePath(); P.fill(g, P.lg(g, 0, 6, 6, 9.6, [fl, fur, fd])); P.circle(g, 1, 8 + gal * 0.8, 0.6, ice);
    // the body: heavy shoulders and a deep chest, a tucked waist, the haunch
    g.beginPath(); g.moveTo(5, 8); g.quadraticCurveTo(6, 5.6, 9.4, 5.8); g.quadraticCurveTo(12, 5, 15, 4.4); g.quadraticCurveTo(18, 4.6, 18.2, 7.8); g.quadraticCurveTo(17.8, 10.8, 15, 10.8); g.quadraticCurveTo(12, 9.4, 9.6, 9.6); g.quadraticCurveTo(6, 10.4, 5, 8); g.closePath();
    P.fill(g, P.lg(g, 6, 4.4, 16, 10.8, [fl, fur, fd]));
    P.ell(g, 7.4, 7.6, 2.4, 2, G.rgba(fl, 0.35)); // the haunch
    g.strokeStyle = G.rgba(fd, 0.8); g.lineWidth = 0.3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(11 + i * 1.3, 6.8); g.quadraticCurveTo(11.6 + i * 1.3, 8.4, 11.2 + i * 1.3, 9.6); g.stroke(); } // ribs under the fur
    // the ruff: a thick mane round the neck and shoulders
    g.beginPath(); g.moveTo(13, 4.8); g.quadraticCurveTo(15.6, 2.8, 18.2, 4.2); g.quadraticCurveTo(19.4, 6.6, 18.4, 9.6); g.quadraticCurveTo(16.4, 10.4, 15.2, 9.2); g.quadraticCurveTo(14.8, 6.8, 13, 4.8); g.closePath(); P.fill(g, P.lg(g, 13, 3, 19, 10, [sh(fl, 0.15), fur, fd]));
    for (const [x, y, h, a] of [[11.4, 5.2, 2, -1.9], [13, 4.4, 2.4, -1.5], [14.6, 3.8, 1.8, -1.2]]) { g.save(); g.translate(x, y); g.rotate(a); P.path(g, [0, -0.45, h, 0, 0, 0.45]); P.fill(g, P.lg(g, 0, 0, h, 0, [ice, '#ffffff'])); g.restore(); } // rime crystals on the shoulders
    leg(8.8, 8.6, 7.4 + gal, 11.4, 6.6 + gal * 1.8, 13.8, fur, 1.5); leg(16.4, 9, 18.4 - gal * 0.6, 11.2, 19.8 - gal * 1.4, 13.4, fur, 1.2);
    // the head: broad skull, ears up, a long muzzle, jaws open on fangs, cold eyes, breath smoking
    P.ell(g, 19, 5.8, 2.6, 2.2, P.vol(g, 18.4, 5.2, 2.6, fur));
    P.path(g, [17.6, 4.4, 17.8, 1.4, 19.2, 3.8]); P.fill(g, P.lg(g, 17.6, 1.4, 19.2, 4.4, [fl, fd])); P.path(g, [19, 4, 19.8, 1.6, 20.4, 4.2]); P.fill(g, P.lg(g, 19, 1.6, 20.4, 4.2, [fl, fur]));
    P.path(g, [20, 5, 23.6, 6, 23.6, 6.8, 20.4, 7]); P.fill(g, P.lg(g, 20, 5, 23.6, 7, [fl, fur])); // the upper jaw
    P.path(g, [20.4, 7.6, 23, 7.8 + (f ? 0.8 : 0.4), 22.8, 8.4 + (f ? 0.8 : 0.4), 20.2, 8.4]); P.fill(g, fd); // the lower jaw
    P.path(g, [20.4, 7, 23.4, 6.8, 23, 7.8 + (f ? 0.8 : 0.4), 20.4, 7.6]); P.fill(g, '#1a0a10');
    for (const x of [21.4, 22.8]) { P.path(g, [x - 0.3, 6.9, x + 0.3, 6.9, x, 7.7]); P.fill(g, '#f4f4f0'); }
    P.circle(g, 23.7, 6.2, 0.35, '#0a0a14');
    P.ell(g, 20.4, 5.2, 0.6, 0.4, '#0a1420'); P.evil(g, 20.4, 5.2, 0.45, eye); P.glow(g, 20.4, 5.2, 2.4, eye, 0.7);
    g.save(); g.globalAlpha = 0.5; P.ell(g, 24 - (f ? 0 : 0.5), 8.8, 1.2, 0.7, ice); g.restore(); // breath
  } });
  // the Phantom Knights: a knight's ghost in pale armour, a great helm with a slit of cold light, a sword, dissolving to mist below the waist
  def('sum_phantom', { w: 20, h: 23, cy: 14, frames: 2, soft: true, draw(g, f) {
    g.save(); g.translate(0, 3);
    G.humanoid(g, f, { robe: '#6a8ab8', body: '#9ab4d8', trim: '#d8f0ff', arms: '#8aa4c8', head: 'greathelm', headCol: '#b8cce8', headCol2: '#5a7098', eyeGlow: '#8ff0ff', weapon: 'sword', cape: '#3a5078', gloves: '#9ab4d8', skin: '#9ab4d8', pauldron: '#b8cce8' });
    g.restore();
    g.save(); g.globalCompositeOperation = 'destination-out'; P.rect(g, 0, 14, 20, 9, P.lg(g, 0, 14, 0, 21.6, ['rgba(0,0,0,0)', 'rgba(0,0,0,1)'])); g.restore(); // the legs dissolve into mist
    g.save(); g.globalAlpha = 0.5; for (const [x, y] of [[6, 17.6], [9.6, 18.6 + (f ? 0.6 : 0)], [13, 17.4]]) { g.beginPath(); g.moveTo(x - 1.4, y - 2); g.quadraticCurveTo(x - 0.4, y + 1, x + 0.6, y + 2.4); g.strokeStyle = '#c8e4ff'; g.lineWidth = 0.6; g.stroke(); } g.restore();
    P.glow(g, 11, 8, 6, '#8ff0ff', 0.25);
  } });
  // the familiar imp (a blessing's): a small violet fiend on bat wings, curled horns, amber eyes, a spade-tipped tail, an ember in its claws
  def('sum_imp', { w: 20, h: 20, frames: 2, draw(g, f) {
    const s = '#5a2a7a', sl = sh(s, 0.45), sd = sh(s, -0.5), wing = '#3a1a52', eye = '#ffc040', up = f === 0;
    for (const d of [-1, 1]) { // bat wings, the far one darker
      g.save(); g.translate(9.4 + d * 0.8, 9); g.scale(d, 1);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(3, up ? -7 : -2, 7.4, up ? -6.4 : -1); g.lineTo(6.2, up ? -4.2 : 0.8); g.lineTo(7, up ? -2.4 : 2.6); g.lineTo(5, up ? -1.6 : 2.6); g.lineTo(4.6, up ? 0 : 3.8); g.quadraticCurveTo(2, 1.4, 0, 1.6); g.closePath();
      P.fill(g, P.lg(g, 0, -6, 7, 3, d < 0 ? [sh(wing, -0.2), sh(wing, -0.5)] : [sh(wing, 0.3), wing])); P.line(g, 0, 0.4, 7.2, up ? -6.2 : -0.8, 0.3, sd);
      g.restore(); }
    g.beginPath(); g.moveTo(8.4, 13.6); g.quadraticCurveTo(5, 16.4, 3.4, 14 + (f ? 1 : 0)); g.strokeStyle = sd; g.lineWidth = 0.6; g.stroke(); P.path(g, [3.4, 14 + (f ? 1 : 0), 2, 13.2 + (f ? 1 : 0), 2.6, 15.2 + (f ? 1 : 0)]); P.fill(g, sd); // the spade tail
    P.ell(g, 10, 11.4, 2.6, 3, P.lg(g, 8, 8.6, 12, 14.4, [sl, s, sd]));
    P.limb(g, 9.2, 13.8, 8.6, 16.4, 0.8, 0.5, sd); P.limb(g, 11, 13.8, 11.6, 16.2, 0.8, 0.5, s);
    P.ell(g, 11.2, 6.6, 2.6, 2.4, P.vol(g, 10.4, 5.8, 2.6, s));
    P.horn(g, 10, 4.8, 8.4, 2.4, 9.8, 1.4, 0.45, '#2a1a1a'); P.horn(g, 12.4, 4.8, 13.6, 2.6, 12.4, 1.8, 0.4, '#2a1a1a');
    P.ell(g, 11.8, 6.4, 0.8, 0.7, '#140810'); P.ell(g, 13.2, 6.5, 0.7, 0.6, '#140810'); P.evil(g, 11.8, 6.4, 0.55, eye); P.evil(g, 13.2, 6.5, 0.5, eye); P.glow(g, 12.5, 6.4, 2.4, eye, 0.5);
    P.path(g, [11.4, 7.8, 13.8, 7.6, 12.6, 8.6]); P.fill(g, '#140810'); P.path(g, [12, 7.8, 12.4, 7.8, 12.2, 8.3]); P.fill(g, '#f0e0d0');
    P.limb(g, 11.8, 10.4, 13.8, 11.6, 0.7, 0.5, s); P.circle(g, 14.2, 11.4, 0.9, '#ffb030'); P.glow(g, 14.2, 11.4, 2.6, '#ff8a20', 0.7); // the ember in its claws
  } });
  // the Occultist's grave spirits: a small wailing skull of pale light trailing a wisp
  def('sum_spirit', { w: 14, h: 12, frames: 2, soft: true, draw(g, f) {
    const c = '#8affd0', cl = '#e8fff4';
    P.glow(g, 8, 6, 6, c, 0.55);
    g.beginPath(); g.moveTo(8, 3.4); g.quadraticCurveTo(3, 3.6 + (f ? 0.8 : -0.4), 0.6, 6.4 + (f ? 1 : 0)); g.quadraticCurveTo(3.4, 6.4, 7.6, 8.4); g.closePath(); P.fill(g, P.lg(g, 0, 5, 8, 6, [G.rgba(c, 0), G.rgba(c, 0.7)]));
    P.ell(g, 9, 5.8, 2.9, 2.7, P.rg(g, 8.4, 5, 3, [[0, '#ffffff'], [0.5, cl], [1, G.rgba(c, 0.9)]]));
    P.ell(g, 9.4, 5.2, 0.7, 0.8, '#0a2a20'); P.ell(g, 11, 5.2, 0.6, 0.75, '#0a2a20'); P.ell(g, 10.4, 7.2, 0.7, 0.9 + (f ? 0.3 : 0), '#0a2a20'); // hollow eyes, a wailing mouth
  } });

  /* Crone's bog plants (anchored at the root; frame 1 = striking) */
  const leaf = (g, x, y, a, l, col) => { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(l * 0.5, -l * 0.35, l, 0); g.quadraticCurveTo(l * 0.5, l * 0.3, 0, 0); P.fill(g, P.lg(g, 0, -1, l, 1, [sh(col, 0.25), col, sh(col, -0.35)])); g.restore(); };
  const mound = (g) => { P.ell(g, 8, 15.4, 5.2, 1.6, P.lg(g, 0, 14, 0, 17, ['#4a3a24', '#2a2014'])); for (let i = 0; i < 4; i++) P.circle(g, 4.6 + i * 2.2, 15 + (i % 2) * 0.5, 0.5, '#5a4a30'); };
  def('plant_snare', { w: 16, h: 17, cy: 15, frames: 2, draw(g, f) { // a knot of thorned vines around a sticky bulb
    mound(g);
    for (let i = 0; i < 5; i++) {
      const a = -2.6 + i * 0.55, up = f ? 1.6 : 1, bx = 8 + Math.cos(a) * 1.5, by = 14.4;
      g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + Math.cos(a) * 5, by - 5 * up + (i % 2) * 2, bx + Math.cos(a) * 7 * (f ? 0.8 : 1), by - (f ? 9 : 4) - (i % 2));
      g.strokeStyle = i % 2 ? '#4a6a22' : '#3a5418'; g.lineWidth = 0.9; g.stroke();
      for (let k = 1; k < 3; k++) P.circle(g, bx + Math.cos(a) * 2.4 * k, by - (f ? 3.2 : 1.6) * k, 0.35, '#c8d890');
    }
    P.circle(g, 8, 12.8, 2.2, P.vol(g, 8, 12.8, 2.2, '#6a2a3a')); P.ell(g, 8.3, 12.8, 1.3, 1, '#e8f070'); P.ell(g, 8.4, 12.8, 0.35, 0.9, '#140a06'); P.glow(g, 8.3, 12.8, 2.4, '#d8ff60', 0.4); // a bulb with an eye in it
    if (f) P.glow(g, 8, 12.8, 5, '#c0ff60', 0.4);
  } });
  def('plant_biter', { w: 16, h: 20, cy: 18, frames: 2, draw(g, f) { // a bog flytrap on a crooked stalk
    P.ell(g, 8, 18.4, 4.4, 1.4, '#2a2014');
    leaf(g, 7.6, 17.6, -2.7, 5, '#4a7a28'); leaf(g, 8.4, 17.6, -0.4, 5, '#3a6a20');
    g.beginPath(); g.moveTo(8, 18); g.quadraticCurveTo(5.6, 13, 8.2, 9.4); g.strokeStyle = '#3a5a1a'; g.lineWidth = 1.2; g.stroke();
    const open = f ? 0.25 : 1, hx = 9.6, hy = 8.2;
    g.save(); g.translate(hx, hy);
    g.save(); g.rotate(-0.55 * open); g.beginPath(); g.moveTo(-1.6, 0); g.quadraticCurveTo(2, -4, 5.6, -0.6); g.lineTo(-1.6, 0.4); P.fill(g, P.lg(g, 0, -4, 0, 0, ['#8ac040', '#4a7a20'])); P.path(g, [-0.6, 0, 1.6, -1, 3.8, -0.3]); P.fill(g, '#c0283a'); for (let i = 0; i < 4; i++) P.path(g, [0.6 + i * 1.2, -0.4, 1 + i * 1.2, 0.8, 1.4 + i * 1.2, -0.3]); g.fillStyle = '#f0ecd8'; g.fill(); g.restore();
    g.save(); g.rotate(0.55 * open); g.beginPath(); g.moveTo(-1.6, 0); g.quadraticCurveTo(2, 4, 5.6, 0.6); g.lineTo(-1.6, -0.4); P.fill(g, P.lg(g, 0, 0, 0, 4, ['#4a7a20', '#2a4a12'])); P.path(g, [-0.6, 0, 1.6, 1, 3.8, 0.3]); P.fill(g, '#8a1424'); for (let i = 0; i < 4; i++) P.path(g, [0.6 + i * 1.2, 0.4, 1 + i * 1.2, -0.8, 1.4 + i * 1.2, 0.3]); g.fillStyle = '#e0dcc8'; g.fill(); g.restore();
    g.restore();
    for (let i = 0; i < 3; i++) { P.path(g, [hx + 0.6 + i * 1.3, hy - 0.4, hx + 1.1 + i * 1.3, hy - 0.4, hx + 0.9 + i * 1.3, hy + 0.8]); P.fill(g, '#f0ead0'); } // fangs
    P.circle(g, hx - 0.8, hy - 1.2, 0.35, '#ffe060');
  } });
  def('plant_pod', { w: 16, h: 18, cy: 16, frames: 2, draw(g, f) { // a swollen spore pod with glowing veins
    mound(g); leaf(g, 7, 15, -2.9, 4.6, '#3a5a1a'); leaf(g, 9, 15, -0.3, 4.6, '#4a6a22');
    const r = f ? 4.4 : 3.8, cx = 8, cy2 = 11.2 - (f ? 0.4 : 0);
    P.ell(g, cx, cy2, r * 0.9, r, P.rg(g, cx - 1, cy2 - 1.4, r * 1.2, ['#e0b0ff', '#8a3ac0', '#3a1050']));
    g.strokeStyle = 'rgba(230,190,255,0.8)'; g.lineWidth = 0.35;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(cx - r * 0.7 + i * r * 0.45, cy2 + r * 0.8); g.quadraticCurveTo(cx - r * 0.4 + i * r * 0.3, cy2, cx - 0.4 + i * 0.3, cy2 - r * 0.9); g.stroke(); }
    P.path(g, [cx - 1.2, cy2 - r * 0.9, cx, cy2 - r - 1.4, cx + 1.2, cy2 - r * 0.9]); P.fill(g, '#4a6a22');
    P.glow(g, cx, cy2, r * 2, '#b070ff', f ? 0.6 : 0.3);
  } });
  def('plant_spitter', { w: 16, h: 20, cy: 18, frames: 2, draw(g, f) { // a pitcher plant: a swollen veined belly, a hooded lid over a gaping lip, spitting a thorny seed
    P.ell(g, 8, 18.4, 4.4, 1.4, '#2a2014');
    leaf(g, 7.4, 17.8, -2.8, 5.2, '#3a6a20'); leaf(g, 8.6, 17.8, -0.35, 5.2, '#4a7a28');
    g.save(); g.translate(8, 17.6); g.rotate(f ? -0.1 : 0);
    g.beginPath(); g.moveTo(-1, 0); g.quadraticCurveTo(-4.6, -3, -3.4, -7.4); g.quadraticCurveTo(-2.4, -10.4, 1, -10.6); g.quadraticCurveTo(3.8, -10.4, 3.8, -7.6); g.quadraticCurveTo(4, -3, 1, 0); g.closePath();
    P.fill(g, P.lg(g, -4, -10, 4, 0, ['#a8d060', '#5a8a2a', '#2a4410']));
    g.strokeStyle = '#8a2a3a'; g.lineWidth = 0.3; for (const x of [-2.4, -0.8, 0.8, 2.2]) { g.beginPath(); g.moveTo(x * 0.6, -0.6); g.quadraticCurveTo(x * 1.1, -5, x * 0.7, -9); g.stroke(); } // red veins
    P.ell(g, 1.4, -9.4, 2.6, 1.3, '#1a0608', -0.3); P.ell(g, 1.4, -9.6, 2.6, 0.6, '#b83a4a', -0.3); // the gaping lip
    g.beginPath(); g.moveTo(-2.4, -10); g.quadraticCurveTo(0, -14.6 + (f ? -0.6 : 0), 4.8, -12.6 + (f ? -1 : 0)); g.quadraticCurveTo(2.6, -11.4, -0.8, -10.4); g.closePath(); P.fill(g, P.lg(g, -2, -14, 4, -10, ['#c8e070', '#6a9a30'])); // the hood
    g.restore();
    if (f) { P.glow(g, 12.4, 7.2, 3.4, '#c890ff', 0.8); P.circle(g, 12.4, 7.2, 0.8, '#e0c0ff'); }
  } });
  def('chakram_p', { w: 10, h: 10, outline: 0.4, draw(g) { // a war-quoit: a steel ring with four hooked blades, a gold inlay, spinning
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; P.path(g, [5 + Math.cos(a - 0.5) * 2.6, 5 + Math.sin(a - 0.5) * 2.6, 5 + Math.cos(a + 0.25) * 5, 5 + Math.sin(a + 0.25) * 5, 5 + Math.cos(a + 0.5) * 2.8, 5 + Math.sin(a + 0.5) * 2.8]); P.fill(g, P.lg(g, 0, 0, 10, 10, ['#ffffff', '#a8b0c0', '#5a6274'])); } // four hooked blades
    g.beginPath(); g.arc(5, 5, 3, 0, Math.PI * 2); g.strokeStyle = '#8a92a4'; g.lineWidth = 1.2; g.stroke();
    g.beginPath(); g.arc(5, 5, 3, 0, Math.PI * 2); g.strokeStyle = '#e8c050'; g.lineWidth = 0.4; g.stroke();
  } });
  def('flail_p', { w: 10, h: 10, outline: 0.5, draw(g) { // a morning star: an iron ball studded with six stout spikes, a ring for the chain
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; P.path(g, [5 + Math.cos(a - 0.35) * 2.8, 5 + Math.sin(a - 0.35) * 2.8, 5 + Math.cos(a) * 4.8, 5 + Math.sin(a) * 4.8, 5 + Math.cos(a + 0.35) * 2.8, 5 + Math.sin(a + 0.35) * 2.8]); P.fill(g, P.lg(g, 0, 0, 10, 10, ['#c8ccd8', '#5a5e6a'])); }
    P.circle(g, 5, 5, 3.1, P.vol(g, 4.2, 4.2, 3.4, '#5a5e6a')); P.circle(g, 4, 4, 0.7, 'rgba(255,255,255,0.4)');
    g.beginPath(); g.arc(5, 5, 3.1, 0, Math.PI * 2); g.strokeStyle = '#3a3e48'; g.lineWidth = 0.3; g.stroke();
  } });
  def('orb_p', { w: 8, h: 8, outline: 0.3, draw(g) { // an orbiting warding orb: polished silver in a gold ring, a rune glowing in it
    P.glow(g, 4, 4, 4, '#c8d8ff', 0.6);
    P.circle(g, 4, 4, 2.6, P.vol(g, 3.2, 3.2, 2.8, '#b8c4d8'));
    g.beginPath(); g.ellipse(4, 4, 3.4, 1.1, -0.4, 0, Math.PI * 2); g.strokeStyle = '#e8c870'; g.lineWidth = 0.45; g.stroke();
    P.circle(g, 4, 4, 0.8, '#8ab0ff'); P.circle(g, 3.1, 3, 0.5, 'rgba(255,255,255,0.9)');
  } });
  def('hammer_p', { w: 10, h: 10, outline: 0.5, draw(g) { // the smiting hammer falling from the sky: a golden head with a cross engraved, light pouring off it
    P.glow(g, 5, 4, 6, '#ffe89a', 0.7);
    P.line(g, 5, 9.6, 5, 4.4, 1, '#5a3a20'); P.circle(g, 5, 9.6, 0.6, '#c9a24a');
    P.rrect(g, 1.2, 1, 7.6, 4, 0.7, P.lg(g, 1, 1, 9, 5, ['#fffbe8', '#e8c050', '#8a6a24']));
    P.rect(g, 1.2, 2.6, 7.6, 0.7, '#8a6a24'); P.rect(g, 4.65, 1.4, 0.7, 3.2, '#fff4c0'); P.rect(g, 3.6, 2.6, 2.8, 0.7, '#fff4c0'); // the cross
  } });
  def('fist_p', { w: 9, h: 8, outline: 0.4, draw(g) { // a spectral fist: a gauntlet of violet light, knuckles forward, a trail of mist
    P.glow(g, 5, 4, 5, '#b080ff', 0.7);
    g.save(); g.globalAlpha = 0.5; P.path(g, [0, 2.4, 3, 1.8, 3, 6.2, 0, 5.6]); P.fill(g, '#9a70e0'); g.restore(); // mist trailing
    P.rrect(g, 2.2, 1.4, 5, 5.2, 1.6, P.lg(g, 2, 1.4, 7, 6.6, ['#f0e0ff', '#b890f0', '#6a40b0']));
    for (let i = 0; i < 4; i++) P.circle(g, 7, 2.2 + i * 1.2, 0.65, P.vol(g, 6.8, 2 + i * 1.2, 0.7, '#e8d8ff')); // knuckles
    P.path(g, [3.2, 5.4, 5.2, 4.4, 6.2, 6.2, 4, 6.6]); P.fill(g, '#9a70e0'); // the thumb
  } });
  def('shield_p', { w: 12, h: 12, outline: 0.5, draw(g) { // a round war-shield of painted planks, an iron rim, a boss, rivets
    P.circle(g, 6, 6, 5.2, P.vol(g, 4.6, 4.6, 5.6, '#b0402a'));
    g.strokeStyle = 'rgba(40,10,6,.6)'; g.lineWidth = 0.3; for (const x of [3.6, 6, 8.4]) { g.beginPath(); g.moveTo(x, 1.2); g.lineTo(x, 10.8); g.stroke(); } // the planks
    g.beginPath(); g.arc(6, 6, 4.9, 0, Math.PI * 2); g.strokeStyle = '#8a8e98'; g.lineWidth = 0.8; g.stroke();
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; P.circle(g, 6 + Math.cos(a) * 4.9, 6 + Math.sin(a) * 4.9, 0.3, '#d8dce8'); }
    P.circle(g, 6, 6, 1.6, P.vol(g, 5.4, 5.4, 1.8, '#c8ccd8')); P.circle(g, 5.4, 5.4, 0.4, '#ffffff');
  } });
  // projectiles that used to be drawn as plain dots
  def('fireball_p', { w: 14, h: 8, cx: 11, outline: 0, frames: 2, draw(g, f) { // a comet of fire: a white-hot core, flames streaming back
    P.glow(g, 10, 4, 5, '#ff7a20', 0.7);
    for (const [l, w, col] of [[10, 3.2, '#c02810'], [8, 2.4, '#ff6a18'], [5.6, 1.6, '#ffc040']]) { g.beginPath(); g.moveTo(11.4, 4 - w); g.quadraticCurveTo(11.4 - l * 0.6, 4 - w * 0.8 + (f ? 0.4 : -0.4), 11.4 - l, 4 + (f ? 0.6 : -0.6)); g.quadraticCurveTo(11.4 - l * 0.6, 4 + w * 0.8, 11.4, 4 + w); g.closePath(); P.fill(g, col); }
    P.circle(g, 11, 4, 2.4, P.rg(g, 11.4, 3.6, 2.6, [[0, '#ffffff'], [0.5, '#fff0a0'], [1, '#ffb030']]));
  } });
  def('arcorb_p', { w: 10, h: 10, outline: 0, frames: 2, draw(g, f) { // the oracle's orb: an eye of cold light, runes circling it
    P.glow(g, 5, 5, 5, '#60e0d0', 0.7);
    P.circle(g, 5, 5, 2.8, P.rg(g, 4.4, 4.4, 3, [[0, '#ffffff'], [0.5, '#b8fff4'], [1, '#30a8a0']]));
    P.ell(g, 5, 5, 1.6, 1.2, '#1a5a6a'); P.ell(g, 5.2, 5, 0.6, 1, '#0a1a20'); // the eye
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + (f ? 0.4 : 0); P.rect(g, 5 + Math.cos(a) * 4.2 - 0.35, 5 + Math.sin(a) * 4.2 - 0.35, 0.7, 0.7, '#e8fff8'); }
  } });
  def('storm_p', { w: 10, h: 10, outline: 0, frames: 2, draw(g, f) { // a ball of storm: a white core in a skin of lightning
    P.glow(g, 5, 5, 5, '#fff6a0', 0.8);
    P.circle(g, 5, 5, 3, P.rg(g, 4.4, 4.4, 3.2, [[0, '#ffffff'], [0.6, '#fff6a0'], [1, '#c8a830']]));
    g.strokeStyle = '#ffffff'; g.lineWidth = 0.35;
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + (f ? 1 : 0); g.beginPath(); g.moveTo(5 + Math.cos(a) * 1.4, 5 + Math.sin(a) * 1.4); g.lineTo(5 + Math.cos(a + 0.4) * 3, 5 + Math.sin(a + 0.4) * 3); g.lineTo(5 + Math.cos(a + 0.1) * 4.6, 5 + Math.sin(a + 0.1) * 4.6); g.stroke(); }
  } });
  def('seed_p', { w: 6, h: 6, outline: 0.3, draw(g) { // a thorny seed spat by the pitcher plant, glowing violet
    P.glow(g, 3, 3, 3, '#c890ff', 0.6);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; P.path(g, [3 + Math.cos(a - 0.4) * 1.4, 3 + Math.sin(a - 0.4) * 1.4, 3 + Math.cos(a) * 2.8, 3 + Math.sin(a) * 2.8, 3 + Math.cos(a + 0.4) * 1.4, 3 + Math.sin(a + 0.4) * 1.4]); P.fill(g, '#4a2a5a'); }
    P.circle(g, 3, 3, 1.6, P.vol(g, 2.6, 2.6, 1.8, '#b070e0')); P.circle(g, 2.5, 2.5, 0.4, '#f0e0ff');
  } });
  def('hex_p', { w: 12, h: 6, cx: 8, outline: 0, draw(g) { // a hex: a shard of violet curse with a sigil in it, a smoky tail
    P.glow(g, 8, 3, 4, '#be50ff', 0.7);
    g.save(); g.globalAlpha = 0.6; P.path(g, [0, 3, 6, 1.6, 6, 4.4]); P.fill(g, '#6a2a9a'); g.restore();
    P.path(g, [5, 3, 8, 0.6, 11.6, 3, 8, 5.4]); P.fill(g, P.lg(g, 5, 0, 12, 6, ['#f0c0ff', '#be50ff', '#5a1a8a']));
    g.strokeStyle = '#ffffff'; g.lineWidth = 0.3; g.beginPath(); g.moveTo(7, 3); g.lineTo(9.6, 3); g.moveTo(8.3, 1.8); g.lineTo(8.3, 4.2); g.stroke();
  } });
  def('rift_p', { w: 14, h: 10, outline: 0, draw(g) {
    P.glow(g, 7, 5, 7, '#b050ff', 0.7);
    g.beginPath(); g.moveTo(1, 5); g.quadraticCurveTo(7, -1, 13, 5); g.quadraticCurveTo(7, 11, 1, 5); P.fill(g, P.rg(g, 7, 5, 6, ['#ffffff', '#c070ff', '#40106a']));
  } });
  /* ---------- power-up runes (barrel drops), lament shard, hex obelisk ---------- */
  const RUNES = { rune_fury: ['#ff3a30', 'fist'], rune_haste: ['#ffd040', 'bolt'], rune_wraith: ['#80e8ff', 'wisp'] };
  Object.keys(RUNES).forEach((k) => {
    const [col, glyph] = RUNES[k];
    def(k, { w: 11, h: 12, draw(g) {
      P.glow(g, 5.5, 6, 6, col, 0.55);
      P.path(g, [5.5, 0.6, 10, 4.2, 8.6, 10.6, 2.4, 10.6, 1, 4.2]);
      P.fill(g, P.lg(g, 1, 0.6, 10, 10.6, ['#6a6070', '#3a3440', '#1c1822']));
      g.strokeStyle = sh(col, 0.2); g.lineWidth = 0.55;
      if (glyph === 'fist') { g.beginPath(); g.moveTo(3.6, 8); g.lineTo(5.5, 3.2); g.lineTo(7.4, 8); g.moveTo(4.2, 6.4); g.lineTo(6.8, 6.4); g.stroke(); }
      else if (glyph === 'bolt') { g.beginPath(); g.moveTo(6.4, 2.8); g.lineTo(4.2, 6.2); g.lineTo(6.6, 6.2); g.lineTo(4.6, 9.2); g.stroke(); }
      else { g.beginPath(); g.arc(5.5, 5.6, 2.2, 0.3, Math.PI * 1.8); g.moveTo(5.5, 7.8); g.lineTo(5.5, 9.4); g.stroke(); }
      P.circle(g, 5.5, 2.4, 0.5, 'rgba(255,255,255,0.8)');
    } });
  });
  def('shard', { w: 8, h: 11, draw(g) {
    P.glow(g, 4, 6, 5.5, '#ff40a0', 0.6);
    P.path(g, [4, 0.4, 6.8, 5, 5, 10.4, 2.6, 9, 1.2, 4]); P.fill(g, P.lg(g, 1, 0, 7, 10, ['#ffc0e8', '#d0308a', '#4a0a3a']));
    P.path(g, [4, 0.4, 6.8, 5, 4.2, 5.6]); P.fill(g, 'rgba(255,255,255,0.45)');
  } });
  def('hexstone', { w: 18, h: 30, cy: 26, frames: 2, draw(g, f) {
    P.ell(g, 9, 27, 8, 2.4, 'rgba(0,0,0,0.5)');
    P.path(g, [4, 27, 5.4, 6, 9, 1, 12.6, 6, 14, 27]); P.fill(g, P.lg(g, 4, 0, 14, 0, ['#4a4458', '#2a2434', '#120e18']));
    P.path(g, [9, 1, 12.6, 6, 14, 27, 11, 27]); P.fill(g, 'rgba(0,0,0,0.3)');
    const a = f ? 0.95 : 0.7;
    g.strokeStyle = 'rgba(220,120,255,' + a + ')'; g.lineWidth = 0.7;
    g.beginPath(); g.arc(9, 12, 2.4, 0, Math.PI * 2); g.moveTo(9, 8.6); g.lineTo(9, 21); g.moveTo(6.4, 17); g.lineTo(11.6, 17); g.moveTo(7, 20.4); g.lineTo(11, 23.6); g.stroke();
    P.glow(g, 9, 12, 7, '#c060ff', f ? 0.7 : 0.45);
    P.rrect(g, 2.4, 25.6, 13.2, 2.4, 0.6, P.lg(g, 0, 25, 0, 28, ['#5a5468', '#241e2c']));
  } });
  /* ---------- Artifact relic (dropped by Lords in Agony) and the Black Ulcer crystal ---------- */
  def('artifact', { w: 12, h: 14, frames: 2, draw(g, f) {
    P.glow(g, 6, 7, 7, '#ff70ff', f ? 0.8 : 0.55);
    P.path(g, [6, 0.6, 11, 4, 11, 10, 6, 13.4, 1, 10, 1, 4]); P.fill(g, P.lg(g, 1, 0, 11, 13, ['#fff0b0', '#c89030', '#5a3a10']));
    P.path(g, [6, 2.6, 9.2, 4.8, 9.2, 9.2, 6, 11.4, 2.8, 9.2, 2.8, 4.8]); P.fill(g, P.rg(g, 5, 5, 6, ['#ffd0ff', '#b040c0', '#3a0a4a']));
    P.circle(g, 6, 7, 1.4, f ? '#ffffff' : '#ffc0ff'); P.rect(g, 4.4, 4.4, 1, 1, '#ffffff');
  } });
  def('bucket', { w: 10, h: 10, draw(g) {
    P.glow(g, 5, 6, 5, '#5ab8ff', 0.45);
    g.strokeStyle = '#c8ccd8'; g.lineWidth = 0.7; g.beginPath(); g.arc(5, 3.6, 3.4, Math.PI, 0); g.stroke();
    P.path(g, [1.4, 3.6, 8.6, 3.6, 7.6, 9.6, 2.4, 9.6]); P.fill(g, P.lg(g, 1, 0, 9, 0, ['#5a3a1a', '#a0703a', '#4a2a10']));
    P.rect(g, 1.6, 5, 6.8, 0.8, '#6a6e7a'); P.rect(g, 2.1, 8, 5.8, 0.8, '#6a6e7a');
    P.ell(g, 5, 3.7, 3.5, 0.9, P.lg(g, 0, 3, 0, 5, ['#bfe8ff', '#3a8ad0']));
  } });
  def('ulcer', { w: 8, h: 11, draw(g) {
    P.glow(g, 4, 6, 5, '#8040c0', 0.5);
    P.path(g, [4, 0.4, 7, 4.6, 5.4, 10.4, 2.6, 10.4, 1, 4.6]); P.fill(g, P.lg(g, 1, 0, 7, 10, ['#6a4a7a', '#1a0a20', '#000000']));
    P.path(g, [4, 0.4, 7, 4.6, 4.2, 5]); P.fill(g, 'rgba(200,140,255,0.4)');
  } });

  /* ---------- Halls of Discord light puzzle ---------- */
  def('relay', { w: 14, h: 20, cy: 16, frames: 2, draw(g, f) {
    P.ell(g, 7, 17.4, 6.4, 2.2, 'rgba(0,0,0,0.5)');
    P.path(g, [1.4, 16, 3, 13.4, 11, 13.4, 12.6, 16, 11, 18.6, 3, 18.6]); P.fill(g, P.lg(g, 0, 13, 0, 19, ['#6a5a78', '#2e2438']));
    P.rect(g, 5, 8, 4, 6, P.lg(g, 5, 0, 9, 0, ['#4a3e58', '#221a2c']));
    P.path(g, [7, 1.4, 10.4, 5, 7, 9.4, 3.6, 5]); P.fill(g, P.lg(g, 4, 1, 10, 9, f ? ['#ffffff', '#e0b0ff', '#8a40d0'] : ['#b8a0d0', '#6a4a8a', '#2e1a44']));
    if (f) P.glow(g, 7, 5, 7, '#c070ff', 0.8);
  } });
  def('lightsrc', { w: 16, h: 20, cy: 16, frames: 2, draw(g, f) {
    P.ell(g, 8, 17.6, 6.6, 2, 'rgba(0,0,0,0.5)');
    P.path(g, [2, 11, 14, 11, 12, 17.6, 4, 17.6]); P.fill(g, P.lg(g, 0, 11, 0, 18, ['#5a4a3a', '#1e1610']));
    P.rect(g, 1.4, 10, 13.2, 1.6, '#8a6a40');
    P.glow(g, 8, 6, 9, '#b060ff', f ? 0.95 : 0.75);
    g.beginPath(); g.moveTo(8, f ? 0.4 : 1.4); g.quadraticCurveTo(12.6, 6, 10.6, 10.4); g.lineTo(5.4, 10.4); g.quadraticCurveTo(3.4, 6, 8, f ? 0.4 : 1.4); P.fill(g, P.lg(g, 0, 0, 0, 10, ['#ffffff', '#e0a0ff', '#7a30c0']));
  } });
  def('monolith', { w: 20, h: 38, cy: 33, frames: 2, draw(g, f) {
    P.ell(g, 10, 35, 9, 2.6, 'rgba(0,0,0,0.55)');
    P.path(g, [3, 35, 17, 35, 15.4, 4, 10, 0.6, 4.6, 4]); P.fill(g, P.lg(g, 3, 0, 17, 35, ['#3a3044', '#18121e', '#070409']));
    P.path(g, [10, 0.6, 15.4, 4, 13.6, 6, 10, 3.6]); P.fill(g, 'rgba(255,255,255,0.12)');
    const rune = f ? '#e8b0ff' : '#5a3a78';
    g.strokeStyle = rune; g.lineWidth = 0.8; g.beginPath();
    g.moveTo(10, 8); g.lineTo(10, 30); g.moveTo(7, 12); g.lineTo(13, 16); g.moveTo(13, 20); g.lineTo(7, 24); g.moveTo(7.6, 28); g.lineTo(12.4, 28); g.stroke();
    if (f) { P.glow(g, 10, 18, 12, '#b060ff', 0.7); P.glow(g, 10, 4, 5, '#ffffff', 0.6); }
  } });

  /* ---------- Hall secrets ---------- */
  // a torn page: bloodied (crypt), scorched (abyss), torn (aqueduct), frosted (catacombs), rooted (blightmire)
  def('page', { w: 12, h: 12, frames: 2, colors: { ink: '#7a1018', edge: '#b02030', glow: '#ff4050' },
    variants: { fire: { ink: '#3a1808', edge: '#2a1206', glow: '#ff8a30' }, drowned: { ink: '#2a3a40', edge: '#6a7a80', glow: '#70ffd0' }, ice: { ink: '#1a3a5a', edge: '#a8d8f0', glow: '#8ff0ff' }, bog: { ink: '#2e3a10', edge: '#6a8a20', glow: '#b0ff50' } },
    draw(g, f, c) {
      P.glow(g, 6, 6, 7, c.glow, f ? 0.7 : 0.45);
      g.save(); g.translate(6, 6); g.rotate(-0.18);
      P.path(g, [-4, -5, 3.4, -5.2, 4.4, -2, 4, 5, -3.6, 5.2, -4.4, 1]); P.fill(g, P.lg(g, -4, -5, 4, 5, ['#f0e2c0', '#d8c49a', '#a88c60']));
      P.path(g, [3.4, -5.2, 4.4, -2, 2.4, -3]); P.fill(g, 'rgba(0,0,0,0.25)');
      g.strokeStyle = G.rgba(c.ink, 0.8); g.lineWidth = 0.5; g.beginPath();
      for (let i = 0; i < 4; i++) { g.moveTo(-2.8, -2.6 + i * 2); g.lineTo(2.4 - (i % 2), -2.6 + i * 2); } g.stroke();
      P.circle(g, -1.6, 3, 1.3, G.rgba(c.edge, 0.85)); P.circle(g, 1.8, -3.6, 0.8, G.rgba(c.edge, 0.7));
      g.restore();
    } });
  // a stone altar; the Altar of Pain bleeds, the Altar of Embers holds the Ember Eye
  def('altar', { w: 22, h: 22, cy: 18, frames: 2, colors: { stone: '#4a4050', rune: '#ff3040', top: '#7a1018' },
    variants: { fire: { stone: '#4a3028', rune: '#ff9a30', top: '#ffb040' } },
    draw(g, f, c) {
      P.ell(g, 11, 19.4, 10, 2.6, 'rgba(0,0,0,0.5)');
      P.path(g, [2, 19, 4, 9, 18, 9, 20, 19]); P.fill(g, P.lg(g, 2, 0, 20, 0, [sh(c.stone, 0.25), c.stone, sh(c.stone, -0.5)]));
      P.rrect(g, 1.4, 6.6, 19.2, 3.2, 0.8, P.lg(g, 0, 6, 0, 10, [sh(c.stone, 0.45), sh(c.stone, -0.2)]));
      g.strokeStyle = G.rgba(c.rune, f ? 0.95 : 0.6); g.lineWidth = 0.7; g.beginPath();
      g.moveTo(7, 12); g.lineTo(11, 16.6); g.lineTo(15, 12); g.moveTo(11, 11.4); g.lineTo(11, 16.6); g.stroke();
      P.ell(g, 11, 6.6, 5, 1.6, c.top); P.glow(g, 11, 6, 7, c.rune, f ? 0.75 : 0.45);
      P.circle(g, 11, 4.8, 1.6, P.rg(g, 10.4, 4.2, 2, ['#ffffff', c.rune, sh(c.rune, -0.5)]));
    } });
  // a skeleton statue pointing the way (drawn with the arm up; the arrow is added in the world)
  def('statue', { w: 14, h: 28, cy: 25, frames: 1, draw(g) {
    P.ell(g, 7, 25.6, 6.6, 2, 'rgba(0,0,0,0.5)');
    P.rrect(g, 1.4, 22, 11.2, 3.6, 0.6, P.lg(g, 0, 22, 0, 26, ['#6a5a4a', '#2e241a']));
    const bone = P.lg(g, 3, 0, 11, 0, ['#d8ccb0', '#a89a7c', '#6a5e48']);
    P.path(g, [5.2, 22, 5.6, 14, 8.4, 14, 8.8, 22]); P.fill(g, bone);
    P.rrect(g, 4.4, 9, 5.2, 6, 1.2, bone);
    g.strokeStyle = '#c8bca0'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(9, 10.6); g.lineTo(13, 6); g.moveTo(5, 10.6); g.lineTo(3, 15); g.stroke();
    P.circle(g, 7, 6, 3.2, P.vol(g, 7, 6, 3.2, '#d8ccb0')); P.circle(g, 5.9, 6, 0.8, '#ff7a20'); P.circle(g, 8.1, 6, 0.8, '#ff7a20');
    P.glow(g, 7, 6, 4, '#ff7a20', 0.5);
  } });
  // the black raven on the viaduct
  def('raven', { w: 14, h: 12, cy: 10, frames: 2, draw(g, f) {
    P.ell(g, 7, 10.6, 4.6, 1.2, 'rgba(0,0,0,0.4)');
    P.glow(g, 7, 6, 8, '#a8c8ff', 0.35); // a pale sheen so it reads on the dark stones
    const body = P.lg(g, 0, 0, 14, 12, ['#3a3a4a', '#141420', '#050508']);
    if (f) { P.path(g, [7, 6, 0.4, 1, 3, 6.6]); P.fill(g, body); P.path(g, [7, 6, 13.6, 1, 11, 6.6]); P.fill(g, body); }
    P.ell(g, 7, 7, 3.4, 2.6, body); P.path(g, [4, 7.6, 0.8, 9.4, 3.8, 8.8]); P.fill(g, body);
    P.circle(g, 10, 5, 2, body); P.path(g, [11.6, 4.6, 14, 5.4, 11.6, 6]); P.fill(g, '#2a2418');
    P.circle(g, 10.6, 4.6, 0.7, '#ff3040'); P.glow(g, 10.6, 4.6, 2.4, '#ff3040', 0.8);
    g.strokeStyle = '#1a1410'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(6.4, 9.4); g.lineTo(6.2, 10.6); g.moveTo(7.8, 9.4); g.lineTo(8, 10.6); g.stroke();
  } });
  // a sealed sarcophagus (breakable): a coffin of stone, a cross and a skull carved on its lid, a chain and padlock round it,
  // cold light leaking through its cracks
  def('sarcophagus', { w: 26, h: 18, cy: 14, frames: 1, draw(g) {
    const st = '#8a9490', sl = '#c8d2ce', sd = '#2a3232', lite = '#70ffd0';
    P.ell(g, 13, 15.4, 12.6, 2.2, 'rgba(0,0,0,0.55)');
    P.glow(g, 13, 8, 10, lite, 0.25);
    // the side of the coffin
    P.path(g, [1.2, 6.4, 5, 10.4, 23, 9.2, 24.8, 6.4, 24.8, 10.8, 23, 13.8, 5, 15, 1.2, 11]); P.fill(g, P.lg(g, 0, 7, 0, 15, [sh(st, -0.2), sh(st, -0.45), sd]));
    // the lid: a long coffin shape, wide at the shoulders, its lip standing out
    P.path(g, [1.2, 6.4, 5, 2.2, 23, 3.4, 24.8, 6.4, 23, 9.2, 5, 10.4]); P.fill(g, P.lg(g, 3, 2, 20, 10, [sl, st, sh(st, -0.2)]));
    g.strokeStyle = sd; g.lineWidth = 0.6; g.beginPath(); g.moveTo(1.2, 6.4); g.lineTo(5, 10.4); g.lineTo(23, 9.2); g.lineTo(24.8, 6.4); g.stroke(); // the seam
    // carved on the lid: a skull at the head, a long cross
    P.circle(g, 5.4, 6.2, 1.5, P.vol(g, 5, 5.8, 1.5, '#e0e8e4')); P.circle(g, 5, 6.1, 0.4, sd); P.circle(g, 6, 6, 0.4, sd);
    P.rect(g, 8.4, 5.8, 13, 0.9, sh(st, -0.35)); P.rect(g, 11.4, 3.8, 0.9, 5, sh(st, -0.35));
    // cracks with the light leaking out
    g.strokeStyle = lite; g.lineWidth = 0.45; g.beginPath(); g.moveTo(15, 9.8); g.lineTo(14.2, 11.8); g.lineTo(15.4, 13); g.lineTo(14.8, 14.6); g.moveTo(20, 3.4); g.lineTo(18.6, 5.2); g.lineTo(19.4, 6.4); g.stroke();
    P.glow(g, 14.8, 12, 3, lite, 0.6); P.glow(g, 19, 5, 2, lite, 0.5);
    // a chain round it, a padlock hanging
    g.strokeStyle = '#5a5a62'; g.lineWidth = 0.8; g.setLineDash([0.9, 0.45]); g.beginPath(); g.moveTo(8.6, 2.6); g.lineTo(9.6, 14.6); g.stroke(); g.setLineDash([]);
    P.rrect(g, 8.4, 11.4, 2.6, 2.4, 0.5, P.lg(g, 8.4, 11.4, 11, 13.8, ['#c8a040', '#6a4a14'])); P.rect(g, 9.5, 12.2, 0.4, 0.9, '#1a1004');
  } });
  // a hovering will-o'-wisp orb (catacombs) / a glowing root (blightmire)
  def('wisp', { w: 12, h: 18, cy: 15, frames: 2, colors: { glow: '#8ff0ff' }, variants: { bog: { glow: '#b0ff50' } }, draw(g, f, c) {
    P.ell(g, 6, 16.4, 3.4, 1, 'rgba(0,0,0,0.35)');
    P.glow(g, 6, 7, 7, c.glow, f ? 0.95 : 0.7);
    P.circle(g, 6, 7 - (f ? 0.6 : 0), 2.6, P.rg(g, 5.4, 6.2, 3, ['#ffffff', c.glow, sh(c.glow, -0.5)]));
  } });
  def('root', { w: 20, h: 12, cy: 9, frames: 2, draw(g, f) {
    P.glow(g, 10, 6, 9, '#b0ff50', f ? 0.6 : 0.4);
    g.strokeStyle = '#3a2a14'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(1, 9); g.quadraticCurveTo(6, 3, 10, 7); g.quadraticCurveTo(14, 11, 19, 4); g.stroke();
    g.strokeStyle = f ? '#d8ff80' : '#90c040'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(1, 9); g.quadraticCurveTo(6, 3, 10, 7); g.quadraticCurveTo(14, 11, 19, 4); g.stroke();
    P.circle(g, 10, 7, 1, '#f0ffc0');
  } });
  // the Evil Tree of the Blightmire (breakable): a twisted dead tree with a screaming face in its trunk, branches reaching
  // out like clawed hands, glowing pods hanging from them on threads, roots clutching the mud
  def('eviltree', { w: 34, h: 44, cy: 40, frames: 2, draw(g, f) {
    const b = '#4a3a22', bl = sh(b, 0.45), bd = sh(b, -0.55), lite = f ? '#e8ff60' : '#b0ff50', sw = f ? 0.8 : -0.8;
    P.ell(g, 17, 41, 15, 2.8, 'rgba(0,0,0,0.55)');
    P.glow(g, 17, 22, 14, '#b0ff50', f ? 0.3 : 0.2);
    // roots clutching the ground
    for (const [x0, x1, y1] of [[12, 3, 42.4], [14, 7, 43], [21, 27, 43], [23, 32, 42]]) P.limb(g, x0, 38, x1, y1, 2.4, 0.6, bd);
    // the trunk: twisted, narrowing, split into crooked limbs that end in twig claws
    const limbs = [[14, 16, 8, 10, 3 + sw, 6], [16, 14, 15, 7, 13 + sw * 0.6, 2.4], [20, 14, 24, 8, 28 + sw, 4.4], [21, 18, 27, 15, 32, 13 + sw]];
    for (const [x0, y0, mx, my, tx, ty] of limbs) { P.limb(g, x0, y0, mx, my, 2.4, 1.6, b); P.limb(g, mx, my, tx, ty, 1.6, 0.7, bl);
      const a = Math.atan2(ty - my, tx - mx); for (const d of [-0.6, 0, 0.6]) P.line(g, tx, ty, tx + Math.cos(a + d) * 2.2, ty + Math.sin(a + d) * 2.2, 0.45, bl); }
    g.beginPath(); g.moveTo(10.6, 40); g.bezierCurveTo(13, 32, 11, 24, 13.6, 15); g.lineTo(21.4, 15); g.bezierCurveTo(23, 24, 21, 32, 24.6, 40); g.closePath();
    P.fill(g, P.lg(g, 10, 15, 25, 40, [bl, b, bd]));
    g.strokeStyle = bd; g.lineWidth = 0.6; for (const [x0, x1] of [[14, 12.4], [17.6, 18.6], [20.6, 22.6]]) { g.beginPath(); g.moveTo(x0, 16); g.bezierCurveTo(x0 - 1, 24, x1 + 1, 32, x1, 39.6); g.stroke(); }
    // the face: hollow eyes burning, a long screaming maw
    P.ell(g, 15.2, 21.4, 1.8, 2.2, '#0a0602'); P.ell(g, 20.2, 21.2, 1.7, 2.1, '#0a0602');
    P.circle(g, 15.4, 21.6, 0.9, lite); P.circle(g, 20.2, 21.4, 0.85, lite); P.glow(g, 17.8, 21.4, 5, lite, 0.6);
    P.path(g, [14.6, 18.6, 16.8, 19.8, 17.2, 19.4]); P.fill(g, bd); P.path(g, [21.4, 18.4, 19.2, 19.6, 18.8, 19.2]); P.fill(g, bd); // the brows
    P.ell(g, 17.6, 28, 2.4, 4.2 + (f ? 0.6 : 0), '#0a0602'); P.glow(g, 17.6, 28.6, 3, lite, 0.3);
    P.line(g, 17, 32.4, 17, 34.6 + (f ? 0.8 : 0), 0.4, G.rgba(lite, 0.8));
    // pods hanging from the branches on threads, glowing
    for (const [x, y, l] of [[8, 10, 5], [25, 9, 6], [29.6, 14.6, 4]]) { P.line(g, x, y, x + sw * 0.3, y + l, 0.25, '#6a5a3a'); P.ell(g, x + sw * 0.3, y + l + 1.2, 1.1, 1.4, P.rg(g, x + sw * 0.3 - 0.3, y + l + 0.8, 1.4, [[0, '#f4ffc0'], [0.5, lite], [1, '#4a6a10']])); P.glow(g, x + sw * 0.3, y + l + 1.2, 2.6, lite, 0.4); }
  } });

  /* ---------- Environmental hazards ---------- */
  // an iron brazier on three clawed legs, embers heaped in its bowl; strike it and it tips its fire across the floor
  def('brazier', { w: 14, h: 22, cy: 20, frames: 2, draw(g, f) {
    P.ell(g, 7, 20.4, 5.8, 1.6, 'rgba(0,0,0,0.5)');
    g.lineCap = 'round';
    for (const [x2, c] of [[2.2, '#3a3642'], [11.8, '#26222c'], [7, '#4a4654']]) { P.line(g, 7, 12.4, x2, 19.8, 1.5, '#0c0a10'); P.line(g, 7, 12.4, x2, 19.8, 0.8, c); P.ell(g, x2, 20, 1, 0.5, '#1a1620'); }
    P.circle(g, 7, 15.4, 1, '#0c0a10'); P.circle(g, 7, 15.4, 0.6, '#6a6472');
    P.path(g, [1, 8.6, 13, 8.6, 10.8, 13, 3.2, 13]); g.strokeStyle = '#0c0a10'; g.lineWidth = 0.7; g.stroke(); P.fill(g, P.lg(g, 1, 0, 13, 0, ['#7a7484', '#b8b2c4', '#3a3444', '#1e1a24']));
    for (const x of [3.4, 7, 10.6]) { P.circle(g, x, 10.8, 0.4, '#1a1620'); P.circle(g, x - 0.1, 10.7, 0.22, '#c8c2d4'); }
    P.rect(g, 0.6, 8, 12.8, 1.2, P.lg(g, 0, 0, 14, 0, ['#9a94a4', '#5a5464']));
    P.ell(g, 7, 8.4, 5.6, 1.3, '#1a1210'); P.ell(g, 7, 8.2, 4.8, 1, P.lg(g, 2, 8, 12, 8, ['#a02808', '#ffc040', '#a02808']));
    P.glow(g, 7, 5, 8, '#ff8a20', f ? 0.85 : 0.65);
    const tongue = (x, w, top, lean, col) => { g.beginPath(); g.moveTo(x - w, 8.2); g.quadraticCurveTo(x - w * 0.6, top + (8.2 - top) * 0.4, x + lean, top); g.quadraticCurveTo(x + w * 0.7, top + (8.2 - top) * 0.45, x + w, 8.2); g.closePath(); P.fill(g, col); };
    const fl = P.lg(g, 0, 0, 0, 8.2, ['#fff0a0', '#ffa030', '#d03808']);
    tongue(4.4, 1.3, f ? 3 : 4.2, f ? -0.7 : 0.3, fl); tongue(9.6, 1.3, f ? 4 : 2.6, f ? 0.6 : -0.3, fl); tongue(7, 2, f ? 0.4 : 1.2, f ? 0.5 : -0.5, fl);
    tongue(7, 0.9, f ? 3.4 : 4, f ? 0.2 : -0.2, '#fff6d0');
    for (const [x, y] of f ? [[3, 1.4], [11.4, 0.6]] : [[4.6, 0.4], [10.4, 2]]) P.circle(g, x, y, 0.35, '#ffd070');
  } });
  // a cluster of ice spikes risen from the floor: faceted, cloudy, rimed at the foot
  def('icespike', { w: 16, h: 20, cy: 18, frames: 1, draw(g) {
    P.ell(g, 8, 18.4, 7.4, 1.8, 'rgba(0,0,0,0.45)');
    P.glow(g, 8, 11, 8, '#8fe0ff', 0.4);
    const spike = (xb, w, tx, ty) => {
      const x0 = xb - w / 2, x1 = xb + w / 2, rx = xb + (tx - xb) * 0.15 + w * 0.08;
      P.path(g, [x0, 18, tx, ty, x1, 18]); g.strokeStyle = '#0c1826'; g.lineWidth = 0.6; g.stroke();
      P.path(g, [x0, 18, tx, ty, rx, 18]); P.fill(g, P.lg(g, x0, ty, rx, 18, ['#ffffff', '#b8e6ff', '#6ab0e0']));
      P.path(g, [rx, 18, tx, ty, x1, 18]); P.fill(g, P.lg(g, rx, 0, x1, 0, ['#5a9ccc', '#24507e']));
      P.line(g, tx, ty + 0.4, rx, 18, 0.25, 'rgba(255,255,255,0.85)');
    };
    spike(3.6, 4, 3, 8.4); spike(12.6, 4.4, 13.4, 7); spike(8, 6, 7.6, 0.8); spike(5.6, 2.6, 5.2, 13); spike(10.6, 2.8, 11.2, 13.6);
    g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 0.25; g.beginPath(); g.moveTo(8.4, 6); g.lineTo(7.8, 9); g.lineTo(8.6, 11); g.stroke();
    for (const [x, rx] of [[2.6, 2.4], [8, 3], [13.4, 2.4]]) P.ell(g, x, 17.8, rx, 1, P.lg(g, 0, 16.8, 0, 18.8, ['#ffffff', '#c8e4f4']));
  } });
})(window.DH);
