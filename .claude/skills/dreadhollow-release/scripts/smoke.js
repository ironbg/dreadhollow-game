// Smoke test: every hero through ten seconds of a fight; any error shows. node .claude/skills/dreadhollow-release/scripts/smoke.js
// Needs the game served on http://localhost:8123 (python3 -m http.server 8123 from the repo root) and Playwright with
// Chromium (pre-installed in the cloud sessions; elsewhere set CHROME to a Chromium/Chrome binary).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const pg = await b.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8123/index.html', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(2500);
  const res = await pg.evaluate(() => {
    const DH = window.DH, out = {};
    for (const id of Object.keys(DH.content.heroes)) {
      try {
        const r = new DH.Run({ hero: id, stage: 'crypt' });
        for (let i = 0; i < 600; i++) { if (i % 60 === 0) r.player.x += 30; r.update(1/60); if (r.state !== 'playing') { r.state = 'playing'; } }
        out[id] = 'ok allies=' + r.allies.length + ' foes=' + r.enemies.length;
      } catch (e) { out[id] = 'ERROR ' + e.message; }
    }
    return out;
  });
  console.log(JSON.stringify(res, null, 1)); if (errs.length) console.log('PAGEERR', errs.slice(0, 5));
  await b.close();
})();
