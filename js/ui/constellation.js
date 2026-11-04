/* The Constellation's screen: the tree of stars on a canvas that pans and zooms, a star's window to raise it, the
 * bonuses it gives, the Specialties of each branch and the free reset. The tree itself: js/data/constellation.js. */
(function (DH) {
  'use strict';
  const U = DH.util, h = U.h, E = DH.economy, A = DH.art, ui = DH.ui, M = DH.meta;
  const click = () => DH.audio.play('click');
  const TAU = Math.PI * 2;
  /** Each star is the medal of what it gives (icons.js, cs_<stat>: the Blessing's own medal); the heart the Constellation's. */
  const ICONS = {};
  const iconOf = (name) => { let im = ICONS[name]; if (!im) { im = ICONS[name] = new Image(); im.src = DH.icons.hi(name, name === 'u_cons' ? 256 : 160); } return im; }; // drawn large: sharp at any zoom
  /** A star's icon greyed (locked) or dimmed (open), made once: a canvas filter on every star in every frame cost a
   *  slow phone seconds a frame (and every tap waited for the frame). */
  const SHADE = { locked: 'grayscale(0.85) brightness(0.45)', open: 'grayscale(0.3) brightness(0.8)' }, SHADED = {};
  const shadedOf = (name, st) => {
    const im = iconOf(name); if (!SHADE[st]) return im;
    if (!(im.complete && im.naturalWidth)) return im;
    const k = name + '|' + st; let c = SHADED[k];
    if (!c) {
      c = SHADED[k] = DH.gfx.canvas(im.naturalWidth, im.naturalHeight); const g = c.getContext('2d');
      if ('filter' in g) { g.filter = SHADE[st]; g.drawImage(im, 0, 0); g.filter = 'none'; } else { g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = st === 'locked' ? 'rgba(20,18,24,0.6)' : 'rgba(20,18,24,0.25)'; g.fillRect(0, 0, c.width, c.height); }
    }
    return c;
  };
  const ZMIN = 0.15, ZMAX = 1.6;
  const radius = (n, z) => Math.max(4, n.r * z); // stars keep their size in the world, so the spacing holds at every zoom
  const BRANCHES = ['fury', 'bastion', 'plunder'];
  /** Each branch's sign: the Blessing medal nearest its nature (claws for Fury, the shield for Bastion, the coin for Plunder). */
  const BR_ICON = { fury: 'bl_brutality', bastion: 'bl_thickhide', plunder: 'bl_greed' };

  /* The night behind the stars, in depth: a far haze of nebulae and a band of the galaxy (drawn once on a wrapping tile),
   * then three layers of stars, the farther the smaller, dimmer and slower to move when the map is dragged (parallax);
   * stars of many colours that twinkle, the brightest with a soft halo and four fine rays, now and then a falling star. */
  const SKY = (() => {
    let sd = 4242; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    const T = 768, G = DH.gfx, neb = G.canvas(T, T), g = neb.getContext('2d');
    g.fillStyle = '#04030a'; g.fillRect(0, 0, T, T);
    const blob = (x, y, rad, col, a) => { for (const dx of [-T, 0, T]) for (const dy of [-T, 0, T]) { const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rad); gr.addColorStop(0, G.rgba(col, a)); gr.addColorStop(0.5, G.rgba(col, a * 0.35)); gr.addColorStop(1, G.rgba(col, 0)); g.fillStyle = gr; g.fillRect(x + dx - rad, y + dy - rad, rad * 2, rad * 2); } };
    const COLS = ['#3a1a5a', '#18284a', '#4a1424', '#14303a', '#2a1a40'];
    for (let i = 0; i < 26; i++) blob(r() * T, r() * T, 60 + r() * 170, COLS[i % COLS.length], 0.18 + r() * 0.22);
    // the galaxy's band: a diagonal river of dust and faint stars
    for (let i = 0; i < 1400; i++) {
      const u = r() * T, v = (r() + r() + r() - 1.5) * 70, x = (u + v * 0.6 + T) % T, y = (u * 0.55 + v + T * 1.5) % T;
      g.fillStyle = 'rgba(' + (200 + r() * 55 | 0) + ',' + (190 + r() * 50 | 0) + ',' + (220 + r() * 35 | 0) + ',' + (0.08 + r() * 0.3) + ')'; g.fillRect(x, y, 1, 1);
    }
    for (let i = 0; i < 14; i++) { const u = r() * T; blob((u + T) % T, (u * 0.55 + T * 0.5 + (r() - 0.5) * 60) % T, 50 + r() * 60, '#8a7aa0', 0.05 + r() * 0.05); }
    // dark lanes of dust across it
    for (let i = 0; i < 10; i++) blob(r() * T, r() * T, 40 + r() * 80, '#000000', 0.25);
    const TINTS = ['#ffffff', '#ffffff', '#dfe8ff', '#cfdcff', '#fff4dc', '#ffe0b0', '#ffc8a0', '#ffb0a0'];
    const layers = [{ k: 0.05, n: 340, s: [0.5, 1.1], a: [0.25, 0.6] }, { k: 0.14, n: 150, s: [0.9, 1.7], a: [0.45, 0.85] }, { k: 0.3, n: 45, s: [1.4, 2.6], a: [0.7, 1] }]
      .map((L) => ({ k: L.k, stars: Array.from({ length: L.n }, () => ({ x: r() * 1600, y: r() * 1600, s: L.s[0] + r() * (L.s[1] - L.s[0]), a: L.a[0] + r() * (L.a[1] - L.a[0]), c: TINTS[r() * TINTS.length | 0], tw: 0.6 + r() * 2.4, ph: r() * 6.3 })) }));
    // a soft halo for the bright ones
    const halo = G.canvas(32, 32), hg = halo.getContext('2d'), hr = hg.createRadialGradient(16, 16, 0, 16, 16, 16);
    hr.addColorStop(0, 'rgba(255,255,255,0.9)'); hr.addColorStop(0.2, 'rgba(220,230,255,0.35)'); hr.addColorStop(1, 'rgba(200,210,255,0)'); hg.fillStyle = hr; hg.fillRect(0, 0, 32, 32);
    return { T, neb, layers, halo };
  })();
  const drawSky = (g, W, H, view, now, fall) => {
    const T = SKY.T, ox = -((view.x * 0.02 % T) + T) % T, oy = -((view.y * 0.02 % T) + T) % T;
    for (let x = ox; x < W; x += T) for (let y = oy; y < H; y += T) g.drawImage(SKY.neb, x, y);
    const z = Math.min(1.6, Math.max(0.6, view.z * 1.6));
    for (const L of SKY.layers) {
      const P = 1600, sx = -view.x * L.k, sy = -view.y * L.k;
      for (const st of L.stars) {
        const x = ((st.x + sx) % P + P) % P - (P - W) / 2, y = ((st.y + sy) % P + P) % P - (P - H) / 2;
        if (x < -4 || y < -4 || x > W + 4 || y > H + 4) continue;
        const a = st.a * (0.72 + 0.28 * Math.sin(now * st.tw + st.ph)), s = st.s * (1 + (z - 1) * L.k * 2);
        g.globalAlpha = a; g.fillStyle = st.c;
        if (s < 1.3) g.fillRect(x, y, s, s);
        else {
          g.drawImage(SKY.halo, x - s * 3, y - s * 3, s * 6, s * 6);
          g.beginPath(); g.arc(x, y, s * 0.55, 0, TAU); g.fill();
          if (s > 2) { g.globalAlpha = a * 0.45; g.fillRect(x - s * 3, y - 0.4, s * 6, 0.8); g.fillRect(x - 0.4, y - s * 3, 0.8, s * 6); }
        }
      }
    }
    g.globalAlpha = 1;
    if (fall && fall.t < fall.life) { // a falling star
      const k = fall.t / fall.life, x = fall.x + fall.dx * k, y = fall.y + fall.dy * k, gr = g.createLinearGradient(x, y, x - fall.dx * 0.25, y - fall.dy * 0.25);
      gr.addColorStop(0, 'rgba(255,250,235,' + (1 - k) + ')'); gr.addColorStop(1, 'rgba(255,250,235,0)');
      g.strokeStyle = gr; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x - fall.dx * 0.25, y - fall.dy * 0.25); g.stroke();
    }
  };

  ui.openConstellation = () => {
    const CS = E.CONST; CS.place(); // the stars' places, worked out the first time the sky opens
    const knob = h('i'), slider = h('div.cons-slide', { 'aria-label': 'zoom' }, h('b.btn.small', '+'), h('div.cons-track', knob), h('b.btn.small', '−'));
    const corner = h('div.cons-corner', // bottom right, in the sky: the Pit's shop and the hero's stats
      h('button.cons-cb', { 'aria-label': t('pitshop.title'), onclick: (e) => { e.stopPropagation(); click(); ui.openPitShop(); } }, A.img('i_essence'), h('span', t('pit.shop')), M.pitFreeReady() ? h('span.badge', '!') : null),
      h('button.cons-cb', { 'aria-label': t('cons.stats'), onclick: (e) => { e.stopPropagation(); click(); ui.openHeroStats(DH.save.data.selectedHero); } }, A.img('n_scroll'), h('span', t('cons.stats'))));
    ['pointerdown', 'pointerup', 'wheel'].forEach((ev) => corner.addEventListener(ev, (e) => e.stopPropagation()));
    const cv = h('canvas.cons-cv'), wrap = h('div.cons-map', cv, slider, corner);
    const head = h('div.cons-head'), loads = h('div.cons-load'), foot = h('div.cons-foot');
    const m = ui.modal({ title: t('cons.title'), cls: 'consw', body: () => h('div.cons-body', head, loads, wrap, foot), dock: false, onClose: () => { alive = false; DH.events.off('meta', redrawAll); } });
    let alive = true;
    // the view: world point at the centre of the canvas, and the zoom
    const view = { x: 0, y: -120, z: 0.42 };
    const redrawAll = () => { if (!alive) return; drawHead(); drawLoads(); draw(); renderPop(); };
    // ---- loadouts: the one in use (a list), rename, a new one, load it again, delete
    const loadName = (n, i) => n || t('cons.loadN', { n: i + 1 });
    const drawLoads = () => {
      const L = M.consLoadouts();
      const sel = h('select.cons-sel', { 'aria-label': t('cons.loadout'), onchange: async (e) => { click(); const r = await ui.act('consLoadPick', { i: +e.target.value }); after(r); } },
        L.list.map((n, i) => { const o = h('option', { value: i }, loadName(n, i)); if (i === L.cur) o.selected = true; return o; }));
      loads.replaceChildren(h('span.cons-ll', t('cons.loadout')), sel,
        h('button.btn.small.ghost.cl-b', { 'aria-label': t('cons.loadRename'), onclick: () => { click(); rename(L.cur, L.list[L.cur]); } }, '✎'),
        h('button.btn.small.ghost.cl-b' + (L.list.length < M.CONS_LOADOUTS ? '' : '.off'), { 'aria-label': t('cons.loadNew'), onclick: async () => { click(); after(await ui.act('consLoadNew')); } }, '+'),
        h('button.btn.small.gold.cl-b', { 'aria-label': t('cons.loadAgain'), onclick: async () => { click(); after(await ui.act('consLoadAgain')); } }, '⟳'),
        h('button.btn.small.red.cl-b' + (L.list.length > 1 ? '' : '.off'), { 'aria-label': t('cons.loadDelete'), onclick: async () => {
          click(); if (!(await ui.confirm({ title: t('cons.loadDelete'), body: t('cons.loadDeleteBody', { n: loadName(L.list[L.cur], L.cur) }), ok: t('cons.loadDelete'), okCls: 'red' }))) return;
          after(await ui.act('consLoadDelete', { i: L.cur }));
        } }, '✕'));
    };
    const after = (r) => { if (!r) return; closeStar(); DH.audio.play('coin'); if (!r.full) ui.toast(t('cons.loadPartial'), 'bad'); redrawAll(); };
    const rename = (i, cur) => {
      const inp = h('input.field', { type: 'text', maxLength: 20, value: cur || '', placeholder: loadName(null, i) });
      ui.modal({ title: t('cons.loadRename'), cls: 'consren', body: (rm) => h('div', inp, h('div.btns',
        h('button.btn.ghost', { onclick: () => rm.close() }, t('common.cancel')),
        h('button.btn.gold', { onclick: async () => { const r = await ui.act('consLoadName', { i, name: inp.value }); if (r) { rm.close(); drawLoads(); } } }, t('common.save')))) });
      setTimeout(() => inp.focus(), 50);
    };
    DH.events.on('meta', redrawAll);

    const drawHead = () => {
      head.replaceChildren(
        h('div.cons-ess', A.img('i_essence', 'ci'), h('b', U.fmt(M.essence()))),
        h('div.cons-brs', BRANCHES.map((b) => {
          const p = M.consPoints(b), next = CS.specials[b].find((v) => v > p), prev = [0].concat(CS.specials[b]).filter((v) => v <= p).pop();
          const k = next ? (p - prev) / (next - prev) : 1;
          return h('div.cons-br.' + b, h('div.cons-brt', A.img(BR_ICON[b], 'ci'), h('b', p), h('span.small', next ? ' / ' + next : ' ✓')), h('div.cons-bar', h('i', { style: { width: Math.round(k * 100) + '%' } })));
        })));
    };
    foot.append(
      h('button.btn.small.ghost', { onclick: () => { click(); openBonuses(); } }, t('cons.bonuses')),
      h('button.btn.small.ghost', { onclick: () => { click(); openSpecials(); } }, t('cons.specials')),
      h('button.btn.small.red', { onclick: reset }, t('cons.reset')));

    // ---- drawing
    const state = (n) => {
      if (n.kind === 'heart') return 'full';
      const r = M.consRank(n.id);
      if (r >= n.max) return 'full';
      if (r > 0) return 'part';
      return M.consOpen(n.id) ? 'open' : 'locked';
    };
    let W = 0, H = 0, dpr = 1, lastT = 0, fall = null;
    const fit = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1); // the box's own size (its rectangle is scaled while the window pops open)
      W = Math.max(50, wrap.clientWidth); H = Math.max(50, wrap.clientHeight);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    };
    const toScreen = (x, y) => [(x - view.x) * view.z + W / 2, (y - view.y) * view.z + H / 2];
    const draw = () => {
      if (!alive) return;
      const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const tnow = performance.now() / 1000, dt = Math.min(0.1, tnow - (lastT || tnow)); lastT = tnow;
      if (fall) fall.t += dt; if (!fall || fall.t > fall.life + 6 + Math.random() * 8) fall = { x: Math.random() * W, y: Math.random() * H * 0.5, dx: (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 120), dy: 60 + Math.random() * 80, t: 0, life: 0.9 };
      drawSky(g, W, H, view, tnow, fall);
      const now = performance.now() / 1000;
      // the lines between stars: bronze where both ends hold ranks, a faint trace elsewhere
      for (const [a, b] of CS.edges) {
        const na = CS.byId[a], nb = CS.byId[b], [x1, y1] = toScreen(na.x, na.y), [x2, y2] = toScreen(nb.x, nb.y);
        const on = (na.kind === 'heart' || M.consRank(a) > 0) && M.consRank(b) > 0;
        g.strokeStyle = on ? 'rgba(201,162,90,0.95)' : 'rgba(130,112,86,0.3)'; g.lineWidth = on ? Math.max(1.5, 4 * view.z) : 1;
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      }
      // the stars
      g.imageSmoothingEnabled = true;
      for (const n of CS.nodes) {
        const [x, y] = toScreen(n.x, n.y), R = radius(n, view.z); if (x < -R - 20 || y < -R - 20 || x > W + R + 20 || y > H + R + 40) continue;
        const col = n.b ? CS.branches[n.b].color : '#c9a25a', st = state(n);
        if (n.kind !== 'heart' && (st === 'full' || st === 'part')) { g.globalAlpha = st === 'full' ? 0.55 : 0.3; g.drawImage(A.glow(col), x - R * 2, y - R * 2, R * 4, R * 4); g.globalAlpha = 1; }
        const iname = n.kind === 'heart' ? 'u_cons' : 'cs_' + n.st[0], im = iconOf(iname);
        if (im.complete && im.naturalWidth) g.drawImage(shadedOf(iname, st), x - R, y - R, R * 2, R * 2); // greyed / dimmed once, not every frame
        if (n.kind === 'heart') continue;
        // the rim: dim when locked, breathing when it can be raised, filling round in the branch's colour as ranks are bought
        const thick = Math.max(1.6, (n.kind === 'minor' ? 3 : 4) * view.z);
        if (st === 'open') { g.lineWidth = thick; g.strokeStyle = 'rgba(232,206,150,' + (0.45 + 0.4 * Math.sin(now * 3.5)) + ')'; g.beginPath(); g.arc(x, y, R + thick * 0.6, 0, TAU); g.stroke(); }
        if (st === 'full' || st === 'part') { const r = st === 'full' ? 1 : M.consRank(n.id) / n.max; g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = thick + 1.2; g.beginPath(); g.arc(x, y, R + thick * 0.6, 0, TAU); g.stroke(); g.strokeStyle = col; g.lineWidth = thick; g.beginPath(); g.arc(x, y, R + thick * 0.6, -Math.PI / 2, -Math.PI / 2 + TAU * r); g.stroke(); }
        if (n.kind === 'hub' || n.kind === 'notable') { g.strokeStyle = st === 'locked' ? 'rgba(120,100,70,0.45)' : 'rgba(201,162,90,0.8)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, R + thick + 3, 0, TAU); g.stroke(); }
        if (view.z > 0.55) { g.fillStyle = st === 'locked' ? 'rgba(170,160,150,0.55)' : st === 'full' ? '#cfe0b8' : '#e8dcc4'; g.font = '700 ' + Math.round(7 + view.z * 6) + 'px sans-serif'; g.textAlign = 'center'; g.fillText(M.consRank(n.id) + '/' + n.max, x, y + R + thick + Math.round(7 + view.z * 6)); }
      }
      if (sel) { const [x, y] = toScreen(sel.x, sel.y), R = radius(sel, view.z); g.strokeStyle = 'rgba(236,217,168,' + (0.6 + 0.4 * Math.sin(now * 5)) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, R + 9, 0, TAU); g.stroke(); }
      placePop();
      // under the heart: all the Essence the stars hold
      const hz = CS.byId.heart, [hx, hy] = toScreen(hz.x, hz.y), HR = radius(hz, view.z) + 96 * view.z, fs = Math.round(U.clamp(22 * view.z, 10, 18)); // in the gap below the heart, between the two lower branches
      const spent = (DH.save.data.cons && DH.save.data.cons.spent) || 0, txt = U.fmt(spent), ess = iconOf('i_essence');
      g.font = '800 ' + fs + 'px sans-serif'; const tw = g.measureText(txt).width, bw = tw + fs + 16, by = hy + HR + 6;
      g.fillStyle = 'rgba(10,8,14,0.82)'; g.strokeStyle = 'rgba(201,162,90,0.7)'; g.lineWidth = 1; g.beginPath(); g.rect(hx - bw / 2, by, bw, fs + 8); g.fill(); g.stroke();
      if (ess.complete && ess.naturalWidth) g.drawImage(ess, hx - bw / 2 + 5, by + 3, fs + 2, fs + 2);
      g.fillStyle = '#ecd9a8'; g.textAlign = 'left'; g.fillText(txt, hx - bw / 2 + fs + 10, by + fs + 2);
      g.font = '700 ' + Math.max(9, Math.round(fs * 0.7)) + 'px sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(232,216,184,0.8)'; g.fillText(t('cons.spentAll'), hx, by - 4);
    };
    let raf = 0; const loop = () => { if (!alive) return; draw(); raf = requestAnimationFrame(loop); }; // the open stars pulse

    // ---- panning and zooming (one finger or the mouse pans, two fingers or the wheel zoom)
    const pts = new Map(); let moved = 0, pinch = null;
    const zoomBy = (k, cx, cy) => {
      const nz = U.clamp(view.z * k, ZMIN, ZMAX), px = cx == null ? W / 2 : cx, py = cy == null ? H / 2 : cy;
      const wx = (px - W / 2) / view.z + view.x, wy = (py - H / 2) / view.z + view.y;
      view.z = nz; view.x = wx - (px - W / 2) / nz; view.y = wy - (py - H / 2) / nz;
      setKnob();
    };
    // the slider on the right: up to come closer, down to see the whole sky (on a log scale)
    const zFrac = (z) => Math.log(z / ZMIN) / Math.log(ZMAX / ZMIN);
    const setKnob = () => { knob.style.top = ((1 - zFrac(view.z)) * 100) + '%'; };
    const track = slider.querySelector('.cons-track');
    const slideTo = (e) => { const r = track.getBoundingClientRect(), f = 1 - U.clamp((e.clientY - r.top) / r.height, 0, 1); zoomBy(ZMIN * Math.pow(ZMAX / ZMIN, f) / view.z); };
    slider.addEventListener('pointerdown', (e) => { e.stopPropagation(); slider.setPointerCapture(e.pointerId); slider.dataset.drag = '1'; slideTo(e); });
    slider.addEventListener('pointermove', (e) => { if (slider.dataset.drag) slideTo(e); });
    const stop = () => { delete slider.dataset.drag; };
    slider.addEventListener('pointerup', stop); slider.addEventListener('pointercancel', stop);
    slider.querySelectorAll('b').forEach((b, i) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); click(); zoomBy(i ? 0.8 : 1.25); }));
    setKnob();
    cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.offsetX, y: e.offsetY }); moved = 0; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: view.z }; } });
    cv.addEventListener('pointermove', (e) => {
      const q = pts.get(e.pointerId); if (!q) return;
      const dx = e.offsetX - q.x, dy = e.offsetY - q.y; q.x = e.offsetX; q.y = e.offsetY;
      if (pts.size === 1) { view.x -= dx / view.z; view.y -= dy / view.z; moved += Math.abs(dx) + Math.abs(dy); }
      else if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y); zoomBy(pinch.z * d / pinch.d / view.z, (a.x + b.x) / 2, (a.y + b.y) / 2); moved = 99; }
    });
    const up = (e) => {
      const q = pts.get(e.pointerId); pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
      if (q && moved < 8 && pts.size === 0) tap(e.offsetX, e.offsetY);
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', (e) => { pts.delete(e.pointerId); pinch = null; });
    cv.addEventListener('wheel', (e) => { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.12 : 0.89, e.offsetX, e.offsetY); }, { passive: false });
    const tap = (sx, sy) => {
      const wx = (sx - W / 2) / view.z + view.x, wy = (sy - H / 2) / view.z + view.y;
      let best = null, bd = Infinity;
      for (const n of CS.nodes) { if (!n.b) continue; const d = Math.hypot(n.x - wx, n.y - wy); if (d < bd) { bd = d; best = n; } }
      if (best && bd * view.z < radius(best, view.z) + 12) { click(); openStar(best); } else closeStar();
    };

    // ---- a star's panel: it stands over the star itself (under it when the star is high), in the branch's colour,
    // with what a rank gives, the total now and after the next, −, the ranks, +, all the way, and the price of the next
    let sel = null;
    const pop = h('div.cons-pop'); pop.style.display = 'none'; wrap.append(pop);
    ['pointerdown', 'pointerup', 'wheel'].forEach((ev) => pop.addEventListener(ev, (e) => e.stopPropagation()));
    const openStar = (n) => { sel = n; renderPop(); placePop(); };
    const closeStar = () => { sel = null; pop.style.display = 'none'; };
    const renderPop = () => {
      const n = sel; if (!n) return;
      const [k, v] = n.st, r = M.consRank(n.id), open = M.consOpen(n.id), cost = M.consNext(n.b), full = r >= n.max;
      const tot = M.consStats()[k] || 0;
      const buy = async (cnt) => { const got = await ui.act('consBuy', { id: n.id, n: cnt }); if (got) { DH.audio.play('buy'); renderPop(); } else if (got === null) ui.toast(open ? t('common.notEnough') : t('cons.locked'), 'bad'); };
      const down = async () => {
        if (!r) return;
        const cnt = M.consLowerCost(n.id), all = cnt > 1; // stars further out hang on this one: they go too, once asked
        if (all && !(await ui.confirm({ title: t('cons.lowerTitle'), body: t('cons.lowerBody', { n: cnt }), ok: t('common.yes'), okCls: 'green', cancel: t('common.no') }))) return;
        const got = await ui.act('consLower', { id: n.id, all }); if (got) { DH.audio.play('coin'); if (got.n > 1) ui.toast(t('cons.lowered', { n: got.n, e: U.fmt(got.back) }), 'good'); renderPop(); }
      };
      pop.className = 'cons-pop ' + n.b + (full ? ' full' : '');
      pop.replaceChildren(
        h('div.cp-head', A.img('cs_' + k, 'ci'), h('b', t('cons.kind.' + n.kind) + ': ' + t('stat.' + k)), h('button.x', { onclick: () => { click(); closeStar(); }, 'aria-label': t('common.close') }, A.img('u_close', 'ci'))),
        h('div.cp-stat', A.img('u_star', 'ci'), ' ', ui.fmtStat(k, v), h('span.muted', ' ' + t('cons.perRankShort'))),
        h('div.cp-tot', '(' + ui.fmtStat(k, tot) + (full ? '' : ' → ') , full ? null : h('span.good', ui.fmtStat(k, tot + v)), ')'),
        h('div.cp-row',
          h('button.btn.small.red.cp-b' + (r ? '' : '.off'), { onclick: down, 'aria-label': t('cons.sell1') }, '−'),
          h('span.cp-r', r + '/' + n.max),
          h('button.btn.small.green.cp-b' + (!full && open && M.essence() >= cost ? '' : '.off'), { onclick: () => { if (!full) buy(1); }, 'aria-label': t('cons.buy1') }, '+'),
          h('button.btn.small.gold.cp-b' + (!full && open && M.essence() >= cost ? '' : '.off'), { onclick: () => { if (!full) buy(n.max - r); }, 'aria-label': t('cons.buyMax') }, '⇈'),
          h('span.cp-cost', full ? h('span.good', t('cons.maxed')) : !open ? h('span.muted', t('cons.lockedShort')) : [A.img('i_essence', 'ci'), h('b' + (M.essence() >= cost ? '' : '.bad'), U.fmt(cost))])));
      pop.style.display = '';
    };
    const placePop = () => {
      if (!sel) return;
      const [x, y] = toScreen(sel.x, sel.y), R = radius(sel, view.z) + 8, pw = pop.offsetWidth || 260, ph = pop.offsetHeight || 110;
      if (x < -R || x > W + R || y < -R || y > H + R) { pop.style.visibility = 'hidden'; return; }
      pop.style.visibility = '';
      const above = y - R - ph - 6 > 4;
      pop.style.left = Math.round(U.clamp(x - pw / 2, 6, W - pw - 40)) + 'px';
      pop.style.top = Math.round(above ? y - R - ph - 6 : Math.min(H - ph - 4, y + R + 6)) + 'px';
    };

    // ---- what it all gives, the Specialties, the reset
    const openBonuses = () => {
      const st = M.consStats(), keys = Object.keys(st);
      ui.modal({ title: t('cons.bonuses'), cls: 'consbon', body: (bm) => h('div',
        keys.length ? h('div.cons-bon', keys.map((k) => h('div', A.img('cs_' + k, 'ci'), ' ', ui.fmtStat(k, st[k])))) : h('div.small.muted.center', t('cons.noBonus')),
        h('div.btns', h('button.btn.gold', { onclick: () => bm.close() }, t('common.close')))) });
    };
    const openSpecials = () => {
      let tab = 'fury';
      const sm = ui.modal({ title: t('cons.specials'), cls: 'consspec', body: () => h('div') });
      const body = () => {
        // every branch's list is laid in the same cell (only the chosen one seen), so the window keeps one height on every tab
        const list = (b) => { const p = M.consPoints(b), have = M.consSpecials()[b]; return h('div.cons-sl' + (b === tab ? '' : '.hid'),
          h('div.small.center.muted.cons-spent', A.img(BR_ICON[b], 'ci'), ' ', t('cons.spentIn', { n: p })),
          CS.specials[b].map((need, i) => h('div.cons-spec' + (i < have ? '.on' : ''), A.img(BR_ICON[b], 'ci'), h('div.cons-need', i < have ? '✓' : need), h('div', t('cons.sp.' + b + (i + 1)))))); };
        sm.set(h('div',
          h('div.tabs', BRANCHES.map((b) => h('button.' + b + (tab === b ? '.on' : ''), { onclick: () => { click(); tab = b; body(); } }, A.img(BR_ICON[b], 'ci'), ' ', t('cons.br.' + b)))),
          h('div.cons-sls', BRANCHES.map(list)),
          h('div.btns', h('button.btn.gold', { onclick: () => sm.close() }, t('common.close')))));
      };
      body();
    };
    async function reset() {
      click();
      const spent = (DH.save.data.cons && DH.save.data.cons.spent) || 0;
      if (!spent) { ui.toast(t('cons.nothing')); return; }
      if (!(await ui.confirm({ title: t('cons.reset'), body: t('cons.resetBody', { n: U.fmt(spent) }), ok: t('cons.reset'), okCls: 'red' }))) return;
      const r = await ui.act('consReset'); if (r) { DH.audio.play('coin'); ui.toast(t('cons.resetDone', { n: U.fmt(r.back) }), 'good'); }
    }

    drawHead(); drawLoads();
    requestAnimationFrame(() => { fit(); loop(); }); setTimeout(fit, 350);
    const onResize = () => { if (!alive) { window.removeEventListener('resize', onResize); return; } fit(); };
    window.addEventListener('resize', onResize);
  };
})(window.DH);
