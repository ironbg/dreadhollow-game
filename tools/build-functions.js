/* Copies the game's economy code into functions/game/, so the server runs exactly the rules the game runs.
 * firebase.json runs it before every functions deploy. Usage: node tools/build-functions.js */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(root, 'functions', 'game');
const FILES = ['core/ns.js', 'i18n/i18n.js', 'i18n/en.js', 'data/content.js', 'data/economy.js', 'data/artifacts.js', 'data/deeds.js', 'core/save.js', 'meta/meta.js', 'meta/actions.js'];
fs.rmSync(out, { recursive: true, force: true });
FILES.forEach((f) => { fs.mkdirSync(path.dirname(path.join(out, f)), { recursive: true }); fs.copyFileSync(path.join(root, 'js', f), path.join(out, f)); });
fs.copyFileSync(path.join(root, 'live.json'), path.join(out, 'live.json'));
console.log('functions/game ready: ' + FILES.length + ' files and live.json');
