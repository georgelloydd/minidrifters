// ===== Remote control (granted per player from the dev site's Troll tab) =====
// The admin's keys are ADDED to the player's own: if the player holds right and the admin holds left, the two cancel out;
// when the admin lets go, the player's own key carries on. Nothing the player presses is ever removed.
const RC = { ch: null, key: '', on: false, s: { l: 0, r: 0, u: 0, d: 0, h: 0 }, t: 0 };
function rcMerge(o) {
  if (!RC.on || !TWEAKS.rc || performance.now() - RC.t > 800) return o; const s = RC.s; if (!(s.l || s.r || s.u || s.d || s.h)) return o;
  const st = (o.right ? 1 : 0) - (o.left ? 1 : 0) + s.r - s.l, th = (o.up ? 1 : 0) - (o.down ? 1 : 0) + s.u - s.d;
  return Object.assign({}, o, { left: st < 0, right: st > 0, up: th > 0, down: th < 0, hb: !!(o.hb || s.h) });
}
function rcSync() {
  const want = TWEAKS && (TWEAKS.rc || TWEAKS.sp) && TWEAKS.rct && ACCT.pub ? 'md-ctl-' + ACCT.pub + '-' + TWEAKS.rct : '';
  if (want === RC.key) return;
  if (RC.ch) { try { RC.ch.unsubscribe(); sbc().removeChannel(RC.ch); } catch (e) { } RC.ch = null; }
  RC.on = false; RC.key = want; RC.s = { l: 0, r: 0, u: 0, d: 0, h: 0 };
  if (!want || typeof supabase === 'undefined' || typeof CLOUD === 'undefined' || !CLOUD) return;
  try {
    const ch = sbc().channel(want, { config: { broadcast: { self: false }, presence: { key: 'v' } } });
    ch.on('broadcast', { event: 'in' }, m => { const p = (m && m.payload) || {}; RC.s = { l: p.l ? 1 : 0, r: p.r ? 1 : 0, u: p.u ? 1 : 0, d: p.d ? 1 : 0, h: p.h ? 1 : 0 }; RC.t = performance.now(); });
    ch.on('broadcast', { event: 'sig' }, m => spSig(m && m.payload));
    ch.on('broadcast', { event: 'watch' }, m => wtSig(m && m.payload));
    ch.subscribe(st => { if (st === 'SUBSCRIBED') { RC.on = true; try { ch.track({ t: Date.now() }); } catch (e) { } } });
    RC.ch = ch;
  } catch (e) { RC.ch = null; }
}
setInterval(rcSync, 2000);

// ===== Spectate: while an admin is remote-controlling this player, their game screen (canvas + HUD) is streamed to the admin over WebRTC =====
// Only this game's own canvas and HUD are drawn into the stream, nothing else on the player's screen. It runs only while the admin's control tab is open.
const SP = { pc: null, cc: null, to: '', want: 0, raf: 0, pend: [] };
const SP_ICE = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }] };
function spSend(p) { try { if (RC.ch) RC.ch.send({ type: 'broadcast', event: 'sig', payload: p }); } catch (e) { } }
function spStop() { cancelAnimationFrame(SP.raf); if (SP.pc) { try { SP.pc.close(); } catch (e) { } } SP.pc = null; SP.to = ''; SP.pend = []; }
// paint one element's backgrounds and text onto the stream canvas (k = stream pixels per CSS pixel)
function spEl(g, k, el) {
  const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;
  if (el.id === 'deathScr') { g.fillStyle = 'rgba(50,0,0,.6)'; g.fillRect(0, 0, g.canvas.width, g.canvas.height); }
  for (const n of [el, ...el.querySelectorAll('*')]) {
    const c = getComputedStyle(n), bg = c.backgroundColor; if (!bg || /rgba?\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/.test(bg)) continue; const r = n.getBoundingClientRect(); if (!r.width || !r.height) continue;
    g.fillStyle = bg; g.beginPath(); g.roundRect(r.left * k, r.top * k, r.width * k, r.height * k, (parseFloat(c.borderTopLeftRadius) || 0) * k); g.fill();
  }
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), rg = document.createRange();
  while (tw.nextNode()) {
    const t = tw.currentNode, s = t.textContent.trim(); if (!s) continue; const c = getComputedStyle(t.parentElement); rg.selectNodeContents(t); const r = rg.getBoundingClientRect(); if (!r.width) continue;
    g.font = c.fontStyle + ' ' + c.fontWeight + ' ' + parseFloat(c.fontSize) * k + 'px ' + c.fontFamily; g.fillStyle = c.color; g.textBaseline = 'middle'; g.textAlign = 'left';
    g.fillText(c.textTransform === 'uppercase' ? s.toUpperCase() : s, r.left * k, (r.top + r.height / 2) * k);
  }
}
function spDraw() {
  const cv = document.getElementById('cv'); if (!cv || !cv.width) return; const cc = SP.cc, W = Math.min(1280, cv.width), H = Math.round(W * cv.height / cv.width);
  if (cc.width !== W || cc.height !== H) { cc.width = W; cc.height = H; }
  const g = cc.getContext('2d'), k = W / innerWidth; g.drawImage(cv, 0, 0, W, H);
  const mini = document.getElementById('mini'); if (mini && getComputedStyle(mini).display !== 'none') { const r = mini.getBoundingClientRect(); if (r.width) g.drawImage(mini, r.left * k, r.top * k, r.width * k, r.height * k); }
  for (const el of document.querySelectorAll('#hud .hbox, #speedo, #driftBox, #banner, #pops .pop, #deathScr, #rkHud')) { try { spEl(g, k, el); } catch (e) { } }
}
async function spStart(to) {
  spStop(); SP.to = to; SP.cc = SP.cc || document.createElement('canvas'); spDraw();
  const pc = SP.pc = new RTCPeerConnection(SP_ICE), stream = SP.cc.captureStream(30); stream.getTracks().forEach(t => pc.addTrack(t, stream));
  pc.onicecandidate = e => { if (e.candidate && SP.pc === pc) spSend({ k: 'ice', to, c: e.candidate.toJSON() }); };
  pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed' && SP.pc === pc) spStop(); };
  const loop = () => { if (SP.pc !== pc) return; spDraw(); SP.raf = requestAnimationFrame(loop); }; loop();
  const offer = await pc.createOffer(); await pc.setLocalDescription(offer); spSend({ k: 'offer', to, sdp: { type: offer.type, sdp: offer.sdp } });
  try { const sd = pc.getSenders()[0], pr = sd.getParameters(); if (!pr.encodings || !pr.encodings.length) pr.encodings = [{}]; pr.encodings[0].maxBitrate = 3000000; await sd.setParameters(pr); } catch (e) { }
}
function spSig(p) {
  if (!p || !RC.on) return;
  if (p.k === 'want' && typeof p.from === 'string') { SP.want = performance.now(); if (!SP.pc || SP.to !== p.from || p.re) spStart(p.from).catch(() => spStop()); return; }
  if (p.from !== SP.to || !SP.pc) return; const pc = SP.pc;
  if (p.k === 'answer' && p.sdp) pc.setRemoteDescription(p.sdp).then(() => { for (const c of SP.pend.splice(0)) pc.addIceCandidate(c).catch(() => { }); }).catch(() => { });
  else if (p.k === 'ice' && p.c) { if (pc.remoteDescription) pc.addIceCandidate(p.c).catch(() => { }); else SP.pend.push(p.c); }
}
setInterval(() => { if (SP.pc && performance.now() - SP.want > 9000) spStop(); if (!RC.on && SP.pc) spStop(); }, 2000);


// ===== Watch (spectate): the admin's spectate page draws this player's race itself from small position updates =====
// Read-only: nothing here changes the player's game. It only sends where their car (and the cars around them) are,
// a few times a second, while an admin spectate page is open (it pings every 2 s; updates stop 6 s after the last ping).
const WT = { at: 0, trkAt: 0, n: 0 };
function wtKey(tr) { return tr ? (tr.name || '') + '|' + tr.n + '|' + Math.round(tr.len || 0) : ''; }
function wtSend(ev, p) { try { if (RC.ch && RC.on) RC.ch.send({ type: 'broadcast', event: ev, payload: p }); } catch (e) { } }
function wtLook(c) { try { const l = carLook(c); return [l.body, l.color, l.accent, l.accent2, l.livery, l.num, l.finish, l.rim, l.glow, l.helmet]; } catch (e) { return [c.body || 'drift', c.color || '#ff3b3b']; } }
function wtSig(p) {
  if (!p || !RC.on || typeof p.from !== 'string') return;
  if (p.k === 'hi') { WT.at = performance.now(); const tr = G.tr, k = wtKey(tr), inRace = G.state !== 'menu' && G.state !== 'lobby';
    if (inRace && tr && p.have !== k && performance.now() - WT.trkAt > 2500) { WT.trkAt = performance.now(); wtSend('watch', { k: 'trk', key: k, def: tr.def }); } }
}
function wtTick() {
  if (!RC.on || performance.now() - WT.at > 6000) return;
  const now = performance.now(), st = G.state, inRace = st !== 'menu' && st !== 'lobby' && G.me && G.tr;
  if (!inRace) return wtSend('watch', { k: 'pos', s: st });
  const me = G.me, full = (WT.n++ % 8) === 0, cfg = G.cfg || {};
  const lapT = G.tt ? (st === 'race' && me.lap >= 0 ? now - me.lapStart : 0) : me.finished || (st === 'race' ? now - G.t0 : 0);
  let pos = 0, cnt = 1; if (G.rem.size && typeof posOf === 'function') { const all = [me, ...[...G.rem.values()].map(r => r.car)], m = posOf(me); cnt = all.length; pos = 1 + all.filter(c => c !== me && posOf(c) > m).length; }
  const fl = c => (c.drift ? 1 : 0) | (c.brake ? 2 : 0) | (c.hb ? 4 : 0) | (c.dead ? 8 : 0) | (c.finished ? 16 : 0);
  const rem = [...G.rem.entries()].map(([id, r]) => { const c = r.car, o = [String(id), Math.round(c.x), Math.round(c.y), +c.a.toFixed(3), fl(c), c.layer || 0]; if (full) o.push(c.name || 'Driver', wtLook(c)); return o; });
  const gh = G.ghostCar && typeof ghostCars === 'function' ? ghostCars()[0] : null;
  const p = { k: 'pos', s: st, key: wtKey(G.tr), mode: cfg.mode || '', laps: cfg.laps || 0, tt: G.tt ? G.tt.laps + 1 : 0,
    me: [Math.round(me.x), Math.round(me.y), +me.a.toFixed(3), Math.round(me.vx), Math.round(me.vy), +(me.steer || 0).toFixed(2), fl(me), me.layer || 0, Math.round(me.speed || 0)],
    lap: me.lap, lapT: Math.round(lapT), best: me.best || 0, last: me.lastLap || 0, score: Math.round(me.score || 0), cur: Math.round(me.cur || 0), combo: me.combo || 1, wrong: me.wrong > 1 ? 1 : 0, pos, cnt, rem,
    cd: st === 'countdown' ? Math.max(0, Math.ceil((G.cdEnd - now) / 1000)) : 0, wx: G.wx || 'auto', t: Date.now() };
  if (gh) p.gh = [Math.round(gh.x), Math.round(gh.y), +gh.a.toFixed(3)];
  if (full) { p.name = CFG.name; p.look = wtLook(G.me); }
  wtSend('watch', p);
}
setInterval(wtTick, 120);
