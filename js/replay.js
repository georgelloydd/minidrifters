// ===== Replay viewer: camera angles, scrubbing, speed, video export =====
const RP = { on: false };
const RP_CAMS = [['auto', 'Auto'], ['chase', 'Chase'], ['tv', 'TV'], ['top', 'Top down'], ['heli', 'Helicopter']];
async function watchRow(tr, row, btn) {
  if (G.state !== 'menu' || !row) return; let rep = null; if (btn) btn.textContent = '…';
  if (CLOUD) { try { const r = await sb('GET', `laps?track=eq.${tr}&pid=eq.${encodeURIComponent(row.pid)}&select=replay,lap_ms`); if (r && r[0] && r[0].lap_ms === row.lap) rep = r[0].replay; } catch (e) { } }
  if (!decRep(rep) && row.pid === ACCT.pub) rep = localStorage.getItem('md_rep_' + tr);
  if (btn) btn.textContent = 'Watch';
  if (!decRep(rep)) return uiAlert('There is no replay for this lap yet. Replays are saved with new personal bests.');
  openReplay(tr, rep, lookOf(row), row.name, row.lap);
}
function openReplay(track, rep, look, name, lapMs) { return openReplayMulti(track, [{ rep, look, name, lap: lapMs }]); }
function openReplayMulti(track, list) {
  list = (list || []).map(e => Object.assign({}, e, { L: decRep(e.rep) })).filter(e => e.L && e.L.length >= 5); if (!list.length) return uiAlert('No replay for this lap.');
  list.sort((a, b) => (a.lap || 1e12) - (b.lap || 1e12)); const L = list[0].L, look = list[0].look || {}, name = list[0].name, lapMs = list[0].lap;
  G.cfg = { track, laps: 0, mode: 'tt' }; G.tr = buildTrack(track); G.smoke = []; G.snow = []; G.mp = false; G.tt = null; G.rem.clear(); G.ghost = null; G.ghostCar = null; G.wx = 'auto';
  const multi = list.length > 1; list.forEach((e, i) => { const k = newCar(i, G.tr, 'rp' + i, '', (e.look && e.look.color) || CFG.color); Object.assign(k, carLook(e.look || {})); k.name = multi ? (e.name || 'Driver') : ''; e.car = k; e.lap = e.lap || (e.L.length - 1) * 100; e.len = (e.L.length - 1) / 10; e.pos = i + 1; rpProg(e); });
  const c = list[0].car;
  Object.assign(RP, { on: true, list, fi: 0, multi, L, t: 0, spd: 1, play: true, cam: multi ? 'chase' : 'auto', name: name || 'Driver', lap: lapMs || (L.length - 1) * 100, len: Math.max(...list.map(e => e.len)), tvI: 0, autoT: 0, autoI: 0, rec: null, car: c, lastMode: null });
  RP.tv = []; const P = G.tr.pts, n = P.length, step = Math.max(1, Math.round(n / 9)); for (let i = 0; i < n; i += step) { const p = P[i], d = G.tr.dirs[i], s = (i / step) % 2 ? 1 : -1, off = G.tr.w * 1.6; RP.tv.push([p[0] - Math.sin(d) * off * s, p[1] + Math.cos(d) * off * s]); }
  RP.rot0 = G.rot; G.me = c; G.state = 'replay'; rpSample(0); G.cam.x = c.x; G.cam.y = c.y; G.cam.a = -c.a - Math.PI / 2; G.cam.z = Math.min(VW, VH) / 820;
  for (const s of ['menu', 'lobby', 'board', 'hud', 'speedo', 'mini', 'driftBox', 'hKeys']) if ($(s)) $(s).classList.add('hidden'); banner(''); try { sndUpdate({ speed: 0 }, false); } catch (e) { }
  rpUI();
}
function closeReplay() { if ($('rpList')) $('rpList').classList.add('hidden'); if (RP.rec) try { RP.rec.stop(); } catch (e) { } RP.on = false; RP.rec = null; if ($('rpBar')) $('rpBar').classList.add('hidden'); G.rot = RP.rot0; toMenu(); }
function rpSample(t) { for (const e of (RP.list || [])) rpSampleCar(e.L, e.car, Math.min(t, e.len)); }
function rpSampleCar(L, c, t) {
  const k = Math.max(0, Math.min(L.length - 1.001, t * 10)), i = Math.floor(k), f = k - i;
  const P = L[Math.max(0, i - 1)], A = L[i], B = L[Math.min(L.length - 1, i + 1)], Q = L[Math.min(L.length - 1, i + 2)], f2 = f * f, f3 = f2 * f;
  const cr = (p0, p1, p2, p3) => 0.5 * (2 * p1 + (p2 - p0) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (3 * p1 - p0 - 3 * p2 + p3) * f3);
  const cd = (p0, p1, p2, p3) => 0.5 * ((p2 - p0) + 2 * (2 * p0 - 5 * p1 + 4 * p2 - p3) * f + 3 * (3 * p1 - p0 - 3 * p2 + p3) * f2);
  const a1 = A[2], a0 = a1 + angDiff(P[2], a1), a2 = a1 + angDiff(B[2], a1), a3 = a2 + angDiff(Q[2], B[2]);
  if (Math.hypot(B[0] - A[0], B[1] - A[1]) > 300) { c.x = A[0]; c.y = A[1]; c.a = a1; c.vx = c.vy = 0; }
  else { c.x = cr(P[0], A[0], B[0], Q[0]); c.y = cr(P[1], A[1], B[1], Q[1]); c.a = cr(a0, a1, a2, a3); c.vx = cd(P[0], A[0], B[0], Q[0]) * 10; c.vy = cd(P[1], A[1], B[1], Q[1]) * 10; }
  c.speed = Math.hypot(c.vx, c.vy); c.slip = c.speed > 60 ? angDiff(Math.atan2(c.vy, c.vx), c.a) : 0; c.drift = Math.abs(c.slip) > 0.22 && c.speed > 220; c.steer = Math.max(-0.8, Math.min(0.8, -c.slip * 2)); c.brake = false;
}
function rpTick(dt) {
  const c = RP.car, base = Math.min(VW, VH) / 820, cam = G.cam;
  if (RP.play) { RP.t += dt * RP.spd; if (RP.t >= RP.len) { if (RP.rec) { RP.t = RP.len; RP.play = false; try { RP.rec.stop(); } catch (e) { } } else { RP.t = 0; G.smoke = []; } } }
  rpSample(RP.t);
  for (const sc of RP.list.map(e => e.car)) if (RP.play && sc.drift && CFG.gfx.smoke && G.smoke.length < (RP.multi ? 260 : 140)) { const c = sc; try { for (const p of wheelPos(c)) if (Math.random() < 0.35) G.smoke.push({ x: p.x !== undefined ? p.x : p[0], y: p.y !== undefined ? p.y : p[1], vx: (Math.random() - 0.5) * 40 - c.vx * 0.05, vy: (Math.random() - 0.5) * 40 - c.vy * 0.05, r: 12, life: 0, max: 0.8 + Math.random() * 0.6, col: c.smoke || '' }); } catch (e) { } }
  if (RP.multi) rpOrder();
  for (const p of G.smoke) { p.life += dt; p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt; p.r += dt * 28; } G.smoke = G.smoke.filter(p => p.life < p.max);
  let mode = RP.cam; if (mode === 'auto') { RP.autoT += dt; if (RP.autoT > 5) { RP.autoT = 0; RP.autoI = (RP.autoI + 1) % 3; } mode = ['chase', 'tv', 'top'][RP.autoI]; }
  const k = 1 - Math.exp(-dt * 5); let rot = false, zt = base, tx = c.x, ty = c.y;
  if (mode === 'chase') { rot = true; zt = base * (1.15 - Math.min(1, c.speed / 1400) * 0.3); tx = c.x + c.vx * 0.25; ty = c.y + c.vy * 0.25; const at = -c.a - Math.PI / 2; cam.a += angDiff(at, cam.a) * (1 - Math.exp(-dt * 4)); }
  else if (mode === 'top') { zt = base * 0.8; }
  else if (mode === 'tv') { let bi = RP.tvI, bd = Infinity; RP.tv.forEach((s, i) => { const d = Math.hypot(s[0] - c.x, s[1] - c.y); if (d < bd) { bd = d; bi = i; } }); const cur = RP.tv[RP.tvI], cd0 = Math.hypot(cur[0] - c.x, cur[1] - c.y); if (bi !== RP.tvI && bd < cd0 * 0.7) RP.tvI = bi; const s = RP.tv[RP.tvI], d = Math.hypot(s[0] - c.x, s[1] - c.y); tx = s[0] + (c.x - s[0]) * 0.8; ty = s[1] + (c.y - s[1]) * 0.8; zt = base * Math.max(0.5, Math.min(1.5, 1.6 - d / 900)); }
  else if (mode === 'heli') { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of G.tr.pts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); } tx = (x0 + x1) / 2; ty = (y0 + y1) / 2; zt = Math.min(VW / (x1 - x0 + 500), VH / (y1 - y0 + 500)); }
  const jump = RP.lastMode !== mode; RP.lastMode = mode; if (jump && mode !== 'chase') { cam.x = tx; cam.y = ty; cam.z = zt; } if (jump && mode === 'chase') cam.a = -c.a - Math.PI / 2;
  cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k; cam.z += (zt - cam.z) * (1 - Math.exp(-dt * 3)); G.rot = rot;
  const others = RP.list.map(e => e.car).filter(k => k !== c); for (const k of others) k._fin = RP.t > RP.list.find(e => e.car === k).len + 0.05;
  drawWorld(G.tr, cam, [...others.filter(k => !k._fin || RP.t - RP.list.find(e => e.car === k).len < 2), c], rot);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(16, 16, 300, 58, 8); else ctx.rect(16, 16, 300, 58); ctx.fill();
  ctx.fillStyle = '#ff3b3b'; ctx.font = 'italic 900 13px Segoe UI, system-ui, sans-serif'; ctx.fillText((RP.rec ? '● REC  ' : '') + 'REPLAY · ' + String(G.tr.name || '').toUpperCase() + (RP.multi ? ' · ' + RP.list.length + ' DRIVERS' : ''), 28, 38);
  ctx.fillStyle = '#fff'; ctx.font = '800 18px Segoe UI, system-ui, sans-serif'; ctx.fillText(RP.name + '  ' + rpFmt(RP.t * 1000) + ' / ' + rpFmt(RP.lap), 28, 62);
  ctx.textAlign = 'right'; ctx.font = 'italic 900 15px Segoe UI, system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText('MINI DRIFTERS', VW - 20, VH - 20);
  ctx.fillText(Math.round(c.speed / PX_PER_M * 3.6) + ' KM/H', VW - 20, 40);
  const sc = $('rpScrub'); if (sc && !RP.drag) sc.value = Math.round(RP.t / RP.len * 1000);
}
// ---------- watch multiple: progress along the track for every sample, so we can show live order + gaps ----------
function rpProg(e) {
  const n = G.tr.n, P = []; let last = null, off = 0;
  for (const s of e.L) { let i = nearestFull(G.tr, s[0], s[1]).i; if (last === null && i > n / 2) i -= n; if (last !== null) { while (i + off - last < -n / 2) off += n; while (i + off - last > n / 2) off -= n; } last = i + off; P.push(last); }
  for (let k = 1; k < P.length; k++) if (P[k] < P[k - 1]) P[k] = P[k - 1]; e.P = P;
}
function rpProgAt(e, t) { const k = Math.max(0, Math.min(e.P.length - 1.001, t * 10)), i = Math.floor(k); return e.P[i] + (e.P[Math.min(e.P.length - 1, i + 1)] - e.P[i]) * (k - i); }
function rpTimeAt(e, p) { const P = e.P; if (p <= P[0]) return 0; if (p >= P[P.length - 1]) return e.len; let lo = 0, hi = P.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (P[m] <= p) lo = m; else hi = m; } const d = P[hi] - P[lo]; return (lo + (d > 0 ? (p - P[lo]) / d : 0)) / 10; }
function rpOrder() {
  const t = RP.t, ref = RP.list[0];
  for (const e of RP.list) { e.done = t >= e.len; e.prog = e.done ? 1e9 - e.lap : rpProgAt(e, t); e.gap = e.done ? null : t - rpTimeAt(ref, e.prog); }
  [...RP.list].sort((a, b) => b.prog - a.prog).forEach((e, i) => e.pos = i + 1);
  RP.lu = (RP.lu || 0) + 1; if (RP.lu % 6) return; rpListUI();
}
function rpListUI() {
  let el = $('rpList'); if (!RP.multi) { if (el) el.classList.add('hidden'); return; }
  if (!el) { el = document.createElement('div'); el.id = 'rpList'; el.className = 'rplist'; document.body.appendChild(el); el.addEventListener('click', ev => { const r = ev.target.closest('[data-rf]'); if (!r) return; RP.fi = +r.dataset.rf; RP.car = RP.list[RP.fi].car; G.me = RP.car; RP.name = RP.list[RP.fi].name; RP.lap = RP.list[RP.fi].lap; RP.lastMode = null; G.smoke = []; rpListUI(); }); }
  el.classList.remove('hidden');
  const rows = RP.list.map((e, i) => [e, i]).sort((a, b) => a[0].pos - b[0].pos);
  el.innerHTML = '<div class="rplH">LIVE ORDER <span>click a driver to follow</span></div>' + rows.map(([e, i]) => `<div class="rplR${i === RP.fi ? ' on' : ''}${e.done ? ' fin' : ''}" data-rf="${i}"><b>${e.pos}</b><i style="background:${esc(e.car.color || '#888')}"></i><span class="nm">${esc(e.name || 'Driver')}</span><span class="gp">${e.done ? '🏁 ' + rpFmt(e.lap) : (i === 0 ? rpFmt(RP.t * 1000) : (e.gap >= 0 ? '+' : '−') + Math.abs(e.gap).toFixed(2))}</span></div>`).join('');
}
function rpFocus(d) { if (!RP.multi) return; const order = RP.list.map((e, i) => [e.pos, i]).sort((a, b) => a[0] - b[0]).map(x => x[1]); const at = order.indexOf(RP.fi), i = order[(at + d + order.length) % order.length]; const r = document.querySelector(`#rpList [data-rf="${i}"]`); if (r) r.click(); }

// ---------- leaderboard: "Watch multiple" picker ----------
const LBM = { on: false, sel: new Set(), busy: false };
function lbTrack() { return typeof LBT === 'number' || /^\d+$/.test(String(LBT)) ? +LBT : null; }
function lbMultiDecorate() {
  const t = $('lbTable'); if (!t) return; let bar = $('lbMulti'); const tr = lbTrack();
  if (tr === null || !TRACKS[tr] || !LBROWS.length) { if (bar) bar.remove(); LBM.on = false; return; }
  if (!bar) { bar = document.createElement('div'); bar.id = 'lbMulti'; bar.className = 'lbMulti'; t.parentNode.insertBefore(bar, t); bar.addEventListener('click', lbMultiClick); }
  if (LBM.track !== tr) { LBM.track = tr; LBM.sel.clear(); }
  [...LBM.sel].forEach(i => { if (!LBROWS[i]) LBM.sel.delete(i); });
  const n = LBM.sel.size;
  bar.innerHTML = !LBM.on ? `<button class="btn dark sm" data-lm="on">▶▶ Watch multiple</button><span class="dim">Watch several drivers' laps on ${esc(TRACKS[tr].name)} at the same time</span>`
    : `<span class="lmT">Pick drivers</span>${[3, 5, 10].filter(k => k <= LBROWS.length || k === 3).map(k => `<button class="btn dark sm" data-lm="top" data-k="${k}">Top ${k}</button>`).join('')}<button class="btn dark sm" data-lm="clear">Clear</button><span class="lmN">${n} selected${n >= 20 ? ' (max)' : ''}</span><button class="btn sm red" data-lm="go" ${n ? '' : 'disabled'}>${LBM.busy ? 'Loading…' : 'Watch ' + (n || '')}</button><button class="btn dark sm" data-lm="off">Cancel</button>`;
  t.classList.toggle('lbPick', LBM.on);
  t.querySelectorAll('tr').forEach((r, k) => { if (!k) return; const i = k - 1; r.classList.toggle('lbSel', LBM.on && LBM.sel.has(i)); r.dataset.lmi = i; let cb = r.querySelector('.lbChk');
    if (LBM.on && LBROWS[i]) { if (!cb) { cb = document.createElement('span'); cb.className = 'lbChk'; r.firstElementChild.prepend(cb); } cb.textContent = LBM.sel.has(i) ? '✓' : ''; } else if (cb) cb.remove(); });
}
function lbMultiClick(e) {
  const b = e.target.closest('[data-lm]'); if (!b || LBM.busy) return; const a = b.dataset.lm;
  if (a === 'on') { LBM.on = true; if (!LBM.sel.size) for (let i = 0; i < Math.min(10, LBROWS.length); i++) LBM.sel.add(i); }
  else if (a === 'off') { LBM.on = false; }
  else if (a === 'clear') LBM.sel.clear();
  else if (a === 'top') { LBM.sel.clear(); for (let i = 0; i < Math.min(+b.dataset.k, LBROWS.length); i++) LBM.sel.add(i); }
  else if (a === 'go') return watchMany(LBM.track, [...LBM.sel].sort((x, y) => x - y).map(i => LBROWS[i]).filter(Boolean));
  lbMultiDecorate();
}
document.addEventListener('click', e => { if (!LBM.on) return; const r = e.target.closest('#lbTable tr[data-lmi]'); if (!r || e.target.closest('button')) return; const i = +r.dataset.lmi; if (!LBROWS[i]) return;
  if (LBM.sel.has(i)) LBM.sel.delete(i); else if (LBM.sel.size < 20) LBM.sel.add(i); lbMultiDecorate(); });
async function watchMany(tr, rows) {
  if (G.state !== 'menu' || !rows.length) return; LBM.busy = true; lbMultiDecorate(); const got = {};
  try {
    if (CLOUD) { const ids = rows.map(r => r.pid).filter(Boolean).map(p => '"' + String(p).replace(/"/g, '') + '"').join(',');
      const res = await Promise.race([sb('GET', `laps?track=eq.${tr}&pid=in.(${encodeURIComponent(ids)})&select=pid,replay,lap_ms`), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 12000))]);
      for (const x of (res || [])) got[x.pid] = x; }
  } catch (e) { }
  LBM.busy = false; const list = [], missing = [];
  for (const r of rows) { const x = got[r.pid]; let rep = x && x.lap_ms === r.lap ? x.replay : null; if (!decRep(rep) && r.pid === ACCT.pub) rep = localStorage.getItem('md_rep_' + tr);
    if (decRep(rep)) list.push({ rep, look: lookOf(r), name: r.name, lap: r.lap }); else missing.push(r.name); }
  lbMultiDecorate();
  if (!list.length) return uiAlert('None of those laps have a replay yet. Replays are saved with new personal bests.');
  LBM.on = false; openReplayMulti(tr, list);
  if (missing.length) setTimeout(() => pop(missing.length + (missing.length === 1 ? ' driver has' : ' drivers have') + ' no replay: ' + missing.slice(0, 3).join(', ') + (missing.length > 3 ? '…' : ''), '#ff9a2a'), 400);
}
(function hookLb() { const t = $('lbTable'); if (!t) return setTimeout(hookLb, 300); new MutationObserver(m => { if (m.some(x => [...x.addedNodes].some(n => n.nodeName === 'TBODY' || n.nodeName === 'TR'))) try { lbMultiDecorate(); } catch (e) { } }).observe(t, { childList: true }); })();

function rpFmt(ms) { ms = Math.max(0, Math.round(ms)); const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60; return m + ':' + String(s).padStart(2, '0') + '.' + String(ms % 1000).padStart(3, '0'); }
function rpUI() {
  let b = $('rpBar');
  if (!b) {
    b = document.createElement('div'); b.id = 'rpBar'; b.className = 'rpbar'; document.body.appendChild(b);
    b.innerHTML = `<button class="opt" id="rpPlay">Pause</button><input type="range" id="rpScrub" min="0" max="1000" value="0"><div class="row" id="rpSpd">${[0.25, 0.5, 1, 2].map(s => `<button class="opt" data-rs="${s}">${s}x</button>`).join('')}</div>
      <div class="row" id="rpCams">${RP_CAMS.map(([k, t]) => `<button class="opt" data-rc="${k}">${t}</button>`).join('')}</div><button class="opt" id="rpPrev">◀ Driver</button><button class="opt" id="rpNext">Driver ▶</button><button class="opt" id="rpRec">Save video</button><button class="opt" id="rpX">Close</button>`;
    $('rpPlay').onclick = () => { RP.play = !RP.play; if (RP.play && RP.t >= RP.len) RP.t = 0; rpUI(); };
    const sc = $('rpScrub'); sc.oninput = () => { RP.drag = true; RP.t = sc.value / 1000 * RP.len; G.smoke = []; }; sc.onchange = () => { RP.drag = false; };
    b.querySelectorAll('[data-rs]').forEach(x => x.onclick = () => { RP.spd = +x.dataset.rs; rpUI(); });
    b.querySelectorAll('[data-rc]').forEach(x => x.onclick = () => { RP.cam = x.dataset.rc; RP.autoT = 0; rpUI(); });
    $('rpPrev').onclick = () => rpFocus(-1); $('rpNext').onclick = () => rpFocus(1);
    $('rpRec').onclick = rpRecord; $('rpX').onclick = closeReplay;
  }
  b.classList.remove('hidden'); $('rpPrev').classList.toggle('hidden', !RP.multi); $('rpNext').classList.toggle('hidden', !RP.multi); rpListUI(); $('rpPlay').textContent = RP.play ? 'Pause' : 'Play';
  b.querySelectorAll('[data-rs]').forEach(x => x.classList.toggle('on', +x.dataset.rs === RP.spd)); b.querySelectorAll('[data-rc]').forEach(x => x.classList.toggle('on', x.dataset.rc === RP.cam));
  $('rpRec').textContent = RP.rec ? 'Recording… (stop)' : 'Save video'; $('rpRec').classList.toggle('on', !!RP.rec);
}
function rpRecord() {
  if (RP.rec) { try { RP.rec.stop(); } catch (e) { } return; }
  if (!cv.captureStream || typeof MediaRecorder === 'undefined') return uiAlert('Your browser cannot record video. Try Chrome, Edge or Firefox.');
  const mt = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find(m => MediaRecorder.isTypeSupported(m)); if (!mt) return uiAlert('Your browser cannot record video.');
  const chunks = [], r = new MediaRecorder(cv.captureStream(60), { mimeType: mt, videoBitsPerSecond: 8e6 });
  r.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  r.onstop = () => { RP.rec = null; rpUI(); if (!chunks.length) return; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(chunks, { type: mt })); a.download = 'mini-drifters-' + String(G.tr.name || 'track').replace(/\W+/g, '-').toLowerCase() + '-replay.' + (mt.includes('mp4') ? 'mp4' : 'webm'); document.body.appendChild(a); a.click(); a.remove(); };
  RP.t = 0; RP.play = true; G.smoke = []; RP.rec = r; r.start(250); rpUI();
}
document.addEventListener('keydown', e => { if (!RP.on || G.state !== 'replay') return; if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeReplay(); } else if (e.key === ' ') { e.preventDefault(); e.stopImmediatePropagation(); $('rpPlay').click(); } else if (RP.multi && (e.key === 'Tab' || e.key === ']' || e.key === '[')) { e.preventDefault(); e.stopImmediatePropagation(); rpFocus(e.key === '[' || e.shiftKey ? -1 : 1); } }, true);
document.addEventListener('click', e => { const b = e.target.closest('[data-watch]'); if (!b) return; e.stopPropagation(); watchRow(LBT, LBROWS[+b.dataset.watch], b); });
