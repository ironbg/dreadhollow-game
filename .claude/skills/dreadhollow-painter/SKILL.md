---
name: dreadhollow-painter
description: Draw or redraw Dreadhollow's own models — the vector canvas painters in js/core/paint_*.js (enemies, bosses, Lords, heroes, summons, props) — so they read clearly and look good at game size. A staged ladder (brief, silhouette, two values, form, light, detail) with a check on a real render after every stage, and a blind describer that must recognise the creature before a model ships. Use for any new model, any "this model looks bad / redraw number N / make it scarier / more detail" request, and any review of the gallery. Not for pixel-by-pixel PNG sprites (pixel-art-studio) or for copying a reference image by hand (drawing).
---

# Dreadhollow painter

Every model in the game is a **painter**: a function that draws one creature with canvas
paths in world units, facing right, two frames of a walk. The engine rasterises it at
`G.CPX` = 2 px per unit, grades it (key light top-left, bevelled edges, fine grain, a dark
rim) and the world is shown with nearest-neighbour scaling. You write every shape; this skill
is how to decide where the shapes go and how to catch what is wrong before the user does.

The standing failure of this project is not bad code, it is **models that do not read**: a
knight that is a grey box with a ball for a head, a construct that looks like a toy, a coin
wraith whose coins vanish, barnacles that look like buttons. Each of those passed "it renders
without errors". The ladder below exists so that each of them fails a gate first.

Read `references/painter-api.md` before the first painter of a session (conventions, helpers,
file layout, what the grading does to colours). Load the others when a gate fails:
`references/light-and-tone.md` (values, light, edges), `references/anatomy.md` (figures,
beasts, heads, hands, joints), `references/creature-design.md` (silhouette, signature, shape
language, the halls' palettes, and what the user has asked for so far).

## The check tool

```bash
NODE_PATH=$(npm root -g) node .claude/skills/dreadhollow-painter/scripts/paintcheck.js OUT name[:variant] [...] [--scale 5]
```

Loads the game straight from `index.html` (no server) and writes to `OUT/`:

- `sheet.png` — per painter: **in-game size**, both frames magnified, the **silhouette** (flat
  dark) and the **notan** (two values split at the median brightness). Read it every stage.
- `blind_N.png` — frame 1 magnified with nothing written on it, for the blind describer.
- `stats.json` — size, fill, brightness mean/contrast, and `lightTLminusBR` (top-left minus
  bottom-right brightness: our key light is top-left, so it should be clearly positive).

Put `OUT` in the session scratchpad, never in the repository. For the model among its peers use
the hall gallery (a sheet of every painter of that hall) and one in-game screenshot.

## The ladder

A stage may not begin until the previous gate is true **on a render you looked at**. Fixing
a silhouette at stage 1 is one edit; fixing it after the detail pass is a rewrite.

| # | Stage | You produce | Gate (on `sheet.png`) |
|---|---|---|---|
| 0 | **Brief** | A few lines in your notes: what it *is* in one sentence a player would say; its **signature** (the one or two features that make it this creature and no other); its **silhouette break** (the part that sticks out of the body mass: weapon, horns, wings, tail); size in units and `cy` (feet line); 3–5 material colours as `colors` keys; how its mechanic shows (the gargoyle's folded wings when perched, the mimic's shut lid) | You can say the sentence, the signature is visible from outside the body, and the model differs from every other model in its hall by silhouette, not by colour |
| 1 | **Silhouette** | Only the big masses in one flat colour: body, head, limbs, the break. No detail, no shading | The **silhouette** panel names the creature and its pose. The signature is in the outline. Limbs have ground between them and the body. Nothing is a box or an egg unless the creature is one |
| 2 | **Two values** | Each mass gets its lit colour and its shadow colour, flat, from the top-left light | The **notan** panel still reads. Light on the top-left planes, shadow down the right and under every overhang. No mass is split into two stripes |
| 3 | **Form** | Planes and joints: where the limb bends, where the head meets the neck, where the armour plates overlap; `P.limb` tapers, `P.vol` on round forms | Joints read as breaks, limbs are widest at the root, overlapping forms show which is in front. See `anatomy.md` |
| 4 | **Light** | Core shadow, occlusion (the darkest note, where forms touch), one highlight family, one **accent** (eyes, a glowing core, a rune) | `lightTLminusBR` > 0; reflected light never as light as a halftone; exactly one accent draws the eye |
| 5 | **Detail** | Texture and small parts, placed on forms, at a scale that survives the in-game size | The in-game panel still reads (squint at it). Detail sits inside forms and follows them. No saw-tooth rows, no confetti |
| 6 | **Blind read** | Run the describer (below) on `blind_N.png` | Its answer 1 matches your brief sentence; its answer 3 contains your signature; nothing in answer 4 that you cannot defend |
| 7 | **In the game** | Screenshot in its hall, among its peers | Separates from the floor and from the other foes at a glance; its animation frames move the right parts |

Walk frames: frame 0 and frame 1 are the two contact poses. Move the legs and the
secondary parts (cloak, hair, chains, a swinging lantern) by 1–2 units; keep the head and
the torso steady. A model whose frames differ only by a few pixels in one place looks frozen.

## The blind describer

The strongest check in this skill. You cannot see your own drawing fresh; a reader who has
never seen your brief can. Launch a subagent (the Agent tool, general-purpose) with only the
image path and these instructions, and **never** the painter's name, the brief, the hall, or
a file name that gives it away (that is why `blind_N.png` is numbered):

> Open this image with the Read tool: `<path>/blind_N.png`. It is one enemy sprite from a
> dark-fantasy top-down action game, magnified. Judge only what is visible; do not read any
> other file or use file names as clues. Answer in one or two sentences each:
> 1. What is it (as specifically as you can)? 2. What is it holding, wearing or carrying?
> 3. The three features that stand out most, in order. 4. What is unclear, confusing or badly
> drawn? Name the parts. 5. What mood or theme does it suggest?

Several models can go to several describers in parallel. Pass means answer 1 names the
creature (or something a player would accept as it), answer 3 contains the signature, and
answer 4 lists nothing about the signature. A describer that says "robot" for a sunken knight or
"blob" for a gilded ooze has told you what the player sees. Redraw at the lowest stage the
complaint points to, then run a *new* describer (a reused one has seen the old picture).

## Delivering

- Show the user a before/after sheet (old and new side by side, in-game size included) and
  the in-game screenshot. They judge by eye, and their taste decides: when they reject a
  direction, go back to what they liked, do not argue with the verdict.
- Work in the existing painter files; keep a model's name, `colors` keys and frame count so
  nothing else in the game changes. `node --check` the file, run the smoke test, then the
  release routine of the repository (version bump, commit, push, publish).
- Never name or describe any other game in code, comments, commits or chat.
