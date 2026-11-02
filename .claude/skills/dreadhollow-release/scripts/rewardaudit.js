// Needs the game served on http://localhost:8123 (python3 -m http.server 8123 from the repo root) and Playwright with
// Chromium (pre-installed in the cloud sessions; elsewhere set CHROME to a Chromium/Chrome binary).
// Every hero, a fight with many abilities, the Lord killed, then: stand still (the rift's minute), or quit from the pause menu.
// Each summary goes through the server's own check (functions/runcheck.js): any refusal means a fight that pays nothing.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8123/index.html', { waitUntil: 'networkidle' }); await pg.waitForTimeout(2500);
  const out = await pg.evaluate(async () => {
    const DH = window.DH, C = DH.content; DH.server.remote = () => false; DH.ui.show(false);
    for (const id of ['title', 'boot']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
    const src = await (await fetch('functions/runcheck.js')).text(); const module = { exports: {} }; new Function('module', 'require', src)(module, () => ({})); const { checkRun } = module.exports;
    const clear = () => { const m = document.getElementById('modals'); if (m) m.replaceChildren(); };
    const res = [];
    for (let i = 0; i < C.heroOrder.length; i++) {
      const hero = C.heroOrder[i], stage = C.stageOrder[i % C.stageOrder.length], mode = i % 2 ? 'quit' : 'wait';
      try {
        const r = new DH.Run({ hero, stage }); r.time = 170; const step = (n) => { for (let k = 0; k < n; k++) { r.player.inv = 1e9; if (r.state !== 'playing' && r.state !== 'victory') r.state = 'playing'; r.update(1 / 30); if (r.state === 'victory') return; } };
        const ids = DH.util.shuffle(C.tomeAbilities.slice()).slice(0, 6).concat(C.exclusiveAbilities.filter((id) => C.abilities[id].exclusive === hero).slice(0, 1));
        ids.forEach((id) => { try { r.addAbility(id); } catch (e) {} });
        step(1800); clear();                                          // a minute of fighting with the lot
        r.time = Math.max(r.time, (r.stage.bosses.find((x) => x.final) || { t: 600 }).t);
        const fb = r.stage.bosses.find((x) => x.final), e = r.spawnEnemy(fb.id, r.player.x + 60, r.player.y, { boss: true, final: true });
        r.killEnemy(e); clear();
        const won = r.won, hpBefore = r.P.hp; r.player.inv = 0; r.hurtPlayer(1e9); const survived = r.P.hp === hpBefore && r.state === 'playing';
        let state;
        if (mode === 'wait') { step(62 * 30); state = r.state; }    // never steps in: the rift draws the hero in after a minute
        else { DH.game.finishRun = DH.game.finishRun; r.finished = false; const orig = DH.server.runEnd; DH.server.runEnd = async () => null; DH.game.finishRun(r); DH.server.runEnd = orig; state = r.state; }
        const sum = r.summary(), ticket = { stage, hero, start: Date.now() - (r.time + 5) * 1000, agony: 0, dread: r.dread || 0, tributes: [] };
        const verdict = checkRun(JSON.parse(JSON.stringify(sum)), ticket, Date.now(), DH);
        res.push({ hero, stage, mode, won, survived, state, victory: sum.victory, verdict, dmgKeys: Object.keys(sum.dmgByAb).filter((k) => !C.abilities[k]) });
      } catch (e) { res.push({ hero, stage, mode, error: String(e && e.stack || e).slice(0, 300) }); }
      clear();
    }
    return res;
  });
  out.forEach((r) => console.log(JSON.stringify(r)));
  if (errs.length) console.log('ERR', errs.slice(0, 5)); await b.close();
})();
