# Painter API and conventions

## Where models live

| File | Holds |
|---|---|
| `js/core/gfx.js` | the engine: `G.sprite(name, variant)`, `paint()`, the grading (`classicize`), the base helpers `P.*` |
| `js/core/paint_enemies.js` | common foes and the shared creature helpers (`P.evil`, `teeth`, `claws`, `limb`, `rag`, `horn2`) |
| `js/core/paint_bosses.js` | the older bosses and Lords |
| `js/core/paint_foes.js` | each hall's own roster (one section per hall); exports `P.skull`, `P.flame`, and keeps file-local helpers `horn`, `cracks`, `barnacles`, `icicle`, `crystal`, `drips`, `coin` |
| `js/core/paint_heroes.js` | heroes (a shared `humanoid()` body) and a few summons |
| `js/core/paint_pixel.js` | optional hand-placed pixel sprites (currently none in use) |
| `js/data/content.js` | `C.enemies[id].painter` / `variant` / `scale`: which painter a unit uses |

A new painter file must be added to `index.html` (after `paint_foes.js`) and to the `FILES`
list in `sw.js`.

## The painter object

```js
def('name', { w: 26, h: 28, cy: 17, frames: 2,           // box in world units; cy = feet line (default h/2)
  colors: { skin: '#7a98a0', eye: '#b0fff0' },          // semantic keys, overridable per variant
  variants: { bare: { skin: '#3a4658' } },               // optional recolours (used for states, not new units)
  draw(g, f, c) { /* f = frame 0|1, c = merged colours; units, facing right */ } });
```

- **Units**: 1 unit = 2 screen-buffer pixels. A regular foe is ~18–30 units tall, a boss 44–64.
  The world is ~270 units on the short side of the screen.
- **Facing right** always; the engine mirrors it when the foe walks left. Put the weapon hand
  and the face on the right.
- **Pad**: the engine adds 1.5 units around the box; draw inside `0..w, 0..h`.
- **Frames**: 2 walk frames by convention; bosses too. `e.fr` can pin a frame for a state
  (the gargoyle perched = frame 0, swooping = frame 1; the mimic shut = 0, open = 1).
- `cx`/`cy` set the anchor; `cy` must sit on the feet (the shadow and collision use it).

## Base helpers (`G.P`, all in units)

`path(g, pts)`, `fill(g, style)`, `stroke(g, style, w)`, `circle`, `ell(g, x, y, rx, ry, style, rot)`,
`rect`, `rrect(g, x, y, w, h, r, style)`, `line(g, x1, y1, x2, y2, w, style)`,
`lg(g, x0, y0, x1, y1, stops)` linear gradient, `rg(g, x, y, r, stops, fx, fy)` radial,
`vol(g, x, y, r, base)` a round form lit from the top-left, `glow(g, x, y, r, color, a)` additive
halo, `bone(g, x1, y1, x2, y2, w, col)`.

Creature helpers: `P.evil(g, x, y, r, col, rot)` a slanted glowing eye (no cute highlight);
`teeth(g, x0, y0, x1, y1, n, len, dir, col)`; `claws(g, x, y, angle, n, len, w, col)`;
`limb(g, x1, y1, x2, y2, w1, w2, col)` a tapering segment with a dark underside;
`rag(g, x0, y0, x1, y1, n, drop, col)` a torn hem; `P.horn2(...)` a slender horn; `P.skull(g, x, y, r, bone, eye)`;
`P.flame(...)`. Inside `paint_foes.js` only: `horn(g, x, y, mx, my, tx, ty, w, col)`, `icicle(g, x, y, tx, ty, w, col)`,
`crystal(g, x, y, h, col)`, `coin(g, x, y, r, tilt)`, `barnacles`, `drips`, `cracks` (export one with `P.name = name` to
reuse it elsewhere). `G.shade(col, k)` lightens (k > 0) or darkens (k < 0); `G.rgba(col, a)`.

## What the grading does to your colours

`classicize` runs on every vector painter after drawing:

- brightness falls toward the feet (×1.1 at the top to ×0.78 at the bottom),
- pixels on the top/left edge of the silhouette are lifted ×1.22, bottom/right edge ×0.7,
- colours are quantised to the game palette with fine dither and grit, saturation ×0.78,
  contrast ×1.12,
- a 1-pixel dark rim (`colors.outline` or `#0b0710`) is added outside the silhouette.

So: pick colours a little more saturated than you want to end with; do not draw your own
outer outline; expect the lower third to come out darker, and keep the feet readable; flat
areas pick up grain, which is why a big flat panel reads as "noise" rather than "metal".
`soft: true` skips the grading (translucent ice, glass).

## Readability budget at game size

On a phone the whole world is ~270 units across, so a 26-unit foe is a tenth of the screen
and its head is 5–6 units. Consequences:

- A feature under ~1.5 units across disappears; under 3 units it is a dot. Faces are two eyes
  and a mouth shape; hands are a mitt plus claws.
- The **silhouette and the accent** (glowing eyes, a core, a lantern) carry recognition at
  game size; everything else is texture.
- Dark foes on dark floors: separate by value at the silhouette edge (the grading's rim
  helps) and by one bright accent, never by a light outline.
