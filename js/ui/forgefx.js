/* The forge: when relics merge, three alike pieces fly onto the anvil, the hammer strikes three times
 * in a shower of sparks, and the new piece rises in its rarity's light. A tap skips to the end, the next closes. */
(function (DH) {
  'use strict';
  const U = DH.util, h = U.h, E = DH.economy, A = DH.art, ui = DH.ui, t = (k, p) => DH.i18n.t(k, p);

  const W = 360, H = 400, AX = W / 2, AY = 292;   // the scene in CSS pixels; AX/AY: the anvil's face
  const HITS = [1.3, 1.8, 2.3], REVEAL = 2.75;    // seconds: the three blows, then the new piece
  const PIV = { x: W + 14, y: AY + 34 };          // the hammer's handle comes in from the right edge (the smith out of view)
  const HEAD = 26;                                // half the length of the hammer's head
  const LEN = Math.hypot(AX - PIV.x, AY - HEAD - PIV.y), HIT_A = Math.atan2(AY - HEAD - PIV.y, AX - PIV.x);
  const ease = (u) => 1 - (1 - u) * (1 - u);

  /** How far the hammer is raised at time T: 0 on the anvil, 1 high over the shoulder. */
  function raise(T) {
    for (let i = 0; i < HITS.length; i++) {
      const ts = HITS[i], up0 = ts - 0.42, dn0 = ts - 0.09, base = i ? 0.14 : 0.5;
      if (T <= ts) {
        if (T < up0) return base;
        if (T < dn0) return base + (1 - base) * ease((T - up0) / (dn0 - up0));
        const u = (T - dn0) / (ts - dn0); return 1 - u * u; // the blow falls faster and faster
      }
      if (T < ts + 0.08) return 0.14 * Math.sin((T - ts) / 0.08 * Math.PI / 2); // the rebound
    }
    return 0.14 + 0.5 * ease(Math.min(1, (T - HITS[HITS.length - 1] - 0.08) / 0.5));
  }
  const mix = (a, b, k) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = (s) => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k); return 'rgb(' + c(16) + ',' + c(8) + ',' + c(0) + ')'; };

  function drawForge(g, T, flick) {
    // the hearth: a stone arch with the fire roaring inside, its light spilling on the floor
    g.fillStyle = '#120a0e'; g.fillRect(0, 0, W, H);
    const fx = AX, fy = 150, fr = 92 + Math.sin(T * 7) * 2 + flick * 3;
    let gr = g.createRadialGradient(fx, fy + 40, 10, fx, fy + 30, 230);
    gr.addColorStop(0, 'rgba(255,140,50,.45)'); gr.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // bricks around the mouth
    g.save(); g.beginPath(); g.arc(fx, fy, 150, Math.PI, 0); g.lineTo(fx + 150, fy + 110); g.lineTo(fx - 150, fy + 110); g.closePath(); g.clip();
    for (let row = 0; row < 9; row++) for (let col = -1; col < 9; col++) {
      const bx = col * 46 + (row % 2) * 23 - 8, by = 0 + row * 26;
      const lit = Math.max(0, 1 - Math.hypot(bx + 20 - fx, by + 12 - fy) / 190);
      g.fillStyle = mix('#2a1614', '#8a3a1c', lit * (0.75 + flick * 0.25)); g.fillRect(bx + 2, by + 2, 42, 22);
      g.fillStyle = 'rgba(255,200,140,' + (0.12 * lit) + ')'; g.fillRect(bx + 2, by + 2, 42, 3);
    }
    g.restore();
    // the mouth of the fire
    g.save(); g.beginPath(); g.arc(fx, fy + 10, fr, Math.PI, 0); g.lineTo(fx + fr, fy + 100); g.lineTo(fx - fr, fy + 100); g.closePath();
    gr = g.createRadialGradient(fx, fy + 70, 6, fx, fy + 40, fr * 1.25);
    gr.addColorStop(0, '#fff2b0'); gr.addColorStop(0.3, '#ffc048'); gr.addColorStop(0.65, '#f06a1c'); gr.addColorStop(1, '#5a1408');
    g.fillStyle = gr; g.fill(); g.clip();
    for (let i = 0; i < 9; i++) { // tongues of flame licking up
      const x = fx - fr + (i + 0.5) * fr * 2 / 9, hgt = 60 + 34 * Math.sin(T * 6 + i * 1.7) + 20 * Math.sin(T * 11 + i);
      g.fillStyle = i % 2 ? 'rgba(255,230,140,.55)' : 'rgba(255,150,50,.5)';
      g.beginPath(); g.moveTo(x - 16, fy + 100); g.quadraticCurveTo(x - 10, fy + 100 - hgt * 0.6, x + Math.sin(T * 5 + i) * 6, fy + 100 - hgt); g.quadraticCurveTo(x + 10, fy + 100 - hgt * 0.6, x + 16, fy + 100); g.fill();
    }
    g.restore();
    g.strokeStyle = '#1a0c0a'; g.lineWidth = 6; g.beginPath(); g.arc(fx, fy + 10, fr + 3, Math.PI, 0); g.stroke();
    // the floor
    gr = g.createLinearGradient(0, AY + 20, 0, H); gr.addColorStop(0, '#2a1612'); gr.addColorStop(1, '#0c0608'); g.fillStyle = gr; g.fillRect(0, AY + 30, W, H);
    gr = g.createRadialGradient(AX, AY + 60, 10, AX, AY + 60, 200); gr.addColorStop(0, 'rgba(255,120,40,.22)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(0, AY, W, H);
  }

  function drawAnvil(g) {
    const x = AX, y = AY, top = (c) => { g.fillStyle = c; };
    g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.ellipse(x, y + 92, 92, 12, 0, 0, Math.PI * 2); g.fill();
    // the base, the waist and the body
    top('#24202a'); g.beginPath(); g.moveTo(x - 62, y + 92); g.lineTo(x + 62, y + 92); g.lineTo(x + 48, y + 72); g.lineTo(x - 48, y + 72); g.fill();
    top('#2e2a34'); g.beginPath(); g.moveTo(x - 30, y + 74); g.lineTo(x + 30, y + 74); g.lineTo(x + 22, y + 30); g.lineTo(x - 22, y + 30); g.fill();
    // the face and the horn
    const gr = g.createLinearGradient(0, y, 0, y + 32); gr.addColorStop(0, '#5a5664'); gr.addColorStop(0.18, '#3c3844'); gr.addColorStop(1, '#221e28');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 58, y); g.lineTo(x + 70, y); g.lineTo(x + 70, y + 18); g.lineTo(x + 40, y + 32); g.lineTo(x - 40, y + 32); g.lineTo(x - 58, y + 16);
    g.quadraticCurveTo(x - 86, y + 12, x - 108, y + 2); g.quadraticCurveTo(x - 84, y - 1, x - 58, y); g.fill();
    g.fillStyle = 'rgba(255,190,140,.35)'; g.fillRect(x - 58, y, 128, 2); // the worn, bright edge of the face
  }

  function drawHammer(g, r) {
    const a = HIT_A + r * 1.25, hx = PIV.x + Math.cos(a) * LEN, hy = PIV.y + Math.sin(a) * LEN;
    g.save(); g.translate(PIV.x, PIV.y); g.rotate(a);
    g.fillStyle = '#5a3418'; g.fillRect(0, -6, LEN, 12); g.fillStyle = '#8a5a30'; g.fillRect(0, -6, LEN, 4);
    g.restore();
    g.save(); g.translate(hx, hy); g.rotate(a + Math.PI / 2);
    const gr = g.createLinearGradient(-18, 0, 18, 0); gr.addColorStop(0, '#6a6674'); gr.addColorStop(0.4, '#45414e'); gr.addColorStop(1, '#1e1a24');
    g.fillStyle = gr; g.fillRect(-18, -HEAD, 36, HEAD * 2);
    g.fillStyle = '#2a2630'; g.fillRect(-20, -HEAD, 40, 6); g.fillRect(-20, HEAD - 6, 40, 6);
    g.fillStyle = 'rgba(255,200,150,.25)'; g.fillRect(-18, -HEAD + 6, 3, HEAD * 2 - 12);
    g.restore();
  }

  /**
   * Show the forge for one merged piece ({ type, rarity, level? }). Resolves when the player closes it.
   * The pieces that went in are three of the rarity below.
   */
  ui.forgeAnim = (piece) => new Promise((done) => {
    if (!piece) { done(); return; }
    const host = document.getElementById('modals') || document.body;
    const col = E.rarityColor[piece.rarity] || '#ffd060';
    const cv = h('canvas.ffx-cv'), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr;
    const tile = (r, cls) => h('div.slot.rar' + r + (cls || ''), A.img('g_' + piece.type));
    const ins = [0, 1, 2].map(() => tile(Math.max(0, piece.rarity - 1), '.ffx-in'));
    const out = tile(piece.rarity, '.ffx-out');
    const name = h('div.ffx-name.rar' + piece.rarity, h('div', t('gear.' + piece.type)), h('div.rtxt', t('rarity.' + E.rarities[piece.rarity]) + (piece.level ? ' · ' + t('common.lv') + ' ' + piece.level : '')));
    const hint = h('div.ffx-hint', t('forge.skip'));
    const stage = h('div.ffx-stage', cv, ...ins, out);
    const root = h('div.ffx', h('div.ffx-title', t('forge.title')), stage, name, hint);
    host.append(root);
    { const z = Math.min(1, (host.clientWidth - 16) / W, (host.clientHeight - 150) / H); if (z > 0 && z < 1) stage.style.zoom = String(z); } // a small phone: the whole scene shrinks to fit
    const g = cv.getContext('2d');
    let t0 = performance.now(), raf = 0, shown = false, sparks = [], embers = [], shake = 0, flash = 0, lastHit = -1, closed = false;
    const START = [[AX - 112, 74], [AX, 36], [AX + 112, 74]];
    const place = (el, x, y, s, o) => { el.style.transform = 'translate(' + (x - 34) + 'px,' + (y - 34) + 'px) scale(' + s + ')'; el.style.opacity = o; };
    const reveal = () => {
      if (shown) return; shown = true; flash = 1;
      out.classList.add('on'); name.classList.add('on'); hint.textContent = t('forge.tap');
      ins.forEach((el) => { el.style.opacity = 0; });
      DH.audio.play('reward'); DH.audio.vibrate(60);
    };
    const close = () => { if (closed) return; closed = true; cancelAnimationFrame(raf); root.classList.add('out'); setTimeout(() => root.remove(), 220); done(); };
    root.addEventListener('click', () => {
      if (shown) { close(); return; }
      t0 = performance.now() - REVEAL * 1000; lastHit = HITS.length; reveal(); // skip to the new piece
    });
    const frame = (now) => {
      const T = (now - t0) / 1000, dt = 1 / 60;
      // the blows: sparks, a jolt and the clang
      for (let i = lastHit + 1; i < HITS.length; i++) if (T >= HITS[i]) {
        lastHit = i; shake = 7; flash = Math.max(flash, 0.35);
        for (let k = 0; k < 26; k++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, v = 120 + Math.random() * 260; sparks.push({ x: AX + (Math.random() - 0.5) * 20, y: AY - 4, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 0.4 + Math.random() * 0.5 }); }
        DH.audio.play('anvil', i); DH.audio.vibrate(25);
      }
      if (T >= REVEAL) reveal();
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sx = shake ? (Math.random() - 0.5) * shake : 0, sy = shake ? (Math.random() - 0.5) * shake : 0; shake *= 0.82; if (shake < 0.3) shake = 0;
      g.translate(sx, sy);
      drawForge(g, T, Math.random());
      drawAnvil(g);
      // the hot metal on the anvil: from the moment the pieces land until the new one rises
      if (T > 0.95 && !shown) {
        const k = Math.min(1, Math.max(0, (T - 1.0) / (HITS[2] - 1.0))), hot = lastHit >= 0 ? 1 - Math.min(1, (T - HITS[lastHit]) / 0.4) : 0;
        const c = mix('#ffb050', col, k), gr = g.createRadialGradient(AX, AY - 4, 2, AX, AY - 4, 46 + hot * 26);
        gr.addColorStop(0, 'rgba(255,250,220,' + (0.9) + ')'); gr.addColorStop(0.35, c); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.beginPath(); g.arc(AX, AY - 4, 46 + hot * 26, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = 'source-over';
        g.fillStyle = c; g.beginPath(); g.ellipse(AX, AY - 3, 26, 6, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#fff4c8'; g.beginPath(); g.ellipse(AX - 4, AY - 5, 14, 2.5, 0, 0, Math.PI * 2); g.fill();
      }
      // the new piece's light: slow rays turning behind it
      if (shown) {
        g.save(); g.translate(AX, AY - 96); g.rotate(T * 0.5); g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); const gr = g.createLinearGradient(0, 0, 150, 0); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = 0.28; g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.lineTo(150, -14); g.lineTo(150, 14); g.fill(); }
        g.restore(); g.globalAlpha = 1;
      }
      drawHammer(g, shown ? 0.64 : raise(T));
      // embers rising from the fire, sparks falling from the blows
      if (Math.random() < 0.5) embers.push({ x: AX + (Math.random() - 0.5) * 160, y: 240, vy: -30 - Math.random() * 50, l: 1.2 + Math.random() });
      g.globalCompositeOperation = 'lighter';
      embers = embers.filter((e) => (e.l -= dt) > 0); embers.forEach((e) => { e.y += e.vy * dt; e.x += Math.sin(e.y * 0.05) * 0.4; g.fillStyle = 'rgba(255,170,70,' + Math.min(1, e.l) * 0.8 + ')'; g.fillRect(e.x, e.y, 2, 2); });
      sparks = sparks.filter((p) => (p.l -= dt) > 0);
      sparks.forEach((p) => { p.vy += 620 * dt; p.x += p.vx * dt; p.y += p.vy * dt; g.strokeStyle = 'rgba(255,' + (200 + Math.random() * 55 | 0) + ',120,' + Math.min(1, p.l * 2) + ')'; g.lineWidth = 2; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025); g.stroke(); });
      g.globalCompositeOperation = 'source-over';
      if (flash > 0) { g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = 'rgba(255,240,210,' + flash * 0.75 + ')'; g.fillRect(0, 0, W, H); flash = Math.max(0, flash - dt * 2.2); }
      // the three pieces: they hover in, then fly onto the anvil and melt into the metal
      if (!shown) ins.forEach((el, i) => {
        const [x0, y0] = START[i], ap = Math.min(1, T / 0.35), fly = Math.min(1, Math.max(0, (T - 0.55 - i * 0.06) / 0.4)), f = fly * fly;
        place(el, x0 + (AX - x0) * f + sx, y0 + Math.sin(T * 3 + i) * 3 * (1 - fly) + (AY - 8 - y0) * f + sy, (0.6 + 0.4 * ease(ap)) * (1 - 0.7 * f), fly >= 1 ? 0 : ap);
      });
      const since = T - REVEAL, pop = since < 0.28 ? 0.3 + 0.95 * ease(Math.max(0, since) / 0.28) : 1.25 - 0.25 * ease(Math.min(1, (since - 0.28) / 0.25)); // it bursts out, then settles
      place(out, AX + sx, AY - 96 + sy + (shown ? Math.sin(T * 2) * 3 : 0), shown ? pop : 0.3, shown ? 1 : 0);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  });
})(window.DH);
