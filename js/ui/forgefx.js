/* The forge: when relics merge, three alike pieces fly onto the anvil, the hammer strikes three times
 * in a shower of sparks, and the new piece rises in its rarity's light. A tap skips to the end, the next closes.
 * Drawn like the halls themselves: the hearth, fire, anvil and hammer are painters (paint_props.js) on the crypt's
 * own floor, at the world's pixel density, in the dark with the fire's light cut out of it. */
(function (DH) {
  'use strict';
  const U = DH.util, h = U.h, E = DH.economy, A = DH.art, G = DH.gfx, C = DH.content, ui = DH.ui, t = (k, p) => DH.i18n.t(k, p);

  const SW = 180, SH = 200;                        // the scene in world units (two pixels each, like the world)
  const HEARTH = { x: 90, y: 128 }, FIRE = { x: 90, y: 112 }, ANVIL = { x: 90, y: 180 };
  const AX = 94, AY = 136;                         // where the hammer falls on the anvil's face
  const GRIP = { x: AX + 50.4, y: AY - 13.4 };     // the sledge's grip when it lands (its head 50.4 units out, its face 13.4 below the handle)
  const HITS = [1.3, 1.8, 2.3], REVEAL = 2.75;     // seconds: the three blows, then the new piece
  const ease = (u) => 1 - (1 - u) * (1 - u);
  let floorTile = null; // the crypt's paving, painted once (a whole chunk at once: ~50 ms, only the first time)

  /** How far the hammer is raised at time T: 0 on the anvil, 1 high over the shoulder. */
  function raise(T) {
    for (let i = 0; i < HITS.length; i++) {
      const ts = HITS[i], up0 = ts - 0.42, dn0 = ts - 0.09, base = i ? 0.12 : 0.45;
      if (T <= ts) {
        if (T < up0) return base;
        if (T < dn0) return base + (1 - base) * ease((T - up0) / (dn0 - up0));
        const u = (T - dn0) / (ts - dn0); return 1 - u * u; // the blow falls faster and faster
      }
      if (T < ts + 0.08) return 0.12 * Math.sin((T - ts) / 0.08 * Math.PI / 2); // the rebound
    }
    return 0.12 + 0.4 * ease(Math.min(1, (T - HITS[HITS.length - 1] - 0.08) / 0.5));
  }
  const rgb = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mix = (a, b, k) => { const pa = rgb(a), pb = rgb(b); return pa.map((v, i) => Math.round(v * (1 - k) + pb[i] * k)); };

  /** Draw a painter's sprite at a point in units (its own anchor), optionally turned about that anchor. */
  function put(g, name, x, y, frame, rot) {
    const sp = G.sprite(name), n = sp.frames.length, img = sp.frames[(((frame || 0) % n) + n) % n];
    if (!rot) { g.drawImage(img, Math.round((x - sp.ox) * 2) / 2, Math.round((y - sp.oy) * 2) / 2, sp.w, sp.h); return; }
    g.save(); g.translate(x, y); g.rotate(rot); g.drawImage(img, -sp.ox, -sp.oy, sp.w, sp.h); g.restore();
  }

  /**
   * Show the forge for one merged piece ({ type, rarity, level? }). Resolves when the player closes it.
   * The pieces that went in are three of the rarity below.
   */
  ui.forgeAnim = (piece) => new Promise((done) => {
    if (!piece) { done(); return; }
    const host = document.getElementById('modals') || document.body;
    const col = E.rarityColor[piece.rarity] || '#ffd060', rc = rgb(col).join(',');
    const PX = G.CPX, cv = h('canvas.ffx-cv');
    cv.width = SW * PX; cv.height = SH * PX;
    const dark = document.createElement('canvas'); dark.width = cv.width; dark.height = cv.height;
    const tile = (r, cls) => h('div.slot.rar' + r + (cls || ''), A.img('g_' + piece.type));
    const ins = [0, 1, 2].map(() => tile(Math.max(0, piece.rarity - 1), '.ffx-in'));
    const out = tile(piece.rarity, '.ffx-out');
    const name = h('div.ffx-name.rar' + piece.rarity, h('div', t('gear.' + piece.type)), h('div.rtxt', t('rarity.' + E.rarities[piece.rarity]) + (piece.level ? ' · ' + t('common.lv') + ' ' + piece.level : '')));
    const hint = h('div.ffx-hint', t('forge.skip'));
    const stage = h('div.ffx-stage', cv, ...ins, out);
    const root = h('div.ffx', h('div.ffx-title', t('forge.title')), stage, name, hint);
    host.append(root);
    { const z = Math.min(1, (host.clientWidth - 16) / (SW * 2), (host.clientHeight - 150) / (SH * 2)); if (z > 0 && z < 1) stage.style.zoom = String(z); } // a small phone: the whole scene shrinks to fit
    // the crypt's own floor under it all
    const st = C.stages[C.stageOrder[0]], ch = floorTile || (floorTile = G.floor(st.theme, 4242).build(0, 0).canvas);
    const g = cv.getContext('2d'), dg = dark.getContext('2d');
    let t0 = performance.now(), raf = 0, shown = false, sparks = [], embers = [], shake = 0, flash = 0, lastHit = -1, closed = false;
    const START = [[AX - 50, 52], [AX - 4, 34], [AX + 42, 52]];
    const place = (el, x, y, s, o) => { el.style.transform = 'translate(' + (x * 2 - 34) + 'px,' + (y * 2 - 34) + 'px) scale(' + s + ')'; el.style.opacity = o; };
    const reveal = () => {
      if (shown) return; shown = true; flash = 1;
      name.classList.add('on'); hint.textContent = t('forge.tap');
      ins.forEach((el) => { el.style.opacity = 0; });
      DH.audio.play('reward'); DH.audio.vibrate(60);
    };
    const close = () => { if (closed) return; closed = true; cancelAnimationFrame(raf); root.classList.add('out'); setTimeout(() => root.remove(), 220); done(); };
    root.addEventListener('click', () => {
      if (shown) { close(); return; }
      t0 = performance.now() - REVEAL * 1000; lastHit = HITS.length; reveal(); // skip to the new piece
    });
    const snap = (v) => Math.round(v * 2) / 2;
    const frame = (now) => {
      if (closed) return;
      raf = requestAnimationFrame(frame); // asked first: a fault in one frame never freezes the scene
      const T = Math.max(0, (now - t0) / 1000), dt = 1 / 60; // the frame's timestamp can fall just before t0: never a negative time
      // the blows: sparks, a jolt and the clang
      for (let i = lastHit + 1; i < HITS.length; i++) if (T >= HITS[i]) {
        lastHit = i; shake = 3;
        for (let k = 0; k < 22; k++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.8, v = 50 + Math.random() * 110; sparks.push({ x: AX + (Math.random() - 0.5) * 8, y: AY - 1, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 0.35 + Math.random() * 0.45 }); }
        DH.audio.play('anvil', i); DH.audio.vibrate(25);
      }
      if (T >= REVEAL) reveal();
      const sx = shake ? snap((Math.random() - 0.5) * shake) : 0, sy = shake ? snap((Math.random() - 0.5) * shake) : 0; shake *= 0.8; if (shake < 0.4) shake = 0;
      const hot = lastHit >= 0 && !shown ? 1 - Math.min(1, (T - HITS[lastHit]) / 0.35) : 0, flick = Math.random();
      g.setTransform(PX, 0, 0, PX, 0, 0); g.imageSmoothingEnabled = false;
      g.fillStyle = '#000'; g.fillRect(0, 0, SW, SH);
      g.translate(sx, sy);
      g.drawImage(ch, -38, -28, 256, 256);
      put(g, 'forge_fire', FIRE.x, FIRE.y, Math.floor(T * 9));
      put(g, 'forge_hearth', HEARTH.x, HEARTH.y);
      put(g, 'forge_anvil', ANVIL.x, ANVIL.y);
      // the hammer, turned about its grip; the grip rises a little as it is lifted
      const r = shown ? 0.52 : raise(T);
      put(g, 'forge_hammer', GRIP.x + r * 4, GRIP.y - r * 8, 0, r * 1.5);
      // the dark of the smithy, with the fire's light (and the anvil's, and the new piece's) cut out of it
      dg.setTransform(PX, 0, 0, PX, 0, 0); dg.globalCompositeOperation = 'source-over'; dg.clearRect(0, 0, SW, SH);
      dg.fillStyle = 'rgba(' + st.theme.dark.join(',') + ',0.8)'; dg.fillRect(0, 0, SW, SH);
      dg.globalCompositeOperation = 'destination-out';
      const lit = (x, y, rr) => dg.drawImage(A.lightSprite, x - rr, y - rr, rr * 2, rr * 2);
      lit(FIRE.x, FIRE.y - 22, 96 + flick * 4); lit(AX - 4, AY + 8, 62 + hot * 30); if (shown) lit(90, AY - 46, 70);
      g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(dark, 0, 0);
      g.setTransform(PX, 0, 0, PX, 0, 0); g.translate(sx, sy);
      g.globalCompositeOperation = 'lighter';
      g.drawImage(A.glow('rgba(255,130,50,' + (0.45 + flick * 0.08) + ')'), FIRE.x - 60, FIRE.y - 82, 120, 100); // the fire's warmth on the stones
      // the hot metal on the anvil, from the moment the pieces land until the new one rises: it takes the new rarity's colour blow by blow
      if (T > 0.95 && !shown) {
        const k = Math.min(1, Math.max(0, (T - 1.0) / (HITS[2] - 1.0))), c = mix('#ffb050', col, k).join(',');
        g.drawImage(A.glow('rgba(' + c + ',' + (0.6 + hot * 0.4) + ')'), AX - 22 - hot * 10, AY - 14 - hot * 6, 44 + hot * 20, 24 + hot * 12);
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = '#2a1008'; g.fillRect(AX - 9, AY - 2.5, 18, 3);
        g.fillStyle = 'rgb(' + c + ')'; g.fillRect(AX - 8.5, AY - 2.5, 17, 2);
        g.fillStyle = '#fff2c8'; g.fillRect(AX - 6, AY - 2.5, 10, 1);
        g.globalCompositeOperation = 'lighter';
      }
      // the new piece's light: a halo and pixel rays turning slowly behind it
      if (shown) {
        const cx = 90, cy = AY - 46;
        g.drawImage(A.glow('rgba(' + rc + ',0.75)'), cx - 46, cy - 46, 92, 92);
        for (let i = 0; i < 12; i++) {
          const a = i * Math.PI / 6 + T * 0.35, ca = Math.cos(a), sa = Math.sin(a);
          for (let d = 16; d < 46; d += 1.5) { g.fillStyle = 'rgba(' + rc + ',' + (1 - (d - 16) / 30) * 0.55 + ')'; g.fillRect(Math.round(cx + ca * d), Math.round(cy + sa * d), 1, 1); }
        }
      }
      // embers rising from the fire, sparks flying off the blows
      if (Math.random() < 0.6) embers.push({ x: FIRE.x + (Math.random() - 0.5) * 52, y: FIRE.y - 10, vx: (Math.random() - 0.5) * 6, vy: -14 - Math.random() * 22, l: 1.4 + Math.random() * 1.4 });
      embers = embers.filter((e) => (e.l -= dt) > 0 && e.y > -4);
      embers.forEach((e, i) => { e.x += (e.vx + Math.sin(T * 2 + i) * 4) * dt; e.y += e.vy * dt; g.fillStyle = i % 3 ? 'rgba(255,140,50,' + Math.min(1, e.l) * 0.85 + ')' : 'rgba(255,220,120,' + Math.min(1, e.l) + ')'; g.fillRect(snap(e.x), snap(e.y), 0.5, 0.5); });
      sparks = sparks.filter((p) => (p.l -= dt) > 0);
      sparks.forEach((p) => {
        p.vy += 260 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        g.fillStyle = p.l > 0.25 ? '#fff4c0' : '#ffa040'; g.fillRect(snap(p.x), snap(p.y), 1, 1);
        g.fillStyle = 'rgba(255,150,60,0.6)'; g.fillRect(snap(p.x - p.vx * 0.02), snap(p.y - p.vy * 0.02), 0.5, 0.5);
      });
      g.globalCompositeOperation = 'source-over';
      if (flash > 0) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = 'rgba(255,236,200,' + flash * 0.7 + ')'; g.fillRect(0, 0, cv.width, cv.height); flash = Math.max(0, flash - dt * 2.4); }
      // the three pieces: they hover in, then fly onto the anvil and melt into the metal
      if (!shown) ins.forEach((el, i) => {
        const [x0, y0] = START[i], ap = Math.min(1, T / 0.35), fly = Math.min(1, Math.max(0, (T - 0.55 - i * 0.06) / 0.4)), f = fly * fly;
        place(el, x0 + (AX - x0) * f + sx, y0 + Math.sin(T * 3 + i) * 1.5 * (1 - fly) + (AY - 4 - y0) * f + sy, (0.6 + 0.4 * ease(ap)) * (1 - 0.7 * f), fly >= 1 ? 0 : ap);
      });
      const since = T - REVEAL, pop = since < 0.28 ? 0.3 + 0.95 * ease(Math.max(0, since) / 0.28) : 1.25 - 0.25 * ease(Math.min(1, (since - 0.28) / 0.25)); // it bursts out, then settles
      place(out, 90 + sx, AY - 46 + sy + (shown ? Math.sin(T * 2) * 1.5 : 0), shown ? pop : 0.3, shown ? 1 : 0);
    };
    raf = requestAnimationFrame(frame);
  });
})(window.DH);
