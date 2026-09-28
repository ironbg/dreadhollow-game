/* Copies the game into www/: the folder Capacitor packs into the Android app
 * and the one the web version is deployed from. No bundling: the files ship as they are.
 * Usage: node tools/build-www.js */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(root, 'www');
const FILES = ['index.html', 'legal.html', 'manifest.webmanifest', 'sw.js', 'live.json', 'css', 'js', 'assets'];
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
FILES.forEach((f) => fs.cpSync(path.join(root, f), path.join(out, f), { recursive: true }));
// app-ads.txt: AdMob checks it at the root of the developer website given in the Play listing (added once the AdMob
// account exists: google.com, pub-…, DIRECT, f08c47fec0942fa0)
if (fs.existsSync(path.join(root, 'app-ads.txt'))) fs.copyFileSync(path.join(root, 'app-ads.txt'), path.join(out, 'app-ads.txt'));
// live.json: the newest web version is the one being built
const live = JSON.parse(fs.readFileSync(path.join(root, 'live.json'), 'utf8'));
live.web = Object.assign({}, live.web, { latest: require(path.join(root, 'package.json')).version });
fs.writeFileSync(path.join(out, 'live.json'), JSON.stringify(live, null, 2) + '\n');
// the app's build kind (DH_BUILD=debug|release): test phones must never show real ads
const kind = process.env.DH_BUILD;
if (kind) {
  if (!['debug', 'release'].includes(kind)) throw new Error('DH_BUILD must be debug or release');
  const ns = path.join(out, 'js/core/ns.js'), src = fs.readFileSync(ns, 'utf8');
  if (!src.includes("DH.BUILD = 'web';")) throw new Error('js/core/ns.js: DH.BUILD line not found');
  fs.writeFileSync(ns, src.replace("DH.BUILD = 'web';", "DH.BUILD = '" + kind + "';"));
}
const count = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(d, e.name)) : 1), 0);
console.log('www/ ready: ' + count(out) + ' files' + (kind ? ' (' + kind + ' app)' : ''));
