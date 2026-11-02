/* Numbers for a balance check, straight from the game's own code (the server's sandbox, functions/engine.js):
 *   node .claude/skills/dreadhollow-balance/scripts/balance.js [abilities|economy|all]
 * Run node tools/build-functions.js first so functions/game holds the current js/.
 * abilities: base damage per second of every ability at pick-up (dmg x count / cooldown), its effects, and the
 *            outliers against the median of its group (hero weapons / tome abilities). Baseline only: area, pierce,
 *            chains, summons' uptime and special mechanics (see the ability's fire() in js/game/abilities.js) are not
 *            in it, so an outlier is a lead to read, not a verdict.
 * economy:   store products (gems per $, bundle values), chests (cost per piece of each rarity), the Well, the forge
 *            (gold and metal to bring a piece to its cap), the Shrine (gold to max), the Vigil, the pass rewards in all. */
'use strict';
const path = require('path');
const root = path.join(__dirname, '..', '..', '..', '..');
const { boot } = require(path.join(root, 'functions', 'engine'));
const DH = boot(require(path.join(root, 'functions', 'game', 'live.json')));
const C = DH.content, E = DH.economy;
const what = process.argv[2] || 'all';
const r2 = (v) => Math.round(v * 100) / 100, pad = (s, n) => String(s).padEnd(n), lpad = (s, n) => String(s).padStart(n);
const median = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };

if (what === 'abilities' || what === 'all') {
  const rows = Object.entries(C.abilities).map(([id, a]) => {
    const b = a.base || {}, dps = (b.dmg || 0) * Math.max(1, b.count || 1) / Math.max(0.05, b.cd || 1);
    const fx = ['burn', 'spark', 'frost', 'decay', 'fragile', 'affliction', 'stun', 'slow'].filter((k) => b[k]).map((k) => k + ' ' + b[k]).join(', ');
    return { id, group: a.hero ? 'weapon' : a.exclusive ? 'exclusive' : 'tome', tags: (a.tags || []).join('/'), dmg: b.dmg || 0, cd: b.cd || 0, count: b.count || 1, area: b.area || '', dps, fx };
  });
  for (const g of ['weapon', 'tome', 'exclusive']) {
    const list = rows.filter((r) => r.group === g).sort((x, y) => y.dps - x.dps); if (!list.length) continue;
    const med = median(list.map((r) => r.dps));
    console.log('\n== ' + g + ' abilities (' + list.length + '), median base DPS ' + r2(med) + ' ==');
    console.log(pad('id', 14) + pad('tags', 26) + lpad('dmg', 6) + lpad('cd', 6) + lpad('n', 4) + lpad('DPS', 8) + lpad('x med', 7) + '  effects');
    list.forEach((r) => { const k = med ? r.dps / med : 0, flag = k >= 1.6 ? '  << HIGH' : k <= 0.5 ? '  << LOW' : '';
      console.log(pad(r.id, 14) + pad(r.tags, 26) + lpad(r.dmg, 6) + lpad(r.cd, 6) + lpad(r.count, 4) + lpad(r2(r.dps), 8) + lpad(r2(k), 7) + '  ' + r.fx + flag); });
  }
}

if (what === 'economy' || what === 'all') {
  console.log('\n== store ==');
  Object.entries(E.products).forEach(([id, p]) => {
    const g = p.grant || {}, gems = p.gems || g.gems || 0;
    console.log(pad(id, 14) + lpad('$' + p.price, 8) + '  ' + pad(p.type, 8) + (gems ? ' gems ' + gems + ' (' + r2(gems / p.price) + '/$)' : '') + (g.gold ? ' gold ' + g.gold : '') + (g.mats ? ' mats ' + JSON.stringify(g.mats) : '') + (p.value ? ' value ' + p.value + '%' : ''));
  });
  console.log('\n== chests: price, odds by rarity (common..mythic), cost per piece of each rarity ==');
  Object.entries(E.chests).forEach(([id, c]) => {
    const price = c.price || {}, cost = price.gems || price.gold || 0, cur = price.gems ? 'gems' : 'gold', tot = c.odds.reduce((a, b) => a + b, 0);
    console.log(pad(id, 8) + lpad(cost + ' ' + cur, 12) + '  odds ' + c.odds.join('/') + (c.pity ? '  pity ' + c.pity : '') + '  per piece: ' + c.odds.map((o) => (o ? Math.round(cost / (o / tot)) : '-')).join(' / '));
  });
  if (E.wellPrice) console.log('\n== the Well (gold / gems by rarity) ==\n' + E.rarities.map((r, i) => r + ' ' + E.wellPrice(i) + ' / ' + E.wellGems(i)).join(', '));
  if (E.gearLevelCost) {
    console.log('\n== forge: gold to bring a piece from level 1 to its cap, by rarity ==');
    E.rarities.forEach((r, i) => { let g = 0; for (let l = 1; l < E.rarityMaxLevel[i]; l++) g += E.gearLevelCost(i, l); console.log(pad(r, 10) + ' cap ' + lpad(E.rarityMaxLevel[i], 3) + '  gold ' + g); });
  }
  if (E.shrine) { let all = 0; const lines = E.shrineOrder.map((id) => { const s = E.shrine[id], c = (s.cost || []).reduce((a, b) => a + b, 0); all += c; return id + ' ' + c; }); console.log('\n== shrine: gold to max each blessing (all ' + all + ') ==\n' + lines.join(', ')); }
  if (E.VIGIL_MATS_PER_HOUR) console.log('\n== vigil ==\nmats per hour ' + E.VIGIL_MATS_PER_HOUR + ', cap ' + (E.VIGIL_CAP_MS / 3600e3) + ' h');
  const pr = E.passRewards, sum = {}, add = (rw) => { for (const k in rw || {}) { if (typeof rw[k] === 'number') sum[k] = (sum[k] || 0) + rw[k]; else if (k === 'mats') for (const m in rw.mats) sum['mat:' + m] = (sum['mat:' + m] || 0) + rw.mats[m]; else if (k === 'gear') sum['gear r' + rw.gear.rarity] = (sum['gear r' + rw.gear.rarity] || 0) + 1; else sum[k + ':' + rw[k]] = (sum[k + ':' + rw[k]] || 0) + 1; } };
  if (pr && typeof pr === 'object') { for (const track in pr) (Array.isArray(pr[track]) ? pr[track] : []).forEach(add); console.log('\n== battle pass, everything over ' + E.PASS_TIERS + ' levels (both rows) ==\n' + JSON.stringify(sum)); }
}
