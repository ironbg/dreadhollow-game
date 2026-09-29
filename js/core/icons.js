/* UI icons: vector glyphs drawn on a 32x32 grid, then turned into pixel art with the same palette,
 * bevel and outline as the sprites (shown with image-rendering: pixelated). DH.icons.img(name) -> <img>. Names:
 *   i_gold i_gem i_energy i_revive i_reroll · n_* nav · c_wood/c_silver/c_gold chests · h_<hero> portraits
 *   ab_<ability> · tr_<trait> · g_<item> · p_<potion> · herb_<herb> · a_<artifact> · m_<hero> marks · s_<slot> */
(function (DH) {
  'use strict';
  const G = DH.gfx, P = G.P, sh = G.shade, C = DH.content;
  const SIZE = 64, U2 = SIZE / 32; // 2 icon pixels per unit of the 32x32 design box (same density as sprites)
  const cache = {};

  const ELEM = { fire: '#e8602a', lightning: '#e8c020', ice: '#3aa8e8', magic: '#9a50e0', physical: '#8a92a6', summon: '#40b080', area: '#c07030' };
  function badge(g, col, round) {
    if (round) { P.circle(g, 16, 16, 14.5, P.lg(g, 0, 2, 0, 30, [sh(col, 0.25), sh(col, -0.45)])); g.strokeStyle = sh(col, 0.45); g.lineWidth = 1.2; g.beginPath(); g.arc(16, 16, 14, 0, Math.PI * 2); g.stroke(); return; }
    P.rrect(g, 1.5, 1.5, 29, 29, 7, P.lg(g, 0, 1.5, 0, 30, [sh(col, 0.2), sh(col, -0.5)]));
    g.strokeStyle = sh(col, 0.45); g.lineWidth = 1.1; P.rrect(g, 2.1, 2.1, 27.8, 27.8, 6.5); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.10)'; g.beginPath(); g.ellipse(16, 7, 12, 5, 0, 0, Math.PI * 2); g.fill();
  }
  const W = '#f6f0e4', WD = '#c8c0b0';

  /* ---------- glyphs (light, drawn over a badge or on their own) ---------- */
  const GL = {
    sword(g) { P.path(g, [9, 23, 22, 6, 25, 5, 24, 8, 11, 25]); P.fill(g, P.lg(g, 9, 5, 25, 25, [W, WD])); P.line(g, 8, 20, 14, 26, 2, '#e0b040'); P.line(g, 10, 24, 6, 28, 2.4, '#6a4428'); },
    bow(g) { g.beginPath(); g.arc(10, 16, 11, -1.1, 1.1); g.strokeStyle = '#c8905a'; g.lineWidth = 2.4; g.stroke(); P.line(g, 10 + Math.cos(-1.1) * 11, 16 + Math.sin(-1.1) * 11, 10 + Math.cos(1.1) * 11, 16 + Math.sin(1.1) * 11, 0.8, W); P.line(g, 8, 16, 26, 16, 1.4, WD); P.path(g, [24, 13, 28, 16, 24, 19]); P.fill(g, W); },
    hammer(g) { P.line(g, 10, 26, 18, 12, 2.4, '#8a5a30'); g.save(); g.translate(19, 10); g.rotate(0.5); P.rrect(g, -7, -4, 14, 8, 1.5, P.lg(g, 0, -4, 0, 4, ['#fff6d0', '#e8c050'])); g.restore(); },
    flame(g, c) { g.beginPath(); g.moveTo(16, 4); g.bezierCurveTo(24, 12, 26, 18, 22, 24); g.quadraticCurveTo(16, 30, 10, 24); g.bezierCurveTo(6, 18, 10, 14, 12, 10); g.quadraticCurveTo(13, 15, 15, 15); g.quadraticCurveTo(13, 9, 16, 4); P.fill(g, P.lg(g, 0, 4, 0, 28, [c || '#ffe070', '#ff7a20', '#c02810'])); g.beginPath(); g.moveTo(16, 14); g.quadraticCurveTo(21, 20, 18, 25); g.quadraticCurveTo(15, 27, 13, 24); g.quadraticCurveTo(12, 19, 16, 14); P.fill(g, '#fff4b0'); },
    wisp(g) { P.glow(g, 16, 14, 11, '#d090ff', 0.8); g.beginPath(); g.moveTo(16, 6); g.bezierCurveTo(24, 8, 24, 18, 18, 22); g.quadraticCurveTo(16, 28, 20, 30); g.quadraticCurveTo(12, 28, 12, 22); g.bezierCurveTo(8, 18, 8, 8, 16, 6); P.fill(g, 'rgba(240,220,255,0.95)'); P.circle(g, 14, 14, 1.4, '#4a1a6a'); P.circle(g, 18.5, 14, 1.4, '#4a1a6a'); },
    shield(g, c) { g.beginPath(); g.moveTo(7, 6); g.lineTo(25, 6); g.lineTo(24.5, 16); g.quadraticCurveTo(22, 24, 16, 28); g.quadraticCurveTo(10, 24, 7.5, 16); g.closePath(); P.fill(g, P.lg(g, 7, 6, 25, 28, [sh(c || '#6a8ad0', 0.35), c || '#4a6ab0', sh(c || '#4a6ab0', -0.4)])); g.strokeStyle = '#e8c860'; g.lineWidth = 1.6; g.stroke(); P.rrect(g, 15, 9, 2, 15, 0.5, '#e8c860'); P.rrect(g, 10, 13, 12, 2, 0.5, '#e8c860'); },
    bolt(g) { P.path(g, [19, 3, 9, 18, 15, 18, 12, 29, 24, 12, 17, 12]); P.fill(g, P.lg(g, 9, 3, 24, 29, ['#fffbd0', '#ffe040', '#e0a010'])); },
    wolf(g) { P.path(g, [6, 12, 9, 4, 13, 10, 19, 10, 23, 4, 26, 12, 25, 20, 16, 28, 7, 20]); P.fill(g, P.lg(g, 0, 4, 0, 28, ['#f0f6ff', '#9aaac0'])); P.path(g, [11, 15, 14, 16, 11, 17]); P.fill(g, '#40c0ff'); P.path(g, [21, 15, 18, 16, 21, 17]); P.fill(g, '#40c0ff'); P.path(g, [14, 22, 18, 22, 16, 25]); P.fill(g, '#2a2a34'); },
    axe(g) { P.line(g, 8, 27, 20, 8, 2.4, '#8a5a30'); g.beginPath(); g.moveTo(17, 7); g.quadraticCurveTo(28, 4, 29, 14); g.quadraticCurveTo(24, 13, 21, 16); g.closePath(); P.fill(g, P.lg(g, 17, 4, 29, 16, [W, '#98a0b0'])); },
    orb(g, c) { P.glow(g, 16, 16, 13, c || '#80e0ff', 0.7); P.circle(g, 16, 16, 7.5, P.vol(g, 16, 16, 7.5, c || '#a0f0ff')); P.circle(g, 13.5, 13, 2, 'rgba(255,255,255,0.85)'); },
    drop(g) { g.beginPath(); g.moveTo(16, 4); g.bezierCurveTo(22, 13, 25, 17, 25, 21); g.arc(16, 21, 9, 0, Math.PI); g.bezierCurveTo(7, 17, 10, 13, 16, 4); P.fill(g, P.lg(g, 7, 4, 25, 30, ['#ff7080', '#d0182c', '#6a0a14'])); P.ell(g, 13, 20, 2, 3.5, 'rgba(255,255,255,0.5)', 0.3); },
    scythe(g) { P.line(g, 12, 29, 18, 5, 2, '#5a4a5a'); g.beginPath(); g.moveTo(18, 5); g.quadraticCurveTo(6, 0, 3, 13); g.quadraticCurveTo(8, 7, 18, 9); g.closePath(); P.fill(g, P.lg(g, 3, 2, 18, 12, ['#9aa4b8', W])); },
    lance(g) { P.glow(g, 16, 16, 12, '#c060ff', 0.6); P.path(g, [4, 28, 26, 6, 28, 4, 26, 10, 7, 29]); P.fill(g, P.lg(g, 4, 28, 28, 4, ['#8a30d0', '#e8b0ff', W])); },
    chakram(g) { for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; P.path(g, [16 + Math.cos(a) * 5, 16 + Math.sin(a) * 5, 16 + Math.cos(a + 0.6) * 13, 16 + Math.sin(a + 0.6) * 13, 16 + Math.cos(a + 1.1) * 6, 16 + Math.sin(a + 1.1) * 6]); P.fill(g, W); } g.beginPath(); g.arc(16, 16, 6, 0, Math.PI * 2); g.strokeStyle = '#e8c050'; g.lineWidth = 2.4; g.stroke(); },
    orbs(g) { g.strokeStyle = 'rgba(255,240,200,0.6)'; g.lineWidth = 1; g.beginPath(); g.ellipse(16, 16, 12, 5, -0.4, 0, Math.PI * 2); g.stroke(); [[6, 20], [26, 12], [16, 16]].forEach(([x, y], i) => P.circle(g, x, y, i === 2 ? 5 : 3.2, P.vol(g, x, y, 5, i === 2 ? '#d0d8e8' : '#e8c870'))); },
    dagger(g) { for (const o of [-4, 4]) { P.path(g, [10 + o, 22, 24 + o, 6, 25 + o, 9, 12 + o, 24]); P.fill(g, P.lg(g, 10, 6, 25, 24, [W, WD])); P.line(g, 8 + o, 20, 13 + o, 25, 1.4, '#e0b040'); } },
    breath(g) { g.beginPath(); g.moveTo(5, 16); g.quadraticCurveTo(18, 2, 29, 6); g.quadraticCurveTo(24, 16, 29, 26); g.quadraticCurveTo(18, 30, 5, 16); P.fill(g, P.lg(g, 5, 0, 29, 0, ['#fff4b0', '#ffa030', '#e04010'])); P.circle(g, 6, 16, 3.4, '#8a2a1a'); },
    sphere(g) { P.glow(g, 16, 16, 14, '#fff080', 0.8); P.circle(g, 16, 16, 7, P.vol(g, 16, 16, 7, '#fff6a0')); g.strokeStyle = '#ffffff'; g.lineWidth = 1.2; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i; g.moveTo(16 + Math.cos(a) * 7, 16 + Math.sin(a) * 7); g.lineTo(16 + Math.cos(a + 0.2) * 12, 16 + Math.sin(a + 0.2) * 12); } g.stroke(); },
    sun(g) { P.glow(g, 16, 16, 14, '#ffe080', 0.7); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; P.path(g, [16 + Math.cos(a - 0.12) * 8, 16 + Math.sin(a - 0.12) * 8, 16 + Math.cos(a) * 14, 16 + Math.sin(a) * 14, 16 + Math.cos(a + 0.12) * 8, 16 + Math.sin(a + 0.12) * 8]); P.fill(g, '#ffe070'); } P.circle(g, 16, 16, 7, P.vol(g, 16, 16, 7, '#fff4c0')); },
    rift(g) { P.glow(g, 16, 16, 14, '#b050ff', 0.8); g.beginPath(); g.moveTo(3, 16); g.quadraticCurveTo(16, 4, 29, 16); g.quadraticCurveTo(16, 28, 3, 16); P.fill(g, P.rg(g, 16, 16, 12, [W, '#c070ff', '#30105a'])); },
    meteor(g) { g.strokeStyle = 'rgba(255,170,60,0.8)'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(28, 4); g.lineTo(16, 16); g.stroke(); P.glow(g, 12, 20, 10, '#ff8020', 0.8); P.circle(g, 12, 20, 6.5, P.vol(g, 12, 20, 6.5, '#9a5a3a')); P.circle(g, 10, 19, 1.5, '#5a2a1a'); P.circle(g, 14, 22, 1.2, '#5a2a1a'); },
    golem(g) { P.rrect(g, 8, 6, 16, 14, 3, P.lg(g, 0, 6, 0, 20, ['#f0e6cc', '#a8987a'])); P.rrect(g, 5, 18, 22, 10, 3, P.lg(g, 0, 18, 0, 28, ['#d8cca8', '#8a7a5a'])); P.circle(g, 13, 13, 1.8, '#40ffc0'); P.circle(g, 19, 13, 1.8, '#40ffc0'); },
    helm(g, c) { g.beginPath(); g.arc(16, 16, 11, Math.PI, 0); g.lineTo(27, 26); g.lineTo(20, 26); g.lineTo(19, 20); g.lineTo(13, 20); g.lineTo(12, 26); g.lineTo(5, 26); g.closePath(); P.fill(g, P.lg(g, 5, 5, 27, 26, [W, c || '#98a0b8', sh(c || '#98a0b8', -0.4)])); P.rrect(g, 9, 15, 14, 3, 1, '#1a1020'); P.line(g, 16, 5, 16, 14, 1.2, 'rgba(255,255,255,0.6)'); },
    ice(g) { [[10, 26, 8], [16, 26, 16], [22, 26, 10]].forEach(([x, y, hh]) => { P.path(g, [x - 4, y, x, y - hh - 4, x + 4, y]); P.fill(g, P.lg(g, x - 4, 0, x + 4, 0, [W, '#80d0ff', '#2a78c0'])); }); },
    hail(g) { [[10, 10, 4], [21, 8, 3], [15, 20, 5], [24, 22, 3.4], [7, 23, 2.6]].forEach(([x, y, r]) => P.circle(g, x, y, r, P.vol(g, x, y, r, '#e0f6ff'))); },
    flail(g) { P.line(g, 5, 28, 12, 18, 2.4, '#8a5a30'); g.strokeStyle = '#a0a0b0'; g.lineWidth = 1.2; g.setLineDash([2, 1.5]); g.beginPath(); g.moveTo(12, 18); g.quadraticCurveTo(14, 10, 20, 11); g.stroke(); g.setLineDash([]); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; P.path(g, [21 + Math.cos(a - 0.3) * 5, 11 + Math.sin(a - 0.3) * 5, 21 + Math.cos(a) * 9, 11 + Math.sin(a) * 9, 21 + Math.cos(a + 0.3) * 5, 11 + Math.sin(a + 0.3) * 5]); P.fill(g, W); } P.circle(g, 21, 11, 5.5, P.vol(g, 21, 11, 5.5, '#7a7e8a')); },
    fist(g, c) { P.glow(g, 16, 16, 13, c || '#b080ff', 0.6); P.rrect(g, 8, 9, 16, 14, 5, c ? sh(c, 0.3) : '#e0d0ff'); for (let i = 0; i < 4; i++) P.rrect(g, 9 + i * 3.8, 7, 3.4, 6, 1.6, c ? sh(c, 0.45) : '#f0e8ff'); P.rrect(g, 11, 22, 10, 7, 2, c ? sh(c, 0.1) : '#c8b0f0'); },
    fistup(g) { GL.fist(g, '#e04040'); },
    fistfire(g) { P.glow(g, 16, 14, 13, '#ff7a20', 0.7); GL.fist(g, '#ff8a30'); g.beginPath(); g.moveTo(16, 1); g.quadraticCurveTo(22, 6, 19, 11); g.lineTo(13, 11); g.quadraticCurveTo(10, 6, 16, 1); P.fill(g, P.lg(g, 0, 1, 0, 11, ['#fff4b0', '#ff8a20'])); },
    thorns(g) {
      g.lineCap = 'round';
      [[8, 28, 6, 8, '#6a8a30'], [16, 29, 17, 4, '#80a040'], [24, 28, 27, 10, '#5a7a28']].forEach(([x0, y0, x1, y1, c]) => {
        g.strokeStyle = '#1c2a0c'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 4, (y0 + y1) / 2, x1, y1); g.stroke();
        g.strokeStyle = c; g.lineWidth = 2.2; g.stroke();
        for (let i = 1; i < 4; i++) { const t = i / 4, x = x0 + (x1 - x0) * t + 2, y = y0 + (y1 - y0) * t; P.path(g, [x, y, x + 3, y - 1.5, x + 0.5, y + 1]); P.fill(g, '#d8e8a0'); }
      });
      P.circle(g, 17, 4.5, 2.4, P.vol(g, 17, 4.5, 2.4, '#c02838'));
    },
    gun(g) { // an arquebus with a puff of smoke
      P.glow(g, 26, 8, 7, '#ffb040', 0.6); P.circle(g, 27, 7, 2.4, 'rgba(220,220,230,0.8)'); P.circle(g, 29, 10, 1.8, 'rgba(200,200,210,0.7)');
      g.save(); g.translate(16, 17); g.rotate(-0.55);
      P.path(g, [-14, 3, -5, -1, -1, -1, -1, 2, -12, 7]); P.fill(g, P.lg(g, -14, 0, -1, 0, ['#b07a40', '#6a3c18']));
      P.rrect(g, -3, -2.6, 16, 2.6, 1, P.lg(g, 0, -2.6, 0, 0, ['#f0f2f8', '#8a90a0', '#4a4e58'])); P.rect(g, 12, -3, 2, 3.4, '#3a3e48');
      P.line(g, -1, 0, -2.4, 3.4, 1, '#e0b040'); g.restore();
    },
    flask(g) {
      P.rrect(g, 13, 3, 6, 3, 1, '#8a5a30'); P.rect(g, 14, 6, 4, 5, 'rgba(230,245,255,0.7)');
      P.glow(g, 16, 20, 12, '#90e050', 0.6); P.circle(g, 16, 20, 9, 'rgba(230,245,255,0.55)');
      g.save(); g.beginPath(); g.arc(16, 20, 8.4, 0, Math.PI * 2); g.clip(); P.rect(g, 6, 18, 20, 12, P.lg(g, 0, 18, 0, 29, ['#d8ff90', '#70c030', '#2a6a14'])); g.restore();
      [[12, 22, 1.6], [18, 24, 1.2], [15, 19, 1]].forEach(([x, y, r]) => P.circle(g, x, y, r, 'rgba(255,255,255,0.8)'));
      P.circle(g, 11.5, 16, 1.6, 'rgba(255,255,255,0.9)');
    },
    plant(g) { // a bog flytrap snapping
      P.ell(g, 16, 28, 9, 2.4, '#3a2a14');
      g.strokeStyle = '#3a5a1a'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(16, 28); g.quadraticCurveTo(11, 20, 15, 14); g.stroke();
      [[-2.6, '#4a7a28'], [-0.5, '#5a8a30']].forEach(([a, c]) => { g.save(); g.translate(16, 27); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(5, -3.5, 10, 0); g.quadraticCurveTo(5, 3, 0, 0); P.fill(g, c); g.restore(); });
      g.save(); g.translate(16, 13);
      g.save(); g.rotate(-0.5); g.beginPath(); g.moveTo(-2, 0); g.quadraticCurveTo(5, -8, 12, -1); g.lineTo(-2, 1); P.fill(g, P.lg(g, 0, -7, 0, 0, ['#a8d850', '#4a7a20'])); P.path(g, [0, 0, 4, -2, 8, -0.6]); P.fill(g, '#d0283a'); g.restore();
      g.save(); g.rotate(0.5); g.beginPath(); g.moveTo(-2, 0); g.quadraticCurveTo(5, 8, 12, 1); g.lineTo(-2, -1); P.fill(g, P.lg(g, 0, 0, 0, 7, ['#5a8a28', '#2a4a12'])); P.path(g, [0, 0, 4, 2, 8, 0.6]); P.fill(g, '#9a1424'); g.restore();
      for (let i = 0; i < 4; i++) { P.path(g, [3 + i * 2.2, -2.2 - i * 0.3, 4 + i * 2.2, 0, 5 + i * 2.2, -2.4 - i * 0.3]); P.fill(g, W); }
      g.restore();
    },
    lute(g) {
      g.save(); g.translate(16, 16); g.rotate(-0.7);
      P.rrect(g, -1.4, -15, 2.8, 14, 0.8, '#4a2a14'); for (let i = 0; i < 3; i++) P.rect(g, -2.6, -14 + i * 1.8, 5.2, 0.8, '#e8d8b0');
      P.ell(g, 0, 5, 8, 9.5, P.rg(g, -2, 2, 11, ['#f0b870', '#b06a2a', '#5a3010']));
      P.circle(g, 0, 3, 2.6, '#1a0c06'); P.rect(g, -3, 10.5, 6, 1.4, '#2a1608');
      g.strokeStyle = 'rgba(255,240,200,0.9)'; g.lineWidth = 0.4; g.beginPath(); for (const o of [-0.8, 0, 0.8]) { g.moveTo(o, -14); g.lineTo(o, 10.5); } g.stroke();
      g.restore();
    },
    drum(g) {
      P.ell(g, 16, 22, 12, 5, '#3a1e0e'); P.rect(g, 4, 11, 24, 11, P.lg(g, 4, 0, 28, 0, ['#8a3a1a', '#c05a2a', '#6a2410']));
      P.ell(g, 16, 11, 12, 5, P.rg(g, 14, 10, 12, ['#f4ead0', '#c8b890']));
      g.strokeStyle = '#e8c050'; g.lineWidth = 0.9; g.beginPath(); for (let i = 0; i < 5; i++) { const x = 5 + i * 5.5; g.moveTo(x, 13); g.lineTo(x + 2.8, 21); } g.stroke();
      P.line(g, 20, 2, 25, 9, 1.6, '#e8d8b0'); P.circle(g, 20, 2, 1.6, '#f4ead0');
    },
    prism(g) {
      P.glow(g, 16, 16, 14, '#c080ff', 0.6);
      P.path(g, [16, 3, 27, 24, 5, 24]); P.fill(g, P.lg(g, 5, 3, 27, 24, ['#ffffff', '#c8b8ff', '#6a4ab0']));
      P.path(g, [16, 3, 16, 24, 5, 24]); P.fill(g, 'rgba(255,255,255,0.3)');
      [['#ff7a30', 0], ['#80d8ff', 3], ['#fff080', 6]].forEach(([c, o]) => P.line(g, 22, 15 + o * 0.6, 30, 13 + o * 1.8, 1.8, c));
      P.line(g, 2, 11, 10, 15, 1.8, '#ffffff');
    },
    snow(g) { g.strokeStyle = '#e8f8ff'; g.lineWidth = 2; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(16 - Math.cos(a) * 12, 16 - Math.sin(a) * 12); g.lineTo(16 + Math.cos(a) * 12, 16 + Math.sin(a) * 12); g.stroke(); } for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, x = 16 + Math.cos(a) * 8, y = 16 + Math.sin(a) * 8; g.beginPath(); g.moveTo(x + Math.cos(a + 2.2) * 3, y + Math.sin(a + 2.2) * 3); g.lineTo(x, y); g.lineTo(x + Math.cos(a - 2.2) * 3, y + Math.sin(a - 2.2) * 3); g.stroke(); } },
    flask(g, c) { P.rrect(g, 13, 3, 6, 4, 1, '#8a5a30'); P.rrect(g, 13.5, 6, 5, 6, 1, 'rgba(220,240,255,0.8)'); P.circle(g, 16, 20, 9, 'rgba(220,240,255,0.55)'); g.save(); g.beginPath(); g.arc(16, 20, 8.4, 0, Math.PI * 2); g.clip(); P.rect(g, 0, 18, 32, 14, P.lg(g, 0, 18, 0, 30, [c || '#80e060', sh(c || '#80e060', -0.5)])); g.restore(); P.ell(g, 12.5, 17, 1.8, 3, 'rgba(255,255,255,0.7)', 0.4); },
    fireball(g) { P.glow(g, 18, 14, 14, '#ff8020', 0.8); g.beginPath(); g.moveTo(4, 28); g.quadraticCurveTo(10, 16, 14, 12); g.lineTo(20, 18); g.quadraticCurveTo(14, 22, 4, 28); P.fill(g, 'rgba(255,160,60,0.7)'); P.circle(g, 19, 13, 7, P.rg(g, 19, 13, 7, ['#fff6c0', '#ffb030', '#e04010'])); },
    heart(g) { g.beginPath(); g.moveTo(16, 27); g.bezierCurveTo(2, 18, 4, 5, 11, 6); g.quadraticCurveTo(14, 6, 16, 10); g.quadraticCurveTo(18, 6, 21, 6); g.bezierCurveTo(28, 5, 30, 18, 16, 27); P.fill(g, P.lg(g, 4, 5, 28, 27, ['#ff8090', '#e01830', '#7a0814'])); P.ell(g, 10.5, 11, 2.4, 1.6, 'rgba(255,255,255,0.6)', -0.5); },
    cross(g) { P.rrect(g, 12, 5, 8, 22, 2, P.lg(g, 0, 5, 0, 27, ['#a0ff90', '#30a040'])); P.rrect(g, 5, 12, 22, 8, 2, P.lg(g, 0, 12, 0, 20, ['#a0ff90', '#30a040'])); },
    hide(g) { g.beginPath(); g.moveTo(8, 6); g.lineTo(24, 6); g.lineTo(27, 12); g.lineTo(24, 27); g.lineTo(8, 27); g.lineTo(5, 12); g.closePath(); P.fill(g, P.lg(g, 5, 6, 27, 27, ['#c8a070', '#8a6038', '#4a3018'])); g.strokeStyle = '#3a2410'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(9, 11 + i * 5); g.lineTo(23, 11 + i * 5); g.stroke(); } },
    boot(g) { P.path(g, [11, 4, 19, 4, 19, 20, 27, 22, 27, 27, 9, 27, 9, 20]); P.fill(g, P.lg(g, 9, 4, 27, 27, ['#b88458', '#7a5030', '#4a2e18'])); P.line(g, 4, 10, 9, 10, 1.5, 'rgba(255,255,255,0.6)'); P.line(g, 3, 15, 8, 15, 1.5, 'rgba(255,255,255,0.5)'); },
    hourglass(g) { P.rrect(g, 7, 3, 18, 3, 1, '#c89050'); P.rrect(g, 7, 26, 18, 3, 1, '#c89050'); g.beginPath(); g.moveTo(9, 6); g.lineTo(23, 6); g.lineTo(17, 16); g.lineTo(23, 26); g.lineTo(9, 26); g.lineTo(15, 16); g.closePath(); P.fill(g, 'rgba(220,240,255,0.5)'); P.path(g, [11, 8, 21, 8, 16, 14]); P.fill(g, '#ffd060'); P.path(g, [16, 18, 21, 25, 11, 25]); P.fill(g, '#ffd060'); },
    rings(g) { for (let i = 3; i >= 1; i--) { g.beginPath(); g.arc(16, 16, i * 4.4, 0, Math.PI * 2); g.strokeStyle = ['#c070ff', '#80a0ff', '#80f0ff'][i - 1]; g.lineWidth = 2; g.stroke(); } P.circle(g, 16, 16, 2, W); },
    magnet(g) { g.lineCap = 'butt'; g.beginPath(); g.arc(16, 14, 8, Math.PI, 0, true); g.strokeStyle = '#e02838'; g.lineWidth = 6; g.stroke(); P.rect(g, 5, 13, 6, 10, '#e02838'); P.rect(g, 21, 13, 6, 10, '#e02838'); P.rect(g, 5, 22, 6, 4, W); P.rect(g, 21, 22, 6, 4, W); },
    target(g) { [11, 7.5, 4].forEach((r, i) => P.circle(g, 16, 16, r, i % 2 ? W : '#e03040')); P.line(g, 27, 5, 17, 15, 1.6, '#8a5a30'); P.path(g, [17, 15, 20, 15, 17, 12]); P.fill(g, W); },
    fang(g) { P.path(g, [8, 5, 14, 5, 12, 28]); P.fill(g, P.lg(g, 8, 0, 14, 0, [W, WD])); P.path(g, [18, 5, 24, 5, 21, 22]); P.fill(g, P.lg(g, 18, 0, 24, 0, [W, WD])); P.rrect(g, 5, 3, 22, 4, 2, '#c02838'); },
    candle(g) { P.glow(g, 16, 7, 7, '#ffc040', 0.8); P.ell(g, 16, 7, 2.4, 4, '#ffd050'); P.rrect(g, 12, 11, 8, 15, 1.5, P.lg(g, 12, 0, 20, 0, ['#fff4dc', '#d8c7a0'])); P.ell(g, 16, 27, 8, 2.4, '#b08050'); },
    echo(g) { for (const o of [0, 8]) { P.path(g, [6 + o, 6, 14 + o, 16, 6 + o, 26, 9 + o, 26, 17 + o, 16, 9 + o, 6]); P.fill(g, o ? '#80e0ff' : W); } },
    star(g) { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5.5 : 13; pts.push(16 + Math.cos(a) * r, 16 + Math.sin(a) * r); } P.path(g, pts); P.fill(g, P.lg(g, 0, 3, 0, 29, ['#fff8c0', '#ffc030'])); },
    whet(g) { g.save(); g.translate(16, 16); g.rotate(-0.6); P.rrect(g, -12, -4, 24, 8, 3, P.lg(g, 0, -4, 0, 4, ['#a0a6b4', '#5a606e'])); g.restore(); P.path(g, [10, 24, 26, 8, 27, 11, 12, 26]); P.fill(g, W); },
    arrows(g) { [-7, 0, 7].forEach((o) => { P.line(g, 16 + o * 0.4, 28, 16 + o, 8, 1.4, '#c8905a'); P.path(g, [12.6 + o, 9, 16 + o, 3, 19.4 + o, 9]); P.fill(g, W); }); },
    skull(g) { P.circle(g, 16, 13, 10, P.vol(g, 16, 13, 10, '#ece2c8')); P.rrect(g, 10, 18, 12, 8, 2, '#dcd0b0'); P.ell(g, 12, 13, 2.8, 3.2, '#2a1418'); P.ell(g, 20, 13, 2.8, 3.2, '#2a1418'); P.path(g, [16, 16, 14.5, 19, 17.5, 19]); P.fill(g, '#2a1418'); for (let i = 0; i < 4; i++) P.line(g, 12 + i * 2.7, 22, 12 + i * 2.7, 26, 0.8, '#8a7a5a'); },
    elements(g) { P.circle(g, 11, 12, 5, P.vol(g, 11, 12, 5, '#ff7a30')); P.circle(g, 21, 12, 5, P.vol(g, 21, 12, 5, '#ffe040')); P.circle(g, 16, 21, 5, P.vol(g, 16, 21, 5, '#60c8ff')); },
    coin(g) { // an old minted coin: milled rim, a stamped four-pointed star
      P.circle(g, 16, 16, 12, P.vol(g, 16, 16, 12, '#f0b030'));
      for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; P.circle(g, 16 + Math.cos(a) * 10.6, 16 + Math.sin(a) * 10.6, 0.7, '#b87818'); }
      P.circle(g, 16, 16, 8.5, P.lg(g, 8, 8, 24, 24, ['#fff0a0', '#e0a020']));
      const star = (r, w, col) => { P.path(g, [16, 16 - r, 16 + w, 16 - w, 16 + r, 16, 16 + w, 16 + w, 16, 16 + r, 16 - w, 16 + w, 16 - r, 16, 16 - w, 16 - w]); P.fill(g, col); };
      star(6.4, 1.9, '#a86a10'); star(5, 1.2, '#f8d868'); P.circle(g, 16, 16, 1.1, '#a86a10');
    },
    gem(g, c) { const col = c || '#ff5ad8'; P.path(g, [9, 7, 23, 7, 29, 13, 16, 28, 3, 13]); P.fill(g, P.lg(g, 3, 7, 29, 28, [sh(col, 0.5), col, sh(col, -0.45)])); P.path(g, [9, 7, 23, 7, 20, 13, 12, 13]); P.fill(g, 'rgba(255,255,255,0.35)'); P.path(g, [3, 13, 12, 13, 16, 28]); P.fill(g, 'rgba(0,0,0,0.18)'); P.circle(g, 11, 10, 1.4, '#fff'); },
    torch(g) { P.rrect(g, 13.5, 15, 5, 14, 1.5, P.lg(g, 13, 0, 19, 0, ['#9a6a3a', '#5a3a1a'])); P.rrect(g, 12, 14, 8, 3, 1, '#6a6e7a'); GL.flameSmall(g); },
    flameSmall(g) { g.beginPath(); g.moveTo(16, 1); g.bezierCurveTo(23, 7, 22, 13, 20, 15); g.lineTo(12, 15); g.bezierCurveTo(9, 12, 10, 7, 16, 1); P.fill(g, P.lg(g, 0, 1, 0, 15, ['#fff4b0', '#ffa030', '#e04010'])); },
    trophy(g) { P.path(g, [8, 5, 24, 5, 23, 14, 16, 20, 9, 14]); P.fill(g, P.lg(g, 8, 0, 24, 0, ['#fff0a0', '#f0b830', '#b07810'])); g.strokeStyle = '#e8b030'; g.lineWidth = 1.6; g.beginPath(); g.arc(8, 10, 3.6, 1.2, 4.8); g.stroke(); g.beginPath(); g.arc(24, 10, 3.6, -1.6, 1.9); g.stroke(); P.rect(g, 14.5, 19, 3, 5, '#d09820'); P.rrect(g, 10, 24, 12, 4, 1, '#8a5a30'); },
    calendar(g) { P.rrect(g, 5, 7, 22, 21, 2, '#f0ece4'); P.rrect(g, 5, 7, 22, 6, 2, '#d02838'); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) P.rect(g, 8 + c * 4.4, 16 + r * 3.6, 2.6, 2, r === 2 && c === 3 ? '#d02838' : '#6a6a7a'); P.rect(g, 10, 4, 2, 5, '#6a6a7a'); P.rect(g, 20, 4, 2, 5, '#6a6a7a'); },
    banner(g) { P.rect(g, 5, 4, 22, 2.4, '#8a5a30'); P.path(g, [7, 6, 25, 6, 25, 28, 16, 22, 7, 28]); P.fill(g, P.lg(g, 7, 6, 25, 28, ['#b070f0', '#6a2aa0'])); GL.starSmall(g); },
    starSmall(g) { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 2.6 : 6; pts.push(16 + Math.cos(a) * r, 14 + Math.sin(a) * r); } P.path(g, pts); P.fill(g, '#ffd35a'); },
    tv(g) { P.rrect(g, 3, 8, 26, 18, 3, '#6a6e7a'); P.rrect(g, 5, 10, 22, 14, 2, '#10141a'); P.path(g, [13, 13, 21, 17, 13, 21]); P.fill(g, '#40d060'); P.line(g, 11, 3, 15, 8, 1.2, '#6a6e7a'); P.line(g, 21, 3, 17, 8, 1.2, '#6a6e7a'); },
    swords(g) { g.save(); g.translate(16, 16); for (const s of [-1, 1]) { g.save(); g.scale(s, 1); g.rotate(-0.78); P.rrect(g, -1.6, -14, 3.2, 20, 1, P.lg(g, -1.6, 0, 1.6, 0, [W, WD])); P.rrect(g, -5, 5, 10, 2, 1, '#e0b040'); P.rrect(g, -1.4, 7, 2.8, 6, 1, '#6a4428'); g.restore(); } g.restore(); },
    altar(g) { P.glow(g, 16, 8, 8, '#ffa040', 0.8); GL.flameSmall(g); P.rrect(g, 6, 15, 20, 6, 1, P.lg(g, 0, 15, 0, 21, ['#a0a4b0', '#5a5e6a'])); P.rrect(g, 9, 21, 14, 5, 0.5, '#6a6e7a'); P.rrect(g, 5, 26, 22, 3, 1, '#5a5e6a'); },
    scroll(g) { P.rrect(g, 7, 5, 18, 22, 2, P.lg(g, 7, 0, 25, 0, ['#f4e6c0', '#d8c090'])); P.ell(g, 16, 5, 10, 2.6, '#c8a870'); P.ell(g, 16, 27, 10, 2.6, '#c8a870'); for (let i = 0; i < 4; i++) P.line(g, 10, 10 + i * 4, 22 - (i === 3 ? 5 : 0), 10 + i * 4, 1, '#8a6a4a'); },
    ankh(g) { g.strokeStyle = '#ffd050'; g.lineWidth = 3; g.beginPath(); g.ellipse(16, 9, 5, 6, 0, 0, Math.PI * 2); g.stroke(); P.rect(g, 14.5, 14, 3, 15, '#ffd050'); P.rect(g, 7, 15.5, 18, 3, '#ffd050'); },
    dice(g) { P.rrect(g, 5, 5, 22, 22, 4, P.lg(g, 0, 5, 0, 27, ['#ffffff', '#c8ccd8'])); [[11, 11], [21, 11], [16, 16], [11, 21], [21, 21]].forEach(([x, y]) => P.circle(g, x, y, 2, '#2a2a3a')); },
    book(g) { P.rrect(g, 5, 5, 22, 22, 2, P.lg(g, 0, 5, 0, 27, ['#5a78d8', '#23347a'])); P.rrect(g, 8, 7, 17, 18, 1, '#efe4c8'); g.strokeStyle = '#4a70e0'; g.lineWidth = 1.4; g.beginPath(); g.arc(16.5, 16, 4.5, 0, Math.PI * 2); g.moveTo(16.5, 10); g.lineTo(16.5, 22); g.stroke(); },
    chest(g, c) { const b = c || '#8a5a2a', band = c === '#4a5a7a' ? '#dfe6f2' : c === '#8a2034' ? '#ffd35a' : '#9aa0aa'; P.rrect(g, 3, 14, 26, 13, 2, P.lg(g, 0, 14, 0, 27, [sh(b, 0.25), sh(b, -0.4)])); g.beginPath(); g.moveTo(3, 15); g.quadraticCurveTo(3, 5, 16, 5); g.quadraticCurveTo(29, 5, 29, 15); g.closePath(); P.fill(g, P.lg(g, 0, 5, 0, 15, [sh(b, 0.4), b])); [7, 25].forEach((x) => P.rrect(g, x - 1.6, 5.5, 3.2, 21.5, 0.8, band)); P.rrect(g, 3, 14, 26, 2.2, 0.5, band); P.rrect(g, 13.5, 12.5, 5, 6, 1, band); P.circle(g, 16, 15.5, 0.9, '#1a1010'); },
  };
  DH.glyphs = GL;

  /* ---------- gear glyphs (full colour, 32-unit box, rendered at 2 px per unit) ---------- */
  const MAT = {
    steel:   ['#f6f8fc', '#c4cad8', '#8a92a6', '#4e5466', '#262a34'],
    gold:    ['#fff6c8', '#f4cc58', '#c8902c', '#7e5616', '#3a2608'],
    bronze:  ['#ffd8a0', '#d4883c', '#8e5020', '#522a0e', '#261206'],
    leather: ['#dcaa78', '#a8743e', '#744a24', '#4a2c12', '#24140a'],
    silver:  ['#ffffff', '#dfe4ee', '#a8b0c2', '#686e80', '#30343e'],
    iron:    ['#b8bcc8', '#7c8292', '#50566a', '#30343e', '#16181e'],
  };
  /** banded metal gradient (hard-ish stops read as pixel-art shading) */
  function mfill(g, x0, y0, x1, y1, m) { return P.lg(g, x0, y0, x1, y1, [[0, m[0]], [0.16, m[1]], [0.45, m[2]], [0.78, m[3]], [1, m[4]]]); }
  function gemCut(g, cx, cy, r, col) {
    P.circle(g, cx, cy, r + 0.8, '#1a0c10');
    P.circle(g, cx, cy, r, P.rg(g, cx, cy, r, [[0, sh(col, 0.35)], [0.6, col], [1, sh(col, -0.55)]], cx - r * 0.3, cy - r * 0.3));
    P.path(g, [cx - r * 0.75, cy - r * 0.2, cx - r * 0.2, cy - r * 0.75, cx + r * 0.1, cy - r * 0.1]); P.fill(g, G.rgba(sh(col, 0.75), 0.75));
    P.path(g, [cx + r * 0.8, cy + r * 0.1, cx + r * 0.1, cy + r * 0.8, cx, cy]); P.fill(g, G.rgba(sh(col, -0.6), 0.5));
    P.rect(g, cx - r * 0.5, cy - r * 0.55, Math.max(1, r * 0.3), Math.max(1, r * 0.3), '#ffffff');
  }
  function rivet(g, x, y, r, m) { P.circle(g, x, y, r, (m || MAT.steel)[3]); P.circle(g, x - r * 0.25, y - r * 0.25, r * 0.6, (m || MAT.steel)[1]); }
  function stitch(g, pts, col) { g.save(); g.setLineDash([1.2, 1.2]); g.strokeStyle = col || 'rgba(255,230,190,0.55)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); g.restore(); }
  function chain(g, x0, y0, x1, y1, m) {
    const n = 7; g.strokeStyle = (m || MAT.gold)[2]; g.lineWidth = 0.9;
    for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; g.beginPath(); g.ellipse(x, y, 0.9, 0.6, Math.atan2(y1 - y0, x1 - x0), 0, Math.PI * 2); g.stroke(); }
  }
  function ringBand(g, m, cy) {
    cy = cy || 20;
    g.lineWidth = 4.4; g.strokeStyle = m[4]; g.beginPath(); g.ellipse(16, cy, 9.6, 8.6, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3.2; g.strokeStyle = mfill(g, 6, cy - 9, 26, cy + 9, m); g.beginPath(); g.ellipse(16, cy, 9.6, 8.6, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 0.8; g.strokeStyle = G.rgba(m[0], 0.9); g.beginPath(); g.ellipse(16, cy, 9.6, 8.6, 0, Math.PI * 1.05, Math.PI * 1.55); g.stroke();
  }
  function ring(g, band, stone) {
    const m = band.length ? band : MAT.gold;
    ringBand(g, m);
    P.path(g, [10.5, 12, 13, 8, 19, 8, 21.5, 12, 19, 14.5, 13, 14.5]); P.fill(g, mfill(g, 10, 7, 22, 15, m));
    gemCut(g, 16, 10.8, 3.4, stone);
  }
  function glove(g, m, cuff) {
    // back of a gauntlet / glove: cuff, palm, four fingers and a thumb
    P.path(g, [8, 30, 7, 20, 8, 12, 24, 12, 25, 20, 23, 30]); P.fill(g, '#140c08');
    P.rrect(g, 8.6, 12.5, 15.4, 12.5, 3, mfill(g, 8, 12, 24, 25, m));
    for (let i = 0; i < 4; i++) { const x = 9 + i * 3.7; P.rrect(g, x - 0.4, 3.4 + (i === 0 || i === 3 ? 2 : 0), 3.6, 11, 1.6, '#140c08'); P.rrect(g, x, 4 + (i === 0 || i === 3 ? 2 : 0), 2.8, 10, 1.3, mfill(g, x, 4, x + 3, 14, m)); P.rect(g, x + 0.3, 8.5 + (i === 0 || i === 3 ? 1 : 0), 2.2, 0.7, G.rgba(m[4], 0.6)); }
    P.path(g, [23, 16, 28.5, 13, 29.5, 15.5, 25, 21]); P.fill(g, mfill(g, 23, 13, 30, 21, m));
    P.rrect(g, 7.4, 24, 17.2, 6.4, 1, mfill(g, 7, 24, 25, 30, cuff || m)); P.rect(g, 7.4, 24, 17.2, 1, G.rgba((cuff || m)[0], 0.8));
  }
  function boot(g, m, trim) {
    P.path(g, [9.6, 3, 21, 3, 21, 19, 28.5, 21.5, 29.5, 28, 7.5, 28, 8.5, 19]); P.fill(g, '#140c08');
    P.path(g, [10.4, 3.8, 20.2, 3.8, 20.2, 19.6, 27.6, 22, 28.4, 27, 8.6, 27, 9.6, 19.4]); P.fill(g, mfill(g, 8, 4, 28, 27, m));
    P.rect(g, 8.6, 25, 19.8, 2, G.rgba(m[4], 0.9));
    P.rrect(g, 9.6, 3, 11.2, 4, 1, mfill(g, 9, 3, 21, 7, trim || m));
    stitch(g, [11, 9, 11, 22]); stitch(g, [20, 20, 26, 22.5]);
  }
  function torso(g, m, o) {
    o = o || {};
    // shoulders, chest and waist of a tunic / cuirass
    P.path(g, [9, 3.5, 23, 3.5, 29.5, 8.5, 27, 15, 24.5, 13.5, 24.5, 29, 7.5, 29, 7.5, 13.5, 5, 15, 2.5, 8.5]); P.fill(g, '#120a0c');
    P.path(g, [9.4, 4.4, 22.6, 4.4, 28.6, 8.8, 26.6, 13.8, 23.6, 12.4, 23.6, 28.2, 8.4, 28.2, 8.4, 12.4, 5.4, 13.8, 3.4, 8.8]); P.fill(g, mfill(g, 3, 4, 29, 28, m));
    P.path(g, [12.6, 4.4, 16, 9, 19.4, 4.4]); P.fill(g, '#120a0c');
  }
  const GEAR = {
    gale_circlet(g) {
      g.lineWidth = 3.6; g.strokeStyle = MAT.gold[4]; g.beginPath(); g.ellipse(16, 20, 12, 5.4, 0, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 2.4; g.strokeStyle = mfill(g, 4, 15, 28, 25, MAT.gold); g.beginPath(); g.ellipse(16, 20, 12, 5.4, 0, 0, Math.PI * 2); g.stroke();
      [[8, 17, 5], [16, 15, 8], [24, 17, 5]].forEach(([x, y, hh]) => { P.path(g, [x - 2.4, y + 1, x, y - hh, x + 2.4, y + 1]); P.fill(g, mfill(g, x - 3, y - hh, x + 3, y + 1, MAT.gold)); });
      gemCut(g, 16, 17.4, 2.2, '#40d8ff'); gemCut(g, 8.4, 19.4, 1.4, '#80f0ff'); gemCut(g, 23.6, 19.4, 1.4, '#80f0ff');
      g.strokeStyle = 'rgba(190,245,255,0.8)'; g.lineWidth = 0.9; g.beginPath(); g.arc(24, 7, 3, Math.PI * 0.2, Math.PI * 1.6); g.stroke(); g.beginPath(); g.moveTo(3, 9); g.quadraticCurveTo(12, 4, 20, 8); g.stroke();
    },
    brawler_band(g) {
      g.lineWidth = 6; g.strokeStyle = '#1a0608'; g.beginPath(); g.ellipse(16, 15, 11.5, 5.5, 0, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 4.4; g.strokeStyle = P.lg(g, 0, 10, 0, 21, ['#ff6a70', '#c01c2c', '#6a0a14']); g.beginPath(); g.ellipse(16, 15, 11.5, 5.5, 0, 0, Math.PI * 2); g.stroke();
      stitch(g, [6, 15, 10, 19.4, 16, 20.6, 22, 19.4, 26, 15]);
      P.path(g, [24, 17, 30, 27, 27, 28.5, 22, 20]); P.fill(g, P.lg(g, 22, 17, 30, 28, ['#e0303c', '#7a0c16']));
      P.path(g, [25, 17.5, 26, 29.5, 23, 29.5, 22.6, 20]); P.fill(g, P.lg(g, 22, 17, 26, 29, ['#c01c2c', '#5a0810']));
      P.circle(g, 24, 18.6, 2.2, '#a01424'); rivet(g, 9, 17.5, 1, MAT.steel); rivet(g, 16, 20.4, 1, MAT.steel);
    },
    warden_helm(g) {
      g.beginPath(); g.moveTo(5, 28); g.lineTo(5, 14); g.quadraticCurveTo(5, 3.5, 16, 3); g.quadraticCurveTo(27, 3.5, 27, 14); g.lineTo(27, 28); g.closePath(); P.fill(g, '#15161c');
      g.beginPath(); g.moveTo(6, 27); g.lineTo(6, 14); g.quadraticCurveTo(6, 4.5, 16, 4); g.quadraticCurveTo(26, 4.5, 26, 14); g.lineTo(26, 27); g.closePath(); P.fill(g, mfill(g, 6, 4, 26, 27, MAT.steel));
      P.rect(g, 15, 4, 2, 23, G.rgba(MAT.steel[0], 0.55)); P.rect(g, 17, 4, 1, 23, G.rgba(MAT.steel[4], 0.4));
      P.rrect(g, 7, 13, 18, 3, 0.4, '#0a0a10'); P.rect(g, 7, 13, 18, 0.8, '#000');
      for (let i = 0; i < 5; i++) P.rect(g, 9.5 + i * 3.2, 19, 1.4, 2.6, '#101018');
      [[7.6, 9], [24.4, 9], [7.6, 24.5], [24.4, 24.5]].forEach(([x, y]) => rivet(g, x, y, 1));
      P.path(g, [13, 4, 16, -0.5, 19, 4]); P.fill(g, '#c02838');
    },
    crimson_chalice(g) {
      P.path(g, [6.5, 4, 25.5, 4, 22.5, 14, 17.8, 17, 14.2, 17, 9.5, 14]); P.fill(g, '#1c1004');
      P.path(g, [7.5, 5, 24.5, 5, 21.8, 13.4, 17.4, 16, 14.6, 16, 10.2, 13.4]); P.fill(g, mfill(g, 7, 5, 25, 16, MAT.gold));
      P.ell(g, 16, 5.4, 8.5, 2, '#4a0610'); P.ell(g, 16, 5.8, 7.4, 1.4, P.lg(g, 8, 0, 24, 0, ['#ff5060', '#a00c1c']));
      gemCut(g, 16, 10.4, 1.8, '#e02030');
      P.rect(g, 14.6, 16, 2.8, 7, mfill(g, 14, 16, 18, 23, MAT.gold)); P.ell(g, 16, 18.5, 2.6, 1, MAT.gold[2]);
      P.ell(g, 16, 25.5, 7.4, 2.8, '#1c1004'); P.ell(g, 16, 25, 6.8, 2.2, mfill(g, 9, 23, 23, 27, MAT.gold));
      P.ell(g, 21.5, 9, 1, 3.5, 'rgba(255,40,60,0.9)'); P.circle(g, 21.5, 13.5, 1, '#c0101e');
    },
    jade_talisman(g) {
      chain(g, 7, 2, 13.5, 11); chain(g, 25, 2, 18.5, 11);
      P.circle(g, 16, 19.5, 10, '#0a2014');
      P.circle(g, 16, 19.5, 9.2, P.rg(g, 16, 19.5, 9.2, [[0, '#9af0c0'], [0.55, '#34a066'], [1, '#12482a']], 12.5, 16));
      g.strokeStyle = '#0e3a22'; g.lineWidth = 1; g.beginPath(); g.arc(16, 19.5, 6.4, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = '#d8ffe8'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(16, 14.5); g.lineTo(16, 24.5); g.moveTo(12.5, 17); g.lineTo(19.5, 22); g.moveTo(19.5, 17); g.lineTo(12.5, 22); g.stroke();
      P.circle(g, 16, 19.5, 1.8, '#0e3a22'); P.rrect(g, 13.8, 8.4, 4.4, 3, 0.6, mfill(g, 13, 8, 18, 11, MAT.gold));
    },
    wrath_amulet(g) {
      chain(g, 7, 2, 13.5, 9); chain(g, 25, 2, 18.5, 9);
      P.path(g, [16, 7.5, 27, 18.5, 16, 30, 5, 18.5]); P.fill(g, '#1c1004');
      P.path(g, [16, 8.8, 25.6, 18.5, 16, 28.6, 6.4, 18.5]); P.fill(g, mfill(g, 6, 9, 26, 29, MAT.gold));
      P.path(g, [16, 11.4, 23, 18.5, 16, 26, 9, 18.5]); P.fill(g, P.lg(g, 9, 11, 23, 26, ['#ff8a90', '#d0182c', '#5a0612']));
      P.path(g, [16, 11.4, 23, 18.5, 16, 18.5]); P.fill(g, 'rgba(255,190,200,0.4)'); P.path(g, [9, 18.5, 16, 26, 16, 18.5]); P.fill(g, 'rgba(40,0,6,0.35)');
      P.rect(g, 12.8, 14.6, 1.6, 1.6, '#ffffff'); rivet(g, 16, 9.6, 0.9, MAT.gold);
    },
    gore_tunic(g) {
      torso(g, ['#f2e6cc', '#d8c8a4', '#b0a07c', '#7a6c52', '#4a3e2c']);
      P.rect(g, 8.4, 19, 15.2, 3, mfill(g, 8, 19, 24, 22, MAT.leather)); P.rrect(g, 14.4, 18.6, 3.2, 3.8, 0.4, mfill(g, 14, 18, 18, 22, MAT.bronze));
      stitch(g, [16, 9.5, 16, 18], 'rgba(90,70,50,0.8)');
      [[12, 13, 3, 2.2], [19.5, 24.5, 2.6, 1.8], [11, 25.5, 1.8, 1.4], [21, 11, 1.6, 1.2]].forEach(([x, y, rx, ry]) => { P.ell(g, x, y, rx, ry, 'rgba(150,10,20,0.9)'); P.ell(g, x - 0.4, y - 0.3, rx * 0.5, ry * 0.4, 'rgba(210,40,50,0.8)'); });
      P.rect(g, 12, 15, 0.8, 3, 'rgba(150,10,20,0.9)');
    },
    blazing_shell(g) {
      torso(g, ['#ffe0a0', '#e07830', '#a03a14', '#5a1a0a', '#2a0a04']);
      [[8.4, 22], [23.6, 22], [16, 27]].forEach(([x, y]) => { P.path(g, [x - 2, y, x, y - 5, x + 2, y]); P.fill(g, 'rgba(255,200,60,0.85)'); });
      P.glow(g, 16, 17, 7, '#ff8020', 0.7);
      g.beginPath(); g.moveTo(16, 10.5); g.bezierCurveTo(20.5, 14, 20, 20, 16, 22.5); g.bezierCurveTo(12, 20, 11.5, 14, 16, 10.5); P.fill(g, P.lg(g, 0, 10, 0, 23, ['#fff6b0', '#ffb030', '#e04810']));
      P.ell(g, 16, 18.5, 1.6, 2.4, '#fff8d0');
    },
    defiant_plate(g) {
      torso(g, MAT.iron);
      P.path(g, [2.6, 8.6, 9, 3.8, 11, 9, 5.4, 14]); P.fill(g, mfill(g, 2, 3, 11, 14, MAT.iron)); P.path(g, [29.4, 8.6, 23, 3.8, 21, 9, 26.6, 14]); P.fill(g, mfill(g, 21, 3, 30, 14, MAT.iron));
      g.beginPath(); g.moveTo(11, 11); g.lineTo(21, 11); g.lineTo(20.6, 18); g.quadraticCurveTo(19, 23, 16, 25); g.quadraticCurveTo(13, 23, 11.4, 18); g.closePath(); P.fill(g, mfill(g, 11, 11, 21, 25, MAT.silver));
      g.strokeStyle = MAT.gold[2]; g.lineWidth = 0.9; g.stroke();
      P.rect(g, 15.3, 13, 1.4, 9, '#9a1a24'); P.rect(g, 12.8, 15.3, 6.4, 1.4, '#9a1a24');
      [[10, 26], [22, 26]].forEach(([x, y]) => rivet(g, x, y, 0.8, MAT.gold));
    },
    stalwart_cuirass(g) {
      torso(g, MAT.steel);
      P.path(g, [2.6, 8.6, 9, 3.8, 11, 9, 5.4, 14]); P.fill(g, mfill(g, 2, 3, 11, 14, MAT.steel)); P.path(g, [29.4, 8.6, 23, 3.8, 21, 9, 26.6, 14]); P.fill(g, mfill(g, 21, 3, 30, 14, MAT.steel));
      g.strokeStyle = MAT.gold[1]; g.lineWidth = 0.9; g.beginPath(); g.moveTo(3.4, 8.8); g.lineTo(9.2, 4.4); g.moveTo(28.6, 8.8); g.lineTo(22.8, 4.4); g.stroke();
      P.path(g, [9.5, 10, 16, 14, 22.5, 10, 22, 21, 16, 25.5, 10, 21]); P.fill(g, G.rgba(MAT.steel[0], 0.25));
      P.rect(g, 15.4, 10, 1.2, 15, G.rgba(MAT.steel[4], 0.5));
      P.path(g, [13, 13, 19, 13, 16, 17.5]); P.fill(g, mfill(g, 13, 13, 19, 18, MAT.gold));
      for (let i = 0; i < 3; i++) P.rect(g, 8.4, 22.5 + i * 2, 15.2, 0.8, G.rgba(MAT.steel[4], 0.7));
      [[10, 12], [22, 12], [10, 26], [22, 26]].forEach(([x, y]) => rivet(g, x, y, 0.8, MAT.gold));
    },
    stillhunter_garb(g) {
      torso(g, ['#8aa66a', '#5e7a44', '#3e5630', '#28381e', '#141c0e']);
      P.path(g, [11, 4.4, 16, 12, 21, 4.4, 19.4, 3, 16, 7, 12.6, 3]); P.fill(g, '#243218');
      stitch(g, [16, 12, 16, 27]);
      for (let i = 0; i < 4; i++) { g.strokeStyle = '#c8a870'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(14.2, 13 + i * 3); g.lineTo(17.8, 14.6 + i * 3); g.moveTo(17.8, 13 + i * 3); g.lineTo(14.2, 14.6 + i * 3); g.stroke(); }
      P.rect(g, 8.4, 21, 15.2, 2.6, mfill(g, 8, 21, 24, 24, MAT.leather));
      [[10.5, 16], [21, 16.5], [11, 25.5], [21.5, 26]].forEach(([x, y]) => P.ell(g, x, y, 1.8, 1.1, '#6a8a3a', 0.5));
    },
    stalker_grips(g) { glove(g, MAT.leather, ['#6a4a8a', '#4a2c6a', '#301a48', '#1e0e30', '#0e0618']); stitch(g, [10, 14, 22, 14]); gemCut(g, 16, 18.5, 2.2, '#40e0ff'); },
    spark_gauntlets(g) {
      glove(g, MAT.steel, MAT.iron);
      for (let i = 0; i < 3; i++) P.rect(g, 9, 15.5 + i * 2.4, 14.6, 0.7, G.rgba(MAT.steel[4], 0.6));
      [[10.5, 3], [21.5, 5]].forEach(([x, y], i) => { P.glow(g, x, y, 4, i ? '#ff8020' : '#ffd040', 0.9); P.path(g, [x - 1, y - 3, x + 1.5, y - 0.5, x - 0.3, y, x + 1, y + 3]); g.strokeStyle = '#fff4a0'; g.lineWidth = 0.8; g.stroke(); });
      rivet(g, 11, 27, 0.8); rivet(g, 21, 27, 0.8);
    },
    duelist_ember(g) { glove(g, ['#ffffff', '#ece2d2', '#c8b8a0', '#8a7a64', '#4a3e30'], MAT.gold); gemCut(g, 16, 18.5, 2.6, '#ff6a20'); P.glow(g, 16, 18.5, 5, '#ff7a20', 0.5); },
    tempo_treads(g) {
      boot(g, MAT.leather, MAT.bronze);
      P.path(g, [21, 9, 30, 4.5, 28.5, 8, 31, 8.5, 27.5, 12, 29.5, 13, 21, 15]); P.fill(g, P.lg(g, 21, 4, 31, 15, ['#ffffff', '#bfe8ff', '#6aa8d8']));
      g.strokeStyle = '#3a6a9a'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(22, 11); g.lineTo(28, 6.5); g.moveTo(22, 13); g.lineTo(28, 10); g.stroke();
    },
    striders(g) { boot(g, MAT.leather); rivet(g, 12, 13, 0.8, MAT.bronze); rivet(g, 18, 13, 0.8, MAT.bronze); P.rect(g, 9.6, 16, 10.6, 1.6, MAT.leather[3]); rivet(g, 15, 16.8, 0.9, MAT.steel); },
    grave_walkers(g) {
      boot(g, ['#8a6aa8', '#5e3e80', '#3e2458', '#26143a', '#12081e'], MAT.silver);
      P.circle(g, 14.5, 13, 2.8, P.vol(g, 14.5, 13, 2.8, '#ece2c8')); P.rect(g, 13.2, 14.6, 2.6, 1.6, '#dcd0b0');
      P.rect(g, 13.3, 12.4, 0.9, 1, '#1a1018'); P.rect(g, 14.9, 12.4, 0.9, 1, '#1a1018');
    },
    oak_band(g) { ring(g, ['#d8a870', '#9a6a38', '#6a4420', '#40280e', '#1e1206'], '#6ad060'); for (let i = 0; i < 5; i++) P.rect(g, 8 + i * 3.5, 26 + (i % 2), 1.6, 0.5, '#2a1a0a'); },
    bronze_loop(g) { ring(g, MAT.bronze, '#ff5030'); },
    steel_signet(g) { ringBand(g, MAT.silver); P.rrect(g, 10, 6.5, 12, 8, 1.5, '#16181e'); P.rrect(g, 10.8, 7.2, 10.4, 6.6, 1.2, mfill(g, 10, 7, 22, 14, MAT.silver)); P.path(g, [14, 8.4, 18, 8.4, 18, 12.6, 16, 13.6, 14, 12.6]); P.fill(g, MAT.silver[3]); },
    infernal_pact(g) { ring(g, MAT.iron, '#ff2030'); P.glow(g, 16, 10.8, 7, '#ff3040', 0.55); P.path(g, [11, 9, 9, 4.5, 12.5, 7.5]); P.fill(g, MAT.iron[1]); P.path(g, [21, 9, 23, 4.5, 19.5, 7.5]); P.fill(g, MAT.iron[1]); },
    greed_signet(g) { ringBand(g, MAT.gold); P.circle(g, 16, 10.5, 5.6, '#1c1004'); P.circle(g, 16, 10.5, 4.9, mfill(g, 11, 6, 21, 15, MAT.gold)); P.circle(g, 16, 10.5, 3.2, MAT.gold[3]); P.path(g, [16, 8.1, 16.7, 9.8, 18.4, 10.5, 16.7, 11.2, 16, 12.9, 15.3, 11.2, 13.6, 10.5, 15.3, 9.8]); P.fill(g, MAT.gold[0]); gemCut(g, 11, 14.5, 1.1, '#e02838'); gemCut(g, 21, 14.5, 1.1, '#e02838'); },
    aegis_ring(g) { ring(g, MAT.silver, '#4a90ff'); P.path(g, [12.5, 17, 19.5, 17, 19, 21, 16, 23.5, 13, 21]); P.fill(g, mfill(g, 12, 17, 20, 24, MAT.silver)); },
    signet_flame(g) { signet(g, '#e8602a', 'flame'); },
    signet_frost(g) { signet(g, '#3aa8e8', 'snow'); },
    signet_storm(g) { signet(g, '#e8c020', 'bolt'); },
    signet_arcana(g) { signet(g, '#9a50e0', 'wisp'); },
    signet_steel(g) { signet(g, '#8a92a6', 'sword'); },
    signet_legion(g) { signet(g, '#40b080', 'golem'); },
  };
  function signet(g, col, glyph) {
    ringBand(g, MAT.gold, 21.5);
    P.circle(g, 16, 11, 9.2, '#1c1004');
    P.circle(g, 16, 11, 8.4, mfill(g, 8, 3, 24, 19, MAT.gold));
    P.circle(g, 16, 11, 6.6, P.rg(g, 16, 11, 6.6, [[0, sh(col, 0.15)], [1, sh(col, -0.65)]], 14, 9));
    g.save(); g.translate(16, 11); g.scale(0.34, 0.34); g.translate(-16, -16); GL[glyph](g); g.restore();
    P.rect(g, 11.5, 5.4, 1.6, 1.6, 'rgba(255,255,255,0.7)');
  }
  DH.gearGlyphs = GEAR;

  const TRAIT_GLYPH = Object.assign({}, ...Object.entries(C.baseTraits).map(([k, v]) => ({ [k]: v.icon })), ...Object.entries(C.elevatedTraits).map(([k, v]) => ({ [k]: v.icon })));
  const ARTIFACT = Object.fromEntries(Object.entries(DH.economy.artifacts).map(([k, v]) => [k, v.icon || ['skull', '#5a5e6a']]));
  /* artifact glyphs */
  const M = (c) => P.lg(g0, 0, 4, 0, 28, [sh(c, 0.4), c, sh(c, -0.45)]); let g0 = null;
  Object.assign(GL, {
    mirror(g) { g0 = g; P.ell(g, 16, 14, 9, 11, M('#c89030')); P.ell(g, 16, 14, 6.6, 8.6, P.lg(g, 10, 6, 22, 22, ['#e8f4ff', '#6a8aa8', '#1a2a3a'])); P.rrect(g, 14, 25, 4, 5, 1, '#c89030'); P.path(g, [12, 9, 15, 8, 12, 14]); P.fill(g, 'rgba(255,255,255,0.6)'); },
    bell(g) { g0 = g; g.beginPath(); g.moveTo(6, 24); g.quadraticCurveTo(8, 8, 16, 6); g.quadraticCurveTo(24, 8, 26, 24); g.closePath(); P.fill(g, M('#d8a838')); P.rect(g, 5, 23, 22, 3, '#8a6420'); P.circle(g, 16, 28, 2.4, '#8a6420'); P.circle(g, 16, 5, 2, '#8a6420'); },
    totem(g) { g0 = g; P.rrect(g, 9, 4, 14, 25, 2, M('#8a6a3a')); [[12, 10], [20, 10], [12, 19], [20, 19]].forEach(([x, y]) => P.circle(g, x, y, 1.8, '#1a0a04')); P.rect(g, 12, 13.5, 8, 1.6, '#1a0a04'); P.rect(g, 12, 22.5, 8, 1.6, '#1a0a04'); P.path(g, [9, 4, 5, 2, 9, 9]); P.fill(g, '#6a4a2a'); P.path(g, [23, 4, 27, 2, 23, 9]); P.fill(g, '#6a4a2a'); },
    thread(g) { g0 = g; P.circle(g, 14, 16, 9, M('#c8a040')); g.strokeStyle = '#6a4a14'; g.lineWidth = 0.8; for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(14, 16, 9, 3 + Math.abs(i) * 1.4, i * 0.6, 0, Math.PI * 2); g.stroke(); } g.strokeStyle = '#f0d890'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(21, 21); g.quadraticCurveTo(27, 24, 29, 30); g.stroke(); },
    wheel(g) { g0 = g; g.strokeStyle = M('#b01828'); g.lineWidth = 3; g.beginPath(); g.arc(16, 16, 11, 0, Math.PI * 2); g.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; P.line(g, 16, 16, 16 + Math.cos(a) * 11, 16 + Math.sin(a) * 11, 1.6, '#e04050'); } P.circle(g, 16, 16, 3, '#ffd0d0'); },
    eye(g) { g0 = g; g.beginPath(); g.moveTo(3, 16); g.quadraticCurveTo(16, 4, 29, 16); g.quadraticCurveTo(16, 28, 3, 16); P.fill(g, '#f0e8e0'); P.circle(g, 16, 16, 6, P.rg(g, 16, 16, 6, ['#ff6050', '#a01020'])); P.circle(g, 16, 16, 2.4, '#100008'); P.circle(g, 14, 14, 1.2, '#ffffff'); },
    scales(g) { g0 = g; P.line(g, 16, 4, 16, 27, 1.6, '#c89030'); P.line(g, 5, 9, 27, 9, 1.6, '#c89030'); [7, 25].forEach((x, i) => { P.line(g, x, 9, x - 4, 18, 0.6, '#e8c860'); P.line(g, x, 9, x + 4, 18, 0.6, '#e8c860'); P.ell(g, x, 18 + (i ? 2 : 0), 5, 1.8, M('#d8a838')); }); P.rrect(g, 10, 26, 12, 3, 1, '#8a6420'); },
    lens(g) { g0 = g; g.strokeStyle = M('#c89030'); g.lineWidth = 2.4; g.beginPath(); g.arc(13, 13, 8, 0, Math.PI * 2); g.stroke(); P.circle(g, 13, 13, 6.8, 'rgba(160,210,255,0.55)'); P.line(g, 19, 19, 28, 28, 3.4, '#6a4a2a'); g.strokeStyle = '#ffffff'; g.lineWidth = 0.8; g.beginPath(); g.arc(13, 13, 4, 3.6, 4.6); g.stroke(); },
    cube(g) { g0 = g; P.path(g, [16, 3, 28, 9, 16, 15, 4, 9]); P.fill(g, '#d04050'); P.path(g, [4, 9, 16, 15, 16, 29, 4, 22]); P.fill(g, '#8a1a2a'); P.path(g, [28, 9, 16, 15, 16, 29, 28, 22]); P.fill(g, '#5a0a18'); P.circle(g, 10, 17, 1.6, '#ffd040'); P.circle(g, 22, 17, 1.6, '#ffd040'); },
    stone(g) { g0 = g; P.path(g, [6, 26, 4, 14, 10, 6, 22, 5, 28, 13, 27, 26]); P.fill(g, M('#7a7a82')); P.path(g, [10, 6, 22, 5, 17, 12]); P.fill(g, 'rgba(255,255,255,0.25)'); g.strokeStyle = '#2a2a30'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(9, 15); g.lineTo(15, 18); g.lineTo(13, 24); g.stroke(); },
    scarab(g) { g0 = g; P.ell(g, 16, 18, 8, 10, M('#e0b030')); P.line(g, 16, 9, 16, 28, 1, '#6a4a10'); P.circle(g, 16, 7, 4, M('#c89020')); for (const s2 of [-1, 1]) for (let i = 0; i < 3; i++) P.line(g, 16 + s2 * 7, 13 + i * 5, 16 + s2 * 12, 11 + i * 6, 1.2, '#8a6420'); },
    mask(g) { g0 = g; g.beginPath(); g.moveTo(5, 8); g.quadraticCurveTo(16, 2, 27, 8); g.quadraticCurveTo(28, 22, 16, 29); g.quadraticCurveTo(4, 22, 5, 8); P.fill(g, M('#c8c8d8')); P.ell(g, 11, 14, 3, 2, '#1a1020'); P.ell(g, 21, 14, 3, 2, '#1a1020'); g.strokeStyle = '#1a1020'; g.lineWidth = 1.2; g.beginPath(); g.arc(16, 25, 5, 3.6, 5.8); g.stroke(); P.line(g, 11, 17, 10, 23, 0.8, '#6080c0'); },
    chain(g) { g0 = g; for (let i = 0; i < 4; i++) { g.strokeStyle = M('#8a8a9a'); g.lineWidth = 2.4; g.beginPath(); g.ellipse(8 + i * 5.6, 8 + i * 5.6, 4.6, 2.8, 0.785, 0, Math.PI * 2); g.stroke(); } },
    root(g) { g0 = g; g.lineCap = 'round'; [[16, 4, 16, 16, 3], [16, 16, 7, 28, 2.4], [16, 16, 25, 27, 2.4], [16, 18, 16, 29, 2], [12, 22, 5, 22, 1.4]].forEach(([a, b, c, d, w]) => P.line(g, a, b, c, d, w, '#6a4a2a')); P.circle(g, 16, 6, 3.4, '#b050ff'); P.glow(g, 16, 6, 6, '#b050ff', 0.6); },
    laurel(g) { g0 = g; for (const s2 of [-1, 1]) for (let i = 0; i < 6; i++) { const a = Math.PI / 2 + s2 * (0.4 + i * 0.36), x = 16 + Math.cos(a) * 11, y = 17 + Math.sin(a) * 11; P.ell(g, x, y, 3, 1.4, M('#d0a020'), a + s2 * 0.8); } P.circle(g, 16, 7, 2.6, '#ff3040'); },
    goblet(g) { g0 = g; P.path(g, [7, 4, 25, 4, 21, 15, 11, 15]); P.fill(g, M('#d8d0c0')); P.rect(g, 14.5, 15, 3, 9, '#b8b0a0'); P.ell(g, 16, 26, 7, 2.6, '#a8a090'); P.ell(g, 16, 5, 9, 2, '#c0e0ff'); },
    ulcer(g) { g0 = g; P.glow(g, 16, 16, 12, '#8040c0', 0.6); P.path(g, [16, 3, 25, 13, 21, 29, 11, 29, 7, 13]); P.fill(g, P.lg(g, 7, 3, 25, 29, ['#6a4a7a', '#1a0a20', '#000000'])); P.path(g, [16, 3, 25, 13, 16, 14]); P.fill(g, 'rgba(200,140,255,0.35)'); },
    curtain(g) { g0 = g; P.rect(g, 3, 3, 26, 3, '#c89030'); for (let i = 0; i < 2; i++) { const x = i ? 17 : 4; P.path(g, [x, 6, x + 11, 6, x + (i ? 0 : 11) + (i ? 4 : -4), 29, x + (i ? 11 : 0), 29]); P.fill(g, M('#8a1a2a')); } P.path(g, [15, 10, 17, 6, 19, 12]); P.fill(g, '#f0d0d0'); },
    flute(g) { g0 = g; g.save(); g.translate(16, 16); g.rotate(-0.7); P.rrect(g, -13, -2, 26, 4, 2, M('#c89050')); for (let i = 0; i < 5; i++) P.circle(g, -6 + i * 4, 0, 0.9, '#3a200e'); g.restore(); [[24, 7], [27, 12]].forEach(([x, y]) => { P.circle(g, x, y + 3, 1.6, '#f0e0ff'); P.line(g, x + 1.4, y + 3, x + 1.4, y - 2, 0.8, '#f0e0ff'); }); },
    pendulum(g) { g0 = g; P.rect(g, 6, 3, 20, 2.4, '#8a6420'); P.line(g, 16, 5, 21, 20, 1.2, '#c8b890'); P.circle(g, 21.5, 22, 5, P.vol(g, 21.5, 22, 5, '#40c060')); P.circle(g, 20, 20.5, 1.2, '#e0ffe0'); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 0.8; g.beginPath(); g.arc(16, 5, 18, 1.2, 1.9); g.stroke(); },
    bones(g) { g0 = g; P.bone(g, 7, 7, 25, 25, 2.4, '#e8f0f8'); P.bone(g, 25, 7, 7, 25, 2.4, '#d8e0ec'); g.strokeStyle = '#6a90b8'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(14, 12); g.lineTo(17, 15); g.lineTo(15, 18); g.stroke(); },
  });
  GL.moon = (g) => { P.circle(g, 16, 16, 11, P.vol(g, 16, 16, 11, '#e02838')); P.circle(g, 20, 13, 9, 'rgba(0,0,0,0.55)'); };

  /** The box of a sprite's visible pixels (for cropping portraits). */
  function opaqueBox(img) {
    const w = img.width, h = img.height; let x0 = w, y0 = h, x1 = 0, y1 = 0;
    try {
      const c = document.createElement('canvas'); c.width = w; c.height = h; const cg = c.getContext('2d', { willReadFrequently: true }); cg.drawImage(img, 0, 0);
      const d = cg.getImageData(0, 0, w, h).data;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    } catch (e) { return { x0: 0, y0: 0, x1: w, y1: h }; }
    return x1 > x0 ? { x0, y0, x1: x1 + 1, y1: y1 + 1 } : { x0: 0, y0: 0, x1: w, y1: h };
  }
  function heroPortrait(g, id, frame) {
    // crop the head and shoulders out of the in-game sprite, one sprite pixel per icon pixel
    const s = G.sprite(id), k = G.CPX, img = s.frames[0];
    const n = frame ? 13 : 16, sx = Math.round((s.ox - n / 2) * k), sy = Math.round((s.oy - 12.6) * k);
    g.imageSmoothingEnabled = false;
    g.drawImage(img, sx, sy, n * k, n * k, frame ? 3 : 0, frame ? 3 : 0, n * 2, n * 2); // 2 box units per sprite unit
  }
  /** Draw an in-game sprite centred in the 32 box at an integer (or nearest) scale. */
  function spriteIcon(g, name, box) {
    // works in icon pixels: the box is in design units, the canvas has U2 pixels per unit
    const s = G.sprite(name), img = s.frames[0], w = img.width, h = img.height, m = Math.max(w, h), bp = box * U2;
    const k = (m <= bp ? Math.floor(bp / m) : bp / m) / U2;
    g.imageSmoothingEnabled = false;
    g.drawImage(img, Math.round((16 - w * k / 2) * U2) / U2, Math.round((16 - h * k / 2) * U2) / U2, w * k, h * k);
  }
  const ICON_STYLE = { dither: 10, sat: 0.95 };


  /* ---------- UI glyphs (u_*): replace emoji and typographic symbols with pixel icons ---------- */
  const IRON = ['#e8ecf4', '#aab0c0', '#6a7084', '#3a3e4c', '#1a1c24'];
  const UI = {
    agony(g) { P.glow(g, 16, 15, 14, '#ff2a3a', 0.5); P.circle(g, 16, 13, 10, P.vol(g, 16, 13, 10, '#e4d8bc')); P.rrect(g, 10.5, 18, 11, 8, 2, '#d0c4a4');
      P.ell(g, 12, 13.4, 3, 3.2, '#1a0608', -0.3); P.ell(g, 20, 13.4, 3, 3.2, '#1a0608', 0.3); P.circle(g, 12.3, 13.6, 1.2, '#ff3040'); P.circle(g, 19.7, 13.6, 1.2, '#ff3040');
      P.path(g, [16, 16.4, 14.6, 19.2, 17.4, 19.2]); P.fill(g, '#1a0608'); for (let i = 0; i < 4; i++) P.line(g, 12.2 + i * 2.5, 22, 12.2 + i * 2.5, 25.6, 0.8, '#6a5a40');
      P.path(g, [9, 6, 5, 1, 11, 4.4]); P.fill(g, '#c8b890'); P.path(g, [23, 6, 27, 1, 21, 4.4]); P.fill(g, '#c8b890'); },
    kill(g) { g.save(); g.translate(16, 16); for (const s of [-1, 1]) { g.save(); g.scale(s, 1); g.rotate(-0.78); P.path(g, [-1.8, 6, -1.8, -11, 0, -15, 1.8, -11, 1.8, 6]); P.fill(g, P.lg(g, -2, 0, 2, 0, [IRON[0], IRON[2]])); P.line(g, 0, 4, 0, -11, 0.6, 'rgba(160,20,30,0.9)'); P.rrect(g, -5.4, 5, 10.8, 2.2, 1, '#b08030'); P.rrect(g, -1.3, 7, 2.6, 6, 1, '#5a3a20'); P.circle(g, 0, 13.6, 1.5, '#b08030'); g.restore(); } g.restore(); },
    lock(g) { g.strokeStyle = P.lg(g, 0, 3, 0, 16, [IRON[0], IRON[3]]); g.lineWidth = 3.4; g.beginPath(); g.moveTo(10, 15); g.lineTo(10, 10.5); g.arc(16, 10.5, 6, Math.PI, 0); g.lineTo(22, 15); g.stroke();
      P.rrect(g, 6.5, 14, 19, 14, 2.5, P.lg(g, 0, 14, 0, 28, ['#e8c060', '#b07a20', '#5a3a10'])); P.rrect(g, 6.5, 14, 19, 2, 1, 'rgba(255,255,255,0.3)');
      P.circle(g, 16, 19.6, 2.3, '#1c1004'); P.path(g, [14.8, 20.4, 17.2, 20.4, 16.8, 25, 15.2, 25]); P.fill(g, '#1c1004'); },
    unlock(g) { g.strokeStyle = P.lg(g, 0, 3, 0, 16, [IRON[0], IRON[3]]); g.lineWidth = 3.4; g.beginPath(); g.moveTo(22, 15); g.lineTo(22, 9); g.arc(16, 9, 6, 0, Math.PI, true); g.lineTo(10, 11); g.stroke();
      P.rrect(g, 6.5, 14, 19, 14, 2.5, P.lg(g, 0, 14, 0, 28, ['#b8f070', '#5aa030', '#2a5010'])); P.circle(g, 16, 19.6, 2.3, '#0c1a04'); P.path(g, [14.8, 20.4, 17.2, 20.4, 16.8, 25, 15.2, 25]); P.fill(g, '#0c1a04'); },
    check(g) { g.strokeStyle = '#0c2008'; g.lineWidth = 6.4; g.beginPath(); g.moveTo(6, 16.5); g.lineTo(13, 23.5); g.lineTo(26.5, 8.5); g.stroke();
      g.strokeStyle = P.lg(g, 0, 8, 0, 24, ['#c8ff90', '#5ad040', '#2a8a20']); g.lineWidth = 3.8; g.stroke(); },
    secret(g) { P.glow(g, 16, 16, 14, '#c070ff', 0.6); const st = (r, w, c) => { P.path(g, [16, 16 - r, 16 + w, 16 - w, 16 + r, 16, 16 + w, 16 + w, 16, 16 + r, 16 - w, 16 + w, 16 - r, 16, 16 - w, 16 - w]); P.fill(g, c); };
      st(13, 3.2, '#6a2a9a'); st(10.5, 2.2, '#e0b0ff'); P.circle(g, 16, 16, 2, '#ffffff'); },
    star(g) { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5.6 : 13; pts.push(16 + Math.cos(a) * r, 16.6 + Math.sin(a) * r); } P.path(g, pts); P.fill(g, '#3a2408'); g.save(); g.translate(16, 16.6); g.scale(0.82, 0.82); g.translate(-16, -16.6); P.path(g, pts); P.fill(g, P.lg(g, 0, 4, 0, 28, ['#fff4b0', '#f0b030', '#a86a10'])); g.restore(); },
    star0(g) { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5.6 : 13; pts.push(16 + Math.cos(a) * r, 16.6 + Math.sin(a) * r); } P.path(g, pts); P.fill(g, '#1a1418'); g.save(); g.translate(16, 16.6); g.scale(0.78, 0.78); g.translate(-16, -16.6); P.path(g, pts); P.fill(g, '#3e3440'); g.restore(); },
    bag(g) { // a leather satchel: flap, buckle strap, shoulder strap
      g.strokeStyle = '#1a0e06'; g.lineWidth = 4; g.beginPath(); g.moveTo(9, 13); g.quadraticCurveTo(16, 1, 23, 13); g.stroke();
      g.strokeStyle = '#7a4a22'; g.lineWidth = 2; g.beginPath(); g.moveTo(9, 13); g.quadraticCurveTo(16, 1, 23, 13); g.stroke();
      P.path(g, [5, 13, 27, 13, 28.5, 27, 26, 29, 6, 29, 3.5, 27]); P.fill(g, '#1a0e06');
      P.path(g, [6.5, 14.5, 25.5, 14.5, 26.8, 26.4, 25, 27.6, 7, 27.6, 5.2, 26.4]); P.fill(g, P.lg(g, 0, 14, 0, 28, ['#b07840', '#8a5428', '#5a3416']));
      P.path(g, [5.4, 13, 26.6, 13, 25.6, 20.5, 16, 22.6, 6.4, 20.5]); P.fill(g, '#1a0e06');
      P.path(g, [6.8, 14.2, 25.2, 14.2, 24.4, 19.6, 16, 21.4, 7.6, 19.6]); P.fill(g, P.lg(g, 0, 14, 0, 21, ['#d09a58', '#9a6230']));
      g.fillStyle = '#5a3416'; g.fillRect(14.6, 19.5, 2.8, 6);
      P.path(g, [13.2, 21, 18.8, 21, 18.8, 25.4, 13.2, 25.4]); P.fill(g, '#1a0e06');
      P.path(g, [14.2, 22, 17.8, 22, 17.8, 24.4, 14.2, 24.4]); P.fill(g, P.lg(g, 0, 22, 0, 24.4, ['#fff0a0', '#c89030']));
      g.strokeStyle = 'rgba(255,230,180,0.35)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(8, 15.4); g.lineTo(24, 15.4); g.stroke(); },
    close(g) { for (const [w, c] of [[6, '#140a0c'], [3.4, '#d0b890']]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(8, 8); g.lineTo(24, 24); g.moveTo(24, 8); g.lineTo(8, 24); g.stroke(); } },
    cog(g) { const pts = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 10 : 13.4; pts.push(16 + Math.cos(a) * r, 16 + Math.sin(a) * r); } P.path(g, pts); P.fill(g, P.lg(g, 0, 3, 0, 29, [IRON[1], IRON[2], IRON[4]]));
      P.circle(g, 16, 16, 8.4, P.lg(g, 0, 8, 0, 24, [IRON[0], IRON[2]])); P.circle(g, 16, 16, 4, '#1a1c24'); },
    hand(g) { // a touch: a fingertip dot inside two fading rings
      g.strokeStyle = 'rgba(240,200,110,0.45)'; g.lineWidth = 1.6; g.beginPath(); g.arc(16, 16, 13, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = 'rgba(240,200,110,0.8)'; g.lineWidth = 2; g.beginPath(); g.arc(16, 16, 8.6, 0, Math.PI * 2); g.stroke();
      P.circle(g, 16, 16, 5, P.vol(g, 16, 16, 5, '#f0c860')); },
    left(g) { P.path(g, [22, 5, 22, 27, 7, 16]); P.fill(g, '#1a1004'); P.path(g, [20.4, 8, 20.4, 24, 9.4, 16]); P.fill(g, P.lg(g, 0, 8, 0, 24, ['#fff0a0', '#e0b040', '#a06a10'])); },
    seal(g) { // the Seven Nights' token: a bronze medallion with an eight-pointed star of blood
      P.glow(g, 16, 16, 15, '#ff7030', 0.3); P.circle(g, 16, 16, 14, '#1a0c04'); P.circle(g, 16, 16, 12.6, P.lg(g, 0, 4, 0, 28, ['#f0c070', '#b07030', '#5a3010']));
      P.circle(g, 16, 16, 9.6, '#2a1206'); P.circle(g, 16, 16, 8.6, P.vol(g, 16, 16, 8.6, '#6a3a1a'));
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; P.circle(g, 16 + Math.cos(a) * 11.1, 16 + Math.sin(a) * 11.1, 0.8, '#fff0b0'); }
      const pts = []; for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + i * Math.PI / 8, r = i % 2 ? 2.6 : 7.6; pts.push(16 + Math.cos(a) * r, 16 + Math.sin(a) * r); }
      P.path(g, pts); P.fill(g, P.lg(g, 0, 8, 0, 24, ['#ff8a70', '#c0202e', '#6a0810'])); P.circle(g, 16, 16, 1.8, '#ffe0a0'); },
    pause(g) { for (const x of [8, 18.4]) { P.rrect(g, x - 1, 5, 7.6, 22, 2, '#1a1004'); P.rrect(g, x, 6.4, 5.6, 19.2, 1.4, P.lg(g, 0, 6, 0, 26, ['#d8ccb0', '#a8987a', '#5a4c3a'])); P.rrect(g, x + 0.8, 7.2, 1.4, 16, 0.7, 'rgba(255,255,255,0.25)'); } },
    full(g) { const c = (x, y, sx, sy) => { for (const [w, col] of [[5.4, '#0a0806'], [2.8, '#b8a888']]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, y + sy * 8); g.lineTo(x, y); g.lineTo(x + sx * 8, y); g.stroke(); } };
      c(6, 6, 1, 1); c(26, 6, -1, 1); c(6, 26, 1, -1); c(26, 26, -1, -1); },
    unfull(g) { const c = (x, y, sx, sy) => { for (const [w, col] of [[5.4, '#0a0806'], [2.8, '#b8a888']]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x - sx * 8, y); g.lineTo(x, y); g.lineTo(x, y - sy * 8); g.stroke(); } };
      c(13, 13, 1, 1); c(19, 13, -1, 1); c(13, 19, 1, -1); c(19, 19, -1, -1); },
    pin(g) { // a pushpin with a blood-red head: the pinned quest
      g.strokeStyle = '#1a1004'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(16, 17); g.lineTo(9, 28); g.stroke(); g.strokeStyle = '#c8ccd8'; g.lineWidth = 1.4; g.stroke();
      P.path(g, [9.5, 16.5, 22.5, 16.5, 20, 12, 12, 12]); P.fill(g, '#2a0608'); P.path(g, [10.8, 15.6, 21.2, 15.6, 19.2, 12.8, 12.8, 12.8]); P.fill(g, '#a01824');
      P.circle(g, 16, 8.4, 6.4, '#2a0608'); P.circle(g, 16, 8.4, 5, P.vol(g, 16, 8.4, 5, '#e03040')); P.circle(g, 14.2, 6.6, 1.4, 'rgba(255,220,220,0.7)'); },
    right(g) { P.path(g, [10, 5, 10, 27, 25, 16]); P.fill(g, '#1a1004'); P.path(g, [11.6, 8, 11.6, 24, 22.6, 16]); P.fill(g, P.lg(g, 0, 8, 0, 24, ['#fff0a0', '#e0b040', '#a06a10'])); },
  };
  /* ---------- ability icons: one picture per ability in a dark iron frame lit by its element ---------- */
  const INK = '#0a0608';
  function frame(g, col) {
    P.rrect(g, 1, 1, 30, 30, 5, P.lg(g, 0, 1, 0, 31, ['#4a4450', '#26222c', '#110e14']));
    g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(2.2, 25); g.lineTo(2.2, 6); g.quadraticCurveTo(2.2, 2.2, 6, 2.2); g.lineTo(26, 2.2); g.stroke();
    P.rrect(g, 3.4, 3.4, 25.2, 25.2, 3.4, P.rg(g, 16, 19, 19, [[0, sh(col, -0.2)], [0.55, sh(col, -0.62)], [1, '#07050a']]));
    g.strokeStyle = G.rgba(col, 0.55); g.lineWidth = 0.6; P.rrect(g, 3.7, 3.7, 24.6, 24.6, 3.2); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(4, 26); g.lineTo(4, 7); g.quadraticCurveTo(4, 4, 7, 4); g.lineTo(27, 4); g.stroke();
    for (const [x, y] of [[3.1, 3.1], [28.9, 3.1], [3.1, 28.9], [28.9, 28.9]]) { P.circle(g, x, y, 1.3, P.vol(g, x, y, 1.3, '#7a7282')); }
  }
  const sil = (g, pts, fill, w) => { P.path(g, pts); g.strokeStyle = INK; g.lineWidth = w || 1.2; g.stroke(); P.fill(g, fill); };
  const inkLine = (g, x1, y1, x2, y2, w, col) => { g.lineCap = 'round'; P.line(g, x1, y1, x2, y2, w + 1.2, INK); P.line(g, x1, y1, x2, y2, w, col); };
  const inkCircle = (g, x, y, r, fill) => { P.circle(g, x, y, r + 0.6, INK); P.circle(g, x, y, r, fill); };
  const inkPath = (g, draw, fill, w) => { draw(); g.strokeStyle = INK; g.lineWidth = w || 1.2; g.stroke(); draw(); P.fill(g, fill); };
  const steel = (g, x0, y0, x1, y1) => P.lg(g, x0, y0, x1, y1, ['#f4f6fa', '#aab2c0', '#555b6a']);
  const wood = (g, x0, y0, x1, y1) => P.lg(g, x0, y0, x1, y1, ['#b07a48', '#6a4424', '#3a2210']);
  const gold = (g, x0, y0, x1, y1) => P.lg(g, x0, y0, x1, y1, ['#fff4c0', '#e8b840', '#7a5414']);
  const glint = (g, x, y, s, col) => { P.glow(g, x, y, s * 1.6, col || '#ffffff', 0.6); P.path(g, [x, y - s, x + s * 0.25, y - s * 0.25, x + s, y, x + s * 0.25, y + s * 0.25, x, y + s, x - s * 0.25, y + s * 0.25, x - s, y, x - s * 0.25, y - s * 0.25]); P.fill(g, col || '#ffffff'); };
  const zig = (g, pts, col, w) => { g.lineCap = 'round'; g.lineJoin = 'round'; for (const [ww, c] of [[w * 3, G.rgba(col, 0.35)], [w * 1.6, col], [w * 0.6, '#ffffff']]) { P.path(g, pts, false); g.strokeStyle = c; g.lineWidth = ww; g.stroke(); } };
  const ghost = (g, x, y, r, s, col) => {
    P.glow(g, x, y + r, r * 2.2, col, 0.5);
    g.beginPath(); g.arc(x, y, r, Math.PI, 0); g.quadraticCurveTo(x + r, y + r * 1.8, x + s * r * 1.4, y + r * 2.8); g.quadraticCurveTo(x - r * 0.2, y + r * 2, x - r, y); g.closePath();
    P.fill(g, P.lg(g, 0, y - r, 0, y + r * 2.8, ['rgba(240,255,250,0.95)', G.rgba(col, 0.75), G.rgba(col, 0)]));
    for (const d of [-0.4, 0.4]) P.ell(g, x + d * r, y + 0.1 * r, r * 0.2, r * 0.3, '#0a1a14');
  };
  const fist = (g, x, y, s, col, dark) => { // a clenched fist seen from the side, knuckles to the right
    g.save(); g.translate(x, y); g.scale(s, s);
    const f = (k) => P.lg(g, -6, -6, 6, 6, [sh(col, 0.45 + k), sh(col, k), dark || sh(col, -0.5)]);
    sil(g, [-12, -3.8, -5, -4.8, -5, 4.8, -12, 3.8], f(-0.15), 1.1);
    P.rrect(g, -6.4, -6.6, 9, 13.2, 3, INK); P.rrect(g, -5.8, -6, 7.8, 12, 2.6, f(0));
    for (let i = 0; i < 4; i++) { P.rrect(g, 0.4, -6.4 + i * 3.2, 6.6, 3.4, 1.6, INK); P.rrect(g, 0.9, -6 + i * 3.2, 5.8, 2.6, 1.3, f(0.1 - i * 0.05)); P.circle(g, 5.2, -4.8 + i * 3.2, 0.5, 'rgba(255,255,255,0.35)'); }
    g.save(); g.rotate(-0.15); P.rrect(g, -3.6, 1.6, 8.4, 3.4, 1.6, INK); P.rrect(g, -3, 2.1, 7.4, 2.4, 1.2, f(0.2)); g.restore();
    g.restore();
  };
  const ABI = {
    cleave(g) {
      g.beginPath(); g.arc(11, 22, 17, -1.5, 0.15); g.arc(11, 22, 12.6, 0.15, -1.5, true); g.closePath(); P.fill(g, P.lg(g, 11, 5, 28, 22, ['rgba(200,225,255,0)', 'rgba(210,230,255,0.8)']));
      sil(g, [9.4, 20.4, 23.6, 5.4, 26.8, 4.4, 25.8, 7.6, 11.6, 22.6], steel(g, 9, 4, 27, 23));
      P.line(g, 11.2, 20.8, 24.4, 6.8, 0.5, 'rgba(50,60,80,0.8)');
      inkLine(g, 6.8, 18.6, 13.6, 25.2, 1.6, '#c89838'); inkLine(g, 9.6, 23.6, 5.6, 27.4, 1.8, '#4a2c18'); inkCircle(g, 5, 28, 1.3, P.vol(g, 5, 28, 1.3, '#e8b850'));
      glint(g, 25, 6.4, 2.2);
    },
    longbow(g) {
      const bow = () => { g.beginPath(); g.moveTo(19, 4.4); g.quadraticCurveTo(21.4, 4.6, 22.4, 7.2); g.quadraticCurveTo(28.6, 16, 22.4, 24.8); g.quadraticCurveTo(21.4, 27.4, 19, 27.6); };
      bow(); g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke(); bow(); g.strokeStyle = P.lg(g, 0, 4, 0, 28, ['#d8a060', '#6a4020', '#d8a060']); g.lineWidth = 2; g.stroke();
      P.line(g, 19.2, 4.8, 9.6, 16, 0.5, '#efe6d0'); P.line(g, 9.6, 16, 19.2, 27.2, 0.5, '#efe6d0');
      inkLine(g, 8.4, 16.2, 25.4, 15.2, 0.8, '#c09060');
      sil(g, [24.6, 13.2, 28.4, 15, 24.6, 17], steel(g, 24, 13, 28, 17), 1);
      sil(g, [8.4, 16.2, 5, 13.6, 6.8, 13.6, 10, 15.8], '#c83030', 0.9); sil(g, [8.4, 16.2, 5, 18.8, 6.8, 18.8, 10, 16.6], '#9a2020', 0.9);
      P.rect(g, 24.4, 13.6, 1.8, 4.4, '#3a2412');
    },
    judgment(g) {
      P.path(g, [11, 3.4, 21, 3.4, 22.6, 24, 9.4, 24]); P.fill(g, P.lg(g, 0, 3.4, 0, 24, ['rgba(255,240,180,0)', 'rgba(255,230,140,0.45)']));
      P.glow(g, 16, 24, 10, '#ffd070', 0.8);
      for (let i = 0; i < 7; i++) { const a = Math.PI + i / 6 * Math.PI; P.line(g, 16 + Math.cos(a) * 4, 24.6 + Math.sin(a) * 2.4, 16 + Math.cos(a) * 11, 24.6 + Math.sin(a) * 6, 0.8, 'rgba(255,236,170,0.85)'); }
      g.strokeStyle = INK; g.lineWidth = 0.6; g.beginPath(); g.moveTo(8, 27.6); g.lineTo(12, 26.4); g.lineTo(14, 27.8); g.moveTo(19, 26.6); g.lineTo(23, 27.8); g.stroke();
      g.save(); g.translate(16, 20.4); g.rotate(-0.4);
      inkLine(g, 0, -1, 0, -16, 1.4, P.lg(g, -1, 0, 1, 0, ['#9a6a3a', '#4a2c14']));
      inkCircle(g, 0, -16.4, 1.1, '#c89838');
      sil(g, [-7, -3.6, 7, -3.6, 7.6, 0, 7, 3.6, -7, 3.6, -7.6, 0], gold(g, 0, -3.6, 0, 3.6), 1.3);
      for (const x of [-4.4, 3.6]) P.rect(g, x, -3.4, 0.9, 6.8, '#7a5414');
      P.rect(g, -6.6, -3.2, 13.2, 0.8, 'rgba(255,255,255,0.35)');
      g.restore();
      glint(g, 9.6, 12.4, 1.6);
    },
    flamejet(g) {
      P.glow(g, 22, 16, 12, '#ff7a20', 0.6);
      g.beginPath(); g.moveTo(12.6, 14.6); g.quadraticCurveTo(21, 4.6, 29, 5.6); g.quadraticCurveTo(25, 16, 29, 26.4); g.quadraticCurveTo(21, 27.4, 12.6, 17.4); g.closePath(); P.fill(g, P.lg(g, 12, 0, 29, 0, ['#fff8d0', '#ffb030', '#e84a10', 'rgba(170,30,0,0.5)']));
      g.beginPath(); g.moveTo(13, 15.4); g.quadraticCurveTo(19, 10, 24, 11.4); g.quadraticCurveTo(22, 16, 24, 20.6); g.quadraticCurveTo(19, 22, 13, 16.6); g.closePath(); P.fill(g, '#fff6d0');
      g.save(); g.translate(8.6, 17.6); g.rotate(-0.3); fist(g, 0, 0, 0.78, '#c8ccd8', '#30343e'); P.circle(g, -3.4, -1, 0.9, '#ff5030'); g.restore();
      for (const [x, y] of [[27, 10], [25.6, 23], [21, 6.4]]) P.circle(g, x, y, 0.5, '#ffe080');
    },
    spirits(g) {
      ghost(g, 8.4, 8, 3.2, 1, '#80f0c0'); ghost(g, 23.4, 9.4, 2.8, -1, '#80f0c0');
      g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(16, 14.4, 2.6, Math.PI, 0); g.stroke(); g.strokeStyle = '#c8a050'; g.lineWidth = 0.9; g.stroke();
      sil(g, [12.4, 16.6, 19.6, 16.6, 21.2, 18.4, 10.8, 18.4], gold(g, 0, 16.6, 0, 18.4), 1);
      P.rrect(g, 11.4, 18.2, 9.2, 7.6, 1, INK); P.rect(g, 12.2, 18.6, 7.6, 6.8, P.rg(g, 16, 22, 5, ['#f0fff8', '#80f0c0', '#1a6a4a']));
      P.glow(g, 16, 22, 7, '#80f0c0', 0.6);
      for (const x of [14.2, 17.8]) P.rect(g, x, 18.6, 0.7, 6.8, '#2a2014');
      sil(g, [10.8, 25.6, 21.2, 25.6, 20.4, 27.8, 11.6, 27.8], gold(g, 0, 25.6, 0, 27.8), 1);
    },
    shieldbash(g) {
      zig(g, [24, 5, 25.6, 9.6, 29, 8.4, 26.4, 12, 29.6, 15, 25.4, 15], '#ffe0a0', 0.5); P.glow(g, 25, 11, 6, '#ffd080', 0.6);
      for (const [y, l] of [[9, 5], [15, 6.4], [21, 4.6]]) P.line(g, 2.6, y, 2.6 + l, y, 0.8, 'rgba(220,230,255,0.5)');
      g.save(); g.translate(14.4, 16.6); g.rotate(-0.18);
      const sp = () => { g.beginPath(); g.moveTo(-8.4, -10); g.lineTo(8.4, -10); g.lineTo(8, 0); g.quadraticCurveTo(6, 8, 0, 11.4); g.quadraticCurveTo(-6, 8, -8, 0); g.closePath(); };
      inkPath(g, sp, P.lg(g, -8, -10, 8, 11, ['#9aacc8', '#4a5a7a', '#1e2638']), 1.4);
      g.strokeStyle = '#c8a040'; g.lineWidth = 0.9; g.save(); g.scale(0.84, 0.84); sp(); g.stroke(); g.restore();
      P.path(g, [-7, -8.6, 7, -8.6, 6.6, -4, -6.6, -4]); P.fill(g, 'rgba(255,255,255,0.12)');
      inkCircle(g, 0, -0.6, 2.6, P.vol(g, 0, -0.6, 2.6, '#d0d6e0'));
      g.restore();
    },
    arcbolt(g) {
      P.glow(g, 13, 16, 12, '#ffe060', 0.45);
      sil(g, [15, 3, 6.6, 17.6, 12, 17.6, 9, 28.6, 20.4, 12.6, 14.8, 12.6, 18.8, 3], P.lg(g, 6, 3, 21, 28, ['#fffbe0', '#ffe040', '#d89010']));
      zig(g, [20.4, 12.6, 22.6, 10.4, 22.2, 8.6, 25.4, 7.4, 27.4, 5.6], '#ffe870', 0.4); zig(g, [20.4, 12.6, 23, 15.6, 22.4, 18, 25.4, 19.4, 26.6, 22.4], '#ffe870', 0.4);
      glint(g, 27.4, 5.6, 1.8, '#fff6b0'); glint(g, 26.6, 22.4, 1.8, '#fff6b0');
    },
    wolves(g) {
      P.glow(g, 27, 20, 6, '#b8ecff', 0.6); for (const [x, y, r] of [[27.6, 21, 1.6], [26, 23.4, 1.2], [28.4, 24, 1]]) P.circle(g, x, y, r, 'rgba(220,245,255,0.6)');
      sil(g, [5, 13, 7.4, 4.4, 11.4, 9.4, 14, 8.4, 16.8, 4, 18.4, 10.2, 23, 12.4, 28.2, 15.4, 27.6, 17.8, 23.2, 18.6, 25.4, 20.6, 20, 21.6, 16.4, 24.6, 11, 27, 6, 24.4, 3.8, 18.6], P.lg(g, 4, 5, 26, 27, ['#e8f0fa', '#8a9ab4', '#343c50']), 1.3);
      P.path(g, [23.2, 18.6, 18.8, 19.6, 25.4, 20.6]); P.fill(g, '#3a0a10');
      for (const [x, d] of [[21.6, 1], [23.8, 1]]) { P.path(g, [x - 0.5, 18.9, x + 0.5, 18.8, x, 20.2]); P.fill(g, '#ffffff'); }
      P.circle(g, 27.8, 16.2, 0.9, INK);
      P.glow(g, 18.4, 13.6, 2.6, '#60d0ff', 0.8); P.path(g, [16.8, 13.8, 18.6, 12.8, 20, 13.6, 18.4, 14.4]); P.fill(g, '#b0f0ff');
      g.strokeStyle = 'rgba(20,24,40,0.7)'; g.lineWidth = 0.6; for (const [x, y] of [[8, 16], [9.4, 20], [11.6, 23.4]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y + 1); g.stroke(); }
      P.path(g, [8.2, 7.2, 10.2, 9.8, 8.8, 10.4]); P.fill(g, '#4a5268');
    },
    frostaxe(g) {
      P.glow(g, 23, 13, 10, '#8fe0ff', 0.5);
      inkLine(g, 6.4, 28, 19.6, 5, 1.8, '#6a4424');
      sil(g, [16.6, 8.4, 22.8, 4.2, 27.6, 5.6, 28.6, 12, 27, 18.6, 23.6, 22, 22.4, 17.2, 19.6, 13.8, 16.2, 12.8], P.lg(g, 16, 4, 29, 22, ['#f8fcff', '#a8c8e0', '#4a6a8a']), 1.3);
      g.strokeStyle = '#e8faff'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(27.6, 5.6); g.lineTo(28.6, 12); g.lineTo(27, 18.6); g.stroke();
      for (const [x, y, h] of [[23.6, 22, 3.4], [25.4, 20.6, 2.4], [21.6, 19, 2]]) sil(g, [x - 0.7, y - 0.4, x + 0.7, y - 0.4, x, y + h], '#d8f4ff', 0.7);
      for (const [x, y] of [[26.4, 9], [25, 15]]) sil(g, [x, y - 1.2, x + 1, y, x, y + 1.2, x - 1, y], '#ffffff', 0.6);
      sil(g, [15.4, 11, 18.4, 9.4, 19.8, 12.4, 16.8, 14], '#5a5e6a', 0.9);
      glint(g, 23.4, 5.8, 1.6, '#e0f8ff');
    },
    arcaneorb(g) {
      P.glow(g, 16, 16, 14, '#c070ff', 0.6);
      g.strokeStyle = 'rgba(230,180,255,0.5)'; g.lineWidth = 0.8; g.beginPath(); g.ellipse(16, 16, 12.4, 4.6, -0.4, Math.PI, Math.PI * 2); g.stroke();
      inkCircle(g, 16, 16, 7.4, P.rg(g, 14, 13.4, 9, ['#ffffff', '#e0b0ff', '#7a30c0', '#2a0a50']));
      g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 0.6; g.beginPath(); g.arc(16, 16, 4.4, 0.4, 2.6); g.stroke(); g.beginPath(); g.arc(16, 16, 2.4, 3.4, 5.4); g.stroke();
      g.strokeStyle = '#e8c0ff'; g.lineWidth = 0.9; g.beginPath(); g.ellipse(16, 16, 12.4, 4.6, -0.4, 0, Math.PI); g.stroke();
      for (let i = 0; i < 5; i++) { const a = 0.3 + i * 0.6, x = 16 + Math.cos(a) * 12.4 * Math.cos(-0.4) - Math.sin(a) * 4.6 * Math.sin(-0.4), y = 16 + Math.cos(a) * 12.4 * Math.sin(-0.4) + Math.sin(a) * 4.6 * Math.cos(-0.4); P.rect(g, x - 0.5, y - 0.9, 1, 1.8, '#ffffff'); }
      P.circle(g, 13.4, 13, 1.6, 'rgba(255,255,255,0.9)');
    },
    bloodpulse(g) {
      for (const [r, a] of [[12.6, 0.45], [9.6, 0.7]]) { g.strokeStyle = 'rgba(230,40,60,' + a + ')'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(16, 20, r, r * 0.5, 0, 0, Math.PI * 2); g.stroke(); }
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 3.6); g.bezierCurveTo(21, 11, 23, 14, 23, 18); g.arc(16, 18, 7, 0, Math.PI); g.bezierCurveTo(9, 14, 11, 11, 16, 3.6); }, P.rg(g, 14, 15, 10, ['#ff8a90', '#d0182c', '#5a0610']), 1.3);
      P.ell(g, 13.4, 15, 1.4, 2.6, 'rgba(255,220,220,0.7)', 0.3);
      for (const [x, y, r] of [[5.4, 12, 1.2], [26.6, 11, 1], [4.6, 22, 0.9], [27.4, 23.4, 1.1]]) inkCircle(g, x, y, r, '#c0182a');
    },
    scythes(g) {
      g.strokeStyle = 'rgba(210,220,240,0.35)'; g.lineWidth = 2.2; g.beginPath(); g.arc(16, 16, 11.4, 0, Math.PI * 2); g.stroke();
      for (const a of [0.3, 0.3 + Math.PI]) {
        g.save(); g.translate(16, 16); g.rotate(a);
        inkLine(g, 0, 0, 0, -11, 1.3, '#6a4a3a');
        sil(g, [0, -11, -4, -13.2, -10, -11.8, -12.6, -6.4, -8, -8.6, -3, -9, -0.4, -8.4], P.lg(g, -12, -13, 0, -8, ['#9aa4b8', '#f4f6fa', '#6a7080']), 1);
        g.restore();
      }
      inkCircle(g, 16, 16, 1.8, P.vol(g, 16, 16, 1.8, '#8a8a9a'));
    },
    chord(g) {
      for (const [r, a] of [[9, 0.9], [12, 0.6], [15, 0.35]]) { g.strokeStyle = 'rgba(230,170,255,' + a + ')'; g.lineWidth = 1.1; g.beginPath(); g.arc(12, 17, r, -0.7, 0.7); g.stroke(); }
      g.save(); g.translate(12, 17); g.rotate(-0.55);
      sil(g, [-1.2, -4, -1.2, -15, 1.2, -15, 1.2, -4], '#3a2010', 1);
      sil(g, [-1.8, -15, -2.4, -18, 2.4, -18, 1.8, -15], '#5a3418', 1);
      inkPath(g, () => { g.beginPath(); g.ellipse(0, 3.6, 6.6, 8.2, 0, 0, Math.PI * 2); }, P.rg(g, -2, 1, 10, ['#f0b870', '#b06a2a', '#4a2408']), 1.2);
      P.circle(g, 0, 2, 2.2, '#1a0c06'); P.rect(g, -2.6, 8.6, 5.2, 1.2, '#2a1608');
      g.strokeStyle = 'rgba(255,240,200,0.85)'; g.lineWidth = 0.35; g.beginPath(); for (const o of [-0.7, 0, 0.7]) { g.moveTo(o, -15); g.lineTo(o, 8.6); } g.stroke();
      g.restore();
      for (const [x, y] of [[24, 7], [27, 12]]) { inkCircle(g, x, y + 2, 1.1, '#f0d8ff'); inkLine(g, x + 1, y + 2, x + 1, y - 2, 0.4, '#f0d8ff'); }
    },
  };
  Object.assign(ABI, {
    arquebus(g) {
      for (const [x, y, r] of [[24, 6, 2.6], [27.4, 8.6, 2], [21.6, 4.2, 1.8]]) P.circle(g, x, y, r, 'rgba(200,200,210,0.55)');
      P.glow(g, 23, 9, 6, '#ffb040', 0.8); sil(g, [20, 9.6, 23, 6, 22.6, 8.4, 26, 7.4, 23.4, 10.2, 25.6, 12.4, 22, 11.6], '#ffd060', 0.8);
      g.save(); g.translate(14, 18.4); g.rotate(-0.62);
      sil(g, [-13, 3.4, -4.6, -1, -0.6, -1, -0.6, 2.2, -11, 7.4], wood(g, -13, 0, 0, 0));
      sil(g, [-2, -2.4, 12, -2.4, 12, 0.2, -2, 0.2], P.lg(g, 0, -2.6, 0, 0.4, ['#f0f2f8', '#8a90a0', '#3a3e48']), 1);
      P.rect(g, 1.6, -2.6, 1.2, 3, '#c89838'); P.rect(g, 7, -2.6, 1.2, 3, '#c89838');
      inkLine(g, -1.6, 0.4, -3, 3.6, 0.6, '#e0b040'); P.circle(g, -3.8, -2.4, 0.7, '#ff8030');
      g.restore();
    },
    concoction(g) {
      for (const [x, y, r] of [[23.4, 25, 1.4], [26.4, 21.4, 1], [6.4, 25.4, 1.2]]) inkCircle(g, x, y, r, '#90e050');
      P.glow(g, 16, 19, 12, '#90e050', 0.55);
      g.save(); g.translate(16, 17); g.rotate(0.35);
      sil(g, [-2.6, -12.4, 2.6, -12.4, 2.6, -9.6, -2.6, -9.6], wood(g, 0, -12, 0, -9), 1);
      sil(g, [-2.2, -9.8, 2.2, -9.8, 2.2, -5, -2.2, -5], 'rgba(220,240,255,0.8)', 1);
      inkCircle(g, 0, 2, 8.4, 'rgba(200,230,240,0.5)');
      g.save(); g.beginPath(); g.arc(0, 2, 7.8, 0, Math.PI * 2); g.clip(); P.rect(g, -9, -0.4, 18, 11, P.lg(g, 0, -0.4, 0, 10, ['#e0ff90', '#70c030', '#1e5010'])); g.restore();
      for (const [x, y, r] of [[-3, 4, 1.4], [2.6, 6, 1], [0, 1.4, 0.8]]) P.circle(g, x, y, r, 'rgba(255,255,255,0.8)');
      P.ell(g, -4.2, -2, 1.3, 2.4, 'rgba(255,255,255,0.8)', 0.4);
      g.restore();
      for (const [x, y, r] of [[11.6, 5.4, 1.2], [13.6, 2.6, 0.9]]) P.circle(g, x, y, r, 'rgba(200,255,150,0.8)');
    },
    bogplants(g) {
      P.ell(g, 16, 27.4, 9, 2.2, '#241a0c');
      inkPath(g, () => { g.beginPath(); g.moveTo(15, 27.6); g.quadraticCurveTo(9, 21, 14.4, 15.6); g.lineTo(16.4, 16.6); g.quadraticCurveTo(12.4, 21, 17, 27.6); }, '#4a7a24', 1);
      for (const [a, c] of [[-2.7, '#4a7a28'], [-0.4, '#5a8a30']]) { g.save(); g.translate(16, 26.6); g.rotate(a); inkPath(g, () => { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(5, -3.6, 10, 0); g.quadraticCurveTo(5, 3, 0, 0); }, c, 1); g.restore(); }
      g.save(); g.translate(15.4, 14.4);
      for (const [s, f0, f1] of [[-1, '#b0e060', '#4a7a20'], [1, '#5a8a28', '#1e3a0c']]) {
        g.save(); g.rotate(s * 0.55);
        inkPath(g, () => { g.beginPath(); g.moveTo(-2, 0); g.quadraticCurveTo(5, s * 9, 13, s * 1.2); g.lineTo(-2, s * -0.8); g.closePath(); }, P.lg(g, 0, s * 8, 0, 0, [f0, f1]), 1.1);
        P.path(g, [0, s * 0.2, 5, s * 2.8, 10, s * 0.8]); P.fill(g, s < 0 ? '#e0304a' : '#8a1020');
        for (let i = 0; i < 4; i++) { const x = 3 + i * 2.6; P.path(g, [x - 0.6, s * 0.6, x + 0.6, s * 0.6, x + 0.2, s * -1.8]); P.fill(g, '#f4f0e0'); }
        g.restore();
      }
      g.restore();
      P.ell(g, 27, 16.6, 0.7, 1.2, 'rgba(200,255,120,0.7)');
    },
    hexlance(g) {
      P.glow(g, 16, 16, 13, '#c060ff', 0.55);
      inkLine(g, 4.6, 27.4, 22, 10, 1.5, P.lg(g, 4, 27, 22, 10, ['#4a1a7a', '#c080ff']));
      sil(g, [20.6, 8.6, 27.4, 4.6, 23.4, 11.4, 22, 11.4], P.lg(g, 20, 4, 28, 12, ['#ffffff', '#e0b0ff', '#8a40d0']));
      g.save(); g.translate(13.4, 18.6); g.rotate(-0.78);
      g.strokeStyle = INK; g.lineWidth = 2; P.path(g, [0, -6, 5.2, -3, 5.2, 3, 0, 6, -5.2, 3, -5.2, -3]); g.stroke(); g.strokeStyle = '#e8b8ff'; g.lineWidth = 0.9; g.stroke();
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.52; P.circle(g, Math.cos(a) * 5.2, Math.sin(a) * 5.2, 0.6, '#ffffff'); }
      g.restore();
      for (const [x, y] of [[8, 9], [25, 22]]) glint(g, x, y, 1.4, '#e8c8ff');
    },
    chakrams(g) {
      g.strokeStyle = 'rgba(220,230,250,0.35)'; g.lineWidth = 1.6; g.beginPath(); g.arc(16, 16, 12.4, -0.4, 1.4); g.stroke(); g.beginPath(); g.arc(16, 16, 12.4, 2.7, 4.5); g.stroke();
      g.save(); g.translate(16, 16); g.rotate(0.3);
      for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); sil(g, [5, -2.4, 9.4, -6.4, 12.4, -2.6, 8.6, -3, 6.2, 2], steel(g, 5, -6, 12, 2), 1); }
      g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.arc(0, 0, 6, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = P.lg(g, -6, -6, 6, 6, ['#f4f6fa', '#8a92a4']); g.lineWidth = 2.2; g.stroke();
      g.strokeStyle = '#c89838'; g.lineWidth = 0.5; g.beginPath(); g.arc(0, 0, 6, 0, Math.PI * 2); g.stroke();
      g.restore(); glint(g, 11.4, 10.4, 1.6);
    },
    orbs(g) {
      g.strokeStyle = 'rgba(255,230,190,0.45)'; g.lineWidth = 0.9; g.beginPath(); g.ellipse(16, 16, 12, 5.4, -0.35, 0, Math.PI * 2); g.stroke();
      inkCircle(g, 16, 16, 2.2, P.vol(g, 16, 16, 2.2, '#e8c070'));
      const ball = (x, y) => {
        for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; sil(g, [x + Math.cos(a - 0.35) * 3.6, y + Math.sin(a - 0.35) * 3.6, x + Math.cos(a) * 6, y + Math.sin(a) * 6, x + Math.cos(a + 0.35) * 3.6, y + Math.sin(a + 0.35) * 3.6], '#c8ccd6', 0.8); }
        inkCircle(g, x, y, 4, P.vol(g, x, y, 4, '#6a7080'));
      };
      g.strokeStyle = 'rgba(255,220,160,0.4)'; g.lineWidth = 3; g.beginPath(); g.ellipse(16, 16, 12, 5.4, -0.35, 3.3, 4.2); g.stroke(); g.beginPath(); g.ellipse(16, 16, 12, 5.4, -0.35, 0.2, 1.1); g.stroke();
      ball(6.6, 19.4); ball(25.4, 12.6);
    },
    darts(g) {
      for (const [a, dx] of [[-0.35, -2], [0, 0], [0.35, 2]]) {
        g.save(); g.translate(10 + dx, 23); g.rotate(-0.78 + a);
        sil(g, [0, -1.4, 13, -1.2, 17, 0, 13, 1.2, 0, 1.4], steel(g, 0, -1.4, 0, 1.4), 1);
        P.line(g, 1, 0, 14, 0, 0.35, 'rgba(60,70,90,0.8)');
        inkLine(g, -0.6, -2.6, -0.6, 2.6, 0.9, '#c89838'); inkLine(g, -1, 0, -5, 0, 1.2, '#3a2412'); inkCircle(g, -5.6, 0, 0.9, '#c89838');
        g.restore();
      }
    },
    wyrmfire(g) {
      g.beginPath(); g.moveTo(17, 17); g.quadraticCurveTo(24, 10, 29.4, 11); g.quadraticCurveTo(27, 19, 29.4, 27); g.quadraticCurveTo(23, 26, 17, 19.4); g.closePath(); P.fill(g, P.lg(g, 17, 0, 29, 0, ['#fff4b0', '#ffa030', '#d83810']));
      P.glow(g, 24, 19, 9, '#ff8020', 0.55);
      sil(g, [3, 17, 5, 10.4, 9.6, 7.6, 7, 3.4, 12.6, 6.6, 16, 8, 20, 12, 19.4, 15.4, 15.4, 16, 18.6, 18.6, 16.4, 21, 12, 20.4, 8, 24.6, 3.6, 25.4], P.lg(g, 3, 4, 20, 25, ['#8a3a30', '#4a1a18', '#1e0a0a']), 1.3);
      P.path(g, [19.4, 15.4, 15.4, 16, 18.6, 18.6]); P.fill(g, '#ffb040');
      for (const x of [16.6, 18.4]) { P.path(g, [x - 0.4, 15.6, x + 0.4, 15.5, x, 16.9]); P.fill(g, '#f4ecd8'); }
      P.glow(g, 13, 10.6, 2.6, '#ffd040', 0.8); P.path(g, [11.6, 10.8, 13.4, 9.6, 14.6, 10.8, 13, 11.6]); P.fill(g, '#ffe070');
      for (const [x, y] of [[6, 14], [5, 19], [8, 21.6]]) P.ell(g, x, y, 1.2, 0.7, 'rgba(0,0,0,0.35)');
    },
    stormsphere(g) {
      P.glow(g, 16, 16, 14, '#fff080', 0.6);
      zig(g, [16, 16, 10, 12, 8.4, 6.4, 4.6, 5], '#fff080', 0.5); zig(g, [16, 16, 23, 13.4, 24.4, 8, 28, 6.4], '#fff080', 0.5); zig(g, [16, 16, 13, 22.6, 7.6, 24.6, 5.4, 28], '#fff080', 0.5); zig(g, [16, 16, 22, 21.4, 27.4, 23, 27.8, 27], '#fff080', 0.5);
      inkCircle(g, 16, 16, 6.6, P.rg(g, 14.4, 14, 8, ['#ffffff', '#fff6a0', '#e0b020', '#6a4a08']));
      zig(g, [12.6, 14, 15, 17, 14.2, 18.6, 18.6, 18.8], '#ffffff', 0.35);
      P.circle(g, 14, 13.4, 1.3, '#ffffff');
    },
  });
  Object.assign(ABI, {
    halo(g) {
      P.glow(g, 16, 17, 14, '#ffe080', 0.55);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r0 = 9.4, r1 = i % 2 ? 12.4 : 14; P.path(g, [16 + Math.cos(a - 0.1) * r0, 17 + Math.sin(a - 0.1) * r0 * 0.55, 16 + Math.cos(a) * r1, 17 + Math.sin(a) * r1 * 0.55, 16 + Math.cos(a + 0.1) * r0, 17 + Math.sin(a + 0.1) * r0 * 0.55]); P.fill(g, 'rgba(255,236,160,0.85)'); }
      g.strokeStyle = INK; g.lineWidth = 3.6; g.beginPath(); g.ellipse(16, 17, 9, 4.6, 0, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = P.lg(g, 7, 12, 25, 22, ['#fff8d0', '#f0c040', '#a07010']); g.lineWidth = 2.4; g.stroke();
      g.strokeStyle = '#ffffff'; g.lineWidth = 0.6; g.beginPath(); g.ellipse(16, 17, 9, 4.6, 0, Math.PI * 1.05, Math.PI * 1.6); g.stroke();
      glint(g, 22.6, 13.8, 1.8);
    },
    rifts(g) {
      P.glow(g, 16, 16, 14, '#a040ff', 0.6);
      const tear = [15, 3.4, 17.4, 8, 16, 11, 19.6, 14, 17.8, 18, 20, 22.6, 16.6, 28.6, 14, 23, 12, 19.4, 14.6, 15.4, 11.8, 11.6, 14.6, 8.4];
      sil(g, tear, P.rg(g, 16, 16, 12, ['#ffffff', '#c070ff', '#3a0a6a', '#0a0212']), 1.3);
      for (const [x, y] of [[15.4, 12], [16.8, 19], [15, 23]]) P.circle(g, x, y, 0.45, '#ffffff');
      for (const [x, y, s] of [[8, 8, 1], [24.4, 10, -1], [23.4, 25, 1], [7.4, 23.4, -1]]) sil(g, [x, y - 1.6, x + s * 1.4, y, x, y + 1.2, x - s * 0.8, y], '#b070f0', 0.7);
    },
    skyfall(g) {
      P.glow(g, 11, 21, 10, '#ff7020', 0.55);
      g.beginPath(); g.moveTo(29, 3); g.lineTo(15.6, 16.6); g.lineTo(9.4, 17.4); g.lineTo(13.6, 12.6); g.closePath(); P.fill(g, P.lg(g, 29, 3, 11, 17, ['rgba(255,220,120,0)', '#ffb040', '#ff5010']));
      g.beginPath(); g.moveTo(26, 4); g.lineTo(13.4, 17); g.lineTo(11.6, 15.2); g.closePath(); P.fill(g, 'rgba(255,248,210,0.9)');
      inkCircle(g, 11.4, 19.4, 5.6, P.vol(g, 11.4, 19.4, 5.6, '#5a3a2a'));
      for (const [x, y, r] of [[9.4, 18, 1.2], [13, 21.4, 1], [12.4, 17, 0.7]]) P.circle(g, x, y, r, '#ff9030');
      for (const [x, y] of [[4, 27], [19, 27.6], [6.6, 12]]) sil(g, [x, y - 1, x + 1.2, y, x, y + 0.8, x - 1.2, y], '#7a5a4a', 0.7);
    },
    golem(g) {
      P.glow(g, 16, 16, 12, '#40ffc0', 0.3);
      sil(g, [6, 24, 4.6, 14, 7.6, 6.6, 14, 4, 21, 4.6, 26, 8.4, 27.4, 16.4, 25.6, 24.6, 18, 27.6, 11, 27.4], P.lg(g, 5, 4, 27, 28, ['#d8ccb0', '#8a7e68', '#3e362a']), 1.3);
      sil(g, [7, 13.6, 14, 12.4, 13.6, 14.6, 7.4, 15.4], '#2a241a', 0.8); sil(g, [18, 12.4, 25, 13.4, 24.6, 15.2, 18.4, 14.6], '#2a241a', 0.8);
      for (const x of [10.6, 21.4]) { P.glow(g, x, 14, 3.4, '#40ffc0', 0.9); P.ell(g, x, 14, 1.8, 0.8, '#c8fff0'); }
      sil(g, [11, 20, 21, 20, 20, 22.6, 12, 22.6], '#1a1610', 0.8);
      g.strokeStyle = 'rgba(20,16,10,0.8)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(15, 4.4); g.lineTo(16.4, 8); g.lineTo(15.2, 11); g.stroke();
      g.strokeStyle = '#40ffc0'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(16, 6.6); g.lineTo(14.6, 8.4); g.lineTo(17.4, 9.4); g.stroke();
      for (const [x, y] of [[6.4, 20], [25, 7.4], [9, 7]]) P.ell(g, x, y, 1.8, 0.9, 'rgba(90,130,60,0.8)');
    },
    phantom(g) {
      P.glow(g, 16, 14, 13, '#80e0ff', 0.45);
      P.path(g, [7, 18, 25, 18, 27, 24, 22, 22, 19, 28.6, 16, 23.6, 12.4, 28, 10, 22, 5, 24]); P.fill(g, P.lg(g, 0, 18, 0, 28, ['rgba(160,230,255,0.7)', 'rgba(160,230,255,0)']));
      inkPath(g, () => { g.beginPath(); g.arc(16, 13.6, 9, Math.PI, 0); g.lineTo(25, 21); g.lineTo(19.4, 21); g.lineTo(18.4, 17); g.lineTo(13.6, 17); g.lineTo(12.6, 21); g.lineTo(7, 21); g.closePath(); }, P.lg(g, 7, 4, 25, 21, ['rgba(230,250,255,0.95)', 'rgba(130,190,220,0.85)', 'rgba(50,90,120,0.8)']), 1.3);
      P.rect(g, 8.4, 11.6, 15.2, 2.2, '#061018'); for (const x of [12.4, 19.6]) { P.glow(g, x, 12.7, 2.6, '#80f0ff', 0.9); P.ell(g, x, 12.7, 1.4, 0.6, '#e0ffff'); }
      P.rect(g, 15.4, 4.8, 1.2, 6.8, 'rgba(255,255,255,0.4)');
    },
    avalanche(g) {
      P.glow(g, 16, 20, 12, '#8fe0ff', 0.4);
      P.path(g, [3, 26, 29, 26, 29, 29, 3, 29]); P.fill(g, '#2a3444');
      for (const [x, w, h, l] of [[9, 7, 15, -1], [21, 7, 13, 1.4], [15.4, 8, 21, 0]]) sil(g, [x - w / 2, 26.4, x + l, 26.4 - h, x + w / 2, 26.4], P.lg(g, x - w / 2, 0, x + w / 2, 0, ['#ffffff', '#9fdcff', '#2e6a9a']), 1.1);
      for (const [x, w, h, l] of [[9, 7, 15, -1], [21, 7, 13, 1.4], [15.4, 8, 21, 0]]) P.line(g, x + l, 26.4 - h + 1, x - w / 4, 25.6, 0.5, 'rgba(255,255,255,0.8)');
      for (const [x, y] of [[5, 12], [26.4, 9.4], [25, 17]]) sil(g, [x, y - 1.4, x + 1.4, y, x, y + 1.4, x - 1.4, y], '#e8f8ff', 0.7);
      g.strokeStyle = 'rgba(10,14,24,0.9)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(4, 27.4); g.lineTo(8, 26.8); g.moveTo(22, 27.6); g.lineTo(27, 27); g.stroke();
    },
    hail(g) {
      sil(g, [4, 11, 5.4, 6.4, 9.4, 5.6, 11.6, 3, 16.4, 3.4, 18.6, 5.2, 23.4, 4.4, 27, 7.4, 28, 11, 24, 12.6, 8, 12.6], P.lg(g, 0, 3, 0, 12.6, ['#6a7890', '#2a3448', '#141a26']), 1.2);
      for (const [x, y, r] of [[9, 17, 2.2], [17.4, 19.6, 2.8], [24.6, 17.4, 1.8], [12, 25.4, 2], [22.6, 26, 2.2]]) {
        g.strokeStyle = 'rgba(200,235,255,0.5)'; g.lineWidth = r * 0.9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 2.6, y - 5); g.lineTo(x + 0.4, y - 0.8); g.stroke();
        inkCircle(g, x, y, r, P.vol(g, x, y, r, '#e8f8ff'));
      }
    },
    flail(g) {
      g.strokeStyle = 'rgba(220,220,240,0.35)'; g.lineWidth = 2; g.beginPath(); g.arc(12, 20, 15, -1.3, -0.2); g.stroke();
      inkLine(g, 4, 28.4, 10.4, 19.6, 1.8, '#6a4424'); P.rect(g, 8.6, 20.4, 2.4, 1.2, '#8a8e9a');
      for (let i = 0; i < 6; i++) { const t = i / 5, x = 10.6 + (19 - 10.6) * t + Math.sin(t * Math.PI) * -2.4, y = 19.4 + (11.4 - 19.4) * t - Math.sin(t * Math.PI) * 2; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, y, 0.9, 0.6, 0.6, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#b8bcc8'; g.lineWidth = 0.7; g.stroke(); }
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; sil(g, [22 + Math.cos(a - 0.4) * 4.2, 9 + Math.sin(a - 0.4) * 4.2, 22 + Math.cos(a) * 7, 9 + Math.sin(a) * 7, 22 + Math.cos(a + 0.4) * 4.2, 9 + Math.sin(a + 0.4) * 4.2], '#c8ccd6', 0.8); }
      inkCircle(g, 22, 9, 4.6, P.vol(g, 22, 9, 4.6, '#6a7080'));
    },
    fists(g) {
      P.glow(g, 16, 16, 13, '#b080ff', 0.55);
      for (const [r, a] of [[6, 0.8], [9, 0.5], [12, 0.3]]) { g.strokeStyle = 'rgba(220,190,255,' + a + ')'; g.lineWidth = 1; g.beginPath(); g.arc(23, 16, r, -1, 1); g.stroke(); }
      for (const y of [10, 16, 22]) P.line(g, 3, y, 8, y, 0.9, 'rgba(210,180,255,0.6)');
      fist(g, 15, 16.4, 1.15, '#c8a8ff', '#4a2a8a');
    },
    storm(g) {
      sil(g, [3.6, 12, 5, 7, 9.6, 6, 12, 3, 17.4, 3.6, 19.6, 5.6, 24.4, 4.8, 28, 8.4, 28.4, 12, 24.4, 13.6, 7.6, 13.6], P.lg(g, 0, 3, 0, 13.6, ['#5a5870', '#2a2838', '#12101c']), 1.2);
      P.glow(g, 16, 27, 7, '#fff080', 0.8);
      sil(g, [17, 12.6, 11.4, 20.4, 15, 20.4, 12.6, 28, 21, 17.4, 17.2, 17.4, 20, 12.6], P.lg(g, 11, 12, 21, 28, ['#fffbe0', '#ffe040', '#d89010']), 1.1);
      for (const [x, y] of [[8, 27.4], [20, 27.6]]) glint(g, x, y, 1.4, '#fff4a0');
      for (let i = 0; i < 4; i++) P.line(g, 6 + i * 6, 15.4, 5 + i * 6, 18.6, 0.5, 'rgba(160,190,230,0.5)');
    },
    axes(g) {
      g.strokeStyle = 'rgba(220,225,240,0.4)'; g.lineWidth = 1.6; g.beginPath(); g.arc(16, 16, 12.6, 3.6, 5.2); g.stroke(); g.beginPath(); g.arc(16, 16, 12.6, 0.5, 2.1); g.stroke();
      g.save(); g.translate(16, 16); g.rotate(0.55);
      inkLine(g, 0, 10, 0, -8, 1.5, '#7a4e28');
      sil(g, [0.6, -9.6, 7.6, -11.4, 9.4, -6.4, 7.4, -1.8, 0.6, -4.6], steel(g, 0, -11, 9, -2), 1.1);
      sil(g, [-0.8, -9.6, -3.4, -8.4, -3.4, -5.6, -0.8, -4.8], '#6a707e', 0.9);
      g.restore(); glint(g, 22.4, 9.2, 1.4);
    },
    nova(g) {
      P.glow(g, 16, 16, 13, '#b0e8ff', 0.6);
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, l = i % 2 ? 10.4 : 13; g.save(); g.translate(16, 16); g.rotate(a); sil(g, [3, 0, 5.4, -1.6, l, 0, 5.4, 1.6], P.lg(g, 3, -1.6, 3, 1.6, ['#ffffff', '#9fdcff', '#3a7ab0']), 0.9); g.restore(); }
      inkCircle(g, 16, 16, 3, P.rg(g, 15, 15, 4, ['#ffffff', '#c0ecff', '#5aa0d0']));
    },
    plague(g) {
      for (const [x, y, r, a] of [[22, 11, 6, 0.55], [25, 18, 5, 0.45], [19, 6, 4, 0.4], [26.4, 25, 3.4, 0.35]]) P.circle(g, x, y, r, 'rgba(140,200,60,' + a + ')');
      P.glow(g, 20, 14, 12, '#a0e040', 0.5);
      inkPath(g, () => { g.beginPath(); g.arc(12.4, 15, 8, Math.PI * 0.85, Math.PI * 0.15); g.lineTo(18.4, 21); g.lineTo(17.4, 25.6); g.lineTo(7.4, 25.6); g.lineTo(6.4, 21); g.closePath(); }, P.lg(g, 4, 7, 20, 26, ['#f0ead0', '#b8b090', '#5a5440']), 1.3);
      P.ell(g, 9.4, 15.4, 2.4, 2.8, '#1a2008'); P.ell(g, 15.6, 15.4, 2.4, 2.8, '#1a2008');
      for (const x of [9.4, 15.6]) P.circle(g, x, 15.8, 0.8, '#b0ff40');
      P.path(g, [12.4, 18, 11.2, 20.6, 13.6, 20.6]); P.fill(g, '#1a2008');
      for (const x of [9.6, 11.6, 13.6, 15.4]) P.line(g, x, 22.4, x, 25, 0.5, '#3a3628');
      g.beginPath(); g.moveTo(17.6, 22); g.quadraticCurveTo(22, 21, 24, 24); P.stroke(g, 'rgba(170,230,80,0.8)', 1.6);
    },
    fireball(g) {
      g.beginPath(); g.moveTo(3, 29); g.quadraticCurveTo(9, 18, 14.6, 12.4); g.lineTo(21.6, 19.4); g.quadraticCurveTo(14, 24, 3, 29); P.fill(g, P.lg(g, 3, 29, 18, 16, ['rgba(255,120,30,0)', 'rgba(255,150,50,0.85)']));
      P.glow(g, 19, 13, 12, '#ff8020', 0.8);
      inkCircle(g, 19, 13, 7.4, P.rg(g, 17.6, 11.6, 8, ['#fffbe0', '#ffd040', '#ff7a18', '#a02808']));
      for (const [x, y] of [[21, 5], [26.4, 9.6], [26, 17.6]]) sil(g, [x - 1, y + 1.4, x, y - 1.6, x + 1, y + 1.4], '#ffa030', 0.7);
      P.circle(g, 16.6, 10.4, 2, 'rgba(255,255,255,0.85)');
    },
    smite(g) {
      P.glow(g, 16, 22, 12, '#ff7020', 0.6);
      g.beginPath(); g.moveTo(9, 3); g.quadraticCurveTo(10, 10, 12, 14); g.lineTo(20, 14); g.quadraticCurveTo(22, 10, 23, 3); g.quadraticCurveTo(19, 7, 16, 3.6); g.quadraticCurveTo(13, 7, 9, 3); P.fill(g, P.lg(g, 0, 3, 0, 14, ['rgba(255,200,90,0.3)', '#ff9a30', '#ff5a10']));
      g.save(); g.translate(16, 17.4); g.rotate(Math.PI / 2); fist(g, 0, 0, 1.05, '#ffb070', '#8a2a08'); g.restore();
      g.strokeStyle = 'rgba(255,200,120,0.9)'; g.lineWidth = 1.1; g.beginPath(); g.ellipse(16, 27.4, 10, 2, 0, Math.PI, Math.PI * 2); g.stroke();
      for (const [x, y] of [[6, 25], [26, 24.6], [9, 22]]) P.circle(g, x, y, 0.6, '#ffe080');
    },
    thorns(g) {
      P.path(g, [3, 26, 29, 26, 29, 29, 3, 29]); P.fill(g, '#241a10');
      g.lineCap = 'round';
      for (const [x0, x1, y1, c] of [[9, 5.6, 7, '#5a7a28'], [16, 17.4, 3.4, '#6a8a30'], [23, 26.6, 8.4, '#4a6a22']]) {
        g.beginPath(); g.moveTo(x0, 27); g.quadraticCurveTo(x0 + (x1 > x0 ? -5 : 5), 16, x1, y1); g.strokeStyle = INK; g.lineWidth = 3.6; g.stroke(); g.strokeStyle = c; g.lineWidth = 2.2; g.stroke();
        for (let i = 1; i < 4; i++) { const t = i / 4, x = x0 + (x1 - x0) * t + (x1 > x0 ? -5 : 5) * 2 * t * (1 - t), y = 27 + (y1 - 27) * t, s = i % 2 ? 1 : -1; sil(g, [x, y - 0.8, x + s * 2.6, y - 1.8, x, y + 0.8], '#d8e0a0', 0.6); }
      }
      inkCircle(g, 17.4, 3.6, 1.6, P.vol(g, 17.4, 3.6, 1.6, '#c02030'));
    },
    illumination(g) {
      P.glow(g, 16, 16, 14, '#ffe080', 0.5);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; P.line(g, 16 + Math.cos(a) * 10, 16 + Math.sin(a) * 8, 16 + Math.cos(a) * (i % 2 ? 12.4 : 14), 16 + Math.sin(a) * (i % 2 ? 10.4 : 12.4), 1, 'rgba(255,230,150,0.9)'); }
      inkPath(g, () => { g.beginPath(); g.moveTo(4.4, 16); g.quadraticCurveTo(16, 5, 27.6, 16); g.quadraticCurveTo(16, 27, 4.4, 16); }, P.lg(g, 0, 8, 0, 24, ['#fffaf0', '#e8dcc0']), 1.3);
      inkCircle(g, 16, 16, 4.6, P.rg(g, 15, 15, 5, ['#fff4b0', '#f0b030', '#8a5a08']));
      P.circle(g, 16, 16, 1.8, INK); P.circle(g, 14.6, 14.6, 0.9, '#ffffff');
    },
    prism(g) {
      P.glow(g, 16, 16, 13, '#c080ff', 0.5);
      inkLine(g, 2.6, 12, 11, 16, 0.9, '#ffffff');
      for (const [c, o] of [['#ff6a30', -3], ['#ffe060', 0], ['#60c8ff', 3]]) inkLine(g, 20, 16.4 + o * 0.3, 29, 13 + o * 2.2, 0.9, c);
      sil(g, [16, 4, 27, 25, 5, 25], P.lg(g, 5, 4, 27, 25, ['#ffffff', '#d8c8ff', '#6a4ab0']), 1.3);
      P.path(g, [16, 4, 16, 25, 5, 25]); P.fill(g, 'rgba(255,255,255,0.3)');
      P.line(g, 16, 5, 16, 24.4, 0.4, 'rgba(255,255,255,0.8)');
    },
    wardrum(g) {
      for (const [r, a] of [[12, 0.5], [14.6, 0.3]]) { g.strokeStyle = 'rgba(255,200,140,' + a + ')'; g.lineWidth = 1; g.beginPath(); g.ellipse(16, 16, r, r * 0.8, 0, -2.6, -0.5); g.stroke(); }
      inkPath(g, () => { g.beginPath(); g.moveTo(5, 13); g.lineTo(5, 23); g.ellipse(16, 23, 11, 4, 0, Math.PI, 0, true); g.lineTo(27, 13); g.closePath(); }, P.lg(g, 5, 0, 27, 0, ['#9a4a20', '#6a2a10', '#3a1406']), 1.3);
      g.strokeStyle = '#c89838'; g.lineWidth = 0.8; g.beginPath(); for (let i = 0; i < 5; i++) { const x = 6.4 + i * 4.8; g.moveTo(x, 14.6); g.lineTo(x + 2.4, 24.6); g.lineTo(x + 4.8, 14.6); } g.stroke();
      inkPath(g, () => { g.beginPath(); g.ellipse(16, 13, 11, 4, 0, 0, Math.PI * 2); }, P.rg(g, 14, 12, 11, ['#f4ead0', '#c8b890', '#8a7a58']), 1.2);
      P.circle(g, 16, 13, 2.4, '#5a1a10'); for (const x of [15.2, 16.8]) P.circle(g, x, 12.7, 0.5, '#f4ead0'); // a skull daubed on the skin
      inkLine(g, 22, 3, 18.6, 11, 1.1, '#e8d8b0'); inkCircle(g, 22.4, 2.6, 1.5, '#f4ead0');
    },
    deathwall(g) {
      P.glow(g, 16, 16, 13, '#80e0ff', 0.4);
      const helm = (x, y, s, a) => {
        g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = a;
        inkPath(g, () => { g.beginPath(); g.arc(0, 0, 5, Math.PI, 0); g.lineTo(5, 5.4); g.lineTo(1.6, 5.4); g.lineTo(1, 2.4); g.lineTo(-1, 2.4); g.lineTo(-1.6, 5.4); g.lineTo(-5, 5.4); g.closePath(); }, P.lg(g, -5, -5, 5, 5, ['rgba(230,250,255,0.95)', 'rgba(110,170,210,0.85)']), 1.1);
        P.rect(g, -4.2, -0.8, 8.4, 1.4, '#061018'); for (const d of [-2, 2]) P.ell(g, d, -0.1, 0.9, 0.4, '#c0ffff');
        g.restore();
      };
      helm(8, 12, 0.8, 0.7); helm(24, 12, 0.8, 0.7); helm(16, 16, 1.15, 1);
      for (const [x, w] of [[3, 10], [11, 10], [19, 10]]) { P.path(g, [x, 24, x + w, 24, x + w - 1, 28.4, x + 1, 28.4]); P.fill(g, 'rgba(140,210,240,0.35)'); }
    },
    moshpit(g) {
      for (const [r, a] of [[12.4, 0.35], [9.4, 0.55]]) { g.strokeStyle = 'rgba(255,170,90,' + a + ')'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(16, 23, r, r * 0.34, 0, 0, Math.PI * 2); g.stroke(); }
      P.glow(g, 16, 22, 10, '#ff9040', 0.5);
      const skin = P.lg(g, 9, 4, 23, 27, ['#f0d0b0', '#c89070', '#6a3a24']);
      sil(g, [10.4, 26, 10, 17, 11.4, 14.6, 10.8, 4.6, 12.8, 4, 13.8, 13, 15.4, 12.6, 17.2, 13, 18.8, 13.6, 20.4, 6, 22.4, 6.6, 21.6, 16, 21, 21, 19, 26], skin, 1.2);
      g.strokeStyle = G.rgba(INK, 0.7); g.lineWidth = 0.5; g.beginPath(); g.moveTo(14, 14.6); g.lineTo(14.2, 17); g.moveTo(16.4, 14.4); g.lineTo(16.6, 17); g.moveTo(10.6, 18); g.quadraticCurveTo(14, 17.2, 16.4, 19.4); g.stroke();
      P.rect(g, 10.2, 23.4, 10.6, 2.6, '#3a2a22'); for (const x of [12, 15, 18]) P.circle(g, x, 24.7, 0.5, '#c8ccd6');
    },
    confetti(g) { // a flared brass horn blowing a spray of coloured scraps
      P.glow(g, 20, 12, 11, '#ff90c0', 0.4);
      const cols = ['#ff5a8a', '#ffd35a', '#6ad8ff', '#8aff6a', '#c890ff', '#ff9a3a'];
      for (let i = 0; i < 11; i++) { const a = -0.9 + i * 0.13, d = 8 + (i * 37 % 7), x = 15 + Math.cos(a) * d, y = 15 + Math.sin(a) * d; g.save(); g.translate(x, y); g.rotate(i * 1.3); P.rect(g, -1.5, -0.9, 3, 1.8, INK); P.rect(g, -1.1, -0.55, 2.2, 1.1, cols[i % cols.length]); g.restore(); }
      sil(g, [4, 25, 13, 16, 17, 10, 21.6, 14.4, 16.4, 19, 7, 28], P.lg(g, 4, 10, 21, 28, ['#fff0b0', '#e0a830', '#7a5410']), 1.3);
      inkPath(g, () => { g.beginPath(); g.ellipse(19.3, 12.2, 3.6, 2.2, -0.75, 0, Math.PI * 2); }, '#2a1a0a', 1.1);
      P.line(g, 6, 25.4, 14, 17.4, 0.6, 'rgba(255,255,255,0.6)');
    },
    riff(g) { // three notes leaping off a string
      P.glow(g, 16, 16, 13, '#ffd070', 0.45);
      g.strokeStyle = 'rgba(255,220,150,0.5)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(2, 25); g.quadraticCurveTo(16, 20, 30, 25); g.stroke();
      const note = (x, y, s) => {
        g.save(); g.translate(x, y); g.scale(s, s);
        inkLine(g, 2.6, 1, 2.6, -9, 1.1, '#ffe0a0');
        g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(2.6, -9); g.quadraticCurveTo(7, -7, 6, -3.6); g.stroke(); g.strokeStyle = '#ffe0a0'; g.lineWidth = 1.1; g.stroke();
        inkPath(g, () => { g.beginPath(); g.ellipse(0, 1.4, 3.2, 2.3, -0.4, 0, Math.PI * 2); }, P.rg(g, -1, 0.6, 3.4, ['#fff4c8', '#e0a830', '#7a5410']), 1.1);
        g.restore();
      };
      note(7, 22, 0.85); note(15, 16, 1); note(24, 11, 0.95);
    },
    pyro(g) { // a fountain of fire bursting from a brass mortar, sparks falling back
      P.glow(g, 16, 13, 13, '#ff8a30', 0.6);
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 2.4); g.quadraticCurveTo(22, 11, 19.6, 21); g.lineTo(12.4, 21); g.quadraticCurveTo(10, 11, 16, 2.4); }, P.lg(g, 0, 2, 0, 21, ['#fff6c0', '#ffb040', '#e04010']), 1.1);
      P.path(g, [16, 7, 18.4, 14, 16.8, 20, 15, 20, 13.8, 14]); P.fill(g, '#fff4c8');
      for (const [x, y] of [[7, 8], [25, 7], [5, 15], [27, 15], [9, 3.6], [23, 3]]) { P.circle(g, x, y, 1.1, INK); P.circle(g, x, y, 0.7, '#ffe070'); }
      sil(g, [9.6, 20, 22.4, 20, 21, 28.4, 11, 28.4], P.lg(g, 9, 0, 23, 0, ['#fff0b0', '#c89030', '#5a3a0c']), 1.2);
      P.rect(g, 10.4, 22.6, 11.2, 1.1, 'rgba(60,30,10,0.6)');
    },
    shards(g) { // violet splinters flung out in two fans, hanging in the air
      P.glow(g, 16, 16, 13, '#b070ff', 0.5);
      const sh = (x, y, a, L) => { g.save(); g.translate(x, y); g.rotate(a); sil(g, [L, 0, 0, 1.9, -L * 0.6, 0, 0, -1.9], P.lg(g, -L, 0, L, 0, ['#6a2ab0', '#c890ff', '#f4e4ff']), 1); g.restore(); };
      for (const dir of [-1, 1]) for (let i = 0; i < 4; i++) { const a = dir * Math.PI / 2 + (i - 1.5) * 0.42; sh(16 + Math.cos(a) * (8 + (i % 2) * 3), 16 + Math.sin(a) * (7 + (i % 2) * 3), a, 5.2); }
      inkCircle(g, 16, 16, 2.6, P.rg(g, 15.4, 15.4, 3, ['#ffffff', '#c890ff', '#4a1a80']));
    },
  });

  /* ---------- trait icons: a round iron medallion (gold for the elevated ones) around a well in the trait's colour ---------- */
  function medal(g, col, elev) {
    P.circle(g, 16, 16, 15.2, elev ? P.lg(g, 0, 1, 0, 31, ['#fff0a8', '#c89030', '#5a3a0c']) : P.lg(g, 0, 1, 0, 31, ['#5a5462', '#2a2630', '#121016']));
    g.strokeStyle = elev ? 'rgba(255,250,210,0.6)' : 'rgba(255,255,255,0.22)'; g.lineWidth = 0.7; g.beginPath(); g.arc(16, 16, 14.4, Math.PI * 0.8, Math.PI * 1.7); g.stroke();
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8, x = 16 + Math.cos(a) * 13.6, y = 16 + Math.sin(a) * 13.6; P.circle(g, x, y, 0.8, P.vol(g, x, y, 0.8, elev ? '#e8c060' : '#7a7282')); }
    P.circle(g, 16, 16, 12.2, '#07050a'); P.circle(g, 16, 16, 11.6, P.rg(g, 16, 18.4, 13, [[0, sh(col, -0.15)], [0.6, sh(col, -0.6)], [1, '#07050a']]));
    g.strokeStyle = G.rgba(col, 0.5); g.lineWidth = 0.6; g.beginPath(); g.arc(16, 16, 11.4, 0, Math.PI * 2); g.stroke();
  }
  const TRA = {
    // Blessings of the Shrine that have no trait of their own
    arcana: ['#7a3ab0', (g) => { GL.orb(g, '#c890ff'); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; P.circle(g, 16 + Math.cos(a) * 9.5, 16 + Math.sin(a) * 9.5, 0.8, '#f0dcff'); } }],
    plunder: ['#8a2034', (g) => { g.save(); g.translate(16, 17); g.scale(0.72, 0.72); g.translate(-16, -16); GL.chest(g, '#8a2034'); g.restore(); }],
    scholar: ['#6a5020', (g) => { g.save(); g.translate(16, 16); g.scale(0.78, 0.78); g.translate(-16, -16); GL.scroll(g); g.restore(); }],
    strength: ['#c03020', (g) => {
      P.glow(g, 16, 14, 11, '#ff5030', 0.5);
      for (const [x, y] of [[8, 9], [24, 10], [9.4, 21]]) P.line(g, x, y, x + (16 - x) * 0.3, y + (16 - y) * 0.3, 0.8, 'rgba(255,150,110,0.7)');
      g.save(); g.translate(16, 17.6); g.rotate(-Math.PI / 2); fist(g, 0, 0, 0.9, '#e8a878', '#5a2410'); g.restore();
    }],
    vitality: ['#a01830', (g) => {
      P.glow(g, 16, 16, 11, '#ff3040', 0.45);
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 25.4); g.bezierCurveTo(5, 18, 6, 7.6, 11.4, 8); g.quadraticCurveTo(14.4, 8, 16, 11.4); g.quadraticCurveTo(17.6, 8, 20.6, 8); g.bezierCurveTo(26, 7.6, 27, 18, 16, 25.4); }, P.rg(g, 13, 12, 13, ['#ff8a90', '#d0182c', '#4a0610']), 1.3);
      P.ell(g, 11.6, 12, 1.6, 2.4, 'rgba(255,230,230,0.75)', 0.5);
      g.strokeStyle = INK; g.lineWidth = 1.8; g.beginPath(); g.moveTo(6.4, 17.4); g.bezierCurveTo(12, 13, 20, 21, 25.6, 14.6); g.stroke();
      g.strokeStyle = '#6a8a30'; g.lineWidth = 0.9; g.stroke();
      for (const [x, y, s] of [[9.6, 15.6, -1], [14, 16.8, 1], [18.4, 17.8, -1], [22.6, 16.6, 1]]) { P.path(g, [x - 0.6, y, x + 0.6, y, x, y + s * 1.8]); P.fill(g, '#d8e0a0'); }
    }],
    metabolism: ['#3a9a40', (g) => { // a serpent devouring its own tail
      P.glow(g, 16, 16, 11, '#80e060', 0.35);
      g.strokeStyle = INK; g.lineWidth = 4.2; g.beginPath(); g.arc(16, 16, 7.6, -1.2, Math.PI * 1.55); g.stroke();
      g.strokeStyle = P.lg(g, 8, 8, 24, 24, ['#b0e070', '#4a8a28', '#1e4a10']); g.lineWidth = 2.8; g.stroke();
      g.strokeStyle = 'rgba(20,50,10,0.8)'; g.lineWidth = 0.4; for (let i = 0; i < 14; i++) { const a = -1.2 + i * 0.36; g.beginPath(); g.arc(16, 16, 7.6, a, a + 0.18); g.stroke(); }
      g.save(); g.translate(16 + Math.cos(-1.35) * 7.6, 16 + Math.sin(-1.35) * 7.6); g.rotate(0.2); g.scale(1.25, 1.25);
      sil(g, [-4.4, -2.4, 0, -3.6, 3.6, -2.2, 5, 0, 3.4, 2.4, 0, 2.6, -4.4, 2], P.lg(g, 0, -3.6, 0, 2.6, ['#d0f090', '#4a8a28', '#1e4a10']), 1);
      P.path(g, [5, 0, 1.6, 0.2, 3.4, 2.4]); P.fill(g, '#3a0a10');
      P.circle(g, 1.2, -1.4, 0.95, INK); P.ell(g, 1.2, -1.4, 0.5, 0.8, '#ffe040'); P.line(g, 1.2, -2, 1.2, -0.8, 0.25, INK);
      P.line(g, -3.6, -1.6, -0.6, -2.6, 0.4, 'rgba(255,255,255,0.4)');
      g.restore();
    }],
    parry: ['#6a7a9a', (g) => {
      P.glow(g, 16, 14, 7, '#ffe0a0', 0.8);
      for (const [a, c] of [[-0.78, '#c89838'], [0.78, '#8a92a4']]) {
        g.save(); g.translate(16, 17); g.rotate(a);
        sil(g, [-1.3, -12, 0, -14, 1.3, -12, 1.3, 4, -1.3, 4], steel(g, -1.3, 0, 1.3, 0), 1);
        inkLine(g, -3.6, 4.4, 3.6, 4.4, 1, c); inkLine(g, 0, 5.4, 0, 8.6, 1.2, '#3a2412');
        g.restore();
      }
      zig(g, [12.6, 9, 16, 12, 19.6, 8.4], '#ffe8b0', 0.35); glint(g, 16, 12.4, 2.4, '#fff6d0');
    }],
    thickhide: ['#7a6a50', (g) => {
      inkPath(g, () => { g.beginPath(); g.moveTo(7.4, 8); g.quadraticCurveTo(16, 11.4, 24.6, 8); g.lineTo(25, 13.4); g.quadraticCurveTo(23.4, 22, 16, 26); g.quadraticCurveTo(8.6, 22, 7, 13.4); g.closePath(); }, P.lg(g, 7, 8, 25, 26, ['#e8ecf2', '#8a92a4', '#343844']), 1.4);
      g.strokeStyle = 'rgba(10,6,8,0.7)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(16, 10.4); g.lineTo(16, 25.4); g.stroke();
      for (const y of [15, 19.4]) { g.beginPath(); g.moveTo(8.4, y); g.quadraticCurveTo(16, y + 2.6, 23.6, y); g.stroke(); }
      for (const [x, y] of [[9.4, 10.4], [22.6, 10.4], [10, 16.4], [22, 16.4]]) P.circle(g, x, y, 0.55, '#e8b850');
      P.path(g, [8.4, 9, 15, 11, 12, 16, 8.4, 14]); P.fill(g, 'rgba(255,255,255,0.25)');
      g.strokeStyle = INK; g.lineWidth = 0.5; g.beginPath(); g.moveTo(19.6, 13); g.lineTo(21, 15.4); g.lineTo(20, 17); g.stroke();
    }],
    swiftfeet: ['#4a90c0', (g) => {
      for (const [y, l] of [[12, 5], [16, 6.6], [20, 4.6]]) P.line(g, 4.6, y, 4.6 + l, y, 0.9, 'rgba(200,230,255,0.6)');
      sil(g, [13, 6, 19.4, 6, 19.4, 17.4, 25.6, 19.4, 26.4, 23.6, 11.4, 23.6, 11.8, 17], P.lg(g, 11, 6, 26, 24, ['#c89a68', '#7a4e28', '#3a2210']), 1.3);
      P.rect(g, 11.4, 22, 15, 1.6, '#2a1a0c'); P.rect(g, 13, 9, 6.4, 1, '#c89838');
      for (const [x, y, l] of [[19, 8, 6], [19, 10.6, 5], [19, 13, 3.6]]) sil(g, [x, y, x + l, y - 2.4, x + l * 0.7, y + 0.8, x, y + 1.6], P.lg(g, x, 0, x + l, 0, ['#ffffff', '#b8d8f0']), 0.8);
    }],
    quickhands: ['#c09030', (g) => {
      g.strokeStyle = 'rgba(255,220,140,0.45)'; g.lineWidth = 1.2; g.beginPath(); g.arc(16, 16, 10.2, -0.6, 0.9); g.stroke(); g.beginPath(); g.arc(16, 16, 10.2, 2.5, 4); g.stroke();
      sil(g, [9.4, 5.6, 22.6, 5.6, 22.6, 7.6, 9.4, 7.6], wood(g, 0, 5.6, 0, 7.6), 1); sil(g, [9.4, 24.4, 22.6, 24.4, 22.6, 26.4, 9.4, 26.4], wood(g, 0, 24.4, 0, 26.4), 1);
      inkPath(g, () => { g.beginPath(); g.moveTo(11, 7.6); g.lineTo(21, 7.6); g.quadraticCurveTo(21, 13, 16.8, 16); g.quadraticCurveTo(21, 19, 21, 24.4); g.lineTo(11, 24.4); g.quadraticCurveTo(11, 19, 15.2, 16); g.quadraticCurveTo(11, 13, 11, 7.6); }, 'rgba(210,235,255,0.35)', 1);
      P.path(g, [12.6, 10, 19.4, 10, 16, 14.6]); P.fill(g, P.lg(g, 0, 10, 0, 14.6, ['#fff0a0', '#e8b030']));
      P.line(g, 16, 14.6, 16, 21, 0.5, '#f0c040'); P.path(g, [12, 24.4, 20, 24.4, 16, 20.6]); P.fill(g, P.lg(g, 0, 20.6, 0, 24.4, ['#fff0a0', '#c89020']));
      P.line(g, 12, 9, 13, 20, 0.5, 'rgba(255,255,255,0.6)');
    }],
    reach: ['#8050c0', (g) => {
      for (const [r, a] of [[4, 1], [7, 0.7], [10, 0.45]]) { g.strokeStyle = 'rgba(220,180,255,' + a + ')'; g.lineWidth = 1.1; g.beginPath(); g.ellipse(16, 16, r, r, 0, 0, Math.PI * 2); g.stroke(); }
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; g.save(); g.translate(16, 16); g.rotate(a); sil(g, [7.4, -1.8, 11, 0, 7.4, 1.8], '#f0e0ff', 0.9); g.restore(); }
      inkCircle(g, 16, 16, 2, P.vol(g, 16, 16, 2, '#e0c0ff'));
    }],
    magnetism: ['#c03040', (g) => {
      g.strokeStyle = 'rgba(255,200,200,0.35)'; g.lineWidth = 0.7; for (const r of [9, 11]) { g.beginPath(); g.arc(16, 20, r, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
      g.lineCap = 'butt'; g.strokeStyle = INK; g.lineWidth = 6.4; g.beginPath(); g.arc(16, 19, 6.4, Math.PI, 0, true); g.stroke();
      g.strokeStyle = P.lg(g, 9, 0, 23, 0, ['#8a92a4', '#3a3e48']); g.lineWidth = 5; g.stroke();
      for (const x of [9.6, 22.4]) { P.rect(g, x - 3.2, 10.6, 6.4, 8.8, INK); P.rect(g, x - 2.5, 11.4, 5, 3.4, '#d02838'); P.rect(g, x - 2.5, 14.8, 5, 4.6, P.lg(g, x - 2.5, 0, x + 2.5, 0, ['#8a92a4', '#3a3e48'])); }
      for (const [x, y, c] of [[9.6, 6, '#6ab0ff'], [16, 4.6, '#f0c040'], [22.4, 6.4, '#ff5ad8']]) { inkCircle(g, x, y, 1.2, c); }
    }],
    precision: ['#c04030', (g) => {
      inkCircle(g, 15, 17, 9, '#6a4424');
      for (const [r, c] of [[8, '#e8dcc0'], [6, '#b02028'], [4, '#e8dcc0'], [2, '#b02028']]) P.circle(g, 15, 17, r, c);
      g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 0.4; for (const r of [8, 6, 4]) { g.beginPath(); g.arc(15, 17, r, 0, Math.PI * 2); g.stroke(); }
      inkLine(g, 15, 17, 25.6, 6.4, 0.8, '#b08050');
      for (const d of [-1, 1]) sil(g, [25.6, 6.4, 26.6 + d * 1.2, 4.6 + d * 1.2, 27.6, 7.4 - d * 0.4], '#c83030', 0.7);
      glint(g, 15, 17, 1.6, '#fff4c0');
    }],
    brutality: ['#6a5a60', (g) => {
      for (let i = 0; i < 3; i++) {
        const x = 9 + i * 5.4;
        inkPath(g, () => { g.beginPath(); g.moveTo(x + 3, 5); g.quadraticCurveTo(x + 0.6, 16, x - 1.6, 26); g.quadraticCurveTo(x + 3, 16, x + 3, 5); }, P.lg(g, 0, 5, 0, 26, ['#ff8a90', '#e01830', '#6a0610']), 1);
        P.line(g, x + 2.6, 7, x + 1.2, 16, 0.4, 'rgba(255,220,220,0.8)');
      }
      for (const [x, y, r] of [[8, 27.4, 1], [14, 27.8, 0.8], [23, 26.4, 1.1]]) inkCircle(g, x, y, r, '#a01020');
    }],
    persistence: ['#d09040', (g) => {
      P.glow(g, 16, 7.4, 6, '#ffc040', 0.9); P.ell(g, 16, 7.4, 1.6, 2.8, '#ffd050'); P.ell(g, 16, 8.2, 0.7, 1.2, '#ffffff');
      sil(g, [13.4, 10.4, 18.6, 10.4, 18.6, 18.6, 13.4, 18.6], P.lg(g, 13, 0, 19, 0, ['#fff4dc', '#d8c7a0', '#8a7a58']), 1);
      P.path(g, [18.6, 11, 19.6, 11.4, 19.4, 15, 18.6, 14]); P.fill(g, '#f0e4c8');
      inkPath(g, () => { g.beginPath(); g.arc(16, 22, 6.2, Math.PI * 1.05, Math.PI * 1.95); g.lineTo(20.4, 26); g.lineTo(11.6, 26); g.closePath(); }, P.lg(g, 10, 17, 22, 26, ['#f0ead0', '#b8b090', '#5a5440']), 1.2);
      P.ell(g, 13.6, 21.8, 1.4, 1.6, '#1a1008'); P.ell(g, 18.4, 21.8, 1.4, 1.6, '#1a1008'); P.path(g, [16, 23, 15.3, 24.4, 16.7, 24.4]); P.fill(g, '#1a1008');
    }],
    multistrike: ['#60a0e0', (g) => {
      for (const [dx, a] of [[-5, 0.35], [-2.5, 0.6], [0, 1]]) { g.beginPath(); g.arc(12 + dx, 24, 14, -1.3, -0.25); g.arc(12 + dx, 24, 11.4, -0.25, -1.3, true); g.closePath(); P.fill(g, 'rgba(200,230,255,' + a + ')'); }
      g.save(); g.translate(17, 17); g.rotate(0.75); g.scale(1.3, 1.3);
      sil(g, [-1.1, -9, 0, -11, 1.1, -9, 1.1, 3, -1.1, 3], steel(g, -1.1, 0, 1.1, 0), 1); inkLine(g, -3, 3.4, 3, 3.4, 0.9, '#c89838'); inkLine(g, 0, 4.4, 0, 7, 1, '#3a2412');
      g.restore();
    }],
    keenedge: ['#e0c060', (g) => {
      g.save(); g.translate(14, 18); g.rotate(-0.78);
      sil(g, [-2, 10, -2, -6, 0, -11, 2, -6, 2, 10], P.lg(g, -2, 0, 2, 0, ['#ffffff', '#b8c0d0', '#5a6070']), 1.2);
      P.line(g, 0, -9.6, 0, 9, 0.4, 'rgba(60,70,90,0.7)');
      g.restore();
      glint(g, 21.4, 10.4, 4.2, '#fff8d0'); P.glow(g, 21.4, 10.4, 6, '#ffe080', 0.6);
    }],
    honed: ['#a0a8b8', (g) => {
      g.save(); g.translate(15, 18); g.rotate(-0.5);
      sil(g, [-11, -1.2, 8, -1.8, 11, 0, 8, 1.8, -11, 1.2], steel(g, 0, -1.8, 0, 1.8), 1);
      g.restore();
      g.save(); g.translate(18, 12.4); g.rotate(-0.5); P.rrect(g, -5, -2.4, 10, 4.2, 1.4, INK); P.rrect(g, -4.4, -1.8, 8.8, 3, 1, P.lg(g, 0, -1.8, 0, 1.2, ['#a8a090', '#5a5448'])); g.restore();
      for (const [x, y] of [[22, 15.6], [24.4, 14], [23, 18]]) P.circle(g, x, y, 0.5, '#ffe080'); P.glow(g, 22, 16, 3, '#ffd070', 0.8);
    }],
    volley: ['#a07040', (g) => {
      for (const o of [-6, 0, 6]) {
        g.save(); g.translate(16 + o * 0.6, 17); g.rotate(o * 0.07 - 0.1);
        inkLine(g, 0, 10, 0, -6, 0.7, '#c09060');
        sil(g, [-1.8, -5.4, 0, -10, 1.8, -5.4], steel(g, -1.8, 0, 1.8, 0), 0.9);
        sil(g, [0, 7, -1.8, 9.8, -1.8, 11.4, 0, 9.6], '#c83030', 0.7); sil(g, [0, 7, 1.8, 9.8, 1.8, 11.4, 0, 9.6], '#9a2020', 0.7);
        g.restore();
      }
    }],
    summoner: ['#40b080', (g) => {
      g.strokeStyle = 'rgba(140,255,200,0.9)'; g.lineWidth = 0.8; g.beginPath(); g.ellipse(16, 23, 9.4, 3, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(16, 23, 6.6, 2, 0, 0, Math.PI * 2); g.stroke();
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; P.rect(g, 16 + Math.cos(a) * 8 - 0.4, 23 + Math.sin(a) * 2.5 - 0.4, 0.8, 0.8, '#c0ffe0'); }
      ghost(g, 16, 10.4, 4, 1, '#80f0c0');
      P.glow(g, 16, 22, 8, '#60e0a0', 0.4);
    }],
    afflictor: ['#9040c0', (g) => {
      for (const [x, y, r, a] of [[22, 9, 4, 0.5], [9, 8, 3, 0.4], [24, 16, 3, 0.35]]) P.circle(g, x, y, r, 'rgba(180,90,230,' + a + ')');
      inkPath(g, () => { g.beginPath(); g.arc(16, 14.4, 8, Math.PI * 0.85, Math.PI * 0.15); g.lineTo(22, 20.4); g.lineTo(21, 25); g.lineTo(11, 25); g.lineTo(10, 20.4); g.closePath(); }, P.lg(g, 8, 6, 24, 25, ['#f0ead0', '#b8b090', '#5a5440']), 1.3);
      P.ell(g, 13, 14.8, 2.4, 2.8, '#14061e'); P.ell(g, 19, 14.8, 2.4, 2.8, '#14061e');
      for (const x of [13, 19]) { P.glow(g, x, 15.2, 2.4, '#d070ff', 0.9); P.circle(g, x, 15.2, 0.8, '#f0c0ff'); }
      P.path(g, [16, 17.6, 14.8, 20, 17.2, 20]); P.fill(g, '#14061e');
      for (const x of [13, 15, 17, 19]) P.line(g, x, 21.6, x, 24.6, 0.5, '#3a3628');
      g.strokeStyle = INK; g.lineWidth = 0.6; g.beginPath(); g.moveTo(17, 6.6); g.lineTo(18, 9.4); g.lineTo(16.6, 11.4); g.stroke();
      for (const [x, y] of [[13, 17.6], [19, 17.8]]) P.ell(g, x, y + 1.4, 0.5, 1.2, '#b060e0');
    }],
    elementalist: ['#e07030', (g) => {
      g.strokeStyle = 'rgba(255,230,200,0.4)'; g.lineWidth = 0.8; g.beginPath(); g.arc(16, 16.6, 7, 0, Math.PI * 2); g.stroke();
      const orb = (x, y, c) => { P.glow(g, x, y, 5.4, c, 0.6); inkCircle(g, x, y, 3.8, P.rg(g, x - 1, y - 1, 4.6, ['#ffffff', c, sh(c, -0.55)])); };
      orb(16, 9.4, '#ff7a30'); orb(9.6, 20.4, '#60c8ff'); orb(22.4, 20.4, '#ffe040');
      g.beginPath(); g.moveTo(16, 7.2); g.quadraticCurveTo(18, 9.4, 16.8, 11.4); g.lineTo(15.2, 11.4); g.quadraticCurveTo(14, 9.4, 16, 7.2); P.fill(g, '#fff4c0');
      P.path(g, [23, 17.8, 21.4, 20.6, 22.8, 20.6, 21.8, 23, 23.6, 20, 22.2, 20]); P.fill(g, '#ffffff');
      g.strokeStyle = '#ffffff'; g.lineWidth = 0.6; for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(9.6 - Math.cos(a) * 2.2, 20.4 - Math.sin(a) * 2.2); g.lineTo(9.6 + Math.cos(a) * 2.2, 20.4 + Math.sin(a) * 2.2); g.stroke(); }
    }],
  };

  /* ---------- gear, redrawn: inked outlines, worn metal, dark details ---------- */
  const DARKSTEEL = ['#e8ecf2', '#9aa2b2', '#5e6676', '#343a46', '#16181e'];
  const BLOOD = ['#ff7080', '#c8182c', '#8a0a18', '#4a0610', '#200206'];
  const band = (g, cx, cy, rx, ry, m, w) => { // a ring or circlet seen at an angle
    g.lineWidth = w + 1.6; g.strokeStyle = INK; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = w; g.strokeStyle = mfill(g, cx - rx, cy - ry, cx + rx, cy + ry, m); g.stroke();
    g.lineWidth = 0.6; g.strokeStyle = G.rgba(m[0], 0.85); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.6); g.stroke();
  };
  const cuirass = (g, m, o) => { // a breastplate with pauldrons
    o = o || {};
    for (const s of [-1, 1]) { const X = (x) => 16 + s * (x - 16); sil(g, [X(9.4), 4.6, X(3), 8, X(2.4), 13.6, X(6.4), 15.4, X(10.6), 10], mfill(g, X(2), 4, X(11), 15, m), 1.1); P.line(g, X(3.4), 8.6, X(9), 5.4, 0.6, G.rgba(o.trim || m[0], 0.8)); }
    inkPath(g, () => { g.beginPath(); g.moveTo(9, 4.4); g.lineTo(12.6, 6.4); g.lineTo(16, 8.4); g.lineTo(19.4, 6.4); g.lineTo(23, 4.4); g.lineTo(24.4, 12); g.quadraticCurveTo(24.4, 21, 22.4, 27.6); g.lineTo(9.6, 27.6); g.quadraticCurveTo(7.6, 21, 7.6, 12); g.closePath(); }, mfill(g, 7, 4, 25, 28, m), 1.3);
    P.path(g, [9, 5, 12.6, 7, 12, 17, 9.6, 26, 8.6, 17]); P.fill(g, 'rgba(255,255,255,0.14)');
    P.line(g, 16, 8.8, 16, 27, 0.6, G.rgba(m[4], 0.6));
    for (const y of [22.4, 25]) { g.strokeStyle = G.rgba(m[4], 0.8); g.lineWidth = 0.7; g.beginPath(); g.moveTo(8.8, y); g.quadraticCurveTo(16, y + 1.2, 23.2, y); g.stroke(); }
  };
  const tunic = (g, cloth, o) => {
    inkPath(g, () => { g.beginPath(); g.moveTo(10.4, 4); g.lineTo(21.6, 4); g.lineTo(28.4, 8.4); g.lineTo(26, 15); g.lineTo(23.4, 13.6); g.lineTo(23.6, 28); g.lineTo(20, 27); g.lineTo(17.4, 28.4); g.lineTo(14, 27); g.lineTo(11.4, 28.2); g.lineTo(8.4, 28); g.lineTo(8.6, 13.6); g.lineTo(6, 15); g.lineTo(3.6, 8.4); g.closePath(); }, mfill(g, 3, 4, 28, 28, cloth), 1.3);
    P.path(g, [13, 4, 16, 9, 19, 4]); P.fill(g, INK);
    g.strokeStyle = G.rgba(cloth[4], 0.6); g.lineWidth = 0.6; for (const [x0, x1] of [[11, 10.4], [14.4, 14], [18.4, 18.8], [21.4, 22]]) { g.beginPath(); g.moveTo(x0, 13); g.lineTo(x1, 27); g.stroke(); }
  };
  const gauntlet = (g, m, cuff, o) => { // the back of a hand, fingers up, a flared cuff
    o = o || {};
    for (let i = 0; i < 4; i++) {
      const x = 9.4 + i * 3.5, top = [5.6, 3.4, 4.2, 7.4][i], lean = (i - 1.5) * 0.5;
      if (o.claws) sil(g, [x + 0.5 + lean, top + 0.6, x + 1.5 + lean * 1.6, top - 2.6, x + 2.5 + lean, top + 0.6], DARKSTEEL[1], 0.7);
      inkPath(g, () => { g.beginPath(); g.moveTo(x, 15); g.lineTo(x + lean, top + 1.4); g.quadraticCurveTo(x + lean, top, x + 1.5 + lean, top); g.quadraticCurveTo(x + 3 + lean, top, x + 3 + lean, top + 1.4); g.lineTo(x + 3, 15); g.closePath(); }, mfill(g, x, top, x + 3, 15, m), 1);
      for (const y of [top + (15 - top) * 0.35, top + (15 - top) * 0.68]) P.line(g, x + 0.3 + lean * 0.5, y, x + 2.7 + lean * 0.5, y, 0.5, G.rgba(m[4], 0.8));
      P.line(g, x + 0.7 + lean, top + 1.2, x + 0.6, 14, 0.4, G.rgba(m[0], 0.6));
    }
    sil(g, [22.6, 15, 27.6, 11.4, 29.2, 13.2, 25.2, 19.6], mfill(g, 22, 11, 29, 20, m), 1);
    inkPath(g, () => { g.beginPath(); g.moveTo(9, 13.4); g.lineTo(23.4, 13.4); g.lineTo(23, 23); g.lineTo(9.4, 23); g.closePath(); }, mfill(g, 9, 13, 24, 23, m), 1.2);
    sil(g, [8.6, 22.6, 23.8, 22.6, 25.4, 29, 7, 29], mfill(g, 7, 22, 26, 29, cuff), 1.2);
    P.line(g, 8.6, 23.2, 23.8, 23.2, 0.6, G.rgba(cuff[0], 0.8));
  };
  const bootShape = (g, m, trim) => {
    inkPath(g, () => { g.beginPath(); g.moveTo(10, 3.4); g.lineTo(20.6, 3.4); g.lineTo(20.4, 18.4); g.quadraticCurveTo(27.6, 19.4, 28.6, 24); g.lineTo(28.6, 27.4); g.lineTo(8.6, 27.4); g.lineTo(9.4, 18); g.closePath(); }, mfill(g, 8, 3, 29, 27, m), 1.3);
    P.rect(g, 8.6, 25.2, 20, 2.2, G.rgba(m[4], 0.95));
    inkPath(g, () => { g.beginPath(); g.rect(9.4, 3, 11.8, 4.2); }, mfill(g, 9, 3, 21, 7, trim || m), 1);
    P.path(g, [10.6, 7.4, 13, 7.4, 12, 18.4, 10.2, 19]); P.fill(g, 'rgba(255,255,255,0.12)');
  };
  const ringOf = (g, m, set) => { band(g, 16, 21, 9, 7.6, m, 3); if (set) set(); };
  const setting = (g, m, col, r) => { sil(g, [10.6, 12.6, 12.6, 8.4, 19.4, 8.4, 21.4, 12.6, 19, 15, 13, 15], mfill(g, 10, 8, 22, 15, m), 1); gemCut(g, 16, 10.8, r || 3.2, col); };
  const GEAR2 = {
    gale_circlet(g) {
      g.strokeStyle = 'rgba(200,240,255,0.6)'; g.lineWidth = 0.8; for (const [x, y, r, a0, a1] of [[7, 8, 3, 0.4, 3.8], [25, 7, 2.6, -0.6, 2.8]]) { g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke(); }
      g.beginPath(); g.moveTo(10, 4.6); g.quadraticCurveTo(16, 1.6, 22, 4.4); g.stroke();
      for (const s of [-1, 1]) { const X = (x) => 16 + s * (x - 16); for (const [x, y, l] of [[4.4, 17, 4], [4, 14.6, 4.6], [4.8, 12.2, 3.6]]) sil(g, [X(x + 2), y + 2, X(x - l + 2), y - 1.6, X(x + 2.6), y + 0.4], P.lg(g, X(x - l), 0, X(x + 2), 0, ['#ffffff', '#b8d8ec']), 0.7); }
      band(g, 16, 19.6, 11.4, 5.2, MAT.silver, 2.4);
      sil(g, [12.6, 15.4, 16, 9.6, 19.4, 15.4, 16, 17.4], mfill(g, 12, 9, 20, 17, MAT.silver), 1);
      gemCut(g, 16, 14.4, 2, '#40d8ff'); P.glow(g, 16, 14.4, 4, '#80f0ff', 0.5);
      for (const x of [8.4, 23.6]) gemCut(g, x, 21.6, 1.2, '#80f0ff');
    },
    brawler_band(g) {
      band(g, 16, 14.4, 11.4, 5.6, BLOOD, 4.2);
      stitch(g, [6.2, 15.4, 10, 18.8, 16, 20, 22, 18.8, 25.8, 15.4], 'rgba(40,0,6,0.7)');
      sil(g, [22.4, 17.6, 26.4, 16.6, 27.6, 19.6, 24.4, 21], mfill(g, 22, 16, 28, 21, BLOOD), 1);
      sil(g, [24.4, 20, 29.4, 28.4, 26.8, 29, 23.4, 21.6], mfill(g, 23, 20, 30, 29, BLOOD), 1);
      sil(g, [23.4, 20.4, 22.6, 29.6, 20.4, 29, 22, 20.2], mfill(g, 20, 20, 24, 30, BLOOD), 1);
      for (const x of [8.4, 12.6, 19.6]) rivet(g, x, x === 12.6 || x === 19.6 ? 19.2 : 17.8, 0.9, DARKSTEEL);
      P.ell(g, 11, 11, 1.6, 0.8, 'rgba(60,0,8,0.6)');
    },
    warden_helm(g) {
      g.beginPath(); g.moveTo(16, 3.4); g.quadraticCurveTo(26, 0.6, 29.6, 10); g.quadraticCurveTo(26, 6, 18, 6.6); P.fill(g, '#6a0a14'); g.strokeStyle = INK; g.lineWidth = 0.8; g.stroke();
      inkPath(g, () => { g.beginPath(); g.moveTo(6, 28); g.lineTo(6, 14); g.quadraticCurveTo(6, 4.2, 16, 3.8); g.quadraticCurveTo(26, 4.2, 26, 14); g.lineTo(26, 28); g.closePath(); }, mfill(g, 6, 4, 26, 28, DARKSTEEL), 1.4);
      P.path(g, [7.4, 26, 7.4, 14, 10, 7.4, 13.4, 5.4, 11.4, 14, 10.4, 26]); P.fill(g, 'rgba(255,255,255,0.14)');
      P.rect(g, 15.2, 4.2, 1.6, 23.6, G.rgba(DARKSTEEL[4], 0.45)); P.rect(g, 14.6, 4.2, 0.6, 23.6, G.rgba(DARKSTEEL[0], 0.5));
      P.rect(g, 7, 12.4, 18, 3, INK); P.rect(g, 7.6, 12.8, 16.8, 2.2, '#050308'); P.rect(g, 14.8, 12.4, 2.4, 3, mfill(g, 14, 12, 17, 15, DARKSTEEL));
      for (let i = 0; i < 6; i++) { const x = 8.4 + i * 2.6 + (i > 2 ? 2 : 0); P.circle(g, x, 20, 0.6, INK); }
      for (const [x, y] of [[7.6, 9.4], [24.4, 9.4], [7.6, 25.4], [24.4, 25.4]]) rivet(g, x, y, 0.9, DARKSTEEL);
      P.path(g, [20, 22, 22.4, 23.4, 21, 25]); P.fill(g, 'rgba(0,0,0,0.35)');
    },
    crimson_chalice(g) {
      inkPath(g, () => { g.beginPath(); g.moveTo(6.4, 4.4); g.lineTo(25.6, 4.4); g.quadraticCurveTo(25, 13.4, 18, 16.6); g.lineTo(14, 16.6); g.quadraticCurveTo(7, 13.4, 6.4, 4.4); }, mfill(g, 6, 4, 26, 17, MAT.gold), 1.3);
      P.ell(g, 16, 4.8, 9.4, 2, INK); P.ell(g, 16, 5, 8.6, 1.5, P.lg(g, 8, 0, 24, 0, ['#ff5060', '#8a0818']));
      for (const [x, l] of [[9, 4.6], [20.6, 7.4], [23.4, 3]]) { P.path(g, [x - 0.8, 5, x + 0.8, 5, x + 0.6, 5 + l, x, 5.8 + l, x - 0.6, 5 + l]); P.fill(g, '#b0101e'); }
      P.circle(g, 16, 10.6, 2.6, INK); P.circle(g, 16, 10.6, 2.2, P.vol(g, 16, 10.6, 2.2, '#e8dcc0')); for (const x of [15.2, 16.8]) P.circle(g, x, 10.4, 0.45, INK); // a skull boss
      sil(g, [14.6, 16.4, 17.4, 16.4, 17, 23, 15, 23], mfill(g, 14, 16, 18, 23, MAT.gold), 1); P.ell(g, 16, 19.4, 2.6, 1, MAT.gold[3]);
      inkPath(g, () => { g.beginPath(); g.ellipse(16, 25.6, 7.4, 2.6, 0, 0, Math.PI * 2); }, mfill(g, 9, 23, 23, 28, MAT.gold), 1.1);
      P.ell(g, 21, 26.6, 1.8, 0.6, '#8a0818');
    },
    jade_talisman(g) {
      g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(7, 1.6); g.quadraticCurveTo(10, 8, 14, 10.6); g.moveTo(25, 1.6); g.quadraticCurveTo(22, 8, 18, 10.6); g.stroke();
      g.strokeStyle = '#8a3a20'; g.lineWidth = 0.8; g.stroke();
      inkCircle(g, 16, 19, 9, P.rg(g, 13, 16, 11, ['#b0f8d0', '#3aa86a', '#0e3a22']));
      g.strokeStyle = 'rgba(10,50,28,0.9)'; g.lineWidth = 0.9; g.beginPath(); for (let a = 0; a < Math.PI * 4.4; a += 0.2) { const r = 0.6 + a * 0.45, x = 16 + Math.cos(a) * r, y = 19 + Math.sin(a) * r; if (a) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); // a spiral carved in the stone
      g.strokeStyle = 'rgba(200,255,220,0.35)'; g.lineWidth = 0.4; g.save(); g.translate(-0.4, -0.4); g.stroke(); g.restore();
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.78; P.circle(g, 16 + Math.cos(a) * 7.6, 19 + Math.sin(a) * 7.6, 0.6, 'rgba(10,50,28,0.9)'); }
      P.ell(g, 12.4, 14.6, 2, 1.2, 'rgba(255,255,255,0.45)', -0.6);
      sil(g, [14.4, 27.6, 17.6, 27.6, 18, 31, 14, 31], '#b02a1a', 0.8);
      sil(g, [13.6, 9, 18.4, 9, 18, 11.6, 14, 11.6], mfill(g, 13, 9, 19, 12, MAT.gold), 0.9);
    },
    wrath_amulet(g) {
      chain(g, 7, 2, 12.6, 9, MAT.gold); chain(g, 25, 2, 19.4, 9, MAT.gold);
      for (const s of [-1, 1]) sil(g, [16 + s * 4, 11, 16 + s * 11.4, 7.4, 16 + s * 8.6, 13.4], mfill(g, 5, 7, 27, 14, MAT.gold), 1); // horns of the setting
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 8.4); g.lineTo(25, 18.4); g.lineTo(16, 29); g.lineTo(7, 18.4); g.closePath(); }, mfill(g, 7, 8, 25, 29, MAT.gold), 1.3);
      inkPath(g, () => { g.beginPath(); g.ellipse(16, 18.6, 5.4, 6.6, 0, 0, Math.PI * 2); }, P.rg(g, 14.6, 16.6, 7, ['#ffb0a0', '#e01828', '#5a0410']), 1);
      P.ell(g, 16, 18.6, 0.9, 4.6, INK); P.glow(g, 16, 18.6, 7, '#ff3040', 0.45); P.rect(g, 13.2, 14.6, 1.4, 1.4, '#ffffff');
    },
  };
  Object.assign(GEAR2, {
    gore_tunic(g) {
      tunic(g, ['#e8dcc0', '#c8b890', '#9a8a68', '#665a42', '#342c20']);
      P.rect(g, 8.6, 18.6, 15, 2.8, INK); P.rect(g, 8.6, 19, 15, 2, mfill(g, 8, 19, 24, 21, MAT.leather)); P.rrect(g, 14.6, 18.4, 2.8, 3.2, 0.4, mfill(g, 14, 18, 18, 22, MAT.bronze));
      for (let i = 0; i < 3; i++) { P.line(g, 14.6, 9.6 + i * 2.4, 17.4, 11 + i * 2.4, 0.6, '#5a3a20'); P.line(g, 17.4, 9.6 + i * 2.4, 14.6, 11 + i * 2.4, 0.6, '#5a3a20'); }
      for (const [x, y, rx, ry] of [[11.4, 13, 2.8, 2.2], [20, 24, 2.4, 1.8], [11, 25, 1.6, 1.3], [21.4, 11, 1.4, 1.1], [5.6, 10.6, 1.2, 1]]) { P.ell(g, x, y, rx, ry, 'rgba(130,8,18,0.92)'); P.ell(g, x - 0.4, y - 0.3, rx * 0.45, ry * 0.4, 'rgba(210,40,50,0.8)'); }
      P.path(g, [11.8, 15, 12.6, 15, 12.4, 18, 12, 18.6]); P.fill(g, 'rgba(130,8,18,0.92)');
      g.strokeStyle = INK; g.lineWidth = 0.6; g.beginPath(); g.moveTo(19, 14); g.lineTo(21.4, 16.6); g.moveTo(20.6, 14); g.lineTo(22.2, 15.8); g.stroke(); // a tear
    },
    stalwart_cuirass(g) {
      cuirass(g, DARKSTEEL, { trim: MAT.gold[1] });
      g.strokeStyle = MAT.gold[1]; g.lineWidth = 0.9; g.beginPath(); g.moveTo(9, 4.4); g.lineTo(16, 8.4); g.lineTo(23, 4.4); g.stroke();
      P.glow(g, 16, 14.6, 4, '#ffd070', 0.35);
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; P.line(g, 16 + Math.cos(a) * 1.8, 14.6 + Math.sin(a) * 1.8, 16 + Math.cos(a) * 3.6, 14.6 + Math.sin(a) * 3.6, 0.6, MAT.gold[1]); }
      inkCircle(g, 16, 14.6, 1.5, mfill(g, 14, 13, 18, 16, MAT.gold));
      for (const [x, y] of [[9.4, 12], [22.6, 12], [10, 25.4], [22, 25.4]]) rivet(g, x, y, 0.8, MAT.gold);
    },
    stillhunter_garb(g) {
      const C = ['#7a9660', '#4e6a3c', '#34482a', '#22301a', '#10160a'];
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 2); g.quadraticCurveTo(22.6, 2.4, 23, 9); g.lineTo(28, 12); g.lineTo(26, 28.6); g.lineTo(21, 26.6); g.lineTo(16, 29); g.lineTo(11, 26.6); g.lineTo(6, 28.6); g.lineTo(4, 12); g.lineTo(9, 9); g.quadraticCurveTo(9.4, 2.4, 16, 2); }, mfill(g, 4, 2, 28, 29, C), 1.3);
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 4.4); g.quadraticCurveTo(20.6, 4.8, 20.4, 10.4); g.quadraticCurveTo(16, 12.6, 11.6, 10.4); g.quadraticCurveTo(11.4, 4.8, 16, 4.4); }, '#070a04', 0.8); // the hood's shadow
      for (const x of [14.6, 17.4]) { P.glow(g, x, 8.6, 1.6, '#c0ff80', 0.6); P.rect(g, x - 0.5, 8.4, 1, 0.5, '#d8ffb0'); }
      P.rect(g, 8.4, 19.4, 15.2, 2.4, INK); P.rect(g, 8.4, 19.8, 15.2, 1.6, mfill(g, 8, 19, 24, 21, MAT.leather));
      g.strokeStyle = MAT.leather[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(9.4, 11.6); g.lineTo(21.6, 19.4); g.stroke();
      for (const [x, y, a] of [[7, 16, 0.4], [24.4, 22, -0.4], [10, 24, 0.2], [21, 14, 0.6]]) P.ell(g, x, y, 1.8, 0.9, '#8aa64e', a);
      stitch(g, [16, 12.6, 16, 27]);
    },
    blazing_shell(g) {
      cuirass(g, ['#8a5a44', '#5a342a', '#3a1e18', '#22100c', '#100604']);
      g.lineCap = 'round';
      for (const [w, c] of [[1.8, 'rgba(255,90,20,0.4)'], [0.8, '#ff8a30'], [0.35, '#fff0a0']]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(16, 11); g.lineTo(13.6, 15); g.lineTo(15, 18.4); g.lineTo(12, 23); g.moveTo(15, 18.4); g.lineTo(19.6, 21.4); g.lineTo(21, 26); g.moveTo(16, 11); g.lineTo(19.4, 13.6); g.stroke(); }
      P.glow(g, 16, 15, 7, '#ff7020', 0.55);
      g.beginPath(); g.moveTo(16, 10.4); g.bezierCurveTo(19.4, 13, 19, 17.4, 16, 19); g.bezierCurveTo(13, 17.4, 12.6, 13, 16, 10.4); P.fill(g, P.lg(g, 0, 10, 0, 19, ['#fff6b0', '#ffb030', '#e04810']));
      for (const [x, y] of [[6, 5], [26, 6], [24, 11]]) P.circle(g, x, y, 0.5, '#ffb040');
    },
    defiant_plate(g) {
      cuirass(g, MAT.iron);
      for (const s of [-1, 1]) sil(g, [16 + s * 12, 8.6, 16 + s * 15, 3.4, 16 + s * 10.4, 6], mfill(g, 1, 3, 31, 9, MAT.iron), 0.9);
      inkPath(g, () => { g.beginPath(); g.moveTo(11.4, 10.6); g.lineTo(20.6, 10.6); g.lineTo(20.4, 17.4); g.quadraticCurveTo(19, 22, 16, 24); g.quadraticCurveTo(13, 22, 11.6, 17.4); g.closePath(); }, mfill(g, 11, 10, 21, 24, MAT.silver), 1.1);
      P.rect(g, 15.3, 12.4, 1.4, 9, '#9a1a24'); P.rect(g, 12.8, 14.6, 6.4, 1.4, '#9a1a24');
      for (const [x, y] of [[9.4, 26], [22.6, 26]]) rivet(g, x, y, 0.8, MAT.gold);
      P.path(g, [21, 20.4, 23, 22, 21.6, 23]); P.fill(g, 'rgba(0,0,0,0.4)');
    },
    stalker_grips(g) {
      gauntlet(g, ['#6a5a50', '#44382e', '#2c221c', '#1a1410', '#0a0806'], ['#7a5aa0', '#52367a', '#361e56', '#221038', '#10061c'], { claws: true });
      stitch(g, [10, 17, 22.4, 17]); gemCut(g, 16, 19.4, 2, '#b060ff'); P.glow(g, 16, 19.4, 4, '#c080ff', 0.45);
    },
    spark_gauntlets(g) {
      gauntlet(g, DARKSTEEL, MAT.iron);
      for (let i = 0; i < 3; i++) P.line(g, 9.6, 15.6 + i * 2.4, 22.8, 15.6 + i * 2.4, 0.6, G.rgba(DARKSTEEL[4], 0.8));
      for (const [x, y, c] of [[11, 3.2, '#ffd040'], [17.8, 1.8, '#ff8020'], [21.6, 4.6, '#ffd040']]) { P.glow(g, x, y, 3.4, c, 0.9); zig(g, [x - 1, y - 1.6, x + 0.6, y - 0.2, x - 0.4, y + 0.4, x + 1, y + 1.8], '#fff4a0', 0.3); }
      rivet(g, 10.6, 26, 0.8, DARKSTEEL); rivet(g, 21.4, 26, 0.8, DARKSTEEL);
    },
    duelist_ember(g) {
      gauntlet(g, ['#ffffff', '#e8e0d2', '#c0b4a0', '#847a68', '#443c30'], MAT.gold);
      gemCut(g, 16, 18.4, 2.4, '#ff6a20'); P.glow(g, 16, 18.4, 5, '#ff7a20', 0.55);
      stitch(g, [11, 15, 21.4, 15], 'rgba(120,100,70,0.8)');
    },
    tempo_treads(g) {
      bootShape(g, MAT.leather, MAT.bronze);
      for (const [x, y, l] of [[20.8, 8, 8.6], [20.8, 10.8, 7.4], [20.8, 13.6, 5.6]]) sil(g, [x, y, x + l, y - 3, x + l * 0.75, y + 0.8, x, y + 1.8], P.lg(g, x, 0, x + l, 0, ['#ffffff', '#b8d8f0']), 0.8);
      inkCircle(g, 14.8, 14.4, 2.2, mfill(g, 12, 12, 17, 17, MAT.bronze)); P.line(g, 14.8, 14.4, 14.8, 12.9, 0.4, INK); P.line(g, 14.8, 14.4, 16, 14.8, 0.4, INK);
      stitch(g, [20, 20, 26.6, 22.6]);
    },
    striders(g) {
      bootShape(g, ['#b88458', '#8a5a34', '#5e3a1e', '#3a2210', '#1a0e06']);
      for (const y of [10.6, 15]) { P.rect(g, 9.6, y, 10.8, 1.8, INK); P.rect(g, 9.6, y + 0.3, 10.8, 1.2, MAT.leather[3]); rivet(g, 15, y + 0.9, 0.8, DARKSTEEL); }
      stitch(g, [11.2, 7.6, 11.2, 22]); stitch(g, [20, 20.4, 26.6, 22.6]);
      P.path(g, [9, 27.4, 28.6, 27.4, 28.6, 28.4, 9, 28.4]); P.fill(g, '#2a1a0c');
    },
    grave_walkers(g) {
      P.glow(g, 18, 27, 8, '#a080ff', 0.4); for (const [x, y, r] of [[9, 28, 1.6], [26, 28.4, 1.4], [18, 29, 1.2]]) P.circle(g, x, y, r, 'rgba(200,180,255,0.4)');
      bootShape(g, ['#7a5a98', '#523470', '#361e4e', '#221032', '#10061a'], MAT.silver);
      inkCircle(g, 14.8, 13.4, 2.8, P.vol(g, 14.8, 13.4, 2.8, '#ece2c8')); P.rect(g, 13.4, 15, 2.8, 1.6, '#dcd0b0');
      for (const x of [13.8, 15.8]) { P.circle(g, x, 13, 0.6, '#1a1018'); P.circle(g, x, 13, 0.3, '#c0a0ff'); }
      stitch(g, [20, 20.4, 26.6, 22.6], 'rgba(200,180,255,0.5)');
    },
    oak_band(g) {
      ringOf(g, ['#d8a870', '#9a6a38', '#6a4420', '#40280e', '#1e1206']);
      for (let i = 0; i < 6; i++) { const a = Math.PI * 0.15 + i * 0.5; P.line(g, 16 + Math.cos(a) * 8.2, 21 + Math.sin(a) * 6.8, 16 + Math.cos(a) * 9.8, 21 + Math.sin(a) * 8.4, 0.5, '#2a1a0a'); }
      for (const s of [-1, 1]) P.ell(g, 16 + s * 4.4, 12.4, 2.4, 1.2, '#4a8a28', s * 0.5);
      setting(g, ['#d8a870', '#9a6a38', '#6a4420', '#40280e', '#1e1206'], '#6ad060');
    },
    bronze_loop(g) { ringOf(g, MAT.bronze); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; P.circle(g, 16 + Math.cos(a) * 9, 21 + Math.sin(a) * 7.6, 0.45, MAT.bronze[3]); } setting(g, MAT.bronze, '#ff5030'); },
    steel_signet(g) {
      ringOf(g, MAT.silver);
      inkPath(g, () => { g.beginPath(); g.rect(10, 5.6, 12, 9); }, mfill(g, 10, 5, 22, 15, MAT.silver), 1.2);
      inkPath(g, () => { g.beginPath(); g.moveTo(13, 7.6); g.lineTo(19, 7.6); g.lineTo(18.6, 11); g.quadraticCurveTo(17.4, 13, 16, 13.6); g.quadraticCurveTo(14.6, 13, 13.4, 11); g.closePath(); }, mfill(g, 13, 7, 19, 14, DARKSTEEL), 0.8);
      P.line(g, 16, 8.4, 16, 12.6, 0.5, INK); P.line(g, 14, 9.8, 18, 9.8, 0.5, INK);
    },
    infernal_pact(g) {
      ringOf(g, MAT.iron);
      P.glow(g, 16, 10, 7, '#ff3040', 0.55);
      for (const s of [-1, 1]) sil(g, [16 + s * 3.4, 8, 16 + s * 7.4, 2.4, 16 + s * 5.6, 8.4], mfill(g, 8, 2, 24, 9, MAT.iron), 0.9);
      inkPath(g, () => { g.beginPath(); g.arc(16, 10.4, 4.6, Math.PI * 0.9, Math.PI * 0.1); g.lineTo(19, 15); g.lineTo(13, 15); g.closePath(); }, mfill(g, 11, 6, 21, 15, MAT.iron), 1);
      for (const x of [14.2, 17.8]) { P.ell(g, x, 10.6, 1.1, 1.2, INK); P.circle(g, x, 10.6, 0.6, '#ff3040'); }
      P.line(g, 14.4, 13.4, 17.6, 13.4, 0.5, INK);
    },
    greed_signet(g) {
      ringOf(g, MAT.gold);
      inkCircle(g, 16, 10, 5.8, mfill(g, 10, 4, 22, 16, MAT.gold));
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; P.circle(g, 16 + Math.cos(a) * 5, 10 + Math.sin(a) * 5, 0.4, MAT.gold[3]); }
      P.path(g, [12.6, 12.4, 12.2, 7.6, 14.2, 9.6, 16, 6.6, 17.8, 9.6, 19.8, 7.6, 19.4, 12.4]); P.fill(g, MAT.gold[3]); // a crown stamped in the face
      P.path(g, [12.6, 12.4, 12.2, 7.6, 14.2, 9.6, 16, 6.6, 16, 12.4]); P.fill(g, G.rgba(MAT.gold[4], 0.5));
      P.rect(g, 12.6, 12, 6.8, 1, MAT.gold[4]);
    },
    aegis_ring(g) {
      ringOf(g, MAT.silver);
      inkPath(g, () => { g.beginPath(); g.moveTo(10.6, 5); g.lineTo(21.4, 5); g.lineTo(21, 11); g.quadraticCurveTo(19.4, 15, 16, 16.4); g.quadraticCurveTo(12.6, 15, 11, 11); g.closePath(); }, mfill(g, 10, 5, 22, 16, MAT.silver), 1.2);
      gemCut(g, 16, 9.8, 2.6, '#4a90ff'); P.glow(g, 16, 9.8, 5, '#6ab0ff', 0.4);
    },
  });
  function signet2(g, col, glyph) {
    band(g, 16, 22, 8.6, 7, MAT.gold, 3);
    inkCircle(g, 16, 10.6, 8.2, mfill(g, 8, 2, 24, 19, MAT.gold));
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; P.circle(g, 16 + Math.cos(a) * 7.2, 10.6 + Math.sin(a) * 7.2, 0.35, MAT.gold[3]); }
    P.circle(g, 16, 10.6, 6.2, INK); P.circle(g, 16, 10.6, 5.6, P.rg(g, 16, 12, 7, [[0, sh(col, -0.1)], [1, sh(col, -0.7)]]));
    g.save(); g.beginPath(); g.arc(16, 10.6, 5.6, 0, Math.PI * 2); g.clip(); g.translate(16, 10.6); g.scale(0.36, 0.36); g.translate(-16, -16); ABI[glyph](g); g.restore();
    P.path(g, [11.4, 7, 13.4, 5, 14.4, 6]); P.fill(g, 'rgba(255,255,255,0.35)');
  }
  Object.assign(GEAR2, {
    signet_flame(g) { signet2(g, '#e8602a', 'fireball'); },
    signet_frost(g) { signet2(g, '#3aa8e8', 'nova'); },
    signet_storm(g) { signet2(g, '#e8c020', 'arcbolt'); },
    signet_arcana(g) { signet2(g, '#9a50e0', 'arcaneorb'); },
    signet_steel(g) { signet2(g, '#8a92a6', 'cleave'); },
    signet_legion(g) { signet2(g, '#40b080', 'golem'); },
  });
  /* ---------- items that act on their own (js/game/items.js) ---------- */
  const itFlame = (g, x, y, s, a) => { g.beginPath(); g.moveTo(x, y - s * 1.6); g.bezierCurveTo(x + s, y - s * 0.4, x + s * 0.9, y + s * 0.7, x, y + s); g.bezierCurveTo(x - s * 0.9, y + s * 0.7, x - s, y - s * 0.4, x, y - s * 1.6); P.fill(g, P.lg(g, 0, y - s * 1.6, 0, y + s, ['#fff6b0', '#ffb030', '#e04810'])); if (a) P.glow(g, x, y, s * 2.4, '#ff7020', a); };
  const itChain = (g, m, y) => { chain(g, 7, 2, 12.6, y || 9, m); chain(g, 25, 2, 19.4, y || 9, m); };
  const itCrown = (g, m, pts) => { // a crown seen from the front: a band and its points
    inkPath(g, () => { g.beginPath(); g.moveTo(5, 24); for (let i = 0; i < pts.length; i++) { const x = 5 + 22 * i / (pts.length - 1); g.lineTo(x, pts[i]); if (i < pts.length - 1) g.lineTo(x + 11 / (pts.length - 1), 15); } g.lineTo(27, 24); g.closePath(); }, mfill(g, 5, 6, 27, 24, m), 1.2);
    inkPath(g, () => { g.beginPath(); g.rect(4.4, 21, 23.2, 5); }, mfill(g, 4, 21, 28, 26, m), 1.1);
  };
  const IT_FUR = ['#ffffff', '#e0e6ea', '#aab6c0', '#6a7a88', '#34404a'];
  const IT_ICE = ['#ffffff', '#c8ecff', '#7ac0e8', '#3a78a8', '#163452'];
  const IT_BONE = ['#fffae8', '#e8dcc0', '#b8a888', '#7a6a50', '#3a3024'];
  Object.assign(GEAR2, {
    cinder_treads(g) {
      bootShape(g, ['#6a4a3a', '#443026', '#2c1e18', '#1a100c', '#0a0604'], MAT.bronze);
      g.lineCap = 'round'; for (const [w, c] of [[1.6, 'rgba(255,90,20,0.45)'], [0.6, '#ffb040']]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(12, 10); g.lineTo(14.4, 14); g.lineTo(12.6, 18); g.moveTo(14.4, 14); g.lineTo(18, 16); g.moveTo(17, 21); g.lineTo(21, 22.4); g.stroke(); }
      for (const [x, s] of [[11, 2.2], [17.4, 3], [24, 2.4]]) itFlame(g, x, 27.4 - s * 0.6, s, 0.35);
    },
    storm_treads(g) {
      bootShape(g, ['#b8c8e0', '#7a8aa8', '#4e5a76', '#2e364a', '#141824'], MAT.silver);
      P.glow(g, 16, 14, 8, '#fff080', 0.35);
      zig(g, [13, 7, 17, 12.4, 13.6, 13.6, 18, 19.6], '#fff080', 0.8);
      for (const [x, y] of [[25, 18.6], [27.6, 21.6]]) glint(g, x, y, 1.6, '#fff4a0');
    },
    spiked_boots(g) {
      for (const [pts, x0] of [[[20.2, 11, 26.4, 8.6, 20.2, 15], 20], [[24.4, 19.4, 29.6, 15, 26.4, 20.4], 24], [[28.4, 24.6, 31.4, 22.4, 28.6, 26.6], 28]]) sil(g, pts, mfill(g, x0, 8, x0 + 6, 27, DARKSTEEL), 0.9);
      bootShape(g, MAT.iron, DARKSTEEL);
      for (const y of [11.4, 16.4]) { P.rect(g, 9.4, y, 11.2, 1.8, INK); P.rect(g, 9.4, y + 0.3, 11.2, 1.2, MAT.leather[3]); }
      for (const [x, y] of [[12, 22.6], [16, 22.6], [22.6, 23]]) rivet(g, x, y, 0.9, DARKSTEEL);
    },
    mire_boots(g) {
      P.ell(g, 18, 28.4, 13, 2.6, 'rgba(70,90,30,0.75)'); P.ell(g, 14, 28, 5, 1.1, 'rgba(160,190,80,0.5)');
      bootShape(g, ['#8a8a5a', '#5e6036', '#3e4222', '#262a14', '#10120a'], MAT.leather);
      for (const [x, y, l] of [[11.6, 7.4, 5], [15.4, 7.4, 3], [18.6, 7.4, 6.4], [24, 19.8, 3.4]]) { P.path(g, [x - 1, y, x + 1, y, x + 0.8, y + l, x, y + l + 1, x - 0.8, y + l]); P.fill(g, '#6a7a2a'); P.circle(g, x - 0.3, y + 1, 0.35, '#b0c060'); }
      for (const [x, y] of [[21, 26], [9.6, 24]]) P.circle(g, x, y, 0.9, 'rgba(180,210,90,0.8)');
    },
    frost_greaves(g) {
      bootShape(g, IT_ICE, MAT.silver);
      for (const [x, y, l, a] of [[20.6, 9, 6, -0.6], [20.6, 14, 5, -0.2], [9.4, 12, 4.6, 3.6]]) { g.save(); g.translate(x, y); g.rotate(a); sil(g, [0, -1.2, l, 0, 0, 1.2], P.lg(g, 0, 0, l, 0, ['#e8f8ff', '#80c8f0']), 0.7); g.restore(); }
      P.glow(g, 15, 15, 6, '#a0e8ff', 0.4); glint(g, 15, 15, 2.6, '#ffffff');
    },
    pace_setter(g) {
      bootShape(g, ['#e0b888', '#b08050', '#7a5230', '#4a3018', '#22140a'], MAT.gold);
      for (const [x, y, l] of [[9.6, 9.4, 8], [9.6, 12.4, 7], [9.6, 15.4, 5.4]]) sil(g, [x, y, x - l, y - 3.6, x - l * 0.7, y + 0.6, x, y + 1.8], P.lg(g, x - l, 0, x, 0, ['#ffffff', '#e8e0c8']), 0.8); // a wing on the ankle
      inkCircle(g, 15.4, 14.6, 2, mfill(g, 13, 12, 18, 17, MAT.gold)); P.circle(g, 15.4, 14.6, 0.7, '#ff5030');
    },
    plated_boots(g) {
      bootShape(g, DARKSTEEL, MAT.gold);
      for (const y of [8.6, 12.6, 16.6]) { g.strokeStyle = G.rgba(DARKSTEEL[4], 0.9); g.lineWidth = 0.8; g.beginPath(); g.moveTo(9.6, y); g.quadraticCurveTo(15, y + 1.2, 20.4, y); g.stroke(); }
      inkPath(g, () => { g.beginPath(); g.moveTo(20.4, 18.6); g.quadraticCurveTo(26.6, 19.4, 28, 23.6); g.lineTo(21, 23.6); g.closePath(); }, mfill(g, 20, 18, 28, 24, DARKSTEEL), 0.9);
      for (const [x, y] of [[11, 10.6], [19, 10.6], [11, 14.6], [19, 14.6], [24.6, 22]]) rivet(g, x, y, 0.8, MAT.gold);
    },
    shadow_cloak(g) {
      const C = ['#6a5a8a', '#443a60', '#2a2240', '#181428', '#0a0812'];
      P.glow(g, 16, 26, 12, '#8040ff', 0.45);
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 2); g.quadraticCurveTo(22.6, 2.4, 23, 9); g.lineTo(28.6, 13); g.lineTo(27, 29); g.lineTo(21.4, 27); g.lineTo(16, 29.6); g.lineTo(10.6, 27); g.lineTo(5, 29); g.lineTo(3.4, 13); g.lineTo(9, 9); g.quadraticCurveTo(9.4, 2.4, 16, 2); }, mfill(g, 3, 2, 29, 30, C), 1.3);
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 4.4); g.quadraticCurveTo(20.6, 4.8, 20.4, 10.4); g.quadraticCurveTo(16, 12.6, 11.6, 10.4); g.quadraticCurveTo(11.4, 4.8, 16, 4.4); }, '#030206', 0.8);
      for (const x of [14.4, 17.6]) P.eye(g, x, 8.6, 0.6, '#c080ff');
      g.strokeStyle = 'rgba(160,110,255,0.5)'; g.lineWidth = 0.7; for (const [x0, x1] of [[10, 8.6], [16, 16], [22, 23.4]]) { g.beginPath(); g.moveTo(x0, 14); g.lineTo(x1, 27); g.stroke(); }
      P.rrect(g, 14.4, 12.4, 3.2, 2.2, 0.5, mfill(g, 14, 12, 18, 15, MAT.silver));
    },
    thunder_mantle(g) {
      cuirass(g, ['#c8d4ec', '#8898bc', '#56628a', '#323a58', '#161a2a'], { trim: '#fff080' });
      P.glow(g, 16, 15.6, 8, '#fff080', 0.5);
      zig(g, [17.6, 9.6, 13.6, 15.6, 17, 15.8, 14, 22.6], '#fff080', 1);
      for (const [x, y] of [[4.4, 6], [27.6, 6.4]]) glint(g, x, y, 1.6, '#fff4a0');
    },
    brokers_cape(g) {
      tunic(g, ['#b080d0', '#7a4aa0', '#52307a', '#321a50', '#180a28']);
      for (const s of [-1, 1]) P.line(g, 16 + s * 3, 4.4, 16 + s * 1.2, 27.6, 1.2, MAT.gold[2]);
      inkCircle(g, 16, 16, 3.6, mfill(g, 12, 12, 20, 20, MAT.gold)); P.circle(g, 16, 16, 2.4, MAT.gold[2]); P.rect(g, 15.4, 14.2, 1.2, 3.6, MAT.gold[4]); // a coin with a slot
      for (const [x, y] of [[9.6, 24], [22.4, 24]]) inkCircle(g, x, y, 1.3, mfill(g, x - 1, y - 1, x + 1, y + 1, MAT.gold));
    },
    frostbeast_hide(g) {
      tunic(g, IT_FUR);
      for (const s of [-1, 1]) { inkCircle(g, 16 + s * 9, 4.4, 2.4, IT_FUR[2]); P.circle(g, 16 + s * 9, 4.4, 1.2, '#6a5a60'); } // the bear's ears on the shoulders
      g.strokeStyle = 'rgba(52,64,74,0.8)'; g.lineWidth = 0.6; for (let i = 0; i < 9; i++) { const x = 9.6 + i * 1.6, y = 14 + (i % 3) * 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 0.6, y + 1.8); g.stroke(); }
      for (let i = 0; i < 3; i++) P.line(g, 12 + i * 2.6, 18, 14 + i * 2.6, 25, 1, 'rgba(90,200,255,0.8)'); // claw marks of ice
      P.glow(g, 16, 21, 6, '#80d8ff', 0.3);
    },
    toil_scars(g) {
      tunic(g, ['#c8a888', '#9a7a5a', '#6e5238', '#463220', '#20160c']);
      for (const [x0, y0, x1, y1] of [[10, 11, 15, 17], [18, 10, 22.6, 14.6], [12, 20, 20, 23]]) { P.line(g, x0, y0, x1, y1, 1.6, 'rgba(120,20,24,0.85)'); const n = 4; for (let i = 1; i < n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n, dx = (y1 - y0) / Math.hypot(x1 - x0, y1 - y0) * 1.4, dy = -(x1 - x0) / Math.hypot(x1 - x0, y1 - y0) * 1.4; P.line(g, x - dx, y - dy, x + dx, y + dy, 0.5, '#e8d0b0'); } }
      P.rect(g, 8.6, 25, 15, 1.2, 'rgba(20,12,6,0.6)');
    },
    fervor_mail(g) {
      cuirass(g, ['#ffc8a0', '#d87a4a', '#9a4424', '#5a2410', '#240c04'], { trim: MAT.gold[1] });
      itFlame(g, 16, 15.4, 3.6, 0.5);
      for (const s of [-1, 1]) P.line(g, 16 + s * 5, 21, 16 + s * 2, 26, 1, MAT.gold[1]);
      for (const [x, y] of [[9.4, 12], [22.6, 12]]) rivet(g, x, y, 0.8, MAT.gold);
    },
    blood_shirt(g) {
      tunic(g, ['#f4ece0', '#dcd0c0', '#b0a290', '#766a5a', '#3a342c']);
      g.save(); g.beginPath(); g.rect(0, 15, 32, 17); g.clip(); tunic(g, BLOOD); g.restore(); // soaked from the hem up
      g.beginPath(); g.moveTo(8.6, 15.2); for (let x = 8.6; x <= 23.6; x += 2.5) g.quadraticCurveTo(x + 1.25, 13.4 + (x % 5 ? 1 : 0), x + 2.5, 15.2); P.fill(g, BLOOD[2]);
      for (const [x, l] of [[11, 3], [15.4, 4.6], [20, 2.4]]) { P.path(g, [x - 0.8, 14.6, x + 0.8, 14.6, x + 0.5, 14.6 - l, x, 13.6 - l, x - 0.5, 14.6 - l]); P.fill(g, BLOOD[2]); }
      P.ell(g, 12, 21, 1.6, 0.9, 'rgba(255,140,150,0.45)');
    },
    chain_mail(g) {
      tunic(g, MAT.steel);
      g.save(); g.beginPath(); g.rect(8, 9, 16, 19); g.clip(); g.strokeStyle = G.rgba(MAT.steel[4], 0.75); g.lineWidth = 0.5;
      for (let r = 0; r < 9; r++) for (let c = 0; c < 8; c++) { g.beginPath(); g.ellipse(8.6 + c * 2.2 + (r % 2) * 1.1, 10 + r * 2, 1, 0.8, 0, 0, Math.PI * 2); g.stroke(); }
      g.restore();
      P.rect(g, 8.6, 18.6, 15, 2.4, INK); P.rect(g, 8.6, 19, 15, 1.6, mfill(g, 8, 19, 24, 21, MAT.leather)); P.rrect(g, 14.6, 18.4, 2.8, 2.8, 0.4, mfill(g, 14, 18, 18, 22, MAT.iron));
    },
    war_horn(g) {
      g.strokeStyle = INK; g.lineWidth = 1.8; g.beginPath(); g.moveTo(6, 17); g.bezierCurveTo(4, -2, 26, -4, 24.6, 24); g.stroke(); g.strokeStyle = MAT.leather[1]; g.lineWidth = 1; g.stroke(); // the strap
      inkPath(g, () => { g.beginPath(); g.moveTo(4.6, 14); g.quadraticCurveTo(10, 29, 24, 24.6); g.lineTo(28.4, 20.6); g.lineTo(28.8, 29); g.lineTo(24.6, 28.6); g.quadraticCurveTo(8, 32, 3, 15.4); g.closePath(); }, mfill(g, 3, 14, 29, 30, IT_BONE), 1.2);
      for (const [x, y] of [[9, 24.4], [17, 27]]) { g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x - 1.2, y - 2.2); g.lineTo(x + 1.2, y + 2.2); g.stroke(); g.strokeStyle = MAT.bronze[1]; g.lineWidth = 1.6; g.stroke(); }
      P.ell(g, 26.6, 24.8, 1.2, 3.4, '#1a0e06'); P.glow(g, 28, 24.6, 6, '#ffb070', 0.35);
    },
    seal_rebirth(g) {
      itChain(g, MAT.gold);
      P.glow(g, 16, 19, 11, '#ff9030', 0.45);
      inkCircle(g, 16, 19, 8.4, mfill(g, 8, 11, 24, 27, MAT.gold));
      P.circle(g, 16, 19, 6.4, P.rg(g, 16, 18, 7, ['#ffb070', '#b02a10', '#4a0a04']));
      for (const s of [-1, 1]) sil(g, [16, 18, 16 + s * 5.4, 14.4, 16 + s * 4.4, 18.4, 16 + s * 2.4, 20.6], P.lg(g, 16, 0, 16 + s * 5, 0, ['#fff0a0', '#ff9030']), 0.6); // a phoenix's wings
      itFlame(g, 16, 20.6, 1.8); P.circle(g, 16, 16.4, 1.1, '#fff0a0');
    },
    philosopher_stone(g) {
      itChain(g, MAT.gold, 10);
      P.glow(g, 16, 19.6, 10, '#ff3040', 0.55);
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 10); g.lineTo(22.6, 16.4); g.lineTo(20.4, 26.4); g.lineTo(11.6, 26.4); g.lineTo(9.4, 16.4); g.closePath(); }, P.rg(g, 14.4, 16, 12, ['#ffb0b0', '#e0182c', '#5a0410']), 1.2);
      g.strokeStyle = 'rgba(255,200,200,0.55)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(16, 10); g.lineTo(16, 26.4); g.moveTo(9.4, 16.4); g.lineTo(16, 19); g.lineTo(22.6, 16.4); g.moveTo(11.6, 26.4); g.lineTo(16, 19); g.lineTo(20.4, 26.4); g.stroke();
      for (const [x0, y0, x1, y1] of [[9.4, 16.4, 22.6, 16.4], [11.6, 26.4, 16, 10], [20.4, 26.4, 16, 10]]) inkLine(g, x0, y0, x1, y1, 0.6, MAT.gold[1]); // a cage of gold wire
      P.rect(g, 13.4, 13.4, 1.2, 1.2, '#ffffff');
    },
    collar_confidence(g) {
      band(g, 16, 14.6, 11.4, 7, MAT.leather, 4.6);
      for (let i = 0; i < 7; i++) { const a = Math.PI * (0.15 + i * 0.12); rivet(g, 16 + Math.cos(a) * 11.4, 14.6 + Math.sin(a) * 7, 0.95, MAT.silver); }
      inkPath(g, () => { g.beginPath(); g.rect(12.6, 18.6, 6.8, 5); }, mfill(g, 12, 18, 20, 24, MAT.gold), 1); P.rect(g, 14.2, 20, 3.6, 2.2, '#2a1a0a');
      chain(g, 16, 23.6, 16, 27, MAT.silver); inkCircle(g, 16, 28.6, 1.8, mfill(g, 14, 27, 18, 31, MAT.gold));
    },
    maiden_tear(g) {
      itChain(g, MAT.silver);
      P.glow(g, 16, 20, 10, '#a0e8ff', 0.5);
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 9.6); g.bezierCurveTo(19, 15, 22.6, 18.6, 22.6, 22); g.arc(16, 22, 6.6, 0, Math.PI); g.bezierCurveTo(9.4, 18.6, 13, 15, 16, 9.6); }, P.rg(g, 14, 20, 10, ['#ffffff', '#a0e0ff', '#3a78c8']), 1.1);
      sil(g, [13.4, 8.6, 18.6, 8.6, 17.6, 11.4, 14.4, 11.4], mfill(g, 13, 8, 19, 12, MAT.silver), 0.8);
      P.ell(g, 13.4, 21, 1.2, 2.4, 'rgba(255,255,255,0.75)', 0.3);
    },
    gorgon_mask(g) {
      for (const [x0, y0, x1, y1, x2, y2] of [[9, 9, 3, 6, 4, 1.6], [12, 6, 9, 1, 12.6, 0.6], [20, 6, 23, 1, 19.4, 0.6], [23, 9, 29, 6, 28, 1.6], [7.6, 14, 2, 14, 2.6, 9.6], [24.4, 14, 30, 14, 29.4, 9.6]]) {
        g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1, y1, x2, y2); g.stroke(); g.strokeStyle = '#5aa050'; g.lineWidth = 1.6; g.stroke(); P.circle(g, x2, y2, 1.3, '#3a7a34');
      }
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 4); g.quadraticCurveTo(25.6, 4.6, 25, 15); g.quadraticCurveTo(24, 25, 16, 29); g.quadraticCurveTo(8, 25, 7, 15); g.quadraticCurveTo(6.4, 4.6, 16, 4); }, mfill(g, 7, 4, 25, 29, ['#c8f0b0', '#86c070', '#5a8a48', '#34562a', '#162412']), 1.3);
      for (const x of [12.4, 19.6]) { P.ell(g, x, 14, 2.6, 1.6, INK); P.ell(g, x, 14, 2, 1.1, '#ffe040'); P.ell(g, x, 14, 0.35, 1, INK); P.glow(g, x, 14, 3.4, '#ffe040', 0.5); }
      P.line(g, 13.4, 23, 18.6, 23, 0.8, INK); for (const x of [14, 18]) P.path(g, [x - 0.5, 23, x + 0.5, 23, x, 24.6]), P.fill(g, '#ffffff');
    },
    wind_crown(g) {
      g.strokeStyle = 'rgba(200,240,255,0.7)'; g.lineWidth = 0.8; for (const [x, y, r, a0, a1] of [[5, 10, 3, 0.4, 3.8], [27, 9, 2.6, -0.6, 2.8], [16, 3, 2.2, 0.2, 3]]) { g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke(); }
      itCrown(g, MAT.silver, [10, 6, 10]);
      for (const x of [5, 16, 27]) gemCut(g, x, x === 16 ? 7.4 : 11.4, 1.3, '#60d8ff');
      g.strokeStyle = '#ffffff'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(7, 23.6); g.bezierCurveTo(11, 21.6, 14, 25.4, 18, 23.4); g.bezierCurveTo(21, 22, 23, 24.6, 25.6, 23); g.stroke();
    },
    madness_mask(g) {
      P.glow(g, 16, 16, 13, '#c040ff', 0.35);
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 3.6); g.quadraticCurveTo(26.4, 4, 25.6, 15); g.quadraticCurveTo(24.4, 25, 16, 28.6); g.quadraticCurveTo(7.6, 25, 6.4, 15); g.quadraticCurveTo(5.6, 4, 16, 3.6); }, mfill(g, 6, 4, 26, 29, ['#ffffff', '#ece6f0', '#bab0c4', '#7a6e86', '#3a3244']), 1.3);
      g.save(); g.beginPath(); g.moveTo(16, 3.6); g.quadraticCurveTo(26.4, 4, 25.6, 15); g.quadraticCurveTo(24.4, 25, 16, 28.6); g.quadraticCurveTo(7.6, 25, 6.4, 15); g.quadraticCurveTo(5.6, 4, 16, 3.6); g.clip(); // the dark half, inside the mask
      g.beginPath(); g.moveTo(16, 3); g.lineTo(14.6, 10); g.lineTo(17.4, 16); g.lineTo(15, 22); g.lineTo(16.4, 29.4); g.lineTo(28, 29.4); g.lineTo(28, 3); g.closePath(); g.clip();
      P.rect(g, 0, 0, 32, 32, mfill(g, 6, 4, 26, 29, ['#6a5a7a', '#3a2e4a', '#241a30', '#140e1c', '#06040a'])); g.restore();
      for (const [x, c] of [[11.6, '#e040ff'], [20.4, '#ffe040']]) { P.ell(g, x, 13, 2.4, 1.8, INK); P.eye(g, x + (x < 16 ? 0.4 : -0.6), 13.2, 0.7, c); }
      g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(9.6, 20); g.quadraticCurveTo(14, 25.6, 22.6, 19); g.stroke(); // a crooked grin
      for (const x of [12, 15, 18.4]) P.line(g, x, 21 + (x - 9.6) * 0.1, x + 0.2, 22.8, 0.5, INK);
    },
    warchief_visor(g) {
      for (const s of [-1, 1]) sil(g, [16 + s * 9, 11, 16 + s * 15, 5, 16 + s * 13.4, 0.8, 16 + s * 12.6, 5.6, 16 + s * 8, 8], mfill(g, 1, 0, 31, 12, IT_BONE), 1); // horns
      g.beginPath(); g.moveTo(16, 3.4); g.quadraticCurveTo(21, 0, 24, 3.4); g.quadraticCurveTo(20, 2.6, 16, 5.4); P.fill(g, '#a01424'); // a red plume
      inkPath(g, () => { g.beginPath(); g.moveTo(6, 28); g.lineTo(6, 14); g.quadraticCurveTo(6, 4.2, 16, 3.8); g.quadraticCurveTo(26, 4.2, 26, 14); g.lineTo(26, 28); g.lineTo(19, 28); g.lineTo(16, 24); g.lineTo(13, 28); g.closePath(); }, mfill(g, 6, 4, 26, 28, MAT.iron), 1.4);
      P.rect(g, 7, 13, 18, 2.6, INK); P.glow(g, 16, 14.3, 6, '#ff3020', 0.5); for (const x of [11.6, 20.4]) P.rect(g, x - 1.2, 13.8, 2.4, 1, '#ff6040');
      for (const [x, y] of [[8, 10], [24, 10], [8, 25], [24, 25]]) rivet(g, x, y, 0.9, MAT.bronze);
      P.line(g, 16, 16, 16, 23, 1, MAT.iron[4]);
    },
    ruby_circlet(g) {
      band(g, 16, 18.6, 11.6, 5.6, MAT.gold, 2.6);
      for (const s of [-1, 1]) sil(g, [16 + s * 3.6, 15.4, 16 + s * 8, 11, 16 + s * 7, 16.2], mfill(g, 8, 11, 24, 17, MAT.gold), 0.9);
      sil(g, [11.8, 15.4, 16, 7.6, 20.2, 15.4, 16, 18], mfill(g, 11, 7, 21, 18, MAT.gold), 1);
      P.glow(g, 16, 13.6, 7, '#ff2030', 0.55); gemCut(g, 16, 13.6, 2.8, '#e8102a');
      for (const x of [8, 24]) gemCut(g, x, 20.8, 1.1, '#ff4050');
      for (const [x, y] of [[5, 9], [27, 9.6]]) itFlame(g, x, y, 1.2);
    },
    thunder_crown(g) {
      P.glow(g, 16, 12, 12, '#fff080', 0.35);
      itCrown(g, ['#8a8aa8', '#5a5a78', '#3a3a52', '#22223a', '#0e0e1a'], [8, 4, 8, 4, 8]);
      for (const [x, y] of [[5, 9], [16, 5.4], [27, 9]]) zig(g, [x - 0.8, y - 3.4, x + 0.8, y - 1.6, x - 0.6, y - 1, x + 0.6, y + 1], '#fff080', 0.4);
      gemCut(g, 16, 23.4, 2, '#ffe040'); for (const x of [9, 23]) gemCut(g, x, 23.4, 1.2, '#b060ff');
    },
    necro_clutch(g) {
      P.glow(g, 16, 10, 11, '#60ff90', 0.4);
      gauntlet(g, IT_BONE, ['#4a5a4a', '#2e3a2e', '#1e281e', '#121812', '#060806'], { claws: true });
      for (let i = 0; i < 4; i++) P.circle(g, 10.9 + i * 3.5, 9.6, 0.6, IT_BONE[3]);
      inkCircle(g, 16, 18, 2.4, P.vol(g, 16, 18, 2.4, '#e8dcc0')); for (const x of [15.2, 16.8]) P.circle(g, x, 17.8, 0.5, '#50ff90'); // a skull on the back of the hand
    },
    longfinger_gloves(g) {
      g.save(); g.translate(16, 16); g.scale(1, 1.08); g.translate(-16, -17); gauntlet(g, ['#9a7a9a', '#6a4a6a', '#482e48', '#2c1a2c', '#140a14'], MAT.leather); g.restore();
      stitch(g, [10, 17, 22.4, 17], 'rgba(230,200,230,0.6)');
      inkCircle(g, 25.6, 5.6, 3, mfill(g, 22, 2, 29, 9, MAT.gold)); P.rect(g, 25, 4, 1.2, 3.2, MAT.gold[3]); // a coin held up
    },
    spellcaster_gloves(g) {
      P.glow(g, 16, 7, 10, '#b070ff', 0.45);
      gauntlet(g, ['#b8a0e0', '#7a5ab0', '#52387e', '#321e52', '#160a28'], MAT.gold);
      g.strokeStyle = '#e0c0ff'; g.lineWidth = 0.7; g.beginPath(); g.arc(16, 18, 2.8, 0, Math.PI * 2); g.moveTo(16, 14.4); g.lineTo(16, 21.6); g.moveTo(12.6, 18); g.lineTo(19.4, 18); g.stroke();
      for (const [x, y] of [[9, 3], [16.8, 1.6], [23, 4]]) glint(g, x, y, 1.4, '#e8d0ff');
    },
    frost_thorns(g) {
      gauntlet(g, IT_ICE, MAT.silver);
      for (const [x, y, a, l] of [[9, 16, 3.4, 5], [23.4, 16, -0.2, 5], [16, 21, 1.6, 4], [10, 20, 2.6, 4]]) { g.save(); g.translate(x, y); g.rotate(a); sil(g, [0, -1, l, 0, 0, 1], P.lg(g, 0, 0, l, 0, ['#ffffff', '#80d0ff']), 0.7); g.restore(); }
      P.glow(g, 16, 17, 6, '#a0e8ff', 0.35);
    },
    unholy_touch(g) {
      P.glow(g, 16, 8, 12, '#80ff40', 0.35);
      gauntlet(g, ['#6a6a6a', '#3e3e44', '#26262c', '#16161a', '#060608'], ['#5a6a2a', '#3a4818', '#26300e', '#161c08', '#080a02'], { claws: true });
      for (const [x, y] of [[10.9, 3.6], [14.4, 1.4], [17.9, 2.2], [21.4, 5.4]]) P.circle(g, x, y, 0.9, '#a0ff50');
      P.eye(g, 16, 18, 1.4, '#a0ff50');
    },
    leech_fingers(g) {
      gauntlet(g, ['#c87a7a', '#9a3e44', '#6a2228', '#401014', '#1e0608'], MAT.leather);
      g.lineCap = 'round'; for (const [w, c] of [[3.6, INK], [2.6, '#3a4a1a'], [1, '#7a9a3a']]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(11, 19.6); g.bezierCurveTo(13, 16, 17, 21.6, 21, 17.4); g.stroke(); } // a leech on the back of the hand
      P.circle(g, 21, 17.4, 1, '#1a0a0a');
      for (const [x, y] of [[12, 26], [20, 26.4]]) { P.path(g, [x - 0.7, y - 1, x + 0.7, y - 1, x, y + 1]); P.fill(g, BLOOD[1]); }
    },
    hunting_gloves(g) {
      gauntlet(g, ['#c8a070', '#94703e', '#664a24', '#402c12', '#1e1206'], ['#5a7a3a', '#3e5a26', '#2a3e18', '#1a280e', '#0a1004']);
      g.save(); g.translate(24, 6); g.rotate(0.5); sil(g, [0, -1, 1.8, 3, 1.4, 12, 0, 13, -1.4, 12, -1.8, 3], P.lg(g, -2, 0, 2, 0, ['#ffffff', '#c8b8a0', '#7a6a50']), 0.8); P.line(g, 0, 0, 0, 13, 0.4, '#5a4a30'); g.restore(); // a feather tucked in the cuff
      stitch(g, [10, 17.4, 22.4, 17.4]);
    },
    pest_ring(g) {
      ringOf(g, MAT.bronze);
      inkPath(g, () => { g.beginPath(); g.moveTo(9.6, 11); g.quadraticCurveTo(12, 5, 18, 6); g.lineTo(23.6, 9.6); g.lineTo(18.4, 13.6); g.quadraticCurveTo(12, 15, 9.6, 11); }, P.vol(g, 15, 9, 7, '#e8dcc0'), 1); // a rat's skull
      P.circle(g, 17.4, 9.2, 1.1, INK); P.circle(g, 17.4, 9.2, 0.5, '#50ff90');
      for (const x of [21.4, 22.6]) P.line(g, x, 11.4, x - 0.6, 14.4, 0.6, '#fffae0');
      g.strokeStyle = INK; g.lineWidth = 0.9; g.beginPath(); g.moveTo(9.6, 11); g.quadraticCurveTo(5, 14, 6.6, 18); g.stroke(); // its tail round the band
    },
    ring_ember(g) { ringOf(g, MAT.gold); P.glow(g, 16, 10.8, 7, '#ff7020', 0.55); setting(g, MAT.gold, '#ff6a20'); itFlame(g, 16, 4, 1.4); },
    ring_rime(g) { ringOf(g, MAT.silver); P.glow(g, 16, 10.8, 7, '#80d8ff', 0.5); setting(g, MAT.silver, '#60c8ff'); for (const s of [-1, 1]) { g.save(); g.translate(16 + s * 6.6, 10); g.rotate(s * 0.5 - (s < 0 ? Math.PI : 0)); sil(g, [0, -0.9, 4, 0, 0, 0.9], '#e0f6ff', 0.6); g.restore(); } },
    ring_storm(g) { ringOf(g, MAT.silver); P.glow(g, 16, 10.8, 7, '#fff080', 0.5); setting(g, MAT.silver, '#ffe040'); zig(g, [23, 3, 25, 6.4, 23.6, 7, 25.6, 10.4], '#fff080', 0.5); zig(g, [8.6, 3.6, 6.8, 6.6, 8.2, 7.2, 6.4, 10], '#fff080', 0.5); },
    ring_earth(g) { ringOf(g, MAT.bronze); setting(g, MAT.bronze, '#7a9a40'); for (const s of [-1, 1]) P.ell(g, 16 + s * 6.6, 13.4, 2.4, 1.1, '#5a7a2a', s * 0.5); P.circle(g, 16, 27.4, 1.2, '#6a4a24'); },
    echo_band(g) {
      ringOf(g, DARKSTEEL);
      inkCircle(g, 16, 10, 4.6, mfill(g, 11, 5, 21, 15, DARKSTEEL)); P.circle(g, 16, 10, 1.8, INK);
      g.lineCap = 'round'; for (let i = 1; i <= 3; i++) { g.strokeStyle = G.rgba('#f0e8d0', 1 - i * 0.25); g.lineWidth = 0.8; for (const s of [-1, 1]) { g.beginPath(); g.arc(16, 10, 4.6 + i * 2.4, s < 0 ? Math.PI * 0.75 : -Math.PI * 0.25, s < 0 ? Math.PI * 1.25 : Math.PI * 0.25); g.stroke(); } }
    },
    blight_ring(g) {
      ringOf(g, MAT.iron);
      P.glow(g, 16, 10.8, 8, '#90ff40', 0.5); setting(g, MAT.iron, '#70d030');
      for (const [x, l] of [[12.4, 3.4], [19.4, 2.2]]) { P.path(g, [x - 0.7, 14.6, x + 0.7, 14.6, x + 0.5, 14.6 + l, x, 15.4 + l, x - 0.5, 14.6 + l]); P.fill(g, '#80c030'); }
      for (const [x, y] of [[6, 5], [25.6, 4.6]]) P.circle(g, x, y, 0.8, 'rgba(160,255,80,0.7)');
    },
  });
  Object.assign(GEAR, GEAR2);

  /* ---------- artifact icons: a gothic reliquary, its window lit in the artifact's colour ---------- */
  const arch = (g, x0, x1, top, bot, spring) => { const m = (x0 + x1) / 2; g.beginPath(); g.moveTo(x0, bot); g.lineTo(x0, spring); g.quadraticCurveTo(x0, top + (spring - top) * 0.25, m, top); g.quadraticCurveTo(x1, top + (spring - top) * 0.25, x1, spring); g.lineTo(x1, bot); g.closePath(); };
  function reliquary(g, col) {
    arch(g, 1.4, 30.6, 0.6, 30.6, 12); P.fill(g, P.lg(g, 0, 1, 0, 31, ['#4e4452', '#241e28', '#0e0a10']));
    g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(2.4, 28); g.lineTo(2.4, 12); g.quadraticCurveTo(2.4, 4, 16, 1.6); g.stroke();
    arch(g, 4, 28, 3.6, 28.4, 13); P.fill(g, '#07050a');
    arch(g, 4.5, 27.5, 4.3, 27.9, 13.2); P.fill(g, P.rg(g, 16, 19, 18, [[0, sh(col, -0.1)], [0.55, sh(col, -0.6)], [1, '#07050a']]));
    g.strokeStyle = G.rgba(col, 0.55); g.lineWidth = 0.6; arch(g, 4.7, 27.3, 4.6, 27.7, 13.3); g.stroke();
    for (const [x, y] of [[3, 29], [29, 29]]) P.circle(g, x, y, 1.2, P.vol(g, x, y, 1.2, '#8a7a6a'));
    P.path(g, [14.6, 1.2, 16, -0.6, 17.4, 1.2, 16, 2.6]); P.fill(g, '#c89838');
  }
  const bone = '#e8dcc0';
  const skullAt = (g, x, y, r, eye) => {
    inkPath(g, () => { g.beginPath(); g.arc(x, y, r, Math.PI * 0.85, Math.PI * 0.15); g.lineTo(x + r * 0.6, y + r * 1.1); g.lineTo(x - r * 0.6, y + r * 1.1); g.closePath(); }, P.lg(g, x - r, y - r, x + r, y + r, ['#f4ecd4', '#b8b090', '#5a5440']), 1.1);
    for (const d of [-0.42, 0.42]) { P.ell(g, x + d * r, y + 0.1 * r, r * 0.28, r * 0.32, '#140a0c'); if (eye) { P.glow(g, x + d * r, y + 0.1 * r, r * 0.5, eye, 0.9); P.circle(g, x + d * r, y + 0.1 * r, r * 0.11, eye); } }
    P.path(g, [x, y + r * 0.45, x - r * 0.14, y + r * 0.72, x + r * 0.14, y + r * 0.72]); P.fill(g, '#140a0c');
  };
  const coinAt = (g, x, y, r) => { inkCircle(g, x, y, r, P.vol(g, x, y, r, '#e8b840')); P.circle(g, x, y, r * 0.62, 'rgba(120,80,10,0.5)'); P.rect(g, x - r * 0.45, y - r * 0.5, r * 0.3, r * 0.3, '#fff4c0'); };
  const flameAt = (g, x, y, s) => { g.beginPath(); g.moveTo(x, y - 6 * s); g.bezierCurveTo(x + 4.4 * s, y - 2 * s, x + 4 * s, y + 3 * s, x, y + 3.4 * s); g.bezierCurveTo(x - 4 * s, y + 3 * s, x - 4.4 * s, y - 2 * s, x, y - 6 * s); P.fill(g, P.lg(g, 0, y - 6 * s, 0, y + 3.4 * s, ['#fff4b0', '#ffa030', '#e04010'])); };
  const ART = {
    sands(g) {
      g.strokeStyle = 'rgba(255,220,150,0.5)'; g.lineWidth = 1; for (const y of [11, 16, 21]) { g.beginPath(); g.moveTo(5.4, y); g.lineTo(8.4, y); g.stroke(); }
      sil(g, [9.6, 6, 22.4, 6, 22.4, 8.2, 9.6, 8.2], wood(g, 0, 6, 0, 8.2), 1); sil(g, [9.6, 25.2, 22.4, 25.2, 22.4, 27.4, 9.6, 27.4], wood(g, 0, 25.2, 0, 27.4), 1);
      for (const x of [10.4, 21.6]) inkLine(g, x, 8.4, x, 25, 0.7, '#8a5a30');
      inkPath(g, () => { g.beginPath(); g.moveTo(11.6, 8.2); g.lineTo(20.4, 8.2); g.quadraticCurveTo(20.4, 13.4, 16.8, 16.6); g.quadraticCurveTo(20.4, 19.8, 20.4, 25.2); g.lineTo(11.6, 25.2); g.quadraticCurveTo(11.6, 19.8, 15.2, 16.6); g.quadraticCurveTo(11.6, 13.4, 11.6, 8.2); }, 'rgba(210,235,255,0.3)', 0.9);
      P.path(g, [13, 11, 19, 11, 16, 15.6]); P.fill(g, P.lg(g, 0, 11, 0, 15.6, ['#fff0a0', '#e8b030']));
      P.line(g, 16, 15.6, 16, 22, 0.6, '#f0c040'); P.path(g, [12.2, 25.2, 19.8, 25.2, 16, 20.6]); P.fill(g, P.lg(g, 0, 20.6, 0, 25.2, ['#fff0a0', '#c89020']));
      g.strokeStyle = INK; g.lineWidth = 0.5; g.beginPath(); g.moveTo(19.4, 19); g.lineTo(18, 21.4); g.lineTo(19.6, 23); g.stroke();
    },
    magma(g) {
      P.glow(g, 16, 10, 9, '#ff6a20', 0.7);
      inkPath(g, () => { g.beginPath(); g.moveTo(11.6, 9); g.lineTo(20.4, 9); g.lineTo(20, 11.4); g.quadraticCurveTo(26, 14, 25, 20.4); g.quadraticCurveTo(24, 26.6, 16, 27.4); g.quadraticCurveTo(8, 26.6, 7, 20.4); g.quadraticCurveTo(6, 14, 12, 11.4); g.closePath(); }, P.lg(g, 7, 9, 25, 27, ['#5a4a48', '#2a1e1c', '#0c0806']), 1.3);
      g.lineCap = 'round'; for (const [w, c] of [[1.6, 'rgba(255,90,20,0.45)'], [0.7, '#ffa030']]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(10, 16); g.lineTo(13, 19); g.lineTo(12, 23); g.moveTo(21, 15); g.lineTo(19, 20); g.lineTo(21.4, 23.4); g.stroke(); }
      P.ell(g, 16, 9.4, 4.6, 1.3, '#ffd060');
      for (const [x, l] of [[12.4, 6], [19.4, 8.4]]) { g.beginPath(); g.moveTo(x - 1.2, 9.4); g.quadraticCurveTo(x - 1.6, 9.4 + l * 0.6, x, 9.4 + l); g.quadraticCurveTo(x + 1.4, 9.4 + l * 0.6, x + 1.2, 9.4); P.fill(g, P.lg(g, 0, 9, 0, 9.4 + l, ['#fff0a0', '#ff6a20'])); }
      flameAt(g, 16, 6.6, 0.6); for (const [x, y] of [[10, 5], [22, 4.4]]) P.circle(g, x, y, 0.5, '#ffd070');
    },
    banner(g) {
      inkLine(g, 8, 5, 8, 28, 1, '#5a3a20'); inkCircle(g, 8, 4.6, 1.1, mfill(g, 7, 3, 9, 6, MAT.gold));
      inkLine(g, 8, 7, 24.4, 7, 0.8, '#5a3a20');
      inkPath(g, () => { g.beginPath(); g.moveTo(9, 7.6); g.lineTo(24, 7.6); g.lineTo(23.4, 24); g.lineTo(21, 21.4); g.lineTo(19, 25.4); g.lineTo(16.6, 21); g.lineTo(14, 24.6); g.lineTo(11.6, 21.6); g.lineTo(9.4, 23.6); g.closePath(); }, P.lg(g, 9, 7, 24, 25, ['#a050d0', '#5a1a80', '#240830']), 1.2);
      skullAt(g, 16.4, 13.4, 3.2, null);
      for (const [x, y] of [[20.4, 18.6], [11.6, 10]]) P.circle(g, x, y, 0.8, 'rgba(0,0,0,0.5)');
    },
    mirror(g) {
      inkLine(g, 16, 22, 16, 28, 1.4, '#6a4a2a');
      inkPath(g, () => { g.beginPath(); g.ellipse(16, 13.6, 7.6, 9.2, 0, 0, Math.PI * 2); }, mfill(g, 8, 4, 24, 23, MAT.gold), 1.3);
      P.ell(g, 16, 13.6, 5.8, 7.4, INK); P.ell(g, 16, 13.6, 5.4, 7, P.lg(g, 11, 7, 21, 21, ['#a8c8e0', '#3a5a7a', '#141e2e']));
      for (const [x, y] of [[13.4, 11], [18.6, 11], [16, 16.6]]) { P.glow(g, x, y, 2.4, '#ff4050', 0.8); P.ell(g, x, y, 1.2, 0.6, '#ffb0b0'); P.circle(g, x, y, 0.3, INK); }
      P.line(g, 12.2, 8, 13.6, 18, 0.5, 'rgba(255,255,255,0.45)');
      g.strokeStyle = INK; g.lineWidth = 0.4; g.beginPath(); g.moveTo(19.4, 7.6); g.lineTo(17.6, 12); g.lineTo(20, 15); g.stroke();
    },
    chime(g) {
      for (const x of [8, 16, 24]) sil(g, [x - 1.6, 28, x, 22.6, x + 1.6, 28], steel(g, x - 2, 0, x + 2, 0), 0.8);
      inkLine(g, 16, 3.6, 16, 6.4, 1, '#3a3a40');
      inkPath(g, () => { g.beginPath(); g.moveTo(13, 6.6); g.quadraticCurveTo(16, 4.6, 19, 6.6); g.quadraticCurveTo(21, 11, 21.4, 16); g.quadraticCurveTo(22.6, 18.4, 25, 19.4); g.lineTo(7, 19.4); g.quadraticCurveTo(9.4, 18.4, 10.6, 16); g.quadraticCurveTo(11, 11, 13, 6.6); }, mfill(g, 7, 5, 25, 20, MAT.gold), 1.2); P.glow(g, 16, 13, 9, '#c080ff', 0.25);
      inkCircle(g, 16, 20.6, 1.4, P.vol(g, 16, 20.6, 1.4, '#6a6a70'));
      g.strokeStyle = INK; g.lineWidth = 0.5; g.beginPath(); g.moveTo(18.4, 8); g.lineTo(17.2, 12); g.lineTo(19, 15.6); g.stroke();
      for (const [r, a] of [[4, 0.6], [6.4, 0.35]]) { g.strokeStyle = 'rgba(230,200,255,' + a + ')'; g.lineWidth = 0.7; g.beginPath(); g.arc(16, 12, r + 8, -0.5, 0.2); g.stroke(); g.beginPath(); g.arc(16, 12, r + 8, Math.PI - 0.2, Math.PI + 0.5); g.stroke(); }
    },
    bog(g) {
      g.lineCap = 'round';
      const tw = (x1, y1, x2, y2, w) => inkLine(g, x1, y1, x2, y2, w, '#8a7a4a');
      tw(16, 11, 16, 22, 2.6); tw(16, 13.4, 9, 17.6, 1.2); tw(16, 13.4, 23, 17, 1.2); tw(16, 21.4, 12, 27.4, 1.3); tw(16, 21.4, 20.4, 27.6, 1.3);
      for (const y of [14.4, 19.6]) P.line(g, 14.4, y, 17.6, y + 0.4, 0.8, '#3a2a14');
      inkCircle(g, 16, 8.6, 3.8, P.vol(g, 16, 8.6, 3.8, '#9a8a58'));
      for (const x of [14.6, 17.4]) { P.glow(g, x, 8.4, 2, '#b0ff50', 0.9); P.circle(g, x, 8.4, 0.55, '#e0ff90'); }
      P.line(g, 14.8, 10.6, 17.2, 10.6, 0.4, INK);
      for (const [x, y] of [[11, 12], [22, 11.6]]) P.ell(g, x, y, 1.4, 0.6, '#5a7a2a');
    },
    thread(g) {
      g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(13, 14); g.bezierCurveTo(22, 12, 8, 22, 18, 22.6); g.quadraticCurveTo(24, 23, 23.4, 26.6); g.stroke();
      g.strokeStyle = '#f0c850'; g.lineWidth = 0.8; g.stroke();
      inkPath(g, () => { g.beginPath(); g.rect(19.6, 24.6, 6, 3.6); }, P.lg(g, 0, 24.6, 0, 28.2, ['#8a5a2a', '#3a2410']), 0.9); P.rect(g, 19.6, 25.8, 6, 0.6, '#e8b840');
      sil(g, [8, 6.4, 18, 6.4, 17, 8, 9, 8], wood(g, 0, 6, 0, 8), 0.9); sil(g, [8, 16.4, 18, 16.4, 17, 14.8, 9, 14.8], wood(g, 0, 15, 0, 16.4), 0.9);
      P.rect(g, 9.4, 8, 7.2, 6.8, INK); P.rect(g, 9.8, 8.2, 6.4, 6.4, P.lg(g, 9.8, 0, 16.2, 0, ['#fff0a0', '#e8b030', '#8a5a10']));
      for (let i = 0; i < 5; i++) P.line(g, 9.8, 9 + i * 1.3, 16.2, 9.4 + i * 1.3, 0.3, 'rgba(120,70,0,0.6)');
      glint(g, 22.6, 25.6, 1.4, '#fff4b0');
    },
    idol(g) {
      inkPath(g, () => { g.beginPath(); g.moveTo(9.6, 28); g.lineTo(9, 12); g.quadraticCurveTo(9.4, 4.6, 16, 4.4); g.quadraticCurveTo(22.6, 4.6, 23, 12); g.lineTo(22.4, 28); g.closePath(); }, P.lg(g, 9, 4, 23, 28, ['#b0a490', '#6a6050', '#2e2a22']), 1.3);
      P.rect(g, 9.4, 10.6, 13.2, 2.2, 'rgba(0,0,0,0.5)');
      for (const x of [12.8, 19.2]) { P.rect(g, x - 2, 12.8, 4, 2.4, INK); P.glow(g, x, 14, 2.6, '#40ffc0', 0.8); P.rect(g, x - 1.2, 13.4, 2.4, 1.2, '#c0fff0'); }
      sil(g, [14.6, 14.6, 17.4, 14.6, 18, 20, 14, 20], '#7a7060', 0.8);
      P.rect(g, 11.6, 22.4, 8.8, 2.4, INK); for (let i = 0; i < 4; i++) P.rect(g, 12.2 + i * 2.1, 22.6, 1.4, 1.2, '#8a7e68');
      P.path(g, [10, 12, 12, 7, 13, 12]); P.fill(g, 'rgba(255,255,255,0.12)');
    },
    wheel(g) {
      g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.arc(16, 16, 9, 0, Math.PI * 2); g.stroke(); g.strokeStyle = wood(g, 7, 7, 25, 25); g.lineWidth = 2.2; g.stroke();
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; inkLine(g, 16 + Math.cos(a) * 2, 16 + Math.sin(a) * 2, 16 + Math.cos(a) * 8, 16 + Math.sin(a) * 8, 0.9, '#6a4424'); }
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; sil(g, [16 + Math.cos(a - 0.14) * 10, 16 + Math.sin(a - 0.14) * 10, 16 + Math.cos(a) * 12.6, 16 + Math.sin(a) * 12.6, 16 + Math.cos(a + 0.14) * 10, 16 + Math.sin(a + 0.14) * 10], DARKSTEEL[1], 0.7); }
      inkCircle(g, 16, 16, 2.4, mfill(g, 14, 14, 18, 18, MAT.iron));
      for (const [x, y, l] of [[9, 20, 3], [22.4, 12, 2.4], [19, 23.4, 3.6]]) { P.path(g, [x - 0.7, y, x + 0.7, y, x, y + l]); P.fill(g, '#b01020'); }
    },
    star(g) {
      g.beginPath(); g.moveTo(27, 5); g.lineTo(15.6, 14); g.lineTo(13, 18.6); g.lineTo(18, 16.4); g.closePath(); P.fill(g, P.lg(g, 27, 5, 14, 17, ['rgba(160,220,255,0)', 'rgba(170,225,255,0.85)']));
      P.glow(g, 13, 18, 10, '#80d0ff', 0.7);
      g.save(); g.translate(13, 18.4); g.rotate(0.3);
      for (const [a, l] of [[0, 7], [Math.PI / 2, 5.4], [Math.PI, 7], [Math.PI * 1.5, 5.4]]) { g.save(); g.rotate(a); sil(g, [-1.8, 0, 0, -l, 1.8, 0, 0, 1.4], P.lg(g, -1.8, 0, 1.8, 0, ['#ffffff', '#9fdcff', '#3a7ab0']), 0.9); g.restore(); }
      g.restore();
      inkCircle(g, 13, 18.4, 1.6, '#ffffff');
      for (const [x, y] of [[6, 9], [23, 23], [8, 26]]) glint(g, x, y, 1.2, '#c8ecff');
    },
  };
  Object.assign(ART, {
    darkness(g) {
      P.circle(g, 16, 16, 12, 'rgba(0,0,0,0.5)');
      g.strokeStyle = 'rgba(200,190,255,0.8)'; g.lineWidth = 1.4; g.beginPath(); g.arc(16, 15, 10, Math.PI * 1.25, Math.PI * 0.2); g.stroke();
      inkPath(g, () => { g.beginPath(); g.moveTo(9, 28); g.quadraticCurveTo(8.6, 18, 11, 13); g.quadraticCurveTo(13, 8, 16, 8); g.quadraticCurveTo(19, 8, 21, 13); g.quadraticCurveTo(23.4, 18, 23, 28); g.quadraticCurveTo(20, 25, 16, 27.6); g.quadraticCurveTo(12, 25, 9, 28); }, P.lg(g, 0, 8, 0, 28, ['#2a2036', '#0a0610']), 1);
      for (const x of [13.8, 18.2]) { P.glow(g, x, 14, 2.4, '#e0d0ff', 0.9); P.ell(g, x, 14, 1.1, 0.5, '#ffffff'); }
      for (const [x, y] of [[7, 20], [25, 21], [6, 26]]) P.line(g, x, y, x + (x < 16 ? 2 : -2), y + 2, 1.2, 'rgba(20,10,30,0.8)');
    },
    gaze(g) {
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 4.6); g.quadraticCurveTo(27, 8, 27, 28); g.lineTo(5, 28); g.quadraticCurveTo(5, 8, 16, 4.6); }, P.lg(g, 0, 4, 0, 28, ['#4a1a24', '#1a060a']), 1.2);
      inkPath(g, () => { g.beginPath(); g.moveTo(7.4, 17); g.quadraticCurveTo(16, 8.6, 24.6, 17); g.quadraticCurveTo(16, 25.4, 7.4, 17); }, P.lg(g, 0, 11, 0, 23, ['#fff4e8', '#e0c8b8']), 1.1);
      g.strokeStyle = 'rgba(200,20,30,0.7)'; g.lineWidth = 0.4; for (const [x1, y1, x2, y2] of [[8.6, 17, 11.6, 16], [23.4, 17, 20.4, 18.4], [10, 15, 12.4, 16.4], [22, 15.4, 20.2, 15.6]]) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
      inkCircle(g, 16, 17, 4, P.rg(g, 15, 16, 5, ['#ff8a70', '#c02030', '#4a0610'])); P.ell(g, 16, 17, 0.9, 3, INK); P.circle(g, 14.6, 15.6, 0.8, '#ffffff');
    },
    scorch(g) {
      inkPath(g, () => { g.beginPath(); g.moveTo(10, 28); g.lineTo(9.4, 17); g.lineTo(7.4, 12.4); g.quadraticCurveTo(7.4, 10.4, 9, 11.4); g.lineTo(11.4, 15); g.lineTo(11, 6); g.quadraticCurveTo(12.2, 4.4, 13.2, 6); g.lineTo(13.6, 13); g.lineTo(14.6, 4.4); g.quadraticCurveTo(16, 3, 17, 4.6); g.lineTo(17, 13); g.lineTo(18.6, 5.4); g.quadraticCurveTo(20, 4.4, 20.6, 6); g.lineTo(20, 14); g.lineTo(21.8, 8.6); g.quadraticCurveTo(23.2, 8, 23.4, 9.6); g.lineTo(22.4, 20); g.quadraticCurveTo(21.6, 25, 22, 28); g.closePath(); }, P.lg(g, 7, 4, 23, 28, ['#e8b890', '#a8704c', '#4a2410']), 1.2);
      P.glow(g, 16, 18.6, 6, '#ff6a20', 0.7);
      g.strokeStyle = '#2a0a04'; g.lineWidth = 0.8; g.beginPath(); g.arc(16, 18.6, 3.4, 0, Math.PI * 2); g.stroke();
      flameAt(g, 16, 19.4, 0.5);
      for (const [x, y] of [[12, 23], [20, 22]]) P.ell(g, x, y, 1.2, 0.8, 'rgba(40,10,4,0.6)');
    },
    scales(g) {
      inkLine(g, 16, 5, 16, 26, 1, '#8a6a2a'); inkLine(g, 6.6, 9, 25.4, 7, 1, '#c89838');
      sil(g, [11, 26, 21, 26, 19.6, 28, 12.4, 28], mfill(g, 11, 26, 21, 28, MAT.gold), 1);
      for (const [x, y] of [[6.6, 9], [25.4, 7]]) { P.line(g, x, y, x - 3.4, y + 8.6, 0.4, '#c89838'); P.line(g, x, y, x + 3.4, y + 8.6, 0.4, '#c89838'); inkPath(g, () => { g.beginPath(); g.moveTo(x - 4.4, y + 8.6); g.lineTo(x + 4.4, y + 8.6); g.quadraticCurveTo(x, y + 12.6, x - 4.4, y + 8.6); }, mfill(g, x - 4, y + 8, x + 4, y + 12, MAT.gold), 1); }
      coinAt(g, 5.6, 15.4, 1.6); coinAt(g, 7.8, 15.6, 1.4);
      inkPath(g, () => { g.beginPath(); g.moveTo(25.4, 10.6); g.bezierCurveTo(27.6, 13, 27.4, 15.4, 25.4, 15.6); g.bezierCurveTo(23.4, 15.4, 23.2, 13, 25.4, 10.6); }, '#c0182a', 0.9);
      inkCircle(g, 16, 5, 1.2, mfill(g, 15, 4, 17, 6, MAT.gold));
    },
    lens(g) {
      inkLine(g, 20.6, 20.6, 27, 27, 1.8, '#5a3a20');
      g.strokeStyle = INK; g.lineWidth = 3.6; g.beginPath(); g.arc(13.6, 13.6, 8.4, 0, Math.PI * 2); g.stroke(); g.strokeStyle = mfill(g, 5, 5, 22, 22, MAT.bronze); g.lineWidth = 2.2; g.stroke();
      P.circle(g, 13.6, 13.6, 7.2, P.rg(g, 11, 11, 9, ['rgba(220,240,255,0.55)', 'rgba(90,140,170,0.35)']));
      g.strokeStyle = 'rgba(20,30,40,0.8)'; g.lineWidth = 0.4; g.beginPath(); g.arc(13.6, 13.6, 5, 0, Math.PI * 2); g.stroke();
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; P.circle(g, 13.6 + Math.cos(a) * 4.2, 13.6 + Math.sin(a) * 4.2, 0.3, 'rgba(20,30,40,0.8)'); }
      inkLine(g, 13.6, 13.6, 13.6, 10, 0.4, '#e8dcc0'); inkLine(g, 13.6, 13.6, 16, 14.4, 0.4, '#e8dcc0');
      P.path(g, [8.6, 11, 11, 7.6, 12, 8.4, 9.6, 12]); P.fill(g, 'rgba(255,255,255,0.7)');
    },
    cube(g) {
      P.glow(g, 16, 17, 12, '#ff2040', 0.4);
      sil(g, [16, 5, 26, 10, 16, 15, 6, 10], P.lg(g, 6, 5, 26, 15, ['#8a2a3a', '#4a0a18']), 1.2);
      sil(g, [6, 10, 16, 15, 16, 28, 6, 23], P.lg(g, 6, 0, 16, 0, ['#5a1020', '#2a040c']), 1.2);
      sil(g, [16, 15, 26, 10, 26, 23, 16, 28], P.lg(g, 16, 0, 26, 0, ['#3a0812', '#140206']), 1.2);
      for (const [x, y] of [[9.4, 16.6], [12.4, 18.4]]) { P.glow(g, x, y, 1.8, '#ff4050', 0.9); P.circle(g, x, y, 0.6, '#ffb0b0'); }
      g.strokeStyle = '#ff5060'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(8.6, 21); g.lineTo(10.4, 22.4); g.lineTo(12, 21.6); g.lineTo(13.6, 23); g.stroke();
      for (const [x, y] of [[20.4, 16], [22.6, 20], [19.4, 22.4]]) P.rect(g, x, y, 1.4, 0.5, '#ff3040');
      for (const [x, y] of [[16, 8.4], [12.6, 10], [19.4, 10]]) P.rect(g, x - 0.7, y - 0.3, 1.4, 0.6, 'rgba(255,90,100,0.9)');
    },
    urn(g) {
      ghost(g, 16, 7.4, 3.6, 1, '#a090ff');
      inkPath(g, () => { g.beginPath(); g.moveTo(12, 14); g.lineTo(20, 14); g.lineTo(19.4, 15.6); g.quadraticCurveTo(24.4, 18, 23.4, 23); g.quadraticCurveTo(22, 27.6, 16, 27.8); g.quadraticCurveTo(10, 27.6, 8.6, 23); g.quadraticCurveTo(7.6, 18, 12.6, 15.6); g.closePath(); }, P.lg(g, 8, 14, 24, 28, ['#8a8098', '#4a4058', '#1e1826']), 1.3);
      P.rect(g, 9, 20, 14, 1.2, '#c89838'); P.rect(g, 11.4, 13.4, 9.2, 1.6, mfill(g, 11, 13, 21, 15, MAT.gold));
      P.path(g, [10.4, 17, 13, 16, 12, 24, 10, 23]); P.fill(g, 'rgba(255,255,255,0.12)');
    },
    stone(g) {
      g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(16, 10); g.quadraticCurveTo(14, 6, 9, 5); g.stroke(); g.strokeStyle = '#6a6e7a'; g.lineWidth = 1; g.setLineDash([1.4, 0.8]); g.stroke(); g.setLineDash([]);
      inkPath(g, () => { g.beginPath(); g.moveTo(6, 26); g.lineTo(5, 18); g.lineTo(9, 11.4); g.lineTo(18, 9.4); g.lineTo(25.4, 13); g.lineTo(27.4, 21); g.lineTo(24, 27.4); g.lineTo(12, 28); g.closePath(); }, P.lg(g, 5, 9, 27, 28, ['#a0a0a8', '#5a5a64', '#26262c']), 1.3);
      P.path(g, [6, 18, 9.6, 12, 17.4, 10.4, 14, 15, 7.4, 20]); P.fill(g, 'rgba(255,255,255,0.15)');
      g.strokeStyle = INK; g.lineWidth = 0.5; g.beginPath(); g.moveTo(18, 14); g.lineTo(16.4, 19); g.lineTo(19.6, 23); g.stroke();
      inkPath(g, () => { g.beginPath(); g.rect(13.6, 8.4, 5.4, 3.6); }, mfill(g, 13, 8, 19, 12, MAT.iron), 1);
    },
    scarab(g) {
      inkPath(g, () => { g.beginPath(); g.ellipse(16, 18, 7, 8.4, 0, 0, Math.PI * 2); }, mfill(g, 9, 10, 23, 26, MAT.gold), 1.3);
      for (const s of [-1, 1]) { for (const [y, l] of [[14, 5], [18, 5.6], [22, 4.6]]) inkLine(g, 16 + s * 6.4, y, 16 + s * (6.4 + l), y + 2 * (y < 18 ? -1 : 1), 0.6, MAT.gold[3]); }
      P.line(g, 16, 12, 16, 26, 0.6, INK);
      inkPath(g, () => { g.beginPath(); g.ellipse(16, 10.4, 4, 3, 0, 0, Math.PI * 2); }, mfill(g, 12, 7, 20, 13, MAT.gold), 1);
      for (const s of [-1, 1]) sil(g, [16 + s * 1.4, 8, 16 + s * 4.6, 4, 16 + s * 2.6, 7.4], '#e0e0e8', 0.8);
      for (const x of [14.4, 17.6]) { P.circle(g, x, 10, 0.6, '#ff3040'); }
      gemCut(g, 16, 18.6, 1.6, '#40c0ff');
    },
    edict(g) {
      inkPath(g, () => { g.beginPath(); g.rect(8, 7, 16, 18); }, P.lg(g, 8, 7, 24, 25, ['#f0e2c0', '#c8b088', '#8a7450']), 1.2);
      for (const y of [5, 25]) inkPath(g, () => { g.beginPath(); g.ellipse(16, y + 1, 9.6, 2.2, 0, 0, Math.PI * 2); }, wood(g, 6, y, 26, y + 3), 1);
      for (let i = 0; i < 5; i++) P.line(g, 10.6, 10 + i * 2.2, 21.4 - (i % 2) * 3, 10 + i * 2.2, 0.5, 'rgba(60,40,20,0.7)');
      inkCircle(g, 20, 21, 3, P.vol(g, 20, 21, 3, '#b0101e')); P.path(g, [19, 23.4, 18.2, 27.6, 20, 26.4, 21.6, 27.6, 21, 23.4]); P.fill(g, '#8a0a18');
      P.line(g, 18.6, 21, 21.4, 21, 0.5, '#5a0610'); P.line(g, 20, 19.6, 20, 22.4, 0.5, '#5a0610');
    },
  });
  const dice = (g, x, y, s, body, pip, a) => {
    g.save(); g.translate(x, y); g.rotate(a || 0);
    inkPath(g, () => { P.rrect(g, -s, -s, s * 2, s * 2, s * 0.35); }, P.lg(g, -s, -s, s, s, [sh(body, 0.3), body, sh(body, -0.45)]), 1.2);
    for (const [px, py] of [[-0.5, -0.5], [0.5, -0.5], [0, 0], [-0.5, 0.5], [0.5, 0.5]]) P.circle(g, px * s, py * s, s * 0.17, pip);
    g.restore();
  };
  Object.assign(ART, {
    regret(g) {
      inkPath(g, () => { g.beginPath(); g.moveTo(8, 8); g.quadraticCurveTo(16, 4, 24, 8); g.quadraticCurveTo(25.6, 18, 22, 24); g.quadraticCurveTo(16, 29, 10, 24); g.quadraticCurveTo(6.4, 18, 8, 8); }, P.lg(g, 7, 5, 25, 28, ['#f8f4ee', '#c8c0b8', '#6a6470']), 1.3);
      for (const x of [12, 20]) { inkPath(g, () => { g.beginPath(); g.moveTo(x - 2.6, 14); g.quadraticCurveTo(x, 11.4, x + 2.6, 14); g.quadraticCurveTo(x, 15.4, x - 2.6, 14); }, '#140a10', 0.6); }
      g.strokeStyle = INK; g.lineWidth = 0.9; g.beginPath(); g.moveTo(12, 22.4); g.quadraticCurveTo(16, 19, 20, 22.4); g.stroke();
      P.path(g, [11.4, 15, 12.6, 15, 12.4, 20, 11.8, 20.6, 11.4, 20]); P.fill(g, '#4a7aa0');
      g.strokeStyle = INK; g.lineWidth = 0.5; g.beginPath(); g.moveTo(17, 5.6); g.lineTo(18.4, 9.4); g.lineTo(17, 12); g.lineTo(18.6, 16); g.stroke();
    },
    hunger(g) {
      for (const [x, y, r] of [[12, 24, 1], [19, 26, 1.2], [16, 27.6, 0.8]]) inkCircle(g, x, y, r, '#b0101e');
      inkPath(g, () => { g.beginPath(); g.moveTo(5, 12); g.lineTo(27, 12); g.quadraticCurveTo(26, 22, 16, 22.6); g.quadraticCurveTo(6, 22, 5, 12); }, P.lg(g, 5, 12, 27, 22, ['#b8b0a0', '#6a6258', '#2a2620']), 1.3);
      P.ell(g, 16, 12, 11, 2.4, INK); P.ell(g, 16, 12.2, 10.2, 1.8, '#1a120c');
      g.strokeStyle = INK; g.lineWidth = 0.7; g.beginPath(); g.moveTo(18, 13); g.lineTo(16.4, 17); g.lineTo(18.6, 20.4); g.stroke();
      inkLine(g, 21, 11.4, 27, 4.4, 0.8, '#a8a8b0'); inkPath(g, () => { g.beginPath(); g.ellipse(27.4, 4, 1.6, 1, -0.8, 0, Math.PI * 2); }, '#c8c8d0', 0.8);
      for (const [x, y] of [[10, 7], [13, 5.6]]) { P.ell(g, x, y, 0.8, 0.5, INK); P.ell(g, x - 0.6, y - 0.6, 0.6, 0.3, 'rgba(200,220,255,0.5)'); }
    },
    odice(g) { P.glow(g, 16, 18, 10, '#8060a0', 0.3); dice(g, 11.4, 19, 5.6, '#3a3444', '#f0e8ff', -0.25); dice(g, 21, 13, 4.6, '#2a2432', '#f0e8ff', 0.3); },
    veil(g) {
      inkPath(g, () => { g.beginPath(); g.rect(8.4, 12.6, 15.2, 13.4); }, P.lg(g, 8, 12, 24, 26, ['#5a5a80', '#2a2a44']), 1.2);
      P.rect(g, 8.8, 23.8, 14.4, 1.8, '#e8dcc0'); inkCircle(g, 16, 18.4, 2.4, mfill(g, 13, 16, 19, 21, MAT.silver));
      g.beginPath(); g.moveTo(5, 28); g.quadraticCurveTo(6, 10, 16, 4.4); g.quadraticCurveTo(26, 10, 27, 28); g.quadraticCurveTo(22, 24, 19, 28.4); g.quadraticCurveTo(16, 25, 13, 28.4); g.quadraticCurveTo(10, 24, 5, 28); P.fill(g, 'rgba(220,225,245,0.42)');
      g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 0.5; for (const x of [11, 16, 21]) { g.beginPath(); g.moveTo(16 + (x - 16) * 0.3, 6); g.quadraticCurveTo(x, 16, x + (x - 16) * 0.2, 27); g.stroke(); }
    },
    vice(g) {
      P.glow(g, 16, 17, 11, '#a01020', 0.45);
      inkPath(g, () => { g.beginPath(); g.moveTo(16, 27); g.bezierCurveTo(5, 19, 6, 8.6, 11.4, 9); g.quadraticCurveTo(14.4, 9, 16, 12.4); g.quadraticCurveTo(17.6, 9, 20.6, 9); g.bezierCurveTo(26, 8.6, 27, 19, 16, 27); }, P.rg(g, 13, 13, 13, ['#8a2a3a', '#4a0a18', '#140206']), 1.3);
      g.strokeStyle = 'rgba(10,0,4,0.9)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(10, 13); g.quadraticCurveTo(13, 16, 12, 20); g.moveTo(21, 12); g.quadraticCurveTo(18.6, 16, 20, 21); g.moveTo(16, 14); g.lineTo(15.4, 22); g.stroke();
      inkLine(g, 24, 5, 13, 19, 0.9, DARKSTEEL[1]); inkCircle(g, 24.6, 4.4, 1.6, mfill(g, 23, 3, 26, 6, MAT.iron));
      for (const [x, l] of [[12.4, 3], [14, 5]]) { P.path(g, [x - 0.6, 20, x + 0.6, 20, x, 20 + l]); P.fill(g, '#c0182a'); }
    },
    silver(g) {
      inkCircle(g, 16, 16, 10, P.rg(g, 13, 12, 13, ['#e8ecf2', '#9aa0aa', '#4a4e56']));
      for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; P.circle(g, 16 + Math.cos(a) * 8.8, 16 + Math.sin(a) * 8.8, 0.4, '#5a5e66'); }
      skullAt(g, 16, 14.4, 4, null);
      for (const [x, y, r] of [[10.4, 19, 2.6], [21, 11, 2], [19, 22, 1.8], [11, 11, 1.4]]) P.ell(g, x, y, r, r * 0.7, 'rgba(40,50,30,0.55)');
    },
    apocrypha(g) {
      inkPath(g, () => { g.beginPath(); g.rect(7.4, 5, 17.2, 22.4); }, P.lg(g, 7, 5, 25, 27, ['#5a2a4a', '#2a0a1e']), 1.3);
      P.rect(g, 7.4, 5, 2.4, 22.4, 'rgba(0,0,0,0.4)'); P.rect(g, 24.6, 6, 1.4, 20.4, '#e8dcc0');
      skullAt(g, 16.6, 13.6, 4.2, '#d070ff');
      inkLine(g, 5, 20, 27, 22, 0.8, '#6a6e7a'); inkPath(g, () => { g.beginPath(); g.rect(14.6, 18.6, 4.4, 4.4); }, mfill(g, 14, 18, 19, 23, MAT.iron), 1);
      P.circle(g, 16.8, 20.8, 0.6, INK);
    },
    dagger(g) {
      g.save(); g.translate(15, 17); g.rotate(-0.78);
      sil(g, [-2, -2, -2, -12, 0, -15, 2, -12, 2, -2], P.lg(g, -2, 0, 2, 0, ['#ffffff', '#aab2c0', '#555b6a']), 1.2);
      P.line(g, 0, -13, 0, -3, 0.4, 'rgba(60,70,90,0.8)');
      sil(g, [-0.8, -2, 0.8, -2, 0.8, 9, -0.8, 9], '#5a5e66', 1);
      g.restore();
      for (const [x, y, l] of [[18, 22, 3], [20.4, 20, 2.4]]) { P.path(g, [x - 0.7, y, x + 0.7, y, x, y + l]); P.fill(g, '#c0182a'); }
      P.line(g, 16, 18.6, 21, 20.4, 0.7, '#a01020');
    },
    cuff(g) {
      g.strokeStyle = INK; g.lineWidth = 5.4; g.beginPath(); g.ellipse(13.4, 18.6, 7, 6, 0, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = mfill(g, 6, 12, 20, 25, MAT.iron); g.lineWidth = 3.8; g.stroke();
      for (const a of [0.8, 2.4, 4, 5.4]) rivet(g, 13.4 + Math.cos(a) * 7, 18.6 + Math.sin(a) * 6, 0.7, MAT.iron);
      for (let i = 0; i < 4; i++) { const x = 20 + i * 2, y = 14 - i * 2.2; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, y, 1.2, 0.8, -0.8, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#8a8e9a'; g.lineWidth = 0.7; g.stroke(); }
      sil(g, [26.4, 5, 27.6, 6.6, 26, 7.4, 25.4, 6], '#8a8e9a', 0.8);
      for (const [x, y] of [[9, 14], [8, 21]]) P.ell(g, x, y, 1.2, 0.6, 'rgba(140,60,20,0.7)');
    },
    targe(g) {
      inkCircle(g, 16, 16, 10.6, P.rg(g, 13, 13, 13, ['#a07048', '#6a4424', '#2a1608']));
      g.strokeStyle = mfill(g, 5, 5, 27, 27, MAT.iron); g.lineWidth = 1.6; g.beginPath(); g.arc(16, 16, 9.6, 0, Math.PI * 2); g.stroke();
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; rivet(g, 16 + Math.cos(a) * 9.6, 16 + Math.sin(a) * 9.6, 0.7, MAT.iron); }
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; P.line(g, 16 + Math.cos(a) * 3.6, 16 + Math.sin(a) * 3.6, 16 + Math.cos(a) * 8.4, 16 + Math.sin(a) * 8.4, 1, MAT.iron[2]); }
      inkCircle(g, 16, 16, 3.4, P.vol(g, 16, 16, 3.4, '#8a92a4')); sil(g, [14.8, 15.6, 16, 10.4, 17.2, 15.6], DARKSTEEL[1], 0.8);
      g.strokeStyle = INK; g.lineWidth = 0.5; g.beginPath(); g.moveTo(8, 12); g.lineTo(11, 15); g.moveTo(21, 22); g.lineTo(23, 19); g.stroke();
    },
    incubator(g) {
      inkPath(g, () => { g.beginPath(); g.rect(9.6, 4.6, 12.8, 3.4); }, mfill(g, 9, 4, 23, 8, MAT.bronze), 1);
      inkPath(g, () => { g.beginPath(); g.moveTo(10.4, 8); g.lineTo(21.6, 8); g.quadraticCurveTo(25.4, 14, 24.6, 22); g.quadraticCurveTo(23, 27.6, 16, 27.6); g.quadraticCurveTo(9, 27.6, 7.4, 22); g.quadraticCurveTo(6.6, 14, 10.4, 8); }, 'rgba(200,230,210,0.35)', 1.2);
      P.glow(g, 16, 19, 8, '#70e060', 0.7);
      g.save(); g.beginPath(); g.rect(7, 13, 18, 15); g.clip(); P.circle(g, 16, 22, 8.4, 'rgba(90,170,60,0.55)'); g.restore();
      inkPath(g, () => { g.beginPath(); g.arc(16, 19.4, 3.6, 0.4, Math.PI * 1.9); g.quadraticCurveTo(15, 19, 16.6, 20.6); }, P.rg(g, 15, 18, 5, ['#e0ffb0', '#70b040', '#2a5a14']), 0.9);
      P.circle(g, 17, 18, 0.8, INK);
      for (const [x, y, r] of [[11, 14, 1], [20.6, 12.4, 0.8], [13, 11, 0.6]]) P.circle(g, x, y, r, 'rgba(180,255,150,0.8)');
      P.line(g, 11, 10, 10, 20, 0.6, 'rgba(255,255,255,0.5)');
    },
    root(g) {
      inkCircle(g, 16, 13, 4, P.rg(g, 15, 12, 5, ['#ffb0ff', '#c050d0', '#4a0a5a'])); P.glow(g, 16, 13, 6, '#e080ff', 0.5);
      g.lineCap = 'round';
      for (const [pts, w] of [[[16, 28, 13, 24, 10.4, 18, 11, 12, 15, 8.4], 2.2], [[16, 28, 19.6, 23, 22, 17, 21, 11, 17, 8.6], 2], [[16, 28, 16.4, 22, 13.6, 17.4, 18.6, 14.6], 1.2]]) {
        g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
        g.strokeStyle = INK; g.lineWidth = w + 1.2; g.stroke(); g.strokeStyle = wood(g, 8, 8, 24, 28); g.lineWidth = w; g.stroke();
      }
      for (const [x, s] of [[9, -1], [23, 1], [13, -1], [19.4, 1]]) { g.strokeStyle = '#3a2410'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(16, 28); g.quadraticCurveTo(x, 28, x + s * 3, 29.4); g.stroke(); }
    },
    accolade(g) {
      sil(g, [11, 3.6, 15, 3.6, 16, 12, 12.4, 11], P.lg(g, 11, 0, 16, 0, ['#d0283a', '#6a0a14']), 1); sil(g, [21, 3.6, 17, 3.6, 16, 12, 19.6, 11], P.lg(g, 16, 0, 21, 0, ['#a01020', '#4a0610']), 1);
      const pts = []; for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + i * Math.PI / 8, r = i % 2 ? 6.6 : 9; pts.push(16 + Math.cos(a) * r, 19 + Math.sin(a) * r); }
      sil(g, pts, mfill(g, 7, 10, 25, 28, MAT.gold), 1.2);
      inkCircle(g, 16, 19, 4, P.rg(g, 15, 18, 5, ['#ff8090', '#c01020', '#4a0610'])); P.circle(g, 14.8, 17.8, 0.8, '#ffffff');
      for (const [x, y, l] of [[12, 26, 2.6], [20.4, 25.4, 3.4]]) { P.path(g, [x - 0.7, y, x + 0.7, y, x, y + l]); P.fill(g, '#c0182a'); }
    },
    giants(g) {
      inkPath(g, () => { g.beginPath(); g.rect(10, 4, 12, 24.4); }, wood(g, 10, 0, 22, 0), 1.3);
      for (const s of [-1, 1]) sil(g, [16 + s * 6, 7, 16 + s * 11, 4.4, 16 + s * 10, 9, 16 + s * 6, 11], wood(g, 5, 4, 27, 11), 1);
      for (const y of [11.6, 20.4]) P.rect(g, 10, y, 12, 1, INK);
      for (const x of [13.4, 18.6]) { P.rect(g, x - 1.6, 6.6, 3.2, 2.4, INK); P.glow(g, x, 7.8, 2.2, '#ffa040', 0.8); P.rect(g, x - 0.8, 7.2, 1.6, 1.2, '#ffd080'); }
      P.rect(g, 12.6, 9.4, 6.8, 1.6, INK); for (let i = 0; i < 3; i++) P.rect(g, 13.2 + i * 2.2, 9.4, 1.2, 0.8, '#e8dcc0');
      for (const x of [13.4, 18.6]) { P.circle(g, x, 15, 1.1, INK); } P.rect(g, 13, 17.6, 6, 1.2, INK);
      P.rect(g, 10.4, 4, 2, 24, 'rgba(255,255,255,0.1)');
    },
    goblet(g) {
      inkPath(g, () => { g.beginPath(); g.moveTo(8, 5.4); g.lineTo(24, 5.4); g.quadraticCurveTo(23.4, 13.4, 17.6, 15.6); g.lineTo(14.4, 15.6); g.quadraticCurveTo(8.6, 13.4, 8, 5.4); }, P.lg(g, 8, 5, 24, 16, ['rgba(240,240,250,0.8)', 'rgba(160,160,180,0.55)']), 1.2);
      g.save(); g.beginPath(); g.moveTo(8, 5.4); g.lineTo(24, 5.4); g.quadraticCurveTo(23.4, 13.4, 17.6, 15.6); g.lineTo(14.4, 15.6); g.quadraticCurveTo(8.6, 13.4, 8, 5.4); g.clip(); P.rect(g, 6, 7, 20, 10, P.lg(g, 0, 7, 0, 16, ['#c02040', '#5a0618'])); g.restore();
      for (const [x, l] of [[8.6, 12], [23.4, 9]]) { g.beginPath(); g.moveTo(x - 1.4, 5.6); g.quadraticCurveTo(x - 0.4, 5.6 + l * 0.6, x, 5.6 + l); g.quadraticCurveTo(x + 0.6, 5.6 + l * 0.6, x + 1.4, 5.6); P.fill(g, '#a01030'); }
      P.ell(g, 16, 5.6, 8.4, 1.8, '#d02848');
      sil(g, [15, 15.4, 17, 15.4, 16.6, 23, 15.4, 23], 'rgba(200,200,215,0.9)', 0.9);
      inkPath(g, () => { g.beginPath(); g.ellipse(16, 24.6, 6, 2, 0, 0, Math.PI * 2); }, 'rgba(210,210,225,0.9)', 1);
      P.ell(g, 22, 27, 3, 0.9, '#a01030');
    },
    commit(g) {
      g.strokeStyle = INK; g.lineWidth = 3.2; g.beginPath(); g.arc(16, 13, 5.4, Math.PI, 0); g.lineTo(21.4, 16); g.moveTo(10.6, 13); g.lineTo(10.6, 16); g.stroke();
      g.strokeStyle = mfill(g, 10, 7, 22, 16, DARKSTEEL); g.lineWidth = 2; g.stroke();
      inkPath(g, () => { P.rrect(g, 8.4, 15.4, 15.2, 12, 2); }, mfill(g, 8, 15, 24, 28, MAT.iron), 1.3);
      inkPath(g, () => { g.beginPath(); g.arc(16, 20.4, 1.6, 0, Math.PI * 2); g.moveTo(15.4, 21.4); g.lineTo(16.6, 21.4); g.lineTo(17, 24.6); g.lineTo(15, 24.6); g.closePath(); }, '#0a0608', 0.4);
      for (let i = 0; i < 5; i++) { const x = 3.6 + i * 2.2, y = 25 - i * 1.4; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, y, 1.1, 0.7, -0.6, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#8a4a6a'; g.lineWidth = 0.7; g.stroke(); }
      P.glow(g, 16, 21, 5, '#c040a0', 0.4);
    },
    idice(g) { dice(g, 11.4, 19, 5.6, '#e8e0cc', '#a01020', -0.25); dice(g, 21, 13, 4.6, '#dcd2bc', '#a01020', 0.3); g.strokeStyle = 'rgba(80,60,30,0.5)'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(8, 16); g.lineTo(10, 18.4); g.stroke(); },
  });
  Object.assign(ART, {
    edge(g) {
      g.save(); g.translate(14, 18.6); g.rotate(-0.78);
      sil(g, [-1.8, 3, -1.8, -12, 0, -15, 1.8, -12, 1.8, 3], P.lg(g, -1.8, 0, 1.8, 0, ['#ffffff', '#b8c0d0', '#555b6a']), 1.2);
      P.line(g, 1.4, -13, 1.4, 2, 0.5, '#ffffff');
      inkLine(g, -4.4, 3.4, 4.4, 3.4, 1.2, '#8a3020'); inkLine(g, 0, 4.4, 0, 9, 1.3, '#2a1208'); inkCircle(g, 0, 9.8, 1.2, P.vol(g, 0, 9.8, 1.2, '#c03020'));
      g.restore();
      glint(g, 22, 8.4, 3.4, '#fff4d0'); P.glow(g, 22, 8.4, 5, '#ffd070', 0.5);
    },
    ulcer(g) {
      P.glow(g, 16, 18, 10, '#80a030', 0.35);
      inkPath(g, () => { g.beginPath(); g.moveTo(6, 26); g.quadraticCurveTo(5, 16, 11, 11); g.quadraticCurveTo(16, 6, 21.6, 10.6); g.quadraticCurveTo(27.6, 16, 26, 26); g.quadraticCurveTo(16, 28.6, 6, 26); }, P.rg(g, 13, 13, 16, ['#4a4a3a', '#1a1a14', '#060604']), 1.3);
      for (const [x, y, r] of [[12, 16, 2.6], [19.4, 14.6, 2], [17, 21, 3], [10.4, 22, 1.6]]) { inkCircle(g, x, y, r, P.rg(g, x - r * 0.3, y - r * 0.3, r, ['#e8f090', '#90a030', '#3a4a10'])); P.circle(g, x - r * 0.35, y - r * 0.35, r * 0.25, 'rgba(255,255,220,0.8)'); }
      for (const [x, l] of [[21.4, 4], [9, 3]]) { P.path(g, [x - 0.8, 26, x + 0.8, 26, x, 26 + l]); P.fill(g, '#a0b030'); }
    },
    leash(g) {
      g.strokeStyle = INK; g.lineWidth = 4.6; g.beginPath(); g.ellipse(12, 20, 7, 5, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = mfill(g, 5, 15, 19, 25, MAT.leather); g.lineWidth = 3.2; g.stroke();
      for (const a of [3.6, 4.4, 5.2, 0.4, 1.4]) sil(g, [12 + Math.cos(a) * 7.6, 20 + Math.sin(a) * 5.6, 12 + Math.cos(a) * 10.4, 20 + Math.sin(a) * 7.8, 12 + Math.cos(a + 0.2) * 7.6, 20 + Math.sin(a + 0.2) * 5.6], DARKSTEEL[1], 0.6);
      for (let i = 0; i < 5; i++) { const x = 19.4 + i * 1.8, y = 16.4 - i * 2.4; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, y, 1.1, 0.7, -0.9, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#6a7a5a'; g.lineWidth = 0.7; g.stroke(); }
      for (const [x, y] of [[7, 17], [15, 24], [26, 7]]) P.ell(g, x, y, 1.6, 0.8, '#5a7a2a');
    },
    curtain(g) {
      inkLine(g, 5, 5, 27, 5, 1.2, '#c89838');
      for (const [x0, x1, s] of [[5.4, 15.4, 1], [16.6, 26.6, -1]]) {
        inkPath(g, () => { g.beginPath(); g.moveTo(x0, 5.6); g.lineTo(x1, 5.6); g.quadraticCurveTo(x1 - s * 4, 16, s > 0 ? x0 + 3 : x1 - 3, 27.6); g.lineTo(s > 0 ? x0 : x1, 27.6); g.closePath(); }, P.lg(g, x0, 0, x1, 0, ['#c02838', '#6a0a18', '#2a0408']), 1.2);
        g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 0.6; for (const k of [0.3, 0.6]) { const x = x0 + (x1 - x0) * k; g.beginPath(); g.moveTo(x, 6); g.quadraticCurveTo(x - s, 16, x - s * 3 * k, 27); g.stroke(); }
      }
      g.strokeStyle = INK; g.lineWidth = 0.7; g.beginPath(); g.moveTo(9, 14); g.lineTo(11, 18); g.lineTo(9.6, 22); g.moveTo(22, 11); g.lineTo(20.6, 15); g.stroke();
      P.path(g, [10, 14.4, 11.4, 17.6, 10.2, 21.4, 9.4, 17]); P.fill(g, '#140206');
      for (const x of [14.4, 17.6]) { P.glow(g, x, 16, 1.6, '#ffe070', 0.8); P.circle(g, x, 16, 0.5, '#fff0b0'); }
    },
    flute(g) {
      for (const [x, y] of [[23, 7], [26, 12]]) { inkCircle(g, x, y + 2, 1.1, '#e8f4ff'); inkLine(g, x + 1, y + 2, x + 1, y - 2, 0.4, '#e8f4ff'); }
      g.save(); g.translate(14, 17); g.rotate(-0.7);
      inkPath(g, () => { P.rrect(g, -12, -1.8, 24, 3.6, 1.6); }, P.lg(g, 0, -1.8, 0, 1.8, ['#f4ecd8', '#c8bc9a', '#7a6e52']), 1.2);
      for (const x of [-6, -2.4, 1.2, 4.8]) P.circle(g, x, -0.2, 0.7, INK);
      P.circle(g, -9.4, -0.2, 0.9, INK); P.ell(g, 11, 0, 1.4, 2.2, P.lg(g, 0, -2, 0, 2, ['#e8dcc0', '#8a7e62']));
      g.restore();
      g.strokeStyle = 'rgba(120,220,255,0.6)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(22, 20); g.quadraticCurveTo(25, 22, 24, 26); g.moveTo(24.4, 17.6); g.quadraticCurveTo(28, 20, 27, 25); g.stroke();
    },
    drums(g) { g.save(); g.translate(16, 17); g.scale(0.9, 0.9); g.translate(-16, -16); ABI.wardrum(g); g.restore(); },
    plate(g) {
      cuirass(g, MAT.gold, { trim: '#fff6c8' });
      for (const [x, y] of [[12, 13], [20, 13], [16, 18], [12, 22], [20, 22]]) coinAt(g, x, y, 1.8);
    },
    pendulum(g) {
      g.strokeStyle = 'rgba(180,255,200,0.4)'; g.lineWidth = 1; g.beginPath(); g.arc(16, 5, 19, Math.PI * 0.3, Math.PI * 0.7); g.stroke();
      inkLine(g, 7, 5, 25, 5, 1.2, '#6a4424'); inkCircle(g, 16, 5, 1.2, mfill(g, 15, 4, 17, 6, MAT.gold));
      inkLine(g, 16, 5, 20.6, 20, 0.5, '#c89838');
      P.glow(g, 21.4, 22, 6, '#60e080', 0.6);
      inkPath(g, () => { g.beginPath(); g.moveTo(21.4, 17.6); g.lineTo(25, 22); g.lineTo(21.4, 28); g.lineTo(17.8, 22); g.closePath(); }, P.lg(g, 18, 18, 25, 28, ['#c0ffd0', '#40b060', '#0e4a20']), 1.1);
      P.path(g, [21.4, 17.6, 25, 22, 21.4, 22]); P.fill(g, 'rgba(255,255,255,0.3)');
      for (const [x, a] of [[13.6, 0.4], [9.6, 0.2]]) { g.strokeStyle = 'rgba(160,255,190,' + a + ')'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(16, 5); g.lineTo(x, 20); g.stroke(); }
    },
    glass(g) {
      P.glow(g, 16, 16, 11, '#80b0ff', 0.35);
      for (const a of [-0.78, 0.78]) { g.save(); g.translate(16, 16); g.rotate(a);
        inkPath(g, () => { g.beginPath(); g.rect(-1.2, -9, 2.4, 18); }, 'rgba(210,235,255,0.55)', 1);
        for (const y of [-9.6, 9.6]) for (const d of [-1.4, 1.4]) inkCircle(g, d, y, 1.7, 'rgba(220,240,255,0.7)');
        P.line(g, -0.4, -8, -0.4, 8, 0.4, 'rgba(255,255,255,0.8)');
        g.restore(); }
      g.strokeStyle = INK; g.lineWidth = 0.5; g.beginPath(); g.moveTo(12, 9); g.lineTo(13.4, 11.4); g.lineTo(12.4, 13); g.moveTo(20.6, 19); g.lineTo(19, 21); g.stroke();
    },
    tinder(g) {
      for (const [x, y, c, r] of [[9, 8, '#ff6a30', 4], [22, 6.6, '#ffd040', 3.4], [16, 4.4, '#ff3060', 2.6]]) { P.glow(g, x, y, r * 1.4, c, 0.7); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; P.line(g, x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3, x + Math.cos(a) * r, y + Math.sin(a) * r, 0.6, c); } P.circle(g, x, y, 0.7, '#ffffff'); }
      inkPath(g, () => { g.beginPath(); g.rect(8, 17, 16, 10.4); }, wood(g, 8, 0, 24, 0), 1.3);
      inkPath(g, () => { g.beginPath(); g.moveTo(7.4, 17); g.lineTo(24.6, 17); g.lineTo(22, 13.4); g.lineTo(10, 13.4); g.closePath(); }, P.lg(g, 0, 13, 0, 17, ['#8a5a30', '#4a2c14']), 1.1);
      P.rect(g, 8, 20.6, 16, 1, '#c89838'); P.rect(g, 14.6, 20, 2.8, 2.4, mfill(g, 14, 20, 18, 23, MAT.bronze));
      for (const [x, y] of [[12, 11], [19, 10.4], [15.4, 12]]) P.circle(g, x, y, 0.5, '#ffd070');
    },
    suppressor(g) {
      skullAt(g, 16, 14, 7, '#e060ff');
      g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.moveTo(8, 17.6); g.lineTo(24, 17.6); g.moveTo(9, 11); g.lineTo(23, 11); g.stroke();
      g.strokeStyle = mfill(g, 8, 10, 24, 18, MAT.iron); g.lineWidth = 1.6; g.beginPath(); g.moveTo(8, 17.6); g.lineTo(24, 17.6); g.moveTo(9, 11); g.lineTo(23, 11); g.stroke();
      for (const x of [9, 23]) { inkLine(g, x, 9, x, 21, 1, MAT.iron[1]); rivet(g, x, 11, 0.7, MAT.iron); rivet(g, x, 17.6, 0.7, MAT.iron); }
      inkPath(g, () => { g.beginPath(); g.rect(14, 20.4, 4, 4.4); }, mfill(g, 14, 20, 18, 25, MAT.iron), 1); P.circle(g, 16, 22.2, 0.6, INK);
    },
  });

  /* ---------- chest icons: the same chests that stand in the halls, drawn large ---------- */
  function chest3(g, body, band, glow, o) {
    o = o || {};
    g.save(); g.translate(2, 4.6); g.scale(2, 2);
    P.ell(g, 7, 11.6, 6.6, 0.9, 'rgba(0,0,0,0.5)');
    if (glow) P.glow(g, 7, 5.6, 8, glow, 0.35);
    g.beginPath(); g.moveTo(1, 11.4); g.lineTo(1, 5.4); g.quadraticCurveTo(1, 0.6, 7, 0.6); g.quadraticCurveTo(13, 0.6, 13, 5.4); g.lineTo(13, 11.4); g.closePath();
    g.strokeStyle = INK; g.lineWidth = 0.7; g.stroke();
    P.rrect(g, 1, 5.2, 12, 6.2, 0.6, P.lg(g, 0, 5, 0, 11.4, [sh(body, 0.2), body, sh(body, -0.45)]));
    g.strokeStyle = G.rgba(sh(body, -0.6), 0.9); g.lineWidth = 0.3; for (const y of [7.2, 9.2]) { g.beginPath(); g.moveTo(1.2, y); g.lineTo(12.8, y); g.stroke(); }
    g.strokeStyle = G.rgba(sh(body, 0.4), 0.35); g.lineWidth = 0.2; for (const y of [7.5, 9.5]) { g.beginPath(); g.moveTo(1.4, y); g.lineTo(12.6, y); g.stroke(); }
    g.beginPath(); g.moveTo(1, 5.4); g.quadraticCurveTo(1, 0.6, 7, 0.6); g.quadraticCurveTo(13, 0.6, 13, 5.4); g.closePath(); P.fill(g, P.lg(g, 0, 0.6, 0, 5.4, [sh(body, 0.5), body, sh(body, -0.15)]));
    g.strokeStyle = G.rgba(sh(body, -0.5), 0.8); g.lineWidth = 0.3; for (const x of [4.6, 9.4]) { g.beginPath(); g.moveTo(x, 0.9); g.quadraticCurveTo(x + (x < 7 ? -0.6 : 0.6), 3, x + (x < 7 ? -0.8 : 0.8), 5.2); g.stroke(); }
    P.path(g, [1.6, 5, 2.4, 2, 5, 1, 3.4, 3, 2.6, 5]); P.fill(g, 'rgba(255,255,255,0.14)');
    for (const x of [2.8, 11.2]) {
      g.beginPath(); g.moveTo(x - 0.7, 1.2); g.quadraticCurveTo(x - 0.9, 0.9, x, 0.8); g.lineTo(x + 0.7, 1.1); g.lineTo(x + 0.7, 11.4); g.lineTo(x - 0.7, 11.4); g.closePath();
      g.strokeStyle = G.rgba(INK, 0.8); g.lineWidth = 0.25; g.stroke(); P.fill(g, P.lg(g, x - 0.7, 0, x + 0.7, 0, [sh(band, 0.45), band, sh(band, -0.4)]));
      for (const y of [3, 8, 10.4]) { P.circle(g, x, y, 0.3, sh(band, -0.5)); P.circle(g, x - 0.08, y - 0.08, 0.18, sh(band, 0.6)); }
    }
    P.rrect(g, 1, 4.9, 12, 0.9, 0.3, P.lg(g, 0, 4.9, 0, 5.8, [sh(band, 0.3), sh(band, -0.3)]));
    for (const [x, y] of [[0.8, 9.8], [11.6, 9.8]]) P.rrect(g, x, y, 1.6, 1.6, 0.3, P.lg(g, x, y, x + 1.6, y + 1.6, [sh(band, 0.3), sh(band, -0.3)]));
    if (glow) { P.line(g, 1.4, 5.35, 12.6, 5.35, 0.3, G.rgba(glow, 0.9)); P.glow(g, 7, 5.3, 4, glow, 0.4); }
    if (o.lock) o.lock(); else {
      P.rrect(g, 5.5, 4.3, 3, 3.4, 0.5, INK); P.rrect(g, 5.7, 4.5, 2.6, 3, 0.4, P.lg(g, 5.6, 4.4, 8.4, 7.6, [sh(band, 0.55), band, sh(band, -0.4)]));
      P.circle(g, 7, 5.7, 0.45, '#140a08'); P.rect(g, 6.8, 5.8, 0.4, 0.9, '#140a08');
    }
    if (o.runes) for (const [x, y] of [[4.2, 8.2], [9.8, 8.2]]) { P.glow(g, x, y, 1.6, glow, 0.6); P.circle(g, x, y, 0.45, G.rgba(glow, 0.95)); }
    g.restore();
  }
  const CHEST = {
    c_wood(g) { chest3(g, '#6a4222', '#7a808a', null); },
    c_silver(g) { chest3(g, '#243048', '#dfe6f2', '#90d0ff', { runes: true }); },
    c_gold(g) { chest3(g, '#4a2a14', '#ffd35a', '#ffe070'); glint(g, 24.4, 8.6, 1.8, '#fff8d0'); glint(g, 8, 13, 1.2, '#fff8d0'); },
    c_red(g) { chest3(g, '#6a1420', '#c8ccd8', '#ff3040', { lock: () => { skullAt(g, 7, 5.9, 1.7, '#ff3040'); } }); },
  };


  /* ---------- currencies, navigation, tomes, potions and UI marks, redrawn with ink ---------- */
  const flask = (g, col, shape) => {
    P.glow(g, 16, 20, 12, col, 0.45);
    inkPath(g, () => { g.beginPath(); g.rect(13, 3, 6, 3.6); }, wood(g, 13, 0, 19, 0), 1);
    if (shape === 'tall') inkPath(g, () => { g.beginPath(); g.moveTo(13.6, 6.4); g.lineTo(18.4, 6.4); g.lineTo(18.4, 11); g.lineTo(23.4, 26); g.quadraticCurveTo(23.4, 28.4, 21, 28.4); g.lineTo(11, 28.4); g.quadraticCurveTo(8.6, 28.4, 8.6, 26); g.lineTo(13.6, 11); g.closePath(); }, 'rgba(210,230,245,0.5)', 1.2);
    else if (shape === 'square') inkPath(g, () => { g.beginPath(); g.moveTo(13.6, 6.4); g.lineTo(18.4, 6.4); g.lineTo(18.4, 10); g.lineTo(24, 12); g.lineTo(24, 28); g.lineTo(8, 28); g.lineTo(8, 12); g.lineTo(13.6, 10); g.closePath(); }, 'rgba(210,230,245,0.5)', 1.2);
    else { inkPath(g, () => { g.beginPath(); g.rect(13.6, 6.4, 4.8, 5); }, 'rgba(210,230,245,0.55)', 1); inkCircle(g, 16, 20, 8.6, 'rgba(210,230,245,0.5)'); }
    g.save(); g.beginPath(); if (shape === 'tall') { g.moveTo(11.6, 17); g.lineTo(20.4, 17); g.lineTo(23, 26); g.lineTo(9, 26); } else if (shape === 'square') g.rect(8.6, 16, 14.8, 11.4); else g.arc(16, 20, 8, 0, Math.PI * 2); g.clip();
    P.rect(g, 6, shape ? 16.4 : 18, 20, 12, P.lg(g, 0, 16, 0, 28, [sh(col, 0.5), col, sh(col, -0.55)])); g.restore();
    for (const [x, y, r] of [[13, 23, 1.2], [18.6, 25, 0.9], [16, 21, 0.7]]) P.circle(g, x, y, r, 'rgba(255,255,255,0.7)');
    P.line(g, 11, 15, 11.4, 24, 0.7, 'rgba(255,255,255,0.6)');
  };
  const tome = (g, cover, emblem) => {
    inkPath(g, () => { g.beginPath(); g.rect(6.4, 5, 19.2, 23); }, P.lg(g, 6, 5, 26, 28, [sh(cover, 0.3), cover, sh(cover, -0.5)]), 1.3);
    P.rect(g, 6.4, 5, 3, 23, 'rgba(0,0,0,0.35)'); P.rect(g, 25.6, 6, 1.6, 21, '#e8dcc0'); P.line(g, 25.6, 8, 27.2, 8, 0.3, '#8a7a5a');
    for (const [x, y] of [[10.4, 6.4], [23.2, 6.4], [10.4, 24.8], [23.2, 24.8]]) { P.path(g, [x - 1.4, y - 1.4, x + 1.4, y - 1.4, x, y + 1.4]); P.fill(g, MAT.gold[1]); }
    emblem();
  };
  /** A proper skull, front view, in a 32 box scaled by s about (x, y): cranium, brow, deep sockets, nose, cheekbones, teeth and a jaw. */
  function skull2(g, x, y, s, eye, o) {
    o = o || {};
    g.save(); g.translate(x, y); g.scale(s, s); g.translate(-16, -16);
    const bone = P.lg(g, 7, 5, 25, 28, ['#f6eed8', '#cfc4a4', '#8a7e62', '#4a4232']);
    inkPath(g, () => { g.beginPath(); g.moveTo(10.2, 24.4); g.lineTo(21.8, 24.4); g.lineTo(21.2, 27.6); g.quadraticCurveTo(16, 30, 10.8, 27.6); g.closePath(); }, bone, 1.1); // the jaw
    inkPath(g, () => { g.beginPath(); g.moveTo(6.8, 14.4); g.bezierCurveTo(5.8, 3.6, 26.2, 3.6, 25.2, 14.4); g.lineTo(24.8, 17.4); g.quadraticCurveTo(24.2, 19.8, 22.2, 20.6); g.lineTo(21.4, 24); g.lineTo(10.6, 24); g.lineTo(9.8, 20.6); g.quadraticCurveTo(7.8, 19.8, 7.2, 17.4); g.closePath(); }, bone, 1.3);
    P.ell(g, 7.8, 15.4, 1.3, 2.6, 'rgba(60,50,30,0.45)'); P.ell(g, 24.2, 15.4, 1.3, 2.6, 'rgba(40,30,20,0.6)'); // temples
    P.path(g, [9, 7.4, 13, 5.2, 16, 5, 12, 7.2, 9.6, 10]); P.fill(g, 'rgba(255,255,255,0.35)');
    for (const m of [1, -1]) { // the sockets, deep and slanted into a scowl
      const X = (v) => 16 + m * (v - 16);
      g.beginPath(); g.moveTo(X(8.8), 13.2); g.quadraticCurveTo(X(11), 11.2, X(14.8), 13.4); g.quadraticCurveTo(X(15), 17.4, X(12.6), 18); g.quadraticCurveTo(X(9.4), 17.8, X(8.8), 13.2); g.closePath();
      P.fill(g, P.rg(g, X(12), 15.4, 3.6, ['#05030a', '#140a0c', '#3a2c20'])); g.strokeStyle = 'rgba(255,245,220,0.35)'; g.lineWidth = 0.4; g.stroke();
      if (eye) { P.glow(g, X(12.2), 15.4, 3, eye, 0.9); P.circle(g, X(12.2), 15.4, 0.8, eye); P.circle(g, X(12.2), 15.4, 0.35, '#ffffff'); }
      P.path(g, [X(9.8), 19.2, X(12.6), 18.6, X(13.4), 20, X(10.4), 20.6]); P.fill(g, 'rgba(40,30,20,0.45)'); // under the cheekbone
    }
    g.beginPath(); g.moveTo(16, 17.4); g.lineTo(14.4, 20.6); g.quadraticCurveTo(15.2, 21.2, 16, 20.4); g.quadraticCurveTo(16.8, 21.2, 17.6, 20.6); g.closePath(); P.fill(g, '#0a0608');
    P.rect(g, 11, 21.6, 10, 2.6, '#1a1008'); for (let i = 0; i < 6; i++) { const tx = 11.3 + i * 1.62; P.rrect(g, tx, 21.6, 1.36, 2.6, 0.4, i === 1 ? '#8a7e62' : '#e8dcc0'); }
    P.rect(g, 11.4, 24.4, 9.2, 1.8, '#1a1008'); for (let i = 0; i < 5; i++) P.rrect(g, 11.7 + i * 1.8, 24.5, 1.5, 1.6, 0.4, '#d8ccb0');
    g.strokeStyle = 'rgba(30,20,10,0.8)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(19.6, 5.4); g.lineTo(18.6, 8.4); g.lineTo(20.2, 10); g.lineTo(19.4, 12); g.stroke();
    P.line(g, 16, 5.2, 16, 9, 0.35, 'rgba(60,50,30,0.5)');
    g.restore();
  }
  const UIB = ['#ffffff', '#e4e8f0', '#b4bccc', '#7a8294', '#3a3e4a'], UIL = ['#fff4dc', '#f4c890', '#d09858', '#8a5a2c', '#3a2410']; // bright steel and light leather for marks that sit on dark buttons
  const MISC = {
    ev_candle(g) { // event token: a pale tallow candle, its wax running, a violet flame over an iron dish
      P.glow(g, 16, 8, 10, '#c890ff', 0.75);
      inkPath(g, () => { g.beginPath(); g.ellipse(16, 27.2, 10.4, 3, 0, 0, Math.PI * 2); }, P.lg(g, 0, 24, 0, 30, ['#5a5664', '#24222c']), 1.1);
      P.ell(g, 16, 26.4, 8.2, 1.8, 'rgba(255,255,255,0.14)');
      inkPath(g, () => { g.beginPath(); g.moveTo(10.6, 13.6); g.lineTo(21.4, 13.6); g.lineTo(21.6, 26.4); g.quadraticCurveTo(16, 28.2, 10.4, 26.4); g.closePath(); }, P.lg(g, 10, 0, 22, 0, ['#fffaf0', '#ece4d4', '#b8ae9c']), 1.1);
      g.beginPath(); g.moveTo(10.6, 13.6); g.quadraticCurveTo(16, 11.8, 21.4, 13.6); g.quadraticCurveTo(16, 15.4, 10.6, 13.6); P.fill(g, '#fffdf6');
      for (const [x, l] of [[12.4, 5.4], [17.8, 8.6], [20.2, 3.8]]) { g.beginPath(); g.moveTo(x - 0.9, 14); g.lineTo(x - 0.9, 14 + l); g.quadraticCurveTo(x, 15.4 + l, x + 0.9, 14 + l); g.lineTo(x + 0.9, 14); P.fill(g, '#fffdf6'); }
      P.line(g, 16, 13.4, 16, 11.2, 0.6, '#2a2028');
      g.beginPath(); g.moveTo(16, 2.2); g.bezierCurveTo(20.6, 6.4, 20, 10, 16, 11.4); g.bezierCurveTo(12, 10, 11.6, 6.4, 16, 2.2); P.fill(g, P.lg(g, 0, 2, 0, 11.4, ['#f0d8ff', '#b070ff', '#5a18b0']));
      g.beginPath(); g.moveTo(16, 5.6); g.quadraticCurveTo(18, 8.4, 16, 10.6); g.quadraticCurveTo(14, 8.4, 16, 5.6); P.fill(g, '#f6ecff');
      glint(g, 12.6, 17, 1.2, '#ffffff');
    },
    ev_bone(g) { // event token: a coin carved from bone, a skull cut into its face
      P.glow(g, 16, 16, 13, '#f0e0b0', 0.35);
      inkPath(g, () => { g.beginPath(); g.arc(16, 16, 12.6, 0, Math.PI * 2); }, P.lg(g, 4, 4, 28, 28, ['#fff6dc', '#e0d0a8', '#9a8a64']), 1.2);
      g.strokeStyle = 'rgba(90,70,40,0.55)'; g.lineWidth = 0.9; g.beginPath(); g.arc(16, 16, 10, 0, Math.PI * 2); g.stroke();
      P.ell(g, 16, 14.6, 5.2, 4.8, '#6a5a3c'); P.rect(g, 13.4, 17.6, 5.2, 3.4, '#6a5a3c');
      P.circle(g, 14, 14.6, 1.4, '#f4e8c8'); P.circle(g, 18, 14.6, 1.4, '#f4e8c8');
      for (let i = 0; i < 3; i++) P.rect(g, 14 + i * 1.6, 19, 0.6, 2, '#f4e8c8');
      glint(g, 10.6, 9.6, 1.4, '#ffffff');
    },
    i_gold(g) { // one old minted coin seen three-quarter: a stamped star on its face, a thick milled edge
      const face = () => { g.beginPath(); g.ellipse(16, 14, 12.4, 10.4, 0, 0, Math.PI * 2); };
      g.fillStyle = INK; g.beginPath(); g.ellipse(16, 18.4, 13.1, 11.1, 0, 0, Math.PI * 2); g.fill(); P.rect(g, 2.9, 14, 26.2, 4.4, INK); face(); g.lineWidth = 1.4; g.strokeStyle = INK; g.stroke();
      g.fillStyle = P.lg(g, 3.6, 0, 28.4, 0, ['#7a4a0c', '#e0a030', '#b07018', '#5a3406']); g.beginPath(); g.ellipse(16, 18.4, 12.4, 10.4, 0, 0, Math.PI); g.fill(); P.rect(g, 3.6, 14, 24.8, 4.4, g.fillStyle);
      for (let i = 1; i < 14; i++) { const x = 3.6 + i * 24.8 / 14, t = (x - 16) / 12.4, dy = 10.4 * Math.sqrt(Math.max(0, 1 - t * t)); P.line(g, x, 14 + dy + 0.4, x, 18.4 + dy - 0.4, 0.5, 'rgba(60,30,0,0.55)'); }
      face(); P.fill(g, P.rg(g, 12, 10, 15, ['#fff6c8', '#f4c648', '#c8861c', '#8a5410']));
      g.strokeStyle = '#8a5a10'; g.lineWidth = 1.1; g.beginPath(); g.ellipse(16, 14, 9.4, 7.8, 0, 0, Math.PI * 2); g.stroke();
      g.save(); g.translate(16, 14); g.scale(1, 10.4 / 12.4); g.translate(-16, -16);
      const star = (r, w, col) => { P.path(g, [16, 16 - r, 16 + w, 16 - w, 16 + r, 16, 16 + w, 16 + w, 16, 16 + r, 16 - w, 16 + w, 16 - r, 16, 16 - w, 16 - w]); P.fill(g, col); };
      star(6.4, 2, '#8a5410'); star(5, 1.3, '#ffe890'); g.restore();
      glint(g, 9.6, 8.6, 2.2, '#ffffff');
    },
    i_gem(g) {
      P.glow(g, 16, 16, 13, '#ff5ad8', 0.45);
      sil(g, [9, 6.6, 23, 6.6, 29, 13, 16, 28.4, 3, 13], P.lg(g, 3, 6, 29, 28, ['#ffc0f0', '#ff5ad8', '#6a0a5a']), 1.3);
      P.path(g, [9, 6.6, 23, 6.6, 20, 13, 12, 13]); P.fill(g, 'rgba(255,255,255,0.4)'); P.path(g, [3, 13, 12, 13, 16, 28.4]); P.fill(g, 'rgba(255,230,250,0.25)'); P.path(g, [29, 13, 20, 13, 16, 28.4]); P.fill(g, 'rgba(60,0,50,0.35)');
      g.strokeStyle = 'rgba(80,0,60,0.6)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(3, 13); g.lineTo(29, 13); g.moveTo(12, 13); g.lineTo(16, 28.4); g.lineTo(20, 13); g.moveTo(9, 6.6); g.lineTo(12, 13); g.moveTo(23, 6.6); g.lineTo(20, 13); g.stroke();
      glint(g, 11.6, 8.8, 2, '#ffffff');
    },
    i_energy(g) {
      P.glow(g, 16, 8, 9, '#ffa030', 0.75);
      inkPath(g, () => { g.beginPath(); g.moveTo(13.6, 14); g.lineTo(18.4, 14); g.lineTo(17.4, 29); g.lineTo(14.6, 29); g.closePath(); }, wood(g, 13, 0, 19, 0), 1.1);
      inkPath(g, () => { g.beginPath(); g.rect(12.4, 11.6, 7.2, 4.4); }, P.lg(g, 0, 11, 0, 16, ['#a89078', '#5a4a38']), 1);
      for (const y of [12.8, 14.4]) P.line(g, 12.6, y, 19.4, y + 0.6, 0.4, 'rgba(0,0,0,0.5)');
      inkPath(g, () => { g.beginPath(); g.rect(12, 19, 8, 2); }, mfill(g, 12, 19, 20, 21, MAT.iron), 0.9);
      g.beginPath(); g.moveTo(16, 1.2); g.bezierCurveTo(22.4, 5.4, 22, 10.4, 19.6, 12); g.lineTo(12.4, 12); g.bezierCurveTo(10, 10.4, 10, 6, 14, 3.6); g.quadraticCurveTo(14, 6, 15.6, 6.6); g.quadraticCurveTo(14.6, 3.4, 16, 1.2); P.fill(g, P.lg(g, 0, 1, 0, 12, ['#fff4b0', '#ffa030', '#e04010']));
      g.beginPath(); g.moveTo(16, 5.4); g.quadraticCurveTo(18.6, 8.6, 17.6, 11.6); g.lineTo(14.4, 11.6); g.quadraticCurveTo(13.6, 8.6, 16, 5.4); P.fill(g, '#fff6d0');
    },
    i_revive(g) {
      P.glow(g, 16, 13, 11, '#ffd070', 0.45);
      g.strokeStyle = INK; g.lineWidth = 4.2; g.beginPath(); g.ellipse(16, 9, 4.4, 5.6, 0, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = mfill(g, 11, 3, 21, 15, MAT.gold); g.lineWidth = 2.8; g.stroke();
      sil(g, [7, 14.6, 25, 14.6, 25, 17.6, 7, 17.6], mfill(g, 7, 14, 25, 18, MAT.gold), 1.2);
      sil(g, [14.4, 17.4, 17.6, 17.4, 18.4, 29, 13.6, 29], mfill(g, 13, 17, 19, 29, MAT.gold), 1.2);
      gemCut(g, 16, 16.1, 1.6, '#ff3040');
    },
    i_reroll(g) {
      g.strokeStyle = 'rgba(230,220,200,0.45)'; g.lineWidth = 1.2; g.beginPath(); g.arc(16, 16, 12.4, 3.6, 5.4); g.stroke(); g.beginPath(); g.arc(16, 16, 12.4, 0.5, 2.3); g.stroke();
      dice(g, 16, 16, 7.4, '#ece4d0', '#a01020', 0.22);
    },
    n_battle(g) {
      for (const s of [-1, 1]) { g.save(); g.translate(16, 16); g.scale(s, 1); g.rotate(-0.78);
        sil(g, [-1.6, 6, -1.6, -11, 0, -14, 1.6, -11, 1.6, 6], P.lg(g, -1.6, 0, 1.6, 0, ['#ffffff', '#aab2c0', '#555b6a']), 1.1);
        inkLine(g, -4, 6.4, 4, 6.4, 1.1, '#c89838'); inkLine(g, 0, 7.4, 0, 11.4, 1.2, '#3a2412'); inkCircle(g, 0, 12.4, 1, '#c89838'); g.restore(); }
      glint(g, 16, 10.4, 1.8, '#fff4d0');
    },
    n_shrine(g) {
      for (const x of [10, 22]) { P.glow(g, x, 6, 4, '#ffb040', 0.8); P.ell(g, x, 6.6, 1.1, 2, '#ffd060'); inkPath(g, () => { g.beginPath(); g.rect(x - 1.2, 8.6, 2.4, 6); }, '#e8dcc0', 0.8); }
      skull2(g, 16, 10, 0.34, '#ff7030');
      sil(g, [5, 15, 27, 15, 26, 18, 6, 18], P.lg(g, 0, 15, 0, 18, ['#9a96a4', '#4a4654']), 1.2);
      sil(g, [8, 18, 24, 18, 24, 26, 8, 26], P.lg(g, 8, 0, 24, 0, ['#7a7684', '#4a4654', '#26222c']), 1.2);
      sil(g, [5, 26, 27, 26, 27, 29, 5, 29], P.lg(g, 0, 26, 0, 29, ['#8a8694', '#3a3644']), 1.2);
      P.ell(g, 16, 16.4, 4, 0.8, 'rgba(120,10,20,0.8)'); P.path(g, [18, 18, 19, 18, 18.8, 21.6, 18.2, 22]); P.fill(g, 'rgba(120,10,20,0.8)');
    },
    n_scroll(g) {
      inkPath(g, () => { g.beginPath(); g.rect(8, 7, 16, 18); }, P.lg(g, 8, 7, 24, 25, ['#f0e2c0', '#c8b088', '#8a7450']), 1.2);
      for (const y of [5, 25]) inkPath(g, () => { g.beginPath(); g.ellipse(16, y + 1, 9.6, 2.2, 0, 0, Math.PI * 2); }, wood(g, 6, y, 26, y + 3), 1);
      for (let i = 0; i < 5; i++) P.line(g, 10.6, 10 + i * 2.2, 21.4 - (i % 2) * 3, 10 + i * 2.2, 0.5, 'rgba(60,40,20,0.7)');
      inkCircle(g, 20, 21, 2.6, P.vol(g, 20, 21, 2.6, '#b0101e'));
    },
    n_trophy(g) {
      for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.moveTo(16 + s * 7, 7); g.quadraticCurveTo(16 + s * 13, 6, 16 + s * 11.4, 12); g.quadraticCurveTo(16 + s * 10, 15, 16 + s * 7, 14); g.stroke(); g.strokeStyle = MAT.gold[1]; g.lineWidth = 1.2; g.stroke(); }
      inkPath(g, () => { g.beginPath(); g.moveTo(8, 4.4); g.lineTo(24, 4.4); g.lineTo(23, 13); g.quadraticCurveTo(20, 18, 16, 18.4); g.quadraticCurveTo(12, 18, 9, 13); g.closePath(); }, mfill(g, 8, 4, 24, 18, MAT.gold), 1.3);
      skull2(g, 16, 10.4, 0.3, null);
      sil(g, [14.6, 18, 17.4, 18, 17, 23, 15, 23], mfill(g, 14, 18, 18, 23, MAT.gold), 1);
      sil(g, [10, 23, 22, 23, 23, 28, 9, 28], P.lg(g, 0, 23, 0, 28, ['#6a4a2a', '#2a1a0a']), 1.2);
      P.rect(g, 12, 24.6, 8, 1.6, MAT.gold[2]);
    },
    n_calendar(g) { // a stone tablet: the days scratched off, the moon's face above
      inkPath(g, () => { g.beginPath(); g.moveTo(6, 28); g.lineTo(6, 10); g.quadraticCurveTo(6, 4, 16, 4); g.quadraticCurveTo(26, 4, 26, 10); g.lineTo(26, 28); g.closePath(); }, P.lg(g, 6, 4, 26, 28, ['#a8a4b0', '#6a6674', '#302c38']), 1.3);
      inkCircle(g, 16, 10, 3.2, P.rg(g, 15, 9, 4, ['#fffae0', '#e8dca0', '#8a7a40'])); P.circle(g, 17.6, 9.2, 2.6, '#6a6674');
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = 9 + c * 4.2, y = 16 + r * 4; if (r === 2 && c === 3) { P.circle(g, x + 1, y + 1, 1.6, '#b0101e'); continue; } for (let k = 0; k < 3; k++) P.line(g, x + k * 0.9, y, x + k * 0.9, y + 2.4, 0.4, INK); if (r < 2 || c < 2) P.line(g, x - 0.3, y + 2.2, x + 2.4, y + 0.2, 0.4, INK); }
    },
    n_pass(g) {
      inkLine(g, 5, 4.4, 27, 4.4, 1.2, '#6a4424'); for (const x of [5, 27]) inkCircle(g, x, 4.4, 1.2, mfill(g, x - 1, 3, x + 1, 6, MAT.gold));
      inkPath(g, () => { g.beginPath(); g.moveTo(7.4, 5.4); g.lineTo(24.6, 5.4); g.lineTo(24, 28); g.lineTo(21, 24.4); g.lineTo(18.4, 28.6); g.lineTo(16, 24); g.lineTo(13.4, 28.4); g.lineTo(11, 24.6); g.lineTo(8, 28); g.closePath(); }, P.lg(g, 7, 5, 25, 28, ['#b070f0', '#5a1a90', '#240838']), 1.2);
      P.rect(g, 7.8, 7, 16.4, 1.2, MAT.gold[1]);
      const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 2.6 : 6; pts.push(16 + Math.cos(a) * r, 15 + Math.sin(a) * r); } sil(g, pts, mfill(g, 10, 9, 22, 21, MAT.gold), 1);
    },
    n_ad(g) { // a scrying orb on a claw stand, a vision in it
      P.glow(g, 16, 13, 12, '#80c0ff', 0.5);
      inkCircle(g, 16, 13, 9, P.rg(g, 13, 10, 11, ['#e8f6ff', '#6aa8e0', '#1a3a6a', '#081428']));
      g.strokeStyle = 'rgba(200,235,255,0.6)'; g.lineWidth = 0.6; g.beginPath(); g.arc(16, 13, 5.4, 0.3, 2.8); g.stroke();
      sil(g, [14, 9.4, 20, 13, 14, 16.6], '#ffffff', 0.7);
      P.ell(g, 12, 8.6, 2, 1.2, 'rgba(255,255,255,0.7)', -0.6);
      for (const s of [-1, 0, 1]) sil(g, [16 + s * 3.4, 19.6, 16 + s * 6.4, 24, 16 + s * 4, 24.6, 16 + s * 2.4, 21], mfill(g, 9, 19, 23, 25, MAT.gold), 0.9);
      sil(g, [9, 24, 23, 24, 24.4, 28.4, 7.6, 28.4], P.lg(g, 0, 24, 0, 28.4, ['#6a4a2a', '#2a1a0a']), 1.2);
    },
    n_skull(g) { skull2(g, 16, 16.6, 1.05, null); },
    n_book(g) { tome(g, '#3a4a8a', () => { P.glow(g, 16, 16, 6, '#80c0ff', 0.6); inkPath(g, () => { g.beginPath(); g.moveTo(10.4, 16); g.quadraticCurveTo(16, 10.6, 21.6, 16); g.quadraticCurveTo(16, 21.4, 10.4, 16); }, '#e8f0ff', 0.8); inkCircle(g, 16, 16, 2.2, P.rg(g, 15.4, 15.4, 3, ['#c0e8ff', '#3a8ad0'])); P.circle(g, 16, 16, 0.9, INK); }); },
    t_wisdom(g) { MISC.n_book(g); },
    t_haste(g) { TRA.quickhands[1](g); },
    t_might(g) { TRA.strength[1](g); },
    p_remembrance(g) { flask(g, '#60a0ff'); },
    p_resonance(g) { flask(g, '#ff9a30', 'tall'); },
    p_lethe(g) { flask(g, '#8a8a9a', 'square'); for (const [x, y] of [[10, 12], [22, 11]]) P.circle(g, x, y, 1.4, 'rgba(200,200,210,0.35)'); },
    u_agony(g) {
      P.glow(g, 16, 15, 13, '#ff2a3a', 0.5);
      for (const s of [-1, 1]) { const X = (v) => 16 + s * (v - 16); inkPath(g, () => { g.beginPath(); g.moveTo(X(8.6), 10); g.bezierCurveTo(X(2), 8, X(1.6), 1.4, X(5.4), 1.4); g.bezierCurveTo(X(4.4), 4.6, X(6.4), 7, X(10.6), 7.6); g.closePath(); }, P.lg(g, X(2), 1, X(11), 10, ['#e8dcc0', '#8a7a58', '#3a3020']), 1); for (const k of [0.3, 0.55]) P.line(g, X(3.4 + k * 4), 3 + k * 5, X(5 + k * 4), 2.6 + k * 5, 0.4, 'rgba(40,30,20,0.7)'); }
      skull2(g, 16, 17, 0.95, '#ff3040');
    },
    u_kill(g) { MISC.n_battle(g); for (const [x, y, l] of [[10, 21, 3], [22, 20.4, 3.6], [16, 24, 2.4]]) { P.path(g, [x - 0.8, y, x + 0.8, y, x, y + l]); P.fill(g, '#c0182a'); } },
    u_lock(g) {
      g.strokeStyle = INK; g.lineWidth = 3.6; g.beginPath(); g.arc(16, 12, 6, Math.PI, 0); g.lineTo(22, 16); g.moveTo(10, 12); g.lineTo(10, 16); g.stroke();
      g.strokeStyle = mfill(g, 10, 6, 22, 16, DARKSTEEL); g.lineWidth = 2.2; g.stroke();
      inkPath(g, () => { P.rrect(g, 7, 15, 18, 13.4, 2); }, mfill(g, 7, 15, 25, 28, MAT.gold), 1.3);
      inkPath(g, () => { g.beginPath(); g.arc(16, 20.4, 1.8, 0, Math.PI * 2); g.moveTo(15.2, 21.6); g.lineTo(16.8, 21.6); g.lineTo(17.2, 25.2); g.lineTo(14.8, 25.2); g.closePath(); }, INK, 0.4);
      for (const [x, y] of [[9, 17], [23, 17], [9, 26.4], [23, 26.4]]) rivet(g, x, y, 0.7, MAT.gold);
    },
    u_unlock(g) {
      g.strokeStyle = INK; g.lineWidth = 3.6; g.beginPath(); g.moveTo(22, 16); g.lineTo(22, 10); g.arc(16, 10, 6, 0, Math.PI, true); g.lineTo(10, 11); g.stroke();
      g.strokeStyle = mfill(g, 10, 4, 22, 16, DARKSTEEL); g.lineWidth = 2.2; g.stroke();
      inkPath(g, () => { P.rrect(g, 7, 15, 18, 13.4, 2); }, mfill(g, 7, 15, 25, 28, ['#c0f0a0', '#6ab040', '#3a7a20', '#1e4a10', '#0a2004']), 1.3);
      inkPath(g, () => { g.beginPath(); g.arc(16, 20.4, 1.8, 0, Math.PI * 2); g.moveTo(15.2, 21.6); g.lineTo(16.8, 21.6); g.lineTo(17.2, 25.2); g.lineTo(14.8, 25.2); g.closePath(); }, INK, 0.4);
      P.glow(g, 16, 21, 7, '#a0ff80', 0.35);
    },
    u_check(g) { P.glow(g, 14, 18, 10, '#70e050', 0.35); sil(g, [4, 16, 8.4, 12, 13, 17.4, 24.6, 4.6, 28.6, 8.4, 13, 25.4], P.lg(g, 4, 5, 28, 25, ['#d0ff90', '#5aa030', '#1e4a10']), 1.4); P.line(g, 5.6, 16, 13, 23.6, 0.5, 'rgba(255,255,255,0.5)'); },
    u_secret(g) { P.glow(g, 16, 16, 13, '#c070ff', 0.6); sil(g, [16, 2.6, 18.6, 13.4, 29.4, 16, 18.6, 18.6, 16, 29.4, 13.4, 18.6, 2.6, 16, 13.4, 13.4], P.lg(g, 3, 3, 29, 29, ['#ffffff', '#d0a0ff', '#6a2ab0']), 1.2); inkCircle(g, 16, 16, 2.2, '#ffffff'); },
    u_star(g) { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5.6 : 13; pts.push(16 + Math.cos(a) * r, 16.6 + Math.sin(a) * r); } P.glow(g, 16, 16, 12, '#ffd040', 0.4); sil(g, pts, mfill(g, 3, 3, 29, 29, MAT.gold), 1.4); P.path(g, [16, 3.6, 18, 12, 16, 16.6, 14, 12]); P.fill(g, 'rgba(255,255,255,0.4)'); },
    u_star0(g) { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5.6 : 13; pts.push(16 + Math.cos(a) * r, 16.6 + Math.sin(a) * r); } sil(g, pts, P.lg(g, 0, 3, 0, 29, ['#4a4452', '#1e1a24']), 1.4); },
    u_bag(g) {
      P.glow(g, 16, 19, 15, '#ffe0a8', 0.35);
      inkPath(g, () => { g.beginPath(); g.moveTo(11, 11); g.quadraticCurveTo(4, 17, 5.6, 24); g.quadraticCurveTo(7, 29, 16, 29); g.quadraticCurveTo(25, 29, 26.4, 24); g.quadraticCurveTo(28, 17, 21, 11); g.closePath(); }, mfill(g, 5, 11, 27, 29, UIL), 1.4);
      inkPath(g, () => { g.beginPath(); g.moveTo(11, 11.4); g.lineTo(8.4, 5.6); g.lineTo(12.6, 7.6); g.lineTo(16, 4.4); g.lineTo(19.4, 7.6); g.lineTo(23.6, 5.6); g.lineTo(21, 11.4); g.closePath(); }, mfill(g, 8, 4, 24, 12, UIL), 1.2);
      inkLine(g, 10.4, 11.6, 21.6, 11.6, 0.8, '#c8a060'); inkLine(g, 21, 11.6, 24.4, 16, 0.6, '#c8a060');
      P.path(g, [8, 17, 10.6, 13.6, 11, 22, 8.6, 24]); P.fill(g, 'rgba(255,255,255,0.35)');
      inkCircle(g, 16, 21, 3.6, P.rg(g, 14.8, 19.8, 4.4, ['#fff8d0', '#f0c040', '#a86a10'])); P.circle(g, 14.8, 19.8, 1, '#ffffff');
    },
    u_close(g) { for (const a of [0.78, -0.78]) { g.save(); g.translate(16, 16); g.rotate(a); inkPath(g, () => { P.rrect(g, -2, -12, 4, 24, 1.6); }, P.lg(g, -2, 0, 2, 0, ['#ff8080', '#c01828', '#5a0610']), 1.3); g.restore(); } },
    u_cog(g) {
      const pts = []; for (let t = 0; t < 8; t++) { const a = t * Math.PI / 4; for (const [d, r] of [[-0.2, 13.4], [0.2, 13.4], [0.3, 9.6], [Math.PI / 4 - 0.3, 9.6]]) pts.push(16 + Math.cos(a + d) * r, 16 + Math.sin(a + d) * r); }
      sil(g, pts, mfill(g, 3, 3, 29, 29, UIB), 1.4);
      inkCircle(g, 16, 16, 5.4, mfill(g, 10, 10, 22, 22, MAT.iron)); P.circle(g, 16, 16, 2.4, INK);
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.6; rivet(g, 16 + Math.cos(a) * 7.6, 16 + Math.sin(a) * 7.6, 0.7, UIB); }
    },
    u_hand(g) { g.strokeStyle = INK; g.lineWidth = 3.6; g.beginPath(); g.arc(16, 16, 11, 0, Math.PI * 2); g.stroke(); g.strokeStyle = mfill(g, 5, 5, 27, 27, MAT.gold); g.lineWidth = 2.2; g.stroke(); inkCircle(g, 16, 16, 5, P.rg(g, 14.6, 14.6, 6, ['#fff6c8', '#e8b840', '#7a5414'])); },
    u_left(g) { sil(g, [22, 4.4, 22, 27.6, 6, 16], mfill(g, 6, 4, 22, 28, MAT.gold), 1.4); P.path(g, [21, 6.6, 21, 16, 8.4, 16]); P.fill(g, 'rgba(255,255,255,0.3)'); },
    u_right(g) { sil(g, [10, 4.4, 10, 27.6, 26, 16], mfill(g, 10, 4, 26, 28, MAT.gold), 1.4); P.path(g, [11, 6.6, 11, 16, 23.6, 16]); P.fill(g, 'rgba(255,255,255,0.3)'); },
    u_seal(g) {
      const pts = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = 11.6 + (i % 2 ? -0.8 : 0.6); pts.push(16 + Math.cos(a) * r, 16 + Math.sin(a) * r); }
      sil(g, pts, P.rg(g, 13, 12, 14, ['#e04050', '#a01020', '#4a0610']), 1.3);
      g.strokeStyle = 'rgba(40,0,6,0.8)'; g.lineWidth = 0.8; g.beginPath(); g.arc(16, 16, 7.6, 0, Math.PI * 2); g.stroke();
      P.glow(g, 16, 16, 5, '#ff8060', 0.6); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; P.line(g, 16 + Math.cos(a) * 1.4, 16 + Math.sin(a) * 1.4, 16 + Math.cos(a) * 5, 16 + Math.sin(a) * 5, 0.7, '#ffc0a0'); }
    },
    u_pause(g) { for (const x of [8, 19]) { inkPath(g, () => { P.rrect(g, x, 5, 5, 22, 1.4); }, mfill(g, x, 5, x + 5, 27, UIB), 1.4); P.rect(g, x + 0.9, 6.4, 1.1, 19.2, 'rgba(255,255,255,0.75)'); } },
    u_full(g) { for (const [x, y, sx, sy] of [[5, 5, 1, 1], [27, 5, -1, 1], [5, 27, 1, -1], [27, 27, -1, -1]]) sil(g, [x, y, x + sx * 9, y, x + sx * 9, y + sy * 3, x + sx * 3, y + sy * 3, x + sx * 3, y + sy * 9, x, y + sy * 9], mfill(g, 5, 5, 27, 27, UIB), 1.3); },
    u_unfull(g) { for (const [x, y, sx, sy] of [[13, 13, -1, -1], [19, 13, 1, -1], [13, 19, -1, 1], [19, 19, 1, 1]]) sil(g, [x, y, x + sx * 9, y, x + sx * 9, y + sy * 3, x + sx * 3, y + sy * 3, x + sx * 3, y + sy * 9, x, y + sy * 9], mfill(g, 4, 4, 28, 28, UIB), 1.3); },
    u_pin(g) { // a long pin with a red glass head, driven in at a slant
      P.ell(g, 22, 27.4, 3.4, 1, 'rgba(0,0,0,0.45)');
      inkPath(g, () => { g.beginPath(); g.moveTo(11.4, 12.6); g.lineTo(13.6, 10.6); g.lineTo(23.4, 27); g.lineTo(22.6, 27.4); g.closePath(); }, P.lg(g, 11, 10, 14, 13, ['#f0f2f8', '#8a92a4', '#3a3e48']), 0.9);
      inkPath(g, () => { g.beginPath(); g.ellipse(12.6, 11.6, 3.4, 2, -0.95, 0, Math.PI * 2); }, P.lg(g, 10, 9, 15, 14, ['#8a8e9a', '#3a3e48']), 1); // the collar
      inkCircle(g, 10.4, 8.4, 5.4, P.rg(g, 8.4, 6.4, 7, ['#ff9aa0', '#d01828', '#5a0610']));
      P.ell(g, 8.4, 6.4, 1.8, 1.2, 'rgba(255,255,255,0.8)', -0.6); P.circle(g, 12.6, 11, 0.8, 'rgba(255,140,150,0.6)');
    },
  };

  function draw(name) {
    const c = G.canvas(SIZE, SIZE), g = c.getContext('2d');
    g.scale(U2, U2); g.lineJoin = 'round'; g.lineCap = 'round';
    const [pre, ...rest] = name.split('_'); const id = rest.join('_');
    if (MISC[name]) MISC[name](g);
    else if (name === 'i_gold') GL.coin(g);
    else if (name === 'i_gem') GL.gem(g);
    else if (name === 'i_energy') GL.torch(g);
    else if (name === 'i_revive') GL.ankh(g);
    else if (name === 'i_reroll') GL.dice(g);
    else if (pre === 'u' && UI[id]) UI[id](g);
    else if (name === 'n_battle') GL.swords(g);
    else if (name === 'n_shrine') GL.altar(g);
    else if (name === 'n_scroll') GL.scroll(g);
    else if (name === 'n_trophy') GL.trophy(g);
    else if (name === 'n_calendar') GL.calendar(g);
    else if (name === 'n_pass') GL.banner(g);
    else if (name === 'n_ad') GL.tv(g);
    else if (name === 'n_skull') GL.skull(g);
    else if (name === 'n_book') GL.book(g);
    else if (name === 't_wisdom') GL.book(g);
    else if (name === 't_haste') GL.hourglass(g);
    else if (name === 't_might') GL.fistup(g);
    else if (CHEST[name]) CHEST[name](g);
    else if (name === 'c_wood') GL.chest(g, '#8a5a2a');
    else if (name === 'c_silver') GL.chest(g, '#4a5a7a');
    else if (name === 'c_gold') GL.chest(g, '#8a2034');
    else if (name === 'c_red') GL.chest(g, '#8a1a24');
    else if (pre === 'av' && DH.gfx.painters[id]) { // an avatar: the head and shoulders of an in-game model in a round frame (the keepers are cut like the heroes)
      P.circle(g, 16, 16, 15.5, P.rg(g, 16, 20, 16, ['#4a3a44', '#1a1016'])); g.save(); g.beginPath(); g.arc(16, 16, 15, 0, Math.PI * 2); g.clip(); g.setTransform(1, 0, 0, 1, 0, 0);
      if (id.startsWith('npc_')) { g.scale(U2, U2); heroPortrait(g, id); }
      else { // the model's visible box; a long beast (wider than tall) is cut at its head end, which faces right
        const img = G.sprite(id).frames[0], b = opaqueBox(img), bw = b.x1 - b.x0, bh = b.y1 - b.y0;
        const side = bw > bh * 1.15 ? bh * 1.05 : Math.min(bw * 1.05, bh), sx = bw > bh * 1.15 ? b.x1 - side : b.x0 + (bw - side) / 2, sy = b.y0 - side * 0.04;
        g.imageSmoothingEnabled = false; g.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
      }
      g.restore();
    }
    else if (pre === 'h' && DH.gfx.painters[id]) { P.circle(g, 16, 16, 15.5, P.rg(g, 16, 20, 16, ['#4a3a44', '#1a1016'])); g.save(); g.beginPath(); g.arc(16, 16, 15, 0, Math.PI * 2); g.clip(); g.setTransform(1, 0, 0, 1, 0, 0); g.scale(U2, U2); heroPortrait(g, id); g.restore(); }
    else if (pre === 'm' && DH.gfx.painters[id]) { P.circle(g, 16, 16, 15, P.lg(g, 0, 1, 0, 31, ['#fff0a0', '#c89030', '#6a4a14'])); P.circle(g, 16, 16, 12.5, P.rg(g, 16, 18, 13, ['#4a3a44', '#1a1016'])); g.save(); g.beginPath(); g.arc(16, 16, 12.3, 0, Math.PI * 2); g.clip(); g.setTransform(1, 0, 0, 1, 0, 0); g.scale(U2, U2); heroPortrait(g, id, true); g.restore(); }
    else if (pre === 'ab') {
      const def = C.abilities[id];
      const tag = def && def.badge ? def.badge : def ? (def.tags.find((t) => ['fire', 'lightning', 'ice'].includes(t)) || (def.tags.includes('summon') ? 'summon' : def.tags.includes('magic') ? 'magic' : def.tags[0])) : 'physical';
      frame(g, ELEM[tag] || ELEM.physical);
      g.save(); g.beginPath(); g.rect(3.4, 3.4, 25.2, 25.2); g.clip();
      if (ABI[id]) ABI[id](g);
      else { const gl = def && GL[def.icon]; if (gl) { g.translate(16, 16); g.scale(0.82, 0.82); g.translate(-16, -16); gl(g); } }
      g.restore();
      if (def && def.hero) { P.circle(g, 26, 26, 4.2, INK); P.circle(g, 26, 26, 3.6, P.vol(g, 26, 26, 3.6, '#e8b840')); GL.starSmallAt(g, 26, 26); }
    }
    else if (pre === 'tr' && TRA[id]) { medal(g, TRA[id][0], !!C.elevatedTraits[id]); g.save(); g.beginPath(); g.arc(16, 16, 11.6, 0, Math.PI * 2); g.clip(); TRA[id][1](g); g.restore(); }
    else if (pre === 'tr') { badge(g, C.elevatedTraits[id] ? '#b07020' : '#4a3a5a', true); const gl = GL[TRAIT_GLYPH[id]]; if (gl) { g.save(); g.translate(16, 16); g.scale(0.72, 0.72); g.translate(-16, -16); gl(g); g.restore(); } }
    else if (pre === 'g' && GEAR[id]) GEAR[id](g);
    else if (pre === 's') { g.globalAlpha = 0.25; const t = { head: 'warden_helm', neck: 'wrath_amulet', chest: 'stalwart_cuirass', hands: 'stalker_grips', feet: 'striders', ring1: 'oak_band', ring2: 'oak_band' }[id]; if (GEAR[t]) GEAR[t](g); }
    else if (pre === 'p') { const col = { remembrance: '#60a0ff', resonance: '#ff9a30', lethe: '#8a8a9a', renewal: '#50e0a0', visions: '#e070ff' }[id]; P.glow(g, 16, 20, 12, col, 0.5); GL.flask(g, col); }
    else if (pre === 'mat' && G.painters['mat_' + id]) { g.save(); g.translate(16 - 5 * 2.8, 16 - 4.2 * 2.8); g.scale(2.8, 2.8); G.painters['mat_' + id].draw(g); g.restore(); } // the ingot drawn at icon size
    else if (pre === 'herb') spriteIcon(g, 'herb_' + id, 46); // the sprig is small inside its glow: a larger box fills the slot
    else if (pre === 'a' && ART[id]) { reliquary(g, (ARTIFACT[id] || [0, '#6a5a7a'])[1]); g.save(); arch(g, 4.5, 27.5, 4.3, 27.9, 13.2); g.clip(); ART[id](g); g.restore(); }
    else if (pre === 'a' && ARTIFACT[id]) { badge(g, ARTIFACT[id][1], true); g.save(); g.translate(16, 16); g.scale(0.7, 0.7); g.translate(-16, -16); GL[ARTIFACT[id][0]](g); g.restore(); }
    else if (DH.gfx.painters[name]) spriteIcon(g, name, 30);
    else if (GL[name]) GL[name](g);
    return G.classicize(c, ICON_STYLE, 2).toDataURL();
  }
  GL.starSmallAt = (g, x, y) => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 1.4 : 3.2; pts.push(x + Math.cos(a) * r, y + Math.sin(a) * r); } P.path(g, pts); P.fill(g, '#fff8e0'); };

  DH.icons = {
    url(name) { return cache[name] || (cache[name] = draw(name)); },
    img(name, cls) { const el = document.createElement('img'); el.src = this.url(name); el.className = 'ic ' + (cls || ''); el.alt = ''; el.draggable = false; return el; },
  };
  // UI modules call DH.art.img / DH.art.icon — route them to the vector icons.
  DH.art.img = (n, c) => DH.icons.img(n, c);
  DH.art.icon = (n) => DH.icons.url(n);
})(window.DH);
