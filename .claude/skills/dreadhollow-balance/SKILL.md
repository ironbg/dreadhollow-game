---
name: dreadhollow-balance
description: Check Dreadhollow's balance from its own data and code — ability power (outliers against their group), the economy (where gold, gems and metals come from and go to, store value, chest odds, forge, Shrine, Well, Battle Pass), progression (account and run levels, hall difficulty) and loot (rarity odds, auto-equip, duplicates). Gives numbers, names the likely culprits, proposes fixes and never changes a mechanic without asking. Use for "this is too strong / too weak / too cheap / too slow", "check the balance", a tester's balance report, or before tuning prices and rewards.
---

# Dreadhollow balance check

The game's numbers live in `js/data/content.js` (abilities, heroes, enemies, halls, traits, items' effects),
`js/data/economy.js` (gear, prices, chests, store, Shrine, Archive, Well, pass, sign-in, missions) and
`js/meta/meta.js` (how a fight is paid, `settleRun`). Behaviour lives in `js/game/` (each ability's `fire()` in
`abilities.js`, damage and effects in `combat.js`, loot in `run.js`). The server runs the same economy code
(`functions/engine.js`), so a number changed in `js/` changes it for everyone at the next deploy.

**Standing rule: ask before changing a mechanic.** Report, propose, wait for the user's choice. Prices and
reward amounts the user asked to change are fine to change; anything else is a proposal.

## 1. Get the numbers (do not estimate what the code can tell)

```bash
node tools/build-functions.js          # functions/game = the current js/
node .claude/skills/dreadhollow-balance/scripts/balance.js abilities   # base DPS of every ability, outliers by group
node .claude/skills/dreadhollow-balance/scripts/balance.js economy     # store, chests, Well, forge, Shrine, Vigil, pass
```

The ability table is a **baseline**: damage x amount / cooldown at pick-up. It leaves out area (how many foes a
hit reaches), pierce, chains, summons' uptime, effects' damage and the special rules in `fire()` (Skyfall drops
one meteor per Amount, Judgment hits everything in its area, a cooldown of 0 means continuous). So an outlier is a
lead: read its `fire()` before calling it broken. For a real reading, measure in a fight (section 3).

## 2. What to check, by domain

**Abilities and builds**
- Outliers within their group (hero weapons, tome abilities, hero-exclusive): x median >= 1.6 or <= 0.5.
- What multiplies on top: traits (`T(...)` in the ability, `C.baseTraits`, `C.elevatedTraits`), ability
  upgrades, items (`js/game/items.js`), Shrine and Archive, Marks, artifacts. Look for a pick that dominates every
  alternative, stacking that grows without a cap (crit over 100% is intended: each full 100% is a sure crit),
  and offers that do nothing for this hero (the level-up pool filters some: `ELEV_NEEDS` in `combat.js`).
- Defence that can make the hero untouchable for long stretches (block, revives, invulnerability windows).

**Economy (faucets and sinks)**
- What one won fight pays in each hall, played and settled by the game itself:
  `node .claude/skills/dreadhollow-balance/scripts/fightpay.js 10` (gold split into fight / time / win bonus,
  metals, herbs, account and pass XP, the victory relic). Pair it with `balance.js economy` for the prices.
- Faucets: fights (`settleRun`: gold, account XP, pass XP, metals, herbs, the victory chest piece), Vigil, daily
  missions and activity chests, sign-in calendars, Battle Pass, events (`live.json` / the admin panel's live
  settings), resource store (free + ads), ads, deeds, store products.
- Sinks: forge levels (gold + metal), Shrine, Archive, Well, potions and brewing, chests, tributes, renames,
  torches, revives.
- Check: does each sink scale with what the faucets give at that stage? Is anything never worth buying? Is
  there a loop that gives more than it costs (buy, merge, salvage, sell back)? Gems per $ should rise with the
  pack size and bundles should beat plain gems without making them pointless.

**Progression**
- Halls: `node .claude/skills/dreadhollow-balance/scripts/hallcurve.js` (expected horde strength per hall at every
  step of `C.timeline`, from the formulas; each hall must be above the one before at every step, and the bosses too)
  and `scripts/halls.js` (the same measured in the game: foes per minute, on screen at once, health, blow; bosses
  there never die, so their summoned helpers inflate the late phases).
- Account level curve, run level curve (`C.xpToNext`), hall difficulty (`C.stages[...]`: hpMult, dmgMult, dmgGrow,
  bossHp, goldMult), Torment and Agony. Look for dead zones (long stretches with nothing new) and walls (a hall
  that a fully geared hero of the expected level cannot clear).

**Loot**
- Rarity odds (`E.chests`, `meta.rollItemRarity`, `openLoot` in `run.js`), pity, duplicates, cost per piece of
  each rarity (the script prints it), auto-equip (`meta.lootBetter`), two rings of one kind (forbidden).

## 3. Measure in a fight when the baseline is not enough

With the game served (`python3 -m http.server 8123` from the repo root):
```bash
node .claude/skills/dreadhollow-balance/scripts/measure.js 30            # every ability, 30 s in each field
node .claude/skills/dreadhollow-balance/scripts/measure.js 30 skyfall halo  # some of them
```
It measures damage per second at pick-up against one foe 25 units away and against a ring of 30, both standing
still. Orbiting and arcing abilities (scythes, axes, shards, orbs) can show 0 against the single foe only because
their path misses that one spot; read those from the crowd column. For anything else, build it yourself:
use the headless game (Playwright, the pre-installed Chromium).
In the page: `DH.server.remote = () => false`, build a `new DH.Run({ hero, stage })`, `addAbility(id)`, spawn foes,
step `run.update(1/30)` with `player.inv` kept high, then read `run.dmgByAb` (damage per ability) and `run.time`.
Compare abilities under the same conditions (same hero, same foes, same time). Keep scripts in the scratchpad.

## 4. Report

```
## Balance check: <domain>
Sources: <files and script output used>
Verdict: HEALTHY | CONCERNS | CRITICAL (a dominant choice, a broken progression, a loop with no sink) | NOT ASSESSED (say what data was missing)

Outliers            | value | group median / target | why it matters
Degenerate builds   | how it works | why it is a problem
Economy flow        | faucet vs sink at early / mid / late
Proposals (ranked)  | change | expected effect | mechanic or number?
```

A section with no data is NOT ASSESSED, never a pass. Then ask which proposal to make. After a change: rerun the
script, the smoke and reward audits the repository uses, `node tools/build-functions.js`, `node functions/test/engine.js`,
add a changelog line (bg and en) and follow the release routine.

Method adapted from the balance-check skill of Claude Code Game Studios (MIT, see `.claude/skills/THIRD_PARTY.md`).
