/* In-run UI: HUD, level-up (traits + potions), tomes, loot, the Well, pause, revive, results. */
(function (DH) {
  'use strict';
  const U = DH.util, h = U.h, E = DH.economy, C = DH.content, A = DH.art, ui = DH.ui;
  const click = () => DH.audio.play('click');

  /* ---------------- descriptions ---------------- */
  ui.fmtMods = (m, k) => Object.keys(m).map((key) => {
    const v = m[key] * (k == null ? 1 : k);
    if (C.UNIQUE_MODS.includes(key)) return t('mod.' + key);
    const pct = ['dmgPct', 'as', 'area', 'duration', 'speed', 'ms', 'burn', 'spark', 'frost', 'decay', 'fragile', 'affliction', 'crit', 'blockDmg', 'stun'].includes(key);
    return t('mod.' + key, { v: pct ? Math.round(v * 100) : Math.round(v * 10) / 10 }).replace('+-', '−'); // trade-offs read '−25% …'
  }).join(' · ');
  const ARROW = ['↗', '↑', '⇈'];
  ui.choiceInfo = (run, c) => {
    if (c.kind === 'base') {
      const af = (run.hero.affinity || {})[c.id]; const a = af == null ? 1 : af;
      return { icon: 'tr_' + c.id, name: t('trait.' + c.id), desc: ui.fmtStats(C.baseTraits[c.id].per, C.AFFINITY[a]), tag: t('lv.base') + ' ' + ARROW[a], tcls: 'aff' + a };
    }
    if (c.kind === 'elev') return { icon: 'tr_' + c.id, name: t('trait.' + c.id), desc: ui.fmtStats(C.elevatedTraits[c.id].per), tag: t('lv.elevated'), tcls: 'elev' };
    if (c.kind === 'cls') {
      const ct = C.heroes[c.hero].ct[c.cat][c.v], sis = C.heroes[c.hero].ct[c.cat][1 - c.v];
      const parts = []; if (Object.keys(ct.w).length) parts.push(ui.fmtMods(ct.w)); if (Object.keys(ct.s).length) parts.push(ui.fmtStats(ct.s));
      return { icon: c.hero === run.heroId ? 'h_' + c.hero : 'm_' + c.hero, name: t('ct.' + ct.k), desc: parts.join(' · '),
        tag: t('lv.class.' + c.cat) + (c.hero !== run.heroId ? ' · ' + t('lv.mark', { hero: t('hero.' + c.hero + '.name') }) : ''), tcls: 'cls',
        note: c.rank === 1 && !c.sister ? t('lv.sister', { name: t('ct.' + sis.k) }) : null };
    }
    if (c.kind === 'ab') {
      const T = C.abilities[c.ab].traits[c.idx];
      return { icon: 'ab_' + c.ab, ab: c.ab, name: t('ab.' + c.ab + '.name') + ': ' + t('at.' + T.k), desc: ui.fmtMods(T.m), tag: t('lv.ability'), tcls: 'abt' };
    }
    if (c.kind === 'up') return { icon: 'ab_' + c.ab, ab: c.ab, up: c.id, name: t('ab.' + c.ab + '.name') + ': ' + t('up.' + c.id), desc: ui.fmtMods(C.UPGRADES[c.id]), tag: t('lv.upgrade', { n: ['', 'III', 'VI', 'IX'][c.tier] }), tcls: 'upg' };
    if (c.kind === 'ability') { const d = C.abilities[c.id]; return { icon: 'ab_' + c.id, ab: c.id, name: t('ab.' + c.id + '.name'), desc: t('ab.' + c.id + '.desc'), tag: d.tags.filter((x) => !DMG_TYPES.includes(x)).map((x) => t('tag.' + x)).join(' · '), tcls: 'abt' }; } // the damage types get their own coloured line
    if (c.kind === 'edge') return { icon: 'a_edge', name: t('stat.' + c.stat), desc: ui.fmtStats({ [c.stat]: c.v }), tag: t('artifact.edge.name'), tcls: 'upg' };
    if (c.kind === 'gold') return { icon: 'i_gold', name: t('levelup.gold'), desc: '+' + c.amount };
    return { icon: 'heart', name: t('levelup.heal'), desc: t('levelup.healDesc') };
  };

  /* The damage types of an ability, each in its own colour, in a small line under its name: those it deals now, then,
   * fainter and in brackets, those an upgrade can still add and the ability level that offers it. Out of a fight (no
   * run) every reachable type is shown; in one, the choices already made are counted. upId: an upgrade card, whose
   * own new types are shown as gained (+) instead. */
  const DMG_TYPES = ['physical', 'magic', 'fire', 'lightning', 'ice'], ROMAN = { 3: 'III', 6: 'VI', 9: 'IX' };
  const upGives = (u) => {
    const ut = C.UPGRADE_TAGS[u] || {}, out = [];
    (ut.add || []).forEach((x) => out.push({ type: x }));
    if (ut.swap) out.push({ type: ut.swap[1], swap: ut.swap[0] });
    ((C.UPGRADE_HITS || {})[u] || []).forEach((x) => out.push({ type: x }));
    return out.filter((o) => DMG_TYPES.includes(o.type));
  };
  ui.abTypes = (id, run, upId) => {
    const def = C.abilities[id]; if (!def) return null;
    const own = run && run.abilities.find((a) => a.id === id), taken = (run && run.traits.up[id]) || [];
    let cur = (own && own.tags ? own.tags : def.tags).filter((x) => DMG_TYPES.includes(x));
    const later = [], gain = upId ? upGives(upId) : [];
    (def.ups || []).forEach((tier, ti) => {
      const chosen = tier.some((u) => taken.includes(u));
      for (const u of tier) for (const g of upGives(u)) {
        if (taken.includes(u)) { if (!cur.includes(g.type)) cur = cur.concat(g.type); continue; } // already won (its extra hit)
        if (chosen || upId) continue; // that tier went another way (the leftover only returns at IX with a Signet); an upgrade card shows its own gain
        if (cur.includes(g.type) || later.some((l) => l.type === g.type)) continue;
        later.push(Object.assign({ lv: C.UPGRADE_LEVELS[ti] }, g));
      }
    });
    const el = h('div.abtypes');
    cur.forEach((x) => { if (!gain.some((g) => g.swap === x)) el.append(h('span.dt.dt-' + x, t('tag.' + x))); });
    gain.forEach((g) => { if (!cur.includes(g.type)) el.append(h('span.dt.gain.dt-' + g.type, '+' + t('tag.' + g.type))); });
    // the ones within reach: grouped by the level that offers them, "Fire · Ice · Lightning (level VI)", each in its colour
    const groups = []; later.forEach((l) => { const k = l.lv + (l.swap ? 's' : ''); let gr = groups.find((x) => x.k === k); if (!gr) groups.push(gr = { k, lv: l.lv, swap: l.swap, list: [] }); gr.list.push(l.type); });
    groups.forEach((gr) => {
      const sp = h('span.dt.later'); if (gr.swap) sp.append('→ ');
      gr.list.forEach((x, i) => { if (i) sp.append(' · '); sp.append(h('span.dt-' + x, t('tag.' + x))); });
      sp.append(' ' + t('abtype.lv', { n: ROMAN[gr.lv] || gr.lv })); el.append(sp);
    });
    if (!el.childNodes.length) el.append(h('span.dt.notype', t('abtype.none'))); // e.g. the Plague Flask: no type bonus touches it
    return el;
  };

  /* ---------------- HUD ---------------- */
  const hud = { refs: null, sig: '' };
  hud.build = (run) => {
    const el = document.getElementById('hud');
    el.innerHTML = '';
    const r = hud.refs = {}, desk = DH.input.desktop;
    r.xpFill = h('i'); r.lvl = h('span');
    r.timer = h('div.timer'); r.fps = h('div.fps' + (DH.save.data.settings.showFps ? '' : '.hidden')); fpsN = 0; fpsT0 = 0; fpsLast = 0; fpsWorst = 0; r.kills = h('span'); r.gold = h('span');
    r.build = h('div.build'); r.buffs = h('div.buffs'); r.curse = h('div.cursed.hidden', A.img('u_agony', 'ci'), r.curseT = h('b'));
    // the boss's bar, drawn like the game's own models: its name above, then a bronze rail with spear-tip ends, rivets and a
    // filigree under its middle (a painter, graded and outlined like every sprite), the blood a thin line of pixels inside it
    r.boss = h('div.bossbar.hidden', r.bossName = h('div.n'), r.bossCv = h('canvas.bb-cv'));
    r.agony = run.agonyOn ? h('div.agony', h('span.al', t('hud.agony')), r.agFill = h('div.agbar', h('i')), r.agNum = h('b')) : null;
    el.append(...[h('div.xp', r.xpFill, r.lvl),
      h('div.top', h('div.hbtns',
        h('button.pause', { onclick: () => DH.game.pause(), title: t('pause.title') + (desk ? ' [P]' : '') }, A.img('u_pause'), desk ? h('b.key', 'P') : null),
        h('button.pause.bagbtn', { onclick: () => DH.game.openBag(), title: t('inv.title') + (desk ? ' [I]' : '') }, A.img('u_bag'), r.bagN = h('i'), desk ? h('b.key', 'I') : null),
        desk && DH.input.fullscreenAvailable() ? r.fsBtn = h('button.pause.fsbtn', { onclick: () => { DH.input.toggleFullscreen(); }, title: t('settings.fullscreen') + ' [F]' }, A.img(DH.input.isFullscreen() ? 'u_unfull' : 'u_full'), h('b.key', 'F')) : null), r.timer,
        h('div.stats', h('div', r.kills, A.img('n_skull')), h('div', r.gold, A.img('i_gold')))),
      r.fps, r.build, r.buffs, r.curse, r.boss, r.agony, r.track = hud.tracker(run), r.lordK = run.lordKills ? h('div.lordk', A.img('u_agony', 'ci'), r.lordKT = h('span')) : null].filter(Boolean)); // append() would print a null as text
    if (!DH.save.data.tutorialDone) { r.tut = h('div.tutorial', h('div', h('span.hand', A.img('u_hand', 'bigic')), t('tutorial.move'), h('br'), h('span.small.muted', t('tutorial.auto')))); el.append(r.tut); }
    hud.sig = ''; el.classList.remove('hidden');
  };
  /** The pinned quest (chosen in Deeds): its text and live progress under the kill and gold counters. */
  hud.tracker = (run) => {
    const d = DH.meta.trackedDeed(); if (!d) return null;
    const r = hud.refs;
    r.trD = d; r.trV = h('b'); r.trFill = h('i');
    return h('div.tracker', h('div.trh', A.img('u_pin', 'ci'), t('hud.quest')), h('div.trt', ui.deedText(d)), h('div.trp', h('div.trbar', r.trFill), r.trV));
  };
  /** The boss bar, drawn like the game's own models (painters, graded and outlined like every sprite), in units of two pixels.
   *  Dark bronze with fine gold edges: two slim rails with the blood's channel between them, a round boss with a red stone at
   *  each end that the blood runs into, a short rounded point beyond it, and a small lancet pendant under the middle. */
  const BB_H = 18, BB_CY = 7.5, BB_CH = [5.2, 5.9, 9.1], BB_CAP = 13; // height; the channel (inset from each end, top, bottom); a cap's length
  const BRZ = { gold: '#ffe6a0', hi: '#e8b860', lt: '#b07a30', md: '#6e4818', dk: '#3a240a', dp: '#1a0e04' }; // saturated: the grading tones it down
  const bossFrame = (W) => {
    const G = DH.gfx, name = 'bossbar_' + W;
    if (!G.painters[name]) G.painters[name] = { w: W, h: BB_H, cy: BB_H, frames: 1, draw(g) {
      const P = G.P, B = BRZ, x0 = 6, x1 = W - 6;
      // two slim rails of dark bronze, each with a fine gold edge facing the light and a dark one under it
      const rail = (y, lit) => { P.rect(g, x0, y, x1 - x0, 1.3, P.lg(g, 0, y, 0, y + 1.3, [B.lt, B.md, B.dk])); P.line(g, x0, lit ? y + 0.2 : y + 1.1, x1, lit ? y + 0.2 : y + 1.1, 0.35, lit ? B.gold : B.dp); };
      rail(4.6, true); rail(9.1, false);
      // the pendant under the middle: a lancet arch of bronze framing a small red stone, two short tendrils
      const c = W / 2;
      for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(c + sd * 2.4, 10.6); g.quadraticCurveTo(c + sd * 6, 10.6, c + sd * 8.6, 12.2); g.strokeStyle = B.lt; g.lineWidth = 0.6; g.stroke(); P.circle(g, c + sd * 8.8, 12.3, 0.55, B.hi); }
      g.beginPath(); g.moveTo(c - 2.6, 10.4); g.lineTo(c + 2.6, 10.4); g.quadraticCurveTo(c + 2.6, 13.4, c, 15.8); g.quadraticCurveTo(c - 2.6, 13.4, c - 2.6, 10.4); g.closePath();
      P.fill(g, P.lg(g, c - 2.6, 10.4, c + 2.6, 15.8, [B.hi, B.lt, B.md, B.dk]));
      g.beginPath(); g.moveTo(c - 1.4, 11.2); g.lineTo(c + 1.4, 11.2); g.quadraticCurveTo(c + 1.4, 13, c, 14.4); g.quadraticCurveTo(c - 1.4, 13, c - 1.4, 11.2); g.closePath(); P.fill(g, P.vol(g, c, 12.4, 1.6, '#a00c1c'));
      P.circle(g, c - 0.45, 11.9, 0.3, '#ffc0b0');
    } };
    return G.sprite(name);
  };
  /** The end cap, pointing right (mirrored on the left): a round boss of bronze with a red stone, laid over the end of the
   *  channel so the blood runs into it, and a short rounded point beyond. */
  const bossCap = () => {
    const G = DH.gfx;
    if (!G.painters.bossbar_cap) G.painters.bossbar_cap = { w: BB_CAP, h: BB_H, cy: BB_H, frames: 1, draw(g) {
      const P = G.P, B = BRZ, cy = BB_CY, bx = 4.8, R = 4.3;
      // the point: a leaf of bronze, its tip rounded, lit along its upper edge
      g.beginPath(); g.moveTo(bx + 2, cy - 2.2); g.quadraticCurveTo(10.6, cy - 2, 12.4, cy - 0.3); g.quadraticCurveTo(12.8, cy, 12.4, cy + 0.3); g.quadraticCurveTo(10.6, cy + 2, bx + 2, cy + 2.2); g.closePath();
      P.fill(g, P.lg(g, 0, cy - 2.2, 0, cy + 2.2, [B.hi, B.lt, B.md, B.dk]));
      g.beginPath(); g.moveTo(bx + 2.6, cy - 1.7); g.quadraticCurveTo(10.4, cy - 1.6, 12.1, cy - 0.3); g.strokeStyle = G.rgba(B.gold, 0.8); g.lineWidth = 0.35; g.stroke();
      P.line(g, bx + 3, cy + 0.15, 11.8, cy + 0.15, 0.3, G.rgba(B.dp, 0.6));
      // the boss: a ring of bronze lit from the top left, a darker inner ring, the stone in its middle
      P.circle(g, bx, cy, R, P.lg(g, bx - R, cy - R, bx + R, cy + R, [B.gold, B.hi, B.lt, B.md, B.dk]));
      P.circle(g, bx, cy, R - 1.1, P.lg(g, bx - R, cy - R, bx + R, cy + R, [B.dk, B.md, B.lt]));
      P.circle(g, bx, cy, R - 1.7, P.vol(g, bx, cy, R - 1.7, '#a8101e'));
      P.circle(g, bx - 0.8, cy - 0.8, 0.55, '#ffc8b8'); P.circle(g, bx + 0.9, cy + 0.9, 0.35, G.rgba('#ff6a60', 0.7)); // the stone's glint and its inner light
      for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2; P.circle(g, bx + Math.cos(a) * (R - 0.55), cy + Math.sin(a) * (R - 0.55), 0.38, i === 2 ? B.gold : B.dk); } // four rivets in the ring
    } };
    return G.sprite('bossbar_cap');
  };
  /** Draw the boss bar: the frame, the blood in its channel (a trail behind each blow, the live part with a glowing edge),
   *  the caps over both ends. Redrawn only when something changed. */
  const drawBossBar = (r, b) => {
    const cv = r.bossCv; if (!cv || !b) { if (r.bb) r.bb.boss = null; return; }
    const cw = r.boss.clientWidth; if (!cw) return;
    const W = Math.max(60, Math.floor(cw / 2)), PX = DH.gfx.CPX, pct = Math.max(0, Math.min(1, b.hp / b.maxHp));
    const st = r.bb || (r.bb = {});
    if (st.boss !== b) { st.boss = b; st.lag = pct; st.hold = 0; }
    const now = performance.now(), dt = Math.min(0.1, (now - (st.t || now)) / 1000); st.t = now;
    if (pct < st.lag) { if ((st.hold += dt) > 0.25) st.lag = Math.max(pct, st.lag - dt * 0.6); } else { st.lag = pct; st.hold = 0; }
    const rage = b.enr > 1.01 ? 0.5 + 0.5 * Math.sin(now / 120) : 0;
    const key = W + '|' + pct.toFixed(4) + '|' + st.lag.toFixed(4) + '|' + rage.toFixed(1);
    if (key === st.key) return; st.key = key;
    const sp = bossFrame(W), cap = bossCap(), ci = cap.frames[0];
    if (cv.width !== sp.frames[0].width) { cv.width = sp.frames[0].width; cv.height = sp.frames[0].height; cv.style.width = (cv.width / PX * 2) + 'px'; }
    const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height);
    g.drawImage(sp.frames[0], 0, 0);
    // the blood, pixel by pixel (in canvas pixels): the channel between the rails
    const o = (sp.w - W) / 2, [inset, top, bot] = BB_CH, X0 = Math.round((o + inset) * PX), X1 = Math.round((o + W - inset) * PX), Y0 = Math.round((o + top) * PX), Y1 = Math.round((o + bot) * PX);
    const len = X1 - X0, hgt = Y1 - Y0, fw = Math.round(len * pct), lw = Math.round(len * st.lag);
    g.fillStyle = '#120708'; g.fillRect(X0, Y0, len, hgt); g.fillStyle = '#060203'; g.fillRect(X0, Y0, len, 1);   // the empty channel, its top in shadow
    if (lw > fw) { g.fillStyle = '#5c1c22'; g.fillRect(X0 + fw, Y0, lw - fw, hgt); g.fillStyle = '#7a3036'; g.fillRect(X0 + fw, Y0, lw - fw, 1); }
    if (fw > 0) {
      const mix = (a, c, k) => '#' + [0, 2, 4].map((i) => Math.round(parseInt(a.substr(1 + i, 2), 16) * (1 - k) + parseInt(c.substr(1 + i, 2), 16) * k).toString(16).padStart(2, '0')).join('');
      const rows = [mix('#e04450', '#ff7070', rage), mix('#b4182a', '#e02838', rage), mix('#8e0c1c', '#b81424', rage), mix('#6a0814', '#8a0c18', rage), mix('#480410', '#600812', rage), '#2e0208'];
      for (let y = 0; y < hgt; y++) { g.fillStyle = rows[Math.min(rows.length - 1, Math.floor(y / hgt * rows.length))]; g.fillRect(X0, Y0 + y, fw, 1); }
      g.fillStyle = 'rgba(30,0,6,0.35)'; for (let x = X0 + 3; x < X0 + fw - 2; x += 7) g.fillRect(x + ((x * 7) % 3), Y0 + 2 + ((x * 13) % Math.max(1, hgt - 3)), 2, 1); // a little texture: clotted flecks
      const gl = g.createLinearGradient(X0 + fw - 8, 0, X0 + fw, 0); gl.addColorStop(0, 'rgba(255,140,140,0)'); gl.addColorStop(1, 'rgba(255,190,180,0.85)');
      g.fillStyle = gl; g.fillRect(Math.max(X0, X0 + fw - 8), Y0, Math.min(8, fw), hgt);                      // the glowing leading edge
      g.fillStyle = '#ffe0d8'; g.fillRect(X0 + fw - 1, Y0, 1, hgt);
    }
    // the caps over both ends
    const k = PX, pad = (cap.w - BB_CAP) / 2;
    g.drawImage(ci, Math.round((o + W - BB_CAP - pad) * k), 0);
    g.drawImage(DH.gfx.flip(ci), Math.round((o + BB_CAP + pad - cap.w) * k), 0);
  };
  /** The boss bar sits just under whatever the top of the HUD holds (abilities, buffs, the Agony gauge, the Lord's tally),
   *  and the quest tracker moves down under the bar while it is shown. */
  const stackBoss = (r) => {
    const host = r.boss.parentElement; if (!host) return;
    const top0 = host.getBoundingClientRect().top;
    let low = 0;
    for (const el of [r.build, r.buffs, r.agony, r.lordK, r.curse]) {
      if (!el || el.classList.contains('hidden') || !el.childNodes.length) continue;
      const rc = el.getBoundingClientRect(); if (rc.height) low = Math.max(low, rc.bottom - top0);
    }
    r.boss.style.top = Math.round(low + 6) + 'px';
    if (r.track) r.track.style.top = Math.round(low + 6 + r.boss.offsetHeight + 6) + 'px';
  };
  const trackUpdate = (run) => {
    const r = hud.refs; if (!r.track) return;
    const p = DH.meta.deedLive(r.trD, run), done = p.here && p.v >= p.n;
    const f = (v) => p.time ? U.fmtTime(Math.min(v, p.n)) : p.n === 1 ? String(Math.min(v, 1)) : U.fmt(Math.min(Math.floor(v), p.n));
    r.trV.textContent = p.here ? f(p.v) + '/' + f(p.n) : t('hud.questElsewhere');
    r.trFill.style.width = (p.here ? Math.min(100, p.v / p.n * 100) : 0) + '%';
    r.track.classList.toggle('off', !p.here); r.track.classList.toggle('done', done);
  };
  const bq = []; let bBusy = false;
  function nextBanner() {
    if (bBusy || !bq.length) return;
    const b = bq.shift(); bBusy = true;
    const el = h('div.banner' + (b.warn ? '.warn' : ''), b.sub ? h('small', b.sub) : null, b.text);
    document.getElementById('hud').appendChild(el);
    setTimeout(() => { el.remove(); bBusy = false; nextBanner(); }, b.warn ? 2200 : 3000);
  }
  hud.banner = (text, sub, warn) => { if (!warn) bq.unshift({ text, sub, warn }); else bq.push({ text, sub, warn }); if (bq.length > 3) bq.length = 3; nextBanner(); };
  hud.hide = () => { const el = document.getElementById('hud'); el.classList.add('hidden'); el.innerHTML = ''; bq.length = 0; };
  let lastTxt = 0, fpsN = 0, fpsT0 = 0, fpsLast = 0, fpsWorst = 0;
  /** The frame rate over the last second and its slowest frame, for checking the game on a given phone (Settings). */
  const fpsTick = (r) => {
    const now = performance.now();
    if (fpsLast) fpsWorst = Math.max(fpsWorst, now - fpsLast);
    fpsLast = now; fpsN++;
    if (!fpsT0) { fpsT0 = now; fpsN = 0; fpsWorst = 0; return; }
    if (now - fpsT0 < 1000) return;
    const fps = Math.round(fpsN * 1000 / (now - fpsT0)), low = Math.round(1000 / Math.max(1, fpsWorst));
    r.fps.textContent = fps + ' FPS · min ' + Math.min(fps, low);
    r.fps.className = 'fps ' + (fps >= 50 ? 'ok' : fps >= 30 ? 'mid' : 'bad');
    fpsT0 = now; fpsN = 0; fpsWorst = 0;
  };
  /* Auto quality (Settings): while the fight runs, frames are counted in 5-second windows; two slow windows in a row
     (under 40 per second) lower the graphics effects one step, at most once per run. Pauses, menus and a hidden tab
     are left out, and so are single long hitches (loading a sprite, the tab coming back). */
  const AQ = { run: null, t: 0, n: 0, last: 0, slow: 0, done: false };
  const autoQuality = (run) => {
    const s = DH.save.data.settings, now = performance.now();
    if (AQ.run !== run) Object.assign(AQ, { run, t: 0, n: 0, last: 0, slow: 0, done: false });
    const dt = AQ.last ? now - AQ.last : 0; AQ.last = now;
    if (AQ.done || !s.autoFx || !(s.fxLevel > 0) || run.state !== 'playing' || document.hidden || run.time < 8 || dt > 250) return;
    AQ.t += dt; AQ.n++;
    if (AQ.t < 5000) return;
    const fps = AQ.n * 1000 / AQ.t; AQ.t = 0; AQ.n = 0;
    AQ.slow = fps < 40 ? AQ.slow + 1 : 0;
    if (AQ.slow < 2) return;
    AQ.done = true;
    s.fxLevel -= 1; s.lowFx = s.fxLevel < 2; s.minFx = s.fxLevel === 0; DH.save.persist();
    ui.toast(t('settings.autoFxDown', { q: t('settings.fxLevel' + s.fxLevel) }));
  };
  hud.update = (run) => {
    const r = hud.refs; if (!r) return;
    autoQuality(run);
    if (DH.save.data.settings.showFps) fpsTick(r); else if (!r.fps.classList.contains('hidden')) r.fps.classList.add('hidden');
    r.xpFill.style.width = Math.min(100, run.xp / run.xpNext * 100) + '%';
    drawBossBar(r, run.bosses[0]); // every frame: the trail behind a blow eases down smoothly
    const now = performance.now(); if (now - lastTxt < 120) return; lastTxt = now;
    r.lvl.textContent = t('common.lv') + ' ' + run.level;
    r.timer.textContent = U.fmtTime(run.time); r.timer.classList.toggle('boss', run.time >= run.runLength);
    r.kills.textContent = U.fmt(run.kills); r.gold.textContent = U.fmt(run.gold);
    r.bagN.textContent = run.bag.length ? run.bag.length + '/' + C.BAG_SIZE : ''; r.bagN.classList.toggle('full', run.bag.length >= C.BAG_SIZE);
    if (r.lordK) { r.lordKT.textContent = run.lordUp ? '' : t('hud.lordKills', { n: U.fmt(Math.min(run.kills, run.lordKills)), m: U.fmt(run.lordKills) }); r.lordK.classList.toggle('hidden', !!run.lordUp); }
    const sig = run.abilities.map((a) => a.id + JSON.stringify(run.traits.ab[a.id] || {})).join() + '|' + run.level;
    if (sig !== hud.sig) {
      hud.sig = sig; r.build.innerHTML = '';
      r.build.append(h('div.r', run.abilities.map((a) => { const n = Object.values(run.traits.ab[a.id] || {}).reduce((x, y) => x + y, 0); return h('div.b', { onclick: () => DH.game.abilityInfo(a) }, A.img('ab_' + a.id), n ? h('i', n) : null); }))); // tap: what it does, how far it has grown
    }
    const bs = Object.keys(run.buffs).filter((k) => run.buffs[k] > 0).map((k) => k + Math.ceil(run.buffs[k])).join();
    if (bs !== r.bsig) { r.bsig = bs; r.buffs.innerHTML = ''; Object.keys(run.buffs).forEach((k) => { if (run.buffs[k] > 0) r.buffs.append(h('div.bf.' + k, A.img('rune_' + k), h('b', Math.ceil(run.buffs[k])))); }); }
    r.curse.classList.toggle('hidden', !(run.curse > 0)); if (run.curse > 0) r.curseT.textContent = t('hud.curse', { n: Math.ceil(run.curse) });
    const b = run.bosses[0];
    r.boss.classList.toggle('hidden', !b);
    if (b) { r.bossName.textContent = t('enemy.' + b.id) + (b.enr > 1.01 ? ' · ' + t('hud.enraged') : ''); r.boss.classList.toggle('enraged', b.enr > 1.01); }
    if (b && now - (r.bbT || 0) > 300) { r.bbT = now; stackBoss(r); } else if (!b && r.track && r.track.style.top) r.track.style.top = '';
    if (r.agony) { r.agFill.firstChild.style.width = (run.agony / C.AGONY_MAX * 100) + '%'; r.agNum.textContent = ['0', 'I', 'II', 'III', 'IV', 'V'][Math.floor(run.agony + 1e-6)]; }
    if (r.track && now - (r.trT || 0) > 400) { r.trT = now; trackUpdate(run); }
    if (r.fsBtn) { const fs = DH.input.isFullscreen(); if (fs !== r.fsOn) { r.fsOn = fs; r.fsBtn.firstChild.replaceWith(A.img(fs ? 'u_unfull' : 'u_full')); } }
    if (r.tut && (run.time > 6 || (run.player.moving && run.time > 1.5))) { r.tut.remove(); r.tut = null; DH.save.data.tutorialDone = true; DH.save.persist(); }
  };
  ui.hud = hud;

  function buildRow(run) {
    const row = h('div.buildrow');
    for (let i = 0; i <= C.MAX_ABILITIES; i++) {
      const a = run.abilities[i];
      if (!a) { row.append(h('div.b.empty')); continue; }
      const n = Object.values(run.traits.ab[a.id] || {}).reduce((x, y) => x + y, 0);
      row.append(h('div.b', { onclick: (e) => { e.stopPropagation(); click(); ui.openAbilityInfo(run, a); } }, A.img('ab_' + a.id), n ? h('i', n) : null));
    }
    return row;
  }
  function traitRow(run) {
    const row = h('div.buildrow.traits');
    for (const id in run.traits.base) row.append(h('div.b', A.img('tr_' + id), h('i', run.traits.base[id])));
    for (const id in run.traits.elev) row.append(h('div.b.elev', A.img('tr_' + id), h('i', run.traits.elev[id])));
    for (const k in run.traits.cls) { const c = run.traits.cls[k]; row.append(h('div.b.cls', A.img(c.hero === run.heroId ? 'h_' + c.hero : 'm_' + c.hero), h('i', c.rank))); }
    return row.childNodes.length ? row : null;
  }

  /* ---------------- An ability's details (tap its icon) ---------------- */
  ui.openAbilityInfo = (run, a, onClose) => {
    const def = C.abilities[a.id], s = a.s || {}, P = run.P;
    let pct = 1 + (P.dmgPct || 0) + (s.dmgPct || 0); for (const tg of a.tags || def.tags) if (P.tag && P.tag[tg]) pct += P.tag[tg];
    if ((a.tags || def.tags).includes('summon')) pct += P.summonPct || 0;
    const hit = Math.round(((s.dmg || 0) + (P.addBase || 0)) * pct), crit = Math.round(Math.min(1, (s.crit || 0) + (P.critPct || 0)) * 100);
    const stat = (k, v) => (v == null || v === '' ? null : h('div.ai-st', h('span', t('abinfo.' + k)), h('b', v)));
    const rnd = (v, d) => Math.round(v * Math.pow(10, d || 0)) / Math.pow(10, d || 0);
    // the ability's traits taken this fight, with their ranks, and its upgrades
    const tr = run.traits.ab[a.id] || {}, taken = Object.keys(tr).filter((i) => tr[i] > 0).map((i) => { const T = def.traits[i]; return h('div.ai-tr', h('b', t('at.' + T.k) + (tr[i] > 1 ? ' ×' + tr[i] : '')), h('span', ui.fmtMods(T.m, tr[i]))); });
    const ups = (run.traits.up[a.id] || []).map((u) => h('div.ai-tr.up', h('b', t('up.' + u)), h('span', ui.fmtMods(C.UPGRADES[u]))));
    const i = run.abilities.indexOf(a), d = run.dmgByAb[a.id] || 0, since = Math.max(1, run.time - ((run.abTimes || [])[i] || 0));
    ui.modal({ title: t('ab.' + a.id + '.name'), cls: 'abinfo', onClose, body: () => h('div',
      h('div.ai-head', h('div.slot.ai-ico', A.img('ab_' + a.id)), h('div.grow', ui.abTypes(a.id, run), h('div.small', t('ab.' + a.id + '.desc')))),
      h('div.ai-stats',
        hit ? stat('dmg', U.fmt(hit)) : null, s.cd ? stat('cd', rnd(s.cd, 2) + ' ' + t('abinfo.sec')) : null,
        def.base.count != null || s.count > 1 ? stat('count', s.count) : null, def.base.area != null ? stat('area', Math.round(s.area * 100) + '%') : null,
        s.pierce ? stat('pierce', s.pierce) : null, s.chain ? stat('chain', s.chain) : null, s.duration ? stat('duration', rnd(s.duration, 1) + ' ' + t('abinfo.sec')) : null,
        crit && !a.noCrit ? stat('crit', crit + '%') : null, s.ms ? stat('ms', Math.round(s.ms * 100) + '%') : null,
        stat('dps', U.fmt(Math.round(d / since))), stat('total', U.fmt(Math.round(d)))),
      h('div.ai-sect', t('abinfo.traits')), taken.length || ups.length ? h('div', taken, ups) : h('div.small.muted', t('abinfo.none'))) });
  };

  /* ---------------- Level up ---------------- */
  ui.openLevelUp = (run) => {
    DH.input.enable(false);
    let mode = null; // potion mode: remembrance | resonance | lethe
    const m = ui.modal({ closable: false, cls: 'levelup', body: () => h('div') });
    const draw = () => {
      const isClass = C.CLASS_LEVELS.includes(run.levelFor), canLock = !mode && (run.rerolls > 0 || !run.usedAdReroll);
      const cards = run.choices.map((c, i) => {
        const info = ui.choiceInfo(run, c);
        const rank = c.rank ? (c.rank === 1 ? h('span.new', t('levelup.new')) : h('span.lv', t('lv.rank', { n: c.rank }))) : null;
        return h('div.choice.' + (info.tcls || 'x') + (c.remembered ? '.remembered' : '') + (mode ? '.targeting' : ''), { style: { animationDelay: (i * 0.05) + 's' }, onclick: () => {
          click();
          if (mode) {
            if (mode === 'resonance') { run.potions.resonance--; run.potionsUsed.resonance = (run.potionsUsed.resonance || 0) + 1; m.close(); run.choose(c, true); DH.audio.play('levelup'); if (run.state === 'playing') DH.input.enable(true); return; }
            run.usePotion(mode, c); mode = null; draw(); return;
          }
          m.close(); run.choose(c);
          if (run.state === 'playing') DH.input.enable(true);
        } },
          canLock ? h('button.lockb' + (c.locked ? '.on' : ''), { 'aria-label': t('levelup.lock'), onclick: (e) => { e.stopPropagation(); click(); c.locked = !c.locked; draw(); } }, A.img(c.locked ? 'u_lock' : 'u_unlock', 'ci')) : null, // kept through a reroll
          h('div.ico', A.img(info.icon)),
          h('div.grow', h('div.tg', info.tag || ''), h('div.t', info.name, rank), info.ab ? ui.abTypes(info.ab, run, info.up) : null, h('div.d', info.desc), info.note ? h('div.note2', info.note) : null, c.remembered ? h('div.note2.mem', t('potion.remembered')) : null));
      });
      const pot = (k) => {
        const n = run.potions[k] || 0;
        return h('button.potbtn' + (mode === k ? '.on' : '') + (n ? '' : '.off'), { onclick: () => { click(); mode = mode === k ? null : k; draw(); } }, A.img('p_' + k), h('span', n));
      };
      const LV = E.potionOrder.filter((k) => E.potions[k].use === 'level');
      const hasPot = LV.some((k) => (run.potions[k] || 0) > 0);
      const rerollBtn = run.rerolls > 0
        ? h('button.btn.small.blue', { onclick: () => { click(); run.reroll(); draw(); } }, A.img('i_reroll'), t('levelup.reroll', { n: run.rerolls }))
        : !run.usedAdReroll ? h('button.btn.small.ad', { onclick: async () => { if (await DH.ads.rewarded('reroll')) { run.usedAdReroll = true; run.reroll(true); draw(); } } }, h('span.adtag', 'AD'), t('levelup.rerollAd')) : null;
      m.set(h('div',
        h('div.lvl-title', isClass ? t('levelup.classTitle') : run.choices.some((c) => c.kind === 'up') ? t('levelup.upTitle') : t('levelup.title')),
        h('div.center.small.muted', t('levelup.sub', { n: run.levelFor })),
        buildRow(run),
        mode ? h('div.center.potionhint', t('potion.hint.' + mode)) : null,
        h('div', { style: { marginTop: '8px' } }, cards),
        h('div.lvfoot', hasPot ? h('div.row.pots', LV.map(pot)) : null,
          h('div.lvacts', h('button.btn.small.ghost', { onclick: () => { click(); ui.openCharacter(run, {}); } }, t('levelup.stats')), // the hero's stats and gear while choosing
            rerollBtn))));
    };
    draw();
  };

  /* ---------------- Arcane Tome ---------------- */
  ui.openTome = (run, data) => {
    DH.input.enable(false);
    const m = ui.modal({ closable: false, cls: 'levelup', body: h('div',
      h('div.lvl-title', data.mastery ? t('tome.mastery') : t('tome.title')),
      h('div.center.small.muted', data.traitsOnly ? t('tome.full') : data.mastery ? t('tome.masterySub') : t('tome.sub')),
      h('div', { style: { marginTop: '8px' } }, data.choices.map((c, i) => {
        const info = ui.choiceInfo(run, c);
        return h('div.choice.abt', { style: { animationDelay: (i * 0.06) + 's' }, onclick: () => { click(); m.close(); run.chooseTome(c); if (run.state === 'playing') DH.input.enable(true); } },
          h('div.ico', A.img(info.icon)), h('div.grow', h('div.tg', info.tag || ''), h('div.t', info.name), info.ab ? ui.abTypes(info.ab, run, info.up) : null, h('div.d', info.desc)));
      })),
      ui.rerollPotion(run, 'renewal', !data.traitsOnly && data.choices.some((c) => c.kind === 'ability'), () => { m.close(); ui.openTome(run, run.rerollTome(data)); }),
      // turn the tome down (the Adept's quest wants the main weapon alone): gold or half a level instead
      data.choices.some((c) => c.kind !== 'gold') ? h('div.tome-decline',
        h('span.small.muted', t('tome.decline')),
        h('button.btn.small.ghost', { onclick: () => { click(); m.close(); run.declineTome('gold'); if (run.state === 'playing') DH.input.enable(true); } }, A.img('i_gold'), t('tome.declineGold', { n: C.TOME_DECLINE_GOLD })),
        h('button.btn.small.ghost', { onclick: () => { click(); m.close(); run.declineTome('xp'); if (run.state === 'playing') DH.input.enable(true); } }, t('tome.declineXp'))) : null) });
  };
  /** A flask that rolls a tome's or a chest's offer again: shown while the hero carries one. */
  ui.rerollPotion = (run, kind, ok, then) => {
    const n = run.potions[kind] || 0; if (!n || !ok) return null;
    return h('div.row.lvfoot', h('span.grow'), h('button.btn.small.blue', { onclick: () => { click(); if (run.drinkReroll(kind)) { DH.audio.play('heal'); then(); } } }, A.img('p_' + kind), t('potion.drink.' + kind, { n })));
  };

  /* ---------------- The adventurer's reward: a chest or an ability, for an ad, as the fight begins ---------------- */
  ui.openStartBonus = (run) => {
    DH.input.enable(false);
    let pick = 'chest', busy = false;
    const done = (m) => { m.close(); DH.input.enable(true); run.resume(); };
    const card = (kind, icon) => h('div.sb-card' + (pick === kind ? '.on' : ''), { onclick: () => { click(); pick = kind; draw(); } },
      h('div.sb-art', h('i.sb-ray'), A.img(icon)), h('div.sb-t', t('startBonus.' + kind)));
    let m = null;
    const draw = () => m && m.set(h('div',
      h('div.sb-row', card('chest', 'c_wood'), card('ability', 'tome')),
      h('div.center.small.muted', { style: { margin: '8px 0' } }, t('startBonus.sub')),
      h('button.btn.red.block.shine', { onclick: async () => {
        if (busy) return; busy = true; click();
        const ok = await DH.ads.rewarded('start_bonus'); busy = false;
        if (!ok || DH.game.run !== run) return;
        run.takeStartBonus(pick); DH.audio.play('reward'); done(m);
      } }, DH.save.data.purchases.noAds ? null : h('span.adtag', 'AD'), t('startBonus.claim'))));
    m = ui.modal({ title: t('startBonus.title'), rays: true, cls: 'levelup startbonus', onX: () => { click(); done(m); }, body: () => h('div') });
    draw();
  };

  /* ---------------- Loot (champion / boss chest) ---------------- */
  ui.openLoot = (run, d) => {
    DH.input.enable(false);
    const done = (m) => { m.close(); DH.input.enable(true); run.resume(); };
    const gearLine = (it) => {
      const def = E.gear[it.type], st = E.gearStat(it.type, it.rarity, 1), sp = E.gearSpecial(it.type, it.rarity);
      const slot = DH.meta.slotForRun(it.type, run.runGear), cur = run.runGear[slot] || DH.meta.equippedItem(slot);
      const better = !cur || it.rarity > cur.rarity, same = cur && cur.rarity === it.rarity;
      return { def, st, sp, cur, better, same };
    };
    // the X refuses the pieces: half a level of experience instead (not when Ivory Dice already chose)
    const refuse = d.auto ? null : () => { click(); run.takeLootXp(); DH.audio.play('levelup'); ui.toast(t('loot.xpTaken', { v: Math.round(C.LOOT_XP * 100) }), 'good'); done(lm); };
    const lm = ui.modal({ title: d.fresh ? t('loot.pendulum') : d.boss ? t('loot.boss') : d.wood ? t('chest.wood') : t('loot.champion'), rays: true, closable: false, onX: refuse, cls: 'levelup', body: (m) => h('div',
      h('div.center.small.muted', d.auto ? t('loot.ivory') : d.items.length > 1 ? t('loot.pick', { n: d.items.length }) : d.fresh ? t('loot.newItem') : ''),
      h('div', { style: { marginTop: '8px' } }, d.items.map((it, i) => {
        const L = gearLine(it);
        const res = d.auto ? d.result : null;
        return h('div.choice.abt.lootpick', { style: { animationDelay: (i * 0.06) + 's' }, onclick: () => {
          click(); if (d.auto) { if (run.bagOverflow()) { m.close(); ui.openCharacter(run, { overflow: true, onClose: () => { DH.input.enable(true); run.resume(); } }); } else done(m); return; }
          const r = run.takeLoot(it); DH.audio.play('reward');
          if (!r.overflow) ui.toast(t(r.equipped ? 'loot.equipped' : 'loot.bagged'), r.equipped ? 'good' : null);
          if (r.overflow) { m.close(); ui.openCharacter(run, { overflow: true, onClose: () => { DH.input.enable(true); run.resume(); } }); } else done(m);
        } },
          h('div.slot.rar' + it.rarity, { style: { flex: 'none', width: '52px', height: '52px' } }, A.img('g_' + it.type)),
          h('div.grow',
            h('div.tg.rar' + it.rarity, h('span.rtxt', t('rarity.' + E.rarities[it.rarity])), h('span.muted', ' · ' + t('slot.' + (L.def.slot === 'ring' ? 'ring1' : L.def.slot)))),
            h('div.t', t('gear.' + it.type)),
            h('div.d', ui.fmtStats(L.st), L.sp ? h('div.goldtxt', ui.gearSpecialText(it.type, L.sp)) : null),
            h('div.small.' + (L.better ? 'good' : 'muted'), res ? t(res.equipped ? 'loot.equipped' : 'loot.bagged') : L.better ? t('loot.upgrade') : L.same ? t('loot.sidegrade') : t('loot.worse', { r: t('rarity.' + E.rarities[L.cur.rarity]) }))));
      })),
      h('div.center.small', { style: { marginTop: '6px' } }, A.img('i_gold', 'ci'), ' +' + d.gold),
      refuse ? h('div.center.small.muted', { style: { marginTop: '4px' } }, t('loot.xpHint', { v: Math.round(C.LOOT_XP * 100) })) : null,
      h('div.note', t('loot.wellHint')),
      ui.rerollPotion(run, 'visions', !d.auto, () => { lm.close(); ui.openLoot(run, run.rerollLoot(d)); })) });
  };

  /* ---------------- The Well ---------------- */
  ui.openWell = (run) => {
    DH.input.enable(false);
    const close = (m) => { m.close(); DH.input.enable(true); run.resume(); };
    const items = run.carried(); let sel = items[0] || null;
    const m = ui.modal({ title: t('well.title'), closable: false, body: () => h('div') });
    // tap an item to see what it is; send it up the Well from the detail panel
    const draw = () => {
      const def = sel && E.gear[sel.type], sp = sel && E.gearSpecial(sel.type, sel.rarity), st = sel && E.gearStat(sel.type, sel.rarity, 1);
      const owned = sel ? DH.save.data.gear.filter((g) => g.type === sel.type).length : 0;
      m.set(h('div',
        h('div.center.small.muted', t('well.desc')),
        items.length ? h('div.grid4', { style: { marginTop: '10px' } }, items.map((it) => h('div', { onclick: () => { click(); sel = it; draw(); } },
          h('div.slot.rar' + it.rarity + (it === sel ? '.picked' : ''), A.img('g_' + it.type), run.bag.includes(it) ? null : h('span.eq', 'E')),
          h('div.center.small.rar' + it.rarity, h('span.rtxt', t('rarity.' + E.rarities[it.rarity]))))))
          : h('div.panel.center.muted', { style: { marginTop: '10px' } }, t('well.empty')),
        sel ? h('div.panel.wellinfo', { style: { marginTop: '10px' } },
          h('div.row', { style: { alignItems: 'flex-start' } },
            h('div.slot.rar' + sel.rarity, { style: { flex: 'none', width: '56px', height: '56px' } }, A.img('g_' + sel.type)),
            h('div.grow',
              h('div', { style: { fontWeight: 800 } }, t('gear.' + sel.type)),
              h('div.small', h('span.rar' + sel.rarity, h('span.rtxt', t('rarity.' + E.rarities[sel.rarity]))), h('span.muted', ' · ' + t('slot.' + (def.slot === 'ring' ? 'ring1' : def.slot)))),
              h('div', { style: { marginTop: '4px' } }, Object.keys(st).map((k) => h('div.small', ui.fmtStat(k, st[k])))),
              sp ? h('div.small.goldtxt', { style: { marginTop: '3px' } }, ui.gearSpecialText(sel.type, sp)) : null,
              h('div.small.muted', { style: { marginTop: '3px' } }, owned ? t('well.owned', { n: owned }) : t('well.newItem')))),
          h('button.btn.gold.block', { style: { marginTop: '8px' }, onclick: () => { run.sendToWell(sel); DH.audio.play('reward'); ui.toast(t('well.sent', { item: t('gear.' + sel.type) }), 'good'); close(m); } }, t('well.send'))) : null,
        h('div.btns', h('button.btn.ghost', { onclick: () => { click(); close(m); } }, t('well.later')))));
    };
    draw();
  };

  /* ---------------- Character: equipment, the bag (4 spare pieces), stats, damage ---------------- */
  /** opts.overflow: the bag is over its size, so one piece must be equipped or discarded before the run goes on.
   *  opts.onClose: called when the screen closes (resume the run). */
  ui.openCharacter = (run, opts) => {
    opts = opts || {};
    let sel = opts.overflow ? run.bag[run.bag.length - 1] : null;
    const m = ui.modal({ title: t('inv.title'), closable: false, onX: () => close(), cls: 'charsheet', body: () => h('div') }); // the X: same rules as the Close button
    // closing with the bag too full leaves the newest pieces behind: no need to discard by hand
    const close = () => {
      click();
      const left = run.bag.splice(C.BAG_SIZE);
      if (left.length) ui.toast(t('inv.leftBehind', { item: left.map((it) => t('gear.' + it.type)).join(', ') }));
      ui.charClose = null; m.close(); if (opts.onClose) opts.onClose();
    };
    ui.charClose = close; // the I key closes it again
    const slotOf = (it) => E.slots.find((sl) => run.runGear[sl] === it);
    const commit = !!(run.fx_ || {}).commit;
    const itemBox = (it, extra) => h('div.slot.rar' + it.rarity + (it === sel ? '.picked' : ''), { onclick: () => { click(); sel = it; draw(); } }, A.img('g_' + it.type), extra);
    const detail = () => {
      if (!sel) return h('div.panel.center.small.muted.wellinfo', t('inv.tapHint'));
      const def = E.gear[sel.type], sp = E.gearSpecial(sel.type, sel.rarity), st = E.gearStat(sel.type, sel.rarity, sel.level || 1);
      const worn = slotOf(sel), inBag = run.bag.includes(sel), own = !worn && !inBag; // own = the hero's own gear from home
      let note = null; const btns = [];
      if (inBag) {
        const sl = DH.meta.slotForRun(sel.type, run.runGear), cur = run.runGear[sl] || DH.meta.equippedItem(sl);
        note = cur ? t('inv.replaces', { item: t('gear.' + cur.type), r: t('rarity.' + E.rarities[cur.rarity]) }) : null;
        btns.push(h('button.btn.gold' + (commit && run.runGear[sl] ? '.off' : ''), { onclick: () => {
          if (!run.equipFromBag(sel, sl)) { ui.toast(t('inv.committed'), 'bad'); return; }
          DH.audio.play('reward'); draw(); } }, t('inv.equip')));
        btns.push(h('button.btn.red', { onclick: async () => {
          const it = sel;
          if (!opts.overflow && !(await ui.confirm({ title: t('inv.discard'), body: t('inv.discardConfirm', { item: t('gear.' + it.type) }), okCls: 'red', ok: t('inv.discard') }))) return;
          run.discardItem(it); DH.audio.play('click'); sel = null; draw(); } }, t('inv.discard')));
      } else if (worn) {
        note = t('inv.found');
        btns.push(h('button.btn.ghost' + (run.bag.length >= C.BAG_SIZE || commit ? '.off' : ''), { onclick: () => {
          if (!run.unequipToBag(worn)) { ui.toast(t(commit ? 'inv.committed' : 'inv.bagFull'), 'bad'); return; }
          click(); draw(); } }, t('inv.toBag')));
      } else if (own) note = t('inv.own');
      return h('div.panel.wellinfo',
        h('div.row', { style: { alignItems: 'flex-start' } },
          h('div.slot.rar' + sel.rarity, { style: { flex: 'none', width: '52px', height: '52px' } }, A.img('g_' + sel.type)),
          h('div.grow',
            h('div', { style: { fontWeight: 800 } }, t('gear.' + sel.type)),
            h('div.small', h('span.rar' + sel.rarity, h('span.rtxt', t('rarity.' + E.rarities[sel.rarity]))), h('span.muted', ' · ' + t('slot.' + (def.slot === 'ring' ? 'ring1' : def.slot)))),
            h('div.small', { style: { marginTop: '3px' } }, ui.fmtStats(st)),
            sp ? h('div.small.goldtxt', { style: { marginTop: '2px' } }, ui.gearSpecialText(sel.type, sp)) : null,
            note ? h('div.small.muted', { style: { marginTop: '3px' } }, note) : null)),
        btns.length ? h('div.btns', { style: { marginTop: '8px' } }, btns) : null);
    };
    const stats = () => {
      const b = DH.meta.baseStats(run.heroId, {}), P = run.P, z = (k) => b[k] || 0;
      const row = (k, base, now, fmt) => h('div.cs-row', h('span', t(k)), h('b', fmt(base)), h('b' + (now > base + 1e-6 ? '.good' : now < base - 1e-6 ? '.bad' : ''), fmt(now)));
      const n0 = (v) => String(Math.round(v)), n1 = (v) => v.toFixed(1), pc = (v) => (v >= 0 ? '+' : '') + U.pct(v);
      return h('div.cs-stats',
        h('div.cs-head', h('span', t('inv.attribute')), h('span', t('inv.base')), h('span', t('inv.total'))),
        row('stat.maxHp', z('baseHp') * (1 + z('maxHpPct')), P.maxHp, n0),
        row('stat.regen', z('regen'), P.regen, n1),
        row('stat.block', z('block'), P.block, n0),
        row('stat.defense', z('defense') * 100, P.defense * 100, n0),
        row('stat.speedPct', z('baseSpeed') * (1 + z('speedPct')), P.speed, n0),
        row('stat.pickup', 30 * (1 + z('pickup')), P.pickupR, n0),
        row('stat.dmgPct', z('dmgPct'), P.dmgPct, pc),
        row('stat.as', z('as'), P.as, pc),
        row('stat.area', z('area'), P.area, pc),
        row('stat.critPct', z('critPct'), P.critPct, pc),
        row('stat.critBonus', 0.5 + z('critBonus') - 0.5, P.critBonus, pc));
    };
    const damage = () => h('div.cs-stats',
      h('div.cs-head', h('span', t('inv.ability')), h('span', t('inv.dps')), h('span', t('inv.totalDmg'))),
      run.abilities.map((a, i) => {
        const d = run.dmgByAb[a.id] || 0, since = Math.max(1, run.time - ((run.abTimes || [])[i] || 0));
        return h('div.cs-row', h('span', A.img('ab_' + a.id, 'ci'), ' ', t('ab.' + a.id + '.name')), h('b', U.fmt(Math.round(d / since))), h('b', U.fmt(Math.round(d))));
      }));
    const draw = () => {
      if (sel && !run.bag.includes(sel) && !slotOf(sel) && !E.slots.some((sl) => !run.runGear[sl] && DH.meta.equippedItem(sl) === sel)) sel = null;
      const over = run.bagOverflow();
      const eq = h('div.grid4.cs-eq', E.slots.map((sl) => {
        const found = run.runGear[sl], it = found || DH.meta.equippedItem(sl);
        return h('div', it ? itemBox(it, found ? h('span.found') : null) : h('div.slot.empty', A.img('s_' + sl)), h('div.center.small.muted', t('slot.' + sl)));
      }));
      const bag = h('div.grid4.cs-bag' + (over ? '.over' : ''), Array.from({ length: Math.max(C.BAG_SIZE, run.bag.length) }, (_, i) => {
        const it = run.bag[i];
        return h('div', it ? itemBox(it, i >= C.BAG_SIZE ? h('span.newdot') : null) : h('div.slot.empty.bagslot'));
      }));
      m.set(h('div',
        over ? h('div.panel.center.small.goldtxt', t('inv.overflow', { n: C.BAG_SIZE })) : null,
        h('div.cs-sec', t('inv.equipment')), eq,
        h('div.cs-sec', t('inv.bag', { n: Math.min(run.bag.length, 99), m: C.BAG_SIZE })), bag,
        detail(),
        h('div.cs-sec', t('inv.stats')), stats(),
        h('div.cs-sec', t('inv.damage')), damage(),
        h('div.btns', h('button.btn.gold', { onclick: close }, t(over ? 'inv.leave' : opts.overflow ? 'common.continue' : 'common.close')))));
    };
    draw();
  };

  /* ---------------- Pause ---------------- */
  ui.openPause = (run) => {
    const P = run.P;
    const statRows = [
      [t('stat.maxHp'), Math.round(run.player.hp) + '/' + P.maxHp], [t('stat.defense'), Math.round(P.defense * 100) + ' (' + U.pct(C.defenseDR(P.defense)) + ')'], [t('stat.block'), Math.round(P.block)],
      [t('stat.dmgPct'), '+' + U.pct(P.dmgPct)], [t('stat.as'), '+' + U.pct(P.as)], [t('stat.area'), '+' + U.pct(P.area)],
      [t('stat.critPct'), '+' + U.pct(P.critPct)], [t('stat.critBonus'), '+' + U.pct(P.critBonus)], [t('stat.ms'), U.pct(P.ms)],
      [t('stat.regen'), P.regen.toFixed(1)], [t('stat.speedPct'), Math.round(P.speed)], [t('stat.growth'), U.pct(P.growth)],
    ];
    ui.modal({ title: t('pause.title'), closable: false, body: (m) => h('div',
      h('div.center.small.muted', t('stage.' + run.stageId + '.name') + ' · ' + U.fmtTime(run.time) + (run.dread ? ' · ' + t('dread.rank', { n: run.dread }) : '')),
      buildRow(run), traitRow(run),
      h('div.statgrid.three', statRows.map(([k, v]) => h('div', h('span', k), h('b', v)))),
      h('div.col',
        h('button.btn.gold.block', { onclick: () => { click(); m.close(); DH.game.resume(); } }, t('pause.resume')),
        h('button.btn.ghost.block', { onclick: () => { click(); ui.openCharacter(run); } }, A.img('u_bag', 'ci'), ' ', t('inv.title')),
        h('button.btn.ghost.block', { onclick: () => ui.openSettings() }, t('home.settings')),
        h('button.btn.red.block', { onclick: async () => {
          if (await ui.confirm({ title: t('pause.quit'), body: t('pause.quitConfirm'), okCls: 'red', ok: t('pause.quit') })) { m.close(); DH.game.finishRun(run); }
        } }, t('pause.quit')))) });
  };

  /* ---------------- Revive ---------------- */
  ui.openRevive = (run) => {
    DH.input.enable(false);
    let left = 10, done = false, iv;
    const cnt = h('div.num', { style: { fontSize: '26px', color: 'var(--blood-hi)', textAlign: 'center', margin: '8px 0' } }, left);
    const cost = E.REVIVE_GEMS[run.usedGemRevive], gemsLeft = E.REVIVE_GEMS.length - run.usedGemRevive;
    const giveUp = () => { if (done) return; done = true; clearInterval(iv); m.close(); DH.game.finishRun(run); };
    const revived = () => { done = true; clearInterval(iv); m.close(); run.revive(false); DH.input.enable(true); };
    const startTimer = () => { clearInterval(iv); iv = setInterval(() => { left--; cnt.textContent = Math.max(0, left); if (left <= 0) giveUp(); }, 1000); };
    const m = ui.modal({ title: t('revive.title'), closable: false, body: h('div',
      h('div.center.muted', t('revive.desc')), cnt,
      h('div.col',
        !run.usedAdRevive ? h('button.btn.ad.block.shine', { onclick: async () => { clearInterval(iv); if (await DH.ads.rewarded('revive')) { run.usedAdRevive = true; revived(); } else startTimer(); } }, h('span.adtag', 'AD'), t('revive.free')) : null,
        cost == null ? h('div.center.small.muted', t('revive.noMore')) : h('button.btn.gem.block', { onclick: async () => { clearInterval(iv); const ok = await ui.act('reviveGems', { n: run.usedGemRevive }); if (ok) { run.usedGemRevive++; DH.audio.play('buy'); revived(); } else { if (ok === false) ui.toast(t('common.notEnough'), 'bad'); startTimer(); } } }, t('revive.gems'), A.img('i_gem'), cost, h('small', { style: { opacity: 0.75, marginLeft: '6px' } }, t('revive.left', { n: gemsLeft }))),
        h('button.btn.ghost.block', { onclick: () => { click(); giveUp(); } }, t('revive.giveUp')))) });
    startTimer();
  };

  /* ---------------- Results ---------------- */
  ui.openResults = (run, res) => {
    const sum = run.summary(), win = sum.victory;
    const dmg = Object.entries(run.dmgByAb).filter(([k]) => C.abilities[k]).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const maxD = dmg.length ? dmg[0][1] : 1;
    let doubled = false;
    const goldEl = h('span', U.fmt(res.gold));
    const extras = [];
    if (res.gems) extras.push({ icon: 'i_gem', text: '+' + res.gems });
    res.gear.forEach((g) => extras.push({ icon: 'g_' + g.type, text: t('gear.' + g.type), rarity: g.rarity }));
    [sum.wellSent].concat(sum.wellExtra || []).forEach((w) => { if (w) extras.push({ icon: 'g_' + w.type, text: t('well.toKeeper'), rarity: w.rarity }); });
    for (const k in sum.herbs) extras.push({ icon: 'herb_' + k, text: t('herb.' + k) + ' ×' + sum.herbs[k] });
    for (const k in sum.mats || {}) extras.push({ icon: 'mat_' + k, text: t('mat.' + k) + ' ×' + sum.mats[k] });
    if (res.shards) extras.push({ icon: 'shard', text: '+' + res.shards });
    (res.events || []).forEach((e) => extras.push({ icon: e.icon, text: e.name ? e.name + ' +' + e.n : '+' + e.n }));
    (res.artifacts || []).forEach((k) => extras.push({ icon: 'a_' + k, text: t('artifact.' + k + '.name'), rarity: 4 }));
    const dblBtn = h('button.btn.ad.shine', { onclick: async () => {
      if (doubled) return;
      doubled = true; // claim before the ad plays, so a second tap during it cannot ask the server to double again
      const g = await ui.act('doubleRunGold');
      if (g) { goldEl.textContent = U.fmt(res.gold * 2); dblBtn.classList.add('off'); DH.audio.play('coin'); }
      else doubled = false; // the ad was skipped or failed: let them try once more
    } }, h('span.adtag', 'AD'), t('results.double'));
    const hudEl = document.getElementById('hud'); if (hudEl) hudEl.classList.add('hidden'); // the run is over: its bars do not peek over the results
    ui.modal({ closable: false, cls: 'results wide', rays: win, body: (m) => h('div',
      h('div.big.' + (win ? 'win' : 'lose'), win ? t('results.victory') : t('results.defeat')),
      h('div.center.small.muted', t('stage.' + sum.stage + '.name') + (sum.agonyOn ? ' · ' + t('hud.agony') + ' ' + ['0', 'I', 'II', 'III', 'IV', 'V'][sum.agony] : '') + (res.firstClear ? ' · ' + t('results.firstClear') : '')),
      h('div.statgrid',
        h('div', h('span', t('results.time')), h('b', U.fmtTime(sum.time))), h('div', h('span', t('results.kills')), h('b', U.fmt(sum.kills))),
        h('div', h('span', t('results.level')), h('b', sum.level + (sum.lateLevels ? ' (+' + sum.lateLevels + ')' : ''))), h('div', h('span', t('results.bosses')), h('b', sum.bossKills))),
      h('div.goldline', h('span', t('results.goldRun')), h('b', U.fmt(res.goldRun))),
      h('div.goldline', h('span', t('results.goldTime')), h('b', U.fmt(res.timeBonus))),
      res.winBonus ? h('div.goldline', h('span', t('results.goldWin')), h('b', U.fmt(res.winBonus))) : null,
      h('div.goldtotal', A.img('i_gold'), goldEl),
      extras.length ? h('div.reward-list', extras.map((e) => h('div.reward', h('div.slot' + (e.rarity != null ? '.rar' + e.rarity : ''), A.img(e.icon)), h('div.n' + (ui.isWord(e.text) ? '.word' : ''), e.text)))) : null,
      res.rescued ? h('div.center.goldtxt', { style: { fontWeight: 800, margin: '6px 0' } }, A.img('npc_' + res.rescued, 'ci'), ' ' + t('results.rescued', { name: t('npc.' + res.rescued) })) : null,
      res.secret ? h('div.center.goldtxt', { style: { fontWeight: 800, margin: '6px 0' } }, A.img('u_secret', 'ci'), ' ' + t('results.secret', { n: C.HEX.firstShards })) : null,
      res.deeds && res.deeds.length ? h('div.deedsdone', h('div.goldtxt', { style: { fontWeight: 800 } }, t('results.deeds', { n: res.deeds.length, x: Math.round(res.deeds.length * DH.deeds.XP_PER_DEED * 1000) / 10 })), res.deeds.slice(0, 6).map((d) => h('div.small.dd', A.img('u_check', 'ci'), h('span', ui.deedText(d)))), res.deeds.length > 6 ? h('div.small.muted', '…') : null) : null,
      h('div.center.small.muted', t('results.xp', { a: res.accountXp, p: res.passXp })),
      dmg.length ? h('div', { style: { marginTop: '10px' } }, dmg.map(([id, v]) => h('div.dmgrow', A.img('ab_' + id), h('div.dmgcol', h('span.dn', t('ab.' + id + '.name')), h('div.bar', h('i', { style: { width: (v / maxD * 100) + '%' } }))), h('b', U.fmt(v))))) : null,
      h('div.btns', dblBtn, h('button.btn.gold', { onclick: () => { click(); m.close(); DH.game.toMenu(win); } }, t('common.continue')))) });
  };
})(window.DH);
