# Creature design for Dreadhollow

## The brief

Before a single path, write:

1. **The sentence** a player would say on seeing it: "a drowned knight with a trident".
2. **The signature**: the one or two things only this creature has (the bell for a head, the
   chest-lid jaw, the coral crest). Put them on the silhouette.
3. **The break**: what sticks out of the body mass — weapon, horns, wings, tail, lantern. A
   silhouette with no break is a potato.
4. **The mechanic, visible**: the gargoyle is stone and folded while perched; the frost guard
   shatters its ice at half health; the mimic is a shut chest until it springs. If the game
   gives the unit a state, the model shows it (a frame pinned with `e.fr` or a `variant`).
5. **The hall**: its palette and material (below).

## Silhouette and shape language

- **Squint test**: the silhouette alone must name the creature and set it apart from every
  other unit in the same hall. Two units in one hall must not share a silhouette type.
- **Shape language**: sharp triangles and hooks read dangerous (fiends, blades, claws); blocks
  and squares read heavy and slow (golems, constructs, knights); circles and sacks read soft or
  bloated (oozes, bloaters, homunculi). Mix them on purpose: a round body with hooked claws.
- **Proportion carries size**: bosses have small heads for their mass (heavy, huge); small
  foes have big heads and short limbs (fast, many). A 60-unit boss drawn with regular-foe
  proportions reads as a big regular foe.
- **Asymmetry**: a weapon in one hand, one pauldron bigger, a torn side of the cloak. A mirror
  image reads as a mannequin.

## House style (what the user has asked for)

- Dark, gaunt, menacing; glowing eyes without cute highlights (`P.evil`); claws, fangs, rags.
- **Every unit has its own model — no recolours** of another unit. Variants are only for states.
- **No saw-tooth rows** of spikes along a silhouette; use a few deliberate horns, crests or
  shards instead.
- Detail at one-unit scale is welcome if it follows the forms; noise and flecks are not.
- The user judges by eye and prefers the game's own vector look over pixel-by-pixel sprites.
- Never name, describe or allude to any other game anywhere.

## The halls

| Hall | Material and mood | Palette cues |
|---|---|---|
| Crypt | bone, rusted iron, grave cloth; undead | bone `#d8ccaa`, iron greys, violet magic `#9a70ff` |
| Abyss | charred flesh, ash, magma; fire | ember `#ff7a20`, soot `#241a18`, yellow cores `#ffd040` |
| Aqueduct | wet stone, verdigris, kelp, barnacles; drowned | teal glow `#70ffd0`, sea greens, weathered stone greys |
| Catacombs | ice, frost, pale hide; frozen | ice `#9fd8ff`, deep blue shadows, white rims |
| Halls of Discord | crystal, void, stitched flesh, brass; unnatural | violet `#b050ff`, magenta `#ff60d0`, brass `#b08a3a` |
| Blightmire | rot, bog, fungus, kelp-green water; plague | bile `#b0d040`, mud browns, sickly yellow eyes |
| Reliquary | gold, jewels, velvet, vault iron; greed | gold `#e8b830`, crimson cloth `#6a1a24`, pale light `#fff0a0` |

## Common failures seen in this project

- **The box**: a torso that is one flat rectangle (the old sunken knight, the frost construct).
  Break it into ribcage, waist and pelvis, or into overlapping plates with lit edges.
- **The lost signature**: coins that shrink to confetti (coin wraith), treasure invisible inside
  a jelly (gilded ooze). The signature must survive the in-game size.
- **The unreadable weapon tip**: a trident whose head reads as a glove or a flame. Weapon heads
  are silhouette breaks: make their shape unambiguous and give them the one hard edge.
- **Toy proportions**: a big round head on a small body makes a boss cute. Shrink the head,
  widen the shoulders.
- **Buttons**: small round spots evenly spread (barnacles, rivets, sores) read as buttons or
  stars. Cluster them, vary their size, and give each a shadow side.
