// ===== Menu music: synthesised live with Web Audio (no audio files). Menus only, silent while racing. =====
(function () {
const SONGS = [
 {id:'garage',name:'Midnight Garage',use:'Main menu',desc:'Synthwave cruise. Pulsing bass, wide pads, a night-drive arp. The default "home" sound.',bpm:100,
  chords:[[57,60,64],[53,57,60,65],[48,55,60,64],[55,59,62,67]],
  drums:{k:'x.......x.......',s:'....x.......x...',h:'..x...x...x...x.',o:''},
  bass:'x.ox.ox.x.ox.oxo',bassT:'saw',cut:700,
  lead:'0120a2100120a21a',leadT:'square',leadV:.05,leadDelay:true,pad:'pad',fill:true},
 {id:'lounge',name:'Chrome Lounge',use:'Shop / garage',desc:'Lo-fi chill with swung drums and jazzy keys. Relaxed while you browse paint and patterns.',bpm:84,swing:.18,
  chords:[[50,53,57,60,64],[55,59,62,65],[48,52,55,59,62],[57,61,64,67]],
  drums:{k:'x......x..x.....',s:'....x.......x...',h:'x.x.x.x.x.x.x.xx',o:''},soft:true,
  bass:'x......5..x...o.',bassT:'sine',cut:500,
  lead:'....3...2.1.....',leadT:'bell',leadV:.07,keys:'..x....x...x....',pad:'keys'},
 {id:'workshop',name:'Workshop',use:'Track builder',desc:'Ambient and spacious, no kick. Stays out of the way while you build tracks.',bpm:72,
  chords:[[53,57,60,64],[52,55,59,62],[50,53,57,60],[48,52,55,59]],
  drums:{k:'',s:'',h:'....x.......x...',o:''},soft:true,
  bass:'x...............',bassT:'sine',cut:400,
  lead:'2.......1...0...',leadT:'bell',leadV:.06,leadDelay:true,pad:'pad'},
 {id:'grid2',name:'Start Lights',use:'Pre-race / countdown',desc:'Tense minor loop with a rising pulse. For the starting grid and the loading screen.',bpm:132,
  chords:[[45,48,52],[45,48,53],[44,48,51],[43,47,50,55]],
  drums:{k:'x..x..x...x..x..',s:'........x.......',h:'xxxxxxxxxxxxxxxx',o:''},
  bass:'xxxxxxxxxxxxxxxx',bassT:'saw',cut:600,
  lead:'0...0...1...2.1.',leadT:'square',leadV:.04,pad:'pad',fill:true},
 {id:'hours',name:'After Hours',use:'Main menu (new)',desc:'Midnight Garage\'s darker sibling. Minor-key synthwave, driving bass and a falling arp.',bpm:96,
  chords:[[50,53,57,62],[46,50,53,58],[53,57,60,65],[48,52,55,60]],
  drums:{k:'x.......x.x.....',s:'....x.......x...',h:'..x...x...x...xx',o:''},
  bass:'x.xx.xx.x.xx.x.o',bassT:'saw',cut:650,
  lead:'a.2.1.0.2...1.0.',leadT:'square',leadV:.045,leadDelay:true,pad:'pad',fill:true},
 {id:'velvet',name:'Velvet Pit',use:'Shop / garage (new)',desc:'More Chrome Lounge: swung lo-fi, warm maj7 keys and a lazy bell melody.',bpm:88,swing:.2,
  chords:[[51,55,58,62],[53,56,60,63],[50,53,57,60,64],[55,58,62,65]],
  drums:{k:'x.....x...x.....',s:'....x.......x...',h:'x.x.x.x.x.x.x.xx',o:''},soft:true,
  bass:'x...5...x..o..5.',bassT:'sine',cut:520,
  lead:'..2...1.....3...',leadT:'bell',leadV:.065,keys:'...x..x....x..x.',pad:'keys'},
 {id:'blueprint',name:'Blueprint',use:'Settings / account (new)',desc:'Workshop-style ambient. Slow open chords, soft bells, barely any drums.',bpm:76,
  chords:[[48,55,60,64],[45,52,57,60],[41,48,53,57],[43,50,55,59]],
  drums:{k:'',s:'',h:'........x.....x.',o:''},soft:true,
  bass:'x.......x.......',bassT:'sine',cut:380,
  lead:'0...2.......1...',leadT:'bell',leadV:.06,leadDelay:true,pad:'pad'},
 {id:'redline',name:'Redline',use:'Multiplayer lobby (new)',desc:'Start Lights turned up: tense minor riff, rolling 16th bass and a pushing beat.',bpm:128,
  chords:[[52,55,59],[52,55,60],[50,53,57],[47,51,54,59]],
  drums:{k:'x...x..x..x.x...',s:'....x.......x...',h:'x.xxx.xxx.xxx.xx',o:'..x.......x.....'},
  bass:'x.xxx.xxx.xxx.xx',bassT:'saw',cut:650,
  lead:'0.0.1...2...1.0.',leadT:'square',leadV:.04,leadDelay:true,pad:'pad',fill:true},
];
// ---------- synth (works on live + offline contexts) ----------
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const NOISE = new WeakMap();
function noise(A) { if (!NOISE.has(A)) { const b = A.createBuffer(1, A.sampleRate, A.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; NOISE.set(A, b); } return NOISE.get(A); }
function env(A, t, a, d, peak, end) { const g = A.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); return g; }
function makeBus(A, out) {
  const comp = A.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; comp.connect(out);
  const dry = A.createGain(); dry.connect(comp);
  const dl = A.createDelay(1); const fb = A.createGain(); fb.gain.value = .32; const dlo = A.createGain(); dlo.gain.value = .35; const dlf = A.createBiquadFilter(); dlf.type = 'lowpass'; dlf.frequency.value = 2800;
  dl.connect(dlf); dlf.connect(fb); fb.connect(dl); dlf.connect(dlo); dlo.connect(comp);
  const rv = A.createConvolver(), len = A.sampleRate * 2.2, ir = A.createBuffer(2, len, A.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  rv.buffer = ir; const rvo = A.createGain(); rvo.gain.value = .28; rv.connect(rvo); rvo.connect(comp);
  return { dry, delay: dl, verb: rv, setTime(s) { dl.delayTime.value = s; } };
}
const send = (n, bus, dl, rv) => { n.connect(bus.dry); if (dl) { const g = n.context.createGain(); g.gain.value = dl; n.connect(g); g.connect(bus.delay); } if (rv) { const g = n.context.createGain(); g.gain.value = rv; n.connect(g); g.connect(bus.verb); } };
const I = {
  kick(A, b, t, v) { const o = A.createOscillator(), g = env(A, t, .002, .38, v); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + .13); o.connect(g); send(g, b); o.start(t); o.stop(t + .45); },
  snare(A, b, t, v) { const n = A.createBufferSource(); n.buffer = noise(A); const f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = .7; const g = env(A, t, .001, .2, v * .8); n.connect(f); f.connect(g); send(g, b, 0, .5); n.start(t); n.stop(t + .25);
    const o = A.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(140, t + .08); const g2 = env(A, t, .001, .1, v * .5); o.connect(g2); send(g2, b); o.start(t); o.stop(t + .15); },
  hat(A, b, t, v, open) { const n = A.createBufferSource(); n.buffer = noise(A); const f = A.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500; const g = env(A, t, .001, open ? .22 : .045, v * (open ? .35 : .3)); n.connect(f); f.connect(g); send(g, b, 0, .15); n.start(t, Math.random() * .5); n.stop(t + .3); },
  bass(A, b, t, m, dur, type, cut) { const o = A.createOscillator(), s = A.createOscillator(); o.type = type; s.type = 'sine'; o.frequency.value = mtof(m); s.frequency.value = mtof(m - 12);
    const f = A.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 4; f.frequency.setValueAtTime(cut * 2.2, t); f.frequency.exponentialRampToValueAtTime(cut * .6, t + dur);
    const g = A.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.16, t + .008); g.gain.setTargetAtTime(.0001, t + dur * .7, .05);
    const gs = A.createGain(); gs.gain.value = .6; o.connect(f); s.connect(gs); gs.connect(f); f.connect(g); send(g, b); o.start(t); s.start(t); o.stop(t + dur + .3); s.stop(t + dur + .3); },
  pad(A, b, t, notes, dur) { const f = A.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(600, t); f.frequency.linearRampToValueAtTime(1600, t + dur * .6); f.frequency.linearRampToValueAtTime(800, t + dur);
    const g = A.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.045, t + .5); g.gain.setValueAtTime(.045, t + dur - .3); g.gain.linearRampToValueAtTime(.0001, t + dur + .4); f.connect(g); send(g, b, 0, .6);
    for (const m of notes) for (const d of [-9, 9]) { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = d; o.connect(f); o.start(t); o.stop(t + dur + .5); } },
  keys(A, b, t, notes, dur) { for (const m of notes) { const o = A.createOscillator(), o2 = A.createOscillator(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = mtof(m); o2.frequency.value = mtof(m + 12); o2.detune.value = 4;
    const g = env(A, t, .01, dur, .05), g2 = A.createGain(); g2.gain.value = .25; o.connect(g); o2.connect(g2); g2.connect(g); send(g, b, .15, .4); o.start(t); o2.start(t); o.stop(t + dur + .1); o2.stop(t + dur + .1); } },
  stab(A, b, t, notes, dur) { const f = A.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(3000, t); f.frequency.exponentialRampToValueAtTime(500, t + .18); const g = env(A, t, .003, .2, .04); f.connect(g); send(g, b, .25, .3);
    for (const m of notes) { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m + 12); o.connect(f); o.start(t); o.stop(t + .3); } },
  lead(A, b, t, m, dur, type, v, dl) { if (type === 'bell') { const c = A.createOscillator(), mod = A.createOscillator(), mg = A.createGain(); c.frequency.value = mtof(m); mod.frequency.value = mtof(m) * 3.5; mg.gain.setValueAtTime(mtof(m) * 1.6, t); mg.gain.exponentialRampToValueAtTime(1, t + 1.2);
      mod.connect(mg); mg.connect(c.frequency); const g = env(A, t, .003, 1.4, v); c.connect(g); send(g, b, dl ? .35 : .15, .5); c.start(t); mod.start(t); c.stop(t + 1.5); mod.stop(t + 1.5); return; }
    const o = A.createOscillator(); o.type = type; o.frequency.value = mtof(m); const f = A.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(4200, t); f.frequency.exponentialRampToValueAtTime(900, t + dur);
    const g = env(A, t, .004, dur * 1.4, v); o.connect(f); f.connect(g); send(g, b, dl ? .4 : 0, .25); o.start(t); o.stop(t + dur * 1.5 + .05); },
};
// one 16th-note step of a song
function playStep(A, bus, S, step, t, sp, mute) {
  const bar = Math.floor(step / 16) % S.chords.length, i = step % 16, ch = S.chords[bar], root = ch[0] - 12 - (ch[0] > 52 ? 12 : 0), v = S.soft ? .6 : 1;
  const last = S.fill && Math.floor(step / 16) % 8 === 7 && i >= 12;
  if (!mute.drums) { const D = S.drums; if (D.k[i] === 'x') I.kick(A, bus, t, .9 * v); if (D.s[i] === 'x' || last) I.snare(A, bus, t, (last ? .35 + (i - 12) * .12 : .5) * v); if (D.h[i] === 'x') I.hat(A, bus, t, (i % 4 ? .7 : 1) * v); if (D.o && D.o[i] === 'x') I.hat(A, bus, t, v, true); }
  if (!mute.bass) { const c = S.bass[i]; if (c !== '.') { let n = 1; while (i + n < 16 && S.bass[i + n] === '.' && n < 4) n++; I.bass(A, bus, t, root + (c === 'o' ? 12 : c === '5' ? 7 : 0), sp * n * .9, S.bassT, S.cut); } }
  if (!mute.chords) { if (S.pad === 'pad' && i === 0) I.pad(A, bus, t, ch, sp * 16); if (S.pad === 'keys' && S.keys[i] === 'x') I.keys(A, bus, t, ch, sp * 3); if (S.pad === 'stab' && S.stab[i] === 'x') I.stab(A, bus, t, ch, sp); }
  if (!mute.lead) { const c = S.lead[i]; if (c !== '.') { const n = /[a-c]/.test(c) ? c.charCodeAt(0) - 97 : +c, oct = /[a-c]/.test(c) ? 24 : 12; I.lead(A, bus, t, ch[n % ch.length] + oct + (n >= ch.length ? 12 : 0), sp * 1.6, S.leadT, S.leadV, S.leadDelay); } }
}

const LISTS = { menu: ['garage', 'hours'], shop: ['lounge', 'velvet'], lobby: ['grid2', 'redline'], calm: ['workshop', 'blueprint'] };
const M = { A: null, out: null, cur: null, ctx: '', idx: {}, vol: (() => { const v = localStorage.getItem('md_music'); return v === null ? 0.5 : Math.max(0, Math.min(1, +v || 0)); })() };
function want() {
  if (M.vol <= 0 || document.hidden || typeof G === 'undefined') return '';
  if (G.state === 'lobby') return 'lobby'; if (G.state !== 'menu') return '';
  const t = typeof TAB !== 'undefined' ? TAB : 'tt';
  return t === 'shop' || t === 'garage' ? 'shop' : t === 'mp' ? 'lobby' : t === 'settings' || t === 'acct' ? 'calm' : 'menu';
}
function ensure() { if (M.A) return true; try { const A = M.A = new (window.AudioContext || window.webkitAudioContext)(); M.out = A.createGain(); M.out.gain.value = M.vol * 0.8; M.out.connect(A.destination); } catch (e) { M.A = null; return false; } return true; }
function start(id) {
  const S = SONGS.find(x => x.id === id); if (!S) return; const A = M.A, g = A.createGain(), t = A.currentTime;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(1, t + 1.5); g.connect(M.out);
  const bus = makeBus(A, g), sp = 60 / S.bpm / 4; bus.setTime(sp * 3); M.cur = { S, g, bus, step: 0, next: t + 0.1, sp }; nowPlaying(S);
}
function stop() { const c = M.cur; if (!c) return; M.cur = null; const A = M.A, t = A.currentTime; try { c.g.gain.cancelScheduledValues(t); c.g.gain.setValueAtTime(Math.max(0.0001, c.g.gain.value), t); c.g.gain.linearRampToValueAtTime(0.0001, t + 0.9); } catch (e) { } setTimeout(() => { try { c.g.disconnect(); } catch (e) { } }, 3000); }
function tick() {
  if (!M.A) return; const w = want();
  if (w !== M.ctx) { M.ctx = w; stop(); if (w) { const L = LISTS[w]; M.idx[w] = (M.idx[w] === undefined ? -1 : M.idx[w]) + 1; start(L[M.idx[w] % L.length]); } }
  const c = M.cur; if (!c || M.A.state !== 'running') return;
  if (c.next < M.A.currentTime - 0.5) c.next = M.A.currentTime + 0.05; // tab was asleep: don't burst-play missed notes
  while (c.next < M.A.currentTime + 0.15) { const sw = c.step % 2 ? (c.S.swing || 0) * c.sp : 0; try { playStep(M.A, c.bus, c.S, c.step, c.next + sw, c.sp, {}); } catch (e) { } c.step++; c.next += c.sp;
    if (c.step >= 16 * 32) { M.ctx = '_next'; break; } } // after 32 bars, crossfade into the other song for this screen
}
function unlock() { if (M.vol <= 0) return; if (!ensure()) return; if (M.A.state !== 'running') M.A.resume(); if (!M.cur) M.ctx = '_start'; }
['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, unlock, { capture: true, passive: true }));
document.addEventListener('visibilitychange', () => { if (M.A) { if (document.hidden) M.A.suspend(); else M.A.resume(); } });
setInterval(tick, 40);
function nowPlaying(S) { let el = document.getElementById('musNow'); if (!el) { el = document.createElement('div'); el.id = 'musNow'; document.body.appendChild(el); }
  el.innerHTML = '<span>♪</span> ' + S.name; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); const s = document.getElementById('musSong'); if (s) s.textContent = S.name; }
function setVol(v) { M.vol = Math.max(0, Math.min(1, +v || 0)); localStorage.setItem('md_music', M.vol); if (M.vol > 0) unlock(); if (M.out) M.out.gain.setTargetAtTime(M.vol * 0.8, M.A.currentTime, 0.05); }
function settingsUI() {
  const tab = document.getElementById('tab-settings'); if (!tab || document.getElementById('musSet')) return;
  const d = document.createElement('div'); d.id = 'musSet'; d.className = 'musSet';
  d.innerHTML = '<div class="musL"><b>Menu music</b><small>Plays in the menus, shop and lobby. Silent while racing.</small></div><input type="range" id="musVol" min="0" max="1" step="0.05"><span id="musPct"></span><button class="btn dark sm" id="musSkip">Next song</button><small class="musNowS">Now: <b id="musSong">—</b></small>';
  tab.insertBefore(d, tab.firstChild);
  const r = document.getElementById('musVol'), pc = document.getElementById('musPct'); r.value = M.vol; pc.textContent = Math.round(M.vol * 100) + '%';
  r.oninput = () => { setVol(r.value); pc.textContent = Math.round(M.vol * 100) + '%'; };
  document.getElementById('musSkip').onclick = () => { unlock(); M.ctx = '_skip'; };
  if (M.cur) document.getElementById('musSong').textContent = M.cur.S.name;
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', settingsUI); else settingsUI();
window.MUSIC = { setVol, get vol() { return M.vol; }, get song() { return M.cur ? M.cur.S.name : ''; }, songs: SONGS.map(x => x.name) };
})();
