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

  /* ---------- Grave Chieftain (boss): a hulking corpse-giant with a bare skull for a head, a tombstone hammer on its shoulder ---------- */
  def('gravechief', { w: 52, h: 50, cy: 30, frames: 2,
    colors: { skin: '#8e6c68', rag: '#3a2e26', eye: '#ff5a2a', stone: '#9a9aa4' },
    draw(g, f, c) {
      // three masses: a huge hunched ribcage, a small pelvis, a skull slung low and forward; rot has opened the belly to the ribs
      const s = c.skin, sl = sh(s, 0.3), sd = sh(s, -0.45), bone = '#dccfae', bd = sh(bone, -0.4), w = f ? 1 : -1;
      P.ell(g, 26, 47, 17, 2.6, 'rgba(0,0,0,0.45)');
      // far leg
      limb(g, 20, 31, 16.6 - w, 38.6, 3.6, 2.8, sd); limb(g, 16.6 - w, 38.6, 17.4 - w, 44.6, 2.8, 2.2, sd);
      P.path(g, [14.4 - w, 46.4, 15.4 - w, 43.6, 19.4 - w, 43.8, 21.4 - w, 46.4]); P.fill(g, sh(sd, -0.4));
      // far arm, hanging to the knee with a grave lantern
      limb(g, 15, 15, 10.6, 23, 3.2, 2.4, sh(s, -0.3)); limb(g, 10.6, 23, 10, 29.6, 2.4, 1.9, sh(s, -0.3)); claws(g, 10, 30, 1.7, 3, 2, 0.55, bd);
      P.line(g, 10.2, 30.4, 10.2, 33, 0.35, '#1a1410'); P.path(g, [8.4, 33.4, 12, 33.4, 11.4, 32.4, 9, 32.4]); P.fill(g, '#2a2420');
      P.rrect(g, 8.2, 33.2, 4, 5.2, 0.8, '#2a2018'); P.glow(g, 10.2, 35.8, 6, c.eye, 0.6); P.rrect(g, 9, 34, 2.4, 3.6, 0.5, sh(c.eye, 0.35));
      P.line(g, 10.2, 34, 10.2, 37.6, 0.3, '#2a2018'); P.rect(g, 8, 38.2, 4.4, 0.8, '#1a1410');
      // the torso: a hump over the shoulders, the chest thrust forward, the waist narrowing into the belt
      g.beginPath(); g.moveTo(18.4, 31); g.quadraticCurveTo(12.4, 25, 12, 17.6); g.quadraticCurveTo(12.4, 9.6, 20, 8.4); g.quadraticCurveTo(29, 7.4, 35.4, 12.4);
      g.quadraticCurveTo(39, 16.6, 36.4, 21.6); g.quadraticCurveTo(33.4, 26, 31.6, 31); g.closePath();
      P.fill(g, P.lg(g, 14, 8, 34, 31, [sl, s, sd]));
      // the shoulder blade and the sagging chest, the belly hanging over the belt
      g.strokeStyle = sd; g.lineWidth = 0.6; g.beginPath(); g.moveTo(14.4, 13); g.quadraticCurveTo(19, 15.6, 18.6, 21.6); g.stroke();
      g.beginPath(); g.moveTo(26, 15.6); g.quadraticCurveTo(31, 19.6, 35.6, 17.4); g.stroke();
      P.path(g, [20, 26.6, 31.4, 26, 31, 29.8, 20.4, 30]); P.fill(g, sh(s, -0.25));
      g.save(); g.globalAlpha = 0.6; g.strokeStyle = '#2a1414'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(15.6, 22); g.lineTo(19.6, 25.4); g.stroke();
      for (let i = 0; i < 4; i++) P.line(g, 16.2 + i * 1, 23.4 + i * 0.8, 17.2 + i * 1, 22.2 + i * 0.8, 0.3, '#2a1414'); g.restore(); // a stitched gash
      // rotting stripes and bruises
      g.save(); g.globalAlpha = 0.5; [[15, 18, 1.8, 1], [22, 11.6, 1.4, 0.8], [33, 22, 1.2, 0.8]].forEach(([x, y, a, b]) => P.ell(g, x, y, a, b, '#4a5a3a')); g.restore();
      // the torn belly: a dark wound with the ribs showing through
      g.beginPath(); g.moveTo(21.4, 20.4); g.quadraticCurveTo(26.4, 18.2, 31, 21.4); g.quadraticCurveTo(29.6, 27.6, 24.6, 28.2); g.quadraticCurveTo(20.6, 26, 21.4, 20.4); g.closePath(); P.fill(g, '#1e0c0c');
      g.strokeStyle = '#4a1814'; g.lineWidth = 0.5; g.stroke();
      for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(22.2 + i * 0.4, 21.4 + i * 1.6); g.quadraticCurveTo(26.4, 20 + i * 1.7, 30 - i * 0.4, 22 + i * 1.4); g.strokeStyle = i % 2 ? bd : bone; g.lineWidth = 0.9; g.stroke(); }
      P.line(g, 24.2, 20.6, 24.8, 28, 1, bd); // the spine behind them
      // belt of rope, a ragged loincloth, a spade hanging from it
      P.path(g, [17, 29.6, 33, 29.6, 34, 36.6, 30, 34.4, 26.4, 38, 22.6, 34.4, 18.4, 37]); P.fill(g, P.lg(g, 17, 29, 34, 38, [sh(c.rag, 0.25), sh(c.rag, -0.5)]));
      P.line(g, 16.6, 30, 33.8, 30, 1.6, '#2a1c14'); P.line(g, 16.6, 29.6, 33.8, 29.6, 0.4, '#5a4632');
      [19, 23.6, 28.2].forEach((x, i) => { P.line(g, x, 30.4, x + 0.4, 32.8 + (i % 2), 0.4, '#2a1c14'); P.circle(g, x + 0.4, 33.2 + (i % 2), 0.9, P.vol(g, x + 0.2, 33 + (i % 2), 0.9, bone)); }); // bones strung on the belt
      // near leg
      limb(g, 29.4, 31, 32.6 + w, 38.4, 3.6, 2.8, s); limb(g, 32.6 + w, 38.4, 32.4 + w, 44.6, 2.8, 2.2, s);
      P.circle(g, 32.6 + w, 38.4, 2.6, P.vol(g, 32, 37.6, 2.6, s));
      P.path(g, [30 + w, 46.4, 30.8 + w, 43.6, 35 + w, 43.8, 37.6 + w, 46.4]); P.fill(g, sh(s, -0.55));
      // near arm hoisting the tombstone hammer onto the shoulder
      limb(g, 33, 14.6, 40.4, 20.6, 3.2, 2.4, s); limb(g, 40.4, 20.6, 41.2, 12.6, 2.4, 2, sl);
      P.line(g, 37.2 + w * 0.3, 30, 42.4, 2.6, 1.8, P.lg(g, 37, 0, 43, 0, ['#5a4030', '#241810']));
      g.save(); g.translate(43.4, 3.2); g.rotate(0.22);
      // a gravestone: an arched top, a flat foot, a cross cut into it, moss at its base
      g.beginPath(); g.moveTo(-6, 4.6); g.lineTo(-6, -1.6); g.quadraticCurveTo(-6, -6.4, 0, -6.4); g.quadraticCurveTo(6, -6.4, 6, -1.6); g.lineTo(6, 4.6); g.closePath();
      P.fill(g, P.lg(g, -6, -6, 6, 5, [sh(c.stone, 0.35), c.stone, sh(c.stone, -0.5)]));
      P.rect(g, -6.6, 4, 13.2, 1.8, sh(c.stone, -0.35));
      P.line(g, 0, -4.4, 0, 2.6, 1, '#3a3a44'); P.line(g, -2.2, -2.4, 2.2, -2.4, 1, '#3a3a44');
      P.line(g, 0.4, -4.4, 0.4, 2.6, 0.3, sh(c.stone, 0.45));
      g.strokeStyle = '#4a4a54'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(3.6, -5.4); g.lineTo(2.6, -2.6); g.lineTo(3.8, 0); g.stroke();
      P.ell(g, -3.4, 3.8, 2.4, 1, '#4a6a34'); P.ell(g, 3.6, 4, 1.6, 0.8, '#3a5a2a');
      g.restore();
      // the head: a bare skull slung forward below the shoulders, a jaw hanging with two tusks, a crown of three grave-nails
      const hx = 34.6, hy = 10.8;
      P.path(g, [29.4, 10, 32.4, 8, 34.4, 14.6, 31, 15.6]); P.fill(g, sd); // the neck
      P.circle(g, hx, hy, 5.4, P.vol(g, hx - 1, hy - 1.4, 4.4, bone));
      P.path(g, [hx - 0.4, hy + 2.4, hx + 4.8, hy + 1.4, hx + 4.4, hy + 5.4 + (f ? 0.4 : 0), hx + 0.4, hy + 5.6]); P.fill(g, P.lg(g, hx, hy + 2, hx, hy + 6, [bone, bd])); // the jaw
      P.rect(g, hx + 0.6, hy + 2.6, 3.8, 1.2 + (f ? 0.4 : 0), '#140404');
      teeth(g, hx + 0.8, hy + 2.6, hx + 4.4, hy + 2.4, 4, 0.7, 1, bone);
      P.path(g, [hx + 1, hy + 4, hx + 1.4, hy + 1.2, hx + 2, hy + 4]); P.fill(g, '#f2ead0'); P.path(g, [hx + 3.4, hy + 3.8, hx + 3.9, hy + 1, hx + 4.4, hy + 3.6]); P.fill(g, '#f2ead0'); // tusks
      P.path(g, [hx - 0.6, hy - 1.6, hx + 3.6, hy - 1.4, hx + 3.2, hy - 0.4, hx - 0.2, hy - 0.4]); P.fill(g, sh(bone, -0.55)); // the brow ridge
      P.ell(g, hx + 2, hy + 0.4, 1.3, 1.1, VOID, -0.2); P.ell(g, hx - 1, hy + 0.4, 0.9, 1, VOID, 0.3);
      evil(g, hx + 2, hy + 0.4, 0.7, c.eye); evil(g, hx - 0.9, hy + 0.5, 0.5, c.eye);
      P.path(g, [hx + 3.6, hy + 1.2, hx + 4.4, hy + 1.4, hx + 4, hy + 2.2]); P.fill(g, VOID); // the nose hole
      g.strokeStyle = bd; g.lineWidth = 0.35; g.beginPath(); g.moveTo(hx - 2.4, hy - 3); g.lineTo(hx - 1, hy - 1.8); g.lineTo(hx - 1.6, hy - 0.8); g.stroke(); // a crack
      // a crude iron crown: a band round the crown of the skull and three hammered prongs
      P.path(g, [hx - 4.8, hy - 2.4, hx + 3.2, hy - 4.4, hx + 3.6, hy - 2.8, hx - 4.4, hy - 0.8]); P.fill(g, P.lg(g, hx, hy - 4.4, hx, hy - 1, ['#5a5662', '#1e1a24']));
      [[hx - 3.6, hy - 1.8, 0], [hx - 0.6, hy - 2.6, 0.15], [hx + 2.4, hy - 3.4, 0.3]].forEach(([x, y, a], i) => { P.path(g, [x - 1, y, x + Math.sin(a) * 3.2 + (i === 1 ? 0 : 0), y - 3.4 - (i === 1 ? 0.8 : 0), x + 1, y - 0.4]); P.fill(g, P.lg(g, x, y - 4, x, y, ['#6a6672', '#26222c'])); });
      P.circle(g, hx - 0.6, hy - 2.2, 0.55, c.eye); // one ember set in the band
      // stitches across the flesh of the skull's cheek, where skin still clings
      P.path(g, [hx - 5, hy + 0.4, hx - 3.2, hy + 1.2, hx - 2.4, hy + 4.4, hx - 4.6, hy + 3.2]); P.fill(g, sh(s, 0.05));
      claws(g, 41.4, 12, -1.4, 4, 2, 0.5, bd);
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

  /* ---------- Charred Husk: a burnt corpse still smouldering, lurching forward with both arms reaching,
   *            fire in the cracks of its skin, flames licking off its head and shoulder ---------- */
  def('husk', { w: 20, h: 24, cy: 14, frames: 2,
    colors: { skin: '#241a18', ember: '#ff7a20', eye: '#ffd040' },
    draw(g, f, c) {
      const s = sh(c.skin, 0.32), sl = sh(c.skin, 0.62), sd = sh(c.skin, 0.05), w = f ? 0.9 : -0.9, nail = '#8a6a5a';
      P.ell(g, 10, 22.6, 5.4, 1, 'rgba(0,0,0,0.45)');
      // legs: thigh, knee, shin, a foot with a heel and a toe
      const leg = (hx, kx, ax, col) => { limb(g, hx, 14, kx, 17.8, 1.4, 1, col); limb(g, kx, 17.8, ax, 21.4, 1, 0.8, col); P.path(g, [ax - 1, 21, ax + 0.6, 21, ax + 2.2, 22.1, ax + 2, 22.6, ax - 1.1, 22.6]); P.fill(g, col); };
      leg(8.4, 7 - w * 0.5, 7 - w, sd);
      // the far arm, reaching high
      limb(g, 10.2, 8.6, 13.4, 9.6, 1, 0.8, sd); limb(g, 13.4, 9.6, 16.8, 8.6, 0.8, 0.6, sd); claws(g, 17, 8.5, -0.1, 3, 1.6, 0.32, nail);
      // the torso, leaning into the lurch: ribcage over a shrunken belly, cracks glowing along the ribs
      g.beginPath(); g.moveTo(7.6, 14.6); g.quadraticCurveTo(6.4, 10.6, 8.4, 7.4); g.quadraticCurveTo(11, 5.6, 13.6, 7.6); g.quadraticCurveTo(14, 10.4, 12, 12); g.quadraticCurveTo(11, 13.4, 11.2, 14.8); g.closePath();
      P.fill(g, P.lg(g, 7, 6, 13, 15, [sl, s, sd]));
      P.glow(g, 10.4, 10, 3.6, c.ember, 0.45);
      g.strokeStyle = c.ember; g.lineWidth = 0.4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(8.6, 8.6 + i * 1.4); g.quadraticCurveTo(10.8, 8 + i * 1.5, 12.8, 9 + i * 1.3); g.stroke(); }
      P.line(g, 9.6, 12.6, 10.4, 14.2, 0.35, c.ember);
      leg(10.6, 12.4 + w * 0.5, 11.6 + w, s);
      P.line(g, 11.4 + w * 0.3, 16, 12.2 + w * 0.5, 18.4, 0.35, c.ember); P.line(g, 12 + w * 0.8, 19, 11.8 + w, 20.8, 0.3, c.ember); // cracks down the shin
      // the head thrust forward: a blackened skull, the jaw hanging on a burning mouth, a flame for hair
      const hx = 14.2, hy = 5.4;
      // smoke rising off the scorched scalp
      P.glow(g, hx - 0.8, hy - 2, 2.2, c.ember, 0.5); P.circle(g, hx - 1.2, hy - 3.4 - (f ? 0.8 : 0), 0.35, c.ember); P.circle(g, hx - 0.2, hy - 4.6 - (f ? 0.4 : 1), 0.3, '#ffd040'); // embers rising
      P.ell(g, hx, hy, 2.1, 2.5, P.vol(g, hx - 0.6, hy - 0.8, 2.5, s), 0.3); P.path(g, [hx - 1, hy - 1.8, hx + 2.4, hy - 0.8, hx + 2.2, hy + 0.2, hx - 0.4, hy - 0.6]); P.fill(g, sh(s, -0.35)); // a gaunt skull, a heavy brow
      P.path(g, [hx - 0.2, hy + 1.2, hx + 2.6, hy + 0.8, hx + 2.2, hy + 3 + (f ? 0.3 : 0), hx, hy + 2.8]); P.fill(g, '#140402'); teeth(g, hx + 0.2, hy + 1.2, hx + 2.5, hy + 0.9, 3, 0.5, 1, '#c8b8a0');
      P.path(g, [hx - 0.2, hy + 1.2, hx + 0.1, hy + 1.3, hx, hy + 1.4]); P.fill(g, '#140402'); P.glow(g, hx + 1.2, hy + 1.8, 1.8, c.ember, 0.8);
      P.ell(g, hx + 1.1, hy - 0.2, 0.8, 0.7, VOID); evil(g, hx + 1.1, hy - 0.2, 0.45, c.eye); evil(g, hx - 0.8, hy - 0.1, 0.35, c.eye);
      // the near arm, reaching lower, embers dripping from the fingers
      limb(g, 12.2, 8.6, 14.8, 11.2, 1.1, 0.9, s); limb(g, 14.8, 11.2, 17.6, 10.6, 0.9, 0.7, s); claws(g, 17.8, 10.6, 0.1, 3, 1.8, 0.38, '#c8b0a0');
      P.circle(g, 17, 12 + (f ? 1.2 : 0), 0.4, c.ember);
    } });

  /* ---------- Cinder Bloater: a waddling thing swollen with embers, fire showing through its split belly,
   *            a small head with a gaping mouth, stubby arms hugging the gut, about to burst ---------- */
  def('cinderbloat', { w: 26, h: 26, cy: 21, frames: 2,
    colors: { hide: '#3a1810', core: '#ffb040', eye: '#fff0a0' },
    draw(g, f, c) {
      const hd = c.hide, lit = sh(hd, 0.5), dk = sh(hd, -0.55), w = f ? 1 : -1, sw = f ? 0.4 : -0.4;
      P.ell(g, 12, 23.6, 9, 1.2, 'rgba(0,0,0,0.45)');
      // short bowed legs with flat feet, waddling
      for (const [x, d, col] of [[7.6, -w, dk], [16.4, w, hd]]) { limb(g, x, 17.6, x - 0.8 + d * 0.6, 20.4, 1.9, 1.5, col); limb(g, x - 0.8 + d * 0.6, 20.4, x + d * 0.6, 22.6, 1.5, 1.2, col); P.ell(g, x + 0.6 + d * 0.6, 23.1, 2, 0.9, sh(col, -0.2)); }
      // the swollen gut: a heavy sack sagging low, lit top-left
      g.beginPath(); g.moveTo(12, 5.8); g.bezierCurveTo(19.6, 5.8, 21.6, 12, 20.6, 16); g.bezierCurveTo(19.6, 19.8, 15.6, 20.4, 12, 20.4);
      g.bezierCurveTo(8, 20.4, 3.6, 19.6, 3.2, 15.4); g.bezierCurveTo(2.8, 10.8, 5, 5.8, 12, 5.8); g.closePath();
      P.fill(g, P.rg(g, 11, 12.4, 10, [[0, lit], [0.55, hd], [1, dk]], 8.6, 9));
      // the split belly: a glowing core and cracks running out from it
      P.glow(g, 12.6, 14.4, 7, c.core, 0.55);
      P.ell(g, 12.6, 14.6, 2.6 + sw * 0.4, 3.2, P.rg(g, 12.6, 14.4, 3.2, [[0, '#fff6c8'], [0.5, c.core], [1, '#a02808']]));
      g.strokeStyle = c.core; g.lineWidth = 0.5;
      for (const [x1, y1, x2, y2, x3, y3] of [[11, 12, 8.6, 10, 7.6, 7.6], [14.4, 12.4, 16.8, 10.2, 18.4, 9.6], [10.6, 16.6, 7.6, 17.4, 5.4, 16.2], [14.8, 17, 17, 18.2, 18.6, 17.4], [12.4, 11.6, 12.2, 9.4, 13, 7.6]]) {
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x3, y3); g.stroke();
      }
      // stubby arms hugging the gut
      limb(g, 4.6, 10.4, 1.8, 13.2, 1.4, 1.1, dk); limb(g, 1.8, 13.2, 1.6, 16.2, 1.1, 0.9, dk); claws(g, 1.6, 16.6, 1.4, 3, 1.3, 0.4, '#1a0806');   // stubby arms held out from the gut
      limb(g, 19.4, 10.2, 22.4, 12.6, 1.4, 1.1, hd); limb(g, 22.4, 12.6, 23.4, 15.4, 1.1, 0.9, hd); claws(g, 23.6, 15.8, 1.2, 3, 1.3, 0.4, '#1a0806');
      // a small head sunk into the shoulders, pushed forward: glowing eyes, a gaping mouth with fire inside
      const hx = 13.8, hy = 4.8;
      P.circle(g, hx, hy, 4, P.vol(g, hx, hy, 4, sh(hd, 0.3)));
      P.ell(g, hx + 1.3, hy + 1.6, 2, 1.5 + (f ? 0.3 : 0), '#1a0604'); P.ell(g, hx + 1.4, hy + 2, 1.1, 0.7 + (f ? 0.2 : 0), c.core); P.glow(g, hx + 1.4, hy + 2, 2.6, c.core, 0.9);
      teeth(g, hx - 0.2, hy + 0.6, hx + 2.6, hy + 0.6, 4, 0.5, 1, '#e8d8b8');
      evil(g, hx + 1.6, hy - 1.4, 0.55, c.eye, -0.1); evil(g, hx - 0.8, hy - 1.5, 0.45, c.eye, 0.2);
      // smoke and flame venting from the back
      for (const [x, y, h] of [[5.6, 8, 2.4], [8.4, 6.2, 3], [3.6, 11.2, 1.8]]) { P.circle(g, x, y + 0.4, 0.8, '#140604'); P.flame(g, x, y, h + (f ? 0.8 : 0), -0.4, 0.9); }
    } });

  /* ---------- Magma Crawler: an armoured lava grub rearing its front up off the ground, rock plates over a molten body,
   *            a heavy head with two great mandibles and burning eyes, short clawed legs underneath ---------- */
  def('magmacrawler', { w: 32, h: 20, cy: 15, frames: 2,
    colors: { rock: '#2e2624', lava: '#ff6a18', eye: '#ffe060' },
    draw(g, f, c) {
      const r = sh(c.rock, 0.3), rl = sh(c.rock, 0.8), rd = sh(c.rock, -0.3), L = c.lava, w = f ? 1 : -1, bob = f ? 0.3 : 0, G0 = 18.6;
      P.ell(g, 15, G0, 13, 1.2, 'rgba(0,0,0,0.45)');
      // segments, tail to front: x, top, radius; the front ones rear up
      const seg = [[3.4, 14.2, 1.7], [6.8, 12.8, 2.3], [10.6, 11.6, 2.8], [14.6, 10.8 + bob, 3.1], [18.6, 9.6 + bob, 3.2], [22.2, 7.6, 3]];
      const legAt = (x, y, o, col, lit) => { limb(g, x, y, x + 1.6 + o, y + 1.4, 0.8, 0.55, lit); limb(g, x + 1.6 + o, y + 1.4, x + 1 + o, G0, 0.55, 0.35, col); claws(g, x + 1 + o, G0 + 0.1, 0.4, 2, 0.7, 0.22, rl); };
      seg.slice(1, 5).forEach(([x, y, rr], i) => legAt(x - 1.4, y + rr * 1.5, (i % 2 ? w : -w) * 0.6, rd, rd)); // far legs
      // the molten underbelly
      P.glow(g, 14, 15, 11, L, 0.3);
      g.beginPath(); g.moveTo(2, 16.6); g.quadraticCurveTo(12, 17.6, 24.6, 13.4); g.lineTo(24, 11.6); g.quadraticCurveTo(13, 15.4, 2.4, 15); g.closePath(); P.fill(g, P.lg(g, 0, 12, 0, 17.6, [sh(L, 0.5), L, sh(L, -0.4)]));
      // the plates: lit on top, a seam of lava between them
      seg.forEach(([x, y, rr], i) => {
        const cy2 = y + rr * 0.8;
        P.ell(g, x, cy2, rr * 0.95, rr * 0.85, P.vol(g, x - rr * 0.35, cy2 - rr * 0.5, rr * 1.1, r));
        g.beginPath(); g.ellipse(x, cy2, rr * 0.95, rr * 0.85, 0, Math.PI * 1.05, Math.PI * 1.55); g.strokeStyle = rl; g.lineWidth = 0.45; g.stroke();
        if (i) { g.beginPath(); g.ellipse(x, cy2, rr * 0.95, rr * 0.85, 0, Math.PI * 0.62, Math.PI * 1.25); g.strokeStyle = L; g.lineWidth = 0.55; g.stroke(); }
      });
      seg.slice(1, 5).forEach(([x, y, rr], i) => legAt(x + 0.2, y + rr * 1.55, (i % 2 ? -w : w) * 0.6, r, rl)); // near legs
      // the head, reared up: a heavy brow, two burning eyes, great mandibles hooking forward round a molten mouth
      const hx = 26.2, hy = 7.4;
      P.circle(g, hx, hy, 3.3, P.vol(g, hx - 1, hy - 1.3, 3.5, r));
      P.path(g, [hx - 1.8, hy - 2.6, hx + 3, hy - 1.8, hx + 2.6, hy - 0.7, hx - 1.2, hy - 1.2]); P.fill(g, rd);
      P.ell(g, hx + 1.4, hy - 0.2, 0.9, 0.75, VOID); evil(g, hx + 1.4, hy - 0.2, 0.7, c.eye); evil(g, hx - 0.6, hy - 0.3, 0.5, c.eye);
      P.glow(g, hx + 2.8, hy + 2.2, 2.8, L, 0.85); P.ell(g, hx + 2.6, hy + 2.2, 1.2, 0.9, '#ffd040');
      horn(g, hx + 1.4, hy + 0.6, hx + 5.2, hy - 1.8, hx + 5.4, hy + 2.2, 0.9, '#c8bab4'); horn(g, hx + 0.8, hy + 2.8, hx + 4.4, hy + 5.6, hx + 5.2, hy + 3, 0.8, '#9a8e8a');
      // a molten drip trailing behind the tail
      P.circle(g, 1.2 - (f ? 0.4 : 0), 16.4, 0.7, sh(L, 0.3)); P.glow(g, 1.2, 16.4, 1.8, L, 0.6);
    } });

  /* ---------- Ash Cultist: a fire-priest in an ash-grey robe charred at the hem, a deep cowl over a burnt face,
   *            swinging a censer of burning coals on a chain (what it lobs), a flame cupped in the other hand ---------- */
  def('ashcultist', { w: 22, h: 26, cy: 16, frames: 2,
    colors: { robe: '#4a4240', trim: '#8a2a14', ember: '#ff7a20', eye: '#ffd040' },
    draw(g, f, c) {
      const r = c.robe, rl = sh(r, 0.4), rd = sh(r, -0.45), sway = f ? 0.5 : -0.5, sw = f ? 1.2 : -0.6, iron = '#3a3234';
      P.ell(g, 10.6, 23.8, 6, 1, 'rgba(0,0,0,0.45)');
      // the robe, falling from narrow shoulders to a wide hem that is burnt and glowing
      g.beginPath(); g.moveTo(7.6, 10); g.lineTo(13.2, 10); g.quadraticCurveTo(14.6, 16, 15.8 + sway, 23.2); g.lineTo(5 + sway, 23.2); g.quadraticCurveTo(5.8, 16, 7.6, 10); g.closePath();
      P.fill(g, P.lg(g, 5, 10, 15, 23, [rl, r, rd]));
      P.rag(g, 5 + sway, 22.8, 15.8 + sway, 22.8, 5, 1.4, sh(r, -0.6));
      P.path(g, [5.2 + sway, 21.8, 15.6 + sway, 21.8, 15.8 + sway, 22.8, 5 + sway, 22.8]); P.fill(g, P.lg(g, 0, 21.8, 0, 22.8, [G.rgba(c.ember, 0.1), G.rgba(c.ember, 0.8)])); // the smouldering hem
      g.strokeStyle = rd; g.lineWidth = 0.4; g.beginPath(); g.moveTo(10, 12); g.quadraticCurveTo(9.4, 17, 8.4 + sway, 22.4); g.moveTo(12.4, 13); g.quadraticCurveTo(13, 18, 13.4 + sway, 22.4); g.stroke(); // folds
      P.path(g, [7.4, 13.6, 13.6, 13.4, 13.4, 14.6, 7.2, 14.8]); P.fill(g, c.trim); // a sash
      P.line(g, 12.6, 14.4, 13.4, 18, 0.5, c.trim);
      // the far hand, cupping a flame before the chest
      P.path(g, [8, 10.6, 5.4, 13.6, 6.6, 14.6, 8.8, 12.6]); P.fill(g, rd); P.circle(g, 5.8, 14.2, 0.9, '#5a3a30');
      P.glow(g, 5.4, 12.4, 3, c.ember, 0.7); flame(g, 5.6, 13.6, 3 + (f ? 0.6 : 0), 0.2);
      // the cowl: peaked, pulled forward, a burnt face deep inside with ember eyes and a glowing crack of a mouth
      const hx = 10.8, hy = 6.6;
      g.beginPath(); g.moveTo(hx - 4, hy + 4.2); g.quadraticCurveTo(hx - 4.6, hy - 3.4, hx - 0.6, hy - 5.6); g.quadraticCurveTo(hx + 3.8, hy - 5.2, hx + 4.8, hy - 0.4); g.quadraticCurveTo(hx + 4.4, hy + 2.6, hx + 3.2, hy + 4); g.closePath();
      P.fill(g, P.lg(g, hx - 4, hy - 5, hx + 4, hy + 4, [rl, r, rd]));
      P.ell(g, hx + 1.6, hy + 0.4, 2.5, 3, VOID, 0.15);
      P.ell(g, hx + 2, hy + 0.6, 1.7, 2.1, '#2a1a16', 0.15); // the burnt face
      evil(g, hx + 2.6, hy - 0.2, 0.45, c.eye); evil(g, hx + 1.2, hy - 0.2, 0.36, c.eye);
      P.line(g, hx + 1.4, hy + 1.8, hx + 3, hy + 1.6, 0.4, c.ember);
      P.line(g, hx - 3.6, hy + 3.6, hx + 3, hy + 3.8, 0.5, c.trim); // the cowl's edge
      // the near arm raised, the censer swinging on its chain
      P.path(g, [12.6, 10.4, 16.6, 11.2, 17.4, 9.4, 13.4, 8.6]); P.fill(g, P.lg(g, 12, 8, 17, 11, [rl, rd])); // the sleeve
      P.circle(g, 17.6, 9.4, 0.9, '#5a3a30'); // the fist
      const cx2 = 19 + sw * 0.6, cy2 = 15.4 - Math.abs(sw) * 0.3;
      g.strokeStyle = '#6a6064'; g.lineWidth = 0.3; g.setLineDash([0.5, 0.35]); g.beginPath(); g.moveTo(17.8, 9.8); g.lineTo(cx2, cy2 - 1.6); g.stroke(); g.setLineDash([]);
      P.glow(g, cx2, cy2, 4, c.ember, 0.6);
      P.path(g, [cx2 - 1.6, cy2 - 1.2, cx2 + 1.6, cy2 - 1.2, cx2 + 1.2, cy2 + 1.2, cx2, cy2 + 1.8, cx2 - 1.2, cy2 + 1.2]); P.fill(g, P.lg(g, cx2 - 1.6, 0, cx2 + 1.6, 0, ['#6a6064', iron, '#1a1416']));
      P.rect(g, cx2 - 0.9, cy2 - 0.2, 0.5, 0.5, c.ember); P.rect(g, cx2 + 0.3, cy2 - 0.2, 0.5, 0.5, c.ember); // holes glowing
      flame(g, cx2, cy2 - 1.2, 2.4 + (f ? 0.6 : 0), -0.4);
    } });

  /* ---------- Ember Salamander: a soot-black fire lizard, head raised, legs splayed, a long curling tail,
   *            ember blotches down its back and a crest of small flames ---------- */
  def('salamander', { w: 30, h: 17, cy: 13, frames: 2,
    colors: { skin: '#2a1c1a', spot: '#ff8a20', eye: '#fff060' },
    draw(g, f, c) {
      const s = c.skin, lit = sh(s, 0.55), dk = sh(s, -0.5), w = f ? 1 : -1;
      P.ell(g, 15, 15, 11, 1.1, 'rgba(0,0,0,0.4)');
      // far legs, behind the body (darker), stepping opposite the near pair
      const leg = (x, y, d, col, toe) => {
        const ex = x - 1.8 + d * 0.9, ey = y + 2.2, fx = x + 0.2 + d * 1.6, fy = y + 4.2;
        limb(g, x, y, ex, ey, 1.1, 0.7, col); limb(g, ex, ey, fx, fy, 0.7, 0.5, col);
        claws(g, fx + 0.2, fy + 0.1, 0.1, 3, 1.2, 0.35, toe);
      };
      leg(12.2, 10.2, -w, dk, dk); leg(21.2, 10, w, dk, dk);
      // tail: thick at the root, sweeping back and curling up to a fine tip
      g.beginPath(); g.moveTo(10, 8.2); g.bezierCurveTo(6, 8, 3.2, 7.6 + w * 0.4, 1.4, 4.6 + w * 0.3);
      g.quadraticCurveTo(1.2, 3.6, 2, 3.8 + w * 0.3); g.bezierCurveTo(3, 7.2, 6, 10.6, 10.4, 11.2); g.closePath();
      P.fill(g, P.lg(g, 0, 4, 0, 11, [lit, s, dk]));
      // body: a long low barrel, back lit, belly in shadow
      P.ell(g, 16, 9.6, 7.4, 2.7, P.lg(g, 0, 6.9, 0, 12.3, [lit, s, dk]));
      // head raised on a short neck: a flat skull, a blunt snout, the jaw line, a bright slit eye
      g.beginPath(); g.moveTo(21.4, 7.6); g.quadraticCurveTo(23.4, 5.4, 26.4, 6.2); g.quadraticCurveTo(29.4, 7, 29.6, 8.6);
      g.quadraticCurveTo(28.6, 10, 25.6, 10.2); g.quadraticCurveTo(23, 10.6, 21.4, 11); g.closePath();
      P.fill(g, P.lg(g, 0, 5.6, 0, 10.8, [lit, s, dk]));
      P.line(g, 24.4, 9.2, 29.2, 8.7, 0.35, '#0a0404');                                   // the mouth
      P.circle(g, 28.6, 7.4, 0.25, '#0a0404');                                            // nostril
      P.ell(g, 25.4, 7.4, 1, 0.75, '#0a0404'); evil(g, 25.5, 7.35, 0.8, c.eye, -0.15);
      // near legs, in front (lit)
      leg(13.6, 10.8, w, s, lit); leg(22.4, 10.6, -w, s, lit);
      // ember blotches down the back, the signature of a fire salamander
      for (const [x, y, rx, ry, a] of [[10.8, 8.1, 1.1, 0.6, 0.2], [13.4, 7.4, 1.3, 0.7, -0.1], [16.4, 7.3, 1, 0.6, 0.1], [19, 7.6, 1.2, 0.65, -0.2], [23.4, 6.6, 0.8, 0.45, 0], [7.2, 8.4, 0.9, 0.5, 0.3], [4.2, 6.8, 0.6, 0.4, 0.8], [15, 9.8, 0.7, 0.4, 0]]) {
        P.ell(g, x, y, rx, ry, c.spot, a); P.ell(g, x - rx * 0.25, y - ry * 0.3, rx * 0.45, ry * 0.4, sh(c.spot, 0.6), a);
      }
      P.glow(g, 15, 7.6, 8, c.spot, 0.22);
      // a low crest of small flames along the spine, flickering between frames
      for (let i = 0; i < 4; i++) P.flame(g, 11.6 + i * 2.8, 7.2 - (i === 1 ? 0.3 : 0), 1.6 + ((i + f) % 2) * 0.9, -0.6, 0.85);
    } });

  /* ---------- Flamedancer (boss): a horned demoness caught mid-turn, one arm flung up trailing a long ribbon of fire,
   *            a fireball in the other palm, hair of flame streaming up, a swirling silk skirt burning at the hem ---------- */
  def('flamedancer', { w: 44, h: 54, cy: 34, frames: 2,
    colors: { skin: '#7a2818', silk: '#8a1a14', gold: '#e0a040', fire: '#ff8a2a', eye: '#fff0a0' },
    draw(g, f, c) {
      const wv = f ? 1 : -1, sk = c.skin, skl = sh(c.skin, 0.35), skd = sh(c.skin, -0.35), F = c.fire;
      const fire = (pts, col) => { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 4) g.quadraticCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3]); g.closePath(); P.fill(g, col); };
      P.ell(g, 22, 51.6, 11, 1.6, 'rgba(0,0,0,0.45)');
      P.glow(g, 22, 30, 20, F, 0.22);
      // the ribbon of fire: from the raised hand, sweeping down behind her and out to the left
      g.beginPath(); g.moveTo(31, 5); g.bezierCurveTo(38, 0 + wv, 44, 8, 38.6, 16); g.bezierCurveTo(35, 22, 42, 26 + wv, 42.6, 33);
      g.bezierCurveTo(40, 28 + wv, 33.4, 24, 36.6, 16.6); g.bezierCurveTo(40.4, 9.6, 36, 4.4, 31, 6.2); g.closePath();
      P.fill(g, P.lg(g, 31, 5, 42, 33, [G.rgba('#ffe070', 0.95), G.rgba(F, 0.9), G.rgba(sh(F, -0.3), 0.3)]));
      // the far leg under the skirt, only its foot showing
      P.path(g, [15.6, 48.6, 18.4, 48.4, 19.4, 50.2, 15, 50.4]); P.fill(g, skd);
      // the skirt swirling out with the turn: deep silk, lifted at the front where the near leg steps through
      g.beginPath(); g.moveTo(18, 27); g.lineTo(26.4, 27); g.quadraticCurveTo(29, 33, 27.4, 38.4); g.quadraticCurveTo(33, 40 + wv, 34.6, 45.6);
      g.quadraticCurveTo(29.6, 44, 26, 47.6); g.quadraticCurveTo(21.6, 45.4, 17, 49); g.quadraticCurveTo(12.6, 45.6, 7.4 - wv, 47.6); g.quadraticCurveTo(11.6, 36, 18, 27); g.closePath();
      P.fill(g, P.lg(g, 10, 27, 30, 48, [sh(c.silk, 0.45), c.silk, sh(c.silk, -0.45)]));
      g.strokeStyle = sh(c.silk, -0.55); g.lineWidth = 0.5; for (const [x0, x1] of [[20, 14], [23, 21.6], [25.4, 28.6]]) { g.beginPath(); g.moveTo(x0, 29); g.quadraticCurveTo((x0 + x1) / 2 - 1, 38, x1, 45.4); g.stroke(); } // folds
      // the hem burning: flame licking up from it in a few tongues of different heights
      fire([7.4 - wv, 47.6, 9, 43.6, 10.4, 42 + wv, 11.4, 45.6, 13, 45.8, 14.6, 42.8, 15.4, 40.4, 17, 45, 17, 49, 12.6, 45.6, 7.4 - wv, 47.6], G.rgba(F, 0.9));
      fire([26, 47.6, 27.6, 43, 30, 41.8 - wv, 30.4, 43.6, 32.4, 44, 33.6, 42, 34.6, 45.6, 29.6, 44, 26, 47.6], G.rgba(F, 0.9));
      P.line(g, 8.4, 47.2, 16.6, 48.6, 0.5, G.rgba('#ffe070', 0.9)); P.line(g, 26.6, 47, 34, 45.4, 0.5, G.rgba('#ffe070', 0.9));
      // the near leg stepping out through the slit, pointed foot, a gold anklet
      limb(g, 25.4, 34, 28.4 + wv * 0.4, 41.2, 1.8, 1.2, sk); limb(g, 28.4 + wv * 0.4, 41.2, 30 + wv * 0.6, 48.4, 1.2, 0.8, sk);
      P.path(g, [29.2 + wv * 0.6, 48, 31 + wv * 0.6, 48, 33.6 + wv * 0.6, 49.8, 29 + wv * 0.6, 50.2]); P.fill(g, sk);
      P.line(g, 29 + wv * 0.6, 47, 31.2 + wv * 0.6, 47, 0.7, c.gold);
      // the torso: a slim waist twisting into the turn, a silk wrap over the breast, gold girdle, veins of fire
      g.beginPath(); g.moveTo(18.4, 27.6); g.quadraticCurveTo(20.6, 23.6, 18.4, 18.6); g.quadraticCurveTo(17.4, 16.4, 18, 15.6); g.lineTo(26.4, 15.6); g.quadraticCurveTo(26.8, 17, 25.8, 19); g.quadraticCurveTo(24, 23.6, 26.4, 27.6); g.closePath();
      P.fill(g, P.lg(g, 17, 16, 27, 28, [skl, sk, skd]));
      P.path(g, [17.8, 16.4, 26.4, 16.2, 25.6, 19.6, 18.6, 20]); P.fill(g, P.lg(g, 18, 16, 18, 20.4, [sh(c.silk, 0.4), sh(c.silk, -0.3)]));
      P.line(g, 18.4, 19.9, 25.8, 19.5, 0.5, c.gold);
      P.rrect(g, 18.2, 25.8, 8.4, 2, 0.8, P.lg(g, 0, 25.8, 0, 27.8, [sh(c.gold, 0.35), sh(c.gold, -0.4)])); P.circle(g, 22.6, 26.8, 0.8, F);
      cracks(g, [[20.4, 21.2, 21.2, 23, 20.6, 25], [24.2, 21.4, 23.6, 24]], F, 0.4);
      // the far arm sweeping out and down, a fireball in the palm
      limb(g, 18.6, 16.6, 13.4, 19.6, 1.2, 1, skd); limb(g, 13.4, 19.6, 8.6, 18, 1, 0.8, skd); P.line(g, 10, 18.2, 10.4, 19.6, 0.6, c.gold);
      P.glow(g, 6.6, 16.4, 5 + (f ? 0.8 : 0), F, 0.8); P.circle(g, 6.6, 16.4, 1.7, P.rg(g, 6.6, 16.4, 1.7, [[0, '#fff6c8'], [0.5, '#ffd060'], [1, F]]));
      // the near arm flung up over the head, holding the ribbon
      limb(g, 26, 16.6, 29.8, 11, 1.2, 1, sk); limb(g, 29.8, 11, 31, 6, 1, 0.8, skl); P.line(g, 30, 7.4, 31.6, 7.6, 0.6, c.gold); P.circle(g, 31, 5.4, 0.9, skl);
      // the head: hair of fire streaming up and back, two small horns, a gold circlet, burning eyes
      const hx = 22.8, hy = 11.2;
      fire([hx - 2.6, hy - 1, hx - 7, hy - 6, hx - 9.6 - wv, hy - 10.4, hx - 4.6, hy - 7, hx - 3, hy - 6.4, hx - 3.6, hy - 9.6, hx - 3.4 + wv, hy - 11.4, hx - 0.4, hy - 7.4, hx + 0.6, hy - 4, hx + 1, hy - 3, hx - 2.6, hy - 1], G.rgba(F, 0.95));
      fire([hx - 2, hy - 1.6, hx - 5, hy - 5, hx - 6.4, hy - 7.6, hx - 2.4, hy - 5.4, hx - 1.4, hy - 4.8, hx - 1.4, hy - 7, hx - 1, hy - 8, hx + 0.4, hy - 5, hx - 2, hy - 1.6], G.rgba('#ffe070', 0.9));
      P.path(g, [hx - 0.8, hy + 2.6, hx + 1.4, hy + 2.8, hx + 0.6, hy + 4.6]); P.fill(g, skd); // the neck
      P.ell(g, hx, hy, 2.6, 3, P.vol(g, hx - 0.6, hy - 1, 2.8, sk), 0.15);
      P.path(g, [hx + 1.6, hy - 1, hx + 3, hy + 0.8, hx + 2, hy + 2.4, hx + 1.2, hy + 1]); P.fill(g, sk); // the face turned toward us
      horn(g, hx - 1, hy - 2.4, hx - 3.4, hy - 4.6, hx - 5.6, hy - 3.2, 0.6, '#2a1a14'); horn(g, hx + 1.2, hy - 2.6, hx + 2, hy - 5.4, hx + 0.4, hy - 6.8, 0.6, '#3a2a20');
      P.line(g, hx - 2.4, hy - 1.6, hx + 2.6, hy - 1.8, 0.6, c.gold); P.circle(g, hx + 1.4, hy - 1.8, 0.5, F);
      P.ell(g, hx + 1.9, hy - 0.2, 0.8, 0.6, '#1a0404'); P.ell(g, hx + 0.2, hy - 0.2, 0.7, 0.55, '#1a0404');
      evil(g, hx + 1.9, hy - 0.2, 0.62, c.eye); evil(g, hx + 0.2, hy - 0.2, 0.5, c.eye);
      P.path(g, [hx + 0.8, hy + 1.4, hx + 2.6, hy + 1.2, hx + 1.8, hy + 2.2]); P.fill(g, '#1a0404'); // a smiling mouth
    } });

  /* ---------- Ashen Warlord (boss): a broad knight in cracked ash-grey plate with embers glowing in the seams,
   *            a crown of fire over a great helm, a tattered ash cloak, a burning war-glaive held across the body ---------- */
  def('ashwarlord', { w: 48, h: 56, cy: 34, frames: 2,
    colors: { ash: '#5a5452', dark: '#221e20', ember: '#ff7030', eye: '#ffcf60', cloth: '#4a1c16' },
    draw(g, f, c) {
      const a = sh(c.ash, 0.1), al = sh(c.ash, 0.55), ad = sh(c.ash, -0.45), E = c.ember, w = f ? 0.8 : -0.8, wood = '#3a2618';
      P.ell(g, 24, 52.6, 13, 2, 'rgba(0,0,0,0.45)');
      // the cloak behind, ash-grey and scorched, hanging in tatters
      g.beginPath(); g.moveTo(15, 15); g.bezierCurveTo(9, 22, 8 - w, 34, 7 - w, 46); g.lineTo(18, 44); g.lineTo(20, 18); g.closePath();
      P.fill(g, P.lg(g, 7, 15, 20, 46, [sh(c.cloth, 0.3), c.cloth, sh(c.cloth, -0.5)]));
      P.rag(g, 7 - w, 45.6, 18, 43.6, 4, 3, sh(c.cloth, -0.4));
      // the legs: far leg back in shadow, near leg forward; greaves with knee cops, heavy sabatons
      const leg = (hx, kx, ax, col, lit) => {
        limb(g, hx, 35, kx, 43, 3, 2.4, col); limb(g, kx, 43, ax, 50, 2.4, 2, col);
        P.circle(g, kx, 43, 2.2, P.vol(g, kx - 0.6, 42.2, 2.3, lit));
        P.path(g, [ax - 2.4, 49.4, ax + 2.2, 49.4, ax + 4, 51.8, ax - 2.6, 51.8]); P.fill(g, P.lg(g, 0, 49.4, 0, 51.8, [col, c.dark]));
      };
      leg(20.4, 17.6 - w * 0.4, 17 - w, ad, a);
      leg(27.4, 30.2 + w * 0.4, 31 + w, a, al);
      // plated tassets over the hips
      for (let i = 0; i < 3; i++) P.rrect(g, 18.4 + i * 3.6, 32, 3.4, 5.4 - (i === 1 ? 0 : 1), 1, P.lg(g, 0, 32, 0, 37, [al, ad]));
      // the torso: a broad breastplate over a narrower waist, cracked, embers in the seams
      g.beginPath(); g.moveTo(14.6, 15); g.lineTo(33.6, 15); g.quadraticCurveTo(34, 25, 29.6, 32.4); g.lineTo(18.6, 32.4); g.quadraticCurveTo(14, 25, 14.6, 15); g.closePath();
      P.fill(g, P.lg(g, 14, 14, 33, 32, [al, a, ad]));
      P.ell(g, 20.4, 20.4, 5, 5, P.vol(g, 19, 18.6, 5.2, a), 0.2); P.ell(g, 28, 20.4, 5, 5, P.vol(g, 26.8, 18.6, 5.2, sh(c.ash, 0.2)), -0.2);
      for (let i = 0; i < 2; i++) P.rrect(g, 18.6 + i * 0.4, 25.8 + i * 2.8, 11.2 - i * 0.8, 2.4, 0.8, P.lg(g, 0, 25.8 + i * 2.8, 0, 28.2 + i * 2.8, [al, ad])); // banded belly plates
      cracks(g, [[21, 16.6, 22.4, 19, 21.2, 22], [27.4, 17, 26.4, 20.4, 28.4, 22.6], [23.4, 26, 24.6, 28.4]], E, 0.5);
      P.glow(g, 24, 21, 6, E, 0.3);
      P.rrect(g, 18, 31.2, 12.6, 1.8, 0.6, c.dark); P.circle(g, 24.2, 32.1, 1, E); // the belt
      // the far pauldron and arm, the gauntlet low on the haft
      P.ell(g, 14.4, 16, 4, 3, P.vol(g, 13.4, 15, 4, a));
      limb(g, 13.6, 18, 12.4, 26, 2.2, 1.8, ad); limb(g, 12.4, 26, 17.2, 33, 1.8, 1.6, ad);
      // the war-glaive: a long haft across the body, a broad curved blade at the top burning along its edge
      P.line(g, 9.4, 47.4, 37.6, 6.4, 1.4, P.lg(g, 9, 47, 37, 6, [sh(wood, 0.4), wood, sh(wood, -0.4)]));
      for (const t of [0.25, 0.6]) P.line(g, 9.4 + 28.2 * t - 0.8, 47.4 - 41 * t - 0.6, 9.4 + 28.2 * t + 0.8, 47.4 - 41 * t + 0.6, 1.4, c.dark); // iron bands
      P.path(g, [9.4, 47.4, 8.2, 50.4, 10.4, 47.8]); P.fill(g, '#6a6468'); // the butt spike
      P.glow(g, 40, 6, 7, E, 0.45);
      P.path(g, [35.2, 10.8, 38.4, 6.6, 41.4, 2.6, 44, 0.6, 43.8, 4.6, 42, 8.8, 38.6, 12.6]); P.fill(g, P.lg(g, 35, 12, 44, 1, ['#4a4448', '#9a9498', '#e8e0dc']));
      P.line(g, 38.8, 12.4, 43.8, 4, 0.5, E); P.line(g, 42.4, 8.4, 43.8, 1.6, 0.35, '#ffe070'); // the burning edge
      P.path(g, [36.4, 8.2, 33.4, 5.4, 36.8, 6.8]); P.fill(g, '#6a6468'); // a back spike
      flame(g, 43.2, 3.2, 3.4 + (f ? 0.8 : 0), 0.4, 0.8);
      P.circle(g, 17.2, 33.2, 1.8, P.vol(g, 16.6, 32.6, 1.8, a)); // the far gauntlet on the haft
      // the helm: a great helm narrowing to the jaw, a burning slit, a gorget, a crown of fire
      const hx = 24.4, hy = 9;
      P.rrect(g, hx - 3.4, hy + 3.6, 7, 2.4, 1, ad); // the gorget
      g.beginPath(); g.moveTo(hx - 4.2, hy + 4.4); g.lineTo(hx - 4.4, hy - 2.4); g.quadraticCurveTo(hx - 4, hy - 5.6, hx, hy - 5.8); g.quadraticCurveTo(hx + 4.2, hy - 5.6, hx + 4.6, hy - 2.4); g.lineTo(hx + 4, hy + 3.4); g.quadraticCurveTo(hx + 1, hy + 5.4, hx - 4.2, hy + 4.4); g.closePath();
      P.fill(g, P.lg(g, hx - 4, hy - 6, hx + 4, hy + 5, [al, a, ad]));
      P.line(g, hx + 0.6, hy - 5.6, hx + 0.6, hy + 4.6, 0.5, al); // the crest ridge
      P.rect(g, hx - 3.4, hy - 1, 7.4, 1.2, '#0a0404'); P.glow(g, hx + 0.6, hy - 0.4, 3.6, c.eye, 0.7); P.rect(g, hx - 2.4, hy - 0.8, 5.8, 0.6, c.eye);
      for (let i = 0; i < 3; i++) P.circle(g, hx + 1.6 + i * 0.9, hy + 2 + (i % 2) * 0.8, 0.3, '#0a0404'); // breaths
      for (const [x, h, l] of [[hx - 2.6, 3.4, -0.6], [hx - 0.2, 5, -0.4], [hx + 2.2, 3.8, -0.2]]) flame(g, x, hy - 5, h + (f ? 0.8 : 0), l, 0.9);
      // the near pauldron, great and layered, then the near arm with its gauntlet high on the haft
      P.ell(g, 34, 16.2, 4.6, 3.4, P.vol(g, 33, 15, 4.6, sh(c.ash, 0.2))); P.ell(g, 34.6, 18, 4, 2, P.lg(g, 0, 17, 0, 20, [a, ad]));
      cracks(g, [[32.4, 14.6, 34, 16, 33.4, 17.6]], E, 0.4);
      limb(g, 34, 19.6, 35.6, 26, 2.2, 1.8, a); limb(g, 35.6, 26, 29.6, 23.6, 1.8, 1.6, al);
      P.circle(g, 29, 23.4, 1.9, P.vol(g, 28.4, 22.8, 1.9, al)); // the gauntlet round the haft
    } });

  /* ================= Hall 3: the Aqueduct ================= */
  /** Barnacles and moss spots scattered over an area. */
  function barnacles(g, pts, col) { for (const [x, y, r] of pts) { P.circle(g, x, y, r, sh(col, -0.35)); P.circle(g, x - r * 0.2, y - r * 0.2, r * 0.55, col); } }

  /* ---------- Weeping Watcher: a weeping stone angel, wings folded high, hands over its face; unwatched
   *            (frame 1) the hands drop to claws and the face shows: glowing eyes, a fanged mouth ---------- */
  def('weeper', { w: 24, h: 32, cy: 21, frames: 2,
    colors: { stone: '#8a8a86', moss: '#4a6a3a', eye: '#9ff0ff' },
    draw(g, f, c) {
      const st = c.stone, lit = sh(st, 0.35), dk = sh(st, -0.45), dd = sh(st, -0.65);
      const arm = (x1, y1, x2, y2, w1, w2, col) => { limb(g, x1, y1, x2, y2, w1 + 0.4, w2 + 0.4, dd); limb(g, x1, y1, x2, y2, w1, w2, col); }; // edged, so it reads over the robe
      P.ell(g, 12, 30.6, 8, 1.3, 'rgba(0,0,0,0.45)');
      // folded wings rising above the shoulders, feathers stepping down the outer edge
      const wing = (sx, col, lcol) => {
        g.save(); g.translate(12, 0); g.scale(sx, 1);
        g.beginPath(); g.moveTo(2.6, 11.4); g.quadraticCurveTo(5.4, 4, 8.8, 1.6); g.quadraticCurveTo(9.8, 6, 9.4, 11);
        for (let i = 0; i < 5; i++) { const y = 12 + i * 2.6; g.lineTo(9.6 - i * 0.5, y + 1.4); g.lineTo(8.4 - i * 0.6, y); }
        g.lineTo(5.6, 25); g.quadraticCurveTo(3.6, 18, 2.6, 11.4); g.closePath(); P.fill(g, P.lg(g, 2, 2, 10, 25, [lcol, col, dd]));
        g.strokeStyle = dd; g.lineWidth = 0.35; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(4 + i * 0.9, 9 + i * 2.8); g.quadraticCurveTo(6.6 + i * 0.4, 8 + i * 2.8, 8.8 - i * 0.3, 8.6 + i * 3.4); g.stroke(); }
        g.restore();
      };
      wing(-1, dk, st); wing(1, st, lit);
      // the robe falling to the floor in deep folds, a torn hem, moss creeping up it
      g.beginPath(); g.moveTo(8.6, 11.2); g.lineTo(15.4, 11.2); g.quadraticCurveTo(17.6, 20, 18.8 + (f ? 0.4 : 0), 30); g.lineTo(5.2 - (f ? 0.4 : 0), 30); g.quadraticCurveTo(6.4, 20, 8.6, 11.2); g.closePath();
      P.fill(g, P.lg(g, 5, 11, 19, 30, [lit, st, dk]));
      for (const [x0, x1, col] of [[10, 8.2, dk], [12.2, 11.6, dd], [14.2, 15.6, dk]]) { g.beginPath(); g.moveTo(x0, 16); g.quadraticCurveTo(x0 - 0.4, 23, x1, 30); g.strokeStyle = col; g.lineWidth = 0.6; g.stroke(); }
      P.rag(g, 5.2 - (f ? 0.4 : 0), 29.8, 18.8 + (f ? 0.4 : 0), 29.8, 6, 1, dk);
      for (const [x, y, r] of [[6.6, 28.4, 1.4], [16.6, 28, 1.2], [9, 29.2, 1], [14.4, 22, 0.7]]) P.ell(g, x, y, r, r * 0.55, c.moss);
      P.cracks(g, [[15.6, 14, 14.8, 17, 15.8, 19.4], [7.6, 22, 8.8, 24.2, 8.2, 26]], dd, 0.35);
      // the bowed head under a veil
      const hx = 12, hy = 8.2;
      g.beginPath(); g.moveTo(hx - 3.6, hy + 3.2); g.quadraticCurveTo(hx - 3.8, hy - 3.4, hx, hy - 3.8); g.quadraticCurveTo(hx + 3.8, hy - 3.4, hx + 3.6, hy + 3.2); g.closePath();
      P.fill(g, P.lg(g, hx - 3.6, hy - 3.8, hx + 3.6, hy + 3.2, [lit, st, dk]));
      if (!f) {
        // hands pressed over the face, elbows out
        P.ell(g, hx, hy + 0.8, 2.7, 2.9, dd);                                           // the shadowed face under the veil
        arm(8.6, 12, 6.4, 10.4, 1.1, 0.9, st); arm(6.4, 10.4, 10.6, 8.6, 0.9, 0.8, lit);
        arm(15.4, 12, 17.6, 10.4, 1.1, 0.9, st); arm(17.6, 10.4, 13.4, 8.6, 0.9, 0.8, lit);
        for (const [x, d] of [[10.7, -1], [13.3, 1]]) { P.ell(g, x + d * 0.3, hy + 0.5, 1.6, 2, dd); P.ell(g, x + d * 0.3, hy + 0.4, 1.3, 1.7, P.vol(g, x, hy, 1.8, sh(st, 0.5))); for (let k = 0; k < 3; k++) P.line(g, x - 0.7 + k * 0.7, hy - 1.1, x - 0.8 + k * 0.75, hy + 0.4, 0.25, dd); }
        P.line(g, 12, hy + 1.6, 12, hy + 4.2, 0.3, 'rgba(140,210,230,0.7)'); // a stone tear running down
      } else {
        // unwatched: the hands drop to claws and the face is bared
        P.ell(g, hx, hy + 0.8, 2.3, 2.6, '#101012');
        evil(g, hx - 0.9, hy - 0.1, 0.6, c.eye, 0.1); evil(g, hx + 1.1, hy - 0.1, 0.6, c.eye, -0.1); P.glow(g, hx, hy, 4, c.eye, 0.5);
        P.ell(g, hx + 0.1, hy + 2, 1.2, 0.9, '#050506'); teeth(g, hx - 1, hy + 1.5, hx + 1.2, hy + 1.5, 4, 0.6, 1, '#d8d8d0');
        arm(8.6, 12, 5.8, 15.2, 1.1, 0.9, st); arm(5.8, 15.2, 4.2, 18.8, 0.9, 0.7, st); claws(g, 4.2, 19.2, 1.9, 4, 2, 0.45, lit);
        arm(15.4, 12, 18.2, 15, 1.1, 0.9, lit); arm(18.2, 15, 19.8, 18.4, 0.9, 0.7, lit); claws(g, 19.8, 18.8, 1.2, 4, 2, 0.45, lit);
      }
    } });

  /* ---------- Gargoyle: a horned stone gargoyle crouched on its haunches; frame 0 perched with the wings folded
   *            high on its back, frame 1 swooping with them spread up and back; the head always clear in front ---------- */
  def('gargoyle', { w: 30, h: 26, cy: 16, frames: 2,
    colors: { stone: '#6a7266', eye: '#ffb040' },
    draw(g, f, c) {
      const st = c.stone, lit = sh(st, 0.5), mid = sh(st, 0.15), dk = sh(st, -0.45), dd = sh(st, -0.65);
      P.ell(g, 15, 24.4, 9, 1.3, 'rgba(0,0,0,0.45)');
      // wings: dark membranes on finger struts, behind the body and away from the head
      const wing = (bx, by, pts, col) => {
        g.beginPath(); g.moveTo(bx, by); for (const [x, y] of pts) g.lineTo(x, y); g.closePath();
        P.fill(g, P.lg(g, bx, by - 12, bx, by + 4, [sh(col, 0.2), col, dd]));
        g.strokeStyle = dd; g.lineWidth = 0.5; for (const [x, y] of pts.filter((_, i) => i % 2 === 0)) { g.beginPath(); g.moveTo(bx, by); g.lineTo(x, y); g.stroke(); }
      };
      if (f) {
        wing(13, 11, [[6, 1.4], [3.6, 5.4], [1, 5.6], [2.4, 9.6], [0.6, 12], [4.6, 13.4], [7, 15]], dk);          // far wing, up and back
        wing(15.6, 10.6, [[14, 0.6], [11.2, 3], [9.6, 2.8], [9.8, 6.6], [8, 8], [11.4, 10.2], [12.6, 13]], dk);     // near wing, raised
      } else {
        wing(12.6, 11, [[9, 3], [7.4, 6.4], [6, 7], [6.8, 10.6], [6, 13.4], [9.6, 15]], dk);                         // folded, high on the back
        wing(15, 10.6, [[13.4, 2.4], [11.4, 5.2], [10.4, 5.4], [10.8, 9], [10.2, 11.6], [13, 13.6]], dk);
      }
      // a curling tail with a spade tip
      g.beginPath(); g.moveTo(9, 17); g.bezierCurveTo(5, 19, 3.6, 21.6, 1.8, 20.8); g.strokeStyle = dk; g.lineWidth = 1.1; g.stroke();
      P.path(g, [1.8, 19.4, 0.2, 21, 2.2, 22.2]); P.fill(g, dk);
      // crouched body: haunch, hunched torso, a front arm reaching down with long claws
      // far hind leg (darker), then the near haunch folded under the body: thigh, shin and a clawed foot
      limb(g, 9.6, 17.4, 7.6, 20.4, 1.6, 1.1, dk); limb(g, 7.6, 20.4, 9.2, 23.2, 1.1, 0.8, dk); claws(g, 9.4, 23.6, 0.1, 3, 1.3, 0.45, dd);
      P.ell(g, 12.4, 17.4, 3.8, 3.4, P.vol(g, 11.8, 16.4, 3.8, st));                                               // haunch
      limb(g, 12.8, 19.2, 11.6, 21.6, 1.3, 0.9, st); limb(g, 11.6, 21.6, 13.6, 23.2, 0.9, 0.7, st); claws(g, 13.8, 23.6, 0.1, 3, 1.4, 0.45, '#2a2e28');
      g.beginPath(); g.moveTo(10, 16); g.quadraticCurveTo(12.4, 9, 19, 9.6); g.quadraticCurveTo(22, 11.6, 20.6, 15.4); g.quadraticCurveTo(16, 18.6, 10, 16); g.closePath();
      P.fill(g, P.lg(g, 11, 9, 20, 18, [lit, st, dk]));
      for (let i = 0; i < 3; i++) P.line(g, 14.6 + i * 1.6, 12.6, 15.4 + i * 1.6, 15.6, 0.4, dk);                    // ribs
      limb(g, 17.8, 13.6, 18.8, 18.4, 1.2, 0.9, dk); limb(g, 18.8, 18.4, 18.4, 22.6, 0.9, 0.7, dk); claws(g, 18.6, 23, 0.2, 3, 1.3, 0.45, dd);   // far arm
      limb(g, 19.4, 13, 21.6, 18.2, 1.3, 1, lit); limb(g, 21.6, 18.2, 22, 22.4, 1, 0.8, st); claws(g, 22.2, 22.8, 0.2, 3, 1.5, 0.45, '#2a2e28');
      // the head thrust forward, clear of the wings: heavy brow, horns sweeping back, a grinning fanged maw
      const hx = 24, hy = 8.6;
      g.beginPath(); g.moveTo(hx - 3.4, hy + 1.6); g.quadraticCurveTo(hx - 3, hy - 3.2, hx + 0.6, hy - 3); g.quadraticCurveTo(hx + 4.2, hy - 2, hx + 5, hy + 0.8);
      g.quadraticCurveTo(hx + 4.4, hy + 3.4, hx + 1, hy + 3.6); g.quadraticCurveTo(hx - 2.4, hy + 3.4, hx - 3.4, hy + 1.6); g.closePath();
      P.fill(g, P.lg(g, hx - 3, hy - 3, hx + 3, hy + 3.6, [lit, mid, dk]));
      P.horn(g, hx - 1.4, hy - 2.4, hx - 4.6, hy - 5.4, hx - 6.8, hy - 4.4, 0.8, sh(st, 0.3));
      P.horn(g, hx + 0.6, hy - 2.8, hx - 0.4, hy - 6.6, hx - 3, hy - 7.6, 0.7, lit);
      P.path(g, [hx + 0.2, hy + 1.2, hx + 5, hy + 0.8, hx + 4.2, hy + 3, hx + 0.6, hy + 3]); P.fill(g, '#141410');
      teeth(g, hx + 0.6, hy + 1.2, hx + 4.8, hy + 0.9, 5, 0.8, 1, '#e0dccc'); teeth(g, hx + 0.8, hy + 3, hx + 4.2, hy + 2.9, 4, 0.7, -1, '#e0dccc');
      P.line(g, hx - 1, hy - 1.6, hx + 3, hy - 1.4, 0.6, dd);                                                   // the brow
      evil(g, hx + 1.8, hy - 0.6, 0.7, c.eye, -0.2);
      P.cracks(g, [[16, 11, 17.4, 12.6, 16.8, 14]], dd, 0.3);
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

  /* ---------- The Drowned: a bloated corpse risen from the water, hunched forward, lank hair over its face,
   *            kelp on its shoulders, dragging an anchor on a chain behind it ---------- */
  def('drowned', { w: 28, h: 30, cy: 18, frames: 2,
    colors: { skin: '#9ab0a4', weed: '#2e5a3a', eye: '#b0fff0' },
    draw(g, f, c) {
      const s = c.skin, lit = sh(s, 0.3), dk = sh(s, -0.4), dd = sh(s, -0.62), bruise = '#5e5068', w = f ? 1 : -1;
      P.ell(g, 14, 28.6, 10, 1.3, 'rgba(0,0,0,0.45)'); P.ell(g, 15, 28.4, 7, 1, 'rgba(90,150,170,0.35)');
      // the anchor it drags: hanging from the far hand on a short chain, its flukes scraping the floor
      const ax = 6, ay = 27.4;
      for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(7.8 - k * 0.45, 21.6 + k * 0.9, 0.55, 0.75, 0.4, 0, Math.PI * 2); g.strokeStyle = '#2a2420'; g.lineWidth = 0.55; g.stroke(); }
      P.line(g, ax, ay - 1, ax, ay - 5.4, 1.1, '#3a3430'); P.line(g, ax - 1.8, ay - 4.4, ax + 1.8, ay - 4.4, 0.9, '#3a3430');
      g.beginPath(); g.arc(ax, ay - 6.2, 0.9, 0, Math.PI * 2); g.strokeStyle = '#3a3430'; g.lineWidth = 0.6; g.stroke();
      g.beginPath(); g.moveTo(ax - 3.2, ay - 2.6); g.quadraticCurveTo(ax - 2.8, ay + 0.6, ax, ay + 0.6); g.quadraticCurveTo(ax + 2.8, ay + 0.6, ax + 3.2, ay - 2.6); g.strokeStyle = '#3a3430'; g.lineWidth = 1.1; g.stroke();
      P.path(g, [ax - 3.8, ay - 2.2, ax - 3.2, ay - 3.6, ax - 2.4, ay - 2.2]); P.fill(g, '#3a3430'); P.path(g, [ax + 3.8, ay - 2.2, ax + 3.2, ay - 3.6, ax + 2.4, ay - 2.2]); P.fill(g, '#3a3430');
      // legs: bare, bent at the knee, the far one darker
      for (const [hx0, d, col] of [[12, -w, dk], [16.6, w, s]]) { limb(g, hx0, 18.6, hx0 + 0.6 + d * 0.8, 23.2, 1.7, 1.2, col); limb(g, hx0 + 0.6 + d * 0.8, 23.2, hx0 + d * 0.4, 27.6, 1.2, 0.95, col); P.ell(g, hx0 + 0.9 + d * 0.4, 28, 1.6, 0.65, sh(col, -0.15)); }
      // far arm hanging, gripping the chain
      limb(g, 10, 11.2, 8.8, 16.4, 1.4, 1.1, dk); limb(g, 8.8, 16.4, 8.2, 20.4, 1.1, 0.9, dk); P.circle(g, 8.2, 20.8, 1.1, dd);
      // a bloated, sagging torso leaning forward, bruised, a rag of shirt clinging
      g.beginPath(); g.moveTo(9.4, 13); g.bezierCurveTo(9.2, 9, 12.6, 7.6, 15.6, 8.2); g.quadraticCurveTo(18, 8.6, 18.8, 10.2); g.bezierCurveTo(20.8, 13.4, 20.4, 16.6, 17.8, 18.2); g.quadraticCurveTo(14.6, 19.6, 11.6, 18.8); g.quadraticCurveTo(9, 16.6, 9.4, 13); g.closePath();
      P.fill(g, P.rg(g, 14, 14, 9, [[0, lit], [0.6, s], [1, dk]], 12, 11));
      P.ell(g, 16.4, 16.4, 2.4, 1.8, G.rgba(bruise, 0.55)); P.ell(g, 11.4, 13, 1.2, 0.9, G.rgba(bruise, 0.45));
      P.path(g, [11, 17.4, 18.4, 17, 18.6, 20.4, 17, 19.6, 15.6, 21.2, 14.2, 19.8, 12.8, 21, 11.4, 19.8]); P.fill(g, P.lg(g, 0, 17, 0, 21, ['#4a5a60', '#1e2a2e']));   // torn breeches at the hips
      // kelp draped over the shoulders, hanging in strands
      for (let i = 0; i < 6; i++) { const x = 10 + i * 1.7; g.beginPath(); g.moveTo(x, 10.6 - Math.sin(i / 5 * Math.PI) * 1.8 + (i % 2) * 0.4); g.quadraticCurveTo(x + (f ? 0.8 : -0.4), 13, x - 0.4, 15.4 + (i % 3) * 1.4); g.strokeStyle = i % 2 ? c.weed : sh(c.weed, 0.25); g.lineWidth = 0.75; g.stroke(); }
      // near arm reaching forward, palm open, fingers splayed
      limb(g, 18.4, 11, 21.4, 14.2 + w * 0.3, 1.5, 1.2, s); limb(g, 21.4, 14.2 + w * 0.3, 24.2, 15.4 + w * 0.3, 1.2, 1, lit);
      claws(g, 24.6, 15.6 + w * 0.3, 0.3, 4, 1.8, 0.4, lit);
      // the head slumped forward on a thick neck: lank black hair over the face, one pale eye, a gaping mouth
      const hx = 18.6, hy = 6;
      limb(g, 16, 10, hx - 0.4, hy + 2, 1.6, 1.4, s);
      P.circle(g, hx, hy, 3.8, P.vol(g, hx, hy, 3.8, lit));
      P.ell(g, hx + 1.6, hy + 1.6, 1.1, 1.3 + (f ? 0.2 : 0), '#0a1010');                             // the mouth hanging open
      P.circle(g, hx + 1.6, hy - 0.4, 0.9, '#0a1010'); evil(g, hx + 1.7, hy - 0.4, 0.55, c.eye, 0); P.glow(g, hx + 1.6, hy - 0.4, 2.4, c.eye, 0.4);
      g.beginPath(); g.moveTo(hx - 3.6, hy + 1.4); g.quadraticCurveTo(hx - 3.4, hy - 4, hx + 1, hy - 3.7); g.quadraticCurveTo(hx + 3, hy - 3.3, hx + 2.6, hy - 2);
      g.lineTo(hx - 0.2, hy - 1.7); g.lineTo(hx - 0.6, hy + 4.6); g.lineTo(hx - 2.2, hy + 5.6); g.closePath(); P.fill(g, '#141a1c');   // lank hair: crown and back
      for (const [x0, x1] of [[hx + 0.6, hx + 0.2], [hx + 2.2, hx + 2.6]]) P.line(g, x0, hy - 2, x1 + w * 0.2, hy + 3.4, 0.4, '#1c2426'); // two strands across the face
      for (const [x, y, l] of [[23, 16.2, 1.4], [13, 20.4, 1.4]]) { P.line(g, x, y, x, y + l, 0.35, 'rgba(150,215,235,0.8)'); P.circle(g, x, y + l, 0.35, 'rgba(170,230,245,0.9)'); }
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

  /* ---------- Void Syphon: a floating void leech: a fleshy sac with a round lamprey mouth ringed with teeth,
   *            three glowing eyes, tentacles trailing below and one reaching forward with a sucker ---------- */
  def('syphon', { w: 26, h: 26, cy: 13, frames: 2,
    colors: { body: '#3a2450', vein: '#b050ff', eye: '#e0a0ff' },
    draw(g, f, c) {
      const b = c.body, lit = sh(b, 0.55), dk = sh(b, -0.55), w = f ? 1 : -1;
      P.glow(g, 12, 11, 12, c.vein, 0.22);
      // tentacles trailing down and back, swaying between frames
      const ten = (x, y, cx1, cy1, tx, ty, wd, col) => {
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(cx1, cy1, tx, ty); g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.stroke();
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(cx1, cy1, tx, ty); g.strokeStyle = G.rgba(c.vein, 0.5); g.lineWidth = wd * 0.3; g.stroke();
      };
      ten(8, 14.6, 5 + w, 19, 3.4 - w, 24, 1.3, dk); ten(10.4, 15.6, 9 - w, 20.6, 8 + w, 25, 1.4, dk);
      ten(12.8, 15.8, 13.8 + w, 20, 12.4 - w, 24.4, 1.2, b); ten(6.2, 12.6, 2.4 - w, 15, 1, 19.4 + w, 1.1, dk);
      // the sac: a teardrop, swollen at the front, drawn to a point behind
      g.beginPath(); g.moveTo(1.6, 6.4 + w * 0.4); g.quadraticCurveTo(6, 2.4, 12.6, 2.8); g.bezierCurveTo(19, 3.2, 20.6, 8.6, 19.8, 12);
      g.bezierCurveTo(18.8, 16, 14, 17, 10.6, 16.2); g.quadraticCurveTo(5.6, 14.8, 1.6, 6.4 + w * 0.4); g.closePath();
      P.fill(g, P.rg(g, 11, 8, 11, [[0, lit], [0.55, b], [1, dk]], 9, 6));
      // glowing veins over it
      g.strokeStyle = G.rgba(c.vein, 0.85); g.lineWidth = 0.4;
      for (const [x0, y0, x1, y1, x2, y2] of [[4, 7, 7.6, 7.8, 10, 6], [5, 10.6, 8.4, 11, 10.6, 13.4], [9.4, 4.4, 11, 6.4, 13.6, 5.4], [12.4, 14.6, 14, 13.2, 15.6, 14.8]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1, y1, x2, y2); g.stroke(); }
      // the round lamprey mouth on the front, a ring of hooked teeth around a glowing throat
      const mx = 16.8, my = 10.2;
      P.ell(g, mx, my, 3.2, 3.6, dk); P.ell(g, mx + 0.3, my, 2.4, 2.8, '#12041c');
      P.glow(g, mx + 0.4, my, 3.4, c.vein, 0.9); P.ell(g, mx + 0.5, my, 0.7 + (f ? 0.3 : 0), 0.9 + (f ? 0.3 : 0), '#ff80e0');
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + 0.2, x0 = mx + 0.3 + Math.cos(a) * 2.7, y0 = my + Math.sin(a) * 3.1; P.horn(g, x0, y0, x0 - Math.cos(a) * 0.7, y0 - Math.sin(a) * 0.7, mx + 0.3 + Math.cos(a) * 0.9, my + Math.sin(a) * 1.1, 0.6, '#efe4d0'); }
      g.beginPath(); g.ellipse(mx, my, 3.3, 3.7, 0, -1.2, 1.2); g.strokeStyle = lit; g.lineWidth = 0.7; g.stroke();   // a fleshy lip catching the light
      // three eyes above the mouth
      for (const [x, y, r] of [[12.6, 5.4, 0.7], [15.2, 5, 0.8], [17.6, 6, 0.6]]) { P.circle(g, x, y, r + 0.35, '#12041c'); evil(g, x, y, r, c.eye, 0); }
      // the reaching tentacle: forward and down, a sucker at its tip (the tether it latches on)
      ten(18.4, 13.6, 23 + w, 14.4, 23.6, 19 - w * 0.6, 1.3, b);
      P.circle(g, 23.6, 19.4 - w * 0.6, 1.2, lit); P.circle(g, 23.6, 19.4 - w * 0.6, 0.55, '#12041c'); P.glow(g, 23.6, 19.4 - w * 0.6, 1.8, c.vein, 0.6);
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

  /* ================= Hall 7: the Reliquary ================= */
  /** A gold coin seen edge-on-ish at (x,y), radius r. */
  function coin(g, x, y, r, tilt) { P.ell(g, x, y, r * (tilt || 1), r, P.rg(g, x - r * 0.3, y - r * 0.3, r * 1.2, [[0, '#fff4b0'], [0.5, '#e8b830'], [1, '#8a5a10']])); P.ell(g, x, y, r * 0.6 * (tilt || 1), r * 0.6, G.rgba('#8a5a10', 0.5)); }

  /* ---------- Gold Scarab: a gilded beetle seen from above, scuttling off with a stolen coin in its mandibles:
   *            two wing cases split down the middle, a shield of a thorax, six legs splayed with bent knees ---------- */
  def('scarab', { w: 24, h: 18, cy: 9, frames: 2,
    colors: { shell: '#d0a030', dark: '#3a2a0a', gem: '#40e0c0' },
    draw(g, f, c) {
      const sc = c.shell, lit = sh(sc, 0.45), dk = sh(sc, -0.5), dd = c.dark, w = f ? 0.8 : -0.8;
      P.ell(g, 11, 16.4, 8, 0.9, 'rgba(0,0,0,0.4)');
      // six legs splayed out to both sides, each bent at the knee; alternate tripods swing between frames
      const leg = (x, y, sx, sy, d, col) => { const kx = x + sx * 1.6 + d, ky = y + sy * 2.4, fx = kx + sx * 1.4 + d * 0.6, fy = ky + sy * 1.2 - sy * 0.2;
        limb(g, x, y, kx, ky, 0.55, 0.45, col); limb(g, kx, ky, fx, fy + sy * 1.4, 0.45, 0.3, col); P.line(g, fx, fy + sy * 1.4, fx + sx * 0.7, fy + sy * 1.7, 0.3, col); };
      for (const [x, sx, d] of [[7, -1, w], [11, -0.2, -w], [14.6, 0.8, w]]) { leg(x, 5.6, sx, -1, d, dd); leg(x, 11, sx, 1, -d, dd); }
      // the wing cases: an oval split lengthwise by the seam, lit on the upper-left half
      P.ell(g, 9.4, 8.4, 7.4, 4.4, dk);
      g.beginPath(); g.ellipse(9.2, 8.2, 7, 4, 0, Math.PI, Math.PI * 2); g.lineTo(16.2, 8.2); g.closePath(); P.fill(g, P.lg(g, 3, 4, 12, 8.2, [lit, '#fff2b0', sc]));
      g.beginPath(); g.ellipse(9.2, 8.4, 7, 3.8, 0, 0, Math.PI); g.lineTo(2.2, 8.4); g.closePath(); P.fill(g, P.lg(g, 0, 8.4, 0, 12.2, [sc, dk]));
      P.line(g, 2.4, 8.3, 16.2, 8.3, 0.5, dd);                                                                  // the seam
      for (const y of [6.2, 10.4]) { g.beginPath(); g.moveTo(4, y); g.quadraticCurveTo(9, y + (y < 8 ? -0.8 : 0.8), 14.6, y); g.strokeStyle = G.rgba(dd, 0.45); g.lineWidth = 0.3; g.stroke(); } // ridges
      // the thorax shield between shell and head, a jewel set in it
      P.ell(g, 17, 8.3, 2.3, 3.2, P.rg(g, 16.6, 7.4, 3, [[0, lit], [0.6, sc], [1, dk]])); P.line(g, 16.2, 8.3, 18.8, 8.3, 0.3, dd);
      P.circle(g, 16.8, 8.3, 0.75, c.gem); P.circle(g, 16.5, 8, 0.3, '#e0fff8');
      // the head: dark, two glowing eyes, antennae swept back, mandibles closing on a big stolen coin
      P.ell(g, 20, 8.3, 1.8, 2, P.vol(g, 19.6, 7.8, 2, sh(dd, 0.4)));
      evil(g, 20.4, 6.9, 0.45, '#ff5a2a', 0); evil(g, 20.4, 9.7, 0.45, '#ff5a2a', 0);
      P.line(g, 20.2, 6.6, 22.4, 3.4 + w * 0.3, 0.5, dd); P.line(g, 20.2, 10, 22.4, 13.2 - w * 0.3, 0.5, dd);  // antennae
      P.coin(g, 23, 8.3, 1.9, 0.6);
      P.horn(g, 21.2, 7.2, 22.6, 6.4, 23.4, 7.2, 0.4, dd); P.horn(g, 21.2, 9.4, 22.6, 10.2, 23.4, 9.4, 0.4, dd); // mandibles gripping it
    } });

  /* ---------- Mimic: a banded treasure chest; frame 0 shut and still, frame 1 the lid thrown back on a maw of teeth and a tongue ---------- */
  def('mimic', { w: 24, h: 22, cy: 16, frames: 2,
    colors: { wood: '#6a3a1a', band: '#c89a3a', tongue: '#c83050', eye: '#ffe060' },
    draw(g, f, c) {
      const wd = c.wood, bd = c.band;
      P.ell(g, 12, 20.4, 9, 1.4, 'rgba(0,0,0,0.45)');
      // the chest body
      P.rrect(g, 3, 11, 18, 9, 1, P.lg(g, 3, 0, 21, 0, [sh(wd, -0.4), sh(wd, 0.2), wd, sh(wd, -0.5)]));
      for (const x of [3, 11, 19.4]) P.rect(g, x, 11, 1.6, 9, P.lg(g, 0, 11, 0, 20, [sh(bd, 0.4), sh(bd, -0.4)]));
      if (!f) {
        // shut: a curved lid and a lock; only a thin dark seam gives it away
        g.beginPath(); g.moveTo(3, 11); g.quadraticCurveTo(12, 3.4, 21, 11); g.closePath(); P.fill(g, P.lg(g, 0, 5, 0, 11, [sh(wd, 0.35), wd]));
        for (const x of [3.6, 11.6, 19.4]) P.line(g, x + 0.4, 11, x + (12 - x) * 0.15 + 0.4, 6.6, 1.4, bd);
        P.rect(g, 3, 10.6, 18, 0.8, '#140804'); P.rrect(g, 10.6, 10.4, 2.8, 3.2, 0.6, P.lg(g, 0, 10, 0, 13.6, ['#fff0a0', bd])); P.circle(g, 12, 12, 0.5, '#140804');
        P.glow(g, 12, 7, 5, '#ffd050', 0.25); coin(g, 6, 10.4, 1, 0.6); coin(g, 17.6, 10.6, 1, 0.5);
        return;
      }
      // open: the lid thrown back, teeth all round the rim, a long tongue, eyes in the dark
      g.beginPath(); g.moveTo(3, 11); g.quadraticCurveTo(4, 0, 12, -0.4); g.quadraticCurveTo(20, 0, 21, 11); g.lineTo(19, 11); g.quadraticCurveTo(18, 3, 12, 2.4); g.quadraticCurveTo(6, 3, 5, 11); g.closePath(); P.fill(g, P.lg(g, 0, 0, 0, 11, [sh(wd, 0.2), sh(wd, -0.4)]));
      P.ell(g, 12, 11, 7.4, 3, '#1a0408');
      teeth(g, 4.4, 11.4, 19.6, 11.4, 9, 1.4, 1, '#efe4c8'); teeth(g, 5, 9.2, 19, 9.2, 8, -1.2, 1, '#efe4c8');
      evil(g, 9.4, 7.4, 0.7, c.eye); evil(g, 14.6, 7.4, 0.7, c.eye); P.glow(g, 12, 7.4, 5, c.eye, 0.35);
      g.beginPath(); g.moveTo(12, 11); g.quadraticCurveTo(18, 14, 22, 12); g.strokeStyle = c.tongue; g.lineWidth = 1.6; g.lineCap = 'round'; g.stroke();
    } });

  /* ---------- Gilded Knight: a knight in gilt plate, a winged helm, a tall kite shield blazoned with a sun, a long mace ---------- */
  def('gildedknight', { w: 24, h: 30, cy: 20, frames: 2,
    colors: { plate: '#c8a040', dark: '#5a3a14', cloth: '#6a1a24', eye: '#ffe0a0' },
    draw(g, f, c) {
      const pl = c.plate, w = f ? 0.8 : -0.8;
      P.ell(g, 12, 28.4, 7, 1.2, 'rgba(0,0,0,0.45)');
      P.rrect(g, 8.4 - w, 19, 2.8, 9, 1, P.lg(g, 8, 0, 12, 0, [sh(pl, 0.3), sh(pl, -0.45)])); P.rrect(g, 12.6 + w, 19, 2.8, 9, 1, P.lg(g, 12, 0, 16, 0, [sh(pl, 0.4), sh(pl, -0.3)]));
      P.path(g, [8, 16, 16, 16, 16.6, 22, 12, 23.4, 7.4, 22]); P.fill(g, P.lg(g, 8, 16, 16, 23, [sh(c.cloth, 0.3), sh(c.cloth, -0.4)]));
      P.rrect(g, 7.4, 9.4, 9.2, 8, 2.2, P.lg(g, 7, 9, 16, 17, [sh(pl, 0.5), pl, sh(pl, -0.45)]));
      P.path(g, [12, 10.4, 13, 13, 12, 15.6, 11, 13]); P.fill(g, sh(pl, -0.4));
      for (const x of [7.2, 16.8]) P.ell(g, x, 10.4, 2.6, 2, P.vol(g, x, 9.8, 2.6, pl));
      // mace in the near hand
      limb(g, 16.8, 11.6, 19, 16, 1.1, 1, pl); P.line(g, 19.4, 17, 21, 6, 0.8, c.dark);
      P.circle(g, 21.2, 5.2, 1.8, P.vol(g, 21, 5, 1.8, pl)); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; P.line(g, 21.2 + Math.cos(a) * 1.6, 5.2 + Math.sin(a) * 1.6, 21.2 + Math.cos(a) * 2.6, 5.2 + Math.sin(a) * 2.6, 0.5, sh(pl, 0.3)); }
      // the kite shield, a sun on it
      g.beginPath(); g.moveTo(2.2, 11.4); g.quadraticCurveTo(6, 10, 9.6, 11.4); g.lineTo(9.2, 18.6); g.quadraticCurveTo(6, 23.6, 5.8, 24.2); g.quadraticCurveTo(2.8, 21, 2.4, 18.6); g.closePath();
      P.fill(g, P.lg(g, 2, 11, 10, 24, [sh(c.cloth, 0.2), sh(c.cloth, -0.5)])); g.strokeStyle = pl; g.lineWidth = 0.9; g.stroke();
      P.circle(g, 5.9, 16, 1.6, pl); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; P.line(g, 5.9 + Math.cos(a) * 1.8, 16 + Math.sin(a) * 1.8, 5.9 + Math.cos(a) * 2.8, 16 + Math.sin(a) * 2.8, 0.4, pl); }
      // the helm with gilt wings
      const hx = 12.4, hy = 5.8;
      for (const s of [-1, 1]) { P.path(g, [hx + s * 2.4, hy - 1, hx + s * 7, hy - 5, hx + s * 6, hy - 2.6, hx + s * 7.4, hy - 2, hx + s * 3, hy + 0.6]); P.fill(g, P.lg(g, hx, hy - 5, hx + s * 7, hy, [sh(pl, 0.5), sh(pl, -0.2)])); }
      P.rrect(g, hx - 3.2, hy - 3.6, 6.4, 7.2, 2.2, P.lg(g, hx - 3, 0, hx + 3, 0, [sh(pl, 0.5), pl, sh(pl, -0.4)]));
      P.rect(g, hx - 2.2, hy - 0.2, 5, 0.9, '#140a04'); P.glow(g, hx + 0.4, hy + 0.2, 3, c.eye, 0.5); P.rect(g, hx - 1.2, hy + 0.05, 3.4, 0.4, c.eye);
    } });

  /* ---------- Vault Warden: a floating hooded warden, a golden mask, a lantern of ward-light on a chain ---------- */
  def('vaultwarden', { w: 22, h: 28, cy: 18, frames: 2,
    colors: { robe: '#2a2440', gold: '#d8b050', light: '#fff0a0' },
    draw(g, f, c) {
      const r = c.robe, sway = f ? 0.8 : -0.8;
      P.glow(g, 11, 16, 11, c.light, 0.18);
      g.beginPath(); g.moveTo(7, 9); g.lineTo(15, 9); g.quadraticCurveTo(17.6, 17, 16 + sway, 25); g.quadraticCurveTo(13, 23, 11, 26); g.quadraticCurveTo(9, 23, 6 - sway, 25); g.quadraticCurveTo(4.4, 17, 7, 9); g.closePath();
      P.fill(g, P.lg(g, 0, 9, 0, 26, [sh(r, 0.35), r, G.rgba(r, 0.2)]));
      P.line(g, 11, 10, 11, 22, 0.6, c.gold); P.line(g, 7.6, 12, 14.4, 12, 0.6, c.gold);
      // the lantern on its chain, swinging
      limb(g, 15, 11, 17.6, 14, 0.9, 0.8, r); P.line(g, 17.8, 14, 18.6 + sway, 18, 0.35, '#8a7a5a');
      P.glow(g, 18.8 + sway, 20, 6, c.light, 0.7); P.rrect(g, 17.4 + sway, 18, 2.8, 3.8, 0.6, G.rgba(c.light, 0.9)); P.rect(g, 17.2 + sway, 17.6, 3.2, 0.7, c.gold); P.rect(g, 17.2 + sway, 21.6, 3.2, 0.7, c.gold);
      limb(g, 7, 11, 4, 15, 0.9, 0.8, sh(r, -0.2)); claws(g, 3.8, 15.4, -0.4, 3, 1.2, 0.3, c.gold);
      // hood and golden mask
      g.beginPath(); g.moveTo(6.4, 10); g.quadraticCurveTo(6, 2, 11, 1.4); g.quadraticCurveTo(16, 2, 15.6, 10); g.quadraticCurveTo(11, 8.4, 6.4, 10); g.closePath();
      P.fill(g, P.lg(g, 6, 1, 16, 10, [sh(r, 0.4), r, sh(r, -0.5)]));
      P.ell(g, 11.4, 6, 2.6, 3, P.lg(g, 9, 3, 14, 9, ['#fff0b0', c.gold, sh(c.gold, -0.4)]));
      P.path(g, [9.6, 5.4, 11, 5.8, 9.8, 6.2]); P.fill(g, '#0a0604'); P.path(g, [13.2, 5.4, 11.8, 5.8, 13, 6.2]); P.fill(g, '#0a0604');
      P.line(g, 10.4, 7.8, 12.4, 7.8, 0.35, sh(c.gold, -0.5));
    } });

  /* ---------- Coin Wraith: a greedy ghost: a hooded shade in a tattered robe, arms flung wide in grasping sleeves,
   *            one hand holding up a coin, the other raking in a rain of coins; a heap of gold below ---------- */
  def('coinwraith', { w: 28, h: 30, cy: 17, frames: 2,
    colors: { shade: '#26302a', eye: '#fff080' },
    draw(g, f, c) {
      const sd = c.shade, lit = sh(sd, 0.55), dk = sh(sd, -0.55), bone = '#d8cfb4', w = f ? 1 : -1;
      // a flat gold coin with a dark rim and a square hole: reads as a coin even when tiny
      const coinQ = (x, y, r, t) => { P.ell(g, x, y, r * t + 0.3, r + 0.3, '#3a2204'); P.ell(g, x, y, r * t, r, P.lg(g, x - r, y - r, x + r, y + r, ['#fff4b0', '#e8b830', '#a87010'])); if (t > 0.45) P.rect(g, x - 0.35 * t, y - 0.35, 0.7 * t, 0.7, '#3a2204'); };
      P.glow(g, 14, 16, 13, '#ffd050', 0.2);
      // the heap below and the coins raining into it
      for (const [x, y, r, t] of [[9.6, 27.4, 1.7, 1], [13, 27.8, 1.8, 1], [16.4, 27.4, 1.7, 0.9], [11.2, 25.8, 1.6, 0.8], [14.8, 25.8, 1.6, 1], [13, 24.2, 1.5, 0.9]]) coinQ(x, y, r, t);
      for (const [x, y, r, t] of [[13.4 + w * 0.4, 21.6, 1.4, 0.3], [11.6, 22.6 - w * 0.4, 1.3, 1], [15.4, 22.2 + w * 0.4, 1.2, 0.6]]) coinQ(x, y, r, t);
      // the robe: shoulders to torn tails spreading wide
      g.beginPath(); g.moveTo(9.6, 9.6); g.quadraticCurveTo(14, 8, 18.4, 9.6); g.quadraticCurveTo(20.4, 15, 21.6 + w * 0.5, 20.6);
      g.lineTo(18.8, 18.8); g.lineTo(17.2, 21.6); g.lineTo(15.4, 19); g.lineTo(13.6, 21.8 + w * 0.4); g.lineTo(11.8, 19); g.lineTo(10.2, 21.4); g.lineTo(8.4, 18.8); g.lineTo(6.4 - w * 0.5, 20.4);
      g.quadraticCurveTo(7.6, 15, 9.6, 9.6); g.closePath(); P.fill(g, P.lg(g, 6, 8, 22, 21, [lit, sd, dk]));
      g.strokeStyle = dk; g.lineWidth = 0.4; for (const x of [11.6, 14, 16.4]) { g.beginPath(); g.moveTo(x, 11); g.quadraticCurveTo(x - 0.3, 15.4, x - 0.2, 19); g.stroke(); }
      // sleeves flung wide, ragged at the cuffs
      const sleeve = (x0, y0, x1, y1, col) => { g.beginPath(); g.moveTo(x0, y0 - 1.4); g.quadraticCurveTo((x0 + x1) / 2, y0 - 2, x1, y1 - 2); g.lineTo(x1 + (x1 > x0 ? 0.6 : -0.6), y1 + 1.8); g.lineTo(x1 + (x1 > x0 ? -0.8 : 0.8), y1 + 0.8); g.lineTo(x1 + (x1 > x0 ? -1.6 : 1.6), y1 + 2.2); g.quadraticCurveTo((x0 + x1) / 2, y0 + 2, x0, y0 + 1.6); g.closePath(); P.fill(g, col); };
      sleeve(9.8, 11.4, 3.6, 14.6 + w * 0.4, P.lg(g, 3, 9, 10, 15, [dk, sd]));
      sleeve(18.2, 11.2, 23.8, 9.4 - w * 0.3, P.lg(g, 18, 8, 24, 13, [lit, sd]));
      // bony hands: one raking at the falling coins, one holding a coin up high
      claws(g, 3.2, 15.8 + w * 0.4, 1.9, 4, 1.8, 0.4, bone);
      claws(g, 24.4, 8.6 - w * 0.3, -1.3, 4, 1.6, 0.4, bone); coinQ(25.2, 5.8 - w * 0.3, 1.9, 1);
      // the hood, dark within, two eyes glowing like coins, a fanged grin
      g.beginPath(); g.moveTo(9.4, 10.6); g.quadraticCurveTo(8.8, 2.4, 14, 1.8); g.quadraticCurveTo(19.2, 2.4, 18.6, 10.6); g.quadraticCurveTo(14, 8.8, 9.4, 10.6); g.closePath();
      P.fill(g, P.lg(g, 9, 1.8, 19, 10.6, [lit, sd, dk]));
      P.ell(g, 14.4, 6.6, 3, 3.1, '#050806'); P.glow(g, 14.4, 6.4, 4, c.eye, 0.45);
      evil(g, 13.2, 6.2, 0.7, c.eye, 0); evil(g, 15.6, 6.2, 0.7, c.eye, 0);
      teeth(g, 13, 8.1, 15.8, 8.1, 4, 0.6, 1, bone);
    } });

  /* ---------- Mimic King (boss): a vast chest-beast, lid for a jaw, a crown jammed on its lid, gold spilling from its maw, legs of a beast ---------- */
  def('mimicking', { w: 54, h: 48, cy: 34, frames: 2,
    colors: { wood: '#5a3016', band: '#d8a83a', tongue: '#c83050', eye: '#ffe060' },
    draw(g, f, c) {
      const wd = c.wood, bd = c.band, w = f ? 1 : -1;
      P.ell(g, 27, 45.6, 20, 2.6, 'rgba(0,0,0,0.5)');
      // bestial legs beneath the chest
      for (const [x, d, col] of [[12, -w, sh(wd, -0.4)], [20, w, sh(wd, -0.2)], [34, -w, sh(wd, -0.4)], [42, w, sh(wd, -0.2)]]) { limb(g, x, 34, x + d * 2, 44, 2.4, 2, col); claws(g, x + d * 2, 44.6, 0, 3, 1.8, 0.5, '#1a0a04'); }
      // the chest
      P.rrect(g, 6, 22, 42, 14, 2, P.lg(g, 6, 0, 48, 0, [sh(wd, -0.4), sh(wd, 0.2), wd, sh(wd, -0.5)]));
      for (const x of [6, 18, 30, 44.6]) P.rect(g, x, 22, 3.4, 14, P.lg(g, 0, 22, 0, 36, [sh(bd, 0.4), sh(bd, -0.45)]));
      // the maw between chest and lid: rows of teeth, the tongue, gold spilling
      P.ell(g, 27, 22, 20, 5 + (f ? 1.2 : 0), '#1a0408');
      teeth(g, 8, 22.6, 46, 22.6, 14, 2.6, 1, '#efe4c8'); teeth(g, 9, 19.6 - (f ? 1.2 : 0), 45, 19.6 - (f ? 1.2 : 0), 13, -2.2, 1, '#efe4c8');
      g.beginPath(); g.moveTo(27, 22); g.quadraticCurveTo(38, 30, 48 + w * 2, 26); g.strokeStyle = c.tongue; g.lineWidth = 3; g.lineCap = 'round'; g.stroke();
      for (const [x, y] of [[14, 27], [17, 30], [36, 29], [22, 31], [40, 33]]) coin(g, x, y, 1.4, 0.7);
      // the lid, raised like a jaw, eyes glaring under it
      g.beginPath(); g.moveTo(6, 19); g.quadraticCurveTo(8, 4, 27, 3); g.quadraticCurveTo(46, 4, 48, 19); g.quadraticCurveTo(27, 16, 6, 19); g.closePath();
      P.fill(g, P.lg(g, 0, 3, 0, 19, [sh(wd, 0.35), wd, sh(wd, -0.4)]));
      for (const x of [9, 20, 33, 44]) P.line(g, x, 18, x + (27 - x) * 0.15, 5, 2.4, bd);
      evil(g, 19, 14, 1.4, c.eye); evil(g, 35, 14, 1.4, c.eye); P.glow(g, 27, 14, 12, c.eye, 0.3);
      // a crown jammed on top
      P.rect(g, 19, 1.4, 16, 3, P.lg(g, 0, 1, 0, 4, ['#fff0a0', bd]));
      for (let i = 0; i < 5; i++) P.path(g, [19 + i * 3.6, 1.6, 20.8 + i * 3.6, -2.6, 22.6 + i * 3.6, 1.6]); P.fill(g, bd);
      for (const [x, col] of [[23, '#e03040'], [27, '#40e0c0'], [31, '#e03040']]) P.circle(g, x, 2.8, 0.8, col);
    } });

  /* ---------- Gilded Sentinel (boss): a towering golden guardian, a tower shield and a long spear, a sunburst halo ---------- */
  def('sentinel', { w: 50, h: 62, cy: 40, frames: 2,
    colors: { plate: '#d0a840', dark: '#4a3010', light: '#fff4c0', cloth: '#1e2a5a' },
    draw(g, f, c) {
      const pl = c.plate, w = f ? 0.8 : -0.8;
      P.ell(g, 25, 59, 15, 2.6, 'rgba(0,0,0,0.5)');
      // halo behind the head
      P.glow(g, 25, 11, 16, c.light, 0.4);
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + f * 0.1; P.line(g, 25 + Math.cos(a) * 8, 11 + Math.sin(a) * 8, 25 + Math.cos(a) * 12, 11 + Math.sin(a) * 12, 0.9, G.rgba(c.light, 0.8)); }
      // a long tabard
      P.path(g, [18, 30, 32, 30, 33, 55, 25, 57, 17, 55]); P.fill(g, P.lg(g, 17, 30, 33, 57, [sh(c.cloth, 0.3), sh(c.cloth, -0.5)])); P.line(g, 25, 32, 25, 54, 0.8, pl);
      // legs in greaves
      P.rrect(g, 18 - w, 38, 5, 20, 2, P.lg(g, 18, 0, 23, 0, [sh(pl, 0.35), sh(pl, -0.45)])); P.rrect(g, 27 + w, 38, 5, 20, 2, P.lg(g, 27, 0, 32, 0, [sh(pl, 0.45), sh(pl, -0.35)]));
      // cuirass with a sun boss
      P.rrect(g, 15, 18, 20, 16, 4, P.lg(g, 15, 18, 35, 34, [sh(pl, 0.55), pl, sh(pl, -0.45)]));
      P.circle(g, 25, 25, 2.6, sh(pl, 0.4)); P.circle(g, 25, 25, 1.4, c.light);
      for (const x of [14, 36]) P.ell(g, x, 20, 5, 3.6, P.vol(g, x, 19, 5, pl));
      // the spear in the near hand, raised
      limb(g, 36, 22, 39, 30, 2, 1.8, pl); P.line(g, 40, 58, 42, 0, 1.2, c.dark);
      P.path(g, [40.4, 4, 42, -4, 43.6, 4, 42, 6]); P.fill(g, P.lg(g, 40, -4, 44, 6, [c.light, pl]));
      // the tower shield in the far hand
      P.rrect(g, 3, 20, 13, 26, 3, P.lg(g, 3, 20, 16, 46, [sh(pl, 0.3), sh(pl, -0.35)])); P.rrect(g, 5, 22, 9, 22, 2, P.lg(g, 5, 22, 14, 44, [sh(c.cloth, 0.2), sh(c.cloth, -0.4)]));
      P.circle(g, 9.5, 33, 3, pl); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; P.line(g, 9.5 + Math.cos(a) * 3.2, 33 + Math.sin(a) * 3.2, 9.5 + Math.cos(a) * 4.8, 33 + Math.sin(a) * 4.8, 0.7, pl); }
      // a full helm, a crest, and a sliver of light for a face
      const hx = 25, hy = 11;
      P.rrect(g, hx - 5, hy - 6, 10, 12, 3.4, P.lg(g, hx - 5, 0, hx + 5, 0, [sh(pl, 0.55), pl, sh(pl, -0.45)]));
      P.path(g, [hx - 1, hy - 6, hx, hy - 12, hx + 1, hy - 6]); P.fill(g, pl);
      P.rect(g, hx - 0.6, hy - 3, 1.2, 7, '#0a0604'); P.rect(g, hx - 3.6, hy - 0.4, 7.2, 1.1, '#0a0604'); P.glow(g, hx, hy, 4, c.light, 0.6); P.rect(g, hx - 2.6, hy - 0.2, 5.2, 0.6, c.light);
    } });

  /* ---------- Hollow Magistrate (boss): an empty judge's robe floating upright, a powdered wig over nothing, scales in one hand and a gavel in the other ---------- */
  def('magistrate', { w: 50, h: 60, cy: 40, frames: 2,
    colors: { robe: '#1e1a24', gold: '#d8b050', wig: '#d8d4c8', eye: '#ff5040' },
    draw(g, f, c) {
      const r = c.robe, sway = f ? 1 : -1;
      P.ell(g, 25, 57, 13, 2.4, 'rgba(0,0,0,0.4)');
      // the robe: stiff folds, a golden chain of office, hollow inside
      g.beginPath(); g.moveTo(17, 18); g.lineTo(33, 18); g.quadraticCurveTo(38, 36, 38 + sway, 52); g.lineTo(12 + sway, 52); g.quadraticCurveTo(12, 36, 17, 18); g.closePath();
      P.fill(g, P.lg(g, 12, 18, 38, 52, [sh(r, 0.35), r, sh(r, -0.5)]));
      rag(g, 12 + sway, 51.6, 38 + sway, 51.6, 8, 2.6, sh(r, -0.4));
      g.strokeStyle = sh(r, -0.5); g.lineWidth = 0.7; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(20 + i * 3.4, 22); g.lineTo(17 + i * 5.4, 50); g.stroke(); }
      g.beginPath(); g.moveTo(18, 20); g.quadraticCurveTo(25, 30, 32, 20); g.strokeStyle = c.gold; g.lineWidth = 1.2; g.stroke(); P.circle(g, 25, 26, 2, P.vol(g, 25, 25.4, 2, c.gold));
      // arms: empty sleeves; scales held out, a gavel raised
      limb(g, 17, 21, 9, 28, 2.4, 2.2, sh(r, -0.2));
      P.line(g, 8, 28, 8, 36, 0.6, c.gold); P.line(g, 2, 32 - sway * 0.8, 14, 32 + sway * 0.8, 0.8, c.gold);
      for (const [x, y] of [[2, 32 - sway * 0.8], [14, 32 + sway * 0.8]]) { P.line(g, x, y, x - 2, y + 4, 0.3, c.gold); P.line(g, x, y, x + 2, y + 4, 0.3, c.gold); P.ell(g, x, y + 4.4, 2.6, 0.9, P.lg(g, 0, y + 3.6, 0, y + 5.2, ['#fff0a0', c.gold])); }
      limb(g, 33, 21, 40, 16, 2.4, 2.2, r); P.line(g, 40, 17, 44, 7, 1.2, '#3a2010'); P.rrect(g, 40, 3, 9, 5, 1.4, P.lg(g, 40, 3, 49, 8, ['#6a4a24', '#2a1a0a'])); P.rect(g, 42, 3, 1, 5, c.gold); P.rect(g, 46, 3, 1, 5, c.gold);
      // no head: a powdered wig floating over the empty collar, two red points of light within
      P.ell(g, 25, 18, 5, 1.8, '#050308');
      const hx = 25, hy = 10;
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) P.ell(g, hx + s * 5.4, hy + 1 + k * 3, 2, 1.6, P.vol(g, hx + s * 5.4, hy + k * 3, 2, c.wig));
      P.ell(g, hx, hy - 1, 6, 4, P.vol(g, hx, hy - 2, 6, c.wig)); P.ell(g, hx, hy + 3, 4, 3.6, '#050308');
      evil(g, hx - 1.4, hy + 3, 0.7, c.eye); evil(g, hx + 1.4, hy + 3, 0.7, c.eye); P.glow(g, hx, hy + 3, 5, c.eye, 0.35);
    } });

  /* ---------- Gold Custodian (Lord): a colossal masked guardian of the vault in gilded robes, a great key for a staff, gold orbiting it ---------- */
  def('custodian', { w: 58, h: 66, cy: 44, frames: 2,
    colors: { robe: '#5a1a24', gold: '#e0b840', mask: '#fff0b0', light: '#fff4c0', eye: '#40e0ff' },
    draw(g, f, c) {
      const r = c.robe, gd = c.gold, sway = f ? 1 : -1;
      P.ell(g, 29, 63, 18, 2.8, 'rgba(0,0,0,0.5)'); P.glow(g, 29, 34, 26, c.light, 0.2);
      // gold coins orbiting behind
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + f * 0.4; if (Math.sin(a) > 0) continue; coin(g, 29 + Math.cos(a) * 25, 34 + Math.sin(a) * 7, 1.8, 0.5 + 0.5 * Math.abs(Math.cos(a))); }
      // heavy robes, gold hems and a vault-door pattern
      g.beginPath(); g.moveTo(18, 20); g.lineTo(40, 20); g.quadraticCurveTo(47, 40, 48 + sway, 60); g.lineTo(10 + sway, 60); g.quadraticCurveTo(11, 40, 18, 20); g.closePath();
      P.fill(g, P.lg(g, 10, 20, 48, 60, [sh(r, 0.35), r, sh(r, -0.55)]));
      P.rect(g, 10 + sway, 57, 38, 2, gd); P.line(g, 29, 22, 29, 57, 1.4, gd);
      P.circle(g, 29, 40, 6, sh(gd, -0.3)); P.circle(g, 29, 40, 4.6, P.vol(g, 29, 39, 4.6, gd)); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; P.line(g, 29, 40, 29 + Math.cos(a) * 4, 40 + Math.sin(a) * 4, 0.6, sh(gd, -0.5)); }
      // mantle with gold pauldrons
      for (const x of [16, 42]) { P.ell(g, x, 22, 7, 4.6, P.vol(g, x, 21, 7, gd)); P.ell(g, x, 23, 5, 2, G.rgba(sh(gd, -0.4), 0.6)); }
      // the great key in the near hand
      limb(g, 44, 24, 49, 34, 2.6, 2.2, r); P.line(g, 50, 60, 52, 12, 1.8, gd);
      g.beginPath(); g.arc(52.2, 8, 4, 0, Math.PI * 2); g.strokeStyle = gd; g.lineWidth = 1.6; g.stroke(); P.circle(g, 52.2, 8, 1.6, c.eye);
      P.rect(g, 49.4, 52, 3, 1.4, gd); P.rect(g, 49.4, 55, 4, 1.4, gd);
      // far hand raised, light in the palm
      limb(g, 14, 24, 7, 30, 2.6, 2.2, sh(r, -0.2)); P.glow(g, 6, 29, 6, c.light, 0.7); P.circle(g, 6, 29, 1.6, c.light);
      // a tall crowned hood and a serene golden mask with blue eyes
      g.beginPath(); g.moveTo(20, 22); g.quadraticCurveTo(19, 4, 29, 3); g.quadraticCurveTo(39, 4, 38, 22); g.quadraticCurveTo(29, 18, 20, 22); g.closePath();
      P.fill(g, P.lg(g, 19, 3, 39, 22, [sh(r, 0.4), r, sh(r, -0.5)]));
      P.ell(g, 29, 13, 5.4, 6.4, P.lg(g, 24, 7, 34, 20, [c.mask, gd, sh(gd, -0.45)]));
      P.path(g, [25.6, 12, 28, 12.8, 25.8, 13.4]); P.fill(g, '#0a0604'); P.path(g, [32.4, 12, 30, 12.8, 32.2, 13.4]); P.fill(g, '#0a0604');
      P.glow(g, 29, 12.8, 5, c.eye, 0.5); P.circle(g, 26.6, 12.7, 0.5, c.eye); P.circle(g, 31.4, 12.7, 0.5, c.eye);
      P.line(g, 27.4, 17, 30.6, 17, 0.5, sh(gd, -0.5));
      P.rect(g, 22, 3, 14, 2.4, gd); for (let i = 0; i < 4; i++) P.path(g, [22 + i * 4, 3.2, 24 + i * 4, -1.6, 26 + i * 4, 3.2]); P.fill(g, gd);
      // coins orbiting in front
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + f * 0.4; if (Math.sin(a) <= 0) continue; coin(g, 29 + Math.cos(a) * 25, 34 + Math.sin(a) * 7, 2, 0.5 + 0.5 * Math.abs(Math.cos(a))); }
    } });

  /* ================= Hall secrets ================= */
  /* ---------- Cyclops (secret boss): a hulking one-eyed giant in hides, a tree-trunk club, a single great eye ---------- */
  def('cyclops', { w: 50, h: 56, cy: 36, frames: 2,
    colors: { skin: '#8a6a52', hide: '#4a3020', eye: '#ffb030', club: '#4a3420' },
    draw(g, f, c) {
      const sk = c.skin, sd = sh(sk, -0.45), w = f ? 1 : -1;
      P.ell(g, 25, 53.4, 15, 2.4, 'rgba(0,0,0,0.5)');
      // thick legs, hide boots
      limb(g, 19, 36, 17 - w, 51, 3.4, 3, sd); limb(g, 30, 36, 32 + w, 51, 3.4, 3, sk);
      P.rrect(g, 13.4 - w, 49, 7, 3.6, 1.2, c.hide); P.rrect(g, 29 + w, 49, 7, 3.6, 1.2, c.hide);
      // a hide loincloth and a pot belly
      P.ell(g, 25, 28, 12, 11, P.rg(g, 23, 25, 12, [[0, sh(sk, 0.3)], [0.6, sk], [1, sd]]));
      P.path(g, [13, 32, 37, 32, 38, 40, 32, 38, 26, 42, 20, 38, 13, 40]); P.fill(g, P.lg(g, 13, 32, 38, 42, [sh(c.hide, 0.3), sh(c.hide, -0.4)]));
      P.line(g, 13.4, 32.4, 36.6, 32.4, 1.2, sh(c.hide, -0.5));
      g.strokeStyle = G.rgba(sd, 0.6); g.lineWidth = 0.6; g.beginPath(); g.moveTo(20, 22); g.quadraticCurveTo(25, 24, 30, 22); g.stroke(); // chest line
      // arms: the far one hanging, the near one hefting a club over the shoulder
      limb(g, 14, 20, 8, 34 + w, 3, 2.6, sd); claws(g, 7.6, 34.6 + w, -1, 4, 2.2, 0.6, sd);
      limb(g, 36, 20, 42, 28, 3, 2.6, sk); limb(g, 42, 28, 44, 20, 2.6, 2.4, sk);
      g.save(); g.translate(44, 20); g.rotate(-0.5 + (f ? 0.08 : 0));
      P.rrect(g, -2, -22, 5.4, 26, 2.4, P.lg(g, -2, 0, 3.4, 0, [sh(c.club, 0.3), c.club, sh(c.club, -0.5)])); P.ell(g, 0.7, -21, 3.8, 3, P.vol(g, 0.7, -22, 3.8, c.club));
      for (const [x, y] of [[-1.4, -17], [2.6, -13], [-1, -9]]) P.circle(g, x, y, 0.8, '#8a8a90'); // iron studs
      g.restore();
      // the head: low brow, a single great eye, tusks, a wide mouth
      const hx = 25, hy = 11;
      P.ell(g, hx, hy, 8, 7.4, P.vol(g, hx, hy - 1, 8, sk));
      P.ell(g, hx, hy - 3.6, 7, 2.4, sh(sk, -0.2));
      P.ell(g, hx, hy - 0.6, 3.6, 3, '#f0e8d0'); P.glow(g, hx, hy - 0.6, 6, c.eye, 0.5); P.circle(g, hx + 0.6, hy - 0.4, 1.9, c.eye); P.ell(g, hx + 0.6, hy - 0.4, 0.6, 1.6, '#140804');
      P.path(g, [hx - 4.6, hy + 3.6, hx + 4.6, hy + 3.6, hx + 3.6, hy + 6, hx - 3.6, hy + 6]); P.fill(g, '#2a0a06');
      horn(g, hx - 3.4, hy + 4.4, hx - 3.8, hy + 2.6, hx - 3.4, hy + 1, 0.6, '#efe8d0'); horn(g, hx + 3.4, hy + 4.4, hx + 3.8, hy + 2.6, hx + 3.4, hy + 1, 0.6, '#efe8d0');
      P.circle(g, hx - 7.6, hy, 1.6, sd); P.circle(g, hx + 7.6, hy, 1.6, sk); // ears
    } });

  /* ---------- Ghoul Lieutenant (secret boss): a huge frost-gnawed ghoul captain in scraps of armour, a bone banner on its back, a butcher's cleaver ---------- */
  def('ghoullt', { w: 48, h: 50, cy: 32, frames: 2,
    colors: { skin: '#8aa6bc', plate: '#3a4658', banner: '#6a1a24', bone: '#d8d4c4', eye: '#8ff0ff' },
    draw(g, f, c) {
      const sk = c.skin, sd = sh(sk, -0.5), w = f ? 1 : -1;
      P.ell(g, 24, 47.6, 15, 2.4, 'rgba(0,0,0,0.5)');
      // the banner on a pole of bone behind it
      P.line(g, 13, 44, 10, 2, 1.2, c.bone); P.circle(g, 10, 2, 1.6, c.bone);
      g.beginPath(); g.moveTo(10.4, 4); g.lineTo(2 + w, 6); g.lineTo(3 + w, 18); g.lineTo(6 + w, 15); g.lineTo(8 + w, 19); g.lineTo(10.8, 16); g.closePath(); P.fill(g, P.lg(g, 2, 4, 11, 19, [sh(c.banner, 0.3), sh(c.banner, -0.5)]));
      skull(g, 6 + w * 0.5, 10.4, 1.8, c.bone, null);
      // hunched legs, backward bent
      limb(g, 18, 34, 14 - w, 40, 3, 2.4, sd); limb(g, 14 - w, 40, 16 - w, 46, 2.4, 2, sd); claws(g, 16 - w, 46.4, 0.6, 3, 2, 0.5, '#1a1a20');
      limb(g, 30, 34, 34 + w, 40, 3, 2.4, sk); limb(g, 34 + w, 40, 32 + w, 46, 2.4, 2, sk); claws(g, 32 + w, 46.4, 0.6, 3, 2, 0.5, '#1a1a20');
      // a hunched torso, ribs, a strapped breastplate
      P.ell(g, 24, 26, 12, 10, P.rg(g, 22, 22, 12, [[0, sh(sk, 0.3)], [0.6, sk], [1, sd]]));
      P.rrect(g, 16, 22, 14, 10, 3, P.lg(g, 16, 22, 30, 32, [sh(c.plate, 0.4), c.plate, sh(c.plate, -0.5)]));
      P.line(g, 16, 25, 30, 29, 1, '#4a3020'); for (const x of [20, 25]) P.circle(g, x, 27, 0.7, sh(c.plate, 0.5));
      for (let i = 0; i < 3; i++) P.line(g, 31, 25 + i * 2.4, 35, 26 + i * 2.4, 0.6, sd); // ribs showing
      // arms: long, the near one with a cleaver
      limb(g, 14, 20, 6, 32 + w, 2.4, 2, sd); claws(g, 5.6, 32.6 + w, -1, 4, 3, 0.5, '#1a1a20');
      limb(g, 34, 20, 40, 30, 2.4, 2, sk);
      P.line(g, 40, 30, 42, 26, 1.2, '#3a2a1a'); P.path(g, [41, 27, 47, 18, 49, 22, 44, 30]); P.fill(g, P.lg(g, 41, 18, 49, 30, ['#e0e4ec', '#6a7080'])); P.line(g, 46.6, 18.6, 48.6, 22, 0.4, '#8a2a2a');
      // the head thrust forward: a split jaw, long teeth, pale eyes, frost in the hair
      const hx = 30, hy = 13;
      P.ell(g, hx, hy, 6, 5, P.vol(g, hx, hy - 1, 6, sk));
      P.path(g, [hx - 1, hy + 1.6, hx + 7, hy + 1, hx + 6, hy + 5.4, hx, hy + 4]); P.fill(g, '#1a0a10');
      teeth(g, hx, hy + 1.8, hx + 6.6, hy + 1.2, 5, 1.2, 1, '#efe8d0'); teeth(g, hx + 0.4, hy + 4, hx + 6, hy + 5, 4, -1, 1, '#efe8d0');
      evil(g, hx + 1.6, hy - 1.4, 0.8, c.eye); evil(g, hx - 1.6, hy - 1.6, 0.7, c.eye);
      for (let i = 0; i < 5; i++) P.line(g, hx - 5 + i * 1.8, hy - 4.4, hx - 6 + i * 1.6, hy - 7 - (i % 2), 0.7, '#d8f0ff');
    } });

  /* ---------- Gilded Ooze (treasure): a glossy golden jelly, coins and a jewelled goblet suspended in it, a crown of drips ---------- */
  def('gildedooze', { w: 24, h: 22, cy: 16, frames: 2,
    colors: { gold: '#e8b830', core: '#fff4a0' },
    draw(g, f, c) {
      const sq = f ? 0.6 : 0;
      P.ell(g, 12, 20, 9, 1.4, 'rgba(0,0,0,0.45)'); P.glow(g, 12, 13, 12, c.core, 0.35);
      g.beginPath(); g.moveTo(3 - sq, 19); g.quadraticCurveTo(2 - sq, 8 + sq, 12, 5 + sq * 1.4); g.quadraticCurveTo(22 + sq, 8 + sq, 21 + sq, 19); g.quadraticCurveTo(12, 20.4, 3 - sq, 19); g.closePath();
      P.fill(g, P.rg(g, 9, 9, 13, [[0, G.rgba('#fff8d0', 0.95)], [0.4, G.rgba(c.gold, 0.9)], [1, G.rgba(sh(c.gold, -0.5), 0.95)]]));
      // treasure inside
      coin(g, 8, 15, 1.6, 0.8); coin(g, 15.4, 16, 1.4, 0.5); coin(g, 11, 17.4, 1.2, 0.9); coin(g, 16, 11.6, 1.1, 0.6);
      P.path(g, [10.4, 9.6, 13.6, 9.6, 12.8, 12.4, 12.4, 12.6, 12.4, 14, 13.4, 14.6, 10.6, 14.6, 11.6, 14, 11.6, 12.6, 11.2, 12.4]); P.fill(g, P.lg(g, 10, 9, 14, 15, ['#fff0a0', '#a87a20'])); P.circle(g, 12, 11, 0.6, '#e03040');
      // a glossy highlight and drips on top
      P.ell(g, 8, 8.6 + sq, 2.6, 1.2, G.rgba('#ffffff', 0.55), -0.4);
      drips(g, [[6, 17.6, 1.6], [18, 17.4, 1.2]], G.rgba(c.gold, 0.9));
      // two dim eyes
      P.circle(g, 10, 11.4 + sq, 0.7, '#3a2004'); P.circle(g, 14.4, 11.4 + sq, 0.7, '#3a2004');
    } });
  Object.assign(P, { horn, cracks, barnacles, icicle, crystal, drips, coin }); // shared helpers
})(window.DH);
