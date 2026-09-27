/* Hand-placed pixel art: sprites drawn pixel by pixel with the pixel-art studio skill (.claude/skills/pixel-art-studio)
 * and packed by its export step. Each frame is stored at the game's sprite grid (CPX px per unit, painter pad included)
 * as a palette and a run-length string: a palette letter (a = transparent) followed by the run length when above 1.
 * These painters replace the vector painter of the same name. They get the same grading as the vector models (key light,
 * bevelled edges, fine grain, the dark rim), so the art is drawn without an outer outline; grade: false opts out. */
(function (DH) {
  'use strict';
  const G = DH.gfx;
  G.pixelPainter = function (name, o, data) { G.painters[name] = Object.assign({ frames: data.frames.length, pixels: data }, o); };
  G.unpackPixels = function (data, f) {
    const [W, H] = data.size, c = G.canvas(W, H), g = c.getContext('2d'), id = g.createImageData(W, H), d = id.data;
    const pal = data.pal.map((h) => G.rgb(h)), s = data.frames[f];
    let p = 0;
    for (let i = 0; i < s.length;) {
      const k = s.charCodeAt(i++) - 97; let n = 0;
      while (i < s.length && s.charCodeAt(i) < 58) n = n * 10 + (s.charCodeAt(i++) - 48);
      n = n || 1;
      if (k > 0) { const [r, gg, b] = pal[k - 1]; for (let j = p; j < p + n; j++) { d[j * 4] = r; d[j * 4 + 1] = gg; d[j * 4 + 2] = b; d[j * 4 + 3] = 255; } }
      p += n;
    }
    g.putImageData(id, 0, 0);
    return c;
  };

  // (no pixel painters in use: the Sunken Knight's pixel version is kept as a source in tools/pixel/sunkknight.py)
})(window.DH);
