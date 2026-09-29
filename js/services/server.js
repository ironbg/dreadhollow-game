/* The game's server (Cloud Functions, functions/): where the profile really lives once live.json says "server": true.
 * Then every change to currencies, items and progress is an action (DH.actions) sent to the server, which runs the same
 * DH.meta code on its own copy of the profile and sends the profile back; fights start and end there too, so their
 * rewards are counted from what the server saw. The device only sets its free fields (settings, choices on screen).
 * Until the server is switched on, the same calls run here on the device, as they always have. */
(function (DH) {
  'use strict';
  const REGION = 'europe-west1', PROJECT = 'dreadhollow-b49c7';
  const TIMEOUT_MS = 30e3; // a first call can wait for the server to start (a few seconds); longer means no connection
  const PENDING = 'dh_pending_run'; // a finished fight the server has not settled yet (no connection at the end)
  const fail = (code, extra) => Object.assign(new Error(code), { code }, extra);
  const readPending = () => { try { return JSON.parse(localStorage.getItem(PENDING)) || null; } catch (e) { return null; } };
  const writePending = (o) => { try { if (o) localStorage.setItem(PENDING, JSON.stringify(o)); else localStorage.removeItem(PENDING); } catch (e) { /* storage blocked */ } };
  /** Codes that mean "try again later" (the fight itself was fine). */
  const RETRY = ['offline', 'server', 'requires-login', 'too-many'];


  const server = {
    RETRY,
    ticket: null, // the fight the server started (remote mode)
    syncedUid: null, // the account this device last synced with the server this session
    /** True when the profile lives on the server: switched on in live.json, and a real (Firebase) account to call with. */
    remote() {
      const c = DH.live && DH.live.config;
      return !!(c && c.server) && !!DH.cloud && DH.cloud.provider && DH.cloud.provider.name === 'firebase'
        && !(DH.cloud.guestBlocked && !DH.cloud.user); // no guest accounts on the project: a guest stays on the device
    },
    url(name) {
      if (/[?&]emu=1\b/.test(location.search) && ['localhost', '127.0.0.1'].includes(location.hostname)) return 'http://127.0.0.1:5001/' + PROJECT + '/' + REGION + '/' + name; // local tests
      return 'https://' + REGION + '-' + PROJECT + '.cloudfunctions.net/' + name;
    },
    /** Which copy of the game is calling: the store app or the web version (each has its own minimum version). */
    platform() { return DH.platform.native ? 'app' : 'web'; },
    async call(name, data) {
      let token = null;
      try { token = DH.cloud.idToken ? await DH.cloud.idToken() : null; } catch (e) { throw fail('offline'); } // an expired token needs the network to renew
      if (!token) throw fail('requires-login');
      let res, j = {};
      const ctl = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = ctl && setTimeout(() => ctl.abort(), TIMEOUT_MS);
      try {
        res = await fetch(this.url(name), { method: 'POST', signal: ctl ? ctl.signal : undefined,
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ data: Object.assign({ p: this.platform() }, data) }) });
        j = await res.json().catch(() => ({}));
      } catch (e) { throw fail('offline'); } finally { clearTimeout(timer); }
      if (!res.ok || j.error) {
        const d = j.error && j.error.details;
        const code = (d && d.code) || (j.error && j.error.status === 'UNAUTHENTICATED' ? 'requires-login' : res.status === 429 ? 'too-many' : 'server');
        if (code === 'outdated') DH.live.outdated(); // this copy is too old for the server: the update window
        throw fail(code, { details: d });
      }
      return j.result;
    },
    /** Server mode needs an account; a guest's is being made at launch: wait for it a little. */
    async account() {
      for (let i = 0; i < 50 && !(DH.cloud.authUser); i++) await new Promise((r) => setTimeout(r, 200));
      if (!DH.cloud.authUser) throw fail(navigator.onLine === false ? 'offline' : 'requires-login');
      return DH.cloud.authUser.uid;
    },
    /** Before an action: this device and the server have met this session (else the server has no profile yet). */
    async ready() {
      const uid = await this.account();
      if (this.syncedUid !== uid) await this.sync();
    },
    /** The fields the device may set, as they are now. */
    free() { const s = DH.save.data, o = {}; DH.actions.FREE.forEach((k) => { o[k] = s[k]; }); return o; },
    /** Take the server's profile as this device's. */
    adopt(save, rev) {
      if (!save) return;
      DH.save.adopt(save);
      if (rev != null) DH.save.meta.rev = rev;
      DH.save.meta.dirty = false; DH.save.meta.uid = DH.cloud.user && DH.cloud.user.uid;
      DH.save.persist(true); DH.save.writeMeta();
      DH.events.emit('meta');
    },
    /** Bring this device and the server together: the server's profile comes back with this device's free fields on it.
     *  The first time an account reaches the server, the profile on this device becomes its starting point. */
    async sync() {
      const uid = await this.account();
      const r = await this.call('sync', { free: this.free(), local: DH.save.data, v: DH.VERSION });
      this.adopt(r.save, r.rev);
      this.syncedUid = uid;
      this.sendPending().catch(() => {}); // a fight that ended without a connection is settled now
      return r;
    },
    /** One player action (DH.actions.list). Resolves to what the action returns; a failed call rejects with a code. */
    async act(name, args) {
      args = args || {};
      const def = DH.actions.list[name];
      if (!def) throw fail('unknown-action');
      const ad = def.ad && def.ad(args), remote = this.remote();
      if (ad && (remote || def.adOutside) && !(await DH.ads.rewarded(ad))) return null;
      if (!remote) return def.run(args);
      await this.ready();
      const r = await this.call('act', { name, args, free: this.free(), v: DH.VERSION });
      this.adopt(r.save, r.rev);
      return r.result;
    },
    /** A store purchase (Google Play): the server checks the token with Google, delivers it once, and says what it gave. */
    async purchase(productId, token) {
      await this.ready();
      const r = await this.call('purchase', { productId, token, v: DH.VERSION });
      this.adopt(r.save, r.rev);
      return r.result;
    },
    /** A fight starts: torches are paid (on the server, which also notes the time). */
    async runStart(cost) {
      if (!this.remote()) return DH.meta.beginRun(cost);
      await this.ready();
      await this.sendPending(true); // the last fight first: a new start would close it unrewarded
      const s = DH.save.data;
      const r = await this.call('runStart', { stage: s.selectedStage, hero: s.selectedHero, free: this.free(), v: DH.VERSION });
      this.adopt(r.save, r.rev);
      this.ticket = r.ticket || null;
      return !!r.ticket;
    },
    /** A fight ends: its summary is settled (on the server, which checks it against what it saw). */
    async runEnd(summary) {
      if (!this.remote()) return DH.meta.settleRun(summary);
      const job = { ticket: this.ticket, summary, uid: DH.cloud.authUser && DH.cloud.authUser.uid, at: Date.now() };
      this.ticket = null;
      writePending(job); // kept until the server has settled it, so no connection at the end never loses a fight
      return this.settle(job);
    },
    async settle(job) {
      let r;
      try { r = await this.call('runEnd', { ticket: job.ticket, summary: job.summary, v: DH.VERSION }); } catch (e) {
        if (!RETRY.includes(e.code)) writePending(null); // refused for good (not confirmed, already settled): nothing to retry
        throw e;
      }
      writePending(null);
      this.adopt(r.save, r.rev);
      return r.result;
    },
    /** A fight still waiting to be settled on this device (for this account). */
    pending() { const p = readPending(); return p && DH.cloud.authUser && p.uid === DH.cloud.authUser.uid ? p : null; },
    /** Settle the waiting fight, if any. strict: a failure is thrown (before a new fight); otherwise it is kept for later. */
    async sendPending(strict, quiet) {
      const job = this.pending();
      if (!job || this.sending) return null;
      this.sending = true;
      try {
        const res = await this.settle(job);
        if (!quiet) DH.ui.toast(t('server.pendingDone'), 'good');
        return res;
      } catch (e) {
        if (strict && RETRY.includes(e.code)) throw e;
        return null;
      } finally { this.sending = false; }
    },
  };
  DH.server = server;
})(window.DH);
