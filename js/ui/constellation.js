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
  const ZMIN = 0.15, ZMAX = 1.6;
  const radius = (n, z) => Math.max(4, n.r * z); // stars keep their size in the world, so the spacing holds at every zoom
  const BRANCHES = ['fury', 'bastion', 'plunder'];

  ui.openConstellation = () => {
    const CS = E.CONST;
    const knob = h('i'), slider = h('div.cons-slide', { 'aria-label': 'zoom' }, h('b', '+'), h('div.cons-track', knob), h('b', '−'));
    const cv = h('canvas.cons-cv'), wrap = h('div.cons-map', cv, slider);
    const head = h('div.cons-head'), foot = h('div.cons-foot');
    const m = ui.modal({ title: t('cons.title'), cls: 'consw', body: () => h('div.cons-body', head, wrap, foot), dock: false, onClose: () => { alive = false; DH.events.off('meta', redrawAll); } });
    let alive = true;
    // the view: world point at the centre of the canvas, and the zoom
    const view = { x: 0, y: -120, z: 0.42 };
    const redrawAll = () => { if (!alive) return; drawHead(); draw(); };
    DH.events.on('meta', redrawAll);

    const drawHead = () => {
      head.replaceChildren(
        h('div.cons-ess', A.img('i_essence', 'ci'), h('b', U.fmt(M.essence()))),
        h('div.cons-brs', BRANCHES.map((b) => {
          const p = M.consPoints(b), next = CS.specials[b].find((v) => v > p), prev = [0].concat(CS.specials[b]).filter((v) => v <= p).pop();
          const k = next ? (p - prev) / (next - prev) : 1;
          return h('div.cons-br.' + b, h('div.cons-brt', h('b', p), h('span.small', next ? ' / ' + next : ' ✓')), h('div.cons-bar', h('i', { style: { width: Math.round(k * 100) + '%' } })));
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
    let W = 0, H = 0, dpr = 1;
    const fit = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1); // the box's own size (its rectangle is scaled while the window pops open)
      W = Math.max(50, wrap.clientWidth); H = Math.max(50, wrap.clientHeight);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    };
    const toScreen = (x, y) => [(x - view.x) * view.z + W / 2, (y - view.y) * view.z + H / 2];
    const draw = () => {
      if (!alive) return;
      const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = '#07060c'; g.fillRect(0, 0, W, H);
      // a faint field of stars behind
      g.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 90; i++) { const sx = (i * 977 % 1000) / 1000 * W, sy = (i * 571 % 1000) / 1000 * H; g.fillRect(sx, sy, 1, 1); }
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
        const im = iconOf(n.kind === 'heart' ? 'u_cons' : 'cs_' + n.st[0]);
        if (im.complete && im.naturalWidth) {
          if (st === 'locked') g.filter = 'grayscale(0.85) brightness(0.45)'; else if (st === 'open') g.filter = 'grayscale(0.3) brightness(0.8)';
          g.drawImage(im, x - R, y - R, R * 2, R * 2); g.filter = 'none';
        }
        if (n.kind === 'heart') continue;
        // the rim: dim when locked, breathing when it can be raised, filling round in the branch's colour as ranks are bought
        const thick = Math.max(1.6, (n.kind === 'minor' ? 3 : 4) * view.z);
        if (st === 'open') { g.lineWidth = thick; g.strokeStyle = 'rgba(232,206,150,' + (0.45 + 0.4 * Math.sin(now * 3.5)) + ')'; g.beginPath(); g.arc(x, y, R + thick * 0.6, 0, TAU); g.stroke(); }
        if (st === 'full' || st === 'part') { const r = st === 'full' ? 1 : M.consRank(n.id) / n.max; g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = thick + 1.2; g.beginPath(); g.arc(x, y, R + thick * 0.6, 0, TAU); g.stroke(); g.strokeStyle = col; g.lineWidth = thick; g.beginPath(); g.arc(x, y, R + thick * 0.6, -Math.PI / 2, -Math.PI / 2 + TAU * r); g.stroke(); }
        if (n.kind === 'hub' || n.kind === 'notable') { g.strokeStyle = st === 'locked' ? 'rgba(120,100,70,0.45)' : 'rgba(201,162,90,0.8)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, R + thick + 3, 0, TAU); g.stroke(); }
        if (view.z > 0.55) { g.fillStyle = st === 'locked' ? 'rgba(170,160,150,0.55)' : st === 'full' ? '#cfe0b8' : '#e8dcc4'; g.font = '700 ' + Math.round(7 + view.z * 6) + 'px sans-serif'; g.textAlign = 'center'; g.fillText(M.consRank(n.id) + '/' + n.max, x, y + R + thick + Math.round(7 + view.z * 6)); }
      }
      // under the heart: all the Essence the stars hold
      const hz = CS.byId.heart, [hx, hy] = toScreen(hz.x, hz.y), HR = radius(hz, view.z) + 64 * view.z, fs = Math.round(U.clamp(22 * view.z, 10, 18)); // in the gap below the heart, between the two lower branches
      const spent = (DH.save.data.cons && DH.save.data.cons.spent) || 0, txt = U.fmt(spent), ess = iconOf('i_essence');
      g.font = '800 ' + fs + 'px sans-serif'; const tw = g.measureText(txt).width, bw = tw + fs + 16, by = hy + HR + 6;
      g.fillStyle = 'rgba(10,8,14,0.82)'; g.strokeStyle = 'rgba(201,162,90,0.7)'; g.lineWidth = 1; g.beginPath(); g.rect(hx - bw / 2, by, bw, fs + 8); g.fill(); g.stroke();
      if (ess.complete && ess.naturalWidth) g.drawImage(ess, hx - bw / 2 + 5, by + 3, fs + 2, fs + 2);
      g.fillStyle = '#ecd9a8'; g.textAlign = 'left'; g.fillText(txt, hx - bw / 2 + fs + 10, by + fs + 2);
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
      if (best && bd * view.z < radius(best, view.z) + 12) { click(); openStar(best); }
    };

    // ---- a star's window
    const openStar = (n) => {
      const [k, v] = n.st;
      const sm = ui.modal({ title: t('stat.' + k), cls: 'consstar', body: () => h('div') });
      const body = () => {
        const r = M.consRank(n.id), open = M.consOpen(n.id), cost = M.consNext(n.b), full = r >= n.max, back = M.consRefund(n.b);
        const buy = async (cnt) => { const got = await ui.act('consBuy', { id: n.id, n: cnt }); if (got) { DH.audio.play('buy'); body(); } else if (got === null) ui.toast(t('cons.cant'), 'bad'); };
        const down = async () => {
          if (!r) return;
          if (!M.consCanLower(n.id)) { ui.toast(t('cons.holds'), 'bad'); return; }
          const got = await ui.act('consLower', { id: n.id }); if (got) { DH.audio.play('coin'); body(); }
        };
        sm.set(h('div',
          h('div.cons-ico.' + n.b, A.img('cs_' + k)),
          h('div.cons-kind.' + n.b, t('cons.kind.' + n.kind) + ' · ' + t('cons.br.' + n.b)),
          h('div.cons-line', t('cons.perRank'), h('b', ui.fmtStat(k, v))),
          h('div.cons-line', t('cons.now'), h('b', r ? ui.fmtStat(k, v * r) : '—')),
          h('div.cons-line', t('cons.ranks'), h('b', r + ' / ' + n.max)),
          full ? h('div.good.center', t('cons.full')) : open ? h('div.cons-line', t('cons.cost'), h('b', A.img('i_essence', 'ci'), ' ' + U.fmt(cost))) : h('div.small.muted.center', t('cons.locked')),
          r ? h('div.cons-line.small', t('cons.back'), h('b', A.img('i_essence', 'ci'), ' ' + U.fmt(back))) : null,
          h('div.btns.cons-btns',
            h('button.btn.red' + (r ? '' : '.off'), { onclick: down }, t('cons.sell1')),
            h('button.btn.gold' + (!full && open && M.essence() >= cost ? '' : '.off'), { onclick: () => { if (!full && open) buy(1); } }, t('cons.buy1'))),
          !full && open ? h('div.btns', h('button.btn.green' + (M.essence() >= cost ? '' : '.off'), { onclick: () => buy(n.max - r) }, t('cons.buyMax'))) : null,
          h('div.btns', h('button.btn.ghost', { onclick: () => sm.close() }, t('common.close')))));
      };
      body();
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
        const p = M.consPoints(tab), have = M.consSpecials()[tab];
        sm.set(h('div',
          h('div.tabs', BRANCHES.map((b) => h('button.' + b + (tab === b ? '.on' : ''), { onclick: () => { click(); tab = b; body(); } }, t('cons.br.' + b)))),
          h('div.small.center.muted', t('cons.spentIn', { n: p })),
          CS.specials[tab].map((need, i) => h('div.cons-spec' + (i < have ? '.on' : ''), h('div.cons-need', i < have ? '✓' : need), h('div', t('cons.sp.' + tab + (i + 1))))),
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

    drawHead();
    requestAnimationFrame(() => { fit(); loop(); }); setTimeout(fit, 350);
    const onResize = () => { if (!alive) { window.removeEventListener('resize', onResize); return; } fit(); };
    window.addEventListener('resize', onResize);
  };
})(window.DH);
