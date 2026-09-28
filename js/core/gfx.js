/* Graphics pipeline: detailed dark pixel art in the spirit of pre-rendered Diablo II
 * sprites. Vector painters are rasterized at CPX pixels per world unit, graded (key light, bevelled
 * edges), quantized to a gritty dungeon palette with ordered dithering and given hard 1px outlines.
 * The world is drawn into a low-res buffer and scaled up with nearest-neighbour (see view.js). */
(function (DH) {
  'use strict';
  const U = DH.util;

  /* ---------------- colour helpers ---------------- */
  const cc = {};
  function rgb(hex) {
    if (cc[hex]) return cc[hex];
    let v = hex.replace('#', '');
    if (v.length === 3) v = v.split('').map((c) => c + c).join('');
    return (cc[hex] = [parseInt(v.substr(0, 2), 16), parseInt(v.substr(2, 2), 16), parseInt(v.substr(4, 2), 16)]);
  }
  function hex(r, g, b) { return '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join(''); }
  /** amt > 0 lightens toward white, < 0 darkens toward black */
  function shade(c, amt) {
    const [r, g, b] = rgb(c);
    if (amt >= 0) return hex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
    return hex(r * (1 + amt), g * (1 + amt), b * (1 + amt));
  }
  function mix(a, b, t) { const A = rgb(a), B = rgb(b); return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
  function rgba(c, a) { const [r, g, b] = rgb(c); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; }

  function canvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }

  /* ---------------- sprite cache ---------------- */
  const gfx = {
    CPX: 2, // sprite / buffer pixels per world unit
    rgb, hex, shade, mix, rgba, canvas,
    cache: {},
    painters: {},      // name -> { w, h, frames, draw(g, frame, col), colors, cx, cy }
    variants: {},      // variant name -> colour overrides (semantic keys)
    has(name) { return !!this.painters[name]; },
    /** Returns {frames, flash, w, h, ox, oy} where w/h/ox/oy are world units. */
    sprite(name, variant) {
      const key = name + '|' + (variant || '');
      return this.cache[key] || (this.cache[key] = this.paint(name, variant, this.CPX));
    },
    colors(name, variant) {
      const p = this.painters[name];
      return Object.assign({}, p.colors || {}, variant && this.variants[variant] ? this.variants[variant] : null, variant && p.variants && p.variants[variant] ? p.variants[variant] : null);
    },
    paint(name, variant, res) {
      const p = this.painters[name];
      if (!p) throw new Error('no painter ' + name);
      const col = this.colors(name, variant);
      const pad = 1.5;
      const W = p.w + pad * 2, H = p.h + pad * 2;
      const frames = [], flash = [];
      const nf = p.frames || 1;
      for (let f = 0; f < nf; f++) {
        if (p.pixels) { // hand-placed pixel art (paint_pixel.js), scaled only by whole steps, then graded like every other model
          const src = gfx.unpackPixels(p.pixels, f), c = canvas(W * res, H * res), g = c.getContext('2d');
          g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0, W * res, H * res);
          const out = p.grade === false ? c : classicize(c, p, res);
          frames.push(out); flash.push(whiten(out)); continue;
        }
        const c = canvas(W * res, H * res), g = c.getContext('2d');
        g.scale(res, res); g.translate(pad, pad);
        g.lineJoin = 'round'; g.lineCap = 'round';
        p.draw(g, f, col, gfx.P);
        const out = p.soft ? c : classicize(c, p, res); // soft: keeps its translucency (ice, glass)
        frames.push(out);
        flash.push(whiten(out));
      }
      return { frames, flash, w: W, h: H, res, ox: pad + (p.cx == null ? p.w / 2 : p.cx), oy: pad + (p.cy == null ? p.h / 2 : p.cy) };
    },
    /** Horizontally mirrored copy of a frame (cached) — cheaper than save/scale/restore per draw. */
    flip(img) {
      if (img._flip) return img._flip;
      const c = canvas(img.width, img.height), g = c.getContext('2d');
      g.translate(img.width, 0); g.scale(-1, 1); g.drawImage(img, 0, 0);
      return (img._flip = c);
    },
    /** Tinted copy of a frame (frozen, poisoned, ...) cached per frame canvas. */
    /** A copy with a thin rim of `color` around the silhouette (px = rim width in canvas pixels), cached. */
    rim(img, color, px) {
      const key = color + px; img._rims = img._rims || {};
      if (img._rims[key]) return img._rims[key];
      const sil = this.tint(img, color), c = canvas(img.width, img.height), g = c.getContext('2d');
      for (const [dx, dy] of [[px, 0], [-px, 0], [0, px], [0, -px]]) g.drawImage(sil, dx, dy);
      g.globalCompositeOperation = 'destination-out'; g.drawImage(img, 0, 0); // keep only the rim…
      g.globalCompositeOperation = 'source-over'; g.drawImage(img, 0, 0); // …then the sprite on top
      return (img._rims[key] = c);
    },
    tint(img, color) {
      img._tints = img._tints || {};
      if (img._tints[color]) return img._tints[color];
      const c = canvas(img.width, img.height), g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      g.globalCompositeOperation = 'source-atop'; g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
      return (img._tints[color] = c);
    },
  };

  /* ---------------- classic: palette, grading, ordered dithering ---------------- */
  // Curated dark ramps (dark -> light), roughly a 256-colour-era dungeon palette.
  const RAMPS = [
    '#07050a',
    '#0d0c11 #1d1b23 #2f2c37 #45414f #605b6b #847f90 #aca8b8 #d8d4e0',       // cold stone
    '#120e0c #221a16 #362a23 #4c3d33 #665446 #85705e #a8927c #cdb9a0',       // warm stone
    '#1a0f09 #2e1a0e #472814 #63391c #804c27 #a06637 #c0854e',               // leather / wood
    '#3a3222 #5c5038 #807254 #a4957a #c7ba9d #e4dac0 #f6f0e0',               // bone / parchment
    '#3e2218 #633a2a #8a5540 #ad735a #cc957a #e6b89e',                       // flesh
    '#1c0406 #34080c #520c14 #74121c #981c26 #bc2c32 #de4a44 #f47a6a',       // blood
    '#3a1204 #6a2408 #a03c0c #d05a14 #f08020 #ffa840 #ffd070 #fff0b0',       // fire
    '#3a2a08 #5e4610 #86661a #ae8a28 #d4b040 #f0d468',                       // gold
    '#0c140a #172414 #243820 #34502c #486a3a #62884c #82a864 #aac888',       // moss
    '#1e2a08 #34480e #52701a #78982a #a4c040 #d4e870',                       // poison
    '#081a1c #0e2e32 #16484c #226a6c #3a9090 #62b8b0 #9ae0d4',               // teal
    '#0a0e1c #141c32 #1e2c4c #2c406a #3e5a8c #5a7cb0 #82a4d0 #b4ccec',       // steel / night blue
    '#1a3a5a #2a5e86 #4a8ab4 #78b8dc #aadcf2 #e0f6ff',                       // ice
    '#120a1c #22102e #361a48 #4e2666 #6a3688 #8a4cac #ae70cc #d4a0ec',       // arcane
    '#2e0a24 #521440 #7a2262 #a83a88 #d864b0 #f0a0d8',                       // magenta
    '#ffffff',
  ];
  const PAL = []; RAMPS.forEach((r) => r.split(' ').forEach((c) => PAL.push(rgb(c))));
  let LUT = null;
  function lut() {
    if (LUT) return LUT;
    LUT = new Uint32Array(32768);
    const n = PAL.length;
    for (let k = 0; k < 32768; k++) {
      const r = ((k >> 10) & 31) * 8 + 4, g = ((k >> 5) & 31) * 8 + 4, b = (k & 31) * 8 + 4;
      let best = 0, bd = Infinity;
      for (let i = 0; i < n; i++) {
        const p = PAL[i], rm = (r + p[0]) / 2, dr = r - p[0], dg = g - p[1], db = b - p[2];
        const d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
        if (d < bd) { bd = d; best = i; }
      }
      const p = PAL[best]; LUT[k] = p[0] | (p[1] << 8) | (p[2] << 16);
    }
    return LUT;
  }
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.47);
  /** Grade (desaturate + contrast) and quantize an ImageData in place with 4x4 Bayer dithering + grain. */
  function quantize(id, o) {
    const d = id.data, W = id.width, H = id.height, L = lut();
    const amp = o.dither == null ? 16 : o.dither, grit = o.grit || 0, sat = o.sat == null ? 0.85 : o.sat, con = o.contrast || 1.08, lift = o.lift || 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4; if (d[i + 3] === 0) continue;
      let r = d[i], g = d[i + 1], b = d[i + 2];
      const l = r * 0.3 + g * 0.59 + b * 0.11;
      r = l + (r - l) * sat; g = l + (g - l) * sat; b = l + (b - l) * sat;
      r = (r - 118) * con + 118 + lift; g = (g - 118) * con + 118 + lift; b = (b - 118) * con + 118 + lift;
      let n = BAYER[(y & 3) * 4 + (x & 3)] * amp;
      if (grit) { let h = (x * 374761393 + y * 668265263 + (o.seed | 0)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); n += (((h ^ (h >>> 16)) & 255) / 255 - 0.5) * grit; }
      r += n; g += n; b += n;
      r = r < 0 ? 0 : r > 255 ? 255 : r; g = g < 0 ? 0 : g > 255 ? 255 : g; b = b < 0 ? 0 : b > 255 ? 255 : b;
      const c = L[((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)];
      d[i] = c & 255; d[i + 1] = (c >> 8) & 255; d[i + 2] = (c >> 16) & 255;
    }
    return id;
  }
  gfx.quantize = quantize; gfx.PAL = PAL;
  /** Classic sprite post-process: hard alpha, graded palette, crisp dark outline and a light rim on top edges. */
  function classicize(src, p, res) {
    const W = src.width, H = src.height, g = src.getContext('2d');
    const id = g.getImageData(0, 0, W, H), d = id.data, solid = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) { if (d[i * 4 + 3] > 120) { d[i * 4 + 3] = 255; solid[i] = 1; } else d[i * 4 + 3] = 0; }
    // pre-rendered look: key light from the top-left, darker feet, bevelled silhouette edges, slightly crushed midtones
    const px = Math.max(1, Math.round(res || gfx.CPX));
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (!solid[i]) continue;
      let k = 1.1 - 0.32 * (y / H);
      const tl = (x < px || y < px || !solid[i - px] || !solid[i - px * W]);
      const br = (x >= W - px || y >= H - px || !solid[i + px] || !solid[i + px * W]);
      if (tl && !br) k *= 1.22; else if (br && !tl) k *= 0.7;
      const j = i * 4;
      for (let c = 0; c < 3; c++) { const v = d[j + c] / 255; d[j + c] = Math.min(255, 255 * Math.pow(v, 1.12) * k); }
    }
    quantize(id, { dither: p && p.dither != null ? p.dither : 16, grit: 12, sat: p && p.sat != null ? p.sat : 0.78, contrast: 1.12, seed: W * 31 + H });
    const O = rgb((p && p.colors && p.colors.outline) || '#0b0710');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (solid[i]) continue;
      if ((x > 0 && solid[i - 1]) || (x < W - 1 && solid[i + 1]) || (y > 0 && solid[i - W]) || (y < H - 1 && solid[i + W])) {
        const j = i * 4; d[j] = O[0]; d[j + 1] = O[1]; d[j + 2] = O[2]; d[j + 3] = 255;
      }
    }
    g.putImageData(id, 0, 0);
    return src;
  }
  gfx.classicize = classicize;
  function whiten(src) {
    const c = canvas(src.width, src.height), g = c.getContext('2d');
    g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  /* ---------------- painting primitives (world units) ---------------- */
  const P = {
    path(g, pts, close) { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); if (close !== false) g.closePath(); },
    fill(g, style) { g.fillStyle = style; g.fill(); },
    stroke(g, style, w) { g.strokeStyle = style; g.lineWidth = w; g.stroke(); },
    circle(g, x, y, r, style) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = style; g.fill(); },
    ell(g, x, y, rx, ry, style, rot) { g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); g.fillStyle = style; g.fill(); },
    rect(g, x, y, w, h, style) { g.fillStyle = style; g.fillRect(x, y, w, h); },
    rrect(g, x, y, w, h, r, style) {
      g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
      if (style) { g.fillStyle = style; g.fill(); }
    },
    line(g, x1, y1, x2, y2, w, style) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokeStyle = style; g.lineWidth = w; g.stroke(); },
    lg(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => gr.addColorStop(Array.isArray(s) ? s[0] : i / (stops.length - 1), Array.isArray(s) ? s[1] : s)); return gr; },
    rg(g, x, y, r, stops, fx, fy) { const gr = g.createRadialGradient(fx == null ? x : fx, fy == null ? y : fy, 0, x, y, r); stops.forEach((s, i) => gr.addColorStop(Array.isArray(s) ? s[0] : i / (stops.length - 1), Array.isArray(s) ? s[1] : s)); return gr; },
    /** Round "volume" fill: light from top-left. */
    vol(g, x, y, r, base) { return P.rg(g, x, y, r, [[0, shade(base, 0.35)], [0.55, base], [1, shade(base, -0.45)]], x - r * 0.35, y - r * 0.4); },
    glow(g, x, y, r, color, a) { g.save(); g.globalCompositeOperation = 'lighter'; P.circle(g, x, y, r, P.rg(g, x, y, r, [[0, rgba(color, a == null ? 0.9 : a)], [1, rgba(color, 0)]])); g.restore(); },
    eye(g, x, y, r, color) { P.glow(g, x, y, r * 2.6, color, 0.55); P.circle(g, x, y, r, color); P.circle(g, x - r * 0.3, y - r * 0.3, r * 0.4, '#ffffff'); },
    bone(g, x1, y1, x2, y2, w, col) {
      P.line(g, x1, y1, x2, y2, w, P.lg(g, x1, y1 - w, x1, y1 + w, [shade(col, 0.2), shade(col, -0.25)]));
      P.circle(g, x1, y1, w * 0.75, col); P.circle(g, x2, y2, w * 0.75, col);
    },
  };
  gfx.P = P;

  /* ---------------- procedural floor (256-unit chunks, cached) ---------------- */
  const CHUNK = 256;
  /* ---------------- floor paving, one pattern per hall ---------------- */
  // Every layout is laid out on global coordinates and every stone draws its details from its own seed, so a stone cut
  // by a chunk's edge carries on unbroken into the next chunk.
  function srng(a, b, s) { let t = (U.hash2(a, b, s) * 4294967296) >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
  /** A rectangle with its corners chipped by different amounts (clockwise, so its outer edges face out). */
  function chipRect(x, y, w, h, r, chip) {
    const c = () => 0.5 + r() * chip;
    const a = c(), b = c(), d = c(), e = c();
    return [x + a, y, x + w - b, y, x + w, y + b, x + w, y + h - d, x + w - d, y + h, x + e, y + h, x, y + h - e, x, y + a];
  }
  /** One worn floor stone: its face lit from the top-left, the edges facing the light catching it, the others in shadow,
   *  pits and grit, and now and then a crack or a hollow worn by feet. */
  function stone(g, poly, col, r, o) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = 0; i < poly.length; i += 2) { x0 = Math.min(x0, poly[i]); x1 = Math.max(x1, poly[i]); y0 = Math.min(y0, poly[i + 1]); y1 = Math.max(y1, poly[i + 1]); }
    const w = x1 - x0, h = y1 - y0;
    P.path(g, poly); P.fill(g, P.lg(g, x0, y0, x0 + w * 0.5, y1, [shade(col, 0.1 + (o.lift || 0)), col, shade(col, -0.18)]));
    g.save(); P.path(g, poly); g.clip();
    if (r() < 0.5) { const hx = x0 + w * (0.3 + r() * 0.4), hy = y0 + h * (0.3 + r() * 0.4), hr = Math.min(w, h) * 0.5; g.fillStyle = P.rg(g, hx, hy, hr, [[0, 'rgba(0,0,0,0.13)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(hx - hr, hy - hr, hr * 2, hr * 2); }
    const n = 3 + (w * h / 60 | 0);
    for (let i = 0; i < n; i++) P.circle(g, x0 + r() * w, y0 + r() * h, 0.3 + r() * 0.7, r() < 0.6 ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.07)');
    if (r() < (o.crack || 0.14)) {
      g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 0.5; g.beginPath();
      let px = x0 + r() * w, py = y0; g.moveTo(px, py);
      for (let s = 1; s <= 5; s++) { px += (r() - 0.5) * 6; py = y0 + h * s / 5; g.lineTo(px, py); if (r() < 0.3) { g.moveTo(px, py); g.lineTo(px + (r() - 0.5) * 6, py + 2); g.moveTo(px, py); } }
      g.stroke();
    }
    if (o.inner) o.inner(x0, y0, w, h);
    g.restore();
    // the bevel: an edge facing the light is lit, one facing away is dark
    g.lineWidth = 0.6;
    for (let i = 0; i < poly.length; i += 2) {
      const ax = poly[i], ay = poly[i + 1], bx = poly[(i + 2) % poly.length], by = poly[(i + 3) % poly.length];
      const L = Math.hypot(bx - ax, by - ay) || 1, nx = (by - ay) / L, ny = -(bx - ax) / L, d = -(nx + ny) * 0.707;
      if (Math.abs(d) < 0.2) continue;
      g.strokeStyle = d > 0 ? rgba(shade(col, 0.45), 0.4 * d) : 'rgba(0,0,0,' + (-0.42 * d).toFixed(2) + ')';
      g.beginPath(); g.moveTo(ax - nx * 0.35, ay - ny * 0.35); g.lineTo(bx - nx * 0.35, by - ny * 0.35); g.stroke();
    }
  }
  const PATS = {
    ashlar: [[[0, 0, 1, 1]], [[0, 0, 1, 0.5], [0, 0.5, 1, 0.5]], [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]], [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]],
      [[0, 0, 0.5, 1], [0.5, 0, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]], [[0, 0, 1, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]], [[0, 0, 1, 1]]],
    long: [[[0, 0, 1, 1]], [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]], [[0, 0, 1 / 3, 1], [1 / 3, 0, 2 / 3, 1]], [[0, 0, 2 / 3, 1], [2 / 3, 0, 1 / 3, 1]]],
  };
  /** Stones laid in blocks of bw x bh on a running bond; each block split by one of the patterns. */
  function blocks(g, F, cx, cy, bw, bh, pats, gap, each) {
    const ox = cx * CHUNK, oy = cy * CHUNK;
    for (let by = Math.floor(oy / bh) - 1; by <= Math.floor((oy + CHUNK) / bh) + 1; by++) {
      const off = (by & 1) ? bw / 2 : 0;
      for (let bx = Math.floor((ox - off) / bw) - 1; bx <= Math.floor((ox + CHUNK - off) / bw) + 1; bx++) {
        const pat = pats[Math.floor(U.hash2(bx, by, F.seed + 9) * pats.length)], X = bx * bw + off - ox, Y = by * bh - oy;
        pat.forEach((q, i) => { const r = srng(bx * 7 + i, by * 13 + i, F.seed); each(X + q[0] * bw + gap, Y + q[1] * bh + gap, q[2] * bw - gap * 2, q[3] * bh - gap * 2, r, U.hash2(bx * 3 + i, by * 5, F.seed + 1)); });
      }
    }
  }
  const tone = (A, B, k) => shade(k < 0.5 ? A : B, (k * 7 % 1) * 0.2 - 0.1);
  const PAVE = {
    // the crypt: worn ashlar, chipped, some stones sunk or gone to earth, moss in the joints
    crypt(g, F, cx, cy, T, A, B) {
      const moss = hex.apply(null, T.moss);
      blocks(g, F, cx, cy, 32, 32, PATS.ashlar, 0.8, (x, y, w, h, r, k) => {
        if (k > 0.975) { P.rrect(g, x, y, w, h, 2, '#141016'); for (let i = 0; i < 7; i++) { const px = x + r() * w, py = y + r() * h, pr = 0.6 + r() * 1.4; P.circle(g, px, py, pr, P.vol(g, px, py, pr, shade(A, -0.1))); } return; }
        const sunk = k > 0.92, col = shade(tone(A, B, k), sunk ? -0.18 : 0);
        stone(g, chipRect(x, y, w, h, r, sunk ? 2.4 : 1.6), col, r, { inner: sunk ? (x0, y0, w0) => P.rect(g, x0, y0, w0, 2.2, 'rgba(0,0,0,0.3)') : null });
        if (r() < 0.3) for (let i = 0; i < 4; i++) P.ell(g, x + r() * w, y + h + 0.2, 1 + r() * 1.6, 0.7, rgba(moss, 0.45));
      });
    },
    // the abyss: the tops of basalt columns, a few seams still glowing with the lava beneath
    abyss(g, F, cx, cy, T, A, B, lights) {
      const R = 11, S3 = Math.sqrt(3), ox = cx * CHUNK, oy = cy * CHUNK, cells = [];
      for (let q = Math.floor((ox - 2 * R) / (1.5 * R)); q <= Math.ceil((ox + CHUNK + 2 * R) / (1.5 * R)); q++)
        for (let s = Math.floor((oy - 2 * R) / (S3 * R) - q / 2); s <= Math.ceil((oy + CHUNK + 2 * R) / (S3 * R) - q / 2); s++) cells.push([q, s, 1.5 * R * q - ox, S3 * R * (s + q / 2) - oy]);
      const corner = (X, Y, k, rr) => [X + rr * Math.cos(k * Math.PI / 3), Y + rr * Math.sin(k * Math.PI / 3)];
      g.lineCap = 'round'; let lit = 0;
      for (const [q, s, X, Y] of cells) for (let k = 0; k < 3; k++) if (U.hash2(q * 3 + k, s, F.seed + 21) < 0.06) {
        const [ax, ay] = corner(X, Y, k, R), [bx, by] = corner(X, Y, k + 1, R);
        P.line(g, ax, ay, bx, by, 2.6, 'rgba(255,80,20,0.35)'); P.line(g, ax, ay, bx, by, 0.8, '#ff9a3a');
        if (lit < 2 && U.hash2(q, s * 3 + k, F.seed + 22) < 0.15) { lit++; lights.push({ x: ox + (ax + bx) / 2, y: oy + (ay + by) / 2, r: 22, kind: 'lava' }); }
      }
      for (const [q, s, X, Y] of cells) {
        const r = srng(q, s, F.seed), k = U.hash2(q, s, F.seed + 1), poly = [];
        for (let i = 0; i < 6; i++) { const [px, py] = corner(X, Y, i, R - 0.8 - r() * 0.5); poly.push(px, py); }
        stone(g, poly, shade(mix(tone(A, B, k), '#3a3634', 0.45), -0.12), r, { crack: 0.2 });
      }
      for (let i = 0; i < 3; i++) { const r = srng(cx * 5 + i, cy, F.seed + 30), x = 30 + r() * 196, y = 30 + r() * 196, rr = 14 + r() * 20; g.fillStyle = P.rg(g, x, y, rr, [[0, 'rgba(130,120,115,0.16)'], [1, 'rgba(130,120,115,0)']]); g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    },
    // the aqueduct: long wet slabs, algae in the joints, the wet catching the light
    aqueduct(g, F, cx, cy, T, A, B) {
      const alg = hex.apply(null, T.moss);
      blocks(g, F, cx, cy, 48, 16, PATS.long, 0.7, (x, y, w, h, r, k) => {
        stone(g, chipRect(x, y, w, h, r, 1.2), tone(A, B, k), r, { inner: (x0, y0, w0, h0) => { if (r() < 0.55) { const sx = x0 + r() * w0 * 0.7; P.line(g, sx, y0 + h0 * 0.7, sx + 5 + r() * 6, y0 + h0 * 0.3, 0.8, 'rgba(210,255,245,0.12)'); } } });
        if (r() < 0.4) for (let i = 0; i < 5; i++) P.ell(g, x + r() * w, y + h + 0.3, 1.2 + r() * 2, 0.6, rgba(alg, 0.5));
      });
    },
    // the frozen catacombs: frost-rimmed flagstones, snow packed in the joints, sheets of clear ice
    catacombs(g, F, cx, cy, T, A, B) {
      blocks(g, F, cx, cy, 32, 32, PATS.ashlar, 0.8, (x, y, w, h, r, k) => {
        stone(g, chipRect(x, y, w, h, r, 1.4), tone(A, B, k), r, { inner: (x0, y0, w0, h0) => {
          g.strokeStyle = 'rgba(230,245,255,0.3)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x0, y0 + h0 * 0.6); g.lineTo(x0, y0); g.lineTo(x0 + w0 * 0.7, y0); g.stroke();
          for (let i = 0; i < 6; i++) P.rect(g, x0 + r() * w0, y0 + r() * 2.4, 0.6, 0.6, 'rgba(240,250,255,0.4)');
        } });
        if (r() < 0.35) P.rect(g, x - 0.8, y + h, w + 1.6, 0.8, 'rgba(225,240,255,0.55)');
      });
      for (let i = 0; i < 2; i++) {
        const r = srng(cx * 3 + i, cy * 7, F.seed + 40); if (r() < 0.35) continue;
        const x = 50 + r() * 156, y = 50 + r() * 156, rx = 18 + r() * 22, ry = rx * (0.5 + r() * 0.2), a = r() * 0.6 - 0.3;
        P.ell(g, x, y, rx, ry, 'rgba(190,230,255,0.16)', a);
        g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 0.5; g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); g.stroke();
        for (let j = 0; j < 3; j++) { const sx = x - rx * 0.5 + j * rx * 0.3; P.line(g, sx, y + ry * 0.3, sx + rx * 0.25, y - ry * 0.3, 0.7, 'rgba(255,255,255,0.2)'); }
      }
    },
    // the halls of discord: an argyle of dark tiles bound in thin inlay of the hall's colour, a rune set in a few
    discord(g, F, cx, cy, T, A, B, lights) {
      const d = 14, ox = cx * CHUNK, oy = cy * CHUNK, ac = T.accent || '#e080ff'; let lit = 0;
      for (let j = Math.floor(oy / d) - 1; j <= Math.ceil((oy + CHUNK) / d) + 1; j++)
        for (let i = Math.floor(ox / (2 * d)) - 1; i <= Math.ceil((ox + CHUNK) / (2 * d)) + 1; i++) {
          const X = i * 2 * d + ((j & 1) ? d : 0) - ox, Y = j * d - oy, r = srng(i, j, F.seed), k = U.hash2(i, j, F.seed + 1), gp = 0.7;
          const poly = [X, Y - d + gp, X + d - gp, Y, X, Y + d - gp, X - d + gp, Y];
          stone(g, poly, shade((j & 1) ? A : B, (k * 7 % 1) * 0.12 - 0.06 + ((j & 1) ? 0.02 : -0.06)), r, { crack: 0.1 });
          g.strokeStyle = rgba(ac, 0.22); g.lineWidth = 0.5; P.path(g, [X, Y - d, X + d, Y, X, Y + d, X - d, Y]); g.stroke();
          if (k > 0.985) {
            g.strokeStyle = rgba(ac, 0.75); g.lineWidth = 0.6; g.beginPath(); g.arc(X, Y, 4, 0, Math.PI * 2); g.moveTo(X, Y - 5.4); g.lineTo(X, Y + 5.4); g.moveTo(X - 3, Y - 1.6); g.lineTo(X + 3, Y + 1.6); g.stroke();
            if (X > 0 && X < CHUNK && Y > 0 && Y < CHUNK && lit++ < 2) lights.push({ x: ox + X, y: oy + Y, r: 14, kind: 'crystal', color: ac });
          }
        }
    },
    // the blightmire: flagstones sinking into the mud, tipped and broken, grass and roots between them
    blightmire(g, F, cx, cy, T, A, B) {
      const moss = hex.apply(null, T.moss), mud = mix(A, hex.apply(null, T.mortar), 0.62);
      P.rect(g, -8, -8, CHUNK + 16, CHUNK + 16, mud);
      for (let i = 0; i < 26; i++) { const r = srng(cx * 31 + i, cy * 17, F.seed + 50), x = r() * CHUNK, y = r() * CHUNK, rr = 6 + r() * 14; P.ell(g, x, y, rr * 1.4, rr, rgba(shade(mud, r() < 0.5 ? 0.18 : -0.25), 0.5), r() * 3); }
      blocks(g, F, cx, cy, 28, 28, PATS.ashlar, 1.6, (x, y, w, h, r, k) => {
        if (k < 0.14) return;
        const a = (r() - 0.5) * 0.14, mx = x + w / 2, my = y + h / 2;
        g.save(); g.translate(mx, my); g.rotate(a); g.translate(-mx, -my);
        P.path(g, chipRect(x + 0.8, y + 1.6, w, h, r, 2)); P.fill(g, 'rgba(0,0,0,0.35)');
        stone(g, chipRect(x, y, w, h, r, 3), shade(tone(A, B, k), -0.05), r, { crack: 0.25, inner: (x0, y0, w0, h0) => {
          for (let j = 0; j < 3; j++) if (r() < 0.6) { const px = x0 + r() * w0, py = y0 + r() * h0, pr = 3 + r() * 6; g.fillStyle = P.rg(g, px, py, pr, [[0, rgba(moss, 0.3)], [1, rgba(moss, 0)]]); g.fillRect(px - pr, py - pr, pr * 2, pr * 2); }
        } });
        g.restore();
      });
      g.lineCap = 'round';
      for (let i = 0; i < 16; i++) { const r = srng(cx * 11 + i, cy * 23, F.seed + 51), x = 6 + r() * 244, y = 6 + r() * 244; for (let j = -2; j <= 2; j++) P.line(g, x + j * 0.6, y, x + j * 1.4 + (r() - 0.5), y - 2.4 - r() * 2.4, 0.5, rgba(shade(moss, r() * 0.4 - 0.2), 0.8)); }
      const r = srng(cx, cy, F.seed + 52);
      for (let i = 0; i < 2; i++) {
        let px = 20 + r() * 216, py = 20 + r() * 216, a = r() * Math.PI * 2;
        g.strokeStyle = '#1a140a'; g.lineWidth = 1.8 - i * 0.4; g.beginPath(); g.moveTo(px, py);
        for (let s = 0; s < 6; s++) { a += (r() - 0.5) * 1.1; const nx = U.clamp(px + Math.cos(a) * 9, 4, 252), ny = U.clamp(py + Math.sin(a) * 9, 4, 252); g.quadraticCurveTo(px + Math.cos(a + 0.6) * 5, py + Math.sin(a + 0.6) * 5, nx, ny); px = nx; py = ny; }
        g.stroke(); g.strokeStyle = 'rgba(120,100,60,0.3)'; g.lineWidth = 0.4; g.stroke();
      }
    },
    // the reliquary: polished marble in a chequer, veined, bound every few tiles by bands of gold
    reliquary(g, F, cx, cy, T, A, B) {
      const s = 24, ox = cx * CHUNK, oy = cy * CHUNK, L = shade(A, 0.05), D = shade(B, -0.08);
      for (let j = Math.floor(oy / s) - 1; j <= Math.ceil((oy + CHUNK) / s); j++) for (let i = Math.floor(ox / s) - 1; i <= Math.ceil((ox + CHUNK) / s); i++) {
        const x = i * s - ox + 0.5, y = j * s - oy + 0.5, r = srng(i, j, F.seed), k = U.hash2(i, j, F.seed + 1), light = (i + j) & 1;
        stone(g, [x, y, x + s - 1, y, x + s - 1, y + s - 1, x, y + s - 1], shade(light ? L : D, k * 0.08 - 0.04), r, { crack: 0.08, lift: 0.06, inner: (x0, y0, w0, h0) => {
          for (let v = 0; v < 2; v++) { let px = x0 + r() * w0, py = y0; g.strokeStyle = light ? 'rgba(90,70,50,0.22)' : 'rgba(255,240,210,0.12)'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(px, py); for (let t = 1; t <= 4; t++) { px += (r() - 0.5) * 9; g.lineTo(px, y0 + h0 * t / 4); } g.stroke(); }
          P.path(g, [x0, y0 + h0 * 0.6, x0 + w0 * 0.6, y0, x0 + w0 * 0.85, y0, x0, y0 + h0 * 0.85]); P.fill(g, 'rgba(255,250,230,0.05)');
        } });
      }
      const gold = 'rgba(200,150,50,0.75)';
      for (let v = Math.ceil((ox - 1) / (s * 3)) * s * 3; v < ox + CHUNK + 1; v += s * 3) P.rect(g, v - ox - 0.45, 0, 0.9, CHUNK, gold);
      for (let v = Math.ceil((oy - 1) / (s * 3)) * s * 3; v < oy + CHUNK + 1; v += s * 3) P.rect(g, 0, v - oy - 0.45, CHUNK, 0.9, gold);
      for (let vx = Math.ceil((ox - 1) / (s * 3)) * s * 3; vx < ox + CHUNK + 1; vx += s * 3) for (let vy = Math.ceil((oy - 1) / (s * 3)) * s * 3; vy < oy + CHUNK + 1; vy += s * 3) {
        const x = vx - ox, y = vy - oy; P.path(g, [x, y - 2.6, x + 2.6, y, x, y + 2.6, x - 2.6, y]); P.fill(g, '#c89838'); P.path(g, [x, y - 2.6, x + 2.6, y, x, y]); P.fill(g, '#f0d070');
      }
    },
  };
  function Floor(theme, seed, res) { this.theme = theme; this.seed = seed || 1; this.res = res; this.chunks = new Map(); }
  Floor.prototype.chunk = function (cx, cy) {
    const key = cx + ',' + cy; let ch = this.chunks.get(key);
    if (ch) { ch.used = performance.now(); return ch; }
    ch = this.build(cx, cy); this.chunks.set(key, ch);
    if (this.chunks.size > 20) { let ok = null, ot = Infinity; this.chunks.forEach((v, k) => { if (v.used < ot) { ot = v.used; ok = k; } }); this.chunks.delete(ok); }
    return ch;
  };
  Floor.prototype.build = function (cx, cy) {
    const T = this.theme, R = this.res, S = CHUNK * R;
    const c = canvas(S, S), g = c.getContext('2d');
    const rng = U.seeded(U.strSeed(cx + '/' + cy + '/' + this.seed));
    const A = hex.apply(null, T.floorA), B = hex.apply(null, T.floorB), M = hex.apply(null, T.mortar);
    g.fillStyle = M; g.fillRect(0, 0, S, S);
    g.save(); g.scale(R, R);
    // the paving of this hall
    const lights = [];
    (PAVE[T.floor] || PAVE.crypt)(g, this, cx, cy, T, A, B, lights);
    // large stains and puddles
    for (let i = 0; i < 3; i++) {
      const x = rng() * CHUNK, y = rng() * CHUNK, r = 25 + rng() * 55;
      g.fillStyle = P.rg(g, x, y, r, [[0, 'rgba(0,0,0,0.3)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    if (T.pools && rng() < 0.6) {
      const x = 30 + rng() * (CHUNK - 60), y = 30 + rng() * (CHUNK - 60), rx = 12 + rng() * 18, ry = rx * 0.55;
      const pc = hex.apply(null, T.pools);
      P.ell(g, x, y, rx, ry, P.lg(g, x, y - ry, x, y + ry, [shade(pc, 0.2), pc, shade(pc, -0.3)]));
      g.strokeStyle = rgba(shade(pc, 0.5), 0.35); g.lineWidth = 0.6; g.beginPath(); g.ellipse(x - rx * 0.2, y - ry * 0.3, rx * 0.5, ry * 0.3, 0, Math.PI, Math.PI * 1.8); g.stroke();
    }
    // decals
    const nDec = 7 + (rng() * 8 | 0);
    for (let i = 0; i < nDec; i++) {
      const x = 8 + rng() * (CHUNK - 16), y = 8 + rng() * (CHUNK - 16), r = rng();
      if (r < 0.25) {
        const bc = T.blood || '#6a0a14';
        for (let j = 0; j < 8; j++) P.ell(g, x + (rng() - 0.5) * 14, y + (rng() - 0.5) * 8, 1 + rng() * 5, 0.8 + rng() * 3, rgba(bc, 0.35 + rng() * 0.3), rng() * 3);
      } else if (r < 0.45) drawDecal(g, 'bones', x, y, rng);
      else if (r < 0.57) drawDecal(g, 'skull', x, y, rng);
      else if (r < 0.8) { for (let j = 0; j < 6; j++) { const rx = x + rng() * 12, ry = y + rng() * 7, rr = 0.6 + rng() * 1.6; P.circle(g, rx, ry, rr, P.vol(g, rx, ry, rr, shade(A, -0.1))); } }
      else if (r < 0.9 && T.crystals) { drawDecal(g, 'crystal', x, y, rng, hex.apply(null, T.crystals)); lights.push({ x: cx * CHUNK + x, y: cy * CHUNK + y - 3, r: 22, kind: 'crystal', color: hex.apply(null, T.crystals) }); }
      else { drawDecal(g, 'candle', x, y, rng); lights.push({ x: cx * CHUNK + x, y: cy * CHUNK + y - 5, r: 26, kind: 'candle' }); }
    }
    // set dressing: rubble, cobwebs, grates, tomb slabs, rune circles, broken columns
    const nSet = 2 + (rng() * 3 | 0);
    for (let i = 0; i < nSet; i++) {
      const x = 20 + rng() * (CHUNK - 40), y = 20 + rng() * (CHUNK - 40), r = rng();
      if (r < 0.28) drawDecal(g, 'rubble', x, y, rng, A);
      else if (r < 0.44) drawDecal(g, 'cobweb', Math.round(x / 32) * 32 + 1, Math.round(y / 32) * 32 + 1, rng);
      else if (r < 0.58) drawDecal(g, 'grate', x, y, rng);
      else if (r < 0.72) drawDecal(g, 'slab', x, y, rng, A);
      else if (r < 0.84) { drawDecal(g, 'rune', x, y, rng, T.accent || '#e8a050'); lights.push({ x: cx * CHUNK + x, y: cy * CHUNK + y, r: 20, kind: 'crystal', color: T.accent || '#e8a050' }); }
      else drawDecal(g, 'column', x, y, rng, A);
    }
    if (T.lava && rng() < 0.55) {
      g.strokeStyle = '#ff7a20'; g.lineWidth = 1.1; g.shadowColor = '#ff5a10'; g.shadowBlur = 6 * R;
      g.beginPath(); let px = rng() * CHUNK, py = rng() * CHUNK; g.moveTo(px, py);
      for (let s2 = 0; s2 < 10; s2++) { px += (rng() - 0.3) * 18; py += (rng() - 0.5) * 18; g.lineTo(px, py); }
      g.stroke(); g.shadowBlur = 0;
      lights.push({ x: cx * CHUNK + px, y: cy * CHUNK + py, r: 40, kind: 'lava' });
    }
    if (rng() < 0.55) {
      const bx = 32 + rng() * (CHUNK - 64), by = 32 + rng() * (CHUNK - 64);
      P.ell(g, bx, by + 7, 7, 2.6, 'rgba(0,0,0,0.45)');
      drawDecal(g, 'brazier', bx, by, rng);
      lights.push({ x: cx * CHUNK + bx, y: cy * CHUNK + by - 4, r: 72, kind: 'brazier' });
    }
    g.restore();
    { const id = g.getImageData(0, 0, S, S); quantize(id, { dither: 18, grit: 16, sat: 0.8, contrast: 1.12, seed: cx * 7919 + cy * 104729 }); g.putImageData(id, 0, 0); }
    return { canvas: c, lights, used: performance.now(), res: R };
  };

  function drawDecal(g, kind, x, y, rng, color) {
    const INK = 'rgba(8,5,8,0.85)';
    const bone = (x1, y1, x2, y2, w) => {
      g.lineCap = 'round'; P.line(g, x1, y1, x2, y2, w + 0.8, INK); P.line(g, x1, y1, x2, y2, w, P.lg(g, x1, y1 - w, x1, y1 + w, ['#efe4c8', '#a89a78']));
      for (const [bx, by] of [[x1, y1], [x2, y2]]) { const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2; for (const s of [-1, 1]) { P.circle(g, bx + Math.cos(a) * s * w * 0.55, by + Math.sin(a) * s * w * 0.55, w * 0.75 + 0.3, INK); } for (const s of [-1, 1]) P.circle(g, bx + Math.cos(a) * s * w * 0.55, by + Math.sin(a) * s * w * 0.55, w * 0.75, '#e8dcc0'); }
    };
    if (kind === 'bones') {
      P.ell(g, x, y + 1.6, 7, 2, 'rgba(0,0,0,0.3)');
      const a = rng() * Math.PI, l = 4 + rng() * 2;
      bone(x - Math.cos(a) * l, y - Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l * 0.5, 0.9);
      const b = a + 1.2 + rng() * 0.8; bone(x + 1 - Math.cos(b) * 3, y + 1 - Math.sin(b) * 1.5, x + 1 + Math.cos(b) * 3, y + 1 + Math.sin(b) * 1.5, 0.7);
      for (let i = 0; i < 3; i++) P.circle(g, x + (rng() - 0.5) * 10, y + (rng() - 0.5) * 5, 0.5 + rng() * 0.4, '#c8bc9a');
    } else if (kind === 'skull') {
      P.ell(g, x + 0.6, y + 3, 4.2, 1.3, 'rgba(0,0,0,0.4)');
      g.save(); g.translate(x, y); g.rotate((rng() - 0.5) * 0.6);
      g.beginPath(); g.moveTo(-2.8, 0.6); g.bezierCurveTo(-3.2, -3.6, 3.2, -3.6, 2.8, 0.6); g.lineTo(2.4, 1.6); g.lineTo(1.4, 2.6); g.lineTo(-1.4, 2.6); g.lineTo(-2.4, 1.6); g.closePath();
      g.strokeStyle = INK; g.lineWidth = 0.7; g.stroke(); P.fill(g, P.lg(g, -3, -3, 3, 3, ['#f4ecd4', '#c8bc98', '#7a6e52']));
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 0.4, -0.2); g.quadraticCurveTo(s * 1.4, -1.2, s * 2.1, -0.4); g.quadraticCurveTo(s * 1.8, 0.9, s * 0.9, 0.9); g.closePath(); P.fill(g, '#140a0c'); }
      P.path(g, [0, 0.8, -0.4, 1.6, 0.4, 1.6]); P.fill(g, '#140a0c');
      for (let i = 0; i < 4; i++) P.rect(g, -1.2 + i * 0.62, 2, 0.45, 0.7, '#e8dcc0');
      P.ell(g, -1, -2, 1, 0.5, 'rgba(255,255,255,0.4)', -0.4);
      g.restore();
    } else if (kind === 'candle') {
      P.ell(g, x, y + 0.8, 3.6, 1.2, 'rgba(0,0,0,0.4)');
      P.ell(g, x, y + 0.5, 3, 1, 'rgba(230,220,195,0.7)'); // a pool of old wax
      for (const [dx, h, dy] of [[-1.2, 3.6 + rng() * 1.4, 0], [1.3, 2 + rng(), 0.4]]) {
        const cx = x + dx, cy = y + dy;
        P.rrect(g, cx - 0.95, cy - h, 1.9, h, 0.5, INK); P.rrect(g, cx - 0.7, cy - h + 0.2, 1.4, h - 0.2, 0.4, P.lg(g, cx - 1, 0, cx + 1, 0, ['#fff6e0', '#d8c7a0', '#9a8a68']));
        P.path(g, [cx + 0.2, cy - h + 0.3, cx + 0.7, cy - h + 0.3, cx + 0.6, cy - h + 2, cx + 0.3, cy - h + 1.4]); P.fill(g, '#fff8e8');
        P.line(g, cx, cy - h, cx, cy - h - 0.8, 0.3, '#2a1a10');
      }
    } else if (kind === 'crystal') {
      P.ell(g, x, y + 0.6, 5, 1.4, 'rgba(0,0,0,0.35)');
      for (const [dx, h, lean] of [[-2.4, 4 + rng() * 2, -0.25], [2.2, 3.4 + rng() * 2, 0.3], [0, 6 + rng() * 3, 0]]) {
        g.save(); g.translate(x + dx, y); g.rotate(lean);
        P.path(g, [-1.5, 0, -1.5, -h, 0, -h - 1.8, 1.5, -h, 1.5, 0]); g.strokeStyle = INK; g.lineWidth = 0.6; g.stroke();
        P.path(g, [-1.5, 0, -1.5, -h, 0, -h - 1.8, 0, 0]); P.fill(g, shade(color, 0.5)); P.path(g, [0, 0, 0, -h - 1.8, 1.5, -h, 1.5, 0]); P.fill(g, shade(color, -0.35));
        P.line(g, -1, -1, -1, -h + 0.3, 0.3, 'rgba(255,255,255,0.7)');
        g.restore();
      }
    } else if (kind === 'rubble') {
      for (let i = 0; i < 8; i++) {
        const rx = x + (rng() - 0.5) * 16, ry = y + (rng() - 0.5) * 9, rr = 0.9 + rng() * 2.2, c = shade(color || '#5a5464', (rng() - 0.5) * 0.3);
        P.ell(g, rx + 0.6, ry + rr * 0.6, rr * 1.1, rr * 0.5, 'rgba(0,0,0,0.35)');
        const pts = [rx - rr, ry + 0.2, rx - rr * 0.4, ry - rr * 0.9, rx + rr * 0.8, ry - rr * 0.6, rx + rr, ry + rr * 0.4, rx, ry + rr * 0.6];
        P.path(g, pts); g.strokeStyle = INK; g.lineWidth = 0.5; g.stroke(); P.fill(g, P.lg(g, rx - rr, ry - rr, rx + rr, ry + rr, [shade(c, 0.1), shade(c, -0.45)]));
        P.path(g, [rx - rr, ry + 0.2, rx - rr * 0.4, ry - rr * 0.9, rx + rr * 0.8, ry - rr * 0.6, rx + rr * 0.2, ry - rr * 0.1]); P.fill(g, shade(c, 0.35)); // the lit top
      }
    } else if (kind === 'cobweb') {
      const L = 12 + rng() * 8;
      g.strokeStyle = 'rgba(225,225,235,0.3)'; g.lineWidth = 0.35;
      for (let i = 0; i <= 5; i++) { const a = i / 5 * Math.PI / 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
      for (let k = 1; k <= 5; k++) { const rr = L * k / 5.4; g.beginPath(); for (let i = 0; i <= 5; i++) { const a = i / 5 * Math.PI / 2, px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; if (i) g.quadraticCurveTo(x + Math.cos(a - 0.16) * rr * 0.86, y + Math.sin(a - 0.16) * rr * 0.86, px, py); else g.moveTo(px, py); } g.stroke(); }
      P.circle(g, x + L * 0.4, y + L * 0.36, 0.9, 'rgba(10,6,8,0.9)'); P.circle(g, x + L * 0.4 + 0.9, y + L * 0.36 + 0.6, 0.6, 'rgba(10,6,8,0.9)'); // its spinner
    } else if (kind === 'grate') {
      P.rrect(g, x - 8.6, y - 6.6, 17.2, 13.2, 1.2, '#0c0a10');
      P.rrect(g, x - 8, y - 6, 16, 12, 1, P.lg(g, x - 8, y - 6, x + 8, y + 6, ['#6a6472', '#3a3444', '#1e1a24']));
      P.rrect(g, x - 6.6, y - 4.6, 13.2, 9.2, 0.4, '#040206');
      g.fillStyle = P.rg(g, x, y + 1, 6, [[0, 'rgba(80,120,60,0.35)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(x - 6.6, y - 4.6, 13.2, 9.2); // something wet down there
      for (let i = 0; i < 5; i++) { const bx = x - 5.8 + i * 2.8; P.rect(g, bx, y - 4.6, 1.3, 9.2, P.lg(g, bx, 0, bx + 1.3, 0, ['#8a8494', '#3a3444'])); }
      P.rect(g, x - 6.6, y - 0.6, 13.2, 1.2, P.lg(g, 0, y - 0.6, 0, y + 0.6, ['#7a7484', '#2a2432']));
      for (const [rx, ry] of [[x - 7.2, y - 5.2], [x + 7.2, y - 5.2], [x - 7.2, y + 5.2], [x + 7.2, y + 5.2]]) { P.circle(g, rx, ry, 0.6, '#1a1620'); P.circle(g, rx - 0.15, ry - 0.15, 0.35, '#9a94a4'); }
      P.path(g, [x - 8, y - 6, x + 8, y - 6, x + 7.4, y - 5.4, x - 7.4, y - 5.4]); P.fill(g, 'rgba(255,255,255,0.18)');
    } else if (kind === 'slab') {
      const c = shade(color || '#5a5464', 0.06);
      P.rrect(g, x - 8, y - 13, 16, 26, 2, 'rgba(0,0,0,0.5)');
      P.rrect(g, x - 7, y - 12, 14, 24, 2, P.lg(g, x - 7, y - 12, x + 7, y + 12, [shade(c, 0.25), c, shade(c, -0.4)]));
      P.path(g, [x - 7, y - 10, x - 5, y - 12, x + 5, y - 12, x + 3.4, y - 10.4, x - 5.6, y - 10]); P.fill(g, 'rgba(255,255,255,0.14)');
      const carve = (draw) => { g.save(); g.translate(0.35, 0.4); g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 0.9; draw(); g.stroke(); g.restore(); g.strokeStyle = shade(c, -0.6); g.lineWidth = 1.1; draw(); g.stroke(); };
      carve(() => { g.beginPath(); g.moveTo(x, y - 9); g.lineTo(x, y + 4); g.moveTo(x - 3.6, y - 5); g.lineTo(x + 3.6, y - 5); });
      carve(() => { g.beginPath(); g.moveTo(x - 4.4, y + 7); g.lineTo(x + 4.4, y + 7); g.moveTo(x - 3.4, y + 9); g.lineTo(x + 2.6, y + 9); });
      if (rng() < 0.7) { g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(x - 7, y + 2); g.lineTo(x - 2.4, y + 4); g.lineTo(x + 0.6, y + 8.4); g.lineTo(x + 7, y + 10); g.stroke(); }
      for (let i = 0; i < 4; i++) P.ell(g, x - 6 + rng() * 12, y + 10.6 - rng() * 2, 1.4 + rng(), 0.7, 'rgba(90,120,60,0.55)');
    } else if (kind === 'rune') {
      const groove = (draw, w) => { g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = w + 0.6; draw(); g.stroke(); g.strokeStyle = rgba(color, 0.75); g.lineWidth = w; draw(); g.stroke(); };
      g.fillStyle = P.rg(g, x, y, 14, [[0, rgba(color, 0.18)], [1, rgba(color, 0)]]); g.fillRect(x - 14, y - 8, 28, 16);
      groove(() => { g.beginPath(); g.ellipse(x, y, 13, 7, 0, 0, Math.PI * 2); }, 0.6);
      groove(() => { g.beginPath(); g.ellipse(x, y, 9.4, 5, 0, 0, Math.PI * 2); }, 0.5);
      groove(() => { g.beginPath(); for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i * 4 * Math.PI / 5; const px = x + Math.cos(a) * 9.4, py = y + Math.sin(a) * 5; if (i) g.lineTo(px, py); else g.moveTo(px, py); } }, 0.5);
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, px = x + Math.cos(a) * 11.2, py = y + Math.sin(a) * 6; groove(() => { g.beginPath(); g.moveTo(px, py - 0.9); g.lineTo(px, py + 0.9); g.moveTo(px - 0.6, py - 0.3); g.lineTo(px + 0.6, py + 0.3); }, 0.35); }
    } else if (kind === 'column') {
      const c = color || '#5a5464';
      P.ell(g, x + 2, y + 5, 11, 4, 'rgba(0,0,0,0.5)');
      P.rrect(g, x - 9.4, y - 1.4, 18.8, 6.8, 1, '#0c0a10');
      P.rrect(g, x - 9, y - 1, 18, 6, 1, P.lg(g, x - 9, 0, x + 9, 0, [shade(c, 0.25), shade(c, -0.05), shade(c, -0.5)]));
      P.path(g, [x - 7.4, y - 1, x - 7.4, y - 10, x - 4, y - 12.4, x - 1, y - 10.4, x + 2, y - 13.6, x + 4.6, y - 11, x + 7.4, y - 10, x + 7.4, y - 1]); g.strokeStyle = '#0c0a10'; g.lineWidth = 0.8; g.stroke();
      P.fill(g, P.lg(g, x - 7, 0, x + 7, 0, [shade(c, 0.35), c, shade(c, -0.5)]));
      for (let i = -2; i <= 2; i++) { const fx = x + i * 2.8; P.line(g, fx, y - 9.6, fx, y - 1.2, 0.6, rgba(shade(c, -0.6), 0.7)); P.line(g, fx + 0.6, y - 9.6, fx + 0.6, y - 1.2, 0.35, 'rgba(255,255,255,0.12)'); }
      P.path(g, [x - 7.4, y - 10, x - 4, y - 12.4, x - 1, y - 10.4, x + 2, y - 13.6, x + 4.6, y - 11, x + 7.4, y - 10, x + 4, y - 8.6, x - 4, y - 8.8]); P.fill(g, shade(c, 0.3));
      for (let i = 0; i < 4; i++) { const rx = x + 8 + rng() * 8, ry = y + 2 + rng() * 5, rr = 0.8 + rng() * 1.6; P.circle(g, rx, ry, rr + 0.4, '#0c0a10'); P.circle(g, rx, ry, rr, P.vol(g, rx, ry, rr, c)); }
    } else if (kind === 'brazier') {
      g.lineCap = 'round';
      for (const [x2, c] of [[x - 3.4, '#2a2630'], [x + 3.4, '#2a2630'], [x, '#3a3642']]) { P.line(g, x, y + 1, x2, y + 7, 1.4, '#0c0a10'); P.line(g, x, y + 1, x2, y + 7, 0.8, c); }
      P.path(g, [x - 5.4, y - 2.2, x + 5.4, y - 2.2, x + 3.2, y + 1.8, x - 3.2, y + 1.8]); g.strokeStyle = '#0c0a10'; g.lineWidth = 0.8; g.stroke(); P.fill(g, P.lg(g, x - 5, 0, x + 5, 0, ['#6a6472', '#a8a2b4', '#3a3444']));
      P.ell(g, x, y - 2.2, 5.2, 1.3, '#1a1210'); P.ell(g, x, y - 2.4, 4, 0.9, P.lg(g, x - 4, 0, x + 4, 0, ['#c03010', '#ffc040', '#c03010']));
      g.beginPath(); g.moveTo(x - 2.6, y - 2.4); g.quadraticCurveTo(x - 2, y - 6, x, y - 8); g.quadraticCurveTo(x + 2, y - 6, x + 2.6, y - 2.4); g.closePath(); P.fill(g, P.lg(g, 0, y - 8, 0, y - 2, ['#fff4b0', '#ffa030', '#e04010']));
    }
  }
  gfx.drawDecal = drawDecal;
  gfx.Floor = Floor;
  gfx.CHUNK = CHUNK;
  const floors = [];
  gfx.floor = function (theme, seed) { const f = new Floor(theme, seed, this.CPX); floors.push(f); if (floors.length > 3) floors.shift(); return f; };
  /** Drop every cached image so it is painted again. A phone that runs short of graphics memory can lose the contents of
   *  all its canvases at once; without this every sprite would stay blank for the rest of the session. */
  gfx.flush = function () {
    this.cache = {};
    for (const f of floors) f.chunks.clear();
    if (DH.art && DH.art.flushGlows) DH.art.flushGlows();
    DH.events.emit('gfx:flush');
  };

  DH.gfx = gfx;
})(window.DH);
