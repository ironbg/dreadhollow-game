/* The developer's panel (Settings → Admin panel, for the emails in admin/access only). A full screen over the game:
 *   Dashboard  players a day, new accounts, fights, minutes, purchases, open messages, versions in use
 *   Players    search (name, email, account id) and each player: profile, account, purchases, messages, refused
 *              fights; give a gift with a message, set gold / gems / torches / level, send a message, ban, clear the
 *              refused fights, close a stuck fight, take off the leaderboards, reset progress, delete the account
 *   Messages   the players' feedback: filter, mark handled, delete, open the player
 *   Store      the latest purchases and the totals by product
 *   Live       maintenance, minimum versions, ad checks, news, gifts to everyone, and any other live setting (JSON)
 *   Admins     who may open this panel; Log: every change made here, by whom
 * Everything goes through the server's `admin` call (functions/admin.js), which checks the admin again each time. */
(function (DH) {
  'use strict';
  const U = DH.util, h = U.h, ui = DH.ui, E = DH.economy, C = DH.content, A = DH.art;

  /* ---------- the panel's own words (not the players' strings) ---------- */
  const L = {
    bg: {
      title: 'Админ панел', close: 'Затвори', loading: 'Зарежда…', failed: 'Неуспешно: ', saved: 'Записано', sent: 'Изпратено', done: 'Готово', back: '← Назад',
      t_dash: 'Табло', t_players: 'Играчи', t_feedback: 'Съобщения', t_store: 'Магазин', t_live: 'На живо', t_admins: 'Админи', t_log: 'Дневник',
      days: '{n} дни', players: 'Играчи', newp: 'Нови', fights: 'Битки', minutes: 'Минути', buys: 'Покупки', fbOpen: 'Неотговорени съобщения', refusedN: 'Играчи с отказани битки', maint: 'Профилактика',
      on: 'ВКЛ', off: 'изкл', day: 'Ден', appweb: 'Android / уеб', versions: 'Версии в употреба', products: 'Покупки по продукт',
      search: 'Име, имейл или ID на акаунт', find: 'Търси', recent: 'Последни играчи', none: 'Няма резултати.', guest: 'Гост',
      acc: 'Акаунт', email: 'Имейл', provider: 'Вход', created: 'Създаден', lastIn: 'Последен вход', updated: 'Последна промяна', version: 'Версия',
      level: 'Ниво', gold: 'Злато', gems: 'Диаманти', torches: 'Факли', heroes: 'Герои', gear: 'Реликви', mats: 'Метали', pass: 'Боен пропуск', premium: 'премиум',
      cleared: 'Минати зали', runs: 'Битки', wins: 'Победи', kills: 'Убийства', deeds: 'Подвизи', spent: 'Похарчено (покупки)', inbox: 'Непрочетени съобщения', banned: 'БЛОКИРАН',
      refused: 'Отказани битки', purchasesOf: 'Покупки', fbOf: 'Съобщения от играча', run: 'Открита битка',
      giftH: 'Подарък', giftMsg: 'Съобщение към играча (по желание)', relic: 'Реликва', chest: 'Сандък', hero: 'Герой', noneSel: '—', passXp: 'Опит за пропуска', give: 'Изпрати подаръка',
      setH: 'Задай стойности', setHint: 'Празно поле = без промяна', save: 'Запиши',
      msgH: 'Само съобщение', send: 'Изпрати',
      banH: 'Блокиране', reason: 'Причина (играчът я вижда)', ban: 'Блокирай', unban: 'Отблокирай',
      toolsH: 'Инструменти', clearFlags: 'Изчисти отказаните битки', endRun: 'Затвори висяща битка', unboard: 'Махни от класациите',
      reset: 'Нулирай прогреса', resetQ: 'Прогресът на този играч започва отначало (покупките остават). Сигурен ли си?',
      wipe: 'Изтрий акаунта', wipeQ: 'Напиши ID-то на акаунта, за да потвърдиш изтриването:', wipeAuth: 'Изтрий и входа (Google/имейл)',
      raw: 'Покажи профила (JSON)', copy: 'Копирай', copied: 'Копирано', openPlayer: 'Играч',
      st_open: 'Отворено', st_done: 'Готово', st_later: 'По-късно', all: 'Всички', del: 'Изтрий', delQ: 'Да изтрия ли това съобщение?',
      k_bug: 'Бъг', k_idea: 'Идея', k_balance: 'Баланс', k_other: 'Друго',
      test: 'тест', order: 'Поръчка', total: 'Общо',
      maintH: 'Профилактика', maintHint: 'Докато е включена, играчите не могат да влизат и да започват битки (битка и покупка, вече направени, се приключват). Админите влизат.', msgText: 'Текст (вижда се на всеки език)',
      verH: 'Версии', webMin: 'Уеб: минимална', appMin: 'Приложение: минимална', appLatest: 'Приложение: най-нова', verHint: 'По-стара версия от минималната трябва да се обнови.',
      adsH: 'Реклами', adsVerify: 'Сървърът плаща реклама само след потвърждение от AdMob',
      newsH: 'Новини', newsHint: 'Показват се веднъж на всеки играч в менюто, докато са активни.', titleOne: 'Заглавие', start: 'От (UTC)', end: 'До (UTC)', add: 'Добави', remove: 'Махни',
      giftsH: 'Подарък за всички', giftsHint: 'Всеки играч го получава веднъж при следващото влизане, докато е активен, със съобщението.',
      jsonH: 'Всички настройки на живо (JSON)', jsonHint: 'Ключовете тук заместват тези от live.json. Внимавай: грешна настройка засяга всички играчи.', effective: 'В сила в момента', base: 'live.json от последното качване',
      adminsHint: 'Само тези имейли (потвърдени, или с вход през Google) отварят панела. Своя имейл не можеш да махнеш.', addEmail: 'Добави имейл',
      who: 'Кой', what: 'Действие', target: 'Обект', details: 'Подробности', when: 'Кога',
      empty: 'Няма какво да се запише.', sure: 'Сигурен ли си?', yes: 'Да', no: 'Не', uidCopy: 'ID',
    },
    en: {
      title: 'Admin panel', close: 'Close', loading: 'Loading…', failed: 'Failed: ', saved: 'Saved', sent: 'Sent', done: 'Done', back: '← Back',
      t_dash: 'Dashboard', t_players: 'Players', t_feedback: 'Messages', t_store: 'Store', t_live: 'Live', t_admins: 'Admins', t_log: 'Log',
      days: '{n} days', players: 'Players', newp: 'New', fights: 'Fights', minutes: 'Minutes', buys: 'Purchases', fbOpen: 'Open messages', refusedN: 'Players with refused fights', maint: 'Maintenance',
      on: 'ON', off: 'off', day: 'Day', appweb: 'Android / web', versions: 'Versions in use', products: 'Purchases by product',
      search: 'Name, email or account id', find: 'Search', recent: 'Latest players', none: 'Nothing found.', guest: 'Guest',
      acc: 'Account', email: 'Email', provider: 'Sign-in', created: 'Created', lastIn: 'Last sign-in', updated: 'Last change', version: 'Version',
      level: 'Level', gold: 'Gold', gems: 'Gems', torches: 'Torches', heroes: 'Heroes', gear: 'Relics', mats: 'Metals', pass: 'Battle Pass', premium: 'premium',
      cleared: 'Halls cleared', runs: 'Fights', wins: 'Wins', kills: 'Kills', deeds: 'Deeds', spent: 'Spent (purchases)', inbox: 'Unread messages', banned: 'BANNED',
      refused: 'Refused fights', purchasesOf: 'Purchases', fbOf: 'Messages from the player', run: 'Open fight',
      giftH: 'Gift', giftMsg: 'Message to the player (optional)', relic: 'Relic', chest: 'Chest', hero: 'Hero', noneSel: '—', passXp: 'Pass XP', give: 'Send the gift',
      setH: 'Set values', setHint: 'Empty field = no change', save: 'Save',
      msgH: 'Message only', send: 'Send',
      banH: 'Ban', reason: 'Reason (the player sees it)', ban: 'Ban', unban: 'Unban',
      toolsH: 'Tools', clearFlags: 'Clear refused fights', endRun: 'Close a stuck fight', unboard: 'Take off the leaderboards',
      reset: 'Reset progress', resetQ: 'This player starts over (purchases stay). Are you sure?',
      wipe: 'Delete the account', wipeQ: 'Type the account id to confirm the deletion:', wipeAuth: 'Delete the sign-in too (Google/email)',
      raw: 'Show the profile (JSON)', copy: 'Copy', copied: 'Copied', openPlayer: 'Player',
      st_open: 'Open', st_done: 'Done', st_later: 'Later', all: 'All', del: 'Delete', delQ: 'Delete this message?',
      k_bug: 'Bug', k_idea: 'Idea', k_balance: 'Balance', k_other: 'Other',
      test: 'test', order: 'Order', total: 'Total',
      maintH: 'Maintenance', maintHint: 'While on, players cannot come in or start fights (a fight or purchase already made is still settled). Admins come in.', msgText: 'Text (shown in every language)',
      verH: 'Versions', webMin: 'Web: minimum', appMin: 'App: minimum', appLatest: 'App: newest', verHint: 'A version older than the minimum must update.',
      adsH: 'Ads', adsVerify: 'The server pays an ad only once AdMob confirms it',
      newsH: 'News', newsHint: 'Shown once to every player in the menus while open.', titleOne: 'Title', start: 'From (UTC)', end: 'Until (UTC)', add: 'Add', remove: 'Remove',
      giftsH: 'Gift to everyone', giftsHint: 'Every player gets it once at their next visit while it is open, with its message.',
      jsonH: 'All live settings (JSON)', jsonHint: 'Keys here replace those of live.json. Careful: a wrong setting reaches every player.', effective: 'In effect now', base: 'live.json as last deployed',
      adminsHint: 'Only these emails (verified, or signed in with Google) open the panel. You cannot remove your own.', addEmail: 'Add an email',
      who: 'Who', what: 'Action', target: 'Target', details: 'Details', when: 'When',
      empty: 'Nothing to save.', sure: 'Are you sure?', yes: 'Yes', no: 'No', uidCopy: 'ID',
    },
  };
  const tx = (k, a) => { let s = (L[DH.i18n.current === 'bg' ? 'bg' : 'en'][k]) || k; for (const x in a || {}) s = s.replace('{' + x + '}', a[x]); return s; };
  /** A text as kept: one string, or an older { bg, en } pair (the panel now writes one string for every language). */
  const one = (v) => (v && typeof v === 'object' ? v.bg || v.en || '' : String(v || ''));
  const call = (op, args) => DH.server.call('admin', Object.assign({ op }, args || {}));
  const when = (ms) => { if (!ms) return '—'; const d = new Date(typeof ms === 'number' ? ms : Date.parse(ms)); return isNaN(d) ? String(ms) : d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  const day = (k) => k.slice(8, 10) + '.' + k.slice(5, 7);
  const fmt = (n) => U.fmt(Math.round(n || 0));
  const errText = (e) => (e && (e.code || e.message)) || String(e);
  const toastErr = (e) => ui.toast(tx('failed') + errText(e), 'bad');
  const input = (ph, val, type) => h('input.ap-in', { placeholder: ph || '', value: val == null ? '' : val, type: type || 'text' });
  const area = (ph, val, rows) => h('textarea.ap-in', { placeholder: ph || '', rows: rows || 3 }, val || '');
  const select = (opts, val) => h('select.ap-in', opts.map(([v, l]) => h('option', { value: v, selected: String(v) === String(val) }, l)));
  const btn = (label, fn, cls) => h('button.btn.small' + (cls ? '.' + cls : '.ghost'), { onclick: async (e) => { const b = e.currentTarget; if (b.disabled) return; b.disabled = true; try { await fn(); } catch (er) { toastErr(er); } finally { b.disabled = false; } } }, label);
  const sect = (title, ...kids) => h('div.ap-sect', h('div.ap-h', title), ...kids);
  const kv = (k, v) => h('div.ap-kv', h('span.k', k), h('span.v', v == null || v === '' ? '—' : v));
  const sure = (body) => ui.confirm({ title: tx('sure'), body, ok: tx('yes'), cancel: tx('no'), okCls: 'red' });
  const copy = (text) => { try { navigator.clipboard.writeText(text).then(() => ui.toast(tx('copied'))); } catch (e) { /* no clipboard */ } };

  let root = null, body = null, tab = 'dash', days = 14;
  const nav = [];
  function open() {
    if (root && root.isConnected) return;
    tab = 'dash'; nav.length = 0;
    const tabs = h('div.ap-tabs', ['dash', 'players', 'feedback', 'store', 'live', 'admins', 'log'].map((k) => h('button' + (k === tab ? '.on' : ''), { 'data-t': k, onclick: () => { DH.audio.play('click'); go(k); } }, tx('t_' + k))));
    body = h('div.ap-body');
    root = h('div.ap', h('div.ap-top', h('div.ap-title', tx('title')), h('button.btn.small.red', { onclick: close }, tx('close'))), tabs, body);
    document.getElementById('modals').appendChild(root);
    go('dash');
  }
  function close() { if (root) root.remove(); root = null; }
  function go(k, arg) {
    tab = k; nav.length = 0;
    root.querySelectorAll('.ap-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === k));
    show(PAGES[k], arg);
  }
  /** Draw a page: a function (arg) => Promise<element>. Back returns to the page before (in the same tab). */
  async function show(page, arg, push) {
    if (push) nav.push(push);
    body.replaceChildren(h('div.ap-muted', tx('loading')));
    body.scrollTop = 0;
    try { const el = await page(arg); if (root) body.replaceChildren(el); } catch (e) { body.replaceChildren(h('div.ap-bad', tx('failed') + errText(e))); }
  }
  const back = () => { const p = nav.pop(); if (p) show(p.page, p.arg); };

  /* ================= Dashboard ================= */
  async function pageDash() {
    const d = await call('dash', { days });
    const tot = d.days.reduce((a, r) => ({ runs: a.runs + r.runs, secs: a.secs + r.secs, fresh: a.fresh + (r.fresh || 0) }), { runs: 0, secs: 0, fresh: 0 });
    const card = (label, v, cls) => h('div.ap-card' + (cls ? '.' + cls : ''), h('b', v), h('span', label));
    const max = Math.max(1, ...d.days.map((r) => r.players));
    return h('div',
      h('div.ap-row', [7, 14, 30].map((n) => h('button.btn.tiny' + (n === days ? '.gold' : '.ghost'), { onclick: () => { days = n; go('dash'); } }, tx('days', { n })))),
      h('div.ap-cards',
        card(tx('players'), fmt(d.players)), card(tx('newp'), fmt(tot.fresh)), card(tx('fights'), fmt(tot.runs)), card(tx('minutes'), fmt(tot.secs / 60)),
        card(tx('buys'), fmt(d.buys) + (d.test ? ' (' + d.test + ' ' + tx('test') + ')' : '')), card(tx('fbOpen'), fmt(d.fbOpen), d.fbOpen ? 'warn' : ''),
        card(tx('refusedN'), fmt(d.refused), d.refused ? 'warn' : ''), card(tx('maint'), d.maintenance ? tx('on') : tx('off'), d.maintenance ? 'bad' : '')),
      h('table.ap-table', h('tr', [tx('day'), tx('players'), tx('appweb'), tx('newp'), tx('fights'), tx('minutes'), tx('buys')].map((x) => h('th', x))),
        d.days.slice().reverse().map((r) => h('tr', h('td', day(r.day)),
          h('td', h('div.ap-bar', h('i', { style: { width: (r.players / max * 100) + '%' } }), h('span', r.players))), h('td', r.app + ' / ' + r.web),
          h('td', r.fresh || 0), h('td', r.runs), h('td', Math.round(r.secs / 60)), h('td', r.buys || 0)))),
      sect(tx('versions'), h('div.ap-chips', Object.entries(d.versions).sort((a, b) => b[1] - a[1]).map(([k, n]) => h('span.ap-chip', k + ' · ' + n)))),
      sect(tx('products'), Object.keys(d.byProduct).length ? h('div.ap-chips', Object.entries(d.byProduct).sort((a, b) => b[1] - a[1]).map(([k, n]) => h('span.ap-chip', k + ' · ' + n))) : h('div.ap-muted', tx('none'))));
  }

  /* ================= Players ================= */
  let lastQ = '';
  async function pagePlayers(q) {
    q = q == null ? lastQ : q; lastQ = q;
    const inp = input(tx('search'), q);
    const doSearch = () => show(pagePlayers, inp.value.trim());
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
    const r = await call('players', q ? { q } : { days: 30 });
    return h('div',
      h('div.ap-row', inp, btn(tx('find'), doSearch, 'gold')),
      !q ? h('div.ap-sub', tx('recent')) : null,
      r.list.length ? h('div.ap-list', r.list.map((o) => h('div.ap-item', { onclick: () => show(pagePlayer, o.uid, { page: pagePlayers, arg: q }) },
        h('div.ap-name', o.name || o.email || (tx('guest') + ' ' + String(o.uid).slice(0, 6))),
        h('div.ap-muted', [o.email && o.name ? o.email : null, o.uid, o.days != null ? o.days + 'd · ' + o.runs + ' ' + tx('fights').toLowerCase() + ' · ' + Math.round((o.secs || 0) / 60) + ' min' : null,
          o.last ? day(o.last) : null, o.p ? (o.p === 'app' ? 'Android' : 'web') + ' ' + (o.v || '') : null].filter(Boolean).join(' · ')))))
        : h('div.ap-muted', tx('none')));
  }

  async function pagePlayer(uid) {
    const d = await call('player', { uid }), s = d.summary, a = d.account || {};
    const reload = () => show(pagePlayer, uid);
    const heroOpts = [['', tx('noneSel')]].concat(C.heroOrder.map((x) => [x, t('hero.' + x + '.name')]));
    const rarOpts = [['', tx('noneSel')]].concat(E.rarities.map((r, i) => [i, t('rarity.' + r)]));
    const chestOpts = [['', tx('noneSel')]].concat(Object.keys(E.chests).map((c) => [c, t('chest.' + c)]));
    // the gift form
    const g = { gold: input(tx('gold'), '', 'number'), gems: input(tx('gems'), '', 'number'), energy: input(tx('torches'), '', 'number'), passXp: input(tx('passXp'), '', 'number') };
    const gm = {}; E.materials.forEach((k) => { gm[k] = input(t('mat.' + k), '', 'number'); });
    const gRar = select(rarOpts, ''), gChest = select(chestOpts, ''), gHero = select(heroOpts, ''), gMsg = area(tx('giftMsg'));
    const give = async () => {
      const rw = {}; for (const k in g) if (+g[k].value > 0) rw[k] = +g[k].value;
      const mats = {}; for (const k in gm) if (+gm[k].value > 0) mats[k] = +gm[k].value; if (Object.keys(mats).length) rw.mats = mats;
      if (gRar.value !== '') rw.gear = { rarity: +gRar.value }; if (gChest.value) rw.chest = gChest.value; if (gHero.value) rw.hero = gHero.value;
      if (!Object.keys(rw).length) { ui.toast(tx('empty'), 'bad'); return; }
      await call('grant', { uid, reward: rw, msg: gMsg.value.trim() }); ui.toast(tx('sent'), 'good'); reload();
    };
    // set values
    const sv = { gold: input(String(s.gold), '', 'number'), gems: input(String(s.gems), '', 'number'), energy: input(String(s.energy), '', 'number'), accountLevel: input(String(s.level), '', 'number') };
    const setv = async () => { const o = { uid }; let any = false; for (const k in sv) if (sv[k].value !== '') { o[k] = +sv[k].value; any = true; } if (!any) { ui.toast(tx('empty'), 'bad'); return; } await call('setv', o); ui.toast(tx('saved'), 'good'); reload(); };
    const msgIn = area(tx('msgH'));
    const banIn = input(tx('reason'), d.ban ? d.ban.reason : '');
    const rawBox = h('div');
    const showRaw = async () => { const r = await call('player', { uid, raw: true }); const pretty = JSON.stringify(JSON.parse(r.raw), null, 1); rawBox.replaceChildren(h('div.ap-row', btn(tx('copy'), () => copy(pretty))), h('pre.ap-pre', pretty)); };
    const heroes = s.heroes.map((x) => t('hero.' + x + '.name')).join(', ');
    const cleared = C.stageOrder.filter((st) => s.cleared[st]).map((st) => (C.stageOrder.indexOf(st) + 1) + '×' + s.cleared[st]).join('  ');
    const flags = d.flags || {}, log = flags.log || (flags.last ? [{ why: flags.last, at: flags.lastAt }] : []);
    return h('div',
      h('div.ap-row', h('button.btn.tiny.ghost', { onclick: back }, tx('back'))),
      h('div.ap-ptop', h('div.ap-name.big', s.name || tx('guest')), d.ban ? h('span.ap-ban', tx('banned')) : null,
        h('div.ap-muted', h('span', uid), ' ', h('button.btn.tiny.ghost', { onclick: () => copy(uid) }, tx('copy')))),
      h('div.ap-grid',
        kv(tx('email'), a.email || (a.guest ? tx('guest') : null)), kv(tx('provider'), (a.providers || []).join(', ')), kv(tx('created'), a.created ? when(a.created) : when(d.created)),
        kv(tx('lastIn'), a.lastSignIn ? when(a.lastSignIn) : null), kv(tx('updated'), when(d.updated)), kv(tx('version'), d.v ? String(d.v) : null),
        kv(tx('level'), s.level), kv(tx('gold'), fmt(s.gold)), kv(tx('gems'), fmt(s.gems)), kv(tx('torches'), s.energy),
        kv(tx('heroes'), s.heroes.length + ' — ' + heroes), kv(tx('gear'), s.gear + ' (' + s.gearByRarity.join(' / ') + ')'),
        kv(tx('mats'), E.materials.map((k) => t('mat.' + k) + ' ' + (s.mats[k] || 0)).join(', ')),
        kv(tx('pass'), s.pass.tier + ' / ' + (E.PASS_TIERS || 60) + (s.pass.premium ? ' · ' + tx('premium') : '')), kv(tx('cleared'), cleared),
        kv(tx('runs'), s.stats.runs), kv(tx('wins'), s.stats.wins), kv(tx('kills'), fmt(s.stats.kills)), kv(tx('deeds'), s.deeds),
        kv(tx('spent'), s.purchases.total ? '$' + (+s.purchases.total).toFixed(2) : null), kv(tx('inbox'), s.inbox),
        d.run ? kv(tx('run'), t('stage.' + d.run.stage + '.name') + ' · ' + when(d.run.start)) : null),
      d.ban ? h('div.ap-bad', tx('banned') + ': ' + (d.ban.reason || '') + ' · ' + (d.ban.by || '') + ' · ' + when(d.ban.at)) : null,
      log.length ? sect(tx('refused') + ' (' + (flags.invalidRuns || log.length) + ')', h('div.ap-list', log.slice().reverse().map((x) => h('div.ap-item.flat', h('b', x.why), ' ', h('span.ap-muted', [x.stage ? t('stage.' + x.stage + '.name') : null, x.v ? 'v' + x.v : null, when(x.at)].filter(Boolean).join(' · ')))))) : null,
      sect(tx('giftH'),
        h('div.ap-form', Object.values(g), Object.values(gm)),
        h('div.ap-form', h('label', tx('relic'), gRar), h('label', tx('chest'), gChest), h('label', tx('hero'), gHero)),
        gMsg, h('div.ap-row', btn(tx('give'), give, 'gold'))),
      sect(tx('setH'), h('div.ap-muted', tx('setHint')),
        h('div.ap-form', h('label', tx('gold'), sv.gold), h('label', tx('gems'), sv.gems), h('label', tx('torches'), sv.energy), h('label', tx('level'), sv.accountLevel)),
        h('div.ap-row', btn(tx('save'), setv, 'gold'))),
      sect(tx('msgH'), msgIn, h('div.ap-row', btn(tx('send'), async () => { if (!msgIn.value.trim()) return; await call('message', { uid, msg: msgIn.value.trim() }); ui.toast(tx('sent'), 'good'); reload(); }, 'gold'))),
      sect(tx('banH'), banIn, h('div.ap-row',
        d.ban ? btn(tx('unban'), async () => { await call('unban', { uid }); ui.toast(tx('done'), 'good'); reload(); }, 'green')
          : btn(tx('ban'), async () => { if (!(await sure(tx('ban') + '?'))) return; await call('ban', { uid, reason: banIn.value.trim() }); ui.toast(tx('done'), 'good'); reload(); }, 'red'))),
      sect(tx('toolsH'), h('div.ap-row.wrap',
        btn(tx('clearFlags'), async () => { await call('flags', { uid }); ui.toast(tx('done'), 'good'); reload(); }),
        btn(tx('endRun'), async () => { await call('endrun', { uid }); ui.toast(tx('done'), 'good'); reload(); }),
        btn(tx('unboard'), async () => { if (!(await sure(tx('unboard') + '?'))) return; const r = await call('unboard', { uid }); ui.toast(tx('done') + ' (' + r.boards + ')', 'good'); }),
        btn(tx('reset'), async () => { if (!(await sure(tx('resetQ')))) return; await call('reset', { uid }); ui.toast(tx('done'), 'good'); reload(); }, 'red'),
        btn(tx('wipe'), () => wipeDialog(uid), 'red'),
        btn(tx('raw'), showRaw)), rawBox),
      d.purchases.length ? sect(tx('purchasesOf'), h('div.ap-list', d.purchases.map((p) => h('div.ap-item.flat', h('b', p.productId), ' ', h('span.ap-muted', [when(p.at), p.test ? tx('test') : null, p.orderId].filter(Boolean).join(' · ')))))) : null,
      d.feedback.length ? sect(tx('fbOf'), h('div.ap-list', d.feedback.map((f) => h('div.ap-item.flat', h('div.ap-muted', when(f.at) + ' · ' + tx('k_' + (f.kind || 'other')) + ' · v' + (f.v || '?') + ' · ' + tx('st_' + (f.status || 'open'))), h('div', f.text))))) : null);
  }
  function wipeDialog(uid) {
    const inp = input(uid), chk = h('input', { type: 'checkbox' });
    const m = ui.modal({ title: tx('wipe'), body: h('div',
      h('div.ap-muted', tx('wipeQ')), inp, h('label.ap-check', chk, ' ', tx('wipeAuth')),
      h('div.btns', h('button.btn.ghost', { onclick: () => m.close() }, tx('no')),
        h('button.btn.red', { onclick: async () => { if (inp.value.trim() !== uid) { ui.toast(tx('wipeQ'), 'bad'); return; } try { await call('wipe', { uid, confirm: uid, auth: chk.checked }); m.close(); ui.toast(tx('done'), 'good'); go('players'); } catch (e) { toastErr(e); } } }, tx('wipe')))) });
  }

  /* ================= Messages (feedback) ================= */
  let fbStatus = 'open', fbKind = '';
  async function pageFeedback() {
    const r = await call('feedback', { status: fbStatus === 'all' ? '' : fbStatus, kind: fbKind, limit: 300 });
    const pill = (v, cur, set, label) => h('button.btn.tiny' + (v === cur ? '.gold' : '.ghost'), { onclick: () => { set(v); show(pageFeedback); } }, label);
    const setStatus = async (f, st) => { await call('fbset', { id: f.id, status: st }); show(pageFeedback); };
    return h('div',
      h('div.ap-row.wrap', ['open', 'later', 'done', 'all'].map((v) => pill(v, fbStatus, (x) => { fbStatus = x; }, v === 'all' ? tx('all') : tx('st_' + v)))),
      h('div.ap-row.wrap', ['', 'bug', 'idea', 'balance', 'other'].map((v) => pill(v, fbKind, (x) => { fbKind = x; }, v ? tx('k_' + v) : tx('all')))),
      r.list.length ? h('div.ap-list', r.list.map((f) => h('div.ap-item.flat',
        h('div.ap-muted', [when(f.at), tx('k_' + (f.kind || 'other')), 'v' + (f.v || '?') + ' ' + (f.p === 'app' ? 'Android' : 'web'), f.hero ? t('hero.' + f.hero + '.name') : null, f.level ? tx('level') + ' ' + f.level : null].filter(Boolean).join(' · ')),
        h('div.ap-text', f.text),
        h('div.ap-row.wrap',
          ['open', 'later', 'done'].map((st) => h('button.btn.tiny' + ((f.status || 'open') === st ? '.gold' : '.ghost'), { onclick: () => setStatus(f, st).catch(toastErr) }, tx('st_' + st))),
          f.uid ? h('button.btn.tiny.blue', { onclick: () => show(pagePlayer, f.uid, { page: pageFeedback }) }, tx('openPlayer')) : null,
          h('button.btn.tiny.red', { onclick: async () => { if (!(await sure(tx('delQ')))) return; try { await call('fbdel', { id: f.id }); show(pageFeedback); } catch (e) { toastErr(e); } } }, tx('del'))))))
        : h('div.ap-muted', tx('none')));
  }

  /* ================= Store ================= */
  async function pageStore() {
    const r = await call('purchases', { limit: 300 });
    return h('div',
      sect(tx('total'), Object.keys(r.totals).length ? h('table.ap-table', Object.entries(r.totals).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => h('tr', h('td', k), h('td', String(v.n)), h('td.ap-muted', v.test ? v.test + ' ' + tx('test') : '')))) : h('div.ap-muted', tx('none'))),
      sect(tx('buys'), r.list.length ? h('div.ap-list', r.list.map((p) => h('div.ap-item', { onclick: () => p.uid && show(pagePlayer, p.uid, { page: pageStore }) },
        h('b', p.productId), ' ', h('span.ap-muted', [when(p.at), p.test ? tx('test') : null, p.orderId ? tx('order') + ' ' + p.orderId : null, p.uid].filter(Boolean).join(' · '))))) : h('div.ap-muted', tx('none'))));
  }

  /* ================= Live settings ================= */
  const iso = (v) => (v ? String(v).slice(0, 16) : '');
  const toIso = (v) => (v ? new Date(v + (v.length <= 16 ? ':00Z' : '')).toISOString() : undefined);
  async function pageLive() {
    const r = await call('live'), o = JSON.parse(JSON.stringify(r.override || {})), eff = r.effective || {};
    const saveO = async (next) => { await call('liveset', { override: next }); ui.toast(tx('saved'), 'good'); show(pageLive); };
    // maintenance
    const m = o.maintenance || eff.maintenance || {};
    const mText = input(tx('msgText'), one(m.msg));
    const maint = sect(tx('maintH') + ': ' + (m.on ? tx('on') : tx('off')), h('div.ap-muted', tx('maintHint')), mText,
      h('div.ap-row', btn(m.on ? tx('off') : tx('on'), () => saveO(Object.assign({}, o, { maintenance: { on: !m.on, msg: mText.value.trim() } })), m.on ? 'green' : 'red'),
        btn(tx('save'), () => saveO(Object.assign({}, o, { maintenance: { on: !!m.on, msg: mText.value.trim() } })))));
    // versions
    const web = Object.assign({}, eff.web || {}), app = Object.assign({}, eff.app || {});
    const wMin = input('1.61.0', web.min), aMin = input('1.61.0', app.min), aLat = input('1.61.0', app.latest);
    const vers = sect(tx('verH'), h('div.ap-muted', tx('verHint')),
      h('div.ap-form', h('label', tx('webMin'), wMin), h('label', tx('appMin'), aMin), h('label', tx('appLatest'), aLat)),
      h('div.ap-row', btn(tx('save'), () => {
        const ok = (v) => !v || /^\d+\.\d+\.\d+$/.test(v); if (![wMin.value, aMin.value, aLat.value].every((v) => ok(v.trim()))) { ui.toast('x.y.z', 'bad'); return null; }
        return saveO(Object.assign({}, o, { web: Object.assign({}, web, { min: wMin.value.trim() || web.min }), app: Object.assign({}, app, { min: aMin.value.trim() || app.min, latest: aLat.value.trim() || app.latest }) }));
      }, 'gold')));
    // ads
    const ads = Object.assign({}, eff.ads || {}), adChk = h('input', { type: 'checkbox', checked: !!ads.verify });
    const adsS = sect(tx('adsH'), h('label.ap-check', adChk, ' ', tx('adsVerify')), h('div.ap-row', btn(tx('save'), () => saveO(Object.assign({}, o, { ads: Object.assign({}, ads, { verify: adChk.checked }) })))));
    // news and gifts to everyone
    const listEditor = (key, title, hint, extra) => {
      const list = (o[key] || eff[key] || []).slice();
      const f = { title: input(tx('titleOne')), text: area(tx('msgText'), '', 3), start: input('', iso(new Date().toISOString()), 'datetime-local'), end: input('', '', 'datetime-local') };
      const ex = extra ? extra() : null;
      return sect(title, h('div.ap-muted', hint),
        list.length ? h('div.ap-list', list.map((n, i) => h('div.ap-item.flat',
          h('b', one(n.title) || n.id), ' ', h('span.ap-muted', [n.id, n.start ? when(n.start) : null, n.end ? '→ ' + when(n.end) : null, n.reward ? JSON.stringify(n.reward) : null].filter(Boolean).join(' · ')),
          h('div', one(n.text || n.msg)),
          h('div.ap-row', btn(tx('remove'), () => { const next = list.slice(); next.splice(i, 1); return saveO(Object.assign({}, o, { [key]: next })); }, 'red'))))) : null,
        f.title, f.text, h('div.ap-form', h('label', tx('start'), f.start), h('label', tx('end'), f.end)), ex ? ex.el : null,
        h('div.ap-row', btn(tx('add'), () => {
          const item = { id: key + '-' + Date.now().toString(36), title: f.title.value.trim(), start: toIso(f.start.value), end: toIso(f.end.value) };
          const text = f.text.value.trim();
          if (key === 'news') item.text = text; else item.msg = text;
          if (ex) { const rw = ex.read(); if (!rw) { ui.toast(tx('empty'), 'bad'); return null; } item.reward = rw; }
          if (!item.title && !text) { ui.toast(tx('empty'), 'bad'); return null; }
          Object.keys(item).forEach((k) => item[k] === undefined && delete item[k]);
          return saveO(Object.assign({}, o, { [key]: list.concat(item) }));
        }, 'gold')));
    };
    const giftFields = () => {
      const fl = { gold: input(tx('gold'), '', 'number'), gems: input(tx('gems'), '', 'number'), energy: input(tx('torches'), '', 'number') };
      const ms = {}; E.materials.forEach((k) => { ms[k] = input(t('mat.' + k), '', 'number'); });
      return { el: h('div.ap-form', Object.values(fl), Object.values(ms)), read: () => { const rw = {}; for (const k in fl) if (+fl[k].value > 0) rw[k] = Math.floor(+fl[k].value); const mt = {}; for (const k in ms) if (+ms[k].value > 0) mt[k] = Math.floor(+ms[k].value); if (Object.keys(mt).length) rw.mats = mt; return Object.keys(rw).length ? rw : null; } };
    };
    // everything, as JSON
    const js = area('{}', JSON.stringify(o, null, 2), 10);
    const json = sect(tx('jsonH'), h('div.ap-muted', tx('jsonHint')), js, h('div.ap-row',
      btn(tx('save'), async () => { let v; try { v = JSON.parse(js.value || '{}'); } catch (e) { ui.toast('JSON: ' + e.message, 'bad'); return; } if (!(await sure(tx('jsonHint')))) return; await saveO(v); }, 'gold')),
      r.by ? h('div.ap-muted', r.by + ' · ' + when(r.at)) : null,
      h('details', h('summary', tx('effective')), h('pre.ap-pre', JSON.stringify(eff, null, 1))),
      h('details', h('summary', tx('base')), h('pre.ap-pre', JSON.stringify(r.base, null, 1))));
    return h('div', maint, vers, adsS, listEditor('news', tx('newsH'), tx('newsHint')), listEditor('gifts', tx('giftsH'), tx('giftsHint'), giftFields), json);
  }

  /* ================= Admins ================= */
  async function pageAdmins() {
    const r = await call('admins'), list = r.emails.slice(), inp = input(tx('addEmail'), '', 'email');
    const save = async (next) => { await call('adminset', { emails: next }); ui.toast(tx('saved'), 'good'); show(pageAdmins); };
    return h('div', h('div.ap-muted', tx('adminsHint')),
      h('div.ap-list', list.map((e, i) => h('div.ap-item.flat', h('b', e), ' ', btn(tx('remove'), () => save(list.filter((_, j) => j !== i)), 'red')))),
      h('div.ap-row', inp, btn(tx('add'), () => { const e = inp.value.trim().toLowerCase(); if (!e) return null; return save(list.concat(e)); }, 'gold')));
  }

  /* ================= Log ================= */
  async function pageLog() {
    const r = await call('log', { limit: 300 });
    return r.list.length ? h('div.ap-list', r.list.map((x) => h('div.ap-item' + (x.target && x.op !== 'fbset' && x.op !== 'fbdel' ? '' : '.flat'), { onclick: () => { if (x.target && x.op !== 'fbset' && x.op !== 'fbdel' && x.op !== 'wipe') show(pagePlayer, x.target, { page: pageLog }); } },
      h('div.ap-muted', when(x.at) + ' · ' + x.who), h('b', x.op), x.target ? h('span.ap-muted', ' · ' + x.target) : null,
      x.details ? h('div.ap-muted', JSON.stringify(x.details).slice(0, 300)) : null))) : h('div.ap-muted', tx('none'));
  }

  const PAGES = { dash: pageDash, players: pagePlayers, feedback: pageFeedback, store: pageStore, live: pageLive, admins: pageAdmins, log: pageLog };
  ui.openAdmin = open; // Settings → Admin panel
  ui.openAdminPanel = open;
})(window.DH);
