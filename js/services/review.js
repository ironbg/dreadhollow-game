/* Store review: the official in-app rating sheet (Google Play / App Store), app only.
 * Asked right after a won battle, back at the home screen: first after the 2nd victory, then at most once a month,
 * three times in all. Nothing is asked before it (store rules forbid gating the sheet on "do you like the game?"),
 * and the system itself decides whether the sheet appears. In the browser this does nothing.
 * Needs the plugin: npm i @capacitor-community/in-app-review && npx cap sync */
(function (DH) {
  'use strict';
  const FIRST_AT_WINS = 2, GAP_MS = 30 * 86400000, MAX_ASKS = 3;
  DH.review = {
    /** Call after a victory, once the player is back at the home screen. */
    async afterWin() {
      const R = DH.platform.plugin('InAppReview'), s = DH.save.data;
      if (!R || !s) return false;
      const r = s.seen.review || (s.seen.review = { n: 0, at: 0 });
      if (s.stats.wins < FIRST_AT_WINS || r.n >= MAX_ASKS || Date.now() - r.at < GAP_MS) return false;
      r.n++; r.at = Date.now(); DH.save.persist();
      try { await R.requestReview(); return true; } catch (e) { return false; }
    },
  };
})(window.DH);
