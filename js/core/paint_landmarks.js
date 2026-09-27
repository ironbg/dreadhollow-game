/* Landmarks: the ruins, columns and set pieces that stand in each hall.
 * Every painter takes the hall's variant: crypt (mossy grey stone), fire (scorched stone, embers), drowned (wet
 * stone, algae), ice (frosted stone, snow), purple (arcane stone, runes), bog (mossy, rotten), gold (gilded). */
(function (DH) {
  'use strict';
  const G = DH.gfx, P = G.P, sh = G.shade;
  const def = (name, o) => { G.painters[name] = o; };

  const BASE = { stone: '#6a6272', dark: '#2a2430', acc: '#5a7a3a', glow: '#000000' };
  const VAR = {
    fire: { stone: '#5a423c', dark: '#1e1210', acc: '#ff7a20', glow: '#ff7a20' },
    drowned: { stone: '#5e6e6c', dark: '#1e2a2a', acc: '#3a8a6a', glow: '#000000' },
    ice: { stone: '#7a8a9c', dark: '#26303c', acc: '#e8f6ff', glow: '#8fe0ff' },
    purple: { stone: '#4e4468', dark: '#1a1426', acc: '#c070ff', glow: '#c070ff' },
    bog: { stone: '#565a44', dark: '#1e2014', acc: '#7a9a30', glow: '#b0ff50' },
    gold: { stone: '#6e5e4c', dark: '#241c14', acc: '#ffd040', glow: '#ffd040' },
  };
  const land = (name, o) => def(name, Object.assign({ colors: BASE, variants: VAR }, o));
  const shadow = (g, x, y, rx, ry) => P.ell(g, x, y, rx, ry || rx * 0.28, 'rgba(0,0,0,0.5)');
  // a lit stone face: light from the top-left
  const stoneX = (g, x0, x1, c) => P.lg(g, x0, 0, x1, 0, [sh(c.stone, 0.3), c.stone, sh(c.stone, -0.45)]);
  const stoneY = (g, y0, y1, c) => P.lg(g, 0, y0, 0, y1, [sh(c.stone, 0.4), sh(c.stone, -0.25)]);
  function cracks(g, pts, c) { g.strokeStyle = G.rgba(c.dark, 0.8); g.lineWidth = 0.5; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); }
  /** The hall's accent on a piece of stone: moss, embers, algae, snow, runes or gilding. */
  function accent(g, c, x, y, w, kind) {
    if (c.acc === BASE.acc || c.acc === VAR.bog.acc || c.acc === VAR.drowned.acc) { // moss / algae patches
      for (let i = 0; i < 5; i++) P.ell(g, x + (i * 0.23 % 1) * w, y + (i % 2) * 1.2, 1.4 + (i % 3) * 0.6, 0.9, G.rgba(c.acc, 0.8));
    } else if (c.acc === VAR.ice.acc && kind === 'top') { // snow cap
      P.path(g, [x - 0.6, y + 1, x + w * 0.2, y - 1.4, x + w * 0.6, y - 1, x + w + 0.6, y + 0.4, x + w, y + 2, x, y + 2]); P.fill(g, P.lg(g, 0, y - 1.5, 0, y + 2, ['#ffffff', '#c8e4f4']));
      for (let i = 0; i < 3; i++) { const ix = x + w * (0.2 + i * 0.3); P.path(g, [ix - 0.7, y + 1.8, ix + 0.7, y + 1.8, ix, y + 4.5 + i % 2 * 1.5]); P.fill(g, '#d8f2ff'); }
    } else if (c.acc === VAR.fire.acc) { // glowing cracks
      g.strokeStyle = '#ff8a30'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(x + w * 0.3, y); g.lineTo(x + w * 0.45, y + 3); g.lineTo(x + w * 0.35, y + 6); g.stroke();
      P.glow(g, x + w * 0.4, y + 3, 3.4, '#ff6a20', 0.5);
    } else if (c.acc === VAR.purple.acc) { // a rune
      g.strokeStyle = c.acc; g.lineWidth = 0.6; g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2 - 1.4, y + 2); g.lineTo(x + w / 2 + 1.4, y + 3); g.lineTo(x + w / 2, y + 5); g.stroke();
      P.glow(g, x + w / 2, y + 2.5, 3.6, c.acc, 0.45);
    } else if (c.acc === VAR.gold.acc) { // a gilded band
      P.rect(g, x, y, w, 1.6, P.lg(g, x, 0, x + w, 0, ['#fff0a0', '#d8a830', '#7a5410']));
    }
  }

  const mossy = (c) => c.acc === BASE.acc || c.acc === VAR.bog.acc || c.acc === VAR.drowned.acc;
  /** Ivy (algae in the drowned hall) climbing a stone face along the points, leaves at each one. */
  function ivy(g, pts, c) {
    if (!mossy(c)) return;
    const dk = sh(c.acc, -0.45), md = sh(c.acc, -0.15), lt = sh(c.acc, 0.25);
    g.strokeStyle = sh(c.acc, -0.6); g.lineWidth = 0.5; g.beginPath(); g.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) g.quadraticCurveTo((pts[i - 2] + pts[i]) / 2 + (i % 4 ? 1 : -1), (pts[i - 1] + pts[i + 1]) / 2, pts[i], pts[i + 1]);
    g.stroke();
    for (let i = 0; i < pts.length; i += 2) {
      const s = i % 4 ? 1 : -1;
      P.ell(g, pts[i] + s * 0.9, pts[i + 1] - 0.3, 1.1, 0.7, i % 6 ? md : dk, s * 0.5);
      P.ell(g, pts[i] - s * 0.6, pts[i + 1] + 0.7, 0.9, 0.6, lt, -s * 0.4);
    }
  }
  /** A squared block seen from the front and a little above: a lit top, the front face, a shaded right side. */
  function block(g, x, y, w, h, d, c, k) {
    const s = c.stone, t = k || 0, dy = d * 0.6;
    P.path(g, [x, y, x + d, y - dy, x + w + d, y - dy, x + w, y]); P.fill(g, sh(s, 0.38 + t));
    P.path(g, [x + w, y, x + w + d, y - dy, x + w + d, y + h - dy, x + w, y + h]); P.fill(g, sh(s, -0.5 + t));
    P.rect(g, x, y, w, h, P.lg(g, 0, y, 0, y + h, [sh(s, 0.08 + t), sh(s, -0.3 + t)]));
    P.line(g, x, y + 0.2, x + w, y + 0.2, 0.3, 'rgba(255,255,255,0.18)');
  }
  /** A fluted column drum between y0 and y1; the grooves crowd towards the edges as they turn away. */
  function fluted(g, xb0, xb1, xt0, xt1, y0, y1, c) {
    P.path(g, [xt0, y0, xt1, y0, xb1, y1, xb0, y1]); P.fill(g, stoneX(g, xb0, xb1, c));
    const N = 6;
    for (let i = 1; i < N; i++) {
      const t = (1 - Math.cos(Math.PI * i / N)) / 2, xt = xt0 + (xt1 - xt0) * t, xb = xb0 + (xb1 - xb0) * t;
      P.line(g, xt, y0 + 0.5, xb, y1 - 0.3, 0.6, G.rgba(c.dark, 0.3 + 0.4 * t));
      P.line(g, xt + 0.6, y0 + 0.5, xb + 0.6, y1 - 0.3, 0.35, 'rgba(255,255,255,' + (0.06 + 0.16 * (1 - t)).toFixed(2) + ')');
    }
  }
  /** A groove cut into stone: a dark cut with a lit lower lip; filled with the hall's glow or old blood. */
  function groove(g, draw, c, w) {
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.save(); g.translate(0.3, 0.4); g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = w * 0.7; draw(); g.stroke(); g.restore();
    g.strokeStyle = G.rgba(c.dark, 0.9); g.lineWidth = w; draw(); g.stroke();
    g.strokeStyle = c.glow === '#000000' ? 'rgba(110,16,16,0.85)' : G.rgba(c.glow, 0.95); g.lineWidth = w * 0.45; draw(); g.stroke();
  }

  /** Glyphs cut into ritual stones, as strokes in a unit box. */
  const RUNES = [[[0, -1, 0, 1], [0, -0.3, 0.8, -1]], [[-0.6, 1, 0, -1, 0.6, 1]], [[0, -1, 0, 1], [-0.7, -0.3, 0.7, 0.4]], [[-0.6, -1, 0.6, 0, -0.6, 1]], [[0, -1, 0, 1], [0, -1, 0.7, -0.5, 0, 0]], [[-0.7, -1, 0.7, 1], [0.7, -1, -0.7, 1]]];

  /* ---------- columns ---------- */
  land('lm_column', { w: 18, h: 62, cy: 58, draw(g, f, c) {
    shadow(g, 9, 58.4, 8.8, 2.4);
    // a stepped plinth and the moulded foot of the shaft
    block(g, 0.8, 52.4, 14.6, 5.8, 1.6, c, -0.05); block(g, 2, 49.6, 12.2, 2.8, 1.2, c);
    P.rrect(g, 3, 47.2, 11.2, 2.6, 1.2, stoneX(g, 3, 14.2, c));
    // the fluted shaft in two drums, a chip knocked out of it
    fluted(g, 4.2, 13, 4.8, 12.4, 14, 47.4, c);
    P.line(g, 4.4, 30.6, 12.8, 30.6, 0.5, G.rgba(c.dark, 0.75)); P.line(g, 4.4, 31.1, 12.8, 31.1, 0.3, 'rgba(255,255,255,0.14)');
    P.path(g, [12.9, 36, 11.2, 37.2, 11.8, 39.2, 12.9, 39.8]); P.fill(g, sh(c.stone, -0.4));
    // the capital: necking, a swelling bell with scrolls, a square abacus with a corner broken away
    P.rrect(g, 4.2, 12.2, 8.8, 2, 0.6, stoneX(g, 4.2, 13, c));
    g.beginPath(); g.moveTo(4, 12.6); g.quadraticCurveTo(1.6, 11.6, 1.2, 9); g.lineTo(16, 9); g.quadraticCurveTo(15.6, 11.6, 13.2, 12.6); g.closePath(); P.fill(g, stoneX(g, 1.2, 16, c));
    for (const x of [2.8, 14.4]) { g.strokeStyle = G.rgba(c.dark, 0.75); g.lineWidth = 0.5; g.beginPath(); g.arc(x, 10.6, 1.1, 0, Math.PI * 1.6); g.stroke(); P.circle(g, x, 10.6, 0.4, G.rgba(c.dark, 0.75)); }
    P.path(g, [0.6, 9.2, 0.6, 5.8, 13.4, 5.8, 14, 7, 15.6, 6.4, 17.4, 7.8, 17.4, 9.2]); P.fill(g, stoneY(g, 5.8, 9.2, c));
    P.rect(g, 0.6, 5.8, 12.8, 0.6, sh(c.stone, 0.5)); P.line(g, 0.6, 9.2, 17.4, 9.2, 0.45, G.rgba(c.dark, 0.85));
    cracks(g, [10.6, 17, 11.8, 21.4, 10.8, 25, 12, 29.4], c); cracks(g, [6, 35, 7, 38.4, 6.2, 42], c);
    if (c.acc === VAR.gold.acc) { accent(g, c, 4.4, 12.4, 8.6); accent(g, c, 3, 47.6, 11.2); }
    else if (c.acc === VAR.ice.acc) { accent(g, c, 0.6, 5, 16.8, 'top'); accent(g, c, 2.2, 49, 12, 'top'); }
    else if (c.acc === VAR.purple.acc) { accent(g, c, 4.6, 20, 8.2); accent(g, c, 4.6, 36, 8.2); }
    else if (c.acc === VAR.fire.acc) { accent(g, c, 5, 21, 7); accent(g, c, 6, 38, 6); }
    else { accent(g, c, 1.6, 51.6, 12); ivy(g, [4.4, 49.6, 7.2, 45.4, 5.4, 41, 8.4, 37, 6.2, 33, 9.4, 29.6, 7.4, 25.6, 10.4, 22], c); accent(g, c, 1.4, 8.6, 7); }
  } });
  land('lm_colbroken', { w: 22, h: 40, cy: 36, draw(g, f, c) {
    shadow(g, 11, 36.4, 10.6, 2.4);
    block(g, 0.8, 30.4, 14.4, 5.6, 1.6, c, -0.05);
    P.rrect(g, 2.6, 28, 11.8, 2.8, 1.2, stoneX(g, 2.6, 14.4, c));
    // the stump of a fluted shaft, snapped off in a jagged break
    const brk = [4.2, 13, 5.2, 10.4, 6.6, 11.8, 8.2, 7.8, 9.8, 10.6, 11.2, 9, 12.4, 12, 13, 11];
    g.save(); P.path(g, [4.2, 28.4].concat(brk, [13, 28.4])); g.clip(); fluted(g, 4.2, 13, 4.3, 12.9, 7, 28.4, c); g.restore();
    P.path(g, brk.concat([12.6, 13.2, 9.2, 14.2, 5.6, 13.8])); P.fill(g, P.lg(g, 4, 8, 13, 14, [sh(c.stone, 0.5), sh(c.stone, 0.15)]));
    for (const [x, y] of [[7, 12.2], [10.4, 12.4], [8.6, 10.6]]) P.circle(g, x, y, 0.35, G.rgba(c.dark, 0.6));
    cracks(g, [8.2, 14, 9.2, 18, 8.4, 21.4], c);
    // the fallen drum lying beside it, its broken end towards us
    P.ell(g, 17, 35.6, 5, 1.2, 'rgba(0,0,0,0.45)');
    P.rrect(g, 12, 29.2, 8.4, 6, 1.2, P.lg(g, 0, 29.2, 0, 35.2, [sh(c.stone, 0.4), c.stone, sh(c.stone, -0.5)]));
    for (const y of [30.4, 31.6, 32.8, 34]) P.line(g, 12.6, y, 19.6, y, 0.4, G.rgba(c.dark, 0.45));
    P.ell(g, 20.2, 32.2, 1.6, 3, P.lg(g, 18.6, 29, 21.8, 35, [sh(c.stone, 0.1), sh(c.stone, -0.4)]));
    g.strokeStyle = G.rgba(c.dark, 0.5); g.lineWidth = 0.35; g.beginPath(); g.ellipse(20.2, 32.2, 1, 2.1, 0, 0, Math.PI * 2); g.stroke();
    for (const [x, y, r] of [[2.6, 36.4, 0.9], [15.6, 36.2, 0.7], [11.2, 36.6, 0.6]]) P.circle(g, x, y, r, P.vol(g, x, y, r, c.stone));
    accent(g, c, 2.4, 29.6, 10);
    if (c.acc === VAR.ice.acc) { accent(g, c, 4.4, 10.4, 8.4, 'top'); accent(g, c, 12.2, 29.4, 7.6, 'top'); }
    else ivy(g, [5, 28.6, 7.4, 24.6, 5.6, 20.6, 7.8, 16.8], c);
  } });

  /* ---------- a ruined wall with a gothic window ---------- */
  // a ruined chapel wall: coursed stone, a lancet window with tracery, a doorway fallen in, ivy and rubble at its foot
  land('lm_wall', { w: 72, h: 54, cy: 48, draw(g, f, c) {
    shadow(g, 36, 48.6, 34, 3.2);
    const top = [1, 8, 9, 6, 15, 10, 22, 9, 27, 14, 33, 13, 38, 20, 45, 21, 50, 27, 57, 29, 61, 34, 67, 36, 71, 40];
    const body = [1, 47].concat(top, [71, 47]);
    P.path(g, body); P.fill(g, sh(c.dark, 0.1));
    g.save(); P.path(g, body); g.clip();
    for (let y = 5, r = 0; y < 47; y += 4, r++) for (let x = (r & 1) ? -4 : 0, i = 0; x < 72; x += 8, i++) {
      const k = ((r * 7 + i * 13) % 5) / 4 - 0.5;
      P.rect(g, x + 0.35, y + 0.35, 7.3, 3.3, sh(c.stone, 0.14 + k * 0.18 - (y / 47) * 0.35 - (x / 72) * 0.12));
      P.rect(g, x + 0.35, y + 0.35, 7.3, 0.6, 'rgba(255,255,255,0.13)'); P.rect(g, x + 0.35, y + 3.05, 7.3, 0.6, 'rgba(0,0,0,0.25)');
    }
    P.rect(g, 0, 36, 72, 12, P.lg(g, 0, 36, 0, 48, ['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)']));
    g.restore();
    // the broken top: a lit ledge showing the wall's thickness
    g.lineJoin = 'round'; g.strokeStyle = sh(c.stone, 0.5); g.lineWidth = 1.1; P.path(g, top, false); g.stroke();
    g.save(); g.translate(0.4, 1.1); g.strokeStyle = G.rgba(c.dark, 0.6); g.lineWidth = 0.5; P.path(g, top, false); g.stroke(); g.restore();
    // the lancet window: a dressed frame, a mullion, two small arches and a round light above them
    const lanc = (x0, x1, ys, yb, apex) => { const m = (x0 + x1) / 2; g.beginPath(); g.moveTo(x0, yb); g.lineTo(x0, ys); g.quadraticCurveTo(x0, apex + (ys - apex) * 0.3, m, apex); g.quadraticCurveTo(x1, apex + (ys - apex) * 0.3, x1, ys); g.lineTo(x1, yb); g.closePath(); };
    lanc(11.2, 24.8, 22, 37, 12.4); P.fill(g, stoneX(g, 11.2, 24.8, c));
    lanc(13, 23, 22.4, 36.4, 14.6); P.fill(g, '#07050a');
    const wg = c.glow === '#000000' ? '#4a3a66' : c.glow;
    lanc(13, 23, 22.4, 36.4, 14.6); P.fill(g, P.lg(g, 0, 15, 0, 36, [G.rgba(wg, 0.5), G.rgba(wg, 0.04)]));
    g.strokeStyle = sh(c.stone, 0.05); g.lineWidth = 0.8;
    g.beginPath(); g.arc(18, 18.8, 2, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(13, 24.4); g.quadraticCurveTo(13, 21.6, 15.25, 21.2); g.quadraticCurveTo(17.5, 21.6, 17.5, 24.4); g.moveTo(18.5, 24.4); g.quadraticCurveTo(18.5, 21.6, 20.75, 21.2); g.quadraticCurveTo(23, 21.6, 23, 24.4); g.stroke();
    P.rect(g, 17.5, 21.4, 1, 15, sh(c.stone, -0.1)); P.rect(g, 17.5, 21.4, 0.35, 15, sh(c.stone, 0.3));
    for (const [x1, y1, x2, y2] of [[11.2, 28, 13, 28], [23, 28, 24.8, 28], [11.6, 19, 13.2, 20.2], [22.8, 20.2, 24.4, 19], [18, 12.6, 18, 14.6]]) P.line(g, x1, y1, x2, y2, 0.4, G.rgba(c.dark, 0.7));
    P.rrect(g, 10.4, 36.4, 15.2, 2, 0.4, stoneY(g, 36.4, 38.4, c));
    // a doorway fallen in on the right, choked with rubble
    lanc(40.4, 53.6, 35, 47, 27.8); P.fill(g, stoneX(g, 40.4, 53.6, c));
    lanc(42, 52, 35.4, 47, 29.6); P.fill(g, '#0a080c');
    P.line(g, 40.4, 38, 42, 38, 0.4, G.rgba(c.dark, 0.7)); P.line(g, 52, 38, 53.6, 38, 0.4, G.rgba(c.dark, 0.7));
    block(g, 42.6, 43.4, 5, 3.6, 1.4, c, -0.05); block(g, 47, 44.6, 4, 2.4, 1.2, c, 0.05);
    cracks(g, [30, 16, 31, 24, 29, 30, 31, 38], c); cracks(g, [60, 35, 58, 41, 60, 46], c); cracks(g, [6, 12, 8, 17, 7, 22], c);
    // rubble at its foot
    block(g, 29, 44.6, 5.4, 3.2, 1.4, c, -0.02); block(g, 56, 45, 4.6, 2.8, 1.2, c, -0.1);
    for (const [x, y, r] of [[36, 47.4, 1.8], [55, 47.6, 1.4], [8, 47.6, 2], [63, 47, 1.6], [26.4, 47.8, 1.2], [65.6, 47.8, 1]]) P.circle(g, x, y, r, P.vol(g, x, y, r, c.stone));
    accent(g, c, 2, 44.4, 20); accent(g, c, 30, 12, 8);
    ivy(g, [3, 46.4, 6, 41, 4, 36, 8, 31, 6, 26, 9.4, 21, 7.4, 15, 10.6, 10], c);
    ivy(g, [60, 46, 62.4, 42, 61, 38.4], c);
    if (c.acc === VAR.ice.acc) { accent(g, c, 1, 7, 14, 'top'); accent(g, c, 27, 13, 12, 'top'); accent(g, c, 44, 20.6, 8, 'top'); }
  } });

  /* ---------- a ruined gateway ---------- */

  // a ruined gateway: coursed pillars, an arch of wedge stones with a carved skull for its keystone and a chain hanging from it
  land('lm_arch', { w: 62, h: 68, cy: 62, draw(g, f, c) {
    shadow(g, 31, 62.4, 29, 3);
    const Bz = (a, b, d, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * d;
    const O = (t) => [Bz(3, 6, 31, t), Bz(20, 4, 1.6, t)], I = (t) => [Bz(15, 16, 31, t), Bz(20, 11, 10.6, t)];
    for (const x0 of [4, 47]) {
      block(g, x0 - 2.4, 56.6, 15, 5.4, 1.4, c, -0.05);
      for (let y = 22, r = 0; y < 56.6; y += 4.4, r++) {
        const h = Math.min(4.4, 56.6 - y), k = ((r * 5 + x0) % 4) / 3 - 0.5;
        P.rect(g, x0, y, 11, h, P.lg(g, x0, 0, x0 + 11, 0, [sh(c.stone, 0.32 + k * 0.12), sh(c.stone, k * 0.12), sh(c.stone, -0.5 + k * 0.1)]));
        P.rect(g, x0, y, 11, 0.5, 'rgba(255,255,255,0.14)'); P.rect(g, x0, y + h - 0.5, 11, 0.5, G.rgba(c.dark, 0.6));
        if (r & 1) P.line(g, x0 + 5.5, y + 0.5, x0 + 5.5, y + h - 0.5, 0.4, G.rgba(c.dark, 0.5));
      }
      block(g, x0 - 1.4, 20.4, 13.8, 2.2, 1, c, 0.05);
    }
    // the arch, stone by stone; each lit along its outer edge and darker towards the soffit
    const vous = (m, t0, t1, k, jag) => {
      const X = (p) => m ? [62 - p[0], p[1]] : p, a = X(O(t0)), b = X(O(t1)), d = X(I(t1)), e = X(I(t0));
      const pts = [a[0], a[1], b[0], b[1]].concat(jag ? [(b[0] + d[0]) / 2 + jag, (b[1] + d[1]) / 2 + 1] : [], [d[0], d[1], e[0], e[1]]);
      P.path(g, pts); P.fill(g, P.lg(g, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (d[0] + e[0]) / 2, (d[1] + e[1]) / 2, [sh(c.stone, k + 0.18), sh(c.stone, k - 0.3)]));
      P.line(g, a[0], a[1], b[0], b[1], 0.5, 'rgba(255,255,255,0.22)');
      if (!jag) P.line(g, b[0], b[1], d[0], d[1], 0.45, G.rgba(c.dark, 0.75));
    };
    const N = 7;
    for (let i = 0; i < N; i++) vous(0, i / N, (i + 1) / N, 0.2 - i * 0.02 + (i % 2) * 0.07);
    vous(1, 6 / N, 1, -0.05); vous(1, 6 / N, 5.3 / N, -0.12, 1.4); // the right shoulder broken off past the crown
    vous(1, 0, 1 / N, -0.2); vous(1, 1 / N, 1.7 / N, -0.25, -1.2); // and its springer, still on the pillar
    // the keystone, a skull carved into it
    P.rrect(g, 27.3, 0.4, 7.4, 11, 1, stoneY(g, 0.4, 11.4, c)); P.rect(g, 27.3, 0.4, 7.4, 0.6, sh(c.stone, 0.5));
    P.ell(g, 31, 4.8, 2.5, 2.3, P.vol(g, 31, 4.8, 2.5, sh(c.stone, 0.3))); P.rrect(g, 29.6, 6.2, 2.8, 2, 0.5, sh(c.stone, 0.15));
    for (const x of [30, 32]) { P.ell(g, x, 4.9, 0.75, 0.85, '#0a080c'); if (c.glow !== '#000000') { P.circle(g, x, 5, 0.4, c.glow); P.glow(g, x, 5, 2, c.glow, 0.6); } }
    P.path(g, [31, 5.8, 30.6, 6.8, 31.4, 6.8]); P.fill(g, '#0a080c');
    for (const x of [30.2, 31, 31.8]) P.line(g, x, 7.2, x, 8, 0.25, G.rgba(c.dark, 0.8));
    // an iron chain and hook hanging from the crown
    for (let i = 0; i < 7; i++) { const y = 11.8 + i * 1.3; if (i % 2) P.rect(g, 30.8, y - 0.6, 0.4, 1.2, '#3a3a40'); else { g.strokeStyle = '#2a2a30'; g.lineWidth = 0.4; g.beginPath(); g.ellipse(31, y, 0.5, 0.8, 0, 0, Math.PI * 2); g.stroke(); } }
    g.strokeStyle = '#3a3a42'; g.lineWidth = 0.55; g.beginPath(); g.moveTo(31, 20.6); g.lineTo(31, 22); g.arc(30, 22, 1, 0, Math.PI * 0.9); g.stroke();
    // fallen stones under the gap
    block(g, 33.6, 58.4, 5, 3, 1.4, c, -0.05); block(g, 38.4, 59.6, 3.6, 2.2, 1, c, 0.05);
    for (const [x, y, r] of [[32, 61.4, 1.4], [43, 61.2, 1.2], [36.4, 61.8, 0.8]]) P.circle(g, x, y, r, P.vol(g, x, y, r, c.stone));
    cracks(g, [8, 30, 9, 35, 7.6, 40], c); cracks(g, [53, 40, 52, 45, 53.4, 50], c);
    accent(g, c, 2.4, 55, 12); accent(g, c, 45.4, 55.4, 12);
    ivy(g, [5, 55, 8, 50, 5.6, 45, 9, 40, 6.6, 35, 9.6, 30, 7, 25, 9, 21, 7, 16], c);
    if (c.acc === VAR.ice.acc) { accent(g, c, 5, 10, 16, 'top'); accent(g, c, 27.3, 0, 7.4, 'top'); }
    else if (c.acc === VAR.purple.acc || c.acc === VAR.gold.acc) accent(g, c, 47.6, 30, 10);
  } });

  /* ---------- graves, statues, rubble ---------- */
  // frame 0: a leaning gothic headstone with a carved cross and a stub of candle; frame 1: a ringed cross
  land('lm_tomb', { w: 12, h: 18, cy: 16, frames: 2, draw(g, f, c) {
    shadow(g, 6, 16.4, 5.6, 1.6);
    g.save(); g.translate(6, 15.6); g.rotate(f ? 0.07 : -0.09); g.translate(-6, -15.6);
    if (f) {
      const cr = [4.9, 16, 4.9, 7.6, 1.4, 7.6, 1.4, 5.2, 4.9, 5.2, 4.9, 1, 7.1, 1, 7.1, 5.2, 10.6, 5.2, 10.6, 7.6, 7.1, 7.6, 7.1, 16];
      g.strokeStyle = sh(c.stone, -0.25); g.lineWidth = 1; g.beginPath(); g.arc(6, 6.4, 2.9, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 0.35; g.beginPath(); g.arc(6, 6.4, 3.3, Math.PI * 0.95, Math.PI * 1.6); g.stroke();
      P.path(g, cr); P.fill(g, stoneX(g, 1.4, 10.6, c));
      P.path(g, [4.9, 5.2, 4.9, 1, 7.1, 1, 6.4, 1.6, 5.5, 1.6, 5.5, 5.8, 1.4, 5.8, 1.4, 5.2]); P.fill(g, 'rgba(255,255,255,0.2)');
      P.circle(g, 6, 6.4, 0.9, sh(c.stone, -0.3)); P.circle(g, 5.8, 6.2, 0.4, sh(c.stone, 0.3));
      cracks(g, [6.6, 9, 5.6, 11, 6.4, 13], c);
    } else {
      const st = [1.8, 16, 1.8, 6.4, 3.2, 3.2, 6, 1, 8.4, 2.8, 8.2, 3.8, 9.4, 4.2, 10.2, 6.4, 10.2, 16];
      P.path(g, st); P.fill(g, stoneX(g, 1.8, 10.2, c));
      P.path(g, [1.8, 6.4, 3.2, 3.2, 6, 1, 6, 2.2, 3.9, 3.8, 2.8, 6.6, 2.8, 16, 1.8, 16]); P.fill(g, 'rgba(255,255,255,0.16)');
      P.path(g, [8.4, 2.8, 8.2, 3.8, 9.4, 4.2]); P.fill(g, sh(c.stone, -0.4)); // the chipped shoulder
      // the carved cross and two lines of a name worn smooth
      g.strokeStyle = G.rgba(c.dark, 0.85); g.lineWidth = 0.7; g.beginPath(); g.moveTo(6, 4.2); g.lineTo(6, 9.4); g.moveTo(4.4, 5.8); g.lineTo(7.6, 5.8); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 0.3; g.beginPath(); g.moveTo(6.45, 4.6); g.lineTo(6.45, 9.6); g.moveTo(4.6, 6.25); g.lineTo(7.8, 6.25); g.stroke();
      P.line(g, 3.8, 11.4, 8.2, 11.4, 0.4, G.rgba(c.dark, 0.6)); P.line(g, 4.4, 12.8, 7.6, 12.8, 0.4, G.rgba(c.dark, 0.5));
      cracks(g, [9.4, 7, 8.2, 9.4, 9, 11.4], c);
    }
    g.restore();
    // the grave mound of dark earth in front
    P.ell(g, 6, 16, 5.6, 1.7, P.lg(g, 0, 14.4, 0, 17.6, ['#4a3a2c', '#1c140e']));
    for (const [x, y] of [[3, 15.6], [7.6, 16.4], [9.4, 15.4]]) P.circle(g, x, y, 0.35, '#6a5a48');
    accent(g, c, 1.6, 14.6, 8);
    if (c.acc === VAR.ice.acc) accent(g, c, 2.4, f ? 0.6 : 1.6, 7.2, 'top');
    if (!f) { // a stub of candle left on the grave
      P.rect(g, 9.4, 13, 1.2, 2.6, P.lg(g, 9.4, 0, 10.6, 0, ['#f0e6cc', '#a89a7c'])); P.rect(g, 9.3, 15.2, 1.6, 0.6, '#c8bca0');
      P.glow(g, 10, 12, 2.6, '#ffb040', 0.7); P.ell(g, 10, 12, 0.5, 0.9, '#ffd060'); P.circle(g, 10, 12.3, 0.25, '#ffffff');
    }
  } });
  // a weeping angel: wings raised behind it, head bowed, a broken halo, both hands on a sword planted at its feet
  land('lm_statue', { w: 24, h: 50, cy: 46, draw(g, f, c) {
    shadow(g, 12, 46.4, 11, 2.4);
    block(g, 2, 39.8, 18.4, 6.4, 1.8, c, -0.05); block(g, 3.8, 37.4, 14.8, 2.4, 1.2, c);
    P.rect(g, 5.4, 41.4, 11.6, 3.2, G.rgba(c.dark, 0.35)); P.line(g, 7, 43, 15.4, 43, 0.4, G.rgba(c.dark, 0.6));
    // the wings: the lit one on the left, the shaded one on the right with its tip broken off
    const wing = (m, cols) => {
      const X = (x) => m ? 24 - x : x;
      const pts = [9, 17, 7.4, 10.6, 4.6, 4.6, 2.2, 2.6, 1, 6, 0.8, 13, 1.4, 21, 2.6, 30, 3.8, 34.6, 4.8, 30.4, 5.8, 32.4, 6.6, 27.4, 7.6, 29, 8.4, 23.6, 9, 22];
      if (m) pts.splice(12, 10, 1.4, 21, 2.6, 23.6, 3.6, 22.2, 4.6, 25, 5.8, 26.4);
      P.path(g, pts.map((v, i) => i % 2 ? v : X(v))); P.fill(g, P.lg(g, X(1), 0, X(9), 0, cols));
      g.strokeStyle = G.rgba(c.dark, m ? 0.6 : 0.45); g.lineWidth = 0.45;
      g.beginPath(); g.moveTo(X(1.4), 12.4); g.quadraticCurveTo(X(4.4), 11.4, X(8.4), 15.4); g.stroke(); // the coverts
      for (const [x0, x1, y1] of [[2.4, 2.2, m ? 24 : 29], [4, 4.4, 28.4], [5.6, 6.2, 26], [7.2, 7.8, 22.6]]) { g.beginPath(); g.moveTo(X(x0), 13.2); g.quadraticCurveTo(X(x0 + 0.2), 20, X(x1), y1); g.stroke(); }
      if (!m) { g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 0.35; g.beginPath(); g.moveTo(2.4, 3.6); g.quadraticCurveTo(0.8, 12, 2.2, 26); g.stroke(); }
    };
    wing(0, [sh(c.stone, 0.45), sh(c.stone, 0.1), sh(c.stone, -0.2)]); wing(1, [sh(c.stone, -0.55), sh(c.stone, -0.35), sh(c.stone, -0.15)]);
    // the halo behind the head, cracked through
    g.strokeStyle = sh(c.stone, c.acc === VAR.gold.acc ? 0 : 0.2); g.lineWidth = 0.9; g.beginPath(); g.arc(12.2, 12, 3.9, Math.PI * 0.62, Math.PI * 2.32); g.stroke();
    if (c.acc === VAR.gold.acc) { g.strokeStyle = '#ffd040'; g.lineWidth = 0.6; g.beginPath(); g.arc(12.2, 12, 3.9, Math.PI * 0.62, Math.PI * 2.32); g.stroke(); }
    // the robe, falling in long folds
    P.path(g, [8.2, 17.2, 15.8, 17.2, 16.8, 21, 17.2, 28, 18.8, 37.4, 5.2, 37.4, 6.8, 28, 7.2, 21]); P.fill(g, P.lg(g, 5, 0, 19, 0, [sh(c.stone, 0.4), c.stone, sh(c.stone, -0.5)]));
    g.strokeStyle = G.rgba(c.dark, 0.55); g.lineWidth = 0.55;
    for (const [x0, x1] of [[9, 7.6], [11, 10.4], [13.2, 13.8], [15, 16.4]]) { g.beginPath(); g.moveTo(x0, 26); g.quadraticCurveTo((x0 + x1) / 2 + 0.3, 31, x1, 37.2); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.16)'; g.lineWidth = 0.35; for (const x of [8.4, 10.2, 12.6]) { g.beginPath(); g.moveTo(x, 27); g.lineTo(x - 0.8, 37); g.stroke(); }
    // the sword planted before it, blade down to the plinth
    P.path(g, [11.3, 25.6, 12.9, 25.6, 12.5, 36.2, 12.1, 37.4, 11.7, 36.2]); P.fill(g, P.lg(g, 11.3, 0, 12.9, 0, [sh(c.stone, 0.6), sh(c.stone, 0.15), sh(c.stone, -0.3)]));
    P.rrect(g, 8.6, 24.6, 7, 1.3, 0.5, c.acc === VAR.gold.acc ? P.lg(g, 8, 0, 16, 0, ['#fff0a0', '#d8a830', '#7a5410']) : stoneX(g, 8.6, 15.6, c));
    // arms folded down to the hilt, hands over the pommel
    P.limb(g, 8.2, 18, 10.4, 23.4, 2.4, 1.8, sh(c.stone, 0.2)); P.limb(g, 15.8, 18, 13.6, 23.4, 2.4, 1.8, sh(c.stone, -0.25));
    P.ell(g, 12, 23.4, 2.3, 1.5, P.vol(g, 12, 23.4, 2.3, sh(c.stone, 0.15)));
    // the head bowed in grief, hair falling to the shoulders, the face in shadow
    P.path(g, [10, 17.4, 10.1, 13, 12.4, 10.8, 14.7, 12.8, 14.9, 17.4, 13.6, 16.4, 11.2, 16.4]); P.fill(g, P.lg(g, 10, 0, 15, 0, [sh(c.stone, 0.4), sh(c.stone, -0.05), sh(c.stone, -0.5)]));
    P.ell(g, 12.6, 14.6, 1.6, 1.9, P.lg(g, 11, 12.8, 14.2, 16.4, [sh(c.stone, 0.25), sh(c.stone, -0.45)]));
    P.path(g, [10.6, 13.4, 11.6, 11.6, 13.8, 11.8, 14.2, 13, 12.4, 12.6]); P.fill(g, sh(c.stone, 0.35));
    P.line(g, 11.4, 11.8, 10.8, 16.6, 0.3, 'rgba(255,255,255,0.2)');
    if (c.glow !== '#000000') { for (const x of [11.9, 13.5]) { P.glow(g, x, 14.8, 1.8, c.glow, 0.6); P.line(g, x - 0.5, 14.8, x + 0.5, 14.9, 0.45, c.glow); } }
    else { P.line(g, 11.4, 14.8, 12.4, 15, 0.35, G.rgba(c.dark, 0.9)); P.line(g, 13, 15, 14, 14.8, 0.35, G.rgba(c.dark, 0.9)); P.line(g, 12, 15.4, 11.8, 17, 0.3, 'rgba(160,190,220,0.35)'); }
    cracks(g, [16.4, 22, 15.6, 26, 16.8, 29.6], c); cracks(g, [20.4, 8, 21.4, 12, 20.6, 15], c);
    if (c.acc === VAR.gold.acc) accent(g, c, 3.8, 36.6, 14.8);
    else if (c.acc === VAR.ice.acc) { accent(g, c, 1.2, 3, 6, 'top'); accent(g, c, 16.8, 3, 6, 'top'); accent(g, c, 3.8, 36.2, 14.8, 'top'); }
    else if (mossy(c)) { accent(g, c, 2.4, 45, 18.6); ivy(g, [3.2, 45.4, 5.4, 42, 3.6, 39.6, 5.2, 36.4], c); }
    else accent(g, c, 15, 27, 3);
  } });
  land('lm_rubble', { w: 28, h: 14, cy: 11, draw(g, f, c) {
    shadow(g, 14, 11.4, 13.4, 2.2);
    block(g, 9.4, 4.4, 8.2, 5.4, 2, c, 0.02);
    block(g, 17.6, 6.6, 6.2, 4.2, 1.8, c, -0.08);
    // a column drum on its side, flutes running along it
    P.rrect(g, 1, 6.2, 9.6, 4.8, 1.2, P.lg(g, 0, 6.2, 0, 11, [sh(c.stone, 0.4), c.stone, sh(c.stone, -0.5)]));
    for (const y of [7.2, 8.2, 9.2, 10.1]) P.line(g, 1.6, y, 9.8, y, 0.35, G.rgba(c.dark, 0.45));
    P.ell(g, 10.6, 8.6, 1.4, 2.4, P.lg(g, 9.2, 6, 12, 11, [sh(c.stone, 0.1), sh(c.stone, -0.45)]));
    // a shard of a carved capital leaning on the block
    P.path(g, [13, 4.4, 14.6, 1.4, 19, 1, 19.4, 3.4, 17.6, 4.4]); P.fill(g, P.lg(g, 13, 1, 19, 4.4, [sh(c.stone, 0.45), sh(c.stone, -0.1)]));
    g.strokeStyle = G.rgba(c.dark, 0.6); g.lineWidth = 0.4; g.beginPath(); g.arc(15.8, 2.8, 0.8, 0, Math.PI * 1.6); g.stroke();
    for (const [x, y, r] of [[25.4, 10.4, 1.5], [12.6, 11, 1.1], [0.9, 10.8, 0.8], [26.6, 7.6, 0.8], [8.2, 11.6, 0.6], [20, 11.4, 0.6]]) P.circle(g, x, y, r, P.vol(g, x, y, r, c.stone));
    cracks(g, [12, 5.4, 13, 7.4, 12.4, 9.2], c);
    accent(g, c, 2, 10.4, 20);
    if (c.acc === VAR.ice.acc) { accent(g, c, 9.6, 3.2, 9, 'top'); accent(g, c, 1.6, 5.8, 8, 'top'); }
  } });

  /* ---------- the ritual dais, its fire pillars, obsidian spires ---------- */
  // the ritual circle: flagstones, a carved ring of runes, a pentagram cut deep into the stone, candles at its points
  land('lm_dais', { w: 112, h: 68, cy: 34, draw(g, f, c) {
    const X = 56, Y = 33, RX = 53, RY = 29.4, at = (k, a) => [X + Math.cos(a) * RX * k, Y + Math.sin(a) * RY * k];
    P.ell(g, X, 37, 56, 31, 'rgba(0,0,0,0.45)');
    P.ell(g, X, 36, RX + 0.6, RY + 0.4, P.lg(g, 0, 36, 0, 66, [sh(c.stone, -0.45), sh(c.stone, -0.7)])); // its thickness
    P.ell(g, X, Y, RX, RY, P.rg(g, X, Y, RX, [[0, sh(c.stone, -0.3)], [0.7, sh(c.stone, -0.12)], [1, sh(c.stone, 0.05)]], X - 14, Y - 10));
    // flagstones laid in rings
    g.save(); g.beginPath(); g.ellipse(X, Y, RX, RY, 0, 0, Math.PI * 2); g.clip(); g.scale(1, RY / RX);
    const y0 = Y * RX / RY;
    g.strokeStyle = G.rgba(c.dark, 0.55); g.lineWidth = 0.6;
    for (const [r0, r1, n, o] of [[40, 53, 22, 0], [26, 40, 16, 0.5], [12, 26, 10, 0.2]]) {
      g.beginPath(); g.arc(X, y0, r0, 0, Math.PI * 2); g.stroke();
      for (let i = 0; i < n; i++) { const a = (i + o) / n * Math.PI * 2; g.beginPath(); g.moveTo(X + Math.cos(a) * r0, y0 + Math.sin(a) * r0); g.lineTo(X + Math.cos(a) * r1, y0 + Math.sin(a) * r1); g.stroke(); }
    }
    for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 16 + (i * 7 % 30); g.fillStyle = i % 2 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.05)'; g.beginPath(); g.arc(X + Math.cos(a) * r, y0 + Math.sin(a) * r, 5 + i % 3, 0, Math.PI * 2); g.fill(); }
    g.restore();
    // old stains of what was spilled here
    P.ell(g, X + 4, Y + 3, 9, 4.4, 'rgba(70,10,10,0.35)', 0.2); P.ell(g, X - 18, Y + 12, 4, 1.8, 'rgba(70,10,10,0.3)');
    // the carved ring of runes
    const ring = (k) => groove(g, () => { g.beginPath(); g.ellipse(X, Y, RX * k, RY * k, 0, 0, Math.PI * 2); }, c, 0.9);
    ring(0.74); ring(0.6);
    const GL = RUNES;
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2 + 0.09, [x, y] = at(0.67, a), gl = GL[i * 5 % GL.length];
      groove(g, () => { g.beginPath(); for (const s of gl) { g.moveTo(x + s[0] * 1.5, y + s[1] * 1.8); for (let j = 2; j < s.length; j += 2) g.lineTo(x + s[j] * 1.5, y + s[j + 1] * 1.8); } }, c, 0.55);
    }
    // the pentagram
    const pts = [0, 1, 2, 3, 4].map((i) => at(0.6, -Math.PI / 2 + i * Math.PI * 2 / 5));
    groove(g, () => { g.beginPath(); for (let i = 0; i <= 5; i++) { const p = pts[i * 2 % 5]; if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); } }, c, 1.2);
    if (c.glow !== '#000000') P.glow(g, X, Y, 22, c.glow, 0.3);
    // candles at the five points, burnt down to stubs of different heights
    for (let i = 0; i < 5; i++) {
      const [px, py] = at(0.83, -Math.PI / 2 + i * Math.PI * 2 / 5);
      for (const [dx, dy, h] of [[-1.4, 0.4, 2.6 + i % 2], [1.2, -0.2, 3.8 - i % 3 * 0.6], [0.2, 1.4, 1.6]]) {
        const x = px + dx, y = py + dy;
        P.ell(g, x + 0.5, y + 0.3, 1.2, 0.5, 'rgba(0,0,0,0.4)');
        P.rect(g, x - 0.6, y - h, 1.2, h, P.lg(g, x - 0.6, 0, x + 0.6, 0, ['#f2e8d0', '#b8aa8a']));
        P.ell(g, x, y, 0.9, 0.4, '#d8ccb0'); P.rect(g, x + 0.1, y - h, 0.4, h * 0.6, 'rgba(255,255,255,0.35)');
        P.glow(g, x, y - h - 1, 2.8, '#ffa040', 0.55); P.ell(g, x, y - h - 0.9, 0.45, 0.9, '#ffd060'); P.circle(g, x, y - h - 0.6, 0.22, '#ffffff');
      }
    }
    // rim stones
    for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2, x = X + Math.cos(a) * (RX + 0.2), y = Y + Math.sin(a) * (RY + 0.2), up = Math.sin(a) < 0;
      P.rrect(g, x - 2.6, y - 1.6, 5.2, 3.2, 0.7, sh(c.stone, up ? 0.05 : -0.2)); P.rect(g, x - 2.2, y - 1.5, 4.4, 0.6, sh(c.stone, up ? 0.35 : 0.1)); }
    cracks(g, [14, 30, 22, 33, 20, 39, 25, 43], c); cracks(g, [84, 18, 90, 23, 97, 22], c); cracks(g, [70, 52, 74, 47, 80, 49], c);
    if (c.acc === VAR.ice.acc) { accent(g, c, 20, 12, 10, 'top'); accent(g, c, 82, 10, 12, 'top'); }
    else if (mossy(c)) { accent(g, c, 12, 44, 12); accent(g, c, 86, 44, 10); }
  } });
  // a brazier: a horned skull carved into its pedestal, a bronze bowl held in three claws, a living fire
  land('lm_firepillar', { w: 16, h: 34, cy: 31, frames: 2, draw(g, f, c) {
    shadow(g, 8, 31.4, 7.4, 2);
    block(g, 1.4, 27.4, 11.8, 4, 1.6, c);
    P.path(g, [3.8, 27.4, 4.6, 13.4, 11.4, 13.4, 12.2, 27.4]); P.fill(g, stoneX(g, 3.8, 12.2, c));
    P.line(g, 4.4, 17, 11.6, 17, 0.4, G.rgba(c.dark, 0.6)); P.line(g, 4.2, 25.6, 11.8, 25.6, 0.4, G.rgba(c.dark, 0.6));
    // the horned skull
    for (const s of [-1, 1]) { g.strokeStyle = sh(c.stone, s < 0 ? 0.2 : -0.3); g.lineWidth = 0.9; g.beginPath(); g.moveTo(8 + s * 1.6, 19.4); g.quadraticCurveTo(8 + s * 3.6, 19, 8 + s * 3.2, 16.8); g.stroke(); }
    P.ell(g, 8, 20.6, 2.2, 2.1, P.vol(g, 8, 20.6, 2.2, sh(c.stone, 0.25))); P.rrect(g, 6.8, 21.8, 2.4, 1.6, 0.4, sh(c.stone, 0.1));
    const eye = c.glow === '#000000' ? '#0a080c' : c.glow;
    for (const x of [7.1, 8.9]) { P.circle(g, x, 20.4, 0.6, '#0a080c'); if (c.glow !== '#000000') { P.circle(g, x, 20.4, 0.35, eye); P.glow(g, x, 20.4, 1.6, eye, f ? 0.7 : 0.45); } }
    P.line(g, 7.4, 22.6, 8.6, 22.6, 0.3, G.rgba(c.dark, 0.9));
    // the bronze bowl in three claws
    P.path(g, [0.8, 8.6, 15.2, 8.6, 12.4, 12.4, 3.6, 12.4]); P.fill(g, P.lg(g, 0, 8.6, 0, 12.4, ['#e8c060', '#8a5a18', '#2e1c06']));
    P.line(g, 1.2, 9.1, 14.8, 9.1, 0.4, 'rgba(255,240,180,0.5)');
    for (const x of [4.4, 8, 11.6]) { g.strokeStyle = '#1a120a'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x + (x - 8) * 0.1, 14); g.quadraticCurveTo(x + (x - 8) * 0.25, 11, x + (x - 8) * 0.35, 9.6); g.stroke(); }
    P.rrect(g, 4.2, 12.2, 7.6, 1.6, 0.5, stoneY(g, 12.2, 13.8, c));
    // coals and the fire
    P.ell(g, 8, 8.6, 6.6, 1.3, P.lg(g, 1, 8, 15, 8, ['#a02a08', '#ffc040', '#a02a08']));
    P.glow(g, 8, 5, 8, '#ff8a20', f ? 0.6 : 0.45);
    const tongue = (x, w, top, lean, col) => { g.beginPath(); g.moveTo(x - w, 8.6); g.quadraticCurveTo(x - w * 0.6, top + (8.6 - top) * 0.4, x + lean, top); g.quadraticCurveTo(x + w * 0.7, top + (8.6 - top) * 0.45, x + w, 8.6); g.closePath(); P.fill(g, col); };
    const fl = P.lg(g, 0, 0, 0, 8.6, ['#fff0a0', '#ffa030', '#d03808']);
    tongue(4.6, 1.3, f ? 3.2 : 4.6, f ? -0.9 : 0.3, fl); tongue(11.4, 1.3, f ? 4.4 : 2.8, f ? 0.7 : -0.4, fl); tongue(8, 2.1, f ? 0.2 : 0.8, f ? 0.7 : -0.7, fl);
    tongue(8, 1, f ? 3.6 : 4.2, f ? 0.3 : -0.3, '#fff6d0');
    for (const [x, y] of f ? [[3.6, 1.6], [12.4, 0.8]] : [[5, 0.4], [11, 1.8], [13.4, 3.2]]) P.circle(g, x, y, 0.35, '#ffd070');
    if (c.acc === VAR.ice.acc) accent(g, c, 1.6, 26.4, 11, 'top'); else if (mossy(c) || c.acc === VAR.gold.acc) accent(g, c, 1.8, 30, 10);
  } });
  // obsidian: glassy black shards with lava still glowing in their cracks
  land('lm_spire', { w: 24, h: 52, cy: 48, draw(g, f, c) {
    shadow(g, 12, 48.4, 11.4, 2.6);
    const gl = c.glow === '#000000' ? '#ff7a20' : c.glow;
    const shard = (b0, b1, tip, ridge) => {
      P.path(g, [b0, 48, tip[0], tip[1], ridge, 48]); P.fill(g, P.lg(g, b0, tip[1], ridge, 48, ['#6a5a66', '#2a2028', '#141016']));
      P.path(g, [ridge, 48, tip[0], tip[1], b1, 48]); P.fill(g, P.lg(g, ridge, 0, b1, 0, ['#0e0a0e', '#050306']));
      P.line(g, tip[0], tip[1], ridge, 48, 0.4, 'rgba(255,255,255,0.3)');
      P.line(g, tip[0] - 0.2, tip[1] + 2, b0 + (tip[0] - b0) * 0.25, 48 - (48 - tip[1]) * 0.25, 0.3, 'rgba(255,255,255,0.18)');
    };
    shard(1.4, 9.4, [3.6, 20], 6); shard(14.4, 22.8, [20.2, 12], 17.8); shard(6, 17.6, [11, 1], 11.8);
    // lava glowing through the cracks
    g.lineCap = 'round';
    for (const [w, col, a] of [[1.8, gl, 0.35], [0.8, gl, 1], [0.35, '#ffe0a0', 1]]) {
      g.strokeStyle = G.rgba(col, a); g.lineWidth = w; g.beginPath();
      g.moveTo(12.6, 46); g.lineTo(13.4, 38); g.lineTo(12.4, 31); g.lineTo(13.6, 22); g.moveTo(13.4, 38); g.lineTo(15.6, 33.4); g.moveTo(19.6, 46); g.lineTo(20.4, 38.6); g.lineTo(19.8, 32); g.stroke();
    }
    P.glow(g, 13, 38, 9, gl, 0.45);
    // cooled lava crusting the foot
    for (const [x, y, r] of [[3, 47.2, 2.4], [9, 47.8, 2], [16, 47.6, 2.2], [21.6, 47.4, 2.2]]) P.ell(g, x, y, r, r * 0.6, P.vol(g, x, y, r, '#2a2024'));
    P.line(g, 8, 47.6, 10.4, 48, 0.4, G.rgba(gl, 0.9)); P.line(g, 20.6, 47.2, 22.6, 47.6, 0.4, G.rgba(gl, 0.9));
  } });

  /* ---------- Frozen Catacombs ---------- */
  // an ice-bound grave: spikes of cloudy ice risen from the floor, a skull caught in the largest, a drift of snow at their feet
  land('lm_stalag', { w: 30, h: 46, cy: 42, draw(g, f, c) {
    shadow(g, 15, 42.4, 13.4, 2.6);
    P.glow(g, 15, 24, 16, '#8fe0ff', 0.25);
    const spike = (xb, w, tx, ty, inner) => {
      const x0 = xb - w / 2, x1 = xb + w / 2, rx = xb + (tx - xb) * 0.15 + w * 0.08;
      P.path(g, [x0, 42, tx, ty, rx, 42]); P.fill(g, P.lg(g, x0, ty, rx, 42, ['#ffffff', '#b8e6ff', '#6ab0e0']));
      P.path(g, [rx, 42, tx, ty, x1, 42]); P.fill(g, P.lg(g, rx, 0, x1, 0, ['#5a9ccc', '#24507e']));
      if (inner) inner(x0, x1, rx, tx, ty);
      P.line(g, tx, ty + 0.6, rx, 42, 0.4, 'rgba(255,255,255,0.85)');
      P.line(g, x0 + (tx - x0) * 0.3 + 0.9, 42 - (42 - ty) * 0.3, x0 + (tx - x0) * 0.62 + 0.5, 42 - (42 - ty) * 0.62, 0.5, 'rgba(255,255,255,0.5)');
    };
    spike(6.6, 9, 5.2, 17.4); spike(23.4, 10, 24.4, 13);
    spike(14.8, 13.4, 14, 0.6, (x0, x1, rx) => {
      // the skull inside, pale and blurred by the ice over it
      P.ell(g, 14.2, 29.4, 3, 2.8, 'rgba(240,244,246,0.95)'); P.rrect(g, 12.7, 31.4, 3, 2.2, 0.6, 'rgba(226,232,236,0.95)');
      for (const x of [13.1, 15.3]) P.ell(g, x, 29.6, 0.85, 0.95, 'rgba(12,24,44,0.95)');
      P.path(g, [14.2, 30.8, 13.8, 31.8, 14.6, 31.8]); P.fill(g, 'rgba(12,24,44,0.9)');
      for (const x of [13.4, 14.2, 15]) P.line(g, x, 32.6, x, 33.6, 0.3, 'rgba(12,24,44,0.7)');
      P.path(g, [x0, 42, 14, 0.6, x1, 42]); P.fill(g, 'rgba(170,220,250,0.18)');
      g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 0.35; g.beginPath(); g.moveTo(16.4, 18); g.lineTo(15.2, 22); g.lineTo(17, 25.4); g.moveTo(11.6, 34); g.lineTo(13, 36.4); g.stroke();
    });
    spike(9.8, 5, 8.8, 30); spike(20.4, 5.4, 21.8, 31.6);
    // a drift of snow, soft and rounded
    for (const [x, y, rx, ry] of [[3.4, 41.8, 4, 2], [9.4, 41.4, 4.4, 2.2], [15.4, 41.8, 4.6, 1.8], [21.4, 41.2, 4.4, 2.2], [27, 41.8, 3.6, 1.8]]) P.ell(g, x, y, rx, ry, P.lg(g, 0, y - ry, 0, y + ry, ['#ffffff', '#c8e4f4']));
    P.path(g, [0, 42.6, 30, 42.6, 30, 41.6, 0, 41.6]); P.fill(g, '#c8e4f4');
    for (const [x, y] of f ? [[13.6, 4]] : [[24, 16], [5.4, 20]]) { P.glow(g, x, y, 2, '#ffffff', 0.6); P.line(g, x - 1.2, y, x + 1.2, y, 0.3, '#ffffff'); P.line(g, x, y - 1.2, x, y + 1.2, 0.3, '#ffffff'); }
  } });
  // a warrior frozen mid-fight: the body (solid) and the ice around it (lm_frozen_ice, translucent, drawn on top)
  land('lm_frozen', { w: 28, h: 40, cy: 36, draw(g, f, c) {
    shadow(g, 14, 36.4, 13, 2.6);
    P.ell(g, 14, 35.4, 12.6, 3, P.lg(g, 0, 32, 0, 38, ['#ffffff', '#b8d8ec'])); // the frozen pool it stands in
    // a warrior caught by the cold mid-stride: one arm thrown up before the face, the sword trailing behind
    const skin = '#aabccb', mail = '#4c5a68', plate = '#6a7a8a', cloak = '#263240', leather = '#3a3632';
    const limb = (pts, w, col) => { g.strokeStyle = '#0c1016'; g.lineWidth = w + 1.2; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke();
      g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); };
    // the cloak, blown back and frozen stiff
    P.path(g, [9.6, 12.4, 18.6, 12, 22, 18, 24.6, 27, 22.4, 26, 23, 31, 19.6, 28.6, 17, 31.4, 16, 22]); P.fill(g, P.lg(g, 10, 0, 25, 0, ['#3a4a5c', cloak, '#141c26']));
    // legs: the front one bent, the back one braced
    limb([12, 21, 10, 27, 8.4, 32.6], 2.6, leather); limb([15.4, 21, 16.6, 27, 18.4, 32.6], 2.6, leather);
    P.rrect(g, 6, 31.4, 4.6, 2.2, 0.8, '#1c1a18'); P.rrect(g, 17, 31.4, 4.6, 2.2, 0.8, '#1c1a18');
    // the body: mail shirt, breastplate, belt
    P.path(g, [9.4, 12.6, 18.4, 12.4, 17, 21.6, 10.6, 21.6]); P.fill(g, P.lg(g, 9, 0, 18, 0, [sh(mail, 0.3), mail, sh(mail, -0.4)]));
    P.path(g, [10.4, 13, 17.4, 12.8, 16.4, 18.4, 11.4, 18.4]); P.fill(g, P.lg(g, 10, 12, 17, 18, [sh(plate, 0.5), plate, sh(plate, -0.35)]));
    P.rect(g, 10.4, 20, 7, 1.3, '#2a2218'); P.rect(g, 13.3, 19.8, 1.4, 1.7, '#8a8a70');
    // the sword arm, trailing, the blade reaching back to the ice
    limb([17.8, 13.4, 20.4, 17.4, 21.6, 20.6], 2.2, mail);
    g.strokeStyle = '#0c1016'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(21.6, 20.6); g.lineTo(25.4, 30.6); g.stroke();
    g.strokeStyle = '#c8d4de'; g.lineWidth = 1; g.beginPath(); g.moveTo(21.6, 20.6); g.lineTo(25.4, 30.6); g.stroke();
    P.line(g, 20, 21.8, 23.2, 19.8, 1, '#5a5040'); P.circle(g, 21.6, 20.6, 1, skin);
    // the shielding arm, thrown up before the face
    limb([9.8, 13.4, 6.6, 11, 9.6, 6.8], 2.2, mail); P.circle(g, 10, 6.6, 1.2, skin);
    // the round shield on that arm, raised against the cold
    P.circle(g, 6.8, 10.2, 3.1, '#0c1016'); P.circle(g, 6.8, 10.2, 2.7, P.lg(g, 4, 7.5, 9.5, 13, ['#6a5638', '#3a2c1c', '#1a140c']));
    g.strokeStyle = sh(plate, 0.2); g.lineWidth = 0.5; g.beginPath(); g.arc(6.8, 10.2, 2.5, 0, Math.PI * 2); g.stroke();
    P.line(g, 4.4, 10.2, 9.2, 10.2, 0.35, 'rgba(0,0,0,0.4)'); P.circle(g, 6.8, 10.2, 0.85, P.vol(g, 6.8, 10.2, 0.85, plate));
    g.strokeStyle = 'rgba(236,248,255,0.9)'; g.lineWidth = 0.6; g.beginPath(); g.arc(6.8, 10.2, 2.5, Math.PI * 1.1, Math.PI * 1.7); g.stroke();
    // the head, turned from the cold: pale, eyes shut, hair white with rime
    P.circle(g, 13.8, 9, 2.8, '#0c1016'); P.circle(g, 13.8, 9, 2.3, P.vol(g, 13.8, 9, 2.3, skin));
    g.beginPath(); g.arc(13.8, 8.4, 2.7, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(16.5, 8.9); g.lineTo(11.1, 8.9); g.closePath(); P.fill(g, P.lg(g, 11, 6, 16, 9.4, [sh(plate, 0.55), plate, sh(plate, -0.45)]));
    P.rect(g, 11.1, 8.2, 5.4, 0.8, sh(plate, -0.25)); P.rect(g, 15.4, 8.2, 0.7, 2.4, sh(plate, 0.1)); P.rect(g, 12, 5.8, 2.6, 0.6, 'rgba(236,248,255,0.95)'); // a nasal helm, rime on its crown
    P.line(g, 14.4, 9.4, 15.6, 9.2, 0.45, '#3a4450'); P.line(g, 14.8, 11, 15.8, 10.8, 0.45, '#5a4a50');
    // hoarfrost on everything facing up
    for (const [x, y, w] of [[9.8, 12.4, 3.6], [15.4, 12.2, 3.2], [10.4, 12.9, 2], [6.4, 10.4, 2.4], [19.6, 16.6, 2.2]]) P.rect(g, x, y, w, 0.7, 'rgba(236,248,255,0.95)');
  } });
  def('lm_frozen_ice', { w: 28, h: 40, cy: 36, soft: true, draw(g) {
    const blk = [2.4, 35, 1, 16, 3.6, 5, 9, 1.4, 19, 0.6, 25, 4.4, 27.4, 14, 26, 35];
    P.path(g, blk); P.fill(g, P.lg(g, 0, 0, 28, 38, ['rgba(236,250,255,0.3)', 'rgba(150,210,245,0.13)', 'rgba(70,140,200,0.3)']));
    // flat facets catching the light at different angles
    for (const [a, pts] of [[0.16, [1, 16, 3.6, 5, 9, 1.4, 7.4, 12]], [0.1, [9, 1.4, 19, 0.6, 14.6, 6.4, 7.4, 12]], [-0.14, [19, 0.6, 25, 4.4, 27.4, 14, 21, 11]],
      [0.06, [1, 16, 7.4, 12, 5.6, 26, 2.4, 35]], [-0.2, [27.4, 14, 26, 35, 22, 29, 21, 11]], [0.04, [14.6, 6.4, 19, 0.6, 21, 11]]]) {
      P.path(g, pts); P.fill(g, a > 0 ? 'rgba(255,255,255,' + a + ')' : 'rgba(20,70,120,' + (-a) + ')');
      g.strokeStyle = 'rgba(255,255,255,0.32)'; g.lineWidth = 0.35; g.stroke();
    }
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 0.6; P.path(g, blk); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 0.9;
    for (const [x1, y1, x2, y2] of [[3.6, 9, 5.4, 18], [4, 22, 4.8, 28], [22.4, 6, 23.6, 10.4], [11, 3, 15.4, 2.4]]) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 0.4;
    for (const pts of [[17, 18, 19.6, 22, 18.4, 26, 21, 30], [8, 27, 10.6, 24, 12, 27.4], [22.6, 16, 25.6, 19]]) { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); }
    // rime creeping up from the base, in soft drifts
    for (const [x, y, rx, ry] of [[5, 33.4, 3.4, 2.6], [10.6, 33, 3.6, 2.4], [16.4, 33.4, 3.4, 2.2], [21.6, 32.8, 3.6, 2.6]]) P.ell(g, x, y, rx, ry, 'rgba(240,250,255,0.7)');
    P.path(g, [2.4, 35, 2.6, 33, 26, 33, 26, 35]); P.fill(g, 'rgba(240,250,255,0.75)');
  } });

  /* ---------- Halls of Discord ---------- */

  // an obelisk of dark stone: a watching eye beneath its tip, a column of runes cut down its face, both alight
  land('lm_obelisk', { w: 16, h: 60, cy: 56, frames: 2, draw(g, f, c) {
    shadow(g, 8, 56.4, 7.4, 2);
    block(g, 0.8, 51.4, 12.8, 5, 1.6, c, -0.05); block(g, 2.2, 49, 10, 2.4, 1.2, c);
    const gl = c.glow === '#000000' ? '#c070ff' : c.glow, cg = Object.assign({}, c, { glow: gl });
    P.path(g, [3.2, 49, 4.4, 10, 11.6, 10, 12.8, 49]); P.fill(g, P.lg(g, 3, 0, 13, 0, [sh(c.stone, 0.1), sh(c.stone, -0.25), sh(c.stone, -0.4)]));
    P.path(g, [3.2, 49, 4.4, 10, 5.4, 10, 4.4, 49]); P.fill(g, sh(c.stone, 0.35));
    P.path(g, [11.6, 49, 10.6, 10, 11.6, 10, 12.8, 49]); P.fill(g, sh(c.stone, -0.65));
    P.path(g, [4.4, 10, 8, 1.6, 11.6, 10]); P.fill(g, sh(c.stone, 0.05));
    P.path(g, [4.4, 10, 8, 1.6, 6.6, 10]); P.fill(g, sh(c.stone, 0.45)); P.path(g, [9.4, 10, 8, 1.6, 11.6, 10]); P.fill(g, sh(c.stone, -0.55));
    P.line(g, 4.2, 10.2, 11.8, 10.2, 0.45, G.rgba(c.dark, 0.85));
    // the eye
    P.path(g, [5.6, 14.6, 8, 12.8, 10.4, 14.6, 8, 16.4]); P.fill(g, '#0a080c');
    P.glow(g, 8, 14.6, f ? 4.4 : 3.2, gl, f ? 0.75 : 0.5); P.circle(g, 8, 14.6, 1.1, gl); P.line(g, 8, 13.8, 8, 15.4, 0.45, '#0a080c');
    // the runes
    for (let i = 0; i < 5; i++) {
      const y = 21 + i * 5.2, gy = RUNES[(i * 4 + 1) % RUNES.length];
      const rune = () => { g.beginPath(); for (const s of gy) { g.moveTo(8 + s[0] * 1.5, y + s[1] * 1.9); for (let j = 2; j < s.length; j += 2) g.lineTo(8 + s[j] * 1.5, y + s[j + 1] * 1.9); } };
      groove(g, rune, cg, 0.9); rune(); g.strokeStyle = G.rgba(sh(gl, 0.35), f ? 1 : 0.7); g.lineWidth = 0.4; g.stroke();
      P.glow(g, 8, y, 2.4, gl, f ? 0.3 : 0.15);
    }
    P.rect(g, 3.5, 45, 9, 1.4, P.lg(g, 3, 0, 13, 0, ['#e8c060', '#8a5a18', '#3a2408']));
    cracks(g, [10, 20, 10.8, 25, 10.2, 30], c); cracks(g, [5, 36, 5.8, 40, 5.2, 43], c);
    P.glow(g, 8, 28, 9, gl, f ? 0.22 : 0.12);
    if (c.acc === VAR.ice.acc) { accent(g, c, 4.6, 8.4, 7, 'top'); accent(g, c, 2.4, 48.2, 10, 'top'); } else if (mossy(c)) accent(g, c, 1.4, 50.6, 11);
  } });
  // a cluster of crystals breaking out of a rock: faceted prisms with a lit face, a front face and a shaded one, light inside
  land('lm_crystal', { w: 26, h: 34, cy: 31, frames: 2, draw(g, f, c) {
    shadow(g, 13, 31.4, 11.6, 2.2);
    const gl = c.glow === '#000000' ? '#c070ff' : c.glow;
    P.glow(g, 13, 18, 14, gl, f ? 0.5 : 0.32);
    P.path(g, [1, 31, 2.6, 26.4, 7.4, 24, 13, 25, 19.6, 23.4, 24.4, 26.6, 25.4, 31]); P.fill(g, P.lg(g, 2, 23, 22, 31, [sh(c.stone, 0.35), c.stone, sh(c.stone, -0.55)]));
    const prism = (x, y, w, h, a) => {
      g.save(); g.translate(x, y); g.rotate(a);
      const q = w / 2, s = w / 6, tip = -h - w * 0.9;
      for (const [a0, a1, col] of [[-q, -s, sh(gl, 0.45)], [-s, s, sh(gl, 0)], [s, q, sh(gl, -0.55)]]) {
        P.path(g, [a0, 0, a0, -h, a1, -h, a1, 0]); P.fill(g, col); P.path(g, [a0, -h, a1, -h, 0, tip]); P.fill(g, sh(col, 0.18));
      }
      P.rect(g, -q, -h * 0.35, w, h * 0.35, P.lg(g, 0, -h * 0.35, 0, 0, [G.rgba(sh(gl, -0.6), 0), G.rgba(sh(gl, -0.6), 0.6)]));
      P.line(g, -s + 0.3, -1, -s + 0.3, -h + 0.4, 0.35, 'rgba(255,255,255,0.7)');
      P.line(g, -q + 0.1, -h, 0, tip, 0.3, 'rgba(255,255,255,0.65)');
      g.restore();
    };
    prism(7, 27, 4.4, 8, -0.5); prism(19.4, 26.6, 4.8, 10, 0.45); prism(13, 27.6, 6.4, 17, 0.05); prism(9, 29.4, 3.4, 4.6, -0.95); prism(17.8, 29.6, 3.2, 3.6, 0.85);
    for (const [x, y, r] of [[4, 30.4, 2], [22, 30.6, 2.2], [13, 31, 2.4], [16.4, 30.8, 1.2]]) P.circle(g, x, y, r, P.vol(g, x, y, r, c.stone));
    for (const [x, y] of f ? [[12.6, 5.4], [21.4, 13]] : [[5.2, 17.6]]) { P.glow(g, x, y, 2.4, '#ffffff', 0.6); P.line(g, x - 1.3, y, x + 1.3, y, 0.3, '#ffffff'); P.line(g, x, y - 1.3, x, y + 1.3, 0.3, '#ffffff'); }
    if (mossy(c)) accent(g, c, 2.4, 28.4, 8);
  } });

  /* ---------- Blightmire ---------- */

  // a dead tree, twisted and hollow: buttress roots, ridged bark, a hollow where something watches, moss and a rope
  land('lm_deadtree', { w: 46, h: 62, cy: 58, draw(g, f, c) {
    shadow(g, 23, 58.4, 18, 3);
    const B = ['#5e4e36', '#3a2e1c', '#1c140a', '#0c0804'];
    const br = (pts, w0) => { const n = pts.length / 2 - 1; for (let i = 0; i < n; i++) P.limb(g, pts[i * 2], pts[i * 2 + 1], pts[i * 2 + 2], pts[i * 2 + 3], w0 * (1 - i / n * 0.75), w0 * (1 - (i + 1) / n * 0.75), B[1]); };
    const tw = (x1, y1, x2, y2) => { g.lineCap = 'round'; P.line(g, x1, y1, x2, y2, 0.6, B[2]); };
    br([19, 28, 12, 21.4, 6, 18.4, 2.2, 16.4], 1.9); tw(6, 18.4, 4, 13.6); tw(12, 21.4, 10.4, 16.6); tw(2.2, 16.4, 0.8, 17.8);
    br([22, 17, 19.8, 9, 18.2, 4, 19.6, 1], 1.6); tw(19.8, 9, 22.6, 5.6); tw(18.2, 4, 15.8, 2.2);
    br([26, 25, 32, 16.4, 38, 12.6, 43.6, 10], 2); tw(32, 16.4, 33.2, 10.6); tw(38, 12.6, 40.2, 7.6); tw(43.6, 10, 45.2, 11.8);
    br([24.4, 20, 27, 12.4, 26.6, 6.4], 1.2);
    // buttress roots
    P.limb(g, 18, 50, 9, 58.4, 2.6, 0.9, B[1]); P.limb(g, 28.6, 50, 38, 58.2, 2.6, 0.9, B[1]); P.limb(g, 21, 55, 17, 60, 2, 0.8, B[2]); P.limb(g, 30, 55, 43, 60, 1.6, 0.6, B[2]);
    const trunk = [13, 58.6, 16.6, 50, 17.8, 42, 16.8, 34, 18.2, 26, 20.6, 18, 22.6, 13.6, 25, 18, 26.8, 26, 27.6, 34, 28.8, 44, 30.6, 52, 34.4, 58.6];
    P.path(g, trunk); P.fill(g, P.lg(g, 15, 0, 31, 0, [B[0], B[1], B[2], B[3]]));
    g.save(); P.path(g, trunk); g.clip();
    for (let i = 0; i < 9; i++) {
      const x = 15.4 + i * 1.9, ph = i * 1.7;
      g.beginPath(); g.moveTo(x, 59); for (let y = 56; y > 12; y -= 4) g.lineTo(x + Math.sin(y * 0.18 + ph) * 0.8 + (56 - y) * 0.04 * (i - 4) * 0.3, y);
      g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 0.55; g.stroke();
      g.save(); g.translate(-0.6, 0); g.strokeStyle = 'rgba(255,230,190,' + (i < 4 ? 0.12 : 0.05) + ')'; g.lineWidth = 0.35; g.stroke(); g.restore();
    }
    g.restore();
    // the hollow, and what looks out of it
    P.ell(g, 23, 38.4, 3, 4.2, B[0]); P.ell(g, 23.2, 38.6, 2.5, 3.7, '#060402');
    if (c.glow !== '#000000') for (const x of [22.2, 24.2]) { P.glow(g, x, 37.8, 2, c.glow, 0.7); P.circle(g, x, 37.8, 0.42, c.glow); }
    P.ell(g, 19.4, 47.6, 1, 1.4, B[3]); // a knot
    // a frayed rope hanging from the big branch
    P.line(g, 35.4, 14.6, 35.8, 26, 0.5, '#8a7a58');
    g.strokeStyle = '#8a7a58'; g.lineWidth = 0.5; g.beginPath(); g.ellipse(35.8, 28, 1.2, 1.9, 0, 0, Math.PI * 2); g.stroke();
    // hanging moss
    const M = c.acc === VAR.bog.acc ? ['#3a4c20', '#7a9a30'] : ['#2e3a22', '#5a6a3a'];
    g.lineCap = 'round';
    for (const [x, y, l] of [[6, 18.4, 9], [11, 21, 7], [36, 14.6, 10], [40.6, 11.6, 7], [19.6, 7, 6], [30.6, 19.6, 8], [3, 16.6, 6]]) {
      g.strokeStyle = M[0]; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 1, y + l / 2, x - 0.6, y + l); g.stroke();
      g.strokeStyle = M[1]; g.lineWidth = 0.45; g.beginPath(); g.moveTo(x - 0.2, y); g.quadraticCurveTo(x + 0.6, y + l / 2, x - 0.6, y + l * 0.85); g.stroke();
    }
    for (const [x, s] of [[10, 1], [14, -1], [33, 1], [37, -1]]) { g.strokeStyle = M[0]; g.lineWidth = 0.5; g.beginPath(); g.moveTo(x, 59); g.quadraticCurveTo(x + s * 0.4, 57, x + s * 1.2, 55.6); g.stroke(); }
  } });
  // an abandoned hut sinking into the bog, swallowed by moss, ivy and ferns; one window still holds a dim candle
  land('lm_hut', { w: 68, h: 72, cy: 66, frames: 2, draw(g, f, c) {
    shadow(g, 34, 66.4, 31, 3.6);
    const leaf = (x, y, r, col) => P.ell(g, x, y, r, r * 0.62, col, (x * 7 + y) % 3 - 1);
    const MOSS = ['#1c2610', '#2a3818', '#3a4c20', '#4e6428'];
    // short, sagging stilts sunk in the mud, furred with moss, pale mushrooms on them
    for (const [x, lean] of [[14, -1.6], [30, 0.6], [44, -0.8], [56, 1.6]]) {
      g.strokeStyle = '#0c0a06'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x, 50); g.lineTo(x + lean, 65); g.stroke();
      g.strokeStyle = '#3a3426'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 50); g.lineTo(x + lean, 65); g.stroke();
      P.ell(g, x + lean * 0.6, 60, 1.8, 3, MOSS[2]);
    }
    for (const [x, y] of [[15.4, 55], [45, 57.4], [57, 54]]) { P.ell(g, x, y, 1.8, 0.8, '#d8d0b8'); P.rect(g, x - 0.4, y, 0.8, 1.4, '#b8b098'); }
    // the rotten platform, sagging at one end
    P.path(g, [8, 49, 60, 47, 61, 51.6, 7, 53.4]); P.fill(g, P.lg(g, 0, 47, 0, 53, ['#4a4434', '#1a1810']));
    g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 0.5; for (let x = 12; x < 60; x += 5) { g.beginPath(); g.moveTo(x, 48); g.lineTo(x - 0.3, 53); g.stroke(); }
    // walls of grey, weathered planks, one side bowed
    P.path(g, [12, 49, 11.4, 27, 56.6, 25, 56, 47.6]); P.fill(g, '#0c0a06');
    g.save(); P.path(g, [12, 49, 11.4, 27, 56.6, 25, 56, 47.6]); g.clip();
    for (let i = 0; i < 12; i++) {
      const x = 11.4 + i * 3.77, k = ((i * 5) % 4) / 3 - 0.5;
      P.rect(g, x + 0.3, 20, 3.3, 30, P.lg(g, 0, 25, 0, 50, [sh('#4e4838', k * 0.3 - i * 0.03), sh('#262219', k * 0.3 - i * 0.03)]));
      P.rect(g, x + 0.3, 20, 0.5, 30, 'rgba(220,210,170,0.1)');
      if (i % 3 === 1) P.ell(g, x + 1.9, 33 + (i * 7 % 10), 0.5, 0.8, 'rgba(0,0,0,0.5)');
      for (const y of [30.6, 45]) P.circle(g, x + 1.9, y - i * 0.16, 0.25, '#7a6a52');
    }
    g.restore();
    P.path(g, [40, 31, 44, 30.6, 43, 36, 40.6, 35]); P.fill(g, '#0a0806'); // a plank torn away
    // a low doorway, half hidden behind hanging vines
    P.path(g, [24, 48.6, 24, 34, 33, 33.2, 33, 48.4]); P.fill(g, '#060504');
    P.rect(g, 23, 32.4, 11, 1.6, '#2a2418');
    // one small window with a dim candle behind cracked shutters; the other boarded up
    P.rect(g, 43.6, 36.6, 7.4, 6, '#0a0804');
    P.rect(g, 44.4, 37.4, 5.8, 4.4, P.rg(g, 47.3, 39.6, 4.4, [[0, f ? '#f0c060' : '#d8a040'], [0.5, '#7a5418'], [1, '#1a1206']]));
    P.rect(g, 47, 36.6, 0.8, 6, '#1a1408'); P.rect(g, 43.6, 39.2, 7.4, 0.7, '#1a1408');
    P.path(g, [42.4, 36, 43.6, 36.6, 43.6, 42.6, 42, 43.4]); P.fill(g, '#3a3426'); // a hanging shutter
    P.rect(g, 15, 35, 6.4, 6.4, '#0a0806'); // the other window, boarded up
    for (const y of [35.6, 38.4]) { P.path(g, [14.4, y + 0.6, 22, y - 0.4, 22, y + 1.2, 14.4, y + 2.2]); P.fill(g, '#4a4434'); }
    // a crude ladder down from the door to the mud
    for (const [x0, x1] of [[25, 23.4], [32, 33.6]]) { P.line(g, x0, 48.6, x1, 66, 1.3, '#0c0a06'); P.line(g, x0, 48.6, x1, 66, 0.7, '#4a4232'); }
    for (let y = 51.4; y < 65; y += 3.2) { const t = (y - 48.6) / 17.4; P.line(g, 25 - 1.6 * t, y, 32 + 1.6 * t, y, 0.7, '#3a3426'); }
    // a crooked stone chimney, cold and overgrown
    P.path(g, [46, 16, 45.4, 4, 51, 3.4, 51.4, 15]); P.fill(g, P.lg(g, 45, 0, 52, 0, ['#5a5a50', '#34342e', '#1a1a16']));
    g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 0.5; for (const y of [6.4, 9.4, 12.4]) { g.beginPath(); g.moveTo(45.6, y); g.lineTo(51.2, y - 0.3); g.stroke(); }
    leaf(47, 4, 2.2, MOSS[2]); leaf(50, 3.6, 1.6, MOSS[3]);
    // the roof: a heavy, sagging mat of moss and turf
    const roof = [5, 29, 12, 17, 22, 10, 34, 7, 46, 9.6, 56, 15, 63, 26, 58, 27.4, 50, 26, 42, 28, 34, 26.6, 26, 28.4, 18, 27, 10, 30.4];
    P.path(g, roof); P.fill(g, P.lg(g, 0, 7, 0, 30, [MOSS[3], MOSS[2], MOSS[0]]));
    g.save(); P.path(g, roof); g.clip();
    for (let i = 0; i < 70; i++) { const x = 5 + (i * 37 % 58), y = 8 + (i * 23 % 22); leaf(x, y, 1.2 + (i % 3) * 0.6, MOSS[(i * 7) % 4]); }
    g.restore();
    // hanging moss drapes from the eaves, and ivy climbing the walls
    g.lineCap = 'round';
    for (const [x, y, l] of [[8, 29, 9], [13, 29.6, 6], [21, 27.6, 12], [29, 28, 7], [37, 27, 10], [45, 27.6, 6], [53, 26.4, 11], [60, 27, 7]]) {
      g.strokeStyle = MOSS[1]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (f ? 0.8 : -0.4), y + l * 0.6, x + (f ? 0.4 : -0.2), y + l); g.stroke();
      g.strokeStyle = MOSS[3]; g.lineWidth = 0.5; g.beginPath(); g.moveTo(x - 0.3, y); g.lineTo(x - 0.2, y + l * 0.8); g.stroke();
    }
    // a charm of bones and a small skull hung from the eaves
    P.line(g, 40.4, 27.4, 40.4, 32.4, 0.3, '#8a7a58'); P.line(g, 38.8, 33, 42, 35.6, 0.6, '#d8ccb0'); P.line(g, 42, 33, 38.8, 35.6, 0.6, '#d8ccb0');
    P.ell(g, 40.4, 33.6, 1.1, 1, '#e0d4b8'); for (const x of [40, 40.8]) P.circle(g, x, 33.6, 0.28, '#1a1208');
    g.strokeStyle = '#1e2a12'; g.lineWidth = 0.8;
    for (const pts of [[12, 49, 13, 42, 11.6, 36, 13.4, 30], [34, 48.4, 35.6, 40, 34, 33], [56, 47.6, 54.6, 40, 56.4, 32]]) {
      g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke();
      for (let i = 0; i < pts.length; i += 2) { leaf(pts[i] - 1.2, pts[i + 1], 1.3, MOSS[2]); leaf(pts[i] + 1.2, pts[i + 1] - 1.4, 1.1, MOSS[3]); }
    }
    // ferns and bushes at its feet, mist over the mire
    const fern = (x, y, s, col) => { g.strokeStyle = col; g.lineWidth = 0.9; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + k * 2.4 * s, y - 4 * s, x + k * 4.4 * s, y - (5.4 - Math.abs(k)) * s); g.stroke(); } };
    fern(6, 66, 1.3, MOSS[2]); fern(20, 66.4, 1, MOSS[3]); fern(38, 66.6, 1.1, MOSS[2]); fern(62, 66, 1.3, MOSS[3]); fern(50, 67, 0.9, MOSS[1]);
    for (const [x, y, r] of [[2.4, 64, 3.4], [9, 65, 2.6], [64.6, 64, 3.2], [27, 66, 2.2]]) { leaf(x, y, r, MOSS[1]); leaf(x + 1, y - 1.4, r * 0.7, MOSS[2]); }
    // a skull on a stake by the ladder, watching the way in
    P.line(g, 19, 66.6, 19.4, 55, 0.9, '#3a3020'); P.ell(g, 19.4, 54, 1.9, 1.7, P.vol(g, 19.4, 54, 1.9, '#d8ccb0')); P.rrect(g, 18.4, 55, 2, 1.2, 0.4, '#c8bca0');
    for (const x of [18.7, 20.1]) { P.ell(g, x, 54.1, 0.5, 0.55, '#120c06'); if (c.glow !== '#000000') { P.circle(g, x, 54.1, 0.3, c.glow); P.glow(g, x, 54.1, 1.6, c.glow, 0.6); } }
    P.glow(g, 34, 62, 30, '#8aa070', 0.12);
  } });
  // cattails and sedge in a pool of black water, swaying
  land('lm_reeds', { w: 24, h: 22, cy: 20, frames: 2, draw(g, f, c) {
    P.ell(g, 12, 19.8, 11.4, 2.2, P.lg(g, 0, 17.6, 0, 22, ['#2a3024', '#0c100a']));
    P.line(g, 4, 19, 9, 18.8, 0.35, 'rgba(200,220,190,0.3)'); P.line(g, 15, 20.4, 20, 20.2, 0.35, 'rgba(200,220,190,0.2)');
    const sw = f ? 1 : -0.7, D = sh(c.acc, -0.35), L = sh(c.acc, 0.15);
    const blade = (x, h, lean, w, col) => { const tx = x + lean * sw; g.beginPath(); g.moveTo(x - w, 19.6); g.quadraticCurveTo(x - w * 0.4 + lean * sw * 0.3, 19.6 - h * 0.55, tx, 19.6 - h); g.quadraticCurveTo(x + w * 0.5 + lean * sw * 0.4, 19.6 - h * 0.5, x + w, 19.6); g.closePath(); P.fill(g, col); };
    for (const [x, h, l, w] of [[3, 9, -2.4, 0.8], [7.4, 13, 1.6, 0.9], [11, 8, -1.6, 0.8], [16.6, 12, 2.2, 0.9], [20.6, 8, 2.6, 0.8]]) blade(x, h, l, w, D);
    // the cattails: a dark velvet head on a stiff stem, a thin spike above it
    for (const [x, h, l] of [[5.4, 17, -0.8], [10, 19.4, 0.5], [14, 15.4, 0.9], [18.6, 18, 1.4]]) {
      const tx = x + l * sw, ty = 19.6 - h;
      P.line(g, x, 19.6, tx, ty, 0.5, sh(c.acc, -0.2));
      P.rrect(g, tx - 0.85, ty + 1.2, 1.7, 4.4, 0.8, P.lg(g, tx - 0.85, 0, tx + 0.85, 0, ['#7a5230', '#4a2c14', '#24140a']));
      P.line(g, tx, ty + 1.2, tx + l * 0.12 * sw, ty - 0.6, 0.3, '#6a5a3a');
    }
    for (const [x, h, l, w] of [[1.6, 7, -1.6, 0.7], [8.6, 10, -0.8, 0.8], [12.6, 11, 1.2, 0.8], [18, 9, -1, 0.8], [22.4, 7, 1.8, 0.7]]) blade(x, h, l, w, L);
    P.line(g, 8.2, 16, 8.4, 11, 0.3, 'rgba(255,255,255,0.18)');
    for (const [x, y] of [[3.6, 20.2], [13.2, 20.4], [21, 20]]) P.ell(g, x, y, 1.4, 0.4, 'rgba(200,220,190,0.14)');
  } });
  // a standing stone: two broad weathered planes, lichen, a spiral carved deep and still glowing
  land('lm_menhir', { w: 16, h: 36, cy: 33, draw(g, f, c) {
    shadow(g, 8, 33.4, 7.4, 2);
    const out = [2.4, 33, 1.6, 24, 2.4, 13, 4.2, 5.4, 7.4, 1.8, 10.8, 3, 13, 9, 13.8, 20, 14.4, 33];
    P.path(g, out); P.fill(g, P.lg(g, 2, 0, 10, 0, [sh(c.stone, 0.4), c.stone]));
    P.path(g, [7.4, 1.8, 10.8, 3, 13, 9, 13.8, 20, 14.4, 33, 10.4, 33, 9.6, 20, 9.2, 8]); P.fill(g, P.lg(g, 9, 0, 14, 0, [sh(c.stone, -0.35), sh(c.stone, -0.6)]));
    P.line(g, 7.4, 2, 9.2, 8, 0.35, 'rgba(255,255,255,0.3)'); P.line(g, 9.2, 8, 9.6, 20, 0.35, 'rgba(255,255,255,0.2)');
    cracks(g, [4, 9, 5, 12, 4.4, 15], c); cracks(g, [11.4, 22, 12.4, 26, 11.6, 29], c);
    // lichen in pale blotches
    for (const [x, y, r] of [[4, 7.4, 1.2], [3.2, 26, 1.4], [6.6, 29.6, 1], [11.6, 13, 0.9]]) { P.ell(g, x, y, r, r * 0.7, 'rgba(170,180,130,0.55)'); P.ell(g, x + r * 0.5, y + r * 0.3, r * 0.5, r * 0.35, 'rgba(120,130,90,0.6)'); }
    // the spiral and a ring of cup marks
    const gl = c.glow === '#000000' ? '#9ab070' : c.glow;
    const spiral = () => { g.beginPath(); for (let a = 0; a < Math.PI * 5; a += 0.25) { const r = 0.3 + a * 0.28; const x = 6.6 + Math.cos(a) * r, y = 17 + Math.sin(a) * r * 1.2; if (a) g.lineTo(x, y); else g.moveTo(x, y); } };
    groove(g, spiral, Object.assign({}, c, { glow: gl }), 0.8);
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + i * 0.9; P.circle(g, 6.6 + Math.cos(a) * 5.4, 17 + Math.sin(a) * 6.8, 0.4, G.rgba(c.dark, 0.8)); }
    P.glow(g, 6.6, 17, 6, gl, 0.3);
    // grass at its foot
    for (const [x, s] of [[2.6, -1], [4, 1], [12.6, 1], [14, -1], [9, 1]]) { g.strokeStyle = sh(c.acc === BASE.acc ? '#5a7a3a' : c.acc, -0.2); g.lineWidth = 0.5; g.beginPath(); g.moveTo(x, 33.4); g.quadraticCurveTo(x + s * 0.4, 31.6, x + s * 1.2, 30.4); g.stroke(); }
    accent(g, c, 2.4, 31, 11); accent(g, c, 5, 4.6, 5);
    if (c.acc === VAR.ice.acc) accent(g, c, 4, 3.6, 8, 'top');
  } });

  /* ---------- Sealed Reliquary ---------- */

  // a hoard gone cold: a heap of coins, an open chest spilling more, a crown, a goblet, a sword and a skull half buried
  land('lm_hoard', { w: 34, h: 22, cy: 18, draw(g, f, c) {
    shadow(g, 17, 18.6, 16.4, 2.6);
    const GOLD = ['#fff4b0', '#f0c040', '#b07a18', '#5a3a08'];
    // the chest behind, its lid thrown back
    P.path(g, [21.4, 3.2, 31.8, 2.2, 32.2, 7.4, 21.8, 8]); P.fill(g, P.lg(g, 0, 2, 0, 8, ['#6a3a1c', '#2a140a']));
    P.rect(g, 21.6, 2.9, 10.4, 0.8, '#c89030');
    P.rrect(g, 21, 8, 11.6, 6.6, 0.6, P.lg(g, 0, 8, 0, 14.6, ['#7a4424', '#3a1c0c']));
    P.rect(g, 21, 10.6, 11.6, 1, '#c89030'); P.rrect(g, 26, 10.2, 1.8, 2.2, 0.3, '#e8c050');
    P.ell(g, 26.8, 8.4, 5.4, 1.4, P.lg(g, 21, 0, 32, 0, [GOLD[0], GOLD[1], GOLD[2]])); P.glow(g, 26.8, 8, 5, '#ffd040', 0.45);
    // a sword thrust into the pile
    P.path(g, [7.6, 1.6, 8.6, 1.2, 11.8, 10, 10.6, 10.4]); P.fill(g, P.lg(g, 7.6, 0, 11.8, 0, ['#e8eef4', '#8a96a4']));
    P.line(g, 5.6, 3.4, 10.2, 1.8, 0.8, '#c89030'); P.line(g, 7.2, 1.4, 6.4, -0.6, 0.8, '#4a2c18'); P.circle(g, 6.2, -0.4, 0.6, '#e8c050');
    // the heap
    g.beginPath(); g.moveTo(1, 18.6); g.quadraticCurveTo(5, 8.4, 16, 8); g.quadraticCurveTo(28, 8.4, 33, 18.6); g.closePath();
    P.fill(g, P.lg(g, 0, 8, 0, 18.6, [GOLD[1], GOLD[2], GOLD[3]]));
    const surf = (x) => 18.6 - 10.4 * Math.sin(Math.PI * (x - 1) / 32);
    // a skull half sunk in the gold
    P.ell(g, 24.4, 15, 2.1, 1.8, P.vol(g, 24.4, 15, 2.1, '#d8ccb0'));
    for (const x of [23.6, 25.2]) P.ell(g, x, 15.2, 0.55, 0.6, '#1a1208');
    const coins = [];
    for (let i = 0; i < 38; i++) { const x = 2.6 + (i * 53 % 29), y = surf(x) + 0.8 + (i * 31 % 9) * 0.95; if (y < 18.4) coins.push([x, y, i]); }
    coins.sort((a, b) => a[1] - b[1]);
    for (const [x, y, i] of coins) { P.ell(g, x, y, 1.35, 0.72, GOLD[3]); P.ell(g, x, y - 0.1, 1.1, 0.5, i % 3 ? GOLD[1] : GOLD[2]); P.rect(g, x - 0.6, y - 0.4, 0.5, 0.25, GOLD[0]); }
    for (const [x, y] of [[8.4, 11.8], [18.6, 12.4]]) { P.ell(g, x, y, 0.5, 1.3, GOLD[2]); P.ell(g, x - 0.1, y, 0.3, 1.1, GOLD[0]); } // coins on edge
    // the goblet
    P.path(g, [3.4, 10.4, 7.2, 10.4, 6.4, 13.2, 5.8, 13.4, 5.8, 15.2, 7, 15.8, 3.6, 15.8, 4.8, 15.2, 4.8, 13.4, 4.2, 13.2]); P.fill(g, P.lg(g, 3, 0, 7, 0, [GOLD[0], GOLD[1], GOLD[3]]));
    P.ell(g, 5.3, 10.5, 1.9, 0.5, GOLD[3]); P.circle(g, 5.3, 12, 0.5, '#ff3040');
    // the crown, fallen askew on top
    g.save(); g.translate(15.4, 7.6); g.rotate(-0.22);
    P.path(g, [-3, 0, -3.2, -2.6, -1.6, -1.2, 0, -3.4, 1.6, -1.2, 3.2, -2.6, 3, 0]); P.fill(g, P.lg(g, -3, 0, 3, 0, [GOLD[0], GOLD[1], GOLD[2]]));
    for (const x of [-3.2, 0, 3.2]) P.circle(g, x, x ? -2.8 : -3.6, 0.45, GOLD[0]);
    P.rect(g, -3, -0.9, 6, 0.9, GOLD[2]); P.circle(g, -1.4, -0.45, 0.4, '#ff3040'); P.circle(g, 1.4, -0.45, 0.4, '#40a0ff');
    g.restore();
    for (const [x, y, col] of [[12, 15.6, '#40d070'], [28.4, 16.2, '#ff3040'], [19.6, 16.8, '#40a0ff']]) { P.path(g, [x, y - 0.8, x + 0.7, y, x, y + 0.6, x - 0.7, y]); P.fill(g, col); P.rect(g, x - 0.2, y - 0.5, 0.3, 0.3, '#ffffff'); }
    for (const [x, y] of [[13, 9.4], [27, 12.6], [9.6, 4.6]]) { P.glow(g, x, y, 2.6, '#fff4c0', 0.7); P.line(g, x - 1.1, y, x + 1.1, y, 0.3, '#ffffff'); P.line(g, x, y - 1.1, x, y + 1.1, 0.3, '#ffffff'); }
  } });
})(window.DH);
