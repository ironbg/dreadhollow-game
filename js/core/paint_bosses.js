/* HD vector painters: bosses ("Lords"). Boxes are in world units. Built to read as dread at a glance: heavy
 * hunched silhouettes, horns and spikes, glowing eyes without highlights, open maws, tattered edges. */
(function (DH) {
  'use strict';
  const G = DH.gfx, P = G.P, sh = G.shade;
  const def = (name, o) => { G.painters[name] = o; };
  const VOID = '#07040a';
  const { evil, teeth, claws, limb } = P; // shared helpers from paint_enemies.js
  /** A sweeping horn from base (x,y) bending through (mx,my) to the tip (tx,ty). */
  function horn(g, x, y, mx, my, tx, ty, w, col) {
    const a = Math.atan2(ty - y, tx - x), nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
    g.beginPath(); g.moveTo(x + nx, y + ny); g.quadraticCurveTo(mx + nx * 0.5, my + ny * 0.5, tx, ty); g.quadraticCurveTo(mx - nx * 0.5, my - ny * 0.5, x - nx, y - ny); g.closePath();
    P.fill(g, P.lg(g, x, y, tx, ty, [sh(col, -0.35), col, sh(col, 0.55)]));
    g.strokeStyle = sh(col, -0.5); g.lineWidth = 0.3; for (let i = 1; i < 4; i++) { const t = i / 4, px = x + (tx - x) * t * 0.8 + (mx - x) * 0.3 * t, py = y + (ty - y) * t * 0.8 + (my - y) * 0.3 * t; g.beginPath(); g.moveTo(px + nx * (1 - t), py + ny * (1 - t)); g.lineTo(px - nx * (1 - t), py - ny * (1 - t)); g.stroke(); }
  }
  /** A tattered membrane wing hinged at (0,0), spread up (frame 0) or down (frame 1); scale -1 mirrors it. */
  function wing(g, x, y, sx, sc, up, col) {
    g.save(); g.translate(x, y); g.scale(sx * sc, sc);
    const tips = up ? [[26, -16], [30, -6], [24, 2], [16, 6], [8, 7]] : [[28, 2], [28, 12], [20, 15], [12, 14], [6, 10]];
    g.beginPath(); g.moveTo(0, 0);
    const top = up ? [12, -16] : [16, -4];
    g.quadraticCurveTo(top[0], top[1], tips[0][0], tips[0][1]);
    for (let i = 1; i < tips.length; i++) { const [px, py] = tips[i - 1], [qx, qy] = tips[i]; g.quadraticCurveTo((px + qx) / 2 - 2, (py + qy) / 2 - (up ? 1 : 3), qx, qy); }
    g.lineTo(0, 4); g.closePath();
    P.fill(g, P.lg(g, 0, up ? -16 : -4, 24, 14, [sh(col, 0.25), col, sh(col, -0.6)]));
    g.strokeStyle = sh(col, -0.7); g.lineWidth = 0.9;
    for (const [tx, ty] of tips) { g.beginPath(); g.moveTo(1, 0); g.lineTo(tx, ty); g.stroke(); }
    P.path(g, [tips[0][0], tips[0][1], tips[0][0] + 3, tips[0][1] - 2, tips[0][0] + 0.5, tips[0][1] + 1.4]); P.fill(g, '#d8ccb0');
    P.circle(g, up ? 18 : 18, up ? -5 : 7, 1.2, VOID); P.circle(g, up ? 10 : 11, up ? 1 : 9, 0.8, VOID);
    g.restore();
  }


  /** A black maw with a pair of long fangs (no rows of teeth). */
  function maw(g, x0, y0, x1, y1, drop, glow) {
    P.path(g, [x0, y0, x1, y1, x1 - (x1 - x0) * 0.15, y1 + drop, x0 + (x1 - x0) * 0.1, y0 + drop * 0.85]); P.fill(g, '#140204');
    if (glow) P.glow(g, (x0 + x1) / 2, (y0 + y1) / 2 + drop * 0.5, drop * 0.9, glow, 0.8);
    const fx = (t, down) => { const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; P.path(g, [x - 0.45, y, x, y + drop * 0.62, x + 0.45, y]); P.fill(g, '#efe6cc'); };
    fx(0.28); fx(0.72);
  }
  /** A bone: a shaft with knobbed ends. */
  function bone(g, x1, y1, x2, y2, w, col) {
    P.line(g, x1, y1, x2, y2, w, col); P.line(g, x1, y1, x2, y2, w * 0.35, sh(col, 0.3));
    for (const [x, y] of [[x1, y1], [x2, y2]]) { P.circle(g, x - w * 0.35, y, w * 0.55, P.vol(g, x, y, w * 0.7, col)); P.circle(g, x + w * 0.35, y, w * 0.55, P.vol(g, x, y, w * 0.7, col)); }
  }

  /* ---------- Bone Colossus: a hunched giant of fused bones, horned skull, a soul burning in its ribs ---------- */
  def('colossus', { w: 48, h: 50, frames: 2,
    colors: { bone: '#d4c8a4', eye: '#ff3a2a', club: '#5a4030' },
    variants: { ice: { bone: '#c4dcec', eye: '#8ff0ff', club: '#3a5a7a' }, fire: { bone: '#dcac80', eye: '#ffd040', club: '#5a2010' }, purple: { bone: '#ccbedc', eye: '#ff50c0', club: '#3a1e4a' }, bog: { bone: '#bcbc8c', eye: '#b0ff50', club: '#2e3a14' }, gold: { bone: '#e8d8a0', eye: '#ffffff', club: '#7a5a22' } },
    draw(g, f, c) {
      // a hunched giant of fused bone: a soul burning in the cage of its ribs, a jaw hanging slack, a femur for a club
      const b = c.bone, bd = sh(b, -0.45), w = f ? 1.2 : 0;
      P.glow(g, 26, 22, 20, c.eye, 0.12);
      // legs: long bones, heavy knees, splayed feet
      bone(g, 21, 32, 17 - w, 40, 2.2, bd); bone(g, 17 - w, 40, 19 - w, 47.4, 1.8, bd); P.ell(g, 18.6 - w, 48.2, 3.2, 1, bd);
      bone(g, 27, 32, 30 + w, 40, 2.4, sh(b, -0.2)); bone(g, 30 + w, 40, 28.4 + w, 47.4, 2, sh(b, -0.2)); P.ell(g, 29 + w, 48.2, 3.4, 1.1, sh(b, -0.2));
      // far arm hanging, knuckles near the ground
      bone(g, 21, 15, 15, 24, 2, bd); bone(g, 15, 24, 13, 33, 1.6, bd); claws(g, 13, 33.6, 1.6, 4, 3, 0.8, bd);
      // pelvis and the spine bent forward
      P.ell(g, 24, 31, 6, 3, P.vol(g, 24, 30.4, 6, b)); P.ell(g, 22, 31.6, 1.6, 1.2, '#1a1010'); P.ell(g, 26.4, 31.6, 1.6, 1.2, '#1a1010');
      g.strokeStyle = b; g.lineWidth = 2.2; g.beginPath(); g.moveTo(22.6, 29); g.bezierCurveTo(19, 22, 22, 15, 28, 12); g.stroke();
      for (let i = 0; i < 7; i++) { const t = i / 6, x = 22.6 - Math.sin(t * Math.PI) * 2 + t * 5.4, y = 29 - t * 17; P.circle(g, x, y, 1.1, P.vol(g, x, y, 1.2, sh(b, 0.1))); }
      // the ribcage: a dark hollow with a soul burning in it
      P.ell(g, 27, 21, 7.4, 6.8, 'rgba(20,6,8,0.85)');
      P.glow(g, 27.4, 21.4, 6, c.eye, 0.9); P.circle(g, 27.4, 21.4, 1.8, P.rg(g, 27.4, 21.4, 1.8, ['#ffffff', c.eye, sh(c.eye, -0.5)]));
      g.strokeStyle = b; g.lineCap = 'round';
      for (let i = 0; i < 5; i++) { const y = 15.6 + i * 2.6; g.lineWidth = 1.3 - i * 0.12; g.beginPath(); g.moveTo(21.2, y); g.bezierCurveTo(26, y - 3, 34, y - 1, 33.6 - i * 0.6, y + 3.4); g.stroke(); }
      g.strokeStyle = sh(b, -0.55); g.lineWidth = 0.3; for (let i = 0; i < 5; i++) { const y = 15.6 + i * 2.6; g.beginPath(); g.moveTo(21.6, y + 0.5); g.bezierCurveTo(26, y - 2.3, 33.4, y - 0.4, 33 - i * 0.6, y + 3.6); g.stroke(); }
      // shoulder blades
      P.ell(g, 21, 15, 3.6, 2.6, P.vol(g, 21, 14.4, 3.6, sh(b, -0.1)), -0.4); P.ell(g, 32, 13.6, 3.6, 2.6, P.vol(g, 32, 13, 3.6, b), 0.3);
      // the skull: heavy-browed, sockets burning, the jaw hanging open
      const hx = 34.6, hy = 8.6;
      P.ell(g, hx, hy, 5.6, 5, P.vol(g, hx - 1, hy - 1.4, 5.6, b));
      P.path(g, [hx - 3, hy - 1.6, hx + 5.4, hy - 2.2, hx + 5, hy - 0.6, hx - 2.6, hy - 0.2]); P.fill(g, sh(b, -0.35)); // the brow
      P.ell(g, hx + 2.6, hy + 0.4, 1.5, 1.3, VOID); P.ell(g, hx - 0.8, hy + 0.2, 1.3, 1.2, VOID);
      evil(g, hx + 2.6, hy + 0.4, 0.7, c.eye, -0.2); evil(g, hx - 0.8, hy + 0.2, 0.6, c.eye, 0.2);
      P.path(g, [hx + 3.8, hy + 2, hx + 4.6, hy + 3.6, hx + 3.4, hy + 3.4]); P.fill(g, VOID); // nasal hollow
      P.rect(g, hx - 1, hy + 3.8, 6.2, 1.2, sh(b, 0.1)); g.strokeStyle = sh(b, -0.6); g.lineWidth = 0.25; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(hx - 0.4 + i, hy + 3.9); g.lineTo(hx - 0.4 + i, hy + 4.9); g.stroke(); } // upper teeth
      P.path(g, [hx - 1.4, hy + 6, hx + 5, hy + 7.4, hx + 4.4, hy + 9.2, hx - 1.2, hy + 7.8]); P.fill(g, P.lg(g, hx, hy + 6, hx, hy + 9, [b, bd])); // the slack jaw
      P.path(g, [hx - 1, hy + 5, hx + 5.2, hy + 5, hx + 5, hy + 7.4, hx - 1.2, hy + 6]); P.fill(g, '#140204');
      P.glow(g, hx + 2, hy + 6, 2.4, c.eye, 0.5);
      // near arm dragging a femur-club wrapped in leather
      bone(g, 33, 15, 38, 24, 2.2, b); bone(g, 38, 24, 39, 31, 1.8, b);
      g.save(); g.translate(40, 32); g.rotate(0.55);
      P.rrect(g, -1.3, -1, 2.6, 17, 1.2, P.lg(g, -1.3, 0, 1.3, 0, [sh(b, 0.2), b, bd]));
      P.circle(g, -1.4, 16.6, 2.4, P.vol(g, -1.4, 16, 2.4, b)); P.circle(g, 1.6, 16.8, 2.6, P.vol(g, 1.6, 16.2, 2.6, b));
      for (let i = 0; i < 4; i++) P.rect(g, -1.5, 1 + i * 1.3, 3, 0.7, c.club);
      g.restore();
      claws(g, 39.6, 31.6, 0.8, 4, 2.6, 0.7, b);
    } });

  /* ---------- Lich King: a floating husk in a tattered shroud, an iron crown, a skull-topped staff ---------- */
  def('lich', { w: 44, h: 50, frames: 2,
    colors: { robe: '#2e1840', trim: '#a88a3a', bone: '#d8ccb0', eye: '#7dffb0', orb: '#7dffb0' },
    variants: { ice: { robe: '#162a4e', trim: '#a8d8f0', bone: '#cce2f0', eye: '#8ff0ff', orb: '#8ff0ff' }, gold: { robe: '#4a3616', trim: '#e8d890', bone: '#eadcaa', eye: '#ffffff', orb: '#fff0a0' } },
    draw(g, f, c) {
      const r = c.robe, wv = f ? 1 : -1;
      P.glow(g, 22, 26, 23, c.eye, 0.2);
      // soul smoke pooling beneath (it floats)
      for (let i = 0; i < 5; i++) P.ell(g, 12 + i * 5, 47 + (i % 2) * wv * 0.6, 3.4, 1.6, G.rgba(c.eye, 0.18));
      // tattered shroud: long ragged strips
      g.beginPath(); g.moveTo(14.4, 14.6); g.lineTo(29.6, 14.6); g.quadraticCurveTo(31, 22, 27.4, 26.4);
      g.quadraticCurveTo(34.4, 32, 37 + wv, 40); g.lineTo(34.6, 38); g.lineTo(34, 46 + wv); g.lineTo(31, 40); g.lineTo(29, 48); g.lineTo(26.6, 41); g.lineTo(24, 47 - wv);
      g.lineTo(21.4, 41); g.lineTo(19, 48 + wv); g.lineTo(16.6, 40.6); g.lineTo(14, 46); g.lineTo(12, 39); g.lineTo(9 - wv, 44); g.quadraticCurveTo(10, 31, 16.6, 26.4); g.quadraticCurveTo(13, 22, 14.4, 14.6); g.closePath();
      P.fill(g, P.lg(g, 10, 15, 30, 48, [sh(r, 0.2), r, G.rgba(sh(r, -0.6), 0.85)]));
      g.save(); g.globalAlpha = 0.5; for (let i = 0; i < 6; i++) P.line(g, 15 + i * 2.8, 20, 12 + i * 4, 44, 0.6, sh(r, -0.65)); g.restore();
      // runes stitched down the front
      // a sash at the narrow waist, and one trimmed panel falling from it to the hem
      P.path(g, [20.4, 27.4, 24, 27.4, 25.4, 45, 19.4, 45]); P.fill(g, P.lg(g, 20, 27, 25, 45, [sh(r, 0.35), sh(r, -0.3)]));
      P.line(g, 20.4, 27.4, 19.4, 45, 0.45, c.trim); P.line(g, 24, 27.4, 25.4, 45, 0.45, sh(c.trim, -0.3));
      P.path(g, [16, 25.4, 28, 25.4, 27.6, 28, 16.4, 28]); P.fill(g, P.lg(g, 16, 25, 16, 28, [sh(c.trim, 0.1), sh(c.trim, -0.5)]));
      P.circle(g, 22.2, 26.7, 1.2, P.vol(g, 22, 26.4, 1.2, c.bone)); P.circle(g, 22.2, 26.8, 0.4, c.eye); // a bone clasp
      // a high, flared collar rising behind the hood
      g.beginPath(); g.moveTo(12.4, 16.8); g.quadraticCurveTo(11, 10, 14.6, 6.8); g.quadraticCurveTo(22, 9.4, 29.4, 6.8); g.quadraticCurveTo(33, 10, 31.6, 16.8); g.closePath();
      P.fill(g, P.lg(g, 12, 6, 32, 17, [sh(r, 0.3), r, sh(r, -0.5)])); g.strokeStyle = c.trim; g.lineWidth = 0.45; g.stroke();
      // shoulders of bone: ribbed plates over the corners of the shoulders
      [[14.2, 15.6, -0.35, 3.4], [30, 15.6, 0.35, 3.6]].forEach(([x, y, rot, rx]) => { P.ell(g, x, y, rx, 2.2, P.vol(g, x - 0.8, y - 1, rx, sh(c.bone, -0.1)), rot);
        for (let i = 0; i < 2; i++) { g.beginPath(); g.ellipse(x, y + 0.4 + i * 0.9, rx * (0.8 - i * 0.2), 1.2, rot, 0.2, Math.PI - 0.2); g.strokeStyle = sh(c.bone, -0.5); g.lineWidth = 0.35; g.stroke(); } });
      // far arm: a skeletal hand raised, a curse gathering in the claws
      P.path(g, [14.6, 15.4, 8.6, 20.4, 5.4, 26.8, 8.2, 26, 10.6, 27.4, 15.6, 20.4]); P.fill(g, P.lg(g, 6, 16, 15, 27, [sh(r, 0.1), sh(r, -0.4)])); // a bell sleeve
      P.bone(g, 7.4, 24.6, 5.2, 20, 0.8, sh(c.bone, -0.2)); claws(g, 5.2, 19.6, -1.9, 4, 2.4, 0.4, c.bone);
      P.glow(g, 4.4, 16.4, 5, c.eye, 0.75); P.circle(g, 4.4, 16.4, 1.2, sh(c.eye, 0.5));
      // hood and the skull inside it
      const hx = 22, hy = 10.4;
      g.beginPath(); g.moveTo(hx - 6.6, hy + 5.6); g.quadraticCurveTo(hx - 7.4, hy - 6.4, hx, hy - 7.6); g.quadraticCurveTo(hx + 7.4, hy - 6.4, hx + 6.6, hy + 5.6); g.quadraticCurveTo(hx, hy + 3, hx - 6.6, hy + 5.6); g.closePath();
      P.fill(g, P.lg(g, hx - 6, hy - 7, hx + 6, hy + 5, [sh(r, 0.3), r, sh(r, -0.5)]));
      P.ell(g, hx, hy + 0.4, 4.4, 5, VOID);
      P.ell(g, hx + 0.4, hy + 0.6, 3.4, 3.8, P.vol(g, hx, hy, 3.6, sh(c.bone, -0.15)));
      P.ell(g, hx - 0.9, hy, 1.2, 1.1, VOID, 0.3); P.ell(g, hx + 1.8, hy, 1.2, 1.1, VOID, -0.3);
      evil(g, hx - 0.9, hy + 0.1, 0.55, c.eye, 0.3); evil(g, hx + 1.8, hy + 0.1, 0.55, c.eye, -0.3);
      P.rect(g, hx - 1.2, hy + 2.6, 3.2, 1.4, VOID); teeth(g, hx - 1.2, hy + 2.6, hx + 2, hy + 2.6, 4, 0.7, 1, c.bone);
      // a circlet of dark iron sunk into the brow, one burning gem
      g.beginPath(); g.ellipse(hx, hy - 5.2, 5.2, 1.4, 0, Math.PI, Math.PI * 2); g.strokeStyle = sh(c.trim, -0.45); g.lineWidth = 1.3; g.stroke();
      g.strokeStyle = sh(c.trim, 0.15); g.lineWidth = 0.35; g.stroke();
      P.path(g, [hx - 1.2, hy - 5.8, hx, hy - 8.2, hx + 1.2, hy - 5.8, hx, hy - 4.8]); P.fill(g, P.lg(g, hx, hy - 8, hx, hy - 5, [sh(c.trim, 0.2), sh(c.trim, -0.5)])); // a single raised setting
      P.circle(g, hx, hy - 6.2, 0.7, c.eye); P.glow(g, hx, hy - 6.2, 2.6, c.eye, 0.6);
      // staff: gnarled, crowned with a horned skull and a caged orb
      P.line(g, 34.4, 47, 36, 9, 1.3, P.lg(g, 34, 0, 36, 0, ['#3a2a30', '#140a10']));
      for (let i = 0; i < 4; i++) P.line(g, 35 + (i % 2) * 0.8, 14 + i * 8, 36.2 - (i % 2) * 0.8, 16 + i * 8, 0.5, '#241418');
      P.path(g, [29.4, 15.4, 33.4, 19.6, 37, 22.8, 34.6, 24, 33, 22.8, 28.6, 20.6]); P.fill(g, P.lg(g, 29, 15, 37, 24, [sh(r, 0.25), sh(r, -0.35)])); // the near sleeve
      P.bone(g, 32, 19, 35.4, 22.6, 0.8, sh(c.bone, -0.15)); claws(g, 35.8, 22.8, -0.4, 3, 1.6, 0.4, c.bone);
      P.circle(g, 36, 8.4, 2.6, P.vol(g, 36, 8, 2.6, sh(c.bone, -0.1)));
      horn(g, 34.4, 7, 31, 3, 32.4, 0.4, 0.7, '#d8ccb0'); horn(g, 37.6, 7, 41, 3, 39.6, 0.4, 0.7, '#d8ccb0');
      P.ell(g, 35.2, 8.4, 0.7, 0.6, VOID); P.ell(g, 36.9, 8.4, 0.7, 0.6, VOID);
      P.glow(g, 36, 3.6, 9, c.orb, 0.75); P.circle(g, 36, 3.6, 2.2, P.vol(g, 36, 3.6, 2.2, c.orb));
    } });

  /* ---------- Archdemon: a hulking horned fiend, lava in its veins, fire in its maw ---------- */
  def('demon', { w: 60, h: 52, frames: 2,
    colors: { skin: '#8a1a22', wing: '#3a0a10', eye: '#ffc030', horn: '#241410' },
    variants: { purple: { skin: '#5e1a78', wing: '#26082e', eye: '#ff80ff', horn: '#140a14' } },
    draw(g, f, c) {
      // an archdemon: vast wings, two great horns sweeping forward, a body split by veins of fire, hellfire in one hand
      const s = c.skin, sd = sh(s, -0.5), up = f === 0, w = f ? 1.4 : 0, hc = c.horn === '#241410' ? '#6a5040' : '#5a4a5a';
      P.glow(g, 30, 26, 26, c.eye, 0.12);
      wing(g, 24, 16, -1, 1.05, up, c.wing); wing(g, 34, 15, 1, 1.05, up, c.wing);
      g.beginPath(); g.moveTo(24, 36); g.bezierCurveTo(14, 40, 8, 47, 3, 43); g.strokeStyle = sd; g.lineWidth = 2; g.stroke(); // a thick tail
      g.beginPath(); g.moveTo(3, 43); g.quadraticCurveTo(1.4, 40, 2.6, 38.6); g.strokeStyle = sd; g.lineWidth = 1.2; g.stroke();
      // digitigrade legs, cloven hooves
      limb(g, 25, 34, 20.4 - w, 40, 3, 2.2, sd); limb(g, 20.4 - w, 40, 23 - w, 47, 2, 1.4, sd); P.path(g, [21 - w, 47, 25.6 - w, 47, 25 - w, 50, 21 - w, 50]); P.fill(g, c.horn);
      limb(g, 35, 34, 39.6 + w, 40, 3, 2.2, sh(s, -0.25)); limb(g, 39.6 + w, 40, 37 + w, 47, 2, 1.4, sh(s, -0.25)); P.path(g, [35 + w, 47, 39.6 + w, 47, 39.6 + w, 50, 35.4 + w, 50]); P.fill(g, c.horn);
      limb(g, 20, 17, 14, 26, 3, 2.4, sd); limb(g, 14, 26, 14, 33, 2.4, 2, sd); claws(g, 14, 34, 1.5, 4, 4, 0.9, '#e8dcc0');
      // a heavy torso, veins of fire, a loincloth of chains
      g.beginPath(); g.moveTo(19, 17); g.quadraticCurveTo(30, 9, 42, 15); g.lineTo(39, 34); g.quadraticCurveTo(30, 38, 22, 35); g.closePath();
      P.fill(g, P.lg(g, 20, 11, 40, 36, [sh(s, 0.25), s, sh(s, -0.55)]));
      g.strokeStyle = G.rgba(c.eye, 0.45); g.lineWidth = 1.4; g.beginPath(); g.moveTo(27, 18); g.lineTo(29, 23); g.lineTo(27.4, 27); g.lineTo(29.6, 32); g.moveTo(34, 19); g.lineTo(32.6, 24); g.lineTo(34.4, 29); g.moveTo(29, 23); g.lineTo(32.6, 24); g.stroke();
      g.strokeStyle = c.eye; g.lineWidth = 0.55; g.stroke();
      P.glow(g, 30.6, 25, 7, c.eye, 0.35);
      g.strokeStyle = sh(s, -0.6); g.lineWidth = 0.6; g.beginPath(); for (let i = 0; i < 3; i++) { g.moveTo(25, 26 + i * 3); g.quadraticCurveTo(30, 27.4 + i * 3, 36, 26 + i * 3); } g.stroke();
      for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(23.4 + i * 2.4, 34.6 + Math.sin(i / 6 * Math.PI) * 1.6, 1, 0.7, 0, 0, Math.PI * 2); g.strokeStyle = '#4a4a52'; g.lineWidth = 0.5; g.stroke(); }
      // heavy shoulders
      P.ell(g, 20, 17, 5, 4, P.vol(g, 20, 16.4, 5, s)); P.ell(g, 41, 16, 5, 4, P.vol(g, 41, 15.4, 5, s));
      // near arm raised, a ball of hellfire in its talons
      limb(g, 42, 18, 47, 26, 3, 2.4, s); limb(g, 47, 26, 47, 32, 2.4, 2, s); claws(g, 47, 33, 1.2, 4, 3, 0.8, '#e8dcc0');
      P.glow(g, 48, 35, 8, '#ff7a20', 0.85); P.circle(g, 48, 35, 2.8, P.rg(g, 48, 35, 2.8, ['#fff4b0', '#ff8a20', '#b01808']));
      // the head sunk between the shoulders: two great horns sweeping forward, a burning maw
      const hx = 33, hy = 12;
      horn(g, hx - 3.4, hy - 3, hx - 12, hy - 10, hx - 3, hy - 17, 2.2, hc);
      horn(g, hx + 3, hy - 4, hx + 10, hy - 13, hx + 16, hy - 8, 2, hc);
      P.ell(g, hx, hy, 5.6, 5.4, P.vol(g, hx, hy, 5.6, s));
      P.path(g, [hx - 5, hy - 2.6, hx + 5.6, hy - 2, hx + 4.6, hy - 0.2, hx - 4.4, hy - 0.6]); P.fill(g, sd);
      evil(g, hx + 2.4, hy - 0.6, 0.85, c.eye, -0.35); evil(g, hx - 2, hy - 0.8, 0.75, c.eye, 0.35);
      maw(g, hx - 3, hy + 2, hx + 4.4, hy + 1.8, 3.4, null); P.glow(g, hx + 0.8, hy + 3.4, 2, '#ff5a10', 0.6);
    } });

  /* ---------- Mounts and riders (Lord of Anguish, Pale Horseman): two different steeds, two different riders ---------- */
  /** The joints of a walking horse, facing right, hooves on y = 45: hip or shoulder, stifle or elbow, hock or knee, fetlock. */
  function horseLegs(f) {
    const w = f ? 1 : -1;
    return [
      { far: 1, hind: 1, p: [[15.4, 23], [19.4 - w, 30], [13.4 - w * 1.6, 36.8], [14.6 - w * 2, 43]] },
      { far: 1, hind: 0, p: [[35.4, 24], [34.4 + w, 30.4], [35.8 + w * 1.6, 36.4], [35.6 + w * 2, 43]] },
      { far: 0, hind: 1, p: [[18.4, 23], [22.6 + w, 30], [16.8 + w * 1.6, 36.8], [18 + w * 2, 43]] },
      { far: 0, hind: 0, p: [[38.6, 24], [37.6 - w, 30.4], [39.2 - w * 1.6, 36.4], [39 - w * 2, 43]] },
    ];
  }
  /** A tongue of fire from (x,y) licking toward (tx,ty), in the mane colour with a hot core. */
  function tongue(g, x, y, tx, ty, wd, col) {
    const a = Math.atan2(ty - y, tx - x), nx = -Math.sin(a) * wd, ny = Math.cos(a) * wd, mx = (x + tx) / 2, my = (y + ty) / 2;
    g.beginPath(); g.moveTo(x + nx, y + ny); g.quadraticCurveTo(mx + nx * 0.9, my + ny * 0.9, tx, ty); g.quadraticCurveTo(mx - nx * 0.5, my - ny * 0.5, x - nx, y - ny); g.closePath();
    P.fill(g, P.lg(g, x, y, tx, ty, [sh(col, 0.5), col, G.rgba(col, 0.25)]));
  }
  /** The Lord of Anguish's steed: a rotted warhorse, the hide gone from its belly so the ribs cage a hellfire,
   *  a bare horse's skull with fire in the socket, bone shanks, a mane and tail of flame. */
  function boneSteed(g, f, c) {
    const s = sh(c.horse, 0.15), sd = sh(c.horse, -0.3), bone = '#d6c8a6', bd = sh(bone, -0.45), fire = c.mane, legs = horseLegs(f);
    // the tail: flames streaming back and down off the rump
    [[12.4, 20.6, 3.4 - (f ? 1 : 0), 31, 1.8], [12, 21.4, 5.6, 36 + (f ? 1 : 0), 1.6], [12.6, 20.4, 7.4 + (f ? 0.8 : 0), 25, 1.2]].forEach(([x, y, tx, ty, wd]) => tongue(g, x, y, tx, ty, wd, fire));
    P.glow(g, 7, 30, 6, fire, 0.35);
    const leg = (l) => {
      const [h, k, a, ft] = l.p, hide = l.far ? sh(sd, -0.3) : s, bn = l.far ? bd : bone;
      limb(g, h[0], h[1], k[0], k[1], l.hind ? 4 : 3, 2, hide); // the thigh or forearm, still under hide
      limb(g, k[0], k[1], a[0], a[1], 2, 1.1, l.hind ? hide : sh(hide, -0.1));
      P.bone(g, a[0], a[1], ft[0], ft[1], 0.8, bn); P.circle(g, a[0], a[1], 1.2, bn); P.circle(g, ft[0], ft[1], 0.9, bn); // bare shank, knobbed joints
      P.path(g, [ft[0] - 1.4, 43.6, ft[0] + 1.6, 43.6, ft[0] + 2, 45.2, ft[0] - 1.6, 45.2]); P.fill(g, '#140c10');
      if (c.flame) P.glow(g, ft[0] + 0.2, 44.8, 2.6, fire, 0.55);
    };
    legs.filter((l) => l.far).forEach(leg);
    // the barrel: its silhouette first, dark inside, a fire burning in the cage of ribs
    P.ell(g, 27.4, 25, 14.6, 7, '#140608');
    P.glow(g, 28, 26, 7, fire, 0.6); P.ell(g, 28, 27, 3.6, 2.2, G.rgba(fire, 0.7));
    for (let i = 0; i < 4; i++) { const x = 21.6 + i * 3.4; g.beginPath(); g.moveTo(x + 1.6, 19.8); g.quadraticCurveTo(x - 1.4, 23.4, x + 0.4, 30.8); g.strokeStyle = bone; g.lineWidth = 1.2; g.stroke(); g.beginPath(); g.moveTo(x + 1.9, 20.4); g.quadraticCurveTo(x - 0.8, 23.8, x + 0.9, 30.4); g.strokeStyle = bd; g.lineWidth = 0.4; g.stroke(); }
    P.line(g, 21, 31, 34.6, 30.6, 0.9, bd); // the breastbone under them
    // the hide still left: the rump and haunch, the shoulder and chest, a strip along the spine, torn at the edges
    g.beginPath(); g.moveTo(12.6, 22); g.quadraticCurveTo(13.4, 17.4, 19, 17.8); g.lineTo(23, 18.6); g.lineTo(22, 21.4); g.lineTo(23.6, 24); g.lineTo(21.4, 26.4); g.lineTo(22.6, 29.6); g.quadraticCurveTo(16, 31.6, 13.4, 27.4); g.closePath();
    P.fill(g, P.lg(g, 13, 17, 22, 31, [sh(s, 0.35), s, sd]));
    P.ell(g, 17, 22.6, 4.2, 4, P.vol(g, 16, 21.4, 4.4, s)); // the haunch
    P.path(g, [21, 18.4, 36, 18.2, 35.4, 20.4, 30, 20.2, 26, 21, 21.6, 20.6]); P.fill(g, P.lg(g, 21, 18, 21, 21, [sh(s, 0.3), sd])); // the spine
    g.beginPath(); g.moveTo(34.6, 18.6); g.lineTo(39.6, 17.6); g.quadraticCurveTo(42.8, 22, 41.6, 29.4); g.quadraticCurveTo(38, 31.4, 34.8, 30.4); g.lineTo(35.8, 27.6); g.lineTo(34, 25.2); g.lineTo(35.6, 22.6); g.closePath();
    P.fill(g, P.lg(g, 35, 17, 41, 31, [sh(s, 0.35), s, sd]));
    // the neck, arched up to the poll, the vertebrae showing through along the crest
    g.beginPath(); g.moveTo(35.4, 20); g.quadraticCurveTo(38.6, 12.4, 43.4, 7.6); g.lineTo(47.4, 10.2); g.quadraticCurveTo(44.6, 17, 42.2, 27); g.closePath();
    P.fill(g, P.lg(g, 38, 8, 46, 26, [sh(s, 0.3), s, sd]));
    for (let i = 0; i < 4; i++) P.circle(g, 37.8 + i * 1.5, 16.4 - i * 2.4, 0.75, bone);
    // a mane of fire along the crest
    // a mane of fire: three broad overlapping flames rising back off the crest, each with a hot core
    const fl = f ? 0.8 : 0;
    [[43.4, 8.6, 37.6 - fl, 1.6, 2.6], [40.8, 12.4, 33.2 - fl, 6.4, 2.8], [38.4, 16.6, 31 - fl, 12.8, 2.4]].forEach(([x, y, tx, ty, wd]) => {
      tongue(g, x, y, tx, ty, wd, sh(fire, -0.15)); tongue(g, x - 0.4, y + 0.2, (x + tx) / 2 + 0.6, (y + ty) / 2 + 0.6, wd * 0.5, '#ffd050'); });
    P.glow(g, 39, 11, 5, fire, 0.3);
    legs.filter((l) => !l.far).forEach(leg);
    // the head: a bare horse's skull, one torn ear of hide, fire in the socket, a jaw of long teeth, a bridle
    P.path(g, [43.6, 8.4, 43.2, 3.6, 45.6, 7.6]); P.fill(g, sd);
    P.ell(g, 45.8, 9.6, 2.6, 2.3, P.vol(g, 45, 8.8, 2.6, bone)); // the cranium, small
    P.path(g, [45, 8, 48.4, 8.6, 54.2, 14.6, 54.6, 16.2, 53.2, 16.8, 48.6, 13.6, 45.4, 12]); P.fill(g, P.lg(g, 45, 8, 53, 17, [sh(bone, 0.25), bone, bd])); // the long narrow face
    P.path(g, [46.4, 12.4, 49.4, 14.4, 53.4, 17.2, 53, 18.2, 48.4, 16.4, 45.6, 14]); P.fill(g, sh(bone, -0.35)); // the lower jaw, hanging open
    P.path(g, [48.6, 13.8, 53.4, 16.8, 53.2, 17.4, 48.4, 14.8]); P.fill(g, '#140404'); teeth(g, 50.4, 15, 54, 16.7, 3, 0.7, 1, bone);
    P.ell(g, 52.4, 14.2, 0.8, 0.45, VOID, 0.7); // the nasal hole
    P.path(g, [46, 8.4, 48.4, 8.8, 48.2, 11.4, 46.2, 11.4]); P.fill(g, VOID); // the orbit, high and set back
    evil(g, 47.2, 9.9, 0.75, c.eye, 0.3); P.glow(g, 47.2, 9.9, 3, c.eye, 0.6);
    P.line(g, 45.6, 11.6, 50, 14.2, 0.5, '#2a1414'); P.circle(g, 50.2, 14.2, 0.55, '#8a6a3a'); // the bridle
    // the saddle, black leather, a crimson cloth under it
    P.path(g, [22.8, 18.6, 31.2, 18.6, 30.8, 21.8, 23.2, 21.8]); P.fill(g, P.lg(g, 22, 18, 22, 22, [sh('#6a0e14', 0.2), '#4a0a10']));
    P.path(g, [23, 17.2, 30.6, 17.4, 31.8, 19.4, 22.4, 19.4]); P.fill(g, '#1e1418');
  }
  /** The Lord of Anguish: a knight in scorched plate, a horned great helm with a burning slit, a crimson cloak,
   *  one great pauldron with a hook, a broad greatsword raised with fire along its edge. Hips at (x,y), scale k. */
  function hellKnight(g, f, x, y, k, mounted) {
    g.save(); g.translate(x, y); g.scale(k, k);
    const m = '#4a4048', ml = sh(m, 0.45), md = sh(m, -0.5), trim = '#c86a2a', cl = '#6a0e14', glow = '#ff6a1a', w = f ? 0.8 : 0;
    // the cloak streaming back, torn at the hem
    g.beginPath(); g.moveTo(-3.8, -14.6); g.bezierCurveTo(-9.6, -9, -12.4 - w, -1, -13.4 - w, mounted ? 3 : 9); g.lineTo(-2.4, mounted ? 1 : 6); g.lineTo(0.6, -13.6); g.closePath();
    P.fill(g, P.lg(g, -13, -14, 0, 8, [sh(cl, 0.25), cl, sh(cl, -0.55)]));
    P.rag(g, -13.4 - w, mounted ? 2.6 : 8.6, -2.4, mounted ? 0.6 : 5.6, 4, 3, sh(cl, -0.45));
    // legs
    if (mounted) {
      P.limb(g, 0.6, 0, 6, 1.8, 2.3, 1.8, m); P.circle(g, 6, 1.8, 1.7, P.vol(g, 5.4, 1.2, 1.8, ml)); // thigh along the flank, the knee plate
      P.limb(g, 6, 1.8, 5, 8.6, 1.7, 1.3, m); P.path(g, [3.8, 8, 8.4, 8.4, 8.4, 9.8, 3.6, 9.8]); P.fill(g, '#1a1418'); // shin, sabaton
      P.line(g, 3.2, 10.4, 8.8, 10.4, 0.5, '#8a8a92'); P.line(g, 4.4, 10.4, 5.6, 3, 0.3, '#2a2024'); // the stirrup
    } else {
      P.limb(g, -1.6, 0, -2.8 - w, 8, 2.2, 1.7, md); P.limb(g, -2.8 - w, 8, -2.4 - w, 15, 1.7, 1.3, md); P.path(g, [-4.8 - w, 14.4, -0.4 - w, 14.6, 0.2 - w, 16.4, -5 - w, 16.4]); P.fill(g, '#141014');
      P.limb(g, 2, 0, 3.4 + w, 8, 2.3, 1.8, m); P.limb(g, 3.4 + w, 8, 2.8 + w, 15, 1.8, 1.4, m); P.path(g, [1 + w, 14.4, 6 + w, 14.6, 6.8 + w, 16.4, 0.8 + w, 16.4]); P.fill(g, '#1a1418');
      P.circle(g, 3.4 + w, 8, 1.6, P.vol(g, 2.9 + w, 7.4, 1.7, ml)); // the knee plate
    }
    // the far arm, holding the reins or hanging with a clenched gauntlet
    P.limb(g, -4, -12.8, -6.4, -6.8, 1.7, 1.4, m); P.circle(g, -6.4, -6.8, 1.2, m); P.limb(g, -6.4, -6.8, mounted ? -3 : -6, mounted ? -3.6 : -1.2, 1.4, 1.2, m); P.circle(g, mounted ? -3 : -6, mounted ? -3.4 : -0.8, 1.3, P.vol(g, -6.4, -1.4, 1.3, ml));
    // plated skirt, then the cuirass: broad at the chest, narrow at the waist, a ridge down the middle
    for (let i = 0; i < 3; i++) P.rrect(g, -3.6 + i * 2.5, -0.6, 2.4, 3.8 - (i === 1 ? 0 : 0.7), 0.6, P.lg(g, 0, 0, 0, 4, [ml, md]));
        g.beginPath(); g.moveTo(-5.2, -14.6); g.lineTo(5.8, -14.6); g.quadraticCurveTo(6, -9, 3, -4.6); g.quadraticCurveTo(2.6, -2.4, 3.2, -1); g.lineTo(-2.8, -1); g.quadraticCurveTo(-2.2, -2.6, -3, -4.6); g.quadraticCurveTo(-5.8, -9, -5.2, -14.6); g.closePath();
    P.fill(g, P.lg(g, -4, -14, 4, -1, [ml, m, md]));
    // a breastplate of two swelling plates over the chest, a banded belly below
    P.ell(g, -1.6, -10.4, 3, 3.2, P.vol(g, -2.2, -11.6, 3.2, m), 0.2); P.ell(g, 2.8, -10.4, 3, 3.2, P.vol(g, 2.2, -11.6, 3.2, sh(m, 0.1)), -0.2);
    P.path(g, [0.6, -13.6, 1.2, -13.6, 1, -7.4, 0.8, -7.4]); P.fill(g, sh(m, 0.6)); // the ridge
    for (let i = 0; i < 2; i++) P.rrect(g, -2.6 + i * 0.2, -6.6 + i * 2.2, 5.6 - i * 0.4, 2, 0.6, P.lg(g, 0, -6.6 + i * 2.2, 0, -4.6 + i * 2.2, [ml, md]));
    P.rrect(g, -3.6, -1.8, 7.4, 1.3, 0.4, sh(trim, -0.35)); P.circle(g, 0.4, -1.1, 0.7, trim); // the belt
    // the far pauldron, then the helm, then the great near pauldron
    P.ell(g, -3.4, -13.4, 2.6, 2, P.vol(g, -3.8, -14, 2.6, m));
    // a great helm: rounded crown, a jutting face-plate, a burning slit; two horns sweeping forward
    horn(g, -1.4, -20.6, -5.6, -24.6, -2.4, -27.6, 0.9, '#d8ccb0');
    P.path(g, [-2.6, -14, -3, -19.6, -1.4, -22.2, 1.8, -22.4, 3.6, -20.4, 4.4, -17, 3.4, -14]); P.fill(g, P.lg(g, -3, -22, 4, -14, [ml, m, md]));
    P.path(g, [1.2, -21.4, 3.6, -20.4, 4.8, -16.6, 3.4, -14.4, 1.6, -15]); P.fill(g, P.lg(g, 1, -21, 5, -14, [sh(m, 0.3), md])); // the face-plate, turned toward us
    P.rect(g, 0.4, -18.6, 4.2, 0.8, '#0a0406'); P.glow(g, 2.6, -18.2, 2.2, glow, 0.8); P.rect(g, 1, -18.5, 3.2, 0.45, sh(glow, 0.3));
    horn(g, 2.4, -21, 6.6, -25.2, 8.6, -21.4, 1, '#d8ccb0');
    P.ell(g, 4, -13.2, 3.2, 2.4, P.vol(g, 3.4, -14, 3.2, sh(m, 0.2)));
    P.ell(g, 4.4, -12.2, 2.9, 1.6, P.lg(g, 0, -13, 0, -10.6, [m, md])); // a second plate under it
    P.line(g, 1.2, -14.6, 7, -13.8, 0.35, trim);
    P.path(g, [2.4, -15, 1.6, -18.6, 3.6, -15.4]); P.fill(g, '#2a2024'); // a hook on the pauldron
    // the near arm raising the greatsword, the blade broad and long with fire along its edge
    P.limb(g, 5, -12.4, 9.2, -8, 1.9, 1.5, ml); P.circle(g, 9.2, -8, 1.4, P.vol(g, 8.8, -8.4, 1.4, ml)); P.limb(g, 9.2, -8, 10.6, -11.4, 1.5, 1.3, ml); // upper arm, the elbow couter, the forearm
    g.save(); g.translate(10.6, -11.6); g.rotate(0.46);
    P.glow(g, 0, -9.6, 5, glow, 0.35);
    P.path(g, [-1.1, -1.4, 1.1, -1.4, 0.9, -15.4, 0, -17.4, -0.9, -15.4]); P.fill(g, P.lg(g, -1.1, 0, 1.1, 0, ['#e8ecf4', '#9aa0ae', '#4a505e']));
    P.line(g, 0, -1.6, 0, -14.6, 0.3, '#3a4050'); // the fuller
    P.line(g, 1, -2, 0.8, -15, 0.35, glow); // the burning edge
    P.rrect(g, -3.2, -1.8, 6.4, 1, 0.4, '#2a2024'); P.line(g, -3, -1.6, 3, -1.6, 0.3, trim); // the crossguard
    P.line(g, 0, -0.8, 0, 2.2, 0.9, '#2a1a14'); P.circle(g, 0, 2.6, 0.7, trim); // grip, pommel
    g.restore();
    P.circle(g, 10.6, -11.6, 1.4, P.vol(g, 10.2, -12, 1.4, ml)); // the gauntlet on the grip
    g.restore();
  }
  def('anguish', { w: 56, h: 62, cy: 36, frames: 2,
    colors: { horse: '#2a1e22', mane: '#ff4a14', eye: '#ff7a20', flame: true },
    draw(g, f, c) {
      g.translate(0, 10); P.glow(g, 28, 26, 22, c.mane, 0.12);
      boneSteed(g, f, c);
      hellKnight(g, f, 26.6, 17.6, 0.94, true);
    } });
  def('anguish_foot', { w: 40, h: 58, cy: 32, frames: 2,
    colors: {},
    draw(g, f) {
      g.translate(0, 5); P.glow(g, 20, 22, 20, '#ff4a14', 0.2);
      hellKnight(g, f, 16, 30, 1.28, false);
    } });

  /** The Pale Horseman's steed: a drowned horse come back as a spirit, lean and pale under a rotting caparison,
   *  a long mane and tail streaming like water, legs that thin into mist before they touch the ground. */
  function paleSteed(g, f, c) {
    const s = sh(c.horse, 0.3), sl = sh(c.horse, 0.7), sd = sh(c.horse, -0.2), mist = c.mane, legs = horseLegs(f), wv = f ? 1 : -1;
    const strand = (x, y, pts, wd, a) => { g.beginPath(); g.moveTo(x, y - wd); let px = x, py = y; pts.forEach(([qx, qy], i) => { g.quadraticCurveTo((px + qx) / 2 + (i % 2 ? 1 : -1) * wv * 0.8, (py + qy) / 2 - wd * (1 - i / pts.length), qx, qy); px = qx; py = qy; });
      for (let i = pts.length - 2; i >= 0; i--) g.lineTo(pts[i][0], pts[i][1] + wd * (1 - i / pts.length)); g.lineTo(x, y + wd); g.closePath(); P.fill(g, P.lg(g, x, y, px, py, [G.rgba(sh(mist, 0.3), 0.95), G.rgba(mist, 0.7), G.rgba(mist, 0.1)])); };
    // the tail: long strands streaming back
    strand(13.4, 21.6, [[9, 24 + wv], [5.4, 30], [3, 37 - wv]], 2); strand(13.4, 22, [[10, 26.4], [7.6, 33 + wv], [6.4, 39]], 1.6);
    const leg = (l) => {
      const [h, k, a, ft] = l.p, col = l.far ? sd : s;
      limb(g, h[0], h[1], k[0], k[1], l.hind ? 3.8 : 2.8, 1.9, col); limb(g, k[0], k[1], a[0], a[1], 1.7, 1.1, col); P.circle(g, a[0], a[1], 1.3, P.vol(g, a[0] - 0.4, a[1] - 0.4, 1.3, col));
      g.save(); g.globalAlpha = 0.5; limb(g, a[0], a[1], ft[0], ft[1] - 1, 1.1, 0.4, col); g.restore(); // thinning into mist
      P.glow(g, ft[0], 43.4, 2.8, mist, 0.35); P.ell(g, ft[0] + 0.4, 44, 2.2, 0.6, G.rgba(mist, 0.4));
    };
    legs.filter((l) => l.far).forEach(leg);
    // the barrel, the haunch and the shoulder, lean, the ribs showing
    P.ell(g, 27.4, 24.4, 14.4, 6.6, P.lg(g, 14, 18, 40, 31, [sl, s, sd]));
    P.ell(g, 17, 22.6, 4.4, 4.2, P.vol(g, 16, 21.4, 4.6, s)); P.ell(g, 37.6, 23.4, 4, 5, P.vol(g, 36.8, 22, 4.4, s));
    g.strokeStyle = sd; g.lineWidth = 0.5; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(23 + i * 2.6, 23, 4.6, 0.7, 1.9); g.stroke(); }
    // a rotting caparison over the back, torn and dripping
    g.beginPath(); g.moveTo(19, 18.4); g.lineTo(34, 18.2); g.quadraticCurveTo(36, 24, 35, 28.6); g.lineTo(18.6, 28.6); g.quadraticCurveTo(17.4, 23, 19, 18.4); g.closePath();
    P.fill(g, P.lg(g, 19, 18, 34, 29, ['#2e4a4c', '#1a2c30', '#0e1a1e']));
    P.rag(g, 18.6, 28.4, 35, 28.4, 5, 2.4, '#0e1a1e');
    P.line(g, 19.2, 19.6, 33.8, 19.4, 0.5, '#6a8a7a'); // a tarnished trim
    [[21, 31.4], [27, 31.8], [32.6, 31]].forEach(([x, y]) => P.ell(g, x, y + (f ? 0.6 : 0), 0.4, 0.8, G.rgba(mist, 0.7))); // drips
    // the neck and a whole horse's head: ears, a round jowl, a long face, a cold eye, a bridle
    g.beginPath(); g.moveTo(35.4, 20); g.quadraticCurveTo(38.6, 12.4, 43.4, 7.6); g.lineTo(47.4, 10.2); g.quadraticCurveTo(44.6, 17, 42.2, 27); g.closePath();
    P.fill(g, P.lg(g, 38, 8, 46, 26, [sl, s, sd]));
    P.path(g, [44, 8.4, 44.2, 4, 45.8, 7.8]); P.fill(g, sl); P.path(g, [42.8, 8.8, 42.2, 4.8, 44, 8.2]); P.fill(g, sd);
    g.beginPath(); g.moveTo(43.4, 8.4); g.quadraticCurveTo(46.4, 7.6, 48, 9.6); g.lineTo(52.8, 14.8); g.quadraticCurveTo(53.8, 16.8, 52.2, 17.8); g.lineTo(49.4, 17.6);
    g.quadraticCurveTo(47, 16.4, 45.6, 16.6); g.quadraticCurveTo(42.8, 15.4, 43.4, 8.4); g.closePath();
    P.fill(g, P.lg(g, 44, 8, 50, 18, [sl, s, sd]));
    P.circle(g, 45.6, 13, 2.4, P.vol(g, 45, 12, 2.4, s));
    P.circle(g, 52.4, 15.2, 0.5, VOID); P.path(g, [49.4, 17, 52.8, 17.2, 52.2, 17.8, 49.4, 17.6]); P.fill(g, '#0a1418');
    P.ell(g, 46.8, 10.8, 1.5, 1.1, VOID, 0.6); evil(g, 47, 10.9, 0.8, c.eye, 0.5); P.glow(g, 47, 10.9, 3.4, c.eye, 0.7);
    P.line(g, 49.6, 17.4, 53, 16.6, 0.45, '#0a1418'); P.path(g, [48.4, 9, 52.6, 14.2, 51.8, 14.4]); P.fill(g, G.rgba(sl, 0.8)); // the mouth line, the lit bridge
    P.line(g, 44.6, 12.6, 49.8, 16.4, 0.5, '#1a2428'); P.line(g, 45.2, 9.2, 45.6, 15.4, 0.5, '#1a2428'); P.circle(g, 49.8, 16.2, 0.5, '#8a9a9a'); // the bridle
    // a mane streaming back off the crest like water
    strand(43.4, 8.4, [[40, 9 + wv * 0.4], [36.4, 8], [32.4, 10 - wv * 0.6]], 1.2); strand(41.6, 12, [[37.6, 13], [34, 13.4 + wv * 0.5], [30.6, 16]], 1.2); strand(39.6, 16, [[36, 17.4], [32.6, 19 + wv * 0.4]], 1);
    legs.filter((l) => !l.far).forEach(leg);
  }
  /** The Pale Horseman: a drowned wraith, a deep hood with two cold eyes, a cloak streaming into rags,
   *  bony hands, a long barbed lance couched under the arm with a torn pennant. Hips at (x,y). */
  function wraithRider(g, f, x, y, k) {
    g.save(); g.translate(x, y); g.scale(k, k);
    const cl = '#26363e', cll = sh(cl, 0.5), cld = sh(cl, -0.5), bone = '#c8d4d0', glow = '#80f0ff', w = f ? 1 : 0;
    // the cloak streaming far back behind the rider, in long rags
    g.beginPath(); g.moveTo(-2.6, -15.6); g.bezierCurveTo(-8, -12, -13 - w, -6, -17 - w, -2); g.lineTo(-10, 2); g.lineTo(-4, 4); g.lineTo(1.4, -12); g.closePath();
    P.fill(g, P.lg(g, -17, -14, 0, 4, [G.rgba(cld, 0.6), cl, cld]));
    P.rag(g, -17 - w, -2.4, -4, 3.6, 4, 3.4, G.rgba(cld, 0.9));
    // the robe over the leg, a bony foot in the stirrup
    g.beginPath(); g.moveTo(-3, -2); g.lineTo(3.8, -2); g.lineTo(7, 3); g.lineTo(6, 8); g.lineTo(2.6, 7); g.lineTo(-1.4, 3); g.closePath(); P.fill(g, P.lg(g, -3, -2, 6, 8, [cll, cl, cld]));
    P.rag(g, 2, 7.2, 7, 7.6, 2, 1.6, cld);
    P.path(g, [4.4, 8.4, 7.8, 8.8, 7.6, 9.8, 4.2, 9.6]); P.fill(g, bone); P.line(g, 3.6, 10.4, 8.6, 10.4, 0.5, '#6a7a7a');
    // the body: narrow, stooped, a mantle over the shoulders
    g.beginPath(); g.moveTo(-3.6, -14); g.quadraticCurveTo(0.4, -16.4, 4.6, -13.6); g.quadraticCurveTo(4.6, -6, 3.6, -1.4); g.lineTo(-3, -1.4); g.quadraticCurveTo(-4.6, -8, -3.6, -14); g.closePath();
    P.fill(g, P.lg(g, -4, -15, 4, -1, [cll, cl, cld]));
    g.strokeStyle = cld; g.lineWidth = 0.4; for (const xx of [-1.4, 1.6]) { g.beginPath(); g.moveTo(xx, -13); g.quadraticCurveTo(xx + 0.4, -7, xx - 0.2, -2); g.stroke(); } // folds
    P.line(g, -3, -2.2, 3.6, -2.2, 0.7, '#4a5a58'); // a cord at the waist
    // the hood: peaked, pulled forward, black inside, two cold eyes
    g.beginPath(); g.moveTo(-3.2, -13.2); g.quadraticCurveTo(-4.6, -19.4, -0.6, -22.8); g.quadraticCurveTo(3.8, -22.4, 5.4, -17.2); g.quadraticCurveTo(5, -14.6, 3.4, -13.6); g.closePath();
    P.fill(g, P.lg(g, -4, -23, 5, -13, [cll, cl, cld]));
    P.ell(g, 2.4, -17.2, 2.2, 2.8, VOID, 0.2);
    evil(g, 3.2, -17.6, 0.45, glow, -0.2); evil(g, 1.8, -17.7, 0.36, glow, 0.2); P.glow(g, 2.6, -17.4, 2.6, glow, 0.4);
    // the near arm couching the lance: a long shaft from behind the rider to past the horse's head
    g.save(); g.translate(-8, -4); g.rotate(-0.36);
    P.line(g, 0, 0, 36, 0, 0.8, P.lg(g, 0, 0, 36, 0, ['#2a2220', '#4a3a30']));
    P.path(g, [35.6, -0.6, 42, 0, 35.6, 0.6]); P.fill(g, P.lg(g, 36, 0, 42, 0, ['#8a9aa4', '#e8f4ff']));
    P.path(g, [36.6, -0.4, 35.4, -1.8, 37.6, -0.4]); P.fill(g, '#b8c8d0'); P.path(g, [36.6, 0.4, 35.4, 1.8, 37.6, 0.4]); P.fill(g, '#8a9aa4'); // barbs
    P.glow(g, 39.4, 0, 2.6, glow, 0.6);
    g.beginPath(); g.moveTo(31.4, 0.4); g.lineTo(34.6, 0.4); g.lineTo(33.6 - w * 0.6, 3.4); g.lineTo(32.6, 2.2); g.lineTo(31.2, 4 + w * 0.4); g.closePath(); P.fill(g, '#4a1a1e'); // a torn pennant
    g.restore();
    P.limb(g, 3.4, -13, 6, -7.6, 1.8, 1.4, cll); P.limb(g, 6, -7.6, 8.6, -8.6, 1.6, 1.4, cll); P.path(g, [6.6, -9.8, 9.6, -9.6, 9, -7, 6.4, -6.8]); P.fill(g, cl); // a wide sleeve
    P.circle(g, 8.8, -8.8, 1, bone); P.claws(g, 9.2, -8.6, 1.3, 3, 1, 0.3, bone); // a bony hand round the shaft
    g.restore();
  }
  def('horseman', { w: 56, h: 62, cy: 36, frames: 2,
    colors: { horse: '#4e5c64', mane: '#9ae8ff', eye: '#80f0ff' },
    draw(g, f, c) {
      g.translate(0, 10); P.glow(g, 28, 30, 22, c.mane, 0.1);
      paleSteed(g, f, c);
      wraithRider(g, f, 26.6, 17.6, 0.94);
    } });

  /* ---------- Imp Overlord: a bloated tyrant with tusks, an iron crown and a spiked maul ---------- */
  def('overlord', { w: 46, h: 46, frames: 2,
    colors: { skin: '#9a2a22', eye: '#ffd040' },
    draw(g, f, c) {
      // a bloated tyrant: a belly scarred and chained, an iron slave-collar, curled horns, tusks, a butcher's cleaver
      const s = c.skin, sd = sh(s, -0.5), w = f ? 1 : 0, iron = '#3a3a42';
      P.glow(g, 23, 26, 20, c.eye, 0.1);
      limb(g, 17, 33, 15.6 - w, 41, 3, 2.4, sd); limb(g, 28, 33, 29.4 + w, 41, 3, 2.4, sh(s, -0.25));
      P.ell(g, 15.6 - w, 42.6, 2.8, 1.4, '#1a100c'); P.ell(g, 29.4 + w, 42.6, 2.8, 1.4, '#1a100c');
      // far arm hanging, a chain wound round the wrist
      limb(g, 12, 20, 8, 27, 3, 2.6, sd); limb(g, 8, 27, 9, 33, 2.6, 2.2, sd); claws(g, 9, 34, 1.4, 4, 2.6, 0.7, '#e0d6bc');
      P.rrect(g, 7, 29.6, 4.4, 2, 0.6, '#3a3a42'); // an iron shackle
      // the gut: bloated, stitched, a chain slung across it
      P.ell(g, 23, 26, 12.4, 11, P.lg(g, 11, 15, 35, 37, [sh(s, 0.25), s, sh(s, -0.55)]));
      P.ell(g, 24.4, 29, 7.6, 6.4, sh(s, 0.08));
      g.strokeStyle = sh(s, -0.65); g.lineWidth = 0.45; g.beginPath(); g.moveTo(19, 22); g.quadraticCurveTo(24, 27, 21, 34); g.stroke();
      for (let i = 0; i < 5; i++) P.line(g, 19.4 + i * 0.4, 23.4 + i * 2.2, 21.8 + i * 0.4, 23 + i * 2.2, 0.35, '#1a0a08');
      g.beginPath(); g.moveTo(12.6, 30); g.quadraticCurveTo(23, 36, 33.4, 30); g.lineTo(32, 38); g.quadraticCurveTo(23, 41, 14, 38); g.closePath(); P.fill(g, P.lg(g, 12, 30, 12, 40, ['#5a4232', '#2a1c14'])); // a blood-stained butcher's apron
      P.ell(g, 20, 35, 2, 1.2, 'rgba(110,10,14,0.7)'); P.ell(g, 27, 36.6, 1.4, 0.9, 'rgba(110,10,14,0.6)');
      P.rrect(g, 11, 31, 24, 3, 1, '#2a1c16'); P.rrect(g, 21.4, 30.4, 4.2, 4.2, 0.8, '#6a5a3a'); P.rrect(g, 22.4, 31.4, 2.2, 2.2, 0.4, '#2a1c16');
      // the iron collar and its hanging ring
      P.rrect(g, 17, 14.6, 16, 3, 1.4, P.lg(g, 0, 14.6, 0, 17.6, ['#6a6a74', iron, '#16161c']));
      // the head: jowled, horns curling back, tusks, small burning eyes
      const hx = 27, hy = 9.6;
      horn(g, hx - 3.4, hy - 2.4, hx - 10, hy - 4, hx - 9, hy - 10, 1.5, '#c8b89a'); horn(g, hx + 2.4, hy - 3.2, hx + 7, hy - 9, hx + 10.4, hy - 6.4, 1.4, '#c8b89a');
      P.circle(g, hx, hy, 5.4, P.vol(g, hx, hy, 5.4, s));
      P.ell(g, hx + 0.6, hy + 3.4, 4.6, 2.4, sh(s, -0.15)); // the jowls
      P.path(g, [hx - 4.4, hy - 1.6, hx + 5, hy - 1.2, hx + 4.4, hy + 0.2, hx - 4, hy]); P.fill(g, sd);
      evil(g, hx + 2.6, hy - 0.2, 0.6, c.eye, -0.35); evil(g, hx - 1, hy - 0.4, 0.55, c.eye, 0.35);
      P.path(g, [hx - 2.2, hy + 2.6, hx + 4.6, hy + 2.4, hx + 3.8, hy + 4.2, hx - 1.4, hy + 4.2]); P.fill(g, '#1e0404');
      P.path(g, [hx - 1.6, hy + 4.4, hx - 2.4, hy + 0.8, hx - 0.8, hy + 3.8]); P.fill(g, '#f0e6cc'); P.path(g, [hx + 3.4, hy + 4.4, hx + 4.4, hy + 0.6, hx + 4.4, hy + 3.6]); P.fill(g, '#f0e6cc');
      // near arm, a butcher's cleaver
      limb(g, 34, 19, 37, 26, 3, 2.6, s); P.circle(g, 37, 27.4, 2.6, P.vol(g, 37, 27, 2.6, s));
      P.line(g, 36.4, 28.6, 39, 20, 1.3, '#3a2616');
      g.save(); g.translate(39.4, 17); g.rotate(0.2);
      P.path(g, [-2, 3, -2.6, -9, 5.6, -11, 6.4, -6, 5, -1, 1.6, 3.4]); P.fill(g, P.lg(g, -2, -10, 6, 3, ['#9aa0aa', '#5a5e68', '#22242c']));
      P.line(g, 5.4, -10.4, 6.2, -1.4, 0.4, '#d8dce4'); P.circle(g, 0, -7, 0.8, '#16161c');
      P.ell(g, 3.4, -3, 1.4, 2.4, 'rgba(120,10,16,0.75)', 0.2);
      g.restore();
      claws(g, 36.4, 29.4, 0.6, 3, 1.8, 0.6, '#e0d6bc');
    } });

  /* ---------- Wyrm Matriarch: a dragon — serpent neck, open jaws full of fire, torn wings, spiked tail ---------- */
  def('wyrm', { w: 66, h: 50, frames: 2,
    colors: { scale: '#6a1e14', belly: '#c8864a', wing: '#3e100c', eye: '#ffd040' },
    variants: { ice: { scale: '#2a5480', belly: '#b4d8ec', wing: '#142c48', eye: '#ffffff' }, bog: { scale: '#2e4a22', belly: '#a8a868', wing: '#1a2a12', eye: '#d0ff40' } },
    draw(g, f, c) {
      // a wyvern crouched to strike: vast tattered wings raised behind, a long neck thrust low, a skull-like head with jaws agape
      const s = c.scale, sd = sh(s, -0.55), up = f === 0, w = f ? 1 : 0, bone = '#d8ccb0';
      P.glow(g, 50, 30, 18, c.eye, 0.14);
      wing(g, 27, 20, -1, 1.35, up, sh(c.wing, -0.2)); // the far wing, towering
      // tail: a whip of spines coiling low behind, a barbed tip
      g.beginPath(); g.moveTo(17, 30); g.bezierCurveTo(8, 32, 3, 40, 9, 45); g.bezierCurveTo(13, 48, 20, 46, 18, 43); g.bezierCurveTo(14, 45, 9, 42, 12, 38); g.bezierCurveTo(14, 34, 18, 34, 19, 34); g.closePath();
      P.fill(g, P.lg(g, 3, 30, 20, 48, [sh(s, 0.1), s, sd]));
      g.strokeStyle = sh(s, -0.6); g.lineWidth = 0.4; for (let i = 0; i < 5; i++) { const t = i / 5, a = Math.PI * 1.1 + t * 2.6; g.beginPath(); g.arc(11 + Math.cos(a) * 5, 40 + Math.sin(a) * 5, 1.4, a + 1.2, a + 2.2); g.stroke(); } // scale rings along the tail
      P.ell(g, 19.4, 43.8, 2.2, 1.1, sh(s, -0.2), -0.4); // the tail's heavy tip
      // hind leg: a heavy haunch, a clawed foot gripping the ground
      P.ell(g, 21, 33, 6, 5, P.lg(g, 15, 28, 27, 38, [sh(s, 0.2), s, sd]));
      limb(g, 20, 36, 17 - w, 42, 2.8, 2, sd); limb(g, 17 - w, 42, 20 - w, 47, 2, 1.4, sd); claws(g, 20 - w, 47.4, 0.05, 3, 2.8, 0.75, '#e8dcc0');
      // the body: low, ridged, a plated belly
      g.beginPath(); g.moveTo(16, 30); g.bezierCurveTo(20, 20, 34, 19, 41, 25); g.bezierCurveTo(43, 30, 40, 36, 33, 37); g.bezierCurveTo(26, 38, 18, 37, 16, 30); g.closePath();
      P.fill(g, P.lg(g, 16, 19, 40, 37, [sh(s, 0.3), s, sd]));
      g.beginPath(); g.moveTo(22, 35.4); g.quadraticCurveTo(31, 38.4, 39, 33); g.lineTo(38, 31); g.quadraticCurveTo(31, 35.6, 22, 33); g.closePath(); P.fill(g, P.lg(g, 22, 31, 22, 38, [sh(c.belly, -0.2), sh(c.belly, -0.55)]));
      g.strokeStyle = sh(c.belly, -0.65); g.lineWidth = 0.4; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(24 + i * 2.6, 33.4 + Math.sin(i / 2) * 0.6); g.lineTo(24.6 + i * 2.6, 36.2); g.stroke(); }
      g.strokeStyle = sh(s, 0.35); g.lineWidth = 0.9; g.beginPath(); g.moveTo(17, 25); g.bezierCurveTo(24, 20.4, 32, 20, 40, 24); g.stroke(); // a ridge of plated scales down the spine
      g.strokeStyle = sh(s, -0.55); g.lineWidth = 0.3; for (let i = 0; i < 8; i++) { const x = 19 + i * 2.7; g.beginPath(); g.moveTo(x, 22.4 - Math.sin(i / 7 * Math.PI) * 1.4); g.lineTo(x + 0.6, 24.4 - Math.sin(i / 7 * Math.PI) * 1.2); g.stroke(); }
      // foreleg braced forward, talons splayed
      limb(g, 37, 33, 41 + w, 40, 2.4, 1.8, sh(s, -0.25)); limb(g, 41 + w, 40, 39 + w, 46, 1.8, 1.3, sh(s, -0.25)); claws(g, 39 + w, 46.6, 0.05, 4, 3, 0.7, '#e8dcc0');
      // neck thrust forward and low, a mane of spines
      g.beginPath(); g.moveTo(37, 24); g.bezierCurveTo(44, 21, 48, 22, 53, 25); g.lineTo(54, 31); g.bezierCurveTo(48, 29, 44, 31, 40, 33); g.closePath();
      P.fill(g, P.lg(g, 37, 21, 54, 33, [sh(s, 0.25), s, sd]));
      g.strokeStyle = sh(c.belly, -0.3); g.lineWidth = 0.9; g.beginPath(); g.moveTo(41, 31.6); g.bezierCurveTo(46, 29, 50, 29, 53.4, 30.4); g.stroke();
      g.strokeStyle = sh(s, 0.3); g.lineWidth = 0.7; g.beginPath(); g.moveTo(38, 23.4); g.bezierCurveTo(44, 21, 48, 21.6, 53, 24.4); g.stroke(); // the neck's ridge
      // the head: a long horned skull, brow ridges hooding burning eyes, jaws wide on a throat of fire
      horn(g, 54, 22.6, 48, 17, 44, 14.6, 1.3, bone); horn(g, 56, 21.6, 53, 15, 50, 11.6, 1.1, sh(bone, -0.1));
      P.ell(g, 57, 26, 5, 4.2, P.vol(g, 57, 25.4, 5, s));
      P.path(g, [57, 22.6, 66, 25.2, 65.6, 27, 58, 27.6]); P.fill(g, P.lg(g, 57, 22, 66, 28, [sh(s, 0.2), sd]));       // upper jaw
      P.path(g, [57.6, 30.6, 64.6, 34.6, 63.4, 36, 56.4, 32.4]); P.fill(g, sd);                                      // lower jaw hanging wide
      P.path(g, [57.6, 27.6, 65.4, 27, 64.4, 34.4, 57.2, 30.4]); P.fill(g, '#200402');
      P.glow(g, 61, 30, 6, '#ff7a20', 0.9); P.ell(g, 60, 30, 2.6, 1.4, '#ffd070', 0.5);
      teeth(g, 57.8, 27.6, 65.2, 27, 7, 1.3, 1); teeth(g, 57.6, 30.8, 63.8, 34.8, 6, 1.1, -1);
      P.path(g, [61, 27.2, 61.4, 31, 62, 27.1]); P.fill(g, '#fff4e0'); // a great fang
      P.path(g, [53, 22.4, 61, 22.8, 60, 24.8, 54, 25]); P.fill(g, sh(s, -0.7)); // the brow ridge
      evil(g, 58.2, 24.4, 0.95, c.eye, -0.35);
      for (let i = 0; i < 3; i++) P.circle(g, 62 + i * 0.8, 33.6 + i * 1.3, 0.3, 'rgba(255,160,60,0.8)'); // embers dripping from the jaw
      wing(g, 29, 21, 1, 0.9, up, c.wing); // the near wing
    } });

  /* ---------- Basilisk: a crowned serpent-lizard whose stare turns flesh to stone ---------- */
  def('basilisk', { w: 60, h: 40, frames: 2,
    colors: { scale: '#3a5e2e', belly: '#a8b070', crest: '#b02a1e', eye: '#ffe040' },
    variants: { ice: { scale: '#34648a', belly: '#c4e0f0', crest: '#8ff0ff', eye: '#ffffff' }, bog: { scale: '#4a4a22', belly: '#a09860', crest: '#8ac030', eye: '#ff6040' } },
    draw(g, f, c) {
      // the serpent king: a great coil on the ground, a hooded head rearing over it, a stare that turns flesh to stone
      const s = c.scale, sd = sh(s, -0.55), sw = f ? 1.2 : -1.2, bone = '#e8dcc0';
      P.glow(g, 46, 12, 16, c.eye, 0.3);
      // the coil: a thick ring of body lying on the ground, the tail tapering off to the left
      // the coils: a heap of body looped on itself, each loop's edge picked out by a dark groove
      P.ell(g, 24, 30, 15.6, 6.8, P.lg(g, 9, 23, 39, 37, [sh(s, 0.25), s, sd]));
      P.ell(g, 23, 27.4, 11.4, 4.4, P.lg(g, 12, 23, 34, 32, [sh(s, 0.35), sh(s, 0.05), sd]));
      P.ell(g, 22, 25, 7, 2.8, P.lg(g, 15, 22, 29, 28, [sh(s, 0.4), s]));
      g.strokeStyle = sh(s, -0.75); g.lineWidth = 0.8;
      g.beginPath(); g.ellipse(23, 27.4, 11.4, 4.4, 0, 0.1, Math.PI - 0.1); g.stroke();
      g.beginPath(); g.ellipse(22, 25, 7, 2.8, 0, 0.1, Math.PI - 0.1); g.stroke();
      g.strokeStyle = sh(c.belly, -0.35); g.lineWidth = 1.4; g.beginPath(); g.ellipse(24, 30.4, 15.2, 6.4, 0, 0.35, Math.PI - 0.35); g.stroke(); // belly plates at the front
      g.fillStyle = G.rgba(sh(s, -0.7), 0.55); for (let i = 0; i < 26; i++) { const r = i % 3, a = 3.3 + (i / 26) * 2.9, rx = [14, 10, 6][r], ry = [6, 3.8, 2.4][r], cy = [30, 27.4, 25][r]; g.beginPath(); g.arc(24 - r + Math.cos(a) * rx, cy + Math.sin(a) * ry + 1, 0.8, 0, Math.PI, true); g.fill(); } // scales
      g.beginPath(); g.moveTo(10, 31); g.bezierCurveTo(5, 33, 3, 36, 0.4, 35 + sw * 0.5); g.bezierCurveTo(3, 37.6, 7, 36.4, 11, 34); g.closePath(); P.fill(g, P.lg(g, 0, 31, 11, 37, [s, sd]));
      P.circle(g, 1.2, 35.4, 0.8, sh(s, -0.4));
      // (no fins: a smooth, heavy coil)
      // the neck rearing out of the coil
      g.beginPath(); g.moveTo(34, 31); g.bezierCurveTo(44, 30, 40, 20, 44 + sw * 0.4, 13); g.lineTo(50 + sw * 0.4, 14); g.bezierCurveTo(46, 22, 50, 32, 38, 35); g.closePath();
      P.fill(g, P.lg(g, 34, 13, 50, 35, [sh(s, 0.25), s, sd]));
      g.strokeStyle = sh(c.belly, -0.2); g.lineWidth = 1.6; g.beginPath(); g.moveTo(39, 33.4); g.bezierCurveTo(47, 29, 44, 20, 48.6 + sw * 0.4, 14.4); g.stroke();
      g.strokeStyle = sh(c.belly, -0.6); g.lineWidth = 0.35; for (let i = 0; i < 6; i++) { const t = i / 6, x = 40 + t * 8, y = 32 - t * 17; g.beginPath(); g.moveTo(x - 1, y); g.lineTo(x + 1.2, y + 0.4); g.stroke(); }
      // the hood: a fan of spined skin flared around the head, false eyes painted on it
      const hx = 47 + sw * 0.4, hy = 11;
      g.beginPath(); g.moveTo(hx - 3, hy + 6); for (let i = 0; i <= 8; i++) { const a = Math.PI * 0.75 + i / 8 * Math.PI * 1.25, r = i % 2 ? 7 : 9.4; g.lineTo(hx + Math.cos(a) * r, hy + Math.sin(a) * r * 0.9); } g.lineTo(hx + 3, hy + 6); g.closePath();
      P.fill(g, P.rg(g, hx, hy, 9, [[0, sh(c.crest, -0.2)], [0.6, sh(s, -0.1)], [1, sd]]));
      for (let i = 0; i < 5; i++) { const a = Math.PI * 0.85 + i / 4 * Math.PI * 1.05; P.line(g, hx + Math.cos(a) * 2, hy + Math.sin(a) * 2, hx + Math.cos(a) * 9.4, hy + Math.sin(a) * 8.4, 0.5, sh(c.crest, 0.3)); }
      P.circle(g, hx - 5.2, hy + 1.6, 1, c.crest); P.circle(g, hx - 5.2, hy + 1.6, 0.45, VOID); P.circle(g, hx + 0.4, hy - 6.4, 0.9, c.crest); P.circle(g, hx + 0.4, hy - 6.4, 0.4, VOID);
      // the head: a flat, crowned wedge, jaws unhinged, two long fangs dripping venom
      horn(g, hx + 1, hy - 1.6, hx - 1, hy - 6, hx - 3, hy - 8.6, 0.9, bone); horn(g, hx + 3, hy - 1.8, hx + 3, hy - 6.6, hx + 1.6, hy - 9.6, 0.8, sh(bone, -0.1));
      P.path(g, [hx - 1, hy - 2, hx + 5, hy - 2.6, hx + 12.6, hy + 0.6, hx + 12, hy + 2.6, hx + 1, hy + 3]); P.fill(g, P.lg(g, hx, hy - 3, hx + 12, hy + 3, [sh(s, 0.3), s, sd]));
      P.path(g, [hx + 2, hy + 4.4, hx + 11, hy + 6.8, hx + 10, hy + 8.6, hx + 1.4, hy + 6.2]); P.fill(g, sd); // lower jaw
      P.path(g, [hx + 1.4, hy + 3, hx + 12, hy + 2.6, hx + 10.6, hy + 6.8, hx + 1.6, hy + 4.6]); P.fill(g, '#1e0404');
      teeth(g, hx + 2, hy + 3, hx + 11.6, hy + 2.6, 7, 1, 1); teeth(g, hx + 2.2, hy + 4.6, hx + 10.4, hy + 6.8, 5, 0.8, -1);
      P.path(g, [hx + 3.4, hy + 2.8, hx + 4.4, hy + 8, hx + 5, hy + 2.8]); P.fill(g, '#fff4e0'); P.path(g, [hx + 8.4, hy + 2.6, hx + 9, hy + 6.6, hx + 9.6, hy + 2.6]); P.fill(g, '#fff4e0');
      P.circle(g, hx + 4.4, hy + 8.8, 0.45, 'rgba(170,255,90,0.9)'); P.circle(g, hx + 4.5, hy + 10.2, 0.3, 'rgba(170,255,90,0.7)');
      P.path(g, [hx, hy - 2.4, hx + 8, hy - 2.2, hx + 7, hy - 0.4, hx + 1, hy - 0.2]); P.fill(g, sh(s, -0.7)); // brow
      P.glow(g, hx + 5, hy - 0.6, 6, c.eye, 0.95); P.ell(g, hx + 5, hy - 0.6, 2, 0.95, c.eye, -0.15); P.ell(g, hx + 5, hy - 0.6, 0.3, 0.9, VOID);
    } });

  /* ---------- Ancient Jotun ---------- */
  def('jotun', { w: 46, h: 58, cy: 34, frames: 2,
    colors: { skin: '#6a98c4', fur: '#d8dce4', eye: '#e0ffff', ice: '#bfe4f8' },
    draw(g, f, c) {
      // an ancient frost giant: a mane and beard like a blizzard, a mantle of white fur, runes of ice on bare skin, a glacier hammer
      const s = c.skin, sd = sh(s, -0.5), w = f ? 1.2 : 0, fur = c.fur, leather = '#3a2e24';
      P.glow(g, 22, 22, 18, c.ice, 0.15);
      // legs in fur-wrapped boots
      limb(g, 18, 36, 16 - w, 45, 3.2, 2.6, sh(leather, -0.2)); P.rrect(g, 12.6 - w, 45, 7, 10.4, 2.4, P.lg(g, 12, 46, 20, 56, ['#5a4a3a', '#2a2018'])); P.line(g, 12.8 - w, 48, 19.4 - w, 48.6, 0.5, '#1a1410'); P.line(g, 12.8 - w, 51.6, 19.4 - w, 52.2, 0.5, '#1a1410'); P.ell(g, 16.6 - w, 56, 4.4, 1.4, '#2a2018');
      limb(g, 26, 36, 28 + w, 45, 3.2, 2.6, leather); P.rrect(g, 24.6 + w, 45, 7, 10.4, 2.4, P.lg(g, 24, 46, 32, 56, ['#6a5846', '#3a2c20'])); P.line(g, 24.8 + w, 48, 31.4 + w, 48.6, 0.5, '#1a1410'); P.line(g, 24.8 + w, 51.6, 31.4 + w, 52.2, 0.5, '#1a1410'); P.ell(g, 28.6 + w, 56, 4.4, 1.4, '#2a2018');
      // far arm hanging, huge hand
      limb(g, 12, 18, 9, 28, 3, 2.6, sd); limb(g, 9, 28, 9.4, 36, 2.6, 2.2, sd); P.circle(g, 9.6, 37.4, 2.6, P.vol(g, 9.6, 37, 2.6, sd));
      // bare, massive torso with ice runes; a loin of hide
      g.beginPath(); g.moveTo(11.6, 17); g.quadraticCurveTo(22, 12, 32.4, 17); g.lineTo(30, 36); g.quadraticCurveTo(22, 39, 14, 36); g.closePath();
      P.fill(g, P.lg(g, 12, 13, 32, 37, [sh(s, 0.3), s, sd]));
      g.strokeStyle = sh(s, -0.55); g.lineWidth = 0.5; g.beginPath(); g.moveTo(22, 20); g.lineTo(22, 33); g.moveTo(16, 25); g.quadraticCurveTo(19, 27, 22, 26); g.moveTo(28, 25); g.quadraticCurveTo(25, 27, 22, 26); g.stroke();
      g.strokeStyle = G.rgba(c.ice, 0.5); g.lineWidth = 1; g.beginPath(); g.moveTo(17, 20); g.lineTo(18.4, 23); g.lineTo(17, 26); g.moveTo(27, 20); g.lineTo(25.6, 23.4); g.lineTo(27.4, 26.4); g.stroke(); g.strokeStyle = c.ice; g.lineWidth = 0.4; g.stroke();
      P.path(g, [13.6, 34, 30.4, 34, 29, 40, 25, 38.6, 22, 41, 19, 38.6, 15, 40]); P.fill(g, P.lg(g, 14, 34, 14, 41, ['#6a5440', '#3a2c20']));
      P.rrect(g, 13.4, 33, 17.4, 2.2, 0.8, leather); P.circle(g, 22, 34.1, 1.2, '#a8b8c8');
      // the fur mantle over the shoulders
      g.beginPath(); g.moveTo(8, 20); g.quadraticCurveTo(10, 13, 22, 12.4); g.quadraticCurveTo(34, 13, 36, 20); g.quadraticCurveTo(33, 22, 30, 20.4); g.quadraticCurveTo(26, 23, 22, 21); g.quadraticCurveTo(18, 23, 14, 20.4); g.quadraticCurveTo(11, 22, 8, 20); g.closePath();
      P.fill(g, P.lg(g, 8, 12, 36, 22, [fur, sh(fur, -0.2), sh(fur, -0.5)]));
      g.strokeStyle = sh(fur, -0.35); g.lineWidth = 0.3; for (let i = 0; i < 10; i++) { const x = 10 + i * 2.6; g.beginPath(); g.moveTo(x, 15.4 + Math.abs(i - 4.5) * 0.3); g.quadraticCurveTo(x + 0.6, 17.4, x - 0.2, 19.6); g.stroke(); }
      // the head: a mane like a blizzard, a long beard, burning white eyes under a heavy brow
      const hx = 23, hy = 8;
      g.beginPath(); g.moveTo(hx - 3, hy + 2); g.quadraticCurveTo(hx - 7.4, hy - 5, hx - 0.6, hy - 6.8); g.quadraticCurveTo(hx + 5.6, hy - 7, hx + 6.2, hy - 1.6); g.quadraticCurveTo(hx + 3, hy - 3.4, hx, hy - 2); g.quadraticCurveTo(hx - 3, hy + 4, hx - 7, hy + 14); g.quadraticCurveTo(hx - 9.4, hy + 6, hx - 3, hy + 2); g.closePath(); // a wild mane streaming down the back
      P.fill(g, P.lg(g, hx - 9, hy - 7, hx + 6, hy + 14, [fur, sh(fur, -0.25), sh(fur, -0.55)]));
      g.strokeStyle = sh(fur, -0.4); g.lineWidth = 0.3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(hx - 2 - i, hy - 4 + i); g.quadraticCurveTo(hx - 6 - i * 0.4, hy + 3, hx - 6.6 - i * 0.2, hy + 10); g.stroke(); }
      P.ell(g, hx + 1, hy, 4.6, 4.8, P.vol(g, hx + 0.4, hy - 0.6, 4.8, s));
      P.path(g, [hx - 2.4, hy - 1.8, hx + 5.4, hy - 1.6, hx + 5, hy - 0.4, hx - 2, hy - 0.4]); P.fill(g, sh(s, -0.55));
      evil(g, hx + 3, hy - 0.6, 0.7, c.eye, -0.2); evil(g, hx, hy - 0.8, 0.6, c.eye, 0.2);
      g.beginPath(); g.moveTo(hx - 2.6, hy + 2); g.quadraticCurveTo(hx + 1.4, hy + 1, hx + 5.4, hy + 2); g.quadraticCurveTo(hx + 5, hy + 8, hx + 2.4, hy + 12.4); g.quadraticCurveTo(hx + 0.6, hy + 9, hx - 1.4, hy + 11.6); g.quadraticCurveTo(hx - 3, hy + 6, hx - 2.6, hy + 2); g.closePath();
      P.fill(g, P.lg(g, hx - 3, hy + 1, hx + 5, hy + 12, [fur, sh(fur, -0.35)])); // the beard
      g.strokeStyle = sh(fur, -0.4); g.lineWidth = 0.3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(hx - 1 + i * 1.6, hy + 3.4); g.quadraticCurveTo(hx - 0.4 + i * 1.4, hy + 7, hx - 0.6 + i * 1.3, hy + 10); g.stroke(); }
      P.path(g, [hx - 0.4, hy + 2.6, hx + 3.6, hy + 2.6, hx + 3, hy + 3.8, hx + 0.2, hy + 3.8]); P.fill(g, '#141c24');
      // near arm and the glacier hammer
      limb(g, 32, 18, 35.6, 27, 3, 2.6, s); limb(g, 35.6, 27, 36.4, 33, 2.6, 2.2, s); P.circle(g, 36.8, 34, 2.6, P.vol(g, 36.8, 33.6, 2.6, s));
      P.line(g, 36.6, 44, 38, 8, 1.3, '#4a3a2a');
      g.save(); g.translate(38.2, 7); g.rotate(0.05);
      P.path(g, [-6, -3.4, -4.6, -5, 5, -5.2, 6.4, -3, 6, 4, 4.6, 5, -4.8, 5.2, -6.4, 3.4]); P.fill(g, P.lg(g, -6, -5, 6, 5, ['#8a96a4', '#4a5460', '#1e242c'])); // a hewn block of dark stone
      P.path(g, [-6, -3.4, -4.6, -5, 5, -5.2, 6.4, -3, 5, -2.2, 2, -3.2, -1.6, -2.4, -4.4, -3]); P.fill(g, G.rgba(c.ice, 0.85)); // ice crusted on top
      g.strokeStyle = G.rgba(c.ice, 0.8); g.lineWidth = 0.4; g.beginPath(); g.moveTo(-3.6, -1.4); g.lineTo(-1.6, 1); g.lineTo(-2.6, 3.4); g.moveTo(2.4, -1.6); g.lineTo(3.6, 1.4); g.stroke();
      P.rect(g, -6.2, -0.6, 12.8, 1.6, '#3a3a42'); P.rect(g, -6.2, -0.6, 12.8, 0.4, '#6a6a74'); // an iron band
      g.restore();
      P.glow(g, 38, 7, 7, c.ice, 0.4);
    } });
})(window.DH);
