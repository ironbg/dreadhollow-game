/* Title screen, shown at every launch once the game has loaded.
 * The first time (and after signing out) it offers the ways in: play as a guest, or sign in with Google or an email
 * account so the progress is kept in the cloud. After that a tap anywhere enters, and the account in use is shown
 * with a way to change it. Entering flies through the nave into the burning rose window, then the menus appear.
 * Idle, the candles flicker, the window breathes, embers rise and the title catches a gleam of light. */
(function (DH) {
  'use strict';
  const U = DH.util, h = U.h, ui = DH.ui;
  const S = () => DH.save.data;

  /* Links shown under the buttons once they exist. Stores expect the terms and the privacy policy to be reachable
   * before signing in; fill these in with the published pages and a support address. Empty ones stay hidden. */
  const LEGAL = { terms: '', privacy: '', support: '' };

  const SVG = (w, body) => '<svg viewBox="0 0 ' + w + ' ' + w + '" aria-hidden="true">' + body + '</svg>';
  const ICON = {
    globe: SVG(24, '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/>'),
    sound: SVG(24, '<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5c1.6 1.8 1.6 5.2 0 7M18.6 6c2.9 3.3 2.9 8.7 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
    mute: SVG(24, '<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    google: SVG(48, '<path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>'),
    mail: SVG(24, '<rect x="3" y="5.5" width="18" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 7l8.5 6.5L20.5 7" fill="none" stroke="currentColor" stroke-width="1.8"/>'),
  };
  const icon = (k, cls) => { const s = h('span.ti' + (cls ? '.' + cls : '')); s.innerHTML = ICON[k]; return s; };
  // candle flames painted into the backdrop, in its 390 x 844 frame
  const CANDLES = [[70, 702, 34], [88, 721.6, 27], [58, 725.8, 31], [318, 706, 34], [300, 724.7, 29], [334, 731.6, 27], [120, 679.2, 20], [270, 681.2, 20]];

  const title = { el: null, entering: false };

  /** Embers rising through the nave; on entering they rush outward from the window like sparks past the camera. */
  function embers(cv) {
    const g = cv.getContext('2d'), P = [];
    let W = 0, H = 0, warp = 0, alive = true, last = performance.now();
    const fit = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); };
    const spawn = (y) => ({ x: Math.random() * W, y: y == null ? H + 4 : y, vx: (Math.random() - 0.5) * 8, vy: -(10 + Math.random() * 26), r: 0.6 + Math.random() * 1.6, life: 1, hue: Math.random() < 0.25 ? 48 : 20 });
    fit(); for (let i = 0; i < 40; i++) P.push(spawn(Math.random() * H));
    window.addEventListener('resize', fit);
    const tick = (now) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      g.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * 0.415;
      for (const p of P) {
        if (warp > 0) { const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) + 1; p.vx += dx / d * 900 * warp * dt; p.vy += dy / d * 900 * warp * dt; }
        p.x += (p.vx + Math.sin(now / 700 + p.r * 9) * 6) * dt; p.y += p.vy * dt;
        if (p.y < -10 || p.x < -20 || p.x > W + 20 || p.y > H + 20) Object.assign(p, spawn());
        const a = 0.35 + 0.45 * Math.abs(Math.sin(now / 300 + p.r * 5)), len = warp > 0 ? Math.min(40, Math.hypot(p.vx, p.vy) * 0.05) : 0;
        g.strokeStyle = g.fillStyle = 'hsla(' + p.hue + ',100%,' + (warp > 0 ? 75 : 62) + '%,' + a + ')';
        if (len > 1) { g.lineWidth = p.r; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx / Math.hypot(p.vx, p.vy) * len, p.y - p.vy / Math.hypot(p.vx, p.vy) * len); g.stroke(); }
        else g.fillRect(p.x, p.y, p.r, p.r);
      }
      if (warp > 0 && P.length < 160) for (let i = 0; i < 6; i++) { const a = Math.random() * Math.PI * 2, s = 40 + Math.random() * 80; P.push({ x: cx + Math.cos(a) * 20, y: cy + Math.sin(a) * 20, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 0.8 + Math.random() * 1.6, hue: Math.random() < 0.4 ? 48 : 12 }); }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return { warp(v) { warp = v; }, stop() { alive = false; window.removeEventListener('resize', fit); } };
  }

  /** Show the title over the menus. done() runs once the player is through the window. */
  title.show = (done) => {
    const s = S();
    const root = h('div#title.intro');
    const stage = h('div.t-stage', h('div.t-bg'), h('div.t-rose'),
      ...CANDLES.map(([x, y, r], i) => h('i.t-candle', { style: { left: (x / 390 * 100) + '%', top: (y / 844 * 100) + '%', width: (r * 2.4 / 390 * 100) + '%', animationDelay: (i * 0.37 % 1.3) + 's, ' + (0.5 + i * 0.12) + 's' } })),
      h('div.t-fog'), h('div.t-fog.b'));
    const cv = h('canvas.t-embers');
    const flash = h('div.t-flash');
    const top = h('div.t-top');
    const mid = h('div.t-mid',
      h('img.t-emblem', { src: 'assets/icon.svg', alt: '', draggable: 'false' }),
      h('div.t-logo', 'Dreadhollow'),
      h('div.t-sub', 'Halls of the Damned'));
    const low = h('div.t-low');
    const foot = h('div.t-foot');
    root.append(stage, cv, mid, top, low, foot, flash);
    document.getElementById('app').appendChild(root);
    title.el = root; title.entering = false;
    const fx = embers(cv);
    setTimeout(() => root.classList.remove('intro'), 60);

    const C = DH.cloud;
    const enter = () => {
      if (title.entering) return; title.entering = true;
      s.titleChosen = true; DH.save.persist();
      DH.audio.play('enter'); DH.audio.vibrate(40);
      root.classList.add('entering'); fx.warp(1);
      setTimeout(() => { root.classList.add('gone'); done && done(); }, 1750);
      setTimeout(() => { fx.stop(); root.remove(); DH.events.off('cloud', draw); title.el = null; }, 2500);
    };
    const tap = (fn) => (e) => { e.stopPropagation(); if (!title.entering) fn(e); };

    /* the top bar: language on the left, sound on the right */
    const drawTop = () => {
      const langs = DH.i18n.list(), cur = langs.find((l) => l.code === DH.i18n.current) || langs[0];
      const muted = !(s.settings.master > 0);
      top.innerHTML = '';
      top.append(
        h('button.t-chip', { 'aria-label': t('settings.language'), onclick: tap(() => {
          const next = langs[(langs.indexOf(cur) + 1) % langs.length];
          s.settings.lang = next.code; DH.save.persist(); DH.i18n.set(next.code); DH.audio.play('page'); ui.refresh && ui.refresh(); draw();
        }) }, icon('globe'), h('span', cur.native)),
        h('button.t-chip.round', { 'aria-label': t('settings.music'), onclick: tap(() => {
          if (s.settings.master > 0) { s.settings.masterWas = s.settings.master; s.settings.master = 0; } else s.settings.master = s.settings.masterWas || 1;
          DH.audio.setVolumes(s.settings.sfx * s.settings.master, s.settings.music * s.settings.master); DH.save.persist(); DH.audio.play('click'); drawTop();
        }) }, icon(muted ? 'mute' : 'sound')));
    };

    /* the ways in */
    const googleIn = async (btn) => {
      btn.disabled = true;
      try {
        const r = await C.signInGoogle();
        if (r && r.needPassword) ui.openEmailAuth('link', r);
        else if (r && r.ok) enter();
      } catch (e) { if (e.code !== 'cancelled') ui.cloudErr(e); } finally { btn.disabled = false; }
    };
    const draw = () => {
      if (!title.el || title.entering) return;
      drawTop();
      low.innerHTML = ''; foot.innerHTML = '';
      const u = C.user;
      if (!s.titleChosen && !u) {
        low.append(
          h('button.btn.gold.big.block.t-main', { onclick: tap(enter) }, t('title.guest')),
          h('div.t-or', h('span', t('title.or'))),
          h('button.btn.block.t-google', { onclick: tap((e) => googleIn(e.currentTarget)) }, icon('google'), t('cloud.google')),
          h('button.btn.ghost.block', { onclick: tap(() => ui.openEmailAuth('signin')) }, icon('mail'), t('cloud.emailSignIn')),
          h('div.t-note', t('title.guestNote')));
      } else {
        low.append(
          h('div.t-tap', t('title.tap')),
          h('div.t-who', u ? t('title.signedAs', { name: u.name || u.email || '—' }) : t('title.asGuest'),
            h('button.t-link', { onclick: tap(() => ui.openAccount()) }, t(u ? 'title.change' : 'title.signIn'))));
      }
      const links = [];
      if (LEGAL.terms) links.push(h('a', { href: LEGAL.terms, target: '_blank', rel: 'noopener', onclick: (e) => e.stopPropagation() }, t('title.terms')));
      if (LEGAL.privacy) links.push(h('a', { href: LEGAL.privacy, target: '_blank', rel: 'noopener', onclick: (e) => e.stopPropagation() }, t('title.privacy')));
      if (LEGAL.support) links.push(h('a', { href: 'mailto:' + LEGAL.support, onclick: (e) => e.stopPropagation() }, t('title.support')));
      foot.append(h('span.t-ver', 'v' + DH.VERSION));
      if (links.length) foot.append(h('span.t-legal', ...links));
    };
    draw();
    DH.events.on('cloud', draw);
    // once the way in is chosen, a tap anywhere on the screen enters (not on the buttons, not under a window)
    root.addEventListener('click', () => { if ((s.titleChosen || C.user) && !ui.topModal()) enter(); });
  };

  DH.title = title;
})(window.DH);
