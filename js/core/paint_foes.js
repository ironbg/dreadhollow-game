/* HD vector painters: each hall's own foes and bosses (one model per creature, no recolours).
 * Same language as paint_enemies.js / paint_bosses.js: dark gaunt silhouettes, ember eyes, claws and rags; facing right. */
(function (DH) {
  'use strict';
  const G = DH.gfx, P = G.P, sh = G.shade;
  const def = (name, o) => { G.painters[name] = o; };
  const VOID = '#07040a';
  const { evil, teeth, claws, limb, rag } = P;
  /** A curved horn from base (x,y) through (mx,my) to the tip (tx,ty). */
  function horn(g, x, y, mx, my, tx, ty, w, col) {
    const a = Math.atan2(ty - y, tx - x), nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
    g.beginPath(); g.moveTo(x + nx, y + ny); g.quadraticCurveTo(mx + nx * 0.5, my + ny * 0.5, tx, ty); g.quadraticCurveTo(mx - nx * 0.5, my - ny * 0.5, x - nx, y - ny); g.closePath();
    P.fill(g, P.lg(g, x, y, tx, ty, [sh(col, -0.35), col, sh(col, 0.5)]));
  }
  /** A skull seen three-quarter, facing right, centred at (x,y), radius r. */
  function skull(g, x, y, r, bone, eye) {
    P.circle(g, x, y, r, P.vol(g, x, y, r, bone));
    P.rrect(g, x - r * 0.1, y + r * 0.45, r * 1.05, r * 0.55, r * 0.2, sh(bone, -0.1));
    P.ell(g, x + r * 0.42, y + 0.05 * r, r * 0.36, r * 0.34, VOID, -0.3); P.ell(g, x - r * 0.3, y + 0.05 * r, r * 0.3, r * 0.3, VOID, 0.3);
    if (eye) { evil(g, x + r * 0.44, y + r * 0.08, r * 0.2, eye, -0.3); evil(g, x - r * 0.28, y + r * 0.08, r * 0.16, eye, 0.3); }
    teeth(g, x, y + r * 0.55, x + r * 0.95, y + r * 0.55, 4, r * 0.2, 1, sh(bone, 0.2));
  }
  P.skull = skull;

  /* ================= Hall 1: the Crypt ================= */

  /* ---------- Bone Mage: a hooded skeleton, a crooked staff crowned with a burning skull ---------- */
  def('bonemage', { w: 22, h: 26, cy: 16, frames: 2,
    colors: { robe: '#2a1e34', bone: '#d8ccaa', eye: '#9a70ff', fire: '#9a70ff' },
    draw(g, f, c) {
      const r = c.robe, sway = f ? 0.6 : -0.6;
      // a ragged robe falling to the floor
      g.beginPath(); g.moveTo(7, 10); g.lineTo(13.4, 10); g.quadraticCurveTo(15, 17, 15.6 + sway, 23); g.lineTo(5.2 + sway, 23); g.quadraticCurveTo(5.6, 16, 7, 10); g.closePath();
      P.fill(g, P.lg(g, 5, 10, 15, 23, [sh(r, 0.25), r, sh(r, -0.55)]));
      rag(g, 5.2 + sway, 22.6, 15.6 + sway, 22.6, 5, 1.6, sh(r, -0.45));
      g.save(); g.globalAlpha = 0.45; for (let i = 0; i < 3; i++) P.line(g, 8.4 + i * 1.6, 12, 7.4 + i * 2.4, 22, 0.4, sh(r, -0.6)); g.restore();
      // bone feet peeking out
      P.ell(g, 7.6 + sway, 23.3, 1.2, 0.45, sh(c.bone, -0.3)); P.ell(g, 12.6 + sway, 23.3, 1.2, 0.45, sh(c.bone, -0.15));
      // far arm: a bony hand raised, a hex gathering
      P.bone(g, 7.6, 11.4, 4.6, 9, 0.6, sh(c.bone, -0.3)); claws(g, 4.4, 8.6, -2.2, 3, 1.3, 0.3, c.bone);
      P.glow(g, 3.8, 7.2, 3.4 + (f ? 0.6 : 0), c.fire, 0.7); P.circle(g, 3.8, 7.2, 0.8, sh(c.fire, 0.6));
      // hood with the skull inside it
      const hx = 10.6, hy = 6.4;
      g.beginPath(); g.moveTo(hx - 4.4, hy + 4.4); g.quadraticCurveTo(hx - 5, hy - 4.4, hx + 0.4, hy - 5.4); g.quadraticCurveTo(hx + 5, hy - 3.6, hx + 4.6, hy + 4.2); g.quadraticCurveTo(hx, hy + 2.4, hx - 4.4, hy + 4.4); g.closePath();
      P.fill(g, P.lg(g, hx - 4, hy - 5, hx + 4, hy + 4, [sh(r, 0.35), r, sh(r, -0.5)]));
      P.ell(g, hx + 0.6, hy + 0.6, 3, 3.3, VOID);
      skull(g, hx + 0.9, hy + 0.4, 2.2, sh(c.bone, -0.1), c.eye);
      // near arm and the staff: bent wood, a skull on top wreathed in witch-fire
      P.bone(g, 12.4, 11.6, 15.4, 13, 0.65, c.bone); claws(g, 15.6, 13, 0.3, 3, 1.1, 0.3, c.bone);
      P.line(g, 16.4, 23, 17.6, 5.4, 0.9, P.lg(g, 16, 0, 18, 0, ['#4a3426', '#1e140e']));
      P.line(g, 17.2, 11, 18.4, 9.6, 0.4, '#2a1c14');
      P.glow(g, 17.8, 2.6, 5.4 + (f ? 0.8 : 0), c.fire, 0.8);
      skull(g, 17.8, 3.6, 1.7, '#e0d4b4', c.eye);
      for (let i = 0; i < 3; i++) { const a = -1.9 + i * 0.4 + (f ? 0.2 : -0.1); P.path(g, [17 + i * 0.8, 2.4, 17.4 + i * 0.8 + Math.cos(a) * 2.6, 2.4 + Math.sin(a) * 2.6 - (f ? 0.7 : 0), 18 + i * 0.8, 2.4]); P.fill(g, G.rgba(sh(c.fire, 0.4), 0.8)); }
    } });

  /* ---------- Grave Chieftain (boss): a hunched gravedigger ogre, a tombstone hammer over its shoulder ---------- */
  def('gravechief', { w: 52, h: 50, cy: 30, frames: 2,
    colors: { skin: '#6e7a62', rag: '#3a2e26', eye: '#ff5a2a', stone: '#8a8a90' },
    draw(g, f, c) {
      const s = c.skin, sd = sh(s, -0.5), w = f ? 1 : -1;
      P.ell(g, 26, 47, 17, 2.6, 'rgba(0,0,0,0.45)');
      // legs, thick and bowed, wrapped in rags
      limb(g, 20, 32, 17 - w, 40, 3.4, 2.8, sd); limb(g, 17 - w, 40, 17 - w, 46, 2.8, 2.6, sd);
      limb(g, 30, 32, 33 + w, 40, 3.4, 2.8, s); limb(g, 33 + w, 40, 33.6 + w, 46, 2.8, 2.6, s);
      P.ell(g, 16.4 - w, 46.4, 3.4, 1.2, '#1a1410'); P.ell(g, 34.4 + w, 46.4, 3.4, 1.2, '#1a1410');
      // loincloth and a belt of bones and keys
      P.path(g, [16, 29, 35, 29, 36, 37, 31, 34, 27, 38, 23, 34, 18, 37]); P.fill(g, P.lg(g, 16, 29, 36, 38, [sh(c.rag, 0.2), sh(c.rag, -0.5)]));
      P.line(g, 15.6, 29.4, 35.6, 29.4, 1.4, '#2a1c14');
      for (let i = 0; i < 4; i++) P.bone(g, 18 + i * 4.6, 30, 18.6 + i * 4.6, 33.4, 0.5, '#d8ccaa');
      // the huge hunched torso, belly and back
      g.beginPath(); g.moveTo(14, 30); g.quadraticCurveTo(9, 18, 17, 11); g.quadraticCurveTo(26, 6, 34, 11); g.quadraticCurveTo(40, 18, 36, 30); g.closePath();
      P.fill(g, P.rg(g, 24, 20, 17, [[0, sh(s, 0.3)], [0.6, s], [1, sh(s, -0.55)]], 22, 16));
      g.save(); g.globalAlpha = 0.4; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(25, 22 + i * 2, 6 - i, 0.3, 2.8); g.strokeStyle = sd; g.lineWidth = 0.5; g.stroke(); } g.restore();
      // stitched scar and grave-chains across the chest
      g.strokeStyle = '#2a1410'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(20, 14); g.lineTo(29, 24); g.stroke();
      for (let i = 0; i < 5; i++) P.line(g, 21 + i * 1.8, 16 + i * 2, 22.4 + i * 1.8, 14.8 + i * 2, 0.35, '#2a1410');
      for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(14 + i * 3.4, 14 + i * 1.6, 1.2, 0.7, 0.5, 0, Math.PI * 2); g.strokeStyle = '#5a5a60'; g.lineWidth = 0.6; g.stroke(); }
      // far arm hanging low, a lantern of bone
      limb(g, 14, 17, 9, 27, 2.6, 2.2, sd); claws(g, 9, 28, 1.8, 4, 2.2, 0.5, '#e0d6bc');
      P.line(g, 9, 29, 9, 33, 0.4, '#2a1c14'); P.rrect(g, 7, 33, 4, 5, 1, '#3a2a20'); P.glow(g, 9, 35.6, 5, c.eye, 0.7); P.rect(g, 8, 34, 2, 3, sh(c.eye, 0.4));
      // head sunk between the shoulders: tusks, a crown of finger bones
      const hx = 30, hy = 11;
      P.circle(g, hx, hy, 6, P.vol(g, hx, hy, 6, s));
      P.path(g, [hx - 1, hy + 2, hx + 6, hy + 2, hx + 5, hy + 5.4, hx, hy + 5.6]); P.fill(g, '#140404');
      P.path(g, [hx + 0.4, hy + 2.4, hx + 1.2, hy - 0.6, hx + 1.8, hy + 2.4]); P.fill(g, '#efe4c8');
      P.path(g, [hx + 3.6, hy + 2.4, hx + 4.6, hy - 0.4, hx + 5, hy + 2.4]); P.fill(g, '#efe4c8');
      P.ell(g, hx + 1.2, hy - 1.8, 1.8, 1, VOID, -0.2); evil(g, hx + 1.6, hy - 1.8, 0.8, c.eye); evil(g, hx - 2.2, hy - 1.6, 0.6, c.eye);
      for (let i = 0; i < 6; i++) { const a = -2.6 + i * 0.4; P.bone(g, hx + Math.cos(a) * 5, hy + Math.sin(a) * 5, hx + Math.cos(a) * 8.4, hy + Math.sin(a) * 8.4 - 0.6, 0.55, '#e0d4b4'); }
      // near arm hoisting the tombstone hammer onto the shoulder
      limb(g, 35, 16, 42, 22, 2.8, 2.4, s); limb(g, 42, 22, 40, 13, 2.4, 2.2, s);
      P.line(g, 37 + w * 0.3, 29, 42, 4, 1.8, P.lg(g, 37, 0, 43, 0, ['#4a3426', '#241810']));
      g.save(); g.translate(42.6, 3.6); g.rotate(0.22);
      P.rrect(g, -7, -5, 14, 9, 3.2, '#1a1a1e'); P.rrect(g, -6.4, -4.4, 12.8, 8, 2.8, P.lg(g, 0, -5, 0, 4, [sh(c.stone, 0.3), c.stone, sh(c.stone, -0.5)]));
      P.line(g, -1.6, -2.6, 1.6, -2.6, 0.6, '#3a3a40'); P.line(g, 0, -3.8, 0, 1, 0.6, '#3a3a40'); // a carved cross
      P.path(g, [2.8, -4, 4.4, -1, 3, 2]); g.strokeStyle = '#3a3a40'; g.lineWidth = 0.4; g.stroke();
      g.restore();
      claws(g, 40, 12.4, -1.4, 4, 2, 0.5, '#e0d6bc');
    } });

  /* ---------- Bone Tyrant (boss): a skeletal king in black plate, a jagged crown, a greatsword planted before him ---------- */
  def('bonetyrant', { w: 46, h: 56, cy: 34, frames: 2,
    colors: { bone: '#dcd0b0', plate: '#2a2630', cape: '#6a1018', eye: '#ff3a2a', gold: '#b08a3a' },
    draw(g, f, c) {
      const pl = c.plate, w = f ? 0.8 : -0.8;
      P.ell(g, 23, 53, 14, 2.4, 'rgba(0,0,0,0.45)');
      // a tattered crimson cape behind
      g.beginPath(); g.moveTo(14, 16); g.lineTo(31, 16); g.quadraticCurveTo(35, 34, 37 + w, 50); g.lineTo(9 - w, 50); g.quadraticCurveTo(10, 32, 14, 16); g.closePath();
      P.fill(g, P.lg(g, 9, 16, 37, 50, [sh(c.cape, 0.25), c.cape, sh(c.cape, -0.6)]));
      rag(g, 9 - w, 49.6, 37 + w, 49.6, 7, 2.6, sh(c.cape, -0.5));
      // armoured legs: greaves over bone
      const leg = (x, dx, col) => { P.rrect(g, x - 2, 33, 4, 8, 1.2, col); P.rrect(g, x - 2.2 + dx, 40, 4.4, 9, 1.4, sh(col, 0.1)); P.path(g, [x - 2.6 + dx, 49, x + 3.8 + dx, 49, x + 3.2 + dx, 51, x - 2.8 + dx, 51]); P.fill(g, '#141018'); };
      leg(19, -w, sh(pl, -0.2)); leg(27, w, pl);
      // fauld of overlapping plates
      for (let i = 0; i < 3; i++) P.rrect(g, 15.6 - i * 0.3, 29 + i * 2.2, 15 + i * 0.6, 2.8, 0.8, P.lg(g, 0, 29 + i * 2, 0, 32 + i * 2, [sh(pl, 0.35), sh(pl, -0.3)]));
      // breastplate over a ribcage showing through a broken seam
      g.beginPath(); g.moveTo(15, 16); g.quadraticCurveTo(23, 13, 31, 16); g.lineTo(30, 29); g.quadraticCurveTo(23, 31, 16, 29); g.closePath();
      P.fill(g, P.lg(g, 15, 14, 31, 30, [sh(pl, 0.45), pl, sh(pl, -0.5)]));
      P.path(g, [22, 17, 25, 18, 24, 27, 21.6, 26]); P.fill(g, VOID);
      for (let i = 0; i < 4; i++) P.line(g, 22, 18.6 + i * 2, 24.4, 19 + i * 2, 0.5, c.bone);
      P.line(g, 15.4, 16.6, 30.6, 16.6, 0.5, c.gold);
      // pauldrons with spikes
      for (const [x, s2] of [[14, -1], [31.6, 1]]) {
        P.ell(g, x, 17, 4.4, 3, P.vol(g, x, 16, 4.4, pl));
        P.path(g, [x - 1, 14.6, x + s2 * 1.4, 10.6, x + 1.2, 14.6]); P.fill(g, '#c8ccd8');
      }
      // far arm resting on the pommel
      limb(g, 13.2, 19, 12, 27, 1.5, 1.3, sh(pl, -0.2)); claws(g, 12.2, 27.6, 1.3, 3, 1.3, 0.4, c.bone);
      // the greatsword planted point-down before him
      P.line(g, 31, 22 + w * 0.3, 31, 26 + w * 0.3, 1.2, '#241a14'); P.rrect(g, 27, 26 + w * 0.3, 8, 1.4, 0.6, c.gold);
      P.path(g, [29.6, 27.4 + w * 0.3, 32.4, 27.4 + w * 0.3, 32, 50, 31, 53, 30, 50]); P.fill(g, P.lg(g, 29, 0, 33, 0, ['#e8ecf4', '#9aa0b0', '#4a4e5a']));
      P.line(g, 31, 28, 31, 49, 0.35, '#5a5e6a');
      P.path(g, [31.2, 34, 32.2, 35, 31.4, 36]); P.fill(g, '#3a1016'); // old blood in a notch
      P.circle(g, 31, 21.4, 1.2, c.gold);
      // near arm gripping the hilt
      limb(g, 31.6, 19, 33, 23, 1.6, 1.4, pl); claws(g, 32.2, 23.6, 2.8, 4, 1.4, 0.45, c.bone);
      // gorget and the crowned skull
      P.rrect(g, 19.4, 12.6, 7.4, 3.4, 1.2, sh(pl, -0.1));
      const hx = 23.4, hy = 8.6;
      skull(g, hx, hy, 4, c.bone, c.eye);
      g.beginPath(); g.moveTo(hx - 4.4, hy - 2.2); g.lineTo(hx - 4, hy - 7); g.lineTo(hx - 2.4, hy - 4.2); g.lineTo(hx - 1, hy - 8.4); g.lineTo(hx + 0.6, hy - 4.4); g.lineTo(hx + 2.2, hy - 8); g.lineTo(hx + 3.2, hy - 4); g.lineTo(hx + 4.6, hy - 6.6); g.lineTo(hx + 4.6, hy - 2); g.closePath();
      P.fill(g, P.lg(g, 0, hy - 8, 0, hy - 2, [sh(c.gold, 0.4), c.gold, sh(c.gold, -0.5)]));
      P.circle(g, hx + 0.1, hy - 3.4, 0.7, c.eye); P.glow(g, hx + 0.1, hy - 3.4, 2.4, c.eye, 0.6);
    } });

  /* ================= Hall 2: the Abyss ================= */
  /** Glowing fissures: short jagged lines of `col` across a charred surface. */
  function cracks(g, pts, col, w) { g.strokeStyle = col; g.lineWidth = w || 0.4; for (const l of pts) { g.beginPath(); g.moveTo(l[0], l[1]); for (let i = 2; i < l.length; i += 2) g.lineTo(l[i], l[i + 1]); g.stroke(); } }
  /** A licking flame at (x,y), height h, leaning `lean`. */
  function flame(g, x, y, h, lean, a) {
    for (const [k, col] of [[1, 'rgba(255,90,20,' + (0.75 * (a || 1)) + ')'], [0.6, 'rgba(255,200,70,' + (0.9 * (a || 1)) + ')']]) {
      const hh = h * k, ww = h * 0.32 * k;
      g.beginPath(); g.moveTo(x - ww, y); g.quadraticCurveTo(x - ww * 0.8, y - hh * 0.6, x + lean * hh * 0.35, y - hh); g.quadraticCurveTo(x + ww * 0.9, y - hh * 0.5, x + ww, y); g.closePath(); P.fill(g, col);
    }
  }
  P.flame = flame;

  /* ---------- Charred Husk: a burnt corpse still smouldering, fire in its cracks, arms reaching ---------- */
  def('husk', { w: 20, h: 24, cy: 14, frames: 2,
    colors: { skin: '#241a18', ember: '#ff7a20', eye: '#ffd040' },
    draw(g, f, c) {
      const s = c.skin, w = f ? 0.9 : -0.9;
      P.ell(g, 10, 22.6, 5, 1, 'rgba(0,0,0,0.45)');
      limb(g, 8.6, 14, 7.4 - w, 18.4, 1.3, 1.1, sh(s, -0.2)); limb(g, 7.4 - w, 18.4, 7.6 - w, 22, 1.1, 1, sh(s, -0.2));
      limb(g, 11.4, 14, 12.6 + w, 18.4, 1.3, 1.1, s); limb(g, 12.6 + w, 18.4, 12.8 + w, 22, 1.1, 1, s);
      // a hunched charred torso, ribs burnt through
      g.beginPath(); g.moveTo(7, 15); g.quadraticCurveTo(5.4, 9, 9, 6.4); g.quadraticCurveTo(13.6, 5.6, 14, 10); g.quadraticCurveTo(14.6, 13.6, 13, 15.4); g.closePath();
      P.fill(g, P.lg(g, 6, 6, 14, 15, [sh(s, 0.5), s, sh(s, -0.4)]));
      cracks(g, [[8, 8, 9.4, 10, 8.6, 12, 10, 14], [11.6, 7.4, 12.4, 9.4, 11.4, 11], [9.8, 10.6, 12, 12.4]], c.ember, 0.45);
      P.glow(g, 10, 11, 4, c.ember, 0.35);
      // far arm reaching out, fingers smoking
      limb(g, 8, 8.4, 11.6, 11, 1, 0.9, sh(s, -0.25)); limb(g, 11.6, 11, 15, 10.4, 0.9, 0.7, sh(s, -0.25)); claws(g, 15.2, 10.4, 0.2, 3, 1.3, 0.3, '#5a4238');
      // the head: a blackened skull-face, eyes burning, a flame crowning it
      P.circle(g, 12, 5, 2.6, P.vol(g, 12, 5, 2.6, sh(s, 0.3)));
      P.rect(g, 12.4, 6.4, 2.2, 1, '#120402'); P.glow(g, 13.4, 6.9, 1.6, c.ember, 0.6);
      evil(g, 13.2, 4.6, 0.5, c.eye); evil(g, 11, 4.6, 0.4, c.eye);
      flame(g, 11.2, 3.2, 4.6 + (f ? 1 : 0), -0.4); flame(g, 8.4, 7.4, 3 + (f ? 0 : 0.8), -0.6, 0.8);
      // near arm raised, embers dripping
      limb(g, 12.6, 8.6, 16, 7.6, 1.1, 0.9, s); claws(g, 16.2, 7.4, -0.3, 3, 1.4, 0.35, '#6a4a3a');
      P.circle(g, 15.4, 9 + (f ? 1.2 : 0), 0.4, c.ember);
    } });

  /* ---------- Cinder Bloater: a swollen ember sac on stubby legs, venting sparks, about to burst ---------- */
  def('cinderbloat', { w: 24, h: 22, cy: 15, frames: 2,
    colors: { hide: '#3a1810', core: '#ffb040', eye: '#fff0a0' },
    draw(g, f, c) {
      const sw = f ? 1.06 : 1, hd = c.hide;
      P.ell(g, 12, 20.6, 7, 1.2, 'rgba(0,0,0,0.45)');
      for (const [x, d] of [[7.6, -1], [11, 1], [14, -1], [16.8, 1]]) limb(g, x, 16, x + d * 0.6 + (f ? d * 0.5 : 0), 20.2, 0.9, 0.7, sh(hd, -0.2));
      // the bloated sac: taut hide over a molten core showing through cracks
      P.ell(g, 12, 11.4, 8.4 * sw, 6.8 * sw, P.rg(g, 12, 11, 9, [[0, sh(c.core, 0.2)], [0.25, sh(c.core, -0.2)], [0.55, hd], [1, sh(hd, -0.5)]], 10.4, 9.4));
      cracks(g, [[6, 9, 8, 11, 7, 13.4], [10, 5.4, 11.4, 8, 10.4, 10.6, 12, 12.4], [15.4, 7, 14.2, 9.6, 16.6, 11.4, 15.6, 14], [8.6, 15, 11, 16, 13.6, 15.2]], c.core, 0.55);
      P.glow(g, 12, 11, 8, c.core, 0.35 * (f ? 1.3 : 1));
      // chimney vents on its back spitting sparks
      for (const [x, y] of [[8, 5.6], [12.4, 4.6], [16, 6]]) { P.rrect(g, x - 1, y - 1.8, 2, 2.4, 0.6, '#1a0a06'); P.circle(g, x, y - 1.8, 0.6, c.core); if (f) P.circle(g, x + 0.4, y - 3.4, 0.3, c.eye); }
      // a small face lost in the swollen front: two slit eyes and a grinning split
      evil(g, 17.4, 10.4, 0.55, c.eye); evil(g, 19.2, 10.6, 0.45, c.eye);
      g.strokeStyle = '#1a0402'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(16.4, 13); g.quadraticCurveTo(18.4, 14.4, 20, 12.6); g.stroke();
    } });

  /* ---------- Magma Crawler: a long lava slug under basalt plates, leaving a burning trail ---------- */
  def('magmacrawler', { w: 32, h: 16, cy: 11, frames: 2,
    colors: { rock: '#2e2624', lava: '#ff6a18', eye: '#ffe060' },
    draw(g, f, c) {
      const wv = f ? 0.8 : -0.8;
      P.ell(g, 16, 14.2, 13, 1.4, 'rgba(0,0,0,0.45)');
      // the molten body, rippling
      g.beginPath(); g.moveTo(3, 13); g.quadraticCurveTo(6, 8 + wv, 12, 8.4); g.quadraticCurveTo(20, 7 - wv, 26, 8); g.quadraticCurveTo(30.6, 9, 30, 13); g.closePath();
      P.fill(g, P.lg(g, 0, 8, 0, 14, [sh(c.lava, 0.3), c.lava, sh(c.lava, -0.5)]));
      P.glow(g, 16, 12, 12, c.lava, 0.3);
      // overlapping basalt plates along the back
      for (let i = 0; i < 6; i++) { const x = 5 + i * 3.8, y = 8.6 - Math.sin(i * 0.9 + (f ? 0.6 : 0)) * 0.6; P.path(g, [x - 2.4, y + 1.6, x - 1.4, y - 1.4, x + 1.8, y - 1.8, x + 2.6, y + 1.4]); P.fill(g, P.lg(g, x, y - 2, x, y + 2, [sh(c.rock, 0.35), c.rock, sh(c.rock, -0.5)])); P.line(g, x - 1.6, y + 1.5, x + 2.2, y + 1.3, 0.35, sh(c.lava, 0.3)); }
      // head: a blunt maw and two eye-stalks
      P.circle(g, 28.6, 10.6, 2.6, P.vol(g, 28.6, 10.6, 2.6, sh(c.rock, 0.2)));
      P.path(g, [29.6, 11.6, 31.6, 11.8, 30.4, 13]); P.fill(g, '#1a0402'); P.glow(g, 30.4, 12, 1.8, c.lava, 0.7);
      for (const [dx, h] of [[-0.6, 4.4], [1.4, 3.6]]) { P.line(g, 28.4 + dx, 9, 28.8 + dx + (f ? 0.4 : -0.2), 9 - h, 0.5, sh(c.rock, 0.1)); evil(g, 28.8 + dx + (f ? 0.4 : -0.2), 9 - h, 0.5, c.eye); }
      // drips falling from the belly
      for (let i = 0; i < 3; i++) P.circle(g, 8 + i * 7 + (f ? 1 : 0), 13.6 + (i % 2) * 0.4, 0.5, sh(c.lava, 0.3));
    } });

  /* ---------- Ember Salamander: a lean black lizard, a crest of fire down its spine ---------- */
  def('salamander', { w: 28, h: 14, cy: 9, frames: 2,
    colors: { skin: '#1e1414', spot: '#ff8a20', eye: '#fff060' },
    draw(g, f, c) {
      const s = c.skin, w = f ? 1 : -1;
      P.ell(g, 14, 12.6, 10, 1, 'rgba(0,0,0,0.4)');
      // tail sweeping back
      g.beginPath(); g.moveTo(8, 8); g.quadraticCurveTo(3, 7 + w * 1.4, 0.6, 9.6 - w); g.quadraticCurveTo(4, 9.4, 8, 10); g.closePath(); P.fill(g, P.lg(g, 0, 7, 0, 10, [sh(s, 0.3), sh(s, -0.3)]));
      // splayed legs, low to the ground
      for (const [x, d] of [[10, -1], [18, 1]]) { limb(g, x, 9.4, x - 2 + d * w, 11.4, 0.8, 0.6, sh(s, -0.2)); limb(g, x + 1, 9.4, x + 3 - d * w, 11.6, 0.8, 0.6, s); }
      // a lean body and wedge head
      P.ell(g, 14, 8.6, 7, 2.2, P.lg(g, 0, 6.4, 0, 10.8, [sh(s, 0.4), s, sh(s, -0.4)]));
      g.beginPath(); g.moveTo(20, 7); g.quadraticCurveTo(25, 6.4, 27, 8.4); g.quadraticCurveTo(24, 10.2, 20, 10); g.closePath(); P.fill(g, P.lg(g, 20, 6, 20, 10, [sh(s, 0.45), sh(s, -0.3)]));
      P.line(g, 22.6, 9.2, 26.4, 8.6, 0.35, '#0a0404');
      evil(g, 23.2, 7.6, 0.5, c.eye);
      for (let i = 0; i < 5; i++) P.circle(g, 10 + i * 2.2, 8.4 + (i % 2) * 0.8, 0.45, c.spot);
      // the burning crest along the spine
      for (let i = 0; i < 5; i++) flame(g, 9.4 + i * 2.4, 6.8 - (i === 2 ? 0.4 : 0), 2.4 + ((i + (f ? 1 : 0)) % 2) * 1.2, -0.5, 0.9);
      P.glow(g, 14, 6, 7, c.spot, 0.25);
    } });

  /* ---------- Flamedancer (boss): a slender horned dancer in a skirt of fire, ribbons of flame trailing her arms ---------- */
  def('flamedancer', { w: 44, h: 54, cy: 34, frames: 2,
    colors: { skin: '#3a1414', silk: '#8a1a14', gold: '#e0a040', fire: '#ff8a2a', eye: '#fff0a0' },
    draw(g, f, c) {
      const wv = f ? 1 : -1;
      P.ell(g, 22, 52, 11, 1.8, 'rgba(0,0,0,0.45)');
      P.glow(g, 22, 34, 20, c.fire, 0.25);
      // a flaring skirt of silk and fire
      g.beginPath(); g.moveTo(16, 27); g.lineTo(28, 27); g.quadraticCurveTo(34 + wv, 38, 37, 48); g.lineTo(7, 48); g.quadraticCurveTo(10 - wv, 38, 16, 27); g.closePath();
      P.fill(g, P.lg(g, 0, 27, 0, 48, [sh(c.silk, 0.3), c.silk, sh(c.silk, -0.5)]));
      for (let i = 0; i < 7; i++) flame(g, 8.6 + i * 4.4, 48.4, 4 + ((i + (f ? 1 : 0)) % 3) * 1.6, (i - 3) * 0.12, 0.9);
      // bare legs in a turning step
      limb(g, 19, 40, 17 - wv, 50, 1.3, 1, c.skin); limb(g, 25, 40, 27 + wv, 49, 1.3, 1, sh(c.skin, 0.1));
      // slender torso, a golden girdle
      g.beginPath(); g.moveTo(17.4, 27.6); g.quadraticCurveTo(16.6, 20, 19, 15); g.lineTo(25, 15); g.quadraticCurveTo(27.4, 20, 26.6, 27.6); g.closePath();
      P.fill(g, P.lg(g, 17, 15, 27, 28, [sh(c.skin, 0.4), c.skin, sh(c.skin, -0.4)]));
      P.rrect(g, 17, 25.6, 10, 2, 0.8, P.lg(g, 0, 25.6, 0, 27.6, [sh(c.gold, 0.3), sh(c.gold, -0.4)]));
      cracks(g, [[20, 17, 21, 20, 20.4, 23], [24, 17.6, 23.2, 21]], c.fire, 0.4);
      // arms flung wide, ribbons of fire streaming from the wrists
      const ribbon = (x, y, dir, up) => { g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + dir * 6, y - 6 * up, x + dir * 10, y + 4, x + dir * 16, y - 2 * up + wv * 2); g.bezierCurveTo(x + dir * 10, y + 6, x + dir * 6, y - 2 * up, x, y + 1.4); g.closePath(); P.fill(g, P.lg(g, x, y, x + dir * 16, y, ['rgba(255,220,120,0.9)', 'rgba(255,110,30,0.75)', 'rgba(200,40,10,0)'])); };
      limb(g, 19, 17, 12, 13 + wv, 1.1, 0.9, c.skin); limb(g, 12, 13 + wv, 6, 9, 0.9, 0.8, c.skin); ribbon(6, 9, -1, 1);
      limb(g, 25, 17, 32, 14 - wv, 1.1, 0.9, sh(c.skin, 0.1)); limb(g, 32, 14 - wv, 38, 11, 0.9, 0.8, sh(c.skin, 0.1)); ribbon(38, 11, 1, -1);
      P.circle(g, 6, 9, 1, c.gold); P.circle(g, 38, 11, 1, c.gold);
      // head: a narrow face, long horns swept back, hair of fire
      const hx = 22, hy = 10.4;
      for (let i = 0; i < 4; i++) flame(g, hx - 3 + i * 2, hy - 1, 6 + (i % 2) * 2 + (f ? 1 : 0), -0.7, 0.85);
      P.ell(g, hx, hy, 3, 3.6, P.vol(g, hx, hy, 3.4, sh(c.skin, 0.35)));
      horn(g, hx - 2, hy - 2.4, hx - 6, hy - 6, hx - 9, hy - 4, 0.8, '#2a1a14'); horn(g, hx + 2, hy - 2.4, hx + 5, hy - 7, hx + 9, hy - 6, 0.8, '#2a1a14');
      evil(g, hx + 1, hy - 0.2, 0.6, c.eye); evil(g, hx - 1.4, hy - 0.2, 0.5, c.eye);
      P.path(g, [hx - 0.8, hy + 2, hx + 1.6, hy + 2, hx + 0.4, hy + 2.8]); P.fill(g, '#1a0404');
    } });

  /* ---------- Ashen Warlord (boss): a hollow armour of ash and cinders, a great bow of bone, a burnt war banner ---------- */
  def('ashwarlord', { w: 48, h: 56, cy: 34, frames: 2,
    colors: { ash: '#5a5452', dark: '#221e20', ember: '#ff7030', eye: '#ffcf60', cloth: '#4a1c16' },
    draw(g, f, c) {
      const w = f ? 0.8 : -0.8;
      P.ell(g, 24, 53, 13, 2.2, 'rgba(0,0,0,0.45)');
      // the war banner on a pole rising behind the back
      P.line(g, 14, 50, 12, 2, 1, '#2a1c14');
      g.beginPath(); g.moveTo(12.2, 4); g.lineTo(3 + w, 6); g.lineTo(4 - w, 18); g.lineTo(8, 15); g.lineTo(12.6, 20); g.closePath(); P.fill(g, P.lg(g, 3, 4, 12, 20, [sh(c.cloth, 0.2), c.cloth, sh(c.cloth, -0.6)]));
      cracks(g, [[5, 9, 8, 10, 7, 13]], c.ember, 0.5); P.circle(g, 7.6, 10.6, 1.4, 'rgba(0,0,0,0.5)');
      // legs in greaves, drifting ash below
      for (let i = 0; i < 5; i++) P.circle(g, 16 + i * 4, 51 - (i % 2) * 1.6 + (f ? 0.6 : 0), 0.7, G.rgba(c.ash, 0.5));
      P.rrect(g, 18 - w, 36, 4.6, 14, 1.6, P.lg(g, 18, 0, 23, 0, [sh(c.ash, 0.2), sh(c.ash, -0.4)])); P.rrect(g, 26 + w, 36, 4.6, 14, 1.6, P.lg(g, 26, 0, 31, 0, [sh(c.ash, 0.3), sh(c.ash, -0.3)]));
      // a tattered surcoat over a broad breastplate
      P.path(g, [16, 22, 32, 22, 33, 38, 29, 35, 26, 40, 22, 35, 18, 39, 15, 36]); P.fill(g, P.lg(g, 15, 22, 33, 40, [sh(c.cloth, 0.25), sh(c.cloth, -0.5)]));
      g.beginPath(); g.moveTo(15, 14); g.quadraticCurveTo(24, 11, 33, 14); g.lineTo(32, 25); g.quadraticCurveTo(24, 27, 16, 25); g.closePath();
      P.fill(g, P.lg(g, 15, 12, 33, 26, [sh(c.ash, 0.45), c.ash, sh(c.ash, -0.5)]));
      cracks(g, [[20, 15, 21.4, 18, 20.4, 21, 22, 24], [27, 14.6, 26, 17.4, 28, 20]], c.ember, 0.5);
      P.glow(g, 23, 19, 6, c.ember, 0.3);
      for (const x of [14.6, 33.4]) { P.ell(g, x, 15, 4.2, 2.8, P.vol(g, x, 14, 4.2, c.ash)); P.line(g, x - 3, 15.6, x + 3, 15.6, 0.4, c.dark); }
      // the great bow of bone held across the body, an arrow of fire nocked
      g.strokeStyle = '#d8ccb0'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(34, 8); g.quadraticCurveTo(43 + w, 24, 34, 40); g.stroke();
      g.strokeStyle = sh('#d8ccb0', -0.4); g.lineWidth = 0.4; g.stroke();
      P.line(g, 34, 8, 30, 24, 0.3, '#e8e0d0'); P.line(g, 30, 24, 34, 40, 0.3, '#e8e0d0');
      P.line(g, 30, 24, 44, 22.6, 0.5, '#3a2a20'); flame(g, 44.6, 23.4, 3.6, 0.9); P.glow(g, 44, 22.6, 4, c.ember, 0.7);
      limb(g, 32, 17, 38, 22, 1.4, 1.2, c.ash); limb(g, 17, 17, 29, 24, 1.4, 1.2, sh(c.ash, -0.15));
      // a great helm with a burning slit and a crest of ember
      const hx = 24, hy = 8;
      P.rrect(g, hx - 4.4, hy - 4.6, 8.8, 9.4, 3, P.lg(g, hx - 4, 0, hx + 4, 0, [sh(c.ash, 0.4), c.ash, sh(c.ash, -0.45)]));
      P.rect(g, hx - 3.4, hy - 0.8, 6.8, 1.3, '#0a0404'); P.glow(g, hx, hy - 0.2, 4, c.eye, 0.6); P.rect(g, hx - 2.6, hy - 0.5, 5.2, 0.6, c.eye);
      P.line(g, hx, hy + 1, hx, hy + 4, 0.5, c.dark);
      for (let i = 0; i < 4; i++) flame(g, hx - 2.4 + i * 1.6, hy - 4.2, 3 + (i % 2) + (f ? 0.8 : 0), -0.8, 0.8);
    } });

  /* ================= Hall 3: the Aqueduct ================= */
  /** Barnacles and moss spots scattered over an area. */
  function barnacles(g, pts, col) { for (const [x, y, r] of pts) { P.circle(g, x, y, r, sh(col, -0.35)); P.circle(g, x - r * 0.2, y - r * 0.2, r * 0.55, col); } }

  /* ---------- Weeping Watcher: a hooded stone mourner, face hidden in its hands; eyes show when it moves ---------- */
  def('weeper', { w: 20, h: 30, cy: 20, frames: 2,
    colors: { stone: '#8a8a86', moss: '#4a6a3a', eye: '#9ff0ff' },
    draw(g, f, c) {
      const st = c.stone, sd = sh(st, -0.45);
      P.ell(g, 10, 28.4, 6, 1.2, 'rgba(0,0,0,0.45)');
      // a plinth of cracked stone and the robe falling onto it
      P.rrect(g, 3.4, 25, 13.2, 3.4, 0.8, P.lg(g, 0, 25, 0, 28.4, [sh(st, 0.1), sd]));
      g.beginPath(); g.moveTo(6.4, 9); g.lineTo(13.6, 9); g.quadraticCurveTo(16, 17, 16.2, 25.4); g.lineTo(3.8, 25.4); g.quadraticCurveTo(4, 17, 6.4, 9); g.closePath();
      P.fill(g, P.lg(g, 4, 9, 16, 25, [sh(st, 0.35), st, sd]));
      g.strokeStyle = sh(st, -0.3); g.lineWidth = 0.4; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(7.4 + i * 1.6, 11); g.quadraticCurveTo(6.4 + i * 2.2, 18, 5.8 + i * 2.6, 25); g.stroke(); }
      // cracks and moss
      g.strokeStyle = '#2a2a28'; g.lineWidth = 0.35; g.beginPath(); g.moveTo(12.6, 14); g.lineTo(11.4, 17); g.lineTo(12.4, 19.4); g.moveTo(5.6, 21); g.lineTo(7.4, 22.6); g.stroke();
      for (const [x, y, r] of [[5, 24.4, 1.4], [14.6, 23.6, 1.1], [7.6, 10.2, 0.8], [13.8, 9.8, 0.9]]) P.ell(g, x, y, r, r * 0.6, c.moss);
      // a deep hood; the hands cover the face (lowered a little while it moves, and the eyes glare through)
      g.beginPath(); g.moveTo(5.2, 10.4); g.quadraticCurveTo(4.6, 1.6, 10.4, 1); g.quadraticCurveTo(15.8, 1.8, 15, 10.4); g.quadraticCurveTo(10, 8.6, 5.2, 10.4); g.closePath();
      P.fill(g, P.lg(g, 5, 1, 15, 10, [sh(st, 0.45), st, sd]));
      P.ell(g, 10.6, 6.4, 3.4, 3.6, '#1a1a1a');
      const low = f ? 1.2 : 0;
      if (f) { P.glow(g, 11, 5.4, 3, c.eye, 0.7); P.circle(g, 9.6, 5.4, 0.45, c.eye); P.circle(g, 12.2, 5.4, 0.45, c.eye); }
      for (const [x, d] of [[9, -1], [12, 1]]) { P.ell(g, x, 6.6 + low, 1.7, 2.2, P.vol(g, x, 6.4 + low, 2, sh(st, 0.2)), d * 0.2); for (let k = 0; k < 3; k++) P.line(g, x - 1 + k, 4.8 + low, x - 1.1 + k * 1.05, 6 + low, 0.25, sd); }
      P.path(g, [7.6, 9 + low, 8.6, 12.4, 11.6, 12.4, 12.6, 9 + low]); P.fill(g, sh(st, 0.05)); // forearms
      P.line(g, 10, 7.6 + low, 10.4, 9.6 + low, 0.35, 'rgba(120,200,220,0.55)'); // a stone tear
    } });

  /* ---------- Gargoyle: a horned stone imp; wings folded while it perches, spread when it swoops ---------- */
  def('gargoyle', { w: 30, h: 24, cy: 15, frames: 2,
    colors: { stone: '#6a7266', eye: '#ffb040' },
    draw(g, f, c) {
      const st = c.stone, sd = sh(st, -0.5);
      P.ell(g, 15, 22.4, 7, 1.2, 'rgba(0,0,0,0.45)');
      // wings: folded against the back (frame 0) or spread wide (frame 1)
      const wing = (sx) => {
        g.save(); g.translate(15 - sx * 3, 9); g.scale(sx, 1);
        if (f) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(6, -9, 14, -6); g.lineTo(12, -2); g.lineTo(13, 2); g.lineTo(9, 1); g.lineTo(9, 5); g.lineTo(5, 3); g.lineTo(1, 5); g.closePath(); }
        else { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(4, -7, 7, -4); g.lineTo(6, 2); g.lineTo(4, 5); g.lineTo(1, 6); g.closePath(); }
        P.fill(g, P.lg(g, 0, -8, 0, 6, [sh(st, 0.25), sd])); g.strokeStyle = sh(st, -0.65); g.lineWidth = 0.4; g.stroke();
        g.restore();
      };
      wing(1); wing(-1);
      // crouched haunches and clawed feet
      limb(g, 12, 15, 10, 20, 1.6, 1.2, sd); limb(g, 18, 15, 20, 20, 1.6, 1.2, st);
      claws(g, 10, 20.4, 1.2, 3, 1.3, 0.4, sh(st, 0.3)); claws(g, 20, 20.4, 1.2, 3, 1.3, 0.4, sh(st, 0.3));
      // a hunched body, ridges down the spine
      P.ell(g, 15, 13.4, 5.6, 5, P.vol(g, 15, 12.6, 5.6, st));
      for (let i = 0; i < 4; i++) P.path(g, [11 + i * 2, 9.4 - i * 0.2, 11.8 + i * 2, 7.6 - i * 0.2, 12.6 + i * 2, 9.4 - i * 0.2]); P.fill(g, sd);
      // arms and long claws resting forward
      limb(g, 17.6, 12, 21, 16.4, 1.1, 0.9, st); claws(g, 21.2, 16.8, 1.1, 3, 1.4, 0.35, sh(st, 0.3));
      // head: heavy brow, curling horns, a grinning maw
      const hx = 20.4, hy = 8.2;
      P.circle(g, hx, hy, 3.2, P.vol(g, hx, hy, 3.2, st));
      horn(g, hx - 1.6, hy - 2.2, hx - 3.6, hy - 5.6, hx - 1.6, hy - 7, 0.7, sh(st, 0.1)); horn(g, hx + 1, hy - 2.6, hx + 2.6, hy - 6.2, hx + 4.6, hy - 6, 0.7, sh(st, 0.1));
      P.path(g, [hx, hy + 1, hx + 3.8, hy + 0.6, hx + 3, hy + 2.6, hx + 0.4, hy + 2.8]); P.fill(g, '#141414');
      teeth(g, hx + 0.2, hy + 1, hx + 3.6, hy + 0.7, 4, 0.6, 1, '#d8d4c4');
      evil(g, hx + 1.4, hy - 0.8, 0.5, c.eye); evil(g, hx - 0.8, hy - 0.8, 0.4, c.eye);
      g.strokeStyle = '#2a2e28'; g.lineWidth = 0.3; g.beginPath(); g.moveTo(13, 11); g.lineTo(14.4, 13.6); g.lineTo(13.4, 15.6); g.stroke();
    } });

  /* ---------- Arbalist: a skeletal crossbowman under a kettle helm, a heavy crossbow braced ---------- */
  def('arbalist', { w: 26, h: 22, cy: 13, frames: 2,
    colors: { bone: '#c8c8b4', iron: '#5a5e66', wood: '#5a3e26', eye: '#70ffd0' },
    draw(g, f, c) {
      const b = c.bone, bd = sh(b, -0.45), w = f ? 0.8 : 0;
      P.ell(g, 11, 20.4, 6, 1, 'rgba(0,0,0,0.45)');
      P.bone(g, 9.6, 13, 8.4 - w, 16.4, 0.8, bd); P.bone(g, 8.4 - w, 16.4, 8.8 - w, 19.6, 0.75, bd);
      P.bone(g, 12, 13, 13.2 + w, 16.4, 0.8, b); P.bone(g, 13.2 + w, 16.4, 13.4 + w, 19.6, 0.75, b);
      // a quiver of bolts on the back and a tattered tabard
      P.rrect(g, 5, 6, 2.6, 7, 0.8, sh(c.wood, -0.2)); for (let i = 0; i < 3; i++) P.line(g, 5.6 + i * 0.7, 6, 5.4 + i * 0.7, 3.8, 0.4, '#d8d0b0');
      P.path(g, [8.4, 7, 13.4, 7, 14, 13.4, 12.4, 12.6, 11, 14.4, 9.6, 12.6, 8, 13.4]); P.fill(g, P.lg(g, 8, 7, 14, 14, ['#2e4a4a', '#16262a']));
      for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(11, 8.4 + i * 1.3, 1.8 - i * 0.2, 0.45, 0, 0, Math.PI * 2); g.strokeStyle = bd; g.lineWidth = 0.4; g.stroke(); }
      // skull under a kettle helm
      const hx = 11.6, hy = 4.2;
      skull(g, hx, hy + 0.4, 2.3, b, c.eye);
      P.path(g, [hx - 4, hy - 0.4, hx + 4, hy - 0.4, hx + 3, hy - 1.4, hx + 2.4, hy - 3.4, hx - 2.4, hy - 3.4, hx - 3, hy - 1.4]); P.fill(g, P.lg(g, 0, hy - 3.4, 0, hy, [sh(c.iron, 0.4), sh(c.iron, -0.35)]));
      // arms bracing the crossbow, aimed forward
      P.bone(g, 13, 8.2, 15, 10.4, 0.7, b); P.bone(g, 9.6, 8.2, 13.6, 10.8, 0.7, bd);
      P.rrect(g, 12.4, 9.6, 11, 1.8, 0.6, P.lg(g, 0, 9.6, 0, 11.4, [sh(c.wood, 0.3), sh(c.wood, -0.4)]));
      g.strokeStyle = c.iron; g.lineWidth = 0.9; g.beginPath(); g.moveTo(21.6, 6.6); g.quadraticCurveTo(24.6, 10.5, 21.6, 14.4); g.stroke();
      P.line(g, 21.6, 6.6, 17.6 - w, 10.5, 0.25, '#e0e0d0'); P.line(g, 17.6 - w, 10.5, 21.6, 14.4, 0.25, '#e0e0d0');
      P.line(g, 17.6 - w, 10.5, 25.4, 10.5, 0.5, '#3a2a1c'); P.path(g, [25.2, 9.8, 26.6, 10.5, 25.2, 11.2]); P.fill(g, '#c8ccd8');
    } });

  /* ---------- Drowned: a bloated waterlogged corpse, weed hanging from it, dragging an anchor chain ---------- */
  def('drowned', { w: 26, h: 28, cy: 17, frames: 2,
    colors: { skin: '#7a98a0', weed: '#2e5a3a', eye: '#b0fff0' },
    draw(g, f, c) {
      const s = c.skin, sd = sh(s, -0.5), w = f ? 0.9 : -0.9;
      P.ell(g, 13, 26.4, 8, 1.4, 'rgba(0,0,0,0.45)');
      // a puddle it leaves as it walks
      P.ell(g, 13, 26.2, 7, 1.2, 'rgba(90,150,170,0.35)');
      limb(g, 10, 18, 9 - w, 22, 1.8, 1.5, sd); limb(g, 9 - w, 22, 9 - w, 25.6, 1.5, 1.4, sd);
      limb(g, 16, 18, 17 + w, 22, 1.8, 1.5, s); limb(g, 17 + w, 22, 17 + w, 25.6, 1.5, 1.4, s);
      // a swollen belly and hunched shoulders
      P.ell(g, 13, 14, 7.2, 6.8, P.rg(g, 13, 13, 8, [[0, sh(s, 0.3)], [0.6, s], [1, sd]], 11, 11));
      g.save(); g.globalAlpha = 0.5; P.ell(g, 12, 16, 3.4, 2.4, sh(s, -0.25)); g.restore();
      for (const [x, y] of [[8, 11], [16, 17], [11, 18.4]]) P.circle(g, x, y, 0.6, '#3a4a50'); // sores
      // weed draped over the shoulders, hanging in strands
      for (let i = 0; i < 6; i++) { const x = 7 + i * 2.4; g.beginPath(); g.moveTo(x, 8.6 + (i % 2)); g.quadraticCurveTo(x + (f ? 0.8 : -0.4), 13, x - 0.4, 16 + (i % 3)); g.strokeStyle = c.weed; g.lineWidth = 0.8; g.stroke(); }
      // arms: one dragging a rusted chain, one reaching
      limb(g, 7, 11, 4.4, 17, 1.3, 1.1, sd); P.line(g, 4.4, 17.6, 3, 25, 0.5, '#5a4a3a');
      for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(3.6 - i * 0.1, 18.6 + i * 1.4, 0.5, 0.7, 0, 0, Math.PI * 2); g.strokeStyle = '#6a5a44'; g.lineWidth = 0.35; g.stroke(); }
      limb(g, 19, 11, 22.6, 14 + w, 1.3, 1.1, s); claws(g, 22.8, 14.2 + w, 0.3, 3, 1.3, 0.35, sh(s, 0.3));
      // a slumped head, lank hair, milky eyes
      const hx = 14.6, hy = 6.6;
      P.circle(g, hx, hy, 3.4, P.vol(g, hx, hy, 3.4, sh(s, 0.1)));
      for (let i = 0; i < 5; i++) P.line(g, hx - 3 + i * 1.2, hy - 2.6, hx - 3.4 + i * 1.3, hy + 1.8, 0.5, '#1a2622');
      P.circle(g, hx + 1.4, hy + 0.2, 0.7, sh(c.eye, 0.2)); P.circle(g, hx - 0.8, hy + 0.2, 0.6, sh(c.eye, 0.2)); P.glow(g, hx + 0.4, hy + 0.2, 2.2, c.eye, 0.35);
      P.ell(g, hx + 1, hy + 2.2, 1.2, 0.7, '#0a1414');
      for (let i = 0; i < 2; i++) P.circle(g, 12 + i * 5, 20 + (f ? 1 : 0) + i, 0.35, 'rgba(160,220,240,0.8)'); // drips
    } });

  /* ---------- Procession Monk: a hooded chanting monk, a candle cupped in both hands ---------- */
  def('monk', { w: 16, h: 26, cy: 17, frames: 2,
    colors: { robe: '#2e2c3a', eye: '#b0e8ff', candle: '#ffd070' },
    draw(g, f, c) {
      const r = c.robe, sway = f ? 0.4 : -0.4;
      g.beginPath(); g.moveTo(5, 8); g.lineTo(11, 8); g.quadraticCurveTo(13.4, 16, 13.6 + sway, 24.6); g.lineTo(2.4 + sway, 24.6); g.quadraticCurveTo(2.6, 16, 5, 8); g.closePath();
      P.fill(g, P.lg(g, 2, 8, 14, 24, [sh(r, 0.3), r, sh(r, -0.6)]));
      g.strokeStyle = sh(r, -0.5); g.lineWidth = 0.4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(6 + i * 2, 10); g.lineTo(4.6 + i * 3, 24); g.stroke(); }
      P.line(g, 5.4, 14.6, 11, 14.6, 0.7, '#6a5a44'); P.line(g, 10.4, 14.6, 11, 19, 0.5, '#6a5a44'); // a rope belt
      // hood; only two faint lights inside
      g.beginPath(); g.moveTo(3.6, 9.6); g.quadraticCurveTo(3.4, 1.4, 8.4, 1); g.quadraticCurveTo(13, 1.6, 12.4, 9.6); g.quadraticCurveTo(8, 8, 3.6, 9.6); g.closePath();
      P.fill(g, P.lg(g, 3, 1, 13, 10, [sh(r, 0.4), r, sh(r, -0.5)]));
      P.ell(g, 8.8, 5.8, 2.6, 2.8, '#050308'); P.circle(g, 8, 5.6, 0.35, c.eye); P.circle(g, 9.8, 5.6, 0.35, c.eye);
      // hands cupping a candle
      P.ell(g, 9.4, 12.4, 2, 1.2, sh(r, 0.1)); P.rrect(g, 9, 9.2, 0.9, 3, 0.3, '#e8dcc0');
      P.glow(g, 9.4, 8.2, 4, c.candle, 0.6); P.ell(g, 9.45, 8.4 - (f ? 0.2 : 0), 0.45, 0.9, c.candle);
    } });

  /* ---------- Hydra (boss): three serpent heads rising from a coiled, weed-grown body in a pool ---------- */
  def('hydra', { w: 60, h: 52, cy: 36, frames: 2,
    colors: { scale: '#2e5a52', belly: '#8ab8a0', eye: '#ffe060', water: '#4a8a9a' },
    draw(g, f, c) {
      const sc = c.scale, w = f ? 1 : -1;
      P.ell(g, 30, 46, 24, 5, G.rgba(c.water, 0.45)); P.ell(g, 30, 46, 18, 3.4, G.rgba(sh(c.water, 0.3), 0.35));
      // coils in the pool
      for (const [x, y, rx] of [[20, 43, 10], [38, 44, 11], [29, 40, 12]]) { P.ell(g, x, y, rx, 4, P.lg(g, 0, y - 4, 0, y + 4, [sh(sc, 0.35), sc, sh(sc, -0.5)])); for (let i = 0; i < 4; i++) P.path(g, [x - rx * 0.6 + i * rx * 0.4, y - 3.4, x - rx * 0.4 + i * rx * 0.4, y - 5.6, x - rx * 0.2 + i * rx * 0.4, y - 3.4]); P.fill(g, sh(sc, -0.3)); }
      // three necks and heads, the middle one tallest
      const head = (bx, by, tx, ty, dir, lean) => {
        g.beginPath(); g.moveTo(bx - 3, by); g.bezierCurveTo(bx - 4, by - 10, tx - dir * 6, ty + 8, tx - 2, ty + 2); g.lineTo(tx + 2, ty + 3); g.bezierCurveTo(tx - dir * 2, ty + 10, bx + 4, by - 8, bx + 3, by); g.closePath();
        P.fill(g, P.lg(g, bx - 4, 0, bx + 4, 0, [sh(sc, 0.3), sc, sh(sc, -0.45)]));
        g.strokeStyle = G.rgba(c.belly, 0.5); g.lineWidth = 1; g.beginPath(); g.moveTo(bx + 1.4, by - 2); g.bezierCurveTo(bx + 2, by - 9, tx, ty + 9, tx + 1, ty + 3); g.stroke();
        g.save(); g.translate(tx, ty); g.scale(dir, 1); g.rotate(lean);
        P.ell(g, 0, 0, 4.6, 3, P.vol(g, 0, -0.4, 4.6, sc));
        P.path(g, [1, 0.6, 7.4, 1.2, 6.4, 2.6, 1, 2.4]); P.fill(g, '#140806');
        teeth(g, 1.4, 0.8, 7, 1.2, 4, 0.8, 1, '#efe4c8');
        P.path(g, [-3, -1.6, -6.4, -4.6, -2, -2.4]); P.fill(g, sh(sc, -0.4)); P.path(g, [-1.4, -2.4, -3.6, -6, 0, -2.8]); P.fill(g, sh(sc, -0.3));
        evil(g, 1.4, -1.2, 0.7, c.eye);
        g.restore();
      };
      head(18, 40, 10, 18 + w, -1, -0.2);
      head(42, 40, 50, 20 - w, 1, -0.2);
      head(30, 39, 31, 9 + w * 0.6, 1, 0.1);
      for (let i = 0; i < 6; i++) P.circle(g, 12 + i * 7, 45 + (i % 2), 0.5, G.rgba('#c8f0ff', 0.7)); // foam
    } });

  /* ---------- Bell Warden (boss): a tall armoured warden whose head is a great cracked bell ---------- */
  def('bellwarden', { w: 48, h: 60, cy: 38, frames: 2,
    colors: { bronze: '#8a6a34', plate: '#3a3a42', cloth: '#2a3a4a', eye: '#9ff0ff' },
    draw(g, f, c) {
      const pl = c.plate, w = f ? 0.8 : -0.8, br = c.bronze;
      P.ell(g, 24, 57, 14, 2.4, 'rgba(0,0,0,0.45)');
      // long robes over armoured legs
      g.beginPath(); g.moveTo(15, 30); g.lineTo(33, 30); g.quadraticCurveTo(36, 42, 37 + w, 55); g.lineTo(11 - w, 55); g.quadraticCurveTo(12, 42, 15, 30); g.closePath();
      P.fill(g, P.lg(g, 11, 30, 37, 55, [sh(c.cloth, 0.25), c.cloth, sh(c.cloth, -0.55)]));
      rag(g, 11 - w, 54.6, 37 + w, 54.6, 7, 2, sh(c.cloth, -0.5));
      // a broad breastplate and pauldrons hung with small bells
      g.beginPath(); g.moveTo(14, 18); g.quadraticCurveTo(24, 15, 34, 18); g.lineTo(33, 31); g.quadraticCurveTo(24, 33, 15, 31); g.closePath();
      P.fill(g, P.lg(g, 14, 16, 34, 32, [sh(pl, 0.45), pl, sh(pl, -0.5)]));
      P.line(g, 24, 18, 24, 31, 0.6, sh(pl, -0.6));
      for (const x of [13, 35]) { P.ell(g, x, 19, 4.6, 3.2, P.vol(g, x, 18, 4.6, pl)); for (let i = 0; i < 3; i++) { const bx = x - 2.6 + i * 2.6, by = 22.6 + (i % 2); P.path(g, [bx - 0.9, by + 1.6, bx - 0.6, by, bx + 0.6, by, bx + 0.9, by + 1.6]); P.fill(g, br); } }
      // arms: one holding a great clapper-mace, one hanging
      limb(g, 12, 21, 10, 31, 1.8, 1.5, sh(pl, -0.2)); claws(g, 10, 31.6, 1.6, 3, 1.4, 0.45, '#c8ccd8');
      limb(g, 36, 21, 39, 28, 1.8, 1.5, pl);
      P.line(g, 38.6, 36, 40, 18, 1.4, '#2a1c14'); P.circle(g, 40.2, 15, 4 + (f ? 0.3 : 0), P.vol(g, 40, 15, 4, sh(br, 0.1))); P.circle(g, 39, 13.8, 1, sh(br, 0.5));
      // the bell for a head: a flared mouth, cracks, a single slit lit from within
      const hx = 24, hy = 9;
      g.beginPath(); g.moveTo(hx - 3, hy - 7); g.quadraticCurveTo(hx - 3.6, hy - 1, hx - 7.4, hy + 6.4); g.lineTo(hx + 7.4, hy + 6.4); g.quadraticCurveTo(hx + 3.6, hy - 1, hx + 3, hy - 7); g.quadraticCurveTo(hx, hy - 9, hx - 3, hy - 7); g.closePath();
      P.fill(g, P.lg(g, hx - 7, 0, hx + 7, 0, [sh(br, -0.45), sh(br, 0.35), br, sh(br, -0.5)]));
      P.ell(g, hx, hy + 6.4, 7.4, 1.4, '#140c06'); P.rect(g, hx - 2.4 + (f ? 0.6 : 0), hy + 4.4, 1.4, 3, sh(br, -0.2)); // the clapper swinging
      P.rrect(g, hx - 3.6, hy + 0.2, 7.2, 1.2, 0.4, '#0a0808'); P.glow(g, hx, hy + 0.8, 4, c.eye, 0.6); P.rect(g, hx - 2.6, hy + 0.5, 5.2, 0.6, c.eye);
      g.strokeStyle = '#2a1a0a'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(hx + 2, hy - 5); g.lineTo(hx + 3, hy - 2); g.lineTo(hx + 2.2, hy + 1); g.stroke();
      P.circle(g, hx, hy - 8.4, 1.2, sh(br, 0.2));
    } });

  /* ---------- Sunken Knight (boss): a barnacled knight risen from the water, a trident, a cloak of weed ---------- */
  def('sunkknight', { w: 46, h: 56, cy: 35, frames: 2,
    colors: { plate: '#4a6068', weed: '#2e5a3a', eye: '#70ffd0', gold: '#a88a4a' },
    draw(g, f, c) {
      const pl = c.plate, w = f ? 0.8 : -0.8;
      P.ell(g, 22, 53, 13, 2.2, 'rgba(0,0,0,0.45)'); P.ell(g, 22, 53, 11, 1.6, 'rgba(90,150,170,0.35)');
      // a cloak of weed trailing behind
      g.beginPath(); g.moveTo(13, 17); g.lineTo(30, 17); g.quadraticCurveTo(33, 34, 34 + w, 50); g.lineTo(9 - w, 50); g.quadraticCurveTo(10, 32, 13, 17); g.closePath();
      P.fill(g, P.lg(g, 9, 17, 34, 50, [sh(c.weed, 0.25), c.weed, sh(c.weed, -0.55)]));
      for (let i = 0; i < 7; i++) { const x = 10 + i * 3.6; g.beginPath(); g.moveTo(x, 44); g.quadraticCurveTo(x + (f ? 1 : -1), 48, x - 0.4, 52); g.strokeStyle = sh(c.weed, -0.3); g.lineWidth = 0.9; g.stroke(); }
      // armoured legs
      P.rrect(g, 16 - w, 34, 4.4, 16, 1.6, P.lg(g, 16, 0, 21, 0, [sh(pl, 0.2), sh(pl, -0.4)])); P.rrect(g, 24 + w, 34, 4.4, 16, 1.6, P.lg(g, 24, 0, 29, 0, [sh(pl, 0.3), sh(pl, -0.3)]));
      // breastplate crusted with barnacles
      g.beginPath(); g.moveTo(13, 17); g.quadraticCurveTo(22, 14, 31, 17); g.lineTo(30, 35); g.quadraticCurveTo(22, 37, 14, 35); g.closePath();
      P.fill(g, P.lg(g, 13, 15, 31, 36, [sh(pl, 0.45), pl, sh(pl, -0.5)]));
      barnacles(g, [[16, 22, 1], [18, 28, 0.8], [27, 20, 0.9], [26, 30, 1.1], [21, 33, 0.7]], '#c8c0a8');
      P.line(g, 13.4, 25, 30.6, 25, 0.5, c.gold);
      for (const x of [12.6, 31.4]) { P.ell(g, x, 18, 4.2, 3, P.vol(g, x, 17, 4.2, pl)); barnacles(g, [[x - 1.4, 17, 0.7], [x + 1.2, 18.4, 0.6]], '#c8c0a8'); }
      // far arm hanging, near arm raising the trident
      limb(g, 11, 20, 9, 30, 1.6, 1.4, sh(pl, -0.2)); claws(g, 9, 30.6, 1.6, 3, 1.4, 0.4, '#b0c0c0');
      limb(g, 33, 20, 37, 27, 1.6, 1.4, pl);
      P.line(g, 36, 44, 38.6, 6, 1, '#3a2a1a');
      P.path(g, [36.6, 9, 40.6, 9.4, 40, 6.4, 39.4, 1, 38.8, 6.2, 38.2, 0.6, 37.6, 6, 37, 1.2, 36.8, 6.2]); P.fill(g, P.lg(g, 0, 0, 0, 9, ['#e8f0f0', '#8aa0a8']));
      // a great helm with a visor slit, teal light, weed hanging from it
      const hx = 22, hy = 8.6;
      P.rrect(g, hx - 4.6, hy - 5, 9.2, 10, 3.2, P.lg(g, hx - 4, 0, hx + 4, 0, [sh(pl, 0.4), pl, sh(pl, -0.45)]));
      P.rect(g, hx - 3.4, hy - 0.8, 6.8, 1.2, '#050a0a'); P.glow(g, hx, hy - 0.2, 4, c.eye, 0.6); P.rect(g, hx - 2.4, hy - 0.5, 4.8, 0.6, c.eye);
      barnacles(g, [[hx - 2.4, hy - 3.2, 0.7], [hx + 2.6, hy + 2.4, 0.6]], '#c8c0a8');
      for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(hx - 3 + i * 3, hy + 4.6); g.quadraticCurveTo(hx - 3.4 + i * 3 + (f ? 0.6 : 0), hy + 7, hx - 3 + i * 3, hy + 9); g.strokeStyle = c.weed; g.lineWidth = 0.7; g.stroke(); }
    } });

  /* ================= Hall 4: the Catacombs (frozen) ================= */
  /** A jagged icicle from (x,y) pointing to (tx,ty), base half-width w. */
  function icicle(g, x, y, tx, ty, w, col) {
    const a = Math.atan2(ty - y, tx - x), nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
    g.beginPath(); g.moveTo(x + nx, y + ny); g.lineTo(tx, ty); g.lineTo(x - nx, y - ny); g.closePath();
    P.fill(g, P.lg(g, x - nx, y - ny, x + nx, y + ny, [sh(col, 0.5), col, sh(col, -0.35)]));
  }

  /* ---------- Frost Crawler: a pale segmented burrower, a ring of ice mandibles, armoured plates rimed with frost ---------- */
  def('frostcrawler', { w: 30, h: 16, cy: 11, frames: 2,
    colors: { shell: '#6a8aa8', flesh: '#c8b8c8', eye: '#8ff0ff', ice: '#d8f4ff' },
    draw(g, f, c) {
      const sc = c.shell, w = f ? 0.8 : -0.8;
      P.ell(g, 14, 14.4, 12, 1.4, 'rgba(0,0,0,0.45)');
      // six segments, smaller toward the tail; little legs under each
      for (let i = 5; i >= 0; i--) {
        const x = 5 + i * 3.6, y = 9.6 + Math.sin(i * 1.3 + f * 2) * 0.6, r = 2.6 + i * 0.35;
        P.line(g, x - 0.6, y + r * 0.6, x - 1.4 + (i % 2 ? w : -w), 14, 0.45, sh(sc, -0.5));
        P.ell(g, x, y, r, r * 0.9, P.vol(g, x, y - 0.4, r, i % 2 ? sc : sh(sc, -0.08)));
        P.ell(g, x, y + r * 0.55, r * 0.8, r * 0.3, sh(c.flesh, -0.2));
        icicle(g, x - 0.4, y - r * 0.8, x - 1, y - r * 0.8 - 1.6 - (i % 2), 0.6, c.ice); // frost spines along the back
      }
      // the head: a round maw ringed with ice fangs
      const hx = 26.2, hy = 9;
      P.circle(g, hx, hy, 3.2, P.vol(g, hx, hy, 3.2, sh(sc, 0.15)));
      P.circle(g, hx + 1.2, hy + 0.4, 1.7, '#140a14');
      for (let k = 0; k < 5; k++) { const a = -1.2 + k * 0.6; icicle(g, hx + 1.2 + Math.cos(a) * 1.9, hy + 0.4 + Math.sin(a) * 1.9, hx + 1.2 + Math.cos(a) * 0.4, hy + 0.4 + Math.sin(a) * 0.4, 0.35, c.ice); }
      icicle(g, hx + 2.4, hy - 1.2, hx + 5 + w * 0.4, hy - 2.2, 0.6, c.ice); icicle(g, hx + 2.4, hy + 2, hx + 5 - w * 0.4, hy + 3, 0.6, c.ice); // mandibles
      evil(g, hx - 1, hy - 1.6, 0.5, c.eye); evil(g, hx + 0.6, hy - 2.2, 0.4, c.eye);
    } });

  /* ---------- Ice Skull: a floating skull cased in ice, frost-trailing, shards orbiting it ---------- */
  def('iceskull', { w: 18, h: 18, cy: 10, frames: 2,
    colors: { bone: '#d8e8f0', ice: '#9fd8ff', eye: '#40c8ff' },
    draw(g, f, c) {
      const b = f ? 0.6 : -0.6;
      // a trail of frost below
      g.save(); g.globalAlpha = 0.45; for (let i = 0; i < 4; i++) P.circle(g, 6 - i * 1.4, 12 + i * 1.2 + b * 0.5, 1.4 - i * 0.25, c.ice); g.restore();
      P.glow(g, 9, 8.6, 7, c.ice, 0.35);
      skull(g, 9, 8.4 + b * 0.3, 4.2, c.bone, c.eye);
      // an ice casing cracked over the crown, icicles hanging from the jaw
      g.beginPath(); g.arc(9, 8.2 + b * 0.3, 5, Math.PI * 1.05, Math.PI * 1.95); g.strokeStyle = G.rgba(c.ice, 0.8); g.lineWidth = 1; g.stroke();
      for (let i = 0; i < 3; i++) icicle(g, 7.6 + i * 1.6, 12.6 + b * 0.3, 7.8 + i * 1.6, 14.6 + (i % 2) + b * 0.3, 0.45, c.ice);
      icicle(g, 6.6, 4.6 + b * 0.3, 5.4, 1.8, 0.7, c.ice); icicle(g, 10.4, 4.4 + b * 0.3, 11.8, 1.2, 0.8, c.ice);
      for (let k = 0; k < 3; k++) { const a = f * 1 + k * 2.1; P.path(g, [9 + Math.cos(a) * 7, 8.4 + Math.sin(a) * 4.2 - 1, 9.6 + Math.cos(a) * 7, 8.4 + Math.sin(a) * 4.2, 9 + Math.cos(a) * 7, 8.4 + Math.sin(a) * 4.2 + 1, 8.4 + Math.cos(a) * 7, 8.4 + Math.sin(a) * 4.2]); P.fill(g, c.ice); }
    } });

  /* ---------- Frost Guard: a tall dead warden sealed in a shell of ice, a great kite shield of ice and a glaive;
   *            variant 'bare' is the same guard once its ice has shattered ---------- */
  def('frostguard', { w: 26, h: 30, cy: 20, frames: 2,
    colors: { ice: '#a8d8f0', iron: '#3a4658', eye: '#8ff0ff', cloth: '#1e2a40' },
    variants: { bare: { ice: '#3a4658', eye: '#ff6a5a' } },
    draw(g, f, c) {
      const ic = c.ice, ir = c.iron, w = f ? 0.8 : -0.8;
      P.ell(g, 12, 28.4, 7, 1.2, 'rgba(0,0,0,0.45)');
      // legs in greaves
      P.rrect(g, 8.6 - w, 19, 2.8, 9, 1, P.lg(g, 8, 0, 12, 0, [sh(ir, 0.2), sh(ir, -0.4)])); P.rrect(g, 12.8 + w, 19, 2.8, 9, 1, P.lg(g, 12, 0, 16, 0, [sh(ir, 0.3), sh(ir, -0.3)]));
      // a ragged tabard and the cuirass
      P.path(g, [8, 16, 16, 16, 16.6, 22, 14.6, 21, 12, 23, 9.4, 21, 7.4, 22]); P.fill(g, P.lg(g, 8, 16, 16, 23, [sh(c.cloth, 0.3), sh(c.cloth, -0.4)]));
      P.rrect(g, 7.4, 9.4, 9.2, 8, 2.2, P.lg(g, 7, 9, 16, 17, [sh(ir, 0.45), ir, sh(ir, -0.45)]));
      // ice crusted over the armour: shoulders, a collar of icicles
      for (const [x, y, r] of [[7.2, 10.4, 2.6], [16.6, 10.4, 2.6]]) P.ell(g, x, y, r, r * 0.8, P.vol(g, x, y - 0.5, r, ic));
      for (let i = 0; i < 4; i++) icicle(g, 8.4 + i * 2.2, 13, 8.6 + i * 2.2, 15 + (i % 2) * 0.8, 0.55, ic);
      icicle(g, 6, 9.4, 4.6, 6, 0.8, ic); icicle(g, 17.8, 9.4, 19.6, 5.8, 0.8, ic);
      // glaive in the near hand, blade of ice
      limb(g, 16.6, 11.6, 19, 16, 1.1, 1, ir);
      P.line(g, 19.6, 26, 21.4, 3.4, 0.8, '#2a2026');
      icicle(g, 20.8, 7.6, 22.4, 0.6, 1.2, ic); P.line(g, 20.2, 7.4, 22.6, 7.8, 0.6, sh(ir, 0.3));
      // a great kite shield of ice in the far hand
      g.beginPath(); g.moveTo(2.4, 12); g.quadraticCurveTo(6.2, 10.6, 9.4, 12); g.lineTo(9, 18.6); g.quadraticCurveTo(6, 23.4, 5.8, 24); g.quadraticCurveTo(3, 21, 2.6, 18.6); g.closePath();
      P.fill(g, P.lg(g, 2, 11, 9, 24, [sh(ic, 0.45), ic, sh(ic, -0.4)])); g.strokeStyle = sh(ic, -0.5); g.lineWidth = 0.5; g.stroke();
      g.strokeStyle = G.rgba('#ffffff', 0.5); g.lineWidth = 0.35; g.beginPath(); g.moveTo(4, 13); g.lineTo(5.6, 16.4); g.lineTo(4.6, 19.4); g.stroke();
      // a closed helm with an icicle crest
      const hx = 12.4, hy = 5.8;
      P.rrect(g, hx - 3.2, hy - 3.6, 6.4, 7.2, 2.2, P.lg(g, hx - 3, 0, hx + 3, 0, [sh(ir, 0.45), ir, sh(ir, -0.4)]));
      P.rect(g, hx - 2.2, hy - 0.2, 5, 0.9, '#05070a'); P.glow(g, hx + 0.4, hy + 0.2, 3, c.eye, 0.6); P.rect(g, hx - 1.2, hy + 0.05, 3.4, 0.4, c.eye);
      for (let i = 0; i < 3; i++) icicle(g, hx - 1.4 + i * 1.4, hy - 3.4, hx - 1.8 + i * 1.6, hy - 6.4 - (i === 1 ? 1.4 : 0), 0.55, ic);
    } });

  /* ---------- Ice Bear: a huge frost-maned bear on all fours, rime on its back, breath steaming ---------- */
  def('icebear', { w: 36, h: 24, cy: 16, frames: 2,
    colors: { fur: '#c8d4dc', dark: '#6a7a8a', eye: '#40c8ff', ice: '#a8e0ff' },
    draw(g, f, c) {
      const fu = c.fur, fd = sh(fu, -0.4), w = f ? 1 : -1;
      P.ell(g, 17, 22.4, 13, 1.6, 'rgba(0,0,0,0.45)');
      // far legs
      limb(g, 10, 15, 9 + w, 21.4, 2.4, 2.2, sh(fu, -0.3)); limb(g, 22, 15, 23 - w, 21.4, 2.4, 2.2, sh(fu, -0.3));
      // a hulking body, shoulder hump higher than the rump
      g.beginPath(); g.moveTo(4, 14); g.quadraticCurveTo(4, 7, 12, 6.6); g.quadraticCurveTo(20, 4, 25, 7.6); g.quadraticCurveTo(29, 11, 27, 16); g.quadraticCurveTo(16, 19.4, 5.6, 17.4); g.closePath();
      P.fill(g, P.lg(g, 4, 5, 20, 19, [sh(fu, 0.3), fu, fd]));
      // shaggy fur strokes and rime crystals along the back
      g.strokeStyle = fd; g.lineWidth = 0.45; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(6 + i * 2.3, 8.6 + Math.abs(i - 5) * 0.3); g.lineTo(5.2 + i * 2.3, 11 + Math.abs(i - 5) * 0.3); g.stroke(); }
      for (let i = 0; i < 5; i++) icicle(g, 11 + i * 2.8, 6.4 - (i === 2 ? 1 : 0), 10.4 + i * 2.8, 3.8 - (i % 2) - (i === 2 ? 1.2 : 0), 0.7, c.ice);
      // near legs with heavy paws and claws
      limb(g, 8, 15, 7 - w, 21.4, 2.6, 2.4, fu); limb(g, 24, 14, 25 + w, 21.4, 2.6, 2.4, fu);
      claws(g, 7 - w, 22, 0, 3, 1.4, 0.4, '#2a2a30'); claws(g, 25 + w, 22, 0, 3, 1.4, 0.4, '#2a2a30');
      // the head: low, heavy, jaws open
      const hx = 29.6, hy = 12;
      P.ell(g, hx, hy, 4.4, 3.6, P.vol(g, hx - 0.4, hy - 0.6, 4.4, fu));
      P.ell(g, hx + 3.4, hy + 1, 2.4, 1.8, sh(fu, -0.1)); P.ell(g, hx + 5.4, hy + 0.2, 0.8, 0.6, '#1a1a20'); // muzzle and nose
      P.path(g, [hx + 1.4, hy + 2.2, hx + 5.6, hy + 2.2, hx + 4.6, hy + 4 + (f ? 0.4 : 0), hx + 1.8, hy + 3.4]); P.fill(g, '#2a0a10');
      teeth(g, hx + 1.8, hy + 2.3, hx + 5.4, hy + 2.3, 4, 0.7, 1, '#f0ece0');
      P.circle(g, hx - 2.2, hy - 3.2, 1.3, fd); P.circle(g, hx + 0.4, hy - 3.6, 1.2, fu); // ears
      evil(g, hx + 1.6, hy - 1, 0.6, c.eye);
      g.save(); g.globalAlpha = 0.4; P.circle(g, hx + 7 + (f ? 0.8 : 0), hy + 2, 1.4, '#e8f4ff'); P.circle(g, hx + 8.6 + (f ? 1 : 0), hy + 1, 1, '#e8f4ff'); g.restore(); // breath
    } });

  /* ---------- Frost Construct (boss): an iron-bound colossus of blue ice, a furnace of cold in its chest, fists like anvils ---------- */
  def('frostconstruct', { w: 52, h: 56, cy: 36, frames: 2,
    colors: { ice: '#7ab8e0', iron: '#3a4050', core: '#c8f4ff', rune: '#8ff0ff' },
    draw(g, f, c) {
      const ic = c.ice, ir = c.iron, w = f ? 0.9 : -0.9;
      P.ell(g, 26, 53.4, 17, 2.4, 'rgba(0,0,0,0.45)');
      // legs: pillars of ice banded in iron
      for (const [x, d] of [[18, -w], [30, w]]) { P.rrect(g, x + d, 36, 6, 17, 2, P.lg(g, x, 0, x + 6, 0, [sh(ic, 0.3), ic, sh(ic, -0.45)])); P.rect(g, x + d - 0.4, 42, 6.8, 1.6, ir); P.rect(g, x + d - 0.4, 49, 6.8, 1.6, ir); }
      // torso: a great block of ice, iron bands, the glowing core
      g.beginPath(); g.moveTo(12, 16); g.lineTo(40, 16); g.lineTo(37, 38); g.lineTo(15, 38); g.closePath();
      P.fill(g, P.lg(g, 12, 14, 40, 38, [sh(ic, 0.45), ic, sh(ic, -0.45)]));
      g.strokeStyle = G.rgba('#ffffff', 0.35); g.lineWidth = 0.5; g.beginPath(); g.moveTo(16, 19); g.lineTo(21, 26); g.lineTo(18, 33); g.moveTo(34, 20); g.lineTo(31, 27); g.stroke();
      P.rect(g, 12.6, 22, 26.8, 2, ir); P.rect(g, 14.4, 33, 23.2, 2, ir);
      for (const x of [15, 36]) P.circle(g, x, 23, 0.7, sh(ir, 0.5));
      P.glow(g, 26, 28, 9, c.core, 0.7); P.ell(g, 26, 28.4, 4, 4.4, P.rg(g, 26, 28, 4.4, [[0, '#ffffff'], [0.5, c.core], [1, sh(c.core, -0.4)]]));
      // shoulders: jagged ice outcrops
      for (const [x, s] of [[11, -1], [41, 1]]) { P.ell(g, x, 17, 6, 4.6, P.vol(g, x, 16, 6, ic)); icicle(g, x - 2 * s, 14, x - 4 * s, 7, 1.4, sh(ic, 0.2)); icicle(g, x + 1.4 * s, 13.6, x + 2.4 * s, 8.4, 1.2, sh(ic, 0.2)); }
      // arms hanging to anvil fists
      limb(g, 8, 20, 6, 32, 3, 2.6, sh(ic, -0.15)); limb(g, 44, 20, 46, 32, 3, 2.6, ic);
      for (const x of [6, 46]) { P.rrect(g, x - 4, 31 + (x === 6 ? w : -w), 8, 7, 1.8, P.lg(g, x - 4, 0, x + 4, 0, [sh(ir, 0.45), ir, sh(ir, -0.45)])); P.rect(g, x - 4, 34 + (x === 6 ? w : -w), 8, 0.8, c.rune); }
      // a small head sunk between the shoulders: an iron mask, rune eyes
      const hx = 26, hy = 11;
      P.rrect(g, hx - 5, hy - 5, 10, 9, 2.4, P.lg(g, hx - 5, 0, hx + 5, 0, [sh(ir, 0.5), ir, sh(ir, -0.4)]));
      P.glow(g, hx, hy, 5, c.rune, 0.6); P.rect(g, hx - 3.4, hy - 0.8, 2.6, 1, c.rune); P.rect(g, hx + 0.8, hy - 0.8, 2.6, 1, c.rune);
      for (let i = 0; i < 3; i++) icicle(g, hx - 3 + i * 3, hy - 4.6, hx - 3.4 + i * 3.4, hy - 9 - (i === 1 ? 2 : 0), 0.9, ic);
    } });

  /* ---------- Ice Prism (boss): a great floating crystal, a lesser ring of shards turning round it, light caught inside ---------- */
  def('iceprism', { w: 44, h: 56, cy: 38, frames: 2,
    colors: { ice: '#9fd8ff', core: '#ffffff', glow: '#8ff0ff', dark: '#1e3a6a' },
    draw(g, f, c) {
      const ic = c.ice, bob = f ? -1 : 0;
      P.ell(g, 22, 53, 11, 2, 'rgba(0,0,0,0.35)');
      P.glow(g, 22, 26 + bob, 20, c.glow, 0.35);
      // the ring of lesser shards behind
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + f * 0.5; if (Math.sin(a) > 0) continue; const x = 22 + Math.cos(a) * 17, y = 28 + bob + Math.sin(a) * 5; icicle(g, x, y + 2.6, x, y - 3.4, 1.2, sh(ic, -0.25)); }
      // the great crystal: an elongated faceted bipyramid
      const cx = 22, top = 4 + bob, mid = 24 + bob, bot = 48 + bob;
      const facet = (pts, col) => { P.path(g, pts); P.fill(g, col); };
      facet([cx, top, cx - 10, mid, cx, mid + 2], P.lg(g, cx - 10, top, cx, mid, [sh(ic, 0.55), ic]));
      facet([cx, top, cx + 10, mid, cx, mid + 2], P.lg(g, cx, top, cx + 10, mid, [sh(ic, 0.1), sh(ic, -0.35)]));
      facet([cx - 10, mid, cx, bot, cx, mid + 2], P.lg(g, cx - 10, mid, cx, bot, [sh(ic, 0.2), sh(c.dark, 0.3)]));
      facet([cx + 10, mid, cx, bot, cx, mid + 2], P.lg(g, cx, mid, cx + 10, bot, [sh(ic, -0.3), c.dark]));
      g.strokeStyle = G.rgba('#ffffff', 0.55); g.lineWidth = 0.5; g.beginPath(); g.moveTo(cx - 6, 14 + bob); g.lineTo(cx - 3, 22 + bob); g.moveTo(cx + 4, 30 + bob); g.lineTo(cx + 6, 36 + bob); g.stroke();
      // the heart of light, an eye inside it
      P.glow(g, cx, mid, 8, c.glow, 0.8); P.ell(g, cx, mid, 3.2, 4, P.rg(g, cx, mid, 4, [[0, c.core], [0.6, c.glow], [1, G.rgba(c.glow, 0)]]));
      P.ell(g, cx, mid, 0.8, 2.2, c.dark);
      // the shards in front
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + f * 0.5; if (Math.sin(a) <= 0) continue; const x = 22 + Math.cos(a) * 17, y = 28 + bob + Math.sin(a) * 5; icicle(g, x, y + 3, x, y - 4, 1.4, sh(ic, 0.15)); }
    } });

  /* ================= Hall 5: the Halls of Discord ================= */
  /** A floating shard of discord crystal centred at (x,y), height h. */
  function crystal(g, x, y, h, col) {
    const w = h * 0.32;
    P.path(g, [x, y - h / 2, x + w, y, x, y + h / 2, x - w, y]); P.fill(g, P.lg(g, x - w, y - h / 2, x + w, y + h / 2, [sh(col, 0.55), col, sh(col, -0.45)]));
    P.path(g, [x, y - h / 2, x + w, y, x, y + h * 0.1]); P.fill(g, G.rgba('#ffffff', 0.25));
  }

  /* ---------- Homunculus: a small lumpish thing of stitched flesh, one big eye, stubby arms; merges with its kin ---------- */
  def('homunculus', { w: 18, h: 16, cy: 11, frames: 2,
    colors: { flesh: '#b07a90', stitch: '#3a1a2a', eye: '#ffe060' },
    draw(g, f, c) {
      const fl = c.flesh, w = f ? 0.7 : -0.7;
      P.ell(g, 9, 14.6, 6, 1, 'rgba(0,0,0,0.45)');
      limb(g, 6.4, 11, 5.4 - w, 14.4, 1.3, 1.1, sh(fl, -0.35)); limb(g, 11.4, 11, 12.4 + w, 14.4, 1.3, 1.1, sh(fl, -0.2));
      // a lumpy pear of a body with stitched seams
      g.beginPath(); g.moveTo(9, 2.4); g.quadraticCurveTo(15, 3.4, 14.6, 9); g.quadraticCurveTo(14.2, 13.4, 9, 13.2); g.quadraticCurveTo(3.4, 13.4, 3.4, 9); g.quadraticCurveTo(3.4, 3.6, 9, 2.4); g.closePath();
      P.fill(g, P.rg(g, 8, 6, 8, [[0, sh(fl, 0.35)], [0.6, fl], [1, sh(fl, -0.5)]], 7, 5));
      g.strokeStyle = c.stitch; g.lineWidth = 0.4; g.beginPath(); g.moveTo(5, 5); g.quadraticCurveTo(7, 9, 6, 12.6); g.stroke();
      for (let i = 0; i < 4; i++) P.line(g, 5.2 + i * 0.3, 6 + i * 1.7, 6.6 + i * 0.3, 6.2 + i * 1.7, 0.35, c.stitch);
      P.circle(g, 12.6, 5.4, 1.1, sh(fl, 0.1)); P.circle(g, 4.6, 8.6, 0.8, sh(fl, 0.15)); // lumps
      // the one eye, bloodshot, and a lipless mouth
      P.circle(g, 10, 6.6, 2.4, '#f0e8d8'); P.circle(g, 10.6, 6.8, 1.2, c.eye); P.circle(g, 10.8, 6.9, 0.55, '#140808');
      for (let k = 0; k < 3; k++) P.line(g, 8 + k * 0.4, 5.2 + k * 1.2, 8.8 + k * 0.3, 5.8 + k * 1, 0.2, '#c03040');
      P.path(g, [7.6, 10.4, 12.4, 10, 11.6, 11.4, 8.4, 11.6]); P.fill(g, '#2a0a14'); teeth(g, 8, 10.4, 12, 10.1, 4, 0.5, 1, '#e8dcc8');
      // arms
      limb(g, 4.4, 8, 2.4, 10.6 + w, 0.9, 0.8, sh(fl, -0.2)); limb(g, 14, 8, 16, 10.6 - w, 0.9, 0.8, fl);
    } });

  /* ---------- Capra Fiend: a goat-headed demon, ram horns, hooves, a notched cleaver; leaps ---------- */
  def('capra', { w: 26, h: 30, cy: 20, frames: 2,
    colors: { hide: '#5a2a4a', fur: '#2a1a24', horn: '#c8b89a', eye: '#ff5ae0' },
    draw(g, f, c) {
      const hd = c.hide, w = f ? 0.8 : -0.8;
      P.ell(g, 12, 28.4, 7, 1.2, 'rgba(0,0,0,0.45)');
      // goat legs: backward knees, hooves
      for (const [x, d, col] of [[9.6, -w, sh(c.fur, -0.2)], [14, w, c.fur]]) { limb(g, x, 18, x + 2 + d, 22.4, 1.6, 1.3, col); limb(g, x + 2 + d, 22.4, x + d, 27, 1.2, 1, col); P.rrect(g, x - 1 + d, 26.6, 2.4, 1.4, 0.4, '#140a10'); }
      // torso and shaggy loins
      g.beginPath(); g.moveTo(8, 9); g.quadraticCurveTo(12, 7, 16.6, 9); g.lineTo(16, 18); g.quadraticCurveTo(12, 19.4, 8.4, 18); g.closePath();
      P.fill(g, P.lg(g, 8, 8, 17, 19, [sh(hd, 0.35), hd, sh(hd, -0.45)]));
      rag(g, 8, 17.6, 16.4, 17.6, 5, 2, c.fur);
      P.line(g, 10, 12, 14.6, 12, 0.35, sh(hd, -0.45)); P.line(g, 10.4, 14.2, 14.2, 14.2, 0.35, sh(hd, -0.45)); // ribs
      // far arm, near arm with a notched cleaver
      limb(g, 8.4, 10, 5.4, 15, 1.2, 1, sh(hd, -0.3)); claws(g, 5.2, 15.4, 1.2, 3, 1.2, 0.35, '#1a0a14');
      limb(g, 16.4, 10, 19.4, 13 + w, 1.2, 1, hd);
      P.path(g, [19, 13.6 + w, 20.6, 12.8 + w, 25.4, 4.6 + w, 24.6, 3.8 + w, 22.6, 5 + w, 23.2, 6.4 + w, 21.6, 7.4 + w]); P.fill(g, P.lg(g, 19, 4, 25, 14, ['#c8ccd8', '#5a5e6a']));
      // goat head: long face, ram horns curling, a beard
      const hx = 13.4, hy = 5.6;
      horn(g, hx - 1.6, hy - 2, hx - 7, hy - 5, hx - 5.4, hy + 1.4, 1.1, c.horn); horn(g, hx + 0.6, hy - 2.4, hx + 3, hy - 7.4, hx + 6.4, hy - 4.6, 1, c.horn);
      g.beginPath(); g.moveTo(hx - 2.4, hy - 2); g.quadraticCurveTo(hx + 1, hy - 3.6, hx + 2.6, hy - 1); g.lineTo(hx + 4.4, hy + 2.6); g.quadraticCurveTo(hx + 3, hy + 4, hx + 1.4, hy + 3.2); g.quadraticCurveTo(hx - 2.2, hy + 2, hx - 2.4, hy - 2); g.closePath();
      P.fill(g, P.lg(g, hx - 2, hy - 3, hx + 4, hy + 4, [sh(hd, 0.4), hd, sh(hd, -0.35)]));
      P.path(g, [hx + 0.4, hy + 3, hx + 2, hy + 3.4, hx + 1.2, hy + 6.4]); P.fill(g, c.fur);
      P.line(g, hx - 2.2, hy - 0.6, hx - 4.4, hy + 0.6, 0.8, sh(hd, -0.2)); // ear
      evil(g, hx + 1.2, hy - 0.6, 0.55, c.eye); evil(g, hx - 0.8, hy - 0.8, 0.45, c.eye);
    } });

  /* ---------- Fiend Caster: a spindly robed fiend, a mask of bone, three floating orbs of discord ---------- */
  def('fiendcaster', { w: 22, h: 28, cy: 19, frames: 2,
    colors: { robe: '#3a1a4a', bone: '#e0d4c0', orb: '#ff60d0', eye: '#ff60d0' },
    draw(g, f, c) {
      const r = c.robe, sway = f ? 0.6 : -0.6;
      g.beginPath(); g.moveTo(8, 9); g.lineTo(14, 9); g.quadraticCurveTo(16.4, 17, 16.8 + sway, 25.6); g.lineTo(5.2 + sway, 25.6); g.quadraticCurveTo(5.6, 17, 8, 9); g.closePath();
      P.fill(g, P.lg(g, 5, 9, 17, 26, [sh(r, 0.3), r, sh(r, -0.6)]));
      rag(g, 5.2 + sway, 25.2, 16.8 + sway, 25.2, 6, 1.8, sh(r, -0.5));
      P.line(g, 11, 10, 11, 24, 0.5, sh(r, -0.5)); for (let i = 0; i < 3; i++) P.circle(g, 11, 13 + i * 3, 0.5, c.orb);
      // long arms raised, clawed
      limb(g, 8, 10.6, 4.6, 7, 0.9, 0.8, sh(r, -0.2)); claws(g, 4.4, 6.6, -2, 4, 1.4, 0.3, '#2a1a2a');
      limb(g, 14, 10.6, 17.4, 7 - sway, 0.9, 0.8, r); claws(g, 17.6, 6.6 - sway, -1.2, 4, 1.4, 0.3, '#2a1a2a');
      // a horned hood and a smooth bone mask with slit eyes
      g.beginPath(); g.moveTo(7.4, 10); g.quadraticCurveTo(7, 2.6, 11.2, 2.2); g.quadraticCurveTo(15.4, 2.6, 15, 10); g.quadraticCurveTo(11, 8.6, 7.4, 10); g.closePath();
      P.fill(g, P.lg(g, 7, 2, 15, 10, [sh(r, 0.35), r, sh(r, -0.5)]));
      horn(g, 8.4, 3.6, 6.4, 1.4, 5.4, -0.6, 0.6, '#1a0a1a'); horn(g, 14, 3.6, 16, 1.4, 17, -0.6, 0.6, '#1a0a1a');
      P.ell(g, 11.6, 6.4, 2.4, 2.8, P.lg(g, 9, 4, 14, 9, [c.bone, sh(c.bone, -0.35)]));
      P.path(g, [10, 5.8, 11.2, 6.2, 10.2, 6.6]); P.fill(g, '#0a0408'); P.path(g, [13.4, 5.8, 12.2, 6.2, 13.2, 6.6]); P.fill(g, '#0a0408');
      P.glow(g, 11.6, 6.2, 3, c.eye, 0.4);
      // three orbs circling above the hands
      for (let k = 0; k < 3; k++) { const a = k * 2.1 + f * 0.9, x = 11 + Math.cos(a) * 7, y = 4 + Math.sin(a) * 2; P.glow(g, x, y, 3, c.orb, 0.6); P.circle(g, x, y, 1, '#ffe0f8'); }
    } });

  /* ---------- Shapeshifter: its true shape: a writhing mass of mouths and tendrils around a torn human face ---------- */
  def('shapeshifter', { w: 26, h: 26, cy: 17, frames: 2,
    colors: { flesh: '#6a3a5a', dark: '#2a0e22', eye: '#ffe060', tooth: '#efe4d0' },
    draw(g, f, c) {
      const fl = c.flesh, w = f ? 1 : -1;
      P.ell(g, 13, 24.4, 9, 1.4, 'rgba(0,0,0,0.45)');
      // tendrils on the ground and reaching out
      for (let i = 0; i < 7; i++) { const a = Math.PI * (0.05 + i * 0.15), l = 8 + (i % 3) * 2; g.beginPath(); g.moveTo(13, 16); g.quadraticCurveTo(13 + Math.cos(a) * l * 0.6 + w, 16 + Math.sin(a) * 4, 13 + Math.cos(a) * l, 22 + Math.sin(a) * 1.5 - (i % 2)); g.strokeStyle = i % 2 ? sh(fl, -0.3) : fl; g.lineWidth = 1.4 - (i % 3) * 0.3; g.lineCap = 'round'; g.stroke(); }
      for (const [x, y, tx, ty] of [[8, 9, 2 - w, 4], [18, 9, 24 + w, 5]]) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + tx) / 2 + w, y - 5, tx, ty); g.strokeStyle = sh(fl, -0.15); g.lineWidth = 1.2; g.stroke(); P.circle(g, tx, ty, 0.9, sh(fl, 0.2)); }
      // the heaving mass
      P.ell(g, 13, 13.6, 8, 7.4, P.rg(g, 12, 11, 9, [[0, sh(fl, 0.3)], [0.6, fl], [1, c.dark]], 11, 9));
      // mouths opening all over it
      for (const [x, y, s] of [[7.6, 15, 1], [17.6, 16.2, 1.1], [11.4, 18.6, 0.9]]) { P.ell(g, x, y, 2 * s, 1 * s, '#1a0410'); teeth(g, x - 1.6 * s, y - 0.4, x + 1.6 * s, y - 0.4, 4, 0.5 * s, 1, c.tooth); }
      // a pale human face half torn, stretched on its front
      P.ell(g, 14.6, 10, 3.2, 3.8, P.lg(g, 12, 7, 17, 13, ['#e0c8b8', '#8a6a60']));
      P.path(g, [11.6, 8, 13, 13.6, 11.8, 13.4]); P.fill(g, fl); // the tear
      P.circle(g, 13.8, 9.2, 0.7, '#0a0404'); P.circle(g, 16, 9.2, 0.7, '#0a0404'); evil(g, 16, 9.2, 0.35, c.eye); evil(g, 13.8, 9.2, 0.3, c.eye);
      P.ell(g, 15, 12, 1.2, 0.7, '#1a0410');
      // eyes elsewhere on the mass
      for (const [x, y] of [[9, 9.6], [19, 12.4]]) { P.circle(g, x, y, 1, '#f0e8d0'); P.circle(g, x + 0.2, y, 0.5, c.eye); }
    } });

  /* ---------- Void Syphon: a floating orb of dark flesh ringed with feelers, a single slit maw that draws you in ---------- */
  def('syphon', { w: 24, h: 24, cy: 13, frames: 2,
    colors: { body: '#2a1a3a', vein: '#b050ff', eye: '#e0a0ff' },
    draw(g, f, c) {
      const b = c.body, w = f ? 1 : -1;
      // dangling feelers
      for (let i = 0; i < 6; i++) { const x = 7 + i * 2; g.beginPath(); g.moveTo(x, 16); g.quadraticCurveTo(x + (i % 2 ? w : -w), 19, x + (i % 2 ? -0.6 : 0.6), 22.6 - (i % 3)); g.strokeStyle = sh(b, 0.1); g.lineWidth = 0.8; g.lineCap = 'round'; g.stroke(); }
      P.glow(g, 12, 11, 11, c.vein, 0.3);
      P.circle(g, 12, 11, 7.2, P.rg(g, 10, 9, 8, [[0, sh(b, 0.45)], [0.6, b], [1, '#0a0410']]));
      // glowing veins
      g.strokeStyle = G.rgba(c.vein, 0.8); g.lineWidth = 0.4;
      for (const [x0, y0, x1, y1] of [[6, 8, 9.6, 11], [7, 15, 10, 13], [17.6, 7, 14.4, 10], [18, 14, 14.6, 12.4]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 1, x1, y1); g.stroke(); }
      // the vertical slit maw, glowing within, ringed by little teeth
      P.ell(g, 12.6, 11, 1.8 + (f ? 0.4 : 0), 4.2, '#0a0210'); P.glow(g, 12.6, 11, 4, c.eye, 0.6); P.ell(g, 12.6, 11, 0.6, 3, c.eye);
      for (let k = 0; k < 6; k++) { const y = 7.4 + k * 1.4; P.line(g, 10.6, y, 11.4, y + 0.2, 0.3, '#e8dcc8'); P.line(g, 14.6, y, 13.8, y + 0.2, 0.3, '#e8dcc8'); }
      // spines on the crown
      for (let k = 0; k < 5; k++) { const a = -2.4 + k * 0.4; horn(g, 12 + Math.cos(a) * 6.6, 11 + Math.sin(a) * 6.6, 12 + Math.cos(a) * 8.6, 11 + Math.sin(a) * 8.6, 12 + Math.cos(a) * 10, 11 + Math.sin(a) * 10, 0.5, sh(b, 0.2)); }
    } });

  /* ---------- Clockwork Construct: a brass automaton on a single wheel, gears in its chest, a lens eye that fires a beam ---------- */
  def('clockwork', { w: 24, h: 30, cy: 20, frames: 2,
    colors: { brass: '#b08a3a', iron: '#3a3a44', lens: '#ff4080' },
    draw(g, f, c) {
      const br = c.brass, ir = c.iron;
      P.ell(g, 12, 28.6, 6, 1.1, 'rgba(0,0,0,0.45)');
      // the wheel it rolls on, spokes turning
      P.circle(g, 12, 24.4, 4.4, P.vol(g, 12, 24, 4.4, ir)); P.circle(g, 12, 24.4, 3.2, sh(ir, -0.3));
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4 + f * 0.4; P.line(g, 12 - Math.cos(a) * 3, 24.4 - Math.sin(a) * 3, 12 + Math.cos(a) * 3, 24.4 + Math.sin(a) * 3, 0.5, sh(br, -0.2)); }
      P.circle(g, 12, 24.4, 0.9, br);
      // the body: a brass barrel with a window onto its gears
      P.rrect(g, 6.4, 9, 11.2, 12, 2.4, P.lg(g, 6, 0, 18, 0, [sh(br, -0.4), sh(br, 0.4), br, sh(br, -0.5)]));
      P.rect(g, 6.4, 12, 11.2, 0.8, sh(br, -0.5)); P.rect(g, 6.4, 18, 11.2, 0.8, sh(br, -0.5));
      P.circle(g, 12, 15.4, 2.8, '#140c08');
      const gear = (x, y, r, a) => { g.save(); g.translate(x, y); g.rotate(a); for (let k = 0; k < 8; k++) { g.rotate(Math.PI / 4); P.rect(g, -0.4, -r - 0.6, 0.8, 0.8, sh(br, 0.3)); } g.restore(); P.circle(g, x, y, r, sh(br, 0.15)); P.circle(g, x, y, r * 0.35, '#140c08'); };
      gear(11.2, 14.8, 1.4, f * 0.4); gear(13.2, 16.4, 1, -f * 0.5);
      for (const x of [7.6, 16.4]) for (const y of [10.4, 19.6]) P.circle(g, x, y, 0.45, sh(br, 0.5)); // rivets
      // arms: pistons and pincer claws
      P.line(g, 6.4, 12, 3.4, 15, 1, ir); P.line(g, 3.4, 15, 3.6, 18, 0.8, sh(br, -0.1)); P.path(g, [2.4, 18, 3.6, 20.4, 4.8, 18]); P.fill(g, ir);
      P.line(g, 17.6, 12, 20.6, 14, 1, ir); P.line(g, 20.6, 14, 21, 17, 0.8, sh(br, -0.1)); P.path(g, [20, 17, 21, 19.6, 22.2, 17]); P.fill(g, ir);
      // a domed head with one great lens and a chimney venting steam
      P.ell(g, 12, 7, 4.6, 3.6, P.vol(g, 12, 6, 4.6, br)); P.rect(g, 7.4, 7.4, 9.2, 1.4, sh(br, -0.4));
      P.circle(g, 13.4, 6.4, 2, ir); P.glow(g, 13.4, 6.4, 3.4, c.lens, 0.8); P.circle(g, 13.4, 6.4, 1.3, c.lens); P.circle(g, 12.9, 5.9, 0.4, '#ffe0ea');
      P.rect(g, 8.6, 1.6, 1.4, 3, ir); g.save(); g.globalAlpha = 0.35; P.circle(g, 9.3 - (f ? 0.8 : 0), 0.8, 1.2, '#e0e0e0'); g.restore();
    } });

  /* ---------- Void Caller (boss): a tall hooded summoner, rings of void turning about it, a faceless dark with a crown of eyes ---------- */
  def('voidcaller', { w: 46, h: 58, cy: 38, frames: 2,
    colors: { robe: '#241436', trim: '#8a5ab0', void: '#b050ff', eye: '#ffe060' },
    draw(g, f, c) {
      const r = c.robe, sway = f ? 1 : -1;
      P.glow(g, 23, 30, 22, c.void, 0.25);
      // a void ring behind
      g.save(); g.translate(23, 26); g.scale(1, 0.34); g.rotate(f * 0.3); g.strokeStyle = G.rgba(c.void, 0.7); g.lineWidth = 2.4; g.setLineDash([6, 4]); g.beginPath(); g.arc(0, 0, 19, Math.PI, Math.PI * 2); g.stroke(); g.restore();
      // robes flaring to tatters, floating above the floor
      g.beginPath(); g.moveTo(16, 18); g.lineTo(30, 18); g.quadraticCurveTo(35, 36, 36 + sway, 52); g.lineTo(10 + sway, 52); g.quadraticCurveTo(11, 36, 16, 18); g.closePath();
      P.fill(g, P.lg(g, 10, 18, 36, 52, [sh(r, 0.35), r, sh(r, -0.6)]));
      rag(g, 10 + sway, 51.6, 36 + sway, 51.6, 9, 3, sh(r, -0.5));
      P.line(g, 23, 20, 23, 50, 0.9, c.trim); for (let i = 0; i < 4; i++) crystal(g, 23, 25 + i * 6.4, 2.6, c.void);
      // arms wide, void pooling between the hands
      for (const [s, col] of [[-1, sh(r, -0.2)], [1, r]]) { const x = 23 + s * 7; limb(g, x, 21, x + s * 8, 28, 1.8, 1.4, col); claws(g, x + s * 8.4, 28.6, s * 1.4, 4, 2, 0.4, '#1a0a20'); }
      P.glow(g, 23, 33, 9, c.void, 0.5); P.circle(g, 23, 33, 3.2 + (f ? 0.4 : 0), P.rg(g, 23, 33, 3.6, [[0, '#ffffff'], [0.4, c.void], [1, '#140420']]));
      // the hood: nothing inside but dark and a crown of eyes around it
      g.beginPath(); g.moveTo(15.6, 20); g.quadraticCurveTo(15, 4, 23, 3); g.quadraticCurveTo(31, 4, 30.4, 20); g.quadraticCurveTo(23, 16.6, 15.6, 20); g.closePath();
      P.fill(g, P.lg(g, 15, 3, 31, 20, [sh(r, 0.4), r, sh(r, -0.5)]));
      P.ell(g, 23.4, 12.6, 5, 5.6, '#030106');
      for (let k = 0; k < 5; k++) { const a = Math.PI * (1.15 + k * 0.175), x = 23 + Math.cos(a) * 11, y = 11 + Math.sin(a) * 9; P.circle(g, x, y, 1.3, '#f0e0c8'); evil(g, x + 0.2, y, 0.6, c.eye); }
      P.circle(g, 22, 12, 0.5, c.void); P.circle(g, 25, 12, 0.5, c.void);
      // the ring in front
      g.save(); g.translate(23, 26); g.scale(1, 0.34); g.rotate(f * 0.3); g.strokeStyle = G.rgba(c.void, 0.9); g.lineWidth = 2.4; g.setLineDash([6, 4]); g.beginPath(); g.arc(0, 0, 19, 0, Math.PI); g.stroke(); g.restore();
    } });

  /* ---------- Twisted Knight (boss): a knight grown through with discord crystal, armour bent, a warped lance ---------- */
  def('twistedknight', { w: 50, h: 58, cy: 36, frames: 2,
    colors: { plate: '#4a3a5a', crystal: '#e060ff', eye: '#ff60d0', cloth: '#2a0e2a' },
    draw(g, f, c) {
      const pl = c.plate, w = f ? 0.8 : -0.8;
      P.ell(g, 24, 55, 14, 2.4, 'rgba(0,0,0,0.45)');
      // a torn cape
      g.beginPath(); g.moveTo(15, 18); g.lineTo(31, 18); g.quadraticCurveTo(33, 36, 35 + w, 50); g.lineTo(12 - w, 50); g.quadraticCurveTo(12, 34, 15, 18); g.closePath();
      P.fill(g, P.lg(g, 12, 18, 35, 50, [sh(c.cloth, 0.3), c.cloth, sh(c.cloth, -0.5)])); rag(g, 12 - w, 49.6, 35 + w, 49.6, 7, 2.4, sh(c.cloth, -0.5));
      // legs: one straight, one bent the wrong way, crystal bursting from the knee
      P.rrect(g, 17 - w, 35, 4.6, 18, 1.6, P.lg(g, 17, 0, 22, 0, [sh(pl, 0.3), sh(pl, -0.4)]));
      limb(g, 27, 35, 30 + w, 44, 2.4, 2.2, pl); limb(g, 30 + w, 44, 27.6 + w, 53, 2.2, 2, sh(pl, -0.15));
      crystal(g, 31 + w, 43, 6, c.crystal);
      // a cuirass buckled out of true
      g.beginPath(); g.moveTo(15, 18); g.quadraticCurveTo(24, 14, 32, 19); g.lineTo(30, 36); g.quadraticCurveTo(22, 38, 15.6, 35); g.closePath();
      P.fill(g, P.lg(g, 15, 15, 32, 37, [sh(pl, 0.45), pl, sh(pl, -0.5)]));
      g.strokeStyle = sh(pl, -0.6); g.lineWidth = 0.6; g.beginPath(); g.moveTo(18, 22); g.lineTo(24, 26); g.lineTo(21, 31); g.stroke();
      crystal(g, 26, 26, 9, c.crystal); crystal(g, 19, 31, 5, c.crystal); crystal(g, 15, 18, 7, c.crystal); // crystal growing through the chest
      // arms: the far one a crystal claw, the near one holding a warped lance
      limb(g, 14, 20, 10, 29, 1.8, 1.6, sh(pl, -0.2)); crystal(g, 9, 31, 6, c.crystal);
      limb(g, 32, 20, 35, 28, 1.8, 1.6, pl);
      g.beginPath(); g.moveTo(33, 30); g.bezierCurveTo(38, 22, 36, 14, 44, 4); g.strokeStyle = '#2a1a2a'; g.lineWidth = 1.6; g.stroke();
      g.beginPath(); g.moveTo(34, 29); g.bezierCurveTo(39, 21, 37, 13, 45.5, 2.6); g.strokeStyle = sh(pl, 0.4); g.lineWidth = 0.4; g.stroke();
      crystal(g, 44.6, 3, 6, c.crystal);
      // a helm split open, a crystal horn out of it, one eye burning
      const hx = 23.6, hy = 13.4;
      P.rect(g, hx - 2, hy + 3.6, 4, 2.4, sh(pl, -0.5)); // the gorget
      P.rrect(g, hx - 4.6, hy - 5, 9.2, 10, 3, P.lg(g, hx - 4, 0, hx + 4, 0, [sh(pl, 0.45), pl, sh(pl, -0.45)]));
      P.path(g, [hx - 1, hy - 5.4, hx + 1.4, hy - 1, hx - 0.4, hy + 4.6, hx + 0.8, hy + 4.6, hx + 2.6, hy - 1, hx + 0.4, hy - 5.4]); P.fill(g, '#0a040a'); // the split
      crystal(g, hx + 1, hy - 7, 8, c.crystal);
      P.rect(g, hx - 3.4, hy - 0.4, 2.8, 1, '#050205'); P.glow(g, hx - 2, hy, 3, c.eye, 0.7); P.rect(g, hx - 2.8, hy - 0.2, 1.8, 0.6, c.eye);
    } });

  /* ================= Hall 6: the Blightmire ================= */
  /** Dripping slime strands from (x,y) downward. */
  function drips(g, pts, col) { for (const [x, y, l] of pts) { P.line(g, x, y, x, y + l, 0.45, col); P.circle(g, x, y + l, 0.45, col); } }

  /* ---------- Blight Mosquito: a bloated bog mosquito, a long proboscis, a sac of stolen blood that swells ---------- */
  def('mosquito', { w: 24, h: 18, cy: 10, frames: 2,
    colors: { body: '#3a3a1e', sac: '#a02030', wing: '#c8d8a0', eye: '#ff3a2a' },
    draw(g, f, c) {
      const b = c.body;
      // wings, a blur of beats
      g.save(); g.globalAlpha = 0.45;
      for (const [a, l] of f ? [[-2.3, 9], [-2.7, 8]] : [[-1.9, 9], [-2.2, 8]]) { g.save(); g.translate(11, 7); g.rotate(a); P.ell(g, l / 2, 0, l / 2, 1.8, c.wing); g.restore(); }
      g.restore();
      // spindly legs dangling
      for (let i = 0; i < 3; i++) { P.line(g, 9 + i * 2, 10, 7 + i * 2.4, 14, 0.35, sh(b, -0.3)); P.line(g, 7 + i * 2.4, 14, 7.4 + i * 2.6, 17, 0.3, sh(b, -0.3)); }
      // the blood sac abdomen, glossy and veined
      P.ell(g, 6.4, 10.4, 4.6, 3.4, P.rg(g, 5.6, 9.4, 5, [[0, sh(c.sac, 0.5)], [0.6, c.sac], [1, sh(c.sac, -0.55)]]), 0.3);
      g.strokeStyle = sh(c.sac, -0.5); g.lineWidth = 0.3; g.beginPath(); g.moveTo(3, 9); g.quadraticCurveTo(6, 11, 9, 10); g.moveTo(4, 12); g.quadraticCurveTo(7, 11.4, 9.6, 11.6); g.stroke();
      P.circle(g, 5, 9, 0.8, G.rgba('#ffffff', 0.4));
      // thorax and head
      P.ell(g, 12.4, 8.6, 2.6, 2.2, P.vol(g, 12.4, 8, 2.6, b));
      P.circle(g, 15.6, 8, 1.8, P.vol(g, 15.6, 7.6, 1.8, sh(b, 0.1)));
      evil(g, 16.2, 7.4, 0.8, c.eye);
      P.line(g, 17, 8.6, 23, 10.4 + (f ? 0.4 : 0), 0.45, '#1a1a0a'); // the proboscis
      P.line(g, 16, 6.4, 18, 3.6, 0.3, sh(b, -0.2)); P.line(g, 15.4, 6.4, 16.4, 3.4, 0.3, sh(b, -0.2)); // feelers
    } });

  /* ---------- Bog Corpse: a drowned, rotting body risen from the mire, weed and fungus on it, a gut of foul gas ---------- */
  def('bogcorpse', { w: 22, h: 28, cy: 18, frames: 2,
    colors: { skin: '#6a7a4a', rot: '#3a4a1a', gas: '#b0d040', eye: '#e0ff60' },
    draw(g, f, c) {
      const s = c.skin, sd = sh(s, -0.5), w = f ? 0.9 : -0.9;
      P.ell(g, 11, 26.4, 7, 1.3, 'rgba(0,0,0,0.45)'); P.ell(g, 11, 26.2, 6, 1, G.rgba('#3a4a1a', 0.6));
      limb(g, 8.6, 18, 7.6 - w, 26, 1.5, 1.3, sd); limb(g, 13.4, 18, 14.4 + w, 26, 1.5, 1.3, s);
      // a torso split open at the belly, green gas glowing within
      g.beginPath(); g.moveTo(6.4, 9); g.quadraticCurveTo(11, 7.4, 15.6, 9); g.quadraticCurveTo(17, 15, 15, 19.6); g.quadraticCurveTo(11, 21, 7, 19.6); g.quadraticCurveTo(5, 15, 6.4, 9); g.closePath();
      P.fill(g, P.lg(g, 6, 8, 16, 20, [sh(s, 0.25), s, sd]));
      P.ell(g, 11.4, 15, 2.6, 3.2, '#141a08'); P.glow(g, 11.4, 15, 4, c.gas, 0.6); P.ell(g, 11.4, 15.4, 1.4, 2, G.rgba(c.gas, 0.7));
      for (const x of [9.2, 13.6]) P.line(g, x, 12.4, x + (x < 11 ? 0.8 : -0.8), 17.6, 0.4, '#d8d0b0'); // ribs showing at the wound
      // fungus caps and weed
      for (const [x, y, r] of [[7, 10.4, 1.4], [15, 12, 1.1], [8, 18, 0.9]]) { P.ell(g, x, y, r, r * 0.6, '#c8a060'); P.line(g, x, y, x, y + r * 0.8, 0.4, '#e8e0c0'); }
      for (let i = 0; i < 4; i++) { const x = 7.4 + i * 2.4; g.beginPath(); g.moveTo(x, 8.6); g.quadraticCurveTo(x + (f ? 0.6 : -0.6), 12, x - 0.4, 15 + (i % 2) * 2); g.strokeStyle = c.rot; g.lineWidth = 0.7; g.stroke(); }
      // arms hanging, one bone bare
      limb(g, 6.4, 10, 4, 17 + w, 1.2, 1, sd); P.bone(g, 15.8, 10, 18.2, 16 - w, 0.6, '#d8d0b0'); claws(g, 18.2, 16.4 - w, 0.6, 3, 1.2, 0.3, '#d8d0b0');
      // a lolling head, jaw hanging, one eye glowing
      const hx = 12, hy = 5.4;
      P.circle(g, hx, hy, 3.2, P.vol(g, hx, hy, 3.2, sh(s, 0.1)));
      P.path(g, [hx - 1, hy + 1.4, hx + 3, hy + 1, hx + 2.4, hy + 4.2, hx - 0.4, hy + 3.6]); P.fill(g, '#141a08');
      P.circle(g, hx + 1.2, hy - 0.4, 0.8, '#141a08'); evil(g, hx + 1.2, hy - 0.4, 0.45, c.eye); P.circle(g, hx - 1.4, hy - 0.4, 0.7, '#141a08');
      drips(g, [[hx + 1.4, hy + 4, 2], [9, 20, 1.6]], G.rgba(c.gas, 0.8));
    } });

  /* ---------- Bog Wraith: a hunched hag of mist and moss, long-fingered, lank hair, trailing into vapour ---------- */
  def('bogwraith', { w: 24, h: 28, cy: 18, frames: 2,
    colors: { mist: '#8aa070', hair: '#1e2614', eye: '#d0ff40', skin: '#a8b48a' },
    draw(g, f, c) {
      const m = c.mist, sway = f ? 1 : -1;
      P.glow(g, 12, 16, 12, c.eye, 0.18);
      // the body trails away into vapour
      g.beginPath(); g.moveTo(7, 10); g.quadraticCurveTo(12, 8, 17, 10); g.quadraticCurveTo(19, 18, 16 + sway, 26); g.quadraticCurveTo(14, 23, 12, 27); g.quadraticCurveTo(10, 23, 8 - sway, 26); g.quadraticCurveTo(5, 18, 7, 10); g.closePath();
      P.fill(g, P.lg(g, 0, 8, 0, 27, [G.rgba(sh(m, 0.2), 0.95), G.rgba(m, 0.7), G.rgba(sh(m, -0.3), 0)]));
      for (const [x, y, r] of [[8, 13, 1.2], [15.6, 15, 1], [10, 19, 0.9]]) P.ell(g, x, y, r, r * 0.7, '#3a5a1a'); // moss
      // long arms reaching, too-long fingers
      for (const [x0, y0, x1, y1, col] of [[7.4, 11, 2.4, 15 + sway, sh(c.skin, -0.3)], [16.6, 11, 21.6, 14 - sway, c.skin]]) { limb(g, x0, y0, x1, y1, 0.9, 0.6, col); claws(g, x1, y1 + 0.3, x1 < 12 ? -0.6 : 0.6, 4, 2, 0.25, sh(c.skin, -0.2)); }
      // the head: lank hair to the waist, a gaunt face, glowing eyes, a wide black mouth
      const hx = 12.6, hy = 6;
      for (let i = 0; i < 7; i++) { const x = hx - 3.4 + i * 1.1; g.beginPath(); g.moveTo(x, hy - 2.4); g.quadraticCurveTo(x - 0.6 + sway * 0.3, hy + 4, x - 0.4 + (i % 2) * 0.6, hy + 9 + (i % 3)); g.strokeStyle = c.hair; g.lineWidth = 0.7; g.stroke(); }
      P.ell(g, hx + 0.4, hy, 2.4, 3, P.lg(g, hx - 2, hy - 3, hx + 2, hy + 3, [c.skin, sh(c.skin, -0.45)]));
      P.path(g, [hx - 3.6, hy - 1, hx - 1, hy - 3.8, hx + 2, hy - 3.8, hx + 3.6, hy - 1.4, hx + 1.4, hy - 2.4, hx - 1.4, hy - 2.4]); P.fill(g, c.hair);
      evil(g, hx - 0.6, hy - 0.4, 0.5, c.eye); evil(g, hx + 1.6, hy - 0.4, 0.5, c.eye);
      P.ell(g, hx + 0.6, hy + 1.8, 1, 0.8 + (f ? 0.3 : 0), '#0a0e04');
    } });

  /* ---------- Bog Toad: a squat warty toad as big as a hound, throat sac, a long sticky tongue ---------- */
  def('toad', { w: 26, h: 18, cy: 12, frames: 2,
    colors: { skin: '#5a6a2a', belly: '#c8c080', wart: '#8a9a3a', eye: '#ffb020' },
    draw(g, f, c) {
      const s = c.skin, sd = sh(s, -0.5), w = f ? 1 : 0;
      P.ell(g, 12, 16.4, 9, 1.4, 'rgba(0,0,0,0.45)');
      // folded hind legs
      P.ell(g, 6, 12.6, 4, 3, P.vol(g, 6, 12, 4, sd)); limb(g, 5, 14, 2, 16, 1.2, 1, sd); claws(g, 2, 16.4, 0, 3, 1.2, 0.35, sd);
      // the squat body
      P.ell(g, 12, 10.6, 8, 5.4, P.rg(g, 11, 8.4, 9, [[0, sh(s, 0.3)], [0.6, s], [1, sd]]));
      P.ell(g, 14, 13, 5, 2.4, P.lg(g, 0, 11, 0, 15, [c.belly, sh(c.belly, -0.3)]));
      for (const [x, y, r] of [[7, 8, 0.9], [10, 6.6, 0.8], [13, 7, 1], [8.6, 10.6, 0.7], [11.6, 9.4, 0.6], [5.6, 11, 0.7]]) { P.circle(g, x, y, r, c.wart); P.circle(g, x - r * 0.3, y - r * 0.3, r * 0.4, sh(c.wart, 0.4)); }
      // front legs
      limb(g, 16, 12, 17.6, 16, 1, 0.9, s); claws(g, 17.6, 16.4, 0.4, 3, 1, 0.3, s);
      // the throat sac pulsing, the wide head
      P.ell(g, 18.4, 12.2, 2.6 + w, 1.8 + w * 0.6, G.rgba(sh(c.belly, 0.2), 0.9));
      P.ell(g, 19.4, 8.6, 4.6, 3.2, P.vol(g, 19, 8, 4.6, s));
      P.line(g, 16, 10.4, 23.6, 9.6, 0.5, '#1a1a08'); // the mouth line
      // eyes bulging on top
      for (const x of [17.4, 20.6]) { P.circle(g, x, 5.8, 1.5, sh(s, 0.2)); P.circle(g, x + 0.2, 5.6, 1, c.eye); P.rect(g, x - 0.3, 5.3, 1, 0.6, '#0a0a04'); }
      if (f) { P.line(g, 23.6, 9.8, 25.8, 10.2, 0.8, '#c85060'); P.circle(g, 25.8, 10.2, 0.7, '#e06070'); } // the tongue flicking
    } });

  /* ---------- Treant: a walking rotten stump, root legs, a hollow face carved by rot, moss and fungus ---------- */
  def('treant', { w: 28, h: 32, cy: 22, frames: 2,
    colors: { bark: '#4a3a24', moss: '#4a6a1a', eye: '#d0ff40', fungus: '#c8a060' },
    draw(g, f, c) {
      const b = c.bark, bd = sh(b, -0.5), w = f ? 1 : -1;
      P.ell(g, 14, 30.4, 9, 1.5, 'rgba(0,0,0,0.45)');
      // root legs spreading
      for (const [x0, x1, col] of [[10, 5 - w, bd], [13, 11 + w, b], [16, 19 - w, bd], [18, 23 + w, b]]) { g.beginPath(); g.moveTo(x0 - 1.4, 22); g.quadraticCurveTo(x0, 27, x1, 30); g.lineTo(x1 + 1.4, 30); g.quadraticCurveTo(x0 + 1.6, 26, x0 + 1.4, 22); g.closePath(); P.fill(g, col); }
      // the trunk: gnarled, ridged bark
      g.beginPath(); g.moveTo(8, 23); g.quadraticCurveTo(6, 14, 8.4, 6); g.lineTo(19.6, 6); g.quadraticCurveTo(22, 14, 20, 23); g.closePath();
      P.fill(g, P.lg(g, 7, 0, 21, 0, [bd, sh(b, 0.25), b, bd]));
      g.strokeStyle = sh(b, -0.6); g.lineWidth = 0.5; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(9 + i * 2.4, 7); g.quadraticCurveTo(8.4 + i * 2.6, 15, 9.4 + i * 2.2, 22); g.stroke(); }
      // a broken crown of splintered branches
      for (const [x, tx, ty] of [[9, 5, 0], [12, 11, -1.4], [16, 18, 0.4], [19, 23, 2.4]]) { P.line(g, x, 6.4, tx, ty + 1, 1.1, b); P.line(g, (x + tx) / 2, (6.4 + ty) / 2, (x + tx) / 2 + (tx > x ? 2 : -2), (6.4 + ty) / 2 - 1.4, 0.6, b); }
      // arms: two thick boughs ending in twig claws
      limb(g, 8, 11, 3, 17 + w, 1.6, 1, bd); claws(g, 2.8, 17.4 + w, -0.6, 4, 2, 0.35, bd);
      limb(g, 20, 11, 25, 17 - w, 1.6, 1, b); claws(g, 25.2, 17.4 - w, 0.6, 4, 2, 0.35, b);
      // the rotted face: hollow eyes, a gaping split mouth
      P.ell(g, 12, 11, 1.6, 1.2, '#0a0804'); P.ell(g, 16.6, 11, 1.6, 1.2, '#0a0804'); evil(g, 12.2, 11, 0.55, c.eye); evil(g, 16.8, 11, 0.55, c.eye);
      P.path(g, [11, 15, 18, 14.6, 16.6, 18.4, 14.4, 17.2, 12.6, 18.6]); P.fill(g, '#0a0804');
      // moss and fungus
      for (const [x, y, r] of [[9.4, 7.4, 1.6], [18.4, 19, 1.4], [10, 20.6, 1.2]]) P.ell(g, x, y, r, r * 0.6, c.moss);
      for (const [x, y] of [[19.4, 13], [20, 15.4], [8, 16]]) { P.ell(g, x, y, 1.3, 0.6, c.fungus); P.line(g, x, y, x - 0.6, y + 0.8, 0.4, '#e8e0c0'); }
    } });

  /* ---------- Blightfiend (boss): a hulking fly-demon, torn wings, a cluster of eyes, a belly of rot it vomits ---------- */
  def('blightfiend', { w: 54, h: 50, cy: 32, frames: 2,
    colors: { hide: '#4a4a22', belly: '#8a8a3a', wing: '#b8c890', eye: '#ff3a2a', bile: '#b0d040' },
    draw(g, f, c) {
      const hd = c.hide, w = f ? 1 : -1;
      P.ell(g, 27, 47.6, 16, 2.4, 'rgba(0,0,0,0.45)');
      // torn wings behind, buzzing
      g.save(); g.globalAlpha = 0.55;
      for (const s of [-1, 1]) { g.save(); g.translate(27, 18); g.scale(s, 1); g.rotate(f ? -0.5 : -0.2);
        g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(12, -14, 24, -12); g.lineTo(20, -8); g.lineTo(22, -3); g.lineTo(15, -2); g.lineTo(14, 2); g.closePath(); P.fill(g, c.wing);
        g.strokeStyle = sh(c.wing, -0.5); g.lineWidth = 0.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(22, -10); g.moveTo(4, -2); g.lineTo(18, -4); g.stroke(); g.restore(); }
      g.restore();
      // thick legs
      for (const [x, d] of [[19, -w], [33, w]]) { limb(g, x, 36, x + d - 2, 46, 3, 2.6, sh(hd, -0.3)); claws(g, x + d - 2, 46.6, 0, 3, 2, 0.6, '#1a1a0a'); }
      // a swollen belly, split and dripping
      P.ell(g, 27, 30, 13, 11, P.rg(g, 25, 26, 13, [[0, sh(c.belly, 0.3)], [0.6, c.belly], [1, sh(hd, -0.4)]]));
      P.ell(g, 28, 33, 5, 3, '#1a1a06'); P.glow(g, 28, 33, 6, c.bile, 0.6); P.ell(g, 28, 33.4, 3, 1.6, G.rgba(c.bile, 0.8));
      drips(g, [[26, 35.6, 4], [30, 35.4, 3], [21, 37, 2]], G.rgba(c.bile, 0.85));
      for (let i = 0; i < 4; i++) P.line(g, 17 + i * 2, 24 + i * 3, 19 + i * 2, 25 + i * 3, 0.5, sh(hd, -0.5));
      // shoulders and four arms, the lower pair small and clawing
      P.ell(g, 27, 18, 12, 6, P.vol(g, 27, 16, 12, hd));
      limb(g, 16, 18, 8, 28 + w, 2.4, 2, sh(hd, -0.2)); claws(g, 7.6, 28.6 + w, -1, 4, 2.4, 0.5, '#1a1a0a');
      limb(g, 38, 18, 46, 28 - w, 2.4, 2, hd); claws(g, 46.4, 28.6 - w, 1, 4, 2.4, 0.5, '#1a1a0a');
      limb(g, 19, 26, 14, 32, 1.2, 1, sh(hd, -0.3)); limb(g, 35, 26, 40, 32, 1.2, 1, sh(hd, -0.1));
      // the fly head: a cluster of red eyes, mandibles, a proboscis
      const hx = 27, hy = 11;
      P.ell(g, hx, hy, 6, 5, P.vol(g, hx, hy - 1, 6, sh(hd, 0.1)));
      for (const [x, y, r] of [[hx - 3, hy - 1, 2.2], [hx + 3, hy - 1, 2.2], [hx - 1.2, hy - 3.4, 1.3], [hx + 1.4, hy - 3.6, 1.2], [hx, hy + 0.4, 1]]) { P.circle(g, x, y, r, sh(c.eye, -0.4)); P.circle(g, x - r * 0.3, y - r * 0.3, r * 0.45, c.eye); }
      P.glow(g, hx, hy - 1, 7, c.eye, 0.35);
      horn(g, hx - 2, hy + 3, hx - 4, hy + 6, hx - 2, hy + 8, 0.8, '#1a1a0a'); horn(g, hx + 2, hy + 3, hx + 4, hy + 6, hx + 2, hy + 8, 0.8, '#1a1a0a');
      P.line(g, hx, hy + 3.4, hx + 0.4, hy + 9 + (f ? 1 : 0), 1, '#2a2a10');
    } });

  /* ---------- Bog Serpent (boss): a great moss-backed serpent reared up out of the mire, a hood of fins, acid dripping ---------- */
  def('bogserpent', { w: 56, h: 54, cy: 38, frames: 2,
    colors: { scale: '#3a5a2a', belly: '#b8b870', fin: '#8a3a2a', eye: '#ffe040', acid: '#b0ff40' },
    draw(g, f, c) {
      const sc = c.scale, w = f ? 1 : -1;
      P.ell(g, 28, 50, 22, 3.6, G.rgba('#2a3a10', 0.7));
      // coils lying in the mire
      for (const [x, y, rx] of [[16, 47, 11], [38, 48, 12]]) { P.ell(g, x, y, rx, 3.8, P.lg(g, 0, y - 4, 0, y + 4, [sh(sc, 0.3), sc, sh(sc, -0.5)])); for (let i = 0; i < 5; i++) P.circle(g, x - rx * 0.7 + i * rx * 0.35, y - 2, 0.7, sh(sc, 0.35)); }
      // the neck rising in an S
      g.beginPath(); g.moveTo(22, 47); g.bezierCurveTo(12, 38, 34, 30, 26, 18); g.lineTo(34, 18); g.bezierCurveTo(42, 30, 22, 38, 32, 47); g.closePath();
      P.fill(g, P.lg(g, 20, 0, 36, 0, [sh(sc, 0.3), sc, sh(sc, -0.5)]));
      g.strokeStyle = c.belly; g.lineWidth = 2.4; g.beginPath(); g.moveTo(29, 46); g.bezierCurveTo(21, 38, 38, 31, 31, 20); g.stroke();
      g.strokeStyle = sh(c.belly, -0.4); g.lineWidth = 0.4; for (let i = 0; i < 8; i++) { const y = 22 + i * 3; g.beginPath(); g.moveTo(28 + Math.sin(i) * 3, y); g.lineTo(32 + Math.sin(i) * 3, y + 0.6); g.stroke(); }
      // moss on the back
      for (const [x, y] of [[21, 40], [30, 30], [24, 24], [36, 44]]) P.ell(g, x, y, 1.8, 0.9, '#5a7a2a');
      // a hood of fins fanned behind the head
      g.save(); g.translate(30, 13 + w * 0.4);
      for (let k = -3; k <= 3; k++) { const a = -Math.PI / 2 + k * 0.32; P.path(g, [0, 0, Math.cos(a - 0.1) * 13, Math.sin(a - 0.1) * 11, Math.cos(a + 0.1) * 13, Math.sin(a + 0.1) * 11]); P.fill(g, P.lg(g, 0, 0, 0, -11, [sh(c.fin, -0.3), c.fin, sh(c.fin, 0.3)])); }
      g.restore();
      // the head, jaws open, fangs, acid dripping
      const hx = 32, hy = 15 + w * 0.4;
      P.ell(g, hx, hy, 6, 4, P.vol(g, hx, hy - 1, 6, sc));
      P.path(g, [hx + 1, hy + 1, hx + 10, hy + 0.4, hx + 8, hy + 4.4, hx + 2, hy + 4]); P.fill(g, '#140a06');
      horn(g, hx + 4, hy + 1, hx + 4.4, hy + 3, hx + 4.2, hy + 4.4, 0.5, '#f0ecd8'); horn(g, hx + 7, hy + 0.8, hx + 7.4, hy + 2.6, hx + 7.2, hy + 3.8, 0.5, '#f0ecd8');
      evil(g, hx + 2.4, hy - 1.6, 0.8, c.eye); evil(g, hx - 1, hy - 1.8, 0.6, c.eye);
      drips(g, [[hx + 5, hy + 4.4, 3], [hx + 8, hy + 4, 2]], c.acid); P.glow(g, hx + 6, hy + 3, 4, c.acid, 0.4);
    } });

  /* ---------- Elder Treant (boss): an ancient rotten oak walking on a mass of roots, a face in the bole, a crown of dead limbs ---------- */
  def('eldertreant', { w: 56, h: 64, cy: 44, frames: 2,
    colors: { bark: '#3e3020', moss: '#4a6a1a', eye: '#d0ff40', fungus: '#c89060' },
    draw(g, f, c) {
      const b = c.bark, bd = sh(b, -0.5), w = f ? 1.2 : -1.2;
      P.ell(g, 28, 61, 20, 2.8, 'rgba(0,0,0,0.5)');
      // a mass of roots
      for (let i = 0; i < 7; i++) { const x0 = 18 + i * 3.4, x1 = 6 + i * 7.4 + (i % 2 ? w : -w); g.beginPath(); g.moveTo(x0 - 2, 46); g.quadraticCurveTo(x0, 56, x1, 61); g.lineTo(x1 + 2.4, 61); g.quadraticCurveTo(x0 + 2.4, 55, x0 + 2, 46); g.closePath(); P.fill(g, i % 2 ? bd : b); }
      // the great bole
      g.beginPath(); g.moveTo(15, 48); g.quadraticCurveTo(11, 30, 16, 14); g.lineTo(40, 14); g.quadraticCurveTo(45, 30, 41, 48); g.closePath();
      P.fill(g, P.lg(g, 13, 0, 43, 0, [bd, sh(b, 0.3), b, bd]));
      g.strokeStyle = sh(b, -0.65); g.lineWidth = 0.7; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(17 + i * 3.6, 15); g.quadraticCurveTo(16 + i * 3.8, 30, 17 + i * 3.4, 47); g.stroke(); }
      // the crown: dead limbs twisting up, a few dead leaves
      for (const [x, tx, ty, k] of [[18, 8, 2, 1], [23, 18, -2, 1], [30, 32, -3, 0], [36, 44, 0, 1], [40, 52, 8, 0]]) {
        P.line(g, x, 15, tx, ty + 2, 2.2, b); P.line(g, (x + tx) / 2, (15 + ty) / 2, (x + tx) / 2 + (tx > x ? 4 : -4), (15 + ty) / 2 - 3, 1.2, b);
        if (k) P.ell(g, tx, ty + 2, 2.4, 1.4, '#4a4a1a');
      }
      // arms: huge boughs, twig claws
      limb(g, 15, 22, 5, 36 + w, 3, 2, bd); claws(g, 4.6, 36.6 + w, -1, 5, 3, 0.6, bd);
      limb(g, 41, 22, 51, 36 - w, 3, 2, b); claws(g, 51.4, 36.6 - w, 1, 5, 3, 0.6, b);
      // the face in the bole: deep eye hollows, a jagged maw, sap dripping
      P.ell(g, 23, 24, 3, 2.2, '#0a0804'); P.ell(g, 33, 24, 3, 2.2, '#0a0804'); evil(g, 23.4, 24, 1, c.eye); evil(g, 33.4, 24, 1, c.eye);
      P.glow(g, 28, 24, 10, c.eye, 0.3);
      P.path(g, [20, 32, 36, 31.4, 34, 40, 31, 37, 28, 41, 25, 37, 22, 40]); P.fill(g, '#0a0804');
      drips(g, [[26, 40, 3], [31, 39, 2.4]], '#c8a040');
      // moss and fungus shelves
      for (const [x, y, r] of [[18, 17, 2.6], [39, 42, 2.4], [16, 40, 2], [36, 16, 2]]) P.ell(g, x, y, r, r * 0.6, c.moss);
      for (const [x, y] of [[40, 28], [41, 32], [15, 30]]) { P.ell(g, x, y, 2.2, 0.9, c.fungus); P.line(g, x - 1.6, y + 0.5, x + 1.6, y + 0.5, 0.4, sh(c.fungus, -0.4)); }
    } });

  /* ---------- Lord of Rot (Lord): a vast bloated plague-lord in a rotting mantle, a crown of antlers, a swinging censer of blight ---------- */
  def('rotlord', { w: 60, h: 64, cy: 42, frames: 2,
    colors: { flesh: '#7a8a4a', mantle: '#3a3018', gold: '#8a7a3a', gas: '#b0d040', eye: '#e0ff50' },
    draw(g, f, c) {
      const fl = c.flesh, w = f ? 1.4 : -1.4;
      P.ell(g, 30, 61, 20, 3, 'rgba(0,0,0,0.5)'); P.glow(g, 30, 44, 26, c.gas, 0.18);
      // the mantle, rotted to tatters
      g.beginPath(); g.moveTo(19, 19); g.quadraticCurveTo(30, 16, 41, 19); g.quadraticCurveTo(55, 36, 51, 59); g.lineTo(9, 59); g.quadraticCurveTo(5, 36, 19, 19); g.closePath();
      P.fill(g, P.lg(g, 8, 20, 52, 59, [sh(c.mantle, 0.3), c.mantle, sh(c.mantle, -0.55)])); rag(g, 10, 58.6, 50, 58.6, 11, 3, sh(c.mantle, -0.5));
      P.line(g, 14, 22, 12, 56, 1, c.gold); P.line(g, 46, 22, 48, 56, 1, c.gold);
      // the vast belly, pustules and a weeping wound
      P.ell(g, 30, 38, 14, 13, P.rg(g, 27, 33, 15, [[0, sh(fl, 0.35)], [0.6, fl], [1, sh(fl, -0.5)]]));
      for (const [x, y, r] of [[23, 33, 1.6], [35, 36, 1.3], [28, 44, 1.8], [37, 42, 1]]) { P.circle(g, x, y, r, sh(c.gas, -0.1)); P.circle(g, x - r * 0.3, y - r * 0.3, r * 0.4, sh(c.gas, 0.4)); }
      P.ell(g, 30, 39, 3.4, 5, '#1a1a06'); P.glow(g, 30, 39, 5, c.gas, 0.6); drips(g, [[29, 44, 4], [31.6, 43.4, 3]], G.rgba(c.gas, 0.85));
      // arms: a crooked staff hung with a censer of blight, the other a bloated hand
      limb(g, 15, 24, 8, 36, 2.6, 2.2, sh(fl, -0.3)); claws(g, 7.6, 36.6, -1, 4, 2.4, 0.5, sh(fl, -0.4));
      limb(g, 45, 24, 50, 32, 2.6, 2.2, fl);
      P.line(g, 49, 58, 53, 10, 1.4, '#2a2010'); P.line(g, 53, 12, 47 + w * 2, 20, 0.5, '#6a6a5a');
      P.circle(g, 47 + w * 2, 22, 3, P.vol(g, 47 + w * 2, 21, 3, c.gold)); P.glow(g, 47 + w * 2, 23, 7, c.gas, 0.6);
      g.save(); g.globalAlpha = 0.5; for (let i = 0; i < 3; i++) P.circle(g, 46 + w * 2 - i * 1.5, 26 + i * 2.4, 1.6 + i * 0.6, c.gas); g.restore();
      // the head sunk in fat, a crown of antlers, glowing eyes, a slack maw
      const hx = 30, hy = 15;
      P.ell(g, hx, hy, 7, 6, P.vol(g, hx, hy - 1, 7, sh(fl, 0.1)));
      P.rect(g, hx - 6, hy - 6, 12, 2, c.gold); for (let i = 0; i < 4; i++) P.path(g, [hx - 5.4 + i * 3.4, hy - 6, hx - 4 + i * 3.4, hy - 9, hx - 2.6 + i * 3.4, hy - 6]); P.fill(g, c.gold);
      for (const s of [-1, 1]) { horn(g, hx + s * 5, hy - 5, hx + s * 11, hy - 10, hx + s * 12, hy - 17, 1, '#c8b890'); horn(g, hx + s * 9, hy - 10, hx + s * 14, hy - 11, hx + s * 16, hy - 14, 0.6, '#c8b890'); }
      evil(g, hx - 2.4, hy - 0.6, 0.8, c.eye); evil(g, hx + 2.6, hy - 0.6, 0.8, c.eye);
      P.ell(g, hx, hy + 3, 3, 1.6, '#140a04'); teeth(g, hx - 2.4, hy + 2.4, hx + 2.4, hy + 2.4, 5, 0.6, 1, '#c8c090');
    } });

  /* ---------- Blight Worm (secret boss): a vast segmented worm bursting up from the bog, a ring-mouth of hooked teeth ---------- */
  def('blightworm', { w: 48, h: 50, cy: 38, frames: 2,
    colors: { skin: '#8a6a5a', plate: '#4a3a2a', maw: '#3a0a10', eye: '#e0ff50' },
    draw(g, f, c) {
      const s = c.skin, w = f ? 1 : -1;
      P.ell(g, 24, 46, 17, 3.4, G.rgba('#2a3a10', 0.8)); // the churned mire it bursts from
      for (let i = 0; i < 7; i++) P.circle(g, 8 + i * 5.4, 45 + (i % 2), 1.2, '#3a4a1a');
      // the body rising in a curve, ringed segments with armoured plates
      for (let i = 0; i < 8; i++) {
        const t = i / 7, x = 24 + Math.sin(t * 2.4 + w * 0.1) * 5 * (1 - t), y = 44 - t * 30, r = 8 - t * 1.6;
        P.ell(g, x, y, r, r * 0.62, P.lg(g, x - r, 0, x + r, 0, [sh(s, -0.4), sh(s, 0.25), s, sh(s, -0.5)]));
        P.ell(g, x, y - r * 0.3, r * 0.9, r * 0.36, P.lg(g, 0, y - r, 0, y, [sh(c.plate, 0.3), c.plate]));
      }
      // the head: an open ring maw with rows of hooked teeth, a crown of eyes
      const hx = 24 + Math.sin(2.4) * 0, hy = 11;
      P.ell(g, hx, hy, 9, 6.4, P.vol(g, hx, hy - 1, 9, s));
      P.ell(g, hx, hy + 0.6, 6.4, 4.2, c.maw); P.ell(g, hx, hy + 0.8, 3.4, 2.2, '#0a0204');
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, x0 = hx + Math.cos(a) * 6.2, y0 = hy + 0.6 + Math.sin(a) * 4, x1 = hx + Math.cos(a) * 4.2, y1 = hy + 0.6 + Math.sin(a) * 2.6; horn(g, x0, y0, (x0 + x1) / 2, (y0 + y1) / 2, x1, y1, 0.45, '#efe8d0'); }
      for (let k = 0; k < 5; k++) { const a = Math.PI * (1.15 + k * 0.175); P.circle(g, hx + Math.cos(a) * 8.4, hy + Math.sin(a) * 5.8, 0.9, '#1a1a06'); evil(g, hx + Math.cos(a) * 8.4, hy + Math.sin(a) * 5.8, 0.5, c.eye); }
      drips(g, [[hx - 3, hy + 4.4, 3], [hx + 2.6, hy + 4.4, 2.4]], '#b0d040');
    } });
})(window.DH);
