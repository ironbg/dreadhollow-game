# Pixel-art sources

Build scripts for the sprites in `js/core/paint_pixel.js`, drawn with the pixel-art studio skill
(`.claude/skills/pixel-art-studio`). Each script is the source of truth for its sprite: edit it, never the packed data.

Rebuild a sprite (work in a scratch folder, the outputs are not kept in the repo):

    python3 tools/pixel/sunkknight.py        # writes sunkknight.png, sunkknight_f2.png, previews, a GIF
    python3 tools/pixel/export_js.py sunkknight sunkknight.png,sunkknight_f2.png 46 56 35 "description"

(add grade: false to the printed painter options for clean cel art that carries its own outline), then paste the printed `G.pixelPainter(...)` block (`sunkknight.js.part`) into `js/core/paint_pixel.js`.
The canvas is the game's sprite cell: (painter w + 3) x (painter h + 3) units at 2 px per unit.
