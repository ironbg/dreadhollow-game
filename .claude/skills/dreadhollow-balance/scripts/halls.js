/* How hard every hall is, measured in the real game:  node .claude/skills/dreadhollow-balance/scripts/halls.js [minutes=10]
 * Needs the game served on http://localhost:8123 and Playwright. In each hall a hero that does not attack (and
 * cannot be hurt) stands for the whole run; foes are taken off the field 8 s after they appear, so the count is
 * what pours in, not what piles up. Per phase it prints: foes appearing per minute, their average health and
 * blow (as the hall makes them, at that minute), and "threat" = per minute x health x blow / 1000, plus the
 * bosses' health and blow. Each hall should be harder than the one before it in every phase. */
'use strict';
const { chromium } = require('playwright');
(async () => {
  const mins = +(process.argv[2] || 10);
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const pg = await b.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto('http://localhost:8123/index.html', { waitUntil: 'networkidle' }); await pg.waitForTimeout(2500);
  const res = await pg.evaluate((mins) => {
    const DH = window.DH, C = DH.content; DH.server.remote = () => false;
    const PH = [[0, 30], [30, 60], [60, 120], [120, 180], [180, 300], [300, 450], [450, 600]].filter((p) => p[0] < mins * 60);
    const out = {};
    for (const st of C.stageOrder) {
      const r = new DH.Run({ hero: 'knight', stage: st }); r.abilities.length = 0; // nobody fights back
      const seen = new Set(), born = new Map(), ph = PH.map(() => ({ n: 0, hp: 0, dmg: 0 })), bosses = [];
      const p = r.player; let peak = PH.map(() => 0);
      for (let k = 0; k < mins * 60 * 10; k++) {
        p.inv = 99; p.hp = r.P.maxHp; if (r.state !== 'playing') { r.state = 'playing'; r.pendingLevels = 0; r.queue.length = 0; }
        r.update(0.1);
        const t = r.time, pi = PH.findIndex((x) => t >= x[0] && t < x[1]);
        for (const e of r.enemies) {
          if (e.dead || e.def.prop) continue;
          if (!seen.has(e)) { seen.add(e); born.set(e, t);
            if (e.boss) bosses.push({ id: e.id, t: Math.round(t), hp: Math.round(e.maxHp), dmg: Math.round(e.dmg) });
            else if (pi >= 0) { ph[pi].n++; ph[pi].hp += e.maxHp; ph[pi].dmg += e.dmg; } }
          if (!e.boss && t - born.get(e) > 8) e.dead = true; // gone after 8 s: as if the hero cut it down
        }
        if (pi >= 0) peak[pi] = Math.max(peak[pi], r.enemies.filter((e) => !e.dead && !e.def.prop).length);
        if (r.won || r.state === 'victory') break;
      }
      out[st] = { phases: PH.map((x, i) => ({ from: x[0], to: x[1], perMin: ph[i].n / ((x[1] - x[0]) / 60), hp: ph[i].n ? ph[i].hp / ph[i].n : 0, dmg: ph[i].n ? ph[i].dmg / ph[i].n : 0, peak: peak[i] })), bosses };
    }
    return out;
  }, mins);
  const r0 = (v) => Math.round(v), pad = (s, n) => String(s).padEnd(n), lp = (s, n) => String(s).padStart(n);
  const halls = Object.keys(res), PHs = res[halls[0]].phases;
  console.log('foes per minute / on screen at once (peak) / avg health / avg blow / threat (per min x health x blow / 1000)');
  PHs.forEach((ph, i) => {
    console.log('\n-- ' + ph.from + '-' + ph.to + ' s --');
    let prev = 0;
    halls.forEach((h) => { const x = res[h].phases[i], th = x.perMin * x.hp * x.dmg / 1000;
      console.log(pad(h, 11) + lp(r0(x.perMin) + '/min', 9) + lp(x.peak, 5) + lp('hp ' + r0(x.hp), 9) + lp('dmg ' + r0(x.dmg), 8) + lp('threat ' + r0(th), 13) + (prev && th < prev ? '   << easier than the hall before' : '')); prev = th; });
  });
  console.log('\n-- bosses (health / blow) --');
  halls.forEach((h) => console.log(pad(h, 11) + res[h].bosses.map((b) => b.id + ' ' + b.t + 's ' + b.hp + '/' + b.dmg).join('  |  ')));
  if (errs.length) console.log('PAGEERR', errs.slice(0, 5)); await b.close();
})();
