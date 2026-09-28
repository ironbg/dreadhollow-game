/* Menu popups. */
(function (DH) {
  'use strict';
  const U = DH.util, h = U.h, E = DH.economy, C = DH.content, A = DH.art, ui = DH.ui, M = DH.meta;
  const S = () => DH.save.data;
  const click = () => DH.audio.play('click');

  /* ---------------- Profile / stats ---------------- */
  ui.openProfile = () => {
    const s = S(), st = s.stats;
    const rows = [
      ['profile.runs', U.fmt(st.runs)], ['profile.wins', U.fmt(st.wins)], ['profile.kills', U.fmt(st.kills)],
      ['profile.bosses', U.fmt(st.bossKills)], ['profile.elites', U.fmt(st.eliteKills)], ['profile.bestTime', U.fmtTime(st.bestSurvival)],
      ['profile.maxLevel', st.maxLevel], ['profile.gold', U.fmt(st.goldEarned)], ['profile.playTime', U.fmtDuration(st.playTime * 1000)],
      ['profile.chests', U.fmt(st.chestsOpened)],
    ];
    const m = ui.modal({ title: t('profile.title'), body: h('div',
      h('div.pname', h('b', s.playerName || '—'), h('button.btn.tiny.ghost', { onclick: () => { click(); m.close(); ui.openName(false, () => ui.openProfile()); } }, t('name.change'))),
      h('div.center', h('span.power', t('top.level', { n: s.accountLevel }))),
      h('div.statgrid', rows.map(([k, v]) => h('div', h('span', t(k)), h('b', v))))) });
  };

  /* ---------------- Player name ---------------- */
  // syllables for a random name that sounds like the halls; each language its own, in its own script
  const NAME_PARTS = {
    en: [['Mor', 'Vael', 'Dra', 'Kor', 'Sar', 'Ul', 'Ash', 'Grim', 'Nyx', 'Thal', 'Bel', 'Os', 'Ryn', 'Zar', 'Hel', 'Cael', 'Vor', 'Ez', 'Mal', 'Syl'],
      ['eth', 'grim', 'vek', 'os', 'ra', 'dun', 'ith', 'mar', 'gor', 'ys', 'an', 'rok', 'iel', 'wyn', 'ath', 'ul', 'en', 'ax']],
    bg: [['Мор', 'Вейл', 'Дра', 'Кор', 'Сар', 'Ул', 'Аш', 'Грим', 'Никс', 'Тал', 'Бел', 'Ос', 'Рин', 'Зар', 'Хел', 'Кейл', 'Вор', 'Ез', 'Мал', 'Сил'],
      ['ет', 'грим', 'век', 'ос', 'ра', 'дун', 'ит', 'мар', 'гор', 'ис', 'ан', 'рок', 'иел', 'вин', 'ат', 'ул', 'ен', 'акс']],
  };
  ui.randomName = () => {
    const P = NAME_PARTS[DH.i18n.current] || NAME_PARTS.en, pick = (a) => a[Math.random() * a.length | 0];
    return pick(P[0]) + pick(P[1]) + (Math.random() < 0.35 ? pick(P[1]) : '');
  };
  const NAME_OK = /^[\p{L}\p{N}][\p{L}\p{N} _'.-]*$/u;
  /** Choose or change the player's name. first: the opening visit, which cannot be dismissed. then: runs after. */
  /** What the next change of name costs in gems: nothing the first time, E.RENAME_GEMS after that. */
  ui.renameCost = () => ((S().nameChanges || 0) >= 1 ? E.RENAME_GEMS : 0);
  ui.openName = (first, then) => {
    const s = S(), cost = first ? 0 : ui.renameCost();
    const inp = h('input.nameinp', { type: 'text', maxLength: 16, value: s.playerName || ui.randomName(), autocomplete: 'off', spellcheck: 'false', 'aria-label': t('name.title') });
    const err = h('div.small.nameerr');
    const dice = h('button.btn.ghost.dice', { 'aria-label': t('name.random'), title: t('name.random'), onclick: () => { click(); inp.value = ui.randomName(); err.textContent = ''; } });
    dice.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.6" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.6" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.6" fill="currentColor"/></svg>';
    let done = false;
    const ok = () => {
      const v = inp.value.replace(/\s+/g, ' ').trim();
      if (v.length < 3) { err.textContent = t('name.short'); return; }
      if (!NAME_OK.test(v)) { err.textContent = t('name.bad'); return; }
      if (!first && v === s.playerName) { done = true; m.close(); if (then) then(); return; } // unchanged: nothing to pay
      if (cost > 0 && !M.spend({ gems: cost })) { ui.toast(t('common.notEnough'), 'bad'); return; }
      s.playerName = v; if (!first) s.nameChanges = (s.nameChanges || 0) + 1;
      DH.save.persist(); DH.audio.play('reward'); done = true; m.close(); ui.renderTop();
      if (then) then();
    };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok(); });
    inp.addEventListener('input', () => { err.textContent = ''; });
    const m = ui.modal({ title: t(first ? 'name.titleFirst' : 'name.title'), closable: !first, onClose: () => { if (!done && !first && then) then(); },
      body: h('div',
        h('div.center.small.muted', { style: { lineHeight: '1.45', marginBottom: '10px' } }, t('name.desc')),
        h('div.namerow', inp, dice), err,
        h('div.btns', cost ? h('button.btn.gem', { onclick: ok }, A.img('i_gem'), U.fmt(cost)) : h('button.btn.gold', { onclick: ok }, t('name.ok')))) });
  };

  /* ---------------- Energy ---------------- */
  ui.openEnergy = () => {
    const d = M.ensureDaily();
    const left = E.ENERGY_AD_LIMIT - d.ads.energy;
    const m = ui.modal({ title: t('energy.title'), body: h('div',
      h('div.center', A.img('i_energy', 'bigicon'), h('div.num', { style: { fontSize: '14px', margin: '6px 0' } }, M.energy() + ' / ' + E.ENERGY_MAX)),
      h('div.center.small.muted', t('energy.desc', { n: C.RUN_ENERGY, m: Math.round(E.ENERGY_REGEN_MS / 60000) })),
      h('div.col', { style: { marginTop: '12px' } },
        h('button.btn.ad.block' + (left > 0 ? '' : '.off'), { onclick: async () => { const r = await M.adEnergy(); if (r) { m.close(); ui.rewardPopup(t('energy.title'), r); } } },
          h('span.adtag', 'AD'), t('energy.ad', { n: E.ENERGY_AD_AMOUNT }), h('span.small', '(' + left + ')')),
        h('button.btn.gem.block', { onclick: () => { const r = M.gemEnergy(); if (r) { m.close(); ui.rewardPopup(t('energy.title'), r); } else ui.toast(t('common.notEnough'), 'bad'); } },
          t('energy.gems', { n: E.ENERGY_GEM_AMOUNT }), A.img('i_gem'), E.ENERGY_GEM_COST))) });
    m.el.querySelector('.bigicon').style.cssText = 'width:64px;height:64px';
  };

  /* ---------------- Settings ---------------- */
  ui.openSettings = () => {
    const s = S().settings;
    const sw = (key, onchange) => {
      const el = h('div.switch' + (s[key] ? '.on' : ''), { onclick: () => { s[key] = !s[key]; el.classList.toggle('on', s[key]); click(); DH.save.persist(); onchange && onchange(); } });
      return el;
    };
    const slider = (key) => h('input', { type: 'range', min: 0, max: 100, value: Math.round(s[key] * 100), oninput: (e) => { s[key] = e.target.value / 100; DH.audio.setVolumes(s.sfx * s.master, s.music * s.master); DH.save.persist(); } });
    const desk = DH.input.desktop, row = (key, ctl, hint) => [h('div.setrow', h('label', t('settings.' + key)), ctl), hint ? h('div.small.muted.sethint', t('settings.' + key + 'Hint')) : null];
    const autoAim = h('div.switch' + (!s.mouseAim ? '.on' : ''), { onclick: () => { s.mouseAim = !s.mouseAim; autoAim.classList.toggle('on', !s.mouseAim); click(); DH.save.persist(); } });
    const fsSw = h('div.switch' + (DH.input.isFullscreen() ? '.on' : ''), { onclick: () => { click(); DH.input.toggleFullscreen(); setTimeout(() => fsSw.classList.toggle('on', DH.input.isFullscreen()), 250); } });
    // the language picker: a forged drop-down in the game's style (a native <select> looks like the system's)
    const langSel = h('div.dd');
    { const langs = DH.i18n.list(), cur = langs.find((l) => l.code === DH.i18n.current) || langs[0];
      const pick = (l) => { click(); if (l.code === DH.i18n.current) { langSel.classList.remove('open'); return; } s.lang = l.code; DH.save.persist(); DH.i18n.set(s.lang); m.close(); ui.openSettings(); };
      langSel.append(
        h('button.dd-btn', { onclick: (e) => { e.stopPropagation(); click(); langSel.classList.toggle('open'); if (!langSel.dataset.l) { langSel.dataset.l = 1; m.el.addEventListener('click', () => langSel.classList.remove('open')); } } }, h('span', cur.native), h('i.dd-arrow')),
        h('div.dd-list', langs.map((l) => h('button.dd-opt' + (l.code === cur.code ? '.on' : ''), { onclick: (e) => { e.stopPropagation(); pick(l); } }, h('span', l.native), l.code === cur.code ? A.img('u_check', 'ci') : null)))); }
    const m = ui.modal({ title: t('settings.title'), body: h('div',
      h('div.setsec', t('settings.secAudio')),
      row('master', slider('master')),
      row('music', slider('music')),
      row('sfx', slider('sfx')),
      desk ? null : row('vibration', sw('vibration')),
      h('div.setsec', t('settings.secControls')),
      desk ? row('autoAim', autoAim, true) : null,
      desk ? row('pauseOnBlur', sw('pauseOnBlur')) : null,
      desk && DH.input.fullscreenAvailable() ? row('fullscreen', fsSw, true) : null,
      desk ? null : row('twinStick', sw('twinStick'), true),
      desk ? null : row('hideJoystick', sw('hideJoystick')),
      h('div.setsec', t('settings.secInterface')),
      row('aimLine', sw('aimLine'), true),
      row('dmgNumbers', sw('dmgNumbers')),
      row('flash', slider('flash')),
      row('fxAlpha', slider('fxAlpha')),
      row('shake', sw('shake')),
      row('outlines', sw('outlines')),
      row('lowFx', sw('lowFx')),
      h('div.setsec', t('settings.secGame')),
      h('div.setrow', h('label', t('settings.language')), langSel),
      h('div.col', { style: { marginTop: '14px' } },
        h('button.btn.small.gold.block', { onclick: () => ui.openAccount() }, t(DH.cloud.user ? 'cloud.account' : 'cloud.signInSave')),
        h('button.btn.small.ghost.block', { onclick: () => DH.iap.restore() }, t('shop.restore')),
        h('button.btn.small.ghost.block', { onclick: () => ui.openSaveTransfer() }, t('settings.transfer')),
        h('div.btns', h('button.btn.small.ghost', { onclick: () => ui.openLegal('terms') }, t('title.terms')), h('button.btn.small.ghost', { onclick: () => ui.openLegal('privacy') }, t('title.privacy'))),
        h('button.btn.small.red.block', { onclick: async () => {
          if (await ui.confirm({ title: t('settings.reset'), body: t(DH.cloud.user ? 'settings.resetConfirmCloud' : 'settings.resetConfirm'), okCls: 'red', ok: t('settings.reset') })) { await DH.save.reset(); location.reload(); }
        } }, t('settings.reset'))),
      h('div.note', 'Dreadhollow v' + DH.VERSION + ' · ' + t('settings.credits'))) });
  };
  /** The Terms of Service or the Privacy Policy (legal.html), in the game's language. */
  ui.openLegal = (doc) => {
    const src = 'legal.html?doc=' + doc + '&lang=' + (DH.i18n.current === 'bg' ? 'bg' : 'en') + '&embed=1';
    ui.modal({ title: t(doc === 'terms' ? 'title.terms' : 'title.privacy'), cls: 'legal', body: h('iframe.legal-frame', { src, title: t(doc === 'terms' ? 'title.terms' : 'title.privacy') }) });
  };
  ui.openSaveTransfer = () => {
    const ta = h('textarea', { style: { width: '100%', height: '110px', background: '#120c16', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '10px', userSelect: 'text' } });
    ta.value = DH.save.exportString();
    ui.modal({ title: t('settings.transfer'), body: (m) => h('div',
      h('div.small.muted', { style: { marginBottom: '6px' } }, t('settings.transferDesc')), ta,
      h('div.btns',
        h('button.btn.small.ghost', { onclick: () => { ta.select(); try { document.execCommand('copy'); ui.toast(t('settings.copied'), 'good'); } catch (e) { /* ignore */ } } }, t('settings.copy')),
        h('button.btn.small.gold', { onclick: async () => { try { await DH.save.importString(ta.value); m.close(); location.reload(); } catch (e) { ui.toast(t('settings.importFail'), 'bad'); } } }, t('settings.import')))) });
  };

  /* ---------------- Account + cloud save ---------------- */
  const cloudErrText = (code) => t(DH.i18n.has('cloud.err.' + code) ? 'cloud.err.' + code : 'cloud.err.network');
  const cloudErr = (e) => ui.toast(cloudErrText(e && e.code), 'bad');
  ui.cloudErr = cloudErr;
  /** Run an account action with the buttons locked; errors become a toast. */
  const act = async (btns, fn) => {
    btns.forEach((b) => { b.disabled = true; });
    try { return await fn(); } catch (e) { if (e.code !== 'cancelled') cloudErr(e); return null; } finally { btns.forEach((b) => { b.disabled = false; }); }
  };
  ui.openAccount = () => {
    const C = DH.cloud;
    const googleIn = async (btn) => {
      const r = await act([btn], () => C.signInGoogle());
      if (r && r.needPassword) { m.close(); ui.openEmailAuth('link', r); }
    };
    const status = () => {
      const st = C.state;
      if (st === 'error') return h('div.small.cf-state.bad', cloudErrText(C.error));
      if (st === 'outdated') return h('div.small.cf-state.bad', t('cloud.outdated'));
      if (st === 'syncing') return h('div.small.cf-state', t('cloud.syncing'));
      const at = DH.save.meta.syncedAt;
      return h('div.small.cf-state.good', DH.save.meta.dirty ? t('cloud.pending') : at ? t('cloud.syncedAt', { t: new Date(at).toLocaleString() }) : t('cloud.syncing'));
    };
    const signedOut = () => h('div',
      h('div.small.center', { style: { lineHeight: '1.45', marginBottom: '12px' } }, t('cloud.why')),
      h('div.col',
        h('button.btn.gold.block', { onclick: (e) => googleIn(e.currentTarget) }, t('cloud.google')),
        h('button.btn.ghost.block', { onclick: () => { m.close(); ui.openEmailAuth('signin'); } }, t('cloud.emailSignIn')),
        h('button.btn.ghost.block', { onclick: () => { m.close(); ui.openEmailAuth('signup'); } }, t('cloud.emailSignUp'))));
    const signedIn = () => {
      const u = C.user, google = C.linked('google'), pw = C.linked('password');
      return h('div',
        h('div.center', { style: { marginBottom: '6px' } }, h('div.small.muted', t('cloud.signedInAs')), h('b', u.email || u.name || '—')),
        status(),
        h('div.setrow', h('label', 'Google'), google ? h('span.small.good', '✓ ' + t('cloud.linked'))
          : h('button.btn.tiny.gold', { onclick: async (e) => { if (await act([e.currentTarget], () => C.linkGoogle()) !== null) ui.toast(t('cloud.googleLinked'), 'good'); } }, t('cloud.linkGoogle'))),
        pw ? h('div.setrow', h('label', t('cloud.email')), u.emailVerified ? h('span.small.good', '✓ ' + t('cloud.verified'))
          : h('span', { style: { display: 'flex', gap: '6px' } },
            h('button.btn.tiny.ghost', { onclick: async (e) => { if (await act([e.currentTarget], () => C.resendVerification()) !== null) ui.toast(t('cloud.verifySent'), 'good'); } }, t('cloud.resend')),
            h('button.btn.tiny.gold', { onclick: (e) => act([e.currentTarget], () => C.refreshUser()) }, t('cloud.iVerified')))) : null,
        pw && !u.emailVerified ? h('div.small.muted', { style: { margin: '6px 0' } }, t('cloud.verifyHint')) : null,
        h('div.col', { style: { marginTop: '12px' } },
          h('button.btn.small.ghost.block', { onclick: () => C.sync('manual') }, t('cloud.syncNow')),
          h('button.btn.small.ghost.block', { onclick: async (e) => {
            if (!await ui.confirm({ title: t('cloud.signOut'), body: t(DH.save.meta.dirty ? 'cloud.signOutUnsaved' : 'cloud.signOutConfirm'), ok: t('cloud.signOut') })) return;
            act([e.currentTarget], () => C.signOut());
          } }, t('cloud.signOut')),
          h('button.btn.small.red.block', { onclick: async (e) => {
            if (!await ui.confirm({ title: t('cloud.delete'), body: t('cloud.deleteConfirm'), okCls: 'red', ok: t('cloud.delete') })) return;
            act([e.currentTarget], () => C.deleteAccount());
          } }, t('cloud.delete'))));
    };
    const body = () => h('div', C.user ? signedIn() : signedOut(),
      C.provider.name === 'mock' ? h('div.note', t('cloud.mockNote')) : null);
    const m = ui.modal({ title: t('cloud.title'), body, onClose: () => DH.events.off('cloud', redraw) });
    const redraw = () => { if (!m.closed) m.set(body()); };
    DH.events.on('cloud', redraw);
  };
  /** Email forms. mode: signin | signup | link (Google met an email account: sign in with the password, then Google is linked). */
  ui.openEmailAuth = (mode, link) => {
    const C = DH.cloud;
    const email = h('input.field', { type: 'email', placeholder: t('cloud.email'), autocomplete: 'email', value: (link && link.email) || '' });
    const pw = h('input.field', { type: 'password', placeholder: t('cloud.password'), autocomplete: mode === 'signup' ? 'new-password' : 'current-password' });
    const go = h('button.btn.gold.block', t(mode === 'signup' ? 'cloud.emailSignUp' : mode === 'link' ? 'cloud.signInLink' : 'cloud.emailSignIn'));
    const submit = async () => {
      const ok = await act([go], async () => {
        if (mode === 'signup') await C.signUpEmail(email.value, pw.value);
        else await C.signInEmail(email.value, pw.value, link && link.pending);
        return true;
      });
      if (!ok) return;
      m.close();
      if (mode === 'signup') ui.toast(t('cloud.verifySent'), 'good');
      if (mode === 'link') ui.toast(t('cloud.googleLinked'), 'good');
    };
    go.addEventListener('click', submit);
    pw.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    const m = ui.modal({ title: t(mode === 'signup' ? 'cloud.emailSignUp' : 'cloud.emailSignIn'), body: h('div',
      mode === 'link' ? h('div.small', { style: { marginBottom: '8px', lineHeight: '1.4' } }, t('cloud.linkExplain', { email: link.email })) : null,
      email, pw,
      mode === 'signup' ? h('div.small.muted', { style: { marginBottom: '8px' } }, t('cloud.pwHint')) : null,
      go,
      h('div.center', { style: { marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' } },
        mode !== 'signup' ? h('button.btn.tiny.ghost', { onclick: async (e) => { if (await act([e.currentTarget], () => C.resetPassword(email.value)) !== null) ui.toast(t('cloud.resetSent'), 'good'); } }, t('cloud.forgot')) : null,
        mode !== 'link' ? h('button.btn.tiny.ghost', { onclick: () => { m.close(); ui.openEmailAuth(mode === 'signup' ? 'signin' : 'signup'); } }, t(mode === 'signup' ? 'cloud.haveAccount' : 'cloud.noAccount')) : null)) });
    setTimeout(() => (link ? pw : email).focus(), 50);
  };

  /* ---------------- Login calendar ---------------- */
  /* ---------------- The Seven Nights (newcomer event) ---------------- */
  const NB = E.NEWBIE, ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V'];
  /** A task's text: its own wording for a single one where there is one ('nb.t.runs1'). */
  ui.nbText = (tk) => {
    const k = 'nb.t.' + tk.k + (tk.n === 1 && DH.i18n.has('nb.t.' + tk.k + '1') ? '1' : '');
    return t(k, { n: U.fmt(tk.n), m: Math.round(tk.n / 60), a: ROMAN[tk.n] || tk.n, stage: tk.st ? t('stage.' + tk.st + '.name') : '' });
  };
  /** A long countdown in days and hours ("6d 4h"); under a day, hours and minutes. */
  ui.fmtDays = (ms) => U.fmtDays(ms);
  const nbProg = (tk, v) => tk.k === 'survive' ? U.fmtTime(v) + '/' + U.fmtTime(tk.n) : tk.k === 'agony' ? ROMAN[v] + '/' + ROMAN[tk.n] : U.fmt(v) + '/' + U.fmt(tk.n);
  /** Where "Go" takes the player for each kind of task. */
  function nbGo(tk) {
    const battle = ['runs', 'kills', 'bosses', 'elites', 'champions', 'tomes', 'wins', 'level', 'survive', 'clear', 'agony', 'acct'];
    if (battle.includes(tk.k)) { if (tk.st && ui.stageUnlocked(tk.st)) { S().selectedStage = tk.st; DH.save.persist(); DH.audio.music('menu', tk.st); DH.audio.ambience(tk.st); } ui.go('home'); }
    else if (tk.k === 'shrine') ui.go('shrine', 'bless');
    else if (tk.k === 'brew') ui.go('shrine', 'brew');
    else if (['equip', 'gearLv', 'merge'].includes(tk.k)) ui.go('armory', 'gear');
    else if (tk.k === 'heroes') ui.go('armory', 'heroes');
    else if (tk.k === 'chests') ui.go('shop', 'chests');
    else if (tk.k === 'ads') ui.go('shop', 'free');
    else if (tk.k === 'deeds') ui.go('quests', 'deeds');
  }
  ui.openNights = () => {
    const day = Math.min(NB.nights, M.nbDay());
    let night = day;
    for (let d = 1; d <= day; d++) if (M.nbClaimable(d)) { night = d; break; } // open on the first night with something to claim
    const m = ui.modal({ title: t('nb.title'), cls: 'nights', onClose: () => ui.refresh(), body: () => h('div') });
    const claimed = (title, r) => { DH.audio.play('reward'); ui.rewardPopup(title, r); draw(); };
    const draw = () => {
      const seals = M.nbSeals(), nb = M.newbie(), ms = NB.milestones;
      // the track: seven rewards over a bar that fills segment by segment
      let fill = 0;
      for (let i = 0; i < ms.length; i++) {
        const lo = i ? ms[i - 1].at : 0, f = Math.max(0, Math.min(1, (seals - lo) / (ms[i].at - lo)));
        if (f <= 0) break;
        fill = i === 0 ? f * 0.5 / ms.length : (i - 0.5 + f) / ms.length;
      }
      const track = h('div.nb-track',
        h('div.nb-ms-row', ms.map((x, i) => {
          const pv = M.rewardPreview(x.r)[0], got = !!nb.ms[i], ready = M.nbMilestoneReady(i);
          return h('button.nb-ms' + (got ? '.got' : ready ? '.ready' : '') + (i === ms.length - 1 ? '.big' : '') + (pv.rarity != null ? '.rar' + pv.rarity : ''),
            { onclick: () => { if (ready) { const r = M.nbClaimMilestone(i); if (r) claimed(t('nb.track'), r); } else { click(); ui.toast(ui.isWord(pv.text) ? pv.text : pv.text + ' · ' + t('nb.at', { n: x.at }), null); } } },
            A.img(pv.icon), h('b', pv.rarity != null || ui.isWord(pv.text) ? '' : pv.text), got ? h('i.nb-tick', A.img('u_check', 'ci')) : !ready ? h('i.nb-lock', A.img('u_lock', 'ci')) : null);
        })),
        h('div.nb-bar', h('i', { style: { width: (fill * 100) + '%' } })),
        h('div.nb-at-row', ms.map((x) => h('span' + (seals >= x.at ? '.on' : ''), x.at))));
      const days = h('div.nb-days', Array.from({ length: NB.nights }, (_, i) => {
        const d = i + 1, open = d <= M.nbDay(), n = open ? M.nbClaimable(d) : 0;
        return h('button.nb-day' + (d === night ? '.on' : '') + (open ? '' : '.shut'), { onclick: () => { click(); night = d; draw(); } },
          t('nb.night', { n: d }), !open ? h('i.nb-lock', A.img('u_lock', 'ci')) : n ? h('span.badge', n) : null);
      }));
      const list = h('div.nb-list', NB.tasks[night - 1].map((tk, i) => M.nbTask(night, i))
        .map((x, i) => ({ x, i })).sort((a, b) => (b.x.done && !b.x.claimed && b.x.open) - (a.x.done && !a.x.claimed && a.x.open) || a.x.claimed - b.x.claimed)
        .map(({ x, i }) => {
          const ready = x.open && x.done && !x.claimed, pv = M.rewardPreview(x.tk.r)[0];
          const act = x.claimed ? h('span.nb-got', A.img('u_check', 'ci'), t('nb.claimed'))
            : !x.open ? h('span.nb-lockt', t('nb.locked'))
            : ready ? h('button.btn.small.red.shine', { onclick: () => { const r = M.nbClaimTask(night, i); if (r) claimed(t('nb.title'), r); } }, t('common.claim'))
            : x.tk.k === 'login' ? h('span.nb-lockt', t('nb.tomorrow'))
            : h('button.btn.small.ghost', { onclick: () => { click(); m.close(); nbGo(x.tk); } }, t('nb.go'));
          return h('div.nb-row' + (ready ? '.ready' : '') + (x.claimed ? '.claimed' : '') + (!x.open ? '.shut' : ''),
            h('span.nb-seal', A.img('u_seal'), h('b', x.tk.s)),
            h('div.nb-tx', h('span', ui.nbText(x.tk)), h('span.nb-p' + (x.done ? '.ok' : ''), ' (' + nbProg(x.tk, x.v) + ')')),
            h('span.nb-rw', A.img(pv.icon), h('b', pv.text)),
            act);
        }));
      const ends = M.nbEndsIn();
      m.set(h('div',
        h('div.nb-head', h('div.nb-medal', A.img('u_seal'), h('b', seals)), h('div.grow', h('div.small', t('nb.sub')), h('div.small.goldtxt', t('nb.ends', { t: ui.fmtDays(ends) })))),
        track, days,
        night > M.nbDay() ? h('div.center.small.muted', { style: { margin: '6px 0' } }, t('nb.opens', { n: night, t: ui.fmtDays(Math.max(0, new Date(nb.start + 'T00:00:00').getTime() + (night - 1) * 86400000 - Date.now())) })) : null,
        list));
    };
    draw();
  };

  ui.openLogin = () => {
    const s = S(), pending = M.loginPending();
    const cur = s.login.index % 7;
    const cal = h('div.cal');
    E.loginRewards.forEach((rw, i) => {
      const pv = M.rewardPreview(rw)[0];
      const claimedCount = pending ? cur : ((s.login.index - 1) % 7) + 1;
      const got = i < claimedCount;
      const isToday = pending && i === cur;
      cal.append(h('div.day' + (isToday ? '.today' : '') + (got && !isToday ? '.got' : '') + (i === 6 ? '.big' : ''),
        h('span.dn', t('login.day', { n: i + 1 })), A.img(pv.icon), h('span.v' + (ui.isWord(pv.text) ? '.word' : ''), pv.text)));
    });
    ui.modal({ title: t('login.title'), body: (m) => h('div',
      h('div.center.small.muted', { style: { marginBottom: '8px' } }, t('login.desc')),
      cal,
      pending ? h('div.btns',
        h('button.btn.gold', { onclick: () => { const r = M.claimLogin(false); m.close(); ui.rewardPopup(t('login.title'), r); } }, t('common.claim')),
        h('button.btn.ad.shine', { onclick: async () => { if (await DH.ads.rewarded('login_x2')) { const r = M.claimLogin(true); m.close(); ui.rewardPopup(t('login.title'), r); } } }, h('span.adtag', 'AD'), t('common.claimX2')))
        : h('div.note', t('login.comeBack', { t: U.fmtDuration(U.msToMidnight()) }))) });
  };

  /* ---------------- Vigil ---------------- */
  ui.openVigil = () => {
    const d = M.ensureDaily();
    const v = M.vigil();
    const adsLeft = E.QUICK_VIGIL_ADS - d.ads.vigil;
    ui.modal({ title: t('vigil.title'), body: (m) => h('div',
      h('div.center', A.img('c_wood', 'bigicon')),
      h('div.center.small.muted', t('vigil.desc', { g: v.rate.goldPerMin * 60, max: 12 })),
      h('div.goldtotal', A.img('i_gold'), U.fmt(v.gold)),
      h('div.center.small.muted', t('home.vigilTime', { t: U.fmtDuration(v.ms), max: 12 })),
      h('div.btns',
        h('button.btn.gold' + (v.gold > 0 ? '' : '.off'), { onclick: () => { const r = M.claimVigil(false); m.close(); if (r) ui.rewardPopup(t('vigil.title'), r); } }, t('common.claim')),
        h('button.btn.ad' + (v.gold > 0 ? '.shine' : '.off'), { onclick: async () => { if (await DH.ads.rewarded('vigil_x2')) { const r = M.claimVigil(true); m.close(); if (r) ui.rewardPopup(t('vigil.title'), r); } } }, h('span.adtag', 'AD'), t('common.claimX2'))),
      h('h3.sect', t('vigil.quick')),
      h('div.small.muted', t('vigil.quickDesc', { h: E.QUICK_VIGIL_MS / 3600e3 })),
      h('div.col', { style: { marginTop: '8px' } },
        d.quickVigilFree ? h('button.btn.green.block', { onclick: async () => { const r = await M.quickVigil('free'); m.close(); if (r) ui.rewardPopup(t('vigil.quick'), r); } }, t('common.free'))
          : h('button.btn.ad.block' + (adsLeft > 0 ? '' : '.off'), { onclick: async () => { const r = await M.quickVigil('ad'); if (r) { m.close(); ui.rewardPopup(t('vigil.quick'), r); } } }, h('span.adtag', 'AD'), t('common.watch'), h('span.small', '(' + adsLeft + ')')),
        h('button.btn.gem.block', { onclick: async () => { const r = await M.quickVigil('gems'); if (r) { m.close(); ui.rewardPopup(t('vigil.quick'), r); } else ui.toast(t('common.notEnough'), 'bad'); } }, A.img('i_gem'), E.QUICK_VIGIL_GEMS))) })
      .el.querySelector('.bigicon').style.cssText = 'width:64px;height:64px';
  };

  /* ---------------- Gear detail ---------------- */
  /** The special line of a gear piece (e.g. Defiant Plate's defense after each hit). */
  ui.gearSpecialText = (type, sp) => t('gearsp.' + type, Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, k === 'hitRegen' || k === 'imps' ? Math.round(v * 10) / 10 : k.startsWith('sig_') ? Math.min(3, Math.floor(v + 1e-6)) : Math.round(v * 1000) / 10])));
  ui.openGear = (id) => {
    const g0 = M.gearById(id); if (!g0) return;
    g0.isNew = false; DH.save.persist();
    const m = ui.modal({ title: t('gear.' + g0.type), body: () => h('div') });
    const draw = () => {
      const g = M.gearById(id);
      if (!g) { m.close(); return; }
      const def = E.gear[g.type], maxL = M.gearMaxLevel(g), eq = M.isEquipped(g.id), slots = M.slotsFor(g.type);
      const cur = E.gearStat(g.type, g.rarity, g.level), nxt = g.level < maxL ? E.gearStat(g.type, g.rarity, g.level + 1) : null;
      const sp = E.gearSpecial(g.type, g.rarity);
      const cands = M.mergeCandidates(g.id), cost = E.gearLevelCost(g.rarity, g.level);
      const equipBtns = eq ? [h('button.btn.ghost.block', { onclick: () => { click(); M.unequipItem(g.id); draw(); } }, t('gear.unequip'))]
        : slots.map((sl) => h('button.btn.blue.block', { onclick: () => { click(); M.equip(g.id, sl); draw(); } }, slots.length > 1 ? t('gear.equipIn', { slot: t('slot.' + sl) }) : t('gear.equip')));
      m.set(h('div',
        h('div.row', { style: { alignItems: 'flex-start' } },
          h('div', { style: { width: '84px', flex: 'none' } }, ui.gearSlot(g, true)),
          h('div.grow',
            h('div.rar' + g.rarity, h('span.rtxt', t('rarity.' + E.rarities[g.rarity]))),
            h('div.small.muted', t('slot.' + (def.slot === 'ring' ? 'ring1' : def.slot)) + ' · ' + t('common.lv') + ' ' + g.level + '/' + maxL),
            h('div', { style: { marginTop: '6px' } }, Object.keys(cur).map((k) => h('div.small', ui.fmtStat(k, cur[k]), nxt ? h('span.good', '  → ' + ui.fmtStat(k, nxt[k]).split(' ')[0]) : null))),
            sp ? h('div.small.goldtxt', { style: { marginTop: '4px' } }, ui.gearSpecialText(g.type, sp)) : null)),
        h('div.col', { style: { marginTop: '12px' } },
          equipBtns,
          g.level < maxL ? h('button.btn.gold.block' + (S().gold >= cost ? '' : '.off'), { onclick: () => { if (M.levelGear(g.id)) { DH.audio.play('buy'); draw(); } else ui.toast(t('common.notEnough'), 'bad'); } },
            t('gear.levelUp'), A.img('i_gold'), U.fmt(cost)) : h('button.btn.ghost.block.off', t('common.max')),
          g.rarity < 5 ? h('button.btn.gem.block' + (cands.length >= 2 ? '.shine' : '.dim'), { onclick: () => {
            if (cands.length < 2) { ui.toast(t('gear.mergeNeed', { n: 2 - cands.length, g: t('gear.' + g.type), r: t('rarity.' + E.rarities[g.rarity]) }), 'bad'); return; }
            if (M.merge(g.id)) { DH.audio.play('chest'); const gg = M.gearById(id); ui.rewardPopup(t('armory.merged'), [{ icon: 'g_' + gg.type, text: t('gear.' + gg.type), rarity: gg.rarity }]); draw(); }
          } }, t('gear.merge', { n: Math.min(3, cands.length + 1) })) : null,
          h('div.small.muted.center', g.rarity < 5 ? t('gear.mergeHint', { r: t('rarity.' + E.rarities[g.rarity + 1]) }) : ''),
          h('button.btn.small.red', { onclick: async () => {
            if (await ui.confirm({ title: t('gear.salvage'), body: t('gear.salvageConfirm', { g: U.fmt(M.salvageValue(g)) }), okCls: 'red' })) { const v = M.salvage(g.id); ui.toast('+' + U.fmt(v) + ' ' + t('common.gold'), 'good'); m.close(); }
          } }, t('gear.salvage'), A.img('i_gold'), U.fmt(M.salvageValue(g))))));
    };
    draw();
  };
  /** A slot's picker: the item worn there on top (details / unequip), every item that fits below; tapping one equips it. */
  ui.openSlotPicker = (slot) => {
    const row = (g, worn, m) => {
      const sp = E.gearSpecial(g.type, g.rarity), other = !worn && M.isEquipped(g.id) ? M.slotsFor(g.type).find((sl) => sl !== slot && M.eq()[sl] === g.id) : null;
      return h('div.panel.item.pick' + (worn ? '.done' : ''), { onclick: () => { click(); m.close(); if (worn) ui.openGear(g.id); else M.equip(g.id, slot); } },
        h('div', { style: { width: '52px', flex: 'none' } }, h('div.slot.rar' + g.rarity, A.img('g_' + g.type), g.isNew ? h('span.newdot') : null)),
        h('div.grow',
          h('div.t', t('gear.' + g.type)),
          h('div.small.rar' + g.rarity, h('span.rtxt', t('rarity.' + E.rarities[g.rarity])), h('span.muted', ' · ' + t('common.lv') + ' ' + g.level)),
          h('div.d', ui.fmtStats(E.gearStat(g.type, g.rarity, g.level))),
          sp ? h('div.small.goldtxt', ui.gearSpecialText(g.type, sp)) : null,
          other ? h('div', h('span.wornpill', A.img('u_check', 'ci'), t('armory.alreadyWorn'))) : null),
        worn ? h('button.btn.small.ghost', { onclick: (e) => { e.stopPropagation(); click(); M.unequipItem(g.id); m.close(); } }, t('gear.unequip'))
          : h('button.btn.small.ghost.infob', { onclick: (e) => { e.stopPropagation(); click(); m.close(); ui.openGear(g.id); } }, 'i'));
    };
    ui.modal({ title: t('slot.' + slot), body: (m) => {
      const wornId = M.eq()[slot], worn = wornId != null ? M.gearById(wornId) : null;
      const items = S().gear.filter((g) => g !== worn && M.slotsFor(g.type).includes(slot)).sort((a, b) => b.rarity - a.rarity || b.level - a.level);
      return h('div',
        worn ? h('div.pickhead', t('armory.wornNow')) : null,
        worn ? row(worn, true, m) : null,
        h('div.pickhead', { style: { marginTop: worn ? '12px' : 0 } }, t('armory.available', { n: items.length })),
        items.length ? h('div.col.picklist', items.map((g) => row(g, false, m))) : h('div.center.muted', t('armory.noSlotItems')),
        items.length ? h('div.note', t('armory.pickHint')) : null);
    } });
  };
  ui.openMarks = () => {
    const s = S();
    ui.modal({ title: t('marks.title'), body: (m) => h('div',
      h('div.center.small.muted', { style: { marginBottom: '8px' } }, t('marks.desc')),
      M.eq().mark ? h('button.btn.small.ghost.block', { style: { marginBottom: '8px' }, onclick: () => { M.equipMark(null); m.close(); } }, t('gear.unequip')) : null,
      C.heroOrder.map((hid) => {
        const un = M.markUnlocked(hid), on = M.eq().mark === hid;
        return h('div.panel.item' + (on ? '.done' : '') + (un ? '' : '.claimed'), { onclick: () => { if (un) { M.equipMark(hid); m.close(); } } },
          h('div.ico', A.img('m_' + hid)),
          h('div.grow', h('div.t', t('marks.name', { hero: t('hero.' + hid + '.name') })), h('div.d', ui.fmtStats(C.heroes[hid].mark) + ' · ' + t('marks.access')),
            !un ? h('div.small.muted', A.img('u_lock', 'ci'), ' ' + ui.deedText(DH.deeds.byId['d_mark_' + hid])) : null),
          on ? A.img('u_check', 'ci') : null);
      })) });
  };

  /* ---------------- Drop rates (store compliance) ---------------- */
  ui.openRates = () => {
    ui.modal({ title: t('shop.rates'), body: h('div', Object.keys(E.chests).map((k) => h('div', { style: { marginBottom: '10px' } },
      h('div', { style: { fontWeight: 800 } }, t('chest.' + k)),
      h('div.small', E.chests[k].odds.map((o, i) => o > 0 ? h('span.rar' + i, { style: { marginRight: '10px' } }, h('span.rtxt', t('rarity.' + E.rarities[i])), ' ' + o + '%') : null)),
      E.chests[k].pity ? h('div.small.muted', t('shop.pityRule', { n: E.chests[k].pity })) : null))) });
  };

  /* ---------------- Starter pack ---------------- */
  ui.openStarter = () => {
    const p = E.products.starter;
    ui.modal({ title: t('product.starter'), rays: true, body: (m) => h('div',
      h('div.center.small', t('shop.starterDesc')),
      h('div.reward-list', { style: { marginTop: '10px' } }, M.rewardPreview(p.grant).map((e, i) => h('div.reward', { style: { animationDelay: i * 0.08 + 's' } }, h('div.slot' + (e.rarity != null ? '.rar' + e.rarity : ''), A.img(e.icon)), h('div.n', e.text)))),
      h('div.center.goldtxt', { style: { fontWeight: 800, fontSize: '18px' } }, t('shop.value', { v: p.value + '%' })),
      h('div.btns', h('button.btn.gold.big.shine', { onclick: async () => { if (await DH.iap.buy('starter')) m.close(); } }, DH.iap.price('starter')))) });
  };

  /* ---------------- Account level up ---------------- */
  ui.flushLevelUps = () => {
    const q = M.pendingLevelUps || []; M.pendingLevelUps = [];
    q.forEach((l) => ui.rewardPopup(t('account.levelUp', { n: l.level }), [{ icon: 'i_gem', text: '+' + l.reward.gems }, { icon: 'i_gold', text: '+' + U.fmt(l.reward.gold) }]));
  };
})(window.DH);
