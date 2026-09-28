/* In-app purchase adapter.
 * 'play'  the Android app: Google Play Billing (@capgo/native-purchases). With the game's server on, the server checks
 *         every purchase with Google (functions/purchases.js) and only then delivers it, so a forged purchase gives
 *         nothing; the app then consumes gem packs and other repeatable products so they can be bought again.
 *         A purchase that was paid but not delivered (the app closed, no connection) is delivered at the next launch.
 * 'mock'  the browser: a confirmation dialog and no money charged (switched off once the server holds the profile).
 * Product ids are the keys of DH.economy.products; the same ids are created in the Play Console as one-time products. */
(function (DH) {
  'use strict';

  const MockStore = {
    name: 'mock',
    price(id) { const p = DH.economy.products[id]; return p ? '$' + p.price.toFixed(2) : ''; },
    buy(id) {
      return new Promise((resolve) => {
        const p = DH.economy.products[id];
        DH.ui.confirm({
          title: t('iap.confirmTitle'),
          body: t('iap.confirmBody', { item: DH.meta.productName(id), price: this.price(id) }),
          note: t('iap.mockNote'),
          ok: t('iap.buyFor', { price: this.price(id) }),
          cancel: t('common.cancel'),
        }).then((yes) => resolve(!!(yes && p)));
      });
    },
    restore() { return Promise.resolve([]); },
  };

  /** Bought once and kept (never consumed): the rest can be bought again. */
  const kept = (id) => { const p = DH.economy.products[id]; return !!(p && (p.once || p.type === 'noads')); };
  /** The purchase is tied to the player's account (a hash of it, never the id itself), so Google can tell the server
   *  whose purchase a token is and a token cannot be handed to another account. */
  const accountToken = async () => {
    const uid = DH.cloud && DH.cloud.authUser && DH.cloud.authUser.uid;
    if (!uid || !(window.crypto && crypto.subtle)) return undefined;
    const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('dh:' + uid));
    return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const PlayStore = {
    name: 'play',
    P: () => DH.platform.plugin('NativePurchases'),
    info: {}, // product id -> the store's product (its price in the player's currency)
    async init() {
      const ids = Object.keys(DH.economy.products);
      try {
        const r = await this.P().getProducts({ productIdentifiers: ids, productType: 'inapp' });
        ((r && r.products) || []).forEach((p) => { this.info[p.identifier] = p; });
        DH.events.emit('meta'); // prices in the player's currency
      } catch (e) { console.warn('store products', e); }
      await this.recover();
    },
    price(id) { const i = this.info[id], p = DH.economy.products[id]; return i ? i.priceString : p ? '$' + p.price.toFixed(2) : ''; },
    /** Returns the delivered rewards, or null when the player cancelled. */
    async buy(id) {
      let tx;
      try {
        tx = await this.P().purchaseProduct({ productIdentifier: id, productType: 'inapp', appAccountToken: await accountToken(), isConsumable: false, autoAcknowledgePurchases: false });
      } catch (e) {
        if (/USER_CANCELED/.test((e && (e.code || e.message)) || '')) return null;
        if (/ITEM_ALREADY_OWNED/.test((e && (e.code || e.message)) || '')) { await this.recover(); return null; } // paid earlier, not yet delivered
        throw Object.assign(new Error('store'), { code: 'store' });
      }
      return this.deliver(tx);
    },
    /** A paid purchase: delivered by the server (or here, with the server off), then consumed if it can be bought again. */
    async deliver(tx) {
      const id = tx.productIdentifier, token = tx.purchaseToken;
      if (!DH.economy.products[id] || !token) return [];
      if (tx.purchaseState && tx.purchaseState !== '1') throw Object.assign(new Error('pending'), { code: 'pending' }); // paid in cash etc.: delivered once it clears
      let out;
      if (DH.server.remote()) {
        const r = await DH.server.purchase(id, token);
        out = r || [];
      } else {
        // the server is off: the store's word is taken here (tokens already delivered on this device are skipped)
        const done = DH.save.data.purchases.tokens || (DH.save.data.purchases.tokens = {});
        const key = token.slice(-40);
        out = done[key] || (kept(id) && DH.save.data.purchases.once[id]) ? [] : DH.meta.fulfillProduct(id, true);
        done[key] = 1; DH.save.persist(true);
        DH.cloud.flush('purchase');
      }
      try {
        if (kept(id)) await this.P().acknowledgePurchase({ purchaseToken: token });
        else await this.P().consumePurchase({ purchaseToken: token });
      } catch (e) { /* already done by the server, or retried at the next launch */ }
      return out;
    },
    /** Purchases paid but not delivered yet (the app was closed, no connection): delivered now. */
    async recover() {
      let list = [];
      try { list = ((await this.P().getPurchases({ productType: 'inapp' })) || {}).purchases || []; } catch (e) { return; }
      for (const tx of list) {
        if (tx.purchaseState && tx.purchaseState !== '1') continue;
        if (kept(tx.productIdentifier) && tx.isAcknowledged && DH.save.data.purchases.once[tx.productIdentifier]) continue;
        if (kept(tx.productIdentifier) && tx.isAcknowledged && tx.productIdentifier === 'noads' && DH.save.data.purchases.noAds) continue;
        try {
          const out = await this.deliver(tx);
          if (out && out.length) DH.ui.rewardPopup(t('iap.thanks'), out);
        } catch (e) { console.warn('purchase not delivered yet', tx.productIdentifier, e.code || e); }
      }
    },
    /** Restore: the kept purchases this Google account owns come back (a new phone, a reinstall). */
    async restore() {
      const list = ((await this.P().getPurchases({ productType: 'inapp' })) || {}).purchases || [];
      for (const tx of list) if (kept(tx.productIdentifier) && (!tx.purchaseState || tx.purchaseState === '1')) {
        try { await this.deliver(tx); } catch (e) { console.warn('restore', tx.productIdentifier, e.code || e); }
      }
      return [];
    },
  };

  const iap = {
    provider: DH.platform.native && DH.platform.plugin('NativePurchases') ? PlayStore : MockStore,
    /** The app: the store's prices, and any purchase waiting to be delivered (after the account is known). */
    init() {
      if (!this.provider.init) return;
      const go = () => this.provider.init().catch((e) => console.warn('store init', e));
      if (DH.cloud.authReady) go(); else DH.events.once('cloud', go);
    },
    price(id) { return this.provider.price(id); },
    async buy(id) {
      const p = DH.economy.products[id];
      if (!p) return false;
      if (p.once && DH.save.data.purchases.once[id]) { DH.ui.toast(t('iap.owned'), 'bad'); return false; }
      if (DH.server.remote() && this.provider.name === 'mock') { DH.ui.toast(t('iap.soon'), 'bad'); return false; } // no free purchases once the server holds the profile
      if (this.provider.name === 'play') {
        if (this.busy) return false;
        this.busy = true;
        try {
          const out = await this.provider.buy(id);
          if (!out) return false; // cancelled
          DH.audio.play('buy'); DH.ui.rewardPopup(t('iap.thanks'), out);
          return true;
        } catch (e) {
          if (e.code === 'pending') DH.ui.toast(t('iap.pending'));
          else if (e.code === 'store') DH.ui.toast(t('iap.failed'), 'bad');
          else DH.ui.serverErr(e); // paid, but not delivered yet: it is retried at the next launch
          return false;
        } finally { this.busy = false; }
      }
      let ok = false;
      try { ok = await this.provider.buy(id); } catch (e) { console.warn(e); }
      if (!ok) return false;
      DH.meta.fulfillProduct(id);
      DH.cloud.flush('purchase'); // paid progress goes to the cloud right away
      return true;
    },
    async restore() {
      if (DH.server.remote() && this.provider.name === 'mock') { DH.ui.toast(t('iap.soon'), 'bad'); return; }
      let ids = [];
      try { ids = await this.provider.restore(); } catch (e) { DH.ui.toast(t('iap.failed'), 'bad'); return; }
      ids.forEach((id) => { const p = DH.economy.products[id]; if (p && (p.once || p.type === 'noads')) DH.meta.fulfillProduct(id, true); });
      DH.ui.toast(t('iap.restored'));
    },
  };
  DH.iap = iap;
})(window.DH);
