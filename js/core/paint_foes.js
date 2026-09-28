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
  def('gravechief', { w: 52, h: 50, cy: 30, grow: [3, 0, 0, 0], frames: 2,
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

  /* ---------- Flamedancer (boss): a lean obsidian demoness on goat legs, one hoof lifted in the dance, a tail tipped with fire,
   *            long horns and hair of flame, an open fan of fire in each hand, their rims burning ---------- */
  def('flamedancer', { w: 44, h: 54, cy: 34, frames: 2,
    colors: { skin: '#2a1614', silk: '#8a1a14', gold: '#e0a040', fire: '#ff8a2a', eye: '#fff0a0' },
    draw(g, f, c) {
      const wv = f ? 1 : -1, sk = sh(c.skin, 0.3), skl = sh(c.skin, 0.75), skd = sh(c.skin, -0.25), F = c.fire, HOT = '#ffe070';
      const band = (pts, w0, cols) => {
        const [x0, y0, a1, b1, a2, b2, x1, y1] = pts;
        g.beginPath(); g.moveTo(x0, y0 - w0); g.bezierCurveTo(a1, b1 - w0, a2, b2 - w0 * 0.5, x1, y1); g.bezierCurveTo(a2, b2 + w0 * 0.5, a1, b1 + w0, x0, y0 + w0); g.closePath();
        P.fill(g, P.lg(g, x0, y0, x1, y1, cols));
      };
      /** An open fan pivoting at (x,y), spread from angle a0 to a1, radius r: silk between dark ribs, the rim on fire. */
      const fan = (x, y, a0, a1, r) => {
        g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, a0, a1); g.closePath(); P.fill(g, P.rg(g, x, y, r, [[0, sh(c.silk, -0.3)], [0.7, c.silk], [1, sh(c.silk, 0.3)]]));
        for (let i = 0; i <= 5; i++) { const a = a0 + (a1 - a0) * i / 5; P.line(g, x, y, x + Math.cos(a) * r, y + Math.sin(a) * r, 0.35, '#1a0a08'); }
        g.beginPath(); g.arc(x, y, r, a0, a1); g.strokeStyle = G.rgba(F, 0.95); g.lineWidth = 1.6; g.stroke(); g.strokeStyle = HOT; g.lineWidth = 0.5; g.stroke();
        for (let i = 0; i < 3; i++) { const a = a0 + (a1 - a0) * (0.2 + i * 0.3), px = x + Math.cos(a) * r, py = y + Math.sin(a) * r, h = 2.6 + ((i + (f ? 1 : 0)) % 2) * 1.2;
          band([px, py, px + Math.cos(a) * h * 0.4, py + Math.sin(a) * h * 0.4 - 0.6, px + Math.cos(a) * h * 0.8, py + Math.sin(a) * h * 0.8 - 1.2, px + Math.cos(a) * h, py + Math.sin(a) * h - 1.6], 0.8, [G.rgba(F, 0.9), G.rgba(HOT, 0.3)]); }
        P.glow(g, x + Math.cos((a0 + a1) / 2) * r * 0.6, y + Math.sin((a0 + a1) / 2) * r * 0.6, r, F, 0.3);
        P.circle(g, x, y, 0.8, c.gold);
      };
      P.ell(g, 20, 51, 8, 1.4, 'rgba(0,0,0,0.45)');
      // the tail, curling up behind her, a flame at its tip
      band([19, 29, 15, 40, 8, 44 + wv, 5.4, 38.6], 1, [sk, skd, skd]);
      P.glow(g, 5.4, 38, 3, F, 0.7); band([5.6, 39.4, 4.4, 37, 3.4 - wv, 35, 4.6, 32 + wv], 1.2, [G.rgba(HOT, 0.95), G.rgba(F, 0.9), G.rgba(F, 0.1)]);
      // the far fan, held low and out to the side
      fan(9.6, 25.6, Math.PI * 0.5, Math.PI * 1.15, 7.2);
      // the standing leg (far): a goat's leg, knee forward, hock back, a cloven hoof
      limb(g, 20, 29, 21.8, 36, 2.2, 1.4, skd); limb(g, 21.8, 36, 18.8, 42.6, 1.4, 1, skd); limb(g, 18.8, 42.6, 19.8, 48.6, 1, 0.8, skd);
      P.path(g, [18.4, 48.4, 21.4, 48.4, 22, 50.4, 18, 50.4]); P.fill(g, '#140a08');
      // the lifted leg (near): thigh raised, the shin folded back, the hoof pointed
      limb(g, 23.6, 29.4, 30.4 + wv * 0.4, 32, 2.3, 1.5, sk); P.circle(g, 30.4 + wv * 0.4, 32, 1.5, P.vol(g, 30, 31.4, 1.5, skl));
      limb(g, 30.4 + wv * 0.4, 32, 27.6 + wv * 0.4, 38.4, 1.4, 1, sk); limb(g, 27.6 + wv * 0.4, 38.4, 30.4 + wv * 0.4, 41.4, 1, 0.8, sk);
      P.path(g, [29.8 + wv * 0.4, 40.4, 32.2 + wv * 0.4, 41, 32 + wv * 0.4, 42.8, 29.6 + wv * 0.4, 42.2]); P.fill(g, '#140a08');
      P.line(g, 28.6, 37.2, 29.6, 36.6, 0.7, c.gold); // an anklet
      // a silk loincloth fluttering from a gold girdle
      P.path(g, [18, 26.6, 26.4, 26.6, 26.8, 28.6, 24 + wv, 33.4, 22, 29.4, 19.6, 33 - wv, 17.6, 28.6]); P.fill(g, P.lg(g, 18, 26, 18, 33, [sh(c.silk, 0.45), sh(c.silk, -0.35)]));
      P.rrect(g, 17.6, 25.8, 9.2, 1.6, 0.6, P.lg(g, 0, 25.8, 0, 27.4, [sh(c.gold, 0.35), sh(c.gold, -0.35)]));
      // the torso: lean and twisting, the waist pinched, cracks of fire
      g.beginPath(); g.moveTo(18.4, 26.2); g.quadraticCurveTo(20.4, 21.6, 17.4, 16.6); g.quadraticCurveTo(22, 14.4, 27.6, 16.6); g.quadraticCurveTo(24.6, 21.6, 26.4, 26.2); g.closePath();
      P.fill(g, P.lg(g, 16, 14, 28, 27, [skl, sk, skd]));
      cracks(g, [[21.6, 16.4, 22.6, 19.2, 21.8, 22.2, 22.6, 25.2], [25.4, 17.6, 24.4, 20.4]], F, 0.45);
      P.glow(g, 22.4, 21, 3.6, F, 0.35);
      // the far arm down to the low fan
      limb(g, 18, 17, 13.6, 21.4, 1.1, 0.9, skd); limb(g, 13.6, 21.4, 10.2, 25, 0.9, 0.7, skd); P.line(g, 11.2, 23.4, 12.4, 24.6, 0.6, c.gold);
      // the head: a long face, two long horns sweeping up and back, hair of fire streaming behind
      const hx = 22.8, hy = 10.4;
      band([hx - 1, hy - 2, hx - 5, hy - 4.6, hx - 9 + wv, hy - 6, hx - 13 - wv, hy - 9.4], 2.4, [G.rgba(F, 0.95), G.rgba(sh(F, -0.25), 0.85), G.rgba(sh(F, -0.4), 0.1)]);
      band([hx - 0.4, hy - 2.4, hx - 3.4, hy - 5.6, hx - 6 - wv, hy - 8, hx - 8.6 + wv, hy - 12.4], 1.7, [G.rgba(HOT, 0.9), G.rgba(F, 0.85), G.rgba(F, 0.1)]);
      horn(g, hx - 1.4, hy - 2.2, hx - 4.6, hy - 6.4, hx - 3.4, hy - 10, 1, '#2a1c18'); horn(g, hx + 1, hy - 2.6, hx + 3.4, hy - 7, hx + 2.2, hy - 10.4, 1, '#3a2a24');
      P.path(g, [hx - 1.4, hy + 3, hx + 1.2, hy + 3, hx + 0.6, hy + 5.6, hx - 1.2, hy + 5.4]); P.fill(g, skd);
      g.beginPath(); g.moveTo(hx - 2.6, hy - 1.6); g.quadraticCurveTo(hx, hy - 3.8, hx + 2.6, hy - 1.6); g.lineTo(hx + 2.4, hy + 2); g.lineTo(hx + 0.4, hy + 4.4); g.lineTo(hx - 1.8, hy + 2.4); g.closePath();
      P.fill(g, P.lg(g, hx - 2.6, hy - 3, hx + 2.6, hy + 4, [skl, sk, skd]));
      P.path(g, [hx - 2.2, hy - 0.6, hx + 2.4, hy - 0.6, hx + 2, hy + 0.4, hx - 1.8, hy + 0.4]); P.fill(g, '#140404');
      evil(g, hx + 1.2, hy - 0.1, 0.62, c.eye, -0.35); evil(g, hx - 1, hy - 0.1, 0.55, c.eye, 0.35);
      P.path(g, [hx - 1, hy + 2, hx + 1.8, hy + 1.8, hx + 0.6, hy + 3.4]); P.fill(g, '#1a0404'); P.glow(g, hx + 0.4, hy + 2.4, 1.6, F, 0.8);
      teeth(g, hx - 0.8, hy + 2, hx + 1.6, hy + 1.8, 3, 0.5, 1, '#f0e0c0');
      P.line(g, hx - 1.8, hy + 4.8, hx + 1.4, hy + 4.8, 0.7, c.gold);
      // the near arm raised, the other fan open high over her
      limb(g, 27.2, 17, 31, 12, 1.1, 0.9, sk); limb(g, 31, 12, 32.8, 9, 0.9, 0.7, skl); P.line(g, 31.6, 10.6, 33.2, 11, 0.6, c.gold);
      fan(33, 8.6, -Math.PI * 0.62, Math.PI * 0.08, 7);
    } });

  /* ---------- Ashen Warlord (boss): a hollow armour burned black, fire behind its visor and in the split of its breastplate,
   *            sharp angular plates, a cloak crumbling into ash, a greatsword of cooling slag held point-down ---------- */
  def('ashwarlord', { w: 48, h: 56, cy: 34, frames: 2,
    colors: { ash: '#5a5452', dark: '#221e20', ember: '#ff7030', eye: '#ffcf60', cloth: '#4a1c16' },
    draw(g, f, c) {
      const m = sh(c.dark, 0.35), ml = sh(c.ash, 0.2), md = sh(c.dark, -0.2), E = c.ember, w = f ? 0.8 : -0.8, HOT = '#ffe070';
      const plate = (pts, lit) => { P.path(g, pts); P.fill(g, P.lg(g, pts[0], pts[1], pts[pts.length - 2], pts[pts.length - 1], [lit ? ml : m, lit ? m : md])); };
      P.ell(g, 25, 52.8, 13, 2, 'rgba(0,0,0,0.45)');
      // the cloak: dark, shredded, the lower hem breaking up into drifting ash
      g.beginPath(); g.moveTo(16, 14.6); g.bezierCurveTo(9, 20, 6 - w, 32, 4 - w, 44); g.lineTo(9, 41.6); g.lineTo(11.6, 45); g.lineTo(14.4, 40.4); g.lineTo(18.6, 42); g.lineTo(20.6, 17); g.closePath();
      P.fill(g, P.lg(g, 4, 14, 20, 46, [sh(c.cloth, 0.2), c.cloth, G.rgba(sh(c.cloth, -0.5), 0.8)]));
      // legs: angular greaves, a pointed knee plate, sabatons tapering to a point
      const leg = (hx, kx, ax, col, lit) => {
        limb(g, hx, 35, kx, 43, 2.8, 2.2, col); limb(g, kx, 43, ax, 50, 2.2, 1.8, col);
        P.path(g, [kx - 2, 42, kx + 0.4, 39.6, kx + 2.4, 42.4, kx + 0.2, 45]); P.fill(g, P.lg(g, kx, 39.6, kx, 45, [lit, col]));
        P.path(g, [ax - 2.2, 49.4, ax + 1.6, 49.2, ax + 5, 51.8, ax - 2.4, 51.8]); P.fill(g, md);
      };
      leg(20.4, 17.4 - w * 0.4, 16.6 - w, md, m);
      leg(27.2, 29.6 + w * 0.4, 30.4 + w, m, ml);
      // the far arm reaching across behind to the hilt
      limb(g, 16.4, 18, 16.4, 26.4, 2.2, 1.8, md); limb(g, 16.4, 26.4, 29.4, 31.4, 1.8, 1.5, md);
      // hip plates, sharp-edged
      plate([17.6, 31.6, 22.4, 31.6, 21.8, 37.4, 18.4, 36], true); plate([22.6, 31.6, 27.4, 31.6, 27, 36.2, 23.4, 37.8], false); plate([27.6, 31.6, 31, 31.6, 30.6, 35.6, 28, 36.6], false);
      // the breastplate: a V of angular plates, split down the middle, fire burning inside the hollow
      g.beginPath(); g.moveTo(14.8, 15); g.lineTo(34, 15); g.lineTo(32, 23); g.lineTo(28.4, 31.8); g.lineTo(19.8, 31.8); g.lineTo(16.4, 23); g.closePath();
      P.fill(g, P.lg(g, 15, 15, 32, 32, [ml, m, md]));
      P.path(g, [15.4, 15.4, 23.4, 16.4, 22.6, 24.6, 16.2, 23.6]); P.fill(g, P.lg(g, 15, 15, 22, 24, [sh(c.ash, 0.45), m])); // the lit left plate
      P.glow(g, 24.2, 23, 4.6, E, 0.45);
      g.beginPath(); g.moveTo(23.6, 16); g.lineTo(25.4, 19.4); g.lineTo(24.2, 22.6); g.lineTo(25.8, 26); g.lineTo(24.4, 30.6); g.lineTo(22.6, 26.4); g.lineTo(23.8, 22.8); g.lineTo(22.2, 19.2); g.closePath();
      P.fill(g, P.lg(g, 23, 16, 25, 31, [HOT, E, sh(E, -0.3)])); // the split, and the fire inside
      cracks(g, [[18, 18.6, 19.6, 20.6, 18.8, 23], [30.4, 18, 28.6, 21, 30, 23.4]], E, 0.4);
      P.line(g, 18.4, 28.6, 29.8, 28.6, 0.6, md); // the lower edge of the plastron
      // the pauldrons: great angular plates, each swept up to one point
      plate([10.2, 18.6, 11.2, 13, 12.6, 5.6, 16.4, 11.6, 19.8, 13.6, 18.6, 19.2, 13, 20.6], true);
      plate([28.8, 14, 32, 11.4, 37, 4.8, 37.8, 11.8, 39.4, 18, 36.6, 20.8, 30.8, 19.2], true);
      P.line(g, 12.4, 12.6, 18.8, 14.4, 0.4, E); P.line(g, 32.4, 12.6, 38, 16.4, 0.4, E);
      // the helm: tall and narrow, a V-slit burning, a crest of smoke and cinders streaming back
      const hx = 24.4, hy = 8.6;
      g.beginPath(); g.moveTo(hx - 2, hy - 6); g.quadraticCurveTo(hx - 7 - w, hy - 9, hx - 11 - w, hy - 5.4); g.quadraticCurveTo(hx - 6, hy - 6.6, hx - 2.4, hy - 3.4); g.closePath();
      P.fill(g, P.lg(g, hx - 11, hy - 8, hx - 2, hy - 4, [G.rgba(c.ash, 0.1), G.rgba(c.ash, 0.8), E]));
      P.rrect(g, hx - 3.2, hy + 3.4, 6.6, 2.4, 0.8, md); // the gorget
      g.beginPath(); g.moveTo(hx - 3.6, hy + 4.2); g.lineTo(hx - 3.8, hy - 3); g.lineTo(hx - 1.4, hy - 6.4); g.lineTo(hx + 1.6, hy - 6.4); g.lineTo(hx + 4, hy - 3); g.lineTo(hx + 3.6, hy + 2.6); g.lineTo(hx + 0.8, hy + 5); g.lineTo(hx - 1.6, hy + 5); g.closePath();
      P.fill(g, P.lg(g, hx - 4, hy - 6, hx + 4, hy + 5, [ml, m, md]));
      P.line(g, hx + 0.2, hy - 6.2, hx + 0.2, hy + 4.8, 0.45, sh(c.ash, 0.5)); // the ridge
      P.path(g, [hx - 3.2, hy - 1.4, hx + 0.2, hy + 0.8, hx + 3.6, hy - 1.4, hx + 3.6, hy - 0.2, hx + 0.2, hy + 2, hx - 3.2, hy - 0.2]); P.fill(g, '#0a0404'); // the V slit
      P.glow(g, hx + 0.4, hy, 3.6, E, 0.8); P.path(g, [hx - 2.4, hy - 1, hx + 0.2, hy + 0.8, hx + 2.8, hy - 1, hx + 0.2, hy + 1.3]); P.fill(g, c.eye);
      // the greatsword: a broad blade of cooling slag, molten along its heart, held point-down before him
      g.save(); g.translate(31.4, 33); g.rotate(-0.58);
      P.glow(g, 0, 11, 8, E, 0.35);
      P.path(g, [-1.9, 1.8, 1.9, 1.8, 2.2, 13, 1.2, 14.6, 2, 16.4, 0, 20.4, -2, 16, -2.2, 6]); P.fill(g, P.lg(g, -2, 0, 2, 0, ['#5a5054', '#2a2426', '#141012']));
      P.path(g, [-0.4, 2.4, 0.5, 2.4, 0.4, 17, 0, 18.4, -0.4, 16.6]); P.fill(g, P.lg(g, 0, 2, 0, 18, [HOT, E, sh(E, -0.4)])); // the molten heart
      P.line(g, -1.9, 2, -2.1, 15.6, 0.3, sh(c.ash, 0.5)); // a lit edge
      P.rrect(g, -4, 0.2, 8, 1.6, 0.5, md); P.path(g, [-4, 0.2, -5.2, -1.2, -3.4, 0.6]); P.fill(g, md); P.path(g, [4, 0.2, 5.2, -1.2, 3.4, 0.6]); P.fill(g, md); // the crossguard with hooked quillons
      P.line(g, 0, -0.2, 0, -4.2, 1.2, '#2a1a14'); P.circle(g, 0, -4.8, 0.9, E); // grip, a glowing pommel
      g.restore();
      // the near arm: a great gauntlet over the far one on the grip
      limb(g, 35.6, 18.6, 36.4, 26, 2.4, 2, m); limb(g, 36.4, 26, 31, 31, 2, 1.7, ml);
      P.path(g, [29, 29.6, 32.6, 29.2, 33.4, 32.4, 29.6, 33]); P.fill(g, P.lg(g, 29, 29, 29, 33, [ml, md]));
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

  /* ---------- Arbalist: a skeletal crossbowman under a broad kettle hat, cheek to the stock, taking aim ---------- */
  def('arbalist', { w: 26, h: 22, cy: 13, frames: 2,
    colors: { bone: '#c8c8b4', iron: '#5a5e66', wood: '#5a3e26', eye: '#70ffd0' },
    draw(g, f, c) {
      const b = c.bone, bd = sh(b, -0.45), bm = sh(b, -0.2), w = f ? 0.8 : 0, ir = c.iron;
      P.ell(g, 11, 20.4, 6, 1, 'rgba(0,0,0,0.45)');
      // legs apart, braced
      P.bone(g, 9.4, 13, 7.8 - w, 16.4, 0.8, bd); P.bone(g, 7.8 - w, 16.4, 8 - w, 19.6, 0.75, bd); P.path(g, [6.8 - w, 19.4, 9.4 - w, 19.4, 9.6 - w, 20.2, 6.6 - w, 20.2]); P.fill(g, bd);
      P.bone(g, 11.6, 13, 13.4 + w, 16.2, 0.8, bm); P.bone(g, 13.4 + w, 16.2, 13.8 + w, 19.6, 0.75, bm); P.circle(g, 13.4 + w, 16.2, 0.7, b); P.path(g, [12.8 + w, 19.4, 15.8 + w, 19.4, 15.6 + w, 20.2, 12.6 + w, 20.2]); P.fill(g, bm);
      // a quiver of bolts on the back
      P.rrect(g, 5.2, 7.6, 2.6, 6.4, 0.8, P.lg(g, 5, 0, 8, 0, [sh(c.wood, 0.2), sh(c.wood, -0.4)])); for (let i = 0; i < 3; i++) { P.line(g, 5.8 + i * 0.7, 7.6, 5.4 + i * 0.8, 5.2, 0.35, '#8a7a5a'); P.path(g, [5 + i * 0.8, 5.4, 5.8 + i * 0.8, 5.4, 5.4 + i * 0.8, 4.4]); P.fill(g, '#d8d0b0'); }
      // a tattered tabard over the ribs and a pelvis
      P.path(g, [8.4, 7.4, 13.2, 7.2, 13.6, 13.6, 12.4, 12.8, 11, 14.6, 9.8, 12.8, 8.2, 13.8]); P.fill(g, P.lg(g, 8, 7, 14, 14, ['#3a5a5a', '#16262a']));
      P.line(g, 8.4, 11, 13.4, 10.8, 0.6, '#5a4a30'); // a belt
      // the far arm reaching forward under the crossbow to the fore-grip
      P.bone(g, 9.6, 7.6, 12.6, 10.8, 0.6, bd); P.bone(g, 12.6, 10.8, 17, 9.6, 0.55, bd);
      // skull under a broad kettle hat, leaning its cheek to the stock
      const hx = 12.4, hy = 4.6;
      P.circle(g, hx, hy, 2.3, P.vol(g, hx - 0.6, hy - 0.7, 2.4, b));
      P.path(g, [hx - 0.2, hy + 1.2, hx + 2.4, hy + 1.1, hx + 2.2, hy + 2.6, hx + 0.1, hy + 2.6]); P.fill(g, bm); P.rect(g, hx + 0.3, hy + 1.4, 1.9, 0.5, VOID);
      P.ell(g, hx + 1.2, hy + 0.1, 0.75, 0.7, VOID); evil(g, hx + 1.2, hy + 0.1, 0.4, c.eye); P.ell(g, hx - 0.6, hy + 0.2, 0.55, 0.6, VOID);
      P.path(g, [hx - 4.6, hy - 1, hx + 4.4, hy - 1.2, hx + 3.6, hy - 0.2, hx - 3.8, hy]); P.fill(g, P.lg(g, 0, hy - 1.2, 0, hy, [sh(ir, 0.5), sh(ir, -0.3)])); // the brim
      P.path(g, [hx - 2.6, hy - 1, hx - 2.2, hy - 3.2, hx - 0.6, hy - 3.8, hx + 1, hy - 3.6, hx + 2.4, hy - 3, hx + 2.8, hy - 1.1]); P.fill(g, P.lg(g, hx - 2, hy - 4, hx + 2, hy, [sh(ir, 0.45), ir, sh(ir, -0.4)])); // the crown
      // the crossbow at the shoulder: a stock, a steel prod, a bolt laid ready
      P.path(g, [9.4, 8.4, 20.6, 8, 20.8, 9.4, 12, 9.8, 10.8, 10.8, 9, 10]); P.fill(g, P.lg(g, 0, 8, 0, 10.8, [sh(c.wood, 0.35), sh(c.wood, -0.35)]));
      g.strokeStyle = sh(ir, 0.3); g.lineWidth = 0.9; g.beginPath(); g.moveTo(20.2, 4.4); g.quadraticCurveTo(22.4, 8.6, 20.2, 12.8); g.stroke();
      P.line(g, 20.2, 4.4, 16.4 - w, 8.4, 0.25, '#e0e0d0'); P.line(g, 16.4 - w, 8.4, 20.2, 12.8, 0.25, '#e0e0d0');
      P.line(g, 16.4 - w, 8.2, 24.6, 8.2, 0.5, '#3a2a1c'); P.path(g, [24.4, 7.5, 25.8, 8.2, 24.4, 8.9]); P.fill(g, '#dfe4ee');
      // the near arm: a bony hand on the trigger under the stock
      P.bone(g, 12.6, 7.4, 13.6, 10.4, 0.65, b); P.bone(g, 13.6, 10.4, 14.4, 9.8, 0.6, b); P.circle(g, 14.6, 9.8, 0.6, b);
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

  /* ---------- Hydra (boss): three serpent heads on thick necks rising from humped coils in a dark pool ---------- */
  def('hydra', { w: 60, h: 52, cy: 36, frames: 2,
    colors: { scale: '#2e5a52', belly: '#8ab8a0', eye: '#ffe060', water: '#4a8a9a' },
    draw(g, f, c) {
      const sc = c.scale, sl = sh(sc, 0.45), sd = sh(sc, -0.45), w = f ? 1 : -1;
      // the pool: a flat dark water with rings of ripples
      P.ell(g, 30, 46, 26, 5, G.rgba(sh(c.water, -0.4), 0.8)); P.ell(g, 30, 46, 22, 3.8, G.rgba(c.water, 0.35));
      /** A hump of coil breaking the water: a thick tube bent over, lit on top, sinking at both ends. */
      const hump = (x, y, r, wd) => {
        g.lineCap = 'butt';
        g.beginPath(); g.arc(x, y, r, Math.PI, Math.PI * 2); g.strokeStyle = sd; g.lineWidth = wd; g.stroke();
        g.beginPath(); g.arc(x, y - wd * 0.12, r, Math.PI * 1.05, Math.PI * 1.95); g.strokeStyle = sc; g.lineWidth = wd * 0.7; g.stroke();
        g.beginPath(); g.arc(x, y - wd * 0.3, r, Math.PI * 1.15, Math.PI * 1.6); g.strokeStyle = sl; g.lineWidth = wd * 0.22; g.stroke();
        g.lineCap = 'round';
        for (const ex of [x - r, x + r]) { P.ell(g, ex, y + 0.4, wd * 0.8, 0.9, G.rgba('#c8f0ff', 0.5)); }
      };
      hump(15, 46, 6, 5); hump(45, 46.4, 6.4, 5.2);
      // three necks rising from the body; each head wedge-shaped with an open jaw of teeth, a frill, a burning eye
      const head = (bx, by, tx, ty, dir, lean, big) => {
        g.beginPath(); g.moveTo(bx - 4, by); g.bezierCurveTo(bx - 5, by - 10, tx - dir * 7, ty + 9, tx - 2.2, ty + 2); g.lineTo(tx + 2.2, ty + 3.4); g.bezierCurveTo(tx - dir * 2, ty + 11, bx + 5, by - 8, bx + 4.6, by); g.closePath();
        P.fill(g, P.lg(g, bx - 5, 0, bx + 5, 0, [sl, sc, sd]));
        g.strokeStyle = G.rgba(c.belly, 0.6); g.lineWidth = 1.2; g.beginPath(); g.moveTo(bx + 2, by - 2); g.bezierCurveTo(bx + 2.6, by - 9, tx + dir * 0.6, ty + 9, tx + 1, ty + 3.4); g.stroke(); // the pale throat
        g.save(); g.translate(tx, ty); g.scale(dir, 1); g.rotate(lean); const k = big ? 1.2 : 1; g.scale(k, k);
        P.path(g, [-3.6, -1.6, -8, -4.6, -6.4, -1, -8.4, 0.4, -3.8, 1.4]); P.fill(g, P.lg(g, -8, -4, -3, 1, [sh(sc, 0.2), sd])); // the frill
        P.ell(g, 0, 0, 4.8, 3.2, P.vol(g, -1, -1, 4.8, sc));
        P.path(g, [0.6, -1.4, 7.6, 0, 7.2, 1.4, 1, 1.2]); P.fill(g, P.lg(g, 0, -1.4, 0, 1.4, [sl, sc])); // the upper jaw
        P.path(g, [0.6, 2, 6.6, 3.6 + (f ? 0.6 : 0), 6, 4.8 + (f ? 0.6 : 0), 0.6, 3.6]); P.fill(g, sd); // the lower jaw
        P.path(g, [1, 1.2, 7.2, 1.4, 6.6, 3.6 + (f ? 0.6 : 0), 1, 2]); P.fill(g, '#140806');
        teeth(g, 1.6, 1.2, 7, 1.4, 4, 0.9, 1, '#efe4c8'); teeth(g, 1.6, 2.2, 6.2, 3.6 + (f ? 0.6 : 0), 3, 0.7, -1, '#d8ccb0');
        P.path(g, [0.4, -2.4, 3.6, -2, 3, -1.2, 0.6, -1.4]); P.fill(g, sd); // the brow
        evil(g, 2, -1.3, 0.8, c.eye, -0.2);
        g.restore();
      };
      // the central mass the necks rise from
      P.ell(g, 30, 44, 12, 5.4, P.lg(g, 0, 38.6, 0, 49, [sl, sc, sd]));
      P.ell(g, 30, 46.6, 13, 1.6, G.rgba(c.water, 0.6)); // the water lapping at it
      head(21, 43, 11, 19 + w, -1, -0.15, false);
      head(39, 43, 49, 21 - w, 1, -0.15, false);
      head(30, 42, 30.6, 9 + w * 0.6, 1, 0.08, true);
      for (let i = 0; i < 5; i++) P.ell(g, 10 + i * 10, 47.6 + (i % 2) * 0.6, 1.4, 0.35, G.rgba('#c8f0ff', 0.6)); // foam
    } });

  /* ---------- Bell Warden (boss): a gaunt warden in a sodden cassock whose head is a great cracked bell: two eyes glow in
   *            the dark of its mouth, the clapper hangs like a tongue; it lifts a bell-hammer to strike, drags a chain ---------- */
  def('bellwarden', { w: 48, h: 60, cy: 38, frames: 2,
    colors: { bronze: '#8a6a34', plate: '#3a3a42', cloth: '#2a3a4a', eye: '#9ff0ff' },
    draw(g, f, c) {
      const br = c.bronze, bl = sh(br, 0.5), bd = sh(br, -0.5), cl = c.cloth, cll = sh(cl, 0.4), cld = sh(cl, -0.5), skin = '#8a9490', w = f ? 0.8 : -0.8, verd = '#4a8a7a';
      P.ell(g, 24, 57, 13, 2.2, 'rgba(0,0,0,0.45)');
      // a chain dragging from the far hand, a small bell at its end
      for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(9.4 - k * 0.3, 33 + k * 1.9, 0.6, 0.9, 0.2, 0, Math.PI * 2); g.strokeStyle = '#4a4a52'; g.lineWidth = 0.6; g.stroke(); }
      P.path(g, [6.2, 47, 9.8, 47, 9.6, 44, 8, 43, 6.4, 44]); P.fill(g, P.lg(g, 6, 0, 10, 0, [bl, br, bd])); P.circle(g, 8, 47.6, 0.6, bd);
      // the cassock: narrow shoulders, long, falling to a sodden ragged hem
      g.beginPath(); g.moveTo(17.4, 21); g.lineTo(30.6, 21); g.quadraticCurveTo(33.6, 38, 36 + w, 55); g.lineTo(12 - w, 55); g.quadraticCurveTo(14.4, 38, 17.4, 21); g.closePath();
      P.fill(g, P.lg(g, 12, 21, 36, 55, [cll, cl, cld]));
      rag(g, 12 - w, 54.6, 36 + w, 54.6, 6, 1.8, cld);
      g.strokeStyle = cld; g.lineWidth = 0.6; for (const [x0, x1] of [[21, 17], [24.4, 24], [27.6, 31]]) { g.beginPath(); g.moveTo(x0, 30); g.quadraticCurveTo((x0 + x1) / 2 + 0.6, 42, x1 + w * 0.5, 54); g.stroke(); } // folds
      // a chain wound round the chest, a rope belt hung with small bells
      for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(18.6 + i * 1.7, 24.4 + i * 0.7, 0.8, 0.5, 0.4, 0, Math.PI * 2); g.strokeStyle = '#5a5a62'; g.lineWidth = 0.55; g.stroke(); }
      P.line(g, 16.6, 33, 31.4, 33, 1, '#5a4a30');
      [[19.4, 34.6], [23.4, 35.4], [28, 34.8]].forEach(([x, y], i) => { P.path(g, [x - 1, y + 1.8, x + 1, y + 1.8, x + 0.8, y, x - 0.8, y]); P.fill(g, P.lg(g, x - 1, 0, x + 1, 0, [bl, bd])); P.circle(g, x + (i % 2 ? w * 0.3 : 0), y + 2.1, 0.35, bd); });
      // the far arm, long and gaunt, down to the chain
      limb(g, 17.8, 22.4, 13.6, 28.6, 1.8, 1.4, cld); limb(g, 13.6, 28.6, 10.4, 32, 1.4, 1.1, cld); P.circle(g, 10, 32.4, 1.2, sh(skin, -0.3)); claws(g, 9.8, 32.6, 2, 3, 1.2, 0.35, sh(skin, -0.2));
      // the bell for a head: crown and waist, a flaring lip resting on the shoulders, cracked, patched with verdigris
      const hx = 24, hy = 6;
      P.path(g, [hx - 1.6, hy - 3.8, hx - 1, hy - 5.6, hx + 1, hy - 5.6, hx + 1.6, hy - 3.8]); P.fill(g, bd); // the crown loop
      g.beginPath(); g.moveTo(hx - 4, hy - 4); g.quadraticCurveTo(hx - 4.6, hy + 4, hx - 8.6, hy + 13.4); g.quadraticCurveTo(hx, hy + 15.4, hx + 8.6, hy + 13.4); g.quadraticCurveTo(hx + 4.6, hy + 4, hx + 4, hy - 4); g.quadraticCurveTo(hx, hy - 5.4, hx - 4, hy - 4); g.closePath();
      P.fill(g, P.lg(g, hx - 8, 0, hx + 8, 0, [sh(br, -0.2), bl, br, bd]));
      P.line(g, hx - 7.4, hy + 11.4, hx + 7.4, hy + 11.4, 0.7, bd); P.line(g, hx - 4.6, hy + 2, hx + 4.6, hy + 2, 0.5, bd); // bands cast in the bronze
      P.ell(g, hx - 3, hy + 6, 1.6, 1.2, G.rgba(verd, 0.7)); P.ell(g, hx + 4.6, hy + 9.4, 1.2, 0.8, G.rgba(verd, 0.6));
      g.strokeStyle = '#1a1006'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(hx + 2, hy - 3.4); g.lineTo(hx + 3.2, hy + 1); g.lineTo(hx + 2.2, hy + 4.4); g.lineTo(hx + 3.4, hy + 7.6); g.stroke(); // the crack
      // the mouth of the bell: dark, two eyes burning deep inside, the clapper hanging down like a tongue
      P.ell(g, hx, hy + 13.6, 8.4, 2.2, '#0a0806');
      evil(g, hx + 2.2, hy + 13.2, 0.7, c.eye, -0.1); evil(g, hx - 1.6, hy + 13.2, 0.6, c.eye, 0.1); P.glow(g, hx + 0.4, hy + 13.2, 4, c.eye, 0.5);
      P.line(g, hx + (f ? 0.8 : -0.4), hy + 13.8, hx + (f ? 1.4 : -0.8), hy + 17.4, 0.6, bd); P.circle(g, hx + (f ? 1.5 : -0.9), hy + 18.2, 1.3, P.vol(g, hx, hy + 17.8, 1.3, br));
      // the near arm raising the bell-hammer back over the shoulder to strike
      limb(g, 30.4, 22.4, 35, 26.6, 1.8, 1.4, cl); limb(g, 35, 26.6, 37.4, 20, 1.4, 1.1, cll); P.circle(g, 37.6, 19.6, 1.2, skin);
      P.line(g, 36.4, 24.6, 39.4, 8.4, 1, '#3a2a1c');
      g.save(); g.translate(39.6, 7.6); g.rotate(0.18);
      P.rrect(g, -4.2, -2.4, 8.4, 4.8, 1.4, P.lg(g, 0, -2.4, 0, 2.4, [bl, br, bd])); P.ell(g, 4.2, 0, 0.8, 2.4, bd); P.ell(g, -4.2, 0, 0.8, 2.4, sh(br, 0.2));
      P.line(g, -3.4, -1.4, 3.4, -1.4, 0.35, sh(br, 0.7));
      g.restore();
    } });

  /* ---------- Sunken Knight (boss): a drowned knight in rusted, weed-grown plate, a snouted visor streaming water,
   *            coral growing from one pauldron, a rotting tabard, a barbed trident held high ---------- */
  def('sunkknight', { w: 46, h: 56, cy: 35, frames: 2,
    colors: { plate: '#4a6068', weed: '#2e5a3a', eye: '#70ffd0', gold: '#a88a4a' },
    draw(g, f, c) {
      const m = c.plate, ml = sh(m, 0.45), md = sh(m, -0.45), rust = '#7a4a2a', verd = '#5a9a86', bar = '#c8c0a8', w = f ? 0.8 : -0.8;
      P.ell(g, 22, 53, 13, 2.2, 'rgba(0,0,0,0.45)'); P.ell(g, 22, 53, 11, 1.6, 'rgba(90,150,170,0.35)');
      // a cloak of weed trailing behind, hanging in strands
      g.beginPath(); g.moveTo(14, 16.6); g.bezierCurveTo(8.6, 24, 7.6 - w, 36, 7 - w, 48); g.lineTo(18, 46); g.lineTo(19, 18); g.closePath();
      P.fill(g, P.lg(g, 7, 16, 19, 48, [sh(c.weed, 0.3), c.weed, sh(c.weed, -0.5)]));
      for (let i = 0; i < 4; i++) { const x = 8 + i * 2.8; g.beginPath(); g.moveTo(x, 44); g.quadraticCurveTo(x + (f ? 1 : -1), 48, x - 0.4, 51 - i * 0.6); g.strokeStyle = sh(c.weed, -0.2); g.lineWidth = 0.9; g.stroke(); }
      // legs: greaves and knee cops, crusted
      const leg = (hx, kx, ax, col, lit) => {
        limb(g, hx, 35, kx, 43, 2.8, 2.2, col); limb(g, kx, 43, ax, 50.4, 2.2, 1.8, col);
        P.circle(g, kx, 43, 2, P.vol(g, kx - 0.6, 42.2, 2.1, lit));
        P.path(g, [ax - 2.2, 49.8, ax + 2, 49.8, ax + 3.6, 52.2, ax - 2.4, 52.2]); P.fill(g, md);
      };
      leg(19.4, 17 - w * 0.4, 16.4 - w, md, m); leg(25.4, 27.6 + w * 0.4, 28.4 + w, m, ml);
      // the far arm hanging, the gauntlet dripping
      limb(g, 14.6, 19, 12.4, 27, 2.2, 1.8, md); limb(g, 12.4, 27, 12.8, 33, 1.8, 1.5, md); P.circle(g, 12.8, 33.6, 1.7, P.vol(g, 12.4, 33, 1.7, m));
      P.line(g, 12.6, 35.4, 12.6, 37.6 + (f ? 0.8 : 0), 0.4, 'rgba(150,215,235,0.8)');
      // a rotting tabard over the hips, a faded gold device on it
      P.path(g, [17.4, 29.6, 27.8, 29.6, 28.2, 40, 26, 38.6, 24, 41.6, 22, 38.8, 19.4, 41.2, 17, 39.6]); P.fill(g, P.lg(g, 17, 30, 17, 41, [sh(c.weed, 0.2), sh(c.weed, -0.5)]));
      P.path(g, [21.2, 32.4, 24.4, 32.4, 22.8, 35.6]); P.fill(g, G.rgba(c.gold, 0.7));
      // the breastplate: chest and waist, rust running down it, barnacles clustered on one side
      g.beginPath(); g.moveTo(14.4, 16.4); g.lineTo(30.6, 16.4); g.quadraticCurveTo(31.4, 24, 28, 30); g.lineTo(17.6, 30); g.quadraticCurveTo(13.6, 24, 14.4, 16.4); g.closePath();
      P.fill(g, P.lg(g, 14, 16, 30, 30, [ml, m, md]));
      P.ell(g, 19.4, 21, 4, 4, P.vol(g, 18.2, 19.4, 4.2, m), 0.2); P.ell(g, 25.8, 21, 4, 4, P.vol(g, 24.8, 19.4, 4.2, sh(m, 0.1)), -0.2);
      P.line(g, 22.6, 17, 22.6, 29, 0.5, md); P.line(g, 17.4, 27, 28.4, 27, 0.6, md);
      g.save(); g.globalAlpha = 0.6; P.line(g, 20, 22, 19.4, 28, 0.6, rust); P.line(g, 26.6, 20.4, 27, 25.6, 0.5, rust); g.restore();
      barnacles(g, [[16.6, 24, 1.1], [17.8, 26.2, 0.8], [15.8, 26.6, 0.6], [18.4, 23, 0.5]], bar);
      // the helm: a bascinet with a snouted visor thrust forward, slits burning teal, water pouring out, weed hanging
      const hx = 22.6, hy = 8.4;
      P.rrect(g, hx - 3.4, hy + 4, 7, 2.6, 0.8, md); // the gorget
      g.beginPath(); g.moveTo(hx - 3.8, hy + 4.4); g.lineTo(hx - 4.2, hy - 1.6); g.quadraticCurveTo(hx - 3.4, hy - 6.4, hx + 0.6, hy - 6.2); g.quadraticCurveTo(hx + 3.6, hy - 5.4, hx + 3.2, hy - 1.6); g.lineTo(hx + 3.4, hy + 4.4); g.closePath();
      P.fill(g, P.lg(g, hx - 4, hy - 6, hx + 3, hy + 4, [ml, m, md])); // the skull of the bascinet
      g.beginPath(); g.moveTo(hx + 0.4, hy - 2.6); g.lineTo(hx + 3.4, hy - 2.4); g.lineTo(hx + 8.2, hy + 1); g.lineTo(hx + 3.6, hy + 4.2); g.lineTo(hx + 0.4, hy + 3.6); g.closePath();
      P.fill(g, P.lg(g, hx, hy - 2.6, hx + 2, hy + 4.2, [sh(m, 0.6), sh(m, -0.1), md])); // the snouted visor, jutting forward
      P.line(g, hx + 0.8, hy - 2.4, hx + 7.6, hy + 0.8, 0.35, sh(m, 0.9)); // its lit ridge
      P.line(g, hx + 1.2, hy - 0.8, hx + 6, hy + 0.9, 0.5, '#050a0a'); P.line(g, hx + 1.2, hy + 1.2, hx + 5, hy + 2, 0.4, '#050a0a'); // the slits
      P.glow(g, hx + 2.6, hy - 0.2, 1.8, c.eye, 0.8); P.line(g, hx + 1.6, hy - 0.6, hx + 4, hy + 0.2, 0.35, c.eye);
      for (let i = 0; i < 3; i++) P.line(g, hx + 3.4 + i * 0.9, hy + 2.6, hx + 3.2 + i * 0.9, hy + 5 + (i % 2 ? 1 : 0) + (f ? 0.6 : 0), 0.35, 'rgba(150,215,235,0.8)'); // water running out
      barnacles(g, [[hx - 2.4, hy - 3.4, 0.7], [hx - 3, hy - 1.6, 0.5]], bar);
      for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(hx - 1.6 + i * 2.4, hy + 4.6); g.quadraticCurveTo(hx - 2 + i * 2.4 + (f ? 0.6 : 0), hy + 7, hx - 1.6 + i * 2.4, hy + 9.4); g.strokeStyle = c.weed; g.lineWidth = 0.7; g.stroke(); }
      // the pauldrons, the near one heavier with a branch of coral growing from it
      P.ell(g, 14.4, 17.6, 3.6, 2.8, P.vol(g, 13.6, 16.6, 3.6, m));
      g.strokeStyle = '#c85a4a'; g.lineCap = 'round'; for (const [x0, y0, x1, y1, lw] of [[31, 15, 31.6, 9, 0.9], [31.4, 11.4, 33.6, 8.6, 0.6], [31.2, 12.6, 29.4, 10.4, 0.6], [33.4, 9, 34.4, 7.4, 0.5]]) { g.lineWidth = lw; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
      P.ell(g, 31.4, 17.6, 4.2, 3.2, P.vol(g, 30.4, 16.6, 4.2, sh(m, 0.1))); P.ell(g, 31.8, 19.4, 3.8, 1.8, P.lg(g, 0, 18, 0, 21, [m, md]));
      barnacles(g, [[29.6, 16.4, 0.6], [32.6, 17.2, 0.8]], bar);
      // the near arm raising the trident: a long shaft, a crossbar, three barbed prongs
      limb(g, 32, 20, 35.6, 26, 2.2, 1.8, m); limb(g, 35.6, 26, 37.6, 21, 1.8, 1.5, ml); P.circle(g, 37.8, 20.6, 1.8, P.vol(g, 37.4, 20, 1.8, ml));
      P.line(g, 36.4, 46, 39.4, 4, 1, '#3a2a1a');
      P.path(g, [36.2, 8.4, 42.6, 8.8, 42.4, 10, 36.2, 9.6]); P.fill(g, '#8aa0a8'); // the crossbar
      for (const [bx, tx, ty] of [[36.8, 36.4, 1.6], [39.4, 39.6, -0.2], [42, 42.8, 1.6]]) {
        P.path(g, [bx - 0.5, 8.8, bx + 0.5, 8.8, tx + 0.1, ty + 1, tx, ty]); P.fill(g, P.lg(g, 0, ty, 0, 9, ['#e8f0f0', '#8aa0a8']));
        P.path(g, [tx + 0.2, ty + 2.6, tx + 1.4, ty + 3.4, tx + 0.3, ty + 1.6]); P.fill(g, '#c8d4d8'); // a barb
      }
      P.glow(g, 39.6, 4, 3, c.eye, 0.3);
    } });

  /* ================= Hall 4: the Catacombs (frozen) ================= */
  /** A jagged icicle from (x,y) pointing to (tx,ty), base half-width w. */
  function icicle(g, x, y, tx, ty, w, col) {
    const a = Math.atan2(ty - y, tx - x), nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
    g.beginPath(); g.moveTo(x + nx, y + ny); g.lineTo(tx, ty); g.lineTo(x - nx, y - ny); g.closePath();
    P.fill(g, P.lg(g, x - nx, y - ny, x + nx, y + ny, [sh(col, 0.5), col, sh(col, -0.35)]));
  }

  /* ---------- Frost Crawler: a frost worm that tunnels under the snow and bursts up beneath you: an armoured pale body rising
   *            out of a heaved mound of snow and broken ice, a round gaping maw ringed with fangs of ice, a cluster of cold eyes ---------- */
  def('frostcrawler', { w: 26, h: 26, cy: 20, frames: 2,
    colors: { shell: '#6a8aa8', flesh: '#c8b8c8', eye: '#8ff0ff', ice: '#d8f4ff' },
    draw(g, f, c) {
      const s = c.shell, sl = sh(s, 0.5), sd = sh(s, -0.45), fl = c.flesh, fd = sh(fl, -0.4), wv = f ? 0.8 : -0.8, snow = '#e8f2f8';
      // the mound of snow it breaks out of, and broken slabs of ice thrown up around it
      P.ell(g, 13, 23, 11.4, 2.4, 'rgba(0,0,0,0.35)');
      g.beginPath(); g.moveTo(2, 23.2); g.quadraticCurveTo(2.6, 20.4, 5.4, 20.2); g.quadraticCurveTo(7, 17.6, 10.4, 18.4); g.quadraticCurveTo(14, 17, 16.6, 18.8); g.quadraticCurveTo(20.6, 18.6, 21.4, 20.8); g.quadraticCurveTo(24.2, 21.4, 23.8, 23.4); g.closePath();
      P.fill(g, P.lg(g, 0, 17, 0, 23.6, [snow, sh(snow, -0.15), sh(snow, -0.45)])); // a heaved, lumpy mound
      P.ell(g, 10.8, 20.6, 4.6, 1.6, '#16222e'); // the hole it broke out of
      [[4.6, 21.4, 3.4, 18.6, 1.2], [17.8, 20.6, 19.6, 17.8, 1.1], [15.4, 21.6, 16.2, 19.6, 0.7]].forEach(([x, y, tx, ty, ww]) => icicle(g, x, y, tx, ty, ww, c.ice)); // slabs of ice thrown up
      // the body rising in a curve: each ring a pale belly under an armoured back-plate rimed with frost
      const seg = [[10.6, 19.4, 3.8], [9.4, 15.8, 3.6], [9.8 + wv * 0.3, 12.4, 3.3], [11.6 + wv * 0.5, 9.6, 3.1]];
      seg.forEach(([x, y, r], i) => {
        P.ell(g, x, y, r, r * 0.95, P.vol(g, x - r * 0.3, y - r * 0.4, r, fl)); // the belly ring
        g.beginPath(); g.arc(x, y, r, Math.PI * 0.55, Math.PI * 1.45); g.lineTo(x - r * 0.1, y - r * 0.6); g.closePath(); P.fill(g, P.lg(g, x - r, y - r, x, y + r, [sl, s, sd])); // the back-plate
        g.beginPath(); g.arc(x, y, r, Math.PI * 1.05, Math.PI * 1.35); g.strokeStyle = c.ice; g.lineWidth = 0.4; g.stroke();
        if (i) { g.beginPath(); g.arc(x, y + r * 0.9, r * 0.8, Math.PI * 1.15, Math.PI * 1.85); g.strokeStyle = fd; g.lineWidth = 0.35; g.stroke(); }
      });
      P.path(g, [6, 21.2, 8, 20.2, 10.4, 21, 12.8, 20.2, 15.6, 21.2, 13, 22, 8.4, 22]); P.fill(g, G.rgba(snow, 0.95)); // snow heaped against its body
      // the head: turned toward us, a round maw gaping open, fangs of ice ringed round it, cold eyes clustered above
      const hx = 14.6 + wv * 0.6, hy = 6.8;
      P.ell(g, hx - 0.6, hy, 4.4, 4.2, P.vol(g, hx - 1.8, hy - 1.4, 4.4, s));
      P.ell(g, hx + 0.6, hy + 0.6, 3.4, 3.2, fd, 0.2); // the lip
      P.ell(g, hx + 0.8, hy + 0.8, 2.5, 2.3, '#0a1620', 0.2); // the throat
      P.glow(g, hx + 0.8, hy + 1, 2.4, c.eye, 0.6);
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, x0 = hx + 0.8 + Math.cos(a) * 2.6, y0 = hy + 0.8 + Math.sin(a) * 2.4, x1 = hx + 0.8 + Math.cos(a) * 1.2, y1 = hy + 0.8 + Math.sin(a) * 1.1;
        P.path(g, [x0 + Math.sin(a) * 0.45, y0 - Math.cos(a) * 0.45, x1, y1, x0 - Math.sin(a) * 0.45, y0 + Math.cos(a) * 0.45]); P.fill(g, i % 2 ? c.ice : '#ffffff'); }
      for (const [dx, dy, r] of [[-2.8, -2.6, 0.5], [-1.2, -3.4, 0.55], [0.6, -3.2, 0.42]]) evil(g, hx + dx, hy + dy, r, c.eye);
    } });

  /* ---------- Ice Skull: a skull cased in frost, flying, seen full face: two cold eyes deep in the sockets, a row of teeth,
   *            a crown of ice shards on the brow, a trail of frost streaming away beneath it ---------- */
  def('iceskull', { w: 18, h: 18, cy: 10, frames: 2,
    colors: { bone: '#d8e8f0', ice: '#9fd8ff', eye: '#40c8ff' },
    draw(g, f, c) {
      const b = c.bone, bd = sh(b, -0.45), bm = sh(b, -0.2), hx = 9, hy = 7.6, jaw = f ? 0.8 : 0.2;
      for (let i = 0; i < 3; i++) { const x = hx + (i % 2 ? 1 : -1) * (f ? 0.8 : -0.8) * 0.6, y = hy + 6 + i * 1.8; P.ell(g, x, y, 2.4 - i * 0.6, 1.1 - i * 0.2, G.rgba(c.ice, 0.55 - i * 0.15)); } // frost trailing beneath
      P.glow(g, hx, hy, 7, c.eye, 0.25);
      icicle(g, hx - 2.6, hy - 2.6, hx - 5.4, hy - 6.6, 1, c.ice); icicle(g, hx - 0.4, hy - 3.2, hx - 0.6, hy - 8.4, 1.2, c.ice); icicle(g, hx + 2.2, hy - 2.8, hx + 4.2, hy - 6, 0.9, c.ice);
      P.ell(g, hx, hy - 0.2, 3.9, 3.6, P.vol(g, hx - 1.2, hy - 1.4, 3.9, b)); // the cranium
      P.path(g, [hx - 2.8, hy + 1.8, hx + 2.8, hy + 1.8, hx + 2.2, hy + 3.6, hx - 2.2, hy + 3.6]); P.fill(g, bm); // the cheeks and upper teeth
      P.ell(g, hx - 1.5, hy + 0.2, 1.2, 1.3, VOID); P.ell(g, hx + 1.5, hy + 0.2, 1.2, 1.3, VOID);
      evil(g, hx - 1.5, hy + 0.3, 0.6, c.eye, 0.2); evil(g, hx + 1.5, hy + 0.3, 0.6, c.eye, -0.2);
      P.path(g, [hx - 0.5, hy + 2.2, hx + 0.5, hy + 2.2, hx, hy + 1.2]); P.fill(g, VOID); // the nose
      P.rect(g, hx - 2, hy + 3.4, 4, 0.8 + jaw * 0.6, '#0a1a24');
      teeth(g, hx - 2, hy + 3.4, hx + 2, hy + 3.4, 5, 0.6, 1, b);
      P.path(g, [hx - 2.2, hy + 4.2 + jaw * 0.6, hx + 2.2, hy + 4.2 + jaw * 0.6, hx + 1.6, hy + 5.6 + jaw, hx - 1.6, hy + 5.6 + jaw]); P.fill(g, bd); // the jaw
      teeth(g, hx - 1.8, hy + 4.3 + jaw * 0.6, hx + 1.8, hy + 4.3 + jaw * 0.6, 4, 0.5, -1, bm);
      g.strokeStyle = bd; g.lineWidth = 0.3; g.beginPath(); g.moveTo(hx + 1, hy - 3.6); g.lineTo(hx + 1.6, hy - 2.2); g.lineTo(hx + 0.9, hy - 1.4); g.stroke(); // a crack
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
      for (const [x, o, col] of [[10, -w, sh(ir, -0.3)], [14, w, sh(ir, 0.15)]]) { limb(g, x, 19, x + o * 0.4 - 0.4, 23.4, 1.5, 1.2, col); limb(g, x + o * 0.4 - 0.4, 23.4, x + o, 27.4, 1.2, 1, col); P.circle(g, x + o * 0.4 - 0.4, 23.4, 1.1, P.vol(g, x + o * 0.4 - 0.8, 23, 1.1, ic)); P.path(g, [x + o - 1.4, 27, x + o + 2, 27, x + o + 2.4, 28.4, x + o - 1.6, 28.4]); P.fill(g, sh(ir, -0.4)); }
      // a ragged tabard and the cuirass
      P.path(g, [8, 16, 16, 16, 16.6, 22, 14.6, 21, 12, 23, 9.4, 21, 7.4, 22]); P.fill(g, P.lg(g, 8, 16, 16, 23, [sh(c.cloth, 0.3), sh(c.cloth, -0.4)]));
      P.rrect(g, 7.4, 9.4, 9.2, 8, 2.2, P.lg(g, 7, 9, 16, 17, [sh(ir, 0.45), ir, sh(ir, -0.45)]));
      // ice crusted over the armour: shoulders, a collar of icicles
      for (const [x, y, r] of [[7.2, 10.4, 2.6], [16.6, 10.4, 2.6]]) P.ell(g, x, y, r, r * 0.8, P.vol(g, x, y - 0.5, r, ic));
      icicle(g, 9.4, 13, 9.2, 15.6, 0.7, ic); icicle(g, 13.6, 13, 14.2, 14.6, 0.5, ic);
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
      icicle(g, hx - 0.4, hy - 3.4, hx - 3.6, hy - 8.4, 1.1, ic); icicle(g, hx - 1.8, hy - 2.8, hx - 5, hy - 5, 0.6, ic); // a crest of ice swept back
    } });

  /* ---------- Ice Bear: a huge white bear, shoulders humped, head low and forward with its jaws open, broad paws with
   *            black claws, a few shards of ice grown out of its hackles, frost steaming off its breath ---------- */
  def('icebear', { w: 36, h: 24, cy: 16, frames: 2,
    colors: { fur: '#c8d4dc', dark: '#6a7a8a', eye: '#40c8ff', ice: '#a8e0ff' },
    draw(g, f, c) {
      const s = c.fur, sl = sh(s, 0.2), sd = sh(s, -0.25), dk = c.dark, w = f ? 1 : -1, G0 = 22.4, claw = '#1a1a22';
      P.ell(g, 18, G0 + 0.3, 14, 1.3, 'rgba(0,0,0,0.4)');
      const leg = (x, top, o, col, fore) => {
        limb(g, x, top, x + o * 0.4 + (fore ? 0.4 : -0.6), top + 5, fore ? 2.6 : 3.2, 2.2, col); limb(g, x + o * 0.4 + (fore ? 0.4 : -0.6), top + 5, x + o, G0 - 0.8, 2.2, 1.9, col);
        P.ell(g, x + o + 0.8, G0 - 0.4, 2.4, 1, col); claws(g, x + o + 2.6, G0 - 0.4, 0.3, 3, 1, 0.35, claw); // a broad paw
      };
      leg(9.4, 12.6, -w, sh(sd, -0.1), false); leg(23, 12.4, w, sh(sd, -0.1), true); // far legs
      // the body: a massive rump, a hump over the shoulders, the belly slung low, fur ruffled underneath
      g.beginPath(); g.moveTo(4.4, 13.6); g.quadraticCurveTo(4, 7.4, 10, 6.8); g.quadraticCurveTo(16, 6.6, 20, 5); g.quadraticCurveTo(25.4, 4.4, 27.6, 8.4); g.quadraticCurveTo(28, 13, 25, 16.6);
      g.quadraticCurveTo(16, 18.4, 8, 17.2); g.quadraticCurveTo(4.6, 16.4, 4.4, 13.6); g.closePath();
      P.fill(g, P.lg(g, 8, 5, 12, 18, [sl, s, sd]));
      P.ell(g, 9, 11.4, 4.6, 4.4, P.vol(g, 8, 10, 4.8, s)); P.ell(g, 22.6, 10, 4.6, 5, P.vol(g, 21.6, 8.4, 5, s)); // haunch and shoulder
      g.strokeStyle = sd; g.lineWidth = 0.4; for (const [x, y] of [[8, 16.6], [12, 17.4], [16, 17.6], [20, 17.2]]) { g.beginPath(); g.moveTo(x - 1, y - 1); g.lineTo(x, y + 0.6); g.lineTo(x + 1, y - 0.8); g.stroke(); } // fur hanging off the belly
      // a few shards of ice grown out of the hackles, uneven
      icicle(g, 18.6, 6, 17, 1.4, 1, c.ice); icicle(g, 21, 5.2, 21.6, 0.6, 1.3, c.ice); icicle(g, 23.4, 5.4, 25.6, 2.4, 0.8, c.ice);
      leg(11, 13, w, s, false); leg(24.6, 12.8, -w, s, true); // near legs
      // the head, low and forward: a broad skull, small round ears, a long muzzle, the jaws open, breath steaming
      const hx = 29.4, hy = 11;
      P.ell(g, hx, hy, 3.4, 3, P.vol(g, hx - 1, hy - 1, 3.4, sl));
      P.circle(g, hx - 1.8, hy - 2.6, 1, sl); P.circle(g, hx - 1.8, hy - 2.6, 0.5, dk); // an ear
      P.path(g, [hx + 1.2, hy - 1.6, hx + 5.4, hy - 0.4, hx + 5.6, hy + 1, hx + 1.6, hy + 1.2]); P.fill(g, P.lg(g, hx, hy - 1.6, hx, hy + 1.2, [sl, s])); // the muzzle
      P.circle(g, hx + 5.4, hy + 0.1, 0.6, claw); // the nose
      P.path(g, [hx + 1, hy + 1.8, hx + 4.8, hy + 2.2 + (f ? 0.5 : 0), hx + 4.2, hy + 3.2 + (f ? 0.5 : 0), hx + 0.8, hy + 2.8]); P.fill(g, sd); // the lower jaw
      P.path(g, [hx + 1.4, hy + 1.2, hx + 5.4, hy + 1, hx + 4.8, hy + 2.2 + (f ? 0.5 : 0), hx + 1, hy + 1.8]); P.fill(g, '#2a0c10');
      teeth(g, hx + 2, hy + 1.1, hx + 5, hy + 1, 3, 0.6, 1, '#f4f4ec');
      P.ell(g, hx + 1.2, hy - 0.8, 0.7, 0.55, VOID); evil(g, hx + 1.3, hy - 0.8, 0.45, c.eye);
      for (let i = 0; i < 2; i++) P.ell(g, hx + 6.6 + i * 1.4 + (f ? 0.6 : 0), hy + 1.6 - i * 0.6, 0.9 - i * 0.2, 0.6 - i * 0.15, G.rgba('#e8f4ff', 0.5 - i * 0.2)); // breath
    } });

  /* ---------- Frost Construct (boss): a colossus of glacier ice walking on its knuckles, faceted like cut crystal: massive arms
   *            to the ground, a small head hung low in front, three uneven spires of crystal from its back, a rune-heart burning
   *            in its chest, broken iron shackles still on its wrists ---------- */
  def('frostconstruct', { w: 52, h: 56, cy: 36, frames: 2,
    colors: { ice: '#7ab8e0', iron: '#3a4050', core: '#c8f4ff', rune: '#8ff0ff' },
    draw(g, f, c) {
      const ic = c.ice, il = sh(ic, 0.55), iw = '#eef8ff', id = sh(ic, -0.4), idd = sh(ic, -0.62), ir = c.iron, w = f ? 0.8 : -0.8;
      /** A faceted mass: the outline in mid ice, a lit facet, a shadow facet, a white edge along the ridge. */
      const facet = (out, lit, dark, edge) => {
        P.path(g, out); P.fill(g, ic);
        if (lit) { P.path(g, lit); P.fill(g, P.lg(g, lit[0], lit[1], lit[4], lit[5], [iw, il])); }
        if (dark) { P.path(g, dark); P.fill(g, P.lg(g, dark[0], dark[1], dark[4], dark[5], [id, idd])); }
        if (edge) { g.strokeStyle = G.rgba(iw, 0.85); g.lineWidth = 0.45; g.beginPath(); g.moveTo(edge[0], edge[1]); for (let i = 2; i < edge.length; i += 2) g.lineTo(edge[i], edge[i + 1]); g.stroke(); }
      };
      P.ell(g, 26, 53, 20, 2.4, 'rgba(0,0,0,0.45)');
      P.glow(g, 26, 30, 22, ic, 0.15);
      // crystal spires from the back: three, uneven, leaning
      facet([16, 16, 13, 3, 19.6, 13], [16, 16, 13, 3, 16.6, 14], null, [13, 3, 16, 16]);
      facet([21, 13, 22.4, -0.6, 26, 12.4], [21, 13, 22.4, -0.6, 23.4, 12.6], [23.4, 12.6, 22.4, -0.6, 26, 12.4], [22.4, -0.6, 21, 13]);
      facet([27.6, 12.6, 31.4, 4.4, 31.6, 13.4], [27.6, 12.6, 31.4, 4.4, 29.6, 13], null, [31.4, 4.4, 27.6, 12.6]);
      // the far arm: shoulder to knuckles on the ground, the forearm thicker than the upper arm
      facet([12, 16, 17, 18, 13, 32, 8, 30], null, [15, 17.4, 17, 18, 13, 32, 11.6, 31.4]);
      facet([7, 30, 13.4, 31.6, 13, 44, 5.4, 44.6], null, [11, 31, 13.4, 31.6, 13, 44, 10.4, 44.4]);
      facet([3.4, 44, 13.6, 43.4, 14.6, 51.6, 2.6, 52.4], [3.4, 44, 13.6, 43.4, 8.6, 47.4], null, [3.4, 44, 13.6, 43.4]); // the knuckles
      P.rect(g, 5.6, 39.4, 8, 2, ir); P.rect(g, 5.6, 39.4, 8, 0.6, '#6a7280'); // a shackle
      // legs: short faceted pillars
      for (const [x, o] of [[20, -w], [32, w]]) facet([x - 3.6, 38, x + 3.6, 38, x + 4 + o, 52.6, x - 4.2 + o, 52.6], [x - 3.6, 38, x, 38, x - 1.6 + o, 52.6, x - 4.2 + o, 52.6], [x + 1.4, 38, x + 3.6, 38, x + 4 + o, 52.6, x + 2 + o, 52.6], [x - 3.6, 38, x - 4.2 + o, 52.6]);
      // the body: a great hunched mass, the back high, the chest hanging low between the arms
      facet([11, 17, 18, 11, 34, 10.6, 42, 16, 38.6, 30, 33, 40, 19, 40, 13.4, 30],
        [11, 17, 18, 11, 26, 10.8, 24, 22, 14.4, 27],
        [33, 12, 42, 16, 38.6, 30, 33, 40, 28, 30],
        [11, 17, 18, 11, 34, 10.6, 42, 16]);
      // the heart: a rune burning in a cracked cavity in the chest
      P.path(g, [22, 21.4, 27.8, 19.6, 31.4, 24.8, 29.6, 32.2, 23.6, 33.4, 20.4, 28]); P.fill(g, '#0e2236'); // the dark cavity
      P.glow(g, 26, 27, 7, c.rune, 0.7);
      P.path(g, [23.4, 22.8, 27.4, 21.6, 29.6, 25.2, 28.2, 30.6, 24.2, 31.4, 22.2, 27.6]); P.fill(g, P.rg(g, 25.8, 26.6, 5, [[0, '#ffffff'], [0.45, c.core], [1, sh(c.rune, -0.2)]]));
      g.strokeStyle = '#1a5a8a'; g.lineWidth = 0.5; g.beginPath(); g.arc(25.8, 26.6, 2.4, 0, Math.PI * 2); g.moveTo(25.8, 23.6); g.lineTo(25.8, 29.6); g.moveTo(23.4, 25.4); g.lineTo(28.2, 27.8); g.stroke();
      g.strokeStyle = G.rgba(iw, 0.7); g.lineWidth = 0.35; g.beginPath(); g.moveTo(30, 25); g.lineTo(34, 22); g.lineTo(36.4, 23.4); g.moveTo(21.6, 27.6); g.lineTo(18, 30); g.stroke(); // cracks running out
      // the head: small, angular, hung low in front of the shoulders, a jaw of ice, two rune-eyes
      const hx = 27.6, hy = 16.4;
      g.save(); g.translate(hx, hy); g.scale(1.35, 1.35); g.translate(-hx, -hy);
      facet([hx - 4.4, hy - 2.4, hx + 1, hy - 4.4, hx + 5.2, hy - 1.6, hx + 4.4, hy + 3.4, hx - 3.6, hy + 3.6], [hx - 4.4, hy - 2.4, hx + 1, hy - 4.4, hx + 0.4, hy - 0.6, hx - 3.8, hy + 0.6], null, [hx - 4.4, hy - 2.4, hx + 1, hy - 4.4, hx + 5.2, hy - 1.6]);
      P.path(g, [hx - 3, hy + 2.4, hx + 4, hy + 2.2, hx + 3, hy + 5.2 + (f ? 0.4 : 0), hx - 2.4, hy + 5]); P.fill(g, P.lg(g, 0, hy + 2, 0, hy + 5, [id, idd])); // the jaw
      P.path(g, [hx - 3, hy - 0.4, hx + 4.6, hy - 1, hx + 4.2, hy + 0.8, hx - 2.6, hy + 1.2]); P.fill(g, '#06101a'); // the brow's shadow
      evil(g, hx + 2.4, hy + 0.1, 0.8, c.rune); evil(g, hx - 1, hy + 0.3, 0.7, c.rune); P.glow(g, hx + 0.8, hy + 0.2, 4, c.rune, 0.5);
      g.restore();
      // the near arm, the knuckles planted before it
      facet([36, 15, 42, 16, 45, 30, 39.4, 31.4], [36, 15, 42, 16, 39.6, 22, 37, 22.6], [42, 16, 45, 30, 41.6, 31], [36, 15, 42, 16]);
      facet([39, 30.6, 45.4, 29.4, 47.4, 43.4, 40, 44.4], [39, 30.6, 45.4, 29.4, 42, 36, 40, 37], [45.4, 29.4, 47.4, 43.4, 44.6, 44], null);
      facet([38, 44, 48.6, 42.6, 50, 51.4, 37.6, 52.4], [38, 44, 48.6, 42.6, 43.4, 47], [48.6, 42.6, 50, 51.4, 45.6, 52], [38, 44, 48.6, 42.6]);
      P.rect(g, 39.6, 38.2, 8, 2, ir); P.rect(g, 39.6, 38.2, 8, 0.6, '#6a7280');
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

  /* ---------- Homunculus: a little stitched-together thing of flesh, all head and belly: one great eye, a sewn mouth of teeth,
   *            stubby clawed arms, short bowed legs; two that touch become one, bigger ---------- */
  def('homunculus', { w: 18, h: 16, cy: 11, frames: 2,
    colors: { flesh: '#d0708e', stitch: '#3a1a2a', eye: '#ffe060' },
    draw(g, f, c) {
      const fl = c.flesh, fll = sh(fl, 0.35), fd = sh(fl, -0.35), w = f ? 0.7 : -0.7, st = c.stitch;
      P.ell(g, 9, 15, 6, 0.9, 'rgba(0,0,0,0.45)');
      // short bowed legs, flat feet
      for (const [x, o, col] of [[6.6, -w, fd], [11, w, fl]]) { limb(g, x, 11.6, x - 0.4 + o * 0.4, 14, 1.3, 1, col); P.ell(g, x + 0.2 + o * 0.4, 14.5, 1.5, 0.6, sh(col, -0.2)); }
      // the far arm
      limb(g, 4.4, 8.4, 2.4, 10.6 - w * 0.6, 1, 0.8, fd); claws(g, 2.2, 10.8 - w * 0.6, 2, 3, 0.8, 0.25, '#e8dcc8');
      // one lumpy bulb of head and belly, sewn together from pieces
      g.beginPath(); g.moveTo(3.8, 11.6); g.quadraticCurveTo(2.4, 5.4, 6.6, 2.8); g.quadraticCurveTo(10.6, 1, 13.4, 3.6); g.quadraticCurveTo(15.8, 6.4, 14.4, 11.6); g.quadraticCurveTo(9, 13.4, 3.8, 11.6); g.closePath();
      P.fill(g, P.lg(g, 4, 2, 13, 12, [fll, fl, fd]));
      P.path(g, [3.6, 9.4, 6.4, 8.4, 5.6, 12, 3.8, 11.6]); P.fill(g, sh(fl, -0.15)); // a mismatched patch of skin
      g.strokeStyle = st; g.lineWidth = 0.35; g.beginPath(); g.moveTo(6.8, 2.8); g.quadraticCurveTo(5.6, 6, 6.4, 8.6); g.stroke(); // a seam
      for (let i = 0; i < 4; i++) P.line(g, 5.6 + i * 0.2, 3.8 + i * 1.3, 7.2 + i * 0.2, 3.6 + i * 1.3, 0.3, st); // its stitches
      // the one great eye: a lid, a veined white, a slit pupil
      P.ell(g, 10.4, 5.6, 2.8, 2.5, fd);
      P.ell(g, 10.6, 5.8, 2.3, 2, '#f4e8d8'); P.circle(g, 10.8, 5.8, 1.3, c.eye); P.ell(g, 10.9, 5.8, 0.35, 1.1, '#1a0606');
      P.path(g, [8, 4.4, 10.6, 3.2, 13.2, 4.6, 12.8, 5, 10.6, 4, 8.4, 5]); P.fill(g, fl); // the drooping lid
      g.strokeStyle = '#c04050'; g.lineWidth = 0.2; g.beginPath(); g.moveTo(8.6, 6); g.lineTo(9.4, 6.2); g.moveTo(12.6, 6.6); g.lineTo(11.9, 6.4); g.stroke();
      // the sewn mouth, teeth showing between the stitches
      P.path(g, [7, 8.8, 14, 8.4, 13.2, 11, 7.8, 11.2]); P.fill(g, '#2a0810');
      teeth(g, 7.2, 8.8, 13.8, 8.5, 5, 0.8, 1, '#efe4d0'); teeth(g, 7.8, 11.1, 13.2, 10.9, 4, 0.6, -1, '#e0d0bc');
      for (let i = 0; i < 3; i++) P.line(g, 8.8 + i * 1.8, 8, 9 + i * 1.8, 11.4, 0.35, st);
      // the near arm, stubby, raised
      limb(g, 13.6, 7.6, 15.6, 9.4 + w * 0.6, 1.1, 0.8, fl); claws(g, 15.8, 9.6 + w * 0.6, 0.6, 3, 0.9, 0.25, '#e8dcc8');
    } });

  /* ---------- Capra: a goat-headed fiend on goat legs, hunched to leap; the head turned full on: a long goat face narrowing to
   *            the muzzle, slit eyes burning, a beard, two great ram horns curling either side; a sickle-blade in one hand ---------- */
  def('capra', { w: 26, h: 30, cy: 20, frames: 2,
    colors: { hide: '#8a2a5e', fur: '#4a2240', horn: '#d8c49a', eye: '#ff5ae0' },
    draw(g, f, c) {
      const hd = sh(c.hide, 0.15), hl = sh(c.hide, 0.55), hdd = sh(c.hide, -0.3), fu = c.fur, fl = sh(fu, 0.45), w = f ? 0.8 : -0.8, steel = '#c8ccd8';
      P.ell(g, 12.6, 28.4, 7.6, 1.1, 'rgba(0,0,0,0.45)');
      const leg = (hx, o, col) => {
        limb(g, hx, 18.6, hx + 1.6 + o * 0.4, 22.4, 2.3, 1.4, col); limb(g, hx + 1.6 + o * 0.4, 22.4, hx - 0.4 + o, 25.6, 1.3, 0.9, col); limb(g, hx - 0.4 + o, 25.6, hx + 0.4 + o, 27.8, 0.9, 0.7, col);
        P.path(g, [hx - 0.8 + o, 27.6, hx + 1.8 + o, 27.6, hx + 2 + o, 28.8, hx - 0.8 + o, 28.8]); P.fill(g, '#140a0e'); P.line(g, hx + 0.6 + o, 27.8, hx + 0.6 + o, 28.8, 0.25, '#5a4a50');
      };
      leg(10, -w, fu);
      g.beginPath(); g.moveTo(8.4, 18); g.quadraticCurveTo(4, 18.4, 3.6, 15 + w); g.strokeStyle = fu; g.lineWidth = 0.8; g.stroke(); P.path(g, [3, 15 + w, 4.2, 13.6 + w, 4.4, 15.6 + w]); P.fill(g, fu); // the tail
      // the far arm, a clawed hand reaching out low
      limb(g, 8.2, 11.6, 5, 15, 1.3, 1, hdd); limb(g, 5, 15, 4.4, 18.4, 1, 0.8, hdd); claws(g, 4.2, 18.8, 1.8, 3, 1.3, 0.32, '#e8dcc8');
      // the torso: broad at the shoulders, a narrow waist, ribs, a shaggy pelt from the hips down
      g.beginPath(); g.moveTo(9.6, 18.4); g.quadraticCurveTo(8.2, 14, 6.8, 10.8); g.quadraticCurveTo(12.6, 8.4, 18.4, 10.6); g.quadraticCurveTo(16.2, 14, 15.2, 18.4); g.closePath();
      P.fill(g, P.lg(g, 7, 9, 16, 19, [hl, hd, hdd]));
      P.ell(g, 8.6, 11.4, 2.3, 1.9, P.vol(g, 8, 10.8, 2.3, hd)); P.ell(g, 16.8, 11.2, 2.3, 1.9, P.vol(g, 16.2, 10.6, 2.3, hd));
      g.strokeStyle = hdd; g.lineWidth = 0.35; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(10.2, 13.2 + i * 1.3); g.quadraticCurveTo(12.6, 12.8 + i * 1.3, 15, 13.4 + i * 1.2); g.stroke(); }
      P.path(g, [8.8, 17, 16, 16.8, 16.8, 21, 15, 20.2, 13.6, 21.8, 12.2, 20.4, 10.6, 21.6, 9.2, 20.2]); P.fill(g, P.lg(g, 8, 17, 8, 22, [fl, fu]));
      leg(13.4, w, sh(fu, 0.15));
      // the head, full on: a long face narrowing to the muzzle, horns curling out on both sides
      const hx = 13, hy = 5.4;
      const curl = (sx) => { g.save(); g.translate(hx, hy); g.scale(sx, 1); g.lineCap = 'round';
        g.beginPath(); g.moveTo(1.4, -2.4); g.bezierCurveTo(3, -6.4, 8.6, -5.6, 8.4, -1.4); g.bezierCurveTo(8.2, 2, 4.4, 2.2, 4.4, -0.4);
        g.strokeStyle = sh(c.horn, -0.35); g.lineWidth = 2.2; g.stroke(); g.strokeStyle = c.horn; g.lineWidth = 1.4; g.stroke(); g.strokeStyle = sh(c.horn, 0.5); g.lineWidth = 0.45; g.stroke();
        g.restore(); };
      curl(-1); curl(1);
      P.path(g, [hx - 3.4, hy - 0.6, hx - 5.4, hy + 0.6, hx - 3.2, hy + 1.2]); P.fill(g, hdd); P.path(g, [hx + 3.4, hy - 0.6, hx + 5.4, hy + 0.6, hx + 3.2, hy + 1.2]); P.fill(g, hd); // ears
      g.beginPath(); g.moveTo(hx - 3.2, hy - 2.2); g.quadraticCurveTo(hx, hy - 3.8, hx + 3.2, hy - 2.2); g.quadraticCurveTo(hx + 3.4, hy + 1.6, hx + 1.4, hy + 5.4); g.quadraticCurveTo(hx, hy + 6.2, hx - 1.4, hy + 5.4); g.quadraticCurveTo(hx - 3.4, hy + 1.6, hx - 3.2, hy - 2.2); g.closePath();
      P.fill(g, P.lg(g, hx - 3, hy - 3, hx + 3, hy + 6, [hl, hd, hdd]));
      P.line(g, hx, hy - 2.6, hx, hy + 4.4, 0.4, sh(c.hide, 0.8)); // the lit ridge of the nose
      P.circle(g, hx - 0.6, hy + 4.6, 0.3, '#140a0e'); P.circle(g, hx + 0.6, hy + 4.6, 0.3, '#140a0e'); // nostrils
      for (const s of [-1, 1]) { P.ell(g, hx + s * 1.8, hy - 0.4, 1.1, 0.6, '#140a0e', s * 0.35); evil(g, hx + s * 1.8, hy - 0.4, 0.62, c.eye, s * 0.35); }
      P.glow(g, hx, hy - 0.4, 3.4, c.eye, 0.4);
      P.path(g, [hx - 1.2, hy + 5.4, hx + 1.2, hy + 5.4, hx + 0.2, hy + 8.4 + (f ? 0.4 : 0)]); P.fill(g, fu); // the beard
      // the near arm out to the side, a sickle-blade raised
      limb(g, 17.6, 12, 20.8, 15.6, 1.3, 1, hd); limb(g, 20.8, 15.6, 22.4, 12.6, 1, 0.8, hl); P.circle(g, 22.6, 12.4, 0.95, hl);
      P.line(g, 22.4, 14.2, 23, 10.6, 0.6, '#3a2a1c');
      g.beginPath(); g.moveTo(23, 10.8); g.bezierCurveTo(22.8, 5.8, 26.4, 4.8, 26.8, 8.8); g.bezierCurveTo(25.8, 6.8, 24.2, 7.2, 23.6, 11.2); g.closePath(); P.fill(g, P.lg(g, 23, 6, 27, 11, ['#ffffff', steel, '#5a5e6a']));
    } });

  /* ---------- Fiendcaster: a floating caster in a horned hood, a pale bone mask with burning slits, a robe unravelling into
   *            tendrils where legs should be, long-fingered hands raised apart, an orb of hex-light in each ---------- */
  def('fiendcaster', { w: 22, h: 28, cy: 19, frames: 2,
    colors: { robe: '#3a1a4a', bone: '#e0d4c0', orb: '#ff60d0', eye: '#ff60d0' },
    draw(g, f, c) {
      const r = c.robe, rl = sh(r, 0.45), rd = sh(r, -0.45), sway = f ? 0.7 : -0.7, b = c.bone;
      P.ell(g, 11, 26.6, 5, 0.9, 'rgba(0,0,0,0.35)');
      // the robe: narrow shoulders, widening, torn at the bottom into tendrils that drift
      g.beginPath(); g.moveTo(8, 9.6); g.lineTo(14, 9.6); g.quadraticCurveTo(15.6, 15, 16 + sway * 0.4, 19.4); g.lineTo(6 - sway * 0.4, 19.4); g.quadraticCurveTo(6.4, 15, 8, 9.6); g.closePath();
      P.fill(g, P.lg(g, 6, 9, 16, 20, [rl, r, rd]));
      [[6.6, 3], [8.8, 5.2], [11, 4.2], [13.2, 5.6], [15.2, 3.4]].forEach(([x, l], i) => { const d = (i % 2 ? 1 : -1) * sway; g.beginPath(); g.moveTo(x - 1.1, 19); g.quadraticCurveTo(x + d, 19 + l * 0.6, x + d * 1.4, 19 + l); g.quadraticCurveTo(x + d * 0.2 + 0.4, 19 + l * 0.5, x + 1.1, 19); g.closePath(); P.fill(g, P.lg(g, x, 19, x, 19 + l, [rd, G.rgba(rd, 0.2)])); });
      // a sigil burning on the breast
      g.strokeStyle = c.orb; g.lineWidth = 0.4; g.beginPath(); g.arc(11, 14.2, 1.4, 0, Math.PI * 2); g.moveTo(11, 12.4); g.lineTo(11, 16.2); g.moveTo(9.6, 13.4); g.lineTo(12.4, 15); g.stroke(); P.glow(g, 11, 14.2, 2.4, c.orb, 0.4);
      // the far arm raised low, an orb in the long fingers
      P.path(g, [8.4, 10.2, 4.4, 13.4, 3.8, 15, 5.6, 14.6, 9, 12.4]); P.fill(g, rd); // the sleeve
      P.line(g, 4.6, 14.6, 3.4, 16.2, 0.4, b); P.line(g, 4.2, 14.4, 2.6, 15.2, 0.35, b);
      P.glow(g, 3, 17 + sway * 0.4, 3.4, c.orb, 0.75); P.circle(g, 3, 17 + sway * 0.4, 1.1, P.rg(g, 3, 17 + sway * 0.4, 1.1, [[0, '#ffffff'], [0.5, sh(c.orb, 0.4)], [1, c.orb]]));
      // the horned hood and the bone mask inside it
      const hx = 11.2, hy = 6.6;
      horn(g, hx - 2.6, hy - 2.4, hx - 5.8, hy - 5, hx - 5, hy - 8.4, 0.8, '#2a1a24'); horn(g, hx + 2.4, hy - 2.6, hx + 5.4, hy - 5.4, hx + 4.2, hy - 8.8, 0.8, '#3a2a30');
      g.beginPath(); g.moveTo(hx - 4, hy + 3.6); g.quadraticCurveTo(hx - 4.6, hy - 3.4, hx, hy - 4.4); g.quadraticCurveTo(hx + 4.6, hy - 3.4, hx + 4.2, hy + 3.4); g.quadraticCurveTo(hx, hy + 2, hx - 4, hy + 3.6); g.closePath();
      P.fill(g, P.lg(g, hx - 4, hy - 4, hx + 4, hy + 4, [rl, r, rd]));
      P.ell(g, hx + 0.4, hy + 0.4, 2.8, 3.1, VOID);
      g.beginPath(); g.moveTo(hx - 1.8, hy - 1.2); g.quadraticCurveTo(hx + 0.6, hy - 2.4, hx + 2.8, hy - 0.8); g.lineTo(hx + 2.2, hy + 1.8); g.lineTo(hx + 0.6, hy + 3.2); g.lineTo(hx - 1.2, hy + 1.8); g.closePath();
      P.fill(g, P.lg(g, hx - 2, hy - 2, hx + 3, hy + 3, [sh(b, 0.2), b, sh(b, -0.35)])); // the mask
      P.path(g, [hx - 1.2, hy - 0.2, hx + 0.2, hy + 0.2, hx - 1, hy + 0.5]); P.fill(g, '#140410'); P.path(g, [hx + 0.9, hy + 0.2, hx + 2.4, hy - 0.2, hx + 2, hy + 0.5]); P.fill(g, '#140410');
      P.glow(g, hx + 0.6, hy + 0.2, 2.6, c.eye, 0.6); P.line(g, hx - 1, hy + 0.2, hx - 0.1, hy + 0.3, 0.25, c.eye); P.line(g, hx + 1.1, hy + 0.3, hx + 2.2, hy, 0.25, c.eye);
      P.line(g, hx + 0.4, hy + 1.8, hx + 1, hy + 2.8, 0.25, sh(b, -0.5)); // a crack in the mask
      // the near arm raised high, the other orb swelling in the fingers
      P.path(g, [13.8, 10.2, 17, 8.2, 18.4, 6.4, 16.6, 6.6, 13.4, 9]); P.fill(g, rl);
      P.line(g, 17.6, 6.8, 18.6, 5.2, 0.4, b); P.line(g, 18, 7, 19.6, 6.2, 0.35, b);
      P.glow(g, 19.2, 3.6 - sway * 0.4, 3.8, c.orb, 0.8); P.circle(g, 19.2, 3.6 - sway * 0.4, 1.3, P.rg(g, 19.2, 3.6 - sway * 0.4, 1.3, [[0, '#ffffff'], [0.5, sh(c.orb, 0.4)], [1, c.orb]]));
    } });

  /* ---------- Shapeshifter: a tall writhing thing of flesh standing on tendrils: a human face split down the middle, its two
   *            halves pulled apart on a toothed maw, each half with one eye; long arms with too many fingers ---------- */
  def('shapeshifter', { w: 26, h: 26, cy: 17, frames: 2,
    colors: { flesh: '#9a3a6e', dark: '#2a0e22', eye: '#ffe060', tooth: '#efe4d0' },
    draw(g, f, c) {
      const fl = sh(c.flesh, 0.1), fll = sh(c.flesh, 0.5), fd = sh(c.flesh, -0.35), w = f ? 1 : -1, skin = '#d8b098', sk = sh(skin, -0.25);
      P.ell(g, 13, 24.6, 8, 1.1, 'rgba(0,0,0,0.45)');
      // tendrils it stands on
      [[9.6, -3.8], [11.4, -1.4], [13, 0.4], [14.6, 1.8], [16.2, 4]].forEach(([x, dx], i) => { const d = (i % 2 ? w : -w) * 0.8; g.beginPath(); g.moveTo(x - 1, 17.6); g.quadraticCurveTo(x + dx * 0.4 + d, 21, x + dx + d, 24.4); g.quadraticCurveTo(x + dx * 0.3 + d * 0.3, 21, x + 1, 17.6); g.closePath(); P.fill(g, P.lg(g, x, 18, x, 24, [fl, fd])); });
      // the far arm: long, jointed wrong, the hand with too many fingers
      limb(g, 8.6, 9.4, 5, 14.4, 1.1, 0.9, fd); limb(g, 5, 14.4, 4, 19.4, 0.9, 0.7, fd); claws(g, 3.9, 19.8, 1.8, 5, 1.6, 0.28, sk);
      // the body: hunched shoulders narrowing into the tendrils, ribs showing through, folds of flesh
      g.beginPath(); g.moveTo(10.4, 18.6); g.quadraticCurveTo(7, 14, 7, 10); g.quadraticCurveTo(9.6, 7.2, 13, 7.6); g.quadraticCurveTo(16.8, 7, 19.2, 10); g.quadraticCurveTo(19, 14, 15.6, 18.6); g.closePath();
      P.fill(g, P.lg(g, 7, 7, 18, 19, [fll, fl, fd]));
      g.strokeStyle = fd; g.lineWidth = 0.4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(9.4, 11.2 + i * 1.6); g.quadraticCurveTo(13, 10.4 + i * 1.6, 16.8, 11.4 + i * 1.5); g.stroke(); }
      P.ell(g, 12.8, 16, 1.4, 0.8, G.rgba('#ff3a5a', 0.4)); // a raw wound
      // the head: a human face split in two, the halves pulled apart on a maw of teeth
      const hx = 13, hy = 4.6, gap = f ? 1.4 : 1;
      P.path(g, [hx - 1.6, hy - 2.6, hx + 1.6, hy - 2.6, hx + 1.4, hy + 4.4, hx - 1.4, hy + 4.4]); P.fill(g, '#1a0410'); // the maw
      teeth(g, hx - gap * 0.6, hy - 1.6, hx - gap * 0.6, hy + 3.8, 5, 0.9, -1, c.tooth); teeth(g, hx + gap * 0.6, hy - 1.6, hx + gap * 0.6, hy + 3.8, 5, 0.9, 1, sh(c.tooth, -0.15));
      P.glow(g, hx, hy + 1, 2.2, '#ff3a5a', 0.4);
      for (const s of [-1, 1]) {
        g.save(); g.translate(hx + s * (gap + 1.8), hy + 0.6); g.rotate(s * 0.25); g.scale(s, 1);
        g.beginPath(); g.moveTo(-1.6, -3.4); g.quadraticCurveTo(1.6, -4, 2.2, -1); g.quadraticCurveTo(2.4, 2.4, 0.6, 4); g.lineTo(-1.8, 3.2); g.closePath();
        P.fill(g, P.lg(g, -2, -4, 2, 4, s < 0 ? [sh(skin, 0.2), skin, sk] : [skin, sk, sh(sk, -0.2)])); // a half of the face
        P.ell(g, 0.4, -0.6, 0.9, 0.7, '#1a0a0a'); evil(g, 0.4, -0.6, 0.55, c.eye);
        P.path(g, [-1.6, 1.6, 0.8, 1.8, -0.2, 2.6]); P.fill(g, '#5a1a24'); // half a mouth
        g.restore();
      }
      // the near arm, reaching, fingers splayed
      limb(g, 17.8, 9.6, 21.6, 13.2 + w * 0.4, 1.2, 0.9, fl); limb(g, 21.6, 13.2 + w * 0.4, 23, 17.4, 0.9, 0.7, fll); claws(g, 23.2, 17.8, 1.2, 5, 1.7, 0.3, skin);
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

  /* ---------- Twisted Knight (boss): a knight the discord crystal has grown through: hunched and lopsided in bent plate,
   *            crystals bursting from its back, one shoulder and the split visor; its near arm grown into a great crystal blade,
   *            the far hand dragging a notched sword; it cuts before and behind it at once ---------- */
  def('twistedknight', { w: 50, h: 58, cy: 36, frames: 2,
    colors: { plate: '#4a3a5a', crystal: '#e060ff', eye: '#ff60d0', cloth: '#2a0e2a' },
    draw(g, f, c) {
      const m = sh(c.plate, 0.1), ml = sh(c.plate, 0.55), md = sh(c.plate, -0.4), X = c.crystal, XL = sh(X, 0.55), XD = sh(X, -0.4), w = f ? 0.8 : -0.8;
      const shard = (x, y, tx, ty, wd) => { const a = Math.atan2(ty - y, tx - x), nx = -Math.sin(a) * wd, ny = Math.cos(a) * wd;
        P.path(g, [x + nx, y + ny, tx, ty, x - nx, y - ny]); P.fill(g, P.lg(g, x - nx, y - ny, x + nx, y + ny, [XL, X, XD])); P.line(g, x, y, tx, ty, 0.3, G.rgba('#ffffff', 0.6)); };
      P.ell(g, 24, 55, 14, 2.2, 'rgba(0,0,0,0.45)');
      P.glow(g, 22, 22, 18, X, 0.15);
      // a torn cloak hanging off the far side
      g.beginPath(); g.moveTo(14.6, 16); g.bezierCurveTo(9, 24, 8 - w, 36, 7.4 - w, 48); g.lineTo(17, 45); g.lineTo(19, 18); g.closePath();
      P.fill(g, P.lg(g, 7, 16, 19, 48, [sh(c.cloth, 0.3), c.cloth, sh(c.cloth, -0.5)]));
      P.rag(g, 7.4 - w, 47.6, 17, 44.6, 4, 2.6, sh(c.cloth, -0.4));
      // crystals bursting from the back, uneven, leaning back
      shard(15, 16, 8, 3.4, 2.6); shard(18, 14, 16, 0.6, 2); shard(13.6, 20, 6.4, 14, 1.6);
      // the far arm hanging, dragging a notched sword point-down behind
      limb(g, 15.4, 19, 12.6, 27, 2.2, 1.8, md); limb(g, 12.6, 27, 11.4, 33.6, 1.8, 1.5, md); P.circle(g, 11.2, 34.2, 1.8, P.vol(g, 10.8, 33.6, 1.8, m));
      g.save(); g.translate(11, 34.6); g.rotate(0.35);
      P.path(g, [-1.1, 1.4, 1.1, 1.4, 1, 13, 0.4, 14.6, -0.2, 12.4, -1, 12.8]); P.fill(g, P.lg(g, -1, 0, 1, 0, ['#c8ccd8', '#6a6e7a'])); P.rrect(g, -2.8, 0.4, 5.6, 1.1, 0.4, md);
      g.restore();
      // legs: bent plate, one knee buckled, sabatons
      const leg = (hx, kx, ax, col, lit) => { limb(g, hx, 36, kx, 44, 2.8, 2.2, col); limb(g, kx, 44, ax, 51.8, 2.2, 1.8, col); P.circle(g, kx, 44, 2.1, P.vol(g, kx - 0.6, 43.2, 2.1, lit)); P.path(g, [ax - 2.2, 51.2, ax + 2.2, 51.2, ax + 4, 53.8, ax - 2.4, 53.8]); P.fill(g, md); };
      leg(19.6, 16.6 - w * 0.4, 16.8 - w, md, m); leg(26.4, 29.6 + w * 0.4, 30.6 + w, m, ml);
      // hip plates
      for (let i = 0; i < 3; i++) P.rrect(g, 18.4 + i * 3.4, 32, 3.2, 5 - (i === 1 ? 0 : 1), 1, P.lg(g, 0, 32, 0, 37, [ml, md]));
      // the torso: hunched to one side, the breastplate bent, a crystal splitting it
      g.beginPath(); g.moveTo(15, 17.6); g.lineTo(32.4, 15.4); g.quadraticCurveTo(33.4, 25, 29.4, 32.6); g.lineTo(18.4, 32.6); g.quadraticCurveTo(14.4, 25, 15, 17.6); g.closePath();
      P.fill(g, P.lg(g, 15, 15, 32, 33, [ml, m, md]));
      P.ell(g, 20.6, 22, 4.4, 4.2, P.vol(g, 19.4, 20.4, 4.6, m), 0.25); P.ell(g, 27.6, 21.2, 4.4, 4.4, P.vol(g, 26.6, 19.6, 4.6, sh(c.plate, 0.2)), -0.1);
      P.line(g, 18.6, 28.6, 29.4, 28.2, 0.6, md);
      shard(25.4, 26, 27.6, 19, 1.6); shard(24.4, 26.4, 22.6, 22.2, 0.9); P.glow(g, 25.4, 23, 4, X, 0.5);
      // the far pauldron
      P.ell(g, 15.4, 18.4, 3.8, 2.8, P.vol(g, 14.6, 17.4, 3.8, m));
      // the helm: tall and bent forward, the visor split open by a crystal growing out of it, one eye burning
      const hx = 24.6, hy = 10.4;
      P.rrect(g, hx - 3.4, hy + 4, 7, 2.6, 0.8, md); // the gorget
      g.beginPath(); g.moveTo(hx - 4, hy + 4.4); g.lineTo(hx - 4.4, hy - 2); g.quadraticCurveTo(hx - 3.6, hy - 6.4, hx + 0.6, hy - 6.6); g.quadraticCurveTo(hx + 4.4, hy - 5.8, hx + 4.8, hy - 1.6); g.lineTo(hx + 4.2, hy + 4); g.closePath();
      P.fill(g, P.lg(g, hx - 4, hy - 6, hx + 4, hy + 4, [ml, m, md]));
      P.rect(g, hx - 3.2, hy - 0.6, 7.2, 1.1, '#0a040a'); P.glow(g, hx + 2.4, hy, 2.6, c.eye, 0.8); P.circle(g, hx + 2.6, hy - 0.1, 0.55, c.eye);
      shard(hx - 0.4, hy + 0.2, hx - 3.4, hy - 9.6, 1.4); shard(hx + 0.8, hy - 1, hx + 3.6, hy - 7.4, 0.9); // the crystal splitting the helm
      // the near shoulder, overgrown with crystal, and the arm grown into a great blade of it
      P.ell(g, 32.6, 17.4, 4.4, 3.2, P.vol(g, 31.6, 16.4, 4.4, sh(c.plate, 0.15)));
      shard(32.4, 15.4, 35.4, 8.2, 1.8); shard(34.6, 16.6, 39.6, 12.6, 1.2);
      limb(g, 33.4, 19.6, 37, 26, 2.3, 1.9, m); P.circle(g, 37, 26, 1.8, P.vol(g, 36.4, 25.4, 1.8, ml));
      shard(36.6, 25, 46.6 + w * 0.4, 44, 3); P.line(g, 38.8, 26.4, 46 + w * 0.4, 42.6, 0.4, '#ffffff');
      P.glow(g, 42, 35, 5, X, 0.35);
    } });

  /* ================= Hall 6: the Blightmire ================= */
  /** Dripping slime strands from (x,y) downward. */
  function drips(g, pts, col) { for (const [x, y, l] of pts) { P.line(g, x, y, x, y + l, 0.45, col); P.circle(g, x, y + l, 0.45, col); } }

  /* ---------- Blight Mosquito: a gaunt bog mosquito as big as a cat: a humped dark thorax, huge red compound eyes, a needle
   *            proboscis, two pairs of veined wings in a blur, long jointed legs trailing, a swollen sac of stolen blood glowing ---------- */
  def('mosquito', { w: 24, h: 18, cy: 10, frames: 2,
    colors: { body: '#3a3a1e', sac: '#a02030', wing: '#c8d8a0', eye: '#ff3a2a' },
    draw(g, f, c) {
      const b = sh(c.body, -0.1), bl = sh(b, 0.5), bd = sh(b, -0.4), sac = c.sac, w = f ? 1 : -1;
      P.ell(g, 12, 17.4, 6, 0.7, 'rgba(0,0,0,0.3)');
      // the far wings, a blur behind
      g.save(); g.globalAlpha = 0.5;
      g.beginPath(); g.moveTo(14.4, 5.4); g.quadraticCurveTo(17.4, -0.6 + w, 20.4, 0.4 + w * 1.2); g.quadraticCurveTo(18.4, 3.6, 14.8, 6.2); g.closePath(); P.fill(g, sh(c.wing, -0.1));
      g.beginPath(); g.moveTo(13, 5.4); g.quadraticCurveTo(10, -0.4 + w, 5, 0.6 + w * 1.4); g.quadraticCurveTo(8, 3.6, 12.4, 6.2); g.closePath(); P.fill(g, sh(c.wing, -0.2));
      g.restore();
      // long jointed legs trailing below
      for (const [x, kx, ky, fx, fy, col] of [[12.6, 9.4, 12, 7.4 - w * 0.4, 17, bd], [14, 13, 12.6, 12 + w * 0.3, 17.4, bd], [15.2, 17.4, 11.6, 19.4 + w * 0.4, 16.6, b], [13.2, 11, 12.4, 9.6 + w * 0.3, 17.2, b]]) {
        P.line(g, x, 8.6, kx, ky, 0.5, col); P.line(g, kx, ky, fx, fy, 0.4, col); P.line(g, fx, fy, fx + 0.6, fy + 0.4, 0.3, col); }
      // the blood sac: swollen, taut, glowing through thin skin, ringed in segments
      g.save(); g.translate(6.8, 9.6); g.rotate(0.28);
      P.ell(g, 0, 0, 5.8, 3.8, P.lg(g, -5, -3, 5, 3, ['#d8c0a8', '#8a6a58', '#3a2a20']));
      P.ell(g, 0.4, 0.4, 4.6, 2.8, P.rg(g, -0.6, -0.4, 5, [[0, '#ff6a6a'], [0.5, sac], [1, sh(sac, -0.5)]])); // the blood inside, seen through the skin
      g.strokeStyle = G.rgba('#3a0a0a', 0.6); g.lineWidth = 0.25; g.beginPath(); g.moveTo(-4, 0); g.quadraticCurveTo(-1, -1.6, 3, -0.8); g.moveTo(-3, 1.4); g.quadraticCurveTo(0, 0.6, 3.6, 1.6); g.stroke(); // veins
      g.strokeStyle = G.rgba(sh(sac, -0.6), 0.7); g.lineWidth = 0.35; for (const x of [-2.6, 0, 2.6]) { g.beginPath(); g.ellipse(x, 0, 0.9, 3.4 - Math.abs(x) * 0.3, 0, -1.4, 1.4); g.stroke(); }
      P.ell(g, -2, -1.8, 1.8, 0.7, G.rgba('#ffffff', 0.45), -0.2);
      g.restore();
      P.glow(g, 6.8, 9.6, 5, sac, 0.35);
      // the thorax: humped, dark, bristled
      P.ell(g, 14, 6.8, 2.6, 2.4, P.vol(g, 13.2, 5.8, 2.6, bl));
      P.line(g, 11.4, 8, 12.6, 7.4, 1.2, b);
      // the near wings in a blur
      g.save(); g.globalAlpha = 0.7;
      g.beginPath(); g.moveTo(13.4, 5); g.quadraticCurveTo(12.6, -1 - w * 0.4, 7.4, -0.4 - w * 0.6); g.quadraticCurveTo(9.4, 3, 13, 6); g.closePath(); P.fill(g, P.lg(g, 7, 0, 13, 6, [sh(c.wing, 0.3), G.rgba(c.wing, 0.6)]));
      g.strokeStyle = sh(c.wing, -0.5); g.lineWidth = 0.25; g.beginPath(); g.moveTo(13, 5); g.quadraticCurveTo(11, 1 - w * 0.4, 8, 0 - w * 0.6); g.moveTo(12.6, 5.6); g.quadraticCurveTo(10.6, 3, 8.6, 1.6 - w * 0.4); g.stroke();
      g.restore();
      // the head: huge red compound eyes, feathered antennae, the needle proboscis
      P.circle(g, 18, 7.2, 1.9, bd);
      P.circle(g, 18.4, 6.6, 1.3, P.rg(g, 18, 6.2, 1.6, [[0, '#ffb0a0'], [0.4, c.eye], [1, sh(c.eye, -0.6)]]));
      for (const [x, y] of [[18, 6.2], [18.8, 6.4], [18.3, 7.1], [19, 7]]) P.circle(g, x, y, 0.22, G.rgba('#1a0404', 0.5));
      P.glow(g, 18.4, 6.6, 2.4, c.eye, 0.45);
      P.line(g, 18.6, 5.2, 20.6, 2.6 + w * 0.3, 0.3, bd); P.line(g, 19.4, 3.8, 20.4, 3.6, 0.25, bd); P.line(g, 19.8, 3.2, 21, 3.4, 0.25, bd);
      P.line(g, 19.4, 8.2, 23.8, 11.2, 0.45, sh(bd, -0.2)); P.circle(g, 23.8, 11.2, 0.3, sac);
    } });

  /* ---------- Bog Corpse: a swamp ghoul hunched under a back of swollen gas-blisters that glow through the skin (it bursts in a
   *            cloud of that gas), grey-green and gaunt, arms dragging, the jaw hanging open ---------- */
  def('bogcorpse', { w: 22, h: 28, cy: 18, frames: 2,
    colors: { skin: '#6a7a4a', rot: '#3a4a1a', gas: '#b0d040', eye: '#e0ff60' },
    draw(g, f, c) {
      const s = sh('#5a6a58', 0.1), sl = sh(s, 0.45), sd = sh(s, -0.4), w = f ? 0.8 : -0.8, G0 = 26.6, nail = '#d8d0b0';
      P.ell(g, 11, G0 + 0.4, 6.8, 1, 'rgba(0,0,0,0.45)');
      const leg = (hx, kx, ax, col) => { limb(g, hx, 18, kx, 22, 1.4, 1, col); limb(g, kx, 22, ax, 25.8, 1, 0.8, col); P.path(g, [ax - 1, 25.6, ax + 2, 25.8, ax + 2.2, 26.8, ax - 1.2, 26.8]); P.fill(g, col); };
      leg(8.6, 7.4 - w * 0.4, 7.2 - w, sd);
      // the far arm hanging to the knee, clawed
      limb(g, 7.2, 11.6, 5.4, 16.6, 1.1, 0.9, sd); limb(g, 5.4, 16.6, 5.8, 21, 0.9, 0.7, sd); claws(g, 5.8, 21.4, 1.6, 3, 1.3, 0.3, nail);
      // the body: hunched forward, gaunt below, the ribs showing, a rag at the loins
      g.beginPath(); g.moveTo(7.4, 18.6); g.quadraticCurveTo(6, 14, 6.8, 10.4); g.quadraticCurveTo(10, 7.6, 14.4, 9.4); g.quadraticCurveTo(15, 14, 12.6, 18.6); g.closePath();
      P.fill(g, P.lg(g, 6, 8, 15, 19, [sl, s, sd]));
      g.strokeStyle = sd; g.lineWidth = 0.4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(9, 12 + i * 1.4); g.quadraticCurveTo(11.4, 11.6 + i * 1.4, 13.6, 12.4 + i * 1.3); g.stroke(); }
      P.path(g, [7, 17, 13, 17, 13.4, 20, 11.4, 19.2, 10, 20.6, 8.6, 19.2, 7.2, 20.2]); P.fill(g, c.rot);
      // the back: a cluster of gas-blisters, big and small, glowing through thin skin
      P.glow(g, 7.4, 9, 6, c.gas, 0.45);
      [[5.8, 9.6, 2.6], [8.8, 7.2, 2.3], [4.6, 13, 1.8], [11.2, 7.4, 1.4], [7.2, 11.8, 1.2]].forEach(([x, y, r]) => {
        P.circle(g, x, y, r, P.rg(g, x - r * 0.3, y - r * 0.3, r, [[0, '#f4ffc0'], [0.4, c.gas], [1, sh(c.gas, -0.55)]]));
        g.beginPath(); g.arc(x, y, r, 0.3, 1.9); g.strokeStyle = sd; g.lineWidth = 0.35; g.stroke(); // the skin stretched round its base
      });
      leg(11.6, 13.2 + w * 0.4, 13.6 + w, s);
      // the head, low and forward: bald, a heavy brow, sunken eyes burning, the jaw hanging open
      const hx = 16, hy = 9;
      limb(g, 12.6, 10.4, hx - 1.4, hy + 0.8, 1.4, 1.1, s);
      g.save(); g.translate(hx, hy); g.scale(1.25, 1.25); g.translate(-hx, -hy);
      P.ell(g, hx, hy, 2.6, 2.3, P.vol(g, hx - 0.8, hy - 0.8, 2.6, sl), 0.2);
      P.path(g, [hx - 1, hy - 1.2, hx + 2.6, hy - 1, hx + 2.3, hy - 0.2, hx - 0.8, hy - 0.4]); P.fill(g, sd);
      P.ell(g, hx + 1.3, hy + 0.1, 0.75, 0.6, '#0a0e06'); evil(g, hx + 1.3, hy + 0.1, 0.45, c.eye); P.ell(g, hx - 0.4, hy + 0.2, 0.55, 0.5, '#0a0e06'); evil(g, hx - 0.4, hy + 0.2, 0.35, c.eye);
      P.path(g, [hx + 0.2, hy + 1.2, hx + 2.8, hy + 1, hx + 2.4, hy + 3.6 + (f ? 0.4 : 0), hx + 0.4, hy + 3.2]); P.fill(g, '#0a0e06');
      teeth(g, hx + 0.4, hy + 1.2, hx + 2.6, hy + 1, 3, 0.5, 1, nail); g.restore();
      // the near arm reaching forward, claws out
      limb(g, 13.6, 11.2, 16.6, 14.6, 1.2, 0.9, s); limb(g, 16.6, 14.6, 19.4, 14.2 + w * 0.3, 0.9, 0.7, sl); claws(g, 19.6, 14.2 + w * 0.3, 0.2, 3, 1.4, 0.32, nail);
      g.save(); g.globalAlpha = 0.4; P.ell(g, 5 - (f ? 0.4 : 0), 5.4 - (f ? 0.6 : 0), 1.4, 1, c.gas); P.ell(g, 3.4, 3.4 - (f ? 0.6 : 0), 1, 0.7, c.gas); g.restore(); // gas seeping off
    } });

  /* ---------- Bog Wraith: a swamp hag, bent double under a cloak of rotting reeds and moss, a long crooked face with one burning
   *            eye, a bony hand raised holding a will-o'-wisp; she calls up the hands of the drowned ---------- */
  def('bogwraith', { w: 24, h: 28, cy: 18, frames: 2,
    colors: { mist: '#8aa070', hair: '#1e2614', eye: '#d0ff40', skin: '#a8b48a' },
    draw(g, f, c) {
      const cl = '#3a4a2a', cll = sh(cl, 0.45), cld = sh(cl, -0.45), s = c.skin, sd = sh(s, -0.35), w = f ? 0.6 : -0.6, reed = '#8a8a4a';
      P.ell(g, 11.4, 26.8, 7, 1, 'rgba(0,0,0,0.45)');
      // a crooked walking stick
      P.line(g, 5.4, 26.6, 4.4, 12, 0.8, '#3a2a18'); P.circle(g, 4.4, 11.6, 0.9, '#4a3a22');
      // the cloak: bent double, a hump on the back, hanging in strips of reed and moss to the ground
      g.beginPath(); g.moveTo(6.4, 26.4); g.quadraticCurveTo(4.6, 17, 7.4, 11); g.quadraticCurveTo(10.4, 5.6, 15.4, 7.6); g.quadraticCurveTo(18.4, 9.6, 17, 14); g.quadraticCurveTo(16.4, 20, 18 + w, 26.4); g.closePath();
      P.fill(g, P.lg(g, 6, 7, 17, 26, [cll, cl, cld]));
      for (let i = 0; i < 6; i++) { const x = 7 + i * 1.9; g.beginPath(); g.moveTo(x, 17 + (i % 2) * 2); g.quadraticCurveTo(x + (i % 2 ? w : -w), 22, x - 0.3, 26.6 - (i % 3) * 0.6); g.strokeStyle = i % 2 ? reed : sh(reed, -0.35); g.lineWidth = 0.55; g.stroke(); } // reeds
      g.strokeStyle = sh(c.mist, -0.2); g.lineWidth = 0.8; for (const x of [9, 13.4]) { g.beginPath(); g.moveTo(x, 10.4); g.quadraticCurveTo(x + w, 13, x - 0.4, 15.6); g.stroke(); } // moss hanging
      // bare bony feet under the hem
      for (const [x, d] of [[14.6, 0], [17.4 + w, 0.4]]) { P.path(g, [x - 0.6, 25.4, x + 1.6, 25.8 + d, x + 2.6, 26.8, x - 0.8, 26.8]); P.fill(g, sd); P.line(g, x + 1.8, 26.4, x + 2.9, 26.6, 0.3, s); }
      // the far hand gripping the stick
      limb(g, 8, 13.4, 5.2, 15.2, 1, 0.8, cld); P.circle(g, 4.8, 15.2, 0.9, sd); claws(g, 5.2, 15.2, 0.4, 3, 0.8, 0.22, s);
      // the deep hood and the old face in it: long and pale, a hooked nose, two eyes burning, grey hair straggling out
      const hx = 15.6, hy = 10.2;
      P.path(g, [hx - 4.2, hy + 1, hx - 3, hy - 3.6, hx + 0.4, hy - 5, hx + 3.4, hy - 3, hx + 4, hy + 0.6, hx + 2.6, hy + 4.4, hx - 1.4, hy + 4]); P.fill(g, P.lg(g, hx - 4, hy - 5, hx + 4, hy + 4, [cll, cl, cld]));
      P.ell(g, hx + 0.8, hy + 0.4, 2.8, 3.2, '#0a0e06');
      P.path(g, [hx - 0.4, hy - 1.6, hx + 2, hy - 2, hx + 2.6, hy - 0.4, hx + 4.4, hy + 1.4, hx + 2.8, hy + 1.6, hx + 2.6, hy + 3.4, hx + 1.2, hy + 3.8, hx - 0.2, hy + 2.2]);
      P.fill(g, P.lg(g, hx, hy - 2, hx + 3, hy + 4, [sh(s, 0.3), s, sd])); // the face, the nose hooking out
      P.ell(g, hx + 0.6, hy - 0.4, 0.6, 0.5, '#0a0e06'); P.ell(g, hx + 2, hy - 0.5, 0.55, 0.45, '#0a0e06');
      evil(g, hx + 0.6, hy - 0.4, 0.4, c.eye); evil(g, hx + 2, hy - 0.5, 0.36, c.eye); P.glow(g, hx + 1.3, hy - 0.4, 1.2, c.eye, 0.35);
      P.line(g, hx + 1, hy + 2.4, hx + 2.4, hy + 2.3, 0.35, '#1a0a06'); // a thin mouth
      for (const [x0, l, d] of [[hx - 0.6, 5.4, -0.6], [hx - 1.4, 4.2, -0.4], [hx + 2.8, 3.8, 0.4]]) { g.beginPath(); g.moveTo(x0, hy - 1.4); g.quadraticCurveTo(x0 + d + w * 0.3, hy + l * 0.5, x0 + d * 1.6, hy + l); g.strokeStyle = '#9a9a88'; g.lineWidth = 0.45; g.stroke(); }
      // the bony arm thrust forward and up, a will-o'-wisp floating over the hand
      limb(g, 14.6, 14, 18.4, 14.4, 1.4, 1.1, cl); limb(g, 18.4, 14.4, 20.4, 10.6, 0.8, 0.6, s); claws(g, 20.6, 10.4, -1.6, 4, 1.4, 0.26, s);
      P.glow(g, 21.6, 6.2 + w * 0.6, 3.2, c.eye, 0.7); P.circle(g, 21.6, 6.2 + w * 0.6, 1.1, P.rg(g, 21.6, 6.2 + w * 0.6, 1.1, [[0, '#ffffff'], [0.5, sh(c.eye, 0.3)], [1, c.eye]]));
    } });

  /* ---------- Bog Toad: a squat warty toad as big as a hound, dark and slick: bulging eyes with slit pupils burning, poison
   *            glands swollen behind them and weeping, a wide mouth that splits the head; frame 1 its tongue lashes out ---------- */
  def('toad', { w: 26, h: 18, cy: 12, frames: 2,
    colors: { skin: '#5a6a2a', belly: '#c8c080', wart: '#8a9a3a', eye: '#ffb020' },
    draw(g, f, c) {
      const s = sh(c.skin, -0.35), sl = sh(s, 0.5), sd = sh(s, -0.5), bel = sh(c.belly, -0.1), wart = c.wart, gland = '#b0ff50';
      P.ell(g, 12.4, 16.8, 10.6, 1.2, 'rgba(0,0,0,0.45)');
      // the far legs
      P.limb(g, 18.4, 12, 20.4, 16.4, 1.2, 0.9, sd); P.ell(g, 21.2, 16.6, 1.4, 0.5, sd);
      // the body: squat and heavy, sloping up to the head, the pale belly below
      g.beginPath(); g.moveTo(2.6, 15); g.bezierCurveTo(1, 9, 5, 5.6, 11, 5.2); g.bezierCurveTo(17, 4.6, 23.4, 5, 24.4, 9.4); g.bezierCurveTo(24.8, 12.6, 21, 15.4, 16, 15.6); g.closePath();
      P.fill(g, P.lg(g, 4, 5, 20, 16, [sl, s, sd]));
      P.path(g, [7, 15.4, 9, 12.4, 15, 12, 21.4, 12.4, 17, 15.6]); P.fill(g, P.lg(g, 0, 12, 0, 15.6, [bel, sh(bel, -0.4)]));
      // warts: a few big ones, lit on top
      [[6, 8.4, 0.9], [9, 6.8, 0.8], [5, 11.4, 0.7], [11.6, 8.6, 0.6], [8.2, 10.2, 0.6], [13.8, 6.4, 0.55]].forEach(([x, y, r]) => { P.circle(g, x, y, r, sh(wart, -0.2)); P.circle(g, x - r * 0.3, y - r * 0.3, r * 0.5, sh(wart, 0.3)); });
      // the poison gland swollen behind the eyes, weeping
      P.ell(g, 15.6, 6.8, 2.4, 1.3, P.lg(g, 14, 5.6, 17, 8, [sh(wart, 0.2), sh(wart, -0.4)]), -0.2); P.circle(g, 16.2, 7.4, 0.45, gland); P.glow(g, 16.4, 8.4, 1.8, gland, 0.4);
      P.line(g, 16.4, 7.8, 16.4, 9.6 + (f ? 0.8 : 0), 0.35, gland); P.circle(g, 16.4, 9.8 + (f ? 0.8 : 0), 0.4, gland);
      // the eyes: bulging on top of the head, slit pupils
      for (const [x, y, r] of [[19.4, 5, 1.8], [22, 5.4, 1.5]]) { P.circle(g, x, y, r, P.vol(g, x - 0.5, y - 0.6, r, s)); P.circle(g, x + 0.2, y - 0.1, r * 0.7, P.rg(g, x, y - 0.4, r, [[0, '#fff0a0'], [0.5, c.eye], [1, sh(c.eye, -0.4)]])); P.rect(g, x - 0.1, y - 0.7, r * 0.8, 0.45, '#140a02'); }
      P.glow(g, 20.6, 5, 3.6, c.eye, 0.55);
      // the wide mouth splitting the head
      if (!f) {
        P.ell(g, 20.4, 12.6, 3.8, 3, P.rg(g, 19.6, 11.8, 4, [[0, '#f0e0c0'], [0.6, sh(bel, 0.1)], [1, sh(bel, -0.5)]])); // the throat sac swelling
        g.strokeStyle = G.rgba('#8a4a3a', 0.6); g.lineWidth = 0.25; g.beginPath(); g.moveTo(18, 11.4); g.quadraticCurveTo(20, 13, 22.6, 12); g.moveTo(18.6, 13.6); g.quadraticCurveTo(20.6, 14.4, 23, 13.4); g.stroke();
        g.beginPath(); g.moveTo(15, 10); g.quadraticCurveTo(20, 11.2, 24.6, 9.2); g.strokeStyle = '#140a02'; g.lineWidth = 0.8; g.stroke();
      } else {
        P.path(g, [15.4, 10, 24.8, 8.4, 24.4, 11.8, 16, 11.4]); P.fill(g, '#2a0608');
        g.beginPath(); g.moveTo(19, 10.4); g.quadraticCurveTo(24, 11.6, 25.8, 10.4); g.strokeStyle = '#c83050'; g.lineWidth = 1; g.stroke(); // the tongue lashing out
        P.circle(g, 25.6, 10.4, 0.9, '#e04868');
      }
      // the near legs: a great folded hind leg, a splayed front one
      g.beginPath(); g.moveTo(3.4, 14.6); g.bezierCurveTo(3, 9.6, 9.6, 9, 11, 13.6); g.quadraticCurveTo(9, 16, 5, 16.2); g.closePath(); P.fill(g, P.lg(g, 3, 9, 11, 16, [sl, s, sd]));
      P.path(g, [4.6, 16.2, 10.8, 15.8, 11.6, 16.8, 4, 16.8]); P.fill(g, sd);
      P.limb(g, 16, 12, 17.4, 16.2, 1.4, 1, s); for (const d of [-0.6, 0.4, 1.4]) P.line(g, 17.4, 16.2, 17.4 + d * 1.2, 16.9, 0.35, s);
    } });

  /* ---------- Treant: a thing of roots and briar that walks: a hunched tangle of black roots on root-legs, and caught in the
   *            tangle a stag's skull for a face, burning in the sockets; long root-arms with thorned hooks ---------- */
  def('treant', { w: 28, h: 32, cy: 22, frames: 2,
    colors: { bark: '#4a3a24', moss: '#4a6a1a', eye: '#d0ff40', fungus: '#c8a060' },
    draw(g, f, c) {
      const r = sh(c.bark, -0.1), rl = sh(c.bark, 0.4), rd = sh(c.bark, -0.5), w = f ? 1 : -1, G0 = 30.4, bone = '#d8ccaa';
      P.ell(g, 14, G0 + 0.3, 9, 1.2, 'rgba(0,0,0,0.45)');
      const root = (pts, wd, col) => { let px = pts[0][0], py = pts[0][1], ww = wd; for (let i = 1; i < pts.length; i++) { const [qx, qy] = pts[i]; limb(g, px, py, qx, qy, ww, ww * 0.7, col); px = qx; py = qy; ww *= 0.7; } };
      // root-legs, stepping
      root([[10, 21], [7.6 - w, 25], [6.4 - w, G0]], 1.8, rd); root([[12, 21.6], [11.4 + w * 0.4, 26], [9.6 + w * 0.6, G0]], 1.6, r);
      root([[16, 21.4], [17.4 - w * 0.4, 26], [19 - w * 0.6, G0]], 1.7, r); root([[18, 20.4], [20.6 + w, 24.6], [22 + w, G0]], 1.5, rd);
      // the far arm: a long root reaching down with a thorned hook
      root([[9, 12], [5, 15.6], [3.4, 20.6], [4.4, 23]], 1.6, rd); P.path(g, [4.4, 23, 3.2, 24.6, 5, 23.4]); P.fill(g, bone);
      // the tangle: black roots twisted into a hunched body, briars poking out
      g.beginPath(); g.moveTo(9, 21.6); g.quadraticCurveTo(6.6, 15, 8.6, 10.4); g.quadraticCurveTo(12, 7, 17, 8.6); g.quadraticCurveTo(20.6, 12, 19.4, 21.6); g.closePath();
      P.fill(g, P.lg(g, 7, 8, 20, 22, [rl, r, rd]));
      g.strokeStyle = rd; g.lineWidth = 0.7; for (const [x0, y0, x1, y1, x2, y2] of [[9.4, 20, 11, 15, 14, 10], [12.6, 21, 16, 16, 15, 9.6], [17.6, 20.4, 15, 15, 18.6, 11]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1, y1, x2, y2); g.stroke(); }
      g.strokeStyle = rl; g.lineWidth = 0.35; for (const [x0, y0, x1, y1] of [[9, 14, 12, 12], [13, 18, 17, 14]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
      for (const [x, y, tx, ty] of [[8.2, 13, 6.4, 11.6], [19.6, 15, 21.4, 14], [11, 9.4, 10.2, 7.4]]) { P.path(g, [x - 0.4, y, tx, ty, x + 0.4, y + 0.4]); P.fill(g, bone); } // thorns
      g.strokeStyle = c.moss; g.lineWidth = 0.8; for (const x of [10.6, 17.6]) { g.beginPath(); g.moveTo(x, 10); g.quadraticCurveTo(x + w * 0.6, 13, x - 0.4, 16); g.stroke(); }
      // the stag's skull caught in the tangle, antlers spreading out of it, eyes burning in the sockets
      const hx = 14.4, hy = 9.4;
      const antler = (sx) => { g.save(); g.translate(hx + sx * 1.6, hy - 2.4); g.scale(sx, 1); g.lineCap = 'round'; g.strokeStyle = bone; g.lineWidth = 0.9;
        g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(2, -3, 4.4, -6); g.moveTo(1.8, -3); g.lineTo(3.8, -3.4); g.moveTo(3.2, -4.8); g.lineTo(2.6, -7.4); g.stroke(); g.restore(); };
      antler(-1); antler(1);
      P.path(g, [hx - 2.6, hy - 2.6, hx + 2.6, hy - 2.6, hx + 1.8, hy + 1.6, hx + 0.8, hy + 4.6, hx - 0.8, hy + 4.6, hx - 1.8, hy + 1.6]); P.fill(g, P.lg(g, hx - 2, hy - 3, hx + 2, hy + 5, [sh(bone, 0.2), bone, sh(bone, -0.45)]));
      P.ell(g, hx - 1.3, hy - 0.6, 0.9, 1.1, '#0a0a04', 0.3); P.ell(g, hx + 1.3, hy - 0.6, 0.9, 1.1, '#0a0a04', -0.3);
      evil(g, hx - 1.3, hy - 0.5, 0.55, c.eye, 0.3); evil(g, hx + 1.3, hy - 0.5, 0.55, c.eye, -0.3); P.glow(g, hx, hy - 0.5, 3, c.eye, 0.45);
      P.path(g, [hx - 0.6, hy + 2.6, hx + 0.6, hy + 2.6, hx, hy + 3.8]); P.fill(g, '#0a0a04'); // the nasal hole
      // the near arm: a long root raised, the thorned hook at its end
      root([[18, 11.4], [21.6, 10], [24, 6.4 + w * 0.4], [23.4, 3.6 + w * 0.4]], 1.7, r); P.path(g, [23.4, 3.6 + w * 0.4, 25.2, 2.4 + w * 0.4, 24, 4.6 + w * 0.4]); P.fill(g, bone);
    } });

  /* ---------- Blightfiend (boss): a bloated plague demon, one great eye above a gaping maw that retches bile, a single crooked
   *            horn, a belly that is a hive: holes in the swollen flesh with mosquitoes crawling out of them; stubby wings,
   *            thick arms with hooked claws ---------- */
  def('blightfiend', { w: 54, h: 50, cy: 32, frames: 2,
    colors: { hide: '#4a4a22', belly: '#8a8a3a', wing: '#b8c890', eye: '#ff3a2a', bile: '#b0d040' },
    draw(g, f, c) {
      const h = '#5a5a2a', hl = sh(h, 0.3), hd = sh(h, -0.4), b = sh(c.belly, -0.05), w = f ? 1 : -1, up = f ? -1.2 : 0;
      P.ell(g, 27, 48, 15, 2, 'rgba(0,0,0,0.45)');
      // stubby torn wings, too small for the body
      for (const sx of [-1, 1]) { g.save(); g.translate(27 + sx * 7, 14); g.scale(sx, 1);
        g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(6, -8 + up, 12, -7 + up); g.lineTo(10, -4 + up); g.lineTo(12.4, -2 + up); g.quadraticCurveTo(7, 1, 1, 3); g.closePath();
        P.fill(g, P.lg(g, 0, -8, 10, 2, [G.rgba(c.wing, 0.8), G.rgba(sh(c.wing, -0.4), 0.55)])); g.strokeStyle = sh(c.wing, -0.5); g.lineWidth = 0.4; g.beginPath(); g.moveTo(1, 1); g.quadraticCurveTo(6, -4, 11, -6.4 + up); g.stroke();
        g.restore(); }
      // legs: short and thick, the feet splayed
      for (const [x, o, col] of [[20.4, -w, hd], [33.6, w, h]]) { limb(g, x, 38, x + o * 0.4, 43, 3.4, 2.8, col); limb(g, x + o * 0.4, 43, x + o, 46.6, 2.8, 2.4, col); claws(g, x + o + 1.2, 47, 0.2, 3, 1.8, 0.5, '#d8d0a8'); }
      // the far arm: thick, hanging, hooked claws
      limb(g, 15.6, 20, 10, 28, 3.2, 2.6, hd); limb(g, 10, 28, 9.4, 35, 2.6, 2, hd); claws(g, 9.2, 35.6, 1.7, 4, 2.2, 0.5, '#d8d0a8');
      // the body: one bloated mass, the belly hanging, and in it the hive: holes in the flesh with things crawling out
      P.ell(g, 27, 28, 13.6, 12.4, P.lg(g, 14, 16, 40, 40, [hl, h, hd]));
      P.ell(g, 28, 32, 9.6, 7.6, P.rg(g, 26.4, 30, 10, [[0, sh(b, 0.4)], [0.6, b], [1, sh(b, -0.4)]]));
      [[24, 30, 1.4], [29, 28.6, 1.2], [32.6, 32, 1.3], [26.4, 34.6, 1.1], [30.6, 36, 0.9], [22.4, 34, 0.8]].forEach(([x, y, r]) => { P.ell(g, x, y, r, r * 0.8, '#1a1408'); g.beginPath(); g.ellipse(x, y, r, r * 0.8, 0, Math.PI * 1.1, Math.PI * 1.9); g.strokeStyle = sh(b, 0.5); g.lineWidth = 0.35; g.stroke(); });
      [[29, 28.4, -0.6], [32.8, 31.4, 0.4], [24, 29.6, -1.2]].forEach(([x, y, a], i) => { // mosquitoes crawling out
        const dx = Math.cos(a) * 1.6 * (i === 0 && f ? 1.3 : 1), dy = Math.sin(a) * 1.6; P.ell(g, x + dx, y + dy, 0.7, 0.45, '#5a1a1a', a); P.line(g, x + dx, y + dy, x + dx + Math.cos(a) * 1.2, y + dy + Math.sin(a) * 1.2, 0.2, '#1a1a0a');
        P.ell(g, x + dx - 0.4, y + dy - 0.6, 0.6, 0.3, G.rgba('#e8f0d0', 0.6), a - 0.6); });
      P.glow(g, 28, 32, 6, c.bile, 0.25);
      // the head: sunk into the shoulders, one great eye, a crooked horn, a gaping maw dripping bile
      const hx = 27.6, hy = 15;
      horn(g, hx - 2, hy - 4, hx - 5.4, hy - 9, hx - 2.4, hy - 13.4, 1.4, '#c8b890');
      P.ell(g, hx, hy, 6, 5, P.vol(g, hx - 1.6, hy - 1.6, 6, h));
      P.ell(g, hx + 0.4, hy - 1.4, 2.6, 2.2, '#140a06'); P.ell(g, hx + 0.4, hy - 1.4, 2, 1.7, P.rg(g, hx, hy - 2, 2.2, [[0, sh(c.eye, 0.5)], [0.6, c.eye], [1, sh(c.eye, -0.5)]]));
      P.ell(g, hx + 0.6, hy - 1.4, 0.45, 1.3, '#140a06'); P.glow(g, hx + 0.4, hy - 1.4, 4, c.eye, 0.4);
      P.path(g, [hx - 3.4, hy + 1.6, hx + 4.4, hy + 1.2, hx + 3.2, hy + 5.4 + (f ? 0.6 : 0), hx - 2.4, hy + 5.4 + (f ? 0.6 : 0)]); P.fill(g, '#1a0a06');
      teeth(g, hx - 3, hy + 1.6, hx + 4, hy + 1.3, 6, 1, 1, '#e0d8b8'); teeth(g, hx - 2, hy + 5.2 + (f ? 0.6 : 0), hx + 3, hy + 5.2 + (f ? 0.6 : 0), 4, 0.8, -1, '#c8c0a0');
      P.glow(g, hx + 0.6, hy + 4, 3.4, c.bile, 0.7); P.ell(g, hx + 0.6, hy + 6.4 + (f ? 1 : 0), 1, 1.6, c.bile); P.ell(g, hx + 2.4, hy + 7.4, 0.5, 0.9, sh(c.bile, -0.2)); // bile retching out
      // the near arm raised, hooked claws spread
      limb(g, 38.4, 20, 44.6, 24, 3.2, 2.6, h); limb(g, 44.6, 24, 46.4, 17.6 - w * 0.6, 2.6, 2, h); claws(g, 46.6, 17.2 - w * 0.6, -1.2, 4, 2.2, 0.5, '#d8d0a8');
    } });

  /* ---------- Bog Serpent (boss): a great eel of the mire, its long body rising and falling through the black water in humps,
   *            a long gar's snout lined with needle teeth, whiskered barbels trailing, a cold eye, acid dripping ---------- */
  def('bogserpent', { w: 56, h: 54, cy: 38, frames: 2,
    colors: { scale: '#3a5a2a', belly: '#b8b870', fin: '#8a3a2a', eye: '#ffe040', acid: '#b0ff40' },
    draw(g, f, c) {
      const s = sh(c.scale, 0.05), sl = sh(s, 0.5), sd = sh(s, -0.45), bel = c.belly, w = f ? 1 : -1;
      // the black water it moves through
      P.ell(g, 26, 46.4, 25, 4.6, G.rgba('#141c10', 0.8)); P.ell(g, 26, 46, 21, 3.2, G.rgba('#2a3a24', 0.5));
      /** A hump of the body breaking the water: a thick bent tube, lit on top, a fin-ridge on the crest. */
      const hump = (x, y, r, wd) => {
        g.lineCap = 'butt';
        g.beginPath(); g.arc(x, y, r, Math.PI, Math.PI * 2); g.strokeStyle = sd; g.lineWidth = wd; g.stroke();
        g.beginPath(); g.arc(x, y - wd * 0.12, r, Math.PI * 1.05, Math.PI * 1.95); g.strokeStyle = s; g.lineWidth = wd * 0.7; g.stroke();
        g.beginPath(); g.arc(x, y - wd * 0.32, r, Math.PI * 1.15, Math.PI * 1.6); g.strokeStyle = sl; g.lineWidth = wd * 0.2; g.stroke();
        g.lineCap = 'round';
        for (const ex of [x - r, x + r]) P.ell(g, ex, y + 0.4, wd * 0.8, 0.9, G.rgba('#c8d8a0', 0.4));
      };
      hump(6.4, 46.4, 4.6, 4.6); hump(17, 46, 5.6, 5.6); // the tail end, the middle
      // the neck rising out of the water in a thick S, the pale belly along its front
      g.beginPath(); g.moveTo(26, 46.4); g.bezierCurveTo(24, 34, 33 + w, 30, 30, 20); g.bezierCurveTo(28.6, 13, 32, 8, 36, 7.4); g.lineTo(39, 16); g.bezierCurveTo(37.6, 18, 37.6, 20, 38.6, 23); g.bezierCurveTo(42 + w, 32, 36, 38, 40, 46.4); g.closePath();
      P.fill(g, P.lg(g, 26, 8, 42, 46, [sl, s, sd]));
      g.strokeStyle = G.rgba(bel, 0.85); g.lineWidth = 2.4; g.beginPath(); g.moveTo(38.4, 45.6); g.bezierCurveTo(35, 38, 40.4 + w, 31, 37.2, 22.4); g.bezierCurveTo(36.4, 19.6, 36.8, 17.6, 38, 16); g.stroke();
      g.strokeStyle = G.rgba(sd, 0.6); g.lineWidth = 0.4; for (let i = 0; i < 6; i++) { const y = 21 + i * 4, x = 30.4 + Math.sin(i) * 0.8; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 2.4, y + 0.4, x + 4.6, y + 1.8); g.stroke(); } // scale bands
      g.beginPath(); g.moveTo(32, 9.6); g.bezierCurveTo(27.4 + w * 0.6, 13, 30 - w * 0.4, 20, 27.4, 27); g.bezierCurveTo(26.6, 32, 27.4, 36, 26.2, 40); g.lineTo(27.6, 40); g.bezierCurveTo(28.6, 35, 28.2, 31, 30, 26); g.bezierCurveTo(31.6, 20, 30, 14, 33.4, 11); g.closePath(); P.fill(g, P.lg(g, 27, 10, 33, 40, [sh(c.fin, 0.1), sh(c.fin, -0.45)])); // a long dorsal fin, one membrane
      P.ell(g, 33, 46.4, 7.6, 1.4, G.rgba('#c8d8a0', 0.4)); // the water round the neck
      // the head: a long gar's snout lined with needle teeth, jaws open, barbels trailing, a cold eye
      const hx = 37, hy = 10;
      P.ell(g, hx, hy, 5.4, 4.2, P.vol(g, hx - 1.6, hy - 1.6, 5.4, s));
      P.path(g, [hx + 2, hy - 3.4, hx + 17.6, hy - 1.2, hx + 18, hy + 0.6, hx + 3, hy + 0.8]); P.fill(g, P.lg(g, hx, hy - 3.4, hx, hy + 1, [sl, s])); // the upper jaw
      P.path(g, [hx + 2, hy + 2.4, hx + 16.4, hy + 4.6 + (f ? 1.2 : 0), hx + 16, hy + 6 + (f ? 1.2 : 0), hx + 1.6, hy + 4.4]); P.fill(g, sd); // the lower jaw
      P.path(g, [hx + 3, hy + 0.8, hx + 18, hy + 0.6, hx + 16.4, hy + 4.6 + (f ? 1.2 : 0), hx + 2, hy + 2.4]); P.fill(g, '#140a06');
      teeth(g, hx + 3.4, hy + 0.8, hx + 17.4, hy + 0.6, 9, 1.2, 1, '#efe8d0'); teeth(g, hx + 3.4, hy + 2.6, hx + 15.6, hy + 4.6 + (f ? 1.2 : 0), 8, 1, -1, '#d8d0b8');
      P.ell(g, hx + 0.8, hy - 1.2, 1.5, 1.2, '#140a06'); evil(g, hx + 0.9, hy - 1.2, 1, c.eye); P.glow(g, hx + 0.9, hy - 1.2, 3.4, c.eye, 0.5);
      g.strokeStyle = sh(c.fin, 0.1); g.lineWidth = 0.8; for (const [dy, l] of [[2.4, 7], [3.6, 5]]) { g.beginPath(); g.moveTo(hx + 2.4, hy + dy); g.quadraticCurveTo(hx - 0.6 + w * 0.6, hy + dy + l * 0.6, hx - 2, hy + dy + l); g.stroke(); } // barbels
      P.path(g, [hx - 3.4, hy - 2.6, hx - 8, hy - 5 + w * 0.4, hx - 6.4, hy - 1, hx - 4.4, hy + 1]); P.fill(g, G.rgba(c.fin, 0.9)); // a gill-fin
      P.line(g, hx + 10, hy + 3.8, hx + 10, hy + 6.6 + (f ? 1.6 : 0), 0.35, c.acid); P.ell(g, hx + 10, hy + 7.4 + (f ? 1.6 : 0), 0.8, 1.3, c.acid); P.glow(g, hx + 10, hy + 7.4, 2.6, c.acid, 0.5); // acid dripping
    } });

  /* ---------- Elder Treant (boss): a rotting weeping willow that walks: a great dome of hanging moss and trailing boughs like
   *            wet hair, through which two eyes burn; massive gnarled arms reaching out from under it, roots dragging ---------- */
  def('eldertreant', { w: 56, h: 64, cy: 44, frames: 2,
    colors: { bark: '#3e3020', moss: '#4a6a1a', eye: '#d0ff40', fungus: '#c89060' },
    draw(g, f, c) {
      const b = sh(c.bark, 0.1), bl = sh(c.bark, 0.5), bd = sh(c.bark, -0.4), m = sh(c.moss, -0.1), ml = sh(c.moss, 0.4), md = sh(c.moss, -0.5), w = f ? 1 : -1, G0 = 60.6;
      P.ell(g, 28, G0 + 0.6, 22, 2.6, 'rgba(0,0,0,0.45)');
      // roots dragging, spread wide
      [[18, -8, bd], [23, -3, b], [33, 3, bd], [38, 8, b]].forEach(([x, dx, col]) => { limb(g, x, 50, x + dx * 0.5, 56, 3, 2, col); limb(g, x + dx * 0.5, 56, x + dx, G0, 2, 0.8, col); });
      // the trunk under the dome, gnarled, a hollow in it
      g.beginPath(); g.moveTo(19, 52); g.quadraticCurveTo(22, 40, 20, 30); g.lineTo(36, 30); g.quadraticCurveTo(34, 40, 37, 52); g.closePath();
      P.fill(g, P.lg(g, 19, 30, 37, 52, [bl, b, bd]));
      g.strokeStyle = bd; g.lineWidth = 0.7; for (const x of [23, 27.6, 32]) { g.beginPath(); g.moveTo(x, 31); g.bezierCurveTo(x - 2, 38, x + 2, 44, x, 52); g.stroke(); }
      P.ell(g, 28, 44, 2.6, 3.6, '#0c0a04'); P.glow(g, 28, 44, 3, c.eye, 0.3);
      // the far arm reaching out from under the dome, gnarled, twig claws
      limb(g, 16, 30, 8, 38, 4, 3, b); limb(g, 8, 38, 6.4, 48 + w * 0.6, 3, 2, b); for (const a of [1, 1.5, 2, 2.5]) P.line(g, 6.4, 48 + w * 0.6, 6.4 + Math.cos(a) * 4.6, 48 + w * 0.6 + Math.sin(a) * 4.6, 1, b);
      // the dome of the crown: boughs arching up and falling, hung with curtains of moss like wet hair
      g.beginPath(); g.moveTo(8, 36); g.bezierCurveTo(4, 14, 16, 2, 28, 2); g.bezierCurveTo(40, 2, 52, 14, 48, 36); g.lineTo(44, 34); g.lineTo(42, 38 + w); g.lineTo(38, 34); g.lineTo(34, 37); g.lineTo(30, 33); g.lineTo(26, 36 - w); g.lineTo(22, 33); g.lineTo(18, 37); g.lineTo(14, 34); g.lineTo(11, 38 + w); g.closePath();
      P.fill(g, P.lg(g, 10, 2, 46, 38, [ml, m, md]));
      g.strokeStyle = md; g.lineWidth = 0.9; for (let i = 0; i < 9; i++) { const x = 11 + i * 4; g.beginPath(); g.moveTo(x + 1, 6 + Math.abs(i - 4) * 2); g.quadraticCurveTo(x - 1 + (i % 2 ? w : -w) * 0.6, 20, x, 33 + (i % 3)); g.stroke(); } // hanging strands
      g.strokeStyle = G.rgba(ml, 0.7); g.lineWidth = 0.5; for (let i = 0; i < 5; i++) { const x = 13 + i * 7; g.beginPath(); g.moveTo(x, 6 + Math.abs(i - 2) * 2.4); g.quadraticCurveTo(x + 1, 18, x - 0.6, 28); g.stroke(); }
      for (const [x0, y0, x1, y1] of [[28, 3, 16, 6], [28, 3, 40, 5.6], [22, 4, 12, 12]]) P.line(g, x0, y0, x1, y1, 1.2, G.rgba(b, 0.8)); // boughs under the moss
      // the eyes burning through the curtain, the shadow of a face
      P.ell(g, 28, 20, 9, 6, G.rgba('#0c0a04', 0.55));
      evil(g, 24.4, 19.4, 1.3, c.eye, 0.25); evil(g, 32, 19, 1.2, c.eye, -0.25); P.glow(g, 28, 19.6, 8, c.eye, 0.4);
      P.path(g, [24.6, 23.4, 31.6, 23, 30, 26 + (f ? 0.6 : 0), 26, 26.4]); P.fill(g, G.rgba('#0c0a04', 0.8));
      g.strokeStyle = m; g.lineWidth = 1; for (const x of [25, 27.6, 30.4]) { g.beginPath(); g.moveTo(x, 17); g.quadraticCurveTo(x + w * 0.4, 22, x - 0.2, 27); g.stroke(); } // strands falling across the face
      // the near arm, massive, reaching forward and down, twig claws spread
      limb(g, 40, 30, 47, 38, 4.4, 3.4, b); limb(g, 47, 38, 48.6, 48 + w * 0.6, 3.4, 2.2, b); P.circle(g, 47, 38, 3.2, P.vol(g, 46.2, 37, 3.2, b));
      for (const a of [0.9, 1.4, 1.9, 2.4]) P.line(g, 48.6, 48 + w * 0.6, 48.6 + Math.cos(a) * 5, 48 + w * 0.6 + Math.sin(a) * 5, 1, b);
      [[13.6, 59.6, 1.8], [16, 60, 1.2], [41, 59.4, 2]].forEach(([x, y, r]) => { P.line(g, x, y + 0.4, x, y - r, r * 0.4, '#c8b898'); g.beginPath(); g.ellipse(x, y - r, r, r * 0.7, 0, Math.PI, 0); P.fill(g, P.lg(g, 0, y - r * 1.7, 0, y - r, [sh(c.fungus, 0.3), sh(c.fungus, -0.4)])); }); // toadstools at the roots
    } });

  /* ---------- Lord of Rot (boss): a tall gaunt king of the mire in rotting robes of state, antlers grown up through his crown,
   *            a skull for a face with moss in the sockets and cold light behind them, a censer on a crook pouring plague gas,
   *            flies about him ---------- */
  def('rotlord', { w: 60, h: 64, cy: 42, grow: [2, 0, 0, 0], frames: 2,
    colors: { flesh: '#7a8a4a', mantle: '#3a3018', gold: '#8a7a3a', gas: '#b0d040', eye: '#e0ff50' },
    draw(g, f, c) {
      const r = '#3a3a1e', rl = sh(r, 0.5), rd = sh(r, -0.5), gold = c.gold, bone = '#d4c8a4', bd = sh(bone, -0.4), w = f ? 0.8 : -0.8, gas = c.gas;
      P.ell(g, 28, 61, 14, 2.2, 'rgba(0,0,0,0.45)');
      P.glow(g, 30, 30, 24, gas, 0.1);
      // the robe: tall and narrow at the shoulders, falling in heavy rotten folds to a torn hem trailing on the ground
      g.beginPath(); g.moveTo(21, 18); g.lineTo(35, 18); g.quadraticCurveTo(38, 36, 42 + w, 59); g.lineTo(14 - w, 59); g.quadraticCurveTo(18, 36, 21, 18); g.closePath();
      P.fill(g, P.lg(g, 14, 18, 42, 59, [rl, r, rd]));
      P.rag(g, 14 - w, 58.6, 42 + w, 58.6, 7, 2.4, rd);
      g.strokeStyle = rd; g.lineWidth = 0.8; for (const [x0, x1] of [[24, 19], [28, 28], [32, 37]]) { g.beginPath(); g.moveTo(x0, 22); g.quadraticCurveTo((x0 + x1) / 2 + 1, 40, x1 + w * 0.6, 58); g.stroke(); }
      P.path(g, [26.4, 20, 29.6, 20, 30.6, 58, 25.6, 58]); P.fill(g, P.lg(g, 26, 20, 26, 58, [sh(gold, -0.1), sh(gold, -0.6)])); // a tarnished panel of state down the front
      g.save(); g.globalAlpha = 0.5; for (const [x, y, a, b2] of [[20, 44, 2.4, 1.4], [35, 50, 2, 1.2], [23, 30, 1.4, 1]]) P.ell(g, x, y, a, b2, '#4a5a1a'); g.restore(); // rot eating the cloth
      // a mantle of moss over the shoulders, a chain of state
      g.beginPath(); g.moveTo(18.6, 20); g.quadraticCurveTo(28, 14.6, 37.4, 20); g.lineTo(36, 26); g.quadraticCurveTo(28, 23, 20, 26); g.closePath(); P.fill(g, P.lg(g, 18, 15, 38, 26, [sh(c.flesh, 0.1), sh(c.flesh, -0.5)]));
      for (let i = 0; i < 6; i++) P.circle(g, 22.4 + i * 2.2, 24.2 + Math.sin(i / 5 * Math.PI) * 1.6, 0.55, gold);
      // the far arm: a long bony hand out of the sleeve
      P.path(g, [20, 22, 13.6, 30, 12.4, 34, 15.4, 33.6, 21.4, 27]); P.fill(g, P.lg(g, 13, 22, 21, 34, [r, sh(r, -0.3)]));
      P.line(g, 13.4, 33.4, 11.6, 36.4, 0.6, bone); P.line(g, 14.2, 33.8, 13.4, 37, 0.55, bone); P.line(g, 12.8, 33, 10.6, 35, 0.5, bone);
      // the head: a skull with moss in the sockets and cold light behind, antlers grown up through a crown of rotted gold
      const hx = 28, hy = 12.2;
      const antler = (sx) => { g.save(); g.translate(hx + sx * 2.6, hy - 3.6); g.scale(sx, 1); g.lineCap = 'round'; g.strokeStyle = bone; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(3.4, -4, 8, -8); g.moveTo(3.2, -4.2); g.lineTo(2.2, -8.8); g.moveTo(5.8, -6.4); g.lineTo(9.8, -5.6); g.moveTo(8, -8); g.lineTo(9.4, -11); g.stroke();
        g.strokeStyle = bd; g.lineWidth = 0.4; g.beginPath(); g.moveTo(0.4, 0.3); g.quadraticCurveTo(3.8, -3.6, 8.4, -7.6); g.stroke(); g.restore(); };
      antler(-1); antler(1);
      P.ell(g, hx, hy, 3.6, 3.8, P.vol(g, hx - 1, hy - 1.2, 3.8, bone));
      P.path(g, [hx - 1.4, hy + 2.2, hx + 2.2, hy + 2, hx + 1.8, hy + 4.4 + (f ? 0.4 : 0), hx - 1.2, hy + 4.4 + (f ? 0.4 : 0)]); P.fill(g, bd); P.rect(g, hx - 1.2, hy + 2.4, 3.2, 0.7, '#0c0a04');
      teeth(g, hx - 1.2, hy + 2.4, hx + 2, hy + 2.4, 4, 0.5, 1, bone);
      P.ell(g, hx - 1.2, hy - 0.2, 1.2, 1.3, '#0c0a04'); P.ell(g, hx + 1.4, hy - 0.2, 1.1, 1.2, '#0c0a04');
      P.ell(g, hx - 1.4, hy + 0.5, 0.8, 0.45, c.flesh); P.ell(g, hx + 1.2, hy + 0.5, 0.7, 0.4, c.flesh); // moss grown in the sockets
      evil(g, hx - 1.2, hy - 0.4, 0.55, c.eye); evil(g, hx + 1.4, hy - 0.4, 0.5, c.eye); P.glow(g, hx, hy - 0.4, 3.4, c.eye, 0.45);
      P.path(g, [hx - 4, hy - 2.6, hx - 3.2, hy - 5.6, hx - 1.8, hy - 3.8, hx, hy - 6, hx + 1.8, hy - 3.8, hx + 3.2, hy - 5.6, hx + 4, hy - 2.6]); P.fill(g, P.lg(g, 0, hy - 6, 0, hy - 2.6, [sh(gold, 0.4), sh(gold, -0.4)])); // the rotted crown
      // the near arm raising a crook, a censer swinging from it pouring plague gas
      P.path(g, [35.4, 21, 41, 26, 42.4, 22.6, 37, 18.6]); P.fill(g, r); P.line(g, 41.6, 22.6, 42.4, 21, 0.6, bone); P.circle(g, 42.2, 23.4, 1, bone);
      P.line(g, 42.6, 60, 43.4, 5, 1, '#3a2a18');
      g.beginPath(); g.moveTo(43.4, 5.4); g.quadraticCurveTo(44, 1, 47.4, 1.4); g.quadraticCurveTo(50.4, 2.2, 49.6, 5.6); g.strokeStyle = '#3a2a18'; g.lineWidth = 1; g.stroke(); // the crook
      const cx2 = 49.6 + (f ? 0.8 : 0), cy2 = 12.6;
      P.line(g, 49.6, 5.6, cx2, cy2 - 1.8, 0.35, '#5a5040');
      P.glow(g, cx2, cy2, 5, gas, 0.6);
      P.path(g, [cx2 - 1.8, cy2 - 1.4, cx2 + 1.8, cy2 - 1.4, cx2 + 1.4, cy2 + 1.4, cx2, cy2 + 2, cx2 - 1.4, cy2 + 1.4]); P.fill(g, P.lg(g, cx2 - 2, 0, cx2 + 2, 0, [sh(gold, 0.3), gold, sh(gold, -0.5)]));
      P.rect(g, cx2 - 1, cy2 - 0.2, 0.6, 0.6, gas); P.rect(g, cx2 + 0.4, cy2 - 0.2, 0.6, 0.6, gas);
      g.save(); g.globalAlpha = 0.55; for (const [dx, dy, rr] of [[-1.4, -3.4, 1.6], [0.6, -5.6, 1.3], [-0.4, -8, 1]]) P.ell(g, cx2 + dx - (f ? 0.6 : 0), cy2 + dy, rr * 1.3, rr, gas); g.restore(); // plague gas rising
      g.save(); g.globalAlpha = 0.6; for (const [x, y] of [[18, 10], [38, 14], [16, 20], [36, 6]]) P.circle(g, x + (f ? 0.6 : -0.6), y, 0.5, '#1a1a0a'); g.restore(); // flies
    } });

  /* ---------- Blight Worm (secret boss): a great segmented worm bursting out of the mire: its body rears up in a curve out of
   *            a hole of churned mud, a loop of it arching out of the ground behind; the head a round maw opened in three
   *            fleshy petals ringed with hooked teeth, a crown of small glowing eyes, chitin plates down its back, bile dripping ---------- */
  def('blightworm', { w: 48, h: 50, cy: 38, frames: 2,
    colors: { skin: '#8a6a5a', plate: '#4a3a2a', maw: '#3a0a10', eye: '#e0ff50' },
    draw(g, f, c) {
      const sk = c.skin, sl = sh(sk, 0.4), sd = sh(sk, -0.45), pl = c.plate, pll = sh(pl, 0.45), mud = '#2a2a14', w = f ? 1 : -1;
      P.ell(g, 24, 46.6, 22, 2.6, 'rgba(0,0,0,0.5)');
      // the mud churned up round the hole
      P.ell(g, 15, 46, 11, 3, P.lg(g, 4, 43, 26, 49, [sh(mud, 0.4), mud, '#0e0e06']));
      // the body rearing up in a curve: segments, a pale belly along the front, chitin plates down the back
      const spine = (t) => [13 + Math.sin(t * 2.4) * 3.6 + t * 12, 45 - t * 31], rad = (t) => 6.6 - t * 1.4, N = 24;
      const L = [], Rr = [];
      for (let i = 0; i <= N; i++) { const s = i / N, [x, y] = spine(s), [x2, y2] = spine(Math.min(1, s + 0.01)), a = Math.atan2(y2 - y, x2 - x) + Math.PI / 2, r = rad(s); L.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); Rr.push([x - Math.cos(a) * r, y - Math.sin(a) * r]); }
      g.beginPath(); g.moveTo(L[0][0], L[0][1]); for (const [x, y] of L) g.lineTo(x, y); for (const [x, y] of Rr.slice().reverse()) g.lineTo(x, y); g.closePath();
      P.fill(g, P.lg(g, 6, 20, 30, 30, [sl, sk, sd]));
      g.strokeStyle = G.rgba('#d8c0a8', 0.4); g.lineWidth = 1.6; g.beginPath(); for (let i = 0; i <= N; i++) { const [x, y] = Rr[i], [cx, cy] = spine(i / N); g.lineTo(x * 0.7 + cx * 0.3, y * 0.7 + cy * 0.3); } g.stroke(); // the pale belly
      g.strokeStyle = G.rgba(sd, 0.85); g.lineWidth = 0.45; for (let i = 1; i < N; i += 2) { g.beginPath(); g.moveTo(L[i][0], L[i][1]); g.quadraticCurveTo(spine(i / N)[0], spine(i / N)[1] + 1.2, Rr[i][0], Rr[i][1]); g.stroke(); } // the rings
      for (let i = 2; i < N - 1; i += 3) { const [x, y] = L[i], [cx, cy] = spine(i / N); P.ell(g, x * 0.8 + cx * 0.2, y * 0.8 + cy * 0.2, 2.2, 1.3, P.lg(g, x - 2, y - 1.3, x + 2, y + 1.3, [pll, pl, sh(pl, -0.4)]), Math.atan2(cy - y, cx - x) + Math.PI / 2); } // chitin scutes down the back
      [[16.6, 36, 1.4], [21, 24, 1.1], [19.2, 30.6, 0.9]].forEach(([x, y, r]) => { P.circle(g, x, y, r, P.rg(g, x - r * 0.3, y - r * 0.3, r, [[0, '#f4ffc0'], [0.5, c.eye], [1, sh(c.eye, -0.5)]])); }); // boils of glowing pus
      // the head at the tip: a round maw opened in four fleshy petals, hooked teeth ringing the throat, a collar of eyes below it
      const [hx, hy] = spine(1), mx = hx + 1, my = hy - 2.4;
      P.ell(g, hx, hy, 5.8, 3, P.lg(g, hx - 5, hy, hx + 5, hy, [sl, sk, sd]));
      [[-4, 0.6], [-2, -1.4], [0.4, -1.8], [2.6, -0.8], [4.2, 0.8]].forEach(([dx, dy]) => { P.circle(g, hx + dx, hy + dy + 1.4, 0.75, '#0a0204'); evil(g, hx + dx, hy + dy + 1.4, 0.48, c.eye); });
      P.glow(g, hx, hy, 5, c.eye, 0.35);
      for (const [a, len] of [[-2.7, 8], [-1.95, 8.6], [-1.2, 8.6], [-0.4, 8]]) { const o = a + (f ? (a < -1.6 ? -0.12 : 0.12) : 0);
        g.save(); g.translate(mx, my); g.rotate(o);
        g.beginPath(); g.moveTo(0, -2.6); g.quadraticCurveTo(len * 0.7, -3.8, len, 0); g.quadraticCurveTo(len * 0.7, 3.8, 0, 2.6); g.closePath();
        P.fill(g, P.lg(g, 0, -4, len, 4, [sl, sk, sd]));
        g.beginPath(); g.moveTo(1, -1.7); g.quadraticCurveTo(len * 0.6, -2.2, len - 1, 0); g.quadraticCurveTo(len * 0.6, 2.2, 1, 1.7); g.closePath(); P.fill(g, sh(c.maw, 0.35));
        for (const k of [0.4, 0.7]) { P.path(g, [len * k, -1.4, len * k + 0.7, -0.6, len * k - 0.4, 0.2]); P.fill(g, '#efe6cc'); }
        g.restore(); }
      P.ell(g, mx, my, 4.2, 2.8, c.maw); P.ell(g, mx, my, 2.8, 1.8, '#0a0204');
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; P.path(g, [mx + Math.cos(a) * 4.1, my + Math.sin(a) * 2.7, mx + Math.cos(a + 0.25) * 4.1, my + Math.sin(a + 0.25) * 2.7, mx + Math.cos(a + 0.1) * 2.4, my + Math.sin(a + 0.1) * 1.5]); P.fill(g, '#efe6cc'); }
      P.glow(g, mx, my, 3, c.eye, 0.3);
      // bile dripping from the lower petal
      P.line(g, hx + 5.4, hy + 1, hx + 5.4, hy + 4 + (f ? 1.4 : 0), 0.5, c.eye); P.circle(g, hx + 5.4, hy + 4.4 + (f ? 1.4 : 0), 0.7, c.eye);
    } });

  /* ================= Hall 7: the Reliquary ================= */
  /** A gold coin seen edge-on-ish at (x,y), radius r. */
  function coin(g, x, y, r, tilt) { P.ell(g, x, y, r * (tilt || 1), r, P.rg(g, x - r * 0.3, y - r * 0.3, r * 1.2, [[0, '#fff4b0'], [0.5, '#e8b830'], [1, '#8a5a10']])); P.ell(g, x, y, r * 0.6 * (tilt || 1), r * 0.6, G.rgba('#8a5a10', 0.5)); }

  /* ---------- Gold Scarab: a horned gilded beetle scuttling off with a stolen coin in its mandibles: a high domed shell with a
   *            hard shine, the dark wings buzzing out from under it, six jointed legs, a jewel set in its thorax ---------- */
  def('scarab', { w: 24, h: 18, cy: 9, frames: 2,
    colors: { shell: '#d0a030', dark: '#3a2a0a', gem: '#40e0c0' },
    draw(g, f, c) {
      const sc = sh(c.shell, -0.1), lit = sh(c.shell, 0.5), dk = sh(c.shell, -0.6), dd = c.dark, near = sh(dd, 0.35), far = sh(dd, -0.2), w = f ? 1 : -1;
      P.ell(g, 11.5, 16.6, 9, 1, 'rgba(0,0,0,0.45)');
      const leg = (x, y, kx, ky, fx, fy, col) => { limb(g, x, y, kx, ky, 0.75, 0.55, col); limb(g, kx, ky, fx, fy, 0.55, 0.35, col); P.line(g, fx, fy, fx + 0.9, fy + 0.2, 0.3, col); };
      leg(8.4, 11.4, 6.4, 13, 5.4 - w, 16, far); leg(12, 11.6, 12.8, 13.8, 13.6 + w, 16, far); leg(15.6, 11.4, 18.6, 12.4, 20.4 - w, 16, far);
      // the shell: a high dome, the hard shine on its crown, striations following it
      P.ell(g, 9.8, 11.8, 7.4, 1.4, dd);
      g.beginPath(); g.moveTo(2.6, 11.6); g.bezierCurveTo(2, 4, 8, 2.2, 11, 2.4); g.bezierCurveTo(15, 2.6, 17, 6, 16.8, 11.6); g.closePath();
      P.fill(g, P.lg(g, 4, 3, 15, 12, [lit, sc, dk]));
      g.strokeStyle = G.rgba(dk, 0.7); g.lineWidth = 0.3; for (const k of [0.3, 0.6]) { g.beginPath(); g.moveTo(3 + k * 3, 11.4); g.bezierCurveTo(3 + k * 3, 5 + k * 3, 8, 3 + k * 3.4, 11, 3.1 + k * 3.4); g.bezierCurveTo(14, 3.3 + k * 3.4, 16 - k * 2, 7, 16.2 - k * 2, 11.4); g.stroke(); }
      P.ell(g, 7.6, 5, 3, 1, G.rgba('#fffbe0', 0.6), -0.35);
      g.beginPath(); g.moveTo(15.4, 4.4); g.bezierCurveTo(11, 0.6 - w * 0.5, 5, 0.6 - w * 0.7, 2.4, 2.6 - w * 0.7); g.lineTo(4, 4.6); g.bezierCurveTo(7, 3, 11, 3, 15.4, 5.4); g.closePath(); P.fill(g, P.lg(g, 4, 1.6, 15, 5.4, [lit, sc])); // one wing case lifted
      // the thorax with its jewel, the head, a horn curving up, eyes burning, the mandibles clamped on a coin
      P.ell(g, 16.6, 8.6, 2.6, 3.2, P.lg(g, 14, 5.4, 19, 12, [sc, dk]));
      P.circle(g, 16.6, 7.8, 0.6, sh(c.gem, -0.3)); P.circle(g, 16.4, 7.6, 0.25, '#e8fffa');
      P.ell(g, 19.4, 9.8, 1.9, 1.7, P.vol(g, 19, 9.2, 1.9, sh(dd, 0.3)));
      horn(g, 19, 8.6, 21.4, 5.4, 19.4, 2.4, 0.9, sh(dd, 0.5));
            evil(g, 20.4, 9.4, 0.5, c.gem); P.glow(g, 20.4, 9.4, 1.4, c.gem, 0.45);
      P.coin(g, 22, 11.4, 1.8, 0.55);
      horn(g, 20.4, 10.4, 21.6, 9.8, 22.6, 10.4, 0.35, dd); horn(g, 20.4, 11.4, 21.6, 12.8, 22.6, 12.4, 0.35, dd);
      // the near legs: back, middle, front, each jointed, alternate tripods swinging
      leg(7, 12, 4.4, 13.6, 2.6 + w, 16.4, near); leg(11, 12.4, 10.2, 14.6, 9.4 - w, 16.6, near); leg(15, 12, 17.4, 13.4, 18.4 + w, 16.4, near);
    } });

  /* ---------- Mimic: an iron-bound chest; frame 0 shut and still (only the tips of fangs in the seam give it away), frame 1 the
   *            lid flung up as a jaw, eyes glaring out of the dark inside, a tongue lolling over the rim, crooked legs under it ---------- */
  def('mimic', { w: 24, h: 22, cy: 16, frames: 2,
    colors: { wood: '#6a3a1a', band: '#c89a3a', tongue: '#c83050', eye: '#ffe060' },
    draw(g, f, c) {
      const wd = sh(c.wood, -0.1), wl = sh(c.wood, 0.35), wk = sh(c.wood, -0.55), band = c.band, bd = sh(band, -0.45), fang = '#efe6cc';
      P.ell(g, 12, 21, 10, 1.1, 'rgba(0,0,0,0.45)');
      const box = (y0, y1) => {
        P.rect(g, 3.6, y0, 17, y1 - y0, P.lg(g, 3.6, y0, 20.6, y1, [wl, wd, wk]));
        g.strokeStyle = G.rgba(wk, 0.8); g.lineWidth = 0.3; for (let y = y0 + 2.6; y < y1 - 0.5; y += 2.6) { g.beginPath(); g.moveTo(3.8, y); g.lineTo(20.4, y); g.stroke(); }
        for (const x of [7, 16.2]) { P.rect(g, x, y0, 1.3, y1 - y0, P.lg(g, x, 0, x + 1.3, 0, [sh(band, 0.3), bd])); P.circle(g, x + 0.65, y0 + 1.2, 0.3, sh(band, 0.5)); P.circle(g, x + 0.65, y1 - 1.2, 0.3, sh(band, 0.5)); }
        for (const x of [3.6, 19.4]) { P.rect(g, x, y1 - 1.6, 1.2, 1.6, band); P.rect(g, x, y0, 1.2, 1.4, band); }
      };
      if (!f) {
        box(11, 20.6);
        g.beginPath(); g.moveTo(3.4, 11); g.bezierCurveTo(3.4, 6.4, 7, 5.4, 12, 5.4); g.bezierCurveTo(17, 5.4, 20.8, 6.4, 20.8, 11); g.closePath();
        P.fill(g, P.lg(g, 4, 5, 18, 11, [wl, wd, wk]));
        for (const x of [7, 16.2]) { g.beginPath(); g.moveTo(x, 11); g.lineTo(x, 6); g.lineTo(x + 1.3, 5.8); g.lineTo(x + 1.3, 11); g.closePath(); P.fill(g, P.lg(g, x, 0, x + 1.3, 0, [sh(band, 0.3), bd])); }
        P.line(g, 3.4, 11, 20.8, 11, 0.5, '#140806');
        teeth(g, 9, 11.2, 11, 11.2, 2, 0.6, -1, fang); teeth(g, 14, 11.2, 15.6, 11.2, 2, 0.6, -1, fang); // fang tips in the seam
        P.rrect(g, 10.8, 9.6, 2.4, 3.4, 0.4, P.lg(g, 10.8, 9.6, 13.2, 13, [sh(band, 0.4), bd])); P.rect(g, 11.8, 10.6, 0.5, 1.4, '#140806');
        P.glow(g, 12, 11.2, 1.2, c.eye, 0.35);
        return;
      }
      // awake: crooked legs under the box, the lid flung up as a jaw
      for (const [x, d, col] of [[6.4, -1, wk], [10.4, 1, sh(wk, -0.2)], [14.6, -1, sh(wk, -0.2)], [18.4, 1, wk]]) { limb(g, x, 17.6, x + d * 1.6, 19.4, 0.9, 0.7, col); limb(g, x + d * 1.6, 19.4, x + d * 0.8, 21, 0.7, 0.4, col); claws(g, x + d * 0.8, 21, d > 0 ? 0.2 : 2.9, 2, 1, 0.3, fang); }
      box(10.6, 18);
      // the dark inside, eyes glaring out of it
      P.path(g, [4, 10.8, 19.2, 4.6, 20.8, 10.8]); P.fill(g, P.lg(g, 10, 5, 12, 11, ['#3a0a0e', '#0e0406']));
      evil(g, 13.2, 8.6, 0.8, c.eye, 0.2); evil(g, 16, 7.6, 0.7, c.eye, -0.2); P.glow(g, 14.6, 8, 3, c.eye, 0.45);
      // the lid: its inner edge a jaw of fangs, its outer face the planks and bands
      P.path(g, [4, 10.8, 19.2, 4.6, 17.9, 1.4, 2.7, 7.6]); P.fill(g, P.lg(g, 3, 2, 18, 10, [wl, wd, wk]));
      for (const k of [0.22, 0.72]) { const x = 4 + 15.2 * k, y = 10.8 - 6.2 * k; P.path(g, [x, y, x + 1.1, y - 0.46, x - 0.2, y - 3.6, x - 1.3, y - 3.1]); P.fill(g, P.lg(g, x - 1, 0, x + 1, 0, [sh(band, 0.3), bd])); }
      P.line(g, 2.7, 7.6, 17.9, 1.4, 0.5, band);
      [[5.6, 1.2], [8, 1.8], [10.6, 1.3], [13, 2], [15.6, 1.4], [18, 1.1]].forEach(([x, l]) => { const y = 10.8 - (x - 4) * 0.41; P.path(g, [x - 0.5, y + 0.2, x + 0.5, y - 0.2, x + 0.3, y + l]); P.fill(g, fang); });
      [[5.4, 1.4], [8.4, 1.9], [11.6, 1.2], [14.6, 2], [17.8, 1.5], [20, 1.1]].forEach(([x, l]) => { P.path(g, [x - 0.55, 10.8, x + 0.55, 10.8, x, 10.8 - l]); P.fill(g, fang); });
      // the tongue lolling out over the rim
      g.beginPath(); g.moveTo(12, 10.6); g.bezierCurveTo(17, 9.6, 22.6, 10.6, 22.8, 13.6); g.bezierCurveTo(23, 16, 21.6, 17, 21, 16); g.bezierCurveTo(21.4, 13.6, 18, 12, 12, 12); g.closePath();
      P.fill(g, P.lg(g, 12, 10, 23, 17, [sh(c.tongue, 0.25), c.tongue, sh(c.tongue, -0.4)]));
      P.line(g, 21.6, 16.4, 21.6, 18, 0.3, G.rgba('#ffd0d0', 0.6));
    } });

  /* ---------- Gilded Knight: a hollow knight in blackened plate edged with gold, a crowned great helm with a cross slit burning,
   *            a tall kite shield blazoned with a sun, a flanged mace shouldered, a blood-red tabard ---------- */
  def('gildedknight', { w: 24, h: 30, cy: 20, frames: 2,
    colors: { plate: '#c8a040', dark: '#5a3a14', cloth: '#6a1a24', eye: '#ffe0a0' },
    draw(g, f, c) {
      const st = '#34302e', sl = sh(st, 0.5), sd = sh(st, -0.45), gold = c.plate, gd = sh(gold, -0.45), cl = c.cloth, w = f ? 0.9 : -0.9;
      P.ell(g, 12.4, 29, 8, 1.1, 'rgba(0,0,0,0.45)');
      // legs in greaves, gold at the knee
      for (const [x, d, col] of [[10.4, -w, sd], [14, w, st]]) { limb(g, x, 19.6, x + d * 0.5, 24, 1.8, 1.5, col); limb(g, x + d * 0.5, 24, x + d, 28, 1.5, 1.3, col); P.circle(g, x + d * 0.5, 24, 1.1, P.vol(g, x + d * 0.5 - 0.3, 23.6, 1.1, gold)); P.path(g, [x + d - 1.4, 27.4, x + d + 2.2, 27.6, x + d + 2.2, 29, x + d - 1.4, 29]); P.fill(g, sd); }
      // the torso: a plated cuirass, the tabard hanging from the belt
      P.path(g, [8, 11, 16.4, 11, 16, 18, 14.6, 20.4, 9.6, 20.4, 8.4, 18]); P.fill(g, P.lg(g, 8, 11, 16, 20, [sl, st, sd]));
      P.line(g, 12.2, 11.6, 12.2, 18, 0.35, gold); P.line(g, 8.4, 18, 16, 18, 0.7, gold);
      P.path(g, [10, 18.4, 14.6, 18.4, 15.2, 24.6, 12.4, 23.6, 9.6, 24.6]); P.fill(g, P.lg(g, 10, 18, 15, 25, [sh(cl, 0.3), cl, sh(cl, -0.4)]));
      // the mace arm behind, the flanged mace over the shoulder
      limb(g, 15.4, 12, 18, 15.6, 1.5, 1.2, st); limb(g, 18, 15.6, 18.6, 12.6, 1.2, 1, sl);
      P.line(g, 16.6, 17.6, 21, 5.6, 0.7, '#3a2a1a');
      g.save(); g.translate(21.3, 4.6); g.rotate(0.35);
      P.rrect(g, -1.1, -2.6, 2.2, 4.2, 0.6, P.lg(g, -1.1, 0, 1.1, 0, [sh(gold, 0.4), gold, gd]));
      for (const x of [-1.8, 1.8]) { P.path(g, [0, -2.2, x, -1.4, x, 0.8, 0, 1.4]); P.fill(g, P.lg(g, -2, 0, 2, 0, [sh(gold, 0.2), gd])); }
      g.restore();
      P.circle(g, 18.6, 12.8, 0.9, st);
      // pauldrons edged with gold
      for (const [x, col] of [[8.4, sd], [15.8, st]]) { P.ell(g, x, 11.8, 2.6, 2, P.vol(g, x - 0.6, 11.2, 2.6, col)); g.beginPath(); g.ellipse(x, 11.8, 2.6, 2, 0, 0, Math.PI); g.strokeStyle = gold; g.lineWidth = 0.4; g.stroke(); }
      // the great helm: flat-topped, a crown about its brow, a cross slit burning
      const hx = 12.6, hy = 7;
      P.rrect(g, hx - 2.8, hy - 3.8, 5.6, 6.6, 1, P.lg(g, hx - 2.8, hy - 3.8, hx + 2.8, hy + 2.8, [sl, st, sd]));
      P.path(g, [hx - 3, hy - 3.2, hx - 3, hy - 5.2, hx - 1.6, hy - 4.2, hx, hy - 5.8, hx + 1.6, hy - 4.2, hx + 3, hy - 5.2, hx + 3, hy - 3.2]); P.fill(g, P.lg(g, 0, hy - 5.8, 0, hy - 3, [sh(gold, 0.5), gold, gd]));
      P.rect(g, hx - 1.2, hy - 1.2, 4, 0.8, '#0a0604'); P.rect(g, hx + 0.8, hy - 2, 0.7, 3.4, '#0a0604');
      P.rect(g, hx - 1, hy - 1.05, 3.6, 0.5, c.eye); P.glow(g, hx + 1, hy - 0.9, 2.4, c.eye, 0.55);
      P.line(g, hx - 2.8, hy + 2.8, hx + 2.8, hy + 2.8, 0.5, gold);
      // the kite shield on the near arm, dark enamel, a gold rim, a sun blazoned on it
      g.beginPath(); g.moveTo(3, 11); g.lineTo(9.4, 11); g.quadraticCurveTo(9.8, 19, 6.2, 25.4); g.quadraticCurveTo(2.6, 19, 3, 11); g.closePath();
      P.fill(g, P.lg(g, 3, 11, 9.4, 25, [sh(c.dark, 0.3), c.dark, sh(c.dark, -0.5)]));
      g.strokeStyle = gold; g.lineWidth = 0.6; g.stroke();
      P.circle(g, 6.2, 15.8, 1.7, P.vol(g, 5.8, 15.3, 1.7, gold));
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; P.line(g, 6.2 + Math.cos(a) * 2, 15.8 + Math.sin(a) * 2, 6.2 + Math.cos(a) * 2.8, 15.8 + Math.sin(a) * 2.8, 0.4, gold); }
    } });

  /* ---------- Vault Warden: a tall hooded jailer drifting above the floor, a blank golden mask with burning slits,
   *            chains wound about it, a ring of great keys at its belt, a caged lantern of ward-light swinging on a chain ---------- */
  def('vaultwarden', { w: 22, h: 28, cy: 18, frames: 2,
    colors: { robe: '#2a2440', gold: '#d8b050', light: '#fff0a0' },
    draw(g, f, c) {
      const r = sh(c.robe, 0.1), rl = sh(r, 0.5), rd = sh(r, -0.5), gold = c.gold, gd = sh(gold, -0.45), w = f ? 0.8 : -0.8, iron = '#5a5660';
      P.ell(g, 11, 27, 6, 0.9, 'rgba(0,0,0,0.35)');
      // the robe: narrow shoulders under the hood, falling long and ending in wisps above the floor
      g.beginPath(); g.moveTo(7, 10.6); g.quadraticCurveTo(11, 9.4, 15.4, 10.6); g.quadraticCurveTo(17, 17, 17.6 + w, 23.4); g.lineTo(4.6 - w, 23.4); g.quadraticCurveTo(5.4, 17, 7, 10.6); g.closePath();
      P.fill(g, P.lg(g, 5, 10, 17, 24, [rl, r, rd]));
      rag(g, 4.6 - w, 23.2, 17.6 + w, 23.2, 5, 2.2, rd);
      g.strokeStyle = rd; g.lineWidth = 0.5; for (const [x0, x1] of [[9, 7.4], [12.6, 13.4]]) { g.beginPath(); g.moveTo(x0, 12); g.quadraticCurveTo(x0, 18, x1 + w * 0.4, 23); g.stroke(); }
      // chains wound about it
      g.strokeStyle = '#8a8490'; g.lineWidth = 0.6; g.setLineDash([0.8, 0.4]);
      g.beginPath(); g.moveTo(6.6, 12.6); g.quadraticCurveTo(11, 15.6, 16.4, 13.4); g.stroke(); g.beginPath(); g.moveTo(5.8, 17.4); g.quadraticCurveTo(11, 19.6, 17, 17); g.stroke(); g.setLineDash([]);
      // the ring of keys at the belt
      g.beginPath(); g.arc(8.6, 17.8, 1.3, 0, Math.PI * 2); g.strokeStyle = gold; g.lineWidth = 0.4; g.stroke();
      for (const [a, l] of [[1.2, 3], [1.7, 3.6], [2.2, 2.8]]) { const x = 8.6 + Math.cos(a) * 1.3, y = 17.8 + Math.sin(a) * 1.3; P.line(g, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, 0.45, gold); P.rect(g, x + Math.cos(a) * l - 0.5, y + Math.sin(a) * l - 0.2, 1, 0.6, gd); }
      // the hood, peaked, the golden mask in its dark: blank but for two burning slits
      g.beginPath(); g.moveTo(6.4, 12); g.quadraticCurveTo(5.6, 5, 9.4, 2.4); g.lineTo(11.8, 0.8); g.quadraticCurveTo(16.4, 3.4, 16.2, 12); g.closePath();
      P.fill(g, P.lg(g, 6, 1, 16, 12, [rl, r, rd]));
      P.ell(g, 12.2, 7.4, 3, 3.8, '#08060c');
      P.ell(g, 12.6, 7.2, 2.2, 3, P.lg(g, 10.4, 4.4, 14.8, 10, [sh(gold, 0.5), gold, gd]));
      P.path(g, [10.6, 5.8, 12.4, 6.6, 12.4, 7.6, 10.6, 7]); P.fill(g, '#140a04'); P.path(g, [13, 6.6, 14.8, 5.8, 14.8, 7, 13, 7.6]); P.fill(g, '#140a04');
      P.rect(g, 11, 6.5, 1.2, 0.5, c.light); P.rect(g, 13.2, 6.5, 1.2, 0.5, c.light); P.glow(g, 12.7, 6.8, 2, c.light, 0.45);
      P.path(g, [11.4, 9, 14, 9, 13.4, 9.8, 12, 9.8]); P.fill(g, '#140a04');
      // the near arm out of the sleeve, a lantern swinging from its chain
      P.path(g, [14.6, 11.6, 18.6, 14.2, 18, 15.6, 14.4, 14.2]); P.fill(g, r);
      P.circle(g, 18.8, 15, 0.8, '#b8b0a0');
      const lx = 19 + w * 0.5, ly = 20.6;
      g.strokeStyle = iron; g.lineWidth = 0.4; g.beginPath(); g.moveTo(18.8, 15.4); g.lineTo(lx, ly - 2); g.stroke();
      P.glow(g, lx, ly, 5, c.light, 0.55);
      P.rrect(g, lx - 1.4, ly - 1.8, 2.8, 3.6, 0.5, G.rgba(c.light, 0.9)); P.circle(g, lx, ly, 0.8, '#ffffff');
      for (const x of [lx - 1.4, lx, lx + 1.4]) P.line(g, x, ly - 1.8, x, ly + 1.8, 0.35, gd);
      P.path(g, [lx - 1.8, ly - 1.8, lx, ly - 3, lx + 1.8, ly - 1.8]); P.fill(g, gold); P.rect(g, lx - 1.8, ly + 1.8, 3.6, 0.6, gd);
    } });

  /* ---------- Coin Wraith: a greedy spectre rising out of a heap of gold: a gaunt hooded skull with burning eyes, a torn shroud
   *            that pours down into the coins, one long claw clutching a coin up to its face, the other raking the hoard ---------- */
  def('coinwraith', { w: 28, h: 30, cy: 17, frames: 2,
    colors: { shade: '#26302a', eye: '#fff080' },
    draw(g, f, c) {
      const s = sh(c.shade, 0.05), sl = sh(s, 0.6), sd = sh(s, -0.5), bone = '#c8c0a0', w = f ? 0.8 : -0.8;
      P.ell(g, 14, 29, 11, 1.2, 'rgba(0,0,0,0.45)');
      // the far arm raking down into the hoard
      limb(g, 9.4, 12, 5.6, 16.6, 1.4, 1.1, s); limb(g, 5.6, 16.6, 4.4 - w * 0.4, 21.4, 1, 0.7, sh(bone, -0.3)); claws(g, 4.4 - w * 0.4, 21.6, 1.6, 4, 2, 0.3, bone);
      // the shroud: a gaunt chest narrowing and pouring down into the gold
      g.beginPath(); g.moveTo(8.4, 11.4); g.quadraticCurveTo(13, 9, 17.8, 11.4); g.quadraticCurveTo(18, 17, 19.6 + w, 24); g.lineTo(7.6 - w, 24); g.quadraticCurveTo(8.6, 17, 8.4, 11.4); g.closePath();
      P.fill(g, P.lg(g, 8, 10, 19, 24, [sl, s, sd]));
      rag(g, 7.6 - w, 23.6, 19.6 + w, 23.6, 5, 2.4, sd);
      g.strokeStyle = G.rgba(sd, 0.8); g.lineWidth = 0.4; for (const x of [11, 14.4, 16.8]) { g.beginPath(); g.moveTo(x, 12.4); g.quadraticCurveTo(x + w * 0.4, 18, x - 0.4, 23); g.stroke(); }
      // the heap of gold it rises out of
      g.beginPath(); g.moveTo(3, 29); g.quadraticCurveTo(5, 22.4, 13.6, 21.8); g.quadraticCurveTo(22.6, 22.2, 25.4, 29); g.closePath();
      P.fill(g, P.lg(g, 6, 22, 20, 29, ['#e8b830', '#b07a18', '#5a3a08']));
      [[6.6, 26.4], [9.4, 24.4], [12.4, 23.4], [15.6, 23.6], [18.6, 25], [21.4, 27], [8, 28], [11.4, 26.6], [14.6, 26.4], [17.4, 27.6], [20.4, 28.4], [5, 28.4]].forEach(([x, y], i) => P.coin(g, x, y, 1.1, i % 2 ? 0.55 : 1));
      P.coin(g, 13, 21.4, 1.3, 0.7); P.coin(g, 16.4, 21.8, 1.1, 1);
      // the hood and the skull in it: sunken, the eyes burning
      const hx = 13.6, hy = 7.6;
      g.beginPath(); g.moveTo(8.6, 12.4); g.quadraticCurveTo(7.4, 4.6, 11.6, 2.4); g.quadraticCurveTo(16.6, 0.8, 19.4, 4.4); g.lineTo(20, 7.4); g.lineTo(18.4, 6.6); g.quadraticCurveTo(18.8, 10.6, 17.6, 12.4); g.closePath();
      P.fill(g, P.lg(g, 8, 2, 18, 12, [sl, s, sd]));
      P.ell(g, hx + 1.4, hy + 0.6, 3, 3.4, '#060806');
      P.ell(g, hx + 1.6, hy, 2.2, 2.2, P.vol(g, hx + 1, hy - 0.8, 2.4, sh(bone, -0.2)));
      P.path(g, [hx + 0.2, hy + 1.2, hx + 3.4, hy + 1.2, hx + 3, hy + 3.4, hx + 0.6, hy + 3.4]); P.fill(g, sh(bone, -0.35));
      P.ell(g, hx + 0.8, hy - 0.1, 0.9, 1, '#060806'); P.ell(g, hx + 2.7, hy - 0.2, 0.85, 0.95, '#060806'); P.path(g, [hx + 1.6, hy + 1, hx + 2.1, hy + 1, hx + 1.85, hy + 0.3]); P.fill(g, '#060806');
      evil(g, hx + 0.8, hy, 0.5, c.eye); evil(g, hx + 2.7, hy - 0.1, 0.45, c.eye); P.glow(g, hx + 1.7, hy, 2.4, c.eye, 0.45);
      P.rect(g, hx + 0.6, hy + 2, 2.6, 0.5, '#060806'); teeth(g, hx + 0.6, hy + 2, hx + 3.2, hy + 2, 4, 0.5, 1, bone);
      // the near arm: a long claw clutching a coin up to its face
      limb(g, 16.6, 12.4, 21, 14.2, 1.3, 1, s); limb(g, 21, 14.2, 22.6, 10.4 + w * 0.3, 1, 0.7, sl);
      P.coin(g, 23.4, 8.6 + w * 0.3, 1.6, 0.8); P.glow(g, 23.4, 8.6 + w * 0.3, 2.6, '#ffe070', 0.4);
      claws(g, 22.8, 10 + w * 0.3, -1.4, 4, 1.6, 0.3, bone);
      P.coin(g, 20.6, 17.6 + (f ? 1.4 : 0), 0.8, 0.5); // a coin slipping through its fingers
    } });

  /* ---------- Mimic King (boss): a vast iron-bound chest on four clawed beast legs, the lid flung up as a jaw of fangs, a crown
   *            jammed on it, eyes glaring out of the dark inside, a tongue lolling out with a coin on it, gold spilling over the rim ---------- */
  def('mimicking', { w: 54, h: 48, cy: 34, frames: 2,
    colors: { wood: '#5a3016', band: '#d8a83a', tongue: '#c83050', eye: '#ffe060' },
    draw(g, f, c) {
      const wd = sh(c.wood, -0.05), wl = sh(c.wood, 0.4), wk = sh(c.wood, -0.55), band = c.band, bd = sh(band, -0.45), fang = '#efe6cc', hide = '#3a2418', w = f ? 1.2 : -1.2, op = f ? 1.6 : 0;
      P.ell(g, 27, 46.4, 22, 2.2, 'rgba(0,0,0,0.5)');
      // four clawed beast legs under the box
      const leg = (x, d, col) => { limb(g, x, 36, x + d * 2.4, 40.6, 3, 2.4, col); limb(g, x + d * 2.4, 40.6, x + d * 1.2, 45, 2.4, 1.8, col); claws(g, x + d * 1.2 + 1, 45.4, 0.1, 3, 2.2, 0.5, fang); };
      leg(15, -1 - w * 0.3, sh(hide, -0.3)); leg(35, 1 - w * 0.3, sh(hide, -0.3)); leg(10, -1 + w * 0.3, hide); leg(40, 1 + w * 0.3, hide);
      // the box: planks, bands, riveted corners, a padlock hanging loose on a chain
      P.rect(g, 7, 20, 38, 17.6, P.lg(g, 7, 20, 45, 38, [wl, wd, wk]));
      g.strokeStyle = G.rgba(wk, 0.8); g.lineWidth = 0.5; for (const y of [24.4, 28.8, 33.2]) { g.beginPath(); g.moveTo(7.2, y); g.lineTo(44.8, y); g.stroke(); }
      for (const x of [14.4, 34.4]) { P.rect(g, x, 20, 2.6, 17.6, P.lg(g, x, 0, x + 2.6, 0, [sh(band, 0.35), bd])); for (const y of [22, 28.8, 35.6]) P.circle(g, x + 1.3, y, 0.5, sh(band, 0.5)); }
      for (const [x, y] of [[7, 20], [42.4, 20], [7, 35], [42.4, 35]]) P.rect(g, x, y, 2.6, 2.6, P.lg(g, x, y, x + 2.6, y + 2.6, [sh(band, 0.4), bd]));
      g.strokeStyle = '#6a6060'; g.lineWidth = 0.7; g.setLineDash([1, 0.5]); g.beginPath(); g.moveTo(25, 21); g.quadraticCurveTo(26 + w * 0.4, 26, 26.4 + w * 0.6, 29); g.stroke(); g.setLineDash([]);
      P.rrect(g, 24.6 + w * 0.6, 29, 3.6, 3.6, 0.8, P.lg(g, 24.6, 29, 28, 33, [sh(band, 0.3), bd])); P.rect(g, 26.1 + w * 0.6, 30.4, 0.7, 1.4, '#140806');
      // the dark inside, eyes glaring out of it
      const tx = 43.6, ty = 6.4 - op;
      P.path(g, [7.6, 20.2, tx, ty, 45, 20.2]); P.fill(g, P.lg(g, 20, 8, 22, 20, ['#4a0a10', '#100406']));
      [[25, 16.4, 1.3], [30.4, 14.4, 1.2], [35.4, 15.6, 1], [28, 18.6, 0.8]].forEach(([x, y, r]) => { P.ell(g, x, y, r * 1.2, r, '#050102'); evil(g, x, y, r * 0.8, c.eye); });
      P.glow(g, 30, 16, 8, c.eye, 0.4);
      // gold spilling over the front rim
      [[36, 20, 1.4], [39, 19.6, 1.2], [41.6, 21, 1.3], [44, 23.6, 1.1], [45.4, 27 + (f ? 1 : 0), 1.2], [46.6, 31 + (f ? 1.4 : 0), 1]].forEach(([x, y, r], i) => P.coin(g, x, y, r, i % 2 ? 0.5 : 1));
      // the lid: a jaw of fangs along its edge, the crown jammed on its top
      const nx = -0.37, ny = -0.93, T = 6.6;
      P.path(g, [7.6, 20.2, tx, ty, tx + nx * T, ty + ny * T + 0.6, 7.6 + nx * T, 20.2 + ny * T]); P.fill(g, P.lg(g, 5, 10, 44, 18, [wl, wd, wk]));
      for (const k of [0.2, 0.72]) { const x = 7.6 + (tx - 7.6) * k, y = 20.2 + (ty - 20.2) * k; P.path(g, [x, y, x + 2.4, y - 0.8, x + 2.4 + nx * T, y - 0.8 + ny * T, x + nx * T, y + ny * T]); P.fill(g, P.lg(g, x, 0, x + 2.4, 0, [sh(band, 0.35), bd])); }
      P.line(g, 7.6 + nx * T, 20.2 + ny * T, tx + nx * T, ty + ny * T + 0.6, 1, band);
      [[10, 2.4], [14.4, 3.4], [18.4, 2.6], [22.6, 3.8], [27, 2.8], [31.4, 3.6], [35.4, 2.4], [39.6, 3.2]].forEach(([x, l]) => { const k = (x - 7.6) / (tx - 7.6), y = 20.2 + (ty - 20.2) * k; P.path(g, [x - 1, y + 0.3, x + 1, y - 0.3, x + 0.4, y + l]); P.fill(g, P.lg(g, x, y, x, y + l, [fang, sh(fang, -0.3)])); });
      [[10.6, 3], [15.4, 3.8], [20.6, 2.6], [25.4, 3.6], [30.4, 2.8], [35.6, 3.4], [40.4, 2.6], [43.6, 2]].forEach(([x, l]) => { P.path(g, [x - 1, 20.2, x + 1, 20.2, x - 0.2, 20.2 - l]); P.fill(g, P.lg(g, x, 20.2, x, 20.2 - l, [sh(fang, -0.3), fang])); });
      const cx = 7.6 + nx * T + (tx - 7.6) * 0.5, cy = 20.2 + ny * T + (ty - 20.2) * 0.5;
      g.save(); g.translate(cx, cy); g.rotate(-0.37);
      P.path(g, [-5, 0.4, -5, -3.6, -3, -1.8, -1.2, -4.8, 0.6, -1.8, 2.6, -4.6, 3.8, -1.6, 5.4, -3.8, 5.4, 0.4]); P.fill(g, P.lg(g, 0, -5, 0, 0.4, [sh(band, 0.6), band, bd]));
      P.circle(g, -1.2, -1.2, 0.7, '#e03040'); P.circle(g, 2.4, -1.2, 0.7, '#40c0e0'); g.restore();
      // the tongue lolling out, a coin stuck on it
      g.beginPath(); g.moveTo(24, 19.4); g.bezierCurveTo(36, 16, 50, 18, 51.4, 25); g.bezierCurveTo(52.4, 30, 50, 33.4, 48.4, 31.6); g.bezierCurveTo(49, 26, 42, 21.6, 24, 21.4); g.closePath();
      P.fill(g, P.lg(g, 24, 17, 52, 33, [sh(c.tongue, 0.25), c.tongue, sh(c.tongue, -0.45)]));
      P.coin(g, 46, 22.4, 1.6, 0.6);
      P.line(g, 49, 32, 49, 34.4 + (f ? 1 : 0), 0.4, G.rgba('#ffd0d0', 0.6));
    } });

  /* ---------- Gilded Sentinel (boss): a towering guardian of blackened bronze and gold, a smooth faceless helm with one slit of
   *            white fire, a gold ring of light behind its head, a tower shield blazoned with the sun, a long halberd ---------- */
  def('sentinel', { w: 50, h: 62, cy: 40, frames: 2,
    colors: { plate: '#d0a840', dark: '#4a3010', light: '#fff4c0', cloth: '#1e2a5a' },
    draw(g, f, c) {
      const br = '#3e342a', bl = sh(br, 0.5), bk = sh(br, -0.45), gold = c.plate, gd = sh(gold, -0.45), cl = c.cloth, w = f ? 1 : -1;
      P.ell(g, 25, 60.4, 16, 1.8, 'rgba(0,0,0,0.5)');
      // the ring of light behind the head
      P.glow(g, 26, 10, 11, c.light, 0.35);
      g.beginPath(); g.arc(26, 10, 8, 0, Math.PI * 2); g.strokeStyle = gold; g.lineWidth = 1.2; g.stroke();
      g.beginPath(); g.arc(26, 10, 8, Math.PI * 1.1, Math.PI * 1.6); g.strokeStyle = sh(gold, 0.6); g.lineWidth = 0.5; g.stroke();
      // the halberd, planted
      P.line(g, 41.6, 59, 42.6, 6, 1.1, '#2a2018');
      P.path(g, [42.6, 0.6, 44, 5, 42.6, 8.4, 41.2, 5]); P.fill(g, P.lg(g, 41, 0, 44, 8, [sh(gold, 0.5), gold, gd]));
      g.beginPath(); g.moveTo(42.8, 9); g.quadraticCurveTo(48.4, 9.6, 48.6, 15.4); g.quadraticCurveTo(45.4, 13.6, 42.8, 14.4); g.closePath(); P.fill(g, P.lg(g, 42, 9, 49, 15, [sh(gold, 0.4), gd]));
      P.path(g, [42.4, 10, 39, 11.4, 42.4, 12.6]); P.fill(g, gd);
      // legs: armoured, heavy, gold at the knee
      for (const [x, d, col] of [[21, -w, bk], [29.4, w, br]]) { limb(g, x, 40, x + d * 0.8, 49, 3.6, 3, col); limb(g, x + d * 0.8, 49, x + d * 1.4, 57.6, 3, 2.6, col); P.circle(g, x + d * 0.8, 49, 2.2, P.vol(g, x + d * 0.8 - 0.6, 48.2, 2.2, gold)); P.path(g, [x + d * 1.4 - 2.6, 57, x + d * 1.4 + 4, 57.4, x + d * 1.4 + 4, 59.6, x + d * 1.4 - 2.6, 59.6]); P.fill(g, bk); }
      // the tabard between the legs
      P.path(g, [21.6, 36, 29.8, 36, 30.6, 50, 26, 48.4, 21, 50]); P.fill(g, P.lg(g, 21, 36, 30, 50, [sh(cl, 0.1), sh(cl, -0.3), sh(cl, -0.6)]));
      g.strokeStyle = gold; g.lineWidth = 0.5; g.beginPath(); g.moveTo(21.6, 36); g.lineTo(21, 50); g.lineTo(26, 48.4); g.lineTo(30.6, 50); g.lineTo(29.8, 36); g.stroke();
      // the torso: a massive cuirass, a sun embossed on it
      P.path(g, [16, 20, 36, 20, 34.6, 32, 31.6, 38, 20, 38, 17.4, 32]); P.fill(g, P.lg(g, 16, 20, 36, 38, [bl, br, bk]));
      P.line(g, 26, 21, 26, 36.4, 0.5, gd); P.line(g, 17.8, 33, 34.2, 33, 1, gold); P.line(g, 16.4, 20.6, 35.6, 20.6, 0.8, gold);
      P.circle(g, 28.6, 26.4, 2.6, P.vol(g, 28, 25.6, 2.6, gold)); P.glow(g, 28.6, 26.4, 4, c.light, 0.35);
      // the halberd arm
      limb(g, 34, 22, 38.6, 28.6, 3, 2.4, br); limb(g, 38.6, 28.6, 41.4, 26, 2.4, 2, bl); P.circle(g, 42, 25.6, 1.8, P.vol(g, 41.4, 25, 1.8, gd));
      // pauldrons, layered
      for (const [x, col] of [[16.4, bk], [35.2, br]]) { P.ell(g, x, 21.6, 5, 3.6, P.vol(g, x - 1.4, 20.4, 5, col)); g.beginPath(); g.ellipse(x, 21.6, 5, 3.6, 0, 0.1, Math.PI - 0.1); g.strokeStyle = gold; g.lineWidth = 0.7; g.stroke(); P.ell(g, x, 24.4, 4, 1.6, G.rgba(bk, 0.8)); }
      // the helm: smooth and faceless, a crest of gold, one slit of white fire
      const hx = 26.4, hy = 12.4;
      g.beginPath(); g.moveTo(hx - 4.4, hy + 5.6); g.lineTo(hx - 4.6, hy - 1); g.quadraticCurveTo(hx - 4.4, hy - 6.6, hx, hy - 6.8); g.quadraticCurveTo(hx + 4.8, hy - 6.6, hx + 4.8, hy - 1); g.lineTo(hx + 4.4, hy + 5.6); g.closePath();
      P.fill(g, P.lg(g, hx - 4, hy - 7, hx + 4, hy + 6, [sh(gold, 0.45), gold, gd]));
      P.path(g, [hx - 0.8, hy - 6.6, hx + 0.8, hy - 6.6, hx + 0.6, hy + 4, hx - 0.6, hy + 4]); P.fill(g, G.rgba(gd, 0.6));
      P.rect(g, hx - 3.6, hy - 0.2, 8, 1.3, '#0a0604'); P.rect(g, hx - 3.2, hy + 0.1, 7.2, 0.7, c.light); P.glow(g, hx + 0.4, hy + 0.4, 4, c.light, 0.6);
      // the tower shield, dark with a gold rim and a sun
      P.rrect(g, 5, 22, 14, 28, 2, P.lg(g, 5, 22, 19, 50, [sh(c.dark, 0.4), c.dark, sh(c.dark, -0.5)]));
      g.strokeStyle = gold; g.lineWidth = 1; g.strokeRect(5.5, 22.5, 13, 27);
      P.circle(g, 12, 33, 3, P.vol(g, 11.2, 32.2, 3, gold)); P.glow(g, 12, 33, 5, c.light, 0.3);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; P.line(g, 12 + Math.cos(a) * 3.6, 33 + Math.sin(a) * 3.6, 12 + Math.cos(a) * (i % 2 ? 4.6 : 5.6), 33 + Math.sin(a) * (i % 2 ? 4.6 : 5.6), 0.6, gold); }
      for (const [x, y] of [[6.6, 23.6], [17.4, 23.6], [6.6, 48.4], [17.4, 48.4]]) P.circle(g, x, y, 0.6, sh(gold, 0.4));
    } });

  /* ---------- Hollow Magistrate (boss): a gaunt dead judge risen out of his robes: a high stiff collar, a long wig of tight
   *            curls framing a dried skull with red eyes, a gold chain of office, a gavel raised high, scales in the other
   *            hand weighing a heart against a coin ---------- */
  def('magistrate', { w: 50, h: 60, cy: 40, frames: 2,
    colors: { robe: '#1e1a24', gold: '#d8b050', wig: '#d8d4c8', eye: '#ff5040' },
    draw(g, f, c) {
      const r = sh(c.robe, 0.05), rl = sh(r, 0.35), rd = sh(r, -0.5), gold = c.gold, gd = sh(gold, -0.45), wig = c.wig, wd = sh(wig, -0.35), bone = '#c8b890', w = f ? 1 : -1;
      P.ell(g, 25, 58.6, 12, 1.6, 'rgba(0,0,0,0.4)');
      P.glow(g, 26, 30, 20, c.eye, 0.08);
      // the robe: a tall column of black, sleeves wide, the hem torn and drifting above the floor
      g.beginPath(); g.moveTo(18, 18); g.lineTo(34, 18); g.quadraticCurveTo(37, 36, 38.6 + w, 53); g.lineTo(13.4 - w, 53); g.quadraticCurveTo(15, 36, 18, 18); g.closePath();
      P.fill(g, P.lg(g, 13, 18, 38, 53, [rl, r, rd]));
      rag(g, 13.4 - w, 52.6, 38.6 + w, 52.6, 7, 3, rd);
      g.strokeStyle = rd; g.lineWidth = 0.8; for (const [x0, x1] of [[22, 18], [26, 26.4], [30, 34]]) { g.beginPath(); g.moveTo(x0, 22); g.quadraticCurveTo(x0 + (x1 - x0) * 0.5, 38, x1 + w * 0.6, 52); g.stroke(); }
      P.path(g, [24.8, 20, 27.2, 20, 27.6, 52, 24.4, 52]); P.fill(g, G.rgba(rl, 0.5)); // the band down the front
      // the far arm, holding up the scales: a heart weighed against a coin
      P.path(g, [18.6, 21, 11, 28, 9.6, 32, 13.4, 31.6, 20, 26]); P.fill(g, P.lg(g, 10, 21, 20, 32, [r, rd]));
      P.line(g, 10.4, 31.6, 9.6, 34, 0.6, bone); P.circle(g, 9.8, 32.6, 0.9, bone);
      const tilt = f ? 0.9 : 0.6;
      P.line(g, 9.8, 33, 9.8, 36, 0.5, gold); P.line(g, 4, 36 + tilt, 15.6, 36 - tilt, 0.6, gold); P.circle(g, 9.8, 36, 0.7, gold);
      for (const [x, y, s2] of [[4.4, 36 + tilt, 1], [15.2, 36 - tilt, -1]]) { g.strokeStyle = gd; g.lineWidth = 0.3; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y + 4.4); g.moveTo(x, y); g.lineTo(x + 2, y + 4.4); g.stroke(); g.beginPath(); g.ellipse(x, y + 4.6, 2.4, 0.9, 0, 0, Math.PI); P.fill(g, gold); }
      P.path(g, [4.4, 40 + tilt, 3.2, 38.6 + tilt, 4, 37.8 + tilt, 4.4, 38.4 + tilt, 4.8, 37.8 + tilt, 5.6, 38.6 + tilt]); P.fill(g, '#9a1a1a'); // the heart
      P.coin(g, 15.2, 40 - tilt, 1, 0.6);
      // the high stiff collar standing up behind the head
      P.path(g, [17, 19.6, 18.6, 10.6, 26, 15, 33.4, 10.6, 35, 19.6]); P.fill(g, P.lg(g, 17, 10, 35, 20, [rl, r, rd]));
      // the head: a long wig of tight curls either side of a dried skull, red eyes deep in it
      const hx = 26, hy = 12;
      g.beginPath(); g.moveTo(hx - 5, hy + 7); g.quadraticCurveTo(hx - 6.4, hy - 6, hx, hy - 7.4); g.quadraticCurveTo(hx + 6.4, hy - 6, hx + 5, hy + 7); g.closePath(); P.fill(g, P.lg(g, hx - 5, hy - 7, hx + 5, hy + 7, [sh(wig, 0.3), wig, wd]));
      for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) P.ell(g, hx + sx * 4.2, hy - 1 + i * 2.2, 1.8, 1.1, P.lg(g, 0, hy - 2 + i * 2.2, 0, hy + i * 2.2, [sh(wig, 0.35), wd]));
      P.ell(g, hx + 0.3, hy + 0.6, 3.2, 3.8, '#08060a');
      P.ell(g, hx + 0.4, hy + 0.2, 2.6, 3, P.vol(g, hx - 0.4, hy - 0.8, 3, bone));
      P.ell(g, hx - 0.7, hy - 0.2, 0.9, 1, '#08060a'); P.ell(g, hx + 1.5, hy - 0.2, 0.85, 1, '#08060a');
      evil(g, hx - 0.7, hy - 0.1, 0.55, c.eye); evil(g, hx + 1.5, hy - 0.1, 0.5, c.eye); P.glow(g, hx + 0.4, hy - 0.1, 3.4, c.eye, 0.5);
      P.path(g, [hx + 0.2, hy + 1, hx + 0.8, hy + 1, hx + 0.5, hy + 0.2]); P.fill(g, '#08060a');
      P.rect(g, hx - 1.2, hy + 2, 3.4, 0.6, '#08060a'); teeth(g, hx - 1.2, hy + 2, hx + 2.2, hy + 2, 5, 0.5, 1, bone);
      // the chain of office and its seal
      g.beginPath(); g.moveTo(19.6, 19.4); g.quadraticCurveTo(26, 26, 32.4, 19.4); g.strokeStyle = gold; g.lineWidth = 0.8; g.setLineDash([0.9, 0.4]); g.stroke(); g.setLineDash([]);
      P.circle(g, 26, 23.8, 1.8, P.vol(g, 25.4, 23.2, 1.8, gold)); P.circle(g, 26, 23.8, 0.7, c.eye);
      // the near arm raising the gavel
      P.path(g, [33.4, 19.4, 38.6, 13, 41.4, 14.6, 36, 22.6]); P.fill(g, P.lg(g, 33, 13, 41, 23, [rl, r]));
      P.circle(g, 40, 12.6, 1, bone);
      P.line(g, 39.4, 14.4, 42.2, 2.4, 0.9, '#3a2410');
      g.save(); g.translate(42.4, 2.8 + (f ? 0.6 : 0)); g.rotate(0.25);
      P.rrect(g, -4.4, -2, 8.8, 4, 0.8, P.lg(g, 0, -2, 0, 2, ['#5a3a20', '#2a1a0c']));
      for (const x of [-3.4, 2.4]) P.rect(g, x, -2.1, 1, 4.2, gold);
      g.restore();
    } });

  /* ---------- Gold Custodian (Lord): a colossal guardian of the vault: a deep red cowl round a serene golden mask split by a
   *            crack with darkness behind it and burning cyan eyes; a vault door set in its chest, a great key for a staff,
   *            a hand held out with a sphere of gold light, coins circling it ---------- */
  def('custodian', { w: 58, h: 66, cy: 44, frames: 2,
    colors: { robe: '#5a1a24', gold: '#e0b840', mask: '#fff0b0', light: '#fff4c0', eye: '#40e0ff' },
    draw(g, f, c) {
      const r = c.robe, rl = sh(r, 0.45), rd = sh(r, -0.5), gold = c.gold, gd = sh(gold, -0.45), w = f ? 1 : -1, sp = f ? 0.5 : 0;
      P.ell(g, 29, 64, 20, 2, 'rgba(0,0,0,0.5)');
      P.glow(g, 29, 30, 26, c.light, 0.1);
      // coins circling it on a faint orbit, behind
      g.beginPath(); g.ellipse(29, 32, 25, 6, 0, Math.PI, Math.PI * 2); g.strokeStyle = G.rgba(c.light, 0.25); g.lineWidth = 0.4; g.stroke();
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + sp; if (Math.sin(a) < 0) P.coin(g, 29 + Math.cos(a) * 25, 32 + Math.sin(a) * 6, 1.3, 0.4 + Math.abs(Math.cos(a)) * 0.6); }
      // the great key, held as a staff: the bow on top with a gem in it, the bit at the foot
      P.line(g, 48, 61, 48.4, 12, 1.6, gd); P.line(g, 47.6, 61, 48, 12, 0.6, sh(gold, 0.4));
      g.beginPath(); g.arc(48.4, 7.6, 4.4, 0, Math.PI * 2); g.strokeStyle = gold; g.lineWidth = 1.6; g.stroke();
      g.beginPath(); g.arc(48.4, 7.6, 2.4, 0, Math.PI * 2); g.strokeStyle = gd; g.lineWidth = 0.8; g.stroke();
      P.circle(g, 48.4, 7.6, 1.4, c.eye); P.glow(g, 48.4, 7.6, 3.4, c.eye, 0.6);
      P.path(g, [49, 54, 53, 54, 53, 56, 51, 56, 51, 58, 53, 58, 53, 60, 49, 60]); P.fill(g, gold);
      // the robe: vast, broad at the shoulders, falling to the floor, gold hem, the vault door in its chest
      g.beginPath(); g.moveTo(15, 22); g.lineTo(43, 22); g.quadraticCurveTo(46, 42, 49 + w * 0.5, 62); g.lineTo(9 - w * 0.5, 62); g.quadraticCurveTo(12, 42, 15, 22); g.closePath();
      P.fill(g, P.lg(g, 10, 22, 48, 62, [rl, r, rd]));
      P.path(g, [9 - w * 0.5, 60.6, 49 + w * 0.5, 60.6, 49 + w * 0.5, 62, 9 - w * 0.5, 62]); P.fill(g, gold);
      g.strokeStyle = rd; g.lineWidth = 1; for (const [x0, x1] of [[20, 14], [36, 42]]) { g.beginPath(); g.moveTo(x0, 30); g.quadraticCurveTo((x0 + x1) / 2, 46, x1 + w * 0.5, 60); g.stroke(); }
      P.path(g, [26, 38, 32, 38, 34, 60.6, 24, 60.6]); P.fill(g, P.lg(g, 24, 38, 34, 60, [sh(gold, 0.1), gd])); // a gold panel below the door
      P.circle(g, 29, 33, 6.6, P.lg(g, 22, 26, 36, 40, [sh(gold, 0.45), gold, gd]));
      P.circle(g, 29, 33, 4.8, P.lg(g, 24, 28, 34, 38, [gd, sh(gold, 0.2)]));
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + sp * 0.6; P.line(g, 29 + Math.cos(a) * 1.4, 33 + Math.sin(a) * 1.4, 29 + Math.cos(a) * 4.4, 33 + Math.sin(a) * 4.4, 0.7, sh(gold, -0.2)); }
      P.circle(g, 29, 33, 1.6, '#140806'); P.rect(g, 28.5, 33, 1, 2.4, '#140806'); P.glow(g, 29, 33.6, 3, c.light, 0.6); P.circle(g, 29, 33, 0.6, c.light);
      // the far hand held out, a sphere of gold light over the palm
      P.path(g, [15.6, 24, 7.4, 33, 6.6, 37, 10.6, 36.4, 17, 29]); P.fill(g, P.lg(g, 7, 24, 17, 37, [r, rd]));
      P.ell(g, 8.4, 37.6, 2, 1.2, P.lg(g, 6.4, 36.4, 10.4, 38.8, [sh(gold, 0.3), gd]));
      P.glow(g, 8.4, 32.6 - sp, 5, c.light, 0.7); P.circle(g, 8.4, 32.6 - sp, 2, P.rg(g, 7.8, 32, 2, [[0, '#ffffff'], [0.5, c.light], [1, gold]]));
      // the mantle over the shoulders, layered gold
      for (const [x, col] of [[16, rd], [42, r]]) { P.ell(g, x, 24, 6.4, 4, P.vol(g, x - 1.6, 22.6, 6.4, col)); g.beginPath(); g.ellipse(x, 24, 6.4, 4, 0, 0.05, Math.PI - 0.05); g.strokeStyle = gold; g.lineWidth = 1; g.stroke(); }
      // the near arm gripping the key
      limb(g, 42, 25, 45.6, 32, 3.6, 3, r); limb(g, 45.6, 32, 47.4, 26, 3, 2.4, rl); P.ell(g, 48.2, 25, 2.2, 2.6, P.lg(g, 46, 22.4, 50.4, 27.6, [sh(gold, 0.3), gd]));
      // the cowl and the mask: serene, split by a crack, darkness behind, cyan eyes burning
      const hx = 29, hy = 13;
      g.beginPath(); g.moveTo(hx - 9, hy + 11); g.quadraticCurveTo(hx - 10, hy - 6, hx - 2, hy - 10.6); g.quadraticCurveTo(hx + 1, hy - 12, hx + 3, hy - 10); g.quadraticCurveTo(hx + 10, hy - 5, hx + 9, hy + 11); g.closePath();
      P.fill(g, P.lg(g, hx - 9, hy - 11, hx + 9, hy + 11, [rl, r, rd]));
      g.beginPath(); g.moveTo(hx - 8, hy - 3); g.quadraticCurveTo(hx - 2, hy - 12, hx + 7.4, hy - 4); g.strokeStyle = gold; g.lineWidth = 0.8; g.stroke();
      P.ell(g, hx, hy + 1.4, 6, 7.4, '#08040a');
      P.ell(g, hx + 0.2, hy + 1, 4.6, 6, P.lg(g, hx - 4.4, hy - 5, hx + 4.4, hy + 7, [sh(c.mask, 0.2), sh(gold, 0.1), gd]));
      g.strokeStyle = sh(gold, -0.2); g.lineWidth = 0.4; g.beginPath(); g.moveTo(hx - 3.4, hy - 1.2); g.quadraticCurveTo(hx - 1.8, hy - 2.2, hx - 0.4, hy - 1.2); g.moveTo(hx + 0.8, hy - 1.2); g.quadraticCurveTo(hx + 2.2, hy - 2.2, hx + 3.6, hy - 1.2); g.stroke(); // brows
      P.ell(g, hx - 1.8, hy + 0.2, 1.4, 0.8, '#08040a'); P.ell(g, hx + 2.2, hy + 0.2, 1.4, 0.8, '#08040a');
      evil(g, hx - 1.8, hy + 0.2, 0.8, c.eye); evil(g, hx + 2.2, hy + 0.2, 0.8, c.eye); P.glow(g, hx + 0.2, hy + 0.2, 4, c.eye, 0.5);
      P.line(g, hx + 0.2, hy + 1, hx + 0.6, hy + 3.4, 0.4, sh(gold, -0.3)); P.line(g, hx - 1, hy + 4.6, hx + 1.6, hy + 4.6, 0.5, sh(gold, -0.4));
      g.strokeStyle = '#08040a'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(hx + 4.4, hy - 2.6); g.lineTo(hx + 3.4, hy - 1); g.lineTo(hx + 3.8, hy + 1.6); g.lineTo(hx + 2.6, hy + 3.4); g.moveTo(hx + 3.4, hy - 1); g.lineTo(hx + 4.6, hy + 0.2); g.stroke(); // a crack across the cheek
      // coins circling it, in front
      g.beginPath(); g.ellipse(29, 32, 25, 6, 0, 0, Math.PI); g.strokeStyle = G.rgba(c.light, 0.25); g.lineWidth = 0.4; g.stroke();
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + sp; if (Math.sin(a) >= 0) P.coin(g, 29 + Math.cos(a) * 25, 32 + Math.sin(a) * 6, 1.3, 0.4 + Math.abs(Math.cos(a)) * 0.6); }
    } });

  /* ================= Hall secrets ================= */
  /* ---------- Cyclops (secret boss): a hunched one-eyed giant, a small head thrust forward under a brow horn with one huge
   *            burning eye and an underbite of tusks, a broken shackle on its wrist, a great club of iron-banded trunk
   *            swung over its shoulder, knuckles of the other hand dragging ---------- */
  def('cyclops', { w: 50, h: 56, cy: 36, grow: [0, 0, 4, 0], frames: 2,
    colors: { skin: '#a86a4a', hide: '#4a3020', eye: '#ffb030', club: '#4a3420' },
    draw(g, f, c) {
      const sk = sh(c.skin, -0.05), sl = sh(sk, 0.4), sd = sh(sk, -0.45), hd = c.hide, hl = sh(hd, 0.35), w = f ? 1.2 : -1.2, iron = '#4a4a50', nail = '#d8ccb0';
      P.ell(g, 25, 53.6, 16, 2.2, 'rgba(0,0,0,0.5)');
      // the legs: short, thick, planted wide, hide wrapped round the feet
      for (const [x, d, col] of [[19, -w, sd], [29, w, sk]]) { limb(g, x, 36, x + d * 0.6 - 1, 45, 4.4, 3.6, col); limb(g, x + d * 0.6 - 1, 45, x + d, 51.6, 3.6, 3.4, col); P.path(g, [x + d - 3.6, 50.6, x + d + 4.6, 50.8, x + d + 4.6, 53.6, x + d - 3.6, 53.6]); P.fill(g, P.lg(g, 0, 50, 0, 54, [hl, hd])); }
      // the far arm hanging, the knuckles near the ground
      limb(g, 14, 20, 9, 32, 4.2, 3.6, sd); limb(g, 9, 32, 9.6, 43, 3.6, 3, sd); P.ell(g, 10.4, 44.6, 3.2, 2.6, P.vol(g, 9.6, 43.6, 3.2, sd));
      // the body: a vast hunched back, a gut hanging over a hide kilt
      g.beginPath(); g.moveTo(14, 36); g.quadraticCurveTo(9, 24, 14, 15); g.quadraticCurveTo(21, 8, 31, 12); g.quadraticCurveTo(38, 16, 36, 26); g.quadraticCurveTo(36, 33, 32, 37); g.closePath();
      P.fill(g, P.lg(g, 11, 10, 36, 37, [sl, sk, sd]));
      P.ell(g, 27.6, 29.6, 7, 6, P.vol(g, 26, 27.6, 7, sk));
      g.strokeStyle = G.rgba(sd, 0.8); g.lineWidth = 0.5; for (const [x0, y0, x1, y1] of [[18, 17, 22, 21], [16, 23, 19.4, 22], [24, 14, 26, 18.4]]) P.line(g, x0, y0, x1, y1, 0.5, G.rgba('#e8c8b0', 0.4)); // old scars
      P.path(g, [14.6, 34, 34, 34, 35, 40.6, 30, 38.6, 25, 41.4, 20, 38.6, 14, 40.4]); P.fill(g, P.lg(g, 14, 34, 34, 41, [hl, hd, sh(hd, -0.4)]));
      P.line(g, 14.6, 34.4, 34, 34.4, 1, sh(hd, -0.5));
      // a pelt over the shoulder, a skull tied to it
      P.path(g, [12.6, 18, 18, 11, 26, 11.4, 22, 18, 17, 23]); P.fill(g, P.lg(g, 12, 11, 26, 23, [hl, hd]));
      // the head: small, low and forward, a horn on the brow, one huge eye, tusks jutting from the underbite
      const hx = 38.4, hy = 15.6;
      g.save(); g.translate(hx, hy + 4); g.scale(1.28, 1.28); g.translate(-hx, -hy - 4);
      P.ell(g, hx - 1.6, hy + 1.4, 6.4, 6, G.rgba('#140c08', 0.7)); // the shadow the head casts on the hump
      P.ell(g, hx, hy, 5.6, 5.4, P.vol(g, hx - 1.6, hy - 1.8, 5.6, sl));
      horn(g, hx - 0.6, hy - 4.6, hx + 0.6, hy - 8.6, hx - 2.4, hy - 11, 1.2, '#8a7a5a');
      P.path(g, [hx - 4.4, hy - 2.6, hx + 4.8, hy - 3.4, hx + 5, hy - 1.6, hx - 4.4, hy - 0.8]); P.fill(g, sd); // the heavy brow
      P.ell(g, hx + 1, hy + 0.2, 3.4, 2.6, '#1a0a04');
      P.ell(g, hx + 1, hy + 0.2, 2.8, 2.1, P.rg(g, hx + 0.4, hy - 0.4, 3, [[0, '#fff4c0'], [0.4, c.eye], [1, sh(c.eye, -0.5)]]));
      P.ell(g, hx + 1.4, hy + 0.2, 0.55, 1.7, '#1a0a04'); P.glow(g, hx + 1, hy + 0.2, 6, c.eye, 0.45);
      P.path(g, [hx - 1.6, hy + 3.4, hx + 5.4, hy + 2.6, hx + 5.8, hy + 5.4 + (f ? 0.6 : 0), hx - 1, hy + 6]); P.fill(g, sd);
      P.path(g, [hx - 0.4, hy + 3.8, hx + 5, hy + 3.2, hx + 4.6, hy + 4.4, hx, hy + 4.8]); P.fill(g, '#1a0806');
      horn(g, hx + 0.6, hy + 4.8, hx + 0.4, hy + 3, hx + 1.2, hy + 1.4, 0.55, nail); horn(g, hx + 4.2, hy + 4.4, hx + 4.2, hy + 2.8, hx + 5, hy + 1.4, 0.5, nail); g.restore();
      // the club, its heavy end resting on the ground at its side: a trunk with iron bands and nails driven through it
      g.save(); g.translate(42, 29.4); g.rotate(1.3 - (f ? 0.06 : 0)); g.scale(0.94, 1.1);
      g.beginPath(); g.moveTo(-1, -1.2); g.lineTo(10, -2); g.quadraticCurveTo(22, -6.4, 23.6, -1); g.quadraticCurveTo(24.4, 5.4, 12, 3); g.lineTo(-1, 1.2); g.closePath();
      P.fill(g, P.lg(g, 0, -5, 0, 5, ['#7a6a5a', '#3a3028', '#141008']));
      g.strokeStyle = '#141008'; g.lineWidth = 0.35; for (const y of [-1.6, 0.4, 2]) { g.beginPath(); g.moveTo(8, y * 0.5); g.quadraticCurveTo(15, y * 1.3, 22, y * 1.6); g.stroke(); } // the grain
      for (const x of [12.4]) P.rect(g, x, -3.6, 1.4, 6.8, P.lg(g, 0, -3.6, 0, 3.6, ['#7a7a84', iron, '#1a1a1e']));
      for (const [x, y, dx, dy] of [[18, -4.2, 0.4, -2.2], [22.4, -3.6, 1.4, -1.8], [24, 0.6, 2.2, 0], [21, 3.6, 1.2, 1.8], [16, 2.6, 0, 2]]) P.line(g, x, y, x + dx, y + dy, 0.55, '#b8b8c0'); // nails driven through
      g.restore();
      // the near arm gripping the club, a broken shackle on the wrist
      limb(g, 32, 21, 38.6, 26.6, 4.2, 3.4, sk); limb(g, 38.6, 26.6, 41.6, 30, 3.4, 3, sl);
      P.ell(g, 42, 30.4, 3, 2.6, P.vol(g, 41.2, 29.6, 3, sk));
      P.rect(g, 38.4, 27, 3.6, 1.8, P.lg(g, 0, 27, 0, 28.8, ['#8a8a94', iron])); P.line(g, 38.4, 28.4, 35.6, 31 + w * 0.4, 0.6, iron); P.circle(g, 35.4, 31.6 + w * 0.4, 0.8, iron);
    } });

  /* ---------- Ghoul Lieutenant (secret boss): a huge gaunt ghoul of the frozen catacombs, stooped low on bent legs, arms
   *            to the ground; a jaw of long teeth under icy eyes, a rusted pauldron and a chain, a bone banner lashed to its
   *            back, a butcher's cleaver in its fist, frost on its shoulders ---------- */
  def('ghoullt', { w: 48, h: 50, cy: 32, frames: 2,
    colors: { skin: '#8aa6bc', plate: '#3a4658', banner: '#6a1a24', bone: '#d8d4c4', eye: '#8ff0ff' },
    draw(g, f, c) {
      const sk = sh(c.skin, -0.2), sl = sh(sk, 0.35), sd = sh(sk, -0.45), pl = c.plate, bone = c.bone, w = f ? 1.2 : -1.2, frost = '#e8f6ff';
      P.ell(g, 24, 48.2, 16, 1.8, 'rgba(0,0,0,0.5)');
      // the bone banner lashed to its back: a pole, a skull on top, a torn banner streaming back
      P.line(g, 15.6, 26, 11.4, 2.4, 0.9, sh(bone, -0.3));
      P.skull(g, 11.2, 2.8, 1.8, bone);
      g.beginPath(); g.moveTo(12, 5.4); g.quadraticCurveTo(7, 5 + w * 0.4, 2, 6.4 + w); g.lineTo(3, 9 + w); g.lineTo(1.6, 11.6 + w * 0.6); g.lineTo(4.4, 13.4 + w * 0.6); g.lineTo(3.6, 16 + w * 0.4); g.quadraticCurveTo(8, 15, 13, 14.6); g.closePath();
      P.fill(g, P.lg(g, 2, 5, 13, 16, [sh(c.banner, 0.3), c.banner, sh(c.banner, -0.45)]));
      P.path(g, [7, 9, 8.6, 8.4, 9, 10.6, 7.4, 11.2]); P.fill(g, G.rgba(bone, 0.8)); // a bone sigil on it
      // legs: long, bent back at the knee, clawed feet
      const leg = (hx, hy, d, col) => { limb(g, hx, hy, hx + 4 + d, hy + 7, 3.2, 2.4, col); limb(g, hx + 4 + d, hy + 7, hx - 1 + d, hy + 12.6, 2.4, 1.8, col); limb(g, hx - 1 + d, hy + 12.6, hx + 1 + d, hy + 15.4, 1.8, 1.4, col); claws(g, hx + 1.6 + d, hy + 15.6, 0.1, 3, 2, 0.4, bone); };
      leg(17, 31.6, -w, sd); leg(25, 31.6, w, sk);
      // the far arm reaching down to the ground, long-clawed
      limb(g, 16, 16, 11, 27, 3, 2.4, sd); limb(g, 11, 27, 12.4, 38, 2.4, 1.8, sd); claws(g, 12.6, 38.6, 1.4, 4, 3, 0.4, bone);
      // the body: a stooped gaunt back, ribs showing along the flank, a chain slung across
      g.beginPath(); g.moveTo(15, 32); g.quadraticCurveTo(11, 22, 16, 14); g.quadraticCurveTo(23, 8, 31, 13); g.quadraticCurveTo(33, 20, 30, 27); g.quadraticCurveTo(27, 33, 24, 33); g.closePath();
      P.fill(g, P.lg(g, 12, 10, 32, 33, [sl, sk, sd]));
      g.strokeStyle = sd; g.lineWidth = 0.6; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(18 + i * 0.4, 18 + i * 2.6); g.quadraticCurveTo(23, 17 + i * 2.6, 28.4 - i * 0.6, 19.6 + i * 2.4); g.stroke(); }
      g.strokeStyle = '#6a6e78'; g.lineWidth = 0.7; g.setLineDash([1, 0.5]); g.beginPath(); g.moveTo(16, 15); g.quadraticCurveTo(22, 24, 29, 28); g.stroke(); g.setLineDash([]);
      P.path(g, [17, 29, 29, 28.4, 30, 34, 26.6, 33, 23, 35.4, 19.6, 33, 16.4, 34.6]); P.fill(g, P.lg(g, 17, 28, 30, 35, [sh(pl, 0.2), sh(pl, -0.3)])); // a rag of mail at the loins
      // a rusted pauldron on the near shoulder, frost on it
      P.ell(g, 28.6, 15.4, 4.6, 3.4, P.vol(g, 27.4, 14.4, 4.6, pl)); P.line(g, 24.4, 17, 32.8, 16.4, 0.5, sh(pl, -0.5));
      P.ell(g, 27.6, 12.8, 2.2, 0.6, G.rgba(frost, 0.55));
      // the head: long and low, thrust forward, icy eyes, a jaw of long teeth hanging open
      const hx = 37, hy = 12.6;
      limb(g, 29, 14.6, hx - 2.6, hy + 1.2, 2.2, 1.6, sd); // a thin neck craning forward
      P.ell(g, hx, hy - 0.6, 4.2, 3.4, P.vol(g, hx - 1.4, hy - 1.8, 4.2, sl));
      P.path(g, [hx - 2.6, hy - 2.4, hx + 4.4, hy - 2.8, hx + 4.2, hy - 1.4, hx - 2.4, hy - 1.2]); P.fill(g, sd);
      P.ell(g, hx + 0.4, hy - 0.8, 1, 0.75, '#060a10'); P.ell(g, hx + 3, hy - 1, 0.9, 0.7, '#060a10');
      evil(g, hx + 0.4, hy - 0.8, 0.65, c.eye); evil(g, hx + 3, hy - 1, 0.6, c.eye); P.glow(g, hx + 1.6, hy - 0.8, 3.6, c.eye, 0.5);
      P.path(g, [hx - 1, hy + 1.4, hx + 7.4, hy + 0.4, hx + 7, hy + 5.8 + (f ? 0.8 : 0), hx, hy + 5]); P.fill(g, '#140608');
      P.path(g, [hx, hy + 4.6, hx + 7, hy + 5.4 + (f ? 0.8 : 0), hx + 6.6, hy + 6.8 + (f ? 0.8 : 0), hx - 0.6, hy + 6]); P.fill(g, sd); // the hanging jaw
      teeth(g, hx - 0.2, hy + 1.4, hx + 7.2, hy + 0.5, 6, 1.4, 1, bone); teeth(g, hx + 0.4, hy + 4.8, hx + 6.8, hy + 5.5 + (f ? 0.8 : 0), 5, 1.2, -1, bone);
      P.line(g, hx + 5, hy + 7, hx + 5, hy + 9.4, 0.35, G.rgba(frost, 0.7)); P.circle(g, hx + 5, hy + 9.6, 0.4, frost); // a string of frozen drool
      // the near arm: the cleaver raised in its fist
      limb(g, 30, 17, 36, 25, 3, 2.4, sk); limb(g, 36, 25, 41, 22 + w * 0.4, 2.4, 2, sl);
      g.save(); g.translate(41.6, 21.6 + w * 0.4); g.rotate(-0.5);
      P.line(g, -2.4, 1.6, 0.8, 0, 1, '#3a2a1a');
      P.path(g, [0.4, -1.4, 7.4, -3.4, 8.2, 2.6, 1, 2.6]); P.fill(g, P.lg(g, 0, -3.4, 0, 2.6, ['#c8d0d8', '#8a929c', '#4a4e56']));
      P.line(g, 1, 2.4, 8.2, 2.4, 0.4, '#e8f0f8'); P.circle(g, 6.2, -1.2, 0.6, '#1a1a1e'); P.path(g, [3, 2.6, 4.6, 2.6, 3.8, 3.6]); P.fill(g, '#6a1010');
      g.restore();
      P.circle(g, 41, 22.2 + w * 0.4, 1.6, P.vol(g, 40.4, 21.6 + w * 0.4, 1.6, sk));
    } });

  /* ---------- Gilded Ooze (treasure): a glossy blob of molten gold with a greedy grin, coins, a goblet and a skull sunk in it,
   *            drips running down its sides ---------- */
  def('gildedooze', { w: 24, h: 22, cy: 16, frames: 2,
    colors: { gold: '#e8b830', core: '#fff4a0' },
    draw(g, f, c) {
      const gd = c.gold, gl = sh(gd, 0.5), gk = sh(gd, -0.5), sq = f ? 0.8 : 0;
      P.ell(g, 12, 20.8, 10, 1.2, 'rgba(0,0,0,0.45)');
      // the body: a heavy glossy dome, slumping at the base
      g.beginPath(); g.moveTo(2.4 - sq, 20.4); g.bezierCurveTo(1.6, 12, 5, 4 + sq, 12, 4 + sq); g.bezierCurveTo(19, 4 + sq, 22.4, 12, 21.6 + sq, 20.4); g.closePath();
      P.fill(g, P.lg(g, 4, 4, 18, 21, [gl, gd, gk]));
      // things sunk in it, seen through the gold
      g.save(); g.globalAlpha = 0.8;
      P.coin(g, 7, 15, 1.6, 0.5); P.coin(g, 16.6, 16.6, 1.4, 1); P.coin(g, 10.6, 18, 1.2, 0.7);
      P.path(g, [5.4, 9.6, 8.4, 9.6, 7.6, 11.6, 7.2, 13.2, 8.2, 13.6, 5.6, 13.6, 6.6, 13.2, 6.2, 11.6]); P.fill(g, sh(gk, -0.2)); // a goblet
      P.circle(g, 13.4, 16.4, 1.5, sh(gk, -0.2)); P.circle(g, 13, 16.2, 0.4, gd); P.circle(g, 14, 16.2, 0.4, gd); // a skull
      g.restore();
      // the grin and the eyes
      P.ell(g, 14.2, 9.6, 1.6, 1.7, '#3a1a04'); P.ell(g, 18.2, 9.8, 1.5, 1.6, '#3a1a04');
      evil(g, 14.3, 9.8, 0.9, c.core); evil(g, 18.2, 10, 0.85, c.core); P.line(g, 12.6, 7.6, 15.6, 8.6, 0.6, '#3a1a04'); P.line(g, 16.8, 8.6, 19.8, 7.8, 0.6, '#3a1a04'); // brows knitted in greed P.glow(g, 16, 10, 3, c.core, 0.4);
      g.beginPath(); g.moveTo(11.8, 12.4); g.quadraticCurveTo(16.4, 17.4 + sq * 0.5, 21, 12); g.quadraticCurveTo(16.6, 13.8, 11.8, 12.4); g.closePath(); P.fill(g, '#3a1a04');
      teeth(g, 12.8, 12.9, 20.2, 12.5, 6, 0.9, 1, c.core);
      // the gloss and the drips
      P.ell(g, 8, 7.6 + sq, 3, 1.4, G.rgba('#ffffff', 0.55), -0.5); P.ell(g, 5.4, 11, 0.7, 1.4, G.rgba('#ffffff', 0.35), -0.2);
      for (const [x, y, l] of [[4, 14, 4], [20.4, 14, 4.2 + sq]]) { P.line(g, x, y, x, y + l, 0.7, gd); P.circle(g, x, y + l, 0.7, gl); }
    } });

  Object.assign(P, { horn, cracks, barnacles, icicle, crystal, drips, coin }); // shared helpers
})(window.DH);
