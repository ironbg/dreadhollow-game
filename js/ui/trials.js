/* Trials: the window of game modes (arches to choose from), the Pit's own screen and its results. */
(function (DH) {
  'use strict';
  const U = DH.util, h = U.h, E = DH.economy, A = DH.art, ui = DH.ui, M = DH.meta;
  const click = () => DH.audio.play('click');

  /** The modes, in their arches: the Pit, the Dungeon (open once the third hall is cleared), and one announced. */
  const MODES = [
    { id: 'pit', art: 'abyss', open: () => true },
    { id: 'dungeon', art: 'catacombs', open: () => M.dunUnlocked(), lock: () => t('trials.dungeon.lock', { hall: t('stage.' + E.DUNGEON.unlock + '.name') }), go: () => ui.openDungeon() },
    { id: 'soon2', art: 'discord', open: () => false },
  ];
  const arts = {};
  // each picture painted once and kept on the device (with the game's version: a new version may paint them anew), so the
  // Trials open at once; ui.trialsWarm paints the missing ones while the menus are idle
  const ART_KEY = (id) => 'dh_trart_' + id + '_' + DH.VERSION;
  const stored = (id) => { try { return localStorage.getItem(ART_KEY(id)); } catch (e) { return null; } };
  const art = (m) => {
    if (arts[m.id]) return arts[m.id];
    let url = stored(m.id);
    if (!url) {
      url = m.id === 'pit' ? pitArt() : m.id === 'dungeon' ? ui.dunArt() : A.stageArt(m.art, 240, 360).toDataURL('image/jpeg', 0.85);
      try { localStorage.setItem(ART_KEY(m.id), url); } catch (e) { /* storage full or blocked: painted again next time */ }
    }
    return (arts[m.id] = url);
  };
  /** Paint the Trials' pictures one by one when the device has nothing else to do (the menus, a few seconds after start). */
  ui.trialsWarm = () => {
    const idle = window.requestIdleCallback || ((f) => setTimeout(() => f({ timeRemaining: () => 50 }), 200));
    const next = (i) => { if (i >= MODES.length) return; idle(() => { if (DH.game && DH.game.mode === 'run') return setTimeout(() => next(i), 5000); art(MODES[i]); next(i + 1); }, { timeout: 8000 }); };
    next(0);
  };

  /** The Pit's picture, painted small and shown in big pixels like the rest of the game: a sky of smoke over black
   *  spires; the pit, a round shaft of stone courses sinking to a floor of fire; chains hanging into it; an iron fence of
   *  spikes on its far rim; braziers burning to either side; embers rising. */
  const pitArt = () => {
    const G = DH.gfx, P = G.P, W = 120, H = 180, c = G.canvas(W, H), g = c.getContext('2d');
    let sd = 777; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    // the sky and the black city on the horizon
    g.fillStyle = P.lg(g, 0, 0, 0, 70, ['#160610', '#2a0a10', '#3a1010']); g.fillRect(0, 0, W, 70);
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(80,30,30,' + (0.12 + r() * 0.12) + ')'; g.beginPath(); g.ellipse(r() * W, 15 + r() * 40, 20 + r() * 25, 5 + r() * 6, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#07030a';
    for (let x = -4; x < W + 4;) { const w = 6 + r() * 10, hh = 6 + r() * 18; g.fillRect(x, 58 - hh, w, hh + 14); if (r() < 0.6) { g.beginPath(); g.moveTo(x, 58 - hh); g.lineTo(x + w / 2, 58 - hh - 8 - r() * 10); g.lineTo(x + w, 58 - hh); g.fill(); } x += w + r() * 4; }
    P.circle(g, 92, 18, 7, 'rgba(230,120,90,0.55)'); P.circle(g, 92, 18, 5, '#e8a080'); // a blood moon
    // the ground: dark flagstones running away
    g.fillStyle = P.lg(g, 0, 60, 0, H, ['#24161a', '#1a1014', '#0c0709']); g.fillRect(0, 60, W, H - 60);
    g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 1;
    for (let y = 64, k = 0; y < H; y += 4 + k, k += 0.6) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(W / 2 + i * 6, 60); g.lineTo(W / 2 + i * 26, H); g.stroke(); }
    // the pit: seen from above and in front, its far wall shows inside the rim as courses of stone, each smaller, lower
    // and darker going down (their near edges hide behind the lip), to a floor of fire far below
    const cx = W / 2, cy = 104, rx = 46, ry = 18, N = 16;
    for (let k = 0; k <= N; k++) {
      const s2 = Math.pow(0.86, k), y = cy + ry * (1 - s2) * 0.92, l = Math.max(4, 58 - k * 4.2), warm = Math.min(1, k / N) * 26;
      g.fillStyle = 'rgb(' + (l + 10 + warm | 0) + ',' + (l * 0.72 + 4 | 0) + ',' + (l * 0.72 + 6 | 0) + ')'; g.beginPath(); g.ellipse(cx, y, rx * s2, ry * s2, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.6)'; g.beginPath(); g.ellipse(cx, y, rx * s2, ry * s2, 0, Math.PI * 1.02, Math.PI * 1.98); g.stroke();
      for (let j = 0; j < 12; j++) { const a2 = Math.PI * 1.05 + (j + (k % 2) * 0.5) / 12 * Math.PI * 0.9, x2 = cx + Math.cos(a2) * rx * s2, y2 = y + Math.sin(a2) * ry * s2; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(x2, y2, 1, Math.max(1, 2.4 * s2 + 0.6)); }
    }
    const fs = Math.pow(0.86, N), fy = cy + ry * (1 - fs) * 0.92, fire = g.createRadialGradient(cx, fy, 0.5, cx, fy, rx * fs * 1.3);
    fire.addColorStop(0, '#fff0b0'); fire.addColorStop(0.3, '#ff9a30'); fire.addColorStop(0.7, '#b02010'); fire.addColorStop(1, 'rgba(60,0,0,0)');
    g.fillStyle = fire; g.beginPath(); g.ellipse(cx, fy, rx * fs * 1.3, ry * fs * 1.3, 0, 0, Math.PI * 2); g.fill();
    g.save(); g.globalCompositeOperation = 'lighter'; const up = g.createRadialGradient(cx, fy, 1, cx, fy, rx * 0.9);
    up.addColorStop(0, 'rgba(255,110,40,0.4)'); up.addColorStop(1, 'rgba(255,60,20,0)'); g.fillStyle = up; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.restore();
    // the rim: coping stones, the near lip lit red from below
    g.lineWidth = 3; g.strokeStyle = '#0a0608'; g.beginPath(); g.ellipse(cx, cy, rx + 2, ry + 1, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2; g.strokeStyle = '#6a5a5a'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI * 2); g.stroke();
    g.strokeStyle = '#c0502a'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0.1, Math.PI - 0.1); g.stroke();
    // the iron fence on the far rim
    for (let j = 1; j < 16; j++) { const a = Math.PI + j / 16 * Math.PI, x2 = cx + Math.cos(a) * (rx + 3), y2 = cy + Math.sin(a) * (ry + 2); g.fillStyle = '#050305'; g.fillRect(x2 - 0.5, y2 - 9, 1.4, 9); g.beginPath(); g.moveTo(x2 - 1.5, y2 - 9); g.lineTo(x2 + 0.2, y2 - 13); g.lineTo(x2 + 1.8, y2 - 9); g.fill(); }
    g.fillStyle = '#050305'; for (let j = 0; j <= 16; j++) { const a = Math.PI + j / 16 * Math.PI; if (j) { const a0 = Math.PI + (j - 1) / 16 * Math.PI; g.beginPath(); g.moveTo(cx + Math.cos(a0) * (rx + 3), cy + Math.sin(a0) * (ry + 2) - 6); g.lineTo(cx + Math.cos(a) * (rx + 3), cy + Math.sin(a) * (ry + 2) - 6); g.lineWidth = 1; g.strokeStyle = '#050305'; g.stroke(); } }
    // chains hanging into the pit from above
    for (const [x0, len] of [[cx - 22, 70], [cx + 6, 88], [cx + 26, 62]]) for (let y = 0; y < len; y += 3) { g.fillStyle = (y / 3) % 2 ? '#4a4044' : '#2a2226'; g.fillRect(x0 + Math.sin(y * 0.05) * 1.5, y, 2, 3); }
    // braziers to either side, burning
    for (const bx of [14, W - 14]) {
      const by = 132;
      g.fillStyle = '#0a0608'; g.fillRect(bx - 1, by, 2, 22); g.fillRect(bx - 6, by + 20, 12, 2);
      g.fillStyle = '#3a3034'; g.beginPath(); g.moveTo(bx - 8, by - 4); g.lineTo(bx + 8, by - 4); g.lineTo(bx + 5, by + 2); g.lineTo(bx - 5, by + 2); g.fill();
      g.save(); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(bx, by - 10, 1, bx, by - 10, 26); gl.addColorStop(0, 'rgba(255,150,60,0.7)'); gl.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gl; g.fillRect(bx - 28, by - 38, 56, 56); g.restore();
      g.fillStyle = '#ff7a20'; g.beginPath(); g.moveTo(bx - 6, by - 4); g.quadraticCurveTo(bx - 4, by - 16, bx, by - 22); g.quadraticCurveTo(bx + 4, by - 14, bx + 6, by - 4); g.fill();
      g.fillStyle = '#ffd890'; g.beginPath(); g.moveTo(bx - 3, by - 4); g.quadraticCurveTo(bx, by - 13, bx + 3, by - 4); g.fill();
    }
    // skulls and bones on the stones
    // embers rising out of the pit
    for (let i = 0; i < 40; i++) { const x2 = cx + (r() - 0.5) * rx * 1.6, y2 = 30 + r() * 90; g.fillStyle = r() < 0.5 ? '#ffb050' : '#ff6a30'; g.fillRect(x2, y2, 1, 1); }
    // the dark at the edges
    const v = g.createRadialGradient(cx, 100, 30, cx, 100, 120); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
    const id = g.getImageData(0, 0, W, H); G.quantize(id, { dither: 6, sat: 0.95, contrast: 1.08 }); g.putImageData(id, 0, 0);
    return c.toDataURL();
  };

  /** The Trials: three arches side by side, the chosen one in the middle, its name under them, and Enter. */
  ui.openTrials = (start) => {
    let i = Math.max(0, MODES.findIndex((m) => m.id === start));
    const m = ui.modal({ title: t('trials.title'), cls: 'trials wide', body: () => h('div') });
    const go = (d) => { click(); i = (i + d + MODES.length) % MODES.length; draw(); };
    const arch = (k, side) => {
      const md = MODES[(i + k + MODES.length) % MODES.length];
      const open = md.open();
      return h('div.tr-arch' + (side ? '.side' : '.mid') + (open ? '' : '.soon'), { onclick: () => { if (side) go(k); } },
        h('img', { src: art(md), alt: '' }), open ? null : h('div.tr-soon', A.img('u_lock', 'ci'), h('span', md.lock ? md.lock() : t('trials.soon'))));
    };
    const draw = () => {
      const md = MODES[i];
      m.set(h('div',
        h('div.center.small.muted', t('trials.sub')),
        h('div.tr-hall', arch(-1, true), arch(0, false), arch(1, true)),
        h('div.tr-name', h('button.tr-arrow', { onclick: () => go(-1), 'aria-label': '<' }, '◀'), h('span', t('trials.' + md.id)), h('button.tr-arrow', { onclick: () => go(1), 'aria-label': '>' }, '▶')),
        h('div.small.center.tr-desc', t('trials.' + md.id + '.desc')),
        h('div.btns', md.open() ? h('button.btn.red', { onclick: () => { click(); m.close(); if (md.go) md.go(); else ui.openPit(); } }, t('trials.enter'))
          : h('button.btn.ghost.off', md.lock ? md.lock() : t('trials.soon')))));
    };
    draw();
  };

  /** The Pit: best wave, checkpoint, what entering pays, the hazards, today's entries; Sweep and Enter. */
  ui.openPit = () => {
    const m = ui.modal({ title: t('pit.name'), cls: 'pitwin', body: () => h('div'), onClose: () => DH.events.off('meta', redraw) });
    const redraw = () => { if (!m.closed) draw(); };
    DH.events.on('meta', redraw);
    const row = (icon, label, val) => h('div.pit-row', A.img(icon, 'ci'), h('span', label), h('b', val));
    const draw = () => {
      const s = DH.save.data, best = (s.pit && s.pit.best) || 0, cp = M.pitCheckpoint(), per = M.pitPerWave(), left = M.pitLeft(), all = M.pitEntries();
      m.set(h('div',
        h('div.pit-art', h('img', { src: art(MODES[0]), alt: '' }), h('div.pit-ess', A.img('i_essence', 'ci'), h('b', U.fmt(M.essence()))),
          M.pitPass() ? h('div.pit-pass.on', A.img('n_skull', 'ci'), t('pit.passOn')) : null,
          h('button.pit-shopbtn', { 'aria-label': t('pitshop.title'), onclick: () => { click(); ui.openPitShop(); } }, A.img('i_essence'), h('span', t('pit.shop')), M.pitFreeReady() ? h('span.badge', '!') : null)),
        M.pitPass() ? null : h('div.pit-passcard', { onclick: async () => { click(); if (await DH.iap.buy('pitpass')) draw(); } },
          A.img('n_skull', 'ci'), h('div.grow', h('b', t('product.pitpass')), h('div.small', t('pit.passDesc'))), h('span.btn.small.gold', DH.iap.price('pitpass'))),
        h('div.pit-card',
          row('n_trophy', t('pit.best'), U.fmt(best)),
          row('n_pass', t('pit.checkpoint'), U.fmt(cp)),
          h('div.pit-gap'),
          row('i_essence', t('pit.entryPay'), U.fmt(Math.round(cp * per))),
          row('i_essence', t('pit.perWave'), per % 1 ? per.toFixed(1) : U.fmt(per)),
          h('div.pit-fx', A.img('u_agony', 'ci'), h('span', t('pit.randomFx', { n: E.PIT.roll })), h('button.btn.small.ghost.infob', { 'aria-label': t('pit.fxTitle'), onclick: () => { click(); fxInfo(); } }, 'i'))),
        h('div.mact', h('div.small.center.pit-left' + (left ? '' : '.bad'), t('pit.entries', { n: all - left, m: all })),
        h('div.pit-btns',
          h('div.pit-sweep',
            h('button.btn.blue' + (left && best ? '' : '.off'), { onclick: sweep }, sweepN > 1 ? t('pit.sweepN', { n: sweepN }) : t('pit.sweep')),
            h('div.pit-slide' + (left > 1 && best ? '' : '.hide'), h('input', { type: 'range', min: 1, max: Math.max(1, left), step: 1, value: sweepN, 'aria-label': t('pit.sweep'),
              oninput: (e) => { sweepN = +e.target.value; const b = e.target.closest('.pit-sweep').querySelector('.btn'); b.textContent = sweepN > 1 ? t('pit.sweepN', { n: sweepN }) : t('pit.sweep'); } }), h('b', null))),
          h('button.btn.green' + (left ? '' : '.off'), { onclick: () => { if (!left) { ui.toast(t('pit.noEntries'), 'bad'); return; } m.close(); DH.game.startPit(); } }, t('pit.enter'))),
        h('div.small.muted.center.pit-share', best ? t('pit.sweepShare', { v: Math.round(M.pitSweepShare() * 100) }) : ''),
        h('div.pit-more',
          h('button.btn.small.gold', { onclick: () => { click(); ui.openPitMastery(); } }, A.img('u_star', 'ci'), ' ', t('pit.mastery'), M.pitCanRaise() ? h('span.badge', M.pitPointsFree()) : null),
          h('button.btn.small.gold', { onclick: () => { click(); ui.openConstellation(); } }, A.img('i_essence', 'ci'), ' ', t('pit.constellation')),
          h('button.btn.small.gold', { onclick: () => { click(); ui.openBoards(M.boardKey(M.pitBoards()[0])); } }, A.img('n_trophy', 'ci'), ' ', t('lb.short'))))));
      const sl = m.el && m.el.querySelector('.pit-slide input'); if (sl) { const upd = () => { sl.nextSibling.textContent = sl.value; sl.style.setProperty('--f', ((sl.value - 1) / Math.max(1, sl.max - 1) * 100) + '%'); }; sl.addEventListener('input', upd); upd(); }
    };
    let sweepN = 1;
    const sweep = async () => {
      const best = (DH.save.data.pit && DH.save.data.pit.best) || 0;
      if (!best) { ui.toast(t('pit.sweepNone'), 'bad'); return; }
      if (!M.pitLeft()) { ui.toast(t('pit.noEntries'), 'bad'); return; }
      click();
      const n = Math.max(1, Math.min(M.pitLeft(), sweepN));
      const r = await ui.act('pitSweep', { n }); if (!r) return;
      sweepN = 1;
      DH.audio.play('coin'); ui.rewardPopup(r.n > 1 ? t('pit.sweepN', { n: r.n }) : t('pit.sweep'), [{ icon: 'i_essence', text: '+' + U.fmt(r.paid) }]); draw();
      (r.deeds || []).forEach((d, i) => setTimeout(() => ui.toast(t('pit.deedDone', { d: ui.deedText(d) }), 'good'), 600 + i * 900)); // Deeds done by the sweep
    };
    draw();
  };

  /** A Mastery card's ground, drawn small and shown in big pixels like the rest of the game: courses of dark stone tinted
   *  to the card's tier, a pointed-arch niche in the middle (where the icon stands) lit from within in the tier's colour,
   *  two columns at its sides, a rose window above, a plinth below for the cost and the level. One per tier, kept. */
  const TIER_COL = { blue: ['#1a2640', '#090d18', '#6a9ae8'], purple: ['#2a1840', '#0e0716', '#b07ae8'], gold: ['#34260e', '#110b04', '#f0b850'], red: ['#3c1216', '#140405', '#ff6a5a'] };
  const cardArt = {};
  ui.masteryCardArt = (tier) => {
    if (cardArt[tier]) return cardArt[tier];
    const G = DH.gfx, P = G.P, W = 56, H = 68, [c1, c2, glow] = TIER_COL[tier] || TIER_COL.blue;
    const c = G.canvas(W, H), g = c.getContext('2d');
    let seed = tier.length * 977 + tier.charCodeAt(0); const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    g.fillStyle = P.lg(g, 0, 0, 0, H, [c1, c2]); g.fillRect(0, 0, W, H);
    // the stone courses: each block a little lighter or darker, black mortar between
    for (let y = 0, row = 0; y < H; y += 6, row++) for (let x = -(row % 2) * 5; x < W; x += 10) {
      const k = rnd(); g.fillStyle = k < 0.5 ? 'rgba(255,240,220,' + (0.02 + k * 0.05) + ')' : 'rgba(0,0,0,' + (k - 0.5) * 0.35 + ')'; g.fillRect(x + 1, y + 1, 9, 5);
      g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(x, y, 10, 1); g.fillRect(x, y, 1, 6);
    }
    // the niche: a pointed arch, dark inside, the tier's light rising in it
    const ax = W / 2, top = 19, bot = 50, hw = 14;
    const arch = () => { g.beginPath(); g.moveTo(ax - hw, bot); g.lineTo(ax - hw, top + 13); g.quadraticCurveTo(ax - hw, top + 2, ax, top - 2); g.quadraticCurveTo(ax + hw, top + 2, ax + hw, top + 13); g.lineTo(ax + hw, bot); g.closePath(); };
    arch(); g.fillStyle = '#07040a'; g.fill();
    g.save(); arch(); g.clip(); g.fillStyle = P.rg(g, ax, 36, 18, [G.rgba(glow, 0.5), 'rgba(0,0,0,0)']); g.fillRect(0, 0, W, H); g.restore();
    g.lineWidth = 3; g.strokeStyle = '#050308'; arch(); g.stroke();
    g.lineWidth = 2; g.strokeStyle = P.lg(g, 0, top, 0, bot, ['#9a8e88', '#5e5450', '#2e282c']); arch(); g.stroke();
    g.lineWidth = 1; g.strokeStyle = G.rgba(glow, 0.6); g.beginPath(); g.moveTo(ax - hw + 2, bot); g.lineTo(ax - hw + 2, top + 13); g.quadraticCurveTo(ax - hw + 2, top + 4, ax, top + 1); g.quadraticCurveTo(ax + hw - 2, top + 4, ax + hw - 2, top + 13); g.lineTo(ax + hw - 2, bot); g.stroke();
    P.rect(g, ax - 2, top - 4, 4, 4, '#8a7e78'); P.rect(g, ax - 1, top - 4, 2, 1, '#d8ccc0'); // the keystone
    // two columns at its sides, capitals and bases
    for (const x of [ax - hw - 6, ax + hw + 3]) {
      P.rect(g, x - 1, 30, 5, 22, '#050308'); P.rect(g, x, 31, 3, 20, '#5e5450'); P.rect(g, x, 31, 1, 20, '#8a7e78');
      P.rect(g, x - 2, 28, 7, 3, '#050308'); P.rect(g, x - 1, 29, 5, 1, '#9a8e88'); P.rect(g, x - 2, 50, 7, 3, '#050308'); P.rect(g, x - 1, 50, 5, 2, '#6e625e');
    }
    // the plinth below: a dark slab with a lit edge
    P.rect(g, 0, 53, W, 15, 'rgba(0,0,0,0.55)'); P.rect(g, 0, 53, W, 1, 'rgba(255,230,200,0.18)');
    // the frame's own shading: lit top-left, dark bottom-right
    P.rect(g, 0, 0, W, 1, 'rgba(255,240,220,0.18)'); P.rect(g, 0, 0, 1, H, 'rgba(255,240,220,0.12)'); P.rect(g, 0, H - 1, W, 1, 'rgba(0,0,0,0.6)'); P.rect(g, W - 1, 0, 1, H, 'rgba(0,0,0,0.5)');
    const id = g.getImageData(0, 0, W, H); G.quantize(id, { dither: 8, sat: 0.92, contrast: 1.05 }); g.putImageData(id, 0, 0);
    return (cardArt[tier] = 'url(' + c.toDataURL() + ')');
  };

  /** The Pit's Mastery: its level from the Pit's fights, the points it gives and the cards they buy (blue, purple, gold,
   *  red: from the plain to the rarest; a full card's name turns green). The Mastery Pass at the bottom (every Trial). */
  const masteryWindow = (X) => {
    const PM = X.PM, ids = Object.keys(PM.perks);
    const m = ui.modal({ title: X.title(), cls: 'pitmast', body: () => h('div'), onClose: () => DH.events.off('meta', redraw) });
    const redraw = () => { if (!m.closed) draw(); };
    DH.events.on('meta', redraw);
    // a card tapped opens its panel right over it (in its colour): name, level, what it gives (the number in green), the
    // price a level, and − / + under it at the card's top edge; a tap anywhere else closes it
    let openId = null, root = null;
    const draw = () => {
      const ms = X.mastery(), free = X.free();
      root = h('div.pm-root', { onclick: (e) => { if (openId && !e.target.closest('.pm-pop') && !e.target.closest('.pm-card')) { openId = null; const o = root.querySelector('.pm-pop'); if (o) o.remove(); } } },
        h('div.pm-head', h('div.pm-lv', h('b', ms.lv), h('span.small', ' / ' + PM.max)),
          h('div.grow', h('div.pm-bar', h('i', { style: { width: (ms.next ? Math.round(ms.xp / ms.next * 100) : 100) + '%' } })), h('div.small.muted', ms.next ? t('pit.masteryXp', { x: U.fmt(ms.xp), m: U.fmt(ms.next) }) : t('common.max'))),
          h('div.pm-free', h('span.small', t('pit.points')), h('b', free)),
          h('button.btn.small.ghost.infob', { 'aria-label': X.title(), onclick: (e) => { e.stopPropagation(); click(); ui.modal({ title: X.title(), cls: 'altarinfo', body: (im) => h('div', h('p.center', X.info()), h('div.btns', h('button.btn.gold', { onclick: () => im.close() }, t('common.close')))) }); } }, 'i')),
        h('div.pm-grid', ids.map((id) => {
          const d = PM.perks[id], lv = X.perk(id), full = lv >= d.max, open = X.open(id), can = open && !full && free >= d.cost;
          // a card the Mastery has not reached: in grey, a lock over it and the level it needs under the lock
          const el = h('div.pm-card.t-' + d.tier + (full ? '.full' : can ? '.can' : '') + (lv ? '' : '.zero') + (open ? '' : '.locked') + (openId === id ? '.sel' : ''), { 'data-id': id, onclick: () => { click(); openId = id; draw(); } },
            h('div.pm-n', t(X.pk + id)), h('div.pm-icw', A.img(d.icon, 'pm-ic')), h('div.pm-cost', d.cost), h('div.pm-lvl', lv + '/' + d.max),
            open ? null : h('div.pm-lock', A.img('u_lock'), h('b', t('pit.lvNeed', { n: d.lv }))));
          el.style.setProperty('--art', ui.masteryCardArt(d.tier)); // its gothic ground
          return el;
        })),
        h('div.mact',
          M.masteryPass() ? h('div.pm-pass.on', A.img('pm_pass', 'ci'), h('b', t('mpass.on')))
            : h('div.pm-pass', { onclick: async () => { click(); if (await DH.iap.buy('masterypass')) draw(); } },
              A.img('pm_pass'), h('div.grow', h('b', t('product.masterypass')), h('div.small', t('mpass.desc'))), h('span.btn.small.green', DH.iap.price('masterypass'))),
          h('div.btns', h('button.btn.ghost', { onclick: reset }, t('cons.reset')), h('button.btn.gold', { onclick: () => m.close() }, t('common.close')))));
      m.set(root);
      if (openId) requestAnimationFrame(() => showPop(openId));
    };
    const num = (id, n) => X.num(id, n, PM.perks[id]);
    /** The card's text with its number picked out in green. */
    const desc = (id, n) => { const raw = t(X.pkd + id, { v: '\u0001' }); if (!raw.includes('\u0001')) return [raw]; const parts = raw.split('\u0001'); return [parts[0], h('b.good', String(num(id, n))), parts.slice(1).join('')]; }; // (a card with no number: its text alone)
    const showPop = (id) => {
      const old = root.querySelector('.pm-pop'); if (old) old.remove();
      const cardEl = root.querySelector('.pm-card[data-id="' + id + '"]'); if (!cardEl) return;
      const d = PM.perks[id], lv = X.perk(id), full = lv >= d.max, open = X.open(id), can = open && !full && X.free() >= d.cost;
      const up = async () => {
        if (full) return;
        if (!open) { ui.toast(t('pit.lockedAt', { n: d.lv }), 'bad'); return; }
        if (X.free() < d.cost) { ui.toast(t('pit.noPoints'), 'bad'); return; }
        const r = await ui.act(X.up, { id }); if (r) { DH.audio.play('buy'); draw(); }
      };
      const down = async () => {
        if (!lv) return;
        if (id === X.keep) { // Extra Entry (the Jailer's Key) is taken back for gems only
          if (!(await ui.confirm({ title: t(X.pk + X.keep), body: t(X.refundTxt, { n: U.fmt(X.refund) }), ok: t('cons.sell1'), okCls: 'red' }))) return;
        }
        const r = await ui.act(X.down, { id });
        if (r === false) ui.toast(t('common.notEnough'), 'bad'); else if (r != null) { DH.audio.play('coin'); draw(); }
      };
      const pop = h('div.pm-pop.t-' + d.tier,
        h('div.pp-panel',
          h('button.x', { onclick: () => { click(); openId = null; pop.remove(); draw(); }, 'aria-label': t('common.close') }, A.img('u_close', 'ci')),
          h('div.pp-t', t(X.pk + id)),
          h('div.pp-lv', t('pit.lvOf', { n: lv, m: d.max })),
          h('div.pp-d', desc(id, lv || 1), lv ? null : h('span.muted', ' ' + t('pit.atLv1'))),
          !full && lv ? h('div.pp-next', t('pit.nextLv') + ': ', desc(id, lv + 1)) : null,
          !open ? h('div.pp-cost', A.img('u_lock', 'ci'), ' ', t('pit.lockedAt', { n: d.lv })) : h('div.pp-cost', full ? h('span.good', t('cons.full')) : t('pit.costPer', { n: d.cost })),
          id === X.keep ? h('div.small.muted', t(X.keepTxt, { n: U.fmt(X.refund) })) : null),
        h('div.pp-btns',
          h('button.btn.red.pp-b' + (lv ? '' : '.off'), { onclick: down, 'aria-label': t('cons.sell1') }, '−', id === X.keep && lv ? h('span.pp-gem', A.img('i_gem', 'ci'), U.fmt(X.refund)) : null),
          h('button.btn.green.pp-b' + (can ? '' : '.off'), { onclick: up, 'aria-label': t('cons.buy1') }, '+')));
      root.append(pop);
      const rr = root.getBoundingClientRect(), cr = cardEl.getBoundingClientRect(), z = rr.width / root.offsetWidth || 1; // (the window may be scaled)
      const cl = (cr.left - rr.left) / z, ct = (cr.top - rr.top) / z, cw = cr.width / z, W = root.offsetWidth, pw = Math.min(W - 4, Math.round(cw * 2.1));
      pop.style.width = pw + 'px';
      pop.style.left = Math.round(U.clamp(cl, 0, W - pw)) + 'px';
      pop.style.top = Math.round(Math.max(0, ct - pop.offsetHeight + 24)) + 'px'; // the buttons come down over the card's top edge
    };
    async function reset() {
      click();
      if (X.used() - X.perk(X.keep) * PM.perks[X.keep].cost <= 0) { ui.toast(t('cons.nothing')); return; }
      if (!(await ui.confirm({ title: t('cons.reset'), body: t(X.resetTxt), ok: t('cons.reset'), okCls: 'red' }))) return;
      if (await ui.act(X.reset)) { DH.audio.play('coin'); draw(); }
    }
    draw();
  };

  /** The Pit's Mastery and the Dungeon's: the same window (masteryWindow), each with its own cards and rules. */
  const comma = (v) => String(v).replace('.', DH.i18n.current === 'bg' ? ',' : '.');
  ui.openPitMastery = () => masteryWindow({ PM: E.PIT_MASTERY, title: () => t('pit.mastery'), mastery: M.pitMastery, free: M.pitPointsFree, used: M.pitPointsUsed, perk: M.pitPerk, open: M.pitPerkOpen,
    pk: 'pit.pk.', pkd: 'pit.pkd.', up: 'pitPerkUp', down: 'pitPerkDown', reset: 'pitPerkReset', keep: 'entry', refund: E.PIT_MASTERY.entryRefund, keepTxt: 'pit.entryKeep', refundTxt: 'pit.entryRefund', resetTxt: 'pit.resetBody',
    num: (id, n, d) => (id === 'time' || id === 'entry' ? d.per * n : id === 'sweep' ? Math.round(Math.min(1, E.PIT.sweep + d.per * n) * 100) : Math.round(d.per * n * 100)),
    info: () => t('pit.masteryDesc', { n: comma(E.PIT_MASTERY.xpPerWave), b: Math.round(E.PIT_MASTERY.modeBonus * 100) }) + (M.masteryPass() ? ' ' + t('pit.masteryPass') : '') });
  ui.openDunMastery = () => masteryWindow({ PM: E.DUNGEON_MASTERY, title: () => t('dun.mastery'), mastery: M.dunMastery, free: M.dunPointsFree, used: M.dunPointsUsed, perk: M.dunPerk, open: M.dunPerkOpen,
    pk: 'dun.pk.', pkd: 'dun.pkd.', up: 'dunPerkUp', down: 'dunPerkDown', reset: 'dunPerkReset', keep: 'key', refund: E.DUNGEON_MASTERY.keyRefund, keepTxt: 'dun.keyKeep', refundTxt: 'dun.keyRefund', resetTxt: 'dun.resetBody',
    num: (id, n, d) => (id === 'key' ? d.per * n : id === 'leap' ? n + 1 : id === 'guide' ? Math.round(Math.min(1, E.DUNGEON.sweep + d.per * n) * 100) : id === 'nose' ? Math.round((E.DUNGEON.vaultChance + d.per * n) * 100)
      : id === 'seeker' ? comma(Math.round(d.per * n * 1000) / 10) : id === 'stone' ? comma(Math.round(d.per * n * 1000) / 10) : Math.round(d.per * n * 100)),
    info: () => t('dun.masteryDesc', { f: E.DUNGEON_MASTERY.xpFloor, l: comma(E.DUNGEON_MASTERY.xpLevel), m: E.DUNGEON_MASTERY.max }) + (M.masteryPass() ? ' ' + t('pit.masteryPass') : '') });

  /** The Pit's shop, as the Armory's Resource Store: today's free handful, then a few for an ad each (one card that turns
   *  over), and Essence packs for real money, bought as often as wanted. */
  ui.openPitShop = () => {
    const S = E.PIT_SHOP; let timer = 0;
    const m = ui.modal({ title: t('pitshop.title'), cls: 'resshop pitshop', body: () => h('div'), onClose: () => { clearInterval(timer); DH.events.off('meta', redraw); } });
    const redraw = () => { if (!m.closed) draw(); };
    DH.events.on('meta', redraw);
    const ess = (n) => h('div.rs-items', h('div.rs-it', A.img('i_essence'), h('b', U.fmt(n))));
    const draw = () => {
      const free = M.pitFreeReady(), left = M.pitAdsLeft(), all = !free && left <= 0;
      const card = h('div.panel.rs-row' + (all ? '.done' : ''),
        h('div.grow', h('div.rs-t', all ? t('resshop.allTaken') : free ? t('pitshop.free') : t('pitshop.ad')), ess(free ? S.free.essence : S.ad.essence)),
        all ? h('button.btn.small.ghost.off', A.img('u_check', 'ci'), t('resshop.taken'))
          : free ? h('button.btn.small.gold', { onclick: async () => { const r = await ui.act('claimPitFree'); if (r) { DH.audio.play('reward'); ui.rewardPopup(t('pitshop.title'), r); } } }, t('common.claim'))
            : h('button.btn.small.ad', { onclick: async () => { const r = await ui.act('adPit'); if (r) ui.rewardPopup(t('pitshop.title'), r); } }, ui.adTag(), ui.watchT() + ' (' + left + ')'));
      const tm = h('div.small.muted.center.rs-timer'), upd = () => { tm.textContent = t('resshop.daily', { t: U.fmtDuration(U.msToMidnight()) }); };
      upd(); clearInterval(timer); timer = setInterval(upd, 1000);
      const packs = E.essPackOrder.map((id) => {
        const p = E.products[id];
        return h('div.panel.rs-pack' + (p.tag ? '.tagged' : ''), { onclick: () => DH.iap.buy(id) },
          h('div.slot.rs-pico', A.img(p.icon)),
          h('div.grow', h('div.rs-t', t('product.' + id), p.tag ? h('span.tag', t('shop.tag.' + p.tag)) : null), ess(p.grant.essence), p.value ? h('div.bonus', t('shop.bonus', { v: p.value })) : null),
          h('button.btn.small.green', DH.iap.price(id)));
      });
      m.set(h('div', card, tm, h('h3.sect.rs-sect', t('pitshop.packs')), packs));
    };
    draw();
  };

  /** Each hazard's sign. */
  const FX_ICON = { blades: 'bl_multistrike', stalker: 'n_skull', stars: 'bl_storm', beams: 'bl_pyre', chains: 'pm_combo', stone: 'bl_thickhide', mist: 'bl_afflictor' };
  ui.fxIcon = (k) => FX_ICON[k] || 'u_agony'; // (the Dungeon's levels show the same hazards: js/ui/dungeon.js)
  const fxOne = (k) => ui.modal({ title: t('pit.fx.' + k), cls: 'pitfx', body: (m) => h('div',
    h('div.cons-ico', A.img(FX_ICON[k] || 'u_agony')), h('p.center', t('pit.fxd.' + k)),
    h('div.btns', h('button.btn.gold', { onclick: () => m.close() }, t('common.close')))) });
  ui.fxOne = fxOne;

  /** The Pit's start screen: its picture in the lancet, the wave it begins at, the two hazards rolled (tap one to read
   *  it), and Ready. The fight waits under it (run.state 'intro'); Ready offers the ad's tome, counts 3, 2, 1 and begins (pit.js pitBegin). */
  ui.openPitIntro = (run) => {
    DH.input.enable(false);
    const P = run.pit;
    ui.modal({ closable: false, cls: 'pitintro', body: (m) => h('div',
      h('div.pi-art', h('div.tr-arch.mid', h('img', { src: art(MODES[0]), alt: '' }))),
      h('div.pi-t', t('pit.name')),
      h('div.pi-wave', t('hud.pitWave', { n: U.fmt((P.from || 0) + 1) })),
      h('div.pi-sub', t('pit.affixes')),
      h('div.pi-fx', P.affixes.map((k) => h('button.pi-f', { 'aria-label': t('pit.fx.' + k), onclick: () => { click(); fxOne(k); } }, A.img(FX_ICON[k] || 'u_agony'), h('span', t('pit.fx.' + k))))),
      h('div.small.muted.center', t('pit.affixTap')),
      h('button.btn.green.block.big.pi-go', { onclick: () => {
        click(); m.close();
        const go = () => ui.pitCountdown(run, () => { if (DH.game.run !== run) return; DH.input.enable(true); run.pitBegin(); });
        if (run.startBonus) go(); else ui.openStartBonus(run, go); // the ad's tome first, then the countdown
      } }, t('pit.ready'))) });
  };
  /** 3, 2, 1 over the waiting arena, then the fight. */
  ui.pitCountdown = (run, then) => {
    DH.input.enable(false);
    const el = h('div.pit-count'), root = document.getElementById('hud') || document.body; root.appendChild(el);
    let n = 3;
    const tick = () => {
      if (DH.game.run !== run) { el.remove(); return; }
      if (n === 0) { el.remove(); then(); return; }
      el.textContent = ''; el.appendChild(h('b', String(n))); DH.audio.play(n === 1 ? 'roar' : 'block');
      n--; setTimeout(tick, 800);
    };
    tick();
  };

  /** The seven hazards and what each does. */
  const fxInfo = () => ui.modal({ title: t('pit.fxTitle'), cls: 'pitfx', body: (m) => h('div',
    h('div.small.muted.center', t('pit.fxSub', { n: E.PIT.roll })),
    E.PIT.affixes.map((k) => h('div.pitfx-row', A.img(FX_ICON[k] || 'u_agony', 'ci'), h('div', h('b', t('pit.fx.' + k)), h('div.small', t('pit.fxd.' + k))))),
    h('div.btns', h('button.btn.gold', { onclick: () => m.close() }, t('common.close')))) });

  /** The Pit is over: the wave reached, what was paid, a new record. */
  ui.openPitResults = (run, res) => {
    const hudEl = document.getElementById('hud'); if (hudEl) hudEl.classList.add('hidden');
    const P = run.pit, total = (P.paid || 0) + (res.paid || 0);
    ui.modal({ closable: false, cls: 'results pitres', rays: !!res.record, body: (m) => h('div',
      h('div.big' + (res.record ? '.win' : ''), res.record ? t('pit.record') : t('pit.over')),
      h('div.statgrid',
        h('div', h('span', t('pit.reached')), h('b', U.fmt(res.reached))), h('div', h('span', t('pit.cleared')), h('b', U.fmt(res.waves))),
        h('div', h('span', t('results.kills')), h('b', U.fmt(run.kills))), h('div', h('span', t('pit.best')), h('b', U.fmt(res.best))),
        h('div', h('span', t('pit.bestCombo')), h('b', '×' + U.fmt((P.combo && P.combo.best) || 0)))),
      h('div.goldline', h('span', t('pit.entryPay')), h('b', U.fmt(P.paid || 0))),
      h('div.goldline', h('span', t('pit.wavesPay')), h('b', U.fmt(res.paid || 0))),
      res.mastery ? h('div.center.goldtxt', { style: { fontWeight: 800, margin: '4px 0' } }, A.img('u_star', 'ci'), ' ' + t('pit.masteryUp', { n: M.pitMastery().lv })) : null,
      res.deeds && res.deeds.length ? h('div.deedsdone', h('div.goldtxt', { style: { fontWeight: 800 } }, t('results.deeds', { n: res.deeds.length, x: Math.round(res.deeds.length * DH.deeds.XP_PER_DEED * 1000) / 10 })), res.deeds.map((d) => h('div.small.dd', A.img('u_check', 'ci'), h('span', ui.deedText(d))))) : null,
      h('div.goldtotal', A.img('i_essence'), h('b', U.fmt(total))),
      res.failed ? h('div.small.center.bad', t('pit.notSent')) : null,
      h('div.btns', h('button.btn.gold', { onclick: () => { click(); m.close(); DH.game.toMenu(false, true); ui.openPit(); } }, t('common.continue')))) }); // back to the Pit's window, ready for the next entry
  };
})(window.DH);
