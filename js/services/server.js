/* The game's server (Cloud Functions, functions/): where the profile really lives once live.json says "server": true.
 * Then every change to currencies, items and progress is an action (DH.actions) sent to the server, which runs the same
 * DH.meta code on its own copy of the profile and sends the profile back; fights start and end there too, so their
 * rewards are counted from what the server saw. The device only sets its free fields (settings, choices on screen).
 * Until the server is switched on, the same calls run here on the device, as they always have. */
(function (DH) {
  'use strict';
  const REGION = 'europe-west1', PROJECT = 'dreadhollow-b49c7';
  const fail = (code, extra) => Object.assign(new Error(code), { code }, extra);

  const server = {
    ticket: null, // the fight the server started (remote mode)
    /** True when the profile lives on the server: switched on in live.json, and a real (Firebase) account to call with. */
    remote() {
      const c = DH.live && DH.live.config;
      return !!(c && c.server) && !!DH.cloud && DH.cloud.provider && DH.cloud.provider.name === 'firebase';
    },
    url(name) {
      if (/[?&]emu=1\b/.test(location.search) && ['localhost', '127.0.0.1'].includes(location.hostname)) return 'http://127.0.0.1:5001/' + PROJECT + '/' + REGION + '/' + name; // local tests
      return 'https://' + REGION + '-' + PROJECT + '.cloudfunctions.net/' + name;
    },
    async call(name, data) {
      const token = DH.cloud.idToken ? await DH.cloud.idToken() : null;
      if (!token) throw fail('requires-login');
      let res, j = {};
      try {
        res = await fetch(this.url(name), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ data }) });
        j = await res.json().catch(() => ({}));
      } catch (e) { throw fail('offline'); }
      if (!res.ok || j.error) {
        const d = j.error && j.error.details;
        throw fail((d && d.code) || (j.error && j.error.status === 'UNAUTHENTICATED' ? 'requires-login' : 'server'), { details: d });
      }
      return j.result;
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
      const r = await this.call('sync', { free: this.free(), local: DH.save.data, v: DH.VERSION });
      this.adopt(r.save, r.rev);
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
      const r = await this.call('act', { name, args, free: this.free(), v: DH.VERSION });
      this.adopt(r.save, r.rev);
      return r.result;
    },
    /** A fight starts: torches are paid (on the server, which also notes the time). */
    async runStart(cost) {
      if (!this.remote()) return DH.meta.useEnergy(cost);
      const s = DH.save.data;
      const r = await this.call('runStart', { stage: s.selectedStage, hero: s.selectedHero, free: this.free(), v: DH.VERSION });
      this.adopt(r.save, r.rev);
      this.ticket = r.ticket || null;
      return !!r.ticket;
    },
    /** A fight ends: its summary is settled (on the server, which checks it against what it saw). */
    async runEnd(summary) {
      if (!this.remote()) return DH.meta.settleRun(summary);
      const r = await this.call('runEnd', { ticket: this.ticket, summary, v: DH.VERSION });
      this.ticket = null;
      this.adopt(r.save, r.rev);
      return r.result;
    },
  };
  DH.server = server;
})(window.DH);
