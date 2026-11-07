// The Dungeon's tests: node .claude/skills/dreadhollow-release/scripts/dungeon.js
// Needs the game served on http://localhost:8123 (python3 -m http.server 8123 from the repo root) and Playwright with
// Chromium (pre-installed in the cloud sessions; elsewhere set CHROME to a Chromium/Chrome binary).
// Checks: the foes' and the Lords' strength (E.DUNGEON.foeHp/foeDmg/lordHp/lordDmg), the three waves of a floor, the
// hero's start in the middle, the attacks waiting while no foe is about, and a whole level played by a new hero
// (floors, a vault through the stairs, the Lord, the Well, the portal) in time and without a stall. Exit code 1 on a failure.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const pg = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await pg.goto('http://localhost:8123/index.html', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(3000);
  const res = await pg.evaluate(async () => {
    const DH = window.DH, E = DH.economy, C = DH.content, M = DH.meta, D = E.DUNGEON, out = [];
    const ok = (name, cond, info) => out.push((cond ? 'PASS ' : 'FAIL ') + name + (info ? ' (' + info + ')' : ''));
    const near = (a, b, tol) => Math.abs(a - b) <= (tol || 0.01) * Math.max(1, Math.abs(b));
    DH.server.remote = () => false; DH.audio.play = () => {}; DH.ui.show(false);
    for (const id of ['title', 'boot']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
    const S = DH.save.data; S.tutorialDone = true; S.settings.autoPick = true; S.cleared = Object.assign(S.cleared || {}, { crypt: true, abyss: true, aqueduct: true });
    DH.ui.dunFade = (text, then) => then(); // no fade in a test
    const mk = (lv, vaults, kinds) => {
      const st = DH.Run.dunStage(lv);
      const r = new DH.Run({ hero: S.selectedHero, stage: st.id, stageDef: st.def, dun: { lv, n: 1, hall: st.id, lord: st.lord, affixes: M.dunAffixes(lv), vaults: vaults || [], kinds: kinds || [], loot: true, perks: {} } });
      DH.game.run = r; DH.game.mode = 'run'; r.state = 'playing'; r.dunBegin(); return { r, st };
    };

    // 1. the foes: +50% health and damage over the same strength without the Dungeon's own factor
    {
      const { r, st } = mk(10), id = Object.keys(r.dun.mix || {})[0] || 'skeleton';
      const a = r.spawnEnemy(id, 0, 0); const dm = r.stage.dmgMult, fh = r.stage.foeHp;
      r.stage.foeHp = 1; r.stage.dmgMult = dm / D.foeDmg; const z = r.spawnEnemy(id, 0, 0); r.stage.foeHp = fh; r.stage.dmgMult = dm;
      ok('foes +50% health', near(a.maxHp / z.maxHp, D.foeHp), (a.maxHp / z.maxHp).toFixed(3) + ' ' + id + ' in ' + st.id);
      ok('foes +50% damage', near(a.dmg / z.dmg, D.foeDmg), (a.dmg / z.dmg).toFixed(3));
      ok('the hero\'s items not scaled by it', near(r.stage.hpMult, C.stages.crypt.hpMult * (1 + D.hpPerLv * (9 + D.lvShift)), 1e-9));
      ok('level 1 as strong as level ' + (1 + D.lvShift) + ' was', near(DH.Run.dunStage(1).def.hpMult, C.stages.crypt.hpMult * (1 + D.hpPerLv * D.lvShift), 1e-9) && near(DH.Run.dunStage(1).def.dmgMult, C.stages.crypt.dmgMult * (1 + D.dmgPerLv * D.lvShift) * D.foeDmg, 1e-9));
      // 2. the Lord: its health x bossHp x 1.2, its damage x 1.2 (not the foes' x1.5)
      r.dunFloor(D.floors); r.dunBoss(); const L = r.bosses[0];
      r.stage.foeHp = 1; r.stage.dmgMult = dm / D.foeDmg; const L0 = r.spawnEnemy(r.dun.lord, 0, 0, { boss: true, final: true }); r.stage.foeHp = fh; r.stage.dmgMult = dm;
      ok('Lord health x' + D.bossHp + ' x1.2', near(L.maxHp / L0.maxHp, D.bossHp * D.lordHp), (L.maxHp / L0.maxHp).toFixed(3) + ' ' + r.dun.lord);
      ok('Lord damage x1.2', near(L.dmg / L0.dmg, D.lordDmg), (L.dmg / L0.dmg).toFixed(3));
    }
    // 3. the three waves of a floor share its quota exactly
    {
      let bad = [];
      for (const lv of [1, 7, 40, 150, 400]) for (let f = 0; f < D.floors; f++) {
        const { r } = mk(lv); r.dunFloor(f); let sum = 0;
        for (let w = 1; w <= D.waves; w++) { r.dunWave(w); sum += r.dun.wq; }
        if (sum !== D.quota(lv, f) || r.dun.need !== D.quota(lv, f)) bad.push(lv + '/' + f + ':' + sum + '≠' + D.quota(lv, f));
      }
      ok('three waves share the quota', !bad.length, bad.slice(0, 3).join(' '));
    }
    // 4. the hero starts in the middle of the chamber; 5. the attacks wait while no foe is about
    {
      const { r } = mk(3); r.dunFloor(0);
      ok('hero starts in the middle', r.player.x === C.DUN_ARENA.start.x && r.player.y === C.DUN_ARENA.start.y && Math.abs(r.player.y) < C.DUN_ARENA.H * 0.4);
      for (const e of r.enemies) e.dead = true; r.dun.left = 0; r.dun.wgot = r.dun.wq; // the wave has fallen
      const p0 = r.proj.length; for (let i = 0; i < 45; i++) r.update(1 / 30);
      ok('attacks wait with no foe', r.noFoes === true && r.proj.length <= p0, 'shots ' + p0 + '→' + r.proj.length);
      r.spawnEnemy(Object.keys(r.dun.mix)[0], r.player.x + 30, r.player.y); let fired = false;
      for (let i = 0; i < 90 && !fired; i++) { r.update(1 / 30); if (!r.noFoes && r.abilities.some((a) => a.t > 0.05)) fired = true; }
      ok('attacks start again with a foe', fired);
    }
    // 6. the Altar's Artifacts do not work in the Trials (no Torment Rank, no curses or boons, the Archive whole)
    {
      const keep = M.activeArtifacts; M.activeArtifacts = () => Object.keys(E.artifacts).slice(0, 3);
      const { r } = mk(2), hall = new DH.Run({ hero: S.selectedHero, stage: 'crypt' });
      ok('no Artifacts in the Dungeon', r.dread === 0 && r.artifacts.length === 0 && !Object.keys(r.fx_).length && hall.dread === 3, 'dungeon ' + r.dread + ', hall ' + hall.dread);
      const pst = DH.Run.pitStage ? DH.Run.pitStage(1) : null;
      if (pst) { const pr = new DH.Run({ hero: S.selectedHero, stage: pst.id, stageDef: pst.def, pit: { from: 1, affixes: [], paid: 0, secs: 180, per: 1 } }); ok('no Artifacts in the Pit', pr.dread === 0 && !Object.keys(pr.fx_).length); }
      M.activeArtifacts = keep; DH.game.run = null;
    }
    // 7. a whole level by a hero who has just opened the Dungeon (the third hall won: Rare gear at level 20, Blessings 3)
    //    with a vault on floor 1: floors, the vault, the Lord, the Well, the portal; in time and without a stall
    {
      S.gear = []; S.loadouts = {}; for (let i = 0; i < 60; i++) M.createGear(2); S.gear.forEach((g) => { g.level = 20; });
      const sh = M.shrineOf(S.selectedHero); for (const id of E.shrineOrder) sh[id] = Math.min(E.shrine[id].max, 3);
      const { r } = mk(1, [1], ['gold']); let tome = null; const off = DH.events.on('run:tome', (d) => { tome = d; });
      DH.input.axis = () => { const p = r.player; let best = null, bd = 1e12; for (const e of r.enemies) { if (e.dead || e.def.prop) continue; const d = (e.x - p.x) ** 2 + (e.y - p.y) ** 2; if (d < bd) { bd = d; best = e; } }
        if (!best) return { x: 0, y: 0 }; const dx = best.x - p.x, dy = best.y - p.y, d = Math.sqrt(bd) || 1, k = d > 40 ? 1 : -0.4; return { x: dx / d * k, y: dy / d * k }; };
      const clear = () => { const m = document.getElementById('modals'); if (m) m.replaceChildren(); };
      let vault = false, well = false, deaths = 0, outOfTime = false, stuck = '';
      for (let k = 0; k < 12 * 60 * 30 && !r.finished; k++) {
        if (r.state === 'levelup') { r.choose(r.choices[0]); clear(); }
        else if (r.state === 'tome' && tome) { const c = tome.choices[0]; tome = null; r.chooseTome(c); clear(); }
        else if (r.state === 'loot' && r.lastLoot) { r.takeLoot(r.lastLoot.items[0]); r.lastLoot = null; clear(); r.resume(); }
        else if (r.state === 'dunTime') { outOfTime = true; break; }
        else if (r.state === 'dead') { deaths++; r.state = 'playing'; r.player.hp = r.P.maxHp; clear(); }
        else if (r.state === 'well') { clear(); r.resume(); }
        else if (r.state !== 'playing') { if (r.state === 'victory' || r.state === 'over') break; clear(); r.resume(); }
        if (r.dun.vault) vault = true; if (r.well) well = true;
        if (!r.dun.vault && r.dun.exit && r.dun.exit.t > 1 && (!r.won || r.dun.exit.vault)) { r.player.x = 0; r.player.y = C.DUN_ARENA.stairs.y; }
        else if (r.won && !r.dun.vault && r.portal && r.portal.t > 1.5) { r.player.x = r.portal.x; r.player.y = r.portal.y - 10; }
        r.update(1 / 30);
        if (r.time > 11 * 60) { stuck = 'floor ' + r.dun.floor + ' wave ' + r.dun.wave; break; }
        if (k % 600 === 0) await new Promise((res) => setTimeout(res, 0));
      }
      off && off();
      ok('level 1 played to the end', r.state === 'victory' && r.won && !stuck, 'state ' + r.state + (stuck ? ' stuck at ' + stuck : '') + ', ' + Math.round(r.time) + ' s, ' + Math.round(r.dun.secs) + ' s left, deaths ' + deaths);
      ok('level 1 in time for a hero who has just opened it', !outOfTime);
      ok('the vault through the stairs', vault);
      ok('the Well after the Lord', well);
    }
    return out;
  });
  res.forEach((l) => console.log(l));
  if (errs.length) console.log('PAGEERR', errs.slice(0, 5));
  await b.close();
  process.exit(res.some((l) => l.startsWith('FAIL')) || errs.length ? 1 : 0);
})();
