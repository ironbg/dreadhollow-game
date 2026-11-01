/* Live settings (live.json on the web host): the minimum and newest game versions and the events calendar, read at
 * start and whenever the player comes back to the game, so they change without a new release. The same answer sets
 * the game's clock: the host's Date header corrects a phone whose clock is wrong or was moved, so daily resets,
 * energy, the Vigil and events run on the real date. Without a connection the last answer is used. */
(function (DH) {
  'use strict';
  const U = DH.util;
  const HOST = 'https://dreadhollow-b49c7.web.app/';
  // live.json with the admin panel's override on top (functions: live); the plain file when the server cannot answer
  const FN = 'https://europe-west1-dreadhollow-b49c7.cloudfunctions.net/live';
  const HOSTS = ['dreadhollow-b49c7.web.app', 'dreadhollow-b49c7.firebaseapp.com', 'localhost', '127.0.0.1'];
  const KEY = 'dh_live';
  const STORE = 'https://play.google.com/store/apps/details?id=com.dreadhollow.game';
  const SKEW_MS = 60e3; // a phone within a minute of the host is left alone
  const RECHECK_MS = 10 * 60e3;

  /** "1.60.12" → comparable: negative when a < b. */
  const cmp = (a, b) => {
    const x = String(a || '0').split('.').map(Number), y = String(b || '0').split('.').map(Number);
    for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; }
    return 0;
  };
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const write = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* storage blocked: this session only */ } };

  const live = {
    config: null, offset: 0, fetchedAt: 0, online: false,
    cmp,
    /** Where live.json is read from: this host when it is the game's own (or a local copy), else the web host. */
    url() { return (HOSTS.includes(location.hostname) && !DH.platform.native ? '' : HOST) + 'live.json'; },
    /** Where to ask, in turn: the server (with the panel's changes), then the file. A local copy reads its own file only. */
    urls() { return /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && !DH.platform.native ? [this.url()] : [FN, this.url()]; },
    /** Start: the last known answer at once (the clock too), then a fresh one. */
    init() {
      const saved = read();
      if (saved.config) this.config = saved.config;
      this.setOffset(saved.offset || 0);
      DH.events.on('app:resume', () => this.refresh());
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.refresh(); });
      return this.refresh(true);
    },
    setOffset(ms) { this.offset = Math.abs(ms) < SKEW_MS ? 0 : ms; U.clockOffset = this.offset; },
    async refresh(force) {
      if (!force && Date.now() - this.fetchedAt < RECHECK_MS) return this.config;
      this.fetchedAt = Date.now();
      const t0 = Date.now();
      let res = null, ta = t0;
      for (const u of this.urls()) {
        ta = Date.now(); // the round trip that answered sets the clock
        try { const r = await fetch(u + '?t=' + ta, { cache: 'no-store' }); if (r.ok) { res = r; break; } } catch (e) { /* the next one */ }
      }
      const t1 = Date.now();
      if (!res) { this.online = false; this.check(); return this.config; }
      // the host's clock: Date is whole seconds, so the middle of that second, against the middle of the round trip
      const server = Date.parse(res.headers.get('Date') || '');
      if (Number.isFinite(server)) this.setOffset(server + 500 - (ta + t1) / 2);
      try { this.config = await res.json(); this.online = true; } catch (e) { this.online = false; }
      write({ config: this.config, offset: this.offset });
      DH.events.emit('live', this.config);
      this.check();
      return this.config;
    },
    /** Events whose window holds now (on the corrected clock). */
    events() {
      const now = U.now();
      return ((this.config && this.config.events) || []).filter((e) => e && Date.parse(e.start) <= now && now < Date.parse(e.end));
    },
    /** The version rules for this copy: the app (store builds) or the web version. */
    rules() { const c = this.config || {}; return (DH.platform.native ? c.app : c.web) || {}; },
    /** Too old to play: stop at a window that sends the player to the new version. Newer one out: say so once. */
    check() {
      const r = this.rules(), v = DH.VERSION;
      if (r.min && cmp(v, r.min) < 0) { DH.ui.forceUpdate(r); return; }
      if (r.latest && cmp(v, r.latest) < 0 && this.told !== r.latest) { this.told = r.latest; DH.ui.newVersion(r); }
    },
    /** The game's server turned this copy away as too old (it may know before live.json does): the update window. */
    outdated() { DH.ui.forceUpdate(this.rules()); },
    /** Get the new version: the web page reloads past its offline cache; the app opens its page in the store
     *  (a link outside the game leaves the app for the Play Store). */
    update(r) {
      if (r && r.play && DH.appUpdate) { DH.appUpdate.retry(); return; } // Google Play's own update window
      if (DH.platform.native) { location.href = (r && r.store) || (this.config && this.config.app && this.config.app.store) || STORE; return; }
      const go = () => location.reload();
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) navigator.serviceWorker.getRegistration().then((g) => (g ? g.update() : null)).catch(() => {}).then(go);
      else go();
    },
  };
  DH.live = live;
})(window.DH);
