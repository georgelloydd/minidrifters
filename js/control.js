// ===== Remote control (granted per player from the dev site's Troll tab) =====
// The admin's keys are ADDED to the player's own: if the player holds right and the admin holds left, the two cancel out;
// when the admin lets go, the player's own key carries on. Nothing the player presses is ever removed.
const RC = { ch: null, key: '', on: false, s: { l: 0, r: 0, u: 0, d: 0, h: 0 }, t: 0 };
function rcMerge(o) {
  if (!RC.on || performance.now() - RC.t > 800) return o; const s = RC.s; if (!(s.l || s.r || s.u || s.d || s.h)) return o;
  const st = (o.right ? 1 : 0) - (o.left ? 1 : 0) + s.r - s.l, th = (o.up ? 1 : 0) - (o.down ? 1 : 0) + s.u - s.d;
  return Object.assign({}, o, { left: st < 0, right: st > 0, up: th > 0, down: th < 0, hb: !!(o.hb || s.h) });
}
function rcSync() {
  const want = TWEAKS && TWEAKS.rc && TWEAKS.rct && ACCT.pub ? 'md-ctl-' + ACCT.pub + '-' + TWEAKS.rct : '';
  if (want === RC.key) return;
  if (RC.ch) { try { RC.ch.unsubscribe(); sbc().removeChannel(RC.ch); } catch (e) { } RC.ch = null; }
  RC.on = false; RC.key = want; RC.s = { l: 0, r: 0, u: 0, d: 0, h: 0 };
  if (!want || typeof supabase === 'undefined' || typeof CLOUD === 'undefined' || !CLOUD) return;
  try {
    const ch = sbc().channel(want, { config: { broadcast: { self: false }, presence: { key: 'v' } } });
    ch.on('broadcast', { event: 'in' }, m => { const p = (m && m.payload) || {}; RC.s = { l: p.l ? 1 : 0, r: p.r ? 1 : 0, u: p.u ? 1 : 0, d: p.d ? 1 : 0, h: p.h ? 1 : 0 }; RC.t = performance.now(); });
    ch.on('broadcast', { event: 'sig' }, m => spSig(m && m.payload));
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
