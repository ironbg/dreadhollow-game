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
| `purchase` | A Google Play purchase: the token is checked with Google (`play.js`), delivered once, tied to the account |
| `adReward` | AdMob's server-side verification callback (`ads.js`): each watched rewarded ad becomes a ticket |
| `reset`, `wipe` | Start over; delete everything the server holds for an account |

The game uses it when `live.json` has `"server": true` (and every player, guests included, has a Firebase account:
guests get an anonymous one). With `"server": false` the same actions run on the device, as before.

## Tests

    node tools/build-functions.js && node functions/test/engine.js
    npx firebase-tools emulators:exec --only auth,firestore,functions --project demo-dreadhollow "node functions/test/emulator.js"

In the browser, `index.html?emu=1` on localhost talks to the emulators.

## Going live

1. Firebase: Blaze plan (with a budget alert), Authentication → Anonymous on.
2. Google Cloud → IAM: the GitHub service account (the key in the `FIREBASE_SERVICE_ACCOUNT` secret) needs Editor,
   Cloud Functions Admin, Cloud Run Admin, Service Account User and Firebase Rules Admin; the default compute service
   account (`553225221148-compute@developer.gserviceaccount.com`, which builds and runs the functions) needs Cloud Build
   Service Account. The `backend` job in `.github/workflows/deploy-web.yml` then deploys rules and functions on every push.
3. `live.json`: `"server": true`.

Purchases: enable the *Google Play Android Developer API* in the project, and invite the functions' service account
(the default compute one above) in the Play Console (Users and permissions) with *View financial data* and *Manage
orders and subscriptions*. Until then purchases wait on the player's phone and are delivered once the check works.

Rewarded ads: in AdMob, each rewarded ad unit → Server-side verification → callback URL
`https://europe-west1-dreadhollow-b49c7.cloudfunctions.net/adReward`, then `live.json` `"ads": { "verify": true }`.
