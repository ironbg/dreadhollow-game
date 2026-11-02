---
name: dreadhollow-liveops
description: Plan and run Dreadhollow's live game — events (collect events with their shop), leaderboards, news, gifts to everyone, maintenance, minimum versions, the Battle Pass season and the daily/weekly/monthly rhythm — through live.json and the admin panel's Live tab. Includes a fairness check for offers and rewards. Use for "make an event", "plan the next month", "compensate the players", "announce something", "is this offer fair", or retention questions.
---

# Dreadhollow live ops

## Where the live game is set

- **`live.json`** (repo root, published with the web build): `web` / `app` version rules, `server`, `ads`, `boards`
  (leaderboards), `events` (collect events). Its `_about` field documents every key. Editing it needs a push;
  **server flags (`server`, `ads.verify`, minimum versions) need the user's explicit permission.**
- **Admin panel → Live** (Settings → Admin panel): an override kept in Firestore (`config/live`) whose keys replace
  live.json's, live at once for the server and for app 1.61.55+ (older apps read the plain file). Ready forms for
  maintenance, versions, ads, **news** (`news: [{ id, title, text, start, end }]`, shown once per player) and
  **gifts to everyone** (`gifts: [{ id, title, msg, reward, start, end }]`, given once per player at their next
  visit). Texts are one string for every language. Everything else as JSON (with a confirmation).
- **One player:** Admin panel → Players → a gift with a message, set values, ban, clear refused fights.
- Times are UTC in live.json; the game's own day is midnight in Sofia (`U.gameDate`).

## The rhythm the game already has

Daily: missions + activity chests, the free resource-store reward and its ads, Vigil, the free chest, daily deals.
Weekly / monthly: the sign-in calendars (premium row with the Battle Pass). Season: the Battle Pass (60 levels,
bonus rewards after, premium perks). Events: collect events (tokens from fights spent in their shop), each with
`earn` rates and a `shop` of rewards; leaderboards by metric and period.

## Planning an event or a month

1. Goal first: bring players back (D1/D7/D30), give a reason to try a hall or hero, test a feature, compensate.
2. Pick the type: **collect** (exists), a **leaderboard** (exists), a **gift** or **news** (admin panel). A new
   event type is new code: propose it and ask.
3. Pace it: rewards spread over the whole window (daily beats), not front-loaded; the top reward reachable by a
   regular player in about 70% of the window; a late joiner can still get the main reward.
4. Price it with the `dreadhollow-balance` numbers: what a fight pays now, what the shop items are worth (chest
   cost per piece, gems per $), and make sure the event does not undercut the store or flood a sink.
5. Write the JSON (copy an existing event's shape), check the dates, show it to the user, and only then save it in
   the admin panel (or live.json with a push). Test it first in the headless game with `DH.live.config` set.
6. Fallback: how to stop or extend it (remove or change the override), and a compensating gift if it breaks.

## Fairness check (every offer, pass reward or event shop)

- Everything that changes how strong a hero is can be earned without paying (more slowly is fine).
- No pressure tricks: honest timers, no fake discounts, the odds shown for random rewards (the Drop rates window).
- Paid packs give more per $ the larger they are; a bundle is worth more than its gems alone.
- Compensation after an outage or a bug reaches everyone affected and says why.

## Metrics to look at (admin panel → Dashboard)

Players a day (Android / web), new accounts, fights, minutes played, purchases by product, open messages, refused
fights, versions in use. Watch the day after an event starts and ends; a drop in fights or a rise in refused
fights after a release is a regression to investigate first.

Adapted from the live-ops-designer agent of Claude Code Game Studios (MIT, see `.claude/skills/THIRD_PARTY.md`).
