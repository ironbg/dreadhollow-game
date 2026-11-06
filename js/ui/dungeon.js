/* The Dungeon's windows: its own screen (the levels, today's entries and vaults, a level's map and rewards, Enter,
 * Sweep, the Mastery, the boards), the start screen of a level and its results. */
(function (DH) {
  'use strict';
  const U = DH.util, h = U.h, E = DH.economy, C = DH.content, M = DH.meta, A = DH.art, ui = DH.ui;
  const click = () => DH.audio.play('click');

  /** A level's start screen: the level, its catacombs and Lord, its hazards (tap one to read it), and Ready. The fight
   *  waits under it (run.state 'intro'); Ready offers the ad's reward, counts 3, 2, 1 and the first floor begins. */
  ui.openDunIntro = (run) => {
    DH.input.enable(false);
    const Q = run.dun;
    ui.modal({ closable: false, cls: 'pitintro dunintro', body: (m) => h('div',
      h('div.pi-art', h('div.tr-arch.mid', h('img', { src: pic(), alt: '' }))),
      h('div.pi-t', t('dun.name')),
      h('div.pi-wave', t('dun.lvN', { n: Q.lv + (Q.n > 1 ? '–' + (Q.lv + Q.n - 1) : '') })),
      h('div.center.small', t('stage.' + Q.hall + '.name') + ' · ' + t('enemy.' + Q.lord)),
      h('div.pi-sub', Q.affixes.length ? t('pit.affixes') : t('dun.noAffixes')),
      Q.affixes.length ? h('div.pi-fx', Q.affixes.map((k) => h('button.pi-f', { 'aria-label': t('pit.fx.' + k), onclick: () => { click(); ui.fxOne(k); } }, A.img(ui.fxIcon(k)), h('span', t('pit.fx.' + k))))) : null,
      Q.affixes.length ? h('div.small.muted.center', t('pit.affixTap')) : null,
      h('div.small.center.dun-rule', t('dun.rule', { s: E.DUNGEON.secs / 60, f: E.DUNGEON.floorSecs })),
      h('button.btn.green.block.big.pi-go', { onclick: () => {
        click(); m.close();
        const go = () => ui.pitCountdown(run, () => { if (DH.game.run !== run) return; DH.input.enable(true); run.dunBegin(); });
        if (run.startBonus) go(); else ui.openStartBonus(run, go); // the ad's reward first, then the countdown
      } }, t('pit.ready'))) });
  };

  /** The level is over: won or lost, floors cleared, what it paid (gold, metals, quartz, chests opened, vaults), the best. */
  ui.openDunResults = (run, res) => {
    const hudEl = document.getElementById('hud'); if (hudEl) hudEl.classList.add('hidden');
    const Q = run.dun, won = !!res.won;
    const extras = (res.items || []).concat(Q.vaultPaid || []);
    (res.gear || []).forEach((g) => extras.push({ icon: 'g_' + g.type, text: t('gear.' + g.type), rarity: g.rarity }));
    ui.modal({ closable: false, cls: 'results pitres dunres', rays: won, body: (m) => h('div',
      h('div.big.' + (won ? 'win' : 'lose'), won ? (res.record ? t('dun.record') : t('dun.won')) : t('dun.lost')),
      h('div.center.small.muted', t('dun.lvN', { n: Q.lv + (Q.n > 1 ? '–' + (Q.lv + Q.n - 1) : '') }) + ' · ' + t('stage.' + Q.hall + '.name')),
      h('div.statgrid',
        h('div', h('span', t('dun.floors')), h('b', (res.floors || 0) + ' / ' + (E.DUNGEON.floors + 1))), h('div', h('span', t('results.kills')), h('b', U.fmt(run.kills))),
        h('div', h('span', t('results.level')), h('b', run.level)), h('div', h('span', t('dun.best')), h('b', U.fmt(res.best || M.dunBest())))),
      extras.length ? h('div.reward-list', extras.map((e) => h('div.reward', h('div.slot' + (e.rarity != null ? '.rar' + e.rarity : ''), A.img(e.icon)), h('div.n' + (ui.isWord(e.text) ? '.word' : ''), e.text)))) : h('div.center.small.muted', t('dun.nothing')),
      res.mastery ? h('div.center.goldtxt', { style: { fontWeight: 800, margin: '4px 0' } }, A.img('u_star', 'ci'), ' ' + t('dun.masteryUp', { n: M.dunMastery().lv })) : null,
      res.deeds && res.deeds.length ? h('div.deedsdone', h('div.goldtxt', { style: { fontWeight: 800 } }, t('results.deeds', { n: res.deeds.length, x: Math.round(res.deeds.length * DH.deeds.XP_PER_DEED * 1000) / 10 })), res.deeds.map((d) => h('div.small.dd', A.img('u_check', 'ci'), h('span', ui.deedText(d))))) : null,
      res.failed ? h('div.small.center.bad', t('pit.notSent')) : null,
      h('div.btns', h('button.btn.gold', { onclick: () => { click(); m.close(); DH.game.toMenu(false, true); ui.openDungeon(); } }, t('common.continue')))) }); // back to the Dungeon's window
  };

  /** The Dungeon's picture, painted small and shown in big pixels like the rest of the game: a crypt's wall of black
   *  ashlar, a tall pointed arch in it with a skull for a keystone, stairs going down through it into a red glow,
   *  candles guttering at its foot, chains, heaped skulls in the niches to either side, a hanging cage. */
  ui.dunArt = () => {
    const G = DH.gfx, P = G.P, W = 120, H = 180, c = G.canvas(W, H), g = c.getContext('2d');
    let sd = 4242; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    // the wall: courses of black ashlar, each block lit on its upper edge
    g.fillStyle = '#0a0709'; g.fillRect(0, 0, W, H);
    for (let y = 0, row = 0; y < 150; y += 9, row++) for (let x = -(row % 2) * 8; x < W; x += 16) {
      const l = 30 + r() * 12 - y * 0.06; g.fillStyle = 'rgb(' + (l + 4 | 0) + ',' + (l | 0) + ',' + (l + 2 | 0) + ')'; g.fillRect(x + 0.5, y + 0.5, 15, 8);
      g.fillStyle = 'rgba(255,240,230,0.07)'; g.fillRect(x + 0.5, y + 0.5, 15, 1); g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x + 0.5, y + 7.5, 15, 1);
    }
    // the floor before it: flagstones running towards us, old blood
    g.fillStyle = P.lg(g, 0, 140, 0, H, ['#1c1418', '#0e0a0c']); g.fillRect(0, 140, W, H - 140);
    g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 1; for (let y = 146, k = 0; y < H; y += 5 + k, k += 1) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(W / 2 + i * 8, 140); g.lineTo(W / 2 + i * 24, H); g.stroke(); }
    g.fillStyle = 'rgba(80,6,8,0.55)'; g.beginPath(); g.ellipse(36, 164, 12, 3.5, 0.2, 0, Math.PI * 2); g.fill();
    // niches to either side: pointed, dark, skulls heaped in them
    const skull = (x, y, k) => { P.circle(g, x, y, 2.2 * k, '#c8bca4'); g.fillStyle = '#c8bca4'; g.fillRect(x - 1.2 * k, y + 1.2 * k, 2.4 * k, 1.4 * k); g.fillStyle = '#1a0e0a'; g.fillRect(x - 1.3 * k, y - 0.3 * k, 0.9 * k, 0.9 * k); g.fillRect(x + 0.4 * k, y - 0.3 * k, 0.9 * k, 0.9 * k); };
    for (const nx of [18, W - 18]) {
      g.fillStyle = '#050304'; g.beginPath(); g.moveTo(nx - 9, 132); g.lineTo(nx - 9, 92); g.quadraticCurveTo(nx - 9, 80, nx, 74); g.quadraticCurveTo(nx + 9, 80, nx + 9, 92); g.lineTo(nx + 9, 132); g.closePath(); g.fill();
      g.strokeStyle = '#5a5054'; g.lineWidth = 1.4; g.stroke();
      for (let row = 0; row < 4; row++) for (let k = 0; k < 4 - row; k++) skull(nx - 5.4 + k * 3.6 + row * 1.8, 128 - row * 4, 0.8);
    }
    // the great arch: a dark mouth, its voussoirs, the skull keystone
    const ax = W / 2;
    g.fillStyle = '#020101'; g.beginPath(); g.moveTo(ax - 24, 140); g.lineTo(ax - 24, 70); g.quadraticCurveTo(ax - 24, 44, ax, 30); g.quadraticCurveTo(ax + 24, 44, ax + 24, 70); g.lineTo(ax + 24, 140); g.closePath(); g.fill();
    g.strokeStyle = '#6a5e62'; g.lineWidth = 4; g.stroke(); g.strokeStyle = '#0a0608'; g.lineWidth = 1; g.stroke();
    for (let i = 0; i < 11; i++) { const t2 = i / 10, a = Math.PI * (1 - t2), x = ax + Math.cos(a) * 26 * (1 - Math.abs(0.5 - t2) * 0.1), y = 66 - Math.sin(a) * 34; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x - 0.5, y - 2, 1, 3); }
    skull(ax, 31, 2.2);
    // the stairs down through it into a red glow
    const glow = g.createRadialGradient(ax, 118, 2, ax, 118, 40); glow.addColorStop(0, 'rgba(255,110,40,0.9)'); glow.addColorStop(0.45, 'rgba(170,30,14,0.55)'); glow.addColorStop(1, 'rgba(60,0,0,0)');
    g.fillStyle = glow; g.fillRect(ax - 24, 60, 48, 80);
    for (let k = 0; k < 9; k++) { const y = 140 - k * 5.4, w = 46 - k * 4.6, l = 80 - k * 8; g.fillStyle = 'rgb(' + (l + 30) + ',' + (l * 0.55 | 0) + ',' + (l * 0.45 | 0) + ')'; g.fillRect(ax - w / 2, y - 2, w, 2.4); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(ax - w / 2, y + 0.4, w, 1.4); }
    // the raised portcullis in the top of the arch, its spikes
    g.fillStyle = '#141012'; for (let x = ax - 20; x <= ax + 20; x += 5) { g.fillRect(x - 0.8, 40, 1.6, 22); g.beginPath(); g.moveTo(x - 1.6, 62); g.lineTo(x, 66); g.lineTo(x + 1.6, 62); g.fill(); } g.fillRect(ax - 21, 48, 42, 1.6);
    // chains, a hanging cage with bones
    for (const [x0, len] of [[34, 52], [W - 34, 40]]) for (let y = 0; y < len; y += 3) { g.fillStyle = (y / 3) % 2 ? '#4a4044' : '#2a2226'; g.fillRect(x0 + Math.sin(y * 0.07) * 1.2, y, 2, 3); }
    g.strokeStyle = '#3a3236'; g.lineWidth = 1; for (let k = -4; k <= 4; k += 2) { g.beginPath(); g.moveTo(W - 34 + k * 0.7, 40); g.lineTo(W - 34 + k, 56); g.stroke(); } skull(W - 34, 50, 0.8);
    // candles at the arch's foot and in the niches, their light pooling
    for (const [x, y] of [[ax - 32, 138], [ax - 28, 140], [ax + 30, 139], [ax + 34, 137], [18, 131], [W - 18, 131]]) {
      g.save(); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(x, y - 5, 1, x, y - 5, 14); gl.addColorStop(0, 'rgba(255,160,70,0.55)'); gl.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gl; g.fillRect(x - 14, y - 19, 28, 28); g.restore();
      g.fillStyle = '#d8ccb0'; g.fillRect(x - 0.8, y - 4, 1.6, 4); g.fillStyle = '#ffb040'; g.fillRect(x - 0.6, y - 6.4, 1.2, 2.4); g.fillStyle = '#fff0b0'; g.fillRect(x - 0.3, y - 5.6, 0.6, 1);
    }
    // embers rising out of the stairwell; the dark at the edges
    for (let i = 0; i < 26; i++) { g.fillStyle = r() < 0.5 ? '#ffb050' : '#ff5a20'; g.fillRect(ax + (r() - 0.5) * 40, 50 + r() * 90, 1, 1); }
    const v = g.createRadialGradient(ax, 100, 30, ax, 100, 120); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.75)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
    const id = g.getImageData(0, 0, W, H); G.quantize(id, { dither: 6, sat: 0.95, contrast: 1.08 }); g.putImageData(id, 0, 0);
    return c.toDataURL();
  };
  let dunPic = null;
  const pic = () => dunPic || (dunPic = (() => { try { const k = 'dh_trart_dungeon_' + DH.VERSION, v = localStorage.getItem(k); if (v) return v; const u = ui.dunArt(); localStorage.setItem(k, u); return u; } catch (e) { return ui.dunArt(); } })());

  /** The Dungeon's window: its picture (the chosen level's hazards over it), a strip of the levels (cleared ones ticked,
   *  the best with its cup, one past the best to enter; >> to the farthest), what the day holds (entries, vaults, the
   *  hour of the next day), the level's catacombs and Lord, its rewards; Sweep and Enter; the Mastery and the boards. */
  ui.openDungeon = (lvPick) => {
    let lv = Math.max(1, Math.min(M.dunBest() + 1, lvPick || M.dunBest() + 1)), n = 1, sweepN = 1, timer = 0;
    const m = ui.modal({ title: t('dun.name'), cls: 'dunwin', body: () => h('div'), onClose: () => { clearInterval(timer); DH.events.off('meta', redraw); } });
    const redraw = () => { if (!m.closed) draw(); };
    DH.events.on('meta', redraw);
    const cell = (icon, label, val, cls) => h('div.dun-cell' + (cls || ''), A.img(icon, 'ci'), h('span', label), h('b', val));
    const pick = (v) => { click(); lv = Math.max(1, Math.min(M.dunBest() + 1, v)); n = 1; draw(); };
    const tile = (k) => {
      const best = M.dunBest(), open = k <= best + 1, done = k <= best;
      // a small lancet of carved stone in a bronze frame (dun-frame, dun-face: both cut to the pointed arch)
      return h('button.dun-tile' + (k === lv ? '.on' : '') + (done ? '.done' : '') + (k === best + 1 ? '.next' : '') + (open ? '' : '.shut'), { onclick: () => { if (open) pick(k); } },
        h('i.dun-frame'), h('i.dun-face'), h('b', U.fmt(k)), done ? h('i.dun-tick', '✓') : null, k === best && best ? A.img('n_trophy', 'dun-cup') : null);
    };
    const draw = () => {
      const left = M.dunLeft(), all = M.dunEntries(), best = M.dunBest(), hall = M.dunHall(lv), fx = M.dunAffixes(lv), first = lv > best, rw = M.dunReward(lv, first), lmax = M.dunLeapMax(lv), mst = M.dunMastery();
      n = Math.max(1, Math.min(n, lmax, Math.max(1, left)));
      const xp = (E.DUNGEON.floors + 1) * E.DUNGEON_MASTERY.xpFloor + lv * E.DUNGEON_MASTERY.xpLevel;
      const rewards = [{ icon: 'u_star', text: '×' + U.fmt(Math.round(xp * (M.masteryPass() ? 2 : 1))), tip: t('dun.rw.mastery') }, { icon: 'n_pass', text: '×' + U.fmt(rw.accountXp), tip: t('dun.rw.acct') },
        { icon: 'i_gold', text: U.fmt(rw.gold), tip: (t('common.gold').charAt(0).toUpperCase() + t('common.gold').slice(1)) }].concat(Object.keys(rw.mats).map((k) => ({ icon: 'mat_' + k, text: U.fmt(rw.mats[k]), tip: t('mat.' + k) })), [{ icon: 'i_quartz', text: '1–' + U.fmt(rw.quartz), tip: t('res.quartz') }])
        .concat(Object.keys(rw.chests).map((k) => ({ icon: E.chests[k].icon, text: '×' + rw.chests[k], first: first, tip: t('chest.' + k) })))
        .concat(M.dunBossLoot(lv) ? [{ icon: 'c_gold', text: t('dun.rw.lord'), tip: t('dun.rw.lordTip') }] : []);
      const lo = Math.max(1, Math.min(lv - 2, best + 1 - 4)), tiles = []; for (let k = lo; k < lo + 5; k++) tiles.push(tile(k));
      m.set(h('div.dun-body',
        h('div.pit-art.dun-art', h('img', { src: pic(), alt: '' }),
          fx.length ? h('div.dun-fx', h('div.small', t('pit.affixes')), h('div.dun-fxi', fx.map((k) => h('button', { 'aria-label': t('pit.fx.' + k), onclick: () => { click(); ui.fxOne(k); } }, A.img(ui.fxIcon(k)))))) : null,
          h('button.dun-far', { 'aria-label': t('dun.toBest'), onclick: () => pick(best + 1) }, A.img('u_right', 'ci'), A.img('u_right', 'ci'))),
        h('div.dun-strip', h('button.dun-arr', { onclick: () => pick(lv - 1), 'aria-label': '<' }, A.img('u_left', 'ci')), h('div.dun-tiles', tiles), h('button.dun-arr', { onclick: () => pick(lv + 1), 'aria-label': '>' }, A.img('u_right', 'ci'))),
        h('div.pit-card.dun-card',
          // the day in four small cells, the level's catacombs and Lord on one line, its rewards in one row: no scrolling
          h('div.dun-stats', cell('n_trophy', t('dun.best'), U.fmt(best)), cell('n_dungeon', t('dun.today'), (all - left) + ' / ' + all, left ? '' : '.bad'),
            cell('hourglass', t('dun.refresh'), h('span.dun-clock', U.fmtDuration(U.msToMidnight()))), cell('c_gold', t('dun.vaultsRow'), M.dunVaultsToday() + ' / ' + E.DUNGEON.vaultsPerDay)),
          h('div.dun-where', h('span.dw', A.img('u_agony', 'ci'), h('span.dun-map.m-' + hall, t('stage.' + hall + '.name'))), h('span.dw', A.img('n_skull', 'ci'), h('span', t('enemy.' + (C.stages[hall].bosses.find((x) => x.final) || {}).id)))),
          h('div.dun-rwh', A.img('u_star', 'ci'), h('span', first ? t('dun.rewardsFirst') : t('dun.rewards'))),
          h('div.dun-rw', rewards.map((e) => h('button.dun-rwi' + (e.first ? '.first' : ''), { title: e.tip || '', onclick: () => { click(); ui.toast(e.tip + ': ' + e.text); } }, h('div.slot', A.img(e.icon)), h('div.n', e.text))))), // a tap names the reward
        M.dunPerk('leap') ? h('div.dun-leap', h('span.small', t('dun.leap')), [1, 2, 3, 4, 5].filter((k) => k <= 1 + M.dunPerk('leap')).map((k) => h('button.btn.small' + (k === n ? '.gold' : '.ghost') + (k > left || k > lmax ? '.off' : ''), { onclick: () => { if (k <= left && k <= lmax) { click(); n = k; draw(); } } }, '×' + k))) : null, // (the same row on every level: the window never jumps)
        h('div.mact',
          h('div.pit-btns',
            h('div.pit-sweep',
              h('button.btn.blue' + (left && lv <= best ? '' : '.off'), { onclick: sweep }, sweepN > 1 ? t('pit.sweepN', { n: sweepN }) : t('pit.sweep')),
              h('div.pit-slide' + (left > 1 && lv <= best ? '' : '.hide'), h('input', { type: 'range', min: 1, max: left, step: 1, value: Math.min(sweepN, left), 'aria-label': t('pit.sweep'),
                oninput: (e) => { sweepN = +e.target.value; const b = e.target.closest('.pit-sweep').querySelector('.btn'); b.textContent = sweepN > 1 ? t('pit.sweepN', { n: sweepN }) : t('pit.sweep'); } }), h('b', null))),
            h('button.btn.green' + (left ? '' : '.off'), { onclick: () => { if (!left) { ui.toast(t('dun.noEntries'), 'bad'); return; } click(); m.close(); DH.game.startDungeon(lv, n); } }, n > 1 ? t('dun.enterN', { n }) : t('dun.enter'))),
          h('div.small.muted.center.pit-share', lv <= best ? t('dun.sweepShare', { v: Math.round(M.dunSweepShare() * 100), n: U.fmt(lv) }) : best ? t('dun.sweepOnly') : t('dun.sweepNone')),
          h('div.pit-more',
            h('button.btn.small.gold', { onclick: () => { click(); ui.openDunMastery(); } }, A.img('u_star', 'ci'), ' ', t('dun.masteryLv', { n: mst.lv }), M.dunCanRaise() ? h('span.badge', M.dunPointsFree()) : null),
            h('button.btn.small.gold', { onclick: () => { click(); ui.openBoards(M.boardKey(M.dunBoards()[0])); } }, A.img('n_trophy', 'ci'), ' ', t('lb.short'))))));
      const sl = m.el && m.el.querySelector('.pit-slide input'); if (sl) { const upd = () => { sl.nextSibling.textContent = sl.value; sl.style.setProperty('--f', ((sl.value - 1) / Math.max(1, sl.max - 1) * 100) + '%'); }; sl.addEventListener('input', upd); upd(); }
    };
    const sweep = async () => {
      if (!M.dunBest()) { ui.toast(t('dun.sweepNone'), 'bad'); return; }
      if (lv > M.dunBest()) { ui.toast(t('dun.sweepOnly'), 'bad'); return; } // only a level already cleared
      if (!M.dunLeft()) { ui.toast(t('dun.noEntries'), 'bad'); return; }
      click();
      const k = Math.max(1, Math.min(M.dunLeft(), sweepN));
      const r = await ui.act('dunSweep', { n: k, lv }); if (!r) return;
      sweepN = 1;
      DH.audio.play('coin'); ui.rewardPopup(r.n > 1 ? t('pit.sweepN', { n: r.n }) : t('pit.sweep'), r.items); draw();
      if (r.mastery) ui.toast(t('dun.masteryUp', { n: M.dunMastery().lv }), 'good');
      (r.deeds || []).forEach((d, i) => setTimeout(() => ui.toast(t('pit.deedDone', { d: ui.deedText(d) }), 'good'), 600 + i * 900));
    };
    draw();
    timer = setInterval(() => { const el = m.el && m.el.querySelector('.dun-clock'); if (el) el.textContent = U.fmtDuration(U.msToMidnight()); }, 1000);
    return m;
  };
})(window.DH);
