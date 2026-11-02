/* Measured damage of every ability in a fight, all under the same conditions:
 *   node .claude/skills/dreadhollow-balance/scripts/measure.js [seconds=40] [ids...]
 * Needs the game served on http://localhost:8123 (python3 -m http.server 8123 from the repo root) and Playwright.
 * Each ability is taken at pick-up (no traits, no gear, no Shrine), by a hero whose own weapon is left out of the
 * count, in two fields of foes that neither move nor hit and cannot die:
 *   single  one foe standing 25 units away (a boss fight, within melee reach)
 *   crowd   30 foes in a ring 20..110 units round the hero (the horde)
 * Prints damage per second in each field and the ratio to the median of its group (weapons / tome / exclusive).
 * Effects' damage (burn, spark, frost, decay) is counted under its own key and shown as "fx" for the run. */
'use strict';
const { chromium } = require('playwright');
(async () => {
  const secs = +(process.argv[2] || 40), only = process.argv.slice(3);
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const pg = await b.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto('http://localhost:8123/index.html', { waitUntil: 'networkidle' }); await pg.waitForTimeout(2500);
  const rows = await pg.evaluate(({ secs, only }) => {
    const DH = window.DH, C = DH.content; DH.server.remote = () => false;
    const owner = {}; for (const h in C.heroes) owner[C.heroes[h].weapon] = h;
    const ids = Object.keys(C.abilities).filter((id) => !only.length || only.includes(id));
    const one = (id, field) => {
      const a = C.abilities[id], hero = a.hero ? owner[id] : a.exclusive || 'knight';
      const r = new DH.Run({ hero, stage: 'crypt' });
      r.updateSpawns = () => {}; // only the foes placed here
      if (!r.abilities.some((x) => x.id === id)) r.addAbility(id);
      const p = r.player, dummy = (x, y) => { const e = r.spawnEnemy('skeleton', x, y); e.hp = e.maxHp = 1e12; e.spd = 0; e.dmg = 0; e.keep = true; e.armor = 0; return e; };
      if (field === 'single') dummy(p.x + 25, p.y);
      else for (let i = 0; i < 30; i++) { const an = i * 2.399, d = 20 + (i % 10) * 10; dummy(p.x + Math.cos(an) * d, p.y + Math.sin(an) * d); }
      for (let k = 0; k < secs * 30; k++) {
        p.inv = 99; p.hp = r.P.maxHp;
        if (r.state !== 'playing') { r.pendingLevels = 0; r.queue.length = 0; r.state = 'playing'; }
        for (const e of r.enemies) { e.x = e.ax == null ? (e.ax = e.x) : e.ax; e.y = e.ay == null ? (e.ay = e.y) : e.ay; e.kx = e.ky = 0; }
        r.update(1 / 30);
      }
      const fx = ['burn', 'spark', 'frost', 'decay'].reduce((s, k) => s + (r.dmgByAb[k] || 0), 0);
      return { direct: (r.dmgByAb[id] || 0) / secs, fx: fx / secs };
    };
    return ids.map((id) => { const a = C.abilities[id], s = one(id, 'single'), c = one(id, 'crowd');
      return { id, group: a.hero ? 'weapon' : a.exclusive ? 'exclusive' : 'tome', single: s.direct, crowd: c.direct, fxS: s.fx, fxC: c.fx }; });
  }, { secs, only });
  const r1 = (v) => Math.round(v * 10) / 10, pad = (s, n) => String(s).padEnd(n), lp = (s, n) => String(s).padStart(n);
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)] || 1; };
  for (const g of ['weapon', 'tome', 'exclusive']) {
    const list = rows.filter((r) => r.group === g); if (!list.length) continue;
    const ms = med(list.map((r) => r.single + r.fxS)), mc = med(list.map((r) => r.crowd + r.fxC));
    list.sort((x, y) => (y.crowd + y.fxC) / mc + (y.single + y.fxS) / ms - (x.crowd + x.fxC) / mc - (x.single + x.fxS) / ms);
    console.log('\n== ' + g + ' (' + list.length + ')  median DPS: single ' + r1(ms) + ', crowd ' + r1(mc) + ' ==');
    console.log(pad('id', 14) + lp('single', 9) + lp('x', 6) + lp('crowd', 9) + lp('x', 6) + '   (of which effects: single / crowd)');
    list.forEach((r) => { const ks = (r.single + r.fxS) / ms, kc = (r.crowd + r.fxC) / mc, flag = ks >= 2 || kc >= 2 ? '  << HIGH' : ks <= 0.4 && kc <= 0.4 ? '  << LOW' : '';
      console.log(pad(r.id, 14) + lp(r1(r.single + r.fxS), 9) + lp(r1(ks), 6) + lp(r1(r.crowd + r.fxC), 9) + lp(r1(kc), 6) + '   (' + r1(r.fxS) + ' / ' + r1(r.fxC) + ')' + flag); });
  }
  if (errs.length) console.log('PAGEERR', errs.slice(0, 5)); await b.close();
})();
