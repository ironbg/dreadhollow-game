/* Players and the developer talking: Settings → Send feedback, the "What's new" window after an update, and the
 * developer's overview (Settings → Overview), shown only to accounts the server lists as admins (functions/insights.js). */
(function (DH) {
  'use strict';
  const U = DH.util, h = U.h, ui = DH.ui;
  const S = () => DH.save.data;
  const click = () => DH.audio.play('click');

  /* ---------------- Send feedback ---------------- */
  const KINDS = ['bug', 'idea', 'balance', 'other'];
  ui.openFeedback = () => {
    let kind = 'bug', busy = false;
    const area = h('textarea.fb-text', { maxlength: 1000, rows: 6, placeholder: t('fb.placeholder') });
    const count = h('div.small.muted.fb-count', '0 / 1000');
    area.addEventListener('input', () => { count.textContent = area.value.length + ' / 1000'; });
    const chips = h('div.fb-kinds', KINDS.map((k) => h('button.btn.tiny' + (k === kind ? '.gold' : '.ghost'), { 'data-k': k, onclick: (e) => {
      click(); kind = k; chips.querySelectorAll('button').forEach((b) => { const on = b.dataset.k === k; b.classList.toggle('gold', on); b.classList.toggle('ghost', !on); });
    } }, t('fb.kind.' + k))));
    const send = h('button.btn.green.block', { onclick: async () => {
      if (busy) return;
      const text = area.value.trim();
      if (text.length < 3) { ui.toast(t('fb.tooShort'), 'bad'); return; }
      busy = true; send.disabled = true;
      try {
        const s = S();
        await DH.server.call('feedback', { text, kind, v: DH.VERSION, lang: DH.i18n.current, hero: s.selectedHero, level: s.accountLevel || 0 });
        m.close(); DH.audio.play('reward'); ui.toast(t('fb.thanks'), 'good');
      } catch (e) {
        ui.toast(t(e && e.code === 'too-many' ? 'fb.tooMany' : 'fb.failed'), 'bad');
      } finally { busy = false; send.disabled = false; }
    } }, t('fb.send'));
    const m = ui.modal({ title: t('fb.title'), body: h('div',
      h('div.small', { style: { lineHeight: '1.45', marginBottom: '10px' } }, t('fb.intro')),
      chips, area, count, send,
      h('div.small.muted', { style: { marginTop: '10px', lineHeight: '1.4' } }, t('fb.note'))) });
    setTimeout(() => { try { area.focus(); } catch (e) { /* no keyboard */ } }, 200);
  };

  /* ---------------- What's new ---------------- */
  const SEEN = 'dh_seen_version';
  const readSeen = () => { try { return localStorage.getItem(SEEN); } catch (e) { return null; } };
  const writeSeen = (v) => { try { localStorage.setItem(SEEN, v); } catch (e) { /* storage blocked */ } };
  /** The notes of every release newer than the one this device last saw (none for a first start). */
  ui.whatsNewFor = (seen) => {
    if (!seen || !DH.changelog) return [];
    const cmp = DH.live && DH.live.cmp ? DH.live.cmp : (a, b) => (a === b ? 0 : a < b ? -1 : 1);
    return DH.changelog.filter((e) => cmp(e.v, seen) > 0 && cmp(e.v, DH.VERSION) <= 0);
  };
  ui.showWhatsNew = (entries) => {
    const lang = DH.i18n.current === 'bg' ? 'bg' : 'en';
    ui.modal({ title: t('news.title'), rays: true, body: (m) => h('div',
      entries.map((e) => h('div.news-ver',
        h('div.news-v', 'v' + e.v),
        h('ul.news-list', (e[lang] || e.en).map((line) => h('li', line))))),
      h('div.btns', h('button.btn.gold', { onclick: () => { click(); m.close(); } }, t('common.ok')))) });
  };
  /** Once the menu is free (no window open, not in a fight, the title gone), tell what changed since the last visit. */
  ui.checkWhatsNew = () => {
    const seen = readSeen();
    if (!seen) { writeSeen(DH.VERSION); return; } // a first start: nothing to compare with
    const list = ui.whatsNewFor(seen);
    if (!list.length) { if (seen !== DH.VERSION) writeSeen(DH.VERSION); return; }
    let tries = 0;
    const wait = () => {
      const busy = (DH.title && DH.title.el && DH.title.el.isConnected) || document.querySelector('.modal-bg') || (DH.game && DH.game.mode === 'run');
      if (busy) { if (++tries < 300) setTimeout(wait, 1000); return; }
      writeSeen(DH.VERSION); ui.showWhatsNew(list);
    };
    setTimeout(wait, 1500);
  };

  /* ---------------- the developer's overview ---------------- */
  DH.admin = { ok: false, uid: null };
  /** Ask the server whether this signed-in account may see the overview (a guest never may).
   *  force re-asks even when we already asked for this account — the admin list may have just changed. */
  const checkAdmin = (force, done) => {
    const u = DH.cloud && DH.cloud.user;
    if (!u || !u.email) { DH.admin.ok = false; DH.admin.uid = null; done && done(); return; }
    if (!force && DH.admin.uid === u.uid && DH.admin.ok) { done && done(); return; }
    DH.admin.uid = u.uid;
    DH.server.call('adminCheck', {}).then((r) => { DH.admin.ok = !!(r && r.admin); done && done(); })
      .catch(() => { DH.admin.uid = null; done && done(); });
  };
  /** Re-ask now (used when the Settings screen opens, so a stale "no" cannot stick for the session). */
  DH.admin.recheck = (done) => checkAdmin(true, done);
  DH.events.on('cloud', () => checkAdmin(false));

  const day = (k) => k.slice(8, 10) + '.' + k.slice(5, 7);
  const when = (ms) => { const d = new Date(ms); return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  const who = (o) => o.email || t('adm.guest') + ' ' + String(o.uid || '').slice(0, 6);
  const mins = (s) => Math.round((s || 0) / 60);
  ui.openAdmin = () => {
    let tab = 'days', days = 14, data = null, err = null;
    const box = h('div.adm');
    const m = ui.modal({ title: t('adm.title'), cls: 'wide', body: box });
    const load = async () => {
      data = null; err = null; draw();
      try { data = await DH.server.call('adminStats', { days }); } catch (e) { err = e && e.code; }
      if (!m.closed) draw();
    };
    const tabs = () => h('div.tabs', ['days', 'players', 'feedback'].map((k) => h('button' + (tab === k ? '.on' : ''), { onclick: () => { click(); tab = k; draw(); } }, t('adm.tab.' + k))));
    const range = () => h('div.btns.adm-range', [7, 14, 30].map((n) => h('button.btn.tiny' + (n === days ? '.gold' : '.ghost'), { onclick: () => { click(); days = n; load(); } }, t('adm.days', { n }))));
    const drawDays = () => {
      const max = Math.max(1, ...data.days.map((d) => d.players));
      const tot = data.days.reduce((a, d) => ({ players: Math.max(a.players, d.players), runs: a.runs + d.runs }), { players: 0, runs: 0 });
      return h('div',
        h('div.small.muted', t('adm.sumDays', { n: data.players.length, runs: U.fmt(tot.runs) })),
        data.days.slice().reverse().map((d) => h('div.adm-day',
          h('b', day(d.day)),
          h('div.adm-bar', h('i', { style: { width: (d.players / max * 100) + '%' } })),
          h('span.small', t('adm.dayLine', { n: d.players, app: d.app, web: d.web, runs: d.runs, min: mins(d.secs) })))));
    };
    const drawPlayers = () => h('div',
      h('div.small.muted', t('adm.playersNote')),
      data.players.length ? data.players.map((o) => h('div.adm-row',
        h('div.adm-who', who(o)),
        h('div.small.muted', t('adm.playerLine', { days: o.days, runs: o.runs, min: mins(o.secs), last: day(o.last), p: o.p === 'app' ? 'Android' : 'web', v: o.v || '?' }))))
        : h('div.small.muted', t('adm.none')));
    const drawFeedback = () => h('div',
      data.feedback.length ? data.feedback.map((f) => h('div.adm-row',
        h('div.small.muted', when(f.at) + ' · ' + t('fb.kind.' + (f.kind || 'other')) + ' · ' + who(f) + ' · v' + (f.v || '?') + ' ' + (f.p === 'app' ? 'Android' : 'web') + (f.hero ? ' · ' + t('hero.' + f.hero + '.name') : '')),
        h('div.adm-text', f.text),
        f.refused ? h('div.small.bad', t('adm.refused', { n: f.refused.n }) + ' ' + (f.refused.log.length ? f.refused.log : [{ why: f.refused.last, at: f.refused.lastAt }]).slice(-4).reverse()
          .map((x) => x.why + (x.stage ? ' (' + t('stage.' + x.stage + '.name') + (x.v ? ' v' + x.v : '') + ')' : '') + (x.at ? ' ' + when(x.at) : '')).join(' · ')) : null))
        : h('div.small.muted', t('adm.none')));
    const draw = () => {
      box.innerHTML = '';
      box.append(tabs(), range());
      if (err) box.append(h('div.small.bad', t(err === 'not-admin' ? 'adm.denied' : 'adm.failed')));
      else if (!data) box.append(h('div.small.muted', t('lb.loading')));
      else box.append(tab === 'days' ? drawDays() : tab === 'players' ? drawPlayers() : drawFeedback());
    };
    load();
  };
})(window.DH);
