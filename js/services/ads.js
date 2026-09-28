/* Advertising adapter.
 * The game only talks to DH.ads.rewarded(placement) and DH.ads.interstitial(placement).
 * provider 'mock' shows an in-game placeholder so every ad flow is testable in the browser.
 * To ship: implement a provider that wraps e.g. AdMob (@capacitor-community/admob)
 * or Unity Ads / AppLovin MAX, and set DH.ads.provider = thatProvider at boot. */
(function (DH) {
  'use strict';
  const h = DH.util.h;

  const MockProvider = {
    name: 'mock',
    show(kind) {
      return new Promise((resolve) => {
        const secs = kind === 'rewarded' ? 5 : 3;
        let left = secs;
        const count = h('div.ad-count', t('ad.rewardIn', { s: left }));
        const close = h('button.ad-close.hidden', { 'aria-label': t('common.close') }, DH.icons.img('u_close', 'ci'));
        const layer = h('div.ad-layer',
          h('div.ad-tag', t('ad.label')),
          h('div.ad-body',
            h('div.ad-art', DH.art.img('n_pass', 'ad-icon')),
            h('div.ad-title', t('ad.demoTitle')),
            h('div.ad-sub', t('ad.demoSub')),
            h('div.ad-note', t('ad.mockNote'))),
          count, close);
        document.getElementById('modals').appendChild(layer);
        DH.audio.stopMusic();
        const iv = setInterval(() => {
          left--;
          count.textContent = left > 0 ? t(kind === 'rewarded' ? 'ad.rewardIn' : 'ad.closeIn', { s: left }) : (kind === 'rewarded' ? t('ad.rewardReady') : '');
          if (left <= 0) { clearInterval(iv); close.classList.remove('hidden'); }
        }, 1000);
        close.addEventListener('click', () => { layer.remove(); resolve(true); });
      });
    },
  };

  /* AdMob in the Android app (@capacitor-community/admob). Test ads on test phones (the debug build) and whenever
   * live.json has no ad units yet; the real units come from live.json "ads" (so they change without an update).
   * Before any ad the player is asked for consent where the law needs it (Google's consent form, set up in AdMob:
   * Privacy & messaging). Each rewarded ad carries the player's account id, so AdMob can tell the game's server
   * that the ad was really watched (server-side verification; the server pays only then, see functions/ads.js). */
  const TEST = { rewarded: 'ca-app-pub-3940256099942544/5224354917', interstitial: 'ca-app-pub-3940256099942544/1033173712' };
  const AdMobProvider = {
    name: 'admob',
    plugin: () => DH.platform.plugin('AdMob'),
    testing: () => DH.BUILD !== 'release',
    unit(kind) {
      const cfg = (DH.live && DH.live.config && DH.live.config.ads) || {};
      return (!this.testing() && cfg[kind]) || TEST[kind];
    },
    /** Consent first (GDPR/UK: Google's form), then the SDK; once per launch, retried if it failed. */
    init() {
      if (this.ready) return this.ready;
      const A = this.plugin();
      this.ready = (async () => {
        try {
          const info = await A.requestConsentInfo();
          this.consent = info;
          if (info && info.isConsentFormAvailable && info.status === 'REQUIRED') this.consent = await A.showConsentForm();
        } catch (e) { console.warn('ad consent', e); }
        await A.initialize({ initializeForTesting: this.testing() });
        return true;
      })().catch((e) => { this.ready = null; throw e; });
      return this.ready;
    },
    /** The player may change their ad choices at any time where the law asks for it (Settings). */
    privacyRequired() { return !!(this.consent && this.consent.privacyOptionsRequirementStatus === 'REQUIRED'); },
    async privacyOptions() { await this.plugin().showPrivacyOptionsForm(); },
    /** Resolves when the ad window closes: true if the reward was earned (rewarded) or the ad was seen. */
    async show(kind) {
      const A = this.plugin();
      await this.init();
      if (this.consent && this.consent.canRequestAds === false) return false;
      const uid = DH.cloud && DH.cloud.authUser && DH.cloud.authUser.uid;
      const rewarded = kind === 'rewarded';
      if (rewarded) await A.prepareRewardVideoAd(Object.assign({ adId: this.unit('rewarded'), isTesting: this.testing() }, uid ? { ssv: { userId: uid, customData: 'dh' } } : {}));
      else await A.prepareInterstitial({ adId: this.unit('interstitial'), isTesting: this.testing() });
      DH.audio.stopMusic();
      const pre = rewarded ? 'onRewardedVideoAd' : 'interstitialAd';
      return new Promise((resolve) => {
        let earned = false, done = false;
        const handles = [];
        const finish = (v) => { if (done) return; done = true; handles.forEach((hd) => hd.then((x) => x.remove()).catch(() => {})); resolve(v); };
        // the reward can be reported a moment after the window closes: wait a little before deciding
        handles.push(A.addListener(pre + 'Dismissed', () => setTimeout(() => finish(rewarded ? earned : true), 400)));
        handles.push(A.addListener(pre + 'FailedToShow', () => finish(false)));
        if (rewarded) handles.push(A.addListener('onRewardedVideoAdReward', () => { earned = true; }));
        (rewarded ? A.showRewardVideoAd() : A.showInterstitial()).then(() => { if (rewarded) earned = true; }, () => finish(false));
      });
    },
  };

  const ads = {
    provider: DH.platform.native && DH.platform.plugin('AdMob') ? AdMobProvider : MockProvider,
    busy: false,
    /** Rewarded video. Resolves true if the player earned the reward. */
    async rewarded(placement) {
      if (this.busy) return false;
      const S = DH.save.data;
      this.busy = true;
      let ok = true;
      try {
        if (!S.purchases.noAds) ok = await this.provider.show('rewarded', placement);
      } catch (e) { console.warn('ad failed', e); ok = false; }
      this.busy = false;
      if (ok) {
        S.stats.adsWatched++;
        DH.meta.track('ads', 1);
        DH.save.persist();
      } else DH.ui.toast(t('ad.unavailable'), 'bad');
      DH.events.emit('adClosed');
      return ok;
    },
    /** Ask for ad consent at launch (the app only), so the first ad does not wait for it. */
    init() { if (this.provider.init) this.provider.init().catch((e) => console.warn('ads init', e)); },
    privacyRequired() { return !!(this.provider.privacyRequired && this.provider.privacyRequired()); },
    privacyOptions() { return this.provider.privacyOptions ? this.provider.privacyOptions().catch((e) => console.warn(e)) : Promise.resolve(); },
    /** Interstitial shown between runs; skipped entirely with the No-Ads purchase. */
    async interstitial(placement) {
      const S = DH.save.data;
      if (S.purchases.noAds || this.busy) return;
      this.busy = true;
      try { await this.provider.show('interstitial', placement); } catch (e) { /* ignore */ }
      this.busy = false;
      DH.events.emit('adClosed');
    },
  };
  DH.ads = ads;
})(window.DH);
