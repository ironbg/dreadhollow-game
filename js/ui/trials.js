/* Trials: the window of game modes (arches to choose from), the Pit's own screen and its results. */
(function (DH) {
  'use strict';
  const U = DH.util, h = U.h, E = DH.economy, A = DH.art, ui = DH.ui, M = DH.meta;
  const click = () => DH.audio.play('click');

  /** The modes, in their arches. Only the Pit is open for now; the rest are announced. */
  const MODES = [
    { id: 'pit', art: 'abyss', open: true },
    { id: 'soon1', art: 'catacombs', open: false },
    { id: 'soon2', art: 'discord', open: false },
  ];
  const arts = {};
  const art = (m) => arts[m.id] || (arts[m.id] = A.stageArt(m.art, 240, 360).toDataURL('image/jpeg', 0.85));

  /** The Trials: three arches side by side, the chosen one in the middle, its name under them, and Enter. */
  ui.openTrials = (start) => {
    let i = Math.max(0, MODES.findIndex((m) => m.id === start));
    const m = ui.modal({ title: t('trials.title'), cls: 'trials wide', body: () => h('div') });
    const go = (d) => { click(); i = (i + d + MODES.length) % MODES.length; draw(); };
    const arch = (k, side) => {
      const md = MODES[(i + k + MODES.length) % MODES.length];
      return h('div.tr-arch' + (side ? '.side' : '.mid') + (md.open ? '' : '.soon'), { onclick: () => { if (side) go(k); } },
        h('img', { src: art(md), alt: '' }), md.open ? null : h('div.tr-soon', A.img('u_lock', 'ci'), h('span', t('trials.soon'))));
    };
    const draw = () => {
      const md = MODES[i];
      m.set(h('div',
        h('div.center.small.muted', t('trials.sub')),
        h('div.tr-hall', arch(-1, true), arch(0, false), arch(1, true)),
        h('div.tr-name', h('button.tr-arrow', { onclick: () => go(-1), 'aria-label': '<' }, '◀'), h('span', t('trials.' + md.id)), h('button.tr-arrow', { onclick: () => go(1), 'aria-label': '>' }, '▶')),
        h('div.small.center.tr-desc', t('trials.' + md.id + '.desc')),
        h('div.btns', md.open ? h('button.btn.red', { onclick: () => { click(); m.close(); ui.openPit(); } }, t('trials.enter'))
          : h('button.btn.ghost.off', t('trials.soon')))));
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
          M.pitPass() ? h('div.pit-pass.on', A.img('n_skull', 'ci'), t('pit.passOn')) : null),
        M.pitPass() ? null : h('div.pit-passcard', { onclick: async () => { click(); if (await DH.iap.buy('pitpass')) draw(); } },
          A.img('n_skull', 'ci'), h('div.grow', h('b', t('product.pitpass')), h('div.small', t('pit.passDesc'))), h('span.btn.small.gold', DH.iap.price('pitpass'))),
        h('div.pit-card',
          row('n_trophy', t('pit.best'), U.fmt(best)),
          row('u_pin', t('pit.checkpoint'), U.fmt(cp)),
          h('div.pit-gap'),
          row('i_essence', t('pit.entryPay'), U.fmt(cp * per)),
          row('i_essence', t('pit.perWave'), U.fmt(per)),
          h('button.pit-fx', { onclick: () => { click(); fxInfo(); } }, A.img('u_agony', 'ci'), t('pit.randomFx', { n: E.PIT.roll }), h('span.pit-i', 'i'))),
        h('div.pit-more',
          h('button.btn.small.gold', { onclick: () => { click(); ui.openConstellation(); } }, A.img('u_star', 'ci'), ' ', t('pit.constellation')),
          h('button.btn.small.gold', { onclick: () => { click(); ui.openBoards(M.boardKey(M.pitBoards()[0])); } }, A.img('n_trophy', 'ci'), ' ', t('lb.short'))),
        h('div.mact', h('div.small.center.pit-left' + (left ? '' : '.bad'), t('pit.entries', { n: all - left, m: all })),
        h('div.pit-btns',
          h('button.btn.blue' + (left && best ? '' : '.off'), { onclick: sweep }, t('pit.sweep'), best ? h('span.small', ' +' + U.fmt(best * per)) : null),
          h('button.btn.green' + (left ? '' : '.off'), { onclick: () => { if (!left) { ui.toast(t('pit.noEntries'), 'bad'); return; } m.close(); DH.game.startPit(); } }, t('pit.enter'))))));
    };
    const sweep = async () => {
      const best = (DH.save.data.pit && DH.save.data.pit.best) || 0;
      if (!best) { ui.toast(t('pit.sweepNone'), 'bad'); return; }
      if (!M.pitLeft()) { ui.toast(t('pit.noEntries'), 'bad'); return; }
      click();
      const r = await ui.act('pitSweep'); if (!r) return;
      DH.audio.play('coin'); ui.rewardPopup(t('pit.sweep'), [{ icon: 'i_essence', text: '+' + U.fmt(r.paid) }]); draw();
    };
    draw();
  };

  /** The seven hazards and what each does. */
  const fxInfo = () => ui.modal({ title: t('pit.fxTitle'), cls: 'pitfx', body: (m) => h('div',
    h('div.small.muted.center', t('pit.fxSub', { n: E.PIT.roll })),
    E.PIT.affixes.map((k) => h('div.pitfx-row', h('b', t('pit.fx.' + k)), h('div.small', t('pit.fxd.' + k)))),
    h('div.btns', h('button.btn.gold', { onclick: () => m.close() }, t('common.close')))) });

  /** The Pit is over: the wave reached, what was paid, a new record. */
  ui.openPitResults = (run, res) => {
    const hudEl = document.getElementById('hud'); if (hudEl) hudEl.classList.add('hidden');
    const P = run.pit, total = (P.paid || 0) + (res.paid || 0);
    ui.modal({ closable: false, cls: 'results pitres', rays: !!res.record, body: (m) => h('div',
      h('div.big' + (res.record ? '.win' : ''), res.record ? t('pit.record') : t('pit.over')),
      h('div.statgrid',
        h('div', h('span', t('pit.reached')), h('b', U.fmt(res.reached))), h('div', h('span', t('pit.cleared')), h('b', U.fmt(res.waves))),
        h('div', h('span', t('results.kills')), h('b', U.fmt(run.kills))), h('div', h('span', t('pit.best')), h('b', U.fmt(res.best)))),
      h('div.goldline', h('span', t('pit.entryPay')), h('b', U.fmt(P.paid || 0))),
      h('div.goldline', h('span', t('pit.wavesPay')), h('b', U.fmt(res.paid || 0))),
      h('div.goldtotal', A.img('i_essence'), h('b', U.fmt(total))),
      res.failed ? h('div.small.center.bad', t('pit.notSent')) : null,
      h('div.btns', h('button.btn.gold', { onclick: () => { click(); m.close(); DH.game.toMenu(false); } }, t('common.continue')))) });
  };
})(window.DH);
