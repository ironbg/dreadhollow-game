/* The Dungeon's windows: its own screen (the levels, today's entries and vaults, a level's map and rewards, Enter,
 * Sweep, the Mastery, the boards), the start screen of a level and its results. */
(function (DH) {
  'use strict';
  const U = DH.util, h = U.h, E = DH.economy, M = DH.meta, A = DH.art, ui = DH.ui;
  const click = () => DH.audio.play('click');

  /** A level's start screen: the level, its catacombs and Lord, its hazards (tap one to read it), and Ready. The fight
   *  waits under it (run.state 'intro'); Ready offers the ad's reward, counts 3, 2, 1 and the first floor begins. */
  ui.openDunIntro = (run) => {
    DH.input.enable(false);
    const Q = run.dun;
    ui.modal({ closable: false, cls: 'pitintro dunintro', body: (m) => h('div',
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

  /** The level is over: won or lost, floors cleared, what it paid (gold, iron, quartz, chests opened, vaults), the best. */
  ui.openDunResults = (run, res) => {
    const hudEl = document.getElementById('hud'); if (hudEl) hudEl.classList.add('hidden');
    const Q = run.dun, won = !!res.won;
    const extras = (res.items || []).concat((Q.vault && Q.vault.paid) || []);
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

  /** The Dungeon's own window (built in full with the levels' strip: see below). */
  ui.openDungeon = (lvPick) => {
    let lv = Math.max(1, Math.min(M.dunBest() + 1, lvPick || M.dunBest() + 1)), n = 1;
    const m = ui.modal({ title: t('dun.name'), cls: 'dunwin', body: () => h('div') });
    const draw = () => {
      const left = M.dunLeft(), all = M.dunEntries(), best = M.dunBest(), hall = M.dunHall(lv), fx = M.dunAffixes(lv), first = lv > best, rw = M.dunReward(lv, first), lmax = M.dunLeapMax(lv);
      n = Math.max(1, Math.min(n, lmax, left));
      m.set(h('div.dun-body',
        h('div.dun-strip', h('button.btn.small.ghost', { onclick: () => { click(); lv = Math.max(1, lv - 1); draw(); } }, '‹'), h('b.dun-lv', t('dun.lvN', { n: lv })), h('button.btn.small.ghost', { onclick: () => { click(); lv = Math.min(best + 1, lv + 1); draw(); } }, '›')),
        h('div.small.center', t('stage.' + hall + '.name')),
        fx.length ? h('div.pi-fx', fx.map((k) => h('button.pi-f', { onclick: () => { click(); ui.fxOne(k); } }, A.img(ui.fxIcon(k)), h('span', t('pit.fx.' + k))))) : null,
        h('div.reward-list', M.rewardPreview({ gold: rw.gold, mats: rw.mats, quartz: rw.quartz }).map((e) => h('div.reward', h('div.slot', A.img(e.icon)), h('div.n', e.text)))),
        h('div.small.center.muted', t('dun.entries', { n: all - left, m: all }) + ' · ' + t('dun.vaults', { n: M.dunVaultsToday(), m: E.DUNGEON.vaultsPerDay })),
        h('button.btn.green.block.big', { onclick: () => { click(); m.close(); DH.game.startDungeon(lv, n); } }, t('dun.enter'))));
    };
    draw();
    return m;
  };
})(window.DH);
