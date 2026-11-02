/* Expected strength of the horde in every hall, from the formulas (no randomness):
 *   node .claude/skills/dreadhollow-balance/scripts/hallcurve.js
 * For each step of C.timeline: the average health and blow of a foe of that step's mix as the hall remaps it
 * (C.stages[hall].remap) and scales it (hpMult x time growth, dmgMult x dmgGrow), the spawn rate of the hall,
 * and threat = rate x health x blow. Each hall must be above the one before it at every step. */
'use strict';
const path = require('path'), root = path.join(__dirname, '..', '..', '..', '..');
const { boot } = require(path.join(root, 'functions', 'engine'));
const DH = boot(require(path.join(root, 'functions', 'game', 'live.json'))), C = DH.content;
const rows = {}, r0 = (v) => Math.round(v);
for (const st of C.stageOrder) {
  const S = C.stages[st];
  rows[st] = C.timeline.map((step) => {
    let w = 0, hp = 0, dmg = 0;
    for (const k in step.mix) {
      const id = (S.remap && S.remap[k]) || k, d = C.enemies[id], o = C.enemies[k]; if (!d) continue;
      const lim = (v) => Math.max(0.92, Math.min(1.08, v)), h = id !== k && o ? o.hp * lim(d.hp / o.hp) : d.hp, m = id !== k && o ? o.dmg * lim(d.dmg / Math.max(0.01, o.dmg)) : d.dmg; // as spawnEnemy
      w += step.mix[k]; hp += step.mix[k] * h; dmg += step.mix[k] * m;
    }
    const t = step.t, H = (hp / w) * S.hpMult * (1 + t / 60 * 0.22), D = (dmg / w) * S.dmgMult * (1 + t / 60 * (S.dmgGrow || 0.07)), rate = step.rate * (1 + S.index * 0.1);
    return { t, rate, H, D, threat: rate * H * D };
  });
}
console.log('t(s)  ' + C.stageOrder.map((s) => s.padStart(11)).join(''));
C.timeline.forEach((step, i) => {
  let line = String(step.t).padEnd(6), prev = 0, bad = [];
  C.stageOrder.forEach((s) => { const x = rows[s][i]; line += String(r0(x.threat)).padStart(11); if (x.threat <= prev) bad.push(s); prev = x.threat; });
  console.log(line + (bad.length ? '   << not above the hall before: ' + bad.join(', ') : ''));
});
console.log('\nbosses: health / blow (as spawnEnemy makes them)');
C.stageOrder.forEach((s) => { const S = C.stages[s]; console.log(s.padEnd(11) + S.bosses.map((b) => { const d = C.enemies[b.id], ts = 1; return b.id + ' ' + r0(d.hp * S.hpMult * (1 + S.index * 0.1) * (S.bossHp || 1)) + '/' + r0(d.dmg * S.dmgMult * (1 + b.t / 60 * (S.dmgGrow || 0.07))); }).join('  ')); });
console.log('\nhealth / blow of an average foe at 0 s, 120 s, 300 s, 540 s');
C.stageOrder.forEach((s) => console.log(s.padEnd(11) + [0, 3, 6, 10].map((i) => r0(rows[s][i].H) + '/' + r0(rows[s][i].D)).join('   ')));
