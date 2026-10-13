# Light, value and edges

Adapted for canvas painters from the `drawing` skill's `light.md` and `tone.md`
(jchapuis/drawing-skill, MIT — see `ATTRIBUTION.md`).

## One light, top-left

Every model in the game is lit from the top-left and the grading assumes it. Planes facing
up-left are lightest; planes facing down-right and the undersides are in shadow.
`paintcheck`'s `lightTLminusBR` measures it: a negative number means the model is lit from the
wrong side (usually a dark cape on the left and a pale weapon on the right).

## The zones, lightest to darkest

| Zone | Rule |
|---|---|
| **Highlight** | A reflection of the source. Only on shiny things: wet armour, eyes of a beast, glass, polished gold. Absent on cloth, stone and skin |
| **Centre light** | The plane facing the light most squarely |
| **Halftones** | Planes partly facing the light; most of the lit area |
| **Terminator** | Not a value: the boundary where a surface stops facing the light |
| **Core shadow** | The darkest band of the form shadow, just past the terminator |
| **Reflected light** | Bounce inside the shadow. **Never as light as any halftone** — the most common way to flatten a form |
| **Occlusion / contact** | Where forms touch and all light is blocked: armpits, under a pauldron, where a head meets a collar, feet on the ground. **The darkest note in the model** |

## Two families first

**The lightest value in shadow is darker than the darkest value in light; the two families
never overlap.** Before any gradient, every mass is one flat lit value and one flat shadow
value — that is the notan panel of `paintcheck`, and if the notan does not read, no amount of
rendering will save the model. Then place the terminator as a shape (it bends with every plane
on an organic form), then the core shadow, then occlusion, then halftones, then the accent.

## Shift the hue, not only the value

A shadow that is only the same colour made darker (`G.shade(col, -k)`) reads as dirt, or as a
brightness slider: it is the commonest sign of flat, lifeless shading. Light changes hue as well
as value:

- **Shadows lean cool**: toward blue-violet, and lose a little saturation. A red cloak's shadow
  goes toward wine-purple, not toward brown-black; bone's shadow toward grey-lilac, not mud.
- **Lights lean warm**: toward yellow-orange, and gain a little saturation. Our key light is a
  torch, so its lit planes are warm; a cold-lit hall (the catacombs) inverts this, and its
  shadows lean warm against cool light.
- **Reflected light and the accent are the exceptions**: bounce takes the colour of what it
  bounced from (the floor, a glowing core), and an accent (eyes, a rune) keeps its own hue.

`G.hueShade(col, k)` does this with the same amounts as `G.shade`: `G.hueShade(c, -0.3)` for a core
shadow, `G.hueShade(c, 0.25)` for a lit plane. Use it for the shadow and light families of every new
mass; keep `G.shade` for small steps inside one family (a crease in a lit plane), where a hue
jump would look like a second material. Check on `sheet.png` that the shadow side still reads as
the same material as the lit side; if it reads as a different cloth, the shift is too strong
for that colour (dark, already-cool colours need less).

## Planes, not blends

Value follows **orientation**, not distance. Give each plane one flat value by its angle to the
light first; a gradient laid over everything erases the planes and reads as mush. Boxes before
curves: a box face is one value with a hard jump to the next. A cylinder (limb, spear, neck)
has a terminator running **along** its axis. A sphere (head, pauldron, belly) bunches its value
steps near the terminator, not evenly across the lit face — which is what `P.vol` does.

## The stripe failure

A narrow band of darker colour laid across a form reads as **a stripe on it**, not as the form
turning. A shading band must have one edge hidden inside the dark it runs into: start it in the
core shadow or the neighbour's shadow and let it run out into the light. Two parallel bands on
a limb read as two thin limbs.

## Edges

Sharp (a sudden plane change), firm, soft, lost. **One hardest edge, at the focal point** —
the eyes, the weapon's head, the glowing core — and grade the rest down from it. Let two or
three edges per form go soft or lost where similar values meet; hard edges everywhere is the
colouring-book look.

## Value count

Count the values the model needs: usually five or six. Give the shadow family at least two and
the light family at least two; one each and the model goes flat. Keep **one accent** — the
single saturated or extreme value (the visor's glow, a lantern, a crystal core) — and give it
one small area. Two accents compete; the describer will name the wrong one.

## Cast shadow

The engine draws the ground shadow. Inside the model, a cast shadow (a hat brim on a face, a
pauldron on an arm) is hard near the thing casting it and soft away from it.
