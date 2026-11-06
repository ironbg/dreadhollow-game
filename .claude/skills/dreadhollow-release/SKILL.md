---
name: dreadhollow-release
description: Ship a Dreadhollow version — the checks before every push, the web and server deploy, and the Android App Bundle (AAB) for Google Play with its release notes in <bg>/<en-GB> tags. Use for "сглоби AAB", "build the AAB", "release notes", "push this", or before telling the user a version is ready.
---

# Dreadhollow release

**Standing rules.** Build an AAB only when the user asks (or says yes). All changes since the last AAB go into
one version; the version number moves once per AAB. Never touch the upload key or its passwords (CI signs). No
model names in commits or files. Changes to `live.json` server flags need the user's explicit permission.

## Every push (web + server)

1. Changelog: a line per change in the current version's entry of `js/data/changelog.js`, `bg` and `en` (escape
   apostrophes in English: `\'`). Player-facing words, no code.
2. `sw.js`: bump `CACHE` (`dreadhollow-vNNN` + 1) so web players get the new files.
3. Checks, all must pass:
   ```bash
   for f in <changed .js files>; do node --check "$f"; done
   node tools/check-i18n.js            # every t('...') key in both languages
   npx --yes eslint@8 --no-eslintrc --env browser,es2022 --parser-options=ecmaVersion:2022 --global DH,t,click \
     --rule '{"no-undef":"error","no-fallthrough":"error","no-duplicate-case":"error","no-unreachable":"error","no-dupe-else-if":"error","no-const-assign":"error"}' \
     js/ui js/game js/meta js/services js/core js/data js/main.js
   # no name used that is not there; no `case` running into the next (code swallowed by a `//` comment once did that)
   node tools/build-functions.js       # the server's copy of the game code
   node functions/test/engine.js && node functions/test/admin.js && node functions/test/pitpay.js
   ```
   Then, with the game served (`python3 -m http.server 8123` from the repo root), the smoke test, and if fights,
   loot, the run summary or the server check changed, the reward audit (every hero to a victory, each summary
   through the server's own `checkRun`: every line must show `"verdict":null`):
   ```bash
   node .claude/skills/dreadhollow-release/scripts/smoke.js
   node .claude/skills/dreadhollow-release/scripts/rewardaudit.js
   ```
   If the Trials changed (the Dungeon's fights, strength, waves, vaults, the Well), the Dungeon's tests too (every
   line PASS; exit code 1 on a failure):
   ```bash
   node .claude/skills/dreadhollow-release/scripts/dungeon.js
   ```
   Before an AAB, also play fights to their end in the browser (death + Give up, and a victory, with metals and herbs
   picked up): the results window must open and Continue must lead back to the menus. A results window that fails
   leaves the screen on the last frame of the fight, which players report as a freeze.
4. Commit with the session trailer lines; push to the working branch **and** `HEAD:dreadhollow` (the deploy
   branch). The `Deploy web version` workflow publishes the web build and deploys Firestore rules and functions;
   check both jobs succeeded when a change touched `functions/`.

## The AAB (when the user says so)

1. Version: if this is the first AAB since the last one, the version in `js/core/ns.js` (`DH.VERSION`),
   `package.json` and both `"version"` fields at the top of `package-lock.json` must already be the new one, with
   its changelog entry on top. (The versionCode is derived: 1.61.56 → 1061056.)
2. Everything pushed to `dreadhollow`; then run the workflow `android.yml` on ref `dreadhollow` with inputs
   `kind: release`, `check_only: false` (GitHub MCP `actions_run_trigger`). It takes 3–4 minutes; schedule a
   check-in rather than waiting.
3. When it succeeds give the user the run's page (artifact `dreadhollow-release`, at the bottom) and the notes.
4. From then on, new changes go into the next version: bump `ns.js`, `package.json`, `package-lock.json` with the
   first change after the AAB and start its changelog entry.

## Release notes for Play Console

From the version's changelog entries since the last AAB. At most 500 characters per language (count them), short
bullets, the most visible changes first, "Поправки" / "Fixes" for the rest:

```
<bg>
• ...
</bg>
<en-GB>
• ...
</en-GB>
```

## Before telling the user it is done

- The deploy run is green (both jobs) when the server changed; the AAB run is green when an AAB was asked for.
- New store products (`E.products`) exist in Play Console with the same ids, or the user has been reminded.
- Anything the user must do by hand (Play Console, Firestore, AdMob) is listed.

Checklist idea adapted from the launch-checklist and release-checklist skills of Claude Code Game Studios (MIT,
see `.claude/skills/THIRD_PARTY.md`).
