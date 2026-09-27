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
})(window.DH);
