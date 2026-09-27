"""Pack pixel-art frames into the game's pixel-painter format: a palette and one RLE string per frame.
Each run is a palette letter (a = transparent) followed by its length when longer than 1."""
import sys, json
from PIL import Image
name, frames, unit_w, unit_h, cy, desc = sys.argv[1], sys.argv[2].split(','), int(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5]), sys.argv[6]
imgs = [Image.open(f).convert('RGBA') for f in frames]
W, H = imgs[0].size
pal = []
def idx(c):
    if c[3] < 128: return 0
    h = '#%02x%02x%02x' % c[:3]
    if h not in pal: pal.append(h)
    return pal.index(h) + 1
rows = []
for im in imgs:
    px = im.load(); seq = [idx(px[x, y]) for y in range(H) for x in range(W)]
    out, i = [], 0
    while i < len(seq):
        j = i
        while j < len(seq) and seq[j] == seq[i]: j += 1
        n = j - i; out.append(chr(97 + seq[i]) + (str(n) if n > 1 else '')); i = j
    rows.append(''.join(out))
assert len(pal) <= 25
js = "  // %s\n  G.pixelPainter('%s', { w: %d, h: %d, cy: %s }, { size: [%d, %d], pal: %s,\n    frames: [\n%s\n    ] });\n" % (
    desc, name, unit_w, unit_h, cy, W, H, json.dumps(pal), ',\n'.join("      '%s'" % r for r in rows))
open(name + '.js.part', 'w').write(js)
print(name, W, H, 'colors', len(pal), 'bytes', len(js))
