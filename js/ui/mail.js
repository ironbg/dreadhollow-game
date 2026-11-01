/* What the developer sends to the players (the admin panel): messages and gifts waiting in the profile's inbox, and the
 * news in the live settings (live: news). Each is shown once, when the menus are free. Also the server's two stops:
 * a banned account and maintenance, each told once with their reason. */
(function (DH) {
  'use strict';
  const U = DH.util, h = U.h, ui = DH.ui, M = DH.meta;
  const S = () => DH.save.data;
  const lang = () => (DH.i18n.current === 'bg' ? 'bg' : 'en');
  /** A text given as a string or as { bg, en }. */
  const txt = (v) => (v && typeof v === 'object' ? v[lang()] || v.en || v.bg || '' : String(v || ''));
  const busy = () => (DH.title && DH.title.el && DH.title.el.isConnected) || document.querySelector('.modal-bg') || (DH.game && DH.game.mode === 'run');

  /** News of the live settings now open and not yet seen on this profile. */
  const newsDue = () => {
    const now = U.now(), seen = S().seen || {};
    return (((DH.live && DH.live.config) || {}).news || []).filter((n) => n && n.id && !seen['news_' + n.id]
      && (!n.start || Date.parse(n.start) <= now) && (!n.end || now < Date.parse(n.end)));
  };

  let showing = false, timer = null;
  /** Show the next waiting message, gift or news (one at a time; the next after it is closed). */
  ui.checkMail = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (showing) return;
      if (busy()) { timer = setTimeout(ui.checkMail, 2000); return; }
      const mail = (S().inbox || [])[0];
      if (mail) { show(mail); return; }
      const n = newsDue()[0];
      if (n) showNews(n);
    }, 900);
  };

  function show(m) {
    showing = true;
    const gift = m.kind === 'gift' && m.reward, items = gift ? M.rewardPreview(m.reward) : [];
    const done = () => { // gone from this copy at once (shown once even offline); the server's copy follows
      showing = false; const s = S(); s.inbox = (s.inbox || []).filter((x) => x.id !== m.id);
      Promise.resolve(ui.act('inboxRead', { id: m.id })).catch(() => {}).then(() => ui.checkMail());
    };
    if (gift) DH.audio.play('reward');
    ui.modal({
      title: txt(m.title) || t(gift ? 'mail.gift' : 'mail.note'), rays: !!gift, onClose: done,
      body: (md) => h('div',
        txt(m.msg) ? h('div.center.mail-msg', txt(m.msg)) : null,
        items.length ? h('div.reward-list', items.map((e) => h('div.reward', h('div.slot' + (e.rarity != null ? '.rar' + e.rarity : ''), DH.art.img(e.icon)), h('div.n', e.text)))) : null,
        h('div.small.muted.center', t('mail.from')),
        h('div.btns', h('button.btn.gold', { onclick: () => { DH.audio.play('click'); md.close(); } }, gift ? t('common.collect') : t('common.ok')))),
    });
  }

  function showNews(n) {
    showing = true;
    const s = S(); s.seen = s.seen || {}; s.seen['news_' + n.id] = U.now(); DH.save.persist();
    ui.modal({
      title: txt(n.title) || t('mail.news'), onClose: () => { showing = false; ui.checkMail(); },
      body: (md) => h('div',
        h('div.mail-msg', txt(n.text)),
        h('div.btns', h('button.btn.gold', { onclick: () => { DH.audio.play('click'); md.close(); } }, t('common.ok')))),
    });
  }

  /* the server turned the game away: banned, or under maintenance (told once a session each, with the reason) */
  const told = {};
  DH.events.on('server:blocked', (e) => {
    if (told[e.code] && Date.now() - told[e.code] < 60e3) return;
    told[e.code] = Date.now();
    const reason = (e.details && e.details.reason) || '';
    ui.modal({
      title: t(e.code === 'banned' ? 'server.bannedTitle' : 'server.maintTitle'),
      body: (md) => h('div',
        h('div.center.mail-msg', t(e.code === 'banned' ? 'server.banned' : 'server.maint')),
        reason ? h('div.center.note', reason) : null,
        h('div.btns', h('button.btn.gold', { onclick: () => md.close() }, t('common.ok')))),
    });
  });

  DH.events.on('meta', () => ui.checkMail());
  DH.events.on('menu', () => ui.checkMail());
  DH.events.on('live', () => ui.checkMail());
})(window.DH);
