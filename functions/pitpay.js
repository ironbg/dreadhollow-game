/* The Pit's weekly rewards. No scheduler: the first call of a new week (sync) pays the week before, once.
 * A document payouts/<board key> is claimed in a transaction, so of all the servers that notice the new week only
 * one pays; then the top 50 of boards/<key>/scores get their reward (E.PIT.weekly) in their profile, with a message
 * in their inbox (the game shows it at once). Guests are never on the boards, so they are never paid. */
'use strict';

/** The ISO week of a time, as the game's boards name it (meta.boardPeriodKey): 2026-w45. */
function weekKey(ms) {
  const d = new Date(ms), t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())), day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const w = Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
  return t.getUTCFullYear() + '-w' + String(w).padStart(2, '0');
}

function makePitPay({ db, FieldValue, onProfile, withProfile, boot, force }) {
  const done = new Set(); // the weeks this server already knows are paid (one read a week per server)
  /** Pay last week's board if nobody has. Returns how many were paid (0 if it was already done). */
  async function payIfDue(cfg, now) {
    const key = 'pit__' + weekKey((now || Date.now()) - 7 * 86400000);
    if (done.has(key)) return 0;
    const E = boot(cfg).economy;
    if (!E.PIT.weeklyOn && !force) { done.add(key); return 0; } // the weekly rewards are off: nothing is claimed or paid
    const ref = db.collection('payouts').doc(key);
    const mine = await db.runTransaction(async (tx) => {
      const s = await tx.get(ref);
      if (s.exists) return false;
      tx.set(ref, { state: 'paying', at: FieldValue.serverTimestamp() });
      return true;
    });
    done.add(key);
    if (!mine) return 0;
    const top = await db.collection('boards').doc(key).collection('scores').orderBy('score', 'desc').limit(50).get();
    let rank = 0, paid = 0;
    for (const d of top.docs) {
      rank++;
      const rw = E.pitWeeklyReward(rank); if (!rw) break;
      const place = rank, score = d.data().score;
      try {
        const out = await onProfile(d.id, async (profile) => {
          if (!profile) return { write: false, gone: true };
          const r = await withProfile(profile, cfg, (DH) => {
            DH.meta.grant(rw);
            DH.meta.inboxAdd({ kind: 'gift', title: { bg: 'Ямата: седмичната класация', en: 'The Pit: the weekly board' },
              msg: { bg: 'Място ' + place + ' с вълна ' + score + '. Ето наградата ти!', en: 'Place ' + place + ' with wave ' + score + '. Here is your reward!' }, reward: rw });
          });
          return { profile: r.profile };
        }, { admin: true });
        if (!out.gone) paid++;
      } catch (e) { console.error('pit payout', key, d.id, e); }
    }
    await ref.set({ state: 'done', paid, entries: top.docs.length, at: FieldValue.serverTimestamp() }, { merge: true });
    return paid;
  }
  return { payIfDue, weekKey };
}

module.exports = { makePitPay, weekKey };
