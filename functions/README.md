# Dreadhollow's server

The player's profile lives in Firestore (`players/{uid}`) and only these Cloud Functions change it. They run the
game's own economy code (`js/meta/meta.js`, `js/meta/actions.js` and the data files), copied into `functions/game/`
by `tools/build-functions.js`, so the server and the game always apply the same rules.

| Function | What it does |
|---|---|
| `sync` | Takes the device's free fields (settings, on-screen choices); the first call brings the profile in, with ceilings |
| `act` | One action from `js/meta/actions.js`, run on the server's copy |
| `runStart` | Pays the torches and notes the time, hall, hero, Agony and Artifacts of a fight |
| `runEnd` | Checks the fight's summary against that (`runcheck.js`) and only then settles it; leaderboards are written here |
| `reset`, `wipe` | Start over; delete everything the server holds for an account |

The game uses it when `live.json` has `"server": true` (and every player, guests included, has a Firebase account:
guests get an anonymous one). With `"server": false` the same actions run on the device, as before.

## Tests

    node tools/build-functions.js && node functions/test/engine.js
    npx firebase-tools emulators:exec --only auth,firestore,functions --project demo-dreadhollow "node functions/test/emulator.js"

In the browser, `index.html?emu=1` on localhost talks to the emulators.

## Going live

1. Firebase: Blaze plan (with a budget alert), Authentication → Anonymous on.
2. Google Cloud → IAM: the GitHub service account needs Firebase Rules Admin, Cloud Functions Admin and Service
   Account User. The `backend` job in `.github/workflows/deploy-web.yml` then deploys rules and functions on every push.
3. `live.json`: `"server": true`.
