/* Google Play in-app updates (the Android app only). When the game starts, and whenever the player comes back to it,
 * it asks Google Play whether a newer build is out; if so, Play's immediate update runs: a full-screen Play window
 * that downloads the new build and restarts the game into it. Turning it down (or a failure) leaves the game shut
 * behind our own update window, whose button starts Play's update again (or, failing that, opens the store page).
 * Never during a fight: the restart would lose it, so a check that comes mid-fight waits for the menus.
 * Play only answers for copies installed from Google Play (test tracks included); anything else plays on.
 * The plugin: @capawesome/capacitor-app-update (npx cap sync). live.json app.min stays as the server's own brake. */
(function (DH) {
  'use strict';
  const AVAILABLE = 2, IN_PROGRESS = 3, OK = 0; // AppUpdateAvailability / AppUpdateResultCode
  const RECHECK_MS = 5 * 60000;                   // coming back to the app asks Play again at most every 5 minutes
  const inMenus = (fn) => { if (DH.game && DH.game.mode === 'run') DH.events.once('menu', fn); else fn(); };

  const up = {
    busy: false, at: 0, pending: false,
    plugin() { return DH.platform.plugin('AppUpdate'); },
    init() {
      if (!this.plugin()) return; // the browser, or a build without the plugin
      setTimeout(() => this.check(true), 2500); // once the game is up
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.check(); });
    },
    /** Ask Play; an update found starts Play's immediate flow (in the menus). */
    check(force) {
      if (this.busy || this.pending || (!force && Date.now() - this.at < RECHECK_MS)) return;
      this.at = Date.now(); this.busy = true;
      this.plugin().getAppUpdateInfo().then((info) => {
        this.busy = false;
        const need = info && (info.updateAvailability === IN_PROGRESS || (info.updateAvailability === AVAILABLE && info.immediateUpdateAllowed !== false));
        if (need) { this.pending = true; inMenus(() => this.run()); }
      }, (e) => { this.busy = false; console.warn('app update check', e); }); // Play unreachable, or not a Play install: play on
    },
    /** Play's full-screen update. OK: Play restarts the game into the new build. Anything else: our window, no way past. */
    async run() {
      let r = null;
      try { r = await this.plugin().performImmediateUpdate(); } catch (e) { console.warn('app update', e); }
      if (r && r.code === OK) return;
      DH.ui.forceUpdate({ play: true });
    },
    /** The window's button: Play's update again; if Play will not run it, the store page. */
    async retry() {
      let r = null;
      try { r = await this.plugin().performImmediateUpdate(); } catch (e) { r = null; }
      if (r && r.code === OK) return;
      if (!r || r.code !== 1) { try { await this.plugin().openAppStore(); } catch (e) { DH.live.update({}); } } // 1 = turned down again: the window stays
    },
  };
  DH.appUpdate = up;
})(window.DH);
