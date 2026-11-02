/* What one won fight pays in every hall, played in the real game and settled by the game's own settleRun:
 *   node .claude/skills/dreadhollow-balance/scripts/fightpay.js [minutes=10] [halls...]
 * Needs the game served on http://localhost:8123 and Playwright. A strong hero (Knight with six tome abilities and
 * a large damage bonus, unhurt, picking up from far) plays the hall to its Lord, kills it and leaves; no Agony, no
 * Torment, no premium pass. Prints gold (picked up in the fight, time bonus, win bonus, total), metals, herbs,
 * account and pass XP, kills, and the relic of the victory. */
'use strict';
const { chromium } = require('playwright');
(async () => {
  const mins = +(process.argv[2] || 10), halls = process.argv.slice(3);
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const pg = await b.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto('http://localhost:8123/index.html', { waitUntil: 'networkidle' }); await pg.waitForTimeout(2500);
  const out = await pg.evaluate(async ({ mins, halls }) => {
    const DH = window.DH, C = DH.content; DH.server.remote = () => false;
    const clear = () => { const m = document.getElementById('modals'); if (m) m.replaceChildren(); };
    const res = [];
    for (const st of (halls.length ? halls : C.stageOrder)) {
      const r = new DH.Run({ hero: 'knight', stage: st });
      ['fireball', 'orbs', 'halo', 'thorns', 'storm', 'axes'].forEach((id) => { try { r.addAbility(id); } catch (e) { /* not this one */ } });
      const p = r.player; let lordAt = null;
      for (let k = 0; k < mins * 60 * 20 + 1200; k++) {
        p.inv = 99; p.hp = r.P.maxHp; r.P.dmgPct = 30; r.P.pickupR = 900; // strong, and gathers everything
        if (r.state !== 'playing' && r.state !== 'victory') { if (r.state === 'levelup' && r.choices && r.choices[0]) r.choose(r.choices[0]); else { r.pendingLevels = 0; r.resume(); } clear(); }
        if (r.state === 'victory') break;
        r.update(1 / 20);
        if (r.time > mins * 60 + 5 && !r.won) { const lord = r.bosses.find((e) => e.final && !e.dead) || r.spawnEnemy(r.stage.bosses.find((x) => x.final).id, p.x + 40, p.y, { boss: true, final: true }); r.killEnemy(lord); lordAt = r.time; }
        if (r.won && r.portal) { r.portal.t = 999; }
      }
      clear();
      const sum = r.summary(); const before = JSON.parse(JSON.stringify(DH.save.data.mats || {}));
      const s = DH.meta.settleRun(sum); clear();
      res.push({ st, time: Math.round(sum.time), kills: sum.kills, victory: sum.victory, gold: s.gold, goldRun: s.goldRun, timeBonus: s.timeBonus, winBonus: s.winBonus,
        mats: sum.mats, herbs: sum.herbs, accountXp: s.accountXp, passXp: s.passXp, gear: (s.gear || []).map((g) => g.rarity), level: sum.level });
    }
    return res;
  }, { mins, halls });
  out.forEach((x) => console.log(x.st.padEnd(11) + ' ' + x.time + 's kills ' + x.kills + ' lvl ' + x.level + (x.victory ? ' WIN' : ' lost') + '  gold ' + x.gold + ' (fight ' + x.goldRun + ' + time ' + x.timeBonus + ' + win ' + x.winBonus + ')  mats ' + JSON.stringify(x.mats) + '  herbs ' + JSON.stringify(x.herbs) + '  xp ' + x.accountXp + ' pass ' + x.passXp + ' relic ' + JSON.stringify(x.gear)));
  if (errs.length) console.log('PAGEERR', errs.slice(0, 5)); await b.close();
})();
