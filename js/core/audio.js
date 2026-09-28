/* Synthesized audio in a dark, gothic style: everything is generated with WebAudio, so the game ships
 * without audio files. Sound design: heavy low impacts, metallic clinks and clangs, tolling bells,
 * breathy noise, all played through a long, dark reverb shaped like the hall you are in. Each hall
 * has its own slow score (key and mode, drone, choir vowel, lead voice, battle drums and a texture
 * layer); battle adds drums and a low ostinato, and a boss adds brass and heavier drums. Swap in
 * recorded assets later by replacing SFX entries with AudioBuffer playback. */
(function (DH) {
  'use strict';
  let ctx = null, master = null, sfxBus = null, musicBus = null, reverb = null, revOut = null, darkF = null, space = null;
  const last = {};
  let musicState = null;
  const settings = { sfx: 0.8, music: 0.5 };
  const rnd = (a, b) => a + Math.random() * (b - a);

  /** Dark hall impulse: short pre-delay, early reflections, then a tail that loses its highs as it decays.
   *  bright > 1 keeps more of the highs (ice, marble), < 1 swallows them (water, fire, mud). */
  function hallImpulse(seconds, bright) {
    const sr = ctx.sampleRate, len = Math.floor(sr * seconds), buf = ctx.createBuffer(2, len, sr), pre = Math.floor(sr * 0.022), b = bright || 1;
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch); let y = 0;
      for (let i = pre; i < len; i++) {
        const k = (i - pre) / (len - pre), a = Math.min(0.92, (0.55 - 0.5 * k) * b); // one-pole lowpass closing over time
        y += a * ((Math.random() * 2 - 1) - y);
        d[i] = y * Math.pow(1 - k, 3.2) * 1.6;
      }
      for (let r = 0; r < 6; r++) { const at = pre + Math.floor(sr * rnd(0.004, 0.06)); d[at] += (Math.random() < 0.5 ? -1 : 1) * rnd(0.3, 0.6); }
    }
    return buf;
  }

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.95; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5; comp.knee.value = 12;
    comp.connect(master);
    // no chiptune sparkle: effects are darkened before the mix
    darkF = ctx.createBiquadFilter(); darkF.type = 'lowpass'; darkF.frequency.value = 5200; darkF.Q.value = 0.5; darkF.connect(comp);
    sfxBus = ctx.createGain(); sfxBus.gain.value = settings.sfx; sfxBus.connect(darkF);
    musicBus = ctx.createGain(); musicBus.gain.value = settings.music * 0.6; musicBus.connect(comp);
    revOut = ctx.createGain(); revOut.gain.value = 0.42; revOut.connect(comp);
    reverb = ctx.createConvolver(); reverb.buffer = hallImpulse(3.4); reverb.connect(revOut);
    return true;
  }
  /** The acoustic of a hall: its reverb and how dark its effects sound. A new convolver takes the new
   *  sounds while the old one rings out its tails and is then let go. */
  function setSpace(hall) {
    const H = HALL_MUSIC[hall] || HALL_MUSIC.crypt;
    if (!ctx || space === H) return;
    space = H;
    const old = reverb;
    reverb = ctx.createConvolver(); reverb.buffer = hallImpulse(H.rev[0], H.rev[1]); reverb.connect(revOut);
    if (old) setTimeout(() => { try { old.disconnect(); } catch (e) { /* already gone */ } }, 7000);
    darkF.frequency.setTargetAtTime(H.lp, ctx.currentTime, 0.3);
  }

  function unlock() {
    if (!init()) return;
    if (ctx.state === 'suspended') ctx.resume();
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, unlock, { passive: true }));

  let noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    const len = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  /** The reverb input for a voice: a music session sends through its own gate, so stopping it silences its tails too. */
  const revFor = (dest) => (dest && dest._rsend) || reverb;

  /** Oscillator voice. o: {type, f, f2, t, vol, attack, delay, dest, filter, ff, ff2, q, rev, vib, vibRate, detune} */
  function tone(o) {
    const t0 = ctx.currentTime + (o.delay || 0), end = t0 + o.t;
    const osc = ctx.createOscillator(); osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), end);
    if (o.detune) osc.detune.value = o.detune;
    let lfo = null;
    if (o.vib) { lfo = ctx.createOscillator(); lfo.frequency.value = o.vibRate || 5; const lg = ctx.createGain(); lg.gain.value = o.vib; lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t0); lfo.stop(end + 0.1); }
    const g = ctx.createGain(), at = o.attack || 0.005;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t0 + at);
    if (o.hold) g.gain.setValueAtTime(o.vol || 0.2, t0 + at + o.hold);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    let node = osc;
    if (o.filter) {
      const f = ctx.createBiquadFilter(); f.type = o.filter; f.frequency.setValueAtTime(o.ff || 1200, t0);
      if (o.ff2) f.frequency.exponentialRampToValueAtTime(o.ff2, end);
      f.Q.value = o.q || 1; osc.connect(f); node = f;
    }
    node.connect(g); g.connect(o.dest || sfxBus);
    if (o.rev) { const s = ctx.createGain(); s.gain.value = o.rev === true ? 1 : o.rev; g.connect(s); s.connect(revFor(o.dest)); }
    osc.start(t0); osc.stop(end + 0.05);
  }
  /** Filtered noise. o: {t, vol, filter, ff, ff2, q, attack, delay, dest, rev} */
  function burst(o) {
    const t0 = ctx.currentTime + (o.delay || 0), end = t0 + o.t;
    const src = ctx.createBufferSource(); src.buffer = noise();
    const f = ctx.createBiquadFilter(); f.type = o.filter || 'lowpass'; f.frequency.setValueAtTime(o.ff || 1800, t0);
    if (o.ff2) f.frequency.exponentialRampToValueAtTime(o.ff2, end);
    f.Q.value = o.q || 0.7;
    const g = ctx.createGain();
    if (o.attack) { g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(o.vol || 0.3, t0 + o.attack); }
    else g.gain.setValueAtTime(o.vol || 0.3, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    src.connect(f); f.connect(g); g.connect(o.dest || sfxBus);
    if (o.rev) { const s = ctx.createGain(); s.gain.value = o.rev === true ? 1 : o.rev; g.connect(s); s.connect(revFor(o.dest)); }
    src.start(t0, Math.random() * 1.2); src.stop(end + 0.05);
  }
  /** Inharmonic metal (clinks, clangs, bells). ratios of a struck plate / bell. */
  const BELL = [0.5, 1, 1.19, 1.56, 2, 2.51, 2.66, 3.01, 4.1];
  const PLATE = [1, 2.32, 4.25, 6.63];
  function metal(f, t, vol, ratios, o) {
    o = o || {};
    ratios.forEach((r, i) => tone({ type: 'sine', f: f * r, t: t * (1 - i / (ratios.length * 1.6)), vol: vol / (1 + i * 0.55), attack: 0.002, delay: o.delay, dest: o.dest, rev: o.rev }));
  }
  /** Low body impact: pitched thump plus muffled noise. */
  function thud(f, t, vol, o) {
    o = o || {};
    tone({ type: 'sine', f, f2: f * 0.4, t, vol, delay: o.delay, dest: o.dest, rev: o.rev });
    burst({ t: t * 0.7, ff: o.ff || 500, ff2: 90, vol: vol * 0.8, delay: o.delay, dest: o.dest, rev: o.rev });
  }

  /* What a foe is made of decides how it takes a blow and how it dies. Keyed by painter; flesh is the rest. */
  const MAT = {};
  Object.entries({
    bone: 'skeleton shieldskel bonemage gravechief bonetyrant lich',
    metal: 'hknight treasuregolem frostguard clockwork gildedknight vaultwarden sentinel sunkknight twistedknight ashwarlord custodian magistrate bellwarden',
    slime: 'slime gildedooze blightworm',
    spirit: 'ghost bogwraith coinwraith voidcaller syphon anguish',
    stone: 'colossus gargoyle weeper pylon sarcophagus',
    wood: 'treant eldertreant eviltree effigy mimic mimicking',
    chitin: 'spider scarab mosquito frostcrawler',
    ice: 'iceskull frostconstruct iceprism',
    ash: 'husk cinderbloat magmacrawler salamander flamedancer ashcultist',
  }).forEach(([m, list]) => list.split(' ').forEach((p) => { MAT[p] = m; }));

  /** A blow landing on a foe: short and dry, one voice per material. */
  const HIT = {
    flesh(k) { burst({ t: 0.08, ff: 900 * k, ff2: 160, vol: 0.2 }); tone({ type: 'sine', f: 140 * k, f2: 60, t: 0.08, vol: 0.14 }); },
    bone(k) { burst({ t: 0.03, filter: 'bandpass', ff: 2300 * k, q: 3, vol: 0.2 }); tone({ type: 'triangle', f: 620 * k, f2: 380, t: 0.035, vol: 0.05 }); thud(110, 0.06, 0.08); },
    metal(k) { burst({ t: 0.04, filter: 'bandpass', ff: 2600 * k, q: 2, vol: 0.16 }); metal(rnd(480, 620), 0.07, 0.03, PLATE); thud(120, 0.07, 0.1); },
    slime(k) { tone({ type: 'sine', f: 320 * k, f2: 110, t: 0.09, vol: 0.12 }); burst({ t: 0.08, ff: 650, ff2: 150, vol: 0.14 }); },
    spirit(k) { burst({ t: 0.13, filter: 'bandpass', ff: 1700 * k, ff2: 600, q: 2, vol: 0.12, attack: 0.02 }); tone({ type: 'sine', f: 520 * k, f2: 300, t: 0.1, vol: 0.03 }); },
    stone(k) { burst({ t: 0.05, filter: 'bandpass', ff: 1400 * k, q: 1.5, vol: 0.2 }); burst({ t: 0.02, filter: 'highpass', ff: 3200, vol: 0.08, delay: 0.01 }); thud(90, 0.07, 0.1); },
    wood(k) { tone({ type: 'triangle', f: 230 * k, f2: 170, t: 0.06, vol: 0.12 }); burst({ t: 0.05, filter: 'bandpass', ff: 850 * k, q: 4, vol: 0.14 }); },
    chitin(k) { burst({ t: 0.03, filter: 'highpass', ff: 2600, vol: 0.12 }); burst({ t: 0.045, filter: 'bandpass', ff: 1250 * k, q: 3, vol: 0.14, delay: 0.008 }); },
    ice(k) { burst({ t: 0.04, filter: 'highpass', ff: 3600 * k, vol: 0.12 }); burst({ t: 0.03, filter: 'bandpass', ff: 2100 * k, q: 5, vol: 0.08 }); thud(130, 0.05, 0.07); },
    ash(k) { burst({ t: 0.1, ff: 1300 * k, ff2: 200, vol: 0.16 }); for (let i = 0; i < 2; i++) burst({ t: 0.015, filter: 'highpass', ff: 2400, vol: 0.05, delay: rnd(0.01, 0.07) }); },
  };
  /** A foe dying: a little longer, with the sound of its body coming apart. */
  const DIE = {
    flesh(k) {
      burst({ t: 0.18, filter: 'bandpass', ff: 520 * k, ff2: 160, q: 1.4, vol: 0.28 }); tone({ type: 'sine', f: 95 * k, f2: 38, t: 0.16, vol: 0.18 });
      burst({ t: 0.16, filter: 'bandpass', ff: 750, ff2: 220, q: 1, vol: 0.1, delay: 0.04 }); // wet
      if (Math.random() < 0.3) burst({ t: 0.03, filter: 'highpass', ff: 2200, vol: 0.1, delay: 0.02 }); // a crack
    },
    bone(k) { // a clatter of bones falling to the floor
      thud(80 * k, 0.12, 0.14);
      const n = 4 + (Math.random() * 3 | 0);
      for (let i = 0; i < n; i++) burst({ t: 0.025, filter: 'bandpass', ff: rnd(1500, 3400), q: 4, vol: rnd(0.08, 0.16), delay: 0.02 + i * rnd(0.035, 0.07) });
    },
    metal(k) { // armour crashing down
      thud(70 * k, 0.25, 0.26);
      burst({ t: 0.25, filter: 'bandpass', ff: 1800 * k, ff2: 700, q: 1.2, vol: 0.14 });
      for (let i = 0; i < 3; i++) metal(rnd(330, 520), 0.1, 0.03, PLATE, { delay: 0.05 + i * rnd(0.06, 0.12) });
    },
    slime(k) { // a splat and a few bubbles
      burst({ t: 0.3, ff: 900 * k, ff2: 140, vol: 0.24 }); tone({ type: 'sine', f: 230 * k, f2: 70, t: 0.25, vol: 0.16 });
      for (let i = 0; i < 3; i++) { const f = rnd(200, 420); tone({ type: 'sine', f, f2: f * 1.7, t: 0.06, vol: 0.04, delay: 0.1 + i * rnd(0.05, 0.1) }); }
    },
    spirit(k) { // a wail blown away
      tone({ type: 'sawtooth', f: 620 * k, f2: 190, t: 0.5, vol: 0.05, attack: 0.03, filter: 'bandpass', ff: 900, q: 5, vib: 12, vibRate: 7, rev: 0.6 });
      burst({ t: 0.5, filter: 'bandpass', ff: 2100, ff2: 400, q: 1.5, vol: 0.12, attack: 0.05, rev: 0.4 });
    },
    stone(k) { // crumbling rock
      thud(60 * k, 0.3, 0.26); burst({ t: 0.45, ff: 1500 * k, ff2: 200, vol: 0.2 });
      for (let i = 0; i < 5; i++) burst({ t: 0.02, filter: 'highpass', ff: rnd(2000, 3500), vol: 0.06, delay: rnd(0.02, 0.35) });
    },
    wood(k) { // a crack and a groan of timber
      burst({ t: 0.1, filter: 'bandpass', ff: 950 * k, q: 2, vol: 0.2 }); thud(75, 0.2, 0.16, { delay: 0.03 });
      tone({ type: 'sawtooth', f: 110 * k, f2: 70, t: 0.35, vol: 0.05, filter: 'bandpass', ff: 420, q: 6, vib: 10, vibRate: 22, delay: 0.05 });
    },
    chitin(k) { // a shell crunched, then the squish inside
      for (let i = 0; i < 3; i++) burst({ t: 0.03, filter: 'bandpass', ff: rnd(1400, 2600), q: 3, vol: 0.13, delay: i * 0.03 });
      burst({ t: 0.15, filter: 'bandpass', ff: 420 * k, q: 1.2, vol: 0.14, delay: 0.07 });
    },
    ice(k) { // shattering: noise shards only, so it cannot ring
      thud(90 * k, 0.12, 0.12); burst({ t: 0.25, filter: 'highpass', ff: 2500, ff2: 5000, vol: 0.12 });
      for (let i = 0; i < 5; i++) burst({ t: 0.02, filter: 'bandpass', ff: rnd(3000, 5200), q: 6, vol: 0.08, delay: rnd(0.02, 0.25) });
    },
    ash(k) { // a gust of embers
      burst({ t: 0.4, ff: 800 * k, ff2: 100, vol: 0.22 }); tone({ type: 'sine', f: 80 * k, f2: 34, t: 0.25, vol: 0.14 });
      for (let i = 0; i < 5; i++) burst({ t: 0.015, filter: 'highpass', ff: rnd(1800, 3200), vol: 0.06, delay: rnd(0.03, 0.4) });
    },
  };

  /** A foe's cry (a boss arriving, enraging, calling its brood): the voice of its material. */
  const ROAR = {
    flesh(k) { // a beast's roar
      tone({ type: 'sawtooth', f: 78 * k, f2: 42, t: 1.5, vol: 0.28, attack: 0.08, filter: 'bandpass', ff: 420, q: 2.5, vib: 6, vibRate: 11, rev: 0.8 });
      tone({ type: 'sawtooth', f: 117 * k, f2: 60, t: 1.2, vol: 0.12, attack: 0.1, filter: 'lowpass', ff: 700, vib: 8, vibRate: 7 });
      burst({ t: 1.3, ff: 600, ff2: 120, vol: 0.28, attack: 0.08, rev: 0.8 });
    },
    bone(k) { // a dry, rattling shriek over clattering bones
      tone({ type: 'sawtooth', f: 330 * k, f2: 170, t: 1.1, vol: 0.12, attack: 0.05, filter: 'bandpass', ff: 1300, q: 4, vib: 20, vibRate: 31, rev: 0.8 });
      burst({ t: 1, filter: 'bandpass', ff: 1800, ff2: 700, q: 2, vol: 0.12, attack: 0.06, rev: 0.6 });
      for (let i = 0; i < 8; i++) burst({ t: 0.02, filter: 'bandpass', ff: rnd(1600, 3400), q: 4, vol: 0.08, delay: i * rnd(0.05, 0.1) });
    },
    metal(k) { // armour grinding, a hollow bellow from inside a helm
      tone({ type: 'sawtooth', f: 62 * k, f2: 44, t: 1.4, vol: 0.24, attack: 0.1, filter: 'bandpass', ff: 380, q: 5, vib: 4, vibRate: 9, rev: 0.7 });
      burst({ t: 1.2, filter: 'bandpass', ff: 2600, ff2: 1400, q: 7, vol: 0.1, attack: 0.15, rev: 0.5 });
      for (let i = 0; i < 3; i++) metal(rnd(300, 450), 0.12, 0.04, PLATE, { delay: 0.1 + i * rnd(0.2, 0.35) });
    },
    slime(k) { // a deep gurgle
      tone({ type: 'sine', f: 120 * k, f2: 55, t: 1.2, vol: 0.26, attack: 0.08, vib: 25, vibRate: 17, rev: 0.6 });
      burst({ t: 1.1, ff: 420, ff2: 90, vol: 0.22, attack: 0.1 });
      for (let i = 0; i < 6; i++) { const f = rnd(150, 380); tone({ type: 'sine', f, f2: f * 1.8, t: 0.07, vol: 0.05, delay: rnd(0.1, 1) }); }
    },
    spirit(k) { // a wail that rises and falls away
      [-12, 10].forEach((dt) => tone({ type: 'sawtooth', f: 480 * k, f2: 260, t: 1.8, vol: 0.06, attack: 0.3, filter: 'bandpass', ff: 1000, q: 6, vib: 18, vibRate: 5.5, detune: dt, rev: 1 }));
      burst({ t: 1.6, filter: 'bandpass', ff: 2200, ff2: 700, q: 1.5, vol: 0.1, attack: 0.4, rev: 1 });
    },
    stone(k) { // rock grinding on rock
      burst({ t: 1.6, ff: 260 * k, ff2: 60, vol: 0.3, attack: 0.15, rev: 0.7 }); tone({ type: 'sine', f: 46 * k, f2: 32, t: 1.4, vol: 0.2, attack: 0.1, vib: 3, vibRate: 13 });
      for (let i = 0; i < 7; i++) burst({ t: 0.02, filter: 'highpass', ff: rnd(1800, 3200), vol: 0.05, delay: rnd(0.1, 1.3) });
    },
    wood(k) { // a long groan of timber and a crack
      tone({ type: 'sawtooth', f: 72 * k, f2: 50, t: 1.6, vol: 0.12, attack: 0.2, filter: 'bandpass', ff: 360, q: 8, vib: 14, vibRate: 24, rev: 0.7 });
      tone({ type: 'sawtooth', f: 108 * k, f2: 80, t: 1.2, vol: 0.05, attack: 0.3, filter: 'bandpass', ff: 520, q: 9, vib: 10, vibRate: 19 });
      burst({ t: 0.08, filter: 'bandpass', ff: 1000, q: 2, vol: 0.18, delay: 1.1 }); thud(70, 0.25, 0.14, { delay: 1.1 });
    },
    chitin(k) { // a chittering screech
      burst({ t: 1, filter: 'bandpass', ff: 3200 * k, ff2: 2200, q: 6, vol: 0.1, attack: 0.05, rev: 0.4 });
      for (let i = 0; i < 24; i++) burst({ t: 0.012, filter: 'bandpass', ff: rnd(1800, 3000), q: 5, vol: 0.08, delay: i * 0.035 });
    },
    ice(k) { // a cold, howling gust with cracking ice
      burst({ t: 1.6, filter: 'bandpass', ff: 1300 * k, ff2: 500, q: 3, vol: 0.18, attack: 0.25, rev: 0.8 }); tone({ type: 'sine', f: 60 * k, f2: 40, t: 1.2, vol: 0.14, attack: 0.1 });
      for (let i = 0; i < 6; i++) burst({ t: 0.02, filter: 'bandpass', ff: rnd(3000, 5000), q: 6, vol: 0.07, delay: rnd(0.1, 1.2) });
    },
    ash(k) { // a roar that comes with a rush of flame
      ROAR.flesh(k * 0.9);
      burst({ t: 1.2, ff: 1100, ff2: 200, vol: 0.14, attack: 0.1 });
      for (let i = 0; i < 8; i++) burst({ t: 0.015, filter: 'highpass', ff: rnd(1800, 3200), vol: 0.06, delay: rnd(0.05, 1.1) });
    },
  };

  const SFX = {
    hit(painter) { (HIT[MAT[painter]] || HIT.flesh)(rnd(0.9, 1.1)); },
    kill(painter) { (DIE[MAT[painter]] || DIE.flesh)(rnd(0.9, 1.1)); },
    xp() { const f = [440, 523, 587, 659, 784][Math.random() * 5 | 0]; tone({ type: 'sine', f, t: 0.22, vol: 0.035, rev: 0.4 }); tone({ type: 'sine', f: f * 2.76, t: 0.08, vol: 0.01 }); },
    coin() { const f = rnd(1050, 1250); metal(f, 0.28, 0.05, PLATE); metal(f * 1.06, 0.2, 0.035, PLATE, { delay: 0.05 }); },
    levelup() {
      // a dark choir swell: A minor add9 rising out of the dark, then a bell
      [57, 60, 64, 69, 71].forEach((n, i) => { const f = midi(n); tone({ type: 'sawtooth', f, t: 1.8, vol: 0.05, attack: 0.5, filter: 'lowpass', ff: 400, ff2: 2400, q: 2, rev: true, delay: i * 0.03, detune: (i % 2 ? 6 : -6) }); });
      metal(220, 2.4, 0.08, BELL, { rev: true, delay: 0.35 });
    },
    hurt() { // a blow that lands on the body: a dull punch into flesh, a short grunt, sometimes a crack; dry, close, never ringing
      const k = rnd(0.88, 1.12);
      tone({ type: 'sine', f: 120 * k, f2: 48, t: 0.2, vol: 0.3 });
      burst({ t: 0.13, ff: 1100 * k, ff2: 140, vol: 0.3 });
      tone({ type: 'sawtooth', f: 150 * k, f2: 100 * k, t: 0.17, vol: 0.07, attack: 0.012, filter: 'lowpass', ff: 700, ff2: 300, q: 0.7 });
      burst({ t: 0.16, filter: 'bandpass', ff: 520 * k, q: 1.2, vol: 0.08, attack: 0.015, delay: 0.01 });
      if (Math.random() < 0.35) burst({ t: 0.025, filter: 'highpass', ff: 1800, vol: 0.07, delay: 0.005 });
    },
    swing() { const k = rnd(0.85, 1.15); burst({ t: 0.22 * k, filter: 'bandpass', ff: 380 * k, ff2: 1100 * k, q: 1.6, vol: 0.2, attack: 0.05 }); },
    bow() { const k = rnd(0.9, 1.1); tone({ type: 'triangle', f: 196 * k, f2: 98, t: 0.16, vol: 0.14 }); burst({ t: 0.12, filter: 'bandpass', ff: 1400 * k, ff2: 500, q: 2, vol: 0.08 }); },
    fire() { burst({ t: 0.4, ff: 900, ff2: 180, vol: 0.22, attack: 0.04 }); for (let i = 0; i < 3; i++) burst({ t: 0.02, filter: 'highpass', ff: 1800, vol: 0.05, delay: rnd(0.02, 0.3) }); },
    thunder() { // a crack overhead, then the long roll of thunder
      burst({ t: 0.25, filter: 'highpass', ff: 1400, ff2: 500, vol: 0.12 });
      burst({ t: 2.8, ff: 420, ff2: 45, vol: 0.32, attack: 0.08, rev: 0.9, delay: 0.1 }); tone({ type: 'sine', f: 52, f2: 30, t: 2.2, vol: 0.2, attack: 0.1, delay: 0.1 });
    },
    rumble() { burst({ t: 1.8, ff: 180, ff2: 50, vol: 0.26, attack: 0.35, rev: 0.6 }); tone({ type: 'sine', f: 40, f2: 32, t: 1.6, vol: 0.16, attack: 0.3, vib: 3, vibRate: 9 }); },
    gust() { burst({ t: 2.2, filter: 'bandpass', ff: 380, ff2: 900, q: 0.8, vol: 0.09, attack: 0.8 }); },
    gun() { // a black-powder shot: a sharp crack and a rolling report
      burst({ t: 0.05, filter: 'highpass', ff: 2200, vol: 0.2 }); burst({ t: 0.5, ff: 1400, ff2: 90, vol: 0.3, rev: 0.5, delay: 0.01 }); tone({ type: 'sine', f: 110, f2: 40, t: 0.3, vol: 0.2 });
    },
    boom() { burst({ t: 0.9, ff: 900, ff2: 40, vol: 0.4, rev: 0.7 }); tone({ type: 'sine', f: 70, f2: 24, t: 0.8, vol: 0.34 }); },
    zap() { tone({ type: 'sawtooth', f: rnd(650, 800), f2: 90, t: 0.22, vol: 0.09, filter: 'lowpass', ff: 1900 }); for (let i = 0; i < 4; i++) burst({ t: 0.03, filter: 'bandpass', ff: rnd(1500, 3000), q: 3, vol: 0.12, delay: i * 0.035 }); },
    frost() { // ice forming: a cold hiss and crackling shards, all noise so nothing rings
      burst({ t: 0.35, filter: 'bandpass', ff: 1800, ff2: 4200, q: 1.5, vol: 0.12, attack: 0.04, rev: 0.3 });
      burst({ t: 0.18, filter: 'highpass', ff: 2600, vol: 0.08 });
      for (let i = 0; i < 5; i++) burst({ t: 0.018, filter: 'bandpass', ff: rnd(2800, 5000), q: 6, vol: rnd(0.05, 0.09), delay: rnd(0.02, 0.3) });
      thud(140, 0.08, 0.06);
    },
    bell() { metal(rnd(150, 170), 3.2, 0.14, BELL, { rev: 1 }); thud(70, 0.4, 0.2); }, // the Bell Warden's toll
    splash() { burst({ t: 0.35, filter: 'bandpass', ff: 900, ff2: 250, q: 0.9, vol: 0.22 }); for (let i = 0; i < 4; i++) tone({ type: 'sine', f: rnd(300, 700), f2: rnd(900, 1400), t: 0.07, vol: 0.04, delay: 0.05 + i * rnd(0.04, 0.09) }); },
    throw() { const k = rnd(0.85, 1.15); burst({ t: 0.14, filter: 'bandpass', ff: 700 * k, ff2: 300 * k, q: 1.8, vol: 0.14, attack: 0.03 }); },
    glass() { // clay urn shattering
      burst({ t: 0.16, filter: 'bandpass', ff: 1100, ff2: 400, q: 1.2, vol: 0.2 });
      for (let i = 0; i < 4; i++) burst({ t: 0.025, filter: 'bandpass', ff: rnd(1200, 2600), q: 4, vol: 0.08, delay: rnd(0.02, 0.18) });
    },
    chest() { // heavy lid creak, latch, dark chime
      tone({ type: 'sawtooth', f: 70, f2: 95, t: 0.5, vol: 0.08, filter: 'bandpass', ff: 320, q: 6, vib: 9, vibRate: 23 });
      thud(90, 0.25, 0.22, { delay: 0.45 });
      metal(330, 1.8, 0.07, BELL, { rev: true, delay: 0.5 });
    },
    click() { burst({ t: 0.04, filter: 'bandpass', ff: 900, q: 2, vol: 0.12 }); tone({ type: 'sine', f: 260, f2: 170, t: 0.05, vol: 0.06 }); },
    buy() { metal(1150, 0.3, 0.05, PLATE); metal(1010, 0.3, 0.05, PLATE, { delay: 0.07 }); thud(120, 0.15, 0.12, { delay: 0.1 }); },
    error() { thud(110, 0.14, 0.16); thud(82, 0.2, 0.16, { delay: 0.12 }); },
    roar(painter) { (ROAR[MAT[painter]] || ROAR.flesh)(rnd(0.92, 1.08)); },
    victory() { // minor turning to major (Picardy third), then bells
      const ch = (ns, d, len) => ns.forEach((n, i) => tone({ type: 'sawtooth', f: midi(n), t: len, vol: 0.045, attack: 0.4, filter: 'lowpass', ff: 1400, q: 1.5, rev: true, delay: d, detune: (i % 2 ? 5 : -5) }));
      ch([45, 57, 60, 64], 0, 1.4); ch([41, 57, 60, 65], 1.0, 1.4); ch([45, 57, 61, 64, 69], 2.0, 3);
      metal(220, 3.5, 0.08, BELL, { rev: true, delay: 2.0 }); metal(330, 3, 0.05, BELL, { rev: true, delay: 2.4 });
    },
    defeat() { // slow funeral toll
      [0, 1.4, 2.8].forEach((d, i) => metal(i === 2 ? 98 : 110, 4, 0.1, BELL, { rev: true, delay: d }));
      tone({ type: 'sawtooth', f: midi(33), t: 4.5, vol: 0.06, attack: 1, filter: 'lowpass', ff: 300, rev: true });
    },
    heal() { [69, 72, 76].forEach((n, i) => tone({ type: 'sine', f: midi(n), t: 0.9, vol: 0.05, attack: 0.15, rev: true, delay: i * 0.08 })); burst({ t: 0.6, filter: 'bandpass', ff: 2400, q: 2, vol: 0.03, attack: 0.2 }); },
    block() { // a blow caught on a shield: a heavy thunk and a short, damped clank that does not ring on
      const k = rnd(0.9, 1.1);
      tone({ type: 'sine', f: 170 * k, f2: 90, t: 0.12, vol: 0.2 });
      burst({ t: 0.07, filter: 'bandpass', ff: 1300 * k, ff2: 500, q: 1.4, vol: 0.18 });
      metal(rnd(300, 360), 0.09, 0.035, PLATE);
    },
    reward() { metal(440, 1.6, 0.07, BELL, { rev: true }); metal(660, 1.4, 0.05, BELL, { rev: true, delay: 0.18 }); },

    /* ---- the hero's abilities: each weapon its own voice ---- */
    wisp() { // grave spirits: a breath rising, a faint moan under it
      const k = rnd(0.9, 1.1);
      burst({ t: 0.35, filter: 'bandpass', ff: 700 * k, ff2: 1900 * k, q: 2.5, vol: 0.09, attack: 0.08, rev: 0.6 });
      tone({ type: 'sine', f: 220 * k, f2: 180, t: 0.4, vol: 0.025, attack: 0.1, vib: 6, vibRate: 6, rev: 0.6 });
    },
    arcane() { // a slow orb: a low hum that swells, with a shimmer of air
      const k = rnd(0.95, 1.05);
      [110, 165].forEach((f, i) => tone({ type: 'sine', f: f * k, t: 0.6, vol: i ? 0.04 : 0.07, attack: 0.15, vib: 3, vibRate: 7, rev: 0.5 }));
      burst({ t: 0.5, filter: 'bandpass', ff: 1500, ff2: 2600, q: 4, vol: 0.05, attack: 0.2 });
    },
    blood() { // blood pulse: two heavy heartbeats and a wet swell
      tone({ type: 'sine', f: 70, f2: 38, t: 0.25, vol: 0.3 }); tone({ type: 'sine', f: 58, f2: 34, t: 0.22, vol: 0.2, delay: 0.16 });
      burst({ t: 0.4, filter: 'bandpass', ff: 480, ff2: 180, q: 1.2, vol: 0.14, attack: 0.03, rev: 0.4 });
    },
    flask() { // a flask thrown: a glass clink and the slosh inside
      burst({ t: 0.03, filter: 'bandpass', ff: rnd(2600, 3400), q: 6, vol: 0.1 });
      burst({ t: 0.18, filter: 'bandpass', ff: 650, ff2: 380, q: 2, vol: 0.1, attack: 0.03, delay: 0.02 });
      burst({ t: 0.14, filter: 'bandpass', ff: 520, ff2: 700, q: 2, vol: 0.07, attack: 0.03, delay: 0.12 });
    },
    hex() { // a hex lance: a dark hiss drawn out, a low growl beneath
      burst({ t: 0.28, filter: 'bandpass', ff: 900, ff2: 2300, q: 4, vol: 0.1, attack: 0.02, rev: 0.4 });
      tone({ type: 'sawtooth', f: rnd(52, 60), f2: 40, t: 0.3, vol: 0.08, filter: 'lowpass', ff: 320, q: 2 });
    },
    blade() { // spinning blades: a whirr of three passes and a scrape of steel
      const k = rnd(0.9, 1.1);
      [0, 0.06, 0.12].forEach((d, i) => burst({ t: 0.06, filter: 'bandpass', ff: (800 + i * 350) * k, q: 3, vol: 0.09, delay: d }));
      burst({ t: 0.05, filter: 'highpass', ff: 3800, vol: 0.04, delay: 0.02 });
    },
    dart() { // a needle: one quick hiss through the air
      burst({ t: 0.06, filter: 'bandpass', ff: rnd(2300, 2900), ff2: 1200, q: 2, vol: 0.08 });
    },
    phantom() { // phantom knights called: a ghostly horn under whispers
      const k = rnd(0.95, 1.05);
      tone({ type: 'sawtooth', f: 110 * k, t: 1.3, vol: 0.07, attack: 0.25, filter: 'bandpass', ff: 520, q: 6, vib: 4, vibRate: 5, rev: 1 });
      tone({ type: 'sawtooth', f: 165 * k, t: 1.1, vol: 0.035, attack: 0.3, filter: 'bandpass', ff: 700, q: 6, vib: 4, vibRate: 5.5, rev: 1 });
      burst({ t: 1.2, filter: 'bandpass', ff: 2200, ff2: 1300, q: 5, vol: 0.04, attack: 0.4, rev: 1 });
    },
    punch() { // phantom fists: a rush of air and a hollow impact
      burst({ t: 0.1, filter: 'bandpass', ff: 500, ff2: 1300, q: 2, vol: 0.12, attack: 0.02 });
      thud(rnd(85, 105), 0.12, 0.18, { delay: 0.06 });
    },
    storm() { // lightning called down: a crack overhead and a short roll
      burst({ t: 0.06, filter: 'highpass', ff: 2200, vol: 0.14 });
      for (let i = 0; i < 3; i++) burst({ t: 0.025, filter: 'bandpass', ff: rnd(1500, 3000), q: 3, vol: 0.08, delay: 0.02 + i * 0.03 });
      burst({ t: 0.6, ff: 350, ff2: 60, vol: 0.14, attack: 0.03, rev: 0.5, delay: 0.04 });
    },
    axe() { // heavy axes: a deep whump, whump as they turn
      const k = rnd(0.9, 1.1);
      [0, 0.09, 0.18].forEach((d, i) => burst({ t: 0.08, filter: 'bandpass', ff: (320 + i * 60) * k, q: 2, vol: 0.12 - i * 0.02, delay: d }));
    },
    plague() { // a plague flask: glass and something bubbling inside
      burst({ t: 0.03, filter: 'bandpass', ff: rnd(2400, 3000), q: 6, vol: 0.09 });
      for (let i = 0; i < 4; i++) { const f = rnd(140, 300); tone({ type: 'sine', f, f2: f * 1.7, t: 0.06, vol: 0.04, delay: 0.04 + i * rnd(0.04, 0.08) }); }
      burst({ t: 0.2, filter: 'bandpass', ff: 420, q: 1.5, vol: 0.06, attack: 0.05 });
    },
    deathwall() { // the wall of the dead: a low choir of the dead and bones rising
      [45, 52, 57].forEach((n, i) => tone({ type: 'sawtooth', f: midi(n), t: 1.6, vol: 0.05, attack: 0.3, filter: 'bandpass', ff: 480, q: 4, vib: 4, vibRate: 5, detune: i * 7 - 7, rev: 1 }));
      for (let i = 0; i < 8; i++) burst({ t: 0.02, filter: 'bandpass', ff: rnd(1500, 3200), q: 4, vol: 0.07, delay: rnd(0.1, 1) });
      thud(55, 0.5, 0.2);
    },
    thorns() { // thorny roots: a rustle breaking through the ground and a creak of wood
      for (let i = 0; i < 6; i++) burst({ t: 0.03, filter: 'bandpass', ff: rnd(1800, 3200), q: 1.5, vol: 0.06, delay: rnd(0, 0.2) });
      tone({ type: 'sawtooth', f: rnd(80, 100), f2: 70, t: 0.3, vol: 0.05, filter: 'bandpass', ff: 420, q: 8, vib: 12, vibRate: 22 });
      thud(90, 0.12, 0.12);
    },
    prism() { // a charge leaping between foes: dry crackles, no ringing
      for (let i = 0; i < 5; i++) burst({ t: 0.02, filter: 'bandpass', ff: rnd(2000, 4200), q: 4, vol: 0.09, delay: i * 0.03 });
      burst({ t: 0.18, filter: 'highpass', ff: 3000, ff2: 1500, vol: 0.05 });
    },
  };
  const MIN_GAP = { block: 0.08, hit: 0.05, xp: 0.04, kill: 0.06, coin: 0.06, swing: 0.07, bow: 0.05, fire: 0.1, throw: 0.07, zap: 0.1, glass: 0.08, boom: 0.1, gun: 0.08, roar: 0.4,
    wisp: 0.08, arcane: 0.2, blood: 0.3, flask: 0.08, hex: 0.08, blade: 0.08, dart: 0.05, phantom: 0.6, punch: 0.07, storm: 0.1, axe: 0.1, plague: 0.1, deathwall: 0.8, thorns: 0.12, prism: 0.1 };

  /* ---------------- Music ---------------- */
  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  const HARM = [0, 2, 3, 5, 7, 8, 11], AEOL = [0, 2, 3, 5, 7, 8, 10], PHRY = [0, 1, 3, 5, 7, 8, 10], LOCR = [0, 1, 3, 5, 6, 8, 10];
  // a chord: [bass offset, ...voice offsets] from the hall's root
  const m = (o) => [o, o, o + 3, o + 7], M = (o) => [o, o, o + 4, o + 7], dim = (o) => [o, o, o + 3, o + 6];
  const VOWEL = { ah: [700, 1150], oh: [480, 860], oo: [360, 720], ee: [300, 2250] };
  /* Every hall has its own score.
   * root: tonic of the chord voices (midi); scale: the mode the lead walks in; mel: scale degrees of the lead;
   * progs: two cycles of four chords (two bars each) that alternate every 16 bars, so the loop runs long;
   * drone: [offset, wave, level] under a breathing lowpass at dlp; vowel: the choir; lead: the melodic voice;
   * kit: battle drums; ost: the eighths of a bar the low ostinato plays in battle (oct: jump the octave);
   * tex: a continuous texture layer; toll: the bell at the top of each cycle; rev: [reverb seconds, brightness];
   * lp: lowpass on the effects bus; wind: [band Hz, level]; menu: tempo out of battle.
   * Battle tempo is 76 in every hall: the Skald's songs are synced to it. */
  const HALL_MUSIC = {
    // lute and war drums under a tolling bell, A harmonic minor with a Neapolitan turn
    crypt: { root: 57, scale: HARM, mel: [4, 3, 2, 3, 4, 5, 6, 4, 2, 1, 0, 0], progs: [[m(0), M(-4), m(-7), M(-5)], [m(0), M(1), M(-5), m(0)]],
      drone: [[-24, 'sawtooth', 1], [-17, 'sawtooth', 0.8], [-18, 'sine', 0.18]], dlp: 240, vowel: 'ah', lead: 'pluck', kit: 'war', ost: [1, 1, 1, 1, 1, 1, 1, 1], oct: true,
      tex: null, toll: 45, rev: [3.4, 1], lp: 5000, wind: [500, 0.04], menu: 48 },
    // E phrygian: the flat second grinds under growling low brass, anvils and a roar of embers
    abyss: { root: 52, scale: PHRY, mel: [0, 1, 0, 3, 2, 1, 0, 4, 3, 1, 0, 0], progs: [[m(0), M(1), m(0), m(-2)], [m(0), M(-4), M(1), dim(-5)]],
      drone: [[-24, 'sawtooth', 1], [-17, 'sawtooth', 0.7], [-23, 'sine', 0.22]], dlp: 190, vowel: 'oh', lead: 'brass', kit: 'forge', ost: [1, 0, 0, 1, 0, 0, 1, 0], oct: false,
      tex: 'embers', toll: 40, rev: [4.2, 0.7], lp: 4200, wind: [300, 0.03], menu: 44 },
    // D minor under water: drowned bells with echoes, muffled drums and a slow current
    aqueduct: { root: 50, scale: AEOL, mel: [4, 2, 0, 1, 2, 4, 5, 4, 2, 1, 0, 1], progs: [[m(0), M(-2), M(-4), M(-5)], [m(0), m(-5), M(-4), m(-7)]],
      drone: [[-24, 'sawtooth', 0.8], [-17, 'sine', 0.9], [-12, 'sine', 0.25]], dlp: 230, vowel: 'oo', lead: 'bell', kit: 'water', ost: [1, 0, 0, 0, 1, 0, 0, 0], oct: false,
      tex: 'flow', toll: 38, rev: [5.2, 0.85], lp: 4600, wind: [700, 0.03], menu: 42 },
    // B minor in the ice: a glass harmonica, bone clicks and a cold high shimmer
    catacombs: { root: 59, scale: AEOL, mel: [4, 5, 4, 2, 0, 1, 2, 4, 6, 4, 2, 0], progs: [[m(0), M(-4), M(3), M(-5)], [m(0), m(-7), m(0), M(-5)]],
      drone: [[-24, 'sawtooth', 0.9], [-17, 'sawtooth', 0.6], [-23, 'sine', 0.15]], dlp: 320, vowel: 'oo', lead: 'glass', kit: 'bone', ost: [1, 0, 1, 0, 1, 0, 1, 1], oct: true,
      tex: 'frost', toll: 47, rev: [3.8, 1.35], lp: 6000, wind: [900, 0.045], menu: 44 },
    // C locrian: diminished chords, a tritone in the drone, bending bells, a lopsided 3+3+2 beat
    discord: { root: 48, scale: LOCR, mel: [0, 4, 1, 6, 3, 0, 5, 2, 4, 1, 0, 6], progs: [[dim(0), M(1), m(-2), M(-6)], [dim(0), M(-4), M(6), M(1)]],
      drone: [[-24, 'sawtooth', 1], [-18, 'sawtooth', 0.6], [-23, 'sine', 0.3]], dlp: 260, vowel: 'ee', lead: 'warp', kit: 'odd', ost: [1, 0, 0, 1, 0, 1, 0, 0], oct: true,
      tex: 'throb', toll: 36, rev: [4.6, 0.9], lp: 5000, wind: [1200, 0.025], menu: 40 },
    // G minor in the bog: a nasal reed, a heartbeat for drums and a swarm that comes and goes
    blightmire: { root: 55, scale: AEOL, mel: [0, 1, 0, 2, 1, 0, 4, 3, 1, 0, 1, 0], progs: [[m(0), M(1), m(0), M(-2)], [m(0), m(-7), M(-4), M(-5)]],
      drone: [[-24, 'sawtooth', 1], [-17, 'sawtooth', 0.7], [-11, 'sine', 0.14]], dlp: 210, vowel: 'oh', lead: 'reed', kit: 'heart', ost: [1, 0, 0, 0, 0, 0, 1, 0], oct: false,
      tex: 'buzz', toll: 43, rev: [2.4, 0.6], lp: 3800, wind: [350, 0.035], menu: 40 },
    // F# harmonic minor in a fallen sanctuary: a pipe organ, processional timpani, a great bell
    reliquary: { root: 54, scale: HARM, mel: [4, 3, 4, 5, 6, 4, 3, 2, 1, 2, 0, 0], progs: [[m(0), M(-4), m(-7), M(-5)], [m(0), M(1), M(-5), m(0)]],
      drone: [[-24, 'sawtooth', 0.8], [-17, 'sawtooth', 0.7], [-12, 'square', 0.12]], dlp: 260, vowel: 'ah', lead: 'organ', kit: 'procession', ost: [1, 0, 1, 0, 1, 0, 1, 0], oct: true,
      tex: null, toll: 42, rev: [5.6, 1.1], lp: 5600, wind: [450, 0.03], menu: 46 },
  };

  /** Formant "choir" voice: detuned saws through two vowel formants. */
  function choir(n, start, len, vol, dest, vowel) {
    const t0 = ctx.currentTime + start, end = t0 + len, fm = VOWEL[vowel] || VOWEL.ah;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + len * 0.35); g.gain.setValueAtTime(vol, end - len * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, end);
    const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = fm[0]; f1.Q.value = 5;
    const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = fm[1]; f2.Q.value = 7;
    const mixG = ctx.createGain(); mixG.gain.value = 1;
    f1.connect(mixG); f2.connect(mixG); mixG.connect(g); g.connect(dest); const s = ctx.createGain(); s.gain.value = 0.9; g.connect(s); s.connect(revFor(dest));
    [-9, 0, 8].forEach((dt) => {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = midi(n); o.detune.value = dt;
      const lfo = ctx.createOscillator(); lfo.frequency.value = rnd(4.5, 5.5); const lg = ctx.createGain(); lg.gain.value = 3; lfo.connect(lg); lg.connect(o.detune);
      o.connect(f1); o.connect(f2); o.start(t0); o.stop(end + 0.1); lfo.start(t0); lfo.stop(end + 0.1);
    });
  }
  /** Plucked string: a saw whose lowpass closes quickly, kept dull so it reads as an old lute. */
  function pluck(n, start, vol, dest) {
    tone({ type: 'sawtooth', f: midi(n), t: 1.6, vol, attack: 0.004, filter: 'lowpass', ff: 1900, ff2: 220, q: 2, dest, rev: 0.6, delay: start });
    tone({ type: 'triangle', f: midi(n), t: 1.2, vol: vol * 0.6, attack: 0.004, dest, delay: start });
  }
  /** War drum: deep tom with a skin slap. */
  function drum(start, vol, dest, low) {
    tone({ type: 'sine', f: low ? 62 : 88, f2: low ? 38 : 52, t: 0.55, vol, dest, delay: start, rev: 0.5 });
    burst({ t: 0.12, ff: 700, ff2: 150, vol: vol * 0.5, dest, delay: start });
  }
  /** A dry click of bone on bone. */
  function click(start, vol, dest) {
    burst({ t: 0.018, filter: 'highpass', ff: 3200, vol, dest, delay: start });
    tone({ type: 'sine', f: rnd(800, 1000), t: 0.025, vol: vol * 0.25, dest, delay: start });
  }

  /** The lead voice of a hall: n is a midi note, len the time it may ring. */
  function lead(kind, n, d, vol, dest, len) {
    const f = midi(n);
    switch (kind) {
      case 'pluck': pluck(n, d, vol, dest); break;
      case 'brass': // low growling horn: two detuned saws behind a lowpass that closes
        tone({ type: 'sawtooth', f: f / 2, t: len, vol: vol * 1.1, attack: 0.18, filter: 'lowpass', ff: 900, ff2: 220, q: 3, detune: -7, dest, rev: 0.6, delay: d });
        tone({ type: 'sawtooth', f: f / 2, t: len, vol: vol * 0.8, attack: 0.22, filter: 'lowpass', ff: 800, ff2: 200, q: 2, detune: 7, dest, delay: d });
        break;
      case 'bell': // a drowned bell and its two echoes coming back off the water
        metal(f, 2.6, vol * 1.5, BELL, { rev: 0.9, delay: d, dest });
        metal(f, 2.2, vol * 0.55, BELL, { rev: 1, delay: d + 0.62, dest });
        metal(f, 1.8, vol * 0.22, BELL, { rev: 1, delay: d + 1.24, dest });
        break;
      case 'glass': // glass harmonica: a slow sine swell with a cold third partial
        tone({ type: 'sine', f, t: len, vol: vol * 1.3, attack: 0.35, vib: 2, vibRate: 5.5, dest, rev: 1, delay: d });
        tone({ type: 'sine', f: f * 3, t: len * 0.7, vol: vol * 0.22, attack: 0.45, dest, rev: 1, delay: d });
        break;
      case 'warp': // a bell that sags out of tune, shadowed a tritone above
        tone({ type: 'sine', f, f2: f * 0.94, t: len, vol: vol * 1.3, attack: 0.2, dest, rev: 1, delay: d });
        tone({ type: 'triangle', f: f * 1.414, f2: f * 1.33, t: len * 0.8, vol: vol * 0.35, attack: 0.5, dest, rev: 1, delay: d });
        metal(f * 2, 0.8, vol * 0.3, PLATE, { delay: d, dest, rev: 1 });
        break;
      case 'reed': // a low nasal reed, wavering
        tone({ type: 'square', f: f / 2, t: len, vol: vol * 0.9, attack: 0.12, filter: 'bandpass', ff: f * 1.3, q: 3, vib: 3, vibRate: 4.5, dest, rev: 0.5, delay: d });
        break;
      case 'organ': // pipe organ: a stack of harmonics that speaks slowly and holds
        [[1, 'sine', 1], [2, 'sine', 0.55], [3, 'triangle', 0.22], [4, 'sine', 0.16]].forEach(([r, type, v]) =>
          tone({ type, f: f * r, t: len, vol: vol * v, attack: 0.07, hold: len * 0.55, dest, rev: 1, delay: d }));
        break;
    }
  }

  /** Battle percussion of a hall, for eighth s8 of the bar and step p of the 4-bar phrase. */
  function kit(kind, s8, p, d, dest) {
    switch (kind) {
      case 'war': // heavy on 1, an answer on 3-and, rolls at phrase ends
        if (s8 === 0) drum(d, 0.32, dest, true);
        if (s8 === 5) drum(d, 0.2, dest);
        if (p >= 28) drum(d, 0.12, dest);
        break;
      case 'forge': // taiko and anvil
        if (s8 === 0) { tone({ type: 'sine', f: 52, f2: 32, t: 0.8, vol: 0.36, dest, delay: d, rev: 0.6 }); burst({ t: 0.15, ff: 500, ff2: 90, vol: 0.18, dest, delay: d }); }
        if (s8 === 4) drum(d, 0.18, dest, true);
        if (s8 === 6) { metal(rnd(560, 620), 0.4, 0.05, PLATE, { delay: d, dest, rev: 0.5 }); burst({ t: 0.03, filter: 'highpass', ff: 2400, vol: 0.06, dest, delay: d }); }
        if (p >= 28 && p % 2 === 0) drum(d, 0.14, dest);
        break;
      case 'water': // drums heard through water
        if (s8 === 0 || s8 === 3) { tone({ type: 'sine', f: 55, f2: 34, t: 0.8, vol: s8 ? 0.16 : 0.28, dest, delay: d, rev: 0.7 }); burst({ t: 0.3, ff: 280, ff2: 70, vol: s8 ? 0.08 : 0.14, dest, delay: d }); }
        if (s8 === 6 && Math.random() < 0.6) burst({ t: 0.25, filter: 'bandpass', ff: 900, ff2: 300, q: 1.2, vol: 0.05, dest, delay: d, rev: 0.6 });
        break;
      case 'bone': // a low drum and dry bone clicks
        if (s8 === 0) drum(d, 0.28, dest, true);
        if (s8 === 4) drum(d, 0.13, dest);
        if ((s8 === 2 || s8 === 3 || s8 === 6 || s8 === 7) && Math.random() < 0.7) click(d, 0.09, dest);
        if (p >= 30) { click(d, 0.07, dest); click(d + 0.1, 0.06, dest); }
        break;
      case 'odd': // 3+3+2, ghost clicks, and a swell that rises into the next phrase
        if (s8 === 0) drum(d, 0.3, dest, true);
        if (s8 === 3) drum(d, 0.2, dest);
        if (s8 === 6) drum(d, 0.24, dest, true);
        if (Math.random() < 0.2) click(d, 0.05, dest);
        if (p === 28) burst({ t: 1.5, filter: 'bandpass', ff: 300, ff2: 2600, q: 2, vol: 0.07, attack: 1.4, dest, delay: d, rev: 0.8 });
        break;
      case 'heart': // lub-dub
        if (s8 === 0 || s8 === 4) tone({ type: 'sine', f: 58, f2: 38, t: 0.3, vol: s8 ? 0.28 : 0.34, dest, delay: d });
        if (s8 === 1 || s8 === 5) tone({ type: 'sine', f: 48, f2: 34, t: 0.26, vol: 0.2, dest, delay: d });
        if (s8 === 0 && Math.random() < 0.5) burst({ t: 0.4, ff: 220, ff2: 60, vol: 0.06, dest, delay: d });
        break;
      case 'procession': // timpani on 1 and 3, a roll into each phrase
        if (s8 === 0) { tone({ type: 'sine', f: 73, f2: 64, t: 1.3, vol: 0.3, dest, delay: d, rev: 0.7 }); burst({ t: 0.1, ff: 420, vol: 0.1, dest, delay: d }); }
        if (s8 === 4) tone({ type: 'sine', f: 55, f2: 49, t: 1.1, vol: 0.24, dest, delay: d, rev: 0.7 });
        if (p >= 28) tone({ type: 'sine', f: 73, f2: 66, t: 0.25, vol: 0.08 + (p - 28) * 0.025, dest, delay: d });
        break;
    }
  }

  /** A continuous texture under a hall's score. Returns the gain to fade out. */
  function texture(kind, st, H) {
    if (!kind) return null;
    const g = ctx.createGain(); g.gain.value = 0.0001; g.connect(musicBus);
    const lfo = (hz, depth, param) => { const o = ctx.createOscillator(); o.frequency.value = hz; const lg = ctx.createGain(); lg.gain.value = depth; o.connect(lg); lg.connect(param); o.start(); st.nodes.push(o); };
    const loopNoise = (filterType, ff, q) => {
      const src = ctx.createBufferSource(); src.buffer = noise(); src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = ff; f.Q.value = q;
      src.connect(f); f.connect(g); src.start(); st.nodes.push(src); return f;
    };
    let level = 0.02;
    if (kind === 'embers') { loopNoise('lowpass', 170, 1.2); level = 0.07; lfo(0.13, 0.035, g.gain); }
    else if (kind === 'flow') { const f = loopNoise('bandpass', 800, 0.7); lfo(0.07, 450, f.frequency); level = 0.03; }
    else if (kind === 'frost') { loopNoise('highpass', 6500, 0.5); level = 0.007; lfo(0.21, 0.005, g.gain); }
    else if (kind === 'throb') { // two low sines a fraction of a hertz apart beat against each other
      [0, 0.45].forEach((df) => { const o = ctx.createOscillator(); o.frequency.value = midi(H.root - 12) + df; o.connect(g); o.start(); st.nodes.push(o); });
      level = 0.03;
    } else if (kind === 'buzz') { // a swarm drifting in and out
      [160, 173].forEach((hz) => {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2300; f.Q.value = 9;
        o.connect(f); f.connect(g); o.start(); st.nodes.push(o);
      });
      level = 0.006; lfo(0.09, 0.0055, g.gain);
    }
    g.gain.exponentialRampToValueAtTime(level, ctx.currentTime + 4);
    return g;
  }

  /** A boss is on the field: the music takes on brass and heavier drums. */
  function bossNear() {
    const r = DH.game && DH.game.run;
    return !!(r && r.bosses && r.bosses.some((b) => b && !b.dead));
  }

  function startMusic(mood, hall) {
    if (!ctx) { musicState = { mood, hall, pending: true }; return; }
    stopMusic();
    const H = HALL_MUSIC[hall] || HALL_MUSIC.crypt, battle = mood === 'battle';
    setSpace(hall);
    // every voice of this session, dry and reverb send, passes one gate that closes when the music stops
    const out = ctx.createGain(); out.connect(musicBus);
    out._rsend = ctx.createGain(); out._rsend.connect(reverb);
    const st = { mood, hall, alive: true, step: 0, nodes: [], out };
    musicState = st;
    // low drone of the hall, slowly breathing filter
    const droneG = ctx.createGain(); droneG.gain.value = 0.0001; droneG.connect(out);
    droneG.gain.exponentialRampToValueAtTime(battle ? 0.13 : 0.11, ctx.currentTime + 3);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = H.dlp; lp.Q.value = 2; lp.connect(droneG);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05; const lfoG = ctx.createGain(); lfoG.gain.value = H.dlp * 0.45;
    lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start();
    H.drone.forEach(([n, type, v], i) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = midi(H.root + n); o.detune.value = (i - 1) * 6;
      const g = ctx.createGain(); g.gain.value = v; o.connect(g); g.connect(lp); o.start(); st.nodes.push(o);
    });
    // wind through the halls
    const wind = ctx.createBufferSource(); wind.buffer = noise(); wind.loop = true;
    const wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = H.wind[0]; wf.Q.value = 1.5;
    const wl = ctx.createOscillator(); wl.frequency.value = 0.08; const wlg = ctx.createGain(); wlg.gain.value = H.wind[0] * 0.6; wl.connect(wlg); wlg.connect(wf.frequency); wl.start();
    const wg = ctx.createGain(); wg.gain.value = H.wind[1] * (battle ? 0.65 : 1); wind.connect(wf); wf.connect(wg); wg.connect(out); wind.start();
    st.nodes.push(lfo, wind, wl); st.droneG = droneG; st.windG = wg; st.texG = texture(H.tex, st, H);

    const bpm = battle ? 76 : H.menu, beat = 60 / bpm, mel = H.mel;
    let next = ctx.currentTime + 0.3;
    st.t0 = next; st.beat = beat;
    const melNote = (i) => H.root + 12 + H.scale[mel[i % mel.length]];
    st.timer = setInterval(() => {
      if (!st.alive || !ctx) return;
      while (next < ctx.currentTime + 0.5) {
        const s = st.step++, d = next - ctx.currentTime, s8 = s % 8, boss = battle && bossNear();
        const bar = Math.floor(s / 8), prog = H.progs[Math.floor(s / 128) % H.progs.length], ch = prog[Math.floor(bar / 2) % 4];
        const bass = H.root - 24 + ch[0], voices = ch.slice(1).map((o) => H.root + o);
        // choir chord every two bars
        if (s % 16 === 0) voices.forEach((n) => choir(n, d, beat * 8.5, boss ? 0.024 : battle ? 0.018 : 0.024, out, H.vowel));
        // the hall's bell at the top of each cycle
        if (s % 64 === 0) metal(midi(H.toll), 5, battle ? 0.05 : 0.07, BELL, { rev: true, delay: d, dest: out });
        if (battle) {
          kit(H.kit, s8, s % 32, d, out);
          // low string ostinato
          if (H.ost[s8]) tone({ type: 'sawtooth', f: midi(bass + (H.oct && s % 2 ? 12 : 0)), t: beat * (H.oct ? 0.5 : 0.9), vol: 0.05, attack: 0.02, filter: 'lowpass', ff: H.oct ? 520 : 420, q: 3, dest: out, delay: d });
          if (H.lead === 'pluck') { if (s % 4 === 2 && Math.random() < 0.6) lead('pluck', melNote(s >> 2), d, 0.04, out, beat); }
          else if (s8 === 4 && Math.random() < 0.6) lead(H.lead, melNote(s >> 3), d, 0.035, out, beat * 3);
          if (H.lead === 'organ' && s % 16 === 0) voices.forEach((n) => lead('organ', n, d, 0.012, out, beat * 7));
          if (boss) { // brass stabs on each chord and a heavier beat
            if (s % 16 === 0) [bass + 12, bass + 19].forEach((n, i) => tone({ type: 'sawtooth', f: midi(n), t: beat * 3, vol: 0.055, attack: 0.05, filter: 'lowpass', ff: 800, ff2: 200, q: 2, detune: i ? 8 : -8, dest: out, rev: 0.5, delay: d }));
            if (s8 === 2 || s8 === 6) drum(d, 0.16, out, true);
          }
        } else {
          if (s % 8 === 0) tone({ type: 'sawtooth', f: midi(bass), t: beat * 7, vol: 0.05, attack: 0.6, filter: 'lowpass', ff: 280, dest: out, rev: 0.4, delay: d });
          if (H.lead === 'pluck') {
            // sparse lute arpeggio of the chord, with an occasional melodic note on top
            if (s % 2 === 0 && Math.random() < 0.7) pluck(voices[(s >> 1) % 3] + (s8 === 6 ? 12 : 0), d, 0.033, out);
            if (s8 === 4 && Math.random() < 0.5) pluck(melNote(s >> 3), d, 0.03, out);
          } else if (H.lead === 'organ') {
            if (s % 16 === 0) voices.forEach((n) => lead('organ', n, d, 0.016, out, beat * 7.5));
            if (s8 === 4 && Math.random() < 0.5) lead('organ', melNote(s >> 3), d, 0.02, out, beat * 1.8);
          } else if (s % 4 === 0 && Math.random() < (H.lead === 'brass' ? 0.3 : 0.5)) lead(H.lead, melNote(s >> 2), d, 0.03, out, beat * 3);
        }
        next += beat / 2;
      }
    }, 120);
  }
  function stopMusic() {
    const st = musicState; if (!st || !ctx || st.pending) { musicState = null; return; }
    st.alive = false; clearInterval(st.timer);
    const t = ctx.currentTime;
    [st.droneG, st.windG, st.texG, st.out, st.out && st.out._rsend].forEach((g) => { if (g) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8); } });
    st.nodes.forEach((n) => { try { n.stop(t + 0.9); } catch (e) { /* already stopped */ } });
    const out = st.out; if (out) setTimeout(() => { try { out.disconnect(); out._rsend.disconnect(); } catch (e) { /* already gone */ } }, 1500);
    musicState = null;
  }

  /* ---------------- Hall ambience: sparse one-shots under the music ---------------- */
  // each hall has its own mix of dungeon sounds; they play quietly through the hall reverb
  const AMB = {
    drip() { const f = rnd(1400, 2200); tone({ type: 'sine', f, f2: f * 0.6, t: 0.12, vol: 0.035, rev: 0.9 }); if (Math.random() < 0.4) tone({ type: 'sine', f: f * 1.1, f2: f * 0.7, t: 0.1, vol: 0.02, rev: 0.9, delay: rnd(0.15, 0.35) }); },
    moan() { const f = rnd(110, 160); tone({ type: 'sawtooth', f, f2: f * rnd(0.7, 0.85), t: rnd(1.8, 2.8), vol: 0.018, attack: 0.6, filter: 'bandpass', ff: rnd(500, 750), q: 6, vib: 3, vibRate: 5, rev: 1 }); },
    chains() { const n = 3 + (Math.random() * 4 | 0); for (let i = 0; i < n; i++) metal(rnd(700, 1100), 0.2, 0.012, PLATE, { delay: i * rnd(0.05, 0.12), rev: 0.8 }); },
    creak() { tone({ type: 'sawtooth', f: rnd(60, 90), f2: rnd(80, 120), t: rnd(0.6, 1.1), vol: 0.02, filter: 'bandpass', ff: 380, q: 8, vib: 12, vibRate: rnd(18, 30), rev: 0.7 }); },
    wind() { burst({ t: rnd(2.5, 4), filter: 'bandpass', ff: rnd(300, 500), ff2: rnd(600, 900), q: 2, vol: 0.03, attack: 1.2, rev: 0.5 }); },
    crackle() { for (let i = 0; i < 6; i++) burst({ t: 0.02, filter: 'highpass', ff: rnd(1500, 3000), vol: 0.03, delay: rnd(0, 0.6) }); burst({ t: 0.8, ff: 500, vol: 0.02, attack: 0.3 }); },
    rumble() { tone({ type: 'sine', f: rnd(38, 50), f2: 30, t: 2.2, vol: 0.06, attack: 0.5 }); burst({ t: 2, ff: 160, vol: 0.04, attack: 0.5, rev: 0.4 }); },
    icecrack() { burst({ t: 0.08, filter: 'highpass', ff: 2200, vol: 0.05, rev: 0.8 }); metal(rnd(1500, 2200), 0.5, 0.012, PLATE, { rev: 0.8, delay: 0.03 }); },
    bubble() { const n = 2 + (Math.random() * 4 | 0); for (let i = 0; i < n; i++) { const f = rnd(180, 420); tone({ type: 'sine', f, f2: f * 1.8, t: 0.08, vol: 0.03, delay: i * rnd(0.08, 0.2) }); } },
    whisper() { burst({ t: rnd(1.2, 2), filter: 'bandpass', ff: rnd(1800, 2600), ff2: rnd(1200, 1600), q: 5, vol: 0.02, attack: 0.5, rev: 1 }); burst({ t: rnd(1, 1.6), filter: 'bandpass', ff: rnd(900, 1300), q: 6, vol: 0.015, attack: 0.4, rev: 1, delay: 0.3 }); },
    chime() { metal(rnd(900, 1300), 2.2, 0.012, BELL, { rev: 1 }); },
    toll() { metal(rnd(80, 100), 5, 0.035, BELL, { rev: 1 }); },
  };
  const HALL_AMB = {
    crypt: ['drip', 'moan', 'chains', 'creak', 'wind', 'toll'],
    abyss: ['crackle', 'rumble', 'moan', 'crackle', 'chains'],
    aqueduct: ['drip', 'drip', 'drip', 'wind', 'moan', 'creak'],
    catacombs: ['wind', 'icecrack', 'wind', 'moan', 'drip'],
    discord: ['whisper', 'whisper', 'chains', 'moan', 'toll'],
    blightmire: ['bubble', 'bubble', 'drip', 'moan', 'creak'],
    reliquary: ['chime', 'chime', 'whisper', 'chains', 'toll'],
  };
  let ambT = null;
  function ambience(hall) {
    clearTimeout(ambT); ambT = null;
    if (!hall) return;
    const list = HALL_AMB[hall] || HALL_AMB.crypt;
    const next = () => {
      ambT = setTimeout(() => {
        if (ctx && ctx.state === 'running' && settings.sfx > 0) { try { AMB[list[Math.random() * list.length | 0]](); } catch (e) { /* ignore */ } }
        next();
      }, rnd(1800, 5200));
    };
    next();
  }

  DH.audio = {
    ambience,
    /** Play an effect. arg goes to the effect: for 'hit' and 'kill' it is the foe's painter, which picks its material. */
    play(name, arg) {
      if (!ctx || settings.sfx <= 0 || ctx.state !== 'running') return;
      const gap = MIN_GAP[name] || 0.02, now = ctx.currentTime;
      if (last[name] && now - last[name] < gap) return;
      last[name] = now;
      try { SFX[name] && SFX[name](arg); } catch (e) { /* ignore audio errors */ }
    },
    /** Play the score of a hall (the selected one when not given) for a mood: 'menu' or 'battle'. */
    music(mood, hall) {
      hall = hall || (DH.save && DH.save.data && DH.save.data.selectedStage) || 'crypt';
      if (musicState && musicState.mood === mood && musicState.hall === hall && !musicState.pending) return;
      if (!ctx) { musicState = { mood, hall, pending: true }; return; }
      startMusic(mood, hall);
    },
    stopMusic,
    BATTLE_BPM: 76,
    /** Beats elapsed in the battle music (float), or null when it is not playing. Used to sync the Skald's songs. */
    beatPos() {
      const st = musicState;
      if (!ctx || !st || st.pending || st.mood !== 'battle' || ctx.state !== 'running' || !st.t0) return null;
      return (ctx.currentTime - st.t0) / st.beat;
    },
    setVolumes(sfx, music) {
      settings.sfx = sfx; settings.music = music;
      if (sfxBus) sfxBus.gain.value = sfx;
      if (musicBus) musicBus.gain.value = music * 0.6;
    },
    vibrate(ms) {
      if (DH.save && DH.save.data && !DH.save.data.settings.vibration) return;
      const hap = DH.platform.plugin('Haptics');
      if (hap) hap.vibrate({ duration: ms }).catch(() => {});
      else if (navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { /* not supported */ }
    },
    suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); },
    resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); },
  };
  // start pending music once the context unlocks
  window.addEventListener('pointerdown', () => {
    if (musicState && musicState.pending && ctx) { const m = musicState; musicState = null; startMusic(m.mood, m.hall); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) DH.audio.suspend(); else DH.audio.resume(); });
})(window.DH);
