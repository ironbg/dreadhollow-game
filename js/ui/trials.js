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
          M.pitPass() ? h('div.pit-pass.on', A.img('n_skull', 'ci'), t('pit.passOn')) : null,
          h('button.pit-shopbtn', { 'aria-label': t('pitshop.title'), onclick: () => { click(); ui.openPitShop(); } }, A.img('c_gold'), h('span', t('pit.shop')), M.pitFreeReady() ? h('span.badge', '!') : null)),
        M.pitPass() ? null : h('div.pit-passcard', { onclick: async () => { click(); if (await DH.iap.buy('pitpass')) draw(); } },
          A.img('n_skull', 'ci'), h('div.grow', h('b', t('product.pitpass')), h('div.small', t('pit.passDesc'))), h('span.btn.small.gold', DH.iap.price('pitpass'))),
        h('div.pit-card',
          row('n_trophy', t('pit.best'), U.fmt(best)),
          row('u_pin', t('pit.checkpoint'), U.fmt(cp)),
          h('div.pit-gap'),
          row('i_essence', t('pit.entryPay'), U.fmt(Math.round(cp * per))),
          row('i_essence', t('pit.perWave'), per % 1 ? per.toFixed(1) : U.fmt(per)),
          h('button.pit-fx', { onclick: () => { click(); fxInfo(); } }, A.img('u_agony', 'ci'), t('pit.randomFx', { n: E.PIT.roll }), h('span.pit-i', 'i'))),
        h('div.pit-more',
          h('button.btn.small.gold', { onclick: () => { click(); ui.openPitMastery(); } }, A.img('u_star', 'ci'), ' ', t('pit.mastery'), M.pitPointsFree() > 0 ? h('span.badge', M.pitPointsFree()) : null),
          h('button.btn.small.gold', { onclick: () => { click(); ui.openConstellation(); } }, A.img('i_essence', 'ci'), ' ', t('pit.constellation')),
          h('button.btn.small.gold', { onclick: () => { click(); ui.openBoards(M.boardKey(M.pitBoards()[0])); } }, A.img('n_trophy', 'ci'), ' ', t('lb.short'))),
        h('div.mact', h('div.small.center.pit-left' + (left ? '' : '.bad'), t('pit.entries', { n: all - left, m: all })),
        h('div.pit-btns',
          h('div.pit-sweep',
            h('button.btn.blue' + (left && best ? '' : '.off'), { onclick: sweep }, sweepN > 1 ? t('pit.sweepN', { n: sweepN }) : t('pit.sweep')),
            left > 1 && best ? h('div.pit-slide', h('input', { type: 'range', min: 1, max: left, step: 1, value: sweepN, 'aria-label': t('pit.sweep'),
              oninput: (e) => { sweepN = +e.target.value; const b = e.target.closest('.pit-sweep').querySelector('.btn'); b.textContent = sweepN > 1 ? t('pit.sweepN', { n: sweepN }) : t('pit.sweep'); } }), h('b', null)) : null),
          h('button.btn.green' + (left ? '' : '.off'), { onclick: () => { if (!left) { ui.toast(t('pit.noEntries'), 'bad'); return; } m.close(); DH.game.startPit(); } }, t('pit.enter'))),
        best ? h('div.small.muted.center.pit-share', t('pit.sweepShare', { v: Math.round(M.pitSweepShare() * 100) })) : null)));
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
    };
    draw();
  };

  /** The Pit's Mastery: its level from the Pit's fights, the points it gives and the cards they buy (blue, purple, gold,
   *  red: from the plain to the rarest; a full card's name turns green). The Mastery Pass at the bottom (every Trial). */
  ui.openPitMastery = () => {
    const PM = E.PIT_MASTERY, ids = Object.keys(PM.perks);
    const m = ui.modal({ title: t('pit.mastery'), cls: 'pitmast', body: () => h('div'), onClose: () => DH.events.off('meta', redraw) });
    const redraw = () => { if (!m.closed) draw(); };
    DH.events.on('meta', redraw);
    // a card tapped opens its panel right over it (in its colour): name, level, what it gives (the number in green), the
    // price a level, and − / + under it at the card's top edge; a tap anywhere else closes it
    let openId = null, root = null;
    const draw = () => {
      const ms = M.pitMastery(), free = M.pitPointsFree();
      root = h('div.pm-root', { onclick: (e) => { if (openId && !e.target.closest('.pm-pop') && !e.target.closest('.pm-card')) { openId = null; const o = root.querySelector('.pm-pop'); if (o) o.remove(); } } },
        h('div.pm-head', h('div.pm-lv', h('b', ms.lv), h('span.small', ' / ' + PM.max)),
          h('div.grow', h('div.pm-bar', h('i', { style: { width: (ms.next ? Math.round(ms.xp / ms.next * 100) : 100) + '%' } })), h('div.small.muted', ms.next ? t('pit.masteryXp', { x: U.fmt(ms.xp), m: U.fmt(ms.next) }) : t('common.max'))),
          h('div.pm-free', h('span.small', t('pit.points')), h('b', free))),
        h('div.small.muted.center', t('pit.masteryDesc', { n: PM.xpPerWave }) + (M.masteryPass() ? ' ' + t('pit.masteryPass') : '')),
        h('div.pm-grid', ids.map((id) => {
          const d = PM.perks[id], lv = M.pitPerk(id), full = lv >= d.max, can = !full && free >= d.cost;
          return h('div.pm-card.t-' + d.tier + (full ? '.full' : can ? '.can' : '') + (lv ? '' : '.zero') + (openId === id ? '.sel' : ''), { 'data-id': id, onclick: () => { click(); openId = id; draw(); } },
            h('div.pm-n', t('pit.pk.' + id)), h('div.pm-icw', A.img(d.icon, 'pm-ic')), h('div.pm-cost', d.cost), h('div.pm-lvl', lv + '/' + d.max));
        })),
        h('div.mact',
          M.masteryPass() ? h('div.pm-pass.on', A.img('pm_pass', 'ci'), h('b', t('mpass.on')))
            : h('div.pm-pass', { onclick: async () => { click(); if (await DH.iap.buy('masterypass')) draw(); } },
              A.img('pm_pass'), h('div.grow', h('b', t('product.masterypass')), h('div.small', t('mpass.desc'))), h('span.btn.small.green', DH.iap.price('masterypass'))),
          h('div.btns', h('button.btn.ghost', { onclick: reset }, t('cons.reset')), h('button.btn.gold', { onclick: () => m.close() }, t('common.close')))));
      m.set(root);
      if (openId) requestAnimationFrame(() => showPop(openId));
    };
    const num = (id, n) => { const d = PM.perks[id]; return id === 'time' || id === 'entry' ? d.per * n : id === 'sweep' ? Math.round(Math.min(1, E.PIT.sweep + d.per * n) * 100) : Math.round(d.per * n * 100); };
    /** The card's text with its number picked out in green. */
    const desc = (id, n) => { const parts = t('pit.pkd.' + id, { v: '\u0001' }).split('\u0001'); return [parts[0], h('b.good', String(num(id, n))), parts.slice(1).join('')]; };
    const showPop = (id) => {
      const old = root.querySelector('.pm-pop'); if (old) old.remove();
      const cardEl = root.querySelector('.pm-card[data-id="' + id + '"]'); if (!cardEl) return;
      const d = PM.perks[id], lv = M.pitPerk(id), full = lv >= d.max, can = !full && M.pitPointsFree() >= d.cost;
      const up = async () => {
        if (full) return;
        if (M.pitPointsFree() < d.cost) { ui.toast(t('pit.noPoints'), 'bad'); return; }
        const r = await ui.act('pitPerkUp', { id }); if (r) { DH.audio.play('buy'); draw(); }
      };
      const down = async () => { if (!lv) return; const r = await ui.act('pitPerkDown', { id }); if (r != null) { DH.audio.play('coin'); draw(); } };
      const pop = h('div.pm-pop.t-' + d.tier,
        h('div.pp-panel',
          h('button.pp-x', { onclick: () => { click(); openId = null; pop.remove(); draw(); }, 'aria-label': t('common.close') }, '×'),
          h('div.pp-t', t('pit.pk.' + id)),
          h('div.pp-lv', t('pit.lvOf', { n: lv, m: d.max })),
          h('div.pp-d', desc(id, lv || 1), lv ? null : h('span.muted', ' ' + t('pit.atLv1'))),
          !full && lv ? h('div.pp-next', t('pit.nextLv') + ': ', desc(id, lv + 1)) : null,
          h('div.pp-cost', full ? h('span.good', t('cons.full')) : t('pit.costPer', { n: d.cost }))),
        h('div.pp-btns',
          h('button.pp-b.minus' + (lv ? '' : '.off'), { onclick: down, 'aria-label': t('cons.sell1') }, '−'),
          h('button.pp-b.plus' + (can ? '' : '.off'), { onclick: up, 'aria-label': t('cons.buy1') }, '+')));
      root.append(pop);
      const rr = root.getBoundingClientRect(), cr = cardEl.getBoundingClientRect(), z = rr.width / root.offsetWidth || 1; // (the window may be scaled)
      const cl = (cr.left - rr.left) / z, ct = (cr.top - rr.top) / z, cw = cr.width / z, W = root.offsetWidth, pw = Math.min(W - 4, Math.round(cw * 2.1));
      pop.style.width = pw + 'px';
      pop.style.left = Math.round(U.clamp(cl, 0, W - pw)) + 'px';
      pop.style.top = Math.round(Math.max(0, ct - pop.offsetHeight + 24)) + 'px'; // the buttons come down over the card's top edge
    };
    async function reset() {
      click();
      if (!M.pitPointsUsed()) { ui.toast(t('cons.nothing')); return; }
      if (!(await ui.confirm({ title: t('cons.reset'), body: t('pit.resetBody'), ok: t('cons.reset'), okCls: 'red' }))) return;
      if (await ui.act('pitPerkReset')) { DH.audio.play('coin'); draw(); }
    }
    draw();
  };

  /** The Pit's shop: today's free handful, then a few for an ad each (one card that turns over), and Essence for gems. */
  ui.openPitShop = () => {
    const S = E.PIT_SHOP;
    const m = ui.modal({ title: t('pitshop.title'), cls: 'resshop pitshop', body: () => h('div'), onClose: () => DH.events.off('meta', redraw) });
    const redraw = () => { if (!m.closed) draw(); };
    DH.events.on('meta', redraw);
    const ess = (n) => h('div.rs-items', h('div.rs-it', A.img('i_essence'), h('b', U.fmt(n))));
    const draw = () => {
      const free = M.pitFreeReady(), left = M.pitAdsLeft(), all = !free && left <= 0;
      const card = h('div.panel.rs-row' + (all ? '.done' : ''),
        h('div.grow', h('div.rs-t', all ? t('resshop.allTaken') : free ? t('pitshop.free') : t('pitshop.ad')), ess(free ? S.free.essence : S.ad.essence)),
        all ? h('button.btn.small.ghost.off', A.img('u_check', 'ci'), t('resshop.taken'))
          : free ? h('button.btn.small.gold', { onclick: async () => { const r = await ui.act('claimPitFree'); if (r) { DH.audio.play('reward'); ui.rewardPopup(t('pitshop.title'), r); } } }, t('common.claim'))
            : h('button.btn.small.ad', { onclick: async () => { const r = await ui.act('adPit'); if (r) ui.rewardPopup(t('pitshop.title'), r); } }, h('span.adtag', 'AD'), t('common.watch') + ' (' + left + ')'));
      const packs = S.packs.map((k, i) => {
        const n = M.pitPackLeft(i);
        return h('div.panel.rs-pack' + (n ? '' : '.done'),
          h('div.slot.rs-pico', A.img('i_essence')),
          h('div.grow', h('div.rs-t', t('product.' + k.id)), ess(k.essence), h('div.small.muted', t('pitshop.left', { n }))),
          n ? h('button.btn.small.gem', { onclick: async () => {
            const r = await ui.act('buyPitPack', { i }); if (r) { DH.audio.play('buy'); ui.rewardPopup(t('pitshop.title'), r); } else if (r === false) { ui.toast(t('common.notEnough'), 'bad'); }
          } }, A.img('i_gem'), k.gems) : h('button.btn.small.ghost.off', t('shop.soldOut')));
      });
      m.set(h('div', card, h('div.small.muted.center.rs-timer', t('resshop.daily', { t: U.fmtDuration(U.msToMidnight()) })), h('h3.sect.rs-sect', t('pitshop.packs')), packs));
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
        h('div', h('span', t('results.kills')), h('b', U.fmt(run.kills))), h('div', h('span', t('pit.best')), h('b', U.fmt(res.best))),
        h('div', h('span', t('pit.bestCombo')), h('b', '×' + U.fmt((P.combo && P.combo.best) || 0)))),
      h('div.goldline', h('span', t('pit.entryPay')), h('b', U.fmt(P.paid || 0))),
      h('div.goldline', h('span', t('pit.wavesPay')), h('b', U.fmt(res.paid || 0))),
      res.mastery ? h('div.center.goldtxt', { style: { fontWeight: 800, margin: '4px 0' } }, A.img('u_star', 'ci'), ' ' + t('pit.masteryUp', { n: M.pitMastery().lv })) : null,
      h('div.goldtotal', A.img('i_essence'), h('b', U.fmt(total))),
      res.failed ? h('div.small.center.bad', t('pit.notSent')) : null,
      h('div.btns', h('button.btn.gold', { onclick: () => { click(); m.close(); DH.game.toMenu(false); } }, t('common.continue')))) });
  };
})(window.DH);
