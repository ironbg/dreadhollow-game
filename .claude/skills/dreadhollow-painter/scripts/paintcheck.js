#!/usr/bin/env node
/* paintcheck: look at Dreadhollow painters the way the game shows them.
 *
 *   NODE_PATH=$(npm root -g) node paintcheck.js OUTDIR name[:variant][@frame] [...] [--scale N] [--repo PATH]
 *   (@frame picks the frame shown in blind_N.png, 1-based: mimic@2 shows the open chest)
 *
 * Writes into OUTDIR:
 *   sheet.png      one row per painter: in-game size (native px x2, as on a phone), both frames magnified,
 *                  the silhouette (flat dark) and the notan (two values split at the median brightness)
 *   blind_N.png    frame 0 magnified on a neutral ground, nothing written on it: hand these to the blind
 *                  describer (the mapping N -> painter is printed here, never shown to it)
 *   stats.json     per painter: size, fill, mean/contrast of brightness, lit-share, and light direction
 *                  (top-left brightness minus bottom-right: should be > 0 for our key light)
 * Loads index.html straight from the repo (file://), so no server is needed. */
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const scale = +opt('--scale', 5), repo = path.resolve(opt('--repo', path.join(__dirname, '../../../..')));
const out = path.resolve(args.shift() || 'paintcheck');
const names = args;
if (!names.length) { console.error('usage: paintcheck.js OUTDIR name[:variant] ... [--scale N] [--repo PATH]'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });
(async () => {
  const exe = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
  let browser;
  try { browser = await chromium.launch(exe ? { executablePath: exe } : {}); } catch (e) { browser = await chromium.launch(); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('file://' + path.join(repo, 'index.html'));
  await page.waitForFunction(() => window.DH && DH.gfx && DH.gfx.painters && Object.keys(DH.gfx.painters).length > 10, null, { timeout: 20000 });
  const res = await page.evaluate(({ names, S }) => {
    const G = DH.gfx, stats = {}, blind = [], rows = [];
    const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
    const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    for (const spec of names) {
      const [base, fr] = spec.split('@'), [name, variant] = base.split(':'), bf = Math.max(0, (+fr || 1) - 1);
      if (!G.painters[name]) { stats[spec] = { error: 'no painter' }; continue; }
      const s = G.sprite(name, variant || null), f0 = s.frames[0], W = f0.width, H = f0.height;
      const d = f0.getContext('2d').getImageData(0, 0, W, H).data, L = [];
      let x0 = W, y0 = H, x1 = 0, y1 = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (d[i + 3] > 128) { L.push(lum(d, i)); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
      const sorted = L.slice().sort((a, b) => a - b), med = sorted[sorted.length >> 1] || 0, mean = L.reduce((a, b) => a + b, 0) / (L.length || 1);
      const sd = Math.sqrt(L.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (L.length || 1));
      // light direction: mean brightness of the top-left and bottom-right quarter of the bounding box
      let tl = 0, tn = 0, br = 0, bn = 0; const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = (y * W + x) * 4; if (d[i + 3] <= 128) continue; const v = lum(d, i); if (x < mx && y < my) { tl += v; tn++; } else if (x >= mx && y >= my) { br += v; bn++; } }
      stats[spec] = { units: [s.w, s.h], px: [x1 - x0 + 1, y1 - y0 + 1], fill: +(L.length / ((x1 - x0 + 1) * (y1 - y0 + 1))).toFixed(2), mean: Math.round(mean), contrast: Math.round(sd), median: Math.round(med), lightTLminusBR: Math.round(tl / (tn || 1) - br / (bn || 1)), frames: s.frames.length };
      // panels
      const [sil, sg] = cv(W, H), [no, ng] = cv(W, H), sd2 = sg.createImageData(W, H), nd = ng.createImageData(W, H);
      for (let i = 0; i < W * H * 4; i += 4) { if (d[i + 3] <= 128) continue; sd2.data.set([34, 36, 46, 255], i); const v = lum(d, i) > med ? 214 : 52; nd.data.set([v, v, v, 255], i); }
      sg.putImageData(sd2, 0, 0); ng.putImageData(nd, 0, 0);
      rows.push({ spec, parts: [[f0, 2, 'in game'], [f0, S, 'frame 1'], [s.frames[1 % s.frames.length], S, 'frame 2'], [sil, S, 'silhouette'], [no, S, 'notan']], W, H });
      const [b, bg] = cv(W * S + 40, H * S + 40); bg.fillStyle = '#5a5660'; bg.fillRect(0, 0, b.width, b.height); bg.drawImage(s.frames[bf % s.frames.length], 20, 20, W * S, H * S);
      blind.push(b.toDataURL());
    }
    // sheet
    const pad = 14, lab = 22; let SW = 0, SH = 0;
    for (const r of rows) { let w = pad; for (const [img, k] of r.parts) w += img.width * k + pad; SW = Math.max(SW, w); SH += r.H * S + lab + pad; }
    const [sheet, g] = cv(Math.max(200, SW), Math.max(60, SH + pad));
    g.fillStyle = '#2a2430'; g.fillRect(0, 0, sheet.width, sheet.height);
    let y = pad;
    for (const r of rows) {
      let x = pad; g.fillStyle = '#e8c878'; g.font = 'bold 15px sans-serif'; g.fillText(r.spec, x, y + 14);
      for (const [img, k, t] of r.parts) {
        const bgc = t === 'silhouette' || t === 'notan' ? '#b8b4ac' : '#3a3440';
        g.fillStyle = bgc; g.fillRect(x, y + lab, img.width * k, img.height * k); g.drawImage(img, x, y + lab, img.width * k, img.height * k);
        g.fillStyle = '#9a90a8'; g.font = '11px sans-serif'; g.fillText(t, x, y + lab + img.height * k + 12); x += img.width * k + pad;
      }
      y += r.H * S + lab + pad + 8;
    }
    return { sheet: sheet.toDataURL(), blind, stats };
  }, { names, S: scale });
  const w = (f, u) => fs.writeFileSync(path.join(out, f), Buffer.from(u.split(',')[1], 'base64'));
  w('sheet.png', res.sheet);
  res.blind.forEach((u, i) => w('blind_' + (i + 1) + '.png', u));
  fs.writeFileSync(path.join(out, 'stats.json'), JSON.stringify(res.stats, null, 1));
  console.log('sheet  ->', path.join(out, 'sheet.png'));
  names.forEach((n, i) => console.log('blind_' + (i + 1) + '.png = ' + n + '  (do not tell the describer)'));
  console.log(JSON.stringify(res.stats));
  if (errs.length) console.log('page errors:', errs.slice(0, 3));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
