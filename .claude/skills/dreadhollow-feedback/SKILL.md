---
name: dreadhollow-feedback
description: Triage what Dreadhollow's players and testers send (Settings → Send feedback, seen in the admin panel's Messages tab, or pasted as screenshots) — sort each message into bug, mechanic question, balance or idea, give it a severity and priority, find the cause in the code, and write a short, plain reply the developer can send back. Use for "here is the tester's feedback", "check all of this", "what do I answer", or a batch of screenshots of messages.
---

# Dreadhollow feedback triage

Messages come with: date, kind (bug / idea / balance / other), version and platform (Android app or web), hero and
account level. In the admin panel (Settings → Admin panel → Messages) each can be marked Open / Later / Done,
deleted, or used to open the player (profile, refused fights with their reason, purchases, ban, gifts).

**Standing rules.** Reply in Bulgarian unless the player wrote otherwise. Ask before changing a mechanic. Never
name another game; call it "оригиналната игра" if it must be mentioned. No personal data in files or commits.

## 1. Read every message, then sort

For each message write one line: what the player experienced, in their words, then your reading of it.
Players often write in Latin letters ("ne mi dava nagrada"), mix hall numbers with levels ("6-to nivo" = the 6th
hall), and name effects loosely ("potion za invulnerability" = the wraith rune). Decode before judging.

| Class | Meaning | Typical action |
|---|---|---|
| **Bug** | The game does something its own rules say it should not | Find the cause, fix (bug fixes need no permission, but say what changes) |
| **Mechanic question** | Works as designed; the player did not know how | Explain in the reply; consider an in-game hint |
| **Balance** | Works, but too strong / weak / cheap / slow | Numbers from the `dreadhollow-balance` skill; propose, ask |
| **Idea** | A wish | Note it; say whether it fits; ask the developer |

Severity (impact): **S1** crash, lost progress, purchase or reward lost, cannot continue · **S2** a feature broken,
wrong result that matters · **S3** wrong but with a workaround · **S4** cosmetic, text.
Priority: **P1** now (S1, anything about money, rewards or saves, or a regression in the last version) · **P2** in
the next version · **P3** later · **P4** will not do (say why).

## 2. Find the cause before answering

- Check the version: an old build may already be fixed (`js/data/changelog.js` lists what each version changed).
- Rewards missing: the player's refused fights in the admin panel (reason: time-beyond-clock, agony, dread, ...);
  `functions/runcheck.js` decides; `settleRun` in `js/meta/meta.js` pays.
- Reproduce in the headless game (Playwright, Chromium pre-installed, `python3 -m http.server 8123`): build the
  situation in a `DH.Run`, step it, read the result. Keep scripts in the scratchpad.
- Patterns: three or more messages about one system, or two S1/S2 in one area, means a deeper look at that
  system, not three separate patches. A message about something a recent change touched is a regression: P1.

## 3. Output

```
## Feedback triage — <date>, <n> messages
| # | Player said (short) | Class | S | P | Cause (file:line) | Proposed action |

Replies to send (one per message, ready to paste):
1. <2–4 sentences: thanks, what happens and why, what will change and when, or how to use it>

Needs the developer's decision: <mechanic or balance changes, with options>
```

Replies: short and concrete, no code words, no blame; promise only what is decided ("ще го оправим в следващата
версия" only for bugs you will fix). After the developer decides: fix, add changelog lines (bg and en), follow the
release routine, and suggest marking the messages Done in the admin panel.

Severity / priority scheme adapted from the bug-triage skill of Claude Code Game Studios (MIT, see `.claude/skills/THIRD_PARTY.md`).
